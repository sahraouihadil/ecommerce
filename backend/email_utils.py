"""
email_utils.py - Email sending utility
========================================
Sends verification code emails using Gmail's SMTP server.

Used during:
  - Registration: send 6-digit code to verify email
  - Forgot password: send 6-digit code to reset password

SETUP REQUIRED:
  1. Set SMTP_EMAIL and SMTP_PASSWORD in your .env file
  2. The email must be a Gmail account
  3. SMTP_PASSWORD must be a Gmail "App Password" (not your regular password)
     Go to: Google Account → Security → 2-Step Verification → App Passwords
"""

import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


def _send(to_email: str, subject: str, plain_text: str, html: str = None):
    """
    Internal helper — builds and sends an email.
    Supports plain text only, or multipart plain+HTML.
    """
    sender_email = os.getenv("SMTP_EMAIL")
    app_password  = os.getenv("SMTP_PASSWORD")

    if not sender_email or not app_password:
        logger.error("SMTP_EMAIL or SMTP_PASSWORD not set in environment variables")
        raise ValueError("Email configuration missing. Set SMTP_EMAIL and SMTP_PASSWORD in .env")

    # Build message
    if html:
        msg = MIMEMultipart("alternative")
        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html, "html"))
    else:
        msg = MIMEText(plain_text, "plain")

    msg["Subject"] = subject
    msg["From"]    = sender_email
    msg["To"]      = to_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, app_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        logger.info("Email '%s' sent to %s", subject, to_email)
    except Exception as e:
        logger.error("Email error: %s", e)
        raise


# ──────────────────────────────────────────────────────────────────────────────
# PUBLIC FUNCTIONS — call these from route.py
# ──────────────────────────────────────────────────────────────────────────────

def send_verification_email(to_email: str, code: str):
    """
    Sends the registration verification code with a branded subject.
    """
    plain = f"Your ARoom verification code is: {code}\n\nDo not share this code with anyone."
    html  = f"""
    <div style="font-family:Georgia,serif;max-width:480px;margin:auto;padding:2rem;background:#F5F0E8;border-radius:12px;">
      <h2 style="font-family:'Cinzel Decorative',serif;color:#1C1916;letter-spacing:0.06em;">ARoom</h2>
      <p style="color:#7A6B5A;">Please verify your email address using the code below:</p>
      <div style="font-size:2rem;font-weight:700;letter-spacing:0.3em;color:#1C1916;text-align:center;
                  background:#EDE7D9;border-radius:8px;padding:1rem;margin:1.5rem 0;">
        {code}
      </div>
      <p style="color:#9E8E7A;font-size:0.85rem;">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>
    """
    _send(to_email, subject="ARoom — Verify your email", plain_text=plain, html=html)


# Backward-compatibility alias — older code that calls send_email() still works
send_email = send_verification_email


def send_reset_email(to_email: str, code: str):
    """
    Sends the forgot-password reset code with a clearly distinct subject
    so users aren't confused between registration and reset emails.
    """
    plain = f"Your ARoom password reset code is: {code}\n\nIf you did not request this, ignore this email."
    html  = f"""
    <div style="font-family:Georgia,serif;max-width:480px;margin:auto;padding:2rem;background:#F5F0E8;border-radius:12px;">
      <h2 style="font-family:'Cinzel Decorative',serif;color:#1C1916;letter-spacing:0.06em;">ARoom</h2>
      <p style="color:#7A6B5A;">You requested a password reset. Use the code below:</p>
      <div style="font-size:2rem;font-weight:700;letter-spacing:0.3em;color:#1C1916;text-align:center;
                  background:#EDE7D9;border-radius:8px;padding:1rem;margin:1.5rem 0;">
        {code}
      </div>
      <p style="color:#9E8E7A;font-size:0.85rem;">This code expires in 10 minutes. If you did not request a reset, you can safely ignore this email.</p>
    </div>
    """
    _send(to_email, subject="ARoom — Password reset code", plain_text=plain, html=html)