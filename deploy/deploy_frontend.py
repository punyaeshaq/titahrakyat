#!/usr/bin/env python3
"""Deploy Frontend Only (Recursive)."""
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
    return exit_code, out

def deploy():
    print("Connecting to VPS...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, allow_agent=False, look_for_keys=False)
    sftp = ssh.open_sftp()

    print("Uploading Frontend Build (Recursive)...")
    dist_dir = os.path.join(PROJECT_DIR, "dist")
    
    # We will upload to /tmp/frontend, then sync to destination
    remote_tmp_dir = "/tmp/frontend_upload"
    ssh.exec_command(f"rm -rf {remote_tmp_dir} && mkdir -p {remote_tmp_dir}")
    
    # Recursive upload function
    def upload_dir(local_path, remote_path):
        for item in os.listdir(local_path):
            local_item = os.path.join(local_path, item)
            remote_item = f"{remote_path}/{item}"
            
            if os.path.isfile(local_item):
                print(f"  Uploading {item}...")
                sftp.put(local_item, remote_item)
            elif os.path.isdir(local_item):
                print(f"  Creating directory {item}...")
                try:
                    sftp.mkdir(remote_item)
                except IOError:
                    pass # Dir exists
                upload_dir(local_item, remote_item)

    upload_dir(dist_dir, remote_tmp_dir)
    
    print("  Syncing to production...")
    # Clean old dist? Maybe dangerous if backend depends on it? No, dist is static.
    # But let's overwrite.
    run_sudo(ssh, f"sudo cp -r {remote_tmp_dir}/* {REMOTE_BASE}/dist/")
    
    # Fix permissions
    run_sudo(ssh, f"sudo chown -R www-data:www-data {REMOTE_BASE}/dist")

    sftp.close()
    ssh.close()
    print("Deploy Complete!")

if __name__ == "__main__":
    deploy()
