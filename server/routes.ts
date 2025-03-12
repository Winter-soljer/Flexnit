import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { search, getDetails, getGenres, getSimilar, getTVSeasons, getByGenre, type TMDBMovie, type TMDBTVShow } from "./tmdb";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get('/api/trending/:type', async (req, res) => {
    try {
      const type = req.params.type as 'movie' | 'tv';
      const media = await storage.getTrendingMedia(type);
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch trending media' });
    }
  });

  app.get('/api/popular/:type', async (req, res) => {
    try {
      const type = req.params.type as 'movie' | 'tv';
      const media = await storage.getPopularMedia(type);
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch popular media' });
    }
  });

  app.get('/api/media/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid media ID' });
      }
      const media = await storage.getMediaById(id);
      if (!media) {
        return res.status(404).json({ message: 'Media not found' });
      }

      // Get additional details if it's a TV show
      if (media.type === 'tv') {
        const seasons = await getTVSeasons(media.tmdbId);
        const similar = await getSimilar(media.type, media.tmdbId);
        const similarMedia = await Promise.all(
          similar.slice(0, 6).map(item => storage.processAndCacheMedia(item, media.type))
        );
        res.json({ ...media, seasons, similar: similarMedia });
      } else {
        const similar = await getSimilar(media.type, media.tmdbId);
        const similarMedia = await Promise.all(
          similar.slice(0, 6).map(item => storage.processAndCacheMedia(item, media.type))
        );
        res.json({ ...media, similar: similarMedia });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch media details' });
    }
  });

  app.get('/api/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: 'Search query required' });
      }
      const results = await search(q);
      const mediaResults = await Promise.all(
        results
          .filter((item: any) => 
            (item.media_type === 'movie' || item.media_type === 'tv') && 
            item.poster_path && 
            item.backdrop_path
          )
          .map((item: any) => storage.processAndCacheMedia(item, item.media_type))
      );
      res.json(mediaResults.filter(Boolean));
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: 'Search failed' });
    }
  });

  app.get('/api/genres/:type', async (req, res) => {
    try {
      const type = req.params.type as 'movie' | 'tv';
      const genres = await getGenres(type);
      res.json(genres);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch genres' });
    }
  });

  app.get('/api/genre/:type/:genreId', async (req, res) => {
    try {
      const type = req.params.type as 'movie' | 'tv';
      const genreId = parseInt(req.params.genreId);
      if (isNaN(genreId)) {
        return res.status(400).json({ message: 'Invalid genre ID' });
      }
      const results = await getByGenre(type, genreId);
      const media = await Promise.all(
        results.map(item => storage.processAndCacheMedia(item, type))
      );
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch genre media' });
    }
  });

  // Endpoint to get or create media by TMDB ID
  app.get('/api/search/get-or-create/:type/:tmdbId', async (req, res) => {
    try {
      const type = req.params.type as 'movie' | 'tv';
      const tmdbId = parseInt(req.params.tmdbId);
      
      if (isNaN(tmdbId)) {
        return res.status(400).json({ message: 'Invalid TMDB ID' });
      }
      
      // First check if we already have this media in our database
      const existingMedia = await storage.getMediaByTmdbId(tmdbId, type);
      
      if (existingMedia) {
        return res.json(existingMedia);
      }
      
      // If not, fetch details from TMDB and cache it
      const details = await getDetails(type, tmdbId);
      const media = await storage.processAndCacheMedia(details, type);
      
      res.json(media);
    } catch (error) {
      console.error('Error getting or creating media:', error);
      res.status(500).json({ message: 'Failed to get or create media' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}