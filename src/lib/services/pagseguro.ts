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
// Email e Token de Segurança (obrigatórios)
const PAGSEGURO_EMAIL = process.env.PAGSEGURO_EMAIL;
const PAGSEGURO_TOKEN = process.env.PAGSEGURO_TOKEN;
const PAGSEGURO_ENV = process.env.PAGSEGURO_ENV || 'production'; // 'sandbox' ou 'production'

// URLs da API
const PAGSEGURO_API_URL = PAGSEGURO_ENV === 'sandbox'
  ? 'https://sandbox.pagseguro.uol.com.br'
  : 'https://ws.pagseguro.uol.com.br';

// Validar configuração
if (!PAGSEGURO_EMAIL || !PAGSEGURO_TOKEN) {
  console.error('⚠️ ERRO CRÍTICO: PAGSEGURO_EMAIL e PAGSEGURO_TOKEN não configurados!');
  console.error('Configure as variáveis de ambiente no servidor.');
} else {
  console.log('✅ PagSeguro configurado:', {
    email: PAGSEGURO_EMAIL,
    env: PAGSEGURO_ENV,
    tokenLength: PAGSEGURO_TOKEN.length
  });
}

/**
 * Cria um checkout no PagSeguro
 * Retorna a URL de checkout para redirecionar o usuário
 */
export async function createCheckout(
  data: CreateCheckoutData
): Promise<{ checkoutCode: string; checkoutUrl: string }> {
  if (!PAGSEGURO_EMAIL || !PAGSEGURO_TOKEN) {
    throw new Error('PagSeguro não configurado. Configure PAGSEGURO_EMAIL e PAGSEGURO_TOKEN no servidor.');
  }

  try {
    console.log('=== CRIANDO CHECKOUT NO PAGSEGURO ===');
    console.log('Dados:', JSON.stringify(data, null, 2));

    // Preparar dados do checkout
    const checkoutData = new URLSearchParams();
    
    // Credenciais
    checkoutData.append('email', PAGSEGURO_EMAIL);
    checkoutData.append('token', PAGSEGURO_TOKEN);
    
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

    // Fazer requisição para criar checkout
    const response = await fetch(`${PAGSEGURO_API_URL}/v2/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
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
  if (!PAGSEGURO_EMAIL || !PAGSEGURO_TOKEN) {
    throw new Error('PagSeguro não configurado');
  }

  try {
    const params = new URLSearchParams({
      email: PAGSEGURO_EMAIL,
      token: PAGSEGURO_TOKEN,
    });

    const response = await fetch(`${PAGSEGURO_API_URL}/v3/transactions/${transactionCode}?${params.toString()}`);
    
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


