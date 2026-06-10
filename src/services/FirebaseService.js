let app = null;
let db = null;
let functionsInstance = null;
let initPromise = null;

const initFirebase = async () => {
  if (app) return;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    const { initializeApp } = await import("firebase/app");
    const { initializeFirestore, persistentLocalCache } = await import("firebase/firestore");
    const { getFunctions } = await import("firebase/functions");

    const firebaseConfig = {
      apiKey: "AIzaSyCSNlFH72VJtcfZkrxdtjmqfLqfzMfZOU8",
      authDomain: "omnidex-a751d.firebaseapp.com",
      projectId: "omnidex-a751d",
      storageBucket: "omnidex-a751d.firebasestorage.app",
      messagingSenderId: "1037711572342",
      appId: "1:1037711572342:web:4fdef9acd99e2b45fd0e57"
    };

    app = initializeApp(firebaseConfig);
    db = initializeFirestore(app, { localCache: persistentLocalCache() });
    functionsInstance = getFunctions(app, 'europe-west3');
  })();
  
  await initPromise;
};

class FirebaseService {
  async getFunctionsInstance() {
    await initFirebase();
    return functionsInstance;
  }

  /**
   * Recupera un gioco dalla cache globale (Firestore)
   */
  async getGameFromCache(gameId) {
    try {
      await initFirebase();
      const { doc, getDoc } = await import("firebase/firestore");
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
   */
  async saveGameToCache(gameId, data) {
    try {
      await initFirebase();
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      const docRef = doc(db, "games", String(gameId));
      
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
      await initFirebase();
      const { doc, getDoc } = await import("firebase/firestore");
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
      await initFirebase();
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
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
      await initFirebase();
      const { doc, getDoc } = await import("firebase/firestore");
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
      await initFirebase();
      const { doc, setDoc, increment } = await import("firebase/firestore");
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

  /**
   * Verifica in batch quali ID di gioco esistono già in Firestore
   */
  async checkGamesExistInFirestore(gameIds) {
    const existingIds = new Set();
    if (!gameIds || gameIds.length === 0) return existingIds;
    
    try {
      await initFirebase();
      const { collection, query, where, getDocs, documentId } = await import("firebase/firestore");
      
      // Spezziamo la lista in blocchi di 30 (limite dell'operatore 'in' di Firestore)
      for (let i = 0; i < gameIds.length; i += 30) {
        const chunk = gameIds.slice(i, i + 30).map(String);
        
        const q = query(
          collection(db, "games"),
          where(documentId(), "in", chunk)
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(docSnap => {
          existingIds.add(parseInt(docSnap.id));
        });
      }
    } catch (e) {
      console.warn("Firebase Batch Exist Check Error:", e);
    }
    
    return existingIds;
  }
}

export default new FirebaseService();
