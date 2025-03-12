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
    if (season) setSelectedSeason(season);
    if (episode) setSelectedEpisode(episode);
  }, [season, episode]);

  // Update parent state when local state changes
  useEffect(() => {
    if (setParentSelectedSeason && selectedSeason) {
      setParentSelectedSeason(selectedSeason);
    }
    if (setParentSelectedEpisode && selectedEpisode) {
      setParentSelectedEpisode(selectedEpisode);
    }
  }, [selectedSeason, selectedEpisode, setParentSelectedSeason, setParentSelectedEpisode]);

  const getPlayerUrl = () => {
    const baseUrl = 'https://multiembed.mov/?';
    const params = new URLSearchParams();
    params.append('video_id', media.tmdbId.toString());
    params.append('tmdb', '1');

    if (media.type === 'tv' && selectedSeason && selectedEpisode) {
      params.append('s', selectedSeason.toString());
      params.append('e', selectedEpisode.toString());
    }

    return `${baseUrl}${params.toString()}`;
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)]">
      <Button variant="outline" className="absolute left-4 top-4 z-10" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      {/* Season Sidebar (for TV shows) */}
      {media.type === 'tv' && (
        <div className="absolute left-0 top-0 w-[300px] h-full bg-background overflow-auto">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Seasons</h2>
            <div className="space-y-4">
              {seasons.map((season) => (
                <div
                  key={season.season_number}
                  className="cursor-pointer py-2 px-4 hover:bg-background/30 flex items-center justify-between"
                  onClick={() => setSelectedSeason(season.season_number)}
                >
                  <span>{season.name}</span>
                  {selectedSeason === season.season_number ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </div>
              ))}
            </div>
            {selectedSeason && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Episodes</h3>
                <ul>
                  {seasons.find(s => s.season_number === selectedSeason)?.episodes.map((episode) => (
                    <li 
                      key={episode.episode_number} 
                      className={`cursor-pointer hover:bg-background/30 p-2 ${
                        selectedEpisode === episode.episode_number ? 'bg-primary/20' : ''
                      }`}
                      onClick={() => setSelectedEpisode(episode.episode_number)}
                    >
                      {episode.episode_number}. {episode.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video iframe */}
      <div className="relative w-full h-full">
        <iframe
          ref={iframeRef}
          src={getPlayerUrl()}
          className="absolute inset-0 w-full h-full max-w-full max-h-full"
          style={{
            marginLeft: media.type === 'tv' ? '300px' : '0',
            width: media.type === 'tv' ? 'calc(100% - 300px)' : '100%'
          }}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-forms allow-mixed-content allow-presentation"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}