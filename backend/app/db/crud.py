from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from . import models, schemas
from ..core.security import get_password_hash, verify_password
import random
import string
from sqlalchemy import func
import logging
from typing import Optional

# --- User CRUD ---

def get_user(db: Session, user_id: int):
    logging.info(f"Buscando usuario por ID: {user_id}")
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    logging.info(f"Buscando usuario por nombre de usuario: {username}")
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    logging.info(f"Intentando crear nuevo usuario: {user.username}")
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password, coins=0)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    logging.info(f"Usuario '{user.username}' creado con éxito (ID: {db_user.id}).")
    return db_user

def authenticate_user(db: Session, username: str, password: str) -> models.User | None:
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

# --- Room CRUD ---

def get_room_by_code(db: Session, code: str):
    logging.info(f"Buscando sala por código: {code.upper()}")
    return db.query(models.Room).options(
        joinedload(models.Room.players).joinedload(models.Player.user)
    ).filter(func.upper(models.Room.code) == func.upper(code)).first()

def create_room(db: Session, host_user: models.User):
    alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
    max_retries = 20
    
    for attempt in range(max_retries):
        room_code = ''.join(random.choices(alphabet, k=6))
        
        # Primero, comprobamos si ya existe para evitar un commit innecesario
        if get_room_by_code(db, room_code):
            logging.warning(f"Colisión de código de sala '{room_code}' en el intento {attempt + 1}. Regenerando...")
            continue

        db_room = models.Room(code=room_code) 
        db.add(db_room)
        
        try:
            db.commit()
            db.refresh(db_room)
            add_player_to_room(db, db_room, host_user, is_host=True)
            logging.info(f"Sala '{room_code}' creada con éxito por el host '{host_user.username}'.")
            return db_room
        except IntegrityError:
            db.rollback()
            logging.error(f"Error de integridad al crear la sala '{room_code}' (probablemente una colisión). Intento {attempt + 1}.")
    
    logging.critical("No se pudo crear una sala con un código único después de varios intentos.")
    raise Exception("No se pudo generar un código de sala único.")


# --- Player CRUD ---

def get_player(db: Session, player_id: int):
    return db.query(models.Player).filter(models.Player.id == player_id).first()

def get_player_by_user_id_and_room_code(db: Session, user_id: int, room_code: str):
    return db.query(models.Player).join(
        models.Room, models.Player.room_id == models.Room.id
    ).filter(
        models.Player.user_id == user_id,
        func.upper(models.Room.code) == func.upper(room_code)
    ).first()


def get_players_in_room(db: Session, room_id: int):
    return db.query(models.Player).filter(models.Player.room_id == room_id).all()

def add_player_to_room(db: Session, room: models.Room, user: models.User, is_host: bool = False, is_spectating: bool = False):
    logging.info(f"Añadiendo jugador '{user.username}' a la sala '{room.code}'. Es host: {is_host}, Espectador: {is_spectating}")
    db_player = models.Player(
        user_id=user.id, 
        room_id=room.id, 
        is_host=is_host,
        # Si es host, no puede ser espectador y se convierte en theme_master inicial.
        is_theme_master=is_host,
        is_spectating=is_spectating
    )
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    
    if is_host:
        room.theme_master_id = db_player.id
        db.commit()

    return db_player


# --- Topic CRUD ---

def get_topic(db: Session, topic_id: int):
    return db.query(models.Topic).filter(models.Topic.id == topic_id).first()

def get_topic_by_title(db: Session, title: str):
    return db.query(models.Topic).filter(models.Topic.title == title).first()

def get_user_topics(db: Session, user_id: int):
    logging.info(f"Obteniendo temas para el usuario ID: {user_id}")
    return db.query(models.Topic).filter(models.Topic.owner_id == user_id).order_by(models.Topic.id.desc()).all()

def get_public_topics(db: Session):
    logging.info("Obteniendo todos los temas públicos.")
    return db.query(models.Topic).filter(models.Topic.is_public == True).order_by(models.Topic.id.desc()).all()

def create_topic(db: Session, topic: schemas.TopicCreate, owner_id: int):
    logging.info(f"Creando nuevo tema '{topic.title}' para el usuario ID: {owner_id}")
    db_topic = models.Topic(**topic.model_dump(), owner_id=owner_id)
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic


def delete_topic(db: Session, topic_id: int, owner_id: int) -> bool:
    """Eliminar un topic si pertenece al owner_id. Retorna True si eliminado, False si no existe o no pertenece."""
    topic = get_topic(db, topic_id)
    if not topic:
        logging.info(f"Intento de borrar topic inexistente ID: {topic_id}")
        return False
    if topic.owner_id != owner_id:
        logging.warning(f"Usuario ID {owner_id} intentó borrar topic ID {topic_id} sin ser propietario.")
        return False
    db.delete(topic)
    db.commit()
    logging.info(f"Topic ID {topic_id} eliminado por owner ID {owner_id}.")
    return True


# --- Monedas / Tienda ---
def adjust_user_coins(db: Session, user_id: int, delta: int) -> int:
    """Ajusta (suma o resta) las monedas del usuario y devuelve el nuevo balance."""
    user = get_user(db, user_id)
    if not user:
        raise ValueError("Usuario no encontrado")
    new_balance = (user.coins or 0) + int(delta)
    if new_balance < 0:
        raise ValueError("Fondos insuficientes")
    user.coins = new_balance
    db.commit()
    db.refresh(user)
    logging.info(f"Balance actualizado para usuario ID {user_id}: {user.coins} (delta {delta})")
    return user.coins


def create_purchase(db: Session, user_id: int, item_id: str, cost: int):
    """Create a purchase record (does not commit transaction by itself)."""
    purchase = models.Purchase(user_id=user_id, item_id=item_id, cost=cost)
    db.add(purchase)
    db.flush()
    db.refresh(purchase)
    return purchase


def get_user_purchases(db: Session, user_id: int, limit: Optional[int] = None):
    """Devuelve las compras del usuario ordenadas por fecha descendente."""
    query = db.query(models.Purchase).filter(models.Purchase.user_id == user_id).order_by(models.Purchase.created_at.desc())
    if limit:
        query = query.limit(limit)
    return query.all()