import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidateDocument extends Document {
  candidateId: mongoose.Types.ObjectId;
  type: 'cv' | 'certificate' | 'contract' | 'form' | 'other';
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  adminComments?: string;
  uploadedBy: 'candidate' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const CandidateDocumentSchema = new Schema<ICandidateDocument>({
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['cv', 'certificate', 'contract', 'form', 'other'],
    required: true
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
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  adminComments: {
    type: String,
    trim: true
  },
  uploadedBy: {
    type: String,
    enum: ['candidate', 'admin'],
    required: true
  }
}, {
  timestamps: true
});

// Índices para otimização
CandidateDocumentSchema.index({ candidateId: 1, type: 1 });
CandidateDocumentSchema.index({ status: 1 });
CandidateDocumentSchema.index({ createdAt: -1 });

export default mongoose.models.CandidateDocument || mongoose.model<ICandidateDocument>('CandidateDocument', CandidateDocumentSchema);
