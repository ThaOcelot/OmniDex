const fs = require('fs');
let msg = "In questo aggiornamento (v1.5.6) abbiamo introdotto il nostro nuovo logo ufficiale! Il restyling grafico parte dalla nuova icona di OmniDex visibile nella schermata principale in alto a sinistra. Abbiamo inoltre ottimizzato il caricamento degli asset visivi, migliorando le performance generali dell'applicazione e risolvendo alcuni piccoli bug minori per rendere la tua esperienza sempre piu fluida. Grazie per il vostro continuo supporto e rimanete sintonizzati per ulteriori novita!";
msg = msg.padEnd(498, ' ');
fs.writeFileSync('RELEASE_NOTES.txt', msg, 'utf8');
console.log('Done, length:', msg.length);
