const RAWG_API_KEY = "f0f8782547814b088437efdb1cc88399";
const games = [
    "Demon's Souls (2009)",
    "Dark Souls (2011)",
    "Dark Souls II (2014)",
    "Bloodborne (2015)",
    "Dark Souls III (2016)",
    "Sekiro: Shadows Die Twice (2019)",
    "Elden Ring (2022)"
];

async function run() {
  for (let title of games) {
    const cleanTitle = title.replace(/\s*\(\d{4}\)\s*/, '');
    const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(cleanTitle)}&page_size=3&key=${RAWG_API_KEY}`);
    const data = await res.json();
    console.log(`\n--- ${title} ---`);
    if (data.results) {
        data.results.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Released: ${r.released}`));
    }
  }
}

run();
