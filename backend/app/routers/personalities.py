from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
import logging

from ..db import crud, schemas, models
from ..db.database import get_db

router = APIRouter(prefix="/api/v1/personalities", tags=["Personalities"])

@router.get("/", response_model=List[schemas.PersonalitySchema])
def get_all_personalities(db: Session = Depends(get_db)):
    """Obtiene la lista de todas las personalidades de IA disponibles."""
    logging.info("Solicitud para obtener la lista de todas las personalidades.")
    personalities = db.query(models.Personality).order_by(models.Personality.id).all()
    return personalities