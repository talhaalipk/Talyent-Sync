// src/Models/user.ts
import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'client' | 'freelancer' | 'admin' | 'super-admin';

export interface IUser extends Document {
  name?: string;
  UserName?: string;
  email: string;
  password: string;
  role: UserRole;
  profilePic?: string;
  isActive: boolean;
  // Admin-specific fields
  adminProfile?: {
    permissions?: string[];
    department?: string;
    lastLogin?: Date;
    loginAttempts?: number;
    lockoutUntil?: Date;
  };
  clientProfile?: {
    location?: string;
    companyName?: string;
    companyDescription?: string;
    budget?: number;
    jobHistory?: mongoose.Types.ObjectId[]; // references Jobs
    clientRating?: number;
  };
  freelancerProfile?: {
    bio_desc?: string;
    location?: string;
    skills?: string[];
    hourlyRate?: number;
    portfolio?: {
      title: string;
      url: string;
      description?: string;
    }[];
    certifications?: {
      title: string;
      issuer: string;
      year?: number;
    }[];
    successRate?: number;
    ratingAvg?: number;
    ratingCount?: number;
    reviews?: {
      clientId: mongoose.Types.ObjectId;
      jobId: mongoose.Types.ObjectId;
      rating: number;
      comment?: string;
      createdAt: Date;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to generate profile pic from username
const generateProfilePic = (username: string): string => {
  if (!username) {
    return 'https://ui-avatars.com/api/?name=Admin&background=134848&color=fff&size=200';
  }
  const firstLetter = username.charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${firstLetter}&background=134848&color=fff&size=200`;
};

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    UserName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['client', 'freelancer', 'admin', 'super-admin'],
      required: true,
    },
    profilePic: {
      type: String,
      default: function (this: IUser) {
        return generateProfilePic(this.UserName || '');
      },
    },
    isActive: { type: Boolean, default: true },

    // Admin Profile
    adminProfile: {
      permissions: [{ type: String }],
      department: { type: String },
      lastLogin: { type: Date },
      loginAttempts: { type: Number, default: 0 },
      lockoutUntil: { type: Date },
    },

    clientProfile: {
      location: String,
      companyName: String,
      companyDescription: String,
      budget: Number,
      jobHistory: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
      clientRating: { type: Number, default: 0 },
    },

    freelancerProfile: {
      bio_desc: { type: String, default: '' },
      location: String,
      skills: [String],
      hourlyRate: Number,
      portfolio: [
        {
          title: String,
          url: String,
          description: String,
        },
      ],
      certifications: [
        {
          title: String,
          issuer: String,
          year: Number,
        },
      ],
      successRate: { type: Number, default: 100 },
      ratingAvg: { type: Number, default: 5 },
      ratingCount: { type: Number, default: 0 },
      reviews: [
        {
          clientId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
          rating: { type: Number, required: true, min: 1, max: 5 },
          comment: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
  },
  { timestamps: true }
);

// Pre-save middleware to set profile pic for admins
UserSchema.pre('save', function (next) {
  if (
    (this.role === 'admin' || this.role === 'super-admin') &&
    !this.profilePic
  ) {
    this.profilePic = generateProfilePic(this.UserName || '');
  }
  next();
});

export const User = mongoose.model<IUser>('User', UserSchema);
