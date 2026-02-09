import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { useCategories } from "@/hooks/useArticles";
import { useState } from "react";
import logoMenara from "@/assets/logo-menara.jpg";
import ThemeToggle from "@/components/ThemeToggle";

const SiteHeader = () => {
  const { data: categories = [] } = useCategories();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/cari?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 -ml-2 text-foreground" aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src={logoMenara} alt="MenaraPublik.News" className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover" />
            <div className="flex flex-col leading-none">
              <span className="text-base sm:text-xl font-black font-serif text-primary tracking-tight">
                MenaraPublik<span className="text-muted-foreground font-medium text-[10px] sm:text-sm">.News</span>
              </span>
              <span className="text-[8px] sm:text-[10px] font-medium text-muted-foreground tracking-widest uppercase">Mengawal Kepentingan Publik</span>
            </div>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/kategori/${cat.id}`} className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent">
              {cat.label}
            </Link>
          ))}
          <Link to="/video" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent">
            Video
          </Link>
          <Link to="/tentang" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent">
            Tentang
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari berita..." autoFocus className="w-40 sm:w-56 h-9 px-3 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-muted-foreground"><X size={18} /></button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Cari">
              <Search size={20} />
            </button>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="lg:hidden border-t border-border bg-card px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/kategori/${cat.id}`} onClick={() => setMenuOpen(false)} className="px-3 py-1.5 text-sm font-medium text-muted-foreground bg-secondary rounded-full hover:text-primary transition-colors">
                {cat.label}
              </Link>
            ))}
            <Link to="/video" onClick={() => setMenuOpen(false)} className="px-3 py-1.5 text-sm font-medium text-muted-foreground bg-secondary rounded-full hover:text-primary transition-colors">
              Video
            </Link>
            <Link to="/tentang" onClick={() => setMenuOpen(false)} className="px-3 py-1.5 text-sm font-medium text-muted-foreground bg-secondary rounded-full hover:text-primary transition-colors">
              Tentang
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
