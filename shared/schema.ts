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

export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof media.$inferSelect;
