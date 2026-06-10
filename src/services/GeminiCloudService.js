import FirebaseService from "./FirebaseService";
import IAPService from './IAPService';

// Chiamata AI usando il modello corretto per il tier (Pro se Ultra, Flash altrimenti)
async function askGemini(prompt) {
  return askGeminiInternal(prompt, false);
}

// Chiamata AI che usa SEMPRE Flash indipendentemente dal tier (per chiamate minori)
async function askGeminiFlash(prompt) {
  return askGeminiInternal(prompt, true);
}

async function askGeminiInternal(prompt, forceFlash = false) {
  const tier = IAPService.getTier();
  
  const { httpsCallable } = await import("firebase/functions");
  const functionsInstance = await FirebaseService.getFunctionsInstance();
  const getGeminiResponse = httpsCallable(functionsInstance, "getGeminiResponse");
  
  const modelLabel = forceFlash ? 'Flash' : (tier === 'ultra' ? 'Pro💮' : 'Flash');
  console.log(`🤖 Gemini [${modelLabel}] chiamato (Backend Cloud Function)`);

  try {
    const payload = { prompt, tier, forceFlash };
    if (forceFlash && typeof forceFlash === 'object' && forceFlash.imageBase64) {
      // Usiamo il secondo parametro come oggetto opzioni se contiene un'immagine
      payload.imageBase64 = forceFlash.imageBase64;
      payload.forceFlash = false;
    }
    const response = await getGeminiResponse(payload);
    return response.data.text;
  } catch (e) {
    console.error(`🤖 Gemini Backend Error:`, e);
    return null;
  }
}

class GeminiCloudService {

  /**
   * Traduce la descrizione RAWG in italiano professionale
   */
  async translateDescription(description) {
    if (!description || description.length < 20) return description || '';

    // Parole ESCLUSIVAMENTE italiane (non esistono in inglese)
    // Usare una regex che conta solo token inequivocabilmente italiani
    const strictItalianTokens = /\b(degli|delle|dello|nell|nella|nelle|negli|dell|dal|dalla|dai|dalle|dal|agli|alla|alle|allo|questo|questa|questi|queste|quello|quella|quelli|quelle|viene|vengono|sono|hanno|anche|però|perché|perciò|quindi|oppure|mentre|quando|dove|come|ogni|molto|poco|subito|sempre|mai|ancora|già|proprio|davvero|invece|dopo|prima|durante|attraverso|verso|oltre|insieme|contro|lungo|circa|quasi|senza|grazie|spesso|inoltre|tuttavia|sebbene|affinché|nonostante|qualsiasi|chiunque|ovunque|nessuno|qualcosa|qualcuno)\b/gi;
    const matches = (description.match(strictItalianTokens) || []).length;

    // Se ci sono almeno 5 parole inequivocabilmente italiane, è già in italiano
    if (matches >= 5) {
      console.log(`🔤 Testo già in italiano (${matches} token IT), salto traduzione`);
      return description;
    }

    return await askGeminiFlash(
      `Traduci la seguente descrizione di un videogioco in ITALIANO professionale, naturale e scorrevole.
REGOLE TASSATIVE:
- DEVI scrivere interamente ed esclusivamente in LINGUA ITALIANA.
- È VIETATO lasciare frasi o paragrafi in inglese.
- Non aggiungere opinioni personali, mantieni intatto il significato originale.
- Mantieni i paragrafi separati con doppio a-capo.
- DIVIETO ASSOLUTO DI PREAMBOLI: NON scrivere "Ecco la traduzione", "Certamente", "Risposta:", ecc. Restituisci SOLO ED ESCLUSIVAMENTE il testo puro tradotto.

TESTO DA TRADURRE:
${description.substring(0, 3000)}

RICORDA: LA TUA RISPOSTA DEVE ESSERE IN ITALIANO.`
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

ISTRUZIONI TASSATIVE:
- DEVI scrivere l'intera trama esclusivamente in LINGUA ITALIANA.
- Minimo 400 parole, massimo 900 parole.
- Descrivi l'ambientazione, il protagonista, l'universo di gioco e l'incipit narrativo.
- Usa paragrafi ben strutturati, separati da doppio a-capo.
- NON rivelare il finale (no spoiler).
- Se il gioco non ha una trama lineare (sandbox, sportivo, puzzle), descrivi l'atmosfera, il contesto e l'esperienza narrativa.
- DIVIETO ASSOLUTO DI PREAMBOLI E CONCLUSIONI: NON scrivere frasi come "Ecco la trama:", "In sintesi", "Spero ti piaccia". Restituisci SOLO il testo puro.
- FONDAMENTALE: assicurati che il testo sia SEMPRE completo e non si interrompa mai a metà frase. Termina sempre con un punto fermo.

CONTESTO DISPONIBILE:
${context}

ATTENZIONE: IL TESTO GENERATO DEVE ESSERE IN ITALIANO.`
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

    // Chiamata MINORE → sempre Flash
    return await askGeminiFlash(
      `Scrivi un'analisi approfondita del GAMEPLAY del videogioco "${gameName}" in ITALIANO.

ISTRUZIONI TASSATIVE:
- DEVI scrivere ESCLUSIVAMENTE in lingua ITALIANA. Non usare testo in inglese.
- Minimo 300 parole, massimo 700 parole.
- Descrivi: meccaniche principali, sistema di combattimento o interazione, progressione del personaggio, modalità di gioco.
- Se è un gioco RPG o GDR, descrivi il sistema di sviluppo statistico o abilità.
- Usa paragrafi separati da doppio a-capo.
- Tono professionale da rivista videoludica italiana.
- DIVIETO ASSOLUTO DI PREAMBOLI E CONCLUSIONI: NON scrivere frasi come "Ecco l'analisi:", "In conclusione", "Il gameplay si divide in". Restituisci SOLO il testo puro.
- FONDAMENTALE: assicurati che il testo sia SEMPRE completo e non si interrompa mai a metà frase. Termina sempre con un punto fermo.

CONTESTO:
${context}

ATTENZIONE: IL TESTO GENERATO DEVE ESSERE IN ITALIANO.`
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
      `Elenca un vasto cast di PERSONAGGI del videogioco "${gameName}" in ITALIANO.

ISTRUZIONI TASSATIVE:
- Includi protagonisti, antagonisti principali, boss, e comprimari importanti (da 5 a 12 personaggi, se esistono nel gioco).
- Per ogni personaggio scrivi ESATTAMENTE in questo formato (una riga per personaggio):
  NOME_PERSONAGGIO|||RUOLO|||DESCRIZIONE_IN_ITALIANO
- RUOLO può essere: Protagonista, Antagonista, Compagno, Personaggio Chiave, Mentore, Alleato, Deuteragonista.
- DESCRIZIONE: 1-2 frasi IN LINGUA ITALIANA con tratti distintivi del personaggio (aspetto, personalità, motivazioni).
- Se il gioco non ha personaggi specifici (Tetris, sportivi puri, puzzle), rispondi SOLO con la parola: NESSUNO
- DIVIETO ASSOLUTO DI PREAMBOLI E CONCLUSIONI: Inizia direttamente a elencare i personaggi. NON scrivere "Ecco i personaggi:", "Certamente", "Di seguito l'elenco". Restituisci SOLO ED ESCLUSIVAMENTE il formato richiesto.

CONTESTO:
${context}

ATTENZIONE: LE DESCRIZIONI DEVONO ESSERE RIGOROSAMENTE IN LINGUA ITALIANA.`
    );

    if (!raw || raw.includes('NESSUNO') || raw.length < 20) return [];

    try {
      const parsed = [];
      const lines = raw.split('\n').map(line => line.trim()).filter(Boolean);
      
      for (let line of lines) {
        if (line.includes('|||')) {
          const [name, role, ...descParts] = line.split('|||');
          parsed.push({
            name: name?.trim().replace(/^[\d.*\-–—]+\s*/, '') || '',
            role: role?.trim() || 'Personaggio',
            description: descParts.join('|||').trim() || ''
          });
        } else {
          // Parser di riserva ultra-resiliente per formati alternativi generati dall'IA
          let name = '';
          let role = 'Personaggio';
          let description = '';
          
          // Rimuove numeri iniziali come "1. " o "- " o "• "
          let cleanLine = line.replace(/^[\d.*\-–—•]+\s*/, '');
          
          if (cleanLine.includes(':')) {
            const parts = cleanLine.split(':');
            const leftSide = parts[0].trim();
            description = parts.slice(1).join(':').trim();
            
            if (leftSide.includes('(') && leftSide.includes(')')) {
              const roleMatch = leftSide.match(/\(([^)]+)\)/);
              if (roleMatch) {
                role = roleMatch[1].trim();
                name = leftSide.replace(/\([^)]+\)/, '').trim();
              }
            } else if (leftSide.includes('-')) {
              const subParts = leftSide.split('-');
              name = subParts[0].trim();
              role = subParts[1].trim();
            } else {
              name = leftSide;
            }
          } else if (cleanLine.includes(' - ')) {
            const parts = cleanLine.split(' - ');
            if (parts.length >= 3) {
              name = parts[0].trim();
              role = parts[1].trim();
              description = parts.slice(2).join(' - ').trim();
            } else if (parts.length === 2) {
              name = parts[0].trim();
              description = parts[1].trim();
            }
          }
          
          if (name && description && name.length > 1 && description.length > 5) {
            parsed.push({ 
              name: name.replace(/^[\d.*\-–—•]+\s*/, '').trim(), 
              role: role.trim(), 
              description: description.trim() 
            });
          }
        }
      }
      return parsed;
    } catch (e) {
      console.warn("⚠️ Fallimento nel parsing dei personaggi:", e);
      return [];
    }
  }

  /**
   * Genera curiosità sul gioco in italiano
   */
  async generateTrivia(gameName, description = '') {
    // Chiamata MINORE → sempre Flash
    const raw = await askGeminiFlash(
      `Scrivi 5 CURIOSITÀ interessanti sul videogioco "${gameName}" in ITALIANO.

ISTRUZIONI TASSATIVE:
- Scrivi ESCLUSIVAMENTE in lingua ITALIANA. Niente inglese.
- SE IL GIOCO NON È ANCORA USCITO O NON HAI INFO: INVENTA, IPOTIZZA in modo creativo basandoti sul titolo e sul genere, oppure racconta le indiscrezioni/aspettative del pubblico.
- NON SCRIVERE MAI "non ho trovato informazioni", "mi dispiace", "come intelligenza artificiale" o scuse simili. Compila SEMPRE 5 punti interessanti, anche se devi usare l'immaginazione per le feature attese.
- Usa il formato: "• [titolo breve]: [spiegazione]"
- La spiegazione per ogni curiosità deve essere di 1-2 frasi.
- DIVIETO ASSOLUTO DI PREAMBOLI E CONCLUSIONI: Inizia direttamente con la prima curiosità ("• [titolo]: ..."). NON scrivere "Ecco 5 curiosità:", "Certamente".

CONTESTO:
${description.substring(0, 1000)}

ATTENZIONE: LE CURIOSITÀ DEVONO ESSERE RIGOROSAMENTE IN LINGUA ITALIANA E PRESENTI IN OGNI CASO.`
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
    return await askGeminiFlash(
      `Scrivi un riassunto in ITALIANO (3-4 frasi) di questa notizia di videogiochi.

REGOLE TASSATIVE:
- DEVI scrivere ESCLUSIVAMENTE in lingua ITALIANA. Niente inglese.
- È SEVERAMENTE VIETATO limitarsi a ricopiare il titolo. 
- Devi inventare/estrapolare un breve articolo di news verosimile basandoti sul titolo fornito.
- Spiega in modo chiaro e giornalistico cosa è successo o cosa è stato annunciato.

TITOLO DELLA NOTIZIA: "${newsTitle}"
LINK/FONTE: ${source || 'Sconosciuta'}

ATTENZIONE: IL TESTO GENERATO DEVE ESSERE IN ITALIANO E NON DEVE ESSERE UNA COPIA DEL TITOLO.`
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
- Minimo 200 parole.
- DIVIETO ASSOLUTO DI PREAMBOLI E CONCLUSIONI: NON scrivere frasi come "Ecco l'analisi:", "Certamente", "Ecco la traduzione". Inizia direttamente con il primo paragrafo.`
    );
  }

  /**
   * Sommelier dei Videogiochi (Ricerca Conversazionale AI)
   */
  async recommendGames(query) {
    const raw = await askGemini(
      `Sei il "Sommelier dei Videogiochi", un esperto consigliere. L'utente ti fa una richiesta discorsiva su cosa vorrebbe giocare.
Trova 3 o 4 videogiochi reali e specifici che soddisfino perfettamente la richiesta.

RICHIESTA UTENTE: "${query}"

ISTRUZIONI TASSATIVE:
- Restituisci ESCLUSIVAMENTE un array JSON valido in questo formato esatto, senza backtick o formattazione markdown. Solo il JSON nudo e crudo:
[
  {"title": "Nome del gioco 1", "reason": "Motivazione in italiano di max 2 frasi sul perché è perfetto."},
  {"title": "Nome del gioco 2", "reason": "Motivazione in italiano di max 2 frasi sul perché è perfetto."}
]
- Usa titoli di giochi esistenti e corretti.`
    );
    
    if (!raw) return [];
    try {
      const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("🤖 Errore nel parsing dei consigli:", e);
      return [];
    }
  }

  /**
   * Matchmaker AI (Analisi di Compatibilità)
   */
  async analyzeCompatibility(gameTitle, gameDescription, userFavorites) {
    const context = userFavorites.map(g => g.title).join(', ');
    const raw = await askGemini(
      `Sei un analista di videogiochi. Valuta la compatibilità tra i gusti dell'utente e un nuovo gioco.
GIOCHI PREFERITI DELL'UTENTE: ${context}
NUOVO GIOCO DA VALUTARE: ${gameTitle}
DESCRIZIONE NUOVO GIOCO: ${gameDescription ? gameDescription.substring(0, 1000) : 'Sconosciuta'}

ISTRUZIONI TASSATIVE:
- Restituisci ESCLUSIVAMENTE un oggetto JSON valido in questo formato esatto, senza markdown o testo extra:
{
  "score": 85, 
  "reason": "Motivazione in italiano (circa 30-40 parole) che spiega perché piacerà o non piacerà basandosi sui preferiti."
}
- "score" è un numero da 0 a 100.`
    );

    if (!raw) return { score: 50, reason: "Impossibile calcolare l'affinità al momento." };
    try {
      const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("🤖 Errore nel parsing della compatibilità:", e);
      return { score: 50, reason: "Calcolo della compatibilità fallito." };
    }
  }

  /**
   * Recap Saga (Riassunto Precedenti)
   */
  async summarizePreviousGames(gameTitle) {
    return await askGemini(
      `L'utente sta guardando la pagina del gioco "${gameTitle}".
Racconta un riassunto dei capitoli precedenti di questa saga videoludica per prepararlo a giocare questo titolo, SENZA fare spoiler sul gioco "${gameTitle}" stesso.
Se è il primo gioco della saga o non ha prequel, spiega brevemente il contesto dell'universo narrativo in cui si svolge.

ISTRUZIONI TASSATIVE:
- Scrivi ESCLUSIVAMENTE in LINGUA ITALIANA. Niente inglese.
- Circa 150-250 parole.
- Usa <b>...</b> per evidenziare i nomi. Nessun markdown con asterischi.
- Paragrafi discorsivi separati da doppio a-capo.

ATTENZIONE: IL TESTO GENERATO DEVE ESSERE IN ITALIANO.`
    );
  }

  /**
   * Genera un'enciclopedia completa su un personaggio.
   */
  async getCharacterProfile(characterName) {
    const raw = await askGemini(
      `Sei un'enciclopedia videoludica esperta. L'utente ha cercato il personaggio: "${characterName}".
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

ATTENZIONE: TUTTI I CAMPI TESTUALI DEL JSON DEVONO ESSERE IN LINGUA ITALIANA.`
    );

    if (!raw) return null;
    try {
      const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("🤖 Errore nel parsing del profilo personaggio:", e);
      return null;
    }
  }

  /**
   * Verifica se il servizio è disponibile
   */
  isAvailable() {
    return true;
  }
  /**
   * OmniLens (Testuale): Risolve un problema di gameplay basandosi sulla descrizione dell'utente
   */
  async solveGameplayText(gameName, situation) {
    return await askGeminiInternal(
      `Sei la "Guida Strategica Suprema" di OmniDex, un espertissimo conoscitore di videogiochi. 
Un utente ti chiede aiuto per il seguente gioco: "${gameName}".
Il problema o la situazione in cui si trova è questa: "${situation}".

Il tuo compito è fornire la SOLUZIONE ESATTA o un suggerimento pratico per fargli superare questo ostacolo.

Fornisci la tua risposta in ITALIANO seguendo questo formato (usa i doppi a-capo per separare le sezioni):

1) <b>SITUAZIONE IDENTIFICATA:</b> [Riassumi brevemente l'enigma o l'ostacolo di cui sta parlando l'utente, dimostrando che hai capito esattamente in quale punto del gioco si trova]

2) <b>SOLUZIONE / CONSIGLIO:</b> [Spiega passo dopo passo cosa deve fare per superare l'ostacolo. Sii chiaro e preciso]

REGOLE TASSATIVE:
- Scrivi solo in ITALIANO.
- NESSUN PREAMBOLO. Inizia immediatamente con "1) <b>SITUAZIONE IDENTIFICATA:</b>".
- Evita spoiler enormi non richiesti (risolvi solo l'enigma richiesto).`
    );
  }
}

export default new GeminiCloudService();
