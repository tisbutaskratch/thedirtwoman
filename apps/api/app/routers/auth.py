from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.policy import PRIVACY_POLICY_VERSION
from app.core.ratelimit import check_identity_limit, rate_limit
from app.core.security import (
    InvalidTokenError,
    create_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import AccessTokenResponse, RefreshRequest, TokenPair
from app.schemas.user import (
    AccountDeleteRequest,
    AccountDeleteSummary,
    UserCreate,
    UserLogin,
    UserRead,
)
from app.services.account import delete_account

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_token_pair(user: User) -> TokenPair:
    return TokenPair(
        access_token=create_token(str(user.id), "access"),
        refresh_token=create_token(str(user.id), "refresh"),
        user=UserRead.model_validate(user),
    )


@router.post(
    "/register",
    response_model=TokenPair,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("register", limit=5, window_seconds=3600))],
)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> TokenPair:
    # A client sending an older version was shown an older policy, so the
    # agreement it is reporting is not agreement to this one. Rejecting is
    # the honest response; the page reloads and shows the current text.
    if payload.accepted_privacy_version != PRIVACY_POLICY_VERSION:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The privacy policy has changed. Reload the page and read the current one.",
        )

    existing = db.query(User).filter(User.email == payload.email).first()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
        privacy_policy_version=PRIVACY_POLICY_VERSION,
        privacy_accepted_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return _issue_token_pair(user)


@router.post(
    "/login",
    response_model=TokenPair,
    dependencies=[Depends(rate_limit("login", limit=10, window_seconds=900))],
)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> TokenPair:
    # Per-address limiting alone does not stop guesses at one account spread
    # across many addresses, so the account being targeted is bounded too.
    check_identity_limit(payload.email, limit=10, window_seconds=900)
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password"
    )

    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise unauthorized

    return _issue_token_pair(user)


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> AccessTokenResponse:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
    )

    try:
        user_id = decode_token(payload.refresh_token, expected_type="refresh")
    except InvalidTokenError as exc:
        raise unauthorized from exc

    user = db.get(User, int(user_id))
    if user is None:
        raise unauthorized

    return AccessTokenResponse(access_token=create_token(str(user.id), "access"))


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


#: What the user has to type. Their own email, because it is the one string
#: they cannot produce by muscle memory on the wrong account.
CONFIRMATION_PHRASE_FIELD = "your email address"


@router.delete("/me", response_model=AccountDeleteSummary)
def delete_me(
    payload: AccountDeleteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AccountDeleteSummary:
    """Delete the signed-in account.

    Irreversible, so it asks for the account's own email typed back. A
    confirmation dialog can be clicked through on autopilot; typing the
    address of the account you are signed into cannot be done by accident on
    the wrong one.
    """
    if payload.confirm.strip().lower() != current_user.email.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"To confirm, type {CONFIRMATION_PHRASE_FIELD}.",
        )

    summary = delete_account(db, current_user, payload.shared_trips)
    return AccountDeleteSummary(
        trips_deleted=summary.trips_deleted,
        trips_left_with_collaborators=summary.trips_left_with_collaborators,
        trips_scheduled=summary.trips_scheduled,
        journal_entries_deleted=summary.journal_entries_deleted,
    )
