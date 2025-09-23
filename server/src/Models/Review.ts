// src/Models/Review.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  contractId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  reviewerId: Schema.Types.ObjectId; // Who gave the review
  revieweeId: Schema.Types.ObjectId; // Who received the review
  reviewerRole: 'client' | 'freelancer'; // Role of the person giving review
  revieweeRole: 'client' | 'freelancer'; // Role of the person receiving review
  rating: number; // 1-5 stars
  comment: string;
  reviewType: 'client_to_freelancer' | 'freelancer_to_client';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    revieweeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewerRole: {
      type: String,
      enum: ['client', 'freelancer'],
      required: true,
    },
    revieweeRole: {
      type: String,
      enum: ['client', 'freelancer'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 1000,
    },
    reviewType: {
      type: String,
      enum: ['client_to_freelancer', 'freelancer_to_client'],
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
ReviewSchema.index({ contractId: 1 });
ReviewSchema.index({ jobId: 1 });
ReviewSchema.index({ reviewerId: 1 });
ReviewSchema.index({ revieweeId: 1 });
ReviewSchema.index({ reviewType: 1 });

// Prevent duplicate reviews for same contract from same reviewer
ReviewSchema.index({ contractId: 1, reviewerId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
