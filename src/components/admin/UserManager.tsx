import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Key, UserPlus, Shield } from "lucide-react";

const UserManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Change password
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  // Add editor
  const [editorEmail, setEditorEmail] = useState("");
  const [editorPassword, setEditorPassword] = useState("");
  const [addingEditor, setAddingEditor] = useState(false);

  // List editors/admins
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role");
      if (error) throw error;

      // Get profiles for display names
      const userIds = data.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      return data.map((r) => ({
        ...r,
        display_name: profiles?.find((p) => p.user_id === r.user_id)?.display_name || r.user_id,
      }));
    },
  });

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Password minimal 6 karakter", variant: "destructive" });
      return;
    }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password berhasil diubah" });
      setNewPassword("");
    }
    setChangingPw(false);
  };

  const handleAddEditor = async () => {
    if (!editorEmail || !editorPassword) {
      toast({ title: "Email dan password wajib diisi", variant: "destructive" });
      return;
    }
    setAddingEditor(true);

    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { action: "create_editor", email: editorEmail, password: editorPassword },
    });

    if (error || data?.error) {
      toast({ title: "Gagal", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "Editor berhasil ditambahkan" });
      setEditorEmail("");
      setEditorPassword("");
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    }
    setAddingEditor(false);
  };

  const handleRemoveRole = async (roleId: string, displayName: string) => {
    if (!confirm(`Hapus role dari ${displayName}?`)) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role dihapus" });
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    }
  };

  return (
    <div className="space-y-8">
      {/* Change password */}
      <div>
        <h2 className="text-lg font-bold font-serif text-foreground mb-4 flex items-center gap-2">
          <Key size={18} /> Ganti Password
        </h2>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-3">Akun: {user?.email}</p>
          <div className="flex gap-3 max-w-md">
            <div className="flex-1">
              <Label className="text-xs">Password Baru</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 karakter" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleChangePassword} disabled={changingPw} size="sm">
                {changingPw ? "Mengubah..." : "Ubah Password"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add editor */}
      <div>
        <h2 className="text-lg font-bold font-serif text-foreground mb-4 flex items-center gap-2">
          <UserPlus size={18} /> Tambah Editor
        </h2>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" value={editorEmail} onChange={(e) => setEditorEmail(e.target.value)} placeholder="editor@email.com" />
            </div>
            <div>
              <Label className="text-xs">Password</Label>
              <Input type="password" value={editorPassword} onChange={(e) => setEditorPassword(e.target.value)} placeholder="Min. 6 karakter" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddEditor} disabled={addingEditor} size="sm">
                <Plus size={16} /> {addingEditor ? "Menambah..." : "Tambah Editor"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* User list */}
      <div>
        <h2 className="text-lg font-bold font-serif text-foreground mb-4 flex items-center gap-2">
          <Shield size={18} /> Daftar Pengguna
        </h2>
        {isLoading ? (
          <p className="text-muted-foreground">Memuat...</p>
        ) : (
          <div className="space-y-2">
            {users.map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{u.display_name}</span>
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-700"}`}>
                    {u.role}
                  </span>
                </div>
                {u.user_id !== user?.id && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveRole(u.id, u.display_name)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;
