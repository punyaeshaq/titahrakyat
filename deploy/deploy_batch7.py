import paramiko
import os
import shutil
import time

VPS_IP = "72.61.208.98"
VPS_USER = "deploy"
VPS_PASS = "@Muhammadfatih123"

def run_sudo(ssh, cmd):
    print(f"  > {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    stdin.write(VPS_PASS + "\n")
    stdin.flush()
    while not stdout.channel.exit_status_ready():
        time.sleep(0.1)
    out = stdout.read().decode()
    return out

def deploy():
    print("=" * 50)
    print("Deploying Batch 7 (Optimization & Bug Fixes)")
    print("=" * 50)

    # 1. Build frontend
    print("\n[1/5] Building frontend...")
    ret = os.system("npm run build")
    if ret != 0:
        print("ERROR: Frontend build failed!")
        return

    # 2. Zip dist (from INSIDE dist folder, so files are at root level)
    print("\n[2/5] Zipping dist folder...")
    if os.path.exists("dist.zip"):
        os.remove("dist.zip")
    shutil.make_archive("dist", "zip", "dist")
    size_mb = os.path.getsize("dist.zip") / (1024 * 1024)
    print(f"  dist.zip created ({size_mb:.1f} MB)")

    # 3. Connect to VPS
    print("\n[3/5] Connecting to VPS...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS)
    sftp = ssh.open_sftp()
    print("  Connected!")

    # 4. Upload backend files
    print("\n[4/5] Uploading backend files...")
    backend_files = [
        (r"server\routes\api.php", "/var/www/menarapublik/server/routes/api.php"),
        (r"server\app\Http\Controllers\Api\AuthController.php", "/var/www/menarapublik/server/app/Http/Controllers/Api/AuthController.php"),
        (r"server\app\Http\Controllers\Api\UploadController.php", "/var/www/menarapublik/server/app/Http/Controllers/Api/UploadController.php"),
    ]

    for local, remote in backend_files:
        if os.path.exists(local):
            filename = os.path.basename(local)
            print(f"  Uploading {filename}...")
            sftp.put(local, f"/tmp/{filename}")
            run_sudo(ssh, f"sudo mv /tmp/{filename} {remote}")
            run_sudo(ssh, f"sudo chown www-data:www-data {remote}")
            run_sudo(ssh, f"sudo chmod 644 {remote}")
        else:
            print(f"  WARNING: Local file missing: {local}")

    # 5. Upload and deploy frontend
    print("\n[5/5] Uploading and deploying frontend...")
    print("  Uploading dist.zip...")
    sftp.put("dist.zip", "/tmp/dist.zip")
    print("  Upload complete!")

    print("  Extracting on VPS...")
    run_sudo(ssh, "rm -rf /tmp/new_dist")
    run_sudo(ssh, "mkdir -p /tmp/new_dist")
    run_sudo(ssh, "python3 -c \"import zipfile; zipfile.ZipFile('/tmp/dist.zip').extractall('/tmp/new_dist')\"")

    print("  Swapping directories...")
    run_sudo(ssh, "sudo rm -rf /var/www/menarapublik/dist_old")
    run_sudo(ssh, "if [ -d /var/www/menarapublik/dist ]; then sudo mv /var/www/menarapublik/dist /var/www/menarapublik/dist_old; fi")
    run_sudo(ssh, "sudo mv /tmp/new_dist /var/www/menarapublik/dist")

    print("  Fixing permissions...")
    run_sudo(ssh, "sudo chown -R www-data:www-data /var/www/menarapublik/dist")
    run_sudo(ssh, "sudo chmod -R 755 /var/www/menarapublik/dist")

    print("  Clearing Laravel caches...")
    run_sudo(ssh, "cd /var/www/menarapublik/server && sudo php artisan route:clear")
    run_sudo(ssh, "cd /var/www/menarapublik/server && sudo php artisan config:clear")
    run_sudo(ssh, "cd /var/www/menarapublik/server && sudo php artisan cache:clear")

    # Cleanup
    sftp.close()
    ssh.close()
    if os.path.exists("dist.zip"):
        os.remove("dist.zip")

    print("\n" + "=" * 50)
    print("Deployment Complete!")
    print("Check: https://menarapublik.news")
    print("=" * 50)

if __name__ == "__main__":
    deploy()
