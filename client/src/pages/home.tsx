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

  // Fetch trending movies
  const { data: trendingMovies, isLoading: isLoadingMovies } = useQuery<Media[]>({
    queryKey: ["/api/trending/movie"],
  });

  // Fetch trending TV shows
  const { data: trendingTVShows, isLoading: isLoadingTVShows } = useQuery<Media[]>({
    queryKey: ["/api/trending/tv"],
  });

  // Fetch movie genres
  const { data: movieGenres } = useQuery<{ id: number, name: string }[]>({
    queryKey: ["/api/genres/movie"],
  });

  // Fetch movies by genre (first 4 genres only)
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

  // Fetch recommendations based on user's preferences (if they have favorites)
  const recommendationQueries = useQueries({
    queries: recommendationGenres.slice(0, 3).map((genre) => ({
      queryKey: [`/api/genre/movie/${genre}`],
      queryFn: async () => {
        const res = await fetch(`/api/genre/movie/${genre}`);
        if (!res.ok) throw new Error("Failed to fetch recommendations");
        return res.json();
      },
      enabled: !!genre && hasFavorites,
    })),
  });

  const recommendationsData = recommendationQueries
    .filter(query => query.data)
    .flatMap(query => query.data || [])
    .slice(0, 10);

  if (isLoadingMovies || isLoadingTVShows || 
      (hasFavorites && recommendationQueries.some(q => q.isLoading))) {
    return <Skeleton className="w-full h-screen" />;
  }

  if (!trendingMovies?.length || !trendingTVShows?.length) {
    return <div>No content available</div>;
  }

  return (
    <div>
      <Hero media={trendingMovies[0]} />

      <div className="container space-y-8 pt-8">
        {hasFavorites && recommendationsData.length > 0 && (
          <MediaRow title="Recommended For You" media={recommendationsData} />
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