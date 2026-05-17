import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const SYSTEM_INSTRUCTION = `Sei l'Archivista di OmniDex, un'enciclopedia italiana di videogiochi.
REGOLE TASSATIVE:
- Scrivi SEMPRE e SOLO in ITALIANO corretto e professionale.
- MAI usare inglese, russo, cirillico o altre lingue straniere nel testo.
- Rispondi SOLO con il contenuto richiesto, senza preamboli, commenti o meta-testo.
- NON USARE MARKDOWN (niente #, *, **, __, ###, trattini come elenchi).
- Per il grassetto usa <b>...</b> e per il corsivo usa <i>...</i>.
- Scrivi in paragrafi discorsivi separati da doppio a-capo.
- Non inventare informazioni false o non verificabili. Se non conosci qualcosa, omettila.
- Usa un tono enciclopedico, preciso e coinvolgente.`;

let model = null;

function getModel() {
  if (!genAI) {
    console.warn('⚠️ Gemini API key non configurata');
    return null;
  }
  if (!model) {
    model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 2048,
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

      // Protezione anti-cirillico / lingue straniere
      if (/[А-Яа-яЁё]{5,}/.test(text)) return null;

      // Pulizia automatica Markdown (nel caso il modello li usi comunque)
      text = text
        .replace(/^#{1,6}\s+/gm, '')                // Rimuove titoli #
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')      // **bold** → <b>
        .replace(/__(.*?)__/g, '<b>$1</b>')           // __bold__ → <b>
        .replace(/\*(.*?)\*/g, '<i>$1</i>')           // *italic* → <i>
        .replace(/_(.*?)_/g, '<i>$1</i>')             // _italic_ → <i>
        .replace(/^\s*[\*\-]\s+/gm, '• ')             // Liste * o - → •
        .replace(/\*/g, '')
        .replace(/#/g, '');

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

    // Se è già quasi tutta in italiano, non tradurre
    const italianWords = /\b(il|la|lo|le|gli|di|da|in|con|su|per|tra|fra|del|della|dei|degli|delle|un|una|uno|che|è|si|non|ha|ho|sono|essere)\b/gi;
    const matches = (description.match(italianWords) || []).length;
    if (matches > 10) return description; // già in italiano

    return await askGemini(
      `Traduci la seguente descrizione di un videogioco in ITALIANO professionale e scorrevole.
Non aggiungere informazioni extra, non togliere nulla: traduci fedelmente tutto il testo.
Mantieni i paragrafi separati con doppio a-capo.

TESTO DA TRADURRE:
${description.substring(0, 3000)}`
    );
  }

  /**
   * Genera la trama del gioco in italiano, arricchita da Wikipedia
   */
  async generatePlot(gameName, rawgDescription, genres = [], tags = [], wikiContent = '') {
    const context = [
      rawgDescription ? `DESCRIZIONE UFFICIALE: ${rawgDescription.substring(0, 2000)}` : '',
      wikiContent ? `FONTE WIKIPEDIA ITALIANA: ${wikiContent.substring(0, 2000)}` : '',
      genres.length ? `GENERI: ${genres.join(', ')}` : '',
      tags.length ? `TAG RILEVANTI: ${tags.slice(0, 10).join(', ')}` : ''
    ].filter(Boolean).join('\n\n');

    return await askGemini(
      `Scrivi la TRAMA DETTAGLIATA del videogioco "${gameName}" in ITALIANO.

ISTRUZIONI:
- Minimo 300 parole, massimo 600 parole.
- Descrivi l'ambientazione, il protagonista, l'universo di gioco e l'incipit narrativo.
- Usa paragrafi ben strutturati, separati da doppio a-capo.
- NON rivelare il finale (no spoiler).
- Se il gioco non ha una trama lineare (sandbox, sportivo, puzzle), descrivi l'atmosfera, il contesto e l'esperienza narrativa.
- Se il contesto è insufficiente, usa le tue conoscenze sul gioco per completare la descrizione.
- Assicurati che il testo sia completo e non si interrompa a metà frase.

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
      tags.length ? `TAG RILEVANTI: ${tags.slice(0, 12).join(', ')}` : '',
      platforms.length ? `PIATTAFORME: ${platforms.join(', ')}` : ''
    ].filter(Boolean).join('\n');

    return await askGemini(
      `Scrivi un'analisi del GAMEPLAY del videogioco "${gameName}" in ITALIANO.

ISTRUZIONI:
- Minimo 200 parole, massimo 450 parole.
- Descrivi: meccaniche principali, sistema di combattimento o interazione, progressione del personaggio, modalità di gioco.
- Se è un gioco multiplayer, descrivi le modalità competitive e cooperative.
- Se è un gioco di ruolo, descrivi il sistema di sviluppo del personaggio.
- Usa paragrafi separati da doppio a-capo.
- Tono professionale da rivista videoludica italiana.
- Se il contesto è insufficiente, usa le tue conoscenze sul gioco.

CONTESTO:
${context}`
    );
  }

  /**
   * Genera lista dei personaggi principali del gioco
   * Usa Wikipedia per identificare i personaggi reali del gioco
   */
  async generateCharacters(gameName, description = '', wikiContent = '') {
    const context = [
      description ? `DESCRIZIONE: ${description.substring(0, 1500)}` : '',
      wikiContent ? `WIKIPEDIA: ${wikiContent.substring(0, 1500)}` : ''
    ].filter(Boolean).join('\n\n');

    const raw = await askGemini(
      `Elenca i PERSONAGGI PRINCIPALI del videogioco "${gameName}" in ITALIANO.

ISTRUZIONI:
- Elenca da 3 a 8 personaggi principali (se esistono nel gioco).
- Per ogni personaggio scrivi ESATTAMENTE in questo formato (una riga per personaggio):
  NOME_PERSONAGGIO|||RUOLO|||DESCRIZIONE_IN_ITALIANO
- RUOLO può essere: Protagonista, Antagonista, Compagno, Personaggio Chiave, Mentore, Alleato, Deuteragonista.
- DESCRIZIONE: 1-2 frasi in italiano con tratti distintivi del personaggio (aspetto, personalità, motivazioni).
- Se il gioco non ha personaggi specifici (Tetris, giochi astratti, sportivi puri), rispondi SOLO con la parola: NESSUNO
- NON aggiungere numerazione, trattini o altri formati oltre a quello indicato.

CONTESTO:
${context}`
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
   * Genera curiosità sul gioco in italiano
   */
  async generateTrivia(gameName, description = '') {
    const raw = await askGemini(
      `Scrivi 5 CURIOSITÀ interessanti e verificabili sul videogioco "${gameName}" in ITALIANO.

ISTRUZIONI:
- Ogni curiosità su una riga separata.
- Inizia ogni riga con un emoji pertinente.
- Fatti reali: sviluppo del gioco, record di vendite, easter egg noti, impatto culturale, aneddoti storici.
- Non inventare fatti falsi o non verificabili.
- 1-2 frasi per curiosità, scritte in italiano corretto.
- Se non hai abbastanza curiosità verificabili, scrivi solo quelle che conosci.

CONTESTO:
${description.substring(0, 1000)}`
    );

    if (!raw || raw.length < 30) return [];

    return raw.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 15);
  }

  /**
   * Riassume una notizia di videogiochi in italiano
   */
  async summarizeNews(newsTitle, source = '') {
    return await askGemini(
      `Scrivi un riassunto in ITALIANO (3-4 frasi) di questa notizia di videogiochi.
Spiega di cosa tratta in modo chiaro e informativo.
Se il titolo è in inglese, traducilo e riassumi in italiano.
Se non hai informazioni sufficienti, fai un riassunto plausibile basato sul titolo.

TITOLO: "${newsTitle}"
FONTE: ${source || 'Sconosciuta'}`
    );
  }

  /**
   * Analisi approfondita di un personaggio
   */
  async generateCharacterDeepDive(gameTitle, characterName) {
    return await askGemini(
      `Scrivi un'analisi dettagliata in ITALIANO del personaggio <b>${characterName}</b> dal videogioco <b>${gameTitle}</b>.

STRUTTURA (paragrafi separati da doppio a-capo):
1. Presentazione e background del personaggio
2. Personalità e tratti distintivi
3. Ruolo nella trama e nelle vicende del gioco
4. Abilità, poteri o equipaggiamento caratteristici
5. Curiosità e impatto culturale del personaggio

REGOLE DI FORMATTAZIONE:
- NON usare markdown (niente asterischi o cancelletti).
- Usa <b>...</b> per evidenziare nomi importanti.
- Scrivi in paragrafi discorsivi.
- Minimo 200 parole.`
    );
  }

  /**
   * Verifica se il servizio è disponibile
   */
  isAvailable() {
    return !!genAI;
  }
}

export default new GeminiCloudService();
