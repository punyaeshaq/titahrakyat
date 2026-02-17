#!/usr/bin/env python3
"""Add max_width column to ads table via direct mysql command."""
import paramiko
import time

VPS_IP = "72.61.208.98"
VPS_USER = "deploy"
VPS_PASS = "@Muhammadfatih123"

def run_cmd(ssh, cmd, timeout=15):
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True, timeout=timeout)
    if "sudo" in cmd:
        time.sleep(0.3)
        stdin.write(VPS_PASS + "\n")
        stdin.flush()
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    return exit_code, out

def main():
    print("Connecting...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, allow_agent=False, look_for_keys=False)

    # First, get DB credentials from .env
    print("Reading .env for DB config...")
    code, out = run_cmd(ssh, "sudo cat /var/www/menarapublik/server/.env")
    
    db_name = db_user = db_pass = None
    for line in out.split("\n"):
        line = line.strip()
        if line.startswith("DB_DATABASE="):
            db_name = line.split("=", 1)[1]
        elif line.startswith("DB_USERNAME="):
            db_user = line.split("=", 1)[1]
        elif line.startswith("DB_PASSWORD="):
            db_pass = line.split("=", 1)[1]
    
    print(f"  DB: {db_name}, User: {db_user}")
    
    if not all([db_name, db_user]):
        print("ERROR: Could not read DB credentials")
        ssh.close()
        return

    # Run ALTER TABLE via mysql command
    sql = "ALTER TABLE ads ADD COLUMN max_width INT NULL DEFAULT NULL;"
    mysql_cmd = f'mysql -u {db_user} -p"{db_pass}" {db_name} -e "{sql}" 2>&1'
    
    print("Adding max_width column...")
    code, out = run_cmd(ssh, mysql_cmd)
    print(f"  Result (code={code}): {out[-300:]}")
    
    # Verify
    verify_sql = "SHOW COLUMNS FROM ads LIKE 'max_width';"
    verify_cmd = f'mysql -u {db_user} -p"{db_pass}" {db_name} -e "{verify_sql}" 2>&1'
    code, out = run_cmd(ssh, verify_cmd)
    print(f"  Verify: {out[-300:]}")

    ssh.close()
    print("Done!")

if __name__ == "__main__":
    main()
