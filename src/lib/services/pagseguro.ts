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
// Credenciais hardcoded (do cliente)
const PAGSEGURO_API_KEY = process.env.PAGSEGURO_API_KEY || '7f3fafd67ebb4204bcd3d7f4f28ae23d';
const PAGSEGURO_SECRET_KEY = process.env.PAGSEGURO_SECRET_KEY || '88b173f9a3e5414fbd805901cc86528a';

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
    console.log('=== CRIANDO TRANSAÇÃO NO PAGSEGURO (API INTERNACIONAL v3) ===');
    console.log('Dados:', JSON.stringify(data, null, 2));

    // Preparar dados da transação conforme documentação:
    // https://developers.international.pagseguro.com/reference/create-transaction
    const transactionData: any = {
      reference: data.metadata?.paymentId || `PAY-${Date.now()}`,
      amount: {
        value: Math.round(data.amount * 100), // Converter para centavos
        currency: 'BRL',
      },
      description: data.planName,
      customer: {
        name: data.userName,
        email: data.userEmail,
      },
    };

    // Adicionar método de pagamento
    if (data.paymentMethod === 'pix') {
      // Pagamento via PIX
      // Nota: A API Internacional pode não suportar PIX diretamente
      // Pode ser necessário usar outra API ou método
      transactionData.payment_method = {
        type: 'PIX',
      };
    } else {
      // Pagamento via cartão de crédito
      // Para checkout transparente, o cartão será processado no frontend
      // Por enquanto, criamos a transação sem dados do cartão
      // O frontend precisará processar o cartão depois
      transactionData.payment_method = {
        type: 'CREDIT_CARD',
      };
    }

    // Fazer requisição para criar transação
    // Seguindo documentação: https://developers.international.pagseguro.com/reference/create-transaction
    // Endpoint: POST /v3/transactions
    let response = await fetch(`${PAGSEGURO_API_URL}/v3/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify(orderData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao criar pedido:', errorText);
      console.error('URL:', `${PAGSEGURO_API_URL}/v3/transactions`);
      console.error('Auth Header:', getAuthHeader().substring(0, 20) + '...');
      console.error('API Key length:', PAGSEGURO_API_KEY.length);
      console.error('Secret Key length:', PAGSEGURO_SECRET_KEY.length);
      console.error('Environment:', PAGSEGURO_ENV);
      
      let errorMessage = `Falha ao criar transação no PagSeguro (Status: ${response.status})`;
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

    // Extrair informações da transação
    // A resposta da API v3/transactions retorna um objeto com código da transação
    const transactionCode = responseData.code || responseData.id || responseData.reference;
    
    // Se for PIX, extrair QR Code (se disponível na resposta)
    let qrCode: string | undefined;
    let qrCodeText: string | undefined;
    
    if (data.paymentMethod === 'pix' && responseData.qr_code) {
      qrCode = responseData.qr_code;
      qrCodeText = responseData.qr_code;
    }

    // Para checkout transparente, não há URL de redirecionamento
    // O pagamento é processado no próprio site
    const checkoutUrl = data.paymentMethod === 'pix' 
      ? undefined 
      : undefined; // Cartão será processado no frontend, não precisa de URL

    console.log('✅ Transação criada com sucesso:', {
      transactionCode,
      qrCode: qrCode ? 'Gerado' : 'N/A',
      checkoutUrl: checkoutUrl || 'N/A'
    });

    return {
      checkoutCode: transactionCode,
      checkoutUrl: checkoutUrl || '',
      qrCode,
      qrCodeText,
      orderId: transactionCode,
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
    // Endpoint para buscar transação: GET /v3/transactions/{transactionCode}
    const response = await fetch(`${PAGSEGURO_API_URL}/v3/transactions/${transactionCode}`, {
      headers: {
        'Authorization': getAuthHeader(),
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
