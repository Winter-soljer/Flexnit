import { Media } from "@shared/schema";
import MediaCard from "./MediaCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface MediaRowProps {
  title: string;
  media: Media[];
}

export default function MediaRow({ title, media }: MediaRowProps) {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <ScrollArea>
        <div className="flex space-x-4 pb-4">
          {media.map((item) => (
            <div key={item.id} className="w-[200px] flex-none">
              <MediaCard media={item} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
