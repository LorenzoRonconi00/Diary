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

export interface LoginResponse {
  success: boolean;
  user: User;
}

export interface CreateEntryRequest {
  author: 'Ilaria' | 'Lorenzo';
  text: string;
  attachments?: Attachment[];
}

export type RootStackParamList = {
  Login: undefined;
  Home: { user: User };
  Diary: { user: User };
  Editor: { user: User; date?: string };
};