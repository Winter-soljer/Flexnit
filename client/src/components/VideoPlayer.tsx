import { useRef, useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Media } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

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
  onBack: () => void;
  setSelectedSeason?: (season: number) => void;
  setSelectedEpisode?: (episode: number) => void;
}

export default function VideoPlayer({ 
  media, 
  onBack, 
  season,
  episode,
  setSelectedSeason: setParentSelectedSeason,
  setSelectedEpisode: setParentSelectedEpisode
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(season || null);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(episode || null);

  // Fetch seasons from API
  const { data: seasons = [] } = useQuery<Season[]>({
    queryKey: [`/api/tv/${media.tmdbId}/seasons`],
    enabled: media.type === 'tv',
  });

  useEffect(() => {
    // Update local state when props change
    if (season !== undefined) setSelectedSeason(season);
    if (episode !== undefined) setSelectedEpisode(episode);
  }, [season, episode]);

  // Update parent state when local state changes
  useEffect(() => {
    if (setParentSelectedSeason && selectedSeason !== null) {
      setParentSelectedSeason(selectedSeason);
    }
    if (setParentSelectedEpisode && selectedEpisode !== null) {
      setParentSelectedEpisode(selectedEpisode);
    }
  }, [selectedSeason, selectedEpisode, setParentSelectedSeason, setParentSelectedEpisode]);

  const getPlayerUrl = () => {
    // Using the required format with "?" at the end of .php
    // Add the protocol to make sure it's properly loaded
    const baseUrl = 'https://flexnitplayer.ct.ws/flexnit_player.php?';
    const params = new URLSearchParams();
    params.append('video_id', media.tmdbId.toString());
    params.append('tmdb', '1');
    
    // Add parameter to bypass ad blocking
    params.append('block_ads', '1');

    if (media.type === 'tv' && selectedSeason !== null && selectedEpisode !== null) {
      params.append('s', selectedSeason.toString());
      params.append('e', selectedEpisode.toString());
    }

    console.log("Player URL params:", {
      media_id: media.tmdbId,
      type: media.type,
      season: selectedSeason,
      episode: selectedEpisode
    });
    
    return `${baseUrl}${params.toString()}`;
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)]">
      {/* Back Button */}
      <Button variant="outline" className="absolute left-4 top-4 z-30" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      {/* Season Sidebar (for TV shows) */}
      {media.type === 'tv' && (
        <div className="absolute left-0 top-0 w-[300px] h-full bg-background overflow-auto z-20">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Seasons</h2>
            <div className="space-y-2">
              {seasons.map((season) => (
                <div key={season.season_number} className="border-b border-border last:border-0">
                  <div
                    className="cursor-pointer py-3 px-4 hover:bg-background/30 flex items-center justify-between"
                    onClick={() => {
                      if (selectedSeason === season.season_number) {
                        setSelectedSeason(null); // Toggle off if already selected
                      } else {
                        setSelectedSeason(season.season_number);
                      }
                    }}
                  >
                    <span className="font-medium">{season.name}</span>
                    {selectedSeason === season.season_number ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </div>
                  
                  {/* Episodes dropdown */}
                  {selectedSeason === season.season_number && (
                    <div className="pl-6 pr-4 pb-2">
                      <ul className="space-y-1">
                        {season.episodes.map((episode) => (
                          <li 
                            key={episode.episode_number} 
                            className={`cursor-pointer rounded-md hover:bg-primary/10 p-2 transition-colors ${
                              selectedEpisode === episode.episode_number ? 'bg-primary/20 text-primary-foreground' : ''
                            }`}
                            onClick={() => {
                              setSelectedEpisode(episode.episode_number);
                              
                              // Force player refresh when changing episodes
                              setTimeout(() => {
                                const iframe = iframeRef.current;
                                if (iframe) {
                                  const newUrl = getPlayerUrl();
                                  console.log("Updating iframe URL to:", newUrl);
                                  iframe.src = newUrl;
                                }
                              }, 50);
                            }}
                          >
                            <span className="font-medium">{episode.episode_number}.</span> {episode.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video iframe */}
      <div className="relative w-full h-full">
        <iframe
          ref={iframeRef}
          src={getPlayerUrl()}
          className="absolute inset-0 w-full h-full max-w-full max-h-full z-10"
          style={{
            marginLeft: media.type === 'tv' ? '300px' : '0',
            width: media.type === 'tv' ? 'calc(100% - 300px)' : '100%'
          }}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="no-referrer"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
          loading="lazy"
        />
      </div>
    </div>
  );
}