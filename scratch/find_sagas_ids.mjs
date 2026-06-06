import fs from 'fs';

const RAWG_API_KEY = "f0f8782547814b088437efdb1cc88399";

const sagas = {
  "Super Mario": [
    "Super Mario Bros.",
    "Super Mario Bros. 2",
    "Super Mario Bros. 3",
    "Super Mario Land",
    "Super Mario World",
    "Super Mario Land 2: 6 Golden Coins",
    "Super Mario 64",
    "Super Mario Sunshine",
    "New Super Mario Bros.",
    "Super Mario Galaxy",
    "New Super Mario Bros. Wii",
    "Super Mario Galaxy 2",
    "Super Mario 3D Land",
    "New Super Mario Bros. U",
    "Super Mario 3D World",
    "Super Mario Odyssey",
    "Super Mario Bros. Wonder"
  ],
  "Pokémon": [
    "Pokemon Red",
    "Pokemon Gold",
    "Pokemon Ruby",
    "Pokemon FireRed",
    "Pokemon Diamond",
    "Pokemon HeartGold",
    "Pokemon Black",
    "Pokemon Black 2",
    "Pokemon X",
    "Pokemon Omega Ruby",
    "Pokemon Sun",
    "Pokemon Ultra Sun",
    "Pokemon Let's Go, Pikachu!",
    "Pokemon Sword",
    "Pokemon Brilliant Diamond",
    "Pokemon Legends: Arceus",
    "Pokemon Scarlet"
  ],
  "Call of Duty": [
    "Call of Duty (2003)",
    "Call of Duty 2",
    "Call of Duty 3",
    "Call of Duty 4: Modern Warfare",
    "Call of Duty: World at War",
    "Call of Duty: Modern Warfare 2 (2009)",
    "Call of Duty: Black Ops",
    "Call of Duty: Modern Warfare 3",
    "Call of Duty: Black Ops II",
    "Call of Duty: Ghosts",
    "Call of Duty: Advanced Warfare",
    "Call of Duty: Black Ops III",
    "Call of Duty: Infinite Warfare",
    "Call of Duty: WWII",
    "Call of Duty: Black Ops 4",
    "Call of Duty: Modern Warfare (2019)",
    "Call of Duty: Black Ops Cold War",
    "Call of Duty: Vanguard",
    "Call of Duty: Modern Warfare II (2022)",
    "Call of Duty: Modern Warfare III (2023)",
    "Call of Duty: Black Ops 6"
  ],
  "The Legend of Zelda": [
    "The Legend of Zelda (1986)",
    "Zelda II: The Adventure of Link",
    "The Legend of Zelda: A Link to the Past",
    "The Legend of Zelda: Link's Awakening",
    "The Legend of Zelda: Ocarina of Time",
    "The Legend of Zelda: Majora's Mask",
    "The Legend of Zelda: Oracle of Ages",
    "The Legend of Zelda: Oracle of Seasons",
    "The Legend of Zelda: The Wind Waker",
    "The Legend of Zelda: The Minish Cap",
    "The Legend of Zelda: Twilight Princess",
    "The Legend of Zelda: Phantom Hourglass",
    "The Legend of Zelda: Spirit Tracks",
    "The Legend of Zelda: Skyward Sword",
    "The Legend of Zelda: A Link Between Worlds",
    "The Legend of Zelda: Breath of the Wild",
    "The Legend of Zelda: Tears of the Kingdom"
  ],
  "Final Fantasy": [
    "Final Fantasy (1987)",
    "Final Fantasy II",
    "Final Fantasy III",
    "Final Fantasy IV",
    "Final Fantasy V",
    "Final Fantasy VI",
    "Final Fantasy VII (1997)",
    "Final Fantasy VIII",
    "Final Fantasy IX",
    "Final Fantasy X",
    "Final Fantasy XI",
    "Final Fantasy XII",
    "Final Fantasy XIII",
    "Final Fantasy XIV",
    "Final Fantasy XV",
    "Final Fantasy XVI",
    "Final Fantasy VII Remake",
    "Final Fantasy VII Rebirth"
  ],
  "Tomb Raider": [
    "Tomb Raider (1996)",
    "Tomb Raider II",
    "Tomb Raider III: Adventures of Lara Croft",
    "Tomb Raider: The Last Revelation",
    "Tomb Raider: Chronicles",
    "Tomb Raider: The Angel of Darkness",
    "Tomb Raider: Legend",
    "Tomb Raider: Anniversary",
    "Tomb Raider: Underworld",
    "Tomb Raider (2013)",
    "Rise of the Tomb Raider",
    "Shadow of the Tomb Raider"
  ],
  "Halo": [
    "Halo: Combat Evolved",
    "Halo 2",
    "Halo 3",
    "Halo 3: ODST",
    "Halo: Reach",
    "Halo 4",
    "Halo 5: Guardians",
    "Halo Infinite"
  ],
  "Sonic the Hedgehog": [
    "Sonic the Hedgehog (1991)",
    "Sonic the Hedgehog 2 (1992)",
    "Sonic the Hedgehog CD",
    "Sonic the Hedgehog 3",
    "Sonic & Knuckles",
    "Sonic Adventure",
    "Sonic Adventure 2",
    "Sonic Heroes",
    "Sonic the Hedgehog (2006)",
    "Sonic Unleashed",
    "Sonic Colors",
    "Sonic Generations",
    "Sonic Lost World",
    "Sonic Mania",
    "Sonic Forces",
    "Sonic Frontiers",
    "Sonic Superstars"
  ],
  "Age of Empires": [
    "Age of Empires",
    "Age of Empires II: The Age of Kings",
    "Age of Empires III",
    "Age of Empires IV",
    "Age of Empires: Definitive Edition",
    "Age of Empires II: Definitive Edition",
    "Age of Empires III: Definitive Edition",
    "Age of Mythology"
  ]
};

async function run() {
  const results = {};
  for (const [sagaName, gameTitles] of Object.entries(sagas)) {
    results[sagaName] = [];
    console.log(`\n================ Searching Saga: ${sagaName} ================`);
    for (const title of gameTitles) {
      // Clean up year for search query
      const cleanTitle = title.replace(/\s*\(\d{4}\)\s*/, '');
      try {
        const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(cleanTitle)}&page_size=5&key=${RAWG_API_KEY}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          // Let's find the best match. Ideally, we want exact or very close name matching
          let best = data.results[0];
          
          // Let's log candidates to console
          console.log(`Query: "${title}"`);
          data.results.forEach((r, idx) => {
            console.log(`  [${idx}] ID: ${r.id} | Name: ${r.name} | Released: ${r.released}`);
          });

          // Add best guess
          results[sagaName].push({
            query: title,
            id: best.id,
            name: best.name,
            released: best.released
          });
        } else {
          console.log(`Query: "${title}" -> No results!`);
          results[sagaName].push({
            query: title,
            id: null,
            name: "NOT FOUND",
            released: null
          });
        }
        // Wait 1.5 seconds between queries to avoid RAWG API limits
        await new Promise(r => setTimeout(r, 1500));
      } catch (e) {
        console.error(`Error searching "${title}":`, e.message);
        results[sagaName].push({
          query: title,
          id: null,
          name: "ERROR: " + e.message,
          released: null
        });
      }
    }
  }

  fs.writeFileSync('scratch/sagas_search_results.json', JSON.stringify(results, null, 2));
  console.log('\nSearch completed. Results saved to scratch/sagas_search_results.json');
}

run();
