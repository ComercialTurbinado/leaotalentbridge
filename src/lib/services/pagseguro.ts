// Serviço de integração com PagSeguro - API Moderna (Checkout Transparente)
// Documentação: https://developer.pagbank.com.br/
// Usa API KEY e SECRET KEY com Basic Authentication

interface CreateCheckoutData {
  userId?: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  amount: number;
  installments?: number;
  paymentMethod: 'credit' | 'pix';
  metadata?: Record<string, any>;
}

// Configuração do PagSeguro - API Internacional
// Aceita API KEY e SECRET KEY do myaccount.international.pagseguro.com
const PAGSEGURO_API_KEY = process.env.PAGSEGURO_API_KEY || process.env.PAGSEGURO_EMAIL || '';
const PAGSEGURO_SECRET_KEY = process.env.PAGSEGURO_SECRET_KEY || process.env.PAGSEGURO_TOKEN || '';

const PAGSEGURO_ENV = process.env.PAGSEGURO_ENV || 'production'; // 'sandbox' ou 'production'

// URLs da API Internacional do PagSeguro
// API Internacional aceita API KEY/SECRET KEY
const PAGSEGURO_API_URL = PAGSEGURO_ENV === 'sandbox'
  ? 'https://sandbox.api.international.pagseguro.com'
  : 'https://api.international.pagseguro.com';

// Criar Basic Auth header
const getAuthHeader = () => {
  const credentials = `${PAGSEGURO_API_KEY}:${PAGSEGURO_SECRET_KEY}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

// Validar configuração
if (!PAGSEGURO_API_KEY || !PAGSEGURO_SECRET_KEY) {
  console.warn('⚠️ AVISO: Credenciais do PagSeguro não configuradas!');
  console.warn('Configure no AWS Amplify:');
  console.warn('  - PAGSEGURO_API_KEY: sua API key (de myaccount.international.pagseguro.com)');
  console.warn('  - PAGSEGURO_SECRET_KEY: sua Secret key (de myaccount.international.pagseguro.com)');
} else {
  console.log('✅ PagSeguro configurado (API Internacional):', {
    env: PAGSEGURO_ENV,
    apiKeyLength: PAGSEGURO_API_KEY.length,
    secretKeyLength: PAGSEGURO_SECRET_KEY.length,
    apiUrl: PAGSEGURO_API_URL
  });
}

/**
 * Cria um pedido (order) no PagSeguro - API Moderna
 * Para PIX: retorna QR Code
 * Para Cartão: retorna dados para processar no frontend
 */
export async function createCheckout(
  data: CreateCheckoutData
): Promise<{ 
  checkoutCode: string; 
  checkoutUrl?: string; 
  qrCode?: string; 
  qrCodeText?: string;
  orderId?: string;
}> {
  if (!PAGSEGURO_API_KEY || !PAGSEGURO_SECRET_KEY) {
    throw new Error('PagSeguro não configurado. Configure PAGSEGURO_API_KEY e PAGSEGURO_SECRET_KEY no AWS Amplify.\n' +
      'Obtenha em: https://myaccount.international.pagseguro.com/configuration/credentials');
  }

  try {
    console.log('=== CRIANDO PEDIDO NO PAGSEGURO (API MODERNA) ===');
    console.log('Dados:', JSON.stringify(data, null, 2));

    // Preparar dados do pedido
    const orderData: any = {
      reference_id: data.metadata?.paymentId || `PAY-${Date.now()}`,
      customer: {
        name: data.userName,
        email: data.userEmail,
      },
      items: [
        {
          reference_id: data.planId,
          name: data.planName,
          quantity: 1,
          unit_amount: Math.round(data.amount * 100), // Converter para centavos
        },
      ],
    };

    // Adicionar método de pagamento
    if (data.paymentMethod === 'pix') {
      // Pagamento via PIX - criar cobrança PIX
      orderData.qr_codes = [
        {
          amount: {
            value: Math.round(data.amount * 100),
          },
        },
      ];
    } else {
      // Pagamento via cartão de crédito
      // Para checkout transparente, criamos o pedido primeiro
      // O cartão será capturado em uma etapa separada via API de charges
      // Por enquanto, criamos o pedido sem charge para retornar orderId
      // O frontend precisará criar a charge depois com os dados do cartão
    }

    // Fazer requisição para criar pedido
    // Tentar com Basic Auth primeiro (API moderna)
    let response = await fetch(`${PAGSEGURO_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
        'x-api-version': '4.0',
      },
      body: JSON.stringify(orderData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Se der 401, pode ser que a API precise de outro formato
    if (response.status === 401) {
      console.log('⚠️ 401 Unauthorized - Tentando formato alternativo...');
      // Tentar sem x-api-version ou com formato diferente
      response = await fetch(`${PAGSEGURO_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
        },
        body: JSON.stringify(orderData),
      });
      console.log('Response status (tentativa 2):', response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao criar pedido:', errorText);
      console.error('URL:', `${PAGSEGURO_API_URL}/orders`);
      console.error('Auth Header:', getAuthHeader().substring(0, 20) + '...');
      console.error('API Key length:', PAGSEGURO_API_KEY.length);
      console.error('Secret Key length:', PAGSEGURO_SECRET_KEY.length);
      console.error('Environment:', PAGSEGURO_ENV);
      
      let errorMessage = `Falha ao criar pedido no PagSeguro (Status: ${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          errorMessage += `: ${errorJson.message}`;
        }
        if (errorJson.errors) {
          errorMessage += ` - ${JSON.stringify(errorJson.errors)}`;
        }
      } catch (e) {
        errorMessage += `: ${errorText}`;
      }
      
      // Mensagem mais específica para 401
      if (response.status === 401) {
        errorMessage += '\n\n⚠️ Erro de autenticação (401). Verifique:';
        errorMessage += '\n- Se as credenciais estão corretas no AWS Amplify';
        errorMessage += '\n- Se PAGSEGURO_ENV está correto (sandbox/production)';
        errorMessage += '\n- Se as credenciais correspondem ao ambiente configurado';
      }
      
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));

    // Extrair informações do pedido
    const orderId = responseData.id || responseData.reference_id;
    
    // Se for PIX, extrair QR Code
    let qrCode: string | undefined;
    let qrCodeText: string | undefined;
    
    if (data.paymentMethod === 'pix' && responseData.qr_codes && responseData.qr_codes.length > 0) {
      qrCode = responseData.qr_codes[0].links?.[0]?.href || responseData.qr_codes[0].text;
      qrCodeText = responseData.qr_codes[0].text;
    }

    // Para checkout transparente, não há URL de redirecionamento tradicional
    // O pagamento é processado no próprio site
    const checkoutUrl = data.paymentMethod === 'pix' 
      ? undefined 
      : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://uaecareers.com'}/${data.metadata?.userType || 'candidato'}/pagamento/processar?orderId=${orderId}`;

    console.log('✅ Pedido criado com sucesso:', {
      orderId,
      qrCode: qrCode ? 'Gerado' : 'N/A',
      checkoutUrl: checkoutUrl || 'N/A'
    });

    return {
      checkoutCode: orderId,
      checkoutUrl: checkoutUrl || '',
      qrCode,
      qrCodeText,
      orderId,
    };
  } catch (error: any) {
    console.error('=== ERRO AO CRIAR PEDIDO NO PAGSEGURO ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    throw error;
  }
}

/**
 * Verifica o status de um pagamento no PagSeguro
 */
export async function getPaymentStatus(transactionCode: string): Promise<{
  status: string;
  reference: string;
  amount: number;
  orderData?: any;
}> {
  if (!PAGSEGURO_API_KEY || !PAGSEGURO_SECRET_KEY) {
    throw new Error('PagSeguro não configurado. Configure PAGSEGURO_API_KEY e PAGSEGURO_SECRET_KEY.');
  }

  try {
    const response = await fetch(`${PAGSEGURO_API_URL}/orders/${transactionCode}`, {
      headers: {
        'Authorization': getAuthHeader(),
        'x-api-version': '4.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao consultar pedido: ${response.status}`);
    }

    const data = await response.json();
    
    // Extrair status e valores
    const status = data.status || 'unknown';
    const reference = data.reference_id || '';
    const amount = data.charges?.[0]?.amount?.value 
      ? data.charges[0].amount.value / 100 
      : (data.items?.[0]?.unit_amount ? data.items[0].unit_amount / 100 : 0);

    return {
      status,
      reference,
      amount,
      orderData: data,
    };
  } catch (error: any) {
    console.error('Erro ao consultar status:', error);
    throw error;
  }
}

/**
 * Mapeia status do PagSeguro para status interno
 */
export function mapPagSeguroStatus(pagSeguroStatus: string): 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' {
  const statusMap: Record<string, 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'> = {
    'IN_ANALYSIS': 'processing',
    'PAID': 'completed',
    'CANCELED': 'cancelled',
    'DECLINED': 'failed',
    'REFUNDED': 'refunded',
    'PARTIAL_REFUNDED': 'refunded',
    'PENDING': 'pending',
    'IN_USE': 'processing',
    'AVAILABLE': 'completed',
  };

  return statusMap[pagSeguroStatus] || 'pending';
}
