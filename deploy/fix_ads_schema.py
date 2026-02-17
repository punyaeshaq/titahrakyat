#!/usr/bin/env python3
"""Fix ads table schema with correct paths."""
import paramiko
import time

VPS_IP = "72.61.208.98"
VPS_USER = "deploy"
VPS_PASS = "@Muhammadfatih123"
REMOTE_BASE = "/var/www/menarapublik"

def run_cmd(ssh, cmd, timeout=30):
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True, timeout=timeout)
    if "sudo" in cmd:
        time.sleep(0.5)
        stdin.write(VPS_PASS + "\n")
        stdin.flush()
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    lines = [l for l in out.split('\n') if '[sudo]' not in l and 'password' not in l.lower()]
    return exit_code, '\n'.join(lines).strip()

def main():
    print("Connecting...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, allow_agent=False, look_for_keys=False)
    sftp = ssh.open_sftp()

    # Use absolute paths in the PHP script
    fix_php = """<?php
require '/var/www/menarapublik/server/vendor/autoload.php';
$app = require_once '/var/www/menarapublik/server/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\Schema;

try {
    $columns = Schema::getColumnListing('ads');
    echo "Columns: " . implode(', ', $columns) . "\\n";
    
    $hasPosition = in_array('position', $columns);
    $hasPositions = in_array('positions', $columns);
    
    echo "position: " . ($hasPosition ? 'YES' : 'NO') . "\\n";
    echo "positions: " . ($hasPositions ? 'YES' : 'NO') . "\\n";
    
    if (!$hasPositions) {
        echo "Adding positions column...\\n";
        DB::statement("ALTER TABLE ads ADD COLUMN positions TEXT NULL");
    }
    
    if ($hasPosition) {
        $ads = DB::table('ads')->get();
        foreach ($ads as $ad) {
            $pos = $ad->position ?: 'sidebar';
            DB::table('ads')->where('id', $ad->id)->update(['positions' => json_encode([$pos])]);
            echo "Migrated: {$ad->id}\\n";
        }
        DB::statement("ALTER TABLE ads DROP COLUMN position");
        echo "Dropped old column\\n";
    } else {
        $ads = DB::table('ads')->get();
        foreach ($ads as $ad) {
            $decoded = json_decode($ad->positions, true);
            if (!is_array($decoded) || empty($decoded)) {
                DB::table('ads')->where('id', $ad->id)->update(['positions' => json_encode(['sidebar'])]);
                echo "Fixed: {$ad->id}\\n";
            } else {
                echo "OK: {$ad->id} = {$ad->positions}\\n";
            }
        }
    }
    
    $cols = Schema::getColumnListing('ads');
    echo "Final: " . implode(', ', $cols) . "\\n";
    echo "SUCCESS\\n";
} catch (Exception $e) {
    echo "ERR: " . $e->getMessage() . "\\n";
}
"""
    
    with sftp.open("/tmp/fix_ads.php", "w") as f:
        f.write(fix_php)
    
    print("Running fix...")
    exit_code, out = run_cmd(ssh, "sudo php /tmp/fix_ads.php", timeout=30)
    print(out)
    
    print("\nClearing caches...")
    run_cmd(ssh, f"cd {REMOTE_BASE}/server && sudo php artisan cache:clear && sudo php artisan route:clear && sudo php artisan config:clear")

    sftp.close()
    ssh.close()
    print("Done!")

if __name__ == "__main__":
    main()
