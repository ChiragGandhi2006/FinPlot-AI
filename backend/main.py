from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.database.database import Base, engine

from app.models import *

app = FastAPI(
    title="FinPilot AI"
)

Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
@app.get("/")
def home():
    return {
        "message": "Welcome to FinPilot AI"
    }