export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  categoryId?: string;
  categoryLabel?: string;
  categoryColor?: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  views: number;
  isFeatured?: boolean;
  isBreaking?: boolean;
  commentCount?: number;
}

export const categories = [
  { id: "publik", label: "Publik", color: "news-red" },
  { id: "hukum", label: "Hukum", color: "news-blue" },
  { id: "lingkungan", label: "Lingkungan", color: "news-yellow" },
  { id: "daerah", label: "Daerah", color: "news-red" },
  { id: "nasional", label: "Nasional", color: "news-blue" },
  { id: "opini", label: "Opini", color: "news-yellow" },
];

export const articles: Article[] = [
  {
    id: "1",
    title: "Pemerintah Umumkan Kebijakan Baru untuk Percepatan Ekonomi Digital Indonesia",
    slug: "kebijakan-baru-ekonomi-digital",
    excerpt: "Presiden mengumumkan serangkaian kebijakan strategis untuk mendorong transformasi digital di seluruh sektor ekonomi nasional.",
    content: `<p>Dalam konferensi pers yang digelar di Istana Negara, Presiden mengumumkan serangkaian kebijakan strategis yang bertujuan untuk mempercepat transformasi digital di Indonesia. Kebijakan ini mencakup berbagai aspek mulai dari infrastruktur digital hingga pengembangan sumber daya manusia.</p>

<p>"Indonesia harus menjadi pemimpin ekonomi digital di Asia Tenggara. Dengan populasi lebih dari 270 juta jiwa dan penetrasi internet yang terus meningkat, kita memiliki potensi besar yang harus dioptimalkan," ujar Presiden dalam sambutannya.</p>

<blockquote>"Transformasi digital bukan lagi pilihan, melainkan keharusan bagi Indonesia untuk bersaing di kancah global."</blockquote>

<p>Beberapa poin utama dari kebijakan tersebut antara lain:</p>
<p>Pertama, pembangunan infrastruktur digital di seluruh wilayah Indonesia, termasuk daerah terpencil. Kedua, program pelatihan digital massal untuk 10 juta tenaga kerja dalam 3 tahun ke depan. Ketiga, insentif pajak bagi startup dan perusahaan teknologi yang berinvestasi di Indonesia.</p>

<p>Para pengamat ekonomi menyambut positif kebijakan ini. "Langkah yang tepat dan terukur. Jika dieksekusi dengan baik, Indonesia bisa menjadi hub teknologi terbesar di kawasan," kata Dr. Ahmad Syarif, ekonom senior dari Universitas Indonesia.</p>`,
    category: "publik",
    author: "Rina Kartika",
    publishedAt: "2026-02-09T10:30:00Z",
    imageUrl: "",
    views: 15420,
    isFeatured: true,
    isBreaking: true,
  },
  {
    id: "2",
    title: "Mahkamah Agung Putuskan Sengketa Lahan Masyarakat Adat di Kalimantan",
    slug: "putusan-ma-lahan-adat-kalimantan",
    excerpt: "Putusan bersejarah MA mengakui hak masyarakat adat atas tanah ulayat yang telah dikuasai perusahaan perkebunan.",
    content: `<p>Mahkamah Agung Republik Indonesia mengeluarkan putusan bersejarah yang mengakui hak masyarakat adat Dayak atas tanah ulayat di Kalimantan Barat. Putusan ini membatalkan izin konsesi yang sebelumnya diberikan kepada perusahaan perkebunan sawit.</p>

<p>Hakim Agung menyatakan bahwa hak masyarakat adat atas tanah ulayat dilindungi oleh konstitusi. "Negara wajib melindungi hak-hak masyarakat adat, termasuk hak atas tanah yang telah dikelola secara turun-temurun," ujar Ketua Majelis Hakim.</p>

<blockquote>"Putusan ini menjadi preseden penting bagi perlindungan hak masyarakat adat di seluruh Indonesia."</blockquote>

<p>Aktivis lingkungan dan HAM menyambut baik putusan ini sebagai langkah maju dalam penegakan keadilan bagi masyarakat adat yang selama ini terpinggirkan.</p>`,
    category: "hukum",
    author: "Hendra Wijaya",
    publishedAt: "2026-02-09T08:15:00Z",
    imageUrl: "",
    views: 45230,
    isFeatured: true,
  },
  {
    id: "3",
    title: "Deforestasi di Sumatera Turun 30% Berkat Program Rehabilitasi Hutan",
    slug: "deforestasi-sumatera-turun",
    excerpt: "Program rehabilitasi hutan nasional menunjukkan hasil positif dengan penurunan signifikan laju deforestasi.",
    content: `<p>Kementerian Lingkungan Hidup dan Kehutanan mengumumkan bahwa laju deforestasi di Pulau Sumatera mengalami penurunan hingga 30% dibandingkan tahun sebelumnya. Pencapaian ini merupakan hasil dari program rehabilitasi hutan nasional yang dimulai tiga tahun lalu.</p>

<p>"Kami berhasil merehabilitasi lebih dari 500.000 hektare lahan kritis di Sumatera. Partisipasi masyarakat lokal menjadi kunci keberhasilan program ini," kata Menteri LHK dalam konferensi pers.</p>`,
    category: "lingkungan",
    author: "Dewi Lestari",
    publishedAt: "2026-02-09T07:00:00Z",
    imageUrl: "",
    views: 8920,
  },
  {
    id: "4",
    title: "DPR Sahkan RUU Perlindungan Data Pribadi yang Diperbarui",
    slug: "ruu-perlindungan-data-pribadi",
    excerpt: "Undang-undang baru ini memperkuat perlindungan data warga negara dengan sanksi lebih tegas bagi pelanggar.",
    content: `<p>Dewan Perwakilan Rakyat (DPR) secara resmi mengesahkan Rancangan Undang-Undang Perlindungan Data Pribadi yang telah diperbarui. UU baru ini membawa perubahan signifikan dalam hal perlindungan data warga negara Indonesia di era digital.</p>

<p>Beberapa perubahan utama meliputi pembentukan otoritas perlindungan data independen, sanksi pidana yang lebih berat bagi pelanggar, serta kewajiban bagi perusahaan untuk melaporkan kebocoran data dalam waktu 72 jam.</p>`,
    category: "nasional",
    author: "Hendra Wijaya",
    publishedAt: "2026-02-08T16:45:00Z",
    imageUrl: "",
    views: 12350,
  },
  {
    id: "5",
    title: "Pelayanan Publik Digital Masih Timpang di Daerah Terpencil",
    slug: "pelayanan-publik-digital-timpang",
    excerpt: "Survei menunjukkan akses layanan publik digital masih sulit dijangkau masyarakat di daerah 3T.",
    content: `<p>Hasil survei Ombudsman RI menunjukkan bahwa akses pelayanan publik berbasis digital masih sangat timpang antara kota besar dan daerah terpencil (3T). Sebagian besar daerah tertinggal, terdepan, dan terluar belum memiliki infrastruktur memadai untuk mengakses layanan pemerintah secara online.</p>

<p>"Digitalisasi pelayanan publik memang penting, tetapi tidak boleh meninggalkan masyarakat yang belum terjangkau infrastruktur," kata Ketua Ombudsman RI.</p>`,
    category: "publik",
    author: "Rina Kartika",
    publishedAt: "2026-02-08T14:20:00Z",
    imageUrl: "",
    views: 6780,
  },
  {
    id: "6",
    title: "Banjir Bandang Terjang Kabupaten Luwu, Ratusan Warga Mengungsi",
    slug: "banjir-bandang-luwu",
    excerpt: "Hujan deras selama dua hari menyebabkan banjir bandang yang merendam puluhan rumah di Kabupaten Luwu.",
    content: `<p>Banjir bandang melanda Kabupaten Luwu, Sulawesi Selatan, setelah hujan deras mengguyur wilayah tersebut selama dua hari berturut-turut. Ratusan warga terpaksa mengungsi ke tempat yang lebih tinggi.</p>

<p>BPBD Kabupaten Luwu telah mendirikan posko pengungsian dan menyalurkan bantuan logistik. "Kami fokus pada evakuasi dan pemenuhan kebutuhan dasar pengungsi," kata Kepala BPBD setempat.</p>`,
    category: "daerah",
    author: "Maya Putri",
    publishedAt: "2026-02-08T11:00:00Z",
    imageUrl: "",
    views: 23100,
  },
  {
    id: "7",
    title: "Gempa 5,8 SR Guncang Sulawesi Tengah, Tidak Berpotensi Tsunami",
    slug: "gempa-sulawesi-tengah",
    excerpt: "BMKG memastikan gempa tektonik ini tidak berpotensi tsunami. Warga diminta tetap waspada terhadap gempa susulan.",
    content: `<p>Gempa bumi berkekuatan 5,8 Skala Richter mengguncang wilayah Sulawesi Tengah pada Sabtu pagi. Pusat gempa berada di kedalaman 15 km di bawah permukaan laut.</p>

<p>Badan Meteorologi, Klimatologi, dan Geofisika (BMKG) memastikan bahwa gempa ini tidak berpotensi tsunami. Namun, warga diminta tetap waspada terhadap kemungkinan gempa susulan.</p>`,
    category: "nasional",
    author: "Ahmad Fauzi",
    publishedAt: "2026-02-08T06:30:00Z",
    imageUrl: "",
    views: 34500,
  },
  {
    id: "8",
    title: "Transparansi Anggaran Desa Masih Jadi Pekerjaan Rumah Besar",
    slug: "transparansi-anggaran-desa",
    excerpt: "Laporan ICW menunjukkan banyak desa belum menerapkan prinsip transparansi dalam pengelolaan dana desa.",
    content: `<p>Indonesia Corruption Watch (ICW) merilis laporan yang menunjukkan bahwa transparansi pengelolaan anggaran desa masih menjadi tantangan besar. Dari 1.000 desa yang disurvei, hanya 35% yang secara terbuka mempublikasikan penggunaan dana desa kepada masyarakat.</p>

<p>"Akuntabilitas dan transparansi adalah kunci agar dana desa benar-benar bermanfaat bagi masyarakat," kata Koordinator Divisi Monitoring ICW.</p>`,
    category: "publik",
    author: "Siti Nurhaliza",
    publishedAt: "2026-02-07T15:00:00Z",
    imageUrl: "",
    views: 9870,
  },
  {
    id: "9",
    title: "Opini: Mengapa Literasi Hukum Penting bagi Masyarakat",
    slug: "opini-literasi-hukum",
    excerpt: "Rendahnya pemahaman hukum di masyarakat menjadi hambatan serius dalam mewujudkan keadilan yang merata.",
    content: `<p>Literasi hukum adalah kemampuan masyarakat untuk memahami hak dan kewajiban mereka di hadapan hukum. Sayangnya, tingkat literasi hukum di Indonesia masih rendah, terutama di kalangan masyarakat pedesaan.</p>

<p>Rendahnya pemahaman hukum membuat masyarakat rentan terhadap ketidakadilan. Banyak kasus di mana hak-hak masyarakat dilanggar namun mereka tidak tahu bagaimana cara memperjuangkannya.</p>`,
    category: "opini",
    author: "Prof. Dr. Bambang Sutrisno",
    publishedAt: "2026-02-07T09:15:00Z",
    imageUrl: "",
    views: 7650,
  },
  {
    id: "10",
    title: "Polusi Udara Jakarta Kembali Masuk Level Tidak Sehat",
    slug: "polusi-udara-jakarta-tidak-sehat",
    excerpt: "Indeks kualitas udara Jakarta memasuki kategori tidak sehat, warga diminta mengurangi aktivitas luar ruangan.",
    content: `<p>Kualitas udara di Jakarta kembali memasuki kategori tidak sehat berdasarkan pemantauan IQAir. Indeks kualitas udara tercatat di angka 168 pada Senin pagi, jauh di atas batas aman yang ditetapkan WHO.</p>

<p>Dinas Lingkungan Hidup DKI Jakarta mengimbau warga untuk mengurangi aktivitas luar ruangan, terutama bagi kelompok rentan seperti anak-anak dan lansia.</p>`,
    category: "lingkungan",
    author: "Dewi Lestari",
    publishedAt: "2026-02-07T07:00:00Z",
    imageUrl: "",
    views: 18900,
  },
];

export const breakingNews = [
  "BREAKING: MA putuskan hak tanah ulayat masyarakat adat Kalimantan dalam putusan bersejarah",
  "UPDATE: Gempa 5,8 SR guncang Sulawesi Tengah, tidak berpotensi tsunami",
  "TERKINI: Pemerintah umumkan kebijakan baru percepatan ekonomi digital",
  "FLASH: Deforestasi Sumatera turun 30% berkat program rehabilitasi hutan nasional",
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: string): Article[] {
  return articles.filter((a) => a.category === category);
}

export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase();
  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
  );
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
