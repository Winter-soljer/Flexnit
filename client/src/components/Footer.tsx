import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-card/50 backdrop-blur-md mt-12">
      <div className="container flex flex-col sm:flex-row justify-between items-center py-4">
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TechFisher.inc. All rights reserved.
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://play.google.com/store/apps/details?id=com.tecfisher.flexnit', '_blank')}
          >
            <Layers className="mr-2 h-4 w-4" /> Get Mobile App
          </Button>
        </div>
      </div>
    </footer>
  );
}