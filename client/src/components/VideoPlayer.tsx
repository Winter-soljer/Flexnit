import { useRef, useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Media } from "@shared/schema";

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
  onBack: () => void;
}

export default function VideoPlayer({ media, onBack }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);


  // Ad-blocking JavaScript code
  const injectAdBlockScript = () => {
    const script = `
      javascript:(function() {
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === 1) {
                var adClasses = ['popup-ad', 'overlay-ad', 'ad-banner', 'ad-block', 'ad-container', 'adsbox', 'modal-backdrop', 'ad_overlay'];
                for (var i = 0; i < adClasses.length; i++) {
                  if (node.classList.contains(adClasses[i])) {
                    node.remove();
                    console.log('Ad removed: ' + adClasses[i]);
                  }
                }
              }
            });
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        console.log('AdBlock script injected');
      })();
    `;
    return script;
  };

  const getPlayerUrl = () => {
    const baseUrl = 'https://multiembed.mov/?';
    const params = new URLSearchParams();
    params.append('video_id', media.tmdbId.toString());
    params.append('tmdb', '1');

    if (selectedSeason && selectedEpisode) {
      params.append('s', selectedSeason.toString());
      params.append('e', selectedEpisode.toString());
    }

    return `${baseUrl}${params.toString()}`;
  };

  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const script = document.createElement('script');
        script.textContent = injectAdBlockScript();
        iframeRef.current.contentDocument?.body.appendChild(script);
      } catch (error) {
        console.error('Failed to inject ad block script:', error);
      }
    }
  };

  //Fetch seasons and episodes (replace with your actual API call)
  useEffect(() => {
    const fetchSeasons = async () => {
      // Replace with your actual API call to fetch seasons and episodes
      const seasonsData = await Promise.resolve([
        { season_number: 1, name: "Season 1", episodes: [{ episode_number: 1, name: "Episode 1" }, { episode_number: 2, name: "Episode 2" }] },
        { season_number: 2, name: "Season 2", episodes: [{ episode_number: 1, name: "Episode 3" }, { episode_number: 2, name: "Episode 4" }] },
      ]);
        setSeasons(seasonsData);
      };
      if (media.type === 'tv') {
        fetchSeasons();
      }
  }, [media]);


  return (
    <div className="relative w-full h-screen">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 bg-background/20 backdrop-blur-sm hover:bg-background/40"
        onClick={onBack}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      {/* Iframe Container */}
      <div className="relative w-full h-full">
        <iframe
          ref={iframeRef}
          src={getPlayerUrl()}
          className="absolute inset-0 w-[calc(100%-310px)] h-[100%] ml-[310px] max-w-full max-h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-forms allow-mixed-content allow-presentation"
          referrerPolicy="no-referrer"
          onLoad={handleIframeLoad} // Ensure the ad-block script is injected after load
        />
      </div>

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
                    <li key={episode.episode_number} className="cursor-pointer hover:bg-background/30 p-2" onClick={() => setSelectedEpisode(episode.episode_number)}>
                      {episode.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}