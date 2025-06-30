import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import Job from '@/lib/models/Job';
import Company from '@/lib/models/Company';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    await connectMongoDB();
    return await User.findById(decoded.userId);
  } catch (error) {
    return null;
  }
}

// GET - Buscar candidatura por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 401 });
    }

    const resolvedParams = await params;
    await connectMongoDB();
    const application = await Application.findById(resolvedParams.id)
      .populate('jobId', 'title status location workType salary category')
      .populate('candidateId', 'name email profile')
      .populate('companyId', 'name logo industry')
      .select('-__v');

    if (!application) {
      return NextResponse.json({ success: false, message: 'Candidatura não encontrada' }, { status: 404 });
    }

    // Verificar permissões
    const canView = user.type === 'admin' || 
                   application.candidateId._id.toString() === user._id.toString() ||
                   (user.type === 'empresa' && application.companyId.email === user.email);

    if (!canView) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao buscar candidatura' }, { status: 500 });
  }
}

// PUT - Atualizar candidatura
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 401 });
    }

    const resolvedParams = await params;
    await connectMongoDB();
    const application = await Application.findById(resolvedParams.id).populate('companyId');
    if (!application) {
      return NextResponse.json({ success: false, message: 'Candidatura não encontrada' }, { status: 404 });
    }

    const data = await request.json();
    
    // Verificar permissões e campos permitidos
    let allowedFields: string[] = [];
    
    if (user.type === 'admin') {
      allowedFields = ['status', 'overallRating', 'notes', 'tags', 'priority', 'screening', 'interviews'];
    } else if (user.type === 'empresa' && application.companyId.email === user.email) {
      allowedFields = ['status', 'overallRating', 'notes', 'tags', 'priority', 'interviews'];
    } else if (application.candidateId.toString() === user._id.toString()) {
      allowedFields = ['coverLetter', 'salaryExpectation', 'availabilityDate', 'customAnswers', 'documents', 'communicationPreference'];
    } else {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const updateData: any = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    const updatedApplication = await Application.findByIdAndUpdate(
      resolvedParams.id, updateData, { new: true, runValidators: true }
    ).populate('jobId candidateId companyId').select('-__v');

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: 'Candidatura atualizada com sucesso'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao atualizar candidatura' }, { status: 500 });
  }
}

// DELETE - Deletar candidatura
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 401 });
    }

    const resolvedParams = await params;
    await connectMongoDB();
    const application = await Application.findById(resolvedParams.id);
    if (!application) {
      return NextResponse.json({ success: false, message: 'Candidatura não encontrada' }, { status: 404 });
    }

    // Verificar permissões
    const canDelete = user.type === 'admin' || 
                     application.candidateId.toString() === user._id.toString();

    if (!canDelete) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    await Application.findByIdAndDelete(resolvedParams.id);
    return NextResponse.json({ success: true, message: 'Candidatura deletada com sucesso' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao deletar candidatura' }, { status: 500 });
  }
} 