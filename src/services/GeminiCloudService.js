import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_INSTRUCTION = `Sei l'Archivista di OmniDex, un'enciclopedia di videogiochi.
REGOLE TASSATIVE:
- Scrivi SEMPRE e SOLO in ITALIANO corretto e professionale.
- MAI usare inglese, russo, cirillico o altre lingue.
- Rispondi SOLO con il contenuto richiesto, senza preamboli, commenti o meta-testo.
- NON USARE ASSOLUTAMENTE MARKDOWN (niente #, *, **, __, ###).
- Per il grassetto usa <b>...</b> e per il corsivo usa <i>...</i>.
- Non usare liste puntate con asterischi o trattini. Scrivi in paragrafi discorsivi.
- Non inventare informazioni false. Se non conosci qualcosa, omettila.
- Usa un tono enciclopedico ma coinvolgente.`;

let currentKey = null;
let genAI = null;
let model = null;

function getModel() {
  const activeKey = localStorage.getItem('user_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
  if (!activeKey) {
    console.warn('⚠️ Gemini API key non configurata');
    return null;
  }

  if (activeKey !== currentKey) {
    currentKey = activeKey;
    genAI = new GoogleGenerativeAI(activeKey);
    model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    });
  }
  return model;
}

async function askGemini(prompt, maxRetries = 2) {
  const m = getModel();
  if (!m) return null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await m.generateContent(prompt);
      let text = result.response.text()?.trim();
      if (!text || text.length < 15) return null;
      // Protezione anti-cirillico
      if (/[А-Яа-яЁё]{5,}/.test(text)) return null;

      // Pulizia automatica Markdown (se l'AI sbaglia e li usa)
      text = text
        .replace(/###?\s+/g, '')                  // Rimuove titoli #
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')    // **bold**
        .replace(/__(.*?)__/g, '<b>$1</b>')        // __bold__
        .replace(/\*(.*?)\*/g, '<i>$1</i>')        // *italic*
        .replace(/_(.*?)_/g, '<i>$1</i>')          // _italic_
        .replace(/^\s*[\*]\s+/gm, '• ')           // Converte elenchi puntati * in •
        .replace(/^\s*[\-]\s+/gm, '• ')           // Converte elenchi puntati - in •
        .replace(/\*/g, '')                       // Rimuove eventuali asterischi rimasti
        .replace(/#/g, '');                       // Rimuove eventuali cancelletti rimasti
      
      return text;
    } catch (e) {
      console.warn(`🤖 Gemini attempt ${attempt + 1} failed:`, e.message);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  return null;
}

class GeminiCloudService {

  /**
   * Traduce la descrizione RAWG in italiano professionale
   */
  async translateDescription(description) {
    if (!description || description.length < 20) return description || '';
    return await askGemini(
      `Traduci la seguente descrizione di un videogioco in ITALIANO professionale e scorrevole.
Non aggiungere informazioni extra, traduci fedelmente.
Mantieni i paragrafi separati con doppio a-capo.

TESTO ORIGINALE:
${description.substring(0, 3000)}`
    );
  }

  /**
   * Genera la trama del gioco in italiano
   */
  async generatePlot(gameName, rawgDescription, genres = [], tags = []) {
    const context = [
      rawgDescription ? `DESCRIZIONE RAWG: ${rawgDescription.substring(0, 2000)}` : '',
      genres.length ? `GENERI: ${genres.join(', ')}` : '',
      tags.length ? `TAG: ${tags.join(', ')}` : ''
    ].filter(Boolean).join('\n');

    return await askGemini(
      `Scrivi la TRAMA DETTAGLIATA del videogioco "${gameName}" in ITALIANO.

ISTRUZIONI:
- Sii descrittivo ed esaustivo. Spiega l'ambientazione, chi è il protagonista, l'universo di gioco e qual è l'incipit narrativo.
- Usa paragrafi ben strutturati e distanziati con doppio a-capo.
- Assolutamente NON rivelare il finale (no spoiler).
- Se il gioco non ha una trama lineare (es. sandbox, multiplayer, sportivo), descrivi approfonditamente il contesto narrativo e l'atmosfera.
- Rispondi con un testo lungo e denso di dettagli.
- IMPORTANTE: Assicurati che il racconto sia completo e non si interrompa a metà frase. La narrazione deve avere una conclusione logica (pur senza spoiler).

CONTESTO DISPONIBILE:
${context}`
    );
  }

  /**
   * Genera l'analisi del gameplay in italiano
   */
  async generateGameplay(gameName, genres = [], tags = [], platforms = []) {
    const context = [
      genres.length ? `GENERI: ${genres.join(', ')}` : '',
      tags.length ? `TAG: ${tags.join(', ')}` : '',
      platforms.length ? `PIATTAFORME: ${platforms.join(', ')}` : ''
    ].filter(Boolean).join('\n');

    return await askGemini(
      `Scrivi un'ANALISI DEL GAMEPLAY del videogioco "${gameName}" in ITALIANO.

ISTRUZIONI:
- Minimo 200 parole, massimo 500 parole
- Descrivi: meccaniche principali, sistema di combattimento/interazione, progressione, modalità di gioco
- Se è un multiplayer, descrivi le modalità disponibili
- Usa paragrafi separati da doppio a-capo
- Tono professionale da rivista videoludica

CONTESTO:
${context}`
    );
  }

  /**
   * Genera lista dei personaggi principali del gioco
   * Ritorna un array JSON di personaggi
   */
  async generateCharacters(gameName, description = '') {
    const raw = await askGemini(
      `Elenca i PERSONAGGI PRINCIPALI del videogioco "${gameName}" in ITALIANO.

ISTRUZIONI:
- Elenca da 3 a 8 personaggi principali (se esistono)
- Per ogni personaggio scrivi ESATTAMENTE in questo formato (una riga per personaggio):
  NOME_PERSONAGGIO|||RUOLO|||DESCRIZIONE_BREVE
- RUOLO può essere: Protagonista, Antagonista, Compagno, Personaggio Chiave, Mentore, ecc.
- DESCRIZIONE_BREVE: 1-2 frasi con tratti distintivi del personaggio
- Se il gioco non ha personaggi specifici (es. Tetris, giochi astratti), rispondi SOLO con: NESSUNO
- Non aggiungere numerazione, trattini o altri formati

CONTESTO:
${description.substring(0, 1500)}`
    );

    if (!raw || raw.includes('NESSUNO') || raw.length < 20) return [];

    try {
      return raw.split('\n')
        .map(line => line.trim())
        .filter(line => line.includes('|||'))
        .map(line => {
          const [name, role, ...descParts] = line.split('|||');
          return {
            name: name?.trim().replace(/^[\d.*\-–—]+\s*/, '') || '',
            role: role?.trim() || 'Personaggio',
            description: descParts.join('|||').trim() || ''
          };
        })
        .filter(c => c.name.length > 1 && c.description.length > 5);
    } catch {
      return [];
    }
  }

  /**
   * Genera curiosità sul gioco
   */
  async generateTrivia(gameName, description = '') {
    const raw = await askGemini(
      `Scrivi 5 CURIOSITÀ interessanti sul videogioco "${gameName}" in ITALIANO.

ISTRUZIONI:
- Ogni curiosità su una riga separata
- Inizia ogni riga con un emoji pertinente seguito dal testo
- Fatti reali e verificabili (sviluppo, record, easter egg noti, impatto culturale)
- Non inventare fatti falsi
- 1-2 frasi per curiosità

CONTESTO:
${description.substring(0, 1000)}`
    );

    if (!raw || raw.length < 30) return [];

    return raw.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 15);
  }

  /**
   * Riassume una notizia in italiano
   */
  async summarizeNews(newsTitle, source = '') {
    return await askGemini(
      `Scrivi un breve riassunto in ITALIANO (3-4 frasi) di questa notizia di videogiochi:
TITOLO: "${newsTitle}"
FONTE: ${source}
      
Spiega di cosa tratta la notizia in modo chiaro e informativo.
Se non hai informazioni sufficienti, fai un riassunto basato solo sul titolo.`
    );
  }

  /**
   * Approfondimento su un personaggio
   */
  async generateCharacterDeepDive(gameTitle, characterName) {
    return await askGemini(
      `Sei un esperto di videogiochi. Scrivi un'analisi dettagliata in ITALIANO del personaggio "${characterName}" dal videogioco "${gameTitle}".
      
      ISTRUZIONI TASSATIVE DI FORMATTAZIONE:
      - NON USARE MARKDOWN (niente asterischi *, niente cancelletti #).
      - Se vuoi evidenziare nomi o concetti usa esclusivamente i tag <b>...</b>.
      - Se vuoi usare il corsivo usa <i>...</i>.
      - Scrivi in paragrafi discorsivi.
      - Includi: background, personalità, ruolo nella trama, abilità e curiosità.`
    );
  }

  /**
   * Verifica se il servizio è disponibile
   */
  isAvailable() {
    const activeKey = localStorage.getItem('user_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
    return !!activeKey;
  }
}

export default new GeminiCloudService();
