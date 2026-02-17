import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { adsApi } from "@/lib/api";

interface AdBannerProps {
    position: string;
    className?: string;
    adData?: any;
}

const AdBanner = ({ position, className = "", adData }: AdBannerProps) => {
    const { data: ads = [] } = useQuery({
        queryKey: ["ads", position],
        queryFn: () => adsApi.getActive(position),
        staleTime: 5 * 60 * 1000,
        enabled: !adData, // Skip if adData is provided
    });

    const handleClick = async (ad: any) => {
        try {
            await adsApi.trackClick(ad.id);
        } catch (e) {
            // ignore tracking errors
        }
        window.open(ad.target_url, "_blank", "noopener,noreferrer");
    };

    // Use adData if available, otherwise use fetched data
    const finalAd = adData || (ads.length > 0 ? ads[0] : null);

    if (!finalAd) return null;

    // Show first active ad for this position
    const ad = finalAd;

    return (
        <div className={`relative ${className}`} style={{ maxWidth: ad.max_width ? `${ad.max_width}px` : undefined, margin: ad.max_width ? '0 auto' : undefined }}>
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleClick(ad)}>
                <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                />
            </div>
            <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium">
                Iklan
            </span>
        </div>
    );
};

export default AdBanner;
