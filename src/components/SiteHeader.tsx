import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { useCategories } from "@/hooks/useArticles";
import { useState } from "react";
import logoMenara from "@/assets/logo-menara.png";
import ThemeToggle from "@/components/ThemeToggle";

// Vibrant color palette for categories
const CATEGORY_COLORS = [
  { bg: "#DC2626", hover: "#B91C1C" },   // Red
  { bg: "#1D4ED8", hover: "#1E40AF" },   // Blue
  { bg: "#6D28D9", hover: "#5B21B6" },   // Purple
  { bg: "#059669", hover: "#047857" },   // Green
  { bg: "#0891B2", hover: "#0E7490" },   // Cyan
  { bg: "#EA580C", hover: "#C2410C" },   // Orange
  { bg: "#DB2777", hover: "#BE185D" },   // Pink
  { bg: "#4F46E5", hover: "#4338CA" },   // Indigo
  { bg: "#0D9488", hover: "#0F766E" },   // Teal
  { bg: "#CA8A04", hover: "#A16207" },   // Yellow
];

const getCategoryColor = (index: number) => CATEGORY_COLORS[index % CATEGORY_COLORS.length];

const SiteHeader = () => {
  const { data: categories = [] } = useCategories();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/cari?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  // Build the full list of nav items: categories + Video
  const navItems = [
    ...categories.map((cat) => ({
      id: cat.id,
      label: cat.label,
      to: `/kategori/${cat.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
    })),
    { id: "video", label: "Video", to: "/video" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
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

      {/* Colorful Category Bar - Desktop */}
      <nav className="hidden lg:block border-t border-border/50">
        <div className="container">
          <div className="flex">
            {navItems.map((item, index) => {
              const color = getCategoryColor(index);
              const isHovered = hoveredIndex === index;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className="flex-1 text-center py-2.5 text-sm font-bold text-white transition-all duration-200 uppercase tracking-wide"
                  style={{
                    backgroundColor: isHovered ? color.hover : color.bg,
                    transform: isHovered ? "translateY(-1px)" : "none",
                    boxShadow: isHovered ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Menu with Colorful Badges */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-border bg-card px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item, index) => {
              const color = getCategoryColor(index);
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-white rounded-full transition-all duration-200 hover:opacity-90 hover:scale-105"
                  style={{ backgroundColor: color.bg }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
