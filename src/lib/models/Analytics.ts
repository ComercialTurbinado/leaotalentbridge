import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsMetric {
  name: string;
  value: number;
  unit?: string;
  change?: {
    value: number;
    percentage: number;
    period: string;
    direction: 'up' | 'down' | 'stable';
  };
  metadata?: Record<string, any>;
}

export interface IAnalyticsEvent extends Document {
  // Identificação
  eventType: 'page_view' | 'job_view' | 'application_submit' | 'profile_view' | 
            'search' | 'click' | 'download' | 'signup' | 'login' | 'payment' |
            'simulation_start' | 'simulation_complete' | 'interview_schedule' | 'custom';
  
  // Relacionamentos
  userId?: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  
  // Dados do evento
  data: {
    page?: string;
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    referrer?: string;
    userAgent?: string;
    ip?: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    device?: {
      type: 'mobile' | 'tablet' | 'desktop';
      os?: string;
      browser?: string;
    };
    duration?: number; // em segundos
    value?: number; // valor monetário se aplicável
    metadata?: Record<string, any>;
  };
  
  // Sessão
  sessionId?: string;
  
  // Timestamp
  timestamp: Date;
  
  createdAt: Date;
}

export interface IAnalyticsReport extends Document {
  // Identificação
  name: string;
  description?: string;
  type: 'jobs' | 'applications' | 'candidates' | 'companies' | 'payments' | 
        'simulations' | 'traffic' | 'conversion' | 'custom';
  
  // Proprietário
  companyId?: mongoose.Types.ObjectId; // null = admin report
  createdBy: mongoose.Types.ObjectId;
  
  // Configuração
  config: {
    dateRange: {
      start: Date;
      end: Date;
      period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
    };
    filters?: {
      jobIds?: mongoose.Types.ObjectId[];
      categories?: string[];
      locations?: string[];
      status?: string[];
      sources?: string[];
    };
    metrics: string[];
    groupBy?: string[];
    orderBy?: {
      field: string;
      direction: 'asc' | 'desc';
    };
    limit?: number;
  };
  
  // Dados do relatório
  data: {
    summary: IAnalyticsMetric[];
    charts: {
      type: 'line' | 'bar' | 'pie' | 'area' | 'funnel';
      title: string;
      data: {
        labels: string[];
        datasets: {
          label: string;
          data: number[];
          color?: string;
        }[];
      };
    }[];
    tables: {
      title: string;
      headers: string[];
      rows: any[][];
    }[];
  };
  
  // Status
  status: 'generating' | 'completed' | 'failed' | 'scheduled';
  
  // Agendamento
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0-6 (domingo-sábado)
    dayOfMonth?: number; // 1-31
    time: string; // HH:mm
    timezone: string;
    recipients: string[]; // emails
    isActive: boolean;
  };
  
  // Metadados
  generatedAt?: Date;
  executionTime?: number; // em millisegundos
  recordCount?: number;
  fileUrl?: string; // para relatórios exportados
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalyticsDashboard extends Document {
  // Identificação
  name: string;
  description?: string;
  
  // Proprietário
  companyId?: mongoose.Types.ObjectId; // null = admin dashboard
  createdBy: mongoose.Types.ObjectId;
  
  // Configuração
  config: {
    layout: {
      columns: number;
      widgets: {
        id: string;
        type: 'metric' | 'chart' | 'table' | 'funnel' | 'heatmap';
        title: string;
        position: {
          x: number;
          y: number;
          width: number;
          height: number;
        };
        config: {
          metric?: string;
          chartType?: 'line' | 'bar' | 'pie' | 'area';
          timeRange?: string;
          filters?: Record<string, any>;
          refreshInterval?: number; // em minutos
        };
      }[];
    };
    refreshInterval: number; // em minutos
    autoRefresh: boolean;
  };
  
  // Controle de acesso
  isPublic: boolean;
  sharedWith?: {
    userId: mongoose.Types.ObjectId;
    permissions: ('view' | 'edit')[];
  }[];
  
  // Metadados
  lastViewed?: Date;
  viewCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalyticsAlert extends Document {
  // Identificação
  name: string;
  description?: string;
  
  // Proprietário
  companyId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  
  // Condições
  conditions: {
    metric: string;
    operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 
             'greater_than_or_equal' | 'less_than_or_equal' | 'change_by';
    value: number;
    timeframe: string; // '1h', '24h', '7d', etc.
    compareWith?: 'previous_period' | 'same_period_last_week' | 'same_period_last_month';
  }[];
  
  // Ações
  actions: {
    type: 'email' | 'webhook' | 'slack';
    config: {
      recipients?: string[];
      webhookUrl?: string;
      slackChannel?: string;
      message?: string;
    };
  }[];
  
  // Status
  isActive: boolean;
  lastTriggered?: Date;
  triggerCount: number;
  
  // Configurações
  cooldownMinutes: number; // tempo mínimo entre alertas
  
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>({
  eventType: {
    type: String,
    enum: [
      'page_view', 'job_view', 'application_submit', 'profile_view',
      'search', 'click', 'download', 'signup', 'login', 'payment',
      'simulation_start', 'simulation_complete', 'interview_schedule', 'custom'
    ],
    required: true
  },
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job'
  },
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application'
  },
  
  data: {
    page: String,
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String,
    referrer: String,
    userAgent: String,
    ip: String,
    location: {
      country: String,
      region: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    device: {
      type: {
        type: String,
        enum: ['mobile', 'tablet', 'desktop']
      },
      os: String,
      browser: String
    },
    duration: Number,
    value: Number,
    metadata: Schema.Types.Mixed
  },
  
  sessionId: String,
  
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const AnalyticsReportSchema = new Schema<IAnalyticsReport>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['jobs', 'applications', 'candidates', 'companies', 'payments', 
           'simulations', 'traffic', 'conversion', 'custom'],
    required: true
  },
  
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  config: {
    dateRange: {
      start: {
        type: Date,
        required: true
      },
      end: {
        type: Date,
        required: true
      },
      period: {
        type: String,
        enum: ['day', 'week', 'month', 'quarter', 'year', 'custom'],
        required: true
      }
    },
    filters: {
      jobIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Job'
      }],
      categories: [String],
      locations: [String],
      status: [String],
      sources: [String]
    },
    metrics: {
      type: [String],
      required: true
    },
    groupBy: [String],
    orderBy: {
      field: String,
      direction: {
        type: String,
        enum: ['asc', 'desc']
      }
    },
    limit: Number
  },
  
  data: {
    summary: [{
      name: String,
      value: Number,
      unit: String,
      change: {
        value: Number,
        percentage: Number,
        period: String,
        direction: {
          type: String,
          enum: ['up', 'down', 'stable']
        }
      },
      metadata: Schema.Types.Mixed
    }],
    charts: [{
      type: {
        type: String,
        enum: ['line', 'bar', 'pie', 'area', 'funnel']
      },
      title: String,
      data: {
        labels: [String],
        datasets: [{
          label: String,
          data: [Number],
          color: String
        }]
      }
    }],
    tables: [{
      title: String,
      headers: [String],
      rows: [[Schema.Types.Mixed]]
    }]
  },
  
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed', 'scheduled'],
    default: 'generating'
  },
  
  schedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31
    },
    time: String,
    timezone: String,
    recipients: [String],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  generatedAt: Date,
  executionTime: Number,
  recordCount: Number,
  fileUrl: String
}, {
  timestamps: true
});

const AnalyticsDashboardSchema = new Schema<IAnalyticsDashboard>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  config: {
    layout: {
      columns: {
        type: Number,
        default: 12
      },
      widgets: [{
        id: {
          type: String,
          required: true
        },
        type: {
          type: String,
          enum: ['metric', 'chart', 'table', 'funnel', 'heatmap'],
          required: true
        },
        title: {
          type: String,
          required: true
        },
        position: {
          x: Number,
          y: Number,
          width: Number,
          height: Number
        },
        config: {
          metric: String,
          chartType: {
            type: String,
            enum: ['line', 'bar', 'pie', 'area']
          },
          timeRange: String,
          filters: Schema.Types.Mixed,
          refreshInterval: Number
        }
      }]
    },
    refreshInterval: {
      type: Number,
      default: 5
    },
    autoRefresh: {
      type: Boolean,
      default: true
    }
  },
  
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: [{
      type: String,
      enum: ['view', 'edit']
    }]
  }],
  
  lastViewed: Date,
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const AnalyticsAlertSchema = new Schema<IAnalyticsAlert>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  conditions: [{
    metric: {
      type: String,
      required: true
    },
    operator: {
      type: String,
      enum: ['greater_than', 'less_than', 'equals', 'not_equals', 
             'greater_than_or_equal', 'less_than_or_equal', 'change_by'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    timeframe: {
      type: String,
      required: true
    },
    compareWith: {
      type: String,
      enum: ['previous_period', 'same_period_last_week', 'same_period_last_month']
    }
  }],
  
  actions: [{
    type: {
      type: String,
      enum: ['email', 'webhook', 'slack'],
      required: true
    },
    config: {
      recipients: [String],
      webhookUrl: String,
      slackChannel: String,
      message: String
    }
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggered: Date,
  triggerCount: {
    type: Number,
    default: 0
  },
  
  cooldownMinutes: {
    type: Number,
    default: 60
  }
}, {
  timestamps: true
});

// Índices para AnalyticsEvent
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ companyId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ jobId: 1, eventType: 1 });
AnalyticsEventSchema.index({ sessionId: 1, timestamp: 1 });
AnalyticsEventSchema.index({ timestamp: -1 });

// Índices para AnalyticsReport
AnalyticsReportSchema.index({ companyId: 1, type: 1 });
AnalyticsReportSchema.index({ createdBy: 1, createdAt: -1 });
AnalyticsReportSchema.index({ status: 1, 'schedule.isActive': 1 });

// Índices para AnalyticsDashboard
AnalyticsDashboardSchema.index({ companyId: 1, createdBy: 1 });
AnalyticsDashboardSchema.index({ isPublic: 1 });

// Índices para AnalyticsAlert
AnalyticsAlertSchema.index({ companyId: 1, isActive: 1 });
AnalyticsAlertSchema.index({ isActive: 1, lastTriggered: 1 });

// Métodos para AnalyticsEvent
AnalyticsEventSchema.statics.trackEvent = function(eventData: Partial<IAnalyticsEvent>) {
  return this.create({
    ...eventData,
    timestamp: new Date()
  });
};

// Métodos para AnalyticsAlert
AnalyticsAlertSchema.methods.trigger = function() {
  this.lastTriggered = new Date();
  this.triggerCount += 1;
  return this.save();
};

AnalyticsAlertSchema.methods.canTrigger = function(): boolean {
  if (!this.lastTriggered) return true;
  
  const cooldownMs = this.cooldownMinutes * 60 * 1000;
  const timeSinceLastTrigger = Date.now() - this.lastTriggered.getTime();
  
  return timeSinceLastTrigger >= cooldownMs;
};

export const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);
export const AnalyticsReport = mongoose.models.AnalyticsReport || mongoose.model<IAnalyticsReport>('AnalyticsReport', AnalyticsReportSchema);
export const AnalyticsDashboard = mongoose.models.AnalyticsDashboard || mongoose.model<IAnalyticsDashboard>('AnalyticsDashboard', AnalyticsDashboardSchema);
export const AnalyticsAlert = mongoose.models.AnalyticsAlert || mongoose.model<IAnalyticsAlert>('AnalyticsAlert', AnalyticsAlertSchema);

export default AnalyticsEvent; 