import logging
import random
import asyncio
from sqlalchemy.orm import Session
from sqlalchemy import func, exc, select

from ..db import crud, models, schemas
from ..websocket_manager import manager
from . import gemini
from ..core import constants

# --- Funciones de Difusión ---

async def broadcast_game_state(db: Session, room_code: str):
    """Obtiene el estado actual de la sala y lo envía a todos los jugadores."""
    room = crud.get_room_by_code(db, room_code)
    if not room:
        logging.warning(f"GAME-STATE: No se pudo emitir el estado, la sala {room_code} no existe (probablemente cerrada).")
        await manager.broadcast(room_code, {"type": "room_closed", "data": {"message": "La sala ha sido cerrada."}})
        return

    # ### CORRECCIÓN ###: Se llama al schema desde `schemas`, no desde `models`.
    game_state_data = schemas.RoomSchema.from_orm_model(room).model_dump()
    
    await manager.broadcast(room_code, {"type": "game_state_update", "data": game_state_data})
    
    if room.game_state == "InGame":
        await broadcast_player_hands(db, room_code)


async def send_player_hand(db: Session, room_code: str, player_id: int):
    """Envía la mano de cartas actualizada a un jugador específico."""
    player_hand_entries = db.query(models.PlayerCard).filter(models.PlayerCard.player_id == player_id).all()

    cards_data = [{"id": entry.id, "card": {"id": entry.card.id, "text": entry.card.text, "card_type": entry.card.card_type}} for entry in player_hand_entries]
    
    await manager.send_to_player(room_code, player_id, {
        "type": "player_hand_update",
        "data": cards_data
    })


async def broadcast_player_hands(db: Session, room_code: str):
    """Envía a cada jugador en una sala su mano de cartas."""
    room = crud.get_room_by_code(db, room_code)
    if not room: return
    for player in room.players:
        await send_player_hand(db, room_code, player.id)


# --- Acciones del Juego ---

#async def set_topic(db: Session, room_code: str, player_id: int, payload: dict):
#    """El host de la sala elige un tema para la partida."""
#    topic_id = payload.get('topic_id')
#    room = crud.get_room_by_code(db, room_code)
#    player = crud.get_player(db, player_id)
#    topic = crud.get_topic(db, topic_id)
#
#    if not all([room, player, topic]) or not player.is_host:
#        logging.warning(f"Intento no autorizado de establecer tema en sala {room_code} por PlayerID {player_id}")
#        return
#    
#    try:
#        room.topic_id = topic.id
#        db.commit()
#        logging.info(f"El host '{player.user.username}' ha establecido el tema '{topic.title}' (ID: {topic.id}) para la sala {room_code}.")
#    except exc.SQLAlchemyError as e:
#        logging.error(f"Error de base de datos al establecer el tema para la sala {room_code}: {e}")
#        db.rollback()

async def set_game_settings(db: Session, room_code: str, player_id: int, payload: dict):
    """El host de la sala elige un tema y una personalidad para la partida."""
    topic_id = payload.get('topic_id')
    personality_id = payload.get('personality_id')
    
    room = crud.get_room_by_code(db, room_code)
    player = crud.get_player(db, player_id)

    if not all([room, player]) or not player.is_host:
        logging.warning(f"Intento no autorizado de establecer ajustes en sala {room_code} por PlayerID {player_id}")
        return
    
    # Validamos que los IDs existen antes de asignarlos
    topic = crud.get_topic(db, topic_id) if topic_id else None
    personality = db.query(models.Personality).filter(models.Personality.id == personality_id).first() if personality_id else None

    if not topic or not personality:
        logging.warning(f"Intento de establecer tema/personalidad inválido en sala {room_code}. T:{topic_id} P:{personality_id}")
        return

    try:
        room.topic_id = topic.id
        room.personality_id = personality.id
        db.commit()
        logging.info(f"El host '{player.user.username}' ha establecido el tema '{topic.title}' y la personalidad '{personality.title}' para la sala {room_code}.")
    except exc.SQLAlchemyError as e:
        logging.error(f"Error de base de datos al establecer ajustes para la sala {room_code}: {e}")
        db.rollback()

async def submit_custom_theme(db: Session, room_code: str, player_id: int, payload: dict):
    """El Theme Master escribe y envía su propia carta de tema para la ronda."""
    text = payload.get('text', '').strip()
    room = crud.get_room_by_code(db, room_code)
    player = crud.get_player(db, player_id)

    # Validaciones
    if not all([room, player]) or player.id != room.theme_master_id:
        logging.warning(f"Intento no autorizado de enviar tema personalizado en sala {room_code} por PlayerID {player_id}")
        return
    if room.round_phase != "ThemeSelection":
        logging.warning(f"Intento de enviar tema personalizado fuera de la fase ThemeSelection en sala {room_code}.")
        return
    if not (10 < len(text) < 280) or "______" not in text:
        await manager.send_to_player(room_code, player_id, {"type": "error", "data": {"message": "El tema debe tener entre 10 y 280 caracteres e incluir '______'."}})
        return
    
    try:
        # Creamos una nueva carta de tema, asociada al topic actual de la sala
        new_card = models.Card(
            text=text,
            card_type='theme',
            topic_id=room.topic_id
        )
        db.add(new_card)
        db.flush() # Para obtener el ID de la nueva carta

        room.current_theme_card_id = new_card.id
        room.round_phase = "CardPlaying"
        
        db.commit()
        logging.info(f"Theme Master (PlayerID {player_id}) ha enviado un tema personalizado en la sala {room_code}.")
    except exc.SQLAlchemyError as e:
        logging.error(f"Error de BD al guardar tema personalizado en sala {room_code}: {e}")
        db.rollback()

async def start_game(db: Session, room_code: str, player_id: int, payload: dict):
    """Inicia la partida, generando y repartiendo cartas del tema elegido."""
    room = crud.get_room_by_code(db, room_code)
    player = crud.get_player(db, player_id)

    if not room or not player or not player.is_host:
        logging.warning(f"GAME-ACTION: Intento no autorizado de iniciar partida en sala {room_code} por PlayerID {player_id}.")
        return
    if not room.topic_id:
        await manager.send_to_player(room_code, player_id, {"type": "error", "data": {"message": "Debes elegir un tema antes de empezar."}})
        return
    if not room.personality_id:
        await manager.send_to_player(room_code, player_id, {"type": "error", "data": {"message": "Debes elegir una personalidad para la IA antes de empezar."}})
        return
    if len(room.players) < constants.MIN_PLAYERS:
        await manager.send_to_player(room_code, player_id, {"type": "error", "data": {"message": f"Faltan jugadores (mínimo {constants.MIN_PLAYERS})."}})
        return

    topic = crud.get_topic(db, room.topic_id)
    personality = room.personality
    
    if not topic or not personality:
        logging.error(f"GAME-ACTION: No se pudo iniciar la partida en {room_code}. El tema o la personalidad no existen.")
        return

    logging.info(f"Iniciando partida en sala {room_code} con el tema '{topic.title}' y la personalidad '{personality.title}'.")
    
    try:
        room.game_state = "InGame"
        room.round_phase = "ThemeSelection"

        response_needed = len(room.players) * constants.INITIAL_HAND_SIZE
        theme_needed = len(room.players) * 2
        
        logging.info(f"Generando {response_needed} cartas de respuesta y {theme_needed} de tema para la sala {room_code}.")
        
        response_texts, theme_texts = await asyncio.gather(
            gemini.generate_cards_for_topic(topic.prompt, personality.template_prompt, 'response', 40), #response_needed)
            gemini.generate_cards_for_topic(topic.prompt, personality.template_prompt, 'theme', 40) #theme_needed) 
        )

        # Crear y añadir todas las cartas nuevas a la sesión
        new_cards = []
        for text in response_texts: new_cards.append(models.Card(text=text, card_type='response', topic_id=topic.id))
        for text in theme_texts: new_cards.append(models.Card(text=text, card_type='theme', topic_id=topic.id))
        db.add_all(new_cards)
        db.flush()

        all_response_cards = [c for c in new_cards if c.card_type == 'response']
        random.shuffle(all_response_cards)

        card_idx = 0
        new_player_cards = []
        for p in room.players:
            for _ in range(constants.INITIAL_HAND_SIZE):
                if card_idx < len(all_response_cards):
                    new_player_cards.append(models.PlayerCard(player_id=p.id, card_id=all_response_cards[card_idx].id))
                    card_idx += 1
        db.add_all(new_player_cards)
        
        db.commit()
        logging.info(f"Partida iniciada y cartas repartidas con éxito en la sala {room_code}.")

    except Exception as e:
        logging.error(f"Error crítico al iniciar la partida en {room_code}. Revirtiendo cambios. Error: {e}", exc_info=True)
        db.rollback()
        if room:
            room.game_state = "Lobby"
            db.commit()


async def choose_theme_card(db: Session, room_code: str, player_id: int, payload: dict):
    room = crud.get_room_by_code(db, room_code)
    player = crud.get_player(db, player_id)
    if not room or not player or player.id != room.theme_master_id: return

    try:
        used_theme_cards_subquery = db.query(models.Room.current_theme_card_id).filter(
            models.Room.id == room.id,
            models.Room.current_theme_card_id.isnot(None)
        ).subquery()

        theme_card = db.query(models.Card).filter(
            models.Card.topic_id == room.topic_id, 
            models.Card.card_type == 'theme',
            models.Card.id.notin_(select(used_theme_cards_subquery))
        ).order_by(func.random()).first()

        if not theme_card:
            logging.warning(f"Se acabaron las cartas de tema en la sala {room_code}. Finalizando partida.")
            await manager.broadcast(room_code, {"type": "error", "data": {"message": "¡No quedan más cartas de tema! El juego ha terminado."}})
            room.game_state = "Lobby"
        else:
            room.current_theme_card_id = theme_card.id
            room.round_phase = "CardPlaying"
        
        db.commit()
    except exc.SQLAlchemyError as e:
        logging.error(f"Error de BD al elegir carta de tema en sala {room_code}: {e}")
        db.rollback()


async def play_card(db: Session, room_code: str, player_id: int, payload: dict):
    """El jugador juega una carta de su mano."""
    player_card_id = payload.get('player_card_id')
    player = crud.get_player(db, player_id)
    room = crud.get_room_by_code(db, room_code)
    player_card_entry = db.query(models.PlayerCard).filter(models.PlayerCard.id == player_card_id, models.PlayerCard.player_id == player_id).first()

    if not all([player, room, player_card_entry]) or player.has_played or player.is_theme_master:
        logging.warning(f"Jugada inválida del PlayerID {player_id} en sala {room_code}.")
        return
    
    try:
        played_info = list(room.played_cards_info or [])
        played_info.append({
            "playerId": player.id,
            "playerName": player.user.username,
            "cardText": player_card_entry.card.text
        })
        room.played_cards_info = played_info
        player.has_played = True
        db.delete(player_card_entry)
        
        db.flush()
        
        non_tm_players = [p for p in room.players if not p.is_theme_master]
        if all(p.has_played for p in non_tm_players):
            room.round_phase = "Voting"
            logging.info(f"Todos los jugadores han jugado en la sala {room_code}. Pasando a fase de votación.")
        
        db.commit()
        logging.info(f"PlayerID {player_id} jugó la carta PlayerCardID {player_card_id} en sala {room_code}.")
    except exc.SQLAlchemyError as e:
        logging.error(f"Error de BD al jugar carta en sala {room_code} por PlayerID {player_id}: {e}")
        db.rollback()


async def select_winners(db: Session, room_code: str, player_id: int, payload: dict):
    """El Theme Master confirma los ganadores de la ronda."""
    winner_ids = payload.get('winner_ids', [])
    room = crud.get_room_by_code(db, room_code)
    if not room or player_id != room.theme_master_id or not winner_ids: return

    try:
        points_map = [constants.FIRST_PLACE_POINTS, constants.SECOND_PLACE_POINTS, constants.THIRD_PLACE_POINTS]
        for i, winner_id in enumerate(winner_ids):
            if i < len(points_map):
                winner_player = crud.get_player(db, winner_id)
                if winner_player:
                    winner_player.score += points_map[i]
                    logging.info(f"Asignando {points_map[i]} puntos al PlayerID {winner_id} en sala {room_code}.")

        room.round_phase = "RoundOver"
        room.round_winners = winner_ids
        db.commit()
        logging.info(f"Ganadores de la ronda seleccionados en sala {room_code}: {winner_ids}")
    except exc.SQLAlchemyError as e:
        logging.error(f"Error de BD al seleccionar ganadores en sala {room_code}: {e}")
        db.rollback()


async def start_next_round(db: Session, room_code: str, player_id: int, payload: dict):
    # ### MEJORA ###: Corregida SAWarning
    room = crud.get_room_by_code(db, room_code)
    if not room or player_id != room.theme_master_id: return

    try:
        player_ids_who_played = {card['playerId'] for card in room.played_cards_info}
        
        cards_in_hand_subquery = db.query(models.PlayerCard.card_id).join(models.Player).filter(models.Player.room_id == room.id).subquery()
        
        available_cards = db.query(models.Card).filter(
            models.Card.topic_id == room.topic_id,
            models.Card.card_type == 'response',
            models.Card.id.notin_(select(cards_in_hand_subquery))
        ).all()
        random.shuffle(available_cards)

        if len(available_cards) < len(player_ids_who_played):
            await manager.broadcast(room_code, {"type": "error", "data": {"message": "¡Se acabaron las cartas! La partida ha terminado."}})
            room.game_state = "Lobby"
        else:
            for p_id in list(player_ids_who_played):
                if available_cards:
                    db.add(models.PlayerCard(player_id=p_id, card_id=available_cards.pop().id))

            players = sorted(room.players, key=lambda p: p.id)
            current_tm_index = next((i for i, p in enumerate(players) if p.id == room.theme_master_id), -1)
            
            if current_tm_index != -1: players[current_tm_index].is_theme_master = False
            next_tm_index = (current_tm_index + 1) % len(players)
            new_theme_master = players[next_tm_index]
            new_theme_master.is_theme_master = True
            
            room.theme_master_id = new_theme_master.id
            room.round_phase = "ThemeSelection"
            room.current_theme_card_id = None
            room.played_cards_info = []
            room.round_winners = []
            for p in players: p.has_played = False

        db.commit()
    except exc.SQLAlchemyError as e:
        logging.error(f"Error de BD al iniciar nueva ronda en sala {room_code}: {e}")
        db.rollback()


async def handle_player_disconnect(db: Session, room_code: str, player_id: int):
    # ### CORRECCIÓN ###: Lógica completa para manejar la desconexión correctamente.
    player = crud.get_player(db, player_id)
    if not player:
        return

    room = player.room
    logging.info(f"Gestionando desconexión del jugador '{player.user.username}' (PlayerID {player_id}) en sala {room_code}.")

    try:
        # Si es el último jugador, se elimina la sala
        if len(room.players) <= 1:
            logging.info(f"Último jugador desconectado de la sala {room_code}. Eliminando la sala.")
            db.delete(room)
            db.commit()
            return
            
        was_host = player.is_host
        was_theme_master = player.is_theme_master
        is_game_in_progress = room.game_state == 'InGame'

        # 1. Romper la dependencia de la clave foránea ANTES de borrar
        if was_theme_master:
            logging.info(f"El jugador desconectado '{player.user.username}' era el Theme Master.")
            room.theme_master_id = None
            db.flush() # Aplicamos el cambio para que la FK se libere

        # 2. Ahora podemos borrar al jugador de forma segura
        db.delete(player)
        db.flush() # Aplicamos la eliminación para que room.players se actualice

        # 3. Reasignar roles con los jugadores restantes
        remaining_players = sorted(room.players, key=lambda p: p.id)

        if was_host and remaining_players:
            new_host = remaining_players[0]
            new_host.is_host = True
            logging.info(f"Host reasignado a '{new_host.user.username}' en sala {room_code}.")

        if was_theme_master and is_game_in_progress and remaining_players:
            # Si el TM se va a mitad de ronda, la reiniciamos para evitar bloqueos
            new_theme_master = remaining_players[0]
            new_theme_master.is_theme_master = True
            room.theme_master_id = new_theme_master.id
            
            room.round_phase = "ThemeSelection"
            room.current_theme_card_id = None
            room.played_cards_info = []      
            room.round_winners = []
            for p in remaining_players:
                p.has_played = False
            logging.info(f"Ronda reiniciada. Theme Master reasignado a '{new_theme_master.user.username}'.")
        
        # 4. Finalizar la transacción
        db.commit()
        logging.info(f"Desconexión del PlayerID {player_id} manejada con éxito en sala {room_code}.")

    except exc.SQLAlchemyError as e:
        logging.error(f"Error de BD al manejar desconexión en sala {room_code}: {e}", exc_info=True)
        db.rollback()