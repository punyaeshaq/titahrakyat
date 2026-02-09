import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";
import { Settings, Globe, Save, Plus, Trash2, GripVertical } from "lucide-react";

export default function SiteSettingsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return (
    <div className="space-y-8">
      <AboutEditor />
      <SocialLinksEditor />
    </div>
  );
}

function AboutEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const getValue = (key: string) => settings.find((s: any) => s.key === key)?.value || "";

  const [about, setAbout] = useState("");
  const [visi, setVisi] = useState("");
  const [misi, setMisi] = useState("");

  useEffect(() => {
    if (settings.length > 0) {
      setAbout(getValue("about"));
      setVisi(getValue("visi"));
      setMisi(getValue("misi"));
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const updates = [
      { key: "about", value: about },
      { key: "visi", value: visi },
      { key: "misi", value: misi },
    ];

    for (const u of updates) {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: u.key, value: u.value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) {
        toast({ title: `Gagal menyimpan ${u.key}`, description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    logActivity("mengedit pengaturan situs", "site_settings", "Tentang, Visi, Misi");
    queryClient.invalidateQueries({ queryKey: ["site_settings"] });
    toast({ title: "Pengaturan tersimpan" });
    setSaving(false);
  };

  if (isLoading) return <p className="text-muted-foreground">Memuat...</p>;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-bold font-serif text-foreground flex items-center gap-2 mb-4">
        <Settings size={20} /> Tentang Kami, Visi & Misi
      </h2>

      <div className="space-y-4">
        <div>
          <Label>Tentang Kami</Label>
          <Textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={5} placeholder="Deskripsi tentang media..." />
        </div>
        <div>
          <Label>Visi</Label>
          <Textarea value={visi} onChange={(e) => setVisi(e.target.value)} rows={3} placeholder="Visi media..." />
        </div>
        <div>
          <Label>Misi (pisahkan dengan baris baru)</Label>
          <Textarea value={misi} onChange={(e) => setMisi(e.target.value)} rows={5} placeholder="Misi 1&#10;Misi 2&#10;Misi 3" />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </div>
  );
}

function SocialLinksEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPlatform, setNewPlatform] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["social_links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const handleUpdate = async (id: string, url: string, isActive: boolean) => {
    const { error } = await supabase.from("social_links").update({ url, is_active: isActive }).eq("id", id);
    if (error) { toast({ title: "Gagal menyimpan", variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["social_links"] });
    toast({ title: "Link diperbarui" });
  };

  const handleAdd = async () => {
    if (!newPlatform.trim()) return;
    const maxOrder = links.length > 0 ? Math.max(...links.map((l: any) => l.sort_order)) + 1 : 1;
    const { error } = await supabase.from("social_links").insert({
      platform: newPlatform,
      url: newUrl,
      icon: newPlatform.toLowerCase().replace(/[^a-z]/g, ""),
      sort_order: maxOrder,
    });
    if (error) { toast({ title: "Gagal menambah", variant: "destructive" }); return; }
    logActivity("menambah sosial media", "social_links", newPlatform);
    queryClient.invalidateQueries({ queryKey: ["social_links"] });
    setNewPlatform("");
    setNewUrl("");
    toast({ title: "Platform ditambahkan" });
  };

  const handleDelete = async (id: string, platform: string) => {
    if (!confirm(`Hapus ${platform}?`)) return;
    await supabase.from("social_links").delete().eq("id", id);
    logActivity("menghapus sosial media", "social_links", platform);
    queryClient.invalidateQueries({ queryKey: ["social_links"] });
    toast({ title: "Platform dihapus" });
  };

  if (isLoading) return <p className="text-muted-foreground">Memuat...</p>;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-bold font-serif text-foreground flex items-center gap-2 mb-4">
        <Globe size={20} /> Akun Sosial Media
      </h2>

      <div className="space-y-3 mb-6">
        {links.map((link: any) => (
          <SocialLinkRow key={link.id} link={link} onUpdate={handleUpdate} onDelete={handleDelete} />
        ))}
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label>Platform Baru</Label>
          <Input value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)} placeholder="Nama platform" />
        </div>
        <div className="flex-1">
          <Label>URL</Label>
          <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." />
        </div>
        <Button onClick={handleAdd} disabled={!newPlatform.trim()}>
          <Plus size={16} /> Tambah
        </Button>
      </div>
    </div>
  );
}

function SocialLinkRow({ link, onUpdate, onDelete }: { link: any; onUpdate: (id: string, url: string, isActive: boolean) => void; onDelete: (id: string, platform: string) => void }) {
  const [url, setUrl] = useState(link.url);
  const [dirty, setDirty] = useState(false);

  return (
    <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
      <div className="min-w-[100px]">
        <span className="font-semibold text-sm text-foreground">{link.platform}</span>
      </div>
      <Input
        value={url}
        onChange={(e) => { setUrl(e.target.value); setDirty(true); }}
        placeholder={`URL ${link.platform}`}
        className="flex-1"
      />
      <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
        <input type="checkbox" checked={link.is_active} onChange={(e) => onUpdate(link.id, url, e.target.checked)} />
        Aktif
      </label>
      {dirty && (
        <Button size="sm" variant="outline" onClick={() => { onUpdate(link.id, url, link.is_active); setDirty(false); }}>
          <Save size={14} />
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={() => onDelete(link.id, link.platform)}>
        <Trash2 size={14} className="text-destructive" />
      </Button>
    </div>
  );
}
