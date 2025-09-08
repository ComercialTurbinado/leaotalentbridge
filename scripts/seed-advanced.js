const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definir schemas básicos primeiro
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['candidato', 'empresa', 'admin'],
    default: 'candidato'
  },
  profile: {
    completed: {
      type: Boolean,
      default: false
    },
    avatar: String,
    phone: String,
    company: String,
    position: String,
    linkedin: String,
    website: String,
    experience: String,
    documents: [{
      id: String,
      name: String,
      type: String,
      url: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  website: String,
  description: String,
  industry: {
    type: String,
    enum: ['technology', 'finance', 'healthcare', 'education', 'retail', 'manufacturing', 'construction', 'hospitality', 'consulting', 'marketing', 'real_estate', 'energy', 'telecommunications', 'automotive', 'aerospace', 'logistics', 'other']
  },
  size: {
    type: String,
    enum: ['startup', 'small', 'medium', 'large', 'enterprise']
  },
  foundedYear: Number,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  primaryContact: {
    name: String,
    position: String,
    email: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'suspended', 'rejected'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: Date,
  plan: {
    type: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    features: [String],
    maxJobs: {
      type: Number,
      default: 5
    },
    maxCandidates: {
      type: Number,
      default: 50
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  preferences: {
    candidateNotifications: Boolean,
    emailUpdates: Boolean,
    smsNotifications: Boolean,
    autoScreening: Boolean,
    candidateTypes: [String],
    preferredLocations: [String]
  }
}, {
  timestamps: true
});

const JobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  summary: String,
  department: String,
  location: {
    city: String,
    state: String,
    country: String,
    isRemote: Boolean,
    remoteOptions: {
      type: String,
      enum: ['fully_remote', 'hybrid', 'on_site']
    }
  },
  workType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'freelance', 'internship']
  },
  workSchedule: {
    type: String,
    enum: ['standard', 'flexible', 'shift', 'weekend']
  },
  salary: {
    min: Number,
    max: Number,
    currency: String,
    isNegotiable: Boolean,
    paymentFrequency: {
      type: String,
      enum: ['monthly', 'annual', 'hourly', 'project']
    },
    benefits: [String]
  },
  requirements: {
    education: {
      level: {
        type: String,
        enum: ['high_school', 'associate', 'bachelor', 'master', 'phd', 'none']
      },
      field: String,
      required: Boolean
    },
    experience: {
      minYears: Number,
      maxYears: Number,
      level: {
        type: String,
        enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive']
      },
      required: Boolean
    },
    skills: {
      technical: [String],
      soft: [String],
      languages: [{
        language: String,
        level: {
          type: String,
          enum: ['basic', 'intermediate', 'advanced', 'fluent', 'native']
        },
        required: Boolean
      }],
      certifications: [String]
    }
  },
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
  expiresAt: Date,
  autoScreening: Boolean,
  questionsRequired: Boolean,
  customQuestions: [{
    question: String,
    type: {
      type: String,
      enum: ['text', 'multiple_choice', 'boolean', 'file']
    },
    required: Boolean
  }],
  tags: [String],
  category: {
    type: String,
    enum: ['technology', 'finance', 'healthcare', 'education', 'marketing', 'sales', 'design', 'operations', 'hr', 'legal', 'customer_service', 'manufacturing', 'construction', 'hospitality', 'retail', 'other']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const SimulationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['technical', 'behavioral', 'case_study', 'presentation'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  estimatedTime: Number,
  questions: [{
    id: Number,
    text: String,
    tips: [String]
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  targetAudience: [String],
  requiredSkills: [String]
}, {
  timestamps: true
});

const SimulationAnswerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  simulationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Simulation',
    required: true
  },
  answers: [{
    questionId: Number,
    text: String,
    timestamp: Date
  }],
  score: Number,
  feedback: String,
  completedAt: Date,
  duration: Number
}, {
  timestamps: true
});

// Definir schemas dos modelos avançados
const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'screening', 'qualified', 'interview_scheduled', 'interviewed', 'offer_made', 'hired', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['direct', 'referral', 'linkedin', 'job_board', 'company_website', 'recruiter', 'other'],
    default: 'direct'
  },
  coverLetter: String,
  salaryExpectation: {
    min: Number,
    max: Number,
    currency: String,
    isNegotiable: Boolean
  },
  availabilityDate: Date,
  customAnswers: [{
    questionId: String,
    question: String,
    answer: String,
    type: {
      type: String,
      enum: ['text', 'multiple_choice', 'boolean', 'file']
    }
  }],
  documents: [{
    type: {
      type: String,
      enum: ['resume', 'cover_letter', 'portfolio', 'certificate', 'other']
    },
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    isRequired: Boolean,
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  }],
  screening: {
    score: Number,
    criteria: {
      education: Number,
      experience: Number,
      skills: Number,
      location: Number,
      salary: Number,
      overall: Number
    },
    passedScreening: Boolean,
    automatedDate: Date,
    notes: String
  },
  interviews: [{
    type: {
      type: String,
      enum: ['phone', 'video', 'in_person', 'technical', 'panel']
    },
    scheduledAt: Date,
    duration: Number,
    interviewers: [String],
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled']
    },
    feedback: String,
    score: Number,
    notes: String
  }],
  communicationPreference: {
    type: String,
    enum: ['email', 'phone', 'whatsapp', 'linkedin'],
    default: 'email'
  },
  overallRating: Number,
  notes: {
    recruiter: String,
    hr: String,
    hiring_manager: String
  },
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

const PaymentSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  type: {
    type: String,
    enum: ['subscription', 'job_posting', 'featured_job', 'candidate_search', 'premium_feature'],
    required: true
  },
  purpose: String,
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'AED'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'apple_pay', 'google_pay']
    },
    provider: String,
    providerId: String,
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number,
    isDefault: Boolean,
    isActive: Boolean
  },
  gateway: {
    type: String,
    enum: ['stripe', 'paypal', 'square', 'razorpay', 'paymob']
  },
  gatewayResponse: {
    id: String,
    status: String,
    message: String,
    raw: mongoose.Schema.Types.Mixed
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  invoiceId: String,
  receiptUrl: String,
  completedAt: Date,
  attempts: [{
    attemptNumber: Number,
    attemptedAt: Date,
    status: String,
    errorMessage: String
  }]
}, {
  timestamps: true
});

const NotificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  recipientType: {
    type: String,
    enum: ['user', 'company', 'admin'],
    required: true
  },
  type: {
    type: String,
    enum: [
      'application_received', 'application_status_update', 'interview_scheduled',
      'job_match', 'profile_viewed', 'message_received', 'payment_success',
      'subscription_expiring', 'document_verified', 'system_maintenance'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  channels: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'in_app', 'whatsapp']
    },
    enabled: Boolean,
    status: String,
    attempts: Number,
    lastSent: Date,
    errorMessage: String
  }],
  data: mongoose.Schema.Types.Mixed,
  templateId: String,
  scheduledFor: Date,
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  relatedTo: {
    type: {
      type: String,
      enum: ['application', 'job', 'user', 'company', 'payment']
    },
    id: mongoose.Schema.Types.ObjectId
  }
}, {
  timestamps: true
});

const AnalyticsSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  sessionId: String,
  data: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const ReviewSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['company_by_candidate', 'candidate_by_company', 'interview_experience'],
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reviewerType: {
    type: String,
    enum: ['user', 'company'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    enum: ['user', 'company', 'job'],
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  title: String,
  comment: String,
  aspects: {
    workEnvironment: Number,
    benefits: Number,
    careerGrowth: Number,
    management: Number,
    workLifeBalance: Number,
    salary: Number,
    interviewProcess: Number,
    communication: Number
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
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: String,
  metadata: mongoose.Schema.Types.Mixed,
  helpful: {
    yes: {
      type: Number,
      default: 0
    },
    no: {
      type: Number,
      default: 0
    },
    votedBy: [mongoose.Schema.Types.ObjectId]
  },
  tags: [String],
  response: {
    comment: String,
    respondedAt: Date,
    respondedBy: mongoose.Schema.Types.ObjectId
  }
}, {
  timestamps: true
});

async function seedAdvancedData() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://comercialturbinado:B3DfSzmasC0gDVdb@cluster0.vryeq.mongodb.net/');

    console.log('✅ Conectado ao MongoDB');

    // Criar modelos
    const User = mongoose.model('User', UserSchema);
    const Company = mongoose.model('Company', CompanySchema);
    const Job = mongoose.model('Job', JobSchema);
    const Simulation = mongoose.model('Simulation', SimulationSchema);
    const SimulationAnswer = mongoose.model('SimulationAnswer', SimulationAnswerSchema);
    const Application = mongoose.model('Application', ApplicationSchema);
    const Payment = mongoose.model('Payment', PaymentSchema);
    const Notification = mongoose.model('Notification', NotificationSchema);
    const Analytics = mongoose.model('Analytics', AnalyticsSchema);
    const Review = mongoose.model('Review', ReviewSchema);

    // Buscar dados existentes
    const users = await User.find({ type: 'candidato' });
    const companies = await Company.find();
    const jobs = await Job.find();

    if (users.length === 0 || companies.length === 0 || jobs.length === 0) {
      console.log('❌ Execute primeiro o seed-extended.js para criar dados básicos');
      return;
    }

    console.log('🗑️ Limpando coleções avançadas...');
    await Application.deleteMany({});
    await Payment.deleteMany({});
    await Notification.deleteMany({});
    await Analytics.deleteMany({});
    await Review.deleteMany({});

    // 1. Criar candidaturas
    console.log('📝 Criando candidaturas...');
    const applications = await Application.insertMany([
      {
        jobId: jobs[0]._id,
        candidateId: users[0]._id,
        companyId: companies[0]._id,
        status: 'qualified',
        appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        source: 'direct',
        coverLetter: 'Tenho grande interesse nesta posição pois combina perfeitamente com minha experiência em desenvolvimento full stack. Trabalhei nos últimos 4 anos com React e Node.js em projetos de grande escala...',
        salaryExpectation: {
          min: 20000,
          max: 24000,
          currency: 'AED',
          isNegotiable: true
        },
        availabilityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        customAnswers: [
          {
            questionId: '1',
            question: 'Descreva sua experiência com microserviços',
            answer: 'Trabalhei com arquitetura de microserviços no iFood, desenvolvendo APIs independentes para diferentes domínios como pagamentos, pedidos e usuários.',
            type: 'text'
          }
        ],
        documents: [
          {
            type: 'resume',
            filename: 'carlos-silva-resume.pdf',
            originalName: 'Carlos Silva - Currículo.pdf',
            url: 'https://storage.example.com/carlos-silva-resume.pdf',
            size: 1024000,
            mimeType: 'application/pdf',
            isRequired: true,
            status: 'verified'
          }
        ],
        screening: {
          score: 92,
          criteria: {
            education: 95,
            experience: 90,
            skills: 94,
            location: 85,
            salary: 90,
            overall: 92
          },
          passedScreening: true,
          automatedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          notes: 'Candidato altamente qualificado com experiência sólida em tecnologias requeridas'
        },
        communicationPreference: 'email',
        overallRating: 9,
        notes: {
          recruiter: 'Excelente candidato, perfil técnico muito forte',
          hr: 'Disponível para relocação, documentação em ordem'
        },
        tags: ['qualified', 'technical-strong', 'international-ready'],
        priority: 'high'
      }
    ]);

    // 2. Criar pagamentos
    console.log('💰 Criando pagamentos...');
    await Payment.insertMany([
      {
        companyId: companies[0]._id,
        type: 'subscription',
        purpose: 'Premium Monthly Subscription',
        amount: 999,
        currency: 'AED',
        status: 'completed',
        paymentMethod: {
          type: 'credit_card',
          provider: 'stripe',
          providerId: 'pm_1234567890',
          last4: '4242',
          brand: 'Visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
          isActive: true
        },
        gateway: 'stripe',
        gatewayResponse: {
          id: 'pi_1234567890',
          status: 'succeeded',
          message: 'Payment completed successfully'
        },
        completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        attempts: [
          {
            attemptNumber: 1,
            attemptedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            status: 'success'
          }
        ]
      }
    ]);

    // 3. Criar notificações
    console.log('🔔 Criando notificações...');
    await Notification.insertMany([
      {
        recipientId: companies[0]._id,
        recipientType: 'company',
        type: 'application_received',
        title: 'Nova candidatura recebida',
        message: 'Carlos Silva Santos se candidatou para a vaga Senior Full Stack Developer',
        priority: 'medium',
        status: 'sent',
        channels: [
          {
            type: 'email',
            enabled: true,
            status: 'sent',
            attempts: 1,
            lastSent: new Date()
          },
          {
            type: 'in_app',
            enabled: true,
            status: 'sent',
            attempts: 1,
            lastSent: new Date()
          }
        ],
        data: {
          candidateName: 'Carlos Silva Santos',
          jobTitle: 'Senior Full Stack Developer',
          applicationId: applications[0]._id.toString()
        },
        deliveredAt: new Date(),
        relatedTo: {
          type: 'application',
          id: applications[0]._id
        }
      }
    ]);

    // 4. Criar eventos de analytics
    console.log('📊 Criando eventos de analytics...');
    await Analytics.insertMany([
      {
        eventType: 'job_view',
        userId: users[0]._id,
        jobId: jobs[0]._id,
        companyId: companies[0]._id,
        data: {
          page: '/jobs/senior-full-stack-developer',
          source: 'google',
          medium: 'organic',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: {
            country: 'Brazil',
            region: 'SP',
            city: 'São Paulo'
          },
          device: {
            type: 'desktop',
            os: 'Windows',
            browser: 'Chrome'
          },
          duration: 180
        },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        eventType: 'application_submit',
        userId: users[0]._id,
        jobId: jobs[0]._id,
        applicationId: applications[0]._id,
        companyId: companies[0]._id,
        data: {
          page: '/jobs/senior-full-stack-developer/apply',
          source: 'direct',
          device: { type: 'desktop' }
        },
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ]);

    // 5. Criar reviews
    console.log('⭐ Criando reviews...');
    await Review.insertMany([
      {
        type: 'company_by_candidate',
        reviewerId: users[0]._id,
        reviewerType: 'user',
        targetId: companies[0]._id,
        targetType: 'company',
        jobId: jobs[0]._id,
        applicationId: applications[0]._id,
        overallRating: 5,
        title: 'Excelente processo seletivo',
        comment: 'A Tech Solutions Dubai tem um processo muito transparente e profissional. O feedback foi rápido e a equipe de RH muito atenciosa.',
        aspects: {
          workEnvironment: 5,
          benefits: 4,
          careerGrowth: 5,
          management: 4,
          workLifeBalance: 4,
          salary: 4
        },
        wouldRecommend: true,
        recommendation: 'strongly_recommend',
        isPublic: true,
        isAnonymous: false,
        status: 'approved',
        isVerified: true,
        verificationMethod: 'application',
        metadata: {
          applicationDate: applications[0].appliedAt,
          positionLevel: 'Senior',
          workLocation: 'Dubai'
        },
        helpful: {
          yes: 5,
          no: 0,
          votedBy: []
        },
        tags: ['transparente', 'profissional', 'feedback-rapido']
      }
    ]);

    console.log('✅ Seed avançado concluído com sucesso!');
    console.log(`📊 Dados avançados criados:
    • ${applications.length} candidatura(s)
    • 1 pagamento
    • 1 notificação
    • 2 eventos de analytics
    • 1 review`);

  } catch (error) {
    console.error('❌ Erro ao executar seed avançado:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão com MongoDB fechada');
  }
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  seedAdvancedData();
}

module.exports = seedAdvancedData; 