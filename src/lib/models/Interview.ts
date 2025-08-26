import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
  candidateId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  scheduledDate: Date;
  duration: number; // em minutos
  type: 'presential' | 'online' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  location?: string;
  meetingUrl?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  interviewerPhone?: string;
  notes?: string;
  feedback?: {
    technical: number;
    communication: number;
    experience: number;
    overall: number;
    comments?: string;
  };
  candidateFeedback?: {
    rating: number;
    comments?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>({
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
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  type: {
    type: String,
    enum: ['presential', 'online', 'phone'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  location: {
    type: String,
    trim: true
  },
  meetingUrl: {
    type: String,
    trim: true
  },
  interviewerName: {
    type: String,
    trim: true
  },
  interviewerEmail: {
    type: String,
    trim: true
  },
  interviewerPhone: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  feedback: {
    technical: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    experience: {
      type: Number,
      min: 1,
      max: 5
    },
    overall: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: {
      type: String,
      trim: true
    }
  },
  candidateFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: {
      type: String,
      trim: true
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índices para otimização
InterviewSchema.index({ candidateId: 1, scheduledDate: -1 });
InterviewSchema.index({ companyId: 1, scheduledDate: -1 });
InterviewSchema.index({ status: 1 });
InterviewSchema.index({ scheduledDate: 1 });

export default mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);
