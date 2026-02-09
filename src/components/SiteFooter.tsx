import { Link } from "react-router-dom";
import { categories } from "@/data/articles";
import logoMenara from "@/assets/logo-menara.jpg";

const SiteFooter = () => {
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
          </div>
          <div className="flex flex-col gap-3">
            <nav className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/kategori/${cat.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
            </nav>
            <Link
              to="/tentang"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Tentang Kami
            </Link>
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
