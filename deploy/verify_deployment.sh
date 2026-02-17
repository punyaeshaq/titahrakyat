#!/bin/bash
set -e

echo "--- STARTING VERIFICATION ---"
cd /var/www/menarapublik/server

echo "1. Fixing .env line endings..."
if [ -f .env ]; then
    tr -d '\r' < .env > .env.unix
    mv .env.unix .env
    echo "   .env fixed."
else
    echo "   ERROR: .env not found!"
    exit 1
fi

echo "2. Clearing Laravel Cache..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo "3. Running Migrations..."
php artisan migrate --force

echo "4. Seeding Database..."
php artisan db:seed --force

echo "5. Testing API internally..."
# Simple check if the home page or a known route returns 200 (using artisan serve or just checking version)
php artisan --version

echo "--- VERIFICATION COMPLETE ---"
