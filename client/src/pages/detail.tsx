import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, Play, Star } from "lucide-react";
import { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { Media } from "@shared/schema";
import { format } from "date-fns";

export default function Detail() {
  const [match, params] = useRoute("/detail/:id");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const id = params?.id;

  const { data: media, isLoading } = useQuery<Media>({
    queryKey: [`/api/media/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return <Skeleton className="w-full h-screen" />;
  }

  if (!media) {
    return (
      <div className="container pt-8">
        <h1 className="text-4xl font-bold">Media not found</h1>
      </div>
    );
  }

  const releaseDate = media.releaseDate ? 
    format(new Date(media.releaseDate), 'MMMM d, yyyy') : 
    'Release date unavailable';

  if (isPlaying) {
    return (
      <div className="container pt-8">
        <VideoPlayer media={media} />
      </div>
    );
  }

  return (
    <div>
      <div
        className="h-[50vh] bg-cover bg-center relative"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${media.backdropPath})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container -mt-32 relative">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          <img
            src={`https://image.tmdb.org/t/p/w500${media.posterPath}`}
            alt={media.title}
            className="rounded-lg shadow-xl"
          />

          <div>
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl font-bold">{media.title}</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
                className={isFavorite ? "text-red-500" : ""}
              >
                <Heart className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>{Math.round(media.voteAverage! / 10)}/10</span>
              </div>
              <span>•</span>
              <span>{releaseDate}</span>
            </div>

            <p className="text-lg mb-6">{media.overview}</p>

            <Button size="lg" onClick={() => setIsPlaying(true)}>
              <Play className="mr-2 h-4 w-4" /> Play
            </Button>

            {media.trailerKey && (
              <div className="aspect-video mt-8">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${media.trailerKey}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}