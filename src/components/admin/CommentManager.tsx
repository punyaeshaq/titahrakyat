import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";
import { Check, X, Trash2, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function CommentManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin_comments"],
    queryFn: async () => {
      const data = await commentsApi.getAll();
      return data || [];
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const filtered = comments.filter((c: any) => {
    if (filter === "pending") return !c.is_approved;
    if (filter === "approved") return c.is_approved;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleApprove = async (id: string, name: string) => {
    try {
      await commentsApi.approve(id);
      logActivity("menyetujui komentar", "comment", `Komentar dari ${name}`);
      queryClient.invalidateQueries({ queryKey: ["admin_comments"] });
      queryClient.invalidateQueries({ queryKey: ["articles", "most_commented"] });
      toast({ title: "Komentar disetujui" });
    } catch (error: any) {
      toast({ title: "Gagal menyetujui", variant: "destructive" });
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (!confirm("Tolak dan hapus komentar ini?")) return;
    try {
      await commentsApi.delete(id);
      logActivity("menolak komentar", "comment", `Komentar dari ${name}`);
      queryClient.invalidateQueries({ queryKey: ["admin_comments"] });
      toast({ title: "Komentar dihapus" });
    } catch (error: any) {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  const pendingCount = comments.filter((c: any) => !c.is_approved).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
          <MessageCircle size={20} /> Moderasi Komentar
          {pendingCount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
              {pendingCount} menunggu
            </span>
          )}
        </h2>
      </div>

      <div className="flex gap-2 mb-4">
        {(["pending", "approved", "all"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilter(f); setPage(1); }}
          >
            {f === "pending" ? "Menunggu" : f === "approved" ? "Disetujui" : "Semua"}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Memuat...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4">
          {filter === "pending" ? "Tidak ada komentar yang menunggu moderasi." : "Tidak ada komentar."}
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map((c: any) => (
              <div key={c.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-foreground">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.email}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${c.is_approved ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"}`}>
                        {c.is_approved ? "Disetujui" : "Menunggu"}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-2">{c.content}</p>
                    <div className="text-xs text-muted-foreground">
                      <span>Pada: </span>
                      <span className="font-medium">{c.article?.title || "Artikel dihapus"}</span>
                      <span className="ml-2">• {new Date(c.created_at).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!c.is_approved && (
                      <Button variant="ghost" size="icon" title="Setujui" onClick={() => handleApprove(c.id, c.name)}>
                        <Check size={16} className="text-green-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" title="Hapus" onClick={() => handleReject(c.id, c.name)}>
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="icon" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm text-muted-foreground">{safePage} / {totalPages}</span>
              <Button variant="outline" size="icon" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

