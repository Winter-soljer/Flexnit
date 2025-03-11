import { useQuery } from "@tanstack/react-query";
import { Media } from "@shared/schema";
import MediaRow from "@/components/MediaRow";
import { Skeleton } from "@/components/ui/skeleton";

export default function Movies() {
  const { data: trendingMovies, isLoading: isLoadingTrending } = useQuery<Media[]>({
    queryKey: ["/api/trending/movie"],
  });

  const { data: popularMovies, isLoading: isLoadingPopular } = useQuery<Media[]>({
    queryKey: ["/api/popular/movie"],
  });

  if (isLoadingTrending || isLoadingPopular) {
    return <Skeleton className="w-full h-screen" />;
  }

  if (!trendingMovies?.length || !popularMovies?.length) {
    return <div>No movies available</div>;
  }

  return (
    <div className="container pt-8 space-y-8">
      <h1 className="text-4xl font-bold">Movies</h1>
      <MediaRow title="Trending Now" media={trendingMovies} />
      <MediaRow title="Popular" media={popularMovies} />
    </div>
  );
}