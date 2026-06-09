# CHANGELOG

## [1.6.0] - 2026-06-07
### Added
- Pre-fetch in background per i giochi del **Release Radar**: i dettagli completi dei titoli dei prossimi 6 mesi vengono pre-scaricati e salvati automaticamente in Firestore in formato grezzo per velocizzare il caricamento successivo.
- Raggruppamento mensile nel **Release Radar**: i giochi in uscita sono ora organizzati ordinatamente per mese e anno, arricchiti da intestazioni grafiche premium e micro-animazioni dinamiche (hover effect con scorrimento e glow dei bordi).

### Changed
- Aggiornata la versione dell'app a `1.6.0` (versionCode `36`).
- Ottimizzazione caricamento: se un gioco è già pre-fetchato in Firestore, il sistema carica i dettagli da lì evitando chiamate ridondanti alle API di RAWG, riducendo l'uso dei limiti di quota e azzerando i tempi di attesa per l'utente.

## [1.5.9] - 2026-06-06
### Added
- Introdotto il vero Tema AMOLED (nero assoluto) per ottimizzare i display OLED.
- Nuovo Layout della Home con i pulsanti 'Gioco del Giorno' e 'Calendario Uscite'.
- Introdotto il sistema di Gradi Utente nei Quiz (da Novellino a Sommelier).
- Implementata l'opzione per richiedere le Notifiche Push.

### Fixed
- Risolto il problema che impediva l'apertura delle impostazioni di sistema per l'esecuzione in background.
- Ottimizzati i pagamenti In-App per Play Console (aggiornamento automatico dei prezzi e definizione piattaforma in fase di registrazione).

## [1.5.8] - 2026-06-06
### Added
- Aggiunti 150 nuovi quiz a tema videoludico (totale 200 quiz).
- Inserita sezione "Acquisti In-App" e abbonamenti (Pro/Ultra) nella Privacy Policy.
- Menzione del tema AMOLED nella Privacy Policy.

### Changed
- Modificata la logica dei Quiz: rimossa la rotazione settimanale (ora la progressione è continua e casuale senza vincoli di tempo).
- Aggiornata la dicitura della Privacy Policy e la data di aggiornamento.
- Versione app aggiornata a 1.5.8 (Version Code 33).


## [1.5.4] - 2026-06-05
### Changed
- Aggiornata la versione dell'app a 1.5.4 (versionCode 29).
- Bloccato l'exploit della web simulation per gli acquisti in-app che permetteva di sbloccare i tier Pro e Ultra gratuitamente.
- Sostituito il logo vecchio dell'app con il nuovo in tutti gli asset (Navbar, Splash Screen, icone Android, PWA e web preview).
- Sistemato un bypass dell'abbonamento Ultra: ora l'accesso ai dettagli dei personaggi Ã¨ correttamente bloccato anche quando vi si accede dalla scheda di un gioco (GameDetails) o direttamente, se l'utente non possiede l'abbonamento Ultra.

## [1.5.5] - 2026-06-06
### Fixed
- In questo aggiornamento (v1.5.5 - versionCode 30) abbiamo migliorato la sicurezza dell'app bloccando un bypass non autorizzato legato all'icona della coroncina nelle impostazioni. L'accesso ai piani OmniDex Pro e Ultra è ora garantito solo a chi sottoscrive regolarmente un abbonamento. La sicurezza e l'integrità del servizio sono la nostra priorità. Continuiamo a lavorare costantemente per offrirvi un'esperienza ottimale, stabile e priva di difetti. Grazie per scegliere la nostra app!

## [1.5.6] - 2026-06-06
### Changed
- Aggiornata la versione dell'app a 1.5.6 (versionCode 31).
- In questo aggiornamento (v1.5.6) abbiamo introdotto il nostro nuovo logo ufficiale! Il restyling grafico parte dalla nuova icona di OmniDex visibile nella schermata principale in alto a sinistra. Abbiamo inoltre ottimizzato il caricamento degli asset visivi, migliorando le performance generali dell'applicazione e risolvendo alcuni piccoli bug minori per rendere la tua esperienza sempre piu fluida. Grazie per il vostro continuo supporto e rimanete sintonizzati per ulteriori novita!

## [1.5.7] - 2026-06-06
### Changed
- Aggiornata la versione dell'app a 1.5.7 (versionCode 32).
- In questo aggiornamento (v1.5.7) abbiamo introdotto il supporto totale ai display AMOLED con la nuova modalità a risparmio energetico dedicata! Abbiamo inoltre sistemato i problemi di contrasto dei colori nella modalità chiara per garantirti la massima leggibilità. Infine, abbiamo ottimizzato la gestione in background: ora le impostazioni batteria si apriranno correttamente per non farti perdere nessuna notifica. Grazie per il continuo supporto e buon divertimento con OmniDex!
