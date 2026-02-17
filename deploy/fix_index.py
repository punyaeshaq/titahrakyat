#!/usr/bin/env python3
"""Fix deploy - use sftp put to /tmp then sudo tee for index.html."""
import paramiko
import os

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

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS,
            timeout=30, allow_agent=False, look_for_keys=False)
print("Connected!")

sftp = ssh.open_sftp()

# Step 1: Upload index.html to /tmp
dist_dir = os.path.join(PROJECT_DIR, "dist")
print("\n[1] Uploading index.html to /tmp...")
sftp.put(os.path.join(dist_dir, "index.html"), "/tmp/menarapublik_index.html")
print("  -> Done")

# Step 2: Upload all assets to /tmp
print("\n[2] Uploading assets to /tmp...")
assets_dir = os.path.join(dist_dir, "assets")
asset_files = []
for f in os.listdir(assets_dir):
    local = os.path.join(assets_dir, f)
    if os.path.isfile(local):
        remote_tmp = f"/tmp/mp_asset_{f}"
        sftp.put(local, remote_tmp)
        asset_files.append((f, remote_tmp))
        print(f"  -> {f}")
sftp.close()

# Step 3: Use sudo to overwrite files
print("\n[3] Deploying with sudo...")

# Copy index.html
code, out = run_sudo(ssh, f"sudo cp /tmp/menarapublik_index.html {REMOTE_BASE}/dist/index.html")
print(f"  index.html: exit={code}")

# Remove old assets
code, out = run_sudo(ssh, f"sudo rm -f {REMOTE_BASE}/dist/assets/index-*.js {REMOTE_BASE}/dist/assets/index-*.css")
print(f"  Old indexes removed: exit={code}")

# Copy new assets
for fname, tmp_path in asset_files:
    code, out = run_sudo(ssh, f"sudo cp {tmp_path} {REMOTE_BASE}/dist/assets/{fname}")
    print(f"  {fname}: exit={code}")

# Fix ownership
code, out = run_sudo(ssh, f"sudo chown -R www-data:www-data {REMOTE_BASE}/dist/")
print(f"  Ownership fixed: exit={code}")

# Step 4: Verify
print("\n[4] Verifying...")
code, out = run_sudo(ssh, f"sudo grep -o 'index-[^\"]*' {REMOTE_BASE}/dist/index.html")
print(f"  index.html references: {out}")

code, out = run_sudo(ssh, f"sudo ls {REMOTE_BASE}/dist/assets/ | grep index")
print(f"  Assets on disk: {out}")

# Check they match
html_refs = set(out.strip().split('\n')) if out else set()
disk_files = set()
code2, out2 = run_sudo(ssh, f"sudo ls {REMOTE_BASE}/dist/assets/ | grep index")
if out2:
    disk_files = set(out2.strip().split('\n'))

# Step 5: Reload nginx
code, out = run_sudo(ssh, "sudo systemctl reload nginx")
print(f"\n  Nginx reloaded: exit={code}")

# Cleanup temp files
run_sudo(ssh, "rm -f /tmp/menarapublik_index.html /tmp/mp_asset_*")

ssh.close()
print("\nDone! Check https://menarapublik.news")
