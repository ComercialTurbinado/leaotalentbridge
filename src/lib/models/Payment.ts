import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentMethod {
  type: 'credit_card' | 'bank_transfer' | 'paypal' | 'stripe' | 'apple_pay' | 'google_pay';
  provider: string; // Stripe, PayPal, etc.
  providerId: string; // ID do método no provedor
  last4?: string; // Últimos 4 dígitos do cartão
  brand?: string; // Visa, MasterCard, etc.
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface IPaymentInvoice {
  invoiceId: string;
  amount: number;
  currency: string;
  description: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  tax?: {
    name: string;
    rate: number;
    amount: number;
  };
  discount?: {
    name: string;
    amount: number;
    type: 'fixed' | 'percentage';
  };
  subtotal: number;
  total: number;
  dueDate: Date;
  paidDate?: Date;
  url?: string;
}

export interface IPayment extends Document {
  companyId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Usuário que fez o pagamento
  // Dados de convidado (para pagamentos sem autenticação)
  guestEmail?: string; // Email do usuário não autenticado
  guestName?: string; // Nome do usuário não autenticado
  
  // Identificação do pagamento
  paymentId: string; // ID único do pagamento
  transactionId?: string; // ID da transação no gateway
  
  // Tipo e propósito
  type: 'subscription' | 'job_posting' | 'featured_job' | 'premium_search' | 'consultation' | 'one_time';
  purpose: string; // Descrição do que está sendo pago
  
  // Valores
  amount: number;
  currency: string;
  originalAmount?: number; // Para conversões de moeda
  originalCurrency?: string;
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  
  // Método de pagamento
  paymentMethod: IPaymentMethod;
  
  // Gateway de pagamento
  gateway: 'stripe' | 'paypal' | 'bank_transfer' | 'manual' | 'mercadopago';
  gatewayResponse?: {
    id: string;
    status: string;
    message?: string;
    metadata?: Record<string, any>;
  };
  
  // Fatura
  invoice?: IPaymentInvoice;
  
  // Datas importantes
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  
  // Tentativas de pagamento
  attempts: {
    attemptNumber: number;
    attemptedAt: Date;
    status: 'success' | 'failed';
    errorCode?: string;
    errorMessage?: string;
    gatewayResponse?: Record<string, any>;
  }[];
  
  // Reembolsos
  refunds: {
    refundId: string;
    amount: number;
    reason: string;
    status: 'pending' | 'completed' | 'failed';
    processedAt: Date;
    processedBy?: mongoose.Types.ObjectId;
  }[];
  
  // Assinatura relacionada (se aplicável)
  subscriptionId?: mongoose.Types.ObjectId;
  
  // Metadados adicionais
  metadata?: Record<string, any>;
  
  // Notificações
  notificationsSent: {
    type: 'payment_success' | 'payment_failed' | 'payment_refunded';
    sentAt: Date;
    channel: 'email' | 'sms' | 'push';
    status: 'sent' | 'failed';
  }[];
  
  updatedAt: Date;
}

export interface ISubscription extends Document {
  companyId: mongoose.Types.ObjectId;
  
  // Plano
  planId: string;
  planName: string;
  planType: 'basic' | 'premium' | 'enterprise';
  
  // Status
  status: 'active' | 'cancelled' | 'expired' | 'suspended' | 'trial';
  
  // Datas
  startDate: Date;
  endDate: Date;
  trialEndDate?: Date;
  cancelledAt?: Date;
  
  // Cobrança
  amount: number;
  currency: string;
  billingPeriod: 'monthly' | 'annual';
  nextBillingDate: Date;
  
  // Recursos incluídos
  features: {
    maxJobs: number;
    maxCandidates: number;
    featuredJobs: number;
    prioritySupport: boolean;
    analyticsAccess: boolean;
    apiAccess: boolean;
    customBranding: boolean;
  };
  
  // Uso atual
  usage: {
    jobsUsed: number;
    candidatesSearched: number;
    featuredJobsUsed: number;
    apiCallsUsed: number;
  };
  
  // Histórico de pagamentos
  paymentHistory: mongoose.Types.ObjectId[]; // Referências para Payment
  
  // Gateway de pagamento
  gatewaySubscriptionId?: string;
  
  // Auto-renovação
  autoRenew: boolean;
  
  // Metadados
  metadata?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

const PaymentMethodSchema = new Schema({
  type: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'paypal', 'stripe', 'apple_pay', 'google_pay'],
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  providerId: {
    type: String,
    required: false // Será preenchido após criar preferência no gateway
  },
  last4: String,
  brand: String,
  expiryMonth: Number,
  expiryYear: Number,
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: Schema.Types.Mixed
});

const PaymentInvoiceSchema = new Schema({
  invoiceId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  tax: {
    name: String,
    rate: Number,
    amount: Number
  },
  discount: {
    name: String,
    amount: Number,
    type: {
      type: String,
      enum: ['fixed', 'percentage']
    }
  },
  subtotal: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: Date,
  url: String
});

const PaymentSchema = new Schema<IPayment>({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: false // Opcional para pagamentos de convidados
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // Dados de convidado (para pagamentos sem autenticação)
  guestEmail: String,
  guestName: String,
  
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  transactionId: String,
  
  type: {
    type: String,
    enum: ['subscription', 'job_posting', 'featured_job', 'premium_search', 'consultation', 'one_time'],
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'AED'
  },
  originalAmount: Number,
  originalCurrency: String,
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  
  paymentMethod: {
    type: PaymentMethodSchema,
    required: true
  },
  
  gateway: {
    type: String,
    enum: ['stripe', 'paypal', 'bank_transfer', 'manual', 'mercadopago', 'pagseguro'],
    required: true
  },
  gatewayResponse: {
    id: String,
    status: String,
    message: String,
    metadata: Schema.Types.Mixed
  },
  
  invoice: PaymentInvoiceSchema,
  
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  refundedAt: Date,
  
  attempts: [{
    attemptNumber: {
      type: Number,
      required: true
    },
    attemptedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true
    },
    errorCode: String,
    errorMessage: String,
    gatewayResponse: Schema.Types.Mixed
  }],
  
  refunds: [{
    refundId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    processedAt: {
      type: Date,
      default: Date.now
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  
  metadata: Schema.Types.Mixed,
  
  notificationsSent: [{
    type: {
      type: String,
      enum: ['payment_success', 'payment_failed', 'payment_refunded'],
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    channel: {
      type: String,
      enum: ['email', 'sms', 'push'],
      required: true
    },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      required: true
    }
  }]
}, {
  timestamps: true
});

const SubscriptionSchema = new Schema<ISubscription>({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  planId: {
    type: String,
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  planType: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    required: true
  },
  
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'suspended', 'trial'],
    default: 'trial'
  },
  
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  trialEndDate: Date,
  cancelledAt: Date,
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'AED'
  },
  billingPeriod: {
    type: String,
    enum: ['monthly', 'annual'],
    required: true
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  
  features: {
    maxJobs: {
      type: Number,
      required: true
    },
    maxCandidates: {
      type: Number,
      required: true
    },
    featuredJobs: {
      type: Number,
      default: 0
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    analyticsAccess: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    },
    customBranding: {
      type: Boolean,
      default: false
    }
  },
  
  usage: {
    jobsUsed: {
      type: Number,
      default: 0
    },
    candidatesSearched: {
      type: Number,
      default: 0
    },
    featuredJobsUsed: {
      type: Number,
      default: 0
    },
    apiCallsUsed: {
      type: Number,
      default: 0
    }
  },
  
  paymentHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'Payment'
  }],
  
  gatewaySubscriptionId: String,
  
  autoRenew: {
    type: Boolean,
    default: true
  },
  
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Índices para Payment
PaymentSchema.index({ companyId: 1, status: 1 });
// paymentId já tem unique: true, não precisa de índice adicional
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ type: 1, status: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ 'gateway': 1, 'gatewayResponse.id': 1 });

// Índices para Subscription
SubscriptionSchema.index({ companyId: 1, status: 1 });
SubscriptionSchema.index({ planType: 1, status: 1 });
SubscriptionSchema.index({ nextBillingDate: 1, status: 1 });
SubscriptionSchema.index({ endDate: 1, status: 1 });

// Middleware para gerar paymentId único
PaymentSchema.pre('save', function(next) {
  if (this.isNew && !this.paymentId) {
    this.paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Métodos para Payment
PaymentSchema.methods.addAttempt = function(status: 'success' | 'failed', errorCode?: string, errorMessage?: string) {
  this.attempts.push({
    attemptNumber: this.attempts.length + 1,
    attemptedAt: new Date(),
    status,
    errorCode,
    errorMessage
  });
  
  if (status === 'success') {
    this.status = 'completed';
    this.completedAt = new Date();
  } else {
    this.status = 'failed';
    this.failedAt = new Date();
  }
  
  return this.save();
};

PaymentSchema.methods.addRefund = function(amount: number, reason: string, processedBy?: mongoose.Types.ObjectId) {
  const refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  this.refunds.push({
    refundId,
    amount,
    reason,
    status: 'completed',
    processedAt: new Date(),
    processedBy
  });
  
  const totalRefunded = this.refunds.reduce((sum: number, refund: { amount: number }) => sum + refund.amount, 0);
  
  if (totalRefunded >= this.amount) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }
  
  this.refundedAt = new Date();
  
  return this.save();
};

// Métodos para Subscription
SubscriptionSchema.methods.updateUsage = function(type: keyof ISubscription['usage'], amount: number) {
  this.usage[type] = (this.usage[type] || 0) + amount;
  return this.save();
};

SubscriptionSchema.methods.canUseFeature = function(feature: string, amount: number = 1): boolean {
  switch (feature) {
    case 'jobs':
      return this.usage.jobsUsed + amount <= this.features.maxJobs;
    case 'candidates':
      return this.usage.candidatesSearched + amount <= this.features.maxCandidates;
    case 'featured_jobs':
      return this.usage.featuredJobsUsed + amount <= this.features.featuredJobs;
    default:
      return true;
  }
};

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export const Subscription = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Payment; 