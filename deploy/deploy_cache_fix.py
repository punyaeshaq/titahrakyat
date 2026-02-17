#!/usr/bin/env python3
"""Fix browser caching: add no-cache for index.html, clean old assets."""
import paramiko
import os
import sys

VPS_IP = "72.61.208.98"
VPS_USER = "deploy"
VPS_PASS = "@Muhammadfatih123"
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REMOTE_BASE = "/var/www/menarapublik"

def run_sudo(ssh, cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True, timeout=60)
    if "sudo" in cmd:
        stdin.write(VPS_PASS + "\n")
        stdin.flush()
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    out_clean = '\n'.join(l for l in out.split('\n') if '[sudo]' not in l and 'password' not in l.lower()).strip()
    return exit_code, out_clean

def main():
    print("=" * 50)
    print("  Fix: Browser Cache + Clean Old Assets")
    print("=" * 50)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, allow_agent=False, look_for_keys=False)
    sftp = ssh.open_sftp()

    # 1. Write updated nginx config with cache control
    print("\n[1/4] Updating nginx config with cache control...")
    nginx_conf = r"""server {
    listen 443 ssl http2;
    server_name menarapublik.news www.menarapublik.news;
    client_max_body_size 64M;

    ssl_certificate /etc/letsencrypt/live/menarapublik.news/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/menarapublik.news/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # ============================
    # Laravel API (/api/*)
    # ============================
    location /api/ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME /var/www/menarapublik/server/public/index.php;
        fastcgi_param DOCUMENT_ROOT /var/www/menarapublik/server/public;
        fastcgi_param REQUEST_URI $request_uri;
    }

    # ============================
    # OG Meta Tags for Social Media (/berita/*)
    # ============================
    location ~ ^/berita/(.+)$ {
        set $is_social_bot 0;
        if ($http_user_agent ~* "facebookexternalhit|twitterbot|whatsapp|telegrambot|discordbot|linkedinbot") {
            set $is_social_bot 1;
        }

        if ($is_social_bot = 1) {
            rewrite ^/berita/(.*)$ /bot-share/berita/$1 last;
        }

        root /var/www/menarapublik/dist;
        try_files $uri $uri/ /index.html;
    }

    # Internal location for Bot Share (handled by Laravel)
    location /bot-share/berita/ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME /var/www/menarapublik/server/public/index.php;
        fastcgi_param DOCUMENT_ROOT /var/www/menarapublik/server/public;
        fastcgi_param REQUEST_URI $uri;
    }

    # ============================
    # Storage/Uploads
    # ============================
    location /storage {
        alias /var/www/menarapublik/server/storage/app/public;
        try_files $uri $uri/ =404;
    }

    # Serve uploads from backend storage
    location /uploads/ {
        alias /var/www/menarapublik/server/public/uploads/;
        access_log off;
        expires max;
    }

    # Serve storage from backend storage (if linked)
    location /storage/ {
        alias /var/www/menarapublik/server/public/storage/;
        access_log off;
        expires max;
    }

    # ============================
    # Static assets with long cache (hashed filenames)
    # ============================
    location /assets/ {
        root /var/www/menarapublik/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # ============================
    # Frontend SPA - index.html NEVER cached
    # ============================
    location / {
        root /var/www/menarapublik/dist;
        try_files $uri $uri/ /index.html;

        # Prevent browser from caching index.html
        location = /index.html {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }
    }

    # Deny access to hidden files
    location ~ /\.ht {
        deny all;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name menarapublik.news www.menarapublik.news;
    client_max_body_size 64M;
    return 301 https://$host$request_uri;
}
"""

    # Write nginx config to temp file
    with sftp.open("/tmp/nginx_menarapublik_fix.conf", "w") as f:
        f.write(nginx_conf)

    run_sudo(ssh, "sudo cp /tmp/nginx_menarapublik_fix.conf /etc/nginx/sites-available/menarapublik")
    run_sudo(ssh, "sudo ln -sf /etc/nginx/sites-available/menarapublik /etc/nginx/sites-enabled/menarapublik")

    # 2. Test nginx config
    print("\n[2/4] Testing nginx config...")
    exit_code, out = run_sudo(ssh, "sudo nginx -t")
    print(f"  -> {out}")
    if exit_code != 0:
        print("  CRITICAL: Nginx test FAILED!")
        ssh.close()
        sys.exit(1)

    # 3. Clean old assets and re-upload fresh
    print("\n[3/4] Cleaning old assets and uploading fresh build...")
    run_sudo(ssh, f"sudo rm -rf {REMOTE_BASE}/dist/assets/*")

    dist_dir = os.path.join(PROJECT_DIR, "dist")

    # Upload index.html
    sftp.put(os.path.join(dist_dir, "index.html"), "/tmp/index.html")
    run_sudo(ssh, f"sudo cp /tmp/index.html {REMOTE_BASE}/dist/index.html")

    # Upload assets
    local_assets = os.path.join(dist_dir, "assets")
    remote_assets_tmp = "/tmp/assets_cache_fix"
    ssh.exec_command(f"rm -rf {remote_assets_tmp} && mkdir -p {remote_assets_tmp}")
    import time
    time.sleep(1)

    for asset in os.listdir(local_assets):
        local_asset_path = os.path.join(local_assets, asset)
        if os.path.isfile(local_asset_path):
            sftp.put(local_asset_path, f"{remote_assets_tmp}/{asset}")
            print(f"  -> {asset}")

    run_sudo(ssh, f"sudo cp -r {remote_assets_tmp}/* {REMOTE_BASE}/dist/assets/")
    run_sudo(ssh, f"sudo chown -R www-data:www-data {REMOTE_BASE}/dist")

    # 4. Reload nginx
    print("\n[4/4] Reloading nginx...")
    exit_code, out = run_sudo(ssh, "sudo systemctl reload nginx")
    print(f"  -> {out if out else 'OK'}")

    sftp.close()
    ssh.close()
    print("\n" + "=" * 50)
    print("  DONE! Browser cache issue fixed.")
    print("  Normal refresh will now load the latest version.")
    print("  https://menarapublik.news")
    print("=" * 50)

if __name__ == "__main__":
    main()
