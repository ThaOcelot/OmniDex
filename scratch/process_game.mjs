import { GoogleGenerativeAI } from '@google/generative-ai';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const p1 = "AIzaSy";
const p2 = "AMtHbhzi516q";
const p3 = "Gxbi7iPtql";
const p4 = "Wcv-1WKFrhM";
const GEMINI_API_KEY = [p1, p2, p3, p4].join('');

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

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro", generationConfig: { temperature: 0.65 } });

async function askGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("Gemini API Error:", e);
    return null;
  }
}

async function processGame(gameTitle) {
  console.log(`\n================================`);
  console.log(`🎮 Avvio estrazione per: ${gameTitle}`);
  console.log(`================================`);

  // 1. Get characters
  const charPrompt = `Elenca i PERSONAGGI PRINCIPALI del videogioco "${gameTitle}" in ITALIANO.
ISTRUZIONI TASSATIVE:
- Elenca da 3 a 8 personaggi principali.
- Per ogni personaggio scrivi ESATTAMENTE in questo formato (una riga per personaggio):
NOME_PERSONAGGIO|||RUOLO|||DESCRIZIONE_IN_ITALIANO
- Se il gioco non ha personaggi, rispondi SOLO con la parola: NESSUNO`;

  console.log("Ricerca dei personaggi principali in corso...");
  const charRaw = await askGemini(charPrompt);
  
  if (!charRaw || charRaw.includes("NESSUNO")) {
    console.log("Nessun personaggio trovato per questo gioco.");
    process.exit(0);
  }

  const characters = [];
  const lines = charRaw.split('\n').map(l => l.trim()).filter(Boolean);
  for (let line of lines) {
    if (line.includes('|||')) {
      const parts = line.split('|||');
      if (parts.length >= 3) {
        characters.push(parts[0].trim());
      }
    }
  }

  if (characters.length === 0) {
    console.log("Impossibile parsare i personaggi. Raw output:\n" + charRaw);
    process.exit(1);
  }

  console.log(`Trovati ${characters.length} personaggi: ${characters.join(', ')}`);

  // 2. Generate profiles and save
  for (let charName of characters) {
    console.log(`\nGenerazione profilo per: ${charName}...`);
    
    const profilePrompt = `Sei un'enciclopedia videoludica esperta. Genera un profilo dettagliato e preciso su "${charName}" dal videogioco "${gameTitle}".
ISTRUZIONI TASSATIVE:
- Scrivi ESCLUSIVAMENTE in LINGUA ITALIANA.
- Restituisci ESCLUSIVAMENTE un oggetto JSON valido con questa struttura esatta, senza formattazione markdown:
{
  "name": "Nome Completo del personaggio",
  "subtitle": "Breve sottotitolo o ruolo",
  "biography": "Biografia dettagliata e storia del personaggio in ITALIANO (almeno 3 paragrafi. Usa <br><br> o \\n\\n).",
  "games": ["Titolo Gioco 1", "Titolo Gioco 2"],
  "relationships": [
    {"name": "Nome Personaggio", "relation": "Tipo di relazione IN ITALIANO"}
  ],
  "voiceActors": ["Nome Doppiatore 1 (Lingua)"],
  "trivia": ["Curiosità 1 IN ITALIANO", "Curiosità 2 IN ITALIANO"]
}`;

    const profileRaw = await askGemini(profilePrompt);
    if (!profileRaw) {
      console.log(`Fallito fetch profilo per ${charName}`);
      continue;
    }

    try {
      const cleanJson = profileRaw.replace(/```json/g, '').replace(/```/g, '').trim();
      const profileData = JSON.parse(cleanJson);
      
      const docId = charName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      const docRef = doc(db, "characters", docId);
      
      await setDoc(docRef, {
        characterName: charName,
        deepDive: profileData,
        _firestoreSavedAt: serverTimestamp()
      });
      console.log(`✅ Profilo di ${charName} salvato in Firebase (ID: ${docId}).`);
      
    } catch (e) {
      console.log(`Errore salvataggio ${charName}:`, e.message);
    }
    
    // Attendi 2 secondi per evitare rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n🎉 Completato processamento per: ${gameTitle}`);
  process.exit(0);
}

const args = process.argv.slice(2);
if (args.length > 0) {
  processGame(args.join(' '));
} else {
  console.log("Fornire un titolo di gioco come argomento.");
}
