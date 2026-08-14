from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.utils.security import encrypt_data, decrypt_data
from app.core.config import settings
import json

router = APIRouter(prefix="/sync", tags=["sync"])

USER_SYNC_PASSWORD = settings.SYNC_PASSWORD or "finpilot-sync-default-change-me"


@router.post("/upload")
async def upload_sync_data(
    request: Request,
    db: Session = Depends(lambda: SessionLocal())
):
    """Upload encrypted user data from client for cloud sync."""
    try:
        payload = await request.json()
        data_type = payload.get("data_type")
        local_data = payload.get("data")

        if not data_type or not local_data:
            raise HTTPException(status_code=400, detail="Missing data_type or data")

        encrypted = encrypt_data(json.dumps(local_data), USER_SYNC_PASSWORD)

        from app.models.user import User
        user = db.query(User).filter(User.user_id == 1).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Store encrypted data in user profile (simplified)
        user.sync_data = json.dumps({
            "data_type": data_type,
            "encrypted": encrypted,
            "synced_at": __import__("datetime").datetime.utcnow().isoformat()
        })

        db.commit()

        return {"status": "ok", "message": f"{data_type} synced successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/download/{data_type}")
async def download_sync_data(
    data_type: str,
    db: Session = Depends(lambda: SessionLocal()),
):
    """Download encrypted user data for cloud sync."""
    from app.models.user import User
    user = db.query(User).filter(User.user_id == 1).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    sync_data = json.loads(user.sync_data or "{}")
    if sync_data.get("data_type") != data_type:
        raise HTTPException(status_code=404, detail="No synced data found for this type")

    encrypted = sync_data.get("encrypted")
    if not encrypted:
        raise HTTPException(status_code=404, detail="No encrypted data found")

    try:
        decrypted = decrypt_data(encrypted, USER_SYNC_PASSWORD)
        return {"status": "ok", "data": json.loads(decrypted)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption failed: {str(e)}")