import { registerPlugin, CapacitorHttp } from '@capacitor/core';
import { db } from './db';
import FirebaseService from './FirebaseService';

const LocalAIPlugin = registerPlugin('LocalAIPlugin');

async function getRawgGamesFunc() {
  const { httpsCallable } = await import('firebase/functions');
  const functions = await FirebaseService.getFunctionsInstance();
  return httpsCallable(functions, 'getRawgGames');
}

const SYSTEM_PROMPT = `
Sei l'Archivista Monumentale di OmniDex. 
Crea voci enciclopediche sterminate in ITALIANO.
TRADUCI TUTTO: Ogni termine tecnico o descrizione inglese deve essere tradotta in italiano professionale.
`.trim();

async function askLocalAI(prompt, systemPrompt = SYSTEM_PROMPT) {
  try {
    const { content } = await LocalAIPlugin.generateContent({ 
      prompt: `${systemPrompt}\n\nRICHIESTA: ${prompt}` 
    });
    return content?.trim() || null;
  } catch (e) { return null; }
}

async function httpGet(url, params = {}) {
  try {
    const response = await CapacitorHttp.get({ url, params });
    return response.data;
  } catch (e) { return null; }
}

async function rawgGet(endpoint, params = {}) {
  try {
    const getRawgGames = await getRawgGamesFunc();
    const response = await getRawgGames({ endpoint, params });
    return response.data.data;
  } catch (e) { return null; }
}

export async function searchGamesList(query) {
  const data = await rawgGet('games', {
    search: query,
    page_size: 20
  });

  if (!data?.results) return [];

  return data.results.map(g => ({
    id: g.id,
    title: g.name,
    year: g.released ? new Date(g.released).getFullYear() : "N/D",
    platforms: g.platforms?.map(p => p.platform.name) || [],
    genre: g.genres?.[0]?.name || "Videogioco",
    added: g.added || 0,
    cover: g.background_image,
    description: "Espandi per visualizzare l'archivio monumentale."
  })).sort((a, b) => b.added - a.added);
}

export async function searchGameInfo(gameTitle) {
  const cached = await db.getGame(gameTitle);
  if (cached) return cached;

  const searchRes = await rawgGet('games', {
    search: gameTitle,
    page_size: 1
  });

  const gameBrief = searchRes?.results?.[0];
  if (!gameBrief) return null;

  const game = await rawgGet(`games/${gameBrief.id}`);

  if (!game) return null;

  let wikiFull = "";
  try {
    const wSearch = await httpGet(`https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(gameTitle)}&format=json&origin=*`);
    if (wSearch?.query?.search?.[0]) {
      const wRes = await httpGet(`https://it.wikipedia.org/api/rest_v1/page/mobile-sections/${encodeURIComponent(wSearch.query.search[0].title)}`);
      if (wRes?.lead) {
        wikiFull = wRes.lead.sections[0].text + wRes.remaining.sections.map(s => `<h2>${s.line}</h2>${s.text}`).join('');
        wikiFull = wikiFull.replace(/<[^>]*>/g, ' ').replace(/\s\s+/g, ' ').trim();
      }
    }
  } catch (_) {}

  const [descriptionIt, plot, gameplay, trivia, characters] = await Promise.all([
    askLocalAI(`Traduci in ITALIANO professionale questa descrizione: ${game.description_raw || game.description}`),
    askLocalAI(`Scrivi la TRAMA MONUMENTALE (min 500 parole) in ITALIANO per "${game.name}". Usa: ${wikiFull.substring(0, 3000)} ${game.description_raw}`),
    askLocalAI(`Analisi tecnica GAMEPLAY (min 400 parole) in ITALIANO per "${game.name}".`),
    askLocalAI(`5 Curiosità storiche e tecniche su "${game.name}" in ITALIANO.`),
    askLocalAI(`Elenca i personaggi principali di "${game.name}" con biografie sterminate in ITALIANO.`)
  ]);

  const finalResult = {
    id: game.id,
    title: game.name,
    originalTitle: game.name_original || game.name,
    developer: game.developers?.map(d => d.name).join(', ') || "N/D",
    publisher: game.publishers?.map(p => p.name).join(', ') || "N/D",
    releaseDate: game.released ? new Date(game.released).toLocaleDateString('it-IT') : "N/D",
    genres: game.genres?.map(g => g.name) || [],
    platforms: game.platforms?.map(p => p.platform.name) || [],
    metacriticScore: game.metacritic || "N/D",
    description: descriptionIt || game.description_raw || "Analisi monumentale in corso...",
    plot: plot || wikiFull.substring(0, 2000),
    gameplay: gameplay || "Analisi meccaniche in corso...",
    trivia: (trivia || "").split('\n').filter(l => l.length > 10),
    cover: game.background_image,
    screenshots: [game.background_image, game.background_image_additional].filter(Boolean),
    protagonists: (characters || "").split('\n').filter(l => l.includes('-')).map(line => {
      const [name, ...desc] = line.split('-');
      return { name: name.trim().replace(/^[0-9.\s*-]+/, ''), description: desc.join('-').trim() };
    }).filter(c => c.name.length > 2),
    esrb: game.esrb_rating?.name || "N/D",
    website: game.website,
    modes: game.tags?.filter(t => t.language === 'eng' && (t.name.toLowerCase().includes('singleplayer') || t.name.toLowerCase().includes('multiplayer'))).map(t => t.name) || []
  };

  await db.setGame(gameTitle, finalResult);
  return finalResult;
}

export async function searchGameNews(gameTitle) {
  const searchQuery = `"${gameTitle}" videogame news when:30d`;
  const res = await httpGet(`https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=it&gl=IT&ceid=IT:it`);
  if (!res) return [];
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(res, "text/xml");
  const items = Array.from(xmlDoc.querySelectorAll("item")).slice(0, 5);
  return items.map(item => ({
    title: item.querySelector("title")?.textContent || "",
    url: item.querySelector("link")?.textContent || "",
    source: item.querySelector("source")?.textContent || "Web",
    date: new Date(item.querySelector("pubDate")?.textContent).toLocaleDateString('it-IT')
  }));
}

export async function getCharacterDeepDive(gameTitle, characterName) {
  const res = await askLocalAI(`Analisi MONUMENTALE di "${characterName}" in ITALIANO.`);
  return { name: characterName, description: res || "Dettagli in arrivo...", trivia: [] };
}

export async function summarizeNews(newsTitle, newsUrl) {
  const res = await askLocalAI(`Riassumi in ITALIANO: "${newsTitle}"`);
  return { summary: res || newsTitle };
}

export const setModelInstalledNative = async () => {
  try { await LocalAIPlugin.setModelInstalled(); } catch (_) { localStorage.setItem('gemma4_installed', 'true'); }
};
