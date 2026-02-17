import { Facebook, Twitter, Linkedin, Link2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
    title: string;
    url: string;
}

const ShareButtons = ({ title, url }: ShareButtonsProps) => {
    const { toast } = useToast();
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = [
        {
            name: "WhatsApp",
            icon: <Send size={18} />,
            url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            color: "hover:bg-green-600 hover:text-white",
        },
        {
            name: "Facebook",
            icon: <Facebook size={18} />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: "hover:bg-blue-600 hover:text-white",
        },
        {
            name: "Twitter (X)",
            icon: <Twitter size={18} />,
            url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            color: "hover:bg-black hover:text-white",
        },
        {
            name: "LinkedIn",
            icon: <Linkedin size={18} />,
            url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
            color: "hover:bg-blue-700 hover:text-white",
        },
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast({ title: "Link disalin!", description: "Tautan artikel telah disalin ke clipboard." });
        } catch (err) {
            toast({ title: "Gagal menyalin", variant: "destructive" });
        }
    };

    return (
        <div className="flex items-center gap-2 my-6">
            <span className="text-sm font-semibold text-muted-foreground mr-2">Bagikan:</span>
            {shareLinks.map((link) => (
                <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full border border-border bg-background text-muted-foreground transition-colors ${link.color}`}
                    title={`Bagikan ke ${link.name}`}
                >
                    {link.icon}
                </a>
            ))}
            <Button
                variant="outline"
                size="icon"
                className="rounded-full hover:bg-zinc-800 hover:text-white"
                onClick={copyToClipboard}
                title="Salin Link"
            >
                <Link2 size={18} />
            </Button>
        </div>
    );
};

export default ShareButtons;
