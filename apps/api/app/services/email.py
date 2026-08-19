from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger("app")


def send_invite_email(to_email: str, trip_title: str, invite_url: str) -> None:
    subject = f"You're invited to plan \"{trip_title}\""
    body = (
        f"You've been invited to help plan \"{trip_title}\" on Adventure Planner.\n\n"
        f"Join here: {invite_url}\n\n"
        f"If you don't have an account yet, this link will let you create one."
    )

    if not settings.smtp_host:
        # No SMTP provider configured. Log instead of sending so the invite
        # flow stays usable (and testable) in local dev.
        logger.info("Invite email (SMTP not configured) to=%s\n%s\n%s", to_email, subject, body)
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_from_email
    message["To"] = to_email
    message.set_content(body)

    # Sending must never break inviting. The invite is already saved and its
    # link already works, so a mail provider being slow, unreachable, or
    # misconfigured should cost the sender a notification, not the whole
    # request. Without the timeout a blocked SMTP port hangs the worker until
    # the gateway gives up, which surfaces as a 502 with nothing in the logs.
    try:
        with smtplib.SMTP(
            settings.smtp_host, settings.smtp_port, timeout=settings.smtp_timeout_seconds
        ) as server:
            server.starttls()
            if settings.smtp_user and settings.smtp_password:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(message)
    except (OSError, smtplib.SMTPException) as exc:
        logger.error(
            "Invite email failed to=%s host=%s:%s error=%s",
            to_email,
            settings.smtp_host,
            settings.smtp_port,
            exc,
        )
