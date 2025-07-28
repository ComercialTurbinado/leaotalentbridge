import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Job from '@/lib/models/Job';
import Company from '@/lib/models/Company';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

// Middleware para verificar autenticação
async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    await connectMongoDB();
    const user = await User.findById(decoded.userId);
    
    return user;
  } catch (error) {
    return null;
  }
}

// GET - Buscar vaga por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await connectMongoDB();
    
    const job = await Job.findById(resolvedParams.id)
      .populate('companyId', 'name logo industry size location website description')
      .populate('createdBy', 'name email')
      .select('-__v');
    
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Vaga não encontrada' },
        { status: 404 }
      );
    }
    
    // Incrementar visualizações
    await Job.findByIdAndUpdate(resolvedParams.id, {
      $inc: { 'metrics.views': 1 }
    });
    
    return NextResponse.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Erro ao buscar vaga:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar vaga' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar vaga
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    await connectMongoDB();
    
    const job = await Job.findById(resolvedParams.id).populate('companyId');
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Vaga não encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar permissões
    const canEdit = user.type === 'admin' || 
                   job.createdBy.toString() === user._id.toString() ||
                   (user.type === 'empresa' && job.companyId.email === user.email);
    
    if (!canEdit) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    // Campos que podem ser atualizados
    const allowedFields = [
      'title', 'description', 'summary', 'department', 'location', 'workType', 
      'workSchedule', 'salary', 'requirements', 'status', 'priority', 'expiresAt',
      'applicationDeadline', 'startDate', 'maxApplications', 'autoScreening',
      'questionsRequired', 'customQuestions', 'tags', 'category'
    ];
    
    const updateData: any = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });
    
    // Atualizar publishedAt se status mudou para active
    if (data.status === 'active' && job.status !== 'active') {
      updateData.publishedAt = new Date();
    }
    
    updateData.lastModifiedBy = user._id;
    
    const updatedJob = await Job.findByIdAndUpdate(
      resolvedParams.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('companyId', 'name logo industry size location')
     .select('-__v');
    
    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: 'Vaga atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar vaga:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar vaga' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar vaga
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    await connectMongoDB();
    
    const job = await Job.findById(resolvedParams.id).populate('companyId');
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Vaga não encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar permissões
    const canDelete = user.type === 'admin' || 
                     job.createdBy.toString() === user._id.toString() ||
                     (user.type === 'empresa' && job.companyId.email === user.email);
    
    if (!canDelete) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado' },
        { status: 403 }
      );
    }
    
    await Job.findByIdAndDelete(resolvedParams.id);
    
    // Atualizar estatísticas da empresa
    const company = await Company.findById(job.companyId._id);
    if (company) {
      await company.updateStats();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Vaga deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar vaga:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao deletar vaga' },
      { status: 500 }
    );
  }
} 