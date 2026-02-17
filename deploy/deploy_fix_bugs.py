import os
import paramiko

def load_env(env_path):
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    key, value = line.strip().split("=", 1)
                    env_vars[key] = value.strip('"').strip("'")
    return env_vars

# Load environment variables
env = load_env("deploy/production.env")

VPS_IP = env.get("VPS_IP")
VPS_USER = env.get("VPS_USER")
VPS_PASS = env.get("VPS_PASS")

def create_ssh_client():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(VPS_IP, username=VPS_USER, password=VPS_PASS)
    return client

def main():
    print("Starting Bug Fix Deployment (SFTP, no deps)...")
    ssh = create_ssh_client()
    sftp = ssh.open_sftp()

    # 1. Upload Backend Controller
    print("Uploading ArticleController.php...")
    local_controller = r"server\app\Http\Controllers\Api\ArticleController.php"
    remote_controller = "/var/www/menarapublik/server/app/Http/Controllers/Api/ArticleController.php"
    sftp.put(local_controller, remote_controller)
    print("Controller uploaded.")

    # 2. Build Frontend
    print("Building Frontend...")
    os.system("npm run build")
    
    # 3. Upload Frontend
    print("Uploading Frontend (dist)...")
    
    local_path = "dist"
    remote_path = "/var/www/menarapublik/client"

    # Recursive upload using SFTP
    for root, dirs, files in os.walk(local_path):
        # Create remote directories
        relative_path = os.path.relpath(root, local_path)
        if relative_path == ".":
            remote_root = remote_path
        else:
            remote_root = remote_path + "/" + relative_path.replace("\\", "/")
        
        try:
            sftp.stat(remote_root)
        except IOError:
            sftp.mkdir(remote_root)

        for file in files:
            local_file = os.path.join(root, file)
            remote_file = remote_root + "/" + file
            # print(f"Uploading {file}...")
            sftp.put(local_file, remote_file)

    print("Frontend uploaded.")

    sftp.close()
    ssh.close()
    print("Deployment Complete!")

if __name__ == "__main__":
    main()
