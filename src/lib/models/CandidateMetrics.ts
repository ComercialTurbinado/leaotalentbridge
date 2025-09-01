import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidateMetrics extends Document {
  userId: mongoose.Types.ObjectId;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Date;
  
  // Métricas de candidaturas
  applications: {
    total: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
    accepted: number;
  };
  
  // Métricas de visualizações
  profileViews: {
    total: number;
    byCompanies: number;
    byRecruiters: number;
  };
  
  // Métricas de documentos
  documents: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    completionRate: number;
  };
  
  // Métricas de entrevistas
  interviews: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    successRate: number;
  };
  
  // Métricas de engajamento
  engagement: {
    loginCount: number;
    profileUpdates: number;
    documentUploads: number;
    jobSearches: number;
  };
  
  // Score geral
  overallScore: number; // 0-100
  
  // Rankings
  ranking: {
    percentile: number; // 0-100
    category: 'top' | 'above_average' | 'average' | 'below_average';
  };
  
  // Tendências
  trends: {
    applicationsGrowth: number; // % de crescimento
    profileViewsGrowth: number;
    interviewSuccessGrowth: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const CandidateMetricsSchema = new Schema<ICandidateMetrics>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  applications: {
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    reviewed: { type: Number, default: 0 },
    shortlisted: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    accepted: { type: Number, default: 0 }
  },
  profileViews: {
    total: { type: Number, default: 0 },
    byCompanies: { type: Number, default: 0 },
    byRecruiters: { type: Number, default: 0 }
  },
  documents: {
    total: { type: Number, default: 0 },
    verified: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },
  interviews: {
    total: { type: Number, default: 0 },
    scheduled: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }
  },
  engagement: {
    loginCount: { type: Number, default: 0 },
    profileUpdates: { type: Number, default: 0 },
    documentUploads: { type: Number, default: 0 },
    jobSearches: { type: Number, default: 0 }
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  ranking: {
    percentile: { type: Number, min: 0, max: 100, default: 50 },
    category: {
      type: String,
      enum: ['top', 'above_average', 'average', 'below_average'],
      default: 'average'
    }
  },
  trends: {
    applicationsGrowth: { type: Number, default: 0 },
    profileViewsGrowth: { type: Number, default: 0 },
    interviewSuccessGrowth: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para performance
CandidateMetricsSchema.index({ userId: 1, period: 1, date: -1 });
CandidateMetricsSchema.index({ userId: 1, date: -1 });
CandidateMetricsSchema.index({ period: 1, date: -1 });

// Middleware para atualizar updatedAt
CandidateMetricsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.CandidateMetrics || mongoose.model<ICandidateMetrics>('CandidateMetrics', CandidateMetricsSchema);
