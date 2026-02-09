export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  views: number;
  isFeatured?: boolean;
  isBreaking?: boolean;
}

export const categories = [
  { id: "nasional", label: "Nasional", color: "news-red" },
  { id: "politik", label: "Politik", color: "news-blue" },
  { id: "ekonomi", label: "Ekonomi", color: "news-yellow" },
  { id: "teknologi", label: "Teknologi", color: "news-blue" },
  { id: "olahraga", label: "Olahraga", color: "news-red" },
  { id: "hiburan", label: "Hiburan", color: "news-yellow" },
  { id: "internasional", label: "Internasional", color: "news-blue" },
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
    category: "ekonomi",
    author: "Rina Kartika",
    publishedAt: "2026-02-09T10:30:00Z",
    imageUrl: "",
    views: 15420,
    isFeatured: true,
    isBreaking: true,
  },
  {
    id: "2",
    title: "Timnas Indonesia Raih Kemenangan Bersejarah di Kualifikasi Piala Dunia",
    slug: "timnas-kemenangan-kualifikasi",
    excerpt: "Gol spektakuler di menit akhir membawa Indonesia meraih tiket ke putaran final untuk pertama kalinya dalam sejarah.",
    content: `<p>Stadion Gelora Bung Karno bergemuruh saat peluit akhir dibunyikan. Timnas Indonesia berhasil meraih kemenangan 2-1 yang mengantarkan mereka ke putaran final Piala Dunia untuk pertama kalinya dalam sejarah sepak bola nasional.</p>

<p>Gol penentu dicetak oleh striker andalan pada menit ke-89, sebuah tendangan voli yang tak terbendung oleh kiper lawan. Momen bersejarah ini disambut euforia oleh lebih dari 80.000 penonton yang memadati stadion.</p>

<blockquote>"Ini adalah momen yang telah dinanti-nantikan oleh seluruh rakyat Indonesia selama puluhan tahun."</blockquote>

<p>Pelatih kepala menyatakan bahwa kemenangan ini adalah buah dari persiapan matang dan kerja keras seluruh tim. "Kami telah mempersiapkan ini dengan sangat baik. Pemain-pemain menunjukkan mentalitas juara yang luar biasa," katanya.</p>`,
    category: "olahraga",
    author: "Budi Santoso",
    publishedAt: "2026-02-09T08:15:00Z",
    imageUrl: "",
    views: 45230,
    isFeatured: true,
  },
  {
    id: "3",
    title: "Startup AI Asal Bandung Raih Pendanaan Seri B Senilai Rp 500 Miliar",
    slug: "startup-ai-bandung-pendanaan",
    excerpt: "Perusahaan rintisan berbasis kecerdasan buatan ini berhasil menarik investor global dengan teknologi NLP bahasa Indonesia.",
    content: `<p>Sebuah startup kecerdasan buatan (AI) yang berbasis di Bandung berhasil meraih pendanaan Seri B senilai Rp 500 miliar dari konsorsium investor global. Pendanaan ini dipimpin oleh Sequoia Capital Southeast Asia dengan partisipasi dari beberapa venture capital terkemuka.</p>

<p>Startup yang didirikan pada 2023 ini mengembangkan teknologi Natural Language Processing (NLP) yang secara khusus dioptimalkan untuk bahasa Indonesia dan bahasa daerah. Teknologi mereka telah digunakan oleh lebih dari 200 perusahaan di Indonesia.</p>`,
    category: "teknologi",
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
    category: "politik",
    author: "Hendra Wijaya",
    publishedAt: "2026-02-08T16:45:00Z",
    imageUrl: "",
    views: 12350,
  },
  {
    id: "5",
    title: "Bank Indonesia Pertahankan Suku Bunga Acuan di Tengah Tekanan Global",
    slug: "bi-suku-bunga-acuan",
    excerpt: "Keputusan ini diambil untuk menjaga stabilitas nilai tukar rupiah dan mendukung pemulihan ekonomi domestik.",
    content: `<p>Bank Indonesia memutuskan untuk mempertahankan suku bunga acuan (BI Rate) pada level 5,75% dalam Rapat Dewan Gubernur yang berlangsung selama dua hari. Keputusan ini sejalan dengan upaya menjaga stabilitas makroekonomi dan sistem keuangan.</p>

<p>Gubernur BI menyatakan bahwa keputusan ini mempertimbangkan berbagai faktor global dan domestik. "Kami melihat inflasi masih terkendali dan pertumbuhan ekonomi berada di jalur yang tepat," ujarnya dalam konferensi pers.</p>`,
    category: "ekonomi",
    author: "Rina Kartika",
    publishedAt: "2026-02-08T14:20:00Z",
    imageUrl: "",
    views: 6780,
  },
  {
    id: "6",
    title: "Film Indonesia Masuk Nominasi Festival Film Internasional Cannes 2026",
    slug: "film-indonesia-cannes-2026",
    excerpt: "Karya sineas muda Indonesia berhasil menembus seleksi ketat dan menjadi satu-satunya wakil Asia Tenggara.",
    content: `<p>Sebuah film karya sineas muda Indonesia berhasil masuk dalam nominasi resmi Festival Film Internasional Cannes 2026. Film berjudul "Tanah Air" ini menjadi satu-satunya wakil dari Asia Tenggara yang berhasil menembus seleksi ketat panitia festival.</p>

<p>Film yang mengangkat tema tentang identitas dan tanah kelahiran ini mendapat pujian dari kritikus internasional sejak pemutaran perdananya di festival film regional.</p>`,
    category: "hiburan",
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
    title: "Indonesia dan Jepang Tandatangani Perjanjian Kerja Sama Energi Terbarukan",
    slug: "indonesia-jepang-energi-terbarukan",
    excerpt: "Kedua negara sepakat mengembangkan proyek energi surya dan hidrogen hijau senilai USD 2 miliar.",
    content: `<p>Indonesia dan Jepang resmi menandatangani perjanjian kerja sama bilateral di bidang energi terbarukan. Perjanjian ini mencakup pengembangan proyek energi surya dan hidrogen hijau dengan total investasi senilai USD 2 miliar.</p>

<p>Menteri Energi dan Sumber Daya Mineral menyatakan bahwa kerja sama ini akan mempercepat transisi energi Indonesia menuju net zero emission pada 2060.</p>`,
    category: "internasional",
    author: "Siti Nurhaliza",
    publishedAt: "2026-02-07T15:00:00Z",
    imageUrl: "",
    views: 9870,
  },
  {
    id: "9",
    title: "Harga Beras Premium Turun 5% Setelah Panen Raya di Jawa",
    slug: "harga-beras-turun",
    excerpt: "Panen raya yang melimpah di Pulau Jawa berhasil menekan harga beras di pasar tradisional dan modern.",
    content: `<p>Harga beras premium di pasaran mengalami penurunan sekitar 5% menyusul panen raya yang berlangsung di berbagai wilayah di Pulau Jawa. Penurunan ini dirasakan baik di pasar tradisional maupun modern.</p>`,
    category: "ekonomi",
    author: "Rina Kartika",
    publishedAt: "2026-02-07T09:15:00Z",
    imageUrl: "",
    views: 7650,
  },
  {
    id: "10",
    title: "Peluncuran Satelit Nusantara-3 Sukses dari Biak Papua",
    slug: "peluncuran-satelit-nusantara-3",
    excerpt: "Indonesia kembali menunjukkan kemampuan antariksa dengan meluncurkan satelit komunikasi generasi terbaru.",
    content: `<p>Indonesia berhasil meluncurkan satelit komunikasi Nusantara-3 dari fasilitas peluncuran di Biak, Papua. Satelit generasi terbaru ini akan memperluas jangkauan internet dan telekomunikasi di seluruh wilayah Indonesia.</p>`,
    category: "teknologi",
    author: "Dewi Lestari",
    publishedAt: "2026-02-07T07:00:00Z",
    imageUrl: "",
    views: 18900,
  },
];

export const breakingNews = [
  "BREAKING: Timnas Indonesia lolos ke Piala Dunia 2026 setelah kemenangan dramatis 2-1",
  "UPDATE: Gempa 5,8 SR guncang Sulawesi Tengah, tidak berpotensi tsunami",
  "TERKINI: Pemerintah umumkan kebijakan baru percepatan ekonomi digital",
  "FLASH: Startup AI Bandung raih pendanaan Rp 500 miliar dari investor global",
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
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Baru saja";
  if (diffHours < 24) return `${diffHours} jam lalu`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  
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
