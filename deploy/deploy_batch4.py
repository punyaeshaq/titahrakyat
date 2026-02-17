#!/usr/bin/env python3
"""Deploy Batch 4 (Comment Upgrades)."""
import paramiko
import os

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
    return exit_code, out

def deploy():
    print("Connecting to VPS...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, allow_agent=False, look_for_keys=False)
    sftp = ssh.open_sftp()

    # 1. Upload Backend Files
    backend_files = [
        "server/database/migrations/2026_02_12_100005_upgrade_comments.php",
        "server/app/Models/Comment.php",
        "server/app/Models/CommentLike.php",
        "server/app/Models/CommentReport.php",
        "server/app/Http/Controllers/Api/CommentController.php",
        "server/routes/api.php"
    ]

    print("Uploading Backend Files...")
    for f in backend_files:
        local_path = os.path.join(PROJECT_DIR, f)
        remote_tmp = f"/tmp/{os.path.basename(f)}"
        remote_dest = f"{REMOTE_BASE}/{f}"
        
        print(f"  Uploading {f}...")
        try:
            sftp.put(local_path, remote_tmp)
            run_sudo(ssh, f"sudo cp {remote_tmp} {remote_dest}")
            run_sudo(ssh, f"sudo chown www-data:www-data {remote_dest}")
        except Exception as e:
            print(f"Failed to upload {f}: {e}")

    # 2. Run Migrations
    print("Running Migrations...")
    exit_code, out = run_sudo(ssh, f"cd {REMOTE_BASE}/server && sudo php artisan migrate --force")
    print(out)

    # 3. Upload Frontend Build (dist)
    print("Uploading Frontend Build...")
    dist_dir = os.path.join(PROJECT_DIR, "dist")
    
    # Upload index.html
    sftp.put(os.path.join(dist_dir, "index.html"), "/tmp/index.html")
    run_sudo(ssh, f"sudo cp /tmp/index.html {REMOTE_BASE}/dist/index.html")
    
    # Upload assets
    local_assets = os.path.join(dist_dir, "assets")
    remote_assets_tmp = "/tmp/assets_batch4"
    ssh.exec_command(f"rm -rf {remote_assets_tmp} && mkdir -p {remote_assets_tmp}")
    
    if os.path.exists(local_assets):
        for asset in os.listdir(local_assets):
            local_asset_path = os.path.join(local_assets, asset)
            if os.path.isfile(local_asset_path):
                sftp.put(local_asset_path, f"{remote_assets_tmp}/{asset}")
        
    print("  Syncing assets...")
    # Copy new assets to existing folder
    run_sudo(ssh, f"sudo cp -r {remote_assets_tmp}/* {REMOTE_BASE}/dist/assets/")
    
    # Fix permissions
    run_sudo(ssh, f"sudo chown -R www-data:www-data {REMOTE_BASE}/dist")

    # 4. Clear Backend Cache
    print("Clearing Backend Cache...")
    run_sudo(ssh, f"cd {REMOTE_BASE}/server && sudo php artisan route:clear && sudo php artisan config:clear")

    sftp.close()
    ssh.close()
    print("Done!")

if __name__ == "__main__":
    deploy()
