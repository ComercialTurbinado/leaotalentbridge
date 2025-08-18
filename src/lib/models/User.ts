import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  type: 'candidato' | 'empresa' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
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
      reviewedBy?: string;
      reviewedAt?: Date;
      feedback?: string;
      uploadedAt: Date;
    }[];
  };
  // Controle de acesso específico
  permissions: {
    canAccessJobs: boolean;
    canApplyToJobs: boolean;
    canViewCourses: boolean;
    canAccessSimulations: boolean;
    canContactCompanies: boolean;
    releasedJobs?: mongoose.Types.ObjectId[];
  };
  // Para empresas
  companyVerified?: boolean;
  // Para candidatos
  profileVerified?: boolean;
  documentsVerified?: boolean;
  
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
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  
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
      reviewedBy: String,
      reviewedAt: Date,
      feedback: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  permissions: {
    canAccessJobs: {
      type: Boolean,
      default: false
    },
    canApplyToJobs: {
      type: Boolean,
      default: false
    },
    canViewCourses: {
      type: Boolean,
      default: true // Cursos são públicos
    },
    canAccessSimulations: {
      type: Boolean,
      default: false
    },
    canContactCompanies: {
      type: Boolean,
      default: false
    },
    releasedJobs: [{
      type: Schema.Types.ObjectId,
      ref: 'Job'
    }]
  },
  
  // Para empresas
  companyVerified: {
    type: Boolean,
    default: false
  },
  
  // Para candidatos
  profileVerified: {
    type: Boolean,
    default: false
  },
  documentsVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices para performance
UserSchema.index({ email: 1, type: 1 }, { unique: true });
UserSchema.index({ type: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ type: 1, status: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 