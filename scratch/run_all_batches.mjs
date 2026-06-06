import { execSync } from 'child_process';

const games = [
  // Batch 1 (43 giochi da recuperare/rifare)
  "Red Dead Redemption 2",
  "Detroit: Become Human",
  "Death Stranding",
  "Death Stranding 2: On The Beach",
  "Heavy Rain",
  "The Last of Us",
  "The Last of Us Part II",
  "God of War",
  "God of War 2",
  "God of War 3",
  "God of War Chain of Olympus",
  "God of War Ghost of Sparta",
  "God of War Ascension",
  "58175", // God of War (2018) - ID diretto per evitare di duplicare God of War 1 (2005)
  "God of War Ragnarök",
  "The Witcher 3: Wild Hunt",
  "Cyberpunk 2077",
  "Horizon Zero Dawn",
  "Horizon Forbidden West",
  "Ghost of Tsushima",
  "4340", // Uncharted: Drake's Fortune - ID diretto per evitare Golden Abyss
  "Uncharted 3",
  "Uncharted 4: A Thief's End",
  "Uncharted 2: Among Thieves",
  "Mass Effect 2",
  "BioShock",
  "Bioshock 2",
  "BioShock Infinite",
  "Half-Life 2",
  "Portal 2",
  "Fallout: New Vegas",
  "Fallout 4",
  "The Elder Scrolls V: Skyrim",
  "Doom Eternal",
  "Halo: Combat Evolved",
  "Super Mario 64",
  "Super Mario Odyssey",
  "The Legend of Zelda: Ocarina of Time",
  "The Legend of Zelda: Breath of the Wild",
  "The Legend of Zelda: Tears of the Kingdom",
  "Alan Wake 2",
  "Control",
  "Beyond: Two Souls",

  // Batch 2 (50 nuovi giochi della lista)
  "Baldur's Gate 3",
  "Final Fantasy VII Remake",
  "Hollow Knight",
  "Hades",
  "Sekiro: Shadows Die Twice",
  "Disco Elysium",
  "Outer Wilds",
  "Stardew Valley",
  "Minecraft",
  "Terraria",
  "Cuphead",
  "Celeste",
  "Undertale",
  "Persona 5 Royal",
  "Nier: Automata",
  "Dragon Age: Inquisition",
  "Monster Hunter: World",
  "2454", // Doom (2016) - ID diretto per evitare Doom (1993)
  "Wolfenstein: The New Order",
  "Dishonored",
  "39", // Prey (2017) - ID diretto per evitare Prey (2006)
  "Batman: Arkham City",
  "Shadow of the Colossus",
  "Ico",
  "Okami",
  "Castlevania: Symphony of the Night",
  "Super Metroid",
  "Metroid Prime",
  "Star Wars: Knights of the Old Republic",
  "Civilization VI",
  "Age of Empires II: Definitive Edition",
  "Total War: Warhammer III",
  "XCOM 2",
  "Slay the Spire",
  "Into the Breach",
  "Dead Cells",
  "Darkest Dungeon",
  "Firewatch",
  "What Remains of Edith Finch",
  "Return of the Obra Dinn",
  "Papers, Please",
  "Left 4 Dead 2",
  "Team Fortress 2",
  "Counter-Strike 2",
  "League of Legends",
  "Dota 2",
  "World of Warcraft",
  "Final Fantasy XIV",
  "Diablo IV",
  "Path of Exile"
];

// Riprendiamo dall'indice 13 (God of War 2018)
for (let i = 13; i < games.length; i++) {
  const game = games[i];
  console.log(`\n========================================`);
  console.log(`🚀 [${i + 1}/${games.length}] AVVIO PROCESSO PER: ${game}`);
  console.log(`========================================`);
  try {
    execSync(`node scratch/populate_full_v2.mjs "${game}"`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`❌ Errore critico in ${game}. Continuo con il prossimo...`);
  }
}
console.log("\n✅ TUTTI I GIOCHI SONO STATI PROCESSATI E CARICATI!");
