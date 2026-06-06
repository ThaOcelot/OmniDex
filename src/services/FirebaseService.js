import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, increment, initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCSNlFH72VJtcfZkrxdtjmqfLqfzMfZOU8",
  authDomain: "omnidex-a751d.firebaseapp.com",
  projectId: "omnidex-a751d",
  storageBucket: "omnidex-a751d.firebasestorage.app",
  messagingSenderId: "1037711572342",
  appId: "1:1037711572342:web:4fdef9acd99e2b45fd0e57"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { localCache: persistentLocalCache() });

class FirebaseService {
  /**
   * Recupera un gioco dalla cache globale (Firestore)
   */
  async getGameFromCache(gameId) {
    try {
      const docRef = doc(db, "games", String(gameId));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("☁️ Recuperato da Firestore Global Cache:", gameId);
        return docSnap.data();
      }
      return null;
    } catch (e) {
      console.warn("Firebase Read Error:", e);
      return null;
    }
  }

  /**
   * Salva un gioco nella cache globale (Firestore).
   * Il campo `_generatedByTier` ('free' | 'pro' | 'ultra') permette a GameService
   * di decidere se rigenerare il contenuto con un modello migliore (es. Ultra).
   */
  async saveGameToCache(gameId, data) {
    try {
      const docRef = doc(db, "games", String(gameId));
      
      // Firebase odia i valori "undefined". Li rimuoviamo prima di salvare.
      const sanitizedData = JSON.parse(JSON.stringify(data));
      
      await setDoc(docRef, {
        ...sanitizedData,
        _firestoreSavedAt: serverTimestamp()
      }, { merge: true });
      console.log("☁️ Salvato in Firestore Global Cache:", gameId);
    } catch (e) {
      console.warn("Firebase Write Error:", e);
    }
  }

  /**
   * Recupera il Deep Dive di un personaggio
   */
  async getGlobalCharacter(characterName) {
    try {
      const docId = characterName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      const docRef = doc(db, "characters", docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("☁️ Personaggio recuperato da Firestore:", docId);
        return docSnap.data().deepDive;
      }
      return null;
    } catch (e) {
      console.warn("Firebase Read Error:", e);
      return null;
    }
  }

  /**
   * Salva il Deep Dive di un personaggio
   */
  async saveGlobalCharacter(characterName, deepDiveData) {
    try {
      const docId = characterName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      const docRef = doc(db, "characters", docId);
      await setDoc(docRef, {
        characterName,
        deepDive: deepDiveData,
        _firestoreSavedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("Firebase Write Error:", e);
    }
  }

  /**
   * Recupera i voti dei personaggi per un gioco
   */
  async getCharacterVotes(gameId) {
    try {
      const docRef = doc(db, "character_votes", String(gameId));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return { votes: {}, totalVotes: 0 };
    } catch (e) {
      console.warn("Firebase Read Error (Votes):", e);
      return { votes: {}, totalVotes: 0 };
    }
  }

  async voteCharacter(gameId, newCharacter, oldCharacter = null) {
    try {
      const docRef = doc(db, "character_votes", String(gameId));
      const votesUpdate = { [newCharacter]: increment(1) };
      if (oldCharacter) {
        votesUpdate[oldCharacter] = increment(-1);
      }
      
      const payload = { votes: votesUpdate };
      if (!oldCharacter) {
        payload.totalVotes = increment(1);
      }

      await setDoc(docRef, payload, { merge: true });
      console.log("☁️ Voto registrato per:", newCharacter);
      return true;
    } catch (e) {
      console.warn("Firebase Write Error (Votes):", e);
      return false;
    }
  }
}

export default new FirebaseService();
