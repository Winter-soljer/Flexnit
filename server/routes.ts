import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { search } from "./tmdb";

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
      res.json(media);
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
      const media = await Promise.all(
        results
          .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
          .map(item => storage.processAndCacheMedia(item, item.media_type))
      );
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: 'Search failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}