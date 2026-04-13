"""
email_utils.py - Email sending utility
========================================
Sends verification code emails using Gmail's SMTP server.

Used during registration: after a user signs up, we send them a 6-digit
verification code to confirm their email address is real.

SETUP REQUIRED:
  1. Set SMTP_EMAIL and SMTP_PASSWORD in your .env file
  2. The email must be a Gmail account
  3. SMTP_PASSWORD must be a Gmail "App Password" (not your regular password)
     Go to: Google Account → Security → 2-Step Verification → App Passwords

HOW SMTP WORKS (simplified):
  1. We connect to Gmail's SMTP server (smtp.gmail.com:587)
  2. We start TLS encryption (so the password is sent securely)
  3. We log in with our email + app password
  4. We send the email
  5. We close the connection
"""

import smtplib
import os
import logging
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
logger = logging.getLogger(__name__)


def send_email(to_email: str, message: str):
    """
    Sends a plain text email to the specified address.

    Parameters:
      - to_email: The recipient's email address
      - message: The email body text (e.g., "Your verification code is: 123456")

    Raises:
      - ValueError if SMTP credentials are not configured
      - Exception if the email fails to send
    """
    # Get credentials from environment variables
    sender_email = os.getenv("SMTP_EMAIL")
    app_password = os.getenv("SMTP_PASSWORD")

    # Make sure credentials are configured
    if not sender_email or not app_password:
        logger.error("SMTP_EMAIL or SMTP_PASSWORD not set in environment variables")
        raise ValueError("Email configuration missing. Set SMTP_EMAIL and SMTP_PASSWORD in .env")

    # Build the email message
    msg = MIMEText(message)
    msg["Subject"] = "Verification Code"
    msg["From"] = sender_email
    msg["To"] = to_email

    try:
        # Connect to Gmail's SMTP server
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()     # Enable TLS encryption

        # Log in and send
        server.login(sender_email, app_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()

        logger.info("Verification email sent to %s", to_email)

    except Exception as e:
        logger.error("Email error: %s", e)
        raise
