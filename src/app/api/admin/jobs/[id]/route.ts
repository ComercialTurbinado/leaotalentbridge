import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Job from '@/lib/models/Job';
import Company from '@/lib/models/Company';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

// Verificar autenticação de admin
async function verifyAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    await connectMongoDB();
    const user = await User.findById(decoded.userId);
    return user?.type === 'admin' ? user : null;
  } catch (error) {
    return null;
  }
}

// GET - Buscar vaga específica
export async function GET(
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

    const { id } = await params;
    await connectMongoDB();
    
    const job = await Job.findById(id).populate('companyId', 'name industry logo');
    
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Vaga não encontrada' },
        { status: 404 }
      );
    }

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
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas administradores' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const data = await request.json();
    
    await connectMongoDB();
    
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Vaga não encontrada' },
        { status: 404 }
      );
    }

    // Campos permitidos para atualização
    const allowedFields = [
      'title', 'description', 'summary', 'category', 'location', 
      'workType', 'workSchedule', 'salary', 'requirements', 
      'tags', 'status', 'expiresAt'
    ];
    const updateData: any = {};
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });
    
    updateData.lastModifiedBy = admin._id;
    updateData.updatedAt = new Date();

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('companyId', 'name industry logo');

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
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas administradores' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectMongoDB();
    
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Vaga não encontrada' },
        { status: 404 }
      );
    }

    await Job.findByIdAndDelete(id);

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
