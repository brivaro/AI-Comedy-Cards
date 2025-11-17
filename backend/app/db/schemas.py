from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional
from . import models

# --- User & Token Schemas ---
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=60)

class UserInDB(UserBase):
    id: int
    last_seen: Optional[datetime] = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- TEMAS ---
class TopicBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=100)
    prompt: str = Field(..., min_length=20, max_length=2000)
    is_public: bool = False

class TopicCreate(TopicBase):
    pass

class TopicSchema(TopicBase):
    id: int
    owner_username: str

    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm_model(cls, topic: models.Topic) -> TopicSchema:
        return cls(
            id=topic.id,
            title=topic.title,
            prompt=topic.prompt,
            is_public=topic.is_public,
            owner_username=topic.owner.username if topic.owner else "Sistema"
        )


# --- LA IA ---
class GeneratedCard(BaseModel):
    text: str = Field(..., description="El texto completo de la carta generada.")

class CardGenerationResponse(BaseModel):
    cards: List[GeneratedCard] = Field(..., description="Una lista de las cartas generadas.")


# --- Game Schemas ---
class RoomCreate(BaseModel):
    pass

class PlayerSchema(BaseModel):
    id: int
    username: str
    score: int
    is_host: bool
    is_theme_master: bool
    has_played: bool
    is_spectating: bool
    is_active: bool

    class Config:
        from_attributes = True

class CardSchema(BaseModel):
    id: int
    text: str
    card_type: str

    class Config:
        from_attributes = True
        
class RoomSchema(BaseModel):
    code: str
    game_state: str
    topic_id: Optional[int]
    personality_id: Optional[int] 
    theme_master_id: Optional[int]
    current_theme_card: Optional[CardSchema]
    round_phase: Optional[str]
    players: List[PlayerSchema] = []
    played_cards_info: List[dict] = [] 
    round_winners: List[int] = []
    personality: Optional[PersonalitySchema]
    total_rounds: int
    current_round: int

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_model(cls, room: models.Room) -> RoomSchema:
        players_schema = [
            PlayerSchema(
                id=p.id, 
                username=p.user.username, 
                score=p.score, 
                is_host=p.is_host, 
                is_theme_master=p.is_theme_master, 
                has_played=p.has_played,
                is_spectating=p.is_spectating,
                is_active=p.is_active
            ) for p in room.players
        ]
        return cls(
            code=room.code,
            game_state=room.game_state,
            topic_id=room.topic_id,
            personality_id=room.personality_id,
            personality=PersonalitySchema.model_validate(room.personality, from_attributes=True) if room.personality else None,
            theme_master_id=room.theme_master_id,
            current_theme_card=CardSchema.model_validate(room.current_theme_card, from_attributes=True) if room.current_theme_card else None,
            round_phase=room.round_phase,
            players=players_schema,
            played_cards_info=room.played_cards_info or [],
            round_winners=room.round_winners or [],
            total_rounds=room.total_rounds,
            current_round=room.current_round
        )
    
class PersonalitySchema(BaseModel):
    id: int
    title: str
    description: str

    class Config:
        from_attributes = True