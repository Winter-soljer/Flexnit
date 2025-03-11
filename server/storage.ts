import { Media, type InsertMedia } from "@shared/schema";
import { getTrending, getPopular, getDetails, getTrailer, type TMDBMovie, type TMDBTVShow } from "./tmdb";

export interface IStorage {
  getMediaById(id: number): Promise<Media | undefined>;
  getTrendingMedia(type: 'movie' | 'tv'): Promise<Media[]>;
  getPopularMedia(type: 'movie' | 'tv'): Promise<Media[]>;
  searchMedia(query: string): Promise<Media[]>;
  cacheMedia(media: InsertMedia): Promise<Media>;
}

export class MemStorage implements IStorage {
  private media: Map<number, Media>;
  private currentId: number;

  constructor() {
    this.media = new Map();
    this.currentId = 1;
  }

  async getMediaById(id: number): Promise<Media | undefined> {
    return this.media.get(id);
  }

  async getTrendingMedia(type: 'movie' | 'tv'): Promise<Media[]> {
    const trending = await getTrending(type);
    return Promise.all(trending.map(item => this.processAndCacheMedia(item, type)));
  }

  async getPopularMedia(type: 'movie' | 'tv'): Promise<Media[]> {
    const popular = await getPopular(type);
    return Promise.all(popular.map(item => this.processAndCacheMedia(item, type)));
  }

  async searchMedia(query: string): Promise<Media[]> {
    // TODO: Implement search
    return [];
  }

  async cacheMedia(insertMedia: InsertMedia): Promise<Media> {
    const id = this.currentId++;
    const media: Media = {
      id,
      tmdbId: insertMedia.tmdbId,
      type: insertMedia.type,
      title: insertMedia.title,
      overview: insertMedia.overview,
      posterPath: insertMedia.posterPath || null,
      backdropPath: insertMedia.backdropPath || null,
      releaseDate: insertMedia.releaseDate || null,
      voteAverage: insertMedia.voteAverage || null,
      popularity: insertMedia.popularity || null,
      genres: insertMedia.genres,
      trailerKey: insertMedia.trailerKey || null,
      lastUpdated: new Date()
    };
    this.media.set(id, media);
    return media;
  }

  private async processAndCacheMedia(tmdbMedia: TMDBMovie | TMDBTVShow, type: 'movie' | 'tv'): Promise<Media> {
    const trailerKey = await getTrailer(type, tmdbMedia.id);

    const media: InsertMedia = {
      tmdbId: tmdbMedia.id,
      type,
      title: type === 'movie' ? (tmdbMedia as TMDBMovie).title : (tmdbMedia as TMDBTVShow).name,
      overview: tmdbMedia.overview,
      posterPath: tmdbMedia.poster_path,
      backdropPath: tmdbMedia.backdrop_path,
      releaseDate: type === 'movie' ? 
        (tmdbMedia as TMDBMovie).release_date : 
        (tmdbMedia as TMDBTVShow).first_air_date,
      voteAverage: Math.round(tmdbMedia.vote_average * 10),
      popularity: Math.round(tmdbMedia.popularity),
      genres: tmdbMedia.genre_ids,
      trailerKey
    };

    return this.cacheMedia(media);
  }
}

export const storage = new MemStorage();