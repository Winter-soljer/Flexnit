import { useEffect, useRef } from 'react';
import { Media } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface VideoPlayerProps {
  media: Media;
  season?: number;
  episode?: number;
  onBack: () => void;
}

// Enhanced anti-adblock and mixed content handling
const securityBypassScript = `
  // Override security policies for mixed content
  if (window.top !== window.self) {
    document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.remove();
  }

  // Override common ad detection methods
  window.google_ad_status = 1;
  window.google_ad_client = true;
  window.google_ad_type = true;

  // Block common ad detection scripts
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node: any) => {
        if (node.tagName === 'SCRIPT' && 
            (node.src?.includes('ads') || 
             node.src?.includes('analytics'))) {
          node.remove();
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
`;

export default function VideoPlayer({ media, season, episode, onBack }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Inject security bypass script into iframe
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      try {
        const script = document.createElement('script');
        script.textContent = securityBypassScript;
        iframe.contentWindow.document.head.appendChild(script);
      } catch (e) {
        console.warn('Could not inject security bypass script:', e);
      }
    }
  }, []);

  const getPlayerUrl = () => {
    const baseUrl = 'https://flexnitplayer.ct.ws/flexnit_player.php?';
    const params = new URLSearchParams();
    params.append('video_id', media.tmdbId.toString());
    params.append('tmdb', '1');

    if (media.type === 'tv' && season && episode) {
      params.append('s', season.toString());
      params.append('e', episode.toString());
    }

    return `${baseUrl}${params.toString()}`;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 bg-background/20 backdrop-blur-sm hover:bg-background/40"
        onClick={onBack}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <div className="relative w-full aspect-video">
        <iframe
          ref={iframeRef}
          src={getPlayerUrl()}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
}