// Frontend types (separati dal backend)
export interface User {
  id: string;
  name: 'Ilaria' | 'Lorenzo';
  avatar: string;
}

export interface Attachment {
  type: 'image' | 'sticker' | 'emoji';
  content: string;
  url?: string;
}

export interface Entry {
  _id: string;
  author: 'Ilaria' | 'Lorenzo';
  text: string;
  attachments?: Attachment[];
  date?: Date;
  edited?: boolean;
  editedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Todo {
  _id: string;
  author: 'Ilaria' | 'Lorenzo';
  text: string;
  completed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ✨ NUOVO: Interface per Album
export interface Album {
  _id: string;
  name: string;
  coverImage: string;
  totalPages: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ✨ NUOVO: Interface per Album Page Content (per uso futuro)
export interface PageContent {
  type: 'text' | 'image' | 'spotify' | 'sticker';
  content: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
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

export interface PositionedElement {
  id: string;
  type: 'text' | 'image' | 'spotify' | 'sticker';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
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

// ✨ NUOVO: Interface per Album Page (per uso futuro)
export interface AlbumPage {
  _id: string;
  albumId: string;
  pageNumber: number;
  contents: PageContent[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginResponse {
  success: boolean;
  user: User;
}

export interface CreateEntryRequest {
  author: 'Ilaria' | 'Lorenzo';
  text: string;
  attachments?: Attachment[];
}

export interface CreateTodoRequest {
  author: 'Ilaria' | 'Lorenzo';
  text: string;
}

// ✨ NUOVO: Request type per Album
export interface CreateAlbumRequest {
  name: string;
  coverImage: string;
}

export type RootStackParamList = {
  Login: undefined;
  Home: { user: User };
  Diary: { user: User };
  Editor: { user: User; date?: string };
  AlbumDetail: { user: User; album: Album };
};