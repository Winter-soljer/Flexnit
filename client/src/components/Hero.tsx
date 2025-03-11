import { Media } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import { useLocation } from "wouter";

interface HeroProps {
  media: Media;
}

export default function Hero({ media }: HeroProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="relative h-[80vh] w-full">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${media.backdropPath})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background to-background/20" />
      </div>
      
      <div className="relative container h-full flex flex-col justify-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{media.title}</h1>
        <p className="text-lg max-w-xl mb-8 text-muted-foreground">
          {media.overview}
        </p>
        <div className="flex space-x-4">
          {media.trailerKey && (
            <Button size="lg" onClick={() => setLocation(`/watch/${media.id}`)}>
              <Play className="mr-2 h-4 w-4" /> Play
            </Button>
          )}
          <Button size="lg" variant="secondary" onClick={() => setLocation(`/detail/${media.id}`)}>
            <Info className="mr-2 h-4 w-4" /> More Info
          </Button>
        </div>
      </div>
    </div>
  );
}
