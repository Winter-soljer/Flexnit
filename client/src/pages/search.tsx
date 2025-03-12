import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import MediaCard from "@/components/MediaCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Media } from "@shared/schema";

export default function Search() {
  const [location] = useLocation();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setQuery(searchParams.get("q")?.trim() || "");
  }, [location]);

  const fetchSearchResults = async () => {
    if (!query) return []; // Prevent API call if query is empty

    const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
      query
    )}&page=1&api_key=dade4c57dbabc51b2888699212978cac`;

    console.log("Fetching:", url); // Debugging log

    const response = await fetch(url);
    if (!response.ok) {
      console.error("API Error:", response.status);
      throw new Error("Failed to fetch search results");
    }

    const data = await response.json();
    console.log("Search results:", data.results); // Debugging log

    return data.results || []; // Ensure it always returns an array
  };

  const { data: results, isLoading, isError } = useQuery<Media[]>({
    queryKey: ["/api/search", query],
    queryFn: fetchSearchResults,
    enabled: !!query, // Only fetch if query is not empty
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-8">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="w-full h-48" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-500 text-center mt-8">Failed to load search results.</p>;
  }

  return (
    <div className="container pt-8">
      <h1 className="text-4xl font-bold mb-8">Search Results for "{query}"</h1>

      {!results?.length ? (
        <p className="text-center text-gray-500">No results found</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((media) => {
            // Determine the appropriate image URL based on the media type
            const posterPath = media.poster_path
              ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
              : "https://via.placeholder.com/500x750?text=No+Image"; // Placeholder image for missing posters

            // Create a proper Media object that maps TMDB API fields to our schema
            const mediaItem: Media = {
              id: media.id,
              tmdbId: media.id,
              type: media.media_type || 'movie',
              title: media.title || media.name || '',
              overview: media.overview || '',
              posterPath: media.poster_path,
              backdropPath: media.backdrop_path,
              releaseDate: media.release_date || media.first_air_date,
              voteAverage: media.vote_average,
              popularity: media.popularity,
              genres: media.genre_ids?.map(String) || [],
              trailerKey: null,
              lastUpdated: null
            };

            return (
              <MediaCard
                key={mediaItem.id}
                media={mediaItem}
                posterPath={posterPath} // Pass the poster path to the MediaCard
              />
            );
          })}
        </div>
      )}
    </div>
  );
}