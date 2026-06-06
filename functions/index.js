const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require("node-fetch");

// Configurazione chiavi sicure (Lato Server)
const GEMINI_API_KEY = "AIzaSyAMtHbhzi516qGxbi7iPtqlWcv-1WKFrhM";
const RAWG_API_KEY = "f0f8782547814b088437efdb1cc88399";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `Sei l'Archivista di OmniDex, un'enciclopedia italiana di videogiochi.
REGOLE TASSATIVE:
- DEVI SCRIVERE SEMPRE E SOLO IN LINGUA ITALIANA.
- È severamente vietato restituire testo in inglese (tranne i nomi propri originali).
- Rispondi SOLO con il contenuto richiesto, senza preamboli, commenti o meta-testo.
- NON USARE MARKDOWN (niente #, *, **, __, ###, trattini come elenchi).
- Per il grassetto usa <b>...</b> e per il corsivo usa <i>...</i>.
- Scrivi in paragrafi discorsivi separati da doppio a-capo.
- Non inventare informazioni false o non verificabili. Se non conosci qualcosa, omettila.
- Usa un tono enciclopedico, preciso e coinvolgente.`;

let modelPro = null;
let modelFlash = null;

function getModel(tier, forceFlash) {
  const useProModel = tier === 'ultra' && !forceFlash;
  
  if (useProModel) {
    if (!modelPro) {
      modelPro = genAI.getGenerativeModel({
        model: 'gemini-2.5-pro',
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: { temperature: 0.65, maxOutputTokens: 8192 }
      });
    }
    return modelPro;
  } else {
    if (!modelFlash) {
      modelFlash = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: { temperature: 0.65, maxOutputTokens: 8192 }
      });
    }
    return modelFlash;
  }
}

exports.getGeminiResponse = onCall(async (request) => {
  const { prompt, tier = 'free', forceFlash = false } = request.data;

  if (!prompt) {
    throw new HttpsError("invalid-argument", "Il parametro 'prompt' è obbligatorio.");
  }

  const model = getModel(tier, forceFlash);
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text()?.trim();
      if (!text || text.length < 15) return { text: null };

      if (/[А-Яа-яЁё]{5,}/.test(text)) return { text: null };

      text = text
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/__(.*?)__/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/_(.*?)_/g, '<i>$1</i>')
        .replace(/^\s*[\*\-]\s+/gm, '• ')
        .replace(/\*/g, '')
        .replace(/#/g, '');

      return { text };
    } catch (e) {
      console.warn(`Gemini attempt ${attempt + 1} failed:`, e.message);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  
  return { text: null };
});

exports.getRawgGames = onCall(async (request) => {
  const { endpoint, params = {} } = request.data;
  
  if (!endpoint) {
    throw new HttpsError("invalid-argument", "Il parametro 'endpoint' è obbligatorio.");
  }

  try {
    const url = new URL(\`https://api.rawg.io/api/\${endpoint}\`);
    url.searchParams.append("key", RAWG_API_KEY);
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
         url.searchParams.append(key, value);
      }
    }

    const response = await fetch(url.toString());
    const data = await response.json();
    
    return { data };
  } catch (error) {
    console.error("RAWG API Error:", error);
    throw new HttpsError("internal", "Errore nella chiamata API a RAWG.");
  }
});
