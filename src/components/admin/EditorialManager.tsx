import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2, Save, X, GripVertical } from "lucide-react";

function useEditorialStaff() {
  return useQuery({
    queryKey: ["editorial_staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("editorial_staff")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export default function EditorialManager() {
  const { data: staff = [], isLoading } = useEditorialStaff();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ position: "", name: "" });
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ position: "", name: "" });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["editorial_staff"] });

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm({ position: item.position, name: item.name || "" });
  };

  const handleSave = async (id: string) => {
    if (!editForm.position.trim()) {
      toast({ title: "Jabatan wajib diisi", variant: "destructive" });
      return;
    }
    await supabase
      .from("editorial_staff")
      .update({ position: editForm.position.trim(), name: editForm.name.trim() })
      .eq("id", id);
    setEditingId(null);
    invalidate();
    toast({ title: "Data diperbarui" });
  };

  const handleAdd = async () => {
    if (!addForm.position.trim()) {
      toast({ title: "Jabatan wajib diisi", variant: "destructive" });
      return;
    }
    const maxOrder = staff.length > 0 ? Math.max(...staff.map((s: any) => s.sort_order)) : 0;
    await supabase.from("editorial_staff").insert({
      position: addForm.position.trim(),
      name: addForm.name.trim(),
      sort_order: maxOrder + 1,
    });
    setAdding(false);
    setAddForm({ position: "", name: "" });
    invalidate();
    toast({ title: "Jabatan ditambahkan" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus jabatan ini?")) return;
    await supabase.from("editorial_staff").delete().eq("id", id);
    invalidate();
    toast({ title: "Jabatan dihapus" });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold font-serif text-foreground">Struktur Redaksi</h2>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding}>
          <Plus size={16} /> Tambah Jabatan
        </Button>
      </div>

      {adding && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Jabatan</Label>
              <Input
                value={addForm.position}
                onChange={(e) => setAddForm((f) => ({ ...f, position: e.target.value }))}
                placeholder="Contoh: Pemimpin Redaksi"
              />
            </div>
            <div>
              <Label>Nama (opsional)</Label>
              <Input
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nama pejabat"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd}><Save size={14} /> Simpan</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setAddForm({ position: "", name: "" }); }}>
              <X size={14} /> Batal
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Memuat...</p>
      ) : (
        <div className="space-y-2">
          {staff.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
              <GripVertical size={16} className="text-muted-foreground shrink-0" />
              {editingId === item.id ? (
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={editForm.position}
                    onChange={(e) => setEditForm((f) => ({ ...f, position: e.target.value }))}
                    placeholder="Jabatan"
                  />
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Nama (opsional)"
                  />
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.position}</p>
                  <p className="text-xs text-muted-foreground">{item.name || "— (belum diisi)"}</p>
                </div>
              )}
              <div className="flex gap-1 shrink-0">
                {editingId === item.id ? (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => handleSave(item.id)}>
                      <Save size={16} className="text-green-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                      <X size={16} />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => startEdit(item)}>
                      <Pencil size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
