import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, User, Reply, ThumbsUp, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const commentSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
  email: z.string().trim().email("Email tidak valid").max(255, "Email maksimal 255 karakter"),
  content: z.string().trim().min(1, "Komentar wajib diisi").max(1000, "Komentar maksimal 1000 karakter"),
});

interface CommentProps {
  comment: any;
  articleId: string;
  onReply: (parentId: string) => void;
  replyingTo: string | null;
  onSubmitReply: (parentId: string, data: any) => void;
  onCancelReply: () => void;
}

const CommentItem = ({ comment, articleId, onReply, replyingTo, onSubmitReply, onCancelReply }: CommentProps) => {
  const { toast } = useToast();
  const [likes, setLikes] = useState(comment.likes_count || 0);
  const [liked, setLiked] = useState(false);

  // Form state for reply
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await commentsApi.like(comment.id);
      setLikes(res.likes_count);
      setLiked(true);
    } catch (error) {
      toast({ title: "Gagal menyukai", description: "Mungkin Anda sudah menyukai komentar ini.", variant: "destructive" });
    }
  };

  const handleReport = async () => {
    try {
      await commentsApi.report(comment.id, "Spam/Inappropriate");
      toast({ title: "Komentar dilaporkan", description: "Terima kasih atas laporan Anda." });
    } catch (error) {
      toast({ title: "Gagal melaporkan", variant: "destructive" });
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
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
    onSubmitReply(comment.id, { name, email, content });
    setErrors({});
    setName("");
    setEmail("");
    setContent("");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="mb-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <User size={14} className="text-muted-foreground" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">{comment.name}</span>
            <span className="text-xs text-muted-foreground block">{formatDate(comment.created_at)}</span>
          </div>
        </div>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-3">{comment.content}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 hover:text-primary transition-colors ${liked ? "text-primary font-bold" : ""}`}
          >
            <ThumbsUp size={12} /> {likes} Suka
          </button>
          <button onClick={() => onReply(comment.id)} className="flex items-center gap-1 hover:text-primary transition-colors">
            <Reply size={12} /> Balas
          </button>
          <button onClick={handleReport} className="flex items-center gap-1 hover:text-destructive transition-colors ml-auto">
            <Flag size={12} /> Laporkan
          </button>
        </div>
      </div>

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <div className="ml-8 mt-2 pl-4 border-l-2 border-border">
          <form onSubmit={handleReplySubmit} className="bg-muted/30 rounded p-4 space-y-3">
            <h4 className="text-sm font-semibold">Balas ke {comment.name}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Nama *" value={name} onChange={e => setName(e.target.value)} className={errors.name ? "border-destructive" : ""} />
              <Input placeholder="Email *" type="email" value={email} onChange={e => setEmail(e.target.value)} className={errors.email ? "border-destructive" : ""} />
            </div>
            <Textarea placeholder="Komentar Anda..." value={content} onChange={e => setContent(e.target.value)} className={errors.content ? "border-destructive" : ""} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onCancelReply}>Batal</Button>
              <Button type="submit" size="sm">Kirim Balasan</Button>
            </div>
          </form>
        </div>
      )}

      {/* Nested Comments */}
      {comment.children && comment.children.length > 0 && (
        <div className="ml-8 mt-4 pl-4 border-l-2 border-border/50">
          {comment.children.map((child: any) => (
            <CommentItem
              key={child.id}
              comment={child}
              articleId={articleId}
              onReply={onReply}
              replyingTo={replyingTo}
              onSubmitReply={onSubmitReply}
              onCancelReply={onCancelReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection = ({ articleId }: { articleId: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Main form state
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
    mutationFn: async (values: { name: string; email: string; content: string; parent_id?: string }) => {
      await commentsApi.create(articleId, values);
    },
    onSuccess: () => {
      toast({ title: "Komentar terkirim", description: "Komentar akan muncul setelah disetujui." });
      setName(""); setEmail(""); setContent(""); setReplyingTo(null); setErrors({});
      queryClient.invalidateQueries({ queryKey: ["comments", articleId] });
    },
    onError: () => {
      toast({ title: "Gagal mengirim komentar", variant: "destructive" });
    },
  });

  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = commentSchema.safeParse({ name, email, content });
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors as any); // Simplification layout
      return;
    }
    submitMutation.mutate({ name, email, content });
  };

  const handleReplySubmit = (parentId: string, data: any) => {
    submitMutation.mutate({ ...data, parent_id: parentId });
  };

  return (
    <div className="mt-10">
      <h2 className="flex items-center gap-2 font-bold font-serif text-xl text-foreground mb-6 border-b-2 border-primary pb-2">
        <MessageCircle size={20} />
        Komentar ({comments.length})
      </h2>

      {/* Main Comment Form */}
      <form onSubmit={handleMainSubmit} className="bg-card border border-border rounded-lg p-4 mb-8 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Tinggalkan Komentar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input placeholder="Nama *" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Textarea placeholder="Tulis komentar Anda... *" value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
        <Button type="submit" size="sm" disabled={submitMutation.isPending}>
          <Send size={14} /> Kirim Komentar
        </Button>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat komentar...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Belum ada komentar.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment: any) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              articleId={articleId}
              onReply={setReplyingTo}
              replyingTo={replyingTo}
              onSubmitReply={handleReplySubmit}
              onCancelReply={() => setReplyingTo(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
