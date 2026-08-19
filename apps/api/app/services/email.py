from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

import httpx

from app.core.config import settings

logger = logging.getLogger("app")

RESEND_ENDPOINT = "https://api.resend.com/emails"


def _deliver_over_https(to_email: str, subject: str, body: str) -> bool:
    """Send through Resend's HTTP API. Returns whether it went.

    Preferred over SMTP because it runs on 443, which nothing blocks. Render's
    free instances refuse outbound connections on every SMTP port, and the
    symptom is not a rejection but a connection that never completes: the
    request hangs until something upstream gives up.
    """
    try:
        response = httpx.post(
            RESEND_ENDPOINT,
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json={
                "from": settings.smtp_from_email,
                "to": [to_email],
                "subject": subject,
                "text": body,
            },
            timeout=settings.smtp_timeout_seconds,
        )
    except httpx.HTTPError as exc:
        logger.error("Invite email failed over https to=%s error=%s", to_email, exc)
        return False

    if response.is_success:
        return True

    # The body says which of the two usual causes it is: an unverified sending
    # domain, or a key without send permission.
    logger.error(
        "Invite email rejected to=%s status=%s body=%s",
        to_email,
        response.status_code,
        response.text[:300],
    )
    return False


def _deliver_over_smtp(to_email: str, subject: str, body: str) -> bool:
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_from_email
    message["To"] = to_email
    message.set_content(body)

    try:
        with smtplib.SMTP(
            settings.smtp_host, settings.smtp_port, timeout=settings.smtp_timeout_seconds
        ) as server:
            server.starttls()
            if settings.smtp_user and settings.smtp_password:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(message)
        return True
    except (OSError, smtplib.SMTPException) as exc:
        logger.error(
            "Invite email failed over smtp to=%s host=%s:%s error=%s",
            to_email,
            settings.smtp_host,
            settings.smtp_port,
            exc,
        )
        return False


def send_invite_email(to_email: str, trip_title: str, invite_url: str) -> None:
    """Tell someone they have been invited.

    Never raises. The invite is already saved and its link already works, so a
    mail provider being slow, blocked or misconfigured costs the sender a
    notification, not the invite itself.
    """
    subject = f"You're invited to plan \"{trip_title}\""
    body = (
        f"You've been invited to help plan \"{trip_title}\" on Adventure Planner.\n\n"
        f"Join here: {invite_url}\n\n"
        f"If you don't have an account yet, this link will let you create one."
    )

    if settings.resend_api_key:
        _deliver_over_https(to_email, subject, body)
        return

    if settings.smtp_host:
        _deliver_over_smtp(to_email, subject, body)
        return

    # Nothing configured. Log the invite so the flow stays usable in
    # development, where there is no provider and no need for one.
    logger.info("Invite email (no provider configured) to=%s\n%s\n%s", to_email, subject, body)
