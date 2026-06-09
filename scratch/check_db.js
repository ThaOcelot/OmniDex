import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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

async function check(id) {
  const d = await getDoc(doc(db, "games", String(id)));
  if (d.exists()) {
    console.log(`\n=== Gioco ${id} ===`);
    console.log("Title:", d.data().title);
    console.log("_aiGenerated:", d.data()._aiGenerated);
    console.log("DescriptionRaw length:", d.data().descriptionRaw?.length);
    console.log("Plot:", d.data().plot);
  }
}

async function main() {
  await check(952);
  await check(10073);
  process.exit(0);
}
main();
