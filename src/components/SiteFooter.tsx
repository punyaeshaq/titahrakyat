import { Link } from "react-router-dom";
import { categories } from "@/data/articles";

const SiteFooter = () => {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-2">
              <span className="text-lg font-black font-serif text-primary">KABAR</span>
              <span className="text-lg font-light font-serif text-foreground">HARI INI</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Portal berita terpercaya. Informasi cepat, akurat, dan terkini untuk Indonesia.
            </p>
          </div>
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
        </div>
        <div className="border-t border-border mt-6 pt-4 text-center text-xs text-muted-foreground">
          © 2026 Kabar Hari Ini. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
