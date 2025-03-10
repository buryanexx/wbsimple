import mongoose, { Document, Schema } from 'mongoose';

interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface IMaterial {
  name: string;
  url: string;
  type: string;
}

export interface ILesson extends Document {
  lessonId: number;
  moduleId: number;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  order: number;
  materials: IMaterial[];
  quiz: IQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>({
  lessonId: {
    type: Number,
    required: true
  },
  moduleId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  materials: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'pdf'
    }
  }],
  quiz: [{
    question: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true
    },
    correctAnswer: {
      type: Number,
      required: true
    }
  }]
}, { timestamps: true });

// Составной индекс для уникальности пары moduleId и lessonId
LessonSchema.index({ moduleId: 1, lessonId: 1 }, { unique: true });

export default mongoose.model<ILesson>('Lesson', LessonSchema); 