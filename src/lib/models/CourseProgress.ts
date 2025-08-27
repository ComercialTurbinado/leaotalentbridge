import mongoose, { Document, Schema } from 'mongoose';

export interface ICourseProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  progress: number; // 0-100
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  
  // Progresso detalhado por lição
  lessons: {
    lessonId: string;
    title: string;
    completed: boolean;
    completedAt?: Date;
    timeSpent: number; // em minutos
    quizAttempts?: {
      attempt: number;
      score: number;
      maxScore: number;
      completedAt: Date;
      passed: boolean;
    }[];
  }[];
  
  // Estatísticas gerais
  totalTimeSpent: number; // em minutos
  averageQuizScore?: number;
  certificateEarned: boolean;
  certificateIssuedAt?: Date;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

const CourseProgressSchema = new Schema<ICourseProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'paused'],
    default: 'not_started'
  },
  startedAt: Date,
  completedAt: Date,
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  
  lessons: [{
    lessonId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    timeSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    quizAttempts: [{
      attempt: {
        type: Number,
        required: true
      },
      score: {
        type: Number,
        required: true,
        min: 0
      },
      maxScore: {
        type: Number,
        required: true,
        min: 0
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      passed: {
        type: Boolean,
        required: true
      }
    }]
  }],
  
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  averageQuizScore: {
    type: Number,
    min: 0,
    max: 100
  },
  certificateEarned: {
    type: Boolean,
    default: false
  },
  certificateIssuedAt: Date
}, {
  timestamps: true
});

// Índices compostos para performance (otimizados para reduzir custos)
CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
CourseProgressSchema.index({ userId: 1, status: 1, progress: -1 }); // Índice composto para dashboard do usuário
CourseProgressSchema.index({ courseId: 1, status: 1, completedAt: -1 }); // Índice composto para estatísticas do curso

// Middleware para atualizar lastAccessedAt
CourseProgressSchema.pre('save', function(next) {
  this.lastAccessedAt = new Date();
  
  // Calcular progresso baseado nas lições completadas
  if (this.lessons && this.lessons.length > 0) {
    const completedLessons = this.lessons.filter(lesson => lesson.completed).length;
    this.progress = Math.round((completedLessons / this.lessons.length) * 100);
    
    // Atualizar status baseado no progresso
    if (this.progress === 0) {
      this.status = 'not_started';
    } else if (this.progress === 100) {
      this.status = 'completed';
      if (!this.completedAt) {
        this.completedAt = new Date();
      }
    } else {
      this.status = 'in_progress';
      if (!this.startedAt) {
        this.startedAt = new Date();
      }
    }
    
    // Calcular tempo total gasto
    this.totalTimeSpent = this.lessons.reduce((total, lesson) => total + (lesson.timeSpent || 0), 0);
    
    // Calcular média dos quizzes
    const allQuizzes = this.lessons.flatMap(lesson => lesson.quizAttempts || []);
    if (allQuizzes.length > 0) {
      const totalScore = allQuizzes.reduce((sum, quiz) => sum + (quiz.score / quiz.maxScore * 100), 0);
      this.averageQuizScore = Math.round(totalScore / allQuizzes.length);
    }
  }
  
  next();
});

// Métodos do schema
CourseProgressSchema.methods.markLessonComplete = function(lessonId: string, lessonTitle: string, timeSpent: number = 0) {
  const lessonIndex = this.lessons.findIndex((l: any) => l.lessonId === lessonId);
  
  if (lessonIndex >= 0) {
    this.lessons[lessonIndex].completed = true;
    this.lessons[lessonIndex].completedAt = new Date();
    this.lessons[lessonIndex].timeSpent += timeSpent;
  } else {
    this.lessons.push({
      lessonId,
      title: lessonTitle,
      completed: true,
      completedAt: new Date(),
      timeSpent
    });
  }
  
  return this.save();
};

CourseProgressSchema.methods.addQuizAttempt = function(
  lessonId: string, 
  score: number, 
  maxScore: number, 
  passed: boolean
) {
  const lessonIndex = this.lessons.findIndex((l: any) => l.lessonId === lessonId);
  
  if (lessonIndex >= 0) {
    if (!this.lessons[lessonIndex].quizAttempts) {
      this.lessons[lessonIndex].quizAttempts = [];
    }
    
    const attemptNumber = this.lessons[lessonIndex].quizAttempts.length + 1;
    
    this.lessons[lessonIndex].quizAttempts.push({
      attempt: attemptNumber,
      score,
      maxScore,
      completedAt: new Date(),
      passed
    });
  }
  
  return this.save();
};

CourseProgressSchema.methods.issueCertificate = function() {
  if (this.progress === 100 && !this.certificateEarned) {
    this.certificateEarned = true;
    this.certificateIssuedAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Métodos estáticos
CourseProgressSchema.statics.getUserProgress = function(userId: string, courseId?: string) {
  const filter: any = { userId };
  if (courseId) filter.courseId = courseId;
  
  return this.find(filter)
    .populate('courseId', 'title description category duration')
    .sort({ lastAccessedAt: -1 });
};

CourseProgressSchema.statics.getCourseStats = function(courseId: string) {
  return this.aggregate([
    { $match: { courseId: courseId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProgress: { $avg: '$progress' },
        avgTimeSpent: { $avg: '$totalTimeSpent' }
      }
    }
  ]);
};

export default mongoose.models.CourseProgress || mongoose.model<ICourseProgress>('CourseProgress', CourseProgressSchema);
