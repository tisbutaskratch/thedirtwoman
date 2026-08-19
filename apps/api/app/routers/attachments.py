from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.deps import (
    get_accessible_trip,
    get_current_user,
    get_editable_trip,
    trip_write_filter,
)
from app.db.session import get_db
from app.models.attachment import Attachment, AttachmentKind
from app.models.trip import Trip
from app.models.user import User
from app.schemas.attachment import AttachmentRead
from app.services.attachments import delete_file, save_upload, to_attachment_read

router = APIRouter(tags=["attachments"])


def get_owned_attachment(
    attachment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Attachment:
    attachment = (
        db.query(Attachment)
        .join(Trip, Attachment.trip_id == Trip.id)
        .filter(Attachment.id == attachment_id, trip_write_filter(current_user.id))
        .first()
    )
    if attachment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")
    return attachment


async def _create_attachment(
    kind: AttachmentKind,
    trip: Trip,
    title: str,
    description: Optional[str],
    file: UploadFile,
    db: Session,
) -> AttachmentRead:
    stored_filename, original_filename, content_type = await save_upload(file)
    attachment = Attachment(
        trip_id=trip.id,
        kind=kind,
        title=title,
        description=description,
        filename=stored_filename,
        original_filename=original_filename,
        content_type=content_type,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return to_attachment_read(attachment)


def _list_attachments(trip: Trip, kind: AttachmentKind) -> list[AttachmentRead]:
    return [to_attachment_read(a) for a in trip.attachments if a.kind == kind]


@router.get("/trips/{trip_id}/photos", response_model=list[AttachmentRead])
def list_photos(trip: Trip = Depends(get_accessible_trip)) -> list[AttachmentRead]:
    return _list_attachments(trip, AttachmentKind.photo)


@router.post(
    "/trips/{trip_id}/photos", response_model=AttachmentRead, status_code=status.HTTP_201_CREATED
)
async def upload_photo(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    trip: Trip = Depends(get_editable_trip),
    db: Session = Depends(get_db),
) -> AttachmentRead:
    return await _create_attachment(AttachmentKind.photo, trip, title, description, file, db)


@router.get("/trips/{trip_id}/files", response_model=list[AttachmentRead])
def list_files(trip: Trip = Depends(get_accessible_trip)) -> list[AttachmentRead]:
    return _list_attachments(trip, AttachmentKind.file)


@router.post(
    "/trips/{trip_id}/files", response_model=AttachmentRead, status_code=status.HTTP_201_CREATED
)
async def upload_file(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    trip: Trip = Depends(get_editable_trip),
    db: Session = Depends(get_db),
) -> AttachmentRead:
    return await _create_attachment(AttachmentKind.file, trip, title, description, file, db)


@router.delete("/attachments/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attachment(
    attachment: Attachment = Depends(get_owned_attachment), db: Session = Depends(get_db)
) -> None:
    delete_file(attachment.filename)
    db.delete(attachment)
    db.commit()
