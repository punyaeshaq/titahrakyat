#!/usr/bin/env python3
"""Deploy Batch 2 Backend (Sitemap, RSS, Author Filter)."""
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

    files = [
        "server/app/Http/Controllers/Api/SitemapController.php",
        "server/app/Http/Controllers/Api/RssController.php",
        "server/app/Http/Controllers/Api/ArticleController.php",
        "server/routes/web.php",
        "server/resources/views/sitemap.blade.php",
        "server/resources/views/rss.blade.php"
    ]

    for f in files:
        local_path = os.path.join(PROJECT_DIR, f)
        remote_tmp = f"/tmp/{os.path.basename(f)}"
        remote_dest = f"{REMOTE_BASE}/{f}"
        
        print(f"Uploading {f}...")
        try:
            sftp.put(local_path, remote_tmp)
            run_sudo(ssh, f"sudo cp {remote_tmp} {remote_dest}")
            run_sudo(ssh, f"sudo chown www-data:www-data {remote_dest}")
        except Exception as e:
            print(f"Failed to upload {f}: {e}")

    # Clear cache
    print("Clearing cache...")
    run_sudo(ssh, f"cd {REMOTE_BASE}/server && sudo php artisan route:clear && sudo php artisan view:clear")

    sftp.close()
    ssh.close()
    print("Done!")

if __name__ == "__main__":
    deploy()
