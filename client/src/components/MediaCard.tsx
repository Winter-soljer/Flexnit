import { useState, useRef } from "react";
import { Media } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import VideoPreview from "./VideoPreview";

interface MediaCardProps {
  media: Media;
  posterPath?: string;
}

export default function MediaCard({ media, posterPath }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [, setLocation] = useLocation();
  const timeoutRef = useRef<number>();

  const handleClick = () => {
    // If this is a search result (negative ID), fetch by TMDB ID
    if (media.id < 0) {
      // We need to fetch this media by TMDB ID
      // Call our API endpoint to process and cache this TMDB media
      fetch(`/api/search/get-or-create/${media.type}/${media.tmdbId}`)
        .then(response => response.json())
        .then(data => {
          if (data && data.id) {
            setLocation(`/detail/${data.id}`);
          }
        })
        .catch(error => {
          console.error("Error fetching media details:", error);
        });
    } else {
      // Normal media from our database
      setLocation(`/detail/${media.id}`);
    }
  };

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsHovered(true);
    }, 700); // Give a small delay before showing the preview
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
      onClick={handleClick}
    >
      <Card className="overflow-hidden cursor-pointer transition-all duration-200 group-hover:scale-105 group-hover:z-10 group-hover:shadow-xl">
        {isHovered ? (
          <VideoPreview media={media} />
        ) : (
          <img
            src={posterPath || `https://image.tmdb.org/t/p/w500${media.posterPath}`}
            alt={media.title}
            className="w-full aspect-[2/3] object-cover"
            loading="lazy"
          />
        )}
      </Card>
    </div>
  );
}