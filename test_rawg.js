import fs from 'fs';

async function testRAWG() {
  const key = "f0f8782547814b088437efdb1cc88399";
  const id = 'the-witcher-3-wild-hunt'; // Popular game

  const endpoints = [
    `/games/${id}/suggested`,
    `/games/${id}/reddit`,
    `/games/${id}/twitch`,
    `/games/${id}/parent-games`,
    `/games/blood-and-wine/parent-games` // DLC to test parent games
  ];

  for (const ep of endpoints) {
    try {
      const url = `https://api.rawg.io/api${ep}?key=${key}`;
      const res = await fetch(url);
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch (e) {}
      console.log(`Endpoint: ${ep}`);
      console.log(`Status: ${res.status}`);
      console.log(`Body: ${text.substring(0, 50)}`);
      console.log(`Results length: ${data.results ? data.results.length : (data.error || 'No results array')}`);
      console.log('---');
    } catch (e) {
      console.error(`Error fetching ${ep}:`, e.message);
    }
  }
}
testRAWG();
