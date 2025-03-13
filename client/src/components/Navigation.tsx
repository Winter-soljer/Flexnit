import { Home, Film, Tv, Heart } from "lucide-react";
import { Link } from "wouter";

const Navigation = () => {
  const items = [
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

  return (
    <nav className="flex items-center space-x-4">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <a className="flex items-center space-x-1 text-sm font-medium">
            {item.icon}
            <span>{item.label}</span>
          </a>
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;