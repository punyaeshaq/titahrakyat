import { useQuery } from "@tanstack/react-query";
import { videosApi } from "@/lib/api";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import VideoEmbed from "@/components/VideoEmbed";
import { Play, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const data = await videosApi.getAll();
      return data?.data || data || [];
    },
  });

  // Effect to select video from URL param
  useEffect(() => {
    if (id && videos.length > 0) {
      const video = videos.find((v: any) => v.id === id);
      if (video) setSelectedVideo(video);
    }
  }, [id, videos]);

  const handleSelect = (video: any) => {
    setSelectedVideo(video);
    navigate(`/video/${video.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const featured = videos.filter((v: any) => v.is_featured);
  const regular = videos.filter((v: any) => !v.is_featured);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <SEO
          title={selectedVideo ? selectedVideo.title : "Video Berita"}
          description={selectedVideo ? selectedVideo.description : "Kumpulan video berita terbaru dari MenaraPublik"}
          type="video.other"
          image={selectedVideo?.thumbnail_url}
        />
        <h1 className="text-3xl font-black font-serif text-foreground mb-2">Video</h1>
        <p className="text-muted-foreground mb-8">Kumpulan video berita dan liputan terbaru</p>

        {selectedVideo && (
          <div className="mb-8 bg-card border border-border rounded-xl overflow-hidden">
            <VideoEmbed url={selectedVideo.video_url} type={selectedVideo.video_type} title={selectedVideo.title} />
            <div className="p-5">
              <h2 className="text-xl font-bold font-serif text-foreground">{selectedVideo.title}</h2>
              {selectedVideo.description && (
                <p className="text-muted-foreground mt-2">{selectedVideo.description}</p>
              )}
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                {selectedVideo.duration && <span>⏱ {selectedVideo.duration}</span>}
                <span>{selectedVideo.views} views</span>
                <span>{new Date(selectedVideo.created_at).toLocaleDateString("id-ID")}</span>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        ) : videos.length === 0 ? (
          <p className="text-muted-foreground">Belum ada video.</p>
        ) : (
          <>
            {featured.length > 0 && !selectedVideo && (
              <section className="mb-10">
                <h2 className="text-lg font-bold font-serif text-foreground mb-4 flex items-center gap-2">
                  <Star size={18} className="text-primary" /> Video Pilihan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featured.map((v: any) => (
                    <VideoCard key={v.id} video={v} onSelect={handleSelect} large />
                  ))}
                </div>
              </section>
            )}

            <section>
              {featured.length > 0 && !selectedVideo && (
                <h2 className="text-lg font-bold font-serif text-foreground mb-4">Semua Video</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(selectedVideo ? videos.filter((v: any) => v.id !== selectedVideo.id) : regular.length > 0 ? regular : videos).map((v: any) => (
                  <VideoCard key={v.id} video={v} onSelect={handleSelect} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function VideoCard({ video, onSelect, large }: { video: any; onSelect: (v: any) => void; large?: boolean }) {
  return (
    <button
      onClick={() => onSelect(video)}
      className="bg-card border border-border rounded-lg overflow-hidden text-left hover:border-primary/50 transition-colors group"
    >
      <div className={`relative ${large ? "aspect-video" : "aspect-video"} bg-muted`}>
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Play size={40} className="text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 bg-primary/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play size={20} className="text-primary-foreground ml-0.5" />
          </div>
        </div>
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
            {video.duration}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className={`font-semibold text-foreground ${large ? "text-base" : "text-sm"} line-clamp-2`}>{video.title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
          <span>{video.views} views</span>
          <span>•</span>
          <span>{new Date(video.created_at).toLocaleDateString("id-ID")}</span>
        </div>
      </div>
    </button>
  );
}
