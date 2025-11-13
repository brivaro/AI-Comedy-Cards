from fastapi import WebSocket
from typing import Dict, List, Tuple
import logging
import json

class ConnectionManager:
    def __init__(self):
        # Asocia un room_code a una lista de tuplas (player_id, websocket)
        self.active_connections: Dict[str, List[Tuple[int, WebSocket]]] = {}

    async def connect(self, room_code: str, player_id: int, websocket: WebSocket):
        await websocket.accept()
        if room_code not in self.active_connections:
            self.active_connections[room_code] = []
        self.active_connections[room_code].append((player_id, websocket))
        logging.info(f"Player {player_id} conectado a la sala {room_code}. Conexiones totales en sala: {len(self.active_connections[room_code])}")

    def disconnect(self, room_code: str, websocket: WebSocket):
        if room_code in self.active_connections:
            connection_to_remove = next(((pid, ws) for pid, ws in self.active_connections[room_code] if ws == websocket), None)
            if connection_to_remove:
                self.active_connections[room_code].remove(connection_to_remove)
                logging.info(f"Player {connection_to_remove[0]} desconectado de la sala {room_code}.")
                if not self.active_connections[room_code]:
                    del self.active_connections[room_code]

    async def broadcast(self, room_code: str, message: dict):
        if room_code in self.active_connections:
            message_str = json.dumps(message)
            for _, connection in self.active_connections[room_code]:
                await connection.send_text(message_str)

    async def send_to_player(self, room_code: str, player_id: int, message: dict):
        if room_code in self.active_connections:
            connection_info = next(((pid, ws) for pid, ws in self.active_connections[room_code] if pid == player_id), None)
            if connection_info:
                await connection_info[1].send_json(message)

manager = ConnectionManager()