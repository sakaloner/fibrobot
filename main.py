"""fibrobot — WhatsApp Business webhook that logs incoming messages."""
import os
import json
import httpx
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Query, HTTPException, BackgroundTasks
from fastapi.responses import PlainTextResponse
from messages import INTRO
from bot import get_reply, handle_message
import uvicorn

load_dotenv(".secrets")

WHATSAPP_API_KEY = os.getenv("WHATSAPP_API_KEY", "")
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID", "")
VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "fibrobot_verify")
LOGS_DIR = os.path.join(os.path.dirname(__file__), "logs")
SEEN_DIR = os.path.join(os.path.dirname(__file__), "seen")

app = FastAPI(title="fibrobot")


@app.middleware("http")
async def add_ngrok_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["ngrok-skip-browser-warning"] = "true"
    return response


def is_first_contact(phone: str) -> bool:
    os.makedirs(SEEN_DIR, exist_ok=True)
    filepath = os.path.join(SEEN_DIR, f"{phone}.seen")
    if os.path.exists(filepath):
        return False
    open(filepath, "w").close()
    return True


async def send_whatsapp_message(to: str, message: str):
    url = f"https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": message},
    }
    async with httpx.AsyncClient() as client:
        r = await client.post(url, headers=headers, json=payload)
        print(f'sending this {payload}')
        print(f"📤 Sent to {to}: {r.status_code}")
        print(r.json())
        return r.json()


def log_message(msg: dict, contact_name: str = ""):
    os.makedirs(LOGS_DIR, exist_ok=True)
    sender = contact_name or msg.get("from", "unknown")
    ts = msg.get("timestamp", "0")
    msg_id = msg.get("id", ts)

    try:
        time_str = datetime.fromtimestamp(int(ts)).strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        time_str = ts

    mtype = msg.get("type", "unknown")
    body = ""
    if mtype == "text":
        body = msg.get("text", {}).get("body", "")
    elif mtype == "audio":
        body = "[voice note]"

    log_entry = {
        "id": msg_id,
        "from": sender,
        "time": time_str,
        "type": mtype,
        "body": body,
        "raw": msg,
    }

    filename = f"{msg_id}_{sender}.json"
    filepath = os.path.join(LOGS_DIR, filename)

    if not os.path.exists(filepath):
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(log_entry, f, indent=2, ensure_ascii=False)

    print(f"📨 {sender} ({time_str}): {body}")


def get_contact_name(value: dict, phone: str) -> str:
    for c in value.get("contacts", []):
        if c.get("wa_id") == phone:
            return c.get("profile", {}).get("name", phone)
    return phone


@app.get("/webhook", response_class=PlainTextResponse)
async def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    if hub_mode == "subscribe" and hub_token == VERIFY_TOKEN:
        return hub_challenge
    raise HTTPException(status_code=403, detail="Forbidden")


@app.post("/webhook")
async def receive_message(request: Request, background_tasks: BackgroundTasks):
    data = await request.json()
    for entry in data.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            for msg in value.get("messages", []):
                phone = msg.get("from", "")
                name = get_contact_name(value, phone)
                background_tasks.add_task(log_message, msg, name)

                if is_first_contact(phone):
                    print('its first contact')
                    background_tasks.add_task(send_whatsapp_message, phone, INTRO)
                else:
                    print('its second contact')
                    # Only reply to text messages for now
                    if is_first_contact(phone):
                        background_tasks.add_task(send_whatsapp_message, phone, INTRO)
                    else:
                        if msg.get("type") == "text":
                            user_text = msg.get("text", {}).get("body", "")
                            #background_tasks.add_task(send_whatsapp_message, phone, INTRO)
                            background_tasks.add_task(handle_message, phone, user_text, send_whatsapp_message)

    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True)
