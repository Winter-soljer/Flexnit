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
          allow="autoplay; encrypted-media; picture-in-picture; mixed-content"
          sandbox="allow-scripts allow-same-origin allow-forms allow-mixed-content allow-presentation"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}