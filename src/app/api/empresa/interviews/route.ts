import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Interview from '@/lib/models/Interview';
import User from '@/lib/models/User';
import Application from '@/lib/models/Application';
import jwt from 'jsonwebtoken';

// Verificar autenticação de empresa
async function verifyCompanyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify';
    const decoded = jwt.verify(token, jwtSecret) as any;
    await connectMongoDB();
    const user = await User.findById(decoded.userId);
    return user?.type === 'empresa' ? user : null;
  } catch (error) {
    return null;
  }
}

// GET - Listar entrevistas da empresa
export async function GET(request: NextRequest) {
  try {
    const company = await verifyCompanyAuth(request);
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas empresas' },
        { status: 403 }
      );
    }

    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const query: any = { companyId: company._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { 'candidateId.name': { $regex: search, $options: 'i' } },
        { 'candidateId.email': { $regex: search, $options: 'i' } },
        { 'jobId.title': { $regex: search, $options: 'i' } }
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

// POST - Criar nova entrevista
export async function POST(request: NextRequest) {
  try {
    const company = await verifyCompanyAuth(request);
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas empresas' },
        { status: 403 }
      );
    }

    await connectMongoDB();
    
    const data = await request.json();
    const { 
      candidateId, 
      jobId, 
      scheduledDate, 
      duration, 
      type, 
      location, 
      notes,
      requirements 
    } = data;

    // Verificar se a candidatura existe e pertence à empresa
    const application = await Application.findOne({
      _id: jobId,
      candidateId,
      companyId: company._id,
      status: { $in: ['qualified', 'approved', 'interviewing'] }
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Candidatura não encontrada ou não elegível para entrevista' },
        { status: 400 }
      );
    }

    // Criar entrevista
    const interview = new Interview({
      candidateId,
      jobId,
      companyId: company._id,
      scheduledDate: new Date(scheduledDate),
      duration: duration || 60,
      type: type || 'online',
      location: location || { type: 'online', details: 'Videoconferência' },
      notes: notes || '',
      requirements: requirements || [],
      status: 'scheduled',
      createdBy: company._id
    });

    await interview.save();

    // Atualizar status da candidatura
    await Application.findByIdAndUpdate(jobId, {
      status: 'interviewing',
      'notes.company': `Entrevista agendada para ${new Date(scheduledDate).toLocaleDateString('pt-BR')}`
    });

    // Enviar notificação para o candidato
    try {
      await sendInterviewNotification(interview, 'scheduled');
    } catch (notificationError) {
      console.warn('Erro ao enviar notificação:', notificationError);
    }

    const populatedInterview = await Interview.findById(interview._id)
      .populate('candidateId', 'name email profile')
      .populate('jobId', 'title location salary')
      .populate('companyId', 'name industry');

    return NextResponse.json({
      success: true,
      data: populatedInterview,
      message: 'Entrevista agendada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar entrevista:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao agendar entrevista' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar entrevista
export async function PUT(request: NextRequest) {
  try {
    const company = await verifyCompanyAuth(request);
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas empresas' },
        { status: 403 }
      );
    }

    await connectMongoDB();
    
    const data = await request.json();
    const { 
      interviewId, 
      scheduledDate, 
      duration, 
      type, 
      location, 
      notes,
      requirements,
      status 
    } = data;

    // Buscar entrevista
    const interview = await Interview.findOne({
      _id: interviewId,
      companyId: company._id
    });

    if (!interview) {
      return NextResponse.json(
        { success: false, message: 'Entrevista não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar entrevista
    const updateData: any = {};
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (duration) updateData.duration = duration;
    if (type) updateData.type = type;
    if (location) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;
    if (requirements) updateData.requirements = requirements;
    if (status) updateData.status = status;

    const updatedInterview = await Interview.findByIdAndUpdate(
      interviewId,
      updateData,
      { new: true, runValidators: true }
    ).populate('candidateId jobId companyId');

    // Enviar notificação para o candidato se houve mudança
    if (scheduledDate || status) {
      try {
        await sendInterviewNotification(updatedInterview, status || 'updated');
      } catch (notificationError) {
        console.warn('Erro ao enviar notificação:', notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedInterview,
      message: 'Entrevista atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar entrevista:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar entrevista' },
      { status: 500 }
    );
  }
}

// Função para enviar notificações de entrevista
async function sendInterviewNotification(interview: any, action: string) {
  try {
    const Notification = (await import('@/lib/models/Notification')).default;
    
    let title = '';
    let message = '';
    
    switch (action) {
      case 'scheduled':
        title = 'Nova Entrevista Agendada';
        message = `Você tem uma entrevista agendada para ${interview.jobId.title} em ${new Date(interview.scheduledDate).toLocaleDateString('pt-BR')} às ${new Date(interview.scheduledDate).toLocaleTimeString('pt-BR')}`;
        break;
      case 'updated':
        title = 'Entrevista Atualizada';
        message = `Sua entrevista para ${interview.jobId.title} foi atualizada. Verifique os novos detalhes.`;
        break;
      case 'cancelled':
        title = 'Entrevista Cancelada';
        message = `Sua entrevista para ${interview.jobId.title} foi cancelada.`;
        break;
      case 'completed':
        title = 'Entrevista Concluída';
        message = `Sua entrevista para ${interview.jobId.title} foi marcada como concluída.`;
        break;
      default:
        title = 'Atualização de Entrevista';
        message = `Houve uma atualização na sua entrevista para ${interview.jobId.title}.`;
    }

    const notification = {
      userId: interview.candidateId._id,
      type: 'interview_update',
      title,
      message,
      data: {
        interviewId: interview._id,
        jobId: interview.jobId._id,
        companyId: interview.companyId._id,
        action,
        scheduledDate: interview.scheduledDate
      },
      priority: action === 'cancelled' ? 'high' : 'medium'
    };

    await Notification.create(notification);

  } catch (error) {
    console.error('Erro ao criar notificação de entrevista:', error);
    throw error;
  }
}
