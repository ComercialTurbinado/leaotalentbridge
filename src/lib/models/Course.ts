import mongoose, { Document, Schema } from 'mongoose';

export interface ICourseResource {
  type: 'pdf' | 'video' | 'link' | 'code' | 'image' | 'audio';
  title: string;
  url: string;
  size?: number; // em bytes
  downloadable: boolean;
}

export interface ICourseLesson {
  _id?: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz' | 'exercise' | 'project';
  duration: number; // em minutos
  order: number;
  
  // Conteúdo específico por tipo
  content: {
    videoUrl?: string;
    textContent?: string;
    quizQuestions?: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }[];
    exerciseInstructions?: string;
    projectDescription?: string;
  };
  
  resources: ICourseResource[];
  isPreview: boolean; // Se pode ser vista sem inscrição
  isRequired: boolean; // Se é obrigatória para certificação
}

export interface ICourseModule {
  _id?: string;
  title: string;
  description: string;
  order: number;
  lessons: ICourseLesson[];
  estimatedDuration: number; // em minutos
}

export interface ICourseRequirements {
  prerequisites: string[];
  minimumLevel: 'beginner' | 'intermediate' | 'advanced';
  requiredSkills: string[];
  recommendedExperience?: string;
}

export interface ICourseInstructor {
  name: string;
  bio: string;
  avatar: string;
  expertise: string[];
  experience: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

export interface ICoursePricing {
  type: 'free' | 'paid' | 'subscription';
  price?: number;
  currency?: string;
  promotionalPrice?: number;
  promotionEndsAt?: Date;
}

export interface ICourseMetrics {
  totalStudents: number;
  completionRate: number; // 0-100
  averageRating: number; // 0-5
  totalReviews: number;
  totalTimeSpent: number; // em minutos
  popularityScore: number; // calculado baseado em vários fatores
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  thumbnail: string;
  trailerVideo?: string;
  
  // Categorização
  category: 'technology' | 'design' | 'business' | 'languages' | 'soft_skills' | 'other';
  subcategory?: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  
  // Estrutura do curso
  modules: ICourseModule[];
  totalDuration: number; // em minutos (calculado automaticamente)
  totalLessons: number; // calculado automaticamente
  
  // Requisitos e objetivos
  requirements: ICourseRequirements;
  whatYoullLearn: string[];
  targetAudience: string[];
  
  // Instrutor
  instructor: ICourseInstructor;
  
  // Configurações
  language: string;
  pricing: ICoursePricing;
  hasCertificate: boolean;
  certificateTemplate?: string;
  
  // Status e visibilidade
  status: 'draft' | 'published' | 'archived' | 'under_review';
  isPublic: boolean;
  isFeatured: boolean;
  
  // Datas importantes
  publishedAt?: Date;
  lastUpdatedAt: Date;
  
  // Métricas
  metrics: ICourseMetrics;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  
  // Admin
  createdBy: mongoose.Types.ObjectId; // User ID do admin
  lastModifiedBy?: mongoose.Types.ObjectId;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

const CourseResourceSchema = new Schema({
  type: {
    type: String,
    enum: ['pdf', 'video', 'link', 'code', 'image', 'audio'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  size: Number,
  downloadable: {
    type: Boolean,
    default: false
  }
});

const CourseLessonSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'text', 'quiz', 'exercise', 'project'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  order: {
    type: Number,
    required: true,
    min: 0
  },
  content: {
    videoUrl: String,
    textContent: String,
    quizQuestions: [{
      question: {
        type: String,
        required: true
      },
      options: [{
        type: String,
        required: true
      }],
      correctAnswer: {
        type: Number,
        required: true,
        min: 0
      },
      explanation: String
    }],
    exerciseInstructions: String,
    projectDescription: String
  },
  resources: [CourseResourceSchema],
  isPreview: {
    type: Boolean,
    default: false
  },
  isRequired: {
    type: Boolean,
    default: true
  }
});

const CourseModuleSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true,
    min: 0
  },
  lessons: [CourseLessonSchema],
  estimatedDuration: {
    type: Number,
    required: true,
    min: 0
  }
});

const CourseInstructorSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  expertise: [{
    type: String,
    required: true
  }],
  experience: {
    type: String,
    required: true
  },
  socialLinks: {
    linkedin: String,
    github: String,
    website: String
  }
});

const CoursePricingSchema = new Schema({
  type: {
    type: String,
    enum: ['free', 'paid', 'subscription'],
    required: true,
    default: 'free'
  },
  price: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  promotionalPrice: {
    type: Number,
    min: 0
  },
  promotionEndsAt: Date
});

const CourseRequirementsSchema = new Schema({
  prerequisites: [{
    type: String,
    required: true
  }],
  minimumLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  requiredSkills: [{
    type: String,
    required: true
  }],
  recommendedExperience: String
});

const CourseMetricsSchema = new Schema({
  totalStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  popularityScore: {
    type: Number,
    default: 0,
    min: 0
  }
});

const CourseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 500
  },
  longDescription: {
    type: String,
    required: true,
    maxlength: 3000
  },
  thumbnail: {
    type: String,
    required: true
  },
  trailerVideo: String,
  
  category: {
    type: String,
    enum: ['technology', 'design', 'business', 'languages', 'soft_skills', 'other'],
    required: true,
    index: true
  },
  subcategory: String,
  tags: [{
    type: String,
    trim: true
  }],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
    index: true
  },
  
  modules: [CourseModuleSchema],
  totalDuration: {
    type: Number,
    default: 0,
    min: 0
  },
  totalLessons: {
    type: Number,
    default: 0,
    min: 0
  },
  
  requirements: CourseRequirementsSchema,
  whatYoullLearn: [{
    type: String,
    required: true
  }],
  targetAudience: [{
    type: String,
    required: true
  }],
  
  instructor: CourseInstructorSchema,
  
  language: {
    type: String,
    required: true,
    default: 'pt-BR'
  },
  pricing: CoursePricingSchema,
  hasCertificate: {
    type: Boolean,
    default: true
  },
  certificateTemplate: String,
  
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'under_review'],
    default: 'draft',
    index: true
  },
  isPublic: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  publishedAt: Date,
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },
  
  metrics: {
    type: CourseMetricsSchema,
    default: {}
  },
  
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  
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

// Índices para performance
CourseSchema.index({ title: 'text', shortDescription: 'text', tags: 'text' });
CourseSchema.index({ category: 1, level: 1 });
CourseSchema.index({ status: 1, isPublic: 1 });
CourseSchema.index({ isFeatured: 1, 'metrics.popularityScore': -1 });
CourseSchema.index({ createdAt: -1 });
CourseSchema.index({ 'metrics.averageRating': -1 });

// Middleware para calcular totais automaticamente
CourseSchema.pre('save', function(next) {
  if (this.modules && this.modules.length > 0) {
    this.totalDuration = this.modules.reduce((total, module) => total + module.estimatedDuration, 0);
    this.totalLessons = this.modules.reduce((total, module) => total + module.lessons.length, 0);
  }
  
  this.lastUpdatedAt = new Date();
  next();
});

// Método para gerar slug automaticamente
CourseSchema.methods.generateSlug = function() {
  return this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
