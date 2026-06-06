$games = @(
    # The Witcher Saga
    "The Witcher",
    "The Witcher 2: Assassins of Kings",
    "The Witcher 3: Wild Hunt",
    "The Witcher 4",
    
    # The Last of Us Saga
    "The Last of Us",
    "The Last of Us Part II",
    
    # Red Dead Saga
    "Red Dead Revolver",
    "Red Dead Redemption",
    "Red Dead Redemption 2",
    
    # God of War Saga
    "God of War",
    "God of War II",
    "God of War III",
    "God of War: Ascension",
    "God of War (2018)",
    "God of War Ragnarok",
    
    # Elden Ring (Standalone)
    "Elden Ring",
    
    # Mass Effect Saga
    "Mass Effect",
    "Mass Effect 2",
    "Mass Effect 3",
    "Mass Effect: Andromeda",
    
    # Cyberpunk (Standalone)
    "Cyberpunk 2077",
    
    # Persona Saga (Main modern entries)
    "Persona 3 Reload",
    "Persona 4 Golden",
    "Persona 5 Royal",
    
    # Hollow Knight Saga
    "Hollow Knight",
    "Hollow Knight: Silksong",
    
    # Final Fantasy VII Remake Saga
    "Final Fantasy VII Remake",
    "Final Fantasy VII Rebirth"
)

foreach ($game in $games) {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Avvio estrazione per: $game" -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Cyan
    
    node .\scratch\populate_full_v2.mjs "$game"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Errore durante l'elaborazione di $game. Passo al successivo..." -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 5
}

Write-Host "Elaborazione batch completata!" -ForegroundColor Green
