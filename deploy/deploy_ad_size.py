#!/usr/bin/env python3
"""Deploy ad max_width feature: migration + frontend."""
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

    # 1. Upload migration
    print("Uploading migration...")
    migration_file = "2026_02_17_100001_add_max_width_to_ads_table.php"
    local_path = os.path.join(PROJECT_DIR, "server", "database", "migrations", migration_file)
    remote_path = f"/tmp/{migration_file}"
    sftp.put(local_path, remote_path)
    run_sudo(ssh, f"sudo cp {remote_path} {REMOTE_BASE}/server/database/migrations/{migration_file}")
    run_sudo(ssh, f"sudo chown www-data:www-data {REMOTE_BASE}/server/database/migrations/{migration_file}")

    # 2. Upload updated model
    print("Uploading Ad model...")
    local_model = os.path.join(PROJECT_DIR, "server", "app", "Models", "Ad.php")
    sftp.put(local_model, "/tmp/Ad.php")
    run_sudo(ssh, f"sudo cp /tmp/Ad.php {REMOTE_BASE}/server/app/Models/Ad.php")
    run_sudo(ssh, f"sudo chown www-data:www-data {REMOTE_BASE}/server/app/Models/Ad.php")

    # 3. Upload updated controller
    print("Uploading AdController...")
    local_ctrl = os.path.join(PROJECT_DIR, "server", "app", "Http", "Controllers", "Api", "AdController.php")
    sftp.put(local_ctrl, "/tmp/AdController.php")
    run_sudo(ssh, f"sudo cp /tmp/AdController.php {REMOTE_BASE}/server/app/Http/Controllers/Api/AdController.php")
    run_sudo(ssh, f"sudo chown www-data:www-data {REMOTE_BASE}/server/app/Http/Controllers/Api/AdController.php")

    # 4. Run migration
    print("Running migration...")
    code, out = run_sudo(ssh, f"cd {REMOTE_BASE}/server && sudo php artisan migrate --force")
    print(f"  Migration: {out}")

    # 5. Clear cache
    print("Clearing cache...")
    run_sudo(ssh, f"cd {REMOTE_BASE}/server && sudo php artisan config:clear")
    run_sudo(ssh, f"cd {REMOTE_BASE}/server && sudo php artisan cache:clear")

    # 6. Upload frontend
    print("Uploading Frontend Build...")
    dist_dir = os.path.join(PROJECT_DIR, "dist")
    remote_tmp_dir = "/tmp/frontend_upload"
    ssh.exec_command(f"rm -rf {remote_tmp_dir} && mkdir -p {remote_tmp_dir}")

    def upload_dir(local_path, remote_path):
        for item in os.listdir(local_path):
            local_item = os.path.join(local_path, item)
            remote_item = f"{remote_path}/{item}"
            if os.path.isfile(local_item):
                sftp.put(local_item, remote_item)
            elif os.path.isdir(local_item):
                try:
                    sftp.mkdir(remote_item)
                except IOError:
                    pass
                upload_dir(local_item, remote_item)

    upload_dir(dist_dir, remote_tmp_dir)
    run_sudo(ssh, f"sudo cp -r {remote_tmp_dir}/* {REMOTE_BASE}/dist/")
    run_sudo(ssh, f"sudo chown -R www-data:www-data {REMOTE_BASE}/dist")

    sftp.close()
    ssh.close()
    print("Deploy Complete!")

if __name__ == "__main__":
    deploy()
