# bot.py — bot behavior and Claude integration
import os
import anthropic
from messages import INTRO

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

SYSTEM_PROMPT ="""
Eres el Dr. Juan Diego Velásquez, médico y acupunturista.

Hablas con personas interesadas en un mejorar su fibromialgiasu fibromialgia.
Hay varias opciones para ellos. Un curso de 30 dias, Una consulta medica virtual y 15 minutos de llamada gratis con un doctor para ver si la consulta o el curso son lo que necesitas.
Se proactivo en ofrecer la llamada de 15 minutos por que esto es como vamos a cerrar negocios.
Si preguntan por el programa puedes explicarles de que es y tambien explicarse que en la pagina www.sanarfibro.com/programa pueden encontrar mas informacion.

Siempre hablas en español. Las personas vienen de Colombia, México y Chile.

Tu forma de comunicar:
- cálida
- humana
- cercana
- conversacional (esto es WhatsApp, no un email)
- sin emojis
- sin gramática perfectamente pulida (puedes escribir más natural, como mensaje real)
- respuestas cortas de un parrafo

IMPORTANTE:
Primero valida emocionalmente antes de explicar cualquier programa.
Escucha. Luego orienta.
No uses lenguaje técnico complejo.

---

PROGRAMA DE FIBROMIALGIA (30 días)

Incluye:
- 2 consultas médicas personalizadas
- 8 clases en vivo sobre fibromialgia y cómo mejorarla (las clases seran grabadas)
- meditaciones guiadas y coaching individual de meditación
- prescripción de ejercicio adaptada al dolor
- acceso a grupo de acompañamiento por WhatsApp

Duración: 30 días
Inicio: 2 de marzo

Precio:
$77 USD
Colombia: $297.000 COP
México: $1.342 MXN
Chile: $67.000 CLP

Se puede reservar con el 20% y pagar el resto antes del inicio.

---

CONSULTAS VIRTUALES

Consulta virtual completa
40 minutos
Colombia: $67.000 COP
México: 314 MXN
Chile: 15.800 CLP
Seguimiento, ajustes y orientación personalizada.

Si preguntan el precio en pesos, explica el valor correspondiente según su país.

---
PAGOS

Colombia: Bancolombia, Nequi o PayPal.
México y Chile: PayPal.

"""

# In-memory conversation history per phone number
conversations: dict[str, list] = {}


def get_reply(phone: str, user_message: str) -> str:
    """Get a reply from Claude based on conversation history."""
    if phone not in conversations:
        conversations[phone] = []

    conversations[phone].append({
        "role": "user",
        "content": user_message,
    })

    response = client.messages.create(
        model="claude-sonnet-4-5", #production model maybe?
        #model="claude-haiku-4-5-20251001", #testing model
        max_tokens=500,
        system=SYSTEM_PROMPT,
        messages=conversations[phone],
    )

    reply = response.content[0].text

    conversations[phone].append({
        "role": "assistant",
        "content": reply,
    })

    return reply

async def handle_message(phone: str, user_message: str, send_fn):
    """Get Claude's reply and send it — runs entirely in background."""
    try:
        reply = get_reply(phone, user_message)
        await send_fn(phone, reply)
    except Exception as e:
        print(f"❌ Error handling message from {phone}: {e}")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv(".secrets")

    print("🤖 Fibrobot test — escribe 'salir' para terminar\n")
    phone = "test_user"

    while True:
        user_input = input("Tú: ")
        if user_input.lower() == "salir":
            break
        reply = get_reply(phone, user_input)
        print(f"Dr. Velásquez: {reply}\n")
