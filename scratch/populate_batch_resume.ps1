$games = @(
    "52370",     # Metal Gear Solid 2: Sons of Liberty (2001)
    "56122",     # Metal Gear Solid: The Twin Snakes (2004)
    "52369",     # Metal Gear Solid 3: Snake Eater (2004)
    "294121",    # Metal Gear Acid (2004)
    "294122",    # Metal Gear Acid 2 (2005)
    "5117",      # Metal Gear Solid: Portable Ops (2006)
    "3469",      # Metal Gear Solid 4: Guns of the Patriots (2008)
    "4107",      # Metal Gear Solid: Peace Walker (2010)
    "4094",      # Metal Gear Rising: Revengeance (2013)
    "3747",      # Metal Gear Solid V: Ground Zeroes (2014)
    "3192",      # Metal Gear Solid V: The Phantom Pain (2015)
    "51328",     # Metal Gear Survive (2018)
    "961198"     # Metal Gear Solid Delta: Snake Eater (2025)
)

$total = $games.Length
$current = 0

foreach ($gameId in $games) {
    $current++
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "🎮 Avvio SVISCERAMENTO (FLASH) per: $gameId ($current su $total)" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    node scratch\populate_full_v2.mjs $gameId
    
    if ($current -lt $total) {
        Write-Host ">>> Elaborazione ID: $gameId completata. Pausa anti-rate-limit 5s..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

Write-Host ">>> TUTTI I GIOCHI DI METAL GEAR (RESUME) COMPLETATI" -ForegroundColor Green
