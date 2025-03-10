import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  telegramId: number;
  startDate: Date;
  endDate: Date;
  paymentId: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  telegramId: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  autoRenew: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema); 