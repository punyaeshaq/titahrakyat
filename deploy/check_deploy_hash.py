import paramiko
import re
import os

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('72.61.208.98', username='deploy', password='@Muhammadfatih123', allow_agent=False, look_for_keys=False)

# Check index.html on VPS
stdin, stdout, stderr = ssh.exec_command('cat /var/www/menarapublik/dist/index.html')
vps_html = stdout.read().decode()
vps_js = re.findall(r'index-[a-zA-Z0-9]+\.js', vps_html)
vps_css = re.findall(r'index-[a-zA-Z0-9]+\.css', vps_html)
print(f"VPS JS hash: {vps_js}")
print(f"VPS CSS hash: {vps_css}")

# List JS files on VPS
stdin, stdout, stderr = ssh.exec_command('ls /var/www/menarapublik/dist/assets/index-*')
print(f"VPS asset files: {stdout.read().decode().strip()}")

# Check ProfileManager exists in JS bundle
js_name = vps_js[0] if vps_js else "none"
stdin, stdout, stderr = ssh.exec_command(f'grep -c "ProfileManager" /var/www/menarapublik/dist/assets/{js_name} 2>/dev/null || echo "NOT FOUND"')
print(f"ProfileManager in VPS JS: {stdout.read().decode().strip()}")

# Check Skeleton (animate-pulse) exists in CSS bundle
css_name = vps_css[0] if vps_css else "none"
stdin, stdout, stderr = ssh.exec_command(f'grep -c "animate-pulse" /var/www/menarapublik/dist/assets/{css_name} 2>/dev/null || echo "NOT FOUND"')
print(f"animate-pulse in VPS CSS: {stdout.read().decode().strip()}")

ssh.close()

# Check local
with open('dist/index.html', 'r') as f:
    local_html = f.read()
local_js = re.findall(r'index-[a-zA-Z0-9]+\.js', local_html)
local_css = re.findall(r'index-[a-zA-Z0-9]+\.css', local_html)
print(f"\nLocal JS hash: {local_js}")
print(f"Local CSS hash: {local_css}")

print(f"\nMATCH: {'YES' if vps_js == local_js else 'NO - DEPLOYMENT ISSUE!'}")
