import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Interview from '@/lib/models/Interview';
import User from '@/lib/models/User';
import Application from '@/lib/models/Application';
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

// GET - Listar todas as entrevistas para o admin
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas administradores' },
        { status: 403 }
      );
    }

    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const adminStatus = searchParams.get('adminStatus');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (adminStatus && adminStatus !== 'all') {
      query.adminApproved = adminStatus === 'approved' ? true : false;
    }
    
    if (search) {
      query.$or = [
        { 'candidateId.name': { $regex: search, $options: 'i' } },
        { 'candidateId.email': { $regex: search, $options: 'i' } },
        { 'jobId.title': { $regex: search, $options: 'i' } },
        { 'companyId.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [interviews, total] = await Promise.all([
      Interview.find(query)
        .populate('candidateId', 'name email profile')
        .populate('jobId', 'title location salary')
        .populate('companyId', 'name industry')
        .sort({ scheduledDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Interview.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: interviews,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    });

  } catch (error) {
    console.error('Erro ao listar entrevistas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao listar entrevistas' },
      { status: 500 }
    );
  }
}

// POST - Aprovar/rejeitar entrevista
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas administradores' },
        { status: 403 }
      );
    }

    await connectMongoDB();
    
    const data = await request.json();
    const { 
      interviewId, 
      action, 
      reason, 
      notes,
      feedback 
    } = data;

    // Buscar entrevista
    const interview = await Interview.findById(interviewId)
      .populate('candidateId jobId companyId');

    if (!interview) {
      return NextResponse.json(
        { success: false, message: 'Entrevista não encontrada' },
        { status: 404 }
      );
    }

    let updateData: any = {};
    let message = '';

    if (action === 'approve') {
      updateData = {
        adminApproved: true,
        status: 'approved',
        'notes.admin': notes || '',
        'adminDecision.decision': 'approved',
        'adminDecision.reason': reason || 'Entrevista aprovada pelo administrador',
        'adminDecision.decidedAt': new Date(),
        'adminDecision.decidedBy': admin._id
      };
      message = 'Entrevista aprovada com sucesso';
    } else if (action === 'reject') {
      updateData = {
        adminApproved: false,
        status: 'rejected',
        'notes.admin': notes || '',
        'adminDecision.decision': 'rejected',
        'adminDecision.reason': reason || 'Entrevista rejeitada pelo administrador',
        'adminDecision.decidedAt': new Date(),
        'adminDecision.decidedBy': admin._id
      };
      message = 'Entrevista rejeitada com sucesso';
    } else if (action === 'moderate_feedback') {
      updateData = {
        'feedback.moderated': true,
        'feedback.adminNotes': notes || '',
        'feedback.moderationDate': new Date(),
        'feedback.moderatedBy': admin._id
      };
      message = 'Feedback moderado com sucesso';
    }

    const updatedInterview = await Interview.findByIdAndUpdate(
      interviewId,
      updateData,
      { new: true, runValidators: true }
    ).populate('candidateId jobId companyId');

    // Enviar notificações
    try {
      if (action === 'approve' || action === 'reject') {
        await sendInterviewDecisionNotification(updatedInterview, action, reason);
      } else if (action === 'moderate_feedback') {
        await sendFeedbackModerationNotification(updatedInterview, notes);
      }
    } catch (notificationError) {
      console.warn('Erro ao enviar notificação:', notificationError);
    }

    return NextResponse.json({
      success: true,
      data: updatedInterview,
      message
    });

  } catch (error) {
    console.error('Erro ao processar entrevista:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar entrevista' },
      { status: 500 }
    );
  }
}

// Função para enviar notificações de decisão de entrevista
async function sendInterviewDecisionNotification(interview: any, action: string, reason: string) {
  try {
    const Notification = (await import('@/lib/models/Notification')).default;
    
    // Notificação para o candidato
    const candidateNotification = {
      userId: interview.candidateId._id,
      type: 'interview_decision',
      title: `Entrevista ${action === 'approved' ? 'Aprovada' : 'Rejeitada'}`,
      message: `Sua entrevista para ${interview.jobId.title} foi ${action === 'approved' ? 'aprovada' : 'rejeitada'} pelo administrador.`,
      data: {
        interviewId: interview._id,
        jobId: interview.jobId._id,
        companyId: interview.companyId._id,
        decision: action,
        reason
      },
      priority: action === 'approved' ? 'medium' : 'high'
    };

    // Notificação para a empresa
    const companyNotification = {
      userId: interview.companyId._id,
      type: 'interview_decision',
      title: `Entrevista ${action === 'approved' ? 'Aprovada' : 'Rejeitada'}`,
      message: `A entrevista de ${interview.candidateId.name} para ${interview.jobId.title} foi ${action === 'approved' ? 'aprovada' : 'rejeitada'} pelo administrador.`,
      data: {
        interviewId: interview._id,
        candidateId: interview.candidateId._id,
        jobId: interview.jobId._id,
        decision: action,
        reason
      },
      priority: 'medium'
    };

    await Promise.all([
      Notification.create(candidateNotification),
      Notification.create(companyNotification)
    ]);

  } catch (error) {
    console.error('Erro ao criar notificações de decisão:', error);
    throw error;
  }
}

// Função para enviar notificações de moderação de feedback
async function sendFeedbackModerationNotification(interview: any, adminNotes: string) {
  try {
    const Notification = (await import('@/lib/models/Notification')).default;
    
    // Notificação para a empresa sobre moderação
    const companyNotification = {
      userId: interview.companyId._id,
      type: 'feedback_moderation',
      title: 'Feedback Moderado',
      message: `O feedback da entrevista de ${interview.candidateId.name} foi moderado pelo administrador.`,
      data: {
        interviewId: interview._id,
        candidateId: interview.candidateId._id,
        jobId: interview.jobId._id,
        adminNotes
      },
      priority: 'medium'
    };

    await Notification.create(companyNotification);

  } catch (error) {
    console.error('Erro ao criar notificação de moderação:', error);
    throw error;
  }
}
