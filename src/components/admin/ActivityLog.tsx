import { useQuery } from "@tanstack/react-query";
import { activityLogsApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Activity, Newspaper, AlertTriangle, FolderOpen, Users, Building2, KeyRound } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  article: <Newspaper size={14} className="text-primary" />,
  breaking_news: <AlertTriangle size={14} className="text-destructive" />,
  category: <FolderOpen size={14} className="text-amber-500" />,
  editorial: <Building2 size={14} className="text-violet-500" />,
  user: <Users size={14} className="text-blue-500" />,
  auth: <KeyRound size={14} className="text-muted-foreground" />,
};

export default function ActivityLog() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["activity_logs"],
    queryFn: async () => {
      const data = await activityLogsApi.getAll(50);
      return data || [];
    },
    refetchInterval: 30000,
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Activity size={20} className="text-primary" />
        <h2 className="text-lg font-bold font-serif text-foreground">Log Aktivitas</h2>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Memuat...</p>
      ) : logs.length === 0 ? (
        <p className="text-muted-foreground text-sm">Belum ada aktivitas.</p>
      ) : (
        <div className="space-y-1">
          {logs.map((log: any) => (
            <div key={log.id} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
              <div className="mt-0.5 shrink-0">
                {iconMap[log.target_type] || <Activity size={14} className="text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{log.user_email?.split("@")[0]}</span>
                  {" "}
                  <span className="text-muted-foreground">{log.action}</span>
                  {" "}
                  {log.target_title && (
                    <span className="font-medium">"{log.target_title}"</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: localeId })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

