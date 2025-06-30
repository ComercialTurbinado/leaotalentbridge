import mongoose, { Document, Schema } from 'mongoose';

export interface IReviewCriteria {
  name: string;
  rating: number; // 1-5 ou 1-10
  weight?: number; // peso para cálculo da média
  comment?: string;
}

export interface IReview extends Document {
  // Tipo de avaliação
  type: 'company_by_candidate' | 'candidate_by_company' | 'interview_feedback' | 
        'simulation_feedback' | 'platform_review' | 'service_review';
  
  // Relacionamentos
  reviewerId: mongoose.Types.ObjectId; // Quem está avaliando
  reviewerType: 'user' | 'company';
  
  targetId: mongoose.Types.ObjectId; // O que está sendo avaliado
  targetType: 'user' | 'company' | 'job' | 'application' | 'simulation' | 'platform';
  
  // Relacionamentos específicos
  jobId?: mongoose.Types.ObjectId; // Vaga relacionada
  applicationId?: mongoose.Types.ObjectId; // Candidatura relacionada
  interviewId?: mongoose.Types.ObjectId; // Entrevista relacionada
  
  // Avaliação geral
  overallRating: number; // 1-5 ou 1-10
  
  // Critérios específicos
  criteria: IReviewCriteria[];
  
  // Comentários
  title?: string;
  comment: string;
  
  // Aspectos específicos por tipo
  aspects?: {
    // Para avaliação de empresa
    workEnvironment?: number;
    benefits?: number;
    careerGrowth?: number;
    management?: number;
    workLifeBalance?: number;
    salary?: number;
    
    // Para avaliação de candidato
    technicalSkills?: number;
    communication?: number;
    professionalism?: number;
    punctuality?: number;
    culturalFit?: number;
    
    // Para feedback de entrevista
    preparation?: number;
    responseQuality?: number;
    engagement?: number;
    
    // Para simulação
    completeness?: number;
    accuracy?: number;
    timeManagement?: number;
  };
  
  // Recomendação
  wouldRecommend?: boolean;
  recommendation?: 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend' | 'strongly_not_recommend';
  
  // Visibilidade e moderação
  isPublic: boolean;
  isAnonymous: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  
  // Moderação
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  moderationNotes?: string;
  
  // Verificação
  isVerified: boolean; // Se o review foi verificado (ex: candidato realmente se candidatou)
  verificationMethod?: 'application' | 'interview' | 'hire' | 'manual';
  
  // Metadados
  metadata?: {
    applicationDate?: Date;
    interviewDate?: Date;
    hiringDecision?: 'hired' | 'rejected';
    salaryOffered?: number;
    positionLevel?: string;
    workLocation?: string;
    [key: string]: any;
  };
  
  // Útil/Não útil
  helpful: {
    yes: number;
    no: number;
    votedBy: {
      userId: mongoose.Types.ObjectId;
      vote: 'yes' | 'no';
      votedAt: Date;
    }[];
  };
  
  // Resposta da empresa/candidato
  response?: {
    text: string;
    respondedBy: mongoose.Types.ObjectId;
    respondedAt: Date;
    isOfficial: boolean; // Se é resposta oficial da empresa
  };
  
  // Tags
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewSummary extends Document {
  // Alvo da sumarização
  targetId: mongoose.Types.ObjectId;
  targetType: 'user' | 'company' | 'job' | 'simulation' | 'platform';
  
  // Estatísticas gerais
  totalReviews: number;
  averageRating: number;
  
  // Distribuição de ratings
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  
  // Estatísticas por critério
  criteriaAverages: {
    name: string;
    average: number;
    count: number;
  }[];
  
  // Estatísticas por período
  monthlyStats: {
    month: string; // YYYY-MM
    totalReviews: number;
    averageRating: number;
  }[];
  
  // Aspectos mais comentados
  commonAspects: {
    aspect: string;
    count: number;
    averageRating: number;
  }[];
  
  // Tags mais usadas
  popularTags: {
    tag: string;
    count: number;
  }[];
  
  // Tendências
  trends: {
    period: '7d' | '30d' | '90d';
    ratingChange: number;
    reviewCountChange: number;
    direction: 'up' | 'down' | 'stable';
  }[];
  
  // Última atualização
  lastCalculatedAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewTemplate extends Document {
  name: string;
  description?: string;
  
  // Aplicabilidade
  forType: IReview['type'];
  forEntity: IReview['targetType'];
  
  // Critérios padrão
  defaultCriteria: {
    name: string;
    description?: string;
    weight: number;
    required: boolean;
    scale: {
      min: number;
      max: number;
      labels?: {
        value: number;
        label: string;
      }[];
    };
  }[];
  
  // Perguntas padrão
  questions: {
    question: string;
    type: 'text' | 'boolean' | 'scale' | 'multiple_choice';
    required: boolean;
    options?: string[];
    placeholder?: string;
  }[];
  
  // Configurações
  settings: {
    allowAnonymous: boolean;
    requireVerification: boolean;
    autoApprove: boolean;
    allowResponse: boolean;
    showToPublic: boolean;
  };
  
  // Status
  isActive: boolean;
  
  // Metadados
  createdBy: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const ReviewCriteriaSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  weight: {
    type: Number,
    default: 1,
    min: 0.1,
    max: 5
  },
  comment: String
});

const ReviewSchema = new Schema<IReview>({
  type: {
    type: String,
    enum: ['company_by_candidate', 'candidate_by_company', 'interview_feedback', 
           'simulation_feedback', 'platform_review', 'service_review'],
    required: true
  },
  
  reviewerId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'reviewerType'
  },
  reviewerType: {
    type: String,
    enum: ['user', 'company'],
    required: true
  },
  
  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  targetType: {
    type: String,
    enum: ['user', 'company', 'job', 'application', 'simulation', 'platform'],
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
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Interview'
  },
  
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  
  criteria: [ReviewCriteriaSchema],
  
  title: {
    type: String,
    maxlength: 200
  },
  comment: {
    type: String,
    required: true,
    maxlength: 5000
  },
  
  aspects: {
    // Empresa
    workEnvironment: { type: Number, min: 1, max: 5 },
    benefits: { type: Number, min: 1, max: 5 },
    careerGrowth: { type: Number, min: 1, max: 5 },
    management: { type: Number, min: 1, max: 5 },
    workLifeBalance: { type: Number, min: 1, max: 5 },
    salary: { type: Number, min: 1, max: 5 },
    
    // Candidato
    technicalSkills: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    culturalFit: { type: Number, min: 1, max: 5 },
    
    // Entrevista
    preparation: { type: Number, min: 1, max: 5 },
    responseQuality: { type: Number, min: 1, max: 5 },
    engagement: { type: Number, min: 1, max: 5 },
    
    // Simulação
    completeness: { type: Number, min: 1, max: 5 },
    accuracy: { type: Number, min: 1, max: 5 },
    timeManagement: { type: Number, min: 1, max: 5 }
  },
  
  wouldRecommend: Boolean,
  recommendation: {
    type: String,
    enum: ['strongly_recommend', 'recommend', 'neutral', 'not_recommend', 'strongly_not_recommend']
  },
  
  isPublic: {
    type: Boolean,
    default: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  moderationNotes: String,
  
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['application', 'interview', 'hire', 'manual']
  },
  
  metadata: Schema.Types.Mixed,
  
  helpful: {
    yes: { type: Number, default: 0 },
    no: { type: Number, default: 0 },
    votedBy: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      vote: {
        type: String,
        enum: ['yes', 'no'],
        required: true
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  response: {
    text: {
      type: String,
      maxlength: 2000
    },
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date,
      default: Date.now
    },
    isOfficial: {
      type: Boolean,
      default: false
    }
  },
  
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

const ReviewSummarySchema = new Schema<IReviewSummary>({
  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  targetType: {
    type: String,
    enum: ['user', 'company', 'job', 'simulation', 'platform'],
    required: true
  },
  
  totalReviews: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  
  ratingDistribution: [{
    rating: Number,
    count: Number,
    percentage: Number
  }],
  
  criteriaAverages: [{
    name: String,
    average: Number,
    count: Number
  }],
  
  monthlyStats: [{
    month: String,
    totalReviews: Number,
    averageRating: Number
  }],
  
  commonAspects: [{
    aspect: String,
    count: Number,
    averageRating: Number
  }],
  
  popularTags: [{
    tag: String,
    count: Number
  }],
  
  trends: [{
    period: {
      type: String,
      enum: ['7d', '30d', '90d']
    },
    ratingChange: Number,
    reviewCountChange: Number,
    direction: {
      type: String,
      enum: ['up', 'down', 'stable']
    }
  }],
  
  lastCalculatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const ReviewTemplateSchema = new Schema<IReviewTemplate>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  
  forType: {
    type: String,
    enum: ['company_by_candidate', 'candidate_by_company', 'interview_feedback', 
           'simulation_feedback', 'platform_review', 'service_review'],
    required: true
  },
  forEntity: {
    type: String,
    enum: ['user', 'company', 'job', 'application', 'simulation', 'platform'],
    required: true
  },
  
  defaultCriteria: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    weight: {
      type: Number,
      default: 1
    },
    required: {
      type: Boolean,
      default: false
    },
    scale: {
      min: {
        type: Number,
        default: 1
      },
      max: {
        type: Number,
        default: 5
      },
      labels: [{
        value: Number,
        label: String
      }]
    }
  }],
  
  questions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'boolean', 'scale', 'multiple_choice'],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [String],
    placeholder: String
  }],
  
  settings: {
    allowAnonymous: {
      type: Boolean,
      default: true
    },
    requireVerification: {
      type: Boolean,
      default: false
    },
    autoApprove: {
      type: Boolean,
      default: false
    },
    allowResponse: {
      type: Boolean,
      default: true
    },
    showToPublic: {
      type: Boolean,
      default: true
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índices para Review
ReviewSchema.index({ targetId: 1, targetType: 1, status: 1 });
ReviewSchema.index({ reviewerId: 1, reviewerType: 1 });
ReviewSchema.index({ type: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ overallRating: 1, isPublic: 1 });
ReviewSchema.index({ isVerified: 1, status: 1 });
ReviewSchema.index({ jobId: 1, applicationId: 1 });

// Índice único para prevenir reviews duplicados
ReviewSchema.index({ 
  reviewerId: 1, 
  targetId: 1, 
  type: 1, 
  applicationId: 1 
}, { 
  unique: true, 
  sparse: true 
});

// Índices para ReviewSummary
ReviewSummarySchema.index({ targetId: 1, targetType: 1 }, { unique: true });
ReviewSummarySchema.index({ lastCalculatedAt: 1 });

// Índices para ReviewTemplate
ReviewTemplateSchema.index({ forType: 1, forEntity: 1, isActive: 1 });

// Métodos para Review
ReviewSchema.methods.addHelpfulVote = function(userId: mongoose.Types.ObjectId, vote: 'yes' | 'no') {
  // Remove voto anterior se existir
  this.helpful.votedBy = this.helpful.votedBy.filter((v: any) => !v.userId.equals(userId));
  
  // Adiciona novo voto
  this.helpful.votedBy.push({
    userId,
    vote,
    votedAt: new Date()
  });
  
  // Atualiza contadores
  this.helpful.yes = this.helpful.votedBy.filter((v: any) => v.vote === 'yes').length;
  this.helpful.no = this.helpful.votedBy.filter((v: any) => v.vote === 'no').length;
  
  return this.save();
};

ReviewSchema.methods.addResponse = function(text: string, respondedBy: mongoose.Types.ObjectId, isOfficial: boolean = false) {
  this.response = {
    text,
    respondedBy,
    respondedAt: new Date(),
    isOfficial
  };
  
  return this.save();
};

// Métodos para ReviewSummary
ReviewSummarySchema.methods.recalculate = async function() {
  const Review = mongoose.model('Review');
  
  const reviews = await Review.find({
    targetId: this.targetId,
    targetType: this.targetType,
    status: 'approved'
  });
  
  if (reviews.length === 0) {
    this.totalReviews = 0;
    this.averageRating = 0;
    this.ratingDistribution = [];
    return this.save();
  }
  
  // Calcular estatísticas
  this.totalReviews = reviews.length;
  this.averageRating = reviews.reduce((sum, review) => sum + review.overallRating, 0) / reviews.length;
  
  // Distribuição de ratings
  const distribution = new Array(10).fill(0);
  reviews.forEach(review => {
    distribution[review.overallRating - 1]++;
  });
  
  this.ratingDistribution = distribution.map((count, index) => ({
    rating: index + 1,
    count,
    percentage: (count / reviews.length) * 100
  })).filter(item => item.count > 0);
  
  this.lastCalculatedAt = new Date();
  
  return this.save();
};

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
export const ReviewSummary = mongoose.models.ReviewSummary || mongoose.model<IReviewSummary>('ReviewSummary', ReviewSummarySchema);
export const ReviewTemplate = mongoose.models.ReviewTemplate || mongoose.model<IReviewTemplate>('ReviewTemplate', ReviewTemplateSchema);

export default Review; 