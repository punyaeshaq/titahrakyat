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
    print("Deploying Batch 3 Fixes (Correct Permissions)...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS)
    sftp = ssh.open_sftp()

    # Files to upload
    files_to_upload = [
        # Migrations
        {
            "local": r"server\database\migrations\2024_01_01_000010_create_newsletter_subscribers_table.php",
            "remote": "/var/www/menarapublik/server/database/migrations/2024_01_01_000010_create_newsletter_subscribers_table.php"
        },
        {
            "local": r"server\database\migrations\2024_01_01_000011_create_polls_tables.php",
            "remote": "/var/www/menarapublik/server/database/migrations/2024_01_01_000011_create_polls_tables.php"
        },
        # Models
        {
            "local": r"server\app\Models\NewsletterSubscriber.php",
            "remote": "/var/www/menarapublik/server/app/Models/NewsletterSubscriber.php"
        },
        {
            "local": r"server\app\Models\Poll.php",
            "remote": "/var/www/menarapublik/server/app/Models/Poll.php"
        },
        {
            "local": r"server\app\Models\PollOption.php",
            "remote": "/var/www/menarapublik/server/app/Models/PollOption.php"
        },
        {
            "local": r"server\app\Models\PollVote.php",
            "remote": "/var/www/menarapublik/server/app/Models/PollVote.php"
        },
        # Seeders
        {
            "local": r"server\database\seeders\PollSeeder.php",
            "remote": "/var/www/menarapublik/server/database/seeders/PollSeeder.php"
        },
        {
            "local": r"server\database\seeders\DatabaseSeeder.php",
            "remote": "/var/www/menarapublik/server/database/seeders/DatabaseSeeder.php"
        },
        # Routes
        {
            "local": r"server\routes\api.php",
            "remote": "/var/www/menarapublik/server/routes/api.php"
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

    print("Running Migrations...")
    run_sudo(ssh, "cd /var/www/menarapublik/server && sudo -u www-data php artisan migrate --force")

    print("Running Poll Seeder...")
    run_sudo(ssh, "cd /var/www/menarapublik/server && sudo -u www-data php artisan db:seed --class=PollSeeder")
    
    # Also run cache clear just in case
    run_sudo(ssh, "cd /var/www/menarapublik/server && sudo -u www-data php artisan route:clear")

    sftp.close()
    ssh.close()
    print("Batch 3 Fixes Deployed!")

if __name__ == "__main__":
    deploy()
