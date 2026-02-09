import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAllArticles, useAllBreakingNews, useCategories } from "@/hooks/useArticles";
import { articlesApi, breakingNewsApi, settingsApi } from "@/lib/api";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Plus, Pencil, Trash2, Newspaper, AlertTriangle, X, BarChart3, FolderOpen, Users, Building2, ChevronLeft, ChevronRight, Download, Eye, Clock, Activity, MessageCircle, Video, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUpload from "@/components/ImageUpload";
import CategoryManager from "@/components/admin/CategoryManager";
import UserManager from "@/components/admin/UserManager";
import StatsOverview from "@/components/admin/StatsOverview";
import EditorialManager from "@/components/admin/EditorialManager";
import ActivityLog from "@/components/admin/ActivityLog";
import CommentManager from "@/components/admin/CommentManager";
import VideoManager from "@/components/admin/VideoManager";
import SiteSettingsManager from "@/components/admin/SiteSettingsManager";
import { logActivity } from "@/lib/activityLog";
import ThemeToggle from "@/components/ThemeToggle";

type Tab = "stats" | "articles" | "breaking" | "categories" | "editorial" | "comments" | "videos" | "users" | "logs" | "settings";

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("stats");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    } else if (!authLoading && user) {
      // Enforce role-based paths
      if (location.pathname.startsWith('/admin') && user.role === 'editor') {
        navigate('/editor');
      } else if (location.pathname.startsWith('/editor') && user.role === 'admin') {
        navigate('/admin');
      }
    }
  }, [authLoading, user, isAdmin, navigate, location.pathname]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat...</div>;
  if (!user || !isAdmin) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "stats", label: "Statistik", icon: <BarChart3 size={16} /> },
    { id: "articles", label: "Berita", icon: <Newspaper size={16} /> },
    { id: "breaking", label: "Breaking", icon: <AlertTriangle size={16} /> },
    { id: "categories", label: "Kategori", icon: <FolderOpen size={16} /> },
    { id: "editorial", label: "Redaksi", icon: <Building2 size={16} /> },
    { id: "comments", label: "Komentar", icon: <MessageCircle size={16} /> },
    { id: "videos", label: "Video", icon: <Video size={16} /> },
    { id: "users", label: "Pengguna", icon: <Users size={16} /> },
    { id: "settings", label: "Pengaturan", icon: <Settings size={16} /> },
    { id: "logs", label: "Log", icon: <Activity size={16} /> },
  ].filter((tab) => {
    // Admin sees everything
    if (user?.role === 'admin') return true;

    // Editor sees content management only
    if (user?.role === 'editor') {
      return ['stats', 'articles', 'breaking', 'comments', 'videos'].includes(tab.id);
    }

    // Default (shouldn't happen for dashboard users)
    return false;
  }) as { id: Tab; label: string; icon: React.ReactNode }[];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <h1 className="font-bold font-serif text-foreground text-lg">
            {location.pathname.startsWith('/editor') ? 'Dashboard Editor' : 'Dashboard Admin'}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <ThemeToggle />
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
        {tab === "comments" && <CommentManager />}
        {tab === "videos" && <VideoManager />}
        {tab === "users" && <UserManager />}
        {tab === "settings" && <SiteSettingsManager />}
        {tab === "logs" && <ActivityLog />}
      </div>
    </div>
  );
};

function exportCsv(articles: any[], categories: any[]) {
  const catMap = Object.fromEntries(categories.map((c: any) => [c.id, c.label]));
  const headers = ["Judul", "Slug", "Kategori", "Penulis", "Status", "Views", "Tanggal Terbit"];
  const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = articles.map((a: any) => [
    escape(a.title),
    escape(a.slug),
    escape(catMap[a.category_id] || a.category_id || ""),
    escape(a.author),
    a.status === "published" ? "Terbit" : "Draft",
    a.views ?? 0,
    a.published_at ? new Date(a.published_at).toLocaleDateString("id-ID") : "-",
  ].join(","));
  const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `berita-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

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
    const article = articles.find((a: any) => a.id === id);
    try {
      await articlesApi.delete(id);
      logActivity("menghapus berita", "article", article?.title || "");
      queryClient.invalidateQueries({ queryKey: ["admin_articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast({ title: "Berita dihapus" });
    } catch (error: any) {
      toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
    }
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
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCsv(filtered, categories)}>
            <Download size={16} /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={16} /> Tambah Berita
          </Button>
        </div>
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
          <option value="scheduled">Terjadwal</option>
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
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${a.status === "published" ? "bg-green-100 text-green-700" : a.status === "scheduled" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {a.status === "published" ? "Terbit" : a.status === "scheduled" ? "Terjadwal" : "Draft"}
                    </span>
                    <span>{categories.find((c: any) => c.id === a.category_id)?.label || "-"}</span>
                    <span>
                      {a.published_at
                        ? new Date(a.published_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                        : "-"}
                    </span>
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
  const [showPreview, setShowPreview] = useState(false);
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
    scheduled_at: article?.scheduled_at || "",
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

    const isScheduled = form.status === "scheduled" && form.scheduled_at;

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
      scheduled_at: isScheduled ? new Date(form.scheduled_at).toISOString() : null,
    };

    try {
      if (isEdit) {
        await articlesApi.update(article.id, payload);
        logActivity("mengedit berita", "article", form.title);
        toast({ title: "Berita diperbarui" });
      } else {
        await articlesApi.create(payload);
        logActivity("menambah berita", "article", form.title);
        toast({ title: "Berita ditambahkan" });
      }
      onSaved();
    } catch (error: any) {
      toast({ title: "Gagal menyimpan", description: error.response?.data?.message || error.message, variant: "destructive" });
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
              <option value="scheduled">Terjadwal</option>
            </select>
          </div>
          {form.status === "scheduled" && (
            <div>
              <Label className="flex items-center gap-1"><Clock size={14} /> Jadwal Terbit</Label>
              <Input
                type="datetime-local"
                value={form.scheduled_at ? form.scheduled_at.slice(0, 16) : ""}
                onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
              />
              {form.scheduled_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Akan terbit otomatis pada {new Date(form.scheduled_at).toLocaleString("id-ID")}
                </p>
              )}
            </div>
          )}
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

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowPreview(true)}>
              <Eye size={16} /> Preview
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? "Menyimpan..." : isEdit ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-background w-full max-w-3xl rounded-lg border border-border shadow-lg my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-bold font-serif text-foreground">Preview Berita</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                <X size={20} />
              </Button>
            </div>
            <div className="p-6">
              {form.image_url && (
                <img src={form.image_url} alt="" className="w-full h-64 object-cover rounded-lg mb-6" />
              )}
              <div className="mb-2">
                <span className="text-xs font-semibold text-primary uppercase">
                  {categories.find((c: any) => c.id === form.category_id)?.label || form.category_id}
                </span>
                <span className="text-xs text-muted-foreground ml-3">
                  {form.status === "published" ? "Terbit" : "Draft"}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-3">
                {form.title || "Judul Berita"}
              </h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
                <span>{form.author || "Penulis"}</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              {form.excerpt && (
                <p className="text-muted-foreground italic border-l-4 border-primary pl-4 mb-6">{form.excerpt}</p>
              )}
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: form.content || "<p>Belum ada konten.</p>" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =================== BREAKING NEWS MANAGER =================== */
function BreakingNewsManager() {
  const { data: items = [], isLoading } = useAllBreakingNews();
  const { data: settings = {} } = useSettings();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [localSpeed, setLocalSpeed] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (settings.breaking_news_speed) {
      setLocalSpeed(parseInt(settings.breaking_news_speed));
    } else {
      setLocalSpeed(30);
    }
  }, [settings.breaking_news_speed]);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(e.target.value);
    setLocalSpeed(newSpeed);
  };

  const saveSpeed = async () => {
    if (localSpeed === null) return;
    try {
      await settingsApi.update({ breaking_news_speed: String(localSpeed) });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    } catch (error) {
      console.error("Failed to update speed", error);
    }
  };

  // Debounce save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSpeed !== null) saveSpeed();
    }, 500);
    return () => clearTimeout(timer);
  }, [localSpeed]);

  const currentSpeed = localSpeed ?? 30;

  const handleAdd = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await breakingNewsApi.create(text.trim());
      logActivity("menambah breaking news", "breaking_news", text.trim());
      setText("");
      queryClient.invalidateQueries({ queryKey: ["admin_breaking_news"] });
      queryClient.invalidateQueries({ queryKey: ["breaking_news"] });
      toast({ title: "Breaking news ditambahkan" });
    } catch (error: any) {
      toast({ title: "Gagal menambah", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await breakingNewsApi.update(id, { is_active: !active });
      queryClient.invalidateQueries({ queryKey: ["admin_breaking_news"] });
      queryClient.invalidateQueries({ queryKey: ["breaking_news"] });
    } catch (error: any) {
      toast({ title: "Gagal mengubah", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const item = items.find((i: any) => i.id === id);
    try {
      await breakingNewsApi.delete(id);
      logActivity("menghapus breaking news", "breaking_news", item?.text || "");
      queryClient.invalidateQueries({ queryKey: ["admin_breaking_news"] });
      queryClient.invalidateQueries({ queryKey: ["breaking_news"] });
      toast({ title: "Breaking news dihapus" });
    } catch (error: any) {
      toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold font-serif text-foreground mb-4">Breaking News</h2>

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <Label>Kecepatan Scroll (detik)</Label>
        <div className="flex items-center gap-4 mt-2">
          <Input
            type="range"
            min="10"
            max="100"
            step="5"
            value={currentSpeed}
            onChange={handleSpeedChange}
            className="flex-1 cursor-pointer"
          />
          <span className="w-16 text-center font-mono font-bold bg-muted p-2 rounded">{currentSpeed}s</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Semakin kecil angkanya, semakin cepat gerakannya.</p>
      </div>

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
