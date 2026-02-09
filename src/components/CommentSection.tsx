import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const commentSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
  email: z.string().trim().email("Email tidak valid").max(255, "Email maksimal 255 karakter"),
  content: z.string().trim().min(1, "Komentar wajib diisi").max(1000, "Komentar maksimal 1000 karakter"),
});

interface CommentSectionProps {
  articleId: string;
}

const CommentSection = ({ articleId }: CommentSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", articleId],
    queryFn: async () => {
      const data = await commentsApi.getByArticle(articleId);
      return data || [];
    },
    enabled: !!articleId,
  });

  const submitMutation = useMutation({
    mutationFn: async (values: { name: string; email: string; content: string }) => {
      await commentsApi.create(articleId, values);
    },
    onSuccess: () => {
      toast({ title: "Komentar terkirim", description: "Komentar Anda akan ditampilkan setelah disetujui moderator." });
      setName("");
      setEmail("");
      setContent("");
      setErrors({});
      queryClient.invalidateQueries({ queryKey: ["comments", articleId] });
    },
    onError: () => {
      toast({ title: "Gagal mengirim komentar", description: "Silakan coba lagi.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = commentSchema.safeParse({ name, email, content });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    submitMutation.mutate({ name: result.data.name, email: result.data.email, content: result.data.content });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mt-10">
      <h2 className="flex items-center gap-2 font-bold font-serif text-xl text-foreground mb-6 border-b-2 border-primary pb-2">
        <MessageCircle size={20} />
        Komentar ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-4 mb-8 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Tinggalkan Komentar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Nama *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Input
              placeholder="Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
        </div>
        <div>
          <Textarea
            placeholder="Tulis komentar Anda... *"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            rows={4}
            className={errors.content ? "border-destructive" : ""}
          />
          <div className="flex justify-between mt-1">
            {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
            <span className="text-xs text-muted-foreground ml-auto">{content.length}/1000</span>
          </div>
        </div>
        <Button type="submit" size="sm" disabled={submitMutation.isPending}>
          <Send size={14} />
          {submitMutation.isPending ? "Mengirim..." : "Kirim Komentar"}
        </Button>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat komentar...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment: any) => (
            <div key={comment.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <User size={14} className="text-muted-foreground" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground">{comment.name}</span>
                  <span className="text-xs text-muted-foreground block">{formatDate(comment.created_at)}</span>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
