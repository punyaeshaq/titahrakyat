import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { videosApi, uploadApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";
import { Plus, Pencil, Trash2, Video, X, Star, Link as LinkIcon } from "lucide-react";

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getYouTubeThumbnail(url: string): string {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}

export default function VideoManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["admin_videos"],
    queryFn: async () => {
      const data = await videosApi.getAll();
      return data?.data || data || [];
    },
  });

  const handleDelete = async (id: string, title: string) => {
    if (!confirm("Hapus video ini?")) return;
    try {
      await videosApi.delete(id);
      logActivity("menghapus video", "video", title);
      queryClient.invalidateQueries({ queryKey: ["admin_videos"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast({ title: "Video dihapus" });
    } catch (error: any) {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  if (creating || editing) {
    return (
      <VideoForm
        video={editing}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSaved={() => {
          setEditing(null);
          setCreating(false);
          queryClient.invalidateQueries({ queryKey: ["admin_videos"] });
          queryClient.invalidateQueries({ queryKey: ["videos"] });
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
          <Video size={20} /> Kelola Video ({videos.length})
        </h2>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={16} /> Tambah Video
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Memuat...</p>
      ) : videos.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4">Belum ada video.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v: any) => (
            <div key={v.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {v.thumbnail_url ? (
                  <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video size={40} className="text-muted-foreground" />
                  </div>
                )}
                {v.is_featured && (
                  <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded flex items-center gap-1">
                    <Star size={10} /> Featured
                  </span>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-foreground truncate">{v.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{v.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">{v.views || 0} views</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(v)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id, v.title)}>
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoForm({ video, onClose, onSaved }: { video?: any; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!video;
  const [form, setForm] = useState({
    title: video?.title || "",
    description: video?.description || "",
    youtube_url: video?.youtube_url || video?.video_url || "",
    thumbnail_url: video?.thumbnail_url || "",
    is_featured: video?.is_featured || false,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadApi.uploadImage(file);
      setForm((f) => ({ ...f, thumbnail_url: response.url }));
      toast({ title: "Thumbnail berhasil diupload" });
    } catch (error: any) {
      toast({ title: "Gagal upload thumbnail", description: error.message, variant: "destructive" });
    }
    setUploading(false);
  };

  const handleUrlChange = (url: string) => {
    setForm((f) => ({
      ...f,
      youtube_url: url,
      thumbnail_url: f.thumbnail_url || getYouTubeThumbnail(url),
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.youtube_url) {
      toast({ title: "Judul dan URL video wajib diisi", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description,
      youtube_url: form.youtube_url,
      thumbnail_url: form.thumbnail_url,
      is_featured: form.is_featured,
    };

    try {
      if (isEdit) {
        await videosApi.update(video.id, payload);
        logActivity("mengedit video", "video", form.title);
        toast({ title: "Video diperbarui" });
      } else {
        await videosApi.create(payload);
        logActivity("menambah video", "video", form.title);
        toast({ title: "Video ditambahkan" });
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
        <h2 className="text-lg font-bold font-serif text-foreground">{isEdit ? "Edit Video" : "Tambah Video"}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        <div className="space-y-4">
          <div>
            <Label>Judul Video</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Judul video" />
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} />
            Featured Video
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="flex items-center gap-1"><LinkIcon size={14} /> URL Video (YouTube)</Label>
            <Input
              value={form.youtube_url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <Label>Thumbnail</Label>
            {form.thumbnail_url && (
              <img src={form.thumbnail_url} alt="Thumbnail" className="w-full aspect-video object-cover rounded-md mb-2" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              disabled={uploading}
              className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground file:text-sm file:font-medium hover:file:bg-secondary/80 file:cursor-pointer"
            />
            <Input
              value={form.thumbnail_url}
              onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))}
              placeholder="Atau masukkan URL thumbnail"
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button onClick={handleSave} disabled={saving || uploading}>
          {saving ? "Menyimpan..." : isEdit ? "Perbarui Video" : "Simpan Video"}
        </Button>
        <Button variant="outline" onClick={onClose}>Batal</Button>
      </div>
    </div>
  );
}
