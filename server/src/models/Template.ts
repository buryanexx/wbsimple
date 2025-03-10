import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  templateId: number;
  title: string;
  description: string;
  category: string;
  downloadUrl: string;
  previewUrl?: string;
  isPremium: boolean;
  popularity: number;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>({
  templateId: {
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
  category: {
    type: String,
    required: true
  },
  downloadUrl: {
    type: String,
    required: true
  },
  previewUrl: {
    type: String
  },
  isPremium: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model<ITemplate>('Template', TemplateSchema); 