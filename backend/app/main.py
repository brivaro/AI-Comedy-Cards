import warnings

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from logging.config import fileConfig

from .routers import auth, rooms, topics, game_ws, personalities, store
from .start_routines import lifespan
from .core.config import settings

warnings.filterwarnings("ignore", category=UserWarning)

fileConfig('logging.ini', disable_existing_loggers=False)

app = FastAPI(title="AI Comedy Cards API", lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://localhost",
    settings.VERCEL_FRONTEND_URL
]

VERCEL_PREVIEW_REGEX = r"https://ai-comedy-cards-*\.vercel\.app"
origins.append(VERCEL_PREVIEW_REGEX)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=VERCEL_PREVIEW_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(topics.router)
app.include_router(game_ws.router)
app.include_router(personalities.router)
app.include_router(store.router)

@app.get("/api/v1")
def read_root():
    return {"message": "Welcome to AI Comedy Cards API"}