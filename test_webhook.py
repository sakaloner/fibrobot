"""Tests for fibrobot — WhatsApp webhook message logging."""

import os
import json
import shutil
from fastapi.testclient import TestClient
from main import app

LOGS_DIR = os.path.join(os.path.dirname(__file__), "logs")

client = TestClient(app)


def setup_function():
    if os.path.exists(LOGS_DIR):
        shutil.rmtree(LOGS_DIR)


def teardown_function():
    if os.path.exists(LOGS_DIR):
        shutil.rmtree(LOGS_DIR)


def make_payload(text="Hola, quiero info del curso de fibromialgia"):
    return {
        "entry": [{
            "changes": [{
                "value": {
                    "contacts": [{"wa_id": "573113322658", "profile": {"name": "María"}}],
                    "messages": [{
                        "from": "573113322658",
                        "timestamp": "1708300000",
                        "type": "text",
                        "text": {"body": text},
                    }],
                }
            }]
        }]
    }


def test_webhook_verification():
    resp = client.get("/webhook", params={
        "hub.mode": "subscribe",
        "hub.verify_token": "fibrobot_verify",
        "hub.challenge": "CHALLENGE_OK",
    })
    assert resp.status_code == 200
    assert resp.text == "CHALLENGE_OK"


def test_webhook_rejects_bad_token():
    resp = client.get("/webhook", params={
        "hub.mode": "subscribe",
        "hub.verify_token": "wrong",
        "hub.challenge": "X",
    })
    assert resp.status_code == 403


def test_message_creates_log_file():
    resp = client.post("/webhook", json=make_payload())
    assert resp.status_code == 200
    assert os.path.exists(LOGS_DIR)
    assert len(os.listdir(LOGS_DIR)) >= 1


def test_log_contains_message_data():
    client.post("/webhook", json=make_payload())
    files = os.listdir(LOGS_DIR)
    content = open(os.path.join(LOGS_DIR, files[0])).read()
    assert "María" in content
    assert "fibromialgia" in content
