import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { editorialStaffApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2, Save, X, GripVertical } from "lucide-react";

function useEditorialStaff() {
  return useQuery({
    queryKey: ["editorial_staff"],
    queryFn: async () => {
      const data = await editorialStaffApi.getAll();
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
    try {
      await editorialStaffApi.update(id, { position: editForm.position.trim(), name: editForm.name.trim() });
      setEditingId(null);
      invalidate();
      toast({ title: "Data diperbarui" });
    } catch (error: any) {
      toast({ title: "Gagal menyimpan", description: error.response?.data?.message || error.message, variant: "destructive" });
    }
  };

  const handleAdd = async () => {
    if (!addForm.position.trim()) {
      toast({ title: "Jabatan wajib diisi", variant: "destructive" });
      return;
    }
    try {
      const maxOrder = staff.length > 0 ? Math.max(...staff.map((s: any) => s.sort_order || 0)) : 0;
      await editorialStaffApi.create({
        position: addForm.position.trim(),
        name: addForm.name.trim(),
        sort_order: maxOrder + 1,
      });
      setAdding(false);
      setAddForm({ position: "", name: "" });
      invalidate();
      toast({ title: "Jabatan ditambahkan" });
    } catch (error: any) {
      toast({ title: "Gagal menambah", description: error.response?.data?.message || error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus jabatan ini?")) return;
    try {
      await editorialStaffApi.delete(id);
      invalidate();
      toast({ title: "Jabatan dihapus" });
    } catch (error: any) {
      toast({ title: "Gagal menghapus", description: error.response?.data?.message || error.message, variant: "destructive" });
    }
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
      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-lg font-bold font-serif text-foreground mb-4">Konten Halaman Redaksi</h2>
        <EditorialContentEditor />
      </div>
    </div>
  );
}

function EditorialContentEditor() {
  const { data: settings = {} } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const data = await import("@/lib/api").then(m => m.settingsApi.getAll());
      return data || {};
    },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // State for Rubrication Items
  const [rubrics, setRubrics] = useState<{ id: string; name: string; desc: string }[]>([]);
  // State for Principles
  const [principles, setPrinciples] = useState<{ id: string; text: string }[]>([]);

  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Parse settings on load
  useEffect(() => {
    if (settings && !initialized) {
      // Parse Rubrication
      try {
        if (settings.rubrication && settings.rubrication.startsWith("[")) {
          setRubrics(JSON.parse(settings.rubrication));
        } else {
          // Default if empty or legacy HTML
          setRubrics([]);
        }
      } catch (e) {
        setRubrics([]);
      }

      // Parse Principles
      try {
        if (settings.editorial_principles && settings.editorial_principles.startsWith("[")) {
          setPrinciples(JSON.parse(settings.editorial_principles));
        } else {
          setPrinciples([]);
        }
      } catch (e) {
        setPrinciples([]);
      }

      setInitialized(true);
    }
  }, [settings, initialized]);

  const addRubric = () => {
    setRubrics([...rubrics, { id: crypto.randomUUID(), name: "", desc: "" }]);
  };

  const removeRubric = (id: string) => {
    setRubrics(rubrics.filter(r => r.id !== id));
  };

  const updateRubric = (id: string, field: 'name' | 'desc', value: string) => {
    setRubrics(rubrics.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addPrinciple = () => {
    setPrinciples([...principles, { id: crypto.randomUUID(), text: "" }]);
  };

  const removePrinciple = (id: string) => {
    setPrinciples(principles.filter(p => p.id !== id));
  };

  const updatePrinciple = (id: string, value: string) => {
    setPrinciples(principles.map(p => p.id === id ? { ...p, text: value } : p));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { settingsApi } = await import("@/lib/api");
      await settingsApi.update({
        rubrication: JSON.stringify(rubrics),
        editorial_principles: JSON.stringify(principles),
      });
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      toast({ title: "Konten diperbarui" });
    } catch (error: any) {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const loadDefaultRubrics = () => {
    setRubrics([
      { id: crypto.randomUUID(), name: "Publik", desc: "Berita terkait pelayanan publik dan pemerintahan" },
      { id: crypto.randomUUID(), name: "Hukum", desc: "Berita hukum, peradilan, dan perundang-undangan" },
      { id: crypto.randomUUID(), name: "Lingkungan", desc: "Isu lingkungan hidup dan ekologi" },
      { id: crypto.randomUUID(), name: "Daerah", desc: "Berita dari berbagai daerah di Indonesia" },
      { id: crypto.randomUUID(), name: "Nasional", desc: "Berita nasional dan politik" },
      { id: crypto.randomUUID(), name: "Opini", desc: "Kolom opini dan analisis" },
    ]);
  };

  const loadDefaultPrinciples = () => {
    setPrinciples([
      { id: crypto.randomUUID(), text: "Independen" },
      { id: crypto.randomUUID(), text: "Berimbang" },
      { id: crypto.randomUUID(), text: "Akurat" },
      { id: crypto.randomUUID(), text: "Profesional" },
      { id: crypto.randomUUID(), text: "Etis" },
    ]);
  };

  return (
    <div className="space-y-8">
      {/* Rubrication Editor */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Label className="text-base">Daftar Rubrikasi</Label>
            <p className="text-xs text-muted-foreground">Kelola daftar rubrik atau kanal berita.</p>
          </div>
          <div className="flex gap-2">
            {rubrics.length === 0 && (
              <Button size="sm" variant="secondary" onClick={loadDefaultRubrics}>Isi Data Default</Button>
            )}
            <Button size="sm" variant="outline" onClick={addRubric}><Plus size={14} /> Tambah Rubrik</Button>
          </div>
        </div>

        <div className="space-y-3">
          {rubrics.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-4">Belum ada rubrik. Klik "Isi Data Default" atau "Tambah" untuk memulai.</p>}
          {rubrics.map((item) => (
            <div key={item.id} className="flex gap-3 items-start p-3 bg-background border border-border rounded-md">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Nama Rubrik (misal: Politik)"
                  value={item.name}
                  onChange={(e) => updateRubric(item.id, 'name', e.target.value)}
                />
                <Input
                  placeholder="Deskripsi singkat (misal: Berita seputar politik nasional)"
                  value={item.desc}
                  onChange={(e) => updateRubric(item.id, 'desc', e.target.value)}
                  className="text-sm text-muted-foreground"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeRubric(item.id)} className="text-destructive shrink-0">
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Principles Editor */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Label className="text-base">Prinsip Redaksi</Label>
            <p className="text-xs text-muted-foreground">Poin-poin prinsip jurnalistik.</p>
          </div>
          <div className="flex gap-2">
            {principles.length === 0 && (
              <Button size="sm" variant="secondary" onClick={loadDefaultPrinciples}>Isi Data Default</Button>
            )}
            <Button size="sm" variant="outline" onClick={addPrinciple}><Plus size={14} /> Tambah Prinsip</Button>
          </div>
        </div>

        <div className="space-y-3">
          {principles.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-4">Belum ada prinsip. Klik "Isi Data Default" atau "Tambah" untuk memulai.</p>}
          {principles.map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              <Input
                placeholder="Prinsip (misal: Independen)"
                value={item.text}
                onChange={(e) => updatePrinciple(item.id, e.target.value)}
              />
              <Button variant="ghost" size="icon" onClick={() => removePrinciple(item.id)} className="text-destructive shrink-0">
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={loading} size="lg">
          {loading ? "Menyimpan..." : "Simpan Semua Perubahan"}
        </Button>
      </div>
    </div>
  );
}
