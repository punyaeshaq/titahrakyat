import heroPublik from "@/assets/hero-publik.jpg";
import heroHukum from "@/assets/hero-hukum.jpg";
import heroLingkungan from "@/assets/hero-lingkungan.jpg";
import heroDaerah from "@/assets/hero-daerah.jpg";
import heroNasional from "@/assets/hero-nasional.jpg";
import heroOpini from "@/assets/hero-opini.jpg";

const categoryImages: Record<string, string> = {
  publik: heroPublik,
  hukum: heroHukum,
  lingkungan: heroLingkungan,
  daerah: heroDaerah,
  nasional: heroNasional,
  opini: heroOpini,
};

export function getArticleImage(category: string, imageUrl?: string): string {
  if (imageUrl) return imageUrl;
  return categoryImages[category] || heroNasional;
}
