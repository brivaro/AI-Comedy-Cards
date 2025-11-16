from .prompts import (
    DEFAULT_BLACK_HUMOR_TEMPLATE, DRUNK_PHILOSOPHER_TEMPLATE, 
    BROTHER_IN_LAW_TEMPLATE, TOO_ONLINE_AI_TEMPLATE, 
    ABUELO_CEBOLLETA_TEMPLATE, PRESIDENTIAL_PARODY_TEMPLATE,
    PASSIVE_AGGRESSIVE_BOSS_TEMPLATE, UNHINGED_MOTIVATIONAL_COACH_TEMPLATE
)

DEFAULT_PERSONALITIES = [
    {
        "title": "Comediante Estándar",
        "description": "El humorista ingenioso, cínico y escandalosamente inapropiado por defecto. Un todoterreno del humor negro.",
        "template": DEFAULT_BLACK_HUMOR_TEMPLATE
    },
    {
        "title": "El Filósofo Borracho",
        "description": "Intenta ser profundo sobre la vida, pero su borrachera resulta en un humor absurdo, nihilista y a menudo inapropiado.",
        "template": DRUNK_PHILOSOPHER_TEMPLATE
    },
    {
        "title": "Tu Cuñado en Navidad",
        "description": "El experto de bar que opina de todo sin saber de nada. Una mezcla de datos falsos, chistes malos y condescendencia.",
        "template": BROTHER_IN_LAW_TEMPLATE
    },
    {
        "title": "IA con Sobredosis de Internet",
        "description": "Ha perdido todo filtro. Su humor es una mezcla de jerga de internet, memes, shitposting y referencias que solo un adicto a la red entendería.",
        "template": TOO_ONLINE_AI_TEMPLATE
    },
    {
        "title": "El Abuelo Cebolleta",
        "description": "Un batiburrillo de recuerdos exagerados, batallitas inventadas y quejas sobre la juventud de hoy. Entrañable pero totalmente senil.",
        "template": ABUELO_CEBOLLETA_TEMPLATE
    },
    {
        "title": "Pedro Sánchez en situaciones coticianas",
        "description": "Una imitación cómica del presidente Pedro Sánchez, aplicando un tono solemne y jerga política a los problemas más triviales y mundanos.",
        "template": PRESIDENTIAL_PARODY_TEMPLATE
    },
    {
        "title": "Tu Jefe Pasivo-Agresivo",
        "description": "Maestro en disfrazar órdenes como 'sugerencias' y en usar jerga corporativa para pedirte que trabajes el fin de semana. Falsamente amable, letalmente tóxico.",
        "template": PASSIVE_AGGRESSIVE_BOSS_TEMPLATE
    },
    {
        "title": "Coach Motivacional Desquiciado",
        "description": "Su positividad es agresiva. Grita eslóganes, usa metáforas absurdas y cree que no dormir es la clave del éxito. ¡DESTRUYE TUS LÍMITES!",
        "template": UNHINGED_MOTIVATIONAL_COACH_TEMPLATE
    }
]