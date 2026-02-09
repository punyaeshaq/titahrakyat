import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useArticles";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logoMenara from "@/assets/logo-menara.png";

const SiteFooter = () => {
  const { data: categories = [] } = useCategories();

  const { data: socialLinks = [] } = useQuery({
    queryKey: ["social_links_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []).filter((l: any) => l.url);
    },
  });

  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-2">
              <img src={logoMenara} alt="MenaraPublik.News" className="h-10 w-10 rounded-full object-cover" />
              <span className="text-lg font-black font-serif text-primary">
                MenaraPublik<span className="text-muted-foreground font-medium text-sm">.News</span>
              </span>
            </Link>
            <p className="text-xs italic text-muted-foreground mb-1">
              "Mengawal Kepentingan Publik"
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Media online yang menyajikan informasi publik secara jernih, berimbang, dan bertanggung jawab.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {socialLinks.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1 bg-secondary text-muted-foreground rounded-full hover:text-primary transition-colors"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <nav className="flex flex-wrap gap-3">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  to={`/kategori/${cat.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
            </nav>
            <div className="flex gap-3">
              <Link to="/video" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Video
              </Link>
              <Link to="/tentang" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Tentang Kami
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-6 pt-4 text-center text-xs text-muted-foreground">
          © 2026 MenaraPublik.News. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
