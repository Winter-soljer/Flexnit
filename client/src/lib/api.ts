
import axios from 'axios';
import { Media } from '@shared/schema';

const api = axios.create({
  baseURL: '/api'
});

export async function getTrending(type: 'movie' | 'tv') {
  const { data } = await api.get<Media[]>(`/trending/${type}`);
  return data;
}

export async function getPopular(type: 'movie' | 'tv') {
  const { data } = await api.get<Media[]>(`/popular/${type}`);
  return data;
}

export async function getMediaById(id: number) {
  const { data } = await api.get<Media>(`/media/${id}`);
  return data;
}

export async function search(query: string) {
  const { data } = await api.get<Media[]>('/search', {
    params: { q: query }
  });
  return data;
}

export async function getGenres(type: 'movie' | 'tv') {
  const { data } = await api.get(`/genres/${type}`);
  return data;
}
