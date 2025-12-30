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

export interface IPageContent {
  type: 'text' | 'image' | 'spotify';
  content: string;
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  rotation?: number;
  zIndex?: number;
  fontSize?: number;
  spotifyData?: {
    trackId: string;
    trackName: string;
    artistName: string;
    albumName: string;
    imageUrl: string;
    previewUrl?: string;
  };
  stickerData?: {
    giphyId: string;
    title: string;
    originalUrl: string;
    smallUrl: string;
  };
}

export interface IAlbumPage {
  albumId: Types.ObjectId;
  pageNumber: number;
  contents: IPageContent[];
  createdAt?: Date;
  updatedAt?: Date;
}


export interface IAlbum {
  name: string;
  coverImage: string;
  totalPages: number;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface UserResponse extends IUser {
  _id: string;
}

export interface EntryResponse extends IEntry {
  _id: string;
}

export interface TodoResponse extends ITodo {
  _id: string;
}


export interface AlbumPageResponse {
  _id: string;
  albumId: string;
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
