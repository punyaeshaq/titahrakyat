import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAllArticles, useAllBreakingNews, useCategories } from "@/hooks/useArticles";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Plus, Pencil, Trash2, Newspaper, AlertTriangle, X, BarChart3, FolderOpen, Users, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUpload from "@/components/ImageUpload";
import CategoryManager from "@/components/admin/CategoryManager";
import UserManager from "@/components/admin/UserManager";
import StatsOverview from "@/components/admin/StatsOverview";
import EditorialManager from "@/components/admin/EditorialManager";

type Tab = "stats" | "articles" | "breaking" | "categories" | "editorial" | "users";

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("stats");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [authLoading, user, isAdmin, navigate]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat...</div>;
  if (!user || !isAdmin) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "stats", label: "Statistik", icon: <BarChart3 size={16} /> },
    { id: "articles", label: "Berita", icon: <Newspaper size={16} /> },
    { id: "breaking", label: "Breaking", icon: <AlertTriangle size={16} /> },
    { id: "categories", label: "Kategori", icon: <FolderOpen size={16} /> },
    { id: "editorial", label: "Redaksi", icon: <Building2 size={16} /> },
    { id: "users", label: "Pengguna", icon: <Users size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <h1 className="font-bold font-serif text-foreground text-lg">Dashboard Admin</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/admin/login"); }}>
              <LogOut size={16} /> Keluar
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <Button key={t.id} variant={tab === t.id ? "default" : "outline"} size="sm" onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </Button>
          ))}
        </div>

        {tab === "stats" && <StatsOverview />}
        {tab === "articles" && <ArticlesManager />}
        {tab === "breaking" && <BreakingNewsManager />}
        {tab === "categories" && <CategoryManager />}
        {tab === "editorial" && <EditorialManager />}
        {tab === "users" && <UserManager />}
      </div>
    </div>
  );
};

/* =================== ARTICLES MANAGER =================== */
function ArticlesManager() {
  const { data: articles = [], isLoading } = useAllArticles();
  const { data: categories = [] } = useCategories();
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filtered = articles.filter((a: any) => {
    if (filterCategory !== "all" && a.category_id !== filterCategory) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (searchQuery.trim() && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safeePage - 1) * ITEMS_PER_PAGE, safeePage * ITEMS_PER_PAGE);

  // Reset page when filters change
  const updateFilter = (setter: Function, value: string) => {
    setter(value);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus berita ini?")) return;
    await supabase.from("articles").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin_articles"] });
    queryClient.invalidateQueries({ queryKey: ["articles"] });
    toast({ title: "Berita dihapus" });
  };

  if (creating || editing) {
    return (
      <ArticleForm
        article={editing}
        categories={categories}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSaved={() => {
          setEditing(null);
          setCreating(false);
          queryClient.invalidateQueries({ queryKey: ["admin_articles"] });
          queryClient.invalidateQueries({ queryKey: ["articles"] });
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold font-serif text-foreground">Daftar Berita ({filtered.length})</h2>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={16} /> Tambah Berita
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => updateFilter(setSearchQuery, e.target.value)}
          placeholder="Cari judul..."
          className="h-9 px-3 rounded-md border border-input bg-background text-sm flex-1 min-w-[150px] max-w-[280px]"
        />
        <select
          value={filterCategory}
          onChange={(e) => updateFilter(setFilterCategory, e.target.value)}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => updateFilter(setFilterStatus, e.target.value)}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">Semua Status</option>
          <option value="published">Terbit</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Memuat...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4">Tidak ada berita yang cocok dengan filter.</p>
      ) : (
        <>
          <div className="space-y-2">
            {paginated.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
                {a.image_url && (
                  <img src={a.image_url} alt="" className="w-16 h-12 object-cover rounded shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">{a.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${a.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {a.status === "published" ? "Terbit" : "Draft"}
                    </span>
                    <span>{a.category_id}</span>
                    <span>{a.author}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditing(a)}>
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="icon" disabled={safeePage <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={16} />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i + 1} variant={safeePage === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="icon" disabled={safeePage >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* =================== ARTICLE FORM =================== */
function ArticleForm({ article, categories, onClose, onSaved }: {
  article?: any;
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!article;
  const [form, setForm] = useState({
    title: article?.title || "",
    slug: article?.slug || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    category_id: article?.category_id || categories[0]?.id || "",
    author: article?.author || "",
    image_url: article?.image_url || "",
    status: article?.status || "draft",
    is_featured: article?.is_featured || false,
    is_breaking: article?.is_breaking || false,
    meta_title: article?.meta_title || "",
    meta_description: article?.meta_description || "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: isEdit ? f.slug : generateSlug(title) }));
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast({ title: "Judul dan slug wajib diisi", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      category_id: form.category_id || null,
      author: form.author,
      image_url: form.image_url,
      status: form.status,
      is_featured: form.is_featured,
      is_breaking: form.is_breaking,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      published_at: form.status === "published" ? (article?.published_at || new Date().toISOString()) : null,
    };

    if (isEdit) {
      const { error } = await supabase.from("articles").update(payload).eq("id", article.id);
      if (error) toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
      else { toast({ title: "Berita diperbarui" }); onSaved(); }
    } else {
      const { error } = await supabase.from("articles").insert(payload);
      if (error) toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
      else { toast({ title: "Berita ditambahkan" }); onSaved(); }
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold font-serif text-foreground">{isEdit ? "Edit Berita" : "Tambah Berita"}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <Label>Judul</Label>
            <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Judul berita" />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="slug-berita" />
          </div>
          <div>
            <Label>Ringkasan</Label>
            <Textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} rows={3} />
          </div>
          <div>
            <Label>Konten</Label>
            <RichTextEditor content={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Status</Label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="draft">Draft</option>
              <option value="published">Terbit</option>
            </select>
          </div>
          <div>
            <Label>Kategori</Label>
            <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <Label>Penulis</Label>
            <Input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
          </div>
          <div>
            <Label>Gambar Utama</Label>
            <ImageUpload value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_breaking} onChange={(e) => setForm((f) => ({ ...f, is_breaking: e.target.checked }))} /> Breaking
            </label>
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">SEO</h3>
            <div className="space-y-3">
              <div>
                <Label>Meta Title</Label>
                <Input value={form.meta_title} onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))} />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea value={form.meta_description} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))} rows={2} />
              </div>
            </div>
          </div>

          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Berita"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* =================== BREAKING NEWS MANAGER =================== */
function BreakingNewsManager() {
  const { data: items = [], isLoading } = useAllBreakingNews();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await supabase.from("breaking_news").insert({ text: text.trim() });
    setText("");
    queryClient.invalidateQueries({ queryKey: ["admin_breaking_news"] });
    queryClient.invalidateQueries({ queryKey: ["breaking_news"] });
    toast({ title: "Breaking news ditambahkan" });
    setSaving(false);
  };

  const handleToggle = async (id: string, active: boolean) => {
    await supabase.from("breaking_news").update({ is_active: !active }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin_breaking_news"] });
    queryClient.invalidateQueries({ queryKey: ["breaking_news"] });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("breaking_news").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin_breaking_news"] });
    queryClient.invalidateQueries({ queryKey: ["breaking_news"] });
    toast({ title: "Breaking news dihapus" });
  };

  return (
    <div>
      <h2 className="text-lg font-bold font-serif text-foreground mb-4">Breaking News</h2>
      <div className="flex gap-2 mb-4">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Teks breaking news..." className="flex-1" />
        <Button onClick={handleAdd} disabled={saving}><Plus size={16} /> Tambah</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Memuat...</p>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
              <span className={`flex-1 text-sm ${item.is_active ? "text-foreground" : "text-muted-foreground line-through"}`}>
                {item.text}
              </span>
              <Button variant="outline" size="sm" onClick={() => handleToggle(item.id, item.is_active)}>
                {item.is_active ? "Nonaktifkan" : "Aktifkan"}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                <Trash2 size={16} className="text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
