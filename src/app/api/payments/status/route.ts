import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Payment } from '@/lib/models/Payment';
import { verifyToken } from '@/lib/auth';
import { verifyPaymentStatus } from '@/lib/services/mercadopago';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obter paymentId da query string
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID não fornecido' },
        { status: 400 }
      );
    }

    // Conectar ao banco
    await dbConnect();

    // Buscar pagamento no banco de dados
    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem permissão para ver este pagamento
    if (
      payment.userId?.toString() !== decoded.userId &&
      payment.companyId?.toString() !== decoded.userId
    ) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para acessar este pagamento' },
        { status: 403 }
      );
    }

    // Se houver transactionId, buscar status atualizado no Mercado Pago
    if (payment.transactionId) {
      try {
        const mercadoPagoStatus = await verifyPaymentStatus(payment.transactionId);
        
        return NextResponse.json({
          success: true,
          data: {
            paymentId: payment.paymentId,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            createdAt: payment.createdAt,
            completedAt: payment.completedAt,
            mercadoPago: mercadoPagoStatus,
          },
        });
      } catch (error) {
        console.error('Erro ao buscar status no Mercado Pago:', error);
        // Retornar dados do banco mesmo se falhar a consulta no MP
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
        processedAt: payment.processedAt,
        failedAt: payment.failedAt,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao verificar status do pagamento',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

