import { useRef, useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, Eye, EyeOff, Tv2, Film, Layers, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Media } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<'multi' | 'alt'>('multi');

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

  // Get URL for the default Flexnit player
  const getDefaultPlayerUrl = () => {
    const baseUrl = 'https://flexnitplayer.ct.ws/flexnit_player.php?';
    const params = new URLSearchParams();
    params.append('video_id', media.tmdbId.toString());
    params.append('tmdb', '1');
    params.append('block_ads', '1');

    if (media.type === 'tv' && selectedSeason !== null && selectedEpisode !== null) {
      params.append('s', selectedSeason.toString());
      params.append('e', selectedEpisode.toString());
    }
    
    return `${baseUrl}?${params.toString()}`;
  };

  // Get URL for the multi-embed player
  const getMultiEmbedUrl = () => {
    if (media.type === 'tv' && selectedSeason !== null && selectedEpisode !== null) {
      return `https://multiembed.mov/?video_id=${media.tmdbId}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}`;
    } else {
      return `https://multiembed.mov/?video_id=${media.tmdbId}&tmdb=1`;
    }
  };

  // Get URL for the alt player (vidlink.pro)
  const getAltPlayerUrl = () => {
    if (media.type === 'tv' && selectedSeason !== null && selectedEpisode !== null) {
      return `https://vidlink.pro/tv/${media.tmdbId}/${selectedSeason}/${selectedEpisode}?primaryColor=e60a15&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=default&title=true&poster=true&autoplay=true&nextbutton=true`;
    } else {
      return `https://vidlink.pro/movie/${media.tmdbId}?primaryColor=e60a15&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=default&title=true&poster=true&autoplay=true&nextbutton=true`;
    }
  };

  // Get the current player URL based on selection
  const getCurrentPlayerUrl = () => {
    return currentPlayer === 'multi' ? getMultiEmbedUrl() : getAltPlayerUrl();
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)]">
      {/* Top Controls Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center p-2 bg-background/80 backdrop-blur-sm">
        {/* Back Button */}
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <div className="flex gap-2">
          {/* Toggle Sidebar Button (only for TV shows) */}
          {media.type === 'tv' && (
            <Button 
              variant="outline" 
              onClick={toggleSidebar}
              title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
          
          {/* Direct link to iOS/Android app */}
          <Button 
            variant="default" 
            onClick={() => window.open('https://mega.nz/file/AvYQmZpZ#mkBjdwFtnqWh0Drl5yvivTxjIEqK7ac_ivTryaa58uE', '_blank')}
          >
            <Layers className="mr-2 h-4 w-4" /> Get App
          </Button>
        </div>
      </div>

      {/* Season Sidebar (for TV shows) - with scrollbar */}
      {media.type === 'tv' && sidebarVisible && (
        <div className="absolute left-0 top-12 w-[300px] h-[calc(100%-12px)] bg-background z-20 overflow-hidden">
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
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
                        <ul className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
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
                                    iframe.src = getCurrentPlayerUrl();
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
        </div>
      )}

      {/* Player Selection Tabs */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm p-2"
        style={{
          left: media.type === 'tv' && sidebarVisible ? '300px' : '0'
        }}
      >
        <Tabs defaultValue="multi" onValueChange={(value) => {
            if (value === 'multi' || value === 'alt') {
              setCurrentPlayer(value);
            }
          }}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="multi">
              <Tv2 className="h-4 w-4 mr-2" /> Multi Player
            </TabsTrigger>
            <TabsTrigger value="alt">
              <Layers className="h-4 w-4 mr-2" /> Alt Player
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Video iframe */}
      <div className="relative w-full h-full">
        <iframe
          ref={iframeRef}
          src={getCurrentPlayerUrl()}
          className="absolute inset-0 w-full h-full max-w-full max-h-full z-10"
          style={{
            marginLeft: media.type === 'tv' && sidebarVisible ? '300px' : '0',
            width: media.type === 'tv' && sidebarVisible ? 'calc(100% - 300px)' : '100%',
            height: 'calc(100% - 80px)', // Account for top and bottom bars
            top: '40px' // Account for top bar
          }}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
    </div>
  );
}
