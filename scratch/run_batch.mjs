import { execSync } from 'child_process';

const games = [
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
"God of War (2018)",
"God of War Ragnarök",
"The Witcher 3: Wild Hunt",
"Cyberpunk 2077",
"Horizon Zero Dawn",
"Horizon Forbidden West",
"Ghost of Tsushima",
"Uncharted",
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
"Beyond: Two Souls"
];

for (const game of games) {
  console.log(`\n========================================`);
  console.log(`🚀 AVVIO PROCESSO PER: ${game}`);
  console.log(`========================================`);
  try {
    execSync(`node scratch/populate_full_v2.mjs "${game}"`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`❌ Errore critico in ${game}. Continuo con il prossimo...`);
  }
}
console.log("\n✅ TUTTI I GIOCHI SONO STATI PROCESSATI E CARICATI!");
