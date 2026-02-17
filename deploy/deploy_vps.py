#!/usr/bin/env python3
"""Deploy fix for infinite refresh loop to VPS - with verbose logging."""
import paramiko
import os
import sys
import logging

# Enable paramiko logging for debugging
logging.basicConfig(level=logging.DEBUG)
paramiko.util.log_to_file("paramiko_debug.log")

VPS_IP = "72.61.208.98"
VPS_USER = "deploy"
VPS_PASS = "@Muhammadfatih123"
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REMOTE_BASE = "/var/www/menarapublik"

def main():
    print("=" * 50)
    print("  Deploy Fix: Infinite Refresh Loop")
    print(f"  Target: {VPS_USER}@{VPS_IP}")
    print("=" * 50)

    # Connect SSH
    print(f"\n[1/3] Connecting to {VPS_IP} as '{VPS_USER}'...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(
            VPS_IP, 
            port=22,
            username=VPS_USER, 
            password=VPS_PASS, 
            timeout=30,
            banner_timeout=30,
            auth_timeout=30,
            allow_agent=False, 
            look_for_keys=False
        )
    except paramiko.AuthenticationException as e:
        print(f"  AUTH ERROR: {e}")
        sys.exit(1)
    except paramiko.SSHException as e:
        print(f"  SSH ERROR: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"  ERROR: {e}")
        sys.exit(1)
    print("  -> Connected!")

    # Upload files via SFTP
    print("\n[2/3] Uploading files...")
    sftp = ssh.open_sftp()

    files = [
        (os.path.join(PROJECT_DIR, "deploy", "nginx_menarapublik.conf"), "/tmp/nginx_menarapublik.conf"),
        (os.path.join(PROJECT_DIR, "server", "routes", "web.php"), f"{REMOTE_BASE}/server/routes/web.php"),
        (os.path.join(PROJECT_DIR, "server", "resources", "views", "og-article.blade.php"), f"{REMOTE_BASE}/server/resources/views/og-article.blade.php"),
    ]

    for local, remote in files:
        basename = os.path.basename(local)
        try:
            sftp.put(local, remote)
            print(f"  -> OK: {basename} -> {remote}")
        except Exception as e:
            print(f"  ERROR: {basename}: {e}")
            sftp.close()
            ssh.close()
            sys.exit(1)
    sftp.close()

    # Run commands
    print("\n[3/3] Applying changes on server...")
    commands = [
        "sudo cp /tmp/nginx_menarapublik.conf /etc/nginx/sites-available/menarapublik",
        "sudo ln -sf /etc/nginx/sites-available/menarapublik /etc/nginx/sites-enabled/menarapublik",
        "sudo nginx -t",
        "sudo systemctl reload nginx",
        f"cd {REMOTE_BASE}/server && php artisan route:clear",
        f"cd {REMOTE_BASE}/server && php artisan view:clear",
        f"cd {REMOTE_BASE}/server && php artisan config:clear",
    ]

    for cmd in commands:
        print(f"  $ {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True, timeout=30)
        if cmd.startswith("sudo"):
            stdin.write(VPS_PASS + "\n")
            stdin.flush()
        exit_code = stdout.channel.recv_exit_status()
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        # Filter sudo prompt noise
        out_clean = '\n'.join(l for l in out.split('\n') if '[sudo]' not in l and 'password' not in l.lower()).strip()
        if out_clean:
            print(f"    -> {out_clean}")
        if err:
            print(f"    err: {err}")
        if exit_code != 0:
            print(f"    exit: {exit_code}")
            if "nginx -t" in cmd:
                print("  CRITICAL: Nginx test FAILED! Stopping.")
                ssh.close()
                sys.exit(1)

    ssh.close()
    print("\n" + "=" * 50)
    print("  DEPLOY COMPLETE!")
    print("  https://menarapublik.news")
    print("=" * 50)

if __name__ == "__main__":
    main()
