const fs = require('fs');
let content = fs.readFileSync('scratch/do_parse2.cjs', 'utf8');

// Extract the raw string
const rawString = content.split('const raw = `')[1].split('`;')[0];

const lines = rawString.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const quizzes = [];
let currentQuiz = null;

for (let line of lines) {
  if (!line.match(/^\d+\./) && !line.match(/^[A-D]\)/)) {
    continue;
  }
  
  if (line.match(/^\d+\./)) {
    if (currentQuiz) quizzes.push(currentQuiz);
    currentQuiz = {
      q: line.replace(/^\d+\.\s*/, ''),
      options: [],
      correct: 0
    };
  } else if (line.match(/^[A-D]\)/) && currentQuiz) {
    let text = line.replace(/^[A-D]\)\s*/, '');
    let isCorrect = text.includes('✅');
    text = text.replace('✅', '').trim();
    currentQuiz.options.push(text);
    if (isCorrect) {
      currentQuiz.correct = currentQuiz.options.length - 1;
    }
  }
}
if (currentQuiz) quizzes.push(currentQuiz);

// Read existing quizzes
let existingQuizzes = [];
try {
  existingQuizzes = JSON.parse(fs.readFileSync('src/data/quizzes.json', 'utf8'));
} catch (e) {
  console.error("No existing quizzes found");
}

const allQuizzes = existingQuizzes.concat(quizzes);

fs.writeFileSync('src/data/quizzes.json', JSON.stringify(allQuizzes, null, 2));
console.log('Total quizzes saved: ' + allQuizzes.length);

const raw = `
1. In Donkey Kong (1981), qual era il nome originale di Mario?
A) Plumber
B) Jumpman ✅
C) Mr. Video
D) Ossan

2. Quale famoso videogioco arcade del 1978 presentava alieni che scendevano progressivamente verso il basso?
A) Galaga
B) Asteroids
C) Space Invaders ✅
D) Defender

3. In quale anno è stato lanciato il Super Nintendo (SNES) in Giappone?
A) 1988
B) 1989
C) 1990 ✅
D) 1991

4. Qual è il livello massimo raggiungibile nell'originale Pac-Man prima che il gioco vada in crash (il famoso "kill screen")?
A) 100
B) 255
C) 256 ✅
D) 999

5. Come si chiamava il controverso controller a forma di guanto rilasciato per il NES nel 1989?
A) Power Pad
B) Power Glove ✅
C) U-Force
D) R.O.B.

6. In Street Fighter II, qual è la nazionalità del combattente Blanka?
A) Brasiliana ✅
B) Americana
C) Indiana
D) Russa

7. Quale di questi NON è uno dei fantasmi originali di Pac-Man?
A) Blinky
B) Pinky
C) Inky
D) Kinky ✅

8. Chi è il game designer giapponese creatore della serie Metal Gear?
A) Shigeru Miyamoto
B) Hideo Kojima ✅
C) Shinji Mikami
D) Yuji Naka

9. In Mortal Kombat (1992), quale personaggio esegue una fatality in cui strappa la spina dorsale all'avversario?
A) Scorpion
B) Sub-Zero ✅
C) Raiden
D) Kano

10. Quale console portatile SEGA aveva uno schermo a colori molto prima del Game Boy Color, ma consumava enormi quantità di batterie?
A) Sega Nomad
B) Sega Game Gear ✅
C) Sega Master System
D) Sega Pico

Giochi di Ruolo (RPG & JRPG)
11. In Final Fantasy VIII, come si chiama la peculiare arma usata dal protagonista Squall Leonhart?
A) Buster Sword
B) Gunblade ✅
C) Masamune
D) Keyblade

12. Come si chiama il regno magico e iper-tecnologico che fluttua nel cielo in Chrono Trigger?
A) Guardia
B) Zeal ✅
C) Porre
D) Medina

13. In Persona 4, qual è il vero nome del serial killer che si nasconde dietro gli omicidi a Inaba?
A) Taro Namatame
B) Tohru Adachi ✅
C) Ryotaro Dojima
D) Yosuke Hanamura

14. In Mass Effect, quale razza aliena ha un'attitudine militaristica e ha guidato l'assedio di Shanxi durante la Guerra del Primo Contatto?
A) Asari
B) Salarian
C) Krogan
D) Turian ✅

15. In The Elder Scrolls IV: Oblivion, chi è il Principe Daedrico della Distruzione?
A) Sheogorath
B) Mehrunes Dagon ✅
C) Molag Bal
D) Nocturnal

16. Qual è il nome della città natale di Cloud Strife e Tifa Lockhart in Final Fantasy VII?
A) Midgar
B) Kalm
C) Nibelheim ✅
D) Wutai

17. In Fallout: New Vegas, qual è il vero nome dell'uomo che guida la Legione di Caesar?
A) Mr. House
B) Edward Sallow ✅
C) Lanius
D) Joshua Graham

18. In The Witcher 3: Wild Hunt, come si chiama il fedele cavallo di Geralt di Rivia?
A) Rutilia (Roach) ✅
B) Bucefalo
C) Ombra
D) Pegaso

19. Qual è l'inquietante antagonista principale del gioco EarthBound (Mother 2)?
A) Porky Minch
B) Giygas ✅
C) Starman
D) Mr. Carpainter

20. In Dragon Quest, qual è il nemico base che è diventato la mascotte ufficiale della serie?
A) Goblin
B) Chocobo
C) Slime ✅
D) Poring

Azione, Avventura & Platform
21. Come si chiama la misteriosa e letale isola in cui fa naufragio Lara Croft in Tomb Raider (2013)?
A) Yamatai ✅
B) Poveglia
C) Isola di Pasqua
D) Okinawa

22. In Red Dead Redemption 2, qual è il nome del protagonista giocabile per gran parte della storia?
A) John Marston
B) Dutch van der Linde
C) Arthur Morgan ✅
D) Micah Bell

23. Qual è il nome dell'arma da mischia principale di Ratchet in Ratchet & Clank?
A) Spada di luce
B) Onnichiave (Omniwrench) ✅
C) Martello gravitazionale
D) Pistola laser

24. In God of War (2018), come si chiama il figlio di Kratos?
A) Deimos
B) Atreus ✅
C) Baldur
D) Modi

25. Qual è il nome del regno in rovina popolato da insetti in cui è ambientato Hollow Knight?
A) Lordran
B) Nidosacro (Hallownest) ✅
C) Nibel
D) Boletaria

26. Chi è l'imprevedibile e iconico villain di Far Cry 3 che definisce la "follia"?
A) Pagan Min
B) Joseph Seed
C) Vaas Montenegro ✅
D) Anton Castillo

27. Qual è il nome dell'agenzia segreta per cui lavora l'Agente 47 in Hitman?
A) IMF
B) ICA ✅
C) CIA
D) MI6

28. Come si chiama il mondo dipinto in Super Mario 64 al quale si accede saltando nel quadrante del grande orologio a pendolo?
A) Bob-omb Battlefield
B) Tick Tock Clock (Pendente di Piombo) ✅
C) Rainbow Ride
D) Cool, Cool Mountain

29. In Horizon Zero Dawn, qual è il nome della tribù matriarcale in cui cresce Aloy?
A) Carja
B) Nora ✅
C) Oseram
D) Banuk

30. Nel videogioco Control, come si chiama l'edificio brutalista in cui ha sede il Federal Bureau of Control?
A) Il Monolito
B) La Piramide
C) The Oldest House (La Casa Più Antica) ✅
D) The Black Rock

Indie, PC Gaming & Multiplayer
31. Quale studio indipendente ha sviluppato il pluripremiato roguelike Hades?
A) Team Cherry
B) Supergiant Games ✅
C) Motion Twin
D) Re-Logic

32. In League of Legends, quale regione è conosciuta per il suo spietato militarismo e la filosofia "la forza fa il diritto"?
A) Demacia
B) Ionia
C) Noxus ✅
D) Piltover

33. Come si chiama il protagonista controllato dal giocatore in Undertale?
A) Chara
B) Sans
C) Frisk ✅
D) Asriel

34. Introdotto nelle versioni più recenti di Minecraft, qual è il materiale più resistente per forgiare armature (superiore al diamante)?
A) Titanio
B) Netherite ✅
C) Ossidiana
D) Cobalto

35. In Stardew Valley, qual è il nome della spietata corporazione che minaccia lo stile di vita della cittadina?
A) Nook Inc.
B) Joja Corporation ✅
C) Vault-Tec
D) Umbrella Corporation

36. Quale gioco indie ti mette nei panni di un agente di frontiera nel fittizio e totalitario stato di Arstotzka?
A) Beholder
B) Papers, Please ✅
C) The Stanley Parable
D) Return of the Obra Dinn

37. In Dota 2, quale eroe pronuncia la famosa frase "Fresh Meat!" prima di agganciare la vittima?
A) Axe
B) Tidehunter
C) Pudge ✅
D) Doom

38. In Celeste, come si chiama la montagna titolare che la protagonista Madeline cerca di scalare?
A) Monte Olimpo
B) Monte Ebott
C) Monte Celeste ✅
D) Monte Fuji

39. Qual è l'obiettivo principale del gioco Subnautica?
A) Salvare la Terra da una minaccia aliena
B) Sconfiggere un antico dio sottomarino
C) Sopravvivere e fuggire dal pianeta oceanico 4546B ✅
D) Costruire una città sottomarina per l'umanità

40. Su quale famoso motore grafico si basa il sandbox Garry's Mod?
A) Unreal Engine
B) Unity
C) Source Engine ✅
D) CryEngine

Lore Profonda & Segreti
41. In Dark Souls, chi è il signore della luce e padre di Gwynevere, Gwyndolin e del Re Senza Nome?
A) Artorias
B) Havel la Roccia
C) Gwyn, Lord dei Tizzoni ✅
D) Nito, il Re Tombale

42. In Resident Evil 4, come si chiama il parassita antico che infetta gli abitanti del villaggio europeo?
A) T-Virus
B) G-Virus
C) Las Plagas ✅
D) Uroboros

43. In Bloodborne, quale istituzione fondò la pratica della "Guarigione del Sangue" che portò alla rovina di Yharnam?
A) I Cacciatori dei Powder Keg
B) Il Coro
C) La Chiesa della Cura (Healing Church) ✅
D) L'Accademia di Byrgenwerth

44. Chi è l'intelligenza artificiale ostile e megalomane della serie System Shock?
A) GLaDOS
B) SHODAN ✅
C) Icarus
D) Skynet

45. Qual è il nome della fittizia lingua parlata dai personaggi della serie The Sims?
A) Simiano
B) Simlish ✅
C) Gibberish
D) Simspeak

46. Nel videogioco Destiny, come si chiama la misteriosa entità sferica che ha innescato l'Età dell'Oro dell'umanità?
A) Il Monolito
B) Il Viaggiatore (The Traveler) ✅
C) L'Oracolo
D) La Luce

47. Nel primo capitolo di Gears of War, come si chiama il pianeta dilaniato dalla guerra contro le Locuste?
A) Reach
B) Sera ✅
C) Pandora
D) Char

48. In Half-Life 2, qual è il nome dell'impero militare transdimensionale che ha conquistato la Terra in sole sette ore?
A) I Covenant
B) I Combine ✅
C) I Borg
D) L'Impero Grox

49. In Dead Space, qual è il mantra religioso ripetuto ossessivamente dai membri di Unitology?
A) "Loda il Marchio"
B) "Rendici Uno" (Make Us Whole) ✅
C) "La Carne è Debole"
D) "Risorgi e Uccidi"

50. Qual è il leggendario "Konami Code", originariamente usato in Gradius e reso celebre da Contra?
A) Su, Su, Giù, Giù, Sinistra, Destra, Sinistra, Destra, B, A ✅
B) A, B, B, A, C, C, C
C) Giù, R, Su, L, Y, B
D) IDDQD
`;
