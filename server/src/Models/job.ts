import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  clientId: Schema.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  jobType: 'fixed' | 'hourly';
  budget: {
    jobType: 'fixed' | 'hourly';
    amount?: number;
    hourlyRate?: {
      min: number;
      max: number;
    };
    currency: string;
  };
  duration: {
    estimate: string;
    startDate?: Date;
    endDate?: Date;
  };
  skillsRequired: string[];
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  attachments: string[];
  status: 'published' | 'in_progress' | 'completed' | 'cancelled';
  visibility: 'public' | 'private';
  invitedFreelancers: Schema.Types.ObjectId[];
  proposalCount: number;
  interviewCount: number;
  hiredCount: number;
  publishedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    jobType: { type: String, enum: ['fixed', 'hourly'], required: true },
    budget: {
      jobType: { type: String, enum: ['fixed', 'hourly'], required: true },
      amount: { type: Number },
      hourlyRate: {
        min: { type: Number },
        max: { type: Number },
      },
      currency: { type: String, default: 'USD' },
    },
    duration: {
      estimate: { type: String, required: true },
      startDate: Date,
      endDate: Date,
    },
    skillsRequired: [{ type: String, required: true }],
    experienceLevel: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      required: true,
    },
    attachments: [String],
    status: {
      type: String,
      enum: ['published', 'in_progress', 'completed', 'cancelled'],
      default: 'published',
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    invitedFreelancers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    proposalCount: { type: Number, default: 0 },
    interviewCount: { type: Number, default: 0 },
    hiredCount: { type: Number, default: 0 },
    publishedAt: Date,
    closedAt: Date,
  },
  { timestamps: true }
);

export const Job = mongoose.model<IJob>('Job', JobSchema);
