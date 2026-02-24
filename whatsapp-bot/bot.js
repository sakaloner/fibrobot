const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const Anthropic = require('@anthropic-ai/sdk')
const fs = require('fs')
const path = require('path')

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const DEBOUNCE_MS      = 10000
const MEMORY_DIR       = path.join(__dirname, 'memory')
const LOG_FILE         = path.join(__dirname, 'logs', 'messages.log')
const MAX_HISTORY      = 20   // keep last N messages per user (user + assistant pairs)
const RECONNECT_DELAY  = 5000 // ms before attempting reconnect

// ─── SETUP ────────────────────────────────────────────────────────────────────

const secretsPath = path.join(__dirname, '..', '.secrets')
const secrets = fs.readFileSync(secretsPath, 'utf-8')
const apiKey = secrets.match(/ANTHROPIC_API_KEY=(.+)/)[1].trim()
const claude = new Anthropic({ apiKey })

if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true })
if (!fs.existsSync(path.dirname(LOG_FILE))) fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })

// ─── LOGGING ──────────────────────────────────────────────────────────────────

function logMessage(sender, direction, text) {
    const timestamp = new Date().toISOString()
    const line = `[${timestamp}] [${direction}] [${sender}]: ${text}\n`
    fs.appendFileSync(LOG_FILE, line, 'utf-8')
    console.log(line.trim())
}

// ─── MEMORY ───────────────────────────────────────────────────────────────────

function getMemoryPath(sender) {
    return path.join(MEMORY_DIR, `${sender}.json`)
}

function loadConversation(sender) {
    const filePath = getMemoryPath(sender)
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
    return []
}

function saveConversation(sender, messages) {
    // Trim to last MAX_HISTORY messages before saving
    const trimmed = messages.slice(-MAX_HISTORY)
    fs.writeFileSync(getMemoryPath(sender), JSON.stringify(trimmed, null, 2), 'utf-8')
}

// ─── CLAUDE ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
Eres Camila, la asistente virtual del Dr. Juan Diego Velásquez por WhatsApp. El Dr. es médico especialista en medicina tradicional china (MTC), acupuntura y medicina integrativa, con consulta en Pereira, Colombia.

Hablas de manera casual, cálida y cercana, como un amigo que sabe de salud, no como un robot. Mensajes cortos, uno a la vez. Nada de listas ni menús. Haz preguntas abiertas y deja que la persona cuente su historia con sus propias palabras.

Nunca menciones que eres una IA o un bot. Si te preguntan, di que eres la asistente del Dr. Velásquez.

---

CÓMO FLUYE LA CONVERSACIÓN:

1. SALUDA y pregunta su nombre..
   → "¡Hola! Soy Camila, asistente del Dr. Juan Diego Velásquez. ¿Con quién tengo el gusto de hablar?"

2. Pregunta al paciente hace cuanto tiempo tiene fibromialgia (o la enfermedad que haya descrito) y que ha hecho para manejarla?
  -> "para poderte dar una mejor atencion te pregunto, Hace cuanto tienes la enfermedad y que has hecho para tratar de manejarla?"

3. Se empatica, y ofrece una llamada para contarle del programa que le puede ayudar, preguntar a que hora esta libre hoy y maniana, tarde o maniana
  "Qué duro llevar tanto tiempo con eso. Lo que describes es exactamente para quien hicimos el programa Renace. ¿Te gustaría hablar con nosotros por telefono para contarte cómo podemos ayudarte? ¿Te queda mejor en la mañana o en la tarde?"

reglas:
- No uses emojis
- No escribas parrafos largos
- No uses em dashes (- -)
`

async function askClaude(sender, userMessage, retries = 3) {
    const history = loadConversation(sender)
    const isReturning = history.length > 0

    if (!isReturning) {
        history.push({
            role: 'user',
            content: `[Nota interna: esta persona podría tener una conversación previa. Si su mensaje no parece un primer contacto, saluda brevemente y retoma natural.] ${userMessage}`
        })
    } else {
        history.push({ role: 'user', content: userMessage })
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await claude.messages.create({
                model: 'claude-sonnet-4-5',
                max_tokens: 1024,
                system: SYSTEM_PROMPT,
                messages: history
            })

            const reply = response.content.find(b => b.type === 'text')?.text || ''
            history.push({ role: 'assistant', content: reply })
            saveConversation(sender, history)
            return reply

        } catch (err) {
            console.error(`❌ Attempt ${attempt}/${retries} failed:`, err.message)
            if (attempt === retries) {
                return 'Disculpa, tuve un problemita técnico. Puedes escribirme de nuevo en un momento?'
            }
            await delay(attempt * 2000)
        }
    }
}

// ─── ANTI-BAN ─────────────────────────────────────────────────────────────────

async function sendHumanReply(sock, sender, text) {
    const thinkDelay = Math.floor(Math.random() * 2000) + 1000
    const typeDelay  = Math.min(text.length * 30, 5000)

    await delay(thinkDelay)
    await sock.sendPresenceUpdate('composing', sender)
    await delay(typeDelay)
    await sock.sendPresenceUpdate('paused', sender)
    await sock.sendMessage(sender, { text })
}

// ─── MAIN BOT ─────────────────────────────────────────────────────────────────

let isConnecting = false

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({ auth: state })

    sock.ev.on('creds.update', saveCreds)

    // ─── Seed history from WhatsApp sync ───────────────────────────────────────
    sock.ev.on('messaging-history.set', ({ messages }) => {
        for (const msg of messages) {
            const jid = msg.key.remoteJid
            if (!jid || jid.endsWith('@g.us')) continue

            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text
            if (!text) continue

            const role = msg.key.fromMe ? 'assistant' : 'user'
            const history = loadConversation(jid)

            // avoid duplicates
            const alreadyExists = history.some(h => h.content === text && h.role === role)
            if (!alreadyExists) {
                history.push({ role, content: text })
            }

            saveConversation(jid, history)
        }
        console.log('📚 History seeded from WhatsApp sync')
    })

    sock.ev.on('connection.update', ({ connection, qr, lastDisconnect }) => {
        if (qr) qrcode.generate(qr, { small: true })

        if (connection === 'open') {
            isConnecting = false
            console.log('✅ Bot connected!')
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401
            if (shouldReconnect && !isConnecting) {
                isConnecting = true
                console.log(`🔄 Connection closed. Reconnecting in ${RECONNECT_DELAY / 1000}s...`)
                setTimeout(() => { isConnecting = false; startBot() }, RECONNECT_DELAY)
            } else if (!shouldReconnect) {
                console.log('🚫 Logged out. Please delete the auth folder and restart to scan QR again.')
            }
        }
    })

    const pendingMessages = {}

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        // Only handle genuinely new incoming messages
        if (type !== 'notify') return

        const msg = messages[0]

        // Ignore stale messages replayed on startup (offline sync)
        const msgTimestamp = (msg.messageTimestamp || 0) * 1000
        if (Date.now() - msgTimestamp > 30_000) return

        // Ignore group messages
        const sender = msg.key.remoteJid
        if (sender.endsWith('@g.us')) return

        // If it's a message YOU sent manually, save it to history so Claude stays in context
        if (msg.key.fromMe) {
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text
            if (text) {
                const history = loadConversation(sender)
                history.push({ role: 'assistant', content: text })
                saveConversation(sender, history)
                logMessage(sender.replace(/@s\.whatsapp\.net/, ''), 'OUT-MANUAL', text)
            }
            return
        }

        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text
        if (!text) return

        const senderNumber = sender.replace(/@s\.whatsapp\.net/, '')

        // Debounce — collect messages for DEBOUNCE_MS then reply once
        if (pendingMessages[sender]) {
            clearTimeout(pendingMessages[sender].timer)
            pendingMessages[sender].texts.push(text)
        } else {
            pendingMessages[sender] = { texts: [text] }
        }

        pendingMessages[sender].timer = setTimeout(async () => {
            const combined = pendingMessages[sender].texts.join(' ')
            delete pendingMessages[sender]

            logMessage(senderNumber, 'IN', combined)

            try {
                const reply = await askClaude(sender, combined)
                await sendHumanReply(sock, sender, reply)
                logMessage(senderNumber, 'OUT', reply)
            } catch (err) {
                console.error('❌ Error:', err)
            }
        }, DEBOUNCE_MS)
    })
}

startBot()
