import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, Play, Star, ChevronDown } from "lucide-react";
import { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { Media } from "@shared/schema";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import MediaRow from "@/components/MediaRow";

interface Season {
  season_number: number;
  name: string;
  episodes: Array<{
    episode_number: number;
    name: string;
  }>;
}

interface DetailedMedia extends Media {
  seasons?: Season[];
  similar?: Media[];
}

export default function Detail() {
  const [match, params] = useRoute("/detail/:id");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number>();
  const [selectedEpisode, setSelectedEpisode] = useState<number>();
  const id = params?.id;

  const { data: media, isLoading } = useQuery<DetailedMedia>({
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
        <VideoPlayer 
          media={media} 
          season={selectedSeason}
          episode={selectedEpisode}
          onBack={() => setIsPlaying(false)}
        />
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
          <div className="space-y-6">
            <img
              src={`https://image.tmdb.org/t/p/w500${media.posterPath}`}
              alt={media.title}
              className="rounded-lg shadow-xl"
            />

            {media.type === 'tv' && media.seasons && (
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <h3 className="text-lg font-semibold mb-4">Seasons</h3>
                <Accordion type="single" collapsible>
                  {media.seasons.map((season) => (
                    <AccordionItem key={season.season_number} value={`season-${season.season_number}`}>
                      <AccordionTrigger>{season.name}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {season.episodes.map((episode) => (
                            <Button
                              key={episode.episode_number}
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => {
                                setSelectedSeason(season.season_number);
                                setSelectedEpisode(episode.episode_number);
                                setIsPlaying(true);
                              }}
                            >
                              {episode.episode_number}. {episode.name}
                            </Button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            )}
          </div>

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
              <div className="aspect-video mt-8 w-2/3">
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

        {media.similar && media.similar.length > 0 && (
          <div className="mt-12">
            <MediaRow title="Similar Titles" media={media.similar} />
          </div>
        )}
      </div>
    </div>
  );
}