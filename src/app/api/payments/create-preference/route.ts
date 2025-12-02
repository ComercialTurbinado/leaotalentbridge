import { NextRequest, NextResponse } from 'next/server';
import { createPaymentPreference } from '@/lib/services/mercadopago';
import dbConnect from '@/lib/mongodb';
import { Payment } from '@/lib/models/Payment';
import { verifyToken } from '@/lib/auth';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    await dbConnect();

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
    const payment = await Payment.create({
      companyId: userType === 'empresa' && userId ? userId : undefined,
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
        provider: 'mercadopago',
        providerId: '', // Será atualizado após criar preferência
        isDefault: true,
        isActive: true,
      },
      gateway: 'mercadopago',
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

    // Criar preferência no Mercado Pago usando paymentId como external_reference
    const preference = await createPaymentPreference({
      userId: payment.paymentId, // Usar paymentId como external_reference
      userEmail: email,
      userName: name,
      planId,
      planName,
      amount,
      installments,
      paymentMethods: paymentMethodsConfig,
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

    // Atualizar pagamento com preferenceId
    payment.paymentMethod.providerId = preference.id;
    payment.metadata.preferenceId = preference.id;
    await payment.save();

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.paymentId,
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
      },
    });
  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error);
    
    // Verificar se é erro de credenciais
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    let userMessage = 'Erro ao processar pagamento';
    
    if (errorMessage.includes('access_token') || errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      userMessage = 'Erro de configuração: Credenciais do Mercado Pago não configuradas. Verifique as variáveis de ambiente.';
    } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      userMessage = 'Erro de conexão com o Mercado Pago. Tente novamente em alguns instantes.';
    }
    
    return NextResponse.json(
      {
        success: false,
        error: userMessage,
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}


