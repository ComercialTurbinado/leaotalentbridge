import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'job_recommendation' | 'application_update' | 'document_status' | 'interview_scheduled' | 'interview_invitation' | 'interview_response' | 'feedback_available' | 'feedback_pending' | 'new_application' | 'system_alert' | 'general';
  title: string;
  message: string;
  data?: {
    jobId?: string;
    applicationId?: string;
    documentId?: string;
    interviewId?: string;
    companyId?: string;
    candidateId?: string;
    actionUrl?: string;
    [key: string]: any;
  };
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Configurações de entrega
  delivery: {
    email: {
      sent: boolean;
      sentAt?: Date;
      failed?: boolean;
      error?: string;
    };
    push: {
      sent: boolean;
      sentAt?: Date;
      failed?: boolean;
      error?: string;
    };
    sms: {
      sent: boolean;
      sentAt?: Date;
      failed?: boolean;
      error?: string;
    };
  };
  
  // Agendamento
  scheduledFor?: Date;
  
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['job_recommendation', 'application_update', 'document_status', 'interview_scheduled', 'interview_invitation', 'interview_response', 'feedback_available', 'feedback_pending', 'new_application', 'system_alert', 'general'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Configurações de entrega
  delivery: {
    email: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date },
      failed: { type: Boolean, default: false },
      error: { type: String }
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date },
      failed: { type: Boolean, default: false },
      error: { type: String }
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date },
      failed: { type: Boolean, default: false },
      error: { type: String }
    }
  },
  
  // Agendamento
  scheduledFor: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
});

// Índices para performance
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);