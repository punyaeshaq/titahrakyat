#!/bin/bash
set -e

echo "=========================================="
echo "  MenaraPublik.News Deploy Script"
echo "=========================================="

# 1. Copy new Nginx config
echo "[1/6] Updating Nginx config..."
sudo cp /tmp/nginx_menarapublik.conf /etc/nginx/sites-available/menarapublik

# Ensure symlink exists
sudo ln -sf /etc/nginx/sites-available/menarapublik /etc/nginx/sites-enabled/menarapublik

# Remove default if it exists and conflicts
sudo rm -f /etc/nginx/sites-enabled/default

# 2. Test Nginx config
echo "[2/6] Testing Nginx config..."
sudo nginx -t

# 3. Laravel setup
echo "[3/6] Setting up Laravel..."
cd /var/www/menarapublik/server

# Add FRONTEND_URL to .env if not present
if ! grep -q "FRONTEND_URL" .env; then
    echo "" >> .env
    echo "FRONTEND_URL=https://menarapublik.news" >> .env
    echo "  -> Added FRONTEND_URL to .env"
fi

# Create storage symlink if not exists
php artisan storage:link 2>/dev/null || true

# Clear all caches
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear

echo "  -> Laravel cache cleared"

# 4. Set proper permissions
echo "[4/6] Setting permissions..."
sudo chown -R www-data:www-data /var/www/menarapublik/server/storage
sudo chown -R www-data:www-data /var/www/menarapublik/server/bootstrap/cache
sudo chmod -R 775 /var/www/menarapublik/server/storage
sudo chmod -R 775 /var/www/menarapublik/server/bootstrap/cache

# Make sure dist folder is readable
sudo chown -R www-data:www-data /var/www/menarapublik/dist 2>/dev/null || true
sudo chmod -R 755 /var/www/menarapublik/dist 2>/dev/null || true

# 5. Restart services
echo "[5/6] Restarting services..."
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx

# 6. Verify
echo "[6/6] Verifying..."
echo "  Nginx status: $(systemctl is-active nginx)"
echo "  PHP-FPM status: $(systemctl is-active php8.2-fpm)"
echo "  MySQL status: $(systemctl is-active mysql)"

# Quick health check
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/articles 2>/dev/null || echo "failed")
echo "  API Health Check (GET /api/articles): $HTTP_CODE"

echo ""
echo "=========================================="
echo "  Deploy Complete!"
echo "  Website: https://menarapublik.news"
echo "=========================================="
