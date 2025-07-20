import mongoose, { Schema, Document, Types } from 'mongoose';
import { IAlbumPage, IPageContent } from '../types';

export interface IAlbumPageDocument extends Document<Types.ObjectId>, IAlbumPage {
  _id: Types.ObjectId;
}

const pageContentSchema: Schema<IPageContent> = new Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'spotify', 'sticker'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },

  size: {
    width: { type: Number, default: 150 },
    height: { type: Number, default: 150 }
  },
  rotation: {
    type: Number,
    default: 0
  },
  zIndex: {
    type: Number,
    default: 1
  },
  fontSize: {
    type: Number,
    default: undefined
  },
  spotifyData: {
    trackId: { type: String },
    trackName: { type: String },
    artistName: { type: String },
    albumName: { type: String },
    imageUrl: { type: String },
    previewUrl: { type: String }
  },
  stickerData: {
    giphyId: { type: String },
    title: { type: String },
    originalUrl: { type: String },
    smallUrl: { type: String }
  }
}, { _id: false });

const albumPageSchema: Schema<IAlbumPageDocument> = new Schema({
  albumId: {
    type: Schema.Types.ObjectId,
    ref: 'Album',
    required: true
  },
  pageNumber: {
    type: Number,
    required: true,
    min: 1
  },
  contents: [pageContentSchema]
}, {
  timestamps: true
});

albumPageSchema.index({ albumId: 1, pageNumber: 1 }, { unique: true });

export default mongoose.model<IAlbumPageDocument>('AlbumPage', albumPageSchema);