import asyncio
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import os
import binascii
import logging

from fastapi import FastAPI

from app.db import schemas, models
from app.core.personality import DEFAULT_PERSONALITIES
from app.core.topic import DEFAULT_TOPICS

from .db.database import engine, Base, SessionLocal
from .db import crud
from .core.config import settings


# --- Tarea de limpieza ---
async def cleanup_old_rooms_task():
    """Tarea que se ejecuta en segundo plano para limpiar salas antiguas."""
    while True:
        # Espera 5 minutos antes de cada ciclo de limpieza.
        await asyncio.sleep(300) 
        
        logging.info("CRON: Ejecutando tarea de limpieza de salas antiguas...")
        db = SessionLocal()
        try:
            # Calcula el tiempo límite.
            expiration_time = datetime.utcnow() - timedelta(minutes=settings.ROOM_EXPIRATION_MINUTES)
            
            # Busca todas las salas que fueron creadas antes del tiempo límite.
            old_rooms = db.query(models.Room).filter(models.Room.created_at < expiration_time).all()
            
            if old_rooms:
                logging.info(f"CRON: Se encontraron {len(old_rooms)} salas caducadas para eliminar.")
                for room in old_rooms:
                    db.delete(room)
                db.commit()
                logging.info("CRON: Salas caducadas eliminadas con éxito.")
            else:
                logging.info("CRON: No se encontraron salas caducadas.")
        except Exception as e:
            logging.error(f"CRON: Error durante la limpieza de salas: {e}")
            db.rollback()
        finally:
            db.close()

# --- Tarea de iniciar BD + info predeterminada ---
def initial_setup():
    db = SessionLocal()
    try:
        # 1. Crear usuario "Sistema" si no existe
        system_user = crud.get_user_by_username(db, username="Sistema")
        if not system_user:
            logging.info("Usuario 'Sistema' no encontrado, procediendo a crearlo.")
            secure_password = binascii.hexlify(os.urandom(24)).decode()
            system_user_schema = schemas.UserCreate(
                username="Sistema",
                password=secure_password
            )
            system_user = crud.create_user(db, user=system_user_schema)
            logging.info("Usuario 'Sistema' creado con una contraseña segura y no utilizable.")

        # 2. Crear temas por defecto si no existen
        logging.info("Verificando existencia de temas por defecto...")
        for t_data in DEFAULT_TOPICS:
            existing_topic = crud.get_topic_by_title(db, title=t_data["title"])
            if not existing_topic:
                logging.info(f"Creando tema: '{t_data['title']}'...")
                topic_schema = schemas.TopicCreate(
                    title=t_data["title"],
                    prompt=t_data["prompt"],
                    is_public=t_data["is_public"]
                )
                # Asignamos el tema al usuario "Sistema"
                crud.create_topic(db, topic=topic_schema, owner_id=system_user.id)
        db.commit()
        logging.info("Verificación de temas completada.")

        logging.info("Verificando existencia de personalidades por defecto...")
        for p_data in DEFAULT_PERSONALITIES:
            existing_personality = db.query(models.Personality).filter(models.Personality.title == p_data["title"]).first()
            if not existing_personality:
                logging.info(f"Creando personalidad: '{p_data['title']}'...")
                db_personality = models.Personality(
                    title=p_data["title"],
                    description=p_data["description"],
                    template_prompt=p_data["template"]
                )
                db.add(db_personality)
        db.commit()
        logging.info("Verificación de personalidades completada.")
    finally:
        db.close()

# --- LIFESPAN ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Iniciando aplicación AI Comedy Cards...")
    Base.metadata.create_all(bind=engine)
    initial_setup()
    
    logging.info("Iniciando la tarea de limpieza de salas en segundo plano...")
    asyncio.create_task(cleanup_old_rooms_task())
    
    yield
    logging.info("Cerrando aplicación.")