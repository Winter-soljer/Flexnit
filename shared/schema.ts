import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Cache tables for TMDB data
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  tmdbId: integer("tmdb_id").notNull(),
  type: text("type").notNull(), // 'movie' or 'tv'
  title: text("title").notNull(),
  overview: text("overview").notNull(),
  posterPath: text("poster_path"),
  backdropPath: text("backdrop_path"),
  releaseDate: text("release_date"),
  voteAverage: integer("vote_average"),
  popularity: integer("popularity"),
  genres: jsonb("genres").notNull().$type<string[]>(),
  trailerKey: text("trailer_key"), // YouTube video key
  lastUpdated: timestamp("last_updated").defaultNow()

});

// @shared/schema.ts
export interface Media {
  // ... existing properties ...
  media_type: 'movie' | 'tv' ;
  id:''// Add this property
}

// Watchlist table
export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  mediaId: integer("media_id").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
  watched: boolean("watched").default(false),
  watchedAt: timestamp("watched_at"),
  rating: integer("rating"), // User rating 1-10
  lastWatched: timestamp("last_watched"), // For tracking watch history
});

export const insertMediaSchema = createInsertSchema(media).pick({
  tmdbId: true,
  type: true,
  title: true,
  overview: true,
  posterPath: true,
  backdropPath: true,
  releaseDate: true,
  voteAverage: true,
  popularity: true,
  genres: true,
  trailerKey: true
});

export const insertWatchlistSchema = createInsertSchema(watchlist).pick({
  mediaId: true,
  watched: true,
  rating: true,
});

export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Watchlist = typeof watchlist.$inferSelect;