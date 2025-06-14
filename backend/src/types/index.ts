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

// API Types (con _id come string per il frontend)
export interface UserResponse extends IUser {
  _id: string;
}

export interface EntryResponse extends IEntry {
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