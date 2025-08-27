import mongoose, { Document, Schema } from 'mongoose';

export interface ICompanyContact {
  name: string;
  position: string;
  email: string;
  phone?: string;
  whatsapp?: string;
}

export interface ICompanyAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ICompanyPlan {
  type: 'basic' | 'premium' | 'enterprise';
  startDate: Date;
  endDate: Date;
  features: string[];
  maxJobs: number;
  maxCandidates: number;
  isActive: boolean;
}

export interface ICompany extends Document {
  name: string;
  email: string;
  cnpj?: string;
  registrationNumber?: string; // Para empresas internacionais
  website?: string;
  logo?: string;
  description: string;
  
  // Localização e contato
  address: ICompanyAddress;
  phone?: string;
  
  // Informações da empresa
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  foundedYear?: number;
  
  // Pessoa de contato principal
  primaryContact: ICompanyContact;
  
  // Contatos adicionais
  additionalContacts?: ICompanyContact[];
  
  // Status e verificação
  status: 'pending' | 'active' | 'inactive' | 'suspended' | 'rejected';
  isVerified: boolean;
  verificationDate?: Date;
  
  // Plano e pagamento
  plan: ICompanyPlan;
  
  // Estatísticas
  totalJobs: number;
  activeJobs: number;
  totalHires: number;
  averageRating: number;
  totalReviews: number;
  
  // Configurações
  preferences: {
    candidateNotifications: boolean;
    emailUpdates: boolean;
    smsNotifications: boolean;
    autoScreening: boolean;
    candidateTypes: string[];
    preferredLocations: string[];
  };
  
  // Metadados
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyContactSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: String,
  whatsapp: String
});

const CompanyAddressSchema = new Schema({
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'UAE'
  },
  zipCode: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
});

const CompanyPlanSchema = new Schema({
  type: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  features: [{
    type: String
  }],
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
});

const CompanySchema = new Schema<ICompany>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  cnpj: {
    type: String,
    sparse: true // Permite múltiplos null/undefined
  },
  registrationNumber: {
    type: String,
    sparse: true
  },
  website: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Website deve ser uma URL válida'
    }
  },
  logo: String,
  description: {
    type: String,
    maxlength: 2000
  },
  
  address: CompanyAddressSchema,
  phone: String,
  
  industry: {
    type: String,
    required: true,
    enum: [
      'technology', 'finance', 'healthcare', 'education', 'retail',
      'manufacturing', 'construction', 'hospitality', 'consulting',
      'marketing', 'real_estate', 'energy', 'telecommunications',
      'automotive', 'aerospace', 'logistics', 'other'
    ]
  },
  size: {
    type: String,
    required: true,
    enum: ['startup', 'small', 'medium', 'large', 'enterprise']
  },
  foundedYear: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  
  primaryContact: CompanyContactSchema,
  additionalContacts: [CompanyContactSchema],
  
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
  
  plan: CompanyPlanSchema,
  
  totalJobs: {
    type: Number,
    default: 0
  },
  activeJobs: {
    type: Number,
    default: 0
  },
  totalHires: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  
  preferences: {
    candidateNotifications: {
      type: Boolean,
      default: true
    },
    emailUpdates: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    autoScreening: {
      type: Boolean,
      default: false
    },
    candidateTypes: [{
      type: String
    }],
    preferredLocations: [{
      type: String
    }]
  },
  
  lastLogin: Date
}, {
  timestamps: true
});

// Índices para performance
CompanySchema.index({ email: 1 });
CompanySchema.index({ status: 1, isVerified: 1 });
CompanySchema.index({ 'address.city': 1, 'address.country': 1 });
CompanySchema.index({ industry: 1, size: 1 });
CompanySchema.index({ 'plan.type': 1, 'plan.isActive': 1 });
CompanySchema.index({ createdAt: -1 });

// Middleware para atualizar estatísticas
CompanySchema.methods.updateStats = async function() {
  const Job = mongoose.model('Job');
  const Application = mongoose.model('Application');
  
  const totalJobs = await Job.countDocuments({ companyId: this._id });
  const activeJobs = await Job.countDocuments({ 
    companyId: this._id, 
    status: 'active' 
  });
  
  const totalHires = await Application.countDocuments({
    companyId: this._id,
    status: 'hired'
  });
  
  this.totalJobs = totalJobs;
  this.activeJobs = activeJobs;
  this.totalHires = totalHires;
  
  return this.save();
};

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema); 