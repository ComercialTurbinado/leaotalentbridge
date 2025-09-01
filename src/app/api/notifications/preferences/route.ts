import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { NotificationService } from '@/lib/services/NotificationService';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const preferences = await NotificationService.getUserPreferences(user._id.toString());

    return NextResponse.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      emailNotifications,
      pushNotifications,
      smsNotifications,
      preferences,
      frequency,
      quietHours,
      allowedDays
    } = body;

    const updatedPreferences = await NotificationService.updateUserPreferences(
      user._id.toString(),
      {
        emailNotifications,
        pushNotifications,
        smsNotifications,
        preferences,
        frequency,
        quietHours,
        allowedDays
      }
    );

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
