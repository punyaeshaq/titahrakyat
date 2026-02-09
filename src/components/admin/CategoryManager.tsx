import { useState } from "react";
import { categoriesApi } from "@/lib/api";
import { useCategories } from "@/hooks/useArticles";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

const CategoryManager = () => {
  const { data: categories = [], isLoading } = useCategories();
  const [newLabel, setNewLabel] = useState("");
  const [newId, setNewId] = useState("");
  const [newColor, setNewColor] = useState("news-red");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const colorOptions = [
    { value: "news-red", label: "Merah" },
    { value: "news-blue", label: "Biru" },
    { value: "news-yellow", label: "Kuning" },
  ];

  const generateId = (label: string) =>
    label.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    const id = newId.trim() || generateId(newLabel);

    try {
      await categoriesApi.create({ id, label: newLabel.trim(), color: newColor });
      toast({ title: "Kategori ditambahkan" });
      setNewLabel("");
      setNewId("");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: any) {
      toast({ title: "Gagal menambah kategori", description: error.response?.data?.message || error.message, variant: "destructive" });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await categoriesApi.update(id, { label: editLabel, color: editColor });
      toast({ title: "Kategori diperbarui" });
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: any) {
      toast({ title: "Gagal mengupdate", description: error.response?.data?.message || error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Hapus kategori "${id}"? Artikel dalam kategori ini akan kehilangan kategorinya.`)) return;
    try {
      await categoriesApi.delete(id);
      toast({ title: "Kategori dihapus" });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: any) {
      toast({ title: "Gagal menghapus", description: error.response?.data?.message || error.message, variant: "destructive" });
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditLabel(cat.label);
    setEditColor(cat.color);
  };

  return (
    <div>
      <h2 className="text-lg font-bold font-serif text-foreground mb-4">Manajemen Kategori</h2>

      {/* Add form */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Tambah Kategori Baru</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs">Label</Label>
            <Input value={newLabel} onChange={(e) => { setNewLabel(e.target.value); setNewId(generateId(e.target.value)); }} placeholder="Nama kategori" />
          </div>
          <div>
            <Label className="text-xs">ID (slug)</Label>
            <Input value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="slug-kategori" />
          </div>
          <div>
            <Label className="text-xs">Warna</Label>
            <select value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              {colorOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAdd} size="sm"><Plus size={16} /> Tambah</Button>
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-muted-foreground">Memuat...</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat: any) => (
            <div key={cat.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
              {editingId === cat.id ? (
                <>
                  <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="flex-1 h-8" />
                  <select value={editColor} onChange={(e) => setEditColor(e.target.value)} className="h-8 px-2 rounded border border-input bg-background text-xs">
                    {colorOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdate(cat.id)}><Check size={16} className="text-green-600" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)}><X size={16} /></Button>
                </>
              ) : (
                <>
                  <span className={`w-3 h-3 rounded-full shrink-0`} style={{ backgroundColor: cat.color === "news-red" ? "hsl(0, 85%, 50%)" : cat.color === "news-blue" ? "hsl(210, 100%, 45%)" : "hsl(45, 100%, 51%)" }} />
                  <span className="flex-1 text-sm font-medium text-foreground">{cat.label}</span>
                  <span className="text-xs text-muted-foreground">{generateId(cat.label)}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(cat)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(cat.id)}><Trash2 size={14} className="text-destructive" /></Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;

