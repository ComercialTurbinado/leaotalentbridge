import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  type: 'candidato' | 'empresa' | 'admin';
  profile: {
    completed: boolean;
    avatar?: string;
    phone?: string;
    company?: string;
    position?: string;
    linkedin?: string;
    website?: string;
    experience?: string;
    documents?: {
      id: string;
      name: string;
      type: string;
      url: string;
      status: 'pending' | 'approved' | 'rejected';
      uploadedAt: Date;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['candidato', 'empresa', 'admin'],
    default: 'candidato'
  },
  profile: {
    completed: {
      type: Boolean,
      default: false
    },
    avatar: String,
    phone: String,
    company: String,
    position: String,
    linkedin: String,
    website: String,
    experience: String,
    documents: [{
      id: String,
      name: String,
      type: String,
      url: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Índices para performance
UserSchema.index({ email: 1, type: 1 }, { unique: true });
UserSchema.index({ type: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 