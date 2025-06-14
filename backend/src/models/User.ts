import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from '../types';

export interface IUserDocument extends Document<Types.ObjectId>, IUser {
  _id: Types.ObjectId;
}

const userSchema: Schema<IUserDocument> = new Schema({
  name: {
    type: String,
    required: true,
    enum: ['Ilaria', 'Lorenzo']
  },
  avatar: {
    type: String,
    default: ''
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<IUserDocument>('User', userSchema);