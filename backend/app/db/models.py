from sqlalchemy import Column, DateTime, Integer, String, Boolean, ForeignKey, Text, JSON, func
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)     
    players = relationship("Player", back_populates="user")
    topics = relationship("Topic", back_populates="owner", cascade="all, delete-orphan")
    last_seen = Column(DateTime, default=datetime.utcnow)

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    game_state = Column(String, default="Lobby")
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True) # Se elige en el lobby
    current_theme_card_id = Column(Integer, ForeignKey("cards.id"), nullable=True) # La carta negra de la ronda

    theme_master_id = Column(Integer, ForeignKey("players.id", use_alter=True), nullable=True) 
    round_phase = Column(String, nullable=True) # ThemeSelection, CardPlaying, Voting, RoundOver
    played_cards_info = Column(JSON, default=list)
    round_winners = Column(JSON, default=list) # [1st_player_id, 2nd_player_id, 3rd_player_id]

    personality_id = Column(Integer, ForeignKey("personalities.id"), nullable=True)
    personality = relationship("Personality", back_populates="rooms")

    total_rounds = Column(Integer, default=10, nullable=False)
    current_round = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    players = relationship(
        "Player",
        back_populates="room",
        cascade="all, delete-orphan",
        foreign_keys="[Player.room_id]"
    )
    topic = relationship("Topic")
    current_theme_card = relationship("Card", foreign_keys=[current_theme_card_id])
    theme_master = relationship("Player", foreign_keys=[theme_master_id], post_update=True)

class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    is_public = Column(Boolean, default=False)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="topics")
    
    response_cards = relationship("Card", back_populates="topic", cascade="all, delete-orphan")

class Player(Base):
    __tablename__ = "players"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE")) 
    score = Column(Integer, default=0)
    is_host = Column(Boolean, default=False)
    is_theme_master = Column(Boolean, default=False)
    has_played = Column(Boolean, default=False)
    is_spectating = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    user = relationship("User", back_populates="players")
    room = relationship("Room", back_populates="players", foreign_keys=[room_id])
    
    hand = relationship("PlayerCard", back_populates="player", cascade="all, delete-orphan")

class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    card_type = Column(String, nullable=False) # 'response' (blanca) o 'theme' (negra)
    
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    topic = relationship("Topic", back_populates="response_cards")

# TABLA INTERMEDIA: Para representar la mano de un jugador
class PlayerCard(Base):
    __tablename__ = "player_cards"
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)

    player = relationship("Player", back_populates="hand")
    card = relationship("Card")

# Modelo para las personalidades de la IA
class Personality(Base):
    __tablename__ = "personalities"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=False)
    template_prompt = Column(Text, nullable=False)

    rooms = relationship("Room", back_populates="personality")