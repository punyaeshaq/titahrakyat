import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "@/lib/api";
import { GOOGLE_CLIENT_ID } from "@/lib/google-config";
import logoMenara from "@/assets/logo-menara.png";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle2, Newspaper, RefreshCw } from "lucide-react";

declare global {
    interface Window {
        google?: any;
    }
}

type Step = "register" | "otp" | "success";

const PublicRegister = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const initialEmail = searchParams.get("email") || "";
    const initialStep = searchParams.get("step") === "otp" ? "otp" : "register";

    const [step, setStep] = useState<Step>(initialStep as Step);
    const [name, setName] = useState("");
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Initialize Google Sign-In
    const googleButtonRef = useCallback((node: HTMLDivElement | null) => {
        if (node && window.google && GOOGLE_CLIENT_ID) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleSignIn,
            });
            window.google.accounts.id.renderButton(node, {
                theme: "filled_blue",
                size: "large",
                width: "100%",
                text: "signup_with",
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
                setStep("success");
                setTimeout(() => navigate("/"), 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Login Google gagal.");
        }
        setSubmitting(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Password dan konfirmasi password tidak cocok.");
            return;
        }

        setSubmitting(true);
        try {
            const data = await authApi.register(name, email, password, confirmPassword);
            if (data.requires_otp) {
                setStep("otp");
                setResendCooldown(60);
            } else if (data.access_token) {
                // Direct login (no OTP columns)
                setStep("success");
                setTimeout(() => navigate("/"), 2000);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || "Registrasi gagal.";
            setError(msg);
        }
        setSubmitting(false);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otpCode];
        newOtp[index] = value.slice(-1);
        setOtpCode(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otpCode[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newOtp = [...otpCode];
        for (let i = 0; i < pasted.length; i++) {
            newOtp[i] = pasted[i];
        }
        setOtpCode(newOtp);
        const nextIdx = Math.min(pasted.length, 5);
        otpRefs.current[nextIdx]?.focus();
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const code = otpCode.join("");
        if (code.length !== 6) {
            setError("Masukkan kode OTP 6 digit.");
            return;
        }

        setSubmitting(true);
        try {
            await authApi.verifyOtp(email, code);
            setStep("success");
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.otp_code?.[0] || "Verifikasi gagal.";
            setError(msg);
        }
        setSubmitting(false);
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setError("");

        try {
            await authApi.resendOtp(email);
            setResendCooldown(60);
            setOtpCode(["", "", "", "", "", ""]);
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal mengirim ulang OTP.");
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50">
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Floating particles (lighter/subtle) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="absolute text-red-900/[0.03] select-none" style={{ top: `${10 + i * 18}%`, left: `${8 + i * 18}%`, transform: `rotate(${-10 + i * 12}deg)` }}>
                        <Newspaper size={50 + i * 8} />
                    </div>
                ))}
            </div>

            <div className="relative z-10 w-full max-w-md px-4 py-8">
                {/* Logo */}
                <div className="text-center mb-6">
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

                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-5">
                    {["register", "otp", "success"].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step === s ? "bg-red-600 text-white scale-110" :
                                ["register", "otp", "success"].indexOf(step) > i ? "bg-red-500 text-white" :
                                    "bg-slate-200 text-slate-400"
                                }`}>
                                {["register", "otp", "success"].indexOf(step) > i ? "✓" : i + 1}
                            </div>
                            {i < 2 && <div className={`w-8 h-0.5 transition-all duration-300 ${["register", "otp", "success"].indexOf(step) > i ? "bg-red-500" : "bg-slate-200"}`} />}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-3xl border border-white/60 rounded-2xl p-8 shadow-2xl shadow-red-900/5">

                    {/* STEP 1: Register form */}
                    {step === "register" && (
                        <>
                            <div className="mb-5">
                                <h2 className="text-xl font-bold text-slate-900 mb-1">Buat Akun Baru ✨</h2>
                                <p className="text-slate-500 text-sm">Bergabung dengan komunitas pembaca TitahRakyat</p>
                            </div>

                            {/* Google Sign-In */}
                            {GOOGLE_CLIENT_ID ? (
                                <div ref={googleButtonRef} className="w-full flex justify-center [&>div]:!w-full mb-4" />
                            ) : (
                                <button onClick={() => setError("Google Sign-In belum dikonfigurasi. Hubungi admin.")}
                                    className="w-full py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 mb-4">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Daftar dengan Google
                                </button>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-1 h-px bg-slate-100" />
                                <span className="text-slate-400 text-xs uppercase tracking-widest">atau isi manual</span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>

                            <form onSubmit={handleRegister} className="space-y-3.5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                                            placeholder="Nama Anda" required />
                                    </div>
                                </div>

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
                                            placeholder="Minimal 8 karakter" required minLength={8} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Konfirmasi Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                                        <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                                            placeholder="Ulangi password" required minLength={8} />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm flex items-start gap-2">
                                        <span className="mt-0.5">⚠️</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button type="submit" disabled={submitting}
                                    className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group">
                                    {submitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                            Mendaftar...
                                        </span>
                                    ) : (
                                        <>Daftar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* STEP 2: OTP Verification */}
                    {step === "otp" && (
                        <>
                            <div className="mb-6 text-center">
                                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-red-500" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 mb-1">Verifikasi Email 📧</h2>
                                <p className="text-slate-500 text-sm">
                                    Kode OTP telah dikirim ke<br />
                                    <span className="text-red-500 font-semibold">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                                    {otpCode.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className="w-12 h-14 text-center text-xl font-bold bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-500 text-sm text-center">{error}</div>
                                )}

                                <button type="submit" disabled={submitting}
                                    className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
                                    {submitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                            Memverifikasi...
                                        </span>
                                    ) : "Verifikasi"}
                                </button>

                                <div className="text-center">
                                    <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0}
                                        className="text-sm text-slate-400 hover:text-red-500 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5">
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        {resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : "Kirim ulang OTP"}
                                    </button>
                                </div>
                            </form>

                            <button onClick={() => setStep("register")}
                                className="mt-4 w-full text-center text-slate-400 hover:text-red-600 text-sm transition-colors flex items-center justify-center gap-1">
                                <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke pendaftaran
                            </button>
                        </>
                    )}

                    {/* STEP 3: Success */}
                    {step === "success" && (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Registrasi Berhasil! 🎉</h2>
                            <p className="text-slate-500 text-sm mb-6">
                                Akun Anda sudah terverifikasi dan siap digunakan. Selamat membaca!
                            </p>
                            <button onClick={() => navigate("/")}
                                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2">
                                Mulai Membaca <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Footer link */}
                    {step === "register" && (
                        <div className="mt-5 pt-5 border-t border-slate-100 text-center">
                            <p className="text-slate-500 text-sm">
                                Sudah punya akun?{" "}
                                <Link to="/masuk" className="text-red-600 hover:text-red-500 font-semibold transition-colors">Masuk</Link>
                            </p>
                        </div>
                    )}
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

export default PublicRegister;
