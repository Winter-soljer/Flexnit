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
    const searchParams = new URLSearchParams(location.split("?")[1]);
    setQuery(searchParams.get("q") || "");
  }, [location]);

  const { data: results, isLoading } = useQuery<Media[]>({
    queryKey: ["/api/search", query],
    enabled: !!query,
  });

  if (isLoading) {
    return <Skeleton className="w-full h-screen" />;
  }

  return (
    <div className="container pt-8">
      <h1 className="text-4xl font-bold mb-8">
        Search Results for "{query}"
      </h1>

      {!results?.length ? (
        <p>No results found</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((media) => (
            <MediaCard key={media.id} media={media} />
          ))}
        </div>
      )}
    </div>
  );
}