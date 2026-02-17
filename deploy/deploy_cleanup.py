import paramiko
import os

VPS_IP = "72.61.208.98"
VPS_USER = "deploy"
VPS_PASS = "@Muhammadfatih123"

def run_sudo(ssh, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    stdin.write(VPS_PASS + "\n")
    stdin.flush()
    print(stdout.read().decode())
    print(stderr.read().decode())

def deploy():
    print("Deploying Cleanup Fixes...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS)
    sftp = ssh.open_sftp()

    # Files to upload
    files_to_upload = [
        {
            "local": r"server\database\seeders\DatabaseSeeder.php",
            "remote": "/var/www/menarapublik/server/database/seeders/DatabaseSeeder.php"
        },
        {
            "local": r"server\resources\views\rss.blade.php",
            "remote": "/var/www/menarapublik/server/resources/views/rss.blade.php"
        },
        {
            "local": r"server\database\migrations\2024_01_01_000011_create_polls_tables.php",
            "remote": "/var/www/menarapublik/server/database/migrations/2024_01_01_000011_create_polls_tables.php"
        }
    ]

    for item in files_to_upload:
        print(f"Uploading {item['local']}...")
        if os.path.exists(item['local']):
            filename = os.path.basename(item['local'])
            tmp_path = f"/tmp/{filename}"
            
            # Upload to tmp
            sftp.put(item['local'], tmp_path)
            
            # Move to final destination
            print(f"Moving {filename} to {item['remote']}...")
            run_sudo(ssh, f"sudo mv {tmp_path} {item['remote']}")
            run_sudo(ssh, f"sudo chown www-data:www-data {item['remote']}")
            run_sudo(ssh, f"sudo chmod 644 {item['remote']}")
        else:
            print(f"ERROR: Local file not found: {item['local']}")

    sftp.close()
    ssh.close()
    print("Cleanup Fixes Deployed!")

if __name__ == "__main__":
    deploy()
