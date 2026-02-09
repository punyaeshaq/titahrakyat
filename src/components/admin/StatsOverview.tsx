import { useArticles, useCategories } from "@/hooks/useArticles";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Eye, FileText, TrendingUp, Layers } from "lucide-react";

const COLORS = ["hsl(0, 85%, 50%)", "hsl(210, 100%, 45%)", "hsl(45, 100%, 51%)", "hsl(150, 60%, 40%)", "hsl(280, 60%, 50%)", "hsl(30, 90%, 50%)"];

const StatsOverview = () => {
  const { data: articles = [] } = useArticles();
  const { data: categories = [] } = useCategories();

  const totalArticles = articles.length;
  const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
  const avgViews = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;

  // Articles per category
  const categoryStats = categories.map((cat: any) => {
    const catArticles = articles.filter((a) => a.categoryId === cat.id);
    return {
      name: cat.label,
      articles: catArticles.length,
      views: catArticles.reduce((sum, a) => sum + a.views, 0),
    };
  }).filter((c) => c.articles > 0);

  // Top articles by views
  const topArticles = [...articles].sort((a, b) => b.views - a.views).slice(0, 5).map((a) => ({
    name: a.title.length > 30 ? a.title.slice(0, 30) + "..." : a.title,
    views: a.views,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold font-serif text-foreground">Statistik</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<FileText size={20} />} label="Total Artikel" value={totalArticles} />
        <StatCard icon={<Eye size={20} />} label="Total Views" value={totalViews.toLocaleString("id-ID")} />
        <StatCard icon={<TrendingUp size={20} />} label="Rata-rata Views" value={avgViews.toLocaleString("id-ID")} />
        <StatCard icon={<Layers size={20} />} label="Kategori" value={categories.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views per category */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Views per Kategori</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="views" fill="hsl(0, 85%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Articles per category pie */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Distribusi Artikel</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryStats} dataKey="articles" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, articles }) => `${name} (${articles})`}>
                {categoryStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top articles */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Top 5 Artikel Terpopuler</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={topArticles} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={180} />
            <Tooltip />
            <Bar dataKey="views" fill="hsl(210, 100%, 45%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">{icon}<span className="text-xs">{label}</span></div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export default StatsOverview;
