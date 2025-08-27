import mongoose, { Document, Schema } from 'mongoose';

export interface IJobSalary {
  min: number;
  max: number;
  currency: 'AED' | 'USD' | 'EUR' | 'BRL';
  isNegotiable: boolean;
  paymentFrequency: 'monthly' | 'annual' | 'hourly' | 'project';
  benefits?: string[];
}

export interface IJobLocation {
  city: string;
  state: string;
  country: string;
  isRemote: boolean;
  remoteOptions: 'fully_remote' | 'hybrid' | 'on_site';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface IJobRequirements {
  education: {
    level: 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'none';
    field?: string;
    required: boolean;
  };
  experience: {
    minYears: number;
    maxYears?: number;
    level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
    required: boolean;
  };
  skills: {
    technical: string[];
    soft: string[];
    languages: {
      language: string;
      level: 'basic' | 'intermediate' | 'advanced' | 'fluent' | 'native';
      required: boolean;
    }[];
    certifications?: string[];
  };
  other?: string[];
}

export interface IJobMetrics {
  views: number;
  applications: number;
  qualified: number;
  interviewed: number;
  hired: number;
  avgResponseTime?: number; // em horas
  avgProcessTime?: number; // em dias
}

export interface IJob extends Document {
  companyId: mongoose.Types.ObjectId;
  
  // Informações básicas
  title: string;
  description: string;
  summary: string;
  department?: string;
  
  // Localização e formato
  location: IJobLocation;
  workType: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship';
  workSchedule: 'standard' | 'flexible' | 'shift' | 'weekend';
  
  // Remuneração
  salary: IJobSalary;
  
  // Requisitos
  requirements: IJobRequirements;
  
  // Status e datas
  status: 'draft' | 'active' | 'paused' | 'closed' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Datas importantes
  publishedAt?: Date;
  expiresAt: Date;
  applicationDeadline?: Date;
  startDate?: Date;
  
  // Configurações
  maxApplications?: number;
  autoScreening: boolean;
  questionsRequired: boolean;
  customQuestions?: {
    question: string;
    type: 'text' | 'multiple_choice' | 'boolean' | 'file';
    options?: string[];
    required: boolean;
  }[];
  
  // Métricas e rastreamento
  metrics: IJobMetrics;
  
  // SEO e categorização
  tags: string[];
  category: string;
  slug: string;
  
  // Metadados
  createdBy: mongoose.Types.ObjectId; // User ID
  lastModifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSalarySchema = new Schema({
  min: {
    type: Number,
    required: true,
    min: 0
  },
  max: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['AED', 'USD', 'EUR', 'BRL'],
    default: 'AED'
  },
  isNegotiable: {
    type: Boolean,
    default: false
  },
  paymentFrequency: {
    type: String,
    enum: ['monthly', 'annual', 'hourly', 'project'],
    default: 'monthly'
  },
  benefits: [{
    type: String
  }]
});

const JobLocationSchema = new Schema({
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'UAE'
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  remoteOptions: {
    type: String,
    enum: ['fully_remote', 'hybrid', 'on_site'],
    default: 'on_site'
  },
  coordinates: {
    lat: Number,
    lng: Number
  }
});

const JobRequirementsSchema = new Schema({
  education: {
    level: {
      type: String,
      enum: ['high_school', 'associate', 'bachelor', 'master', 'phd', 'none'],
      default: 'bachelor'
    },
    field: String,
    required: {
      type: Boolean,
      default: false
    }
  },
  experience: {
    minYears: {
      type: Number,
      default: 0,
      min: 0
    },
    maxYears: Number,
    level: {
      type: String,
      enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
      default: 'mid'
    },
    required: {
      type: Boolean,
      default: true
    }
  },
  skills: {
    technical: [{
      type: String
    }],
    soft: [{
      type: String
    }],
    languages: [{
      language: String,
      level: {
        type: String,
        enum: ['basic', 'intermediate', 'advanced', 'fluent', 'native']
      },
      required: Boolean
    }],
    certifications: [{
      type: String
    }]
  },
  other: [{
    type: String
  }]
});

const JobMetricsSchema = new Schema({
  views: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  qualified: {
    type: Number,
    default: 0
  },
  interviewed: {
    type: Number,
    default: 0
  },
  hired: {
    type: Number,
    default: 0
  },
  avgResponseTime: Number,
  avgProcessTime: Number
});

const JobSchema = new Schema<IJob>({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 10000
  },
  summary: {
    type: String,
    required: true,
    maxlength: 500
  },
  department: {
    type: String,
    trim: true
  },
  
  location: JobLocationSchema,
  workType: {
    type: String,
    required: true,
    enum: ['full_time', 'part_time', 'contract', 'freelance', 'internship']
  },
  workSchedule: {
    type: String,
    enum: ['standard', 'flexible', 'shift', 'weekend'],
    default: 'standard'
  },
  
  salary: JobSalarySchema,
  
  requirements: JobRequirementsSchema,
  
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'expired'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  publishedAt: Date,
  expiresAt: {
    type: Date,
    required: true
  },
  applicationDeadline: Date,
  startDate: Date,
  
  maxApplications: {
    type: Number,
    min: 1
  },
  autoScreening: {
    type: Boolean,
    default: false
  },
  questionsRequired: {
    type: Boolean,
    default: false
  },
  customQuestions: [{
    question: String,
    type: {
      type: String,
      enum: ['text', 'multiple_choice', 'boolean', 'file']
    },
    options: [String],
    required: Boolean
  }],
  
  metrics: JobMetricsSchema,
  
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true,
    enum: [
      'technology', 'finance', 'healthcare', 'education', 'marketing',
      'sales', 'design', 'operations', 'hr', 'legal', 'customer_service',
      'manufacturing', 'construction', 'hospitality', 'retail', 'other'
    ]
  },
  slug: {
    type: String,
    index: true
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índices para performance e busca
JobSchema.index({ slug: 1 }, { unique: true });
JobSchema.index({ companyId: 1, status: 1 });
JobSchema.index({ status: 1, publishedAt: -1 });
JobSchema.index({ category: 1, 'location.city': 1 });
JobSchema.index({ 'location.country': 1, 'location.isRemote': 1 });
JobSchema.index({ workType: 1, 'requirements.experience.level': 1 });
JobSchema.index({ tags: 1 });
JobSchema.index({ 
  title: 'text', 
  description: 'text', 
  summary: 'text',
  tags: 'text'
}); // Busca textual

// Middleware para gerar slug
JobSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + (this._id ? this._id.toString().slice(-6) : '');
  }
  next();
});

// Middleware para definir publishedAt quando status muda para active
JobSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Métodos para atualizar métricas
JobSchema.methods.incrementView = function() {
  this.metrics.views += 1;
  return this.save();
};

JobSchema.methods.updateMetrics = async function() {
  const Application = mongoose.model('Application');
  
  const applications = await Application.countDocuments({ jobId: this._id });
  const qualified = await Application.countDocuments({ 
    jobId: this._id, 
    status: { $in: ['qualified', 'interviewed', 'hired'] }
  });
  const interviewed = await Application.countDocuments({ 
    jobId: this._id, 
    status: { $in: ['interviewed', 'hired'] }
  });
  const hired = await Application.countDocuments({ 
    jobId: this._id, 
    status: 'hired'
  });
  
  this.metrics.applications = applications;
  this.metrics.qualified = qualified;
  this.metrics.interviewed = interviewed;
  this.metrics.hired = hired;
  
  return this.save();
};

// Índice TTL para expiração automática (sem expireAfterSeconds para manter controle manual)
JobSchema.index({ expiresAt: 1 });

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema); 