import mongoose, { Schema, Document, Types } from 'mongoose';

// ---------------- Interface ----------------
export interface IHourtract {
  title: string;
  description: string;
  hoursWork: number;
  status: 'awaiting_approval' | 'reject' | 'approved';
  completedAt?: Date;
  approvedAt?: Date;
}

export interface IContract extends Document {
  jobId: Types.ObjectId;
  clientId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  proposalId?: Types.ObjectId;
  type: 'fixed' | 'hourly';
  totalAmount?: number;
  hourlyRate?: number;
  Hourtract?: IHourtract[];
  status:
    | 'awaiting_approval'
    | 'active'
    | 'completed'
    | 'disputed'
    | 'admin_approved';
  escrowBalance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ---------------- Schema ----------------
const ContractSchema = new Schema<IContract>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposalId: {
      type: Schema.Types.ObjectId,
      ref: 'Proposal',
    },
    type: {
      type: String,
      enum: ['fixed', 'hourly'],
      required: true,
    },
    totalAmount: {
      type: Number,
    },
    hourlyRate: {
      type: Number,
    },
    Hourtract: [
      {
        title: { type: String },
        description: { type: String },
        hoursWork: { type: Number },
        status: {
          type: String,
          enum: ['awaiting_approval', 'reject', 'approved'],
          default: 'awaiting_approval',
        },
        completedAt: { type: Date },
        approvedAt: { type: Date },
      },
    ],
    status: {
      type: String,
      enum: [
        'awaiting_approval',
        'active',
        'completed',
        'disputed',
        'admin_approved',
      ],
      default: 'active',
    },
    escrowBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ---------------- Model ----------------
export const Contract = mongoose.model<IContract>('Contract', ContractSchema);
