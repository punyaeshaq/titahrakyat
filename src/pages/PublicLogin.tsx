import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";
import { GOOGLE_CLIENT_ID } from "@/lib/google-config";
import logoMenara from "@/assets/logo-menara.png";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Newspaper } from "lucide-react";

declare global {
    interface Window {
        google?: any;
    }
}

const PublicLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [otpRedirect, setOtpRedirect] = useState(false);
    const { user, loading: authLoading, signIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && user) {
            navigate("/");
        }
    }, [authLoading, user, navigate]);

    // Initialize Google Sign-In
    const googleButtonRef = useCallback((node: HTMLDivElement | null) => {
        if (node && window.google && GOOGLE_CLIENT_ID) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleSignIn,
            });
            window.google.accounts.id.renderButton(node, {
                theme: "filled_blue", // Updated to blue or neutral as standard, or filled_black
                size: "large",
                width: "100%",
                text: "signin_with",
                shape: "pill",
                locale: "id",
            });
        }
    }, []);

    const handleGoogleSignIn = async (response: any) => {
        if (!response.credential) return;
        setError("");
        setSubmitting(true);
        try {
            const data = await authApi.googleLogin(response.credential);
            if (data.user) {
                window.location.href = "/";
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Login Google gagal.");
        }
        setSubmitting(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        const { data, error: signInError } = await signIn(email, password);

        if (signInError) {
            // Check if OTP verification needed
            if (data?.requires_otp) {
                setOtpRedirect(true);
                setTimeout(() => {
                    navigate(`/daftar?email=${encodeURIComponent(email)}&step=otp`);
                }, 1500);
            } else {
                setError(signInError.message);
            }
        } else {
            navigate("/");
        }
        setSubmitting(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse text-red-600 text-lg font-medium">Memuat...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50">
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Floating icons (lighter/subtle) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="absolute text-red-900/[0.03] select-none" style={{ top: `${15 + i * 22}%`, left: `${5 + i * 25}%`, transform: `rotate(${-15 + i * 10}deg)` }}>
                        <Newspaper size={60 + i * 10} />
                    </div>
                ))}
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <img src={logoMenara} alt="TitahRakyat" className="h-14 w-14 rounded-xl shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform" />
                        <div className="text-left">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                Menara<span className="text-red-600">Publik</span>
                            </h1>
                            <p className="text-xs text-slate-500 tracking-widest uppercase">Mengawal Kepentingan Publik</p>
                        </div>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-3xl border border-white/60 rounded-2xl p-8 shadow-2xl shadow-red-900/5">
                    <h2 className="text-xl font-bold text-slate-900 mb-1">Selamat Datang 👋</h2>
                    <p className="text-slate-500 text-sm mb-6">Masuk untuk membaca dan berinteraksi</p>

                    {otpRedirect && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-blue-600 text-sm mb-4">
                            Email belum terverifikasi. Mengalihkan ke verifikasi OTP...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                                    placeholder="nama@email.com" required />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                                    placeholder="••••••••" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm flex items-start gap-2">
                                <span className="mt-0.5">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <button type="submit" disabled={submitting}
                            className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group">
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    Masuk...
                                </span>
                            ) : (
                                <>Masuk <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    {/* Google Sign-In divider + button */}
                    {GOOGLE_CLIENT_ID && (
                        <>
                            <div className="flex items-center gap-3 my-5">
                                <div className="flex-1 h-px bg-slate-100" />
                                <span className="text-slate-400 text-xs uppercase tracking-widest">atau</span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>
                            <div ref={googleButtonRef} className="w-full flex justify-center [&>div]:!w-full" />
                        </>
                    )}

                    {!GOOGLE_CLIENT_ID && (
                        <>
                            <div className="flex items-center gap-3 my-5">
                                <div className="flex-1 h-px bg-slate-100" />
                                <span className="text-slate-400 text-xs uppercase tracking-widest">atau</span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>
                            <button onClick={() => {
                                setError("Google Sign-In belum dikonfigurasi. Hubungi admin.");
                            }}
                                className="w-full py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Masuk dengan Google
                            </button>
                        </>
                    )}

                    <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm">
                            Belum punya akun?{" "}
                            <Link to="/daftar" className="text-red-600 hover:text-red-700 font-bold transition-colors">Daftar Sekarang</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link to="/" className="text-slate-400 hover:text-red-600 text-sm transition-colors">
                        ← Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PublicLogin;
