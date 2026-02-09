import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Shield, Scale, Eye, BookOpen, Users, Globe } from "lucide-react";
import logoMenara from "@/assets/logo-menara.jpg";
import { useEditorialStaff } from "@/hooks/useArticles";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AboutPage = () => {
  const { data: editorialStaff = [] } = useEditorialStaff();

  const { data: settings = [] } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: socialLinks = [] } = useQuery({
    queryKey: ["social_links_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []).filter((l: any) => l.url);
    },
  });

  const getSetting = (key: string) => settings.find((s: any) => s.key === key)?.value || "";
  const misiItems = getSetting("misi").split("\n").filter((m: string) => m.trim());

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <img src={logoMenara} alt="MenaraPublik.News" className="h-28 w-28 rounded-full object-cover mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-3">
            <span className="text-primary">MenaraPublik</span><span className="text-muted-foreground text-lg">.News</span>
          </h1>
          <p className="text-lg italic text-muted-foreground">
            "Mengawal Kepentingan Publik"
          </p>
        </div>

        {/* Company Profile */}
        <section className="bg-card rounded-lg border border-border p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold font-serif text-foreground mb-4 border-b-2 border-primary pb-2">
            Tentang Kami
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed whitespace-pre-line">
            {getSetting("about") || "Memuat..."}
          </div>
        </section>

        {/* Visi & Misi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <section className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={20} className="text-primary" />
              <h2 className="text-xl font-bold font-serif text-foreground">Visi</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {getSetting("visi") || "Memuat..."}
            </p>
          </section>

          <section className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={20} className="text-primary" />
              <h2 className="text-xl font-bold font-serif text-foreground">Misi</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              {misiItems.length > 0 ? misiItems.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 shrink-0">•</span>
                  {item}
                </li>
              )) : (
                <li className="text-muted-foreground">Memuat...</li>
              )}
            </ul>
          </section>
        </div>

        {/* Struktur Redaksi */}
        <section className="bg-card rounded-lg border border-border p-6 md:p-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-primary" />
            <h2 className="text-xl font-bold font-serif text-foreground">Struktur Redaksi</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {editorialStaff.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.position}</p>
                  <p className="text-xs text-muted-foreground">{item.name || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sosial Media */}
        {socialLinks.length > 0 && (
          <section className="bg-card rounded-lg border border-border p-6 md:p-8 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={20} className="text-primary" />
              <h2 className="text-xl font-bold font-serif text-foreground">Ikuti Kami</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link: any) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Rubrikasi */}
        <section className="bg-card rounded-lg border border-border p-6 md:p-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Scale size={20} className="text-primary" />
            <h2 className="text-xl font-bold font-serif text-foreground">Rubrikasi</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "Publik", desc: "Kebijakan, pelayanan, isu masyarakat" },
              { name: "Hukum", desc: "Putusan pengadilan, regulasi, keadilan" },
              { name: "Lingkungan", desc: "Sumber daya alam, dampak kebijakan" },
              { name: "Daerah", desc: "Isu lokal dan regional" },
              { name: "Nasional", desc: "Isu nasional strategis" },
              { name: "Opini", desc: "Pandangan publik & analisis" },
            ].map((item) => (
              <div key={item.name} className="bg-secondary rounded-md p-3">
                <p className="text-sm font-bold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Prinsip Redaksi */}
        <section className="bg-card rounded-lg border border-border p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-primary" />
            <h2 className="text-xl font-bold font-serif text-foreground">Prinsip Redaksi</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {["Independen", "Berimbang", "Akurat", "Bertanggung Jawab", "Taat Kode Etik Jurnalistik"].map((p) => (
              <span
                key={p}
                className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20"
              >
                {p}
              </span>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default AboutPage;
