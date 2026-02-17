import paramiko
import os

VPS_IP = "72.61.208.98"
VPS_USER = "deploy"
VPS_PASS = "@Muhammadfatih123"

def run_sudo(ssh, cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    stdin.write(VPS_PASS + "\n")
    stdin.flush()
    print(stdout.read().decode())
    print(stderr.read().decode())

def deploy():
    print("Deploying Backend Controller...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS)
    sftp = ssh.open_sftp()

    local_file = r"server\app\Http\Controllers\Api\ArticleController.php"
    remote_tmp = "/tmp/ArticleController.php"
    remote_final = "/var/www/menarapublik/server/app/Http/Controllers/Api/ArticleController.php"

    print(f"Uploading {local_file} to tmp...")
    sftp.put(local_file, remote_tmp)

    print("Moving to final location and setting permissions...")
    run_sudo(ssh, f"sudo mv {remote_tmp} {remote_final}")
    run_sudo(ssh, f"sudo chown www-data:www-data {remote_final}")
    run_sudo(ssh, f"sudo chmod 644 {remote_final}")

    print("Restarting PHP-FPM (optional but good)...")
    try:
        run_sudo(ssh, "sudo systemctl reload php8.2-fpm")
    except:
        pass

    sftp.close()
    ssh.close()
    print("Backend Controller Deployed!")

if __name__ == "__main__":
    deploy()
