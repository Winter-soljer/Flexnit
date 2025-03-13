import { useQuery, useQueries } from "@tanstack/react-query";
import MediaRow from "@/components/MediaRow";
import { Media } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { getRecommendationGenres, getFavorites } from "@/lib/favorites";
import { useEffect, useState } from "react";
import Hero from "@/components/Hero";

export default function Home() {
  const [recommendationGenres, setRecommendationGenres] = useState<string[]>([]);
  const [hasFavorites, setHasFavorites] = useState(false);

  // Get user's favorite genres for recommendations
  useEffect(() => {
    const favoriteGenres = getRecommendationGenres();
    setRecommendationGenres(favoriteGenres);
    setHasFavorites(getFavorites().length > 0);
  }, []);

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

  // Fetch recommendations based on user's preferences if they have favorites
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery<Media[]>({
    queryKey: ["/api/genre/movie/" + (recommendationGenres[0] || "28")],
    enabled: recommendationGenres.length > 0
  });


  if (isLoadingMovies || isLoadingTVShows || genreQueries.some(q => q.isLoading) || 
      (hasFavorites && isLoadingRecommendations)) {
    return <Skeleton className="w-full h-screen" />;
  }

  if (!trendingMovies?.length || !trendingTVShows?.length) {
    return <div>No content available</div>;
  }

  return (
    <div>
      <Hero media={trendingMovies[0]} />

      <div className="container space-y-8 pt-8">
        {hasFavorites && recommendations?.length > 0 && (
          <MediaRow title="Recommended For You" media={recommendations} />
        )}
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