$games = @(
    # --- SUPER MARIO ---
    "25080",     # Super Mario Bros. (1985)
    "25173",     # Super Mario Bros. 2 (1988)
    "24030",     # Super Mario Bros. 3 (1988)
    "27058",     # Super Mario Land (1989)
    "24899",     # Super Mario World (1990)
    "55301",     # Super Mario Land 2: 6 Golden Coins (1992)
    "54528",     # Super Mario 64 (1996)
    "52371",     # Super Mario Sunshine (2002)
    "24933",     # New Super Mario Bros. (2006)
    "27024",     # Super Mario Galaxy (2007)
    "24493",     # New Super Mario Bros. Wii (2009)
    "27036",     # Super Mario Galaxy 2 (2010)
    "27102",     # Super Mario 3D Land (2011)
    "27967",     # New Super Mario Bros. U (2012)
    "27974",     # Super Mario 3D World (2013)
    "28026",     # Super Mario Odyssey (2017)
    "962495",    # Super Mario Bros. Wonder (2023)

    # --- POKÉMON ---
    "23762",     # Pokémon Red, Blue, Yellow (1996)
    "27936",     # Pokémon Gold, Silver (1999)
    "52372",     # Pokémon Ruby, Sapphire, Emerald (2004)
    "53473",     # Pokémon FireRed, LeafGreen (2004)
    "25131",     # Pokémon Diamond, Pearl (2007)
    "26316",     # Pokémon HeartGold, SoulSilver (2010)
    "330615",    # Pokémon Black, White (2011)
    "331454",    # Pokémon Black 2, White 2 (2012)
    "27312",     # Pokémon X, Y (2013)
    "23973",     # Pokémon Alpha Sapphire, Omega Ruby (2014)
    "23748",     # Pokémon Sun, Moon (2016)
    "27939",     # Pokémon Ultra Sun, Ultra Moon (2017)
    "58606",     # Pokémon Let's Go, Pikachu! & Eevee! (2018)
    "282825",    # Pokémon Sword and Shield (2019)
    "564763",    # Pokémon Brilliant Diamond, Shining Pearl (2021)
    "564761",    # Pokémon Legends: Arceus (2022)
    "747505",    # Pokémon Scarlet and Violet (2022)

    # --- CALL OF DUTY ---
    "19369",     # Call of Duty (2003)
    "14331",     # Call of Duty 2 (2005)
    "25064",     # Call of Duty 3 (2006)
    "4535",      # Call of Duty 4: Modern Warfare (2007)
    "5528",      # Call of Duty: World at War (2008)
    "4527",      # Call of Duty: Modern Warfare 2 (2009 original)
    "865",       # Call of Duty: Black Ops (2010)
    "11276",     # Call of Duty: Modern Warfare 3 (2011 original)
    "14446",     # Call of Duty: Black Ops II (2012)
    "7439",      # Call of Duty: Ghosts (2013)
    "842",       # Call of Duty: Advanced Warfare (2014)
    "906",       # Call of Duty: Black Ops III (2015)
    "887",       # Call of Duty: Infinite Warfare (2016)
    "21924",     # Call of Duty: WWII (2017)
    "58389",     # Call of Duty: Black Ops 4 (2018)
    "323065",    # Call of Duty: Modern Warfare (2019 reboot)
    "481910",    # Call of Duty: Black Ops Cold War (2020)
    "647552",    # Call of Duty: Vanguard (2021)
    "791636",    # Call of Duty: Modern Warfare II (2022 reboot)
    "964285",    # Call of Duty: Modern Warfare III (2023 reboot)
    "983212",    # Call of Duty: Black Ops 6 (2024)

    # --- THE LEGEND OF ZELDA ---
    "24072",     # The Legend of Zelda (1986)
    "53205",     # Zelda II: The Adventure of Link (1987)
    "25096",     # The Legend of Zelda: A Link to the Past (1991)
    "27057",     # The Legend of Zelda: Link's Awakening (1993 original)
    "25097",     # The Legend of Zelda: Ocarina of Time (1998)
    "25924",     # The Legend of Zelda: Majora's Mask (2000)
    "27256",     # The Legend of Zelda: Oracle of Ages (2001)
    "27255",     # The Legend of Zelda: Oracle of Seasons (2001)
    "56092",     # The Legend of Zelda: The Wind Waker (2002)
    "27418",     # The Legend of Zelda: The Minish Cap (2004)
    "27015",     # The Legend of Zelda: Twilight Princess (2006)
    "27023",     # The Legend of Zelda: Phantom Hourglass (2007)
    "23850",     # The Legend of Zelda: Spirit Tracks (2009)
    "26824",     # The Legend of Zelda: Skyward Sword (2011)
    "27977",     # The Legend of Zelda: A Link Between Worlds (2013)
    "22511",     # The Legend of Zelda: Breath of the Wild (2017)
    "327239",    # The Legend of Zelda: Tears of the Kingdom (2023)

    # --- FINAL FANTASY ---
    "52936",     # Final Fantasy (1987)
    "52935",     # Final Fantasy II (1988)
    "308056",    # Final Fantasy III (1990)
    "52937",     # Final Fantasy IV (1991)
    "1922",      # Final Fantasy V (1992)
    "1063",      # Final Fantasy VI (1994)
    "52939",     # Final Fantasy VII (1997 original)
    "5115",      # Final Fantasy VIII (1999)
    "52943",     # Final Fantasy IX (2000)
    "41128",     # Final Fantasy X (2001)
    "34872",     # Final Fantasy XI (2002)
    "301511",    # Final Fantasy XII (2006)
    "20760",     # Final Fantasy XIII (2009)
    "39530",     # Final Fantasy XIV (2010)
    "750",       # Final Fantasy XV (2016)
    "494382",    # Final Fantasy XVI (2023)
    "259801",    # Final Fantasy VII Remake (2020)
    "802435",    # Final Fantasy VII Rebirth (2024)

    # --- TOMB RAIDER ---
    "31759",     # Tomb Raider (1996 original)
    "57908",     # Tomb Raider II (1997)
    "32122",     # Tomb Raider III: Adventures of Lara Croft (1998)
    "12280",     # Tomb Raider IV: The Last Revelation (1999)
    "12279",     # Tomb Raider V: Chronicles (2000)
    "22865",     # Tomb Raider: The Angel of Darkness (2003)
    "5298",      # Tomb Raider: Legend (2006)
    "5297",      # Tomb Raider: Anniversary (2007)
    "4869",      # Tomb Raider: Underworld (2008)
    "5286",      # Tomb Raider (2013 reboot)
    "7689",      # Rise of the Tomb Raider (2015)
    "51329",     # Shadow of the Tomb Raider (2018)

    # --- HALO ---
    "28448",     # Halo: Combat Evolved (2001)
    "37130",     # Halo 2 (2004)
    "28589",     # Halo 3 (2007)
    "50566",     # Halo 3: ODST (2009)
    "28613",     # Halo: Reach (2010)
    "28627",     # Halo 4 (2012)
    "8444",      # Halo 5: Guardians (2015)
    "58751",     # Halo Infinite (2021)

    # --- SONIC THE HEDGEHOG ---
    "53551",     # Sonic the Hedgehog (1991 original)
    "2552",      # Sonic the Hedgehog 2 (1992)
    "54320",     # Sonic CD (1993)
    "57179",     # Sonic the Hedgehog 3 (1994)
    "26293",     # Sonic & Knuckles (1994)
    "343595",    # Sonic Adventure (1998)
    "343597",    # Sonic Adventure 2 (2001)
    "36189",     # Sonic Heroes (2003)
    "283965",    # Sonic the Hedgehog (2006)
    "3731",      # Sonic Unleashed (2008)
    "26563",     # Sonic Colors (2010)
    "4331",      # Sonic Generations (2011)
    "14988",     # Sonic Lost World (2013)
    "23587",     # Sonic Mania (2017)
    "27943",     # Sonic Forces (2017)
    "704789",    # Sonic Frontiers (2022)
    "961859",    # Sonic Superstars (2023)

    # --- AGE OF EMPIRES ---
    "32697",     # Age of Empires (1997)
    "32595",     # Age of Empires II: Age of Kings (1999)
    "36514",     # Age of Empires III (2005)
    "58618",     # Age of Empires IV (2021)
    "52336",     # Age of Empires: Definitive Edition (2018)
    "326253",    # Age of Empires II: Definitive Edition (2019)
    "499264",    # Age of Empires III: Definitive Edition (2020)
    "30520"      # Age of Mythology (2002)
)

$total = $games.Length
$current = 0

foreach ($gameId in $games) {
    $current++
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "🎮 Avvio SVISCERAMENTO SAGHE per: $gameId ($current su $total)" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    
    node scratch\populate_full_v2.mjs $gameId
    
    if ($current -lt $total) {
        Write-Host ">>> Elaborazione ID: $gameId completata. Pausa anti-rate-limit 5s..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

Write-Host ">>> TUTTI I GIOCHI DEL BATCH SAGHE COMPLETATI" -ForegroundColor Green
