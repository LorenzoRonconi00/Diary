import mongoose, { Schema, Document, Types } from 'mongoose';
import { IAlbum } from '../types';

export interface IAlbumDocument extends Document<Types.ObjectId>, IAlbum {
  _id: Types.ObjectId;
}

const albumSchema: Schema<IAlbumDocument> = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  coverImage: {
    type: String,
    required: true
  },
  totalPages: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<IAlbumDocument>('Album', albumSchema);