import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoPlayer from './VideoPlayer';
import { Media } from '@shared/schema';

interface VideoPreviewProps {
  media: Media;
}

export default function VideoPreview({ media }: VideoPreviewProps) {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="relative aspect-video">
      <VideoPlayer media={media} />
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-2 right-2 bg-background/20 backdrop-blur-sm"
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