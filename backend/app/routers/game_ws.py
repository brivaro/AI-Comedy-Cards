from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Query
from sqlalchemy.orm import Session
import logging
from ..services.websocket_manager import manager
from ..db.database import SessionLocal
from ..db import crud
from .auth import get_user_from_token_ws
from ..services import game_logic

router = APIRouter(prefix="", tags=["Game WebSocket"])

@router.websocket("/ws/game/{room_code}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_code: str,
    token: str = Query(...)
):
    logging.warning(f"Conexión WebSocket iniciada para la sala {room_code} usando token en query param. Considerar métodos más seguros para producción.")
    
    user = await get_user_from_token_ws(token)
    if not user:
        await websocket.accept()
        logging.error(f"WS-AUTH: Autenticación fallida para la sala {room_code}. Token inválido o expirado.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication failed")
        return

    # Usamos una sesión temporal solo para validar al jugador y obtener su ID
    db_temp: Session = SessionLocal()
    try:
        player = crud.get_player_by_user_id_and_room_code(db_temp, user_id=user.id, room_code=room_code)
        if not player:
            await websocket.accept()
            logging.error(f"WS-AUTH: Usuario '{user.username}' autenticado pero no es jugador en la sala {room_code}.")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Player not in this room")
            return
        player_id = player.id # Guardamos el ID para usarlo después
    finally:
        db_temp.close()
    
    logging.info(f"WS-CONNECT: Jugador '{user.username}' (PlayerID: {player_id}) validado. Conectando a la sala {room_code}.")
    await manager.connect(room_code, player_id, websocket)

    # Broadcast inicial y envío de mano con una nueva sesión
    with SessionLocal() as db:
        await game_logic.broadcast_game_state(db, room_code)
        await game_logic.send_player_hand(db, room_code, player_id)

    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            payload = data.get("payload", {})
            
            logging.info(f"WS-ACTION: Sala '{room_code}', Jugador '{user.username}' (ID: {player_id}) -> Acción: '{action}', Payload: {payload}")
            
            action_map = {
                "set_game_settings": game_logic.set_game_settings,
                "start_game": game_logic.start_game,
                "choose_theme_card": game_logic.choose_theme_card,
                "submit_custom_theme": game_logic.submit_custom_theme, 
                "play_card": game_logic.play_card,
                "select_winners": game_logic.select_winners,
                "start_next_round": game_logic.start_next_round,
            }

            if action in action_map:
                # Se crea una nueva sesión de BD para cada acción, garantizando datos frescos
                with SessionLocal() as db_action:
                    await action_map[action](db_action, room_code, player_id, payload)
                    await game_logic.broadcast_game_state(db_action, room_code)
            else:
                logging.warning(f"WS-ACTION: Acción desconocida '{action}' recibida del jugador {player_id}.")


    except WebSocketDisconnect:
        logging.info(f"WS-DISCONNECT: WebSocket desconectado para el jugador '{user.username}' en la sala {room_code}.")
        manager.disconnect(room_code, websocket)
        # Se crea una nueva sesión para manejar la desconexión con datos actualizados
        with SessionLocal() as db_disconnect:
            player_to_disconnect = crud.get_player(db_disconnect, player_id)
            if player_to_disconnect:
                await game_logic.handle_player_disconnect(db_disconnect, room_code, player_to_disconnect.id)
                await game_logic.broadcast_game_state(db_disconnect, room_code)
            
    except Exception as e:
        logging.error(f"WS-ERROR: Ocurrió un error inesperado en el WebSocket de la sala {room_code} para el usuario {user.username}: {e}", exc_info=True)
        manager.disconnect(room_code, websocket)