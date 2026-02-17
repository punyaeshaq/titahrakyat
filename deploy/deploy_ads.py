#!/usr/bin/env python3
"""Deploy ad system to VPS - uses sudo for permissions."""
import paramiko
import os
import sys

VPS_IP = "72.61.208.98"
VPS_USER = "deploy"
VPS_PASS = "@Muhammadfatih123"
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REMOTE_BASE = "/var/www/menarapublik"

def run_cmd(ssh, cmd, password=None):
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True, timeout=120)
    if password and "sudo" in cmd:
        stdin.write(password + "\n")
        stdin.flush()
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    out_clean = '\n'.join(l for l in out.split('\n') if '[sudo]' not in l and 'password' not in l.lower()).strip()
    return exit_code, out_clean, err

def main():
    print("=" * 50)
    print("  Deploy: Ad System (Full)")
    print(f"  Target: {VPS_USER}@{VPS_IP}")
    print("=" * 50)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS,
                    timeout=30, banner_timeout=30, auth_timeout=30,
                    allow_agent=False, look_for_keys=False)
    except Exception as e:
        print(f"  ERROR: {e}")
        sys.exit(1)
    print("  -> Connected!")

    sftp = ssh.open_sftp()

    # Step 1: Upload backend files to /tmp first, then sudo move
    print("\n[1/5] Uploading backend files to /tmp...")
    backend_files = [
        ("server/database/migrations/2026_02_11_100001_create_ads_table.php",
         f"{REMOTE_BASE}/server/database/migrations/2026_02_11_100001_create_ads_table.php"),
        ("server/app/Models/Ad.php",
         f"{REMOTE_BASE}/server/app/Models/Ad.php"),
        ("server/app/Http/Controllers/Api/AdController.php",
         f"{REMOTE_BASE}/server/app/Http/Controllers/Api/AdController.php"),
        ("server/routes/api.php",
         f"{REMOTE_BASE}/server/routes/api.php"),
    ]
    
    for rel_path, remote_final in backend_files:
        local = os.path.join(PROJECT_DIR, rel_path.replace("/", os.sep))
        tmp_path = f"/tmp/deploy_{os.path.basename(rel_path)}"
        basename = os.path.basename(local)
        try:
            sftp.put(local, tmp_path)
            # Use sudo to copy to final location
            exit_code, out, err = run_cmd(ssh, f"sudo cp {tmp_path} {remote_final}", VPS_PASS)
            if exit_code == 0:
                print(f"  -> OK: {basename}")
            else:
                print(f"  ERROR: {basename}: {err}")
        except Exception as e:
            print(f"  ERROR: {basename}: {e}")

    # Step 2: Upload dist to /tmp, then sudo move
    print("\n[2/5] Uploading frontend dist to /tmp...")
    dist_dir = os.path.join(PROJECT_DIR, "dist")
    
    # Upload index.html
    sftp.put(os.path.join(dist_dir, "index.html"), "/tmp/deploy_index.html")
    print("  -> OK: index.html")

    # Upload assets
    assets_dir = os.path.join(dist_dir, "assets")
    asset_count = 0
    for item in os.listdir(assets_dir):
        local_path = os.path.join(assets_dir, item)
        if os.path.isfile(local_path):
            sftp.put(local_path, f"/tmp/deploy_asset_{item}")
            asset_count += 1
    print(f"  -> Uploaded {asset_count} asset files")

    # Other dist files
    for item in ["favicon.ico", "placeholder.svg", "robots.txt"]:
        local_path = os.path.join(dist_dir, item)
        if os.path.exists(local_path):
            sftp.put(local_path, f"/tmp/deploy_{item}")

    sftp.close()

    # Step 3: Use sudo to deploy files
    print("\n[3/5] Deploying files with sudo...")
    
    # Clean old assets and copy new ones
    deploy_cmds = [
        f"sudo rm -rf {REMOTE_BASE}/dist/assets/*",
        f"sudo cp /tmp/deploy_index.html {REMOTE_BASE}/dist/index.html",
        f"sudo cp /tmp/deploy_favicon.ico {REMOTE_BASE}/dist/favicon.ico 2>/dev/null; true",
        f"sudo cp /tmp/deploy_placeholder.svg {REMOTE_BASE}/dist/placeholder.svg 2>/dev/null; true",
        f"sudo cp /tmp/deploy_robots.txt {REMOTE_BASE}/dist/robots.txt 2>/dev/null; true",
    ]
    
    # Copy each asset file
    for item in os.listdir(assets_dir):
        if os.path.isfile(os.path.join(assets_dir, item)):
            deploy_cmds.append(f"sudo cp /tmp/deploy_asset_{item} {REMOTE_BASE}/dist/assets/{item}")
    
    # Fix ownership
    deploy_cmds.append(f"sudo chown -R www-data:www-data {REMOTE_BASE}/dist/")
    deploy_cmds.append(f"sudo chown -R www-data:www-data {REMOTE_BASE}/server/")
    
    for cmd in deploy_cmds:
        exit_code, out, err = run_cmd(ssh, cmd, VPS_PASS)
        if exit_code != 0 and "true" not in cmd:
            short = cmd.split("/")[-1] if "/" in cmd else cmd
            print(f"  WARN: {short}: exit={exit_code}")
    
    print("  -> Files deployed!")

    # Step 4: Run migrations and clear caches
    print("\n[4/5] Running migrations and clearing caches...")
    server_cmds = [
        f"cd {REMOTE_BASE}/server && php artisan migrate --force",
        f"cd {REMOTE_BASE}/server && php artisan route:clear",
        f"cd {REMOTE_BASE}/server && php artisan config:clear",
        f"cd {REMOTE_BASE}/server && php artisan cache:clear",
    ]
    for cmd in server_cmds:
        short = cmd.split("&&")[1].strip() if "&&" in cmd else cmd
        print(f"  $ {short}")
        exit_code, out, err = run_cmd(ssh, cmd)
        if out:
            print(f"    -> {out}")
        if exit_code != 0:
            print(f"    exit: {exit_code}, err: {err}")

    # Step 5: Reload nginx
    print("\n[5/5] Reloading nginx...")
    exit_code, out, err = run_cmd(ssh, "sudo systemctl reload nginx", VPS_PASS)
    if exit_code == 0:
        print("  -> Nginx reloaded!")
    else:
        print(f"  err: {err}")

    # Cleanup temp files
    run_cmd(ssh, "rm -f /tmp/deploy_*")

    ssh.close()
    print("\n" + "=" * 50)
    print("  DEPLOY COMPLETE!")
    print("  https://menarapublik.news")
    print("=" * 50)

if __name__ == "__main__":
    main()
