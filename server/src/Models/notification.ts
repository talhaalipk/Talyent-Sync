import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'message'
  | 'job_posted'
  | 'proposal_received'
  | 'refund_amonunt_by_Admin'
  | 'proposal_status_change'
  | 'proposal_accepted'
  | 'job_completed'
  | 'payment_received'
  | 'rating_received'
  | 'rating_received';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  relatedId?: mongoose.Types.ObjectId; // For referencing related documents
  fromUserId?: mongoose.Types.ObjectId; // Who triggered the notification
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'message',
        'job_posted',
        'proposal_received',
        'proposal_accepted',
        'refund_amonunt_by_Admin',
        'proposal_status_change',
        'job_completed',
        'payment_received',
        'rating_received',
        'rating_received',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
    },
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Index for efficient queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>(
  'Notification',
  NotificationSchema
);
