$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Deploy Fix for Infinite Refresh Loop" -ForegroundColor Cyan
Write-Host "=========================================="

# 1. VPS Details (Provided by User)
$vpsIp = "72.61.208.98"
$vpsUser = "root"
$password = "@Muhammadfatih123"

$targetHost = "$vpsUser@$vpsIp"

Write-Host "Target: $targetHost" -ForegroundColor Yellow
Write-Host "NOTE: Password is '$password'. You will need to type/paste it when prompted." -ForegroundColor Magenta


# 2. Upload Files
Write-Host "`n[1/3] Uploading modified files..." -ForegroundColor Green

# Upload Nginx Config to /tmp/
Write-Host "  -> Uploading nginx_menarapublik.conf..."
scp deploy\nginx_menarapublik.conf "${targetHost}:/tmp/nginx_menarapublik.conf"

# Upload web.php
Write-Host "  -> Uploading web.php..."
scp server\routes\web.php "${targetHost}:/var/www/menarapublik/server/routes/web.php"

# Upload og-article.blade.php
Write-Host "  -> Uploading og-article.blade.php..."
scp server\resources\views\og-article.blade.php "${targetHost}:/var/www/menarapublik/server/resources/views/og-article.blade.php"

# 3. Apply Changes via SSH
Write-Host "`n[2/3] Applying configuration on server..." -ForegroundColor Green

$commands = @(
    "echo 'Moving Nginx config...'",
    "cp /tmp/nginx_menarapublik.conf /etc/nginx/sites-available/menarapublik",
    "ln -sf /etc/nginx/sites-available/menarapublik /etc/nginx/sites-enabled/menarapublik", 
    "nginx -t", # Test config
    "systemctl reload nginx",
    "echo 'Nginx reloaded.'",
    "",
    "echo 'Clearing Laravel route cache...'",
    "cd /var/www/menarapublik/server",
    "php artisan route:clear",
    "php artisan view:clear",
    "echo 'Caches cleared.'"
)

# Join commands with && for safety, or ; for sequence
$remoteCommand = $commands -join " && "

ssh $targetHost $remoteCommand

Write-Host "`n[3/3] Fix Deployed Successfully!" -ForegroundColor Cyan
Write-Host "Try opening a shared link now!" -ForegroundColor Cyan
