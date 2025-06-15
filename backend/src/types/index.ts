// backend/src/types/index.ts - VERSIONE CORRETTA

import { Types } from 'mongoose';

export interface IUser {
  name: 'Ilaria' | 'Lorenzo';
  avatar?: string;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAttachment {
  type: 'image' | 'sticker' | 'emoji';
  content: string;
  url?: string;
}

export interface IEntry {
  author: 'Ilaria' | 'Lorenzo';
  text: string;
  attachments?: IAttachment[];
  date?: Date;
  edited?: boolean;
  editedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITodo {
  author: 'Ilaria' | 'Lorenzo';
  text: string;
  completed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ✨ Interface per Album Page Content
export interface IPageContent {
  type: 'text' | 'image';
  content: string; // Testo o URL/base64 immagine
  position?: {
    x: number;
    y: number;
  };
}

// ✨ Interface per Album Page (backend - con ObjectId)
export interface IAlbumPage {
  albumId: Types.ObjectId;
  pageNumber: number;
  contents: IPageContent[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ✨ Interface per Album
export interface IAlbum {
  name: string;
  coverImage: string; // URL o base64 dell'immagine di copertina
  totalPages: number; // Numero totale di pagine
  createdAt?: Date;
  updatedAt?: Date;
}

// API Types (con _id come string per il frontend)
export interface UserResponse extends IUser {
  _id: string;
}

export interface EntryResponse extends IEntry {
  _id: string;
}

export interface TodoResponse extends ITodo {
  _id: string;
}

// ✨ CORRETTO: Response type per Album Page (separato dall'interface backend)
export interface AlbumPageResponse {
  _id: string;
  albumId: string; // ← STRING per il frontend, non ObjectId
  pageNumber: number;
  contents: IPageContent[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AlbumResponse extends IAlbum {
  _id: string;
}

export interface LoginRequest {
  name: 'Ilaria' | 'Lorenzo';
}

export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}