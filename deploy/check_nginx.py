#!/usr/bin/env python3
"""Check Nginx Config."""
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

def check_nginx():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, allow_agent=False, look_for_keys=False)
    
    print("--- Listing sites-enabled ---")
    _, out = run_sudo(ssh, "ls /etc/nginx/sites-enabled/")
    print(out)
    
    # Try different possible filenames if menarapublik is not found
    sites = out.split()
    target_site = None
    if "menarapublik" in sites:
        target_site = "menarapublik"
    elif "default" in sites:
        target_site = "default"
    
    if target_site:
        with open("nginx_config.txt", "w", encoding="utf-8") as f:
            f.write(f"--- Reading {target_site} config ---\n")
            _, out = run_sudo(ssh, f"cat /etc/nginx/sites-enabled/{target_site}")
            f.write(out)
        print("Output saved to nginx_config.txt")
    
    ssh.close()

if __name__ == "__main__":
    check_nginx()
