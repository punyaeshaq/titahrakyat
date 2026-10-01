import { useQuery } from "@tanstack/react-query";
import { adsApi } from "@/lib/api";
import AdBanner from "@/components/AdBanner";
import GoogleAd from "@/components/GoogleAd";

interface AdSlotProps {
    position: "header" | "sidebar" | "in_article" | "in_feed" | "footer";
    className?: string;
    googleAdSlot?: string;
    googleAdFormat?: "auto" | "rectangle" | "horizontal" | "vertical";
}

const AdSlot = ({
    position,
    className = "",
    googleAdSlot,
    googleAdFormat = "auto",
}: AdSlotProps) => {
    const { data: ads = [] } = useQuery({
        queryKey: ["ads_check", position],
        queryFn: () => adsApi.getActive(position),
        staleTime: 5 * 60 * 1000,
    });

    // If there are active manual ads for this position, show all of them stacked
    if (ads.length > 0) {
        return (
            <div className={`space-y-6 ${className}`}>
                {ads.map((ad: any) => (
                    <AdBanner
                        key={ad.id}
                        position={position}
                        adData={ad}
                        className="w-full"
                    />
                ))}
            </div>
        );
    }

    // Otherwise show Google AdSense placeholder
    return (
        <GoogleAd
            slot={googleAdSlot}
            format={googleAdFormat}
            className={className}
        />
    );
};

export default AdSlot;
