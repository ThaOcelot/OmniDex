const fs = require('fs');
let msg = "In questo aggiornamento (v1.5.7) abbiamo introdotto il supporto totale ai display AMOLED con la nuova modalità a risparmio energetico dedicata! Abbiamo inoltre sistemato i problemi di contrasto dei colori nella modalità chiara per garantirti la massima leggibilità. Infine, abbiamo ottimizzato la gestione in background: ora le impostazioni batteria si apriranno correttamente per non farti perdere nessuna notifica. Grazie per il continuo supporto e buon divertimento con OmniDex!";
msg = msg.padEnd(498, ' ');
fs.writeFileSync('RELEASE_NOTES_157.txt', msg, 'utf8');
console.log('Done, length:', msg.length);
