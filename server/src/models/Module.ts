import mongoose, { Document, Schema } from 'mongoose';

export interface IModule extends Document {
  moduleId: number;
  title: string;
  description: string;
  icon: string;
  order: number;
  isPremium: boolean;
  lessonsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>({
  moduleId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  isPremium: {
    type: Boolean,
    default: true
  },
  lessonsCount: {
    type: Number,
    required: true
  }
}, { timestamps: true });

export default mongoose.model<IModule>('Module', ModuleSchema); 