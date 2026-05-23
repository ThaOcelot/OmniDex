$games = @(
    "4108",     # Demon's Souls (2009)
    "5538",     # Dark Souls (2011)
    "3751",     # Dark Souls II (2014)
    "3387",     # Bloodborne (2015)
    "2551",     # Dark Souls III (2016)
    "50734",    # Sekiro: Shadows Die Twice (2019)
    "326243"    # Elden Ring (2022)
)

$total = $games.Length
$current = 0

foreach ($gameId in $games) {
    $current++
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "🎮 Avvio SVISCERAMENTO (SOULSBORNE) per: $gameId ($current su $total)" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    node scratch\populate_full.mjs $gameId
    
    if ($current -lt $total) {
        Write-Host ">>> Elaborazione ID: $gameId completata. Pausa anti-rate-limit 5s..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

Write-Host ">>> TUTTI I GIOCHI SOULSBORNE COMPLETATI" -ForegroundColor Green
