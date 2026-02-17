#!/usr/bin/env python3
"""Check server state and deploy dist properly."""
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
    lines = [l for l in out.split('\n') if '[sudo]' not in l and 'password' not in l.lower()]
    return exit_code, '\n'.join(lines).strip()

def main():
    print("=" * 50)
    print("  Check & Fix Frontend Deploy")
    print("=" * 50)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS,
                timeout=30, allow_agent=False, look_for_keys=False)
    print("Connected!\n")

    sftp = ssh.open_sftp()

    # Step 1: Check current state
    print("[1] Checking current server state...")
    code, out = run_sudo(ssh, f"sudo head -5 {REMOTE_BASE}/dist/index.html")
    print(f"  Current index.html (first 5 lines):\n{out}\n")
    
    code, out = run_sudo(ssh, f"sudo ls {REMOTE_BASE}/dist/assets/")
    print(f"  Current assets:\n{out}\n")

    # Step 2: Upload new index.html directly via sftp to /tmp
    print("[2] Uploading new files to /tmp...")
    dist_dir = os.path.join(PROJECT_DIR, "dist")
    
    sftp.put(os.path.join(dist_dir, "index.html"), "/tmp/new_index.html")
    print("  -> index.html uploaded")
    
    assets_dir = os.path.join(dist_dir, "assets")
    asset_files = [f for f in os.listdir(assets_dir) if os.path.isfile(os.path.join(assets_dir, f))]
    for f in asset_files:
        sftp.put(os.path.join(assets_dir, f), f"/tmp/new_asset_{f}")
        print(f"  -> {f} uploaded")
    
    sftp.close()

    # Step 3: Deploy with sudo
    print("\n[3] Deploying with sudo...")
    
    # Remove old assets
    code, out = run_sudo(ssh, f"sudo rm -rf {REMOTE_BASE}/dist/assets/*")
    print(f"  -> Old assets removed (exit={code})")
    
    # Copy new index.html
    code, out = run_sudo(ssh, f"sudo cp /tmp/new_index.html {REMOTE_BASE}/dist/index.html")
    print(f"  -> index.html copied (exit={code})")
    
    # Copy new assets
    for f in asset_files:
        code, out = run_sudo(ssh, f"sudo cp /tmp/new_asset_{f} {REMOTE_BASE}/dist/assets/{f}")
        if code != 0:
            print(f"  ERROR: {f}: {out}")
        else:
            print(f"  -> {f} copied")
    
    # Fix permissions
    code, out = run_sudo(ssh, f"sudo chown -R www-data:www-data {REMOTE_BASE}/dist/")
    print(f"  -> Permissions fixed (exit={code})")
    
    # Step 4: Verify
    print("\n[4] Verifying...")
    code, out = run_sudo(ssh, f"sudo head -5 {REMOTE_BASE}/dist/index.html")
    print(f"  New index.html:\n{out}\n")
    
    code, out = run_sudo(ssh, f"sudo ls {REMOTE_BASE}/dist/assets/")
    print(f"  New assets:\n{out}\n")
    
    # Step 5: Reload nginx
    code, out = run_sudo(ssh, "sudo systemctl reload nginx")
    print(f"  -> Nginx reloaded (exit={code})")
    
    # Cleanup
    run_sudo(ssh, "rm -f /tmp/new_index.html /tmp/new_asset_*")
    
    ssh.close()
    print("\n" + "=" * 50)
    print("  DONE!")
    print("=" * 50)

if __name__ == "__main__":
    main()
