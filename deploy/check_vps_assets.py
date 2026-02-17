#!/usr/bin/env python3
"""Check VPS Assets."""
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

def check_assets():
    print("Connecting to VPS...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, allow_agent=False, look_for_keys=False)
    
    with open("assets_list.txt", "w", encoding="utf-8") as f:
        f.write("--- Listing /var/www/menarapublik/dist/assets ---\n")
        _, out = run_sudo(ssh, "sudo ls -la /var/www/menarapublik/dist/assets")
        f.write(out + "\n\n")
        
        f.write("--- Reading /var/www/menarapublik/dist/index.html ---\n")
        _, out = run_sudo(ssh, "sudo cat /var/www/menarapublik/dist/index.html")
        f.write(out + "\n\n")

        f.write("--- Checking Nginx Error Log (Last 20 lines) ---\n")
        _, out = run_sudo(ssh, "sudo tail -n 20 /var/log/nginx/error.log")
        f.write(out + "\n")
    
    ssh.close()
    print("Output saved to assets_list.txt")

if __name__ == "__main__":
    check_assets()
