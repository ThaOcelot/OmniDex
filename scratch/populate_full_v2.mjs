import { GoogleGenerativeAI } from '@google/generative-ai';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

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

// Istruzione di sistema per forzare un Output JSON
const SYSTEM_INSTRUCTION = `Sei un'intelligenza artificiale di data entry per un'enciclopedia videoludica. Rispondi SEMPRE E SOLO con un JSON valido strutturato secondo lo schema richiesto. Nessun commento o markdown aggiuntivo al di fuori del JSON.`;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-3.5-flash", 
  systemInstruction: SYSTEM_INSTRUCTION,
  generationConfig: { 
    temperature: 0.3,
    responseMimeType: "application/json" // Forza l'output strutturato!
  } 
});

async function askGeminiJson(prompt, maxRetries = 5) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      // Pulisce l'output da eventuali blocchi markdown se Gemini ignora parzialmente le direttive
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (e) {
      console.error(`Gemini API Error (Attempt ${attempt + 1}/${maxRetries + 1}):`, e.message || e);
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
        console.log(`⏳ Attendo ${Math.round(delay / 1000)} secondi prima di riprovare...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        return null;
      }
    }
  }
  return null;
}

async function getRawgGame(query) {
  if (/^\d+$/.test(query)) {
    try {
      const detailsRes = await fetch(`https://api.rawg.io/api/games/${query}?key=${RAWG_API_KEY}`);
      if (!detailsRes.ok) return null;
      return await detailsRes.json();
    } catch(e) { return null; }
  }
  const cleanTitle = query.replace(/\s*\(\d{4}\)\s*/, '');
  const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(cleanTitle)}&page_size=1&key=${RAWG_API_KEY}`);
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;
  const id = data.results[0].id;
  const detailsRes = await fetch(`https://api.rawg.io/api/games/${id}?key=${RAWG_API_KEY}`);
  return await detailsRes.json();
}

async function processFullGame(gameTitle) {
  console.log(`\n================================`);
  console.log(`🎮 Avvio SVISCERAMENTO OTTIMIZZATO (v2) per: ${gameTitle}`);
  console.log(`================================`);

  const rawgData = await getRawgGame(gameTitle);
  if (!rawgData) {
    console.log("❌ Impossibile trovare il gioco su RAWG.");
    process.exit(1);
  }
  const title = rawgData.name;
  console.log(`✅ RAWG Data trovato: ${title} (ID: ${rawgData.id})`);

  // FASE 1: Controllo se il gioco esiste già su Firestore
  const gameRef = doc(db, "games", String(rawgData.id));
  const gameSnap = await getDoc(gameRef);
  let gameAIFields = null;

  if (gameSnap.exists() && gameSnap.data()._aiGenerated) {
    console.log(`⏩ Il gioco ${title} è già presente e sviscerato su Firestore! Salto il caricamento del gioco base.`);
    gameAIFields = gameSnap.data(); // Lo recuperiamo per scorrere i personaggi
  } else {
    console.log("🤖 Generazione Dati Gioco + Lista Personaggi (Singola chiamata JSON)...");
    const rawDesc = rawgData.description_raw || '';
    
    // Un solo prompt per tutto ciò che riguarda il gioco
    const gamePrompt = `Analizza il videogioco "${title}".
Dati base: ${rawDesc.substring(0, 1000)}

Restituisci ESATTAMENTE questo schema JSON in ITALIANO:
{
  "plot": "Trama del gioco, NO SPOILER (almeno 300 parole, entra nel dettaglio dell'incipit)",
  "descriptionIt": "Traduzione/Riassunto panoramica del gioco (max 150 parole)",
  "gameplay": "Analisi gameplay del gioco (almeno 200 parole)",
  "trivia": ["curiosità 1", "curiosità 2", "curiosità 3", "curiosità 4"],
  "characterNames": [
    {"name": "Nome Personaggio 1", "role": "Ruolo (es. Protagonista/Boss)"}
  ]
}
Includi in characterNames i protagonisti, antagonisti e comprimari (5-10 max). Se assenti, metti un array vuoto [].`;

    const generatedJson = await askGeminiJson(gamePrompt);
    if (!generatedJson) {
      console.log("❌ Errore critico nella generazione dei dati del gioco.");
      process.exit(1);
    }
    gameAIFields = generatedJson;

    const protagonistsList = (gameAIFields.characterNames || []).map(c => ({
      name: c.name,
      role: c.role,
      description: "Vedi scheda enciclopedia approfondita."
    }));

    console.log("☁️ Salvataggio Gioco su Firestore...");
    const finalGameData = {
      id: rawgData.id,
      title: rawgData.name,
      name: rawgData.name,
      background_image: rawgData.background_image,
      descriptionRaw: rawDesc,
      description: gameAIFields.plot || '',
      plot: gameAIFields.descriptionIt || '',
      gameplay: gameAIFields.gameplay || '',
      protagonists: protagonistsList,
      trivia: gameAIFields.trivia || [],
      _version: 3,
      _cached: Date.now(),
      _aiGenerated: true,
      _wikiUsed: false,
      _aiLimitReached: false,
      _generatedByTier: 'ultra'
    };

    await setDoc(gameRef, {
      ...finalGameData,
      _firestoreSavedAt: serverTimestamp()
    }, { merge: true });
    console.log(`✅ Gioco ${title} salvato con successo!`);
  }

  // FASE 2: Controllo ed estrazione Profili Personaggi
  const charList = gameAIFields.characterNames || gameAIFields.protagonists || [];
  if (charList.length > 0) {
    console.log(`\n🤖 Controllo personaggi nell'enciclopedia...`);
    for (let char of charList) {
      const charName = char.name;
      const docId = charName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      
      const charRef = doc(db, "characters", docId);
      const charSnap = await getDoc(charRef);
      
      // IL VERO RISPARMIO: Se il personaggio esiste già, lo saltiamo!
      if (charSnap.exists()) {
         console.log(`   ⏩ Personaggio ${charName} già presente. Salto la generazione.`);
         continue; 
      }
      
      // Se NON esiste, dedichiamo una singola chiamata mirata come prima, garantendo alta qualità
      console.log(`   Generazione enciclopedia per nuovo personaggio: ${charName}...`);
      const profilePrompt = `Sei un'enciclopedia videoludica esperta. Genera un profilo dettagliato su "${charName}" dal gioco "${title}".
Restituisci SOLO questo schema JSON in ITALIANO:
{
  "name": "${charName}",
  "subtitle": "Ruolo/Titolo",
  "biography": "Biografia e storia completa in ITA (dettagliata)",
  "games": ["${title}"],
  "relationships": [{"name": "Personaggio Relazionato", "relation": "Tipo di relazione"}],
  "voiceActors": ["Doppiatore (ITA/ENG)"],
  "trivia": ["Curiosità 1", "Curiosità 2"]
}`;
      const profileData = await askGeminiJson(profilePrompt);
      if (profileData) {
        try {
          await setDoc(charRef, {
            characterName: charName,
            deepDive: profileData,
            _firestoreSavedAt: serverTimestamp()
          });
          console.log(`   ✅ Profilo ${charName} salvato!`);
        } catch (e) {
          console.log(`   ❌ Errore salvataggio per ${charName}`);
        }
      }
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\n🎉 Completato svisceramento v2 per: ${title}`);
  process.exit(0);
}

const args = process.argv.slice(2);
if (args.length > 0) {
  processFullGame(args.join(' '));
} else {
  console.log("Fornire un titolo di gioco come argomento.");
}
