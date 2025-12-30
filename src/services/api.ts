import axios, { AxiosResponse } from 'axios';
import { Entry, LoginResponse, CreateEntryRequest, Todo, CreateTodoRequest, Album, CreateAlbumRequest, AlbumPage, PageContent } from '../types';
import Constants from 'expo-constants';

const getApiBaseUrl = (): string => {

  return 'https://diary-backend-c2tw.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('API_BASE_URL:', API_BASE_URL);


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (name: 'Ilaria' | 'Lorenzo'): Promise<AxiosResponse<LoginResponse>> =>
    api.post('/auth/login', { name }),
};

export const entriesAPI = {
  getAll: (): Promise<AxiosResponse<Entry[]>> =>
    api.get('/entries'),

  create: (entry: CreateEntryRequest): Promise<AxiosResponse<Entry>> =>
    api.post('/entries', entry),

  getByDate: (date: string): Promise<AxiosResponse<Entry[]>> =>
    api.get(`/entries/date/${date}`),
};

export const todosAPI = {
  getAll: (): Promise<AxiosResponse<Todo[]>> =>
    api.get('/todos'),

  create: (todo: CreateTodoRequest): Promise<AxiosResponse<Todo>> =>
    api.post('/todos', todo),

  toggle: (id: string): Promise<AxiosResponse<Todo>> =>
    api.patch(`/todos/${id}/toggle`),

  delete: (id: string): Promise<AxiosResponse<{ success: boolean }>> =>
    api.delete(`/todos/${id}`),
};

export const albumsAPI = {
  getAll: (): Promise<AxiosResponse<Album[]>> =>
    api.get('/albums'),

  create: (album: CreateAlbumRequest): Promise<AxiosResponse<Album>> =>
    api.post('/albums', album),

  delete: (id: string): Promise<AxiosResponse<{ success: boolean }>> =>
    api.delete(`/albums/${id}`),

  // ✨ NUOVO: Gestione pagine
  getPages: (albumId: string): Promise<AxiosResponse<AlbumPage[]>> =>
    api.get(`/albums/${albumId}/pages`),

  createPage: (albumId: string, contents: PageContent[]): Promise<AxiosResponse<AlbumPage>> =>
    api.post(`/albums/${albumId}/pages`, { contents }),

  updatePage: (albumId: string, pageId: string, contents: PageContent[]): Promise<AxiosResponse<AlbumPage>> =>
    api.put(`/albums/${albumId}/pages/${pageId}`, { contents }),

  searchSpotifyTracks: (query: string): Promise<AxiosResponse<{ tracks: { items: any[] } }>> =>
    api.get(`/spotify/search?q=${encodeURIComponent(query)}`),

  searchGiphyStickers: (query: string): Promise<AxiosResponse<{ data: any[] }>> =>
    api.get('/giphy/search', { params: { q: query } }),

  getTrendingStickers: (): Promise<AxiosResponse<{ data: any[] }>> =>
    api.get('/giphy/trending'),

  getStickerCategories: (): Promise<AxiosResponse<{ categories: any[] }>> =>
    api.get('/giphy/categories'),
};

export default api;
