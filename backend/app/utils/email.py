import smtplib
import asyncio
import functools
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from ..config import settings

def _send_sync_email(msg: MIMEMultipart):
    """Send the email synchronously via SMTP."""
    with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port) as server:
        server.login(settings.smtp_user, settings.smtp_password.get_secret_value())
        server.send_message(msg)

async def send_email(to_email: str, subject: str, body: str):
    """Send email via configured SMTP (async-safe) or log in dev."""
    if not all([settings.smtp_host, settings.smtp_port, settings.smtp_user, settings.smtp_password]):
        print(f"[DEV EMAIL] To: {to_email}, Subject: {subject}")
        print(body)
        return

    msg = MIMEMultipart()
    msg["From"] = settings.from_email or settings.smtp_user
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    # Send via async executor
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, functools.partial(_send_sync_email, msg))


async def send_verification_email(email: str, token: str):
    """Send account verification link to user."""
    url = f"{settings.base_url}/users/verify/{token}"
    subject = "Verify your email address"
    body = f"<p>Please verify your account by clicking <a href=\"{url}\">here</a>.</p>"
    await send_email(email, subject, body)

async def send_password_reset_email(email: str, token: str):
    """Send password reset link to user."""
    url = f"{settings.base_url}/password-reset/{token}"
    subject = "Password Reset Request"
    body = f"<p>Reset your password <a href=\"{url}\">here</a>.</p>"
    await send_email(email, subject, body)
