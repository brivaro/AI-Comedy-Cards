import logging
import json
from fastapi import HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types

from app.db.schemas import CardGenerationResponse
from ..core.prompts import AI_SYSTEM_PROMPT_TEMPLATE

# Constantes
MODEL_NAME = 'gemini-flash-latest'

try:
    client = genai.Client()
    logging.info("[INFO] Cliente de Gemini configurado exitosamente. Modelo cargado: {MODEL_NAME}")
except Exception as e:
    logging.error(f"[ERROR] No se pudo configurar el modelo de Gemini: {e}")

async def _generate_content_from_gemini(prompt: str, response_schema: BaseModel):
    """
    Función interna genérica para llamar a la API de Gemini y obtener una respuesta JSON estructurada.
    """
    
    logging.info("[INFO] Enviando petición a la API de Gemini...")
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents = prompt,
            config=types.GenerateContentConfig(
                temperature=1.0,
                top_p=0.95,
                response_mime_type="application/json",
                response_schema=response_schema,
            ),
        )
        
        # La respuesta ya viene en JSON, la parseamos
        result = json.loads(response.text)
        logging.info(f"[INFO] Respuesta JSON válida recibida de Gemini: {result}")
        return result

    except json.JSONDecodeError:
        logging.error(f"[ERROR] La respuesta de Gemini no era un JSON válido: {response.text}")
        raise HTTPException(status_code=500, detail="La respuesta de la IA no tuvo un formato JSON válido.")
    except Exception as e:
        logging.error(f"[ERROR] Error al contactar con la API de Gemini: {e}")
        raise HTTPException(status_code=500, detail="Ocurrió un error al generar contenido con la IA.")
    
async def generate_cards_for_topic(topic_prompt: str, card_type: str, count: int) -> list[str]:
    """
    Genera un lote de cartas para un tema específico, esperando una respuesta JSON estructurada.
    """
    system_instruction = AI_SYSTEM_PROMPT_TEMPLATE.format(topic_prompt=topic_prompt)
    
    if card_type == 'response':
        user_prompt = f"Genera {count} cartas de respuesta (blancas) sobre la temática."
    elif card_type == 'theme':
        user_prompt = f"Genera {count} cartas de tema (negras) sobre la temática."
    else:
        return []

    full_prompt = system_instruction + "\n" + user_prompt
    
    try:
        # Llamamos a nuestra función genérica, pasándole el esquema de Pydantic que esperamos
        response_data = await _generate_content_from_gemini(full_prompt, CardGenerationResponse)
        
        # El resultado ya es un diccionario validado, extraemos los textos
        validated_response = CardGenerationResponse.model_validate(response_data)
        card_texts = [card.text for card in validated_response.cards]
        
        logging.info(f"Se generaron y validaron {len(card_texts)} cartas de tipo '{card_type}'.")
        return card_texts

    except HTTPException:
        # Si la llamada a la IA falla, generamos placeholders para no romper el juego.
        logging.warning(f"La generación con IA falló. Devolviendo {count} placeholders.")
        if card_type == 'response':
            return [f"Respuesta de emergencia {i+1} (IA no disponible)" for i in range(count)]
        else:
            return [f"Tema de emergencia ______ {i+1} (IA no disponible)" for i in range(count)]