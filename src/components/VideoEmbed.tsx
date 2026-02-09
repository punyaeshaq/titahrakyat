function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

interface VideoEmbedProps {
  url: string;
  type?: string;
  title?: string;
  className?: string;
}

export default function VideoEmbed({ url, type, title, className }: VideoEmbedProps) {
  const youtubeId = extractYouTubeId(url);

  if (youtubeId) {
    return (
      <div className={`aspect-video ${className || ""}`}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-md"
        />
      </div>
    );
  }

  // Direct video URL (upload or external)
  return (
    <div className={`aspect-video ${className || ""}`}>
      <video
        src={url}
        controls
        className="w-full h-full rounded-md bg-black"
        title={title}
      >
        Browser Anda tidak mendukung pemutar video.
      </video>
    </div>
  );
}
