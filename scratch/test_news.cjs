const https = require('https');

const NEWS_PROXY = 'https://api.allorigins.win/raw?url=';
const gameTitle = 'Helldivers 2';
const baseQuery = `"${gameTitle}" (videogioco OR video OR trailer OR gameplay)`;
const searchQuery = `${baseQuery} when:30d`;
const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=it&gl=IT&ceid=IT:it`;
const fetchUrl = `${NEWS_PROXY}${encodeURIComponent(rssUrl)}`;

console.log("Fetching: " + fetchUrl);

https.get(fetchUrl, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data.substring(0, 500));
    console.log("Includes <item>? ", data.includes('<item>'));
  });
}).on('error', err => console.log(err));
