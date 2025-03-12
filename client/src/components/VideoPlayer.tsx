
import { useQuery } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Media } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Season {
  season_number: number;
  name: string;
  episodes: Array<{
    episode_number: number;
    name: string;
  }>;
}

interface VideoPlayerProps {
  media: Media;
  season?: number;
  episode?: number;
  setParentSelectedSeason?: (season: number | null) => void;
  setParentSelectedEpisode?: (episode: number | null) => void;
}

export default function VideoPlayer({
  media,
  season,
  episode,
  setParentSelectedSeason,
  setParentSelectedEpisode,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(season || null);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(episode || null);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);

  // Fetch seasons from API
  const { data: seasons = [] } = useQuery<Season[]>({
    queryKey: [`/api/media/${media.id}/seasons`],
    enabled: media.type === "tv",
  });

  // Update parent component state when selections change
  useEffect(() => {
    if (setParentSelectedSeason && selectedSeason !== null) {
      setParentSelectedSeason(selectedSeason);
    }
    if (setParentSelectedEpisode && selectedEpisode !== null) {
      setParentSelectedEpisode(selectedEpisode);
    }
  }, [selectedSeason, selectedEpisode, setParentSelectedSeason, setParentSelectedEpisode]);

  // Season dropdown handler
  const handleSeasonClick = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);

    // If this is the first selection, auto-select episode 1
    if (selectedEpisode === null) {
      setSelectedEpisode(1);

      // Force player refresh when auto-selecting episode
      setTimeout(() => {
        const iframe = iframeRef.current;
        if (iframe) {
          iframe.src = getPlayerUrl();
        }
      }, 50);
    }
  };

  const getPlayerUrl = () => {
    const baseUrl = 'https://multiembed.mov/?';
    const params = new URLSearchParams();

    params.append('media_id', media.tmdbId.toString());
    params.append('type', media.type);

    // Debug logs
    const urlParams = {
      media_id: media.tmdbId,
      type: media.type,
      season: selectedSeason,
      episode: selectedEpisode
    };
    console.log('Player URL params:', urlParams);

    // Only append season and episode for TV shows
    if (media.type === 'tv' && selectedSeason !== null && selectedEpisode !== null) {
      params.append('season', selectedSeason.toString());
      params.append('episode', selectedEpisode.toString());
    }

    return `${baseUrl}${params.toString()}`;
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full">
      {/* Video Player */}
      <div className="w-full md:w-3/4 relative h-0 pb-[56.25%] md:pb-[42.1875%]">
        <iframe
          ref={iframeRef}
          className="absolute top-0 left-0 w-full h-full"
          src={getPlayerUrl()}
          title={media.title}
          frameBorder="0"
          onLoad={() => {
            console.log("Player iframe loaded");
          }}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"

          referrerPolicy="no-referrer"
        />
      </div>

      {/* Episodes Sidebar - Only for TV shows */}
      {media.type === "tv" && seasons.length > 0 && (
        <div className="w-full md:w-1/4 bg-background border-t md:border-t-0 md:border-l border-border h-[300px] md:h-auto">
          <ScrollArea className="h-[300px] md:h-full">
            <div className="p-0">
              {seasons.map((season) => (
                <div key={season.season_number} className="border-b border-border">
                  <div
                    className="cursor-pointer py-3 px-4 hover:bg-background/30 flex items-center justify-between"
                    onClick={() => {
                      const newExpandedSeason = expandedSeason === season.season_number ? null : season.season_number;
                      setExpandedSeason(newExpandedSeason);

                      // Auto-select this season when expanded
                      if (newExpandedSeason !== null) {
                        handleSeasonClick(season.season_number);
                      }
                    }}
                  >
                    <span className="font-medium">{season.name}</span>
                    {expandedSeason === season.season_number ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </div>

                  {/* Episodes dropdown */}
                  {expandedSeason === season.season_number && (
                    <div className="pl-6 pr-4 pb-2">
                      <ul className="space-y-1">
                        {season.episodes.map((episode) => (
                          <li
                            key={episode.episode_number}
                            className={`py-2 px-3 rounded cursor-pointer text-sm ${
                              selectedSeason === season.season_number &&
                              selectedEpisode === episode.episode_number
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent hover:text-accent-foreground"
                            }`}
                            onClick={() => {
                              setSelectedEpisode(episode.episode_number);

                              // Force player refresh when changing episodes
                              setTimeout(() => {
                                const iframe = iframeRef.current;
                                if (iframe) {
                                  iframe.src = getPlayerUrl();
                                }
                              }, 50);
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <span>Episode {episode.episode_number}</span>
                            </div>
                            <div className="text-xs opacity-80 truncate mt-1">
                              {episode.name}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
