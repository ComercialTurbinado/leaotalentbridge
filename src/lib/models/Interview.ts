import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
  candidateId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  scheduledDate: Date;
  duration: number; // em minutos
  type: 'presential' | 'online' | 'phone';
  status: 'pending_approval' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rejected';
  location?: string;
  meetingUrl?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  interviewerPhone?: string;
  notes?: string;
  
  // Sistema de moderação do admin
  adminStatus: 'pending' | 'approved' | 'rejected';
  adminComments?: string;
  adminApprovedBy?: mongoose.Types.ObjectId;
  adminApprovedAt?: Date;
  
  // Confirmação do candidato
  candidateResponse?: 'pending' | 'accepted' | 'rejected';
  candidateResponseAt?: Date;
  candidateComments?: string;
  
  // Feedback da empresa
  companyFeedback?: {
    technical: number;
    communication: number;
    experience: number;
    overall: number;
    comments?: string;
    submittedAt?: Date;
    submittedBy?: mongoose.Types.ObjectId;
  };
  
  // Feedback do candidato
  candidateFeedback?: {
    rating: number;
    comments?: string;
    submittedAt?: Date;
  };
  
  // Moderação do feedback
  feedbackStatus: 'pending' | 'approved' | 'rejected';
  feedbackApprovedBy?: mongoose.Types.ObjectId;
  feedbackApprovedAt?: Date;
  feedbackAdminComments?: string;
  
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>({
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job'
  },
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application'
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
    enum: ['pending_approval', 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rejected'],
    default: 'pending_approval'
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
  
  // Sistema de moderação do admin
  adminStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminComments: {
    type: String,
    trim: true
  },
  adminApprovedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  adminApprovedAt: {
    type: Date
  },
  
  // Confirmação do candidato
  candidateResponse: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  candidateResponseAt: {
    type: Date
  },
  candidateComments: {
    type: String,
    trim: true
  },
  
  // Feedback da empresa
  companyFeedback: {
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
    },
    submittedAt: {
      type: Date
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Feedback do candidato
  candidateFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: {
      type: String,
      trim: true
    },
    submittedAt: {
      type: Date
    }
  },
  
  // Moderação do feedback
  feedbackStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  feedbackApprovedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  feedbackApprovedAt: {
    type: Date
  },
  feedbackAdminComments: {
    type: String,
    trim: true
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
