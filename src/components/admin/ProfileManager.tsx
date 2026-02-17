import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Mail } from "lucide-react";

export default function ProfileManager() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put("/auth/profile", form);
            toast({ title: "Profil berhasil diperbarui" });
            setForm({ ...form, current_password: "", password: "", password_confirmation: "" });
        } catch (error: any) {
            toast({
                title: "Gagal memperbarui profil",
                description: error.response?.data?.message || "Terjadi kesalahan",
                variant: "destructive"
            });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl">
            <h2 className="text-lg font-bold font-serif text-foreground mb-6">Profil Saya</h2>

            <div className="bg-card border border-border rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label className="flex items-center gap-2"><User size={16} /> Nama Lengkap</Label>
                        <Input name="name" value={form.name} onChange={handleChange} required />
                    </div>

                    <div>
                        <Label className="flex items-center gap-2"><Mail size={16} /> Email</Label>
                        <Input name="email" type="email" value={form.email} onChange={handleChange} required />
                    </div>

                    <div className="border-t border-border pt-4 mt-4">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-4">Ganti Password (Opsional)</h3>

                        <div className="space-y-4">
                            <div>
                                <Label className="flex items-center gap-2"><Lock size={16} /> Password Saat Ini (Wajib jika ganti password)</Label>
                                <Input name="current_password" type="password" value={form.current_password} onChange={handleChange} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Password Baru</Label>
                                    <Input name="password" type="password" value={form.password} onChange={handleChange} />
                                </div>
                                <div>
                                    <Label>Konfirmasi Password Baru</Label>
                                    <Input name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
