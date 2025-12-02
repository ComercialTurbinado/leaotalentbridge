import { NextRequest, NextResponse } from 'next/server';
import { getPaymentById, mapMercadoPagoStatus } from '@/lib/services/mercadopago';
import dbConnect from '@/lib/mongodb';
import { Payment, Subscription } from '@/lib/models/Payment';
import User from '@/lib/models/User';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Webhook recebido do Mercado Pago:', body);

    // Mercado Pago envia notificações em diferentes formatos
    // Tipo: payment, plan, subscription, merchant_order, etc.
    const { type, data, action } = body;

    // Ignorar notificações de teste
    if (type === 'test') {
      return NextResponse.json({ success: true, message: 'Test notification received' });
    }

    // Processar apenas notificações de pagamento
    if (type === 'payment' || action === 'payment.created' || action === 'payment.updated') {
      const paymentId = data?.id;

      if (!paymentId) {
        return NextResponse.json(
          { success: false, error: 'Payment ID não fornecido' },
          { status: 400 }
        );
      }

      // Buscar detalhes do pagamento no Mercado Pago
      const mercadoPagoPayment = await getPaymentById(paymentId);

      // Conectar ao banco
      await dbConnect();

      // Buscar pagamento no banco de dados
      // external_reference contém o paymentId que criamos antes da preferência
      let payment = await Payment.findOne({
        $or: [
          { paymentId: mercadoPagoPayment.external_reference }, // Buscar pelo paymentId (external_reference)
          { 'metadata.preferenceId': mercadoPagoPayment.external_reference }, // Fallback: buscar por preferenceId
          { transactionId: String(paymentId) } // Buscar pelo transactionId do MercadoPago
        ]
      });

      // Se não encontrar, tentar buscar pelo email do pagador
      if (!payment && mercadoPagoPayment.payer?.email) {
        payment = await Payment.findOne({
          guestEmail: mercadoPagoPayment.payer.email.toLowerCase(),
          status: 'pending'
        }).sort({ createdAt: -1 });
      }

      if (!payment) {
        console.log('Pagamento não encontrado no banco de dados');
        return NextResponse.json({ success: true, message: 'Payment not found in database' });
      }

      // Atualizar status do pagamento
      const newStatus = mapMercadoPagoStatus(mercadoPagoPayment.status || 'pending');
      payment.status = newStatus;
      payment.transactionId = String(mercadoPagoPayment.id);
      
      // Atualizar informações do gateway
      payment.gatewayResponse = {
        id: String(mercadoPagoPayment.id),
        status: mercadoPagoPayment.status || '',
        message: mercadoPagoPayment.status_detail || '',
        metadata: {
          payment_method_id: mercadoPagoPayment.payment_method_id,
          payment_type_id: mercadoPagoPayment.payment_type_id,
          transaction_amount: mercadoPagoPayment.transaction_amount,
          date_approved: mercadoPagoPayment.date_approved,
        },
      };

      // Adicionar tentativa de pagamento
      payment.attempts.push({
        attemptNumber: payment.attempts.length + 1,
        attemptedAt: new Date(),
        status: newStatus === 'completed' ? 'success' : 'failed',
        errorCode: mercadoPagoPayment.status_detail,
        errorMessage: mercadoPagoPayment.status_detail,
        gatewayResponse: mercadoPagoPayment,
      });

      // Se pagamento aprovado, atualizar datas
      if (newStatus === 'completed') {
        payment.completedAt = new Date();
        payment.processedAt = new Date();

        // Se não houver userId, criar conta automaticamente
        if (!payment.userId && payment.guestEmail) {
          await createAccountFromPayment(payment);
        }

        // Criar ou atualizar assinatura
        await createOrUpdateSubscription(payment);
      } else if (newStatus === 'failed') {
        payment.failedAt = new Date();
      }

      await payment.save();

      console.log(`Pagamento ${payment.paymentId} atualizado para status: ${newStatus}`);

      return NextResponse.json({
        success: true,
        message: 'Webhook processado com sucesso',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification type not processed',
    });
  } catch (error) {
    console.error('Erro ao processar webhook do Mercado Pago:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar webhook',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * Cria conta automaticamente após pagamento aprovado
 */
async function createAccountFromPayment(payment: any) {
  try {
    if (!payment.guestEmail || !payment.guestName) {
      console.log('Dados insuficientes para criar conta');
      return;
    }

    const metadata = payment.metadata || {};
    const userType = metadata.userType || 'candidato';

    // Verificar se já existe usuário com este email
    const existingUser = await User.findOne({ email: payment.guestEmail.toLowerCase() });
    
    if (existingUser) {
      // Vincular pagamento ao usuário existente
      payment.userId = existingUser._id;
      await payment.save();
      console.log(`Pagamento vinculado ao usuário existente: ${existingUser._id}`);
      return;
    }

    // Gerar senha temporária (usuário precisará redefinir)
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Criar novo usuário
    const newUser = new User({
      email: payment.guestEmail.toLowerCase(),
      password: hashedPassword,
      name: payment.guestName.trim(),
      type: userType,
      status: 'approved', // Aprovado automaticamente após pagamento
      profile: {
        completed: false,
      },
      permissions: {
        canAccessJobs: userType === 'empresa',
        canApplyToJobs: userType === 'candidato',
        canViewCourses: true,
        canAccessSimulations: userType === 'candidato',
        canContactCompanies: userType === 'candidato',
      },
      profileVerified: false,
      documentsVerified: false,
      ...(userType === 'empresa' && { companyVerified: false }),
    });

    await newUser.save();

    // Vincular pagamento ao novo usuário
    payment.userId = newUser._id;
    await payment.save();

    console.log(`Conta criada automaticamente para: ${payment.guestEmail} (ID: ${newUser._id})`);
    
    // TODO: Enviar email com senha temporária e instruções para redefinir
    // Aqui você pode adicionar envio de email com a senha temporária
    
    return newUser;
  } catch (error) {
    console.error('Erro ao criar conta a partir do pagamento:', error);
    // Não falhar o webhook se não conseguir criar conta
  }
}

async function createOrUpdateSubscription(payment: any) {
  try {
    const metadata = payment.metadata || {};
    const userId = payment.userId || payment.companyId;

    if (!userId) {
      console.log('UserId não encontrado no pagamento');
      return;
    }

    // Calcular datas da assinatura (12 meses)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const nextBillingDate = new Date();
    nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);

    // Verificar se já existe assinatura ativa
    let subscription = await Subscription.findOne({
      companyId: userId,
      status: { $in: ['active', 'trial'] },
    });

    if (subscription) {
      // Atualizar assinatura existente
      subscription.status = 'active';
      subscription.endDate = endDate;
      subscription.nextBillingDate = nextBillingDate;
      subscription.paymentHistory.push(payment._id);
      await subscription.save();
    } else {
      // Criar nova assinatura
      subscription = await Subscription.create({
        companyId: userId,
        planId: metadata.planId || 'annual',
        planName: metadata.planName || 'Plano Anual',
        planType: 'premium',
        status: 'active',
        startDate,
        endDate,
        amount: payment.amount,
        currency: payment.currency || 'BRL',
        billingPeriod: 'annual',
        nextBillingDate,
        features: {
          maxJobs: 999,
          maxCandidates: 999,
          featuredJobs: 10,
          prioritySupport: true,
          analyticsAccess: true,
          apiAccess: true,
          customBranding: true,
        },
        usage: {
          jobsUsed: 0,
          candidatesSearched: 0,
          featuredJobsUsed: 0,
          apiCallsUsed: 0,
        },
        paymentHistory: [payment._id],
        autoRenew: true,
      });
    }

    // Atualizar referência da assinatura no pagamento
    payment.subscriptionId = subscription._id;
    await payment.save();

    console.log(`Assinatura criada/atualizada para usuário ${userId}`);
  } catch (error) {
    console.error('Erro ao criar/atualizar assinatura:', error);
  }
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

