import mongoose, { Schema, Document, Types } from 'mongoose';
import { ITodo } from '../types';

export interface ITodoDocument extends Document<Types.ObjectId>, ITodo {
  _id: Types.ObjectId;
}

const todoSchema: Schema<ITodoDocument> = new Schema({
  author: {
    type: String,
    required: true,
    enum: ['Ilaria', 'Lorenzo']
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model<ITodoDocument>('Todo', todoSchema);