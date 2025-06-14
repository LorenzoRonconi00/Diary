import mongoose, { Schema, Document, Types } from 'mongoose';
import { IEntry, IAttachment } from '../types';

export interface IEntryDocument extends Document<Types.ObjectId>, IEntry {
  _id: Types.ObjectId;
}

const attachmentSchema: Schema<IAttachment> = new Schema({
  type: {
    type: String,
    enum: ['image', 'sticker', 'emoji'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  url: String
}, { _id: false });

const entrySchema: Schema<IEntryDocument> = new Schema({
  author: {
    type: String,
    required: true,
    enum: ['Ilaria', 'Lorenzo']
  },
  text: {
    type: String,
    required: true
  },
  attachments: [attachmentSchema],
  date: {
    type: Date,
    default: Date.now
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

export default mongoose.model<IEntryDocument>('Entry', entrySchema);