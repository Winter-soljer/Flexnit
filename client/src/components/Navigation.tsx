import { Home, Film, Tv, Heart } from "lucide-react";

const navigation = [
  {
    href: "/",
    label: "Home",
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: "/films",
    label: "Films",
    icon: <Film className="h-5 w-5" />,
  },
  {
    href: "/shows",
    label: "TV Shows",
    icon: <Tv className="h-5 w-5" />,
  },
  {
    href: "/favorites",
    label: "Favorites",
    icon: <Heart className="h-5 w-5" />,
  },
];
export default navigation;