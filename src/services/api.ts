import axios, { AxiosResponse } from 'axios';
import { Entry, LoginResponse, User, CreateEntryRequest } from '../types';

const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.11:3000/api'
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor per logging degli errori
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

export default api;