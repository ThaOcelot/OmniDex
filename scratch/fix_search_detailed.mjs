import fs from 'fs';

const RAWG_API_KEY = "f0f8782547814b088437efdb1cc88399";

const queries = [
  "Call of Duty: Modern Warfare II",
  "Call of Duty: Modern Warfare III",
  "Final Fantasy VII",
  "Tomb Raider",
  "Sonic the Hedgehog",
  "Sonic CD",
  "The Legend of Zelda: Link's Awakening"
];

async function run() {
  const output = {};
  for (const q of queries) {
    const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(q)}&page_size=30&key=${RAWG_API_KEY}`);
    const data = await res.json();
    output[q] = (data.results || []).map(r => ({
      id: r.id,
      name: r.name,
      released: r.released,
      slug: r.slug
    }));
  }
  fs.writeFileSync('scratch/corrections_results.json', JSON.stringify(output, null, 2));
  console.log("Done! Written to scratch/corrections_results.json");
}

run();
