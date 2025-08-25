import mongoose, { Schema, Document } from 'mongoose';

export interface IJobRecommendation extends Document {
  jobId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  recommendedBy: mongoose.Types.ObjectId; // Admin que fez a indicação
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  recommendedAt: Date;
  respondedAt?: Date;
  adminNotes?: string;
  candidateNotes?: string;
  companyNotes?: string;
  matchScore?: number; // Score de compatibilidade (0-100)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobRecommendationSchema = new Schema<IJobRecommendation>({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  recommendedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
    index: true
  },
  recommendedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  candidateNotes: {
    type: String,
    maxlength: 1000
  },
  companyNotes: {
    type: String,
    maxlength: 1000
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Índices compostos para otimização de consultas
JobRecommendationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
JobRecommendationSchema.index({ companyId: 1, status: 1 });
JobRecommendationSchema.index({ candidateId: 1, status: 1 });

export default mongoose.models.JobRecommendation || mongoose.model<IJobRecommendation>('JobRecommendation', JobRecommendationSchema);
