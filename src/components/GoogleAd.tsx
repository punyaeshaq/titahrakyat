import { useEffect, useRef } from "react";

interface GoogleAdProps {
    slot?: string;
    format?: "auto" | "rectangle" | "horizontal" | "vertical";
    responsive?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

const GoogleAd = ({
    slot = "",
    format = "auto",
    responsive = true,
    className = "",
    style,
}: GoogleAdProps) => {
    const adRef = useRef<HTMLDivElement>(null);
    const pushed = useRef(false);

    useEffect(() => {
        if (pushed.current) return;
        try {
            if (window.adsbygoogle && slot) {
                window.adsbygoogle.push({});
                pushed.current = true;
            }
        } catch (e) {
            // AdSense not loaded yet or ad blocker active
        }
    }, [slot]);

    // If no slot configured, show placeholder
    if (!slot) {
        return (
            <div className={`bg-muted/30 border border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-xs py-6 ${className}`}>
                <span>Slot Iklan — Google AdSense</span>
            </div>
        );
    }

    return (
        <div ref={adRef} className={className}>
            <ins
                className="adsbygoogle"
                style={style || { display: "block" }}
                data-ad-client="ca-pub-3878761925278925"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
            />
        </div>
    );
};

export default GoogleAd;
