import { useState, useRef } from "react";
import { Media } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import VideoPreview from "./VideoPreview";

interface MediaCardProps {
  media: Media;
}

export default function MediaCard({ media }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [, setLocation] = useLocation();
  const timeoutRef = useRef<number>();

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsHovered(false);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(false);
  };

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => setLocation(`/detail/${media.id}`)}
    >
      <Card className="overflow-hidden cursor-pointer transition-transform duration-200 group-hover:scale-110 group-hover:z-10">
        {isHovered && media.trailerKey ? (
          <VideoPreview media={media} />
        ) : (
          <img
            src={`https://image.tmdb.org/t/p/w500${media.posterPath}`}
            alt={media.title}
            className="w-full aspect-[2/3] object-cover"
          />
        )}
      </Card>
    </div>
  );
}