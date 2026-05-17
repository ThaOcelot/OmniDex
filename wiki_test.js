async function test() {
  const game = 'God of War';
  const chars = ['Kratos', 'Atreus', 'Freya'];
  for(const char of chars) {
    const searchUrl = `https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(char + ' ' + game)}&format=json&origin=*&srlimit=1`;
    const res = await fetch(searchUrl).then(r=>r.json());
    if(res.query.search.length > 0) {
      const title = res.query.search[0].title;
      const charFirstName = char.split(' ')[0].toLowerCase().trim();
      const valid = title.toLowerCase().includes(charFirstName);
      console.log(char, '->', title, 'Valid?', valid);
    }
  }
}
test();
