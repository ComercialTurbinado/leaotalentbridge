import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Preferências gerais
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  
  // Preferências por tipo de notificação
  preferences: {
    // Candidato
    newJobRecommendations?: boolean;
    applicationStatusUpdates?: boolean;
    interviewInvitations?: boolean;
    interviewReminders?: boolean;
    feedbackAvailable?: boolean;
    documentRequests?: boolean;
    simulationInvitations?: boolean;
    
    // Empresa
    newApplications?: boolean;
    applicationUpdates?: boolean;
    interviewResponses?: boolean;
    candidateFeedback?: boolean;
    jobExpiryReminders?: boolean;
    systemUpdates?: boolean;
    
    // Admin
    newInterviews?: boolean;
    feedbackPending?: boolean;
    systemAlerts?: boolean;
    userReports?: boolean;
    maintenanceAlerts?: boolean;
  };
  
  // Configurações de frequência
  frequency: {
    email: 'immediate' | 'daily' | 'weekly' | 'never';
    push: 'immediate' | 'daily' | 'weekly' | 'never';
    sms: 'immediate' | 'daily' | 'weekly' | 'never';
  };
  
  // Horários de silêncio
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    timezone: string;
  };
  
  // Dias da semana para receber notificações
  allowedDays: number[]; // 0-6 (Sunday-Saturday)
  
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferencesSchema = new Schema<INotificationPreferences>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  emailNotifications: {
    type: Boolean,
    default: true
  },
  
  pushNotifications: {
    type: Boolean,
    default: true
  },
  
  smsNotifications: {
    type: Boolean,
    default: false
  },
  
  preferences: {
    // Candidato
    newJobRecommendations: { type: Boolean, default: true },
    applicationStatusUpdates: { type: Boolean, default: true },
    interviewInvitations: { type: Boolean, default: true },
    interviewReminders: { type: Boolean, default: true },
    feedbackAvailable: { type: Boolean, default: true },
    documentRequests: { type: Boolean, default: true },
    simulationInvitations: { type: Boolean, default: true },
    
    // Empresa
    newApplications: { type: Boolean, default: true },
    applicationUpdates: { type: Boolean, default: true },
    interviewResponses: { type: Boolean, default: true },
    candidateFeedback: { type: Boolean, default: true },
    jobExpiryReminders: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: true },
    
    // Admin
    newInterviews: { type: Boolean, default: true },
    feedbackPending: { type: Boolean, default: true },
    systemAlerts: { type: Boolean, default: true },
    userReports: { type: Boolean, default: true },
    maintenanceAlerts: { type: Boolean, default: true }
  },
  
  frequency: {
    email: {
      type: String,
      enum: ['immediate', 'daily', 'weekly', 'never'],
      default: 'immediate'
    },
    push: {
      type: String,
      enum: ['immediate', 'daily', 'weekly', 'never'],
      default: 'immediate'
    },
    sms: {
      type: String,
      enum: ['immediate', 'daily', 'weekly', 'never'],
      default: 'never'
    }
  },
  
  quietHours: {
    enabled: { type: Boolean, default: false },
    startTime: { type: String, default: '22:00' },
    endTime: { type: String, default: '08:00' },
    timezone: { type: String, default: 'America/Sao_Paulo' }
  },
  
  allowedDays: {
    type: [Number],
    default: [0, 1, 2, 3, 4, 5, 6] // Todos os dias
  }
}, {
  timestamps: true
});

// Índices
NotificationPreferencesSchema.index({ userId: 1 });

export default mongoose.models.NotificationPreferences || mongoose.model<INotificationPreferences>('NotificationPreferences', NotificationPreferencesSchema);
