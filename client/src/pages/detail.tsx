import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPreview from "@/components/VideoPreview";

export default function Detail() {
  const [match, params] = useRoute("/detail/:id");
  const id = params?.id;

  const { data: media, isLoading } = useQuery({
    queryKey: ["/api/media", id],
    enabled: !!id,
  });

  if (isLoading) {
    return <Skeleton className="w-full h-screen" />;
  }

  if (!media) {
    return <div>Media not found</div>;
  }

  return (
    <div>
      <div
        className="h-[50vh] bg-cover bg-center relative"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${media.backdropPath})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container -mt-32 relative">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          <img
            src={`https://image.tmdb.org/t/p/w500${media.posterPath}`}
            alt={media.title}
            className="rounded-lg shadow-xl"
          />
          
          <div>
            <h1 className="text-4xl font-bold mb-4">{media.title}</h1>
            <p className="text-lg mb-6">{media.overview}</p>
            
            {media.trailerKey && (
              <div className="aspect-video">
                <VideoPreview videoId={media.trailerKey} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
