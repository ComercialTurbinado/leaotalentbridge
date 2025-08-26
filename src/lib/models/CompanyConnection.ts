import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyConnection extends Document {
  candidateId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  status: 'pending' | 'active' | 'rejected' | 'expired';
  requestedBy: 'admin' | 'company' | 'candidate';
  requestedAt: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  permissions: {
    canViewProfile: boolean;
    canViewDocuments: boolean;
    canScheduleInterviews: boolean;
    canSendMessages: boolean;
    canViewApplications: boolean;
  };
  notes?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyConnectionSchema = new Schema<ICompanyConnection>({
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
  status: {
    type: String,
    enum: ['pending', 'active', 'rejected', 'expired'],
    default: 'pending'
  },
  requestedBy: {
    type: String,
    enum: ['admin', 'company', 'candidate'],
    required: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  permissions: {
    canViewProfile: {
      type: Boolean,
      default: true
    },
    canViewDocuments: {
      type: Boolean,
      default: false
    },
    canScheduleInterviews: {
      type: Boolean,
      default: true
    },
    canSendMessages: {
      type: Boolean,
      default: true
    },
    canViewApplications: {
      type: Boolean,
      default: false
    }
  },
  notes: {
    type: String,
    trim: true
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para otimização
CompanyConnectionSchema.index({ candidateId: 1, companyId: 1 }, { unique: true });
CompanyConnectionSchema.index({ status: 1 });
CompanyConnectionSchema.index({ requestedAt: -1 });
CompanyConnectionSchema.index({ expiresAt: 1 });

export default mongoose.models.CompanyConnection || mongoose.model<ICompanyConnection>('CompanyConnection', CompanyConnectionSchema);
