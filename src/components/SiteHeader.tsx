import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { categories } from "@/data/articles";
import { useState } from "react";

const SiteHeader = () => {
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
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 -ml-2 text-foreground"
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/" className="flex items-center gap-1">
            <span className="text-xl font-black font-serif text-primary tracking-tight">
              Menara
            </span>
            <span className="text-xl font-light font-serif text-foreground tracking-tight">
              Publik
            </span>
            <span className="text-xs font-medium text-muted-foreground">.News</span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/kategori/${cat.id}`}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent"
            >
              {cat.label}
            </Link>
          ))}
          <Link
            to="/tentang"
            className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent"
          >
            Tentang
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari berita..."
                autoFocus
                className="w-40 sm:w-56 h-9 px-3 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-muted-foreground"
              >
                <X size={18} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cari"
            >
              <Search size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-border bg-card px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/kategori/${cat.id}`}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground bg-secondary rounded-full hover:text-primary transition-colors"
              >
                {cat.label}
              </Link>
            ))}
            <Link
              to="/tentang"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground bg-secondary rounded-full hover:text-primary transition-colors"
            >
              Tentang
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
