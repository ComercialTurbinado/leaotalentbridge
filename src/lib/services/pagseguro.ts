// Serviço de integração com PagSeguro
// Documentação: https://dev.pagseguro.uol.com.br/

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

interface PagSeguroCheckoutResponse {
  code: string;
  date: string;
  checkoutUrl?: string;
}

// Configuração do PagSeguro
// Método 1: API KEY e SECRET KEY (recomendado - método moderno)
// Credenciais configuradas diretamente (fallback se variáveis de ambiente não estiverem disponíveis)
const PAGSEGURO_API_KEY = process.env.PAGSEGURO_API_KEY || '7f3fafd67ebb4204bcd3d7f4f28ae23d';
const PAGSEGURO_SECRET_KEY = process.env.PAGSEGURO_SECRET_KEY || '88b173f9a3e5414fbd805901cc86528a';

// Método 2: Email e Token (método tradicional - fallback)
const PAGSEGURO_EMAIL = process.env.PAGSEGURO_EMAIL;
const PAGSEGURO_TOKEN = process.env.PAGSEGURO_TOKEN;

const PAGSEGURO_ENV = process.env.PAGSEGURO_ENV || 'production'; // 'sandbox' ou 'production'

// Determinar qual método usar
const USE_API_KEY_METHOD = !!(PAGSEGURO_API_KEY && PAGSEGURO_SECRET_KEY);
const USE_EMAIL_METHOD = !!(PAGSEGURO_EMAIL && PAGSEGURO_TOKEN);

// URLs da API
const PAGSEGURO_API_URL = PAGSEGURO_ENV === 'sandbox'
  ? 'https://sandbox.pagseguro.uol.com.br'
  : 'https://ws.pagseguro.uol.com.br';

// Validar configuração (apenas logar, não lançar erro no build)
if (!USE_API_KEY_METHOD && !USE_EMAIL_METHOD) {
  console.warn('⚠️ AVISO: Credenciais do PagSeguro não configuradas!');
  console.warn('Configure UMA das opções no AWS Amplify:');
  console.warn('  OPÇÃO 1 (Recomendado):');
  console.warn('    - PAGSEGURO_API_KEY: sua API key do PagSeguro');
  console.warn('    - PAGSEGURO_SECRET_KEY: sua Secret key do PagSeguro');
  console.warn('  OPÇÃO 2 (Tradicional):');
  console.warn('    - PAGSEGURO_EMAIL: seu email do PagSeguro');
  console.warn('    - PAGSEGURO_TOKEN: token de segurança do PagSeguro');
  console.warn('Veja CONFIGURAR_PAGSEGURO.md para mais detalhes.');
} else {
  const method = USE_API_KEY_METHOD ? 'API_KEY' : 'EMAIL';
  console.log(`✅ PagSeguro configurado (método: ${method}):`, {
    env: PAGSEGURO_ENV,
    apiKeyLength: PAGSEGURO_API_KEY?.length || 0,
    secretKeyLength: PAGSEGURO_SECRET_KEY?.length || 0,
    email: PAGSEGURO_EMAIL ? PAGSEGURO_EMAIL.substring(0, 3) + '***@***' : undefined,
    tokenLength: PAGSEGURO_TOKEN?.length || 0
  });
}

/**
 * Cria um checkout no PagSeguro
 * Retorna a URL de checkout para redirecionar o usuário
 */
export async function createCheckout(
  data: CreateCheckoutData
): Promise<{ checkoutCode: string; checkoutUrl: string }> {
  if (!USE_API_KEY_METHOD && !USE_EMAIL_METHOD) {
    const errorMsg = 'PagSeguro não configurado. Configure as variáveis de ambiente no AWS Amplify:\n' +
      '1. Acesse: https://console.aws.amazon.com/amplify\n' +
      '2. Vá em "App settings" > "Environment variables"\n' +
      '3. Adicione UMA das opções:\n' +
      '   OPÇÃO 1 (Recomendado):\n' +
      '     - PAGSEGURO_API_KEY: sua API key\n' +
      '     - PAGSEGURO_SECRET_KEY: sua Secret key\n' +
      '   OPÇÃO 2 (Tradicional):\n' +
      '     - PAGSEGURO_EMAIL: seu email do PagSeguro\n' +
      '     - PAGSEGURO_TOKEN: token de segurança\n' +
      '4. Salve e aguarde o deploy\n' +
      'Veja CONFIGURAR_PAGSEGURO.md para instruções detalhadas.';
    throw new Error(errorMsg);
  }

  try {
    console.log('=== CRIANDO CHECKOUT NO PAGSEGURO ===');
    console.log('Dados:', JSON.stringify(data, null, 2));

    // Preparar dados do checkout
    const checkoutData = new URLSearchParams();
    
    // Credenciais e headers
    let authHeader: string | undefined;
    
    if (USE_API_KEY_METHOD) {
      // Método moderno: API KEY e SECRET KEY com Basic Auth
      // Criar header Authorization: Basic base64(api-key:secret-key)
      const credentials = `${PAGSEGURO_API_KEY}:${PAGSEGURO_SECRET_KEY}`;
      authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`;
    } else {
      // Método tradicional: Email e Token no body
      checkoutData.append('email', PAGSEGURO_EMAIL!);
      checkoutData.append('token', PAGSEGURO_TOKEN!);
    }
    
    // Dados do pagamento
    checkoutData.append('currency', 'BRL');
    checkoutData.append('reference', data.metadata?.paymentId || `PAY-${Date.now()}`);
    
    // Item (plano)
    checkoutData.append('itemId1', data.planId);
    checkoutData.append('itemDescription1', data.planName);
    checkoutData.append('itemAmount1', data.amount.toFixed(2));
    checkoutData.append('itemQuantity1', '1');
    
    // Dados do comprador
    checkoutData.append('senderName', data.userName);
    checkoutData.append('senderEmail', data.userEmail);
    
    // URLs de retorno
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://uaecareers.com';
    const userType = data.metadata?.userType || 'candidato';
    
    checkoutData.append('redirectURL', `${baseUrl}/${userType}/pagamento/sucesso`);
    checkoutData.append('notificationURL', `${process.env.NEXT_PUBLIC_API_URL || 'https://uaecareers.com/api'}/payments/webhook`);
    
    // Método de pagamento
    if (data.paymentMethod === 'pix') {
      checkoutData.append('paymentMethod', 'PIX');
    } else {
      checkoutData.append('paymentMethod', 'CREDIT_CARD');
      if (data.installments && data.installments > 1) {
        checkoutData.append('installmentQuantity', data.installments.toString());
        checkoutData.append('installmentValue', (data.amount / data.installments).toFixed(2));
      }
    }

    // Preparar headers
    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    
    // Adicionar Authorization header se usar API KEY/SECRET KEY
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Fazer requisição para criar checkout
    const response = await fetch(`${PAGSEGURO_API_URL}/v2/checkout`, {
      method: 'POST',
      headers,
      body: checkoutData.toString(),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao criar checkout:', errorText);
      throw new Error(`Falha ao criar checkout no PagSeguro (Status: ${response.status}): ${errorText}`);
    }

    // Parse XML response (PagSeguro retorna XML)
    const xmlText = await response.text();
    console.log('Response XML:', xmlText);
    
    // Extrair código do checkout do XML
    const codeMatch = xmlText.match(/<code>(.*?)<\/code>/);
    if (!codeMatch || !codeMatch[1]) {
      throw new Error('Resposta do PagSeguro inválida: código do checkout não encontrado');
    }

    const checkoutCode = codeMatch[1];
    const checkoutUrl = `${PAGSEGURO_API_URL}/v2/checkout/payment.html?code=${checkoutCode}`;

    console.log('✅ Checkout criado com sucesso:', {
      code: checkoutCode,
      url: checkoutUrl
    });

    return {
      checkoutCode,
      checkoutUrl,
    };
  } catch (error: any) {
    console.error('=== ERRO AO CRIAR CHECKOUT NO PAGSEGURO ===');
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
}> {
  if (!USE_API_KEY_METHOD && !USE_EMAIL_METHOD) {
    throw new Error('PagSeguro não configurado');
  }

  try {
    // Preparar headers e params
    const headers: HeadersInit = {};
    let url = `${PAGSEGURO_API_URL}/v3/transactions/${transactionCode}`;
    
    if (USE_API_KEY_METHOD) {
      // Método moderno: Basic Auth
      const credentials = `${PAGSEGURO_API_KEY}:${PAGSEGURO_SECRET_KEY}`;
      headers['Authorization'] = `Basic ${Buffer.from(credentials).toString('base64')}`;
    } else {
      // Método tradicional: email e token na query string
      const params = new URLSearchParams({
        email: PAGSEGURO_EMAIL!,
        token: PAGSEGURO_TOKEN!,
      });
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao consultar transação: ${response.status}`);
    }

    const xmlText = await response.text();
    
    // Parse XML
    const statusMatch = xmlText.match(/<status>(.*?)<\/status>/);
    const referenceMatch = xmlText.match(/<reference>(.*?)<\/reference>/);
    const amountMatch = xmlText.match(/<grossAmount>(.*?)<\/grossAmount>/);

    return {
      status: statusMatch ? statusMatch[1] : 'unknown',
      reference: referenceMatch ? referenceMatch[1] : '',
      amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
    };
  } catch (error: any) {
    console.error('Erro ao consultar status:', error);
    throw error;
  }
}


