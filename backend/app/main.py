from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
import binascii

from app.db import schemas, models
from app.core.personality import DEFAULT_PERSONALITIES
from app.core.topic import DEFAULT_TOPICS

from .db.database import engine, Base, SessionLocal
from .db import crud
from .routers import auth, rooms, topics, game_ws, personalities

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# --- LÓGICA DE STARTUP ---
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

@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Iniciando aplicación AI Comedy Cards...")
    Base.metadata.create_all(bind=engine)
    initial_setup()
    yield
    logging.info("Cerrando aplicación.")

app = FastAPI(title="AI Comedy Cards API", lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(topics.router)
app.include_router(game_ws.router)
app.include_router(personalities.router)

@app.get("/api/v1")
def read_root():
    return {"message": "Welcome to AI Comedy Cards API"}