import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY is required');
}

const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY
  }
});

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  popularity: number;
  genre_ids: number[];
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  popularity: number;
  genre_ids: number[];
}

export async function getTrending(mediaType: 'movie' | 'tv', timeWindow: 'day' | 'week' = 'week') {
  const { data } = await tmdb.get(`/trending/${mediaType}/${timeWindow}`);
  return data.results;
}

export async function getPopular(mediaType: 'movie' | 'tv') {
  const { data } = await tmdb.get(`/${mediaType}/popular`);
  return data.results;
}

export async function getDetails(mediaType: 'movie' | 'tv', id: number) {
  const { data } = await tmdb.get(`/${mediaType}/${id}`);
  return data;
}

export async function getTrailer(mediaType: 'movie' | 'tv', id: number) {
  const { data } = await tmdb.get(`/${mediaType}/${id}/videos`);
  const trailer = data.results.find(
    (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
  );
  return trailer?.key;
}

export async function search(query: string, mediaType?: 'movie' | 'tv') {
  const { data } = await tmdb.get('/search/multi', {
    params: {
      query,
      ...(mediaType && { include_adult: false })
    }
  });
  return data.results;
}

export async function getGenres(mediaType: 'movie' | 'tv') {
  const { data } = await tmdb.get(`/genre/${mediaType}/list`);
  return data.genres;
}

export async function getSimilar(mediaType: 'movie' | 'tv', id: number) {
  const { data } = await tmdb.get(`/${mediaType}/${id}/similar`);
  return data.results;
}

export async function getTVSeasons(id: number) {
  const { data } = await tmdb.get(`/tv/${id}`);
  return data.seasons.map((season: any) => ({
    season_number: season.season_number,
    name: season.name,
    episodes: season.episodes || []
  }));
}

export async function getByGenre(mediaType: 'movie' | 'tv', genreId: number) {
  const { data } = await tmdb.get(`/discover/${mediaType}`, {
    params: {
      with_genres: genreId
    }
  });
  return data.results;
}