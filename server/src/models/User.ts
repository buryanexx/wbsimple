import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  email?: string;
  isSubscribed: boolean;
  subscriptionExpiry?: Date;
  registeredAt: Date;
  lastLoginAt: Date;
  progress: {
    completedLessons: number[];
    completedModules: number[];
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  telegramId: {
    type: Number,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String
  },
  username: {
    type: String
  },
  photoUrl: {
    type: String
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  subscriptionExpiry: {
    type: Date
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    completedLessons: [Number],
    completedModules: [Number]
  }
});

// Метод для сравнения паролей (если в будущем добавим аутентификацию по паролю)
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export default mongoose.model<IUser>('User', UserSchema); 