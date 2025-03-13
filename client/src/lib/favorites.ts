
import { Media } from "@shared/schema";

// Key for localStorage
const FAVORITES_KEY = "streambox_favorites";

// Get favorites from localStorage
export function getFavorites(): Media[] {
  const favoritesJson = localStorage.getItem(FAVORITES_KEY);
  if (!favoritesJson) return [];
  try {
    return JSON.parse(favoritesJson);
  } catch (e) {
    console.error("Failed to parse favorites:", e);
    return [];
  }
}

// Add a media item to favorites
export function addToFavorites(media: Media): void {
  const favorites = getFavorites();
  // Check if already in favorites
  if (!favorites.some(item => item.tmdbId === media.tmdbId && item.type === media.type)) {
    favorites.push(media);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

// Remove a media item from favorites
export function removeFromFavorites(tmdbId: number, type: string): void {
  const favorites = getFavorites();
  const filtered = favorites.filter(
    item => !(item.tmdbId === tmdbId && item.type === type)
  );
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

// Check if a media item is in favorites
export function isInFavorites(tmdbId: number, type: string): boolean {
  const favorites = getFavorites();
  return favorites.some(item => item.tmdbId === tmdbId && item.type === type);
}

// Get recommendations based on user's favorites
export function getRecommendationGenres(): string[] {
  const favorites = getFavorites();
  // Create a map to count genre occurrences
  const genreCounts: Record<string, number> = {};
  
  // Count genre occurrences across all favorites
  favorites.forEach(media => {
    if (media.genres && media.genres.length > 0) {
      media.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    }
  });
  
  // Sort genres by count and return top 3
  return Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre);
}
