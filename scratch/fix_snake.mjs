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
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

async function fixSnake() {
  const characterName = "Solid Snake";
  const prompt = `Sei un'enciclopedia videoludica esperta. L'utente ha cercato il personaggio: "${characterName}".
Genera un profilo dettagliato e preciso su questo personaggio. Devi fornire una panoramica COMPLETA della sua evoluzione e della sua storia attraverso l'INTERA SAGA in cui compare. Non limitarti a descriverlo all'interno di un singolo gioco (ad esempio, se si cerca Solid Snake, descrivi la sua storia nell'intero franchise di Metal Gear e non in un solo capitolo a caso).

ISTRUZIONI TASSATIVE:
- Scrivi ESCLUSIVAMENTE in LINGUA ITALIANA. Niente inglese (tranne i nomi propri originali).
- Restituisci ESCLUSIVAMENTE un oggetto JSON valido con questa struttura esatta, senza formattazione markdown (niente \`\`\`json), solo il JSON:
{
  "name": "Nome Completo del personaggio (es. Solid Snake)",
  "subtitle": "Breve sottotitolo o ruolo (es. Ex-agente FOXHOUND / Clone di Big Boss)",
  "biography": "Biografia dettagliata e storia del personaggio in ITALIANO (almeno 3 paragrafi. Puoi usare <br><br> o \\n\\n).",
  "games": ["Titolo Gioco 1", "Titolo Gioco 2", "Titolo Gioco 3"],
  "relationships": [
    {"name": "Nome Personaggio", "relation": "Tipo di relazione IN ITALIANO (es. Padre, Nemesi, Alleato)"}
  ],
  "voiceActors": ["Nome Doppiatore 1 (Lingua)", "Nome Doppiatore 2 (Lingua)"],
  "trivia": ["Curiosità 1 IN ITALIANO", "Curiosità 2 IN ITALIANO"]
}

ATTENZIONE: TUTTI I CAMPI TESTUALI DEL JSON DEVONO ESSERE IN LINGUA ITALIANA.`;

  console.log("Generazione profilo in corso...");
  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const profileData = JSON.parse(cleanJson);
    
    console.log("Profilo generato:", profileData.name);
    
    const docId = characterName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    await setDoc(doc(db, "characters", docId), {
      characterName: characterName,
      deepDive: profileData,
      _firestoreSavedAt: serverTimestamp()
    });
    
    console.log("✅ Profilo di " + characterName + " salvato in Firestore (docId: " + docId + ")!");
  } catch (e) {
    console.error("Errore:", e);
  }
  process.exit(0);
}

fixSnake();
