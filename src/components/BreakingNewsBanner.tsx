import { useBreakingNews } from "@/hooks/useArticles";
import { useSettings } from "@/hooks/useSettings";

const BreakingNewsBanner = () => {
  const { data: items = [] } = useBreakingNews();
  const { data: settings = {} } = useSettings();

  if (items.length === 0) return null;

  const speed = settings.breaking_news_speed ? parseInt(settings.breaking_news_speed) : 30;

  return (
    <div className="bg-primary overflow-hidden">
      <div className="container flex items-center h-8">
        <span className="shrink-0 bg-primary-foreground text-primary text-xs font-bold px-2 py-0.5 rounded mr-3">
          BREAKING
        </span>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div
            key={speed}
            className="animate-breaking-scroll inline-block"
            style={{ animationDuration: `${speed}s` }}
          >
            {items.map((news) => (
              <span key={news.id} className="text-primary-foreground text-xs mr-12">
                {news.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsBanner;
