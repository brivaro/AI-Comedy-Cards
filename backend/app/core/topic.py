from .prompts import (
    DEFAULT_TOPIC_PROMPT, OFFICE_HELL_TOPIC_PROMPT, INTERNET_CHAOS_TOPIC_PROMPT, 
    MODERN_LOVE_CRISIS_TOPIC_PROMPT, MILLENNIAL_CRINGE_TOPIC_PROMPT, CONSPIRACY_NONSENSE_TOPIC_PROMPT, 
    RIDICULOUS_DILEMMAS_TOPIC_PROMPT, PURE_SURREALISM_TOPIC_PROMPT
)

DEFAULT_TOPICS = [
    {
        "title": "Infierno de Oficina (Vida Godínez)",
        "prompt": OFFICE_HELL_TOPIC_PROMPT,
        "is_public": True
    },
    {
        "title": "Caos de Internet y Memes",
        "prompt": INTERNET_CHAOS_TOPIC_PROMPT,
        "is_public": True
    },
    {
        "title": "Crisis del Amor Moderno",
        "prompt": MODERN_LOVE_CRISIS_TOPIC_PROMPT,
        "is_public": True
    },
    {
        "title": "Nostalgia y Vergüenza Millennial",
        "prompt": MILLENNIAL_CRINGE_TOPIC_PROMPT,
        "is_public": True
    },
    {
        "title": "Conspiraciones sin Sentido",
        "prompt": CONSPIRACY_NONSENSE_TOPIC_PROMPT,
        "is_public": True
    },
    {
        "title": "Dilemas Ridículos",
        "prompt": RIDICULOUS_DILEMMAS_TOPIC_PROMPT,
        "is_public": True
    },
    {
        "title": "Surrealismo Puro",
        "prompt": PURE_SURREALISM_TOPIC_PROMPT,
        "is_public": True
    },
    {
        "title": "Humor Negro Loco",
        "prompt": DEFAULT_TOPIC_PROMPT,
        "is_public": True
    },
]