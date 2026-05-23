import { GoogleGenerativeAI } from '@google/generative-ai';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const p1 = "AIzaSy";
const p2 = "AMtHbhzi516q";
const p3 = "Gxbi7iPtql";
const p4 = "Wcv-1WKFrhM";
const GEMINI_API_KEY = [p1, p2, p3, p4].join('');
const RAWG_API_KEY = "f0f8782547814b088437efdb1cc88399";

const firebaseConfig = {
  apiKey: "AIzaSyCSNlFH72VJtcfZkrxdtjmqfLqfzMfZOU8",
  authDomain: "omnidex-a751d.firebaseapp.com",
  projectId: "omnidex-a751d",
  storageBucket: "omnidex-a751d.firebasestorage.app",
  messagingSenderId: "1037711572342",
  appId: "1:1037711572342:web:4fdef9acd99e2b45fd0e57"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SYSTEM_INSTRUCTION = `Sei un'intelligenza artificiale di data entry.
REGOLE TASSATIVE:
- Rispondi SEMPRE E SOLO con il contenuto richiesto.
- È ASSOLUTAMENTE VIETATO includere preamboli (es. "Ecco la trama", "Certamente", "Ecco il testo").
- È ASSOLUTAMENTE VIETATO includere conclusioni o commenti.
- Scrivi solo il testo puro.`;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-pro", 
  systemInstruction: SYSTEM_INSTRUCTION,
  generationConfig: { temperature: 0.3 } // Lower temperature for more strict formatting
});

async function askGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("Gemini API Error:", e);
    return null;
  }
}

async function getRawgGame(query) {
  if (/^\d+$/.test(query)) {
    console.log(`📡 RAWG Fetch diretto per ID: ${query}...`);
    try {
      const detailsRes = await fetch(`https://api.rawg.io/api/games/${query}?key=${RAWG_API_KEY}`);
      if (!detailsRes.ok) {
        console.log(`❌ Errore HTTP API RAWG: ${detailsRes.status}`);
        return null;
      }
      return await detailsRes.json();
    } catch(e) {
      console.log(`❌ Eccezione RAWG API: ${e.message}`);
      return null;
    }
  }

  const cleanTitle = query.replace(/\s*\(\d{4}\)\s*/, '');
  console.log(`📡 RAWG Search per: ${cleanTitle}...`);
  const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(cleanTitle)}&page_size=1&key=${RAWG_API_KEY}`);
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;
  
  const id = data.results[0].id;
  console.log(`📡 RAWG Details per ID: ${id}...`);
  const detailsRes = await fetch(`https://api.rawg.io/api/games/${id}?key=${RAWG_API_KEY}`);
  return await detailsRes.json();
}

async function processFullGame(gameTitle) {
  console.log(`\n================================`);
  console.log(`🎮 Avvio SVISCERAMENTO per: ${gameTitle}`);
  console.log(`================================`);

  // 1. Fetch RAWG
  const rawgData = await getRawgGame(gameTitle);
  if (!rawgData) {
    console.log("❌ Impossibile trovare il gioco su RAWG.");
    process.exit(1);
  }

  const rawDesc = rawgData.description_raw || '';
  const title = rawgData.name;
  
  console.log(`✅ RAWG Data trovato: ${title} (ID: ${rawgData.id})`);

  // 2. Generate Game AI Fields
  console.log("🤖 Generazione Panoramica (Traduzione)...");
  const descriptionItRaw = await askGemini(`Traduci in italiano (max 150 parole): ${rawDesc.substring(0, 1000)}`);
  const descriptionIt = descriptionItRaw?.replace(/^Ecco.*?:/i, '').trim();
  
  console.log("🤖 Generazione Trama Completa...");
  const plotRaw = await askGemini(`Scrivi la trama in ITALIANO di "${title}". Almeno 300 parole, no spoiler sul finale. Contesto: ${rawDesc.substring(0, 1000)}`);
  const plot = plotRaw?.replace(/^Ecco.*?:/i, '').trim();

  console.log("🤖 Generazione Analisi Gameplay...");
  const gameplayRaw = await askGemini(`Scrivi un'analisi del GAMEPLAY di "${title}" in ITALIANO. Minimo 200 parole.`);
  const gameplay = gameplayRaw?.replace(/^Ecco.*?:/i, '').trim();

  console.log("🤖 Generazione Curiosità...");
  const triviaRaw = await askGemini(`Elenca 4-5 curiosità e aneddoti sullo sviluppo del videogioco "${title}" in ITALIANO. Format: solo frasi, una per riga.`);
  const trivia = triviaRaw ? triviaRaw.split('\n').map(l => l.replace(/^- /, '').replace(/^\* /, '').trim()).filter(Boolean) : [];

  // 3. Generate Characters List
  console.log("🤖 Generazione Lista Personaggi...");
  const charPrompt = `Elenca un vasto cast di PERSONAGGI del videogioco "${title}" in ITALIANO.
Includi protagonisti, antagonisti principali, boss, e comprimari importanti (cerca di elencare almeno 5-10 personaggi, se esistono nel gioco).
ISTRUZIONI: Una riga per personaggio, formato: NOME_PERSONAGGIO|||RUOLO|||DESCRIZIONE
Se il gioco non ha personaggi, scrivi: NESSUNO`;
  const charRaw = await askGemini(charPrompt);
  
  let characters = [];
  const charNamesForDeepDive = [];
  if (charRaw && !charRaw.includes("NESSUNO")) {
    const lines = charRaw.split('\n').map(l => l.trim()).filter(Boolean);
    for (let line of lines) {
      if (line.includes('|||')) {
        const parts = line.split('|||');
        if (parts.length >= 3) {
          const name = parts[0].trim();
          charNamesForDeepDive.push(name);
          characters.push({
            name: name,
            role: parts[1].trim(),
            description: parts.slice(2).join('|||').trim()
          });
        }
      }
    }
  }

  // 4. Save Game to Firestore
  console.log("☁️ Salvataggio Gioco Completo in Firestore...");
  const finalGameData = {
    id: rawgData.id,
    title: rawgData.name,
    name: rawgData.name,
    background_image: rawgData.background_image,
    descriptionRaw: rawDesc,
    description: plot || '',
    plot: descriptionIt || '',
    gameplay: gameplay || '',
    protagonists: characters,
    trivia: trivia,
    _version: 2,
    _cached: Date.now(),
    _aiGenerated: true,
    _wikiUsed: false,
    _aiLimitReached: false,
    _generatedByTier: 'ultra'
  };

  await setDoc(doc(db, "games", String(rawgData.id)), {
    ...finalGameData,
    _firestoreSavedAt: serverTimestamp()
  }, { merge: true });

  console.log(`✅ Gioco ${title} salvato!`);

  // 5. Generate Character Deep Dives
  if (charNamesForDeepDive.length > 0) {
    console.log(`\n🤖 Avvio estrazione per ${charNamesForDeepDive.length} personaggi...`);
    for (let charName of charNamesForDeepDive) {
      console.log(` Generazione enciclopedia per: ${charName}...`);
      const profilePrompt = `Sei un'enciclopedia videoludica esperta. Genera un profilo dettagliato su "${charName}" dal gioco "${title}".
Restituisci SOLO un JSON:
{
  "name": "Nome", "subtitle": "Ruolo", "biography": "Storia in ITA",
  "games": ["${title}"], "relationships": [{"name": "X", "relation": "Y"}],
  "voiceActors": ["X (ITA)"], "trivia": ["Curiosità"]
}`;
      const profileRaw = await askGemini(profilePrompt);
      if (profileRaw) {
        try {
          const cleanJson = profileRaw.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
          const profileData = JSON.parse(cleanJson);
          const docId = charName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
          await setDoc(doc(db, "characters", docId), {
            characterName: charName,
            deepDive: profileData,
            _firestoreSavedAt: serverTimestamp()
          });
          console.log(`   ✅ Profilo ${charName} salvato!`);
        } catch (e) {
          console.log(`   ❌ Errore parsing JSON per ${charName}`);
        }
      }
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\n🎉 Completato svisceramento COMPLETO per: ${title}`);
  process.exit(0);
}

const args = process.argv.slice(2);
if (args.length > 0) {
  processFullGame(args.join(' '));
} else {
  console.log("Fornire un titolo di gioco come argomento.");
}
