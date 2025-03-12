import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import MediaCard from "@/components/MediaCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Media } from "@shared/schema";
import { search } from "@/lib/api";
export default function Search() {
  const [location] = useLocation();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setQuery(searchParams.get("q")?.trim() || "");
  }, [location]);

  const fetchSearchResults = async () => {
    if (!query) return []; // ✅ Prevents API call if query is empty

    console.log("Searching for:", query); // ✅ Debugging log
    const results = await search(query); // ✅ Corrected function call
    console.log("Search results:", results);
    return results;
  };

  const { data: results, isLoading, isError } = useQuery<Media[]>({
    queryKey: ["/api/search", query],
    queryFn: fetchSearchResults,
    enabled: !!query, // ✅ Ensures query is not empty before fetching
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
          {results.map((media) => (
          <MediaCard key={media.id} media={media} type={media.media_type} />
          ))}
        </div>
      )}
    </div>
  );
}