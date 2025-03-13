
import { useEffect, useState } from "react";
import { Media } from "@shared/schema";
import { getFavorites } from "@/lib/favorites";
import MediaCard from "@/components/MediaCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Favorites() {
  const [favorites, setFavorites] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setFavorites(getFavorites());
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <Skeleton className="w-full h-screen" />;
  }

  return (
    <div className="container pt-8 space-y-8">
      <h1 className="text-4xl font-bold">My Favorites</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            You haven't added any favorites yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {favorites.map((media) => (
            <MediaCard key={`fav-${media.tmdbId}-${media.type}`} media={media} />
          ))}
        </div>
      )}
    </div>
  );
}
