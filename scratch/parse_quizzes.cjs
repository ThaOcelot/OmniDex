const fs = require('fs');

const raw = `
1. Qual è il vero nome di Solid Snake nella saga di Metal Gear Solid?
A) Jack
B) John
C) David ✅
D) George

2. Qual è il nome della gigantesca astronave mineraria in cui è ambientato il primo Dead Space?
A) USG Kellion
B) USG Ishimura ✅
C) USG Valor
D) USG Aegis

3. In Disco Elysium, qual è il nome del misurato e metodico tenente che ti affianca nelle indagini?
A) Jean Vicquemare
B) Titus Hardie
C) Kim Kitsuragi ✅
D) Klaasje Amandou

4. Chi è il protagonista principale di Silent Hill 2?
A) Harry Mason
B) James Sunderland ✅
C) Travis Grady
D) Henry Townshend

5. Quale iconica abilità in Disco Elysium rappresenta una sorta di connessione paranormale e "sesto senso" con la città stessa?
A) Inland Empire
B) Encyclopedia
C) Shivers ✅
D) Half Light

6. Come si chiama la letale squadra di forze speciali guidata da The Boss in Metal Gear Solid 3: Snake Eater?
A) Foxhound
B) Dead Cell
C) Beauty and the Beast Unit
D) L'Unità Cobra ✅

7. In Dead Space, come viene chiamato il misterioso manufatto alieno che causa la follia e le mutazioni?
A) Il Monolito
B) Il Cristallo
C) Il Marchio (The Marker) ✅
D) L'Elica

8. Chi è lo storico compositore che ha curato le iconiche e inquietanti colonne sonore dei primi Silent Hill?
A) Nobuo Uematsu
B) Akira Yamaoka ✅
C) Keiichi Okabe
D) Koji Kondo

9. In Metal Gear Solid, qual è la vera identità del cyborg ninja apparso nell'incidente di Shadow Moses?
A) Raiden
B) Frank Jaeger (Gray Fox) ✅
C) Vamp
D) Decoy Octopus

10. Qual è il nome della fittizia e decadente città in cui è ambientato Disco Elysium?
A) Revachol ✅
B) Martinaise
C) Sur-la-Clef
D) Graad

Grandi Classici e Protagonisti
11. Come si chiama il protagonista silenzioso della serie Half-Life?
A) Adrian Shephard
B) Gordon Freeman ✅
C) Barney Calhoun
D) Alyx Vance

12. In The Legend of Zelda, qual è il nome del protagonista che il giocatore controlla?
A) Zelda
B) Ganon
C) Link ✅
D) Tingle

13. Qual è l'intelligenza artificiale che accompagna Master Chief in Halo?
A) EDI
B) GLaDOS
C) Cortana ✅
D) SHODAN

14. Come si chiama il leggendario cacciatore di mostri mutato protagonista di The Witcher?
A) Vesemir
B) Dandelion
C) Eskel
D) Geralt di Rivia ✅

15. Qual è l'antagonista principale di Final Fantasy VII?
A) Kefka
B) Kuja
C) Sephiroth ✅
D) Sin

16. In Metroid, qual è l'identità della persona sotto la potente Tuta Energia?
A) Samus Aran ✅
B) Ridley Scott
C) Adam Malkovich
D) Capitano Falcon

17. Come si chiama il drago viola protagonista dell'omonima serie platform creata da Insomniac Games?
A) Croc
B) Gex
C) Spyro ✅
D) Rayman

18. Qual è il nome del compagno volpe a due code di Sonic the Hedgehog?
A) Knuckles
B) Tails ✅
C) Shadow
D) Silver

19. Chi è l'arcinemico storico di Crash Bandicoot?
A) Nitros Oxide
B) Dingodile
C) Dr. Neo Cortex ✅
D) Uka Uka

20. Come si chiama la spalla/fratello di Super Mario?
A) Wario
B) Waluigi
C) Toad
D) Luigi ✅

Ambientazioni e Lore del Mondo
21. Come si chiama la città sottomarina in cui è ambientato il primo BioShock?
A) Columbia
B) Rapture ✅
C) Arcadia
D) Dunwall

22. Qual è la valuta principale utilizzata nel mondo post-apocalittico di Fallout?
A) Proiettili d'argento
B) Dollari pre-bellici
C) Tappi di bottiglia (Caps) ✅
D) Razioni di cibo

23. In The Elder Scrolls V: Skyrim, in quale continente si svolge l'avventura?
A) Akavir
B) Atmora
C) Yokuda
D) Tamriel ✅

24. Quale fittizia città americana viene distrutta a seguito dell'epidemia del Virus T in Resident Evil?
A) Silent Hill
B) Raccoon City ✅
C) Willamette
D) Los Perdidos

25. Qual è il regno maledetto in cui si svolgono gli eventi del primo Dark Souls?
A) Drangleic
B) Lothric
C) Lordran ✅
D) Yharnam

26. In Cyberpunk 2077, come si chiama la megalopoli in cui opera V?
A) Neo-Tokyo
B) Night City ✅
C) Los Angeles 2049
D) Mega-City One

27. Nel primo capitolo di Grand Theft Auto: San Andreas, in quale città il protagonista CJ fa il suo ritorno?
A) Vice City
B) Liberty City
C) San Fierro
D) Los Santos ✅

28. Come si chiama il fungo parassita responsabile dell'infezione globale in The Last of Us?
A) T-Virus
B) Plasmidi
C) Cordyceps ✅
D) Flagello

29. In Bloodborne, qual è il nome della città gotica infetta dalla piaga delle belve?
A) Boletaria
B) Anor Londo
C) Yharnam ✅
D) Majula

30. In Assassin's Creed, come si chiama il macchinario in grado di leggere i ricordi genetici?
A) La Mela dell'Eden
B) Il Frutto
C) Il Sincronizzatore
D) L'Animus ✅

Hardware, Armi e Oggetti Storici
31. Qual è l'arma iconica e devastante storicamente legata alla serie DOOM?
A) Fucile a impulsi
B) Lanciarazzi
C) BFG 9000 ✅
D) Raggio della Morte

32. Quale console detiene il record di vendite più alto nella storia dei videogiochi?
A) Nintendo DS
B) PlayStation 2 ✅
C) Nintendo Switch
D) Game Boy

33. Come si chiamano le iconiche lame incatenate ai polsi di Kratos nei primi God of War?
A) Lame dell'Olimpo
B) Ascia Leviatano
C) Lame del Caos ✅
D) Lame di Atena

34. In Kingdom Hearts, quale tipo di arma magica a forma di chiave brandisce Sora?
A) Master Sword
B) Buster Sword
C) Soul Edge
D) Keyblade ✅

35. Di che colore è l'iconica torta promessa in Portal (che si rivela essere una bugia)?
A) Cioccolato con ciliegie
B) Cioccolata nera con panna e ciliegie ✅
C) Vaniglia con fragole
D) Red Velvet

36. In Minecraft, qual è il materiale tradizionalmente considerato il più prezioso per forgiare armi e armature (prima del Netherite)?
A) Oro
B) Ferro
C) Smeraldo
D) Diamante ✅

37. Quale dei seguenti fantasmi di Pac-Man è di colore rosso?
A) Pinky
B) Inky
C) Clyde
D) Blinky ✅

38. Nella serie Castlevania, quale storica famiglia è votata alla caccia del Conte Dracula?
A) Redfield
B) Belmont ✅
C) Joestar
D) Helsing

39. Quanti colossi giganti deve sconfiggere Wander nel gioco Shadow of the Colossus?
A) 12
B) 14
C) 16 ✅
D) 20

40. Qual è il nome in codice del progetto durante lo sviluppo del Nintendo GameCube?
A) Project Reality
B) Project Cafe
C) Revolution
D) Project Dolphin ✅

Sviluppatori e Multiplayer
41. Chi è l'ingegnere informatico russo creatore originale del puzzle game Tetris?
A) Shigeru Miyamoto
B) Aleksej Pažitnov ✅
C) Hironobu Sakaguchi
D) Gunpei Yokoi

42. Quale famoso attore ha prestato il volto e la voce al personaggio di Johnny Silverhand in Cyberpunk 2077?
A) Willem Dafoe
B) Norman Reedus
C) Keanu Reeves ✅
D) Mads Mikkelsen

43. Quale studio di sviluppo è l'autore della serie The Last of Us e Uncharted?
A) Insomniac Games
B) Sucker Punch
C) Naughty Dog ✅
D) Santa Monica Studio

44. In World of Warcraft, quali sono le due fazioni principali in guerra perenne?
A) Umani e Orchi
B) L'Alleanza e L'Orda ✅
C) I Protoss e gli Zerg
D) L'Impero e la Ribellione

45. Come si chiama la mappa principale e più famosa su cui avvengono le partite di League of Legends?
A) Abisso Ululante
B) Selva Demoniaca
C) Dominio di Cristallo
D) Landa degli Evocatori ✅

46. In Street Fighter, quale personaggio esegue la famosa mossa speciale "Hadouken"?
A) Guile
B) Chun-Li
C) Ryu ✅
D) M. Bison

47. Qual è l'identità dell'androide da combattimento protagonista principale di NieR: Automata?
A) 9S
B) A2
C) 2B ✅
D) 6O

48. Chi era il volto in copertina e il personaggio simbolo all'uscita originale di Overwatch?
A) Winston
B) Widowmaker
C) Reaper
D) Tracer ✅

49. In Persona 5, come si fa chiamare il gruppo di vigilanti guidato dal protagonista?
A) S.E.E.S.
B) The Investigation Team
C) Ladri Fantasma (Phantom Thieves) ✅
D) I Ribelli di Tokyo

50. Nella serie Yakuza (Like a Dragon), chi è lo storico e leggendario "Drago di Dojima"?
A) Goro Majima
B) Kazuma Kiryu ✅
C) Akira Nishikiyama
D) Ichiban Kasuga
`;

const lines = raw.split('\\n').map(l => l.trim()).filter(l => l.length > 0);

const quizzes = [];
let currentQuiz = null;

for (let line of lines) {
  // Ignoriamo i titoli delle sezioni (non iniziano con numero o lettera)
  if (!line.match(/^\\d+\\./) && !line.match(/^[A-D]\\)/)) {
    continue;
  }
  
  if (line.match(/^\\d+\\./)) {
    if (currentQuiz) quizzes.push(currentQuiz);
    currentQuiz = {
      q: line.replace(/^\\d+\\.\\s*/, ''),
      options: [],
      correct: 0
    };
  } else if (line.match(/^[A-D]\\)/) && currentQuiz) {
    let text = line.replace(/^[A-D]\\)\\s*/, '');
    let isCorrect = text.includes('✅');
    text = text.replace('✅', '').trim();
    currentQuiz.options.push(text);
    if (isCorrect) {
      currentQuiz.correct = currentQuiz.options.length - 1;
    }
  }
}
if (currentQuiz) quizzes.push(currentQuiz);

fs.writeFileSync('src/data/quizzes.json', JSON.stringify(quizzes, null, 2));
console.log('Quizzes saved: ' + quizzes.length);
