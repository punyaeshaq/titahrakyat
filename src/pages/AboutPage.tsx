import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Shield, Scale, Eye, BookOpen, Users } from "lucide-react";
import logoMenara from "@/assets/logo-menara.jpg";

const AboutPage = () => {
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
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">MenaraPublik.News</strong> adalah media online yang menyajikan informasi publik secara jernih, berimbang, dan bertanggung jawab. Media ini hadir sebagai ruang pengamatan dan pengawasan kepentingan umum, dengan fokus pada kebijakan publik, hukum, lingkungan, dan kehidupan masyarakat.
            </p>
            <p>
              Sebagai media publik, MenaraPublik.News berkomitmen pada jurnalisme yang akurat, independen, dan beretika. Setiap pemberitaan disusun melalui proses verifikasi dan konfirmasi, dengan tujuan membantu publik memahami peristiwa, kebijakan, serta dampaknya secara utuh.
            </p>
            <p>
              MenaraPublik.News meyakini bahwa informasi yang jernih adalah fondasi keadilan. Karena itu, media ini tidak sekadar memberitakan peristiwa, tetapi juga mengawal keputusan publik agar transparan dan akuntabel—hari ini dan untuk generasi mendatang.
            </p>
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
              Menjadi media publik yang terpercaya dalam menyajikan informasi jernih dan berimbang demi kepentingan masyarakat.
            </p>
          </section>

          <section className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={20} className="text-primary" />
              <h2 className="text-xl font-bold font-serif text-foreground">Misi</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1.5 shrink-0">•</span>
                Menyajikan berita yang faktual, akurat, dan dapat dipertanggungjawabkan
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1.5 shrink-0">•</span>
                Mengawal kebijakan publik dan penegakan hukum
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1.5 shrink-0">•</span>
                Memberikan ruang dialog publik yang sehat dan bermartabat
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1.5 shrink-0">•</span>
                Mendorong transparansi dan literasi informasi
              </li>
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
            {[
              { role: "Pemimpin Umum", name: "—" },
              { role: "Pemimpin Redaksi", name: "—" },
              { role: "Redaktur Pelaksana", name: "—" },
              { role: "Redaktur", name: "—" },
              { role: "Reporter / Kontributor", name: "—" },
              { role: "Editor", name: "—" },
              { role: "Admin & Media Sosial", name: "—" },
            ].map((item) => (
              <div key={item.role} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.role}</p>
                  <p className="text-xs text-muted-foreground">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

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
