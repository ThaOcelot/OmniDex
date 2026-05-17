import fs from 'fs';
import path from 'path';

try {
  // Carica il changelog per estrarre la versione attuale
  const changelogPath = path.resolve('src/data/changelog.js');
  const changelogContent = fs.readFileSync(changelogPath, 'utf8');
  const versionMatch = changelogContent.match(/version:\s*"([^"]+)"/);
  const version = versionMatch ? versionMatch[1] : 'unknown';

  // Leggi il file sw.js
  const swPath = path.resolve('public/sw.js');
  let swContent = fs.readFileSync(swPath, 'utf8');

  // Genera un timestamp univoco per assicurare un byte-change ad ogni build
  const timestamp = Date.now();
  const newCacheName = `const CACHE_NAME = 'omnidex-cache-v${version}-${timestamp}';`;

  // Sostituisci il CACHE_NAME nel file sw.js
  swContent = swContent.replace(/const CACHE_NAME = '[^']+'\s*;/, newCacheName);

  // Scrivi il file sw.js aggiornato
  fs.writeFileSync(swPath, swContent, 'utf8');
  console.log(`🚀 [SW Builder] Cache bumped to: omnidex-cache-v${version}-${timestamp}`);
} catch (err) {
  console.error('❌ Errore durante l\'aggiornamento del Service Worker:', err);
}
