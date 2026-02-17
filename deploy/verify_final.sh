#!/bin/bash
set -e

echo "=== FINAL VERIFICATION ==="
cd /var/www/menarapublik/server

# 1. Update .env with new password
# We use single quotes around the sed expression to protect the !
sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD='M3n4r4Publik_2026!'/" .env

# 2. Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# 3. Migrate and Seed
echo "Migrating..."
php artisan migrate --force

echo "Seeding..."
php artisan db:seed --force

echo "=== SUCCESS ==="
