import mongoose, { Schema, Document, Types } from 'mongoose';
import { IAlbumPage, IPageContent } from '../types';

export interface IAlbumPageDocument extends Document<Types.ObjectId>, IAlbumPage {
  _id: Types.ObjectId;
}

const pageContentSchema: Schema<IPageContent> = new Schema({
  type: {
    type: String,
    enum: ['text', 'image'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
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

// Index per prestazioni migliori
albumPageSchema.index({ albumId: 1, pageNumber: 1 }, { unique: true });

export default mongoose.model<IAlbumPageDocument>('AlbumPage', albumPageSchema);