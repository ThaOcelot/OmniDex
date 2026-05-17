// Test: Google Custom Search API con la stessa API key Gemini
// La chiave Gemini NON funziona per Custom Search - serve una chiave separata.
// Proviamo invece l'approccio con SerpAPI (free tier: 100 ricerche/mese)
// O con Open Verse (Wikimedia Commons) che ha API pubblica

async function testOpenVerse(characterName, gameTitle) {
  const query = `${characterName} ${gameTitle}`;
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial,modification&page_size=5`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(characterName, '-> status:', res.status);
    if (data.results?.length > 0) {
      console.log(characterName, '-> FOUND:', data.results[0].url);
      console.log(characterName, '-> source:', data.results[0].source);
    } else {
      console.log(characterName, '-> NO RESULTS. Count:', data.count);
    }
  } catch(e) {
    console.log(characterName, '-> error:', e.message);
  }
}

async function testFandom(characterName, gameTitle) {
  // Fandom/Wikia ha un'API pubblica per le immagini dei personaggi
  // Cerchiamo il wiki del gioco specifico
  const wikiSearch = `${gameTitle.toLowerCase().replace(/\s+/g, '-')}.fandom.com`;
  const url = `https://www.fandom.com/api/v1/SearchSuggestions/List?query=${encodeURIComponent(characterName)}&wiki=${wikiSearch}`;
  
  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    console.log('Fandom', characterName, '->', JSON.stringify(data).substring(0, 300));
  } catch(e) {
    console.log('Fandom error:', e.message);
  }
}

// Test Wikimedia Commons - pubblico, nessuna API key
async function testWikimediaCommons(characterName, gameTitle) {
  const query = `${characterName} ${gameTitle}`;
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=5`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.query?.search?.length > 0) {
      const title = data.query.search[0].title;
      // Prendi URL immagine
      const imgUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json&origin=*`;
      const imgRes = await fetch(imgUrl);
      const imgData = await imgRes.json();
      const pages = imgData.query.pages;
      const page = pages[Object.keys(pages)[0]];
      console.log('Commons', characterName, '->', page?.imageinfo?.[0]?.thumburl || 'no thumb');
    } else {
      console.log('Commons', characterName, '-> no results');
    }
  } catch(e) {
    console.log('Commons error:', e.message);
  }
}

(async () => {
  console.log('=== OpenVerse ===');
  await testOpenVerse('Kratos', 'God of War');
  await testOpenVerse('Atreus', 'God of War');
  
  console.log('\n=== Wikimedia Commons ===');
  await testWikimediaCommons('Kratos', 'God of War');
  await testWikimediaCommons('Atreus', 'God of War');
})();
