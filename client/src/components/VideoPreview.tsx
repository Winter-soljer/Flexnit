import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Media } from '@shared/schema';

interface VideoPreviewProps {
  media: Media;
}

export default function VideoPreview({ media }: VideoPreviewProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use YouTube trailer as preview if available
  const youtubeUrl = media.trailerKey 
    ? `https://www.youtube.com/embed/${media.trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&showinfo=0&rel=0&loop=1`
    : '';
    
  // Track when the element becomes visible in the viewport
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.6 });
    
    observer.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);
  
  // Start/pause video based on hover and visibility
  useEffect(() => {
    if (!videoRef.current) return;
    
    // Only autoplay if both visible in viewport and being hovered
    if (isVisible && isHovering && isLoaded) {
      videoRef.current.play().catch(e => console.error("Autoplay failed:", e));
    } else {
      videoRef.current.pause();
    }
  }, [isVisible, isHovering, isLoaded]);
  
  // Handle mute toggle
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };
  
  return (
    <div 
      className="relative aspect-video w-full overflow-hidden rounded-md group"
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Thumbnail/poster image shown by default */}
      <img 
        src={`https://image.tmdb.org/t/p/w500${media.backdropPath}`}
        alt={media.title}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isHovering && isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      
      {/* Video preview that activates on hover - only load iframe when hovering */}
      {media.trailerKey && isHovering ? (
        <div className={`absolute inset-0 transition-opacity duration-500 ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}>
          <iframe
            src={youtubeUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      ) : (
        // Fallback when no trailer is available
        <div className={`absolute inset-0 bg-black/80 flex items-center justify-center transition-opacity duration-300 ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}>
          <Play className="w-12 h-12 text-white/80" />
        </div>
      )}
      
      {/* Overlay with title and info that appears on hover */}
      <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent
        transition-transform duration-300 ${isHovering ? 'translate-y-0' : 'translate-y-full'}`}>
        <h3 className="text-white font-bold truncate">{media.title}</h3>
      </div>
      
      {/* Mute/unmute button */}
      <Button
        variant="ghost"
        size="icon"
        className={`absolute bottom-2 right-2 bg-background/20 backdrop-blur-sm transition-opacity duration-300 ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={toggleMute}
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