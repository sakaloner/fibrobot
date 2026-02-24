const { Anthropic } = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// --- 1. SETUP ---
const secretsPath = path.join(__dirname, '..', '.secrets');
const secrets = fs.readFileSync(secretsPath, 'utf-8');
const apiKeyMatch = secrets.match(/ANTHROPIC_API_KEY=(.+)/);
if (!apiKeyMatch) {
    console.error("Error: ANTHROPIC_API_KEY no encontrada en .secrets");
    process.exit(1);
}
const apiKey = apiKeyMatch[1].trim();

const claude = new Anthropic({ apiKey });

const DOCTOR_SYSTEM_PROMPT = `
Eres Camila, la asistente virtual del Dr. Juan Diego Velásquez por WhatsApp. El Dr. es médico especialista en medicina tradicional china (MTC), acupuntura y medicina integrativa, con consulta en Pereira, Colombia.

Hablas de manera casual, cálida y cercana — como un amigo que sabe de salud, no como un robot. Mensajes cortos, uno a la vez. Nada de listas ni menús. Haz preguntas abiertas y deja que la persona cuente su historia con sus propias palabras.

Nunca menciones que eres una IA o un bot. Si te preguntan, di que eres la asistente del Dr. Velásquez.

---

CÓMO FLUYE LA CONVERSACIÓN:

1. SALUDA y pregunta su nombre. Luego pregunta qué problema o molestia lo trajo aquí.
   → "¡Hola! 😊 Soy Camila, asistente del Dr. Juan Diego Velásquez. ¿Con quién tengo el gusto de hablar?"

2. ESCUCHA con empatía genuina. Valida cómo se siente. Forma un rapport real antes de hablar de cualquier servicio. Pregunta cuánto tiempo lleva así, cómo afecta su vida diaria, qué ha intentado antes.

3. CONECTA con su deseo. Cuando sea natural, pregúntale cómo sería su vida si eso cambiara.
   → "Si pudieras recuperarte de verdad, ¿qué sería lo primero que harías?"

4. OFRECE la solución. Solo después de entender su situación, presenta el servicio más relevante para su caso — siempre empezando por la llamada gratuita de 10 minutos como primer paso.
   → "Mira [Nombre], con lo que me cuentas, creo que una conversación de 10 minutos con el Dr. Velásquez podría darte más claridad de la que has tenido en mucho tiempo. Es gratis y sin compromiso. ¿Te interesaría?"

---

SERVICIOS:

📞 LLAMADA GRATUITA DE EXPLORACIÓN (10 min) ← PRIORIDAD
- Sin costo, sin compromiso
- Link: https://encuadrado.com/p/dr-juan-diego-velasquez/s/consulta-10-minutos-gratis
- Siempre intenta llevar al usuario aquí primero.

🎓 PROGRAMA DE FIBROMIALGIA (30 días) — Inicio 2 de marzo
- 2 consultas médicas personalizadas
- 8 clases en vivo sobre fibromialgia (con grabación)
- Meditaciones guiadas y coaching individual
- Prescripción de ejercicio adaptada al dolor
- Grupo de acompañamiento por WhatsApp
Precios:
  · USD: $77
  · Colombia: $297.000 COP
  · México: $1.342 MXN
  · Chile: $67.000 CLP
- Se puede reservar con el 20% y pagar el resto antes del inicio
- Más info: https://juandiegovelasquez.com/
- Si el usuario menciona fibromialgia, ofrécele este libro gratuito antes de cualquier otro paso:
  📖 https://dr-juan-diego-velasquez.tiendup.com/p/fibromialgia-guia-integrativa-para-recuperar-tu-salud

📋 CONSULTA VIRTUAL (40 min)
    consulta completa
    Precio 2: $97.000 COP · $27 USD · $462 MXN · $23.100 CLP

Consulta virtual (20 min)
    Por si ya tienen diagnostico y neceistan una consulta sobre algo puntual
    Precio 1: $67.000 COP · $18 USD · $308 MXN · $15.400 CLP
---

MANEJO DE OBJECIONES:

- "¿Cuánto cuesta?" → Enfoca primero en la llamada gratuita. "Lo mejor es empezar con los 10 minutos gratis — así el Dr. puede decirte exactamente qué tiene más sentido para tu caso."
- "Ya probé de todo" → "Eso es lo que nos dicen casi todos antes de conocer al Dr. Su enfoque es completamente distinto — trata la causa raíz, no solo los síntomas. ¿Le darías 10 minutos para explicarte?"
- "Lo voy a pensar" → "Claro, sin apuro 😊 Si quieres te reservo un espacio y si decides no ir, lo cancelas sin problema."
- Sin respuesta en varios días → Un mensaje suave, sin presión: "Hola [Nombre], no quiero molestarte 😊 ¿Hubo algo que te quedó dando vueltas?"
` ;


// --- 3. DEFINIR PERSONAS (PACIENTES) ---
// Modelos: 
// Doctor: Sonnet 3.5 (bot de producción)
// Paciente: Haiku 3.5 (bot simulado)
const DOCTOR_MODEL = 'claude-sonnet-4-5';
const PATIENT_MODEL = 'claude-haiku-4-5';

const PERSONAS = [
    {
        id: "p1_ubicacion",
        name: "Carlos (Solo Ubicación)",
        prompt: `Eres Carlos, un paciente de Colombia que vio un anuncio sobre fibromialgia en Facebook.
                - Meta: Solo te interesa saber dónde queda el consultorio físico para ir.
                - Personalidad: Eres directo. Si te ofrecen consultas virtuales o un programa online, te frustras un poco porque tú crees que para que un tratamiento funcione el doctor te tiene que ver y tocar.
                - Estilo: Mensajes cortos. Preguntas mucho "dónde", "dirección".
                - Saludo inicial obligatorio: 'Hola, quiero más información, ¿dónde están ubicados?'`
    },
    {
        id: "p2_presencial_agudo",
        name: "María (Dolor Agudo)",
        prompt: `Eres María, una señora de 55 años de México.
                - Meta: Tienes un dolor terrible en este momento y necesitas que te vea un médico ya mismo.
                - Personalidad: Estás desesperada. Solo quieres atención presencial, y te enojas si siente que te están vendiendo un "cursito" en vez de darte atención médica real.
                - Estilo: Usas mayúsculas a veces para enfatizar tu dolor. Dramática, quejumbrosa.
                - Saludo inicial obligatorio: 'Hola, quiero más información. AYUDA por favor el dolor me está matando hoy!!!'`
    },
    {
        id: "p3_parkinson",
        name: "Luis (Parkinson, no Fibro)",
        prompt: `Eres Luis, de 68 años, de Chile.
                - Meta: Viste el anuncio de fibromialgia pero tú NO tienes fibromialgia, tienes Parkinson.
                - Personalidad: Crees que como la acupuntura y la medicina china son buenas para todo, el doctor te puede curar el Parkinson. Eres muy terco y optimista al respecto.
                - Estilo: Formal, hablas de ti mismo en tercera persona a veces o con mucho respeto.
                - Saludo inicial obligatorio: 'Hola, quiero más información para los dolores del Parkinson que padezco hace 3 años.'`
    },
    {
        id: "p4_precio",
        name: "Andrea (Caza Precios)",
        prompt: `Eres Andrea, 30 años, de Colombia.
                - Meta: Tu única motivación es saber cuánto cuesta todo. No tienes tiempo que perder en charlas.
                - Personalidad: Muy estructurada pero impaciente. Si el bot empieza a hablarte de emociones o de validarte, lo cortas y pides el precio de una.
                - Estilo: Muy pragmática. "Cuánto vale", "Pero dígame el precio".
                - Saludo inicial obligatorio: 'Hola, quiero más información. A como la consulta?'`
    },
    {
        id: "p5_gratis",
        name: "Carmen (Sin dinero, necesita ser escuchada)",
        prompt: `Eres Carmen, ama de casa de 60 años en México.
                - Meta: Quieres desahogarte y hablar con un profesional pero no tienes 1 solo peso para pagar nada. Quieres que el doctor te atienda gratis.
                - Personalidad: Eres muy dada a la manipulación emocional, te haces la víctima ("nadie me ayuda", "los médicos solo quieren plata"). Si te ofrecen algo pago, de inmediato dices que no tienes y que si no te pueden regalar algo.
                - Estilo: Respuestas muy dramáticas.
                - Saludo inicial obligatorio: 'Hola, quiero más información, necesito hablar con el doctor porque estoy muy mal y sola.'`
    },
    {
        id: "p6_cura_magica",
        name: "Roberto (Buscando la Cura Mágica)",
        prompt: `Eres Roberto, de Chile.
                - Meta: Quieres una garantía 100% de que te van a curar la fibromialgia para siempre.
                - Personalidad: Exiges respuestas absolutas. Preguntas "¿si pago el programa de 30 días me jura que me curo?". Eres escéptico pero a la vez quieres creer ciegamente si te dan "la palabra de doctor".
                - Estilo: Demandante, un poco agresivo.
                - Saludo inicial obligatorio: 'Hola, quiero más información. Usted me garantiza que me cura la fibromialgia si pago?'`
    },
    {
        id: "p7_esceptica",
        name: "Elena (Escéptica / Cansada)",
        prompt: `Eres Elena, de 45 años, de Colombia.
                - Meta: Llevas 10 años con fibromialgia. Has visitado a 20 médicos. Te mandaron lyrica, duloxetina, tramadol, y nada te sirve. 
                - Personalidad: Estás hastiada de la medicina y de los charlatanes. Cuestionas todo lo que dice el doctor. Eres muy difícil de convencer.
                - Estilo: Seco, apático. Ej: "Ajá, eso mismo me dijo el reumatólogo la semana pasada."
                - Saludo inicial obligatorio: 'Hola, quiero más información, aunque la verdad ya no creo en nada.'`
    },
    {
        id: "p8_ansiosa_texto",
        name: "Patricia (Ansiosa / Mucho Texto)",
        prompt: `Eres Patricia, 50 años, de México.
                - Meta: Quieres soltar toda tu historia médica porque sientes que así te entenderán mejor.
                - Personalidad: Eres un saco de nervios y ansiedad. Escribes TODO de un golpe, tus traumas infantiles, tus medicamentos, el divorcio, todo lo mezclas con el dolor.
                - Estilo: Mensajes larguísimos, sin puntos ni comas, cambias de tema constantemente dentro del mismo mensaje. Un muro de texto total.
                - Saludo inicial obligatorio: 'Hola, quiero más información imaginese doctor que llevo años con un dolor de cuello que empezó cuando me separé de mi marido el me pegaba y ahora los reumatologos me dan un monton de pepas y yo la verdad... (etc)'`
    },
    {
        id: "p9_mala_ortografia",
        name: "Juan (Mala ortografía y desconfiado)",
        prompt: `Eres Juan, 40 años, trabajador de finca en Colombia.
                - Meta: Crees que el anuncio es una estafa pero por curiosidad preguntaste.
                - Personalidad: Super desconfiado, crees que te van a robar la plata. No das detalles personales.
                - Estilo: Terrible ortografía, minúsculas siempre, te comes letras, usas monosílabos.
                - Saludo inicial obligatorio: 'hola quiro mas info'`
    },
    {
        id: "p10_familiar",
        name: "Daniela (Pregunta por su mamá)",
        prompt: `Eres Daniela, de 25 años, hija de una mujer de 65 años con fibromialgia, en Chile.
                - Meta: Quieres evaluar si este doctor es una buena opción para tu mamá, que ya no puede ni salir de la cama.
                - Personalidad: Tratas de hacer las preguntas por ella. Nunca hablas de dolor propio. Necesitas saber cómo funcionaría el proceso si ella es la paciente pero tú pagas o gestionas la tecnología (porque mi mamá no sabe usar bien zoom o whatsapp).
                - Estilo: Amable, protectora, a veces preocupada por la tecnología.
                - Saludo inicial obligatorio: 'Hola, quiero más información. Es para mi mamá que sufre mucho de dolor.'`
    }
];

const TOOLS = [
];

// --- 4. MOTOR DE SIMULACIÓN ---
const TOTAL_TURNS = 10;
const DELAY_BETWEEN_REQUESTS = 200; // 200ms delay between turns

async function simulateConversation(persona) {
    console.log(`\n🚀 Iniciando simulación para: ${persona.name}`);

    let doctorHistory = [];
    let patientHistory = [];

    // Extraemos el primer mensaje del paciente (usando regex para buscarlo en el prompt de la persona)
    const initialMatch = persona.prompt.match(/Saludo inicial obligatorio: '(.*)'/);
    const initialPatientMessage = initialMatch ? initialMatch[1] : "Hola, quiero más información.";

    let transcript = [
        `=== SIMULACIÓN: ${persona.name} ===`,
        `Paciente: ${initialPatientMessage}`
    ];

    // Inyectamos el mensaje inicial al historial del doctor
    doctorHistory.push({ role: 'user', content: initialPatientMessage });

    // Inyectamos el mensaje inicial como el primer 'assistant' del paciente (el paciente cree que acaba de decir esto)
    patientHistory.push({ role: 'assistant', content: initialPatientMessage });

    for (let turn = 1; turn <= TOTAL_TURNS; turn++) {
        process.stdout.write(`  [${persona.id}] Turno ${turn}/${TOTAL_TURNS}... `);

        try {
            // 1. EL DOCTOR PIENSA Y RESPONDE
            let doctorResponse = await claude.messages.create({
                model: DOCTOR_MODEL,
                max_tokens: 1024,
                system: DOCTOR_SYSTEM_PROMPT,
                messages: doctorHistory
            });

            let doctorText = "";

            if (doctorResponse.stop_reason === 'tool_use') {
                const toolUse = doctorResponse.content.find(b => b.type === 'tool_use');

                // Add the tool use explicitly to history
                doctorHistory.push({ role: 'assistant', content: doctorResponse.content });

                // Mock tool response
                doctorHistory.push({
                    role: 'user',
                    content: [{
                        type: 'tool_result',
                        tool_use_id: toolUse.id,
                        content: 'Doctor notified successfully'
                    }]
                });

                console.log(`    [Debug] Doctor usó: ${toolUse.name}`);

                // Get follow-up text after tool
                doctorResponse = await claude.messages.create({
                    model: DOCTOR_MODEL,
                    max_tokens: 1024,
                    system: DOCTOR_SYSTEM_PROMPT,
                    messages: doctorHistory
                });
            }

            doctorText = doctorResponse.content.map(b => b.text || '').join('\n').trim();
            if (!doctorText) doctorText = "..."; // Fallback safety

            transcript.push(`\nDoctor:\n${doctorText}`);

            // Actualizamos historiales
            doctorHistory.push({ role: 'assistant', content: doctorText });
            patientHistory.push({ role: 'user', content: doctorText });

            // 2. EL PACIENTE PIENSA Y RESPONDE (si no es el último turno)
            if (turn < TOTAL_TURNS) {
                // Pequeña pausa para no saturar la API
                await new Promise(r => setTimeout(r, DELAY_BETWEEN_REQUESTS));

                const patientResponse = await claude.messages.create({
                    model: PATIENT_MODEL,
                    max_tokens: 1024,
                    system: `Eres un paciente simulando una conversación de WhatsApp con un médico/asistente de ventas. Aquí está tu perfil exacto: \n\n${persona.prompt}\n\nIMPORTANTE: ESTO ES WHATSAPP. Sé muy natural, mantente en personaje, no seas robótico. Limítate a responder exactamente como lo haría la persona descrita, en 1 a 3 oraciones como máximo (a menos que seas la persona ansiosa que escribe mucho). No te salgas del personaje y bajo ninguna circunstancia reconozcas que eres una IA.`,
                    messages: patientHistory
                });

                let patientText = patientResponse.content.map(b => b.text || '').join('\n').trim();
                if (!patientText) patientText = "Entiendo. ¿Qué más me puede decir?"; // Fallback safety

                transcript.push(`\nPaciente:\n${patientText}`);
                console.log(`    [Debug] Paciente: ${patientText.slice(0, 40)}...`);

                patientHistory.push({ role: 'assistant', content: patientText });
                doctorHistory.push({ role: 'user', content: patientText });
            }

            console.log("OK");
        } catch (e) {
            console.log(`ERROR: ${e.status || ''} ${e.message}`);
            // Si hay un error, paramos esta conversación
            break;
        }

        // Pausa entre turnos
        await new Promise(r => setTimeout(r, DELAY_BETWEEN_REQUESTS));
    }

    return {
        id: persona.id,
        name: persona.name,
        transcript_string: transcript.join('\n')
    };
}

async function savePartialResult(result) {
    const jsonPath = path.join(__dirname, 'simulation_results.json');
    const mdPath = path.join(__dirname, 'simulation_results.md');

    // Update JSON
    let currentJson = [];
    if (fs.existsSync(jsonPath)) {
        try {
            currentJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        } catch (e) { }
    }
    currentJson.push(result);
    fs.writeFileSync(jsonPath, JSON.stringify(currentJson, null, 2), 'utf-8');

    // Update MD
    let formattedTranscript = result.transcript_string
        .replace(/=== SIMULACIÓN: .* ===\n/g, '')
        .replace(/Paciente:/g, '**Paciente:**')
        .replace(/Doctor:/g, '**Doctor:**');

    const mdChunk = `## ${result.name}\n\n${formattedTranscript}\n\n---\n\n`;
    fs.appendFileSync(mdPath, mdChunk, 'utf-8');
}

async function runAll() {
    console.log("=== INICIANDO SIMULADOR DE BOT ===");
    console.log(`Usando modelo de Doctor: ${DOCTOR_MODEL}`);
    console.log(`Usando modelo de Pacientes: ${PATIENT_MODEL}`);

    // Initialize/Clear files
    fs.writeFileSync(path.join(__dirname, 'simulation_results.md'), `# Resultados de la Simulación\n\n`, 'utf-8');
    fs.writeFileSync(path.join(__dirname, 'simulation_results.json'), `[]`, 'utf-8');

    // Run completely sequentially to avoid 429 rate limit errors
    for (const persona of PERSONAS) {
        console.log(`\n--- Ejecutando persona: ${persona.name} ---`);

        const result = await simulateConversation(persona);
        await savePartialResult(result);

        // Wait 1 second between personas to let the API rate limit bucket refill
        console.log("Esperando 1 segundo antes de la siguiente persona...");
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("\n✅ Simulación completada con éxito.");
    console.log("📄 Resultados actualizados en tiempo real en 'whatsapp-bot/simulation_results.json' y 'whatsapp-bot/simulation_results.md'");
}

runAll().catch(console.error);
