#!/bin/bash
###############################################################################
# TitahRakyat.com - Full VPS Deployment Script
# VPS: Ubuntu 20.04/22.04/24.04 | IP: 76.13.198.49
# Domain: titahrakyat.com
#
# CARA PAKAI:
# 1. SSH ke VPS: ssh root@76.13.198.49
# 2. Copy seluruh isi script ini
# 3. Paste di terminal VPS, atau:
#    nano deploy_vps.sh  → paste → save → chmod +x deploy_vps.sh → ./deploy_vps.sh
###############################################################################

set -e  # Stop on error

echo "============================================"
echo "  TitahRakyat.com - VPS Deployment"
echo "============================================"

# =============================================
# STEP 1: Update system & install dependencies
# =============================================
echo ""
echo "[1/8] Updating system & installing dependencies..."
apt update && apt upgrade -y

# Install Nginx
apt install -y nginx

# Install Node.js 20 LTS
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install PHP 8.2 + extensions for Laravel
apt install -y software-properties-common
add-apt-repository -y ppa:ondrej/php
apt update
apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-mysql php8.2-sqlite3 \
    php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip php8.2-bcmath \
    php8.2-gd php8.2-intl php8.2-tokenizer php8.2-fileinfo unzip git curl

# Install Composer
if ! command -v composer &> /dev/null; then
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
fi
echo "Composer version: $(composer --version)"

# Install MySQL
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

echo "[1/8] ✅ Dependencies installed!"

# =============================================
# STEP 2: Setup MySQL Database
# =============================================
echo ""
echo "[2/8] Setting up MySQL database..."

DB_NAME="titahrakyat"
DB_USER="titahrakyat_user"
DB_PASS="TitahRakyat2026!Secure"

mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

echo "[2/8] ✅ Database created!"

# =============================================
# STEP 3: Clone repository
# =============================================
echo ""
echo "[3/8] Cloning repository..."

APP_DIR="/var/www/titahrakyat"

# Remove old installation if exists
if [ -d "$APP_DIR" ]; then
    rm -rf "$APP_DIR"
fi

git clone https://github.com/punyaeshaq/titahrakyat.git "$APP_DIR"
cd "$APP_DIR"

echo "[3/8] ✅ Repository cloned!"

# =============================================
# STEP 4: Setup Laravel Backend
# =============================================
echo ""
echo "[4/8] Setting up Laravel backend..."

cd "$APP_DIR/server"

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Create .env file
cp .env.example .env

# Update .env with production values
cat > .env << 'ENVEOF'
APP_NAME=TitahRakyat
APP_ENV=production
APP_DEBUG=false
APP_URL=https://titahrakyat.com

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US
APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=titahrakyat
DB_USERNAME=titahrakyat_user
DB_PASSWORD=TitahRakyat2026!Secure

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=.titahrakyat.com

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=public
QUEUE_CONNECTION=database

CACHE_STORE=file

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@titahrakyat.com"
MAIL_FROM_NAME="TitahRakyat"

SANCTUM_STATEFUL_DOMAINS=titahrakyat.com,www.titahrakyat.com
ENVEOF

# Generate app key
php artisan key:generate --force

# Create storage link
php artisan storage:link

# Run migrations & seed
php artisan migrate --force
php artisan db:seed --force

# Cache config for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chown -R www-data:www-data "$APP_DIR/server"
chmod -R 755 "$APP_DIR/server"
chmod -R 775 "$APP_DIR/server/storage"
chmod -R 775 "$APP_DIR/server/bootstrap/cache"

echo "[4/8] ✅ Laravel backend configured!"

# =============================================
# STEP 5: Build Frontend
# =============================================
echo ""
echo "[5/8] Building frontend..."

cd "$APP_DIR"

# Create frontend .env for production build
cat > .env << 'ENVEOF'
VITE_SUPABASE_PROJECT_ID="kelfhykexsjhefrnempg"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlbGZoeWtleHNqaGVmcm5lbXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MDIzMzksImV4cCI6MjA4NjE3ODMzOX0.i6OUxxcuijvrbo90nvt6NdI9d-GR7n9GtSvQcr27iDk"
VITE_SUPABASE_URL="https://kelfhykexsjhefrnempg.supabase.co"
VITE_GOOGLE_CLIENT_ID="775028545771-n6m2rbl8d4e6gci1ijjrosmekf0f4mfn.apps.googleusercontent.com"
VITE_API_URL="https://titahrakyat.com/api"
ENVEOF

# Install Node dependencies & build
npm install
npm run build

echo "[5/8] ✅ Frontend built!"

# =============================================
# STEP 6: Configure Nginx
# =============================================
echo ""
echo "[6/8] Configuring Nginx..."

cat > /etc/nginx/sites-available/titahrakyat << 'NGINXEOF'
# titahrakyat.com - Nginx Configuration
# Frontend: Vite/React static files
# Backend: Laravel API via PHP-FPM

server {
    listen 80;
    listen [::]:80;
    server_name titahrakyat.com www.titahrakyat.com;

    # Frontend (React SPA)
    root /var/www/titahrakyat/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Laravel API routes
    location /api {
        alias /var/www/titahrakyat/server/public;
        try_files $uri $uri/ @laravel_api;

        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME /var/www/titahrakyat/server/public/index.php;
            include fastcgi_params;
            fastcgi_param REQUEST_URI $request_uri;
        }
    }

    location @laravel_api {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME /var/www/titahrakyat/server/public/index.php;
        include fastcgi_params;
        fastcgi_param REQUEST_URI $request_uri;
    }

    # ============================
    # OG Meta Tags for Social Media Bots (/berita/*)
    # When WhatsApp/Facebook/Twitter/etc. crawl a link, serve
    # server-rendered OG tags so the correct thumbnail appears.
    # ============================
    location ~ ^/berita/(.+)$ {
        set $is_social_bot 0;
        if ($http_user_agent ~* "facebookexternalhit|twitterbot|whatsapp|telegrambot|discordbot|linkedinbot|Slackbot|redditbot|Pinterest|Googlebot") {
            set $is_social_bot 1;
        }

        if ($is_social_bot = 1) {
            rewrite ^/berita/(.*)$ /bot-share/berita/$1 last;
        }

        # Regular users: serve React SPA
        root /var/www/titahrakyat/dist;
        try_files $uri $uri/ /index.html;
    }

    # Internal route for bot OG rendering (handled by Laravel)
    location /bot-share/berita/ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME /var/www/titahrakyat/server/public/index.php;
        fastcgi_param DOCUMENT_ROOT /var/www/titahrakyat/server/public;
        fastcgi_param REQUEST_URI $uri;
    }

    # Serve uploaded images (article thumbnails etc.)
    location /uploads/ {
        alias /var/www/titahrakyat/server/public/uploads/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Laravel storage/uploads
    location /storage {
        alias /var/www/titahrakyat/server/storage/app/public;
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Sitemap and RSS (handled by Laravel)
    location = /sitemap.xml {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME /var/www/titahrakyat/server/public/index.php;
        include fastcgi_params;
        fastcgi_param REQUEST_URI $request_uri;
    }

    location = /rss.xml {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME /var/www/titahrakyat/server/public/index.php;
        include fastcgi_params;
        fastcgi_param REQUEST_URI $request_uri;
    }

    # React SPA - all other routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Block access to hidden files
    location ~ /\. {
        deny all;
    }

    # PHP upload limits
    client_max_body_size 20M;
}
NGINXEOF

# Enable site
ln -sf /etc/nginx/sites-available/titahrakyat /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
nginx -t

# Restart services
systemctl restart php8.2-fpm
systemctl restart nginx

echo "[6/8] ✅ Nginx configured!"

# =============================================
# STEP 7: Setup SSL with Let's Encrypt
# =============================================
echo ""
echo "[7/8] Setting up SSL certificate..."

# Get SSL certificate (will auto-modify nginx config)
certbot --nginx -d titahrakyat.com -d www.titahrakyat.com --non-interactive --agree-tos --email admin@titahrakyat.com --redirect

# Auto-renew cron
systemctl enable certbot.timer

echo "[7/8] ✅ SSL configured!"

# =============================================
# STEP 8: Setup Firewall & Final touches
# =============================================
echo ""
echo "[8/8] Final setup..."

# Configure firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Setup log rotation
cat > /etc/logrotate.d/titahrakyat << 'LOGEOF'
/var/www/titahrakyat/server/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    sharedscripts
}
LOGEOF

# Create update script for future deploys
cat > /var/www/titahrakyat/update.sh << 'UPDATEEOF'
#!/bin/bash
# Quick update script - run after pushing to GitHub
cd /var/www/titahrakyat
git pull origin main

# Rebuild frontend
npm install
npm run build

# Update backend
cd server
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
chown -R www-data:www-data /var/www/titahrakyat/server
systemctl restart php8.2-fpm

echo "✅ Update complete!"
UPDATEEOF
chmod +x /var/www/titahrakyat/update.sh

echo "[8/8] ✅ Final setup complete!"

# =============================================
# DONE!
# =============================================
echo ""
echo "============================================"
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "  🌐 Website: https://titahrakyat.com"
echo "  🔧 API:     https://titahrakyat.com/api"
echo "  📁 Files:   /var/www/titahrakyat"
echo ""
echo "  📦 Database:"
echo "     Name:     ${DB_NAME}"
echo "     User:     ${DB_USER}"
echo "     Password: ${DB_PASS}"
echo ""
echo "  🔄 To update after pushing to GitHub:"
echo "     /var/www/titahrakyat/update.sh"
echo ""
echo "  ⚠️  PENTING:"
echo "     1. Update MAIL settings di /var/www/titahrakyat/server/.env"
echo "     2. Ganti DB password untuk keamanan"
echo "     3. DNS propagation bisa butuh 1-48 jam"
echo ""
echo "============================================"
