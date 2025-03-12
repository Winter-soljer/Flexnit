import { useRef } from 'react';
import { Media } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface VideoPlayerProps {
  media: Media;
  season?: number;
  episode?: number;
  onBack: () => void;
}

export default function VideoPlayer({ media, season, episode, onBack }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

    if (media.type === 'tv' && season && episode) {
      params.append('s', season.toString());
      params.append('e', episode.toString());
    }

    return `${baseUrl}${params.toString()}`;
  };

  const handleIframeLoad = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.eval(injectAdBlockScript());
    }
  };

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
          className="absolute inset-0 w-[100%] h-[100%] max-w-full max-h-full"
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
          {/* Render your seasons here */}
          {/* Example: */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="cursor-pointer py-2 px-4 hover:bg-background/30">
                Season {index + 1}
                {/* Add dropdown for episodes */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}