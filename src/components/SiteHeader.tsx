import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, Radio, Globe, Users, LogIn, UserPlus, Calendar, LogOut, User, ChevronDown, LayoutDashboard } from "lucide-react";
import { useCategories } from "@/hooks/useArticles";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
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

// Format date in Indonesian
const getIndonesianDate = () => {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const now = new Date();
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
};

const SiteHeader = () => {
  const { data: categories = [] } = useCategories();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(getIndonesianDate());
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  useEffect(() => {
    // Update date at midnight
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timer = setTimeout(() => {
      setCurrentDate(getIndonesianDate());
    }, msUntilMidnight);
    return () => clearTimeout(timer);
  }, [currentDate]);

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
      {/* ── Unified Top Bar · Logo + Utility ─────────────────── */}
      <div className="container flex items-center justify-between h-12 sm:h-14">
        {/* Left — hamburger (mobile) + logo + brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 -ml-2 text-foreground flex-shrink-0" aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img src={logoMenara} alt="MenaraPublik.News" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover flex-shrink-0" />
            <div className="flex flex-col leading-none min-w-0">
              <span className="text-sm sm:text-lg font-black font-serif text-primary tracking-tight whitespace-nowrap">
                MenaraPublik<span className="text-muted-foreground font-medium text-[9px] sm:text-xs">.News</span>
              </span>
              <span className="text-[7px] sm:text-[9px] font-medium text-muted-foreground tracking-widest uppercase whitespace-nowrap">Mengawal Kepentingan Publik</span>
            </div>
          </Link>
        </div>

        {/* Right — utility links (desktop) + search/theme (all) */}
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          {/* Desktop utility links */}
          <div className="hidden lg:flex items-center gap-0.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
              <Calendar size={13} className="opacity-70" />
              <span className="font-medium whitespace-nowrap">{currentDate}</span>
            </div>

            <span className="w-px h-4 bg-border mx-0.5" />

            <Link
              to="/video"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-blue-400/60 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors text-xs font-semibold"
            >
              <Radio size={12} className="animate-pulse" />
              LIVE
            </Link>

            <span className="w-px h-4 bg-border mx-0.5" />

            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1 px-2 py-1 text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              <Search size={13} />
              <span>Cari</span>
            </button>

            <span className="w-px h-4 bg-border mx-0.5" />

            <a
              href="https://menarapublik.news"
              className="flex items-center gap-1 px-2 py-1 text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              <Globe size={13} className="text-blue-500" />
              <span>Network</span>
            </a>

            <span className="w-px h-4 bg-border mx-0.5" />

            <Link
              to="/tentang"
              className="flex items-center gap-1 px-2 py-1 text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              <Users size={13} />
              <span>Ikuti Kami</span>
            </Link>

            <span className="w-px h-4 bg-border mx-0.5" />

            {/* Auth: show user menu if logged in, or login/register buttons */}
            {!authLoading && user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-600/10 text-red-600 dark:text-red-400 hover:bg-red-600/20 transition-colors text-xs font-semibold"
                >
                  <User size={13} />
                  <span className="max-w-[100px] truncate">{user.name || user.email}</span>
                  <ChevronDown size={12} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-2 border-b border-border/50">
                      <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent transition-colors"
                      >
                        <LayoutDashboard size={13} />
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut size={13} />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : !authLoading ? (
              <>
                <Link
                  to="/masuk"
                  className="flex items-center gap-1 px-2 py-1 text-muted-foreground hover:text-foreground transition-colors text-xs"
                >
                  <LogIn size={13} />
                  <span>Masuk</span>
                </Link>
                <Link
                  to="/daftar"
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white hover:bg-blue-500 rounded-full transition-colors text-xs font-semibold"
                >
                  <UserPlus size={13} />
                  <span>Daftar</span>
                </Link>
              </>
            ) : null}

            <span className="w-px h-4 bg-border mx-1" />
          </div>

          <ThemeToggle />

          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari berita..." autoFocus className="w-32 sm:w-48 lg:w-56 h-8 px-3 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-muted-foreground"><X size={18} /></button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors lg:hidden" aria-label="Cari">
              <Search size={20} />
            </button>
          )}
        </div>
      </div>

      {/* ── Colorful Category Bar — Desktop ──────────────────── */}
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
                  className="flex-1 text-center py-2 text-xs font-bold text-white transition-all duration-200 uppercase tracking-wide"
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

      {/* ── Mobile Menu ──────────────────────────────────────── */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-border bg-card animate-in slide-in-from-top-2 duration-200">
          {/* Mobile utility links */}
          <div className="px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Calendar size={13} />
              <span className="font-medium">{currentDate}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/video" onClick={() => setMenuOpen(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-blue-400/60 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                <Radio size={13} className="animate-pulse" />
                LIVE
              </Link>
              <a href="https://menarapublik.news" onClick={() => setMenuOpen(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                <Globe size={13} className="text-blue-500" />
                Network
              </a>
              <Link to="/tentang" onClick={() => setMenuOpen(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                <Users size={13} />
                Ikuti Kami
              </Link>
              {!authLoading && user ? (
                <>
                  <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600/10 text-red-600 dark:text-red-400 text-xs font-semibold">
                    <User size={13} />
                    <span className="truncate max-w-[120px]">{user.name || user.email}</span>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80"
                    >
                      <LayoutDashboard size={13} />
                      Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold">
                    <LogOut size={13} />
                    Keluar
                  </button>
                </>
              ) : !authLoading ? (
                <>
                  <Link to="/masuk" onClick={() => setMenuOpen(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                    <LogIn size={13} />
                    Masuk
                  </Link>
                  <Link to="/daftar" onClick={() => setMenuOpen(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold">
                    <UserPlus size={13} />
                    Daftar
                  </Link>
                </>
              ) : null}
            </div>
          </div>

          {/* Category badges */}
          <div className="px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {navItems.map((item, index) => {
                const color = getCategoryColor(index);
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-2.5 text-sm font-bold text-white rounded-full transition-all duration-200 hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: color.bg }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
