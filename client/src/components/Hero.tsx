import { Media } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Play, Info, Download, Layers } from "lucide-react";
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
        <div className="flex flex-wrap gap-4">
          <Button 
            size="lg" 
            onClick={() => window.open('https://mega.nz/file/k3pVkKqS#_iuZLad4mBtIIreBtkR-_-kzS7LJUgLuPoOYzxSaYUA', '_blank')}
            className="bg-primary hover:bg-primary/90"
          >
            <Layers className="mr-2 h-5 w-5" /> Get App
          </Button>
          
          {/* Play button removed as requested */}
          
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => setLocation(`/detail/${media.id}`)}
            className="bg-white/10 hover:bg-white/20 text-white"
          >
            <Info className="mr-2 h-5 w-5" /> More Info
          </Button>
        </div>
      </div>
    </div>
  );
}
