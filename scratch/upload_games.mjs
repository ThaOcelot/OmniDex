import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const RAWG_API_KEY = "f0f8782547814b088437efdb1cc88399";

const firebaseConfig = {
  apiKey: "AIzaSyCSNlFH72VJtcfZkrxdtjmqfLqfzMfZOU8",
  authDomain: "omnidex-a751d.firebaseapp.com",
  projectId: "omnidex-a751d",
  storageBucket: "omnidex-a751d.firebasestorage.app",
  messagingSenderId: "1037711572342",
  appId: "1:1037711572342:web:4fdef9acd99e2b45fd0e57"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const games = [
{
"title": "Red Dead Redemption",
"plot": "Red Dead Redemption è un epico western ambientato nel 1911, che segue le vicende di John Marston, un ex fuorilegge costretto dal governo a dare la caccia ai suoi vecchi compagni di banda. Il gioco esplora il tramonto della frontiera americana e la lotta di un uomo per redimere il proprio passato e proteggere ciò che ama, in un mondo in rapida trasformazione dove la legge e l'ordine iniziano a sopraffare la vita selvaggia del West.",
"description": "La narrazione si apre con John Marston, un uomo dal passato violento, che viene prelevato da agenti del Bureau of Investigation. La sua famiglia è stata presa in ostaggio dal governo, che lo costringe a un patto cinico: ottenere la sua libertà e il ricongiungimento con i suoi cari solo dopo aver eliminato i membri della sua ex banda criminale, i Van der Linde. John si trova così costretto ad abbandonare la sua vita di agricoltore per addentrarsi nelle terre selvagge della frontiera, tra Stati Uniti e Messico.\n\nDurante il suo viaggio, il protagonista interagisce con una vasta gamma di personaggi, da sceriffi corrotti a rivoluzionari messicani, in una trama che intreccia temi di tradimento, moralità e la crudeltà insita nella civilizzazione forzata. John deve affrontare il peso delle sue scelte passate mentre cerca di rintracciare i suoi ex alleati, come Bill Williamson e Javier Escuella, giungendo infine allo scontro con il suo mentore, Dutch van der Linde. La storia analizza profondamente la psicologia di un uomo che cerca di sfuggire al proprio destino, sottolineando come le ombre del passato non svaniscano mai veramente, nonostante i tentativi di redenzione personale.\n\nL'ambientazione stessa, il West ormai prossimo alla scomparsa, diventa un personaggio fondamentale. La costruzione del mondo riflette il contrasto tra la brutalità della vita fuorilegge e l'avanzata inesorabile della modernità tecnologica, dei treni e delle leggi federali. Ogni incontro di John è intriso di malinconia, poiché il protagonista comprende che il mondo in cui vive non ha più posto per uomini come lui, indipendentemente dalla moralità delle sue azioni attuali.",
"gameplay": "Red Dead Redemption ha ridefinito il genere open world grazie a un'integrazione magistrale tra narrazione e meccaniche di gioco. Il sistema di shooting si basa sul celebre 'Dead Eye', una meccanica che permette di rallentare il tempo per marcare con precisione i bersagli, riflettendo la maestria di John con la pistola. Questa feature è integrata organicamente nel loop di combattimento, rendendo le sparatorie intense e coreografiche.\n\nIl cuore del gameplay risiede nell'esplorazione dinamica di una mappa vasta e reattiva. L'interazione con l'ambiente è profonda: il sistema di cavalcata, con la gestione del legame con il proprio cavallo, rende il viaggio tra le lande selvagge un elemento centrale piuttosto che un semplice spostamento. La fauna selvatica, dotata di un'intelligenza artificiale avanzata per l'epoca, contribuisce a creare un ecosistema vivo e imprevedibile, dove cacciatori e prede si scambiano i ruoli in modo fluido.\n\nIl level design è sapientemente costruito per incoraggiare sia la curiosità del giocatore, con innumerevoli attività secondarie come cacce al tesoro, duelli e cattura di ricercati, sia una narrazione lineare che spinge avanti la trama principale. L'innovazione principale risiede nell'equilibrio tra libertà totale e rigore narrativo, dove ogni azione del giocatore influisce sulla reputazione di John, modificando il modo in cui il mondo reagisce alla sua presenza.",
"trivia": [
"Il processo di sviluppo è durato oltre cinque anni, con una mole di lavoro che ha coinvolto centinaia di sviluppatori.",
"Il sistema di 'Dead Eye' è stato ispirato dai classici film western di Sergio Leone.",
"Gli attori hanno utilizzato la tecnologia di motion capture per rendere le movenze dei cavalli incredibilmente realistiche.",
"La colonna sonora originale è stata composta mescolando strumenti tradizionali del genere western con elementi moderni per sottolineare la transizione dell'epoca."
],
"protagonists": [
{
"name": "John Marston",
"role": "Protagonista",
"description": "Un ex fuorilegge che cerca di lasciarsi alle spalle la violenza per vivere come agricoltore. È caratterizzato da una profonda ironia, una moralità complessa e un forte senso di lealtà verso la famiglia."
},
{
"name": "Dutch van der Linde",
"role": "Antagonista Principale",
"description": "Mentore di John e leader carismatico della banda dei Van der Linde. Rappresenta l'ideale del fuorilegge anarchico che rifiuta la civilizzazione, finendo però vittima della sua stessa follia."
}
]
}
];

async function getRawgGame(title) {
  const cleanTitle = title.replace(/\s*\(\d{4}\)\s*/, '');
  const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(cleanTitle)}&page_size=1&key=${RAWG_API_KEY}`);
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;
  const id = data.results[0].id;
  const detailsRes = await fetch(`https://api.rawg.io/api/games/${id}?key=${RAWG_API_KEY}`);
  return await detailsRes.json();
}

async function uploadGames() {
  for (const game of games) {
    console.log(`\n📡 Cerco RAWG per: ${game.title}...`);
    const rawgData = await getRawgGame(game.title);
    if (!rawgData) {
      console.log(`❌ Gioco ${game.title} non trovato su RAWG.`);
      continue;
    }
    
    console.log(`✅ RAWG Data trovato: ${rawgData.name} (ID: ${rawgData.id})`);
    
    const finalGameData = {
      id: rawgData.id,
      title: rawgData.name,
      name: rawgData.name,
      background_image: rawgData.background_image,
      descriptionRaw: rawgData.description_raw || '',
      description: game.description,
      plot: game.plot,
      gameplay: game.gameplay,
      protagonists: game.protagonists,
      trivia: game.trivia,
      _version: 2,
      _cached: Date.now(),
      _aiGenerated: true,
      _wikiUsed: false,
      _aiLimitReached: false,
      _generatedByTier: 'ultra'
    };
    
    await setDoc(doc(db, "games", String(rawgData.id)), {
      ...finalGameData,
      _firestoreSavedAt: serverTimestamp()
    }, { merge: true });
    
    console.log(`✅ ${game.title} salvato in Firestore con successo (ID gioco RAWG: ${rawgData.id})!`);
  }
  process.exit(0);
}

uploadGames();
