import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      // Update URL with search query parameter
      const url = `/search?q=${encodeURIComponent(search.trim())}`;
      setLocation(url);
      setSearch(""); // Clear search input after submitting
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <img src="/flexnit-logo.svg" alt="Flexnit Logo" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-primary">FLEXNIT</h1>
          </a>
        </Link>

        <div className="flex space-x-6 ml-6">
          <Link href="/">
            <a className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </a>
          </Link>
          <Link href="/movies">
            <a className="text-sm font-medium transition-colors hover:text-primary">
              Movies
            </a>
          </Link>
          <Link href="/tv-shows">
            <a className="text-sm font-medium transition-colors hover:text-primary">
              TV Shows
            </a>
          </Link>
          <Link href="/favorites">
            <a className="text-sm font-medium transition-colors hover:text-primary">
              Favorites
            </a>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="ml-auto flex items-center space-x-2">
          <Input
            type="search"
            placeholder="Search..."
            className="w-[200px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="p-2">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>
    </nav>
  );
}