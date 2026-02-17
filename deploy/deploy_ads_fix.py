#!/usr/bin/env python3
"""Deploy ad feature fixes: frontend + migration."""
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
    err = stderr.read().decode().strip()
    # Filter sudo prompt noise
    out_clean = '\n'.join(l for l in out.split('\n') if '[sudo]' not in l and 'password' not in l.lower()).strip()
    return exit_code, out_clean, err

def main():
    print("=" * 50)
    print("  Deploy: Ad Feature Fixes")
    print(f"  Target: {VPS_USER}@{VPS_IP}")
    print("=" * 50)

    # Connect
    print(f"\n[1/5] Connecting to {VPS_IP}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, allow_agent=False, look_for_keys=False)
    sftp = ssh.open_sftp()
    print("  -> Connected!")

    # 2. Upload backend files (migration + controller)
    print("\n[2/5] Uploading backend files...")
    backend_files = [
        "server/database/migrations/2026_02_11_100001_create_ads_table.php",
        "server/app/Models/Ad.php",
        "server/app/Http/Controllers/Api/AdController.php",
        "server/routes/api.php",
    ]
    for f in backend_files:
        local_path = os.path.join(PROJECT_DIR, f)
        remote_tmp = f"/tmp/{os.path.basename(f)}"
        remote_dest = f"{REMOTE_BASE}/{f}"
        print(f"  Uploading {os.path.basename(f)}...")
        sftp.put(local_path, remote_tmp)
        run_sudo(ssh, f"sudo cp {remote_tmp} {remote_dest}")
        run_sudo(ssh, f"sudo chown www-data:www-data {remote_dest}")

    # 3. Run migration
    print("\n[3/5] Running database migration...")
    exit_code, out, err = run_sudo(ssh, f"cd {REMOTE_BASE}/server && sudo php artisan migrate --force")
    print(f"  -> {out}")
    if err:
        print(f"  err: {err}")

    # 4. Upload Frontend Build
    print("\n[4/5] Uploading frontend build...")
    dist_dir = os.path.join(PROJECT_DIR, "dist")

    # Upload index.html
    sftp.put(os.path.join(dist_dir, "index.html"), "/tmp/index.html")
    run_sudo(ssh, f"sudo cp /tmp/index.html {REMOTE_BASE}/dist/index.html")

    # Upload assets
    local_assets = os.path.join(dist_dir, "assets")
    remote_assets_tmp = "/tmp/assets_deploy"
    ssh.exec_command(f"rm -rf {remote_assets_tmp} && mkdir -p {remote_assets_tmp}")
    import time
    time.sleep(1)

    for asset in os.listdir(local_assets):
        local_asset_path = os.path.join(local_assets, asset)
        if os.path.isfile(local_asset_path):
            sftp.put(local_asset_path, f"{remote_assets_tmp}/{asset}")

    print("  Syncing assets...")
    run_sudo(ssh, f"sudo cp -r {remote_assets_tmp}/* {REMOTE_BASE}/dist/assets/")
    run_sudo(ssh, f"sudo chown -R www-data:www-data {REMOTE_BASE}/dist")

    # 5. Clear cache
    print("\n[5/5] Clearing caches...")
    run_sudo(ssh, f"cd {REMOTE_BASE}/server && sudo php artisan route:clear && sudo php artisan config:clear && sudo php artisan cache:clear")

    sftp.close()
    ssh.close()
    print("\n" + "=" * 50)
    print("  DEPLOY COMPLETE!")
    print("  https://menarapublik.news")
    print("=" * 50)

if __name__ == "__main__":
    main()
