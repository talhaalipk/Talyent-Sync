import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  availableBalance: number; // withdrawable
  pendingBalance: number;
  totalEarning?: number; // from Freelancer
  totalWithdraw?: number; // from client
  ledger: {
    type:
      | 'escrow_funded'
      | 'escrow_released'
      | 'withdraw'
      | 'refund'
      | 'Deposit'
      | 'fee';
    amount: number;
    contractId?: mongoose.Types.ObjectId;
    note?: string;
    stripeSessionId?: string; // <-- add
    paymentIntentId?: string; // <-- optional
    createdAt: Date;
  }[];
  createdAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    availableBalance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    totalEarning: { type: Number, default: 0 },
    totalWithdraw: { type: Number, default: 0 },
    ledger: [
      {
        type: { type: String, required: true },
        amount: { type: Number, required: true },
        contractId: { type: Schema.Types.ObjectId, ref: 'Contract' },
        note: String,
        stripeSessionId: { type: String }, // <-- add
        paymentIntentId: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
