#!/usr/bin/env python3
"""Fix Permissions."""
import paramiko
import os

VPS_IP = "72.61.208.98"
VPS_USER = "deploy"
VPS_PASS = "@Muhammadfatih123"

def run_sudo(ssh, cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True, timeout=60)
    if "sudo" in cmd:
        stdin.write(VPS_PASS + "\n")
        stdin.flush()
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    return exit_code, out

def fix_permissions():
    print("Connecting to VPS...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, allow_agent=False, look_for_keys=False)
    
    print("Fixing permissions for /var/www/menarapublik/dist ...")
    # Directories 755
    run_sudo(ssh, "sudo find /var/www/menarapublik/dist -type d -exec chmod 755 {} +")
    # Files 644
    run_sudo(ssh, "sudo find /var/www/menarapublik/dist -type f -exec chmod 644 {} +")
    # Ensure ownership
    run_sudo(ssh, "sudo chown -R www-data:www-data /var/www/menarapublik/dist")
    
    print("Restarting Nginx...")
    run_sudo(ssh, "sudo systemctl restart nginx")
    
    ssh.close()
    print("Permissions fixed and Nginx restarted.")

if __name__ == "__main__":
    fix_permissions()
