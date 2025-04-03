import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState, FormEvent } from "react";
import MediaCard from "@/components/MediaCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Media } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [location, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [inputQuery, setInputQuery] = useState("");
  
  // Initialize inputQuery and query from URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlQuery = searchParams.get("q")?.trim() || "";
    setQuery(urlQuery);
    setInputQuery(urlQuery);
  }, [location]);
  
  // Handle search form submission
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setQuery(inputQuery.trim());
      
      // Update URL for sharing/bookmarking without page refresh
      const url = new URL(window.location.href);
      url.searchParams.set("q", inputQuery.trim());
      window.history.pushState({}, "", url.toString());
    }
  };

  // Define TMDB API result interface
  interface TMDBSearchResult {
    id: number;
    media_type: string;
    title?: string;
    name?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    popularity: number;
    genre_ids: number[];
  }

  const fetchSearchResults = async () => {
    if (!query) return []; // Prevent API call if query is empty

    try {
      console.log("Fetching search results for:", query);
      
      // Use direct TMDB API call to ensure we get results
      const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&page=1&api_key=dade4c57dbabc51b2888699212978cac`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error("API Error:", response.status);
        throw new Error("Failed to fetch search results");
      }

      const data = await response.json();
      console.log("Search results:", data.results?.length || 0, "items found");
      
      // Filter and map TMDB results to our Media type
      return (data.results || [])
        .filter((item: TMDBSearchResult) => 
          (item.media_type === 'movie' || item.media_type === 'tv')
        )
        .map((item: TMDBSearchResult) => {
          return {
            id: -item.id, // Using negative numbers to distinguish from real IDs
            tmdbId: item.id,
            type: item.media_type || 'movie',
            title: item.title || item.name || '',
            overview: item.overview || '',
            posterPath: item.poster_path,
            backdropPath: item.backdrop_path,
            releaseDate: item.release_date || item.first_air_date || null,
            voteAverage: item.vote_average || null,
            popularity: item.popularity || null,
            genres: item.genre_ids?.map(String) || [],
            trailerKey: null,
            lastUpdated: null
          };
        });
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  };

  const { data: results, isLoading, isError, refetch } = useQuery<Media[]>({
    queryKey: ["/api/search", query],
    queryFn: fetchSearchResults,
    enabled: !!query, // Only fetch if query is not empty
  });

  useEffect(() => {
    if (query) {
      refetch();
    }
  }, [query, refetch]);


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
      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          type="text"
          placeholder="Search movies, TV shows, actors..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit">
          <SearchIcon className="h-4 w-4 mr-2" /> Search
        </Button>
      </form>
      
      <h1 className="text-4xl font-bold mb-8">Search Results for "{query}"</h1>

      {!results?.length ? (
        <p className="text-center text-gray-500">No results found</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((media) => {
            // Determine the appropriate image URL based on the media type
            const posterPath = media.posterPath
              ? `https://image.tmdb.org/t/p/w500${media.posterPath}`
              : "https://via.placeholder.com/500x750?text=No+Image"; // Placeholder image for missing posters
              
            return (
              <MediaCard
                key={media.id}
                media={media}
                posterPath={posterPath} // Pass the poster path to the MediaCard
              />
            );
          })}
        </div>
      )}
    </div>
  );
}