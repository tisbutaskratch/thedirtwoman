from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.services.account import SharedTripAction


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=255)
    # Which policy they were shown. Sent by the client rather than assumed by
    # the server so that a stale page cannot record agreement to a policy its
    # user never saw; the server checks it matches what is current.
    accepted_privacy_version: str = Field(min_length=1, max_length=20)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    name: str
    created_at: datetime


class AccountDeleteRequest(BaseModel):
    """What to do with trips the user created that other people are on.

    Required rather than defaulted: the two outcomes differ for other
    people's data, so it is not a choice to make on someone's behalf.
    """

    shared_trips: SharedTripAction
    #: Typed confirmation. A modal alone is one careless click; this is the
    #: standard guard on an action with no undo.
    confirm: str = Field(min_length=1, max_length=64)


class AccountDeleteSummary(BaseModel):
    trips_deleted: int
    trips_left_with_collaborators: int
    trips_scheduled: int
    journal_entries_deleted: int
