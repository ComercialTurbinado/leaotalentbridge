import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { PushNotificationService } from '@/lib/services/PushNotificationService';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Subscription inválida' },
        { status: 400 }
      );
    }

    // Validar subscription
    const isValid = await PushNotificationService.validateSubscription(subscription);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Subscription inválida ou expirada' },
        { status: 400 }
      );
    }

    // Adicionar subscription ao usuário
    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já existe uma subscription com o mesmo endpoint
    const existingIndex = userDoc.pushSubscriptions?.findIndex(
      (sub: any) => sub.endpoint === subscription.endpoint
    );

    if (existingIndex !== undefined && existingIndex >= 0) {
      // Atualizar subscription existente
      userDoc.pushSubscriptions[existingIndex] = subscription;
    } else {
      // Adicionar nova subscription
      if (!userDoc.pushSubscriptions) {
        userDoc.pushSubscriptions = [];
      }
      userDoc.pushSubscriptions.push(subscription);
    }

    await userDoc.save();

    return NextResponse.json({
      success: true,
      message: 'Subscription registrada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao registrar subscription:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint é obrigatório' },
        { status: 400 }
      );
    }

    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Remover subscription
    if (userDoc.pushSubscriptions) {
      userDoc.pushSubscriptions = userDoc.pushSubscriptions.filter(
        (sub: any) => sub.endpoint !== endpoint
      );
      await userDoc.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover subscription:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
