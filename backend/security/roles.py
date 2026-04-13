"""
roles.py - Role-based access control (RBAC) for API endpoints
==============================================================
This file contains "dependency" functions that restrict endpoints to specific roles.

HOW IT WORKS:
  Each function is used as a FastAPI "Depends()" in route definitions.
  It first calls verify_token() to check if the user is logged in,
  then checks if their role matches the required role.

EXAMPLE USAGE:
  @app.get("/admin-only")
  def admin_page(payload: dict = Depends(admin_required)):
      # This endpoint only works if the user's role is "admin"
      return {"message": "Welcome, admin!"}

  If a customer tries to access this endpoint, they get a 403 Forbidden error.

AVAILABLE ROLES (from enums.py):
  - admin: Full platform control
  - accountant: Financial reports
  - marketing manager: Campaigns and promotions
  - stock manager: Inventory management
  - deliveryman: Delivery tracking
  - customer: Regular shopping user
  - bot: AI chatbot (internal use)
"""

from fastapi import Depends, HTTPException
from starlette import status
from security.jwt_handler import verify_token


def admin_required(payload: dict = Depends(verify_token)) -> dict:
    """Only allows users with the 'admin' role."""
    if payload.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: admin only")
    return payload


def accountant_required(payload: dict = Depends(verify_token)) -> dict:
    """Only allows users with the 'accountant' role."""
    if payload.get("role") != "accountant":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: accountant only")
    return payload


def marketing_manager_required(payload: dict = Depends(verify_token)) -> dict:
    """Only allows users with the 'marketing manager' role."""
    if payload.get("role") != "marketing manager":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: marketing manager only")
    return payload


def stock_manager_required(payload: dict = Depends(verify_token)) -> dict:
    """Only allows users with the 'stock manager' role."""
    if payload.get("role") != "stock manager":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: stock manager only")
    return payload


def deliveryman_required(payload: dict = Depends(verify_token)) -> dict:
    """Only allows users with the 'deliveryman' role."""
    if payload.get("role") != "deliveryman":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: deliveryman only")
    return payload


def customer_required(payload: dict = Depends(verify_token)) -> dict:
    """Only allows users with the 'customer' role."""
    if payload.get("role") != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: customer only")
    return payload
