import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logoTitahRakyat from "@/assets/logo-titahrakyat.png";
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, isAdmin, loading: authLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditorPath = location.pathname.startsWith("/editor");

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "editor") navigate("/editor");
      else navigate("/");
    }
  }, [authLoading, user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-red-600 text-lg font-medium">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex bg-white">
      {/* Left side — Branding panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-red-700">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.1]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute top-20 left-20 text-white/[0.05]"><Shield size={120} /></div>
          <div className="absolute bottom-20 right-20 text-white/[0.05]"><Shield size={80} /></div>
        </div>

        <div className="relative z-10 max-w-lg text-white">
          <div className="flex items-center gap-4 mb-8">
            <img src={logoTitahRakyat} alt="TitahRakyat" className="h-16 w-16 rounded-xl shadow-2xl shadow-black/20" />
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                Titah<span className="text-red-200">Rakyat</span>
              </h1>
              <p className="text-white/60 text-sm tracking-widest uppercase">Media Online</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Panel<br />
              <span className="text-red-200">
                {isEditorPath ? "Editor" : "Administrasi"}
              </span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Kelola konten, pantau statistik, dan operasikan semua aspek portal berita TitahRakyat.Com dari sini.
            </p>

            <div className="flex flex-col gap-3 pt-4">
              {[
                { icon: "📰", text: "Kelola Artikel & Breaking News" },
                { icon: "📊", text: "Pantau Statistik & Analytics" },
                { icon: "👥", text: "Manajemen Tim & Pengguna" },
                { icon: "⚙️", text: "Pengaturan & Konfigurasi" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.1] rounded-lg px-4 py-3 border border-white/[0.1] hover:bg-white/[0.15] transition-colors">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-white/90 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side — Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-red-50 via-white to-red-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <img src={logoTitahRakyat} alt="TitahRakyat" className="h-12 w-12 rounded-xl shadow-lg" />
              <div className="text-left">
                <h1 className="text-xl font-black text-slate-900">Titah<span className="text-red-600">Rakyat</span></h1>
                <p className="text-xs text-slate-500 tracking-widest">MEDIA ONLINE</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl p-8 lg:p-10 shadow-2xl shadow-red-900/5">
            {/* Admin badge */}
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-1.5 w-fit mb-6">
              <Shield className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                {isEditorPath ? "Editor Access" : "Admin Access"}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-1">Masuk ke Dashboard</h2>
            <p className="text-slate-500 text-sm mb-8">Gunakan kredensial admin Anda</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                    placeholder="admin@TitahRakyat.Com" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                    placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2">
                  <span className="text-red-500 text-sm mt-0.5">⚠️</span>
                  <span className="text-red-600 text-sm">{error}</span>
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group mt-2">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Memverifikasi...
                  </span>
                ) : (
                  <>
                    Masuk ke Dashboard
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-xs">
                Akses hanya untuk personel yang berwenang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
