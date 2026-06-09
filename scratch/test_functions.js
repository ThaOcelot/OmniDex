import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCSNlFH72VJtcfZkrxdtjmqfLqfzMfZOU8",
  authDomain: "omnidex-a751d.firebaseapp.com",
  projectId: "omnidex-a751d",
  storageBucket: "omnidex-a751d.firebasestorage.app",
  messagingSenderId: "1037711572342",
  appId: "1:1037711572342:web:4fdef9acd99e2b45fd0e57"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'europe-west3');

async function test() {
  const getRawgGames = httpsCallable(functions, "getRawgGames");
  try {
    const response = await getRawgGames({ endpoint: "/games", params: { search: "mario", page_size: 2 } });
    console.log("RESPONSE KEYS:", Object.keys(response));
    console.log("RESPONSE.DATA KEYS:", Object.keys(response.data));
    console.log("RESPONSE.DATA.DATA KEYS:", response.data.data ? Object.keys(response.data.data) : 'undefined');
    if (response.data.data) {
        console.log("RESULTS COUNT:", response.data.data.results?.length);
    }
  } catch (e) {
    console.error(e);
  }
}

test();
