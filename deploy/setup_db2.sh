#!/bin/bash
set -e

echo "=== Step 1: MySQL Setup ==="
sudo mysql < /tmp/setup.sql

echo "=== Step 2: Update .env ==="
cd /var/www/menarapublik/server

# Backup current .env
cp .env .env.backup

# Write correct DB settings using python for reliability
python3 -c "
import re
with open('.env', 'r') as f:
    content = f.read()

# Remove commented DB lines
content = re.sub(r'^# DB_HOST=.*$', '', content, flags=re.MULTILINE)
content = re.sub(r'^# DB_PORT=.*$', '', content, flags=re.MULTILINE)
content = re.sub(r'^# DB_DATABASE=.*$', '', content, flags=re.MULTILINE)
content = re.sub(r'^# DB_USERNAME=.*$', '', content, flags=re.MULTILINE)
content = re.sub(r'^# DB_PASSWORD=.*$', '', content, flags=re.MULTILINE)

# Replace or add DB settings
content = re.sub(r'^DB_CONNECTION=.*$', 'DB_CONNECTION=mysql', content, flags=re.MULTILINE)

if 'DB_HOST=' not in content:
    content = content.replace('DB_CONNECTION=mysql', 'DB_CONNECTION=mysql\nDB_HOST=127.0.0.1\nDB_PORT=3306\nDB_DATABASE=menarapublik\nDB_USERNAME=menarapublik\nDB_PASSWORD=MenaraPublik2026!')
else:
    content = re.sub(r'^DB_HOST=.*$', 'DB_HOST=127.0.0.1', content, flags=re.MULTILINE)
    content = re.sub(r'^DB_PORT=.*$', 'DB_PORT=3306', content, flags=re.MULTILINE)
    content = re.sub(r'^DB_DATABASE=.*$', 'DB_DATABASE=menarapublik', content, flags=re.MULTILINE)
    content = re.sub(r'^DB_USERNAME=.*$', 'DB_USERNAME=menarapublik', content, flags=re.MULTILINE)
    content = re.sub(r'^DB_PASSWORD=.*$', 'DB_PASSWORD=MenaraPublik2026!', content, flags=re.MULTILINE)

with open('.env', 'w') as f:
    f.write(content)
print('  -> .env updated')
"

echo "=== Step 3: Clear cache ==="
php artisan config:clear
php artisan cache:clear 2>/dev/null || true

echo "=== Step 4: Run migrations ==="
php artisan migrate --force

echo "=== Step 5: Seed database ==="
php artisan db:seed --force

echo "=== ALL DONE ==="
