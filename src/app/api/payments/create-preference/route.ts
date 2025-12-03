import { NextRequest, NextResponse } from 'next/server';
import { createCheckout } from '@/lib/services/pagseguro';
import dbConnect from '@/lib/mongodb';
import { Payment } from '@/lib/models/Payment';
import { verifyToken } from '@/lib/auth';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    // Log da requisição para debug
    console.log('=== REQUISIÇÃO CREATE PREFERENCE ===');
    console.log('Method:', request.method);
    console.log('URL:', request.url);
    
    let body;
    try {
      body = await request.json();
      console.log('Body recebido:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      return NextResponse.json(
        { success: false, error: 'Erro ao processar dados da requisição. Verifique o formato JSON.' },
        { status: 400 }
      );
    }
    const {
      planId,
      planName,
      amount,
      installments,
      paymentMethod,
      userType, // 'candidato' ou 'empresa'
      // Dados do usuário (obrigatórios se não autenticado)
      userEmail,
      userName,
      // Token opcional (se usuário já estiver autenticado)
    } = body;

    // Verificar autenticação (opcional)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    let userId: string | undefined;
    let email: string;
    let name: string;

    if (token) {
      // Usuário autenticado
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
        email = decoded.email || userEmail || '';
        name = decoded.name || userName || '';
      } else {
        // Token inválido, tratar como não autenticado
        if (!userEmail || !userName) {
          return NextResponse.json(
            { success: false, error: 'Email e nome são obrigatórios' },
            { status: 400 }
          );
        }
        email = userEmail;
        name = userName;
      }
    } else {
      // Usuário não autenticado - requer email e nome
      if (!userEmail || !userName) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Email e nome são obrigatórios para realizar o pagamento',
            requiresAuth: false
          },
          { status: 400 }
        );
      }
      email = userEmail;
      name = userName;

      // Verificar se já existe usuário com este email
      await dbConnect();
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        userId = existingUser._id.toString();
      }
    }

    // Validações
    if (!planId || !planName || !amount) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Conectar ao banco
    console.log('Conectando ao MongoDB...');
    try {
      await dbConnect();
      console.log('MongoDB conectado com sucesso');
    } catch (dbError: any) {
      console.error('Erro ao conectar ao MongoDB:', dbError);
      throw new Error(`Erro de conexão com o banco de dados: ${dbError.message || 'Erro desconhecido'}`);
    }

    // Configurar métodos de pagamento permitidos
    const paymentMethodsConfig: any = {
      installments: installments || 6,
    };

    // Se o método for PIX, excluir cartões de crédito
    if (paymentMethod === 'pix') {
      paymentMethodsConfig.excluded_payment_types = [
        { id: 'credit_card' },
        { id: 'debit_card' },
      ];
    }

    // Criar registro de pagamento no banco de dados ANTES de criar preferência
    // Isso permite usar o paymentId como external_reference
    console.log('Criando registro de pagamento no banco...');
    let payment;
    try {
      // Gerar paymentId manualmente antes de criar
      const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      console.log('PaymentId gerado:', paymentId);
      
      payment = await Payment.create({
      paymentId: paymentId, // Gerar manualmente para garantir que existe
      companyId: userId ? new mongoose.Types.ObjectId(userId) : new mongoose.Types.ObjectId(), // Criar ObjectId temporário se não houver userId
      userId: userId || undefined, // undefined se não autenticado
      // Armazenar email para vincular depois
      guestEmail: !userId ? email : undefined,
      guestName: !userId ? name : undefined,
      type: 'subscription',
      purpose: `Assinatura - ${planName}`,
      amount,
      currency: 'BRL',
      status: 'pending',
      paymentMethod: {
        type: paymentMethod === 'pix' ? 'bank_transfer' : 'credit_card',
        provider: 'pagseguro',
        providerId: 'pending', // Será atualizado após criar checkout
        isDefault: true,
        isActive: true,
      },
      gateway: 'pagseguro',
      metadata: {
        planId,
        planName,
        installments,
        userType,
        userEmail: email,
        userName: name,
        createAccountAfterPayment: !userId,
      },
    });
    console.log('Pagamento criado no banco:', payment.paymentId);
    } catch (dbError: any) {
      console.error('Erro ao criar pagamento no banco:', dbError);
      throw new Error(`Erro ao criar registro de pagamento: ${dbError.message || 'Erro desconhecido'}`);
    }

    // Criar checkout no PagSeguro usando paymentId como reference
    console.log('Criando checkout no PagSeguro...');
    let checkout;
    try {
      checkout = await createCheckout({
      userId: userId,
      userEmail: email,
      userName: name,
      planId,
      planName,
      amount,
      installments: installments || 1,
      paymentMethod: paymentMethod === 'pix' ? 'pix' : 'credit',
      cardData: body.cardData, // Incluir dados do cartão se fornecido
      metadata: {
        userType,
        paymentMethod,
        userEmail: email,
        userName: name,
        paymentId: payment.paymentId, // Incluir paymentId no metadata
        // Flag para indicar que precisa criar conta após pagamento
        createAccountAfterPayment: !userId,
      },
    });
    console.log('Checkout criado no PagSeguro:', checkout.checkoutCode);
    } catch (psError: any) {
      console.error('Erro ao criar checkout no PagSeguro:', psError);
      // Tentar remover o pagamento criado se o checkout falhar
      if (payment) {
        try {
          await Payment.deleteOne({ _id: payment._id });
        } catch (deleteError) {
          console.error('Erro ao remover pagamento após falha:', deleteError);
        }
      }
      throw psError;
    }

    // Atualizar pagamento com checkoutCode
    console.log('Atualizando pagamento com checkoutCode...');
    payment.paymentMethod.providerId = checkout.checkoutCode;
    payment.metadata.checkoutCode = checkout.checkoutCode;
    await payment.save();
    console.log('Pagamento atualizado com sucesso');

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.paymentId,
        checkoutCode: checkout.checkoutCode,
        checkoutUrl: checkout.checkoutUrl,
        orderId: checkout.orderId,
        qrCode: checkout.qrCode,
        qrCodeText: checkout.qrCodeText,
      },
    });
  } catch (error: any) {
    console.error('=== ERRO AO CRIAR PREFERÊNCIA DE PAGAMENTO ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    // Log detalhado se for erro do PagSeguro
    if (error?.response) {
      console.error('PagSeguro response status:', error.response.status);
      console.error('PagSeguro response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Verificar se é erro de credenciais
    const errorMessage = error instanceof Error ? error.message : String(error);
    let userMessage = 'Erro ao processar pagamento';
    let statusCode = 500;
    let errorType = 'Error';
    
    if (errorMessage.includes('email') || errorMessage.includes('token') || errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Credenciais')) {
      userMessage = 'Erro de configuração: Credenciais do PagSeguro não configuradas ou inválidas. Verifique as variáveis de ambiente PAGSEGURO_API_KEY e PAGSEGURO_SECRET_KEY no AWS Amplify.';
      statusCode = 500;
      errorType = 'PAGSEGURO_AUTH_ERROR';
    } else if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')) {
      userMessage = 'Erro de conexão com o PagSeguro. Tente novamente em alguns instantes.';
      statusCode = 503;
      errorType = 'PAGSEGURO_NETWORK_ERROR';
    } else if (errorMessage.includes('Dados inválidos') || errorMessage.includes('400')) {
      userMessage = 'Dados inválidos para processar pagamento. Verifique os dados enviados.';
      statusCode = 400;
      errorType = 'INVALID_DATA';
    } else if (errorMessage.includes('MongoDB') || errorMessage.includes('database') || errorMessage.includes('connection') || errorMessage.includes('registro de pagamento')) {
      userMessage = 'Erro de conexão com o banco de dados ou ao criar registro de pagamento. Tente novamente em alguns instantes.';
      statusCode = 503;
      errorType = 'DATABASE_ERROR';
    }
    
    // Em produção, sempre mostrar detalhes do erro para facilitar debug
    // (mas não mostrar informações sensíveis como tokens)
    const safeErrorMessage = errorMessage
      .replace(/token[=:]\s*[\w-]+/gi, 'token=***')
      .replace(/password[=:]\s*[\w-]+/gi, 'password=***')
      .replace(/secret[=:]\s*[\w-]+/gi, 'secret=***');
    
    return NextResponse.json(
      {
        success: false,
        error: userMessage,
        details: safeErrorMessage, // Sempre mostrar detalhes para debug
        errorType: error?.constructor?.name || 'Unknown',
      },
      { status: statusCode }
    );
  }
}

// Handler para métodos não permitidos
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Método não permitido. Use POST.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Método não permitido. Use POST.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Método não permitido. Use POST.' },
    { status: 405 }
  );
}


