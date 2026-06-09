const https = require('https');

function testProxy(proxyUrl) {
  const gameTitle = 'Helldivers 2';
  const baseQuery = `"${gameTitle}" (videogioco OR video OR trailer OR gameplay)`;
  const searchQuery = `${baseQuery} when:30d`;
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=it&gl=IT&ceid=IT:it`;
  const fetchUrl = `${proxyUrl}${encodeURIComponent(rssUrl)}`;
  console.log("Fetching: " + fetchUrl);

  https.get(fetchUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`[${proxyUrl}] Includes <item>? `, data.includes('<item>'));
      if(!data.includes('<item>')) console.log(data.substring(0, 200));
    });
  }).on('error', err => console.log(err));
}

testProxy('https://corsproxy.io/?');
testProxy('https://api.codetabs.com/v1/proxy?quest=');
