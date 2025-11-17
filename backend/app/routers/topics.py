from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
import logging

from ..db import crud, schemas, models
from ..db.database import get_db
from .auth import get_current_user
from fastapi import HTTPException

router = APIRouter(prefix="/api/v1/topics", tags=["Topics"])

@router.post("/", response_model=schemas.TopicSchema, status_code=status.HTTP_201_CREATED)
def create_new_topic(
    topic: schemas.TopicCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Crea un nuevo tema personalizado para el usuario autenticado."""
    logging.info(f"Usuario '{current_user.username}' creando nuevo tema: '{topic.title}'.")
    db_topic = crud.create_topic(db=db, topic=topic, owner_id=current_user.id)
    return schemas.TopicSchema.from_orm_model(db_topic)

@router.get("/me", response_model=List[schemas.TopicSchema])
def get_my_topics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obtiene la lista de temas creados por el usuario autenticado."""
    logging.info(f"Usuario '{current_user.username}' solicita sus temas personalizados.")
    user_topics = crud.get_user_topics(db=db, user_id=current_user.id)
    return [schemas.TopicSchema.from_orm_model(topic) for topic in user_topics]

@router.get("/public", response_model=List[schemas.TopicSchema])
def get_public_topics(db: Session = Depends(get_db)):
    """Obtiene la lista de todos los temas públicos disponibles."""
    logging.info("Solicitud para obtener la lista de temas públicos.")
    public_topics = crud.get_public_topics(db=db)
    return [schemas.TopicSchema.from_orm_model(topic) for topic in public_topics]


@router.delete("/{topic_id}", status_code=204)
def delete_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Elimina un topic si pertenece al usuario autenticado."""
    success = crud.delete_topic(db=db, topic_id=topic_id, owner_id=current_user.id)
    if not success:
        raise HTTPException(status_code=403, detail="No autorizado para eliminar este tema o no existe.")
    return None