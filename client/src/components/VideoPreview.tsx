import ReactPlayer from 'react-player/youtube';
import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPreviewProps {
  videoId: string;
}

export default function VideoPreview({ videoId }: VideoPreviewProps) {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="relative aspect-video">
      <ReactPlayer
        url={`https://www.youtube.com/watch?v=${videoId}`}
        width="100%"
        height="100%"
        playing
        loop
        muted={isMuted}
        config={{
          playerVars: {
            controls: 0,
            modestbranding: 1,
          },
        }}
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-2 right-2"
        onClick={(e) => {
          e.stopPropagation();
          setIsMuted(!isMuted);
        }}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}