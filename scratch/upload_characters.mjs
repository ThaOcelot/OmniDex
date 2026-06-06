import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

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

const characters = [
{
"name": "Big Boss",
"subtitle": "Il più grande soldato del ventesimo secolo",
"biography": "Nato come John e conosciuto inizialmente con il nome in codice Naked Snake, la sua leggenda ha inizio durante la Guerra Fredda, in particolare con l'Operazione Snake Eater nel 1964. Inviato nelle giungle sovietiche per fermare una fazione ribelle e recuperare lo scienziato Sokolov, si ritrova costretto ad affrontare e uccidere il suo mentore, The Boss. Questo tragico evento gli conferisce il titolo di Big Boss, ma segna anche l'inizio della sua profonda disillusione verso i governi che usano i soldati come mere pedine sacrificabili.\n\nNel corso dei decenni successivi, Big Boss si separa dagli Stati Uniti e dai Patriots, un'organizzazione ombra fondata dal suo ex comandante Zero. Crea le proprie forze militari private, prima i Militaires Sans Frontières e successivamente i Diamond Dogs, con l'obiettivo di costruire 'Outer Heaven', un rifugio e una nazione indipendente per i soldati liberi dalle manipolazioni politiche. Questo percorso lo porta però a commettere atrocità, trasformandolo gradualmente in un signore della guerra temuto a livello globale e isolato dalla società.\n\nLa sua caduta finale avviene per mano dei suoi stessi cloni genetici, in particolare Solid Snake, che distrugge le sue roccaforti principali. Sopravvissuto grazie all'animazione sospesa, si risveglia decenni dopo al termine degli eventi di Metal Gear Solid 4. In un ultimo, toccante incontro con un Solid Snake ormai invecchiato, Big Boss fa pace con il figlio e comprende finalmente gli errori del suo passato e la vera volontà pacifista di The Boss, prima di spegnersi definitivamente davanti alla tomba del suo vecchio mentore.",
"games": [
"Metal Gear Solid 3: Snake Eater",
"Metal Gear Solid: Portable Ops",
"Metal Gear Solid: Peace Walker",
"Metal Gear Solid V: Ground Zeroes",
"Metal Gear Solid V: The Phantom Pain",
"Metal Gear",
"Metal Gear 2: Solid Snake",
"Metal Gear Solid 4: Guns of the Patriots"
],
"relationships": [
{
"name": "The Boss",
"relation": "Mentore e figura materna"
},
{
"name": "Major Zero",
"relation": "Ex comandante e acerrimo nemico"
},
{
"name": "Solid Snake",
"relation": "Clone genetico e nemesi finale"
}
],
"voiceActors": [
"David Hayter (Inglese)",
"Kiefer Sutherland (Inglese)",
"Richard Doyle (Inglese)",
"Akio Otsuka (Giapponese)"
],
"trivia": [
"Ha perso l'occhio destro durante l'Operazione Snake Eater nel tentativo di proteggere EVA.",
"La sua idea di 'Outer Heaven' è nata da un'interpretazione errata del testamento spirituale di The Boss, portandolo a credere in un mondo in perenne conflitto."
]
}
];

async function uploadCharacters() {
  console.log("Inizio upload di " + characters.length + " personaggi...");
  for (const char of characters) {
    const docId = char.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    await setDoc(doc(db, "characters", docId), {
      characterName: char.name,
      deepDive: char,
      _firestoreSavedAt: serverTimestamp()
    });
    console.log(`✅ ${char.name} salvato in Firestore (docId: ${docId})`);
  }
  console.log("Completato!");
  process.exit(0);
}

uploadCharacters();
