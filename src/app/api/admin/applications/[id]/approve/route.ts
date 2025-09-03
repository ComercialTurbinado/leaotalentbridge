import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

// Verificar autenticação de admin
async function verifyAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify';
    const decoded = jwt.verify(token, jwtSecret) as any;
    await connectMongoDB();
    const user = await User.findById(decoded.userId);
    return user?.type === 'admin' ? user : null;
  } catch (error) {
    return null;
  }
}

// POST - Aprovar candidatura
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas administradores' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    await connectMongoDB();
    
    const data = await request.json();
    const { decision, reason, notes } = data;

    // Buscar candidatura
    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Candidatura não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar candidatura
    const updateData: any = {
      adminApproved: decision === 'approved',
      status: decision === 'approved' ? 'qualified' : 'rejected',
      'notes.admin': notes || '',
      'adminDecision.decision': decision,
      'adminDecision.reason': reason,
      'adminDecision.decidedAt': new Date(),
      'adminDecision.decidedBy': admin._id
    };

    const updatedApplication = await Application.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('jobId candidateId companyId');

    // Enviar notificação para candidato e empresa
    try {
      await sendNotification(updatedApplication, decision, reason);
    } catch (notificationError) {
      console.warn('Erro ao enviar notificação:', notificationError);
      // Não falhar a operação principal por erro de notificação
    }

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: `Candidatura ${decision === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso`
    });

  } catch (error) {
    console.error('Erro ao aprovar candidatura:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar candidatura' },
      { status: 500 }
    );
  }
}

// Função para enviar notificações
async function sendNotification(application: any, decision: string, reason: string) {
  try {
    // Criar notificação para o candidato
    const candidateNotification = {
      userId: application.candidateId._id,
      type: 'application_decision',
      title: `Candidatura ${decision === 'approved' ? 'Aprovada' : 'Rejeitada'}`,
      message: `Sua candidatura para ${application.jobId.title} foi ${decision === 'approved' ? 'aprovada' : 'rejeitada'} pelo administrador.`,
      data: {
        applicationId: application._id,
        jobId: application.jobId._id,
        decision,
        reason
      },
      priority: decision === 'approved' ? 'medium' : 'high'
    };

    // Criar notificação para a empresa
    const companyNotification = {
      userId: application.companyId._id,
      type: 'application_decision',
      title: `Candidatura ${decision === 'approved' ? 'Aprovada' : 'Rejeitada'}`,
      message: `A candidatura de ${application.candidateId.name} para ${application.jobId.title} foi ${decision === 'approved' ? 'aprovada' : 'rejeitada'} pelo administrador.`,
      data: {
        applicationId: application._id,
        candidateId: application.candidateId._id,
        jobId: application.jobId._id,
        decision,
        reason
      },
      priority: 'medium'
    };

    // Salvar notificações no banco
    const Notification = (await import('@/lib/models/Notification')).default;
    await Promise.all([
      Notification.create(candidateNotification),
      Notification.create(companyNotification)
    ]);

  } catch (error) {
    console.error('Erro ao criar notificações:', error);
    throw error;
  }
}
