$games = @(
    "53478",     # Silent Hill (1999)
    "29642",     # Silent Hill 2 (2001)
    "35314",     # Silent Hill 3 (2003)
    "35985",     # Silent Hill 4: The Room (2004)
    "39038",     # Silent Hill: Origins (2007)
    "19372",     # Silent Hill: Homecoming (2008)
    "26226",     # Silent Hill: Shattered Memories (2009)
    "29082",     # Silent Hill: Downpour (2012)
    "4230",      # Silent Hill: Book of Memories (2012)
    "28268",     # Silent Hill HD Collection (2012)
    "976007",    # Silent Hill: The Short Message (2024)
    "868086",    # Silent Hill 2 Remake (2024)
    "868087"     # Silent Hill f (2025)
)

$total = $games.Length
$current = 0

foreach ($gameId in $games) {
    $current++
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "🎮 Avvio SVISCERAMENTO (SILENT HILL) per: $gameId ($current su $total)" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    node scratch\populate_full.mjs $gameId
    
    if ($current -lt $total) {
        Write-Host ">>> Elaborazione ID: $gameId completata. Pausa anti-rate-limit 5s..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

Write-Host ">>> TUTTI I GIOCHI DI SILENT HILL COMPLETATI" -ForegroundColor Green
