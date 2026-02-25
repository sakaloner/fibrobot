const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys')
const { fetchLatestWaWebVersion } = require('@whiskeysockets/baileys')

const qrcode = require('qrcode-terminal')
const Anthropic = require('@anthropic-ai/sdk')
const fs = require('fs')
const path = require('path')

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const DEBOUNCE_MS      = 10000
const MEMORY_DIR       = path.join(__dirname, 'memory')
const LOG_FILE         = path.join(__dirname, 'logs', 'messages.log')
const LEADS_FILE = path.join(__dirname, 'leads.csv')
const PROMPT_FILE      = path.join(__dirname, 'prompt.txt')
const MAX_HISTORY      = 20
const RECONNECT_DELAY  = 5000

// ─── SETUP ────────────────────────────────────────────────────────────────────

const secretsPath = path.join(__dirname, '..', '.secrets')
const secrets = fs.readFileSync(secretsPath, 'utf-8')
const apiKey = secrets.match(/ANTHROPIC_API_KEY=(.+)/)[1].trim()
const claude = new Anthropic({ apiKey })

if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true })
if (!fs.existsSync(path.dirname(LOG_FILE))) fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })

// ─── PROMPT ───────────────────────────────────────────────────────────────────

function getSystemPrompt() {
    try {
        return fs.readFileSync(PROMPT_FILE, 'utf-8')
    } catch (err) {
        console.error('❌ Could not read prompt.txt, using fallback')
        return 'Eres Camila, asistente del Dr. Velásquez. Ayuda a los pacientes con fibromialgia.'
    }
}

// ─── LOGGING ──────────────────────────────────────────────────────────────────

function logMessage(sender, direction, text) {
    const timestamp = new Date().toISOString()
    const line = `[${timestamp}] [${direction}] [${sender}]: ${text}\n`
    fs.appendFileSync(LOG_FILE, line, 'utf-8')
    console.log(line.trim())
}

// ─── LEADS ────────────────────────────────────────────────────────────────────

function guardarLead({ nombre, numero, tiempo_enfermedad, tratamientos, hora_preferida }) {
    const timestamp = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })

    // Write header if file doesn't exist yet
    if (!fs.existsSync(LEADS_FILE)) {
        fs.writeFileSync(LEADS_FILE, 'Fecha,Nombre,Número,Tiempo enfermedad,Tratamientos,Hora preferida,Estado\n', 'utf-8')
    }

    // Wrap fields in quotes to handle commas inside the text
    const escape = (val) => `"${String(val).replace(/"/g, '""')}"`

    const row = [
        escape(timestamp),
        escape(nombre),
        escape(numero),
        escape(tiempo_enfermedad),
        escape(tratamientos),
        escape(hora_preferida),
        escape('PENDIENTE LLAMAR')
    ].join(',') + '\n'

    fs.appendFileSync(LEADS_FILE, row, 'utf-8')
    console.log(`✅ Lead guardado: ${nombre} (${numero})`)
    return `Lead guardado correctamente para ${nombre}`
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
    const trimmed = messages.slice(-MAX_HISTORY)
    fs.writeFileSync(getMemoryPath(sender), JSON.stringify(trimmed, null, 2), 'utf-8')
}

// ─── TOOL DEFINITION ──────────────────────────────────────────────────────────

const TOOLS = [
    {
        name: 'guardar_lead',
        description: 'Guarda la información del lead una vez que tienes su nombre, cuánto tiempo lleva con la enfermedad, qué tratamientos ha intentado y su hora preferida para la llamada. Solo llama esta herramienta una vez por conversación, cuando tengas todos estos datos.',
        input_schema: {
            type: 'object',
            properties: {
                nombre: {
                    type: 'string',
                    description: 'Nombre del paciente o familiar'
                },
                numero: {
                    type: 'string',
                    description: 'Número de WhatsApp del contacto'
                },
                tiempo_enfermedad: {
                    type: 'string',
                    description: 'Cuánto tiempo lleva con fibromialgia u otra enfermedad mencionada'
                },
                tratamientos: {
                    type: 'string',
                    description: 'Qué tratamientos o medicamentos ha intentado'
                },
                hora_preferida: {
                    type: 'string',
                    description: 'Mañana o tarde, o una hora específica si la mencionó'
                }
            },
            required: ['nombre', 'numero', 'tiempo_enfermedad', 'tratamientos', 'hora_preferida']
        }
    }
]

// ─── CLAUDE ───────────────────────────────────────────────────────────────────

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
                system: getSystemPrompt(),
                tools: TOOLS,
                messages: history
            })

            // Guard: empty response
            if (!response.content || response.content.length === 0) {
                console.error('❌ Claude returned empty content')
                return 'Disculpa, tuve un problemita técnico. Puedes escribirme de nuevo en un momento?'
            }

            // Handle tool use
            if (response.stop_reason === 'tool_use') {
                const toolUseBlock = response.content.find(b => b.type === 'tool_use')

                if (toolUseBlock && toolUseBlock.name === 'guardar_lead') {

                    // Guard: tool input is empty or missing required fields
                    const input = toolUseBlock.input
                    if (!input || !input.nombre || !input.hora_preferida) {
                        console.error('❌ Tool call missing required fields:', input)
                        const fallback = 'Perfecto, alguien de nuestro equipo te contacta pronto. Que tengas buen dia.'
                        history.push({ role: 'assistant', content: fallback })
                        saveConversation(sender, history)
                        return fallback
                    }

                    const leadData = { ...input, numero: sender.replace(/@s\.whatsapp\.net/, '') }
                    const result = guardarLead(leadData)

                    history.push({ role: 'assistant', content: response.content })
                    history.push({
                        role: 'user',
                        content: [{
                            type: 'tool_result',
                            tool_use_id: toolUseBlock.id,
                            content: result
                        }]
                    })

                    const finalResponse = await claude.messages.create({
                        model: 'claude-sonnet-4-5',
                        max_tokens: 1024,
                        system: getSystemPrompt(),
                        tools: TOOLS,
                        messages: history
                    })

                    // Guard: empty final response after tool use
                    const finalText = finalResponse.content?.find(b => b.type === 'text')?.text
                    if (!finalText) {
                        console.error('❌ Empty final response after tool use')
                        const fallback = 'Perfecto, alguien de nuestro equipo te contacta pronto. Que tengas buen dia.'
                        history.push({ role: 'assistant', content: fallback })
                        saveConversation(sender, history)
                        return fallback
                    }

                    history.push({ role: 'assistant', content: finalText })
                    saveConversation(sender, history)
                    return finalText
                }
            }

            // Normal text response
            const reply = response.content.find(b => b.type === 'text')?.text
            if (!reply) {
                console.error('❌ No text block in response')
                return 'Disculpa, tuve un problemita técnico. Puedes escribirme de nuevo en un momento?'
            }
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

// ─── BOT TOGGLE ───────────────────────────────────────────────────────────────

let botEnabled = true
const OWNER_NUMBER = '573145592704'

function handleOwnerCommand(text) {
    const cmd = text.trim().toLowerCase()
    if (cmd === '!bot off') {
        botEnabled = false
        console.log('🔴 Bot desactivado')
        return 'Bot desactivado. Los mensajes entran pero no responde automaticamente.'
    }
    if (cmd === '!bot on') {
        botEnabled = true
        console.log('🟢 Bot activado')
        return 'Bot activado. Respondiendo automaticamente.'
    }
    if (cmd === '!bot status') {
        return `Bot esta ${botEnabled ? 'activo 🟢' : 'inactivo 🔴'}`
    }
    if (cmd === '!bot prompt') {
        const preview = getSystemPrompt().slice(0, 120)
        return `Prompt activo (primeros 120 chars):\n"${preview}..."`
    }
    return null
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
    const { version } = await fetchLatestWaWebVersion()
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: true
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('messaging-history.set', ({ messages }) => {
        for (const msg of messages) {
            const jid = msg.key.remoteJid
            if (!jid || jid.endsWith('@g.us')) continue

            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text
            if (!text) continue

            const role = msg.key.fromMe ? 'assistant' : 'user'
            const history = loadConversation(jid)

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
        if (type !== 'notify') return

        const msg = messages[0]

        const msgTimestamp = (msg.messageTimestamp || 0) * 1000
        if (Date.now() - msgTimestamp > 30_000) return

        const sender = msg.key.remoteJid
        if (sender.endsWith('@g.us')) return

        if (msg.key.fromMe) {
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text
            if (text) {
                const commandResult = handleOwnerCommand(text)
                if (commandResult) {
                    console.log(`⚡ Comando: ${text} → ${commandResult}`)
                    await sock.sendMessage(sender, { text: `⚡ ${commandResult}` })
                    return
                }

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

            if (!botEnabled && senderNumber !== OWNER_NUMBER) {
                console.log(`⏸️  Bot inactivo, mensaje de ${senderNumber} no respondido automaticamente`)
                return
            }

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
