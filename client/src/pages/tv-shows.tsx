import { useQuery } from "@tanstack/react-query";
import { Media } from "@shared/schema";
import MediaRow from "@/components/MediaRow";
import { Skeleton } from "@/components/ui/skeleton";

export default function TVShows() {
  const { data: trendingShows, isLoading: isLoadingTrending } = useQuery<Media[]>({
    queryKey: ["/api/trending/tv"],
  });

  const { data: popularShows, isLoading: isLoadingPopular } = useQuery<Media[]>({
    queryKey: ["/api/popular/tv"],
  });

  if (isLoadingTrending || isLoadingPopular) {
    return <Skeleton className="w-full h-screen" />;
  }

  if (!trendingShows?.length || !popularShows?.length) {
    return <div>No TV shows available</div>;
  }

  return (
    <div className="container pt-8 space-y-8">
      <h1 className="text-4xl font-bold">TV Shows</h1>
      <MediaRow title="Trending Now" media={trendingShows} />
      <MediaRow title="Popular" media={popularShows} />
    </div>
  );
}