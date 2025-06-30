import mongoose, { Document, Schema } from 'mongoose';

export interface IApplicationAnswer {
  questionId: string;
  question: string;
  answer: string;
  type: 'text' | 'multiple_choice' | 'boolean' | 'file';
  score?: number; // Para avaliação automática
}

export interface IApplicationScreening {
  score: number; // 0-100
  criteria: {
    education: number;
    experience: number;
    skills: number;
    location: number;
    salary: number;
    overall: number;
  };
  passedScreening: boolean;
  notes?: string;
  automatedDate?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedDate?: Date;
}

export interface IApplicationInterview {
  type: 'phone' | 'video' | 'in_person' | 'technical';
  scheduledDate: Date;
  duration: number; // em minutos
  location?: string;
  meetingLink?: string;
  interviewer: {
    name: string;
    email: string;
    position: string;
  };
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  feedback?: {
    technical: number; // 1-10
    communication: number; // 1-10
    cultural: number; // 1-10
    overall: number; // 1-10
    notes: string;
    recommendation: 'hire' | 'no_hire' | 'maybe';
  };
  recordingUrl?: string;
  notes?: string;
}

export interface IApplicationDocument {
  type: 'resume' | 'cover_letter' | 'portfolio' | 'certificate' | 'other';
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  isRequired: boolean;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
}

export interface IApplicationTimeline {
  action: 'applied' | 'viewed' | 'screened' | 'interview_scheduled' | 
          'interviewed' | 'offer_sent' | 'hired' | 'rejected' | 'withdrawn';
  date: Date;
  by?: mongoose.Types.ObjectId; // User who performed the action
  details?: string;
  metadata?: Record<string, any>;
}

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  
  // Status principal
  status: 'applied' | 'screening' | 'screened' | 'qualified' | 'interviewing' | 
          'interviewed' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
  
  // Dados da candidatura
  appliedAt: Date;
  source: 'direct' | 'referral' | 'social' | 'job_board' | 'recruiter';
  coverLetter?: string;
  salaryExpectation?: {
    min: number;
    max: number;
    currency: string;
    isNegotiable: boolean;
  };
  availabilityDate?: Date;
  
  // Respostas às perguntas personalizadas
  customAnswers?: IApplicationAnswer[];
  
  // Documentos anexados
  documents: IApplicationDocument[];
  
  // Triagem automática
  screening?: IApplicationScreening;
  
  // Entrevistas
  interviews: IApplicationInterview[];
  
  // Comunicação
  lastContactDate?: Date;
  communicationPreference: 'email' | 'phone' | 'whatsapp';
  
  // Avaliações e notas
  overallRating?: number; // 1-10
  notes: {
    recruiter?: string;
    hiring_manager?: string;
    hr?: string;
    internal?: string;
  };
  
  // Tags e categorização
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  
  // Timeline de eventos
  timeline: IApplicationTimeline[];
  
  // Referências
  referredBy?: mongoose.Types.ObjectId;
  referralBonus?: number;
  
  // Metadados
  viewedBy: {
    userId: mongoose.Types.ObjectId;
    viewedAt: Date;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationAnswerSchema = new Schema({
  questionId: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'multiple_choice', 'boolean', 'file'],
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  }
});

const ApplicationScreeningSchema = new Schema({
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  criteria: {
    education: {
      type: Number,
      min: 0,
      max: 100
    },
    experience: {
      type: Number,
      min: 0,
      max: 100
    },
    skills: {
      type: Number,
      min: 0,
      max: 100
    },
    location: {
      type: Number,
      min: 0,
      max: 100
    },
    salary: {
      type: Number,
      min: 0,
      max: 100
    },
    overall: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  passedScreening: {
    type: Boolean,
    required: true
  },
  notes: String,
  automatedDate: Date,
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedDate: Date
});

const ApplicationInterviewSchema = new Schema({
  type: {
    type: String,
    enum: ['phone', 'video', 'in_person', 'technical'],
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15
  },
  location: String,
  meetingLink: String,
  interviewer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  feedback: {
    technical: {
      type: Number,
      min: 1,
      max: 10
    },
    communication: {
      type: Number,
      min: 1,
      max: 10
    },
    cultural: {
      type: Number,
      min: 1,
      max: 10
    },
    overall: {
      type: Number,
      min: 1,
      max: 10
    },
    notes: String,
    recommendation: {
      type: String,
      enum: ['hire', 'no_hire', 'maybe']
    }
  },
  recordingUrl: String,
  notes: String
});

const ApplicationDocumentSchema = new Schema({
  type: {
    type: String,
    enum: ['resume', 'cover_letter', 'portfolio', 'certificate', 'other'],
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  notes: String
});

const ApplicationTimelineSchema = new Schema({
  action: {
    type: String,
    enum: ['applied', 'viewed', 'screened', 'interview_scheduled', 
           'interviewed', 'offer_sent', 'hired', 'rejected', 'withdrawn'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  details: String,
  metadata: Schema.Types.Mixed
});

const ApplicationSchema = new Schema<IApplication>({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
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
  
  status: {
    type: String,
    enum: ['applied', 'screening', 'screened', 'qualified', 'interviewing', 
           'interviewed', 'offer', 'hired', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  
  appliedAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['direct', 'referral', 'social', 'job_board', 'recruiter'],
    default: 'direct'
  },
  coverLetter: {
    type: String,
    maxlength: 5000
  },
  salaryExpectation: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'AED'
    },
    isNegotiable: {
      type: Boolean,
      default: true
    }
  },
  availabilityDate: Date,
  
  customAnswers: [ApplicationAnswerSchema],
  documents: [ApplicationDocumentSchema],
  screening: ApplicationScreeningSchema,
  interviews: [ApplicationInterviewSchema],
  
  lastContactDate: Date,
  communicationPreference: {
    type: String,
    enum: ['email', 'phone', 'whatsapp'],
    default: 'email'
  },
  
  overallRating: {
    type: Number,
    min: 1,
    max: 10
  },
  notes: {
    recruiter: String,
    hiring_manager: String,
    hr: String,
    internal: String
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  timeline: [ApplicationTimelineSchema],
  
  referredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  referralBonus: {
    type: Number,
    min: 0
  },
  
  viewedBy: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Índices compostos para performance
ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ candidateId: 1, status: 1 });
ApplicationSchema.index({ companyId: 1, appliedAt: -1 });
ApplicationSchema.index({ status: 1, appliedAt: -1 });
ApplicationSchema.index({ priority: 1, status: 1 });
ApplicationSchema.index({ 'screening.score': -1 });
ApplicationSchema.index({ 'interviews.scheduledDate': 1 });

// Índice único para prevenir candidaturas duplicadas
ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

// Middleware para adicionar evento na timeline
ApplicationSchema.pre('save', function(next) {
  // Adiciona evento quando status muda
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      action: this.status as any,
      date: new Date(),
      details: `Status alterado para ${this.status}`
    });
  }
  
  // Adiciona evento inicial para nova candidatura
  if (this.isNew) {
    this.timeline.push({
      action: 'applied',
      date: new Date(),
      details: 'Candidatura enviada'
    });
  }
  
  next();
});

// Método para adicionar visualização
ApplicationSchema.methods.addView = function(userId: mongoose.Types.ObjectId) {
  // Evita duplicar visualizações do mesmo usuário no mesmo dia
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingView = this.viewedBy.find((view: any) => 
    view.userId.equals(userId) && 
    view.viewedAt >= today
  );
  
  if (!existingView) {
    this.viewedBy.push({
      userId,
      viewedAt: new Date()
    });
  }
  
  return this.save();
};

// Método para agendar entrevista
ApplicationSchema.methods.scheduleInterview = function(interviewData: Partial<IApplicationInterview>) {
  this.interviews.push(interviewData);
  this.status = 'interviewing';
  
  this.timeline.push({
    action: 'interview_scheduled',
    date: new Date(),
    details: `Entrevista agendada para ${interviewData.scheduledDate}`,
    metadata: { interviewType: interviewData.type }
  });
  
  return this.save();
};

// Método para atualizar screening
ApplicationSchema.methods.updateScreening = function(screeningData: Partial<IApplicationScreening>) {
  this.screening = { ...this.screening, ...screeningData } as any;
  this.status = screeningData.passedScreening ? 'qualified' : 'screened';
  
  this.timeline.push({
    action: 'screened',
    date: new Date(),
    details: `Triagem ${screeningData.passedScreening ? 'aprovada' : 'reprovada'} - Score: ${screeningData.score}`,
    metadata: { score: screeningData.score }
  });
  
  return this.save();
};

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema); 