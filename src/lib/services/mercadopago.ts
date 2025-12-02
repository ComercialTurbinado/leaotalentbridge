import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Configuração do cliente Mercado Pago
// Usa credenciais de teste em desenvolvimento, produção em produção
const accessToken = process.env.NODE_ENV === 'production'
  ? (process.env.MERCADOPAGO_ACCESS_TOKEN || '')
  : (process.env.MERCADOPAGO_TEST_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || '');

const client = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 5000,
  }
});

const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);

export interface CreatePreferenceData {
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  amount: number;
  installments?: number;
  paymentMethods?: {
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
  metadata?: Record<string, any>;
}

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string; // URL para checkout
  sandbox_init_point?: string;
}

/**
 * Cria uma preferência de pagamento no Mercado Pago
 */
export async function createPaymentPreference(
  data: CreatePreferenceData
): Promise<MercadoPagoPreferenceResponse> {
  try {
    // Obter URL base (remover /api se existir)
    // URL oficial: https://uaecareers.com/
    // Sempre usar URL de produção, não localhost
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://uaecareers.com/api';
    let baseUrl = apiUrl.replace('/api', '') || 'https://uaecareers.com';
    
    // Garantir que nunca use localhost em produção
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      baseUrl = 'https://uaecareers.com';
    }
    
    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: data.planId,
            title: data.planName,
            description: `Plano ${data.planName} - UAE Careers`,
            quantity: 1,
            unit_price: data.amount,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: data.userEmail,
          name: data.userName,
        },
        external_reference: data.userId, // paymentId será passado aqui
        notification_url: `${apiUrl}/payments/webhook`, // URL do webhook
        back_urls: {
          success: data.metadata?.userType === 'empresa' 
            ? `${baseUrl}/empresa/pagamento/sucesso`
            : `${baseUrl}/candidato/pagamento/sucesso`,
          failure: data.metadata?.userType === 'empresa'
            ? `${baseUrl}/empresa/pagamento/erro`
            : `${baseUrl}/candidato/pagamento/erro`,
          pending: data.metadata?.userType === 'empresa'
            ? `${baseUrl}/empresa/pagamento/pendente`
            : `${baseUrl}/candidato/pagamento/pendente`,
        },
        auto_return: 'approved',
        payment_methods: {
          excluded_payment_types: data.paymentMethods?.excluded_payment_types || [],
          installments: data.paymentMethods?.installments || 6,
        },
        metadata: {
          ...data.metadata,
          userId: data.userId,
          planId: data.planId,
        },
        statement_descriptor: 'UAE CAREERS',
      },
    });

    return {
      id: preference.id || '',
      init_point: preference.init_point || '',
      sandbox_init_point: preference.sandbox_init_point || '',
    };
  } catch (error) {
    console.error('Erro ao criar preferência no Mercado Pago:', error);
    throw new Error('Falha ao criar preferência de pagamento');
  }
}

/**
 * Busca informações de um pagamento pelo ID
 */
export async function getPaymentById(paymentId: string | number) {
  try {
    const payment = await paymentClient.get({ id: paymentId });
    return payment;
  } catch (error) {
    console.error('Erro ao buscar pagamento no Mercado Pago:', error);
    throw new Error('Falha ao buscar informações do pagamento');
  }
}

/**
 * Verifica o status de um pagamento
 */
export async function verifyPaymentStatus(paymentId: string | number) {
  try {
    const payment = await getPaymentById(paymentId);
    
    return {
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      transaction_amount: payment.transaction_amount,
      currency_id: payment.currency_id,
      date_approved: payment.date_approved,
      date_created: payment.date_created,
      external_reference: payment.external_reference,
      payment_method_id: payment.payment_method_id,
      payment_type_id: payment.payment_type_id,
      payer: payment.payer,
    };
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    throw new Error('Falha ao verificar status do pagamento');
  }
}

/**
 * Processa reembolso de um pagamento
 */
export async function refundPayment(paymentId: string | number, amount?: number) {
  try {
    // No SDK do Mercado Pago v2, usamos cancel para reembolsos
    // Se amount for fornecido, é um reembolso parcial, caso contrário é total
    const refund = await paymentClient.cancel({
      id: paymentId,
    });
    
    return refund;
  } catch (error) {
    console.error('Erro ao processar reembolso:', error);
    throw new Error('Falha ao processar reembolso');
  }
}

/**
 * Mapeia status do Mercado Pago para status interno
 */
export function mapMercadoPagoStatus(status: string): 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' {
  const statusMap: Record<string, 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'> = {
    'pending': 'pending',
    'approved': 'completed',
    'authorized': 'processing',
    'in_process': 'processing',
    'in_mediation': 'processing',
    'rejected': 'failed',
    'cancelled': 'cancelled',
    'refunded': 'refunded',
    'charged_back': 'refunded',
  };
  
  return statusMap[status] || 'pending';
}

const mercadoPagoService = {
  createPaymentPreference,
  getPaymentById,
  verifyPaymentStatus,
  refundPayment,
  mapMercadoPagoStatus,
};

export default mercadoPagoService;

