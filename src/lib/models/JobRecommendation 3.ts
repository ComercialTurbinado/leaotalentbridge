import mongoose, { Document, Schema } from 'mongoose';

export interface IJobRecommendation extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  score: number; // 0-100, baseado no match
  reasons: string[]; // Razões para a recomendação
  skillsMatch: {
    matched: string[];
    missing: string[];
    score: number;
  };
  experienceMatch: {
    required: string;
    candidate: string;
    score: number;
  };
  locationMatch: {
    required: string;
    candidate: string;
    score: number;
  };
  salaryMatch: {
    min: number;
    max: number;
    candidate: number;
    score: number;
  };
  createdAt: Date;
  expiresAt: Date;
  viewed: boolean;
  applied: boolean;
  dismissed: boolean;
}

const JobRecommendationSchema = new Schema<IJobRecommendation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  reasons: [{
    type: String,
    trim: true
  }],
  skillsMatch: {
    matched: [String],
    missing: [String],
    score: { type: Number, min: 0, max: 100 }
  },
  experienceMatch: {
    required: String,
    candidate: String,
    score: { type: Number, min: 0, max: 100 }
  },
  locationMatch: {
    required: String,
    candidate: String,
    score: { type: Number, min: 0, max: 100 }
  },
  salaryMatch: {
    min: Number,
    max: Number,
    candidate: Number,
    score: { type: Number, min: 0, max: 100 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  viewed: {
    type: Boolean,
    default: false
  },
  applied: {
    type: Boolean,
    default: false
  },
  dismissed: {
    type: Boolean,
    default: false
  }
});

// Índices para performance
JobRecommendationSchema.index({ userId: 1, score: -1, createdAt: -1 });
JobRecommendationSchema.index({ userId: 1, applied: 1, dismissed: 1 });
JobRecommendationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

export default mongoose.models.JobRecommendation || mongoose.model<IJobRecommendation>('JobRecommendation', JobRecommendationSchema);