import heroEkonomi from "@/assets/hero-ekonomi.jpg";
import heroOlahraga from "@/assets/hero-olahraga.jpg";
import heroTeknologi from "@/assets/hero-teknologi.jpg";
import heroPolitik from "@/assets/hero-politik.jpg";
import heroHiburan from "@/assets/hero-hiburan.jpg";
import heroNasional from "@/assets/hero-nasional.jpg";
import heroInternasional from "@/assets/hero-internasional.jpg";

const categoryImages: Record<string, string> = {
  ekonomi: heroEkonomi,
  olahraga: heroOlahraga,
  teknologi: heroTeknologi,
  politik: heroPolitik,
  hiburan: heroHiburan,
  nasional: heroNasional,
  internasional: heroInternasional,
};

export function getArticleImage(category: string, imageUrl?: string): string {
  if (imageUrl) return imageUrl;
  return categoryImages[category] || heroNasional;
}
