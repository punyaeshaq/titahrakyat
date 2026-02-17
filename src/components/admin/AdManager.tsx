import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adsApi, uploadApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";
import ImageUpload from "@/components/ImageUpload";
import { Plus, Pencil, Trash2, X, Save, Eye, MousePointer, ExternalLink, Maximize2 } from "lucide-react";

const POSITIONS = [
    { value: "header", label: "Header (Atas Halaman)", desc: "Banner lebar di bagian atas" },
    { value: "sidebar", label: "Sidebar", desc: "Di samping konten utama" },
    { value: "in_article", label: "Dalam Artikel", desc: "Di tengah halaman berita" },
    { value: "in_feed", label: "Dalam Feed Berita", desc: "Di antara daftar berita" },
    { value: "footer", label: "Footer (Bawah Halaman)", desc: "Di bagian bawah halaman" },
];

export default function AdManager() {
    const { data: ads = [], isLoading } = useQuery({
        queryKey: ["admin_ads"],
        queryFn: adsApi.getAll,
    });
    const [editing, setEditing] = useState<any>(null);
    const [creating, setCreating] = useState(false);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus iklan ini?")) return;
        const ad = ads.find((a: any) => a.id === id);
        try {
            await adsApi.delete(id);
            logActivity("menghapus iklan", "ad", ad?.title || "");
            queryClient.invalidateQueries({ queryKey: ["admin_ads"] });
            queryClient.invalidateQueries({ queryKey: ["ads"] });
            queryClient.invalidateQueries({ queryKey: ["ads_check"] });
            toast({ title: "Iklan dihapus" });
        } catch (error: any) {
            toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
        }
    };

    const handleToggle = async (ad: any) => {
        try {
            await adsApi.update(ad.id, { is_active: !ad.is_active });
            queryClient.invalidateQueries({ queryKey: ["admin_ads"] });
            queryClient.invalidateQueries({ queryKey: ["ads"] });
            queryClient.invalidateQueries({ queryKey: ["ads_check"] });
        } catch (error: any) {
            toast({ title: "Gagal mengubah", variant: "destructive" });
        }
    };

    // Helper to get position labels from positions array
    const getPositionLabels = (positions: string[] | string | undefined) => {
        if (!positions) return [];
        // Handle legacy single string format
        const posArr = Array.isArray(positions) ? positions : [positions];
        return posArr.map(p => POSITIONS.find(pos => pos.value === p)?.label || p);
    };

    if (creating || editing) {
        return (
            <AdForm
                ad={editing}
                onClose={() => { setEditing(null); setCreating(false); }}
                onSaved={() => {
                    setEditing(null);
                    setCreating(false);
                    queryClient.invalidateQueries({ queryKey: ["admin_ads"] });
                    queryClient.invalidateQueries({ queryKey: ["ads"] });
                    queryClient.invalidateQueries({ queryKey: ["ads_check"] });
                }}
            />
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold font-serif text-foreground">Kelola Iklan ({ads.length})</h2>
                <Button size="sm" onClick={() => setCreating(true)}>
                    <Plus size={16} /> Tambah Iklan
                </Button>
            </div>

            {isLoading ? (
                <p className="text-muted-foreground">Memuat...</p>
            ) : ads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-2">Belum ada iklan.</p>
                    <p className="text-sm">Klik "Tambah Iklan" untuk membuat iklan banner pertama.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {ads.map((ad: any) => (
                        <div key={ad.id} className="flex items-start gap-3 bg-card border border-border rounded-lg p-3">
                            {ad.image_url && (
                                <img src={ad.image_url} alt="" className="w-20 h-14 object-cover rounded shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground text-sm truncate">{ad.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${ad.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}>
                                        {ad.is_active ? "Aktif" : "Nonaktif"}
                                    </span>
                                    {getPositionLabels(ad.positions).map((label, i) => (
                                        <span key={i} className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                                            {label}
                                        </span>
                                    ))}
                                    <span className="flex items-center gap-1"><Eye size={12} /> {(ad.view_count || 0).toLocaleString("id-ID")} views</span>
                                    <span className="flex items-center gap-1"><MousePointer size={12} /> {(ad.click_count || 0).toLocaleString("id-ID")} klik</span>
                                    {ad.max_width && (
                                        <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                                            <Maximize2 size={10} /> {ad.max_width}px
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <Button variant="outline" size="sm" onClick={() => handleToggle(ad)}>
                                    {ad.is_active ? "Nonaktifkan" : "Aktifkan"}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setEditing(ad)}>
                                    <Pencil size={16} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(ad.id)}>
                                    <Trash2 size={16} className="text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function AdForm({ ad, onClose, onSaved }: { ad?: any; onClose: () => void; onSaved: () => void }) {
    const isEdit = !!ad;

    // Handle legacy: if ad.position is a string, convert to array; if ad.positions exists, use it
    const getInitialPositions = (): string[] => {
        if (ad?.positions) {
            return Array.isArray(ad.positions) ? ad.positions : [ad.positions];
        }
        if (ad?.position) {
            return [ad.position];
        }
        return ["sidebar"];
    };

    const [form, setForm] = useState({
        title: ad?.title || "",
        image_url: ad?.image_url || "",
        target_url: ad?.target_url || "",
        positions: getInitialPositions(),
        is_active: ad?.is_active ?? true,
        start_date: ad?.start_date ? ad.start_date.slice(0, 10) : "",
        end_date: ad?.end_date ? ad.end_date.slice(0, 10) : "",
        sort_order: ad?.sort_order || 0,
        max_width: ad?.max_width || null,
    });
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const togglePosition = (value: string) => {
        setForm(f => ({
            ...f,
            positions: f.positions.includes(value)
                ? f.positions.filter(p => p !== value)
                : [...f.positions, value]
        }));
    };

    const handleSave = async () => {
        if (!form.title || !form.image_url || !form.target_url) {
            toast({ title: "Judul, gambar, dan URL tujuan wajib diisi", variant: "destructive" });
            return;
        }
        if (form.positions.length === 0) {
            toast({ title: "Pilih minimal satu posisi iklan", variant: "destructive" });
            return;
        }
        setSaving(true);
        const payload = {
            ...form,
            max_width: form.max_width || null,
            start_date: form.start_date || null,
            end_date: form.end_date || null,
        };
        try {
            if (isEdit) {
                await adsApi.update(ad.id, payload);
                logActivity("mengedit iklan", "ad", form.title);
                toast({ title: "Iklan diperbarui" });
            } else {
                await adsApi.create(payload);
                logActivity("menambah iklan", "ad", form.title);
                toast({ title: "Iklan ditambahkan" });
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
                <h2 className="text-lg font-bold font-serif text-foreground">{isEdit ? "Edit Iklan" : "Tambah Iklan"}</h2>
                <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <Label>Judul Iklan</Label>
                        <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Contoh: Banner Promo Ramadhan" />
                    </div>
                    <div>
                        <Label>Gambar Banner</Label>
                        <ImageUpload value={form.image_url} onChange={(url) => setForm(f => ({ ...f, image_url: url }))} />
                    </div>
                    <div>
                        <Label>URL Tujuan (Link saat diklik)</Label>
                        <Input value={form.target_url} onChange={(e) => setForm(f => ({ ...f, target_url: e.target.value }))} placeholder="https://contoh.com/promo" />
                        {form.target_url && (
                            <a href={form.target_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                                <ExternalLink size={12} /> Preview link
                            </a>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label className="mb-2 block">Posisi Iklan <span className="text-muted-foreground font-normal">(pilih satu atau lebih)</span></Label>
                        <div className="space-y-2">
                            {POSITIONS.map(p => (
                                <label
                                    key={p.value}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form.positions.includes(p.value)
                                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                        : "border-border hover:border-muted-foreground/30"
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.positions.includes(p.value)}
                                        onChange={() => togglePosition(p.value)}
                                        className="w-4 h-4 rounded border-input accent-primary"
                                    />
                                    <div>
                                        <div className="text-sm font-medium text-foreground">{p.label}</div>
                                        <div className="text-xs text-muted-foreground">{p.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {form.positions.length === 0 && (
                            <p className="text-xs text-destructive mt-1">Pilih minimal satu posisi</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Tanggal Mulai (opsional)</Label>
                            <Input
                                type="date"
                                value={form.start_date}
                                onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>Tanggal Berakhir (opsional)</Label>
                            <Input
                                type="date"
                                value={form.end_date}
                                onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Urutan (semakin kecil semakin atas)</Label>
                        <Input
                            type="number"
                            min={0}
                            value={form.sort_order}
                            onChange={(e) => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                        />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                            Aktif
                        </label>
                    </div>

                    {/* Size Control */}
                    <div>
                        <Label className="mb-2 block">Ukuran Tampilan Iklan</Label>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                            {[
                                { label: "Kecil", value: 300, desc: "300px" },
                                { label: "Sedang", value: 480, desc: "480px" },
                                { label: "Besar", value: 728, desc: "728px" },
                                { label: "Penuh", value: null, desc: "100%" },
                            ].map((size) => (
                                <button
                                    key={size.label}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, max_width: size.value }))}
                                    className={`p-2 rounded-lg border text-center transition-all ${form.max_width === size.value
                                            ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                            : "border-border hover:border-muted-foreground/30"
                                        }`}
                                >
                                    <div className="text-sm font-semibold text-foreground">{size.label}</div>
                                    <div className="text-xs text-muted-foreground">{size.desc}</div>
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground shrink-0">Custom (px):</Label>
                            <Input
                                type="number"
                                min={100}
                                max={1200}
                                value={form.max_width || ""}
                                onChange={(e) => setForm(f => ({ ...f, max_width: e.target.value ? parseInt(e.target.value) : null }))}
                                placeholder="Contoh: 400"
                                className="h-8 text-sm"
                            />
                        </div>
                        {form.max_width && (
                            <div className="mt-2 p-2 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground text-center">Preview lebar: <strong>{form.max_width}px</strong></p>
                                <div
                                    className="mt-1 h-3 bg-primary/30 rounded mx-auto transition-all"
                                    style={{ width: `${Math.min(100, (form.max_width / 728) * 100)}%`, maxWidth: '100%' }}
                                />
                            </div>
                        )}
                    </div>

                    <Button className="w-full" onClick={handleSave} disabled={saving}>
                        <Save size={16} /> {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Iklan"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
