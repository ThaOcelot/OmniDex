import { execSync } from 'child_process';

const games = [
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
  "Doom (2016)",
  "Wolfenstein: The New Order",
  "Dishonored",
  "Prey (2017)",
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
