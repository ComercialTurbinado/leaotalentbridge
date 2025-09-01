import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { PushNotificationService } from '@/lib/services/PushNotificationService';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Em produção, você deve usar as chaves VAPID configuradas no .env
    const publicKey = process.env.VAPID_PUBLIC_KEY || PushNotificationService.generateVapidKeys().publicKey;

    return NextResponse.json({
      success: true,
      publicKey
    });
  } catch (error) {
    console.error('Erro ao obter chaves VAPID:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
