#!/usr/bin/env python3
"""Deploy multi-position ad feature: backend + migration + frontend."""
import paramiko
import os
import sys
import time

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
    print("=" * 55)
    print("  Deploy: Multi-Position Ads Feature")
    print(f"  Target: {VPS_USER}@{VPS_IP}")
    print("=" * 55)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, allow_agent=False, look_for_keys=False)
    sftp = ssh.open_sftp()

    # 1. Upload backend files
    print("\n[1/5] Uploading backend files...")
    backend_files = [
        "server/database/migrations/2026_02_11_100001_create_ads_table.php",
        "server/database/migrations/2026_02_16_100001_change_ads_position_to_positions.php",
        "server/app/Models/Ad.php",
        "server/app/Http/Controllers/Api/AdController.php",
        "server/routes/api.php",
    ]
    for f in backend_files:
        local_path = os.path.join(PROJECT_DIR, f)
        if not os.path.exists(local_path):
            print(f"  SKIP (not found): {f}")
            continue
        remote_tmp = f"/tmp/{os.path.basename(f)}"
        remote_dest = f"{REMOTE_BASE}/{f}"
        print(f"  -> {os.path.basename(f)}")
        sftp.put(local_path, remote_tmp)
        # Ensure remote directory exists
        remote_dir = os.path.dirname(remote_dest).replace("\\", "/")
        run_sudo(ssh, f"sudo mkdir -p {remote_dir}")
        run_sudo(ssh, f"sudo cp {remote_tmp} {remote_dest}")
        run_sudo(ssh, f"sudo chown www-data:www-data {remote_dest}")

    # 2. Run migration
    print("\n[2/5] Running database migration...")
    exit_code, out = run_sudo(ssh, f"cd {REMOTE_BASE}/server && sudo php artisan migrate --force 2>&1")
    print(f"  -> {out}")

    # 3. Clean and upload frontend
    print("\n[3/5] Uploading frontend build...")
    run_sudo(ssh, f"sudo rm -rf {REMOTE_BASE}/dist/assets/*")
    dist_dir = os.path.join(PROJECT_DIR, "dist")
    sftp.put(os.path.join(dist_dir, "index.html"), "/tmp/index.html")
    run_sudo(ssh, f"sudo cp /tmp/index.html {REMOTE_BASE}/dist/index.html")

    local_assets = os.path.join(dist_dir, "assets")
    remote_tmp_assets = "/tmp/assets_multipos"
    ssh.exec_command(f"rm -rf {remote_tmp_assets} && mkdir -p {remote_tmp_assets}")
    time.sleep(1)

    for asset in os.listdir(local_assets):
        local_path = os.path.join(local_assets, asset)
        if os.path.isfile(local_path):
            sftp.put(local_path, f"{remote_tmp_assets}/{asset}")
    print("  -> Assets uploaded")

    run_sudo(ssh, f"sudo cp -r {remote_tmp_assets}/* {REMOTE_BASE}/dist/assets/")
    run_sudo(ssh, f"sudo chown -R www-data:www-data {REMOTE_BASE}/dist")

    # 4. Clear caches
    print("\n[4/5] Clearing caches...")
    run_sudo(ssh, f"cd {REMOTE_BASE}/server && sudo php artisan route:clear && sudo php artisan config:clear && sudo php artisan cache:clear")

    # 5. Reload nginx
    print("\n[5/5] Reloading nginx...")
    run_sudo(ssh, "sudo systemctl reload nginx")

    sftp.close()
    ssh.close()
    print("\n" + "=" * 55)
    print("  DEPLOY COMPLETE!")
    print("  https://menarapublik.news/admin#ads")
    print("=" * 55)

if __name__ == "__main__":
    main()
