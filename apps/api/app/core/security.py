from datetime import datetime, timedelta, timezone
from typing import Literal

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

TokenType = Literal["access", "refresh"]


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_token(subject: str, token_type: TokenType) -> str:
    if token_type == "access":
        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    else:
        expires_delta = timedelta(days=settings.refresh_token_expire_days)

    expire = datetime.now(timezone.utc) + expires_delta
    payload = {"sub": subject, "type": token_type, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


class InvalidTokenError(Exception):
    pass


def decode_token(token: str, expected_type: TokenType) -> str:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise InvalidTokenError("Could not validate token") from exc

    if payload.get("type") != expected_type:
        raise InvalidTokenError(f"Expected a {expected_type} token")

    subject = payload.get("sub")
    if subject is None:
        raise InvalidTokenError("Token missing subject")

    return subject
