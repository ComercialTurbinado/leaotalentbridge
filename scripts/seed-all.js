const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definir todos os schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['candidato', 'empresa', 'admin'], default: 'candidato' },
  profile: {
    completed: { type: Boolean, default: false },
    avatar: String, phone: String, company: String, position: String,
    linkedin: String, website: String, experience: String,
    documents: [{
      id: String, name: String, type: String, url: String,
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      uploadedAt: { type: Date, default: Date.now }
    }]
  }
}, { timestamps: true });

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  website: String, description: String,
  industry: { type: String, enum: ['technology', 'finance', 'healthcare', 'education', 'retail', 'manufacturing', 'construction', 'hospitality', 'consulting', 'marketing', 'real_estate', 'energy', 'telecommunications', 'automotive', 'aerospace', 'logistics', 'other'] },
  size: { type: String, enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
  foundedYear: Number,
  address: { street: String, city: String, state: String, country: String, zipCode: String },
  primaryContact: { name: String, position: String, email: String, phone: String },
  status: { type: String, enum: ['pending', 'active', 'inactive', 'suspended', 'rejected'], default: 'pending' },
  isVerified: { type: Boolean, default: false },
  verificationDate: Date,
  plan: {
    type: { type: String, enum: ['basic', 'premium', 'enterprise'], default: 'basic' },
    startDate: { type: Date, default: Date.now },
    endDate: Date, features: [String],
    maxJobs: { type: Number, default: 5 },
    maxCandidates: { type: Number, default: 50 },
    isActive: { type: Boolean, default: true }
  },
  preferences: {
    candidateNotifications: Boolean, emailUpdates: Boolean, smsNotifications: Boolean,
    autoScreening: Boolean, candidateTypes: [String], preferredLocations: [String]
  }
}, { timestamps: true });

const JobSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  summary: String, department: String,
  location: {
    city: String, state: String, country: String, isRemote: Boolean,
    remoteOptions: { type: String, enum: ['fully_remote', 'hybrid', 'on_site'] }
  },
  workType: { type: String, enum: ['full_time', 'part_time', 'contract', 'freelance', 'internship'] },
  workSchedule: { type: String, enum: ['standard', 'flexible', 'shift', 'weekend'] },
  salary: {
    min: Number, max: Number, currency: String, isNegotiable: Boolean,
    paymentFrequency: { type: String, enum: ['monthly', 'annual', 'hourly', 'project'] },
    benefits: [String]
  },
  requirements: {
    education: {
      level: { type: String, enum: ['high_school', 'associate', 'bachelor', 'master', 'phd', 'none'] },
      field: String, required: Boolean
    },
    experience: {
      minYears: Number, maxYears: Number,
      level: { type: String, enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'] },
      required: Boolean
    },
    skills: {
      technical: [String], soft: [String],
      languages: [{
        language: String,
        level: { type: String, enum: ['basic', 'intermediate', 'advanced', 'fluent', 'native'] },
        required: Boolean
      }],
      certifications: [String]
    }
  },
  status: { type: String, enum: ['draft', 'active', 'paused', 'closed', 'expired'], default: 'draft' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  publishedAt: Date, expiresAt: Date, autoScreening: Boolean, questionsRequired: Boolean,
  customQuestions: [{
    question: String,
    type: { type: String, enum: ['text', 'multiple_choice', 'boolean', 'file'] },
    required: Boolean
  }],
  tags: [String],
  category: { type: String, enum: ['technology', 'finance', 'healthcare', 'education', 'marketing', 'sales', 'design', 'operations', 'hr', 'legal', 'customer_service', 'manufacturing', 'construction', 'hospitality', 'retail', 'other'] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const SimulationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['technical', 'behavioral', 'case_study', 'presentation'], required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  estimatedTime: Number,
  questions: [{ id: Number, text: String, tips: [String] }],
  tags: [String],
  isActive: { type: Boolean, default: true },
  targetAudience: [String], requiredSkills: [String]
}, { timestamps: true });

const SimulationAnswerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  simulationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Simulation', required: true },
  answers: [{ questionId: Number, text: String, timestamp: Date }],
  score: Number, feedback: String, completedAt: Date, duration: Number
}, { timestamps: true });

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  status: { type: String, enum: ['applied', 'screening', 'qualified', 'interview_scheduled', 'interviewed', 'offer_made', 'hired', 'rejected', 'withdrawn'], default: 'applied' },
  appliedAt: { type: Date, default: Date.now },
  source: { type: String, enum: ['direct', 'referral', 'linkedin', 'job_board', 'company_website', 'recruiter', 'other'], default: 'direct' },
  coverLetter: String,
  salaryExpectation: { min: Number, max: Number, currency: String, isNegotiable: Boolean },
  availabilityDate: Date,
  customAnswers: [{ questionId: String, question: String, answer: String, type: { type: String, enum: ['text', 'multiple_choice', 'boolean', 'file'] } }],
  documents: [{
    type: { type: String, enum: ['resume', 'cover_letter', 'portfolio', 'certificate', 'other'] },
    filename: String, originalName: String, url: String, size: Number, mimeType: String,
    uploadedAt: { type: Date, default: Date.now },
    isRequired: Boolean,
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
  }],
  screening: {
    score: Number,
    criteria: { education: Number, experience: Number, skills: Number, location: Number, salary: Number, overall: Number },
    passedScreening: Boolean, automatedDate: Date, notes: String
  },
  communicationPreference: { type: String, enum: ['email', 'phone', 'whatsapp', 'linkedin'], default: 'email' },
  overallRating: Number,
  notes: { recruiter: String, hr: String, hiring_manager: String },
  tags: [String],
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
}, { timestamps: true });

async function seedAllData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://comercialturbinado:B3DfSzmasC0gDVdb@cluster0.vryeq.mongodb.net/');
    console.log('✅ Conectado ao MongoDB');

    // Criar modelos
    const User = mongoose.model('User', UserSchema);
    const Company = mongoose.model('Company', CompanySchema);
    const Job = mongoose.model('Job', JobSchema);
    const Simulation = mongoose.model('Simulation', SimulationSchema);
    const SimulationAnswer = mongoose.model('SimulationAnswer', SimulationAnswerSchema);
    const Application = mongoose.model('Application', ApplicationSchema);

    // Limpar coleções
    console.log('🗑️ Limpando coleções...');
    await Promise.all([
      User.deleteMany({}), Company.deleteMany({}), Job.deleteMany({}),
      Simulation.deleteMany({}), SimulationAnswer.deleteMany({}), Application.deleteMany({})
    ]);

    // Criar dados
    const hashedPassword = await bcrypt.hash('senha123', 10);
    
    const companies = await Company.insertMany([
      {
        name: 'Tech Solutions Dubai', email: 'hr@techsolutions.ae', website: 'https://techsolutions.ae',
        description: 'Empresa líder em soluções tecnológicas no Oriente Médio', industry: 'technology', size: 'medium',
        foundedYear: 2015, address: { street: 'Dubai Internet City', city: 'Dubai', state: 'Dubai', country: 'UAE', zipCode: '12345' },
        primaryContact: { name: 'Sarah Al-Mansouri', position: 'HR Director', email: 'sarah@techsolutions.ae', phone: '+971-50-123-4567' },
        status: 'active', isVerified: true, verificationDate: new Date(),
        plan: { type: 'premium', startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), features: ['unlimited_jobs', 'premium_support', 'analytics'], maxJobs: 50, maxCandidates: 1000, isActive: true },
        preferences: { candidateNotifications: true, emailUpdates: true, smsNotifications: false, autoScreening: true, candidateTypes: ['brasileiros', 'experiencia_internacional'], preferredLocations: ['São Paulo', 'Rio de Janeiro', 'Brasília'] }
      }
    ]);

    const users = await User.insertMany([
      {
        name: 'Carlos Silva Santos', email: 'carlos.silva@email.com', password: hashedPassword, type: 'candidato',
        profile: { completed: true, phone: '+55 11 99999-1111' }
      }
    ]);

    const jobs = await Job.insertMany([
      {
        companyId: companies[0]._id, title: 'Senior Full Stack Developer',
        description: 'Desenvolvedor experiente para projetos de e-commerce de grande escala.',
        summary: 'Desenvolvedor sênior para projetos de e-commerce com foco em React e Node.js',
        department: 'Engineering',
        location: { city: 'Dubai', state: 'Dubai', country: 'UAE', isRemote: false, remoteOptions: 'hybrid' },
        workType: 'full_time', workSchedule: 'flexible',
        salary: { min: 18000, max: 25000, currency: 'AED', isNegotiable: true, paymentFrequency: 'monthly', benefits: ['Seguro saúde', 'Seguro dental', 'Bônus anual'] },
        requirements: {
          education: { level: 'bachelor', field: 'Ciência da Computação', required: true },
          experience: { minYears: 5, maxYears: 8, level: 'senior', required: true },
          skills: { technical: ['React', 'Node.js', 'JavaScript', 'AWS', 'MongoDB'], soft: ['Liderança', 'Comunicação'], languages: [{ language: 'Inglês', level: 'fluent', required: true }], certifications: ['AWS Certified Developer'] }
        },
        status: 'active', priority: 'high', publishedAt: new Date(), expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        autoScreening: true, questionsRequired: true,
        customQuestions: [{ question: 'Descreva sua experiência com microserviços', type: 'text', required: true }],
        tags: ['react', 'nodejs', 'senior', 'full-stack'], category: 'technology', createdBy: users[0]._id
      }
    ]);

    const simulations = await Simulation.insertMany([
      {
        title: 'Entrevista Técnica - Desenvolvedor Full Stack',
        description: 'Simulação focada em perguntas técnicas para desenvolvedores',
        category: 'technical', difficulty: 'intermediate', estimatedTime: 45,
        questions: [{ id: 1, text: 'Explique a diferença entre props e state no React.', tips: ['Considere mutabilidade vs imutabilidade'] }],
        tags: ['react', 'nodejs', 'technical'], isActive: true,
        targetAudience: ['developers', 'full-stack'], requiredSkills: ['JavaScript', 'React', 'Node.js']
      }
    ]);

    await SimulationAnswer.insertMany([
      {
        userId: users[0]._id, simulationId: simulations[0]._id,
        answers: [{ questionId: 1, text: 'Props são dados imutáveis passados de componente pai para filho...', timestamp: new Date() }],
        score: 88, feedback: 'Respostas demonstram sólido conhecimento técnico.', completedAt: new Date(), duration: 2700
      }
    ]);

    await Application.insertMany([
      {
        jobId: jobs[0]._id, candidateId: users[0]._id, companyId: companies[0]._id,
        status: 'qualified', appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), source: 'direct',
        coverLetter: 'Tenho grande interesse nesta posição...',
        salaryExpectation: { min: 20000, max: 24000, currency: 'AED', isNegotiable: true },
        availabilityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        customAnswers: [{ questionId: '1', question: 'Descreva sua experiência com microserviços', answer: 'Trabalhei com arquitetura de microserviços...', type: 'text' }],
        documents: [{ type: 'resume', filename: 'carlos-silva-resume.pdf', originalName: 'Carlos Silva - Currículo.pdf', url: 'https://storage.example.com/carlos-silva-resume.pdf', size: 1024000, mimeType: 'application/pdf', isRequired: true, status: 'verified' }],
        screening: { score: 92, criteria: { education: 95, experience: 90, skills: 94, location: 85, salary: 90, overall: 92 }, passedScreening: true, automatedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), notes: 'Candidato altamente qualificado' },
        communicationPreference: 'email', overallRating: 9,
        notes: { recruiter: 'Excelente candidato', hr: 'Disponível para relocação' },
        tags: ['qualified', 'technical-strong'], priority: 'high'
      }
    ]);

    console.log('✅ Seed completo finalizado com sucesso!');
    console.log(`📊 Dados criados:
    • ${companies.length} empresa(s)
    • ${users.length} usuário(s)
    • ${jobs.length} vaga(s)
    • ${simulations.length} simulação(ões)
    • 1 resposta de simulação
    • 1 candidatura`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão fechada');
  }
}

if (require.main === module) {
  seedAllData();
}

module.exports = seedAllData; 