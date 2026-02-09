import { breakingNews } from "@/data/articles";

const BreakingNewsBanner = () => {
  return (
    <div className="bg-primary overflow-hidden">
      <div className="container flex items-center h-8">
        <span className="shrink-0 bg-primary-foreground text-primary text-xs font-bold px-2 py-0.5 rounded mr-3">
          BREAKING
        </span>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="animate-breaking-scroll inline-block">
            {breakingNews.map((news, i) => (
              <span key={i} className="text-primary-foreground text-xs mr-12">
                {news}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsBanner;
