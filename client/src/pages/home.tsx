import { useQuery } from "@tanstack/react-query";
import { Media } from "@shared/schema";
import Hero from "@/components/Hero";
import MediaRow from "@/components/MediaRow";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: trendingMovies, isLoading: isLoadingMovies } = useQuery<Media[]>({
    queryKey: ["/api/trending/movie"],
  });

  const { data: trendingTVShows, isLoading: isLoadingTVShows } = useQuery<Media[]>({
    queryKey: ["/api/trending/tv"],
  });

  if (isLoadingMovies || isLoadingTVShows) {
    return <Skeleton className="w-full h-screen" />;
  }

  if (!trendingMovies?.length || !trendingTVShows?.length) {
    return <div>No content available</div>;
  }

  return (
    <div>
      <Hero media={trendingMovies[0]} />

      <div className="container space-y-8 pt-8">
        <MediaRow title="Trending Movies" media={trendingMovies} />
        <MediaRow title="Trending TV Shows" media={trendingTVShows} />
      </div>
    </div>
  );
}