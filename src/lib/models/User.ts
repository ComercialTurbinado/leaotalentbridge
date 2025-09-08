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
  
  // Campos específicos para candidatos
  birthDate?: string;
  nationality?: string;
  address?: {
    city: string;
    state: string;
    country?: string;
  };
  professionalInfo?: {
    summary: string;
    experience: Array<{
      company: string;
      position: string;
      location: string;
      startDate: string;
      endDate: string;
      description: string;
    }>;
  };
  education?: Array<{
    institution: string;
    degree: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills?: string[];
  languages?: Array<{
    language: string;
    level: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  socialMedia?: {
    linkedin?: string;
    github?: string;
    website?: string;
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
  
  // Push notifications subscriptions
  pushSubscriptions?: Array<{
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
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
  
  // Campos específicos para candidatos
  birthDate: String,
  nationality: String,
  address: {
    city: String,
    state: String,
    country: String
  },
  professionalInfo: {
    summary: String,
    experience: [{
      company: String,
      position: String,
      location: String,
      startDate: String,
      endDate: String,
      description: String
    }]
  },
  education: [{
    institution: String,
    degree: String,
    location: String,
    startDate: String,
    endDate: String,
    gpa: String
  }],
  skills: [String],
  languages: [{
    language: String,
    level: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    url: String
  }],
  socialMedia: {
    linkedin: String,
    github: String,
    website: String
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
  },
  
  // Push notifications subscriptions
  pushSubscriptions: [{
    endpoint: {
      type: String,
      required: true
    },
    keys: {
      p256dh: {
        type: String,
        required: true
      },
      auth: {
        type: String,
        required: true
      }
    }
  }]
}, {
  timestamps: true
});

// Índices para performance (otimizados para reduzir custos)
UserSchema.index({ email: 1, type: 1 }, { unique: true });
UserSchema.index({ type: 1, status: 1 }); // Índice composto para queries comuns
UserSchema.index({ createdAt: -1 }); // Para ordenação por data

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 