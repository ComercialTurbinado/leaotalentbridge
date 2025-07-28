import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationData {
  // Dados dinâmicos específicos do tipo de notificação
  candidateName?: string;
  jobTitle?: string;
  companyName?: string;
  interviewDate?: Date;
  applicationStatus?: string;
  paymentAmount?: number;
  subscriptionPlan?: string;
  simulationTitle?: string;
  score?: number;
  [key: string]: any; // Permite dados customizados
}

export interface INotificationChannel {
  type: 'email' | 'sms' | 'push' | 'in_app' | 'whatsapp';
  enabled: boolean;
  address?: string; // Email, phone, etc.
  lastSent?: Date;
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'opened' | 'clicked';
  attempts: number;
  errorMessage?: string;
}

export interface INotification extends Document {
  // Destinatário
  recipientId: mongoose.Types.ObjectId;
  recipientType: 'user' | 'company';
  
  // Tipo e conteúdo
  type: 'application_received' | 'application_status_changed' | 'interview_scheduled' | 
        'interview_reminder' | 'job_expired' | 'new_candidate' | 'payment_success' | 
        'payment_failed' | 'subscription_expiring' | 'simulation_completed' | 
        'profile_viewed' | 'new_message' | 'system_update' | 'welcome' | 'custom';
  
  title: string;
  message: string;
  description?: string;
  
  // Prioridade
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Status geral
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  
  // Canais de entrega
  channels: INotificationChannel[];
  
  // Dados dinâmicos
  data: INotificationData;
  
  // Template utilizado
  templateId?: string;
  templateVersion?: string;
  
  // Agendamento
  scheduledFor?: Date;
  deliveredAt?: Date;
  
  // Ações disponíveis
  actions?: {
    label: string;
    url: string;
    type: 'primary' | 'secondary';
  }[];
  
  // Expiração
  expiresAt?: Date;
  
  // Leitura/Visualização
  readAt?: Date;
  readBy?: mongoose.Types.ObjectId;
  
  // Relacionamentos
  relatedTo?: {
    type: 'job' | 'application' | 'payment' | 'simulation' | 'interview';
    id: mongoose.Types.ObjectId;
  };
  
  // Metadados
  metadata?: Record<string, any>;
  tags?: string[];
  
  // Tentativas e logs
  attempts: {
    attemptNumber: number;
    attemptedAt: Date;
    channel: string;
    status: 'success' | 'failed';
    errorMessage?: string;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationTemplate extends Document {
  name: string;
  description?: string;
  type: INotification['type'];
  
  // Versão do template
  version: string;
  isActive: boolean;
  
  // Conteúdo por canal
  templates: {
    email?: {
      subject: string;
      html: string;
      text?: string;
    };
    sms?: {
      message: string;
    };
    push?: {
      title: string;
      body: string;
      icon?: string;
      data?: Record<string, any>;
    };
    in_app?: {
      title: string;
      message: string;
      icon?: string;
    };
    whatsapp?: {
      message: string;
      template?: string;
    };
  };
  
  // Variáveis disponíveis
  variables: {
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    required: boolean;
    defaultValue?: any;
    description?: string;
  }[];
  
  // Configurações
  settings: {
    priority: INotification['priority'];
    expiresInHours?: number;
    maxAttempts: number;
    retryDelayMinutes: number;
    enableTracking: boolean;
  };
  
  // Metadados
  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationPreference extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Preferências por tipo de notificação
  preferences: {
    [key in INotification['type']]?: {
      enabled: boolean;
      channels: {
        email: boolean;
        sms: boolean;
        push: boolean;
        in_app: boolean;
        whatsapp: boolean;
      };
      frequency?: 'immediate' | 'daily' | 'weekly' | 'never';
      quietHours?: {
        enabled: boolean;
        start: string; // HH:mm
        end: string; // HH:mm
        timezone: string;
      };
    };
  };
  
  // Configurações globais
  globalSettings: {
    marketing: boolean;
    newsletter: boolean;
    systemUpdates: boolean;
    securityAlerts: boolean;
  };
  
  // Contatos
  contacts: {
    email: string;
    phone?: string;
    whatsapp?: string;
    pushTokens: {
      platform: 'web' | 'ios' | 'android';
      token: string;
      deviceId: string;
      isActive: boolean;
      lastUsed: Date;
    }[];
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const NotificationChannelSchema = new Schema({
  type: {
    type: String,
    enum: ['email', 'sms', 'push', 'in_app', 'whatsapp'],
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  address: String,
  lastSent: Date,
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'delivered', 'opened', 'clicked'],
    default: 'pending'
  },
  attempts: {
    type: Number,
    default: 0
  },
  errorMessage: String
});

const NotificationSchema = new Schema<INotification>({
  recipientId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientType'
  },
  recipientType: {
    type: String,
    enum: ['user', 'company'],
    required: true
  },
  
  type: {
    type: String,
    enum: [
      'application_received', 'application_status_changed', 'interview_scheduled',
      'interview_reminder', 'job_expired', 'new_candidate', 'payment_success',
      'payment_failed', 'subscription_expiring', 'simulation_completed',
      'profile_viewed', 'new_message', 'system_update', 'welcome', 'custom'
    ],
    required: true
  },
  
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  description: {
    type: String,
    maxlength: 2000
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'sent', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  channels: [NotificationChannelSchema],
  
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  templateId: String,
  templateVersion: String,
  
  scheduledFor: Date,
  deliveredAt: Date,
  
  actions: [{
    label: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['primary', 'secondary'],
      default: 'primary'
    }
  }],
  
  expiresAt: Date,
  
  readAt: Date,
  readBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  relatedTo: {
    type: {
      type: String,
      enum: ['job', 'application', 'payment', 'simulation', 'interview']
    },
    id: Schema.Types.ObjectId
  },
  
  metadata: Schema.Types.Mixed,
  tags: [String],
  
  attempts: [{
    attemptNumber: {
      type: Number,
      required: true
    },
    attemptedAt: {
      type: Date,
      default: Date.now
    },
    channel: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true
    },
    errorMessage: String
  }]
}, {
  timestamps: true
});

const NotificationTemplateSchema = new Schema<INotificationTemplate>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: [
      'application_received', 'application_status_changed', 'interview_scheduled',
      'interview_reminder', 'job_expired', 'new_candidate', 'payment_success',
      'payment_failed', 'subscription_expiring', 'simulation_completed',
      'profile_viewed', 'new_message', 'system_update', 'welcome', 'custom'
    ],
    required: true
  },
  
  version: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  templates: {
    email: {
      subject: String,
      html: String,
      text: String
    },
    sms: {
      message: String
    },
    push: {
      title: String,
      body: String,
      icon: String,
      data: Schema.Types.Mixed
    },
    in_app: {
      title: String,
      message: String,
      icon: String
    },
    whatsapp: {
      message: String,
      template: String
    }
  },
  
  variables: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['string', 'number', 'date', 'boolean'],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    defaultValue: Schema.Types.Mixed,
    description: String
  }],
  
  settings: {
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    expiresInHours: Number,
    maxAttempts: {
      type: Number,
      default: 3
    },
    retryDelayMinutes: {
      type: Number,
      default: 5
    },
    enableTracking: {
      type: Boolean,
      default: true
    }
  },
  
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

const NotificationPreferenceSchema = new Schema<INotificationPreference>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  preferences: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  globalSettings: {
    marketing: {
      type: Boolean,
      default: true
    },
    newsletter: {
      type: Boolean,
      default: true
    },
    systemUpdates: {
      type: Boolean,
      default: true
    },
    securityAlerts: {
      type: Boolean,
      default: true
    }
  },
  
  contacts: {
    email: {
      type: String,
      required: true
    },
    phone: String,
    whatsapp: String,
    pushTokens: [{
      platform: {
        type: String,
        enum: ['web', 'ios', 'android'],
        required: true
      },
      token: {
        type: String,
        required: true
      },
      deviceId: {
        type: String,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      },
      lastUsed: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Índices para Notification
NotificationSchema.index({ recipientId: 1, status: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, scheduledFor: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
NotificationSchema.index({ 'relatedTo.type': 1, 'relatedTo.id': 1 });

// Índices para NotificationTemplate
NotificationTemplateSchema.index({ type: 1, isActive: 1 });
NotificationTemplateSchema.index({ name: 1, version: 1 }, { unique: true });

// Métodos para Notification
NotificationSchema.methods.markAsRead = function(readBy?: mongoose.Types.ObjectId) {
  this.readAt = new Date();
  if (readBy) this.readBy = readBy;
  return this.save();
};

NotificationSchema.methods.addAttempt = function(channel: string, status: 'success' | 'failed', errorMessage?: string) {
  this.attempts.push({
    attemptNumber: this.attempts.length + 1,
    attemptedAt: new Date(),
    channel,
    status,
    errorMessage
  });
  
  // Atualiza o canal específico
  const channelIndex = this.channels.findIndex((c: any) => c.type === channel);
  if (channelIndex >= 0) {
    this.channels[channelIndex].attempts += 1;
    this.channels[channelIndex].status = status === 'success' ? 'sent' : 'failed';
    this.channels[channelIndex].lastSent = new Date();
    if (errorMessage) {
      this.channels[channelIndex].errorMessage = errorMessage;
    }
  }
  
  // Atualiza status geral
  const allChannelsFailed = this.channels.every((c: any) => c.status === 'failed');
  const anyChannelSent = this.channels.some((c: any) => c.status === 'sent');
  
  if (anyChannelSent) {
    this.status = 'sent';
    this.deliveredAt = new Date();
  } else if (allChannelsFailed) {
    this.status = 'failed';
  }
  
  return this.save();
};

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export const NotificationTemplate = mongoose.models.NotificationTemplate || mongoose.model<INotificationTemplate>('NotificationTemplate', NotificationTemplateSchema);
export const NotificationPreference = mongoose.models.NotificationPreference || mongoose.model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema);

export default Notification; 