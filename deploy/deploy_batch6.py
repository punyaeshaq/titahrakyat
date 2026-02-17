import paramiko
import os
import shutil
import time

VPS_IP = "72.61.208.98"
VPS_USER = "deploy"
VPS_PASS = "@Muhammadfatih123"

def run_sudo(ssh, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    stdin.write(VPS_PASS + "\n")
    stdin.flush()
    # Wait for completion
    while not stdout.channel.exit_status_ready():
        time.sleep(0.1)
    
    out = stdout.read().decode()
    # print(out) # debug
    return out

def deploy():
    print("Deploying Batch 6 (Backend + Frontend)...")
    
    # 1. Zip local dist
    if os.path.exists("dist.zip"):
        os.remove("dist.zip")
    
    print("Zipping dist folder...")
    shutil.make_archive("dist", 'zip', "dist")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS)
    sftp = ssh.open_sftp()

    # 2. Upload Backend Files
    backend_files = [
        (r"server\app\Http\Controllers\Api\PollController.php", "/var/www/menarapublik/server/app/Http/Controllers/Api/PollController.php"),
        (r"server\routes\api.php", "/var/www/menarapublik/server/routes/api.php"),
    ]

    print("Uploading backend files...")
    for local, remote in backend_files:
        if os.path.exists(local):
            filename = os.path.basename(local)
            print(f"Uploading {filename}...")
            sftp.put(local, f"/tmp/{filename}")
            run_sudo(ssh, f"sudo mv /tmp/{filename} {remote}")
            run_sudo(ssh, f"sudo chown www-data:www-data {remote}")
            run_sudo(ssh, f"sudo chmod 644 {remote}")
        else:
            print(f"ERROR: Local backend file missing: {local}")

    # 3. Upload Frontend Zip
    print("Uploading dist.zip...")
    sftp.put("dist.zip", "/tmp/dist.zip")
    
    # 4. Extract on VPS
    print("Extracting frontend on VPS...")
    # Clean temp extraction dir
    run_sudo(ssh, "rm -rf /tmp/new_dist")
    run_sudo(ssh, "mkdir -p /tmp/new_dist")
    
    # Unzip using python on remote (safer than unzip command)
    unzip_cmd = "python3 -c \"import zipfile; zipfile.ZipFile('/tmp/dist.zip').extractall('/tmp/new_dist')\""
    run_sudo(ssh, unzip_cmd)
    
    # Swap directories
    print("Swapping dist header...")
    run_sudo(ssh, "sudo rm -rf /var/www/menarapublik/dist_old")
    # Move current dist to old if exists
    run_sudo(ssh, "if [ -d /var/www/menarapublik/dist ]; then sudo mv /var/www/menarapublik/dist /var/www/menarapublik/dist_old; fi")
    # Move new dist to production
    run_sudo(ssh, "sudo mv /tmp/new_dist /var/www/menarapublik/dist")
    
    # Fix permissions
    print("Fixing permissions...")
    run_sudo(ssh, "sudo chown -R www-data:www-data /var/www/menarapublik/dist")
    run_sudo(ssh, "sudo chmod -R 755 /var/www/menarapublik/dist")
    
    # Optimize Backend (Routes)
    print("Optimizing backend...")
    run_sudo(ssh, "cd /var/www/menarapublik/server && sudo php artisan route:clear")
    # run_sudo(ssh, "cd /var/www/menarapublik/server && sudo php artisan config:clear") # optional

    # Cleanup local
    os.remove("dist.zip")
    sftp.close()
    ssh.close()
    print("Deployment Complete!")

if __name__ == "__main__":
    deploy()
