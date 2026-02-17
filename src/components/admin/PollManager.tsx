import { useState } from "react";
import { pollsApi } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Check, X, BarChart2, Power } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const PollManager = () => {
    const { data: polls = [], isLoading } = useQuery({
        queryKey: ["admin_polls"],
        queryFn: async () => (await pollsApi.getAll()).data, // Pagination handled by backend, focusing on page 1 for now or all
    });
    const [creating, setCreating] = useState(false);
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [expiresAt, setExpiresAt] = useState("");
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const handleCreate = async () => {
        if (!question.trim() || options.some(o => !o.trim())) {
            toast({ title: "Mohon lengkapi pertanyaan dan opsi", variant: "destructive" });
            return;
        }

        try {
            await pollsApi.create({
                question,
                options: options.filter(o => o.trim()),
                expires_at: expiresAt || undefined
            });
            toast({ title: "Polling dibuat" });
            setCreating(false);
            setQuestion("");
            setOptions(["", ""]);
            setExpiresAt("");
            queryClient.invalidateQueries({ queryKey: ["admin_polls"] });
        } catch (error: any) {
            toast({ title: "Gagal membuat", description: error.message, variant: "destructive" });
        }
    };

    const handleToggleActive = async (poll: any) => {
        try {
            await pollsApi.update(poll.id, { is_active: !poll.is_active });
            queryClient.invalidateQueries({ queryKey: ["admin_polls"] });
            toast({ title: poll.is_active ? "Polling ditutup" : "Polling diaktifkan" });
        } catch (error: any) {
            toast({ title: "Gagal update", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus polling ini? Data suara akan hilang.")) return;
        try {
            await pollsApi.delete(id);
            queryClient.invalidateQueries({ queryKey: ["admin_polls"] });
            toast({ title: "Polling dihapus" });
        } catch (error: any) {
            toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold font-serif text-foreground">Manajemen Polling</h2>
                <Button onClick={() => setCreating(!creating)} size="sm">
                    {creating ? <X size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
                    {creating ? "Batal" : "Buat Polling"}
                </Button>
            </div>

            {creating && (
                <div className="bg-card border border-border rounded-lg p-4 mb-6">
                    <div className="space-y-4">
                        <div>
                            <Label>Pertanyaan</Label>
                            <Input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Contoh: Setuju dengan kebijakan X?" />
                        </div>
                        <div>
                            <Label>Opsi Jawaban</Label>
                            {options.map((opt, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <Input
                                        value={opt}
                                        onChange={e => {
                                            const newOpts = [...options];
                                            newOpts[i] = e.target.value;
                                            setOptions(newOpts);
                                        }}
                                        placeholder={`Opsi ${i + 1}`}
                                    />
                                    {options.length > 2 && (
                                        <Button variant="ghost" size="icon" onClick={() => setOptions(options.filter((_, idx) => idx !== i))}>
                                            <X size={16} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => setOptions([...options, ""])} className="mt-2">
                                <Plus size={14} className="mr-1" /> Tambah Opsi
                            </Button>
                        </div>
                        <div>
                            <Label>Berakhir Pada (Opsional)</Label>
                            <Input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
                        </div>
                        <Button onClick={handleCreate}>Simpan Polling</Button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <p className="text-muted-foreground">Memuat...</p>
            ) : polls.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Belum ada polling.</p>
            ) : (
                <div className="space-y-4">
                    {polls.map((poll: any) => (
                        <div key={poll.id} className={`bg-card border rounded-lg p-4 ${poll.is_active ? 'border-primary' : 'border-border'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg">{poll.question}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${poll.is_active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                            {poll.is_active ? 'Aktif' : 'Selesai'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Dibuat: {format(new Date(poll.created_at), "d MMM yyyy", { locale: idLocale })}
                                        {poll.expires_at && ` • Berakhir: ${format(new Date(poll.expires_at), "d MMM yyyy")}`}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleToggleActive(poll)}>
                                        <Power size={14} className={`mr-1 ${poll.is_active ? "text-destructive" : "text-green-600"}`} />
                                        {poll.is_active ? "Tutup" : "Aktifkan"}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(poll.id)}>
                                        <Trash2 size={14} className="text-destructive" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {poll.options.map((opt: any) => {
                                    const total = poll.votes_count || 1;
                                    const pct = Math.round((opt.votes_count / (poll.votes_count || 1)) * 100);
                                    return (
                                        <div key={opt.id} className="text-sm">
                                            <div className="flex justify-between mb-1">
                                                <span>{opt.option_text}</span>
                                                <span className="font-semibold">{poll.votes_count > 0 ? `${opt.votes_count} (${pct}%)` : '0'}</span>
                                            </div>
                                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-primary/50" style={{ width: `${poll.votes_count > 0 ? pct : 0}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground text-right">
                                Total Suara: {poll.votes_count}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PollManager;
