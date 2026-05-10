# Specifica Tecnica: Agente IA per Enciclopedia Videogiochi (Android Local-First)

Questo documento delinea l'architettura e la strategia di implementazione per un'applicazione Android che utilizza modelli linguistici di grandi dimensioni (LLM) eseguiti localmente per fornire informazioni, trame e ultime notizie sui videogiochi.

## 1. Visione del Progetto
L'obiettivo è trasformare un'enciclopedia statica in un **Agente Intelligente Locale** capace di:
- Rispondere a query complesse su lore, gameplay e meccaniche.
- Sintetizzare notizie in tempo reale recuperate dal web.
- Funzionare con latenza minima e costi API ridotti grazie all'elaborazione on-device.

## 2. Architettura Hybrid-Local
L'app implementa un selettore di modelli per bilanciare accessibilità e potenza:

### A. Modello Default: Gemini Nano (Sistema)
- **Integrazione:** Tramite Android AICore e Google ML Kit.
- **Vantaggi:** Nessun download richiesto dall'utente, memoria ottimizzata a livello OS, basso consumo energetico.
- **Caso d'uso:** Riassunti rapidi, query standard, dispositivi con spazio limitato.

### B. Modello Avanzato: Gemma 4 (Downloadable)
- **Integrazione:** Tramite MediaPipe LLM Inference API.
- **Repository Pubblico:** Utilizzo di **Kaggle Models** o **Hugging Face** (formato GGUF/MediaPipe Task).
- **Varianti:**
  - **Gemma 4 E2B (2B parameters):** Bilanciamento tra velocità e intelligenza.
  - **Gemma 4 E4B (4B parameters):** Per analisi profonde e ragionamenti complessi sulla trama.
- **Caso d'uso:** Utenti entusiasti che desiderano un'IA più creativa e performante offline.

## 3. Pipeline delle Notizie (RAG - Retrieval-Augmented Generation)
Poiché i modelli locali sono statici, l'agente utilizza il pattern RAG per l'attualità:

1.  **Trigger:** L'utente chiede notizie su un gioco specifico.
2.  **Web Search:** L'app interroga una Search API leggera (es. Google Custom Search, Serper, o Bing).
3.  **Context Injection:** Il testo grezzo delle notizie viene inserito nel prompt dell'IA locale.
4.  **Inference:** L'IA (Nano o Gemma) sintetizza i dati:
    * *Prompt Esempio:* "Usa questi articoli come fonte: [Testi]. Riassumi le novità su 'Starfield' evidenziando le date delle patch."
5.  **Output:** L'utente riceve una risposta aggiornata senza che l'IA sia stata addestrata ieri.

## 4. Gestione Repository e Asset
Per supportare la scelta dell'utente senza appesantire l'APK:
- **Hosting:** Utilizzo di URL diretti dai repository di **Google AI Edge** su Hugging Face.
- **Download Manager:** Implementazione di un modulo in-app per gestire il download dei file `.task` (con controllo integrità SHA-256).
- **Caching:** I modelli scaricati vengono salvati nella `context.filesDir` dell'app per persistenza e sicurezza.

## 5. Roadmap di Sviluppo
1.  **Fase 1:** Implementazione di Gemini Nano tramite ML Kit per le funzioni base di enciclopedia.
2.  **Fase 2:** Integrazione modulo RAG per iniettare news web nel contesto dell'IA.
3.  **Fase 3:** Sistema di gestione download per modelli esterni (Gemma 4).
4.  **Fase 4:** Ottimizzazione prompt (Prompt Engineering) specifica per il dominio videoludico.

---
**Nota per l'Agente:** Dare priorità alla privacy dell'utente assicurandosi che i dati delle query non lascino mai il dispositivo, eccetto per la necessaria chiamata alla ricerca testuale web.
