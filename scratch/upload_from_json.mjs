import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

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

async function uploadCharacters() {
  try {
    let rawData = fs.readFileSync('personaggi.json.txt', 'utf8');
    rawData = rawData.replace(/"name": "Hal "Otacon" Emmerich"/g, '"name": "Hal \\"Otacon\\" Emmerich"');
    rawData = rawData.replace(/"name": "Victor "Sully" Sullivan"/g, '"name": "Victor \\"Sully\\" Sullivan"');
    rawData = rawData.replace(/"name": "Samuel "Sam" Drake"/g, '"name": "Samuel \\"Sam\\" Drake"');
    // Pulizia del JSON in caso Gemini abbia inserito blocchi markdown all'inizio o alla fine
    const cleanData = rawData.replace(/```json/g, '').replace(/```/g, '').trim();
    const characters = JSON.parse(cleanData);
    
    console.log(`Inizio upload di ${characters.length} personaggi da personaggi.json...`);
    
    for (const char of characters) {
      if (!char.name) continue;
      const docId = char.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      await setDoc(doc(db, "characters", docId), {
        characterName: char.name,
        deepDive: char,
        _firestoreSavedAt: serverTimestamp()
      });
      console.log(`✅ ${char.name} salvato in Firestore (docId: ${docId})`);
    }
    
    console.log("Upload Completato con successo!");
  } catch (error) {
    console.error("Errore durante l'upload o il parsing del file:", error);
  }
  process.exit(0);
}

uploadCharacters();
