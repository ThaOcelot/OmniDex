import { GoogleGenerativeAI } from '@google/generative-ai';
const p1 = "AIzaSy";
const p2 = "AMtHbhzi516q";
const p3 = "Gxbi7iPtql";
const p4 = "Wcv-1WKFrhM";
const GEMINI_API_KEY = [p1, p2, p3, p4].join('');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-pro", 
  systemInstruction: "Sei un'intelligenza artificiale di data entry. Rispondi SEMPRE E SOLO con il testo puro richiesto, senza preamboli.",
  generationConfig: { temperature: 0.3 }
});

async function run() {
  const charPrompt = `Elenca un vasto cast di PERSONAGGI del videogioco "Resident Evil 7: Biohazard" in ITALIANO.
Includi protagonisti, antagonisti principali, boss, e comprimari importanti (cerca di elencare almeno 5-10 personaggi, se esistono nel gioco).
ISTRUZIONI: Una riga per personaggio, formato: NOME_PERSONAGGIO|||RUOLO|||DESCRIZIONE
Se il gioco non ha personaggi, scrivi: NESSUNO`;

  const res = await model.generateContent(charPrompt);
  console.log(res.response.text());
}
run();
