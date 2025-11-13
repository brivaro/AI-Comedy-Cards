from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
import binascii

# Se importan tanto los schemas como los modelos para claridad
from app.db import schemas, models
from app.core.security import get_password_hash

from .db.database import engine, Base, SessionLocal
from .db import crud
from .core.prompts import DEFAULT_TOPIC_PROMPT
from .routers import auth, rooms, topics, game_ws

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
            
            # ### CORRECCIÓN ###:
            # 1. Generamos una contraseña segura y aleatoria.
            secure_password = binascii.hexlify(os.urandom(24)).decode()
            
            # 2. Creamos un schema Pydantic `UserCreate` con esa contraseña.
            system_user_schema = schemas.UserCreate(
                username="Sistema",
                password=secure_password
            )
            
            # 3. Usamos la función CRUD existente, que está diseñada para
            #    manejar correctamente la creación del modelo SQLAlchemy.
            system_user = crud.create_user(db, user=system_user_schema)
            logging.info("Usuario 'Sistema' creado con una contraseña segura y no utilizable.")

        # 2. Crear tema por defecto si no existe
        default_title = "Humor Negro"
        default_topic = crud.get_topic_by_title(db, title=default_title)
        if not default_topic:
            default_topic_schema = schemas.TopicCreate(
                title=default_title,
                prompt=DEFAULT_TOPIC_PROMPT,
                is_public=True
            )
            crud.create_topic(db, topic=default_topic_schema, owner_id=system_user.id)
            logging.info(f"Tema por defecto '{default_title}' creado y asignado al usuario 'Sistema'.")
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

@app.get("/api/v1")
def read_root():
    return {"message": "Welcome to AI Comedy Cards API"}