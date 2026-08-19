from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


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
