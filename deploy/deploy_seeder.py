#!/usr/bin/env python3
"""Deploy DatabaseSeeder.php."""
import paramiko
import os
import sys

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

def main():
    print("Deploying DatabaseSeeder.php...")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, allow_agent=False, look_for_keys=False)
    
    sftp = ssh.open_sftp()
    
    # Upload DatabaseSeeder.php
    local_path = os.path.join(PROJECT_DIR, "server/database/seeders/DatabaseSeeder.php")
    remote_tmp = "/tmp/DatabaseSeeder.php"
    
    print(f"Uploading {local_path}...")
    sftp.put(local_path, remote_tmp)
    
    # Move to correct location
    print("Moving file...")
    run_sudo(ssh, f"sudo cp {remote_tmp} {REMOTE_BASE}/server/database/seeders/DatabaseSeeder.php")
    
    sftp.close()
    ssh.close()
    print("Done!")

if __name__ == "__main__":
    main()
