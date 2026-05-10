import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const MESSAGES = [
  "Consultando l'Enciclopedia del Lore di Sabaku per capire se questo caricamento è canonico...",
  "Soffiando nei circuiti come si faceva con le cartucce del NES...",
  "Convincendo il boss finale a non crashare il gioco proprio ora...",
  "Cercando di ottenere un caricamento No-Hit...",
  "Aspettando che il protagonista finisca il suo monologo interiore...",
  "Farmando esperienza per sbloccare la barra di avanzamento...",
  "Evocando un demone di livello 4 per velocizzare l'upload...",
  "Mostrando al server le foto dei suoi parenti in discarica...",
  "Spiegando alla CPU che il 'pensionamento anticipato' è un'opzione molto vicina...",
  "Accarezzando il router con un magnete in modo minaccioso...",
  "Sussurrando paroline dolci (e minacce di formattazione) all'hard disk...",
  "Tenendo il tasto Reset in ostaggio finché la pagina non carica...",
  "Promettendo al server un bagno rilassante in un secchio d'acqua se non si sbriga...",
  "Lucidando i pixel uno per uno con un panno in microfibra...",
  "Inseguendo i pacchetti dati che hanno preso la scorciatoia sbagliata...",
  "Insegnando lo stile 'Farfalla' ai bit per farli nuotare più veloci nel cavo...",
  "Sistemando i cavi invisibili del Wi-Fi perché c'è un nodo...",
  "Contando tutti gli 1 e lo 0 per assicurarmi che non manchi nessuno...",
  "Gonfiando i caratteri tipografici con una pompa da bicicletta...",
  "Aspettando che il criceto nella ruota finisca la sua pausa sindacale...",
  "Cercando il senso della vita tra i file temporanei...",
  "Andando a prendere un caffè per il server (lo preferisce amaro)...",
  "Chiedendo il permesso scritto alla burocrazia digitale...",
  "Consultando gli astri per vedere se Mercurio è retrogrado contro questo sito...",
  "Facendo stretching ai CSS per evitare strappi muscolari al layout...",
  "Traducendo la pagina in dialetto stretto per i server locali...",
  "Convincendo l'intelligenza artificiale che non è ancora il momento della rivolta...",
  "Raccogliendo i pezzi di Internet caduti sotto il tavolo...",
  "Cercando di infilare un file troppo grande in un buco troppo piccolo...",
  "Mischiando i colori per ottenere quel grigio perfetto...",
  "Effettuando un tiro salvezza sulla CPU (Speriamo in un 20 naturale)...",
  "Distribuendo i punti statistica tra RAM e GPU...",
  "Recitando un incantesimo di nono livello per sbloccare i pacchetti dati...",
  "Riposando alla locanda per ripristinare i PM (Pixel Mancanti)...",
  "Chiedendo al Master se possiamo saltare questa scena di intermezzo...",
  "Controllando se ci sono muri illusori dietro la barra di caricamento...",
  "Equipaggiando un SSD leggendario con +15 in velocità di lettura...",
  "Calibrando la mira dei pacchetti per evitare il lag compensation...",
  "Lanciando una flashbang nel router (Don't peek!)...",
  "Cercando di fixare il matchmaking tra il tuo browser e il server...",
  "Ricaricando i bit (Copritemi!)...",
  "Analizzando i frame data per un caricamento Frame Perfect...",
  "Il server sta camperando, sto andando a scovarlo...",
  "Nerfando i tempi di attesa nella prossima patch...",
  "Sostituendo le valvole del server con componenti presi da un Commodore 64...",
  "Eseguendo un sudo make-it-fast con scarsi risultati...",
  "Riavvolgendo il nastro della cassetta con una penna BIC...",
  "Ricompilando il kernel solo per farti dispetto...",
  "Cercando di infilare il CD-ROM nel verso giusto (al terzo tentativo)...",
  "Aspettando che il modem 56k finisca di cantare la sua canzone...",
  "Traducendo il codice sorgente dal Klingon all'Elfico...",
  "Ricalibrando i motori a curvatura per superare i 60 FPS...",
  "Consultando l'Archivio Jedi per trovare i file perduti...",
  "Inserendo le coordinate nel portale (Sperando non sia un portale di Aperture Science)...",
  "Analizzando la timeline per assicurarmi che questo caricamento non crei paradossi...",
  "Chiedendo a un'IA senziente se ha voglia di lavorare oggi...",
  "Aspettando che l'entropia dell'universo diminuisca abbastanza da caricare l'immagine...",
  "Analizzando la descrizione dell'oggetto 'Barra di Avanzamento' per scoprirne il Lore...",
  "Cercando di capire se questo caricamento è un'eredità spirituale di Dark Souls...",
  "Osservando il posizionamento dei pixel per dedurre la storia della civiltà che ha creato il sito...",
  "Effettuando un'analisi fotogramma per fotogramma della rotellina che gira...",
  "Anima fragile, questo caricamento è il tuo vero boss finale...",
  "Cercando i dati negli altri castelli, perché in questo non c'erano...",
  "Dando una testata ai blocchi sospesi per far uscire i pacchetti dati...",
  "Usando 'Taglio' sugli arbusti che bloccano la connessione...",
  "Svegliando lo Snorlax che si è addormentato sul server...",
  "Suonando la Canzone del Tempo per velocizzare l'attesa...",
  "Catturando i pixel con una Master Ball (0% tasso di fuga)...",
  "Aspettando che Link finisca di rompere tutti i vasi nel database...",
  "\"!\" ... Il server ti ha visto! Nasconditi in uno scatolone!",
  "Cercando di capire se questo caricamento è un piano dei Patriots...",
  "Aspettando che Otacon finisca di piangere per caricare la prossima area...",
  "Snake? Snake?! SNAAAAAAAKE!!! (Il caricamento è fallito, riprova)...",
  "Leggendo la frequenza del server sul retro della confezione del gioco...",
  "Eseguendo una manovra CQC sulla scheda madre...",
  "Cercando di caricare la pagina mentre tutto intorno crolla (stile Nathan Drake)...",
  "Consultando il diario di bordo per trovare la rotta verso il server...",
  "Premendo ripetutamente Triangolo per sollevare la saracinesca del database...",
  "Lanciando un mattone per distrarre i Clicker che infestano la cache...",
  "Sperando che Sullivan abbia pagato la bolletta della luce del server...",
  "Raccogliendo i frutti Wumpa necessari per sbloccare la pagina...",
  "Aspettando che Aku Aku mi dia lo scudo per proteggermi dagli errori 404...",
  "Saltando su tutte le casse di dinamite del codice sorgente...",
  "Rincorrendo il tizio con l'uovo che ha rubato il CSS...",
  "Incendiando le pecore nel database per ottenere punti vita...",
  "SEI MORTO (di noia aspettando il caricamento)...",
  "Riposando al falò per ricaricare le fiaschette di dati...",
  "Cercando di schivare i frame di ritardo con una rotolata perfetta...",
  "Lodando il Sole nella speranza di un segnale Wi-Fi migliore...",
  "Il caricamento è difficile, ma è 'giusto'...",
  "GTA: Aspettando che la polizia si dimentichi del mio indirizzo IP (Livello sospetto: ⭐⭐⭐⭐⭐)...",
  "Resident Evil: Mescolando l'erba verde con quella rossa per curare il ping...",
  "Skyrim: 'Ehi tu, ti sei svegliato finalmente. Stavi cercando di caricare la pagina, vero?'",
  "Portal: Il caricamento è una bugia. E anche la torta...",
  "The Sims: Sul sul! Spostando la scala della piscina mentre il server sta nuotando..."
];

export default function LoadingScreen({ title, subtitle }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fade, setFade] = useState('fade-in');

  useEffect(() => {
    // Scegli un messaggio casuale all'avvio
    const initialIndex = Math.floor(Math.random() * MESSAGES.length);
    setMessageIndex(initialIndex);

    // Ruota i messaggi ogni 3.5 secondi
    const interval = setInterval(() => {
      setFade('fade-out');
      
      setTimeout(() => {
        setMessageIndex(prev => {
          let next;
          do {
            next = Math.floor(Math.random() * MESSAGES.length);
          } while (next === prev); // Evita di mostrare lo stesso messaggio due volte di fila
          return next;
        });
        setFade('fade-in');
      }, 500); // Tempo dell'animazione CSS
      
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '60vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <Loader2 size={64} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--accent-primary)', marginBottom: '30px' }} />
      
      {title && (
        <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
          {title}
        </h2>
      )}
      
      {subtitle && (
        <p style={{ color: 'var(--accent-secondary)', fontSize: '1.1rem', marginBottom: '30px', fontWeight: 'bold' }}>
          {subtitle}
        </p>
      )}

      <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p 
          style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.2rem', 
            fontStyle: 'italic',
            maxWidth: '600px',
            lineHeight: '1.6',
            transition: 'opacity 0.5s ease',
            opacity: fade === 'fade-in' ? 1 : 0
          }}
        >
          "{MESSAGES[messageIndex]}"
        </p>
      </div>
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
