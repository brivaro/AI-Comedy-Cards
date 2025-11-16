from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .routers import auth, rooms, topics, game_ws, personalities
from .start_routines import lifespan
from .core.config import settings

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI(title="AI Comedy Cards API", lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://localhost",
    settings.VERCEL_FRONTEND_URL
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