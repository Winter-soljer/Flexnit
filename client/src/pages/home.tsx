import { useQuery, useQueries } from "@tanstack/react-query";
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

  const { data: movieGenres } = useQuery<{ id: number, name: string }[]>({
    queryKey: ["/api/genres/movie"],
  });

  const genreQueries = useQueries({
    queries: (movieGenres || []).slice(0, 4).map((genre) => ({
      queryKey: [`/api/genre/movie/${genre.id}`, genre.id],
      queryFn: async () => {
        const res = await fetch(`/api/genre/movie/${genre.id}`);
        if (!res.ok) throw new Error("Failed to fetch genre media");
        return res.json();
      },
      enabled: !!genre.id,
    })),
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

        {movieGenres?.slice(0, 4).map((genre, index) => {
          const queryResult = genreQueries[index];
          return queryResult.data && (
            <MediaRow
              key={genre.id}
              title={genre.name}
              media={queryResult.data}
            />
          );
        })}
      </div>
    </div>
  );
}