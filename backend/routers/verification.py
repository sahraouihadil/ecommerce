"""
routers/verification.py - Email Verification & Password Reset Router
"""

import random
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import database
from schema import (
    CreateUserPending,
    ForgotPasswordRequest,
    VerifyResetCodeRequest,
    ResetPasswordRequest,
    SetPassword,
)
from email_utils import send_verification_email, send_reset_email
from security.settings import hash_password, validate_password

router = APIRouter()


# ======================================================================
# EMAIL VERIFICATION  (registration flow)
# ======================================================================

@router.post("/api/pending-verification")
def pending_verification(
    request: CreateUserPending,
    db: Session = Depends(database.get_db),
):
    email = request.email.strip().lower()

    # Block if a verified user already owns this email
    existing_user = db.query(models.Users).filter(
        func.lower(models.Users.email) == email,
        models.Users.is_verified == True
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # If an unverified user exists in users table (admin-added),
    # only allow if the username matches (same person claiming their account)
    unverified_user = db.query(models.Users).filter(
        func.lower(models.Users.email) == email,
        models.Users.is_verified == False
    ).first()
    if unverified_user:
        if unverified_user.username.strip().lower() != request.username.strip().lower():
            raise HTTPException(
                status_code=400,
                detail="An account with this email already exists."
            )

    hashed_pw = hash_password(request.password)
    code      = str(random.randint(100000, 999999))

    pending = db.query(models.PendingVerification).filter(
        func.lower(models.PendingVerification.email) == email
    ).first()

    if pending:
        pending.verification_code = code
        pending.username          = request.username.strip()
        pending.phone_num         = request.phone_num
        pending.password          = hashed_pw
        pending.created_at        = datetime.utcnow()
    else:
        pending = models.PendingVerification(
            email             = email,
            username          = request.username.strip(),
            phone_num         = request.phone_num,
            password          = hashed_pw,
            verification_code = code,
        )
        db.add(pending)

    db.commit()
    send_verification_email(email, code)

    return {
        "action":    "verify",
        "email":     email,
        "user_name": request.username,
    }


def _mark_user_verified(email: str, code: str, db: Session):
    user = db.query(models.Users).filter(
        func.lower(models.Users.email) == email.strip().lower()
    ).first()

    pending = db.query(models.PendingVerification).filter(
        func.lower(models.PendingVerification.email) == email.strip().lower()
    ).first()

    # Case 1: Admin-added user → exists in users (unverified), no pending
    if user and not pending:
        if str(user.verification_code) != str(code).strip():
            raise HTTPException(status_code=400, detail="Invalid verification code.")

        user.is_verified       = True
        user.verification_code = None
        db.commit()
        db.refresh(user)
        return user, False  # existing admin-added user, not new

    # Case 2: New self-registering user → not in users, exists in pending
    if not user and pending:
        if str(pending.verification_code) != str(code).strip():
            raise HTTPException(status_code=400, detail="Invalid verification code.")

        new_user = models.Users(
            email       = pending.email,
            username    = pending.username,
            phone_num   = pending.phone_num,
            password    = pending.password,
            is_verified = True,
            role        = "customer",
        )
        db.add(new_user)
        db.delete(pending)
        db.commit()
        db.refresh(new_user)
        return new_user, True  # brand new user

    # Case 3: Both exist, same username → admin-added user claiming their account
    if user and pending and user.username.strip().lower() == pending.username.strip().lower():
        if str(pending.verification_code) != str(code).strip():
            raise HTTPException(status_code=400, detail="Invalid verification code.")

        user.phone_num         = pending.phone_num
        user.password          = pending.password
        user.is_verified       = True
        user.verification_code = None
        db.delete(pending)
        db.commit()
        db.refresh(user)
        return user, False  # existing admin-added user claiming account, not new

    # Case 4: Both exist, different usernames → conflict
    if user and pending and user.username.strip().lower() != pending.username.strip().lower():
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists."
        )

    # Case 5: Neither exists
    raise HTTPException(status_code=404, detail="No verification record found for this email.")


@router.post("/verify-code")
def verify_code(
    request: VerifyResetCodeRequest,
    db: Session = Depends(database.get_db),
):
    user, is_new_user = _mark_user_verified(request.email, request.code, db)
    return {
        "msg":         "Account created and verified successfully.",
        "is_new_user": is_new_user,
        "user_name":   user.username,
    }


@router.post("/resend-code")
def resend_code(request: ForgotPasswordRequest, db: Session = Depends(database.get_db)):
    code = str(random.randint(100000, 999999))

    user = db.query(models.Users).filter(
        func.lower(models.Users.email) == request.email.strip().lower()
    ).first()

    if user:
        if user.is_verified:
            raise HTTPException(status_code=400, detail="This account is already verified.")
        user.verification_code = code
    else:
        pending = db.query(models.PendingVerification).filter(
            func.lower(models.PendingVerification.email) == request.email.strip().lower()
        ).first()
        if not pending:
            raise HTTPException(status_code=404, detail="No pending verification found for this email.")
        pending.verification_code = code
        pending.created_at        = datetime.utcnow()

    db.commit()
    send_verification_email(request.email, code)
    return {"message": "A new verification code has been sent."}


@router.post("/set-password")
def set_password(data: SetPassword, db: Session = Depends(database.get_db)):
    user = db.query(models.Users).filter(models.Users.username == data.user_name).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="User not verified")
    validate_password(data.password)
    user.password = hash_password(data.password)
    db.commit()
    return {"msg": "Password set successfully"}


# ======================================================================
# FORGOT PASSWORD
# ======================================================================

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.Users).filter(
        func.lower(models.Users.username) == request.username.strip().lower()
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="No account found with this username.")

    if user.email.strip().lower() != request.email.strip().lower():
        raise HTTPException(status_code=400, detail="Email does not match our records for this username.")

    code = str(random.randint(100000, 999999))
    user.verification_code = code
    db.commit()
    send_reset_email(request.email, code)
    return {"message": "A reset code has been sent to your email."}


@router.post("/verify-reset-code")
def verify_reset_code(request: VerifyResetCodeRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.Users).filter(
        func.lower(models.Users.email) == request.email.strip().lower()
    ).first()
    if not user or not user.verification_code or user.verification_code != request.code:
        raise HTTPException(status_code=400, detail="Invalid or expired code.")
    return {"message": "Code verified. You may now set a new password."}


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.Users).filter(
        func.lower(models.Users.email) == request.email.strip().lower()
    ).first()
    if not user or not user.verification_code or user.verification_code != request.code:
        raise HTTPException(status_code=400, detail="Invalid or expired code.")
    validate_password(request.new_password)
    user.password          = hash_password(request.new_password)
    user.verification_code = None
    db.commit()
    return {"message": "Password reset successfully."}