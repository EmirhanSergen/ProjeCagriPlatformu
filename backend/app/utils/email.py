"""Email utilities for the application."""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings

def send_email(to_email: str, subject: str, body: str):
    """Send an email using the configured SMTP server."""
    if not all([settings.smtp_host, settings.smtp_port, 
                settings.smtp_user, settings.smtp_password]):
        print("Email settings not configured. Email would have been sent to:", to_email)
        print("Subject:", subject)
        print("Body:", body)
        return

    message = MIMEMultipart()
    message["From"] = settings.from_email or settings.smtp_user
    message["To"] = to_email
    message["Subject"] = subject
    
    message.attach(MIMEText(body, "html"))
    
    with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port) as server:
        server.login(settings.smtp_user, settings.smtp_password.get_secret_value())
        server.send_message(message)

def send_verification_email(email: str, token: str):
    """Send an email verification link."""
    verification_url = f"{settings.base_url}/users/verify/{token}"
    subject = "Verify your email address"
    body = f"""
    <p>Thank you for registering! Please click the link below to verify your email address:</p>
    <p><a href="{verification_url}">{verification_url}</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not register for an account, please ignore this email.</p>
    """
    send_email(email, subject, body)

def send_password_reset_email(email: str, token: str):
    """Send a password reset link."""
    reset_url = f"{settings.base_url}/password-reset/{token}"
    subject = "Password Reset Request"
    body = f"""
    <p>You have requested to reset your password. Click the link below to proceed:</p>
    <p><a href="{reset_url}">{reset_url}</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
    """
    send_email(email, subject, body)
