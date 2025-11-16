from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    GEMINI_API_KEY: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080 # 7 días
    ROOM_EXPIRATION_MINUTES: int = 60

    class Config:
        env_file = ".env.local"
        env_file_encoding = "utf-8"

settings = Settings()