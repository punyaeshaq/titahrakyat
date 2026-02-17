#!/bin/bash
set -e

echo "=========================================="
echo "  MySQL Database Setup"
echo "=========================================="

# 1. Create database and user
echo "[1/4] Creating MySQL database and user..."
sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS menarapublik CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'menarapublik'@'localhost' IDENTIFIED BY 'MenaraPublik2026!';
GRANT ALL PRIVILEGES ON menarapublik.* TO 'menarapublik'@'localhost';
FLUSH PRIVILEGES;
EOF
echo "  -> Database 'menarapublik' and user created"

# 2. Update .env with correct MySQL credentials
echo "[2/4] Updating .env..."
cd /var/www/menarapublik/server
sed -i 's/^DB_CONNECTION=.*/DB_CONNECTION=mysql/' .env
sed -i 's/^# DB_HOST=.*/DB_HOST=127.0.0.1/' .env
sed -i 's/^# DB_PORT=.*/DB_PORT=3306/' .env
sed -i 's/^# DB_DATABASE=.*/DB_DATABASE=menarapublik/' .env
sed -i 's/^# DB_USERNAME=.*/DB_USERNAME=menarapublik/' .env
sed -i "s/^# DB_PASSWORD=.*/DB_PASSWORD=MenaraPublik2026!/" .env

# Also fix if they are not commented
sed -i 's/^DB_HOST=.*/DB_HOST=127.0.0.1/' .env
sed -i 's/^DB_PORT=.*/DB_PORT=3306/' .env
sed -i 's/^DB_DATABASE=.*/DB_DATABASE=menarapublik/' .env
sed -i 's/^DB_USERNAME=.*/DB_USERNAME=menarapublik/' .env
sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=MenaraPublik2026!/" .env

echo "  -> .env updated with MySQL credentials"

# 3. Clear Laravel config cache and run migrations
echo "[3/4] Running migrations..."
php artisan config:clear
php artisan migrate --force
echo "  -> Migrations completed"

# 4. Seed database
echo "[4/4] Seeding database..."
php artisan db:seed --force
echo "  -> Database seeded"

echo ""
echo "=========================================="
echo "  Database Setup Complete!"
echo "=========================================="
