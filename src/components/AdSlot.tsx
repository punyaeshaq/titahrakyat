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

    // If there's an active manual ad for this position, show it
    if (ads.length > 0) {
        return <AdBanner position={position} className={className} adData={ads[0]} />;
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
