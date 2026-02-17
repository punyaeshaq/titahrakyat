import { useState } from "react";
import { newsletterApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const NewsletterWidget = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            await newsletterApi.subscribe(email);
            setSubscribed(true);
            toast.success("Berhasil berlangganan newsletter!");
        } catch (error: any) {
            if (error.response?.status === 422) {
                toast.error("Email sudah terdaftar.");
            } else {
                toast.error("Gagal berlangganan. Silakan coba lagi.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (subscribed) {
        return (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                    <Mail size={24} />
                </div>
                <h3 className="font-bold font-serif text-lg mb-2">Terima Kasih!</h3>
                <p className="text-muted-foreground text-sm">
                    Anda telah berhasil berlangganan newsletter kami.
                </p>
            </div>
        );
    }

    return (
        <section className="bg-primary/5 border border-primary/10 rounded-lg p-6 md:p-8">
            <div className="text-center max-w-xl mx-auto">
                <Mail size={32} className="text-primary mx-auto mb-4" />
                <h2 className="font-bold font-serif text-2xl mb-2">Dapatkan Berita Terupdate</h2>
                <p className="text-muted-foreground mb-6">
                    Berlangganan newsletter kami untuk mendapatkan berita terbaru langsung di inbox Anda.
                </p>

                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                    <Input
                        type="email"
                        placeholder="Alamat Email Anda"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background"
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Memproses..." : "Berlangganan"}
                    </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-4">
                    Kami menghargai privasi Anda. Berhenti berlangganan kapan saja.
                </p>
            </div>
        </section>
    );
};

export default NewsletterWidget;
