import { useEffect, useRef } from 'react';
import { Media } from "@shared/schema";

interface VideoPlayerProps {
  media: Media;
  season?: number;
  episode?: number;
}

// Anti-adblock detection measures
const antiAdblockScript = `
  // Override common ad detection methods
  window.google_ad_status = 1;
  window.google_ad_slot = true;
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

export default function VideoPlayer({ media, season, episode }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Inject anti-adblock script into iframe
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.eval(antiAdblockScript);
      } catch (e) {
        console.warn('Could not inject anti-adblock script:', e);
      }
    }
  }, []);

  const getPlayerUrl = () => {
    const baseUrl = 'https://flexnitplayer.ct.ws/flexnit_player.php';
    const params = new URLSearchParams();
    params.append('video_id', media.tmdbId.toString());
    params.append('tmdb', '1');

    if (media.type === 'tv' && season && episode) {
      params.append('s', season.toString());
      params.append('e', episode.toString());
    }

    return `${baseUrl}?${params.toString()}`;
  };

  return (
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
  );
}
