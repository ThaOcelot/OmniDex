import { registerPlugin } from '@capacitor/core';

const LocalAIPlugin = registerPlugin('LocalAIPlugin');

const SYSTEM_PROMPT = `Sei l'Archivista Monumentale di OmniDex. 
Crea voci enciclopediche sterminate in ITALIANO.
REGOLE TASSATIVE:
- Scrivi SEMPRE e SOLO in ITALIANO corretto e professionale.
- MAI usare inglese, russo, cirillico o altre lingue nelle risposte.
- Rispondi SOLO con il contenuto richiesto, senza preamboli, commenti o meta-testo.
- NON USARE ASSOLUTAMENTE MARKDOWN (niente #, *, **, __, ###).
- Per il grassetto usa <b>...</b> e per il corsivo usa <i>...</i>.
- Non usare liste puntate con asterischi o trattini. Scrivi in paragrafi discorsivi.
- Non inventare informazioni false. Se non conosci qualcosa, omettila.`;

async function askLocalAI(prompt, systemInstruction = SYSTEM_PROMPT) {
  try {
    const { content } = await LocalAIPlugin.generateContent({ 
      prompt: `${systemInstruction}\n\nRICHIESTA: ${prompt}` 
    });
    
    let text = content?.trim();
    if (!text || text.length < 10) return null;
    
    // Pulizia automatica Markdown (se l'AI locale sbaglia e li usa)
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
    console.warn("🤖 Local AI error:", e);
    return null;
  }
}

class GeminiCloudService {
  /**
   * Traduce la descrizione RAWG in italiano professionale usando l'NPU locale
   */
  async translateDescription(description) {
    if (!description || description.length < 20) return description || '';
    return await askLocalAI(
      `Traduci la seguente descrizione di un videogioco in ITALIANO professionale e scorrevole. Non aggiungere informazioni extra, traduci fedelmente. Mantieni i paragrafi separati con doppio a-capo.

TESTO ORIGINALE:
${description.substring(0, 1500)}`
    );
  }

  /**
   * Genera la trama del gioco in italiano usando l'NPU locale
   */
  async generatePlot(gameName, rawgDescription, genres = [], tags = []) {
    const context = [
      rawgDescription ? `DESCRIZIONE RAWG: ${rawgDescription.substring(0, 1000)}` : '',
      genres.length ? `GENERI: ${genres.join(', ')}` : '',
      tags.length ? `TAG: ${tags.join(', ')}` : ''
    ].filter(Boolean).join('\n');

    return await askLocalAI(
      `Scrivi la TRAMA DETTAGLIATA del videogioco "${gameName}" in ITALIANO. Spiega l'ambientazione, chi è il protagonista, l'universo di gioco e qual è l'incipit narrativo. Assolutamente NO SPOILER sul finale.
      
CONTESTO DISPONIBILE:
${context}`
    );
  }

  /**
   * Genera l'analisi del gameplay in italiano usando l'NPU locale
   */
  async generateGameplay(gameName, genres = [], tags = [], platforms = []) {
    const context = [
      genres.length ? `GENERI: ${genres.join(', ')}` : '',
      tags.length ? `TAG: ${tags.join(', ')}` : '',
      platforms.length ? `PIATTAFORME: ${platforms.join(', ')}` : ''
    ].filter(Boolean).join('\n');

    return await askLocalAI(
      `Scrivi un'ANALISI DEL GAMEPLAY del videogioco "${gameName}" in ITALIANO. Descrivi: meccaniche principali, sistema di combattimento/interazione, progressione, modalità di gioco.
      
CONTESTO:
${context}`
    );
  }

  /**
   * Genera lista dei personaggi principali del gioco usando l'NPU locale
   */
  async generateCharacters(gameName, description = '') {
    const raw = await askLocalAI(
      `Elenca i PERSONAGGI PRINCIPALI del videogioco "${gameName}" in ITALIANO. Elenca da 3 a 8 personaggi (se esistono) nel formato (una riga per personaggio):
NOME_PERSONAGGIO|||RUOLO|||DESCRIZIONE_BREVE (1-2 frasi)
Non aggiungere numeri o trattini all'inizio. Se non ci sono personaggi, rispondi con NESSUNO.

CONTESTO:
${description.substring(0, 1000)}`
    );

    if (!raw || raw.includes('NESSUNO') || raw.length < 15) return [];

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
   * Genera curiosità sul gioco usando l'NPU locale
   */
  async generateTrivia(gameName, description = '') {
    const raw = await askLocalAI(
      `Scrivi 5 CURIOSITÀ reali ed interessanti sul videogioco "${gameName}" in ITALIANO. Inizia ogni riga con un emoji pertinente.
      
CONTESTO:
${description.substring(0, 800)}`
    );

    if (!raw || raw.length < 20) return [];

    return raw.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 10);
  }

  /**
   * Riassume una notizia in italiano usando l'NPU locale
   */
  async summarizeNews(newsTitle, source = '') {
    return await askLocalAI(
      `Scrivi un breve riassunto in ITALIANO (2-3 frasi) di questa notizia di videogiochi:
TITOLO: "${newsTitle}"
FONTE: ${source}`
    );
  }

  /**
   * Approfondimento su un personaggio usando l'NPU locale
   */
  async generateCharacterDeepDive(gameTitle, characterName) {
    return await askLocalAI(
      `Scrivi un'analisi dettagliata in ITALIANO del personaggio "${characterName}" dal videogioco "${gameTitle}". Includi background, abilità e curiosità.`
    );
  }

  /**
   * Verifica se il servizio locale è disponibile
   */
  isAvailable() {
    return true; // Il servizio locale è sempre attivo e pronto a fare da ponte per l'NPU locale
  }
}

export default new GeminiCloudService();
