# fibrobot 🤖

Prints every WhatsApp Business message you receive — live in your terminal.

## Quick start (NixOS)

```bash
# 1. Enter the dev shell (installs Python + deps automatically)
nix-shell

# 2. Add missing secrets to .secrets
echo "VERIFY_TOKEN=fibrobot_verify" >> .secrets

# 3. Run the server
python main.py

# 4. In another terminal — expose it publicly
ngrok http 3000
```

## Meta setup (one-time)

1. Go to [developers.facebook.com](https://developers.facebook.com) → **Create App** → Business
2. Add **WhatsApp** product → grab your **API key** (already in `.secrets`)
3. Under **Webhooks**, add:
   - **Callback URL**: `https://<your-ngrok-id>.ngrok-free.app/webhook`
   - **Verify token**: `fibrobot_verify` (or whatever you set in `VERIFY_TOKEN`)
   - Subscribe to: **messages**

## Environment variables (`.secrets`)

| Variable | Description |
|---|---|
| `WHATSAPP_API_KEY` | Your Meta API token (permanent or temporary) |
| `VERIFY_TOKEN` | Any secret string you also enter in Meta's dashboard |
| `PORT` | Port to listen on (default: `3000`) |

## Supported message types

| Type | What's printed |
|---|---|
| `text` | The message body |
| `image / video / audio / sticker` | Media ID + caption |
| `document` | Filename + caption |
| `location` | Name + coordinates |
| `reaction` | Emoji + referenced message ID |
| `button` | Button text |

Any other type dumps the raw JSON so nothing is lost.
