const RAWG_API_KEY = "f0f8782547814b088437efdb1cc88399";

const corrections = [
  { term: "Call of Duty: Modern Warfare II", year: 2022 },
  { term: "Call of Duty: Modern Warfare III", year: 2023 },
  { term: "Final Fantasy VII", year: 1997 },
  { term: "Tomb Raider", year: 1996 },
  { term: "Sonic the Hedgehog", year: 1991 },
  { term: "Sonic CD", year: 1993 },
  { term: "Link's Awakening", year: 1993 }
];

async function run() {
  for (const item of corrections) {
    console.log(`\nSearching for: "${item.term}" (Target Year: ${item.year})`);
    const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(item.term)}&page_size=20&key=${RAWG_API_KEY}`);
    const data = await res.json();
    if (data.results) {
      data.results.forEach(r => {
        if (r.released && r.released.startsWith(String(item.year))) {
          console.log(`🌟 MATCH FOUND -> ID: ${r.id} | Name: ${r.name} | Released: ${r.released}`);
        } else {
          console.log(`   Candidate -> ID: ${r.id} | Name: ${r.name} | Released: ${r.released}`);
        }
      });
    }
  }
}

run();
