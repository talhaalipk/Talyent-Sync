import mongoose, { Document, Schema } from 'mongoose';

export interface IProposal extends Document {
  jobId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  receiverId: Schema.Types.ObjectId;
  proposalDesc: string;
  portfolio: {
    title: string;
    link: string;
  }[];
  document?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'shortlisted';
  bidAmount?: number;
  estimatedDelivery?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProposalSchema = new Schema<IProposal>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    proposalDesc: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10000,
    },
    portfolio: [
      {
        title: { type: String, required: true, maxlength: 100 },
        link: {
          type: String,
          required: true,
        },
      },
    ],
    document: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'shortlisted'],
      default: 'pending',
    },
    bidAmount: { type: Number, min: 0 },
    estimatedDelivery: { type: String, maxlength: 100 },
  },
  { timestamps: true }
);

// ✅ Indexes should be defined like this:
ProposalSchema.index({ jobId: 1 });
ProposalSchema.index({ senderId: 1 });
ProposalSchema.index({ receiverId: 1 });
ProposalSchema.index({ status: 1 });

// ✅ Prevent duplicate proposals from same freelancer to same job
ProposalSchema.index({ jobId: 1, senderId: 1 }, { unique: true });

export const Proposal = mongoose.model<IProposal>('Proposal', ProposalSchema);
