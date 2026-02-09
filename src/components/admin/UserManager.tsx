import { useState } from "react";
import { usersApi, authApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Key, UserPlus, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UserManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Add User State
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("editor");
  const [isAddingUser, setIsAddingUser] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const data = await usersApi.getAll();
      return data || [];
    },
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Validasi Gagal", description: "Konfirmasi password tidak cocok", variant: "destructive" });
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      toast({ title: "Berhasil", description: "Password berhasil diubah" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Gagal", description: error.response?.data?.message || "Gagal mengubah password", variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUser(true);
    try {
      await usersApi.create({
        name: newName || newUserEmail.split('@')[0],
        email: newUserEmail,
        password: newUserPassword,
        role: newRole
      });
      toast({ title: "Berhasil", description: "Pengguna baru berhasil ditambahkan" });
      setNewUserEmail("");
      setNewUserPassword("");
      setNewName("");
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    } catch (error: any) {
      toast({ title: "Gagal", description: error.response?.data?.message || "Gagal menambah pengguna", variant: "destructive" });
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleRemoveUser = async (userId: string, email: string) => {
    if (!confirm(`Hapus pengguna ${email}?`)) return;
    try {
      await usersApi.delete(userId);
      toast({ title: "Pengguna dihapus" });
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    } catch (error: any) {
      toast({ title: "Gagal", description: error.response?.data?.message || error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      {/* Change Password Section */}
      <div>
        <h2 className="text-lg font-bold font-serif text-foreground mb-4 flex items-center gap-2">
          <Key size={18} /> Ganti Password
        </h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-4">Akun: <span className="font-medium text-foreground">{user?.email}</span></p>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="current_password">Password Lama</Label>
              <Input
                id="current_password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Masukkan password saat ini"
              />
            </div>
            <div>
              <Label htmlFor="new_password">Password Baru</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Min. 8 karakter"
              />
            </div>
            <div>
              <Label htmlFor="confirm_password">Konfirmasi Password Baru</Label>
              <Input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Ulangi password baru"
              />
            </div>
            <Button type="submit" disabled={isChangingPassword} className="bg-red-600 hover:bg-red-700 text-white">
              {isChangingPassword ? "Memproses..." : "Ubah Password"}
            </Button>
          </form>
        </div>
      </div>

      {/* Add User Section */}
      <div>
        <h2 className="text-lg font-bold font-serif text-foreground mb-4 flex items-center gap-2">
          <UserPlus size={18} /> Tambah Editor / Pengguna
        </h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="new_name">Nama</Label>
              <Input
                id="new_name"
                placeholder="Nama Lengkap"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_email">Email</Label>
              <Input
                id="new_email"
                type="email"
                placeholder="email@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_user_password">Password</Label>
              <Input
                id="new_user_password"
                type="password"
                placeholder="Password pengguna"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_role">Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button type="submit" disabled={isAddingUser} className="w-full bg-red-600 hover:bg-red-700 text-white">
                {isAddingUser ? "Menambahkan..." : "+ Tambah Pengguna"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* User list */}
      <div>
        <h2 className="text-lg font-bold font-serif text-foreground mb-4 flex items-center gap-2">
          <Users size={18} /> Daftar Pengguna
        </h2>
        {isLoading ? (
          <p className="text-muted-foreground">Memuat...</p>
        ) : (
          <div className="space-y-2">
            {users.map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{u.name || u.display_name || u.email}</span>
                    <span className="text-xs text-muted-foreground">({u.email})</span>
                  </div>
                  <span className={`mt-1 inline-block px-1.5 py-0.5 rounded text-xs font-medium ${u.role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                    {u.role || 'user'}
                  </span>
                </div>
                {u.id !== user?.id && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10" onClick={() => handleRemoveUser(u.id, u.email)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            {users.length === 0 && <p className="text-muted-foreground text-sm">Belum ada pengguna lain.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;
