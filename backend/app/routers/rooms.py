from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from ..db import crud, schemas, models
from ..db.database import get_db
from .auth import get_current_user
from ..core.constants import MAX_PLAYERS

router = APIRouter(prefix="/api/v1/rooms", tags=["Rooms"])

@router.post("/", response_model=schemas.RoomSchema, status_code=status.HTTP_201_CREATED)
def create_new_room(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    logging.info(f"Usuario '{current_user.username}' está creando una nueva sala.")
    db_room = crud.create_room(db=db, host_user=current_user)
    return schemas.RoomSchema.from_orm_model(db_room)

@router.post("/{room_code}/join", response_model=schemas.RoomSchema)
def join_existing_room(
    room_code: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    logging.info(f"Usuario '{current_user.username}' intenta unirse a la sala '{room_code.upper()}'.")
    db_room = crud.get_room_by_code(db, code=room_code)
    if not db_room:
        logging.warning(f"Intento de unirse a sala inexistente: '{room_code.upper()}'.")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La sala no existe.")
    
    if crud.get_player_by_user_id_and_room_code(db, user_id=current_user.id, room_code=room_code):
        logging.info(f"Usuario '{current_user.username}' ya está en la sala '{room_code.upper()}', reconectando.")
        return schemas.RoomSchema.from_orm_model(db_room)

    if len(db_room.players) >= MAX_PLAYERS:
        logging.warning(f"La sala '{room_code.upper()}' está llena. Intento de unión de '{current_user.username}' denegado.")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="La sala está llena.")

    is_spectator = False
    if db_room.game_state == "InGame":
        logging.warning(f"La partida en la sala '{room_code.upper()}' ya ha comenzado. '{current_user.username}' se unirá como espectador.")
        is_spectator = True
    
    crud.add_player_to_room(db, room=db_room, user=current_user, is_spectating=is_spectator)
    
    db.refresh(db_room)
    logging.info(f"Usuario '{current_user.username}' se ha unido con éxito a la sala '{room_code.upper()}'." + (" como espectador." if is_spectator else ""))
    
    return schemas.RoomSchema.from_orm_model(db_room)

@router.get("/{room_code}", response_model=schemas.RoomSchema)
def get_room_details(
    room_code: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    logging.info(f"Usuario '{current_user.username}' solicita detalles de la sala '{room_code.upper()}'.")
    db_room = crud.get_room_by_code(db, code=room_code)
    if not db_room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La sala no existe.")
    
    player = crud.get_player_by_user_id_and_room_code(db, user_id=current_user.id, room_code=room_code)
    if not player:
        logging.warning(f"Acceso denegado. Usuario '{current_user.username}' no pertenece a la sala '{room_code.upper()}'.")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No perteneces a esta sala.")
        
    return schemas.RoomSchema.from_orm_model(db_room)