import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Application from '@/lib/models/Application';
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
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify';
    const decoded = jwt.verify(token, jwtSecret) as any;
    await connectMongoDB();
    const user = await User.findById(decoded.userId);
    return user?.type === 'admin' ? user : null;
  } catch (error) {
    return null;
  }
}

// GET - Listar todas as candidaturas (admin)
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
    const jobId = searchParams.get('jobId');
    const companyId = searchParams.get('companyId');
    const candidateId = searchParams.get('candidateId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    const adminApproved = searchParams.get('adminApproved');
    
    // Construir filtro
    const filter: any = {};
    if (status) filter.status = status;
    if (jobId) filter.jobId = jobId;
    if (companyId) filter.companyId = companyId;
    if (candidateId) filter.candidateId = candidateId;
    if (adminApproved !== null) filter.adminApproved = adminApproved === 'true';
    
    const skip = (page - 1) * limit;
    
    // Buscar candidaturas com dados completos
    let query = Application.find(filter)
      .populate('jobId', 'title status location workType salary category requirements')
      .populate('candidateId', 'name email profile.phone profile.avatar profile.experience profile.skills profile.education')
      .populate('companyId', 'name logo industry size')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Aplicar busca por texto
    if (search) {
      query = query.populate({
        path: 'candidateId',
        match: { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      }).populate({
        path: 'jobId',
        match: { title: { $regex: search, $options: 'i' } }
      });
    }
    
    const applications = await query;
    const total = await Application.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar candidaturas' },
      { status: 500 }
    );
  }
}

// POST - Aprovar/rejeitar candidatura (admin)
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas administradores' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { applicationId, action, notes } = data;
    
    if (!applicationId || !action) {
      return NextResponse.json(
        { success: false, message: 'ID da candidatura e ação são obrigatórios' },
        { status: 400 }
      );
    }

    await connectMongoDB();
    
    const application = await Application.findById(applicationId)
      .populate('jobId')
      .populate('candidateId')
      .populate('companyId');
    
    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Candidatura não encontrada' },
        { status: 404 }
      );
    }

    let updateData: any = {
      adminApproved: action === 'approve',
      'notes.admin': notes || `Candidatura ${action === 'approve' ? 'aprovada' : 'rejeitada'} pelo admin`,
      updatedAt: new Date()
    };

    // Adicionar à timeline
    updateData.$push = {
      timeline: {
        action: action === 'approve' ? 'admin_approved' : 'admin_rejected',
        date: new Date(),
        by: admin._id,
        details: notes || `Candidatura ${action === 'approve' ? 'aprovada' : 'rejeitada'} pelo administrador`
      }
    };

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true, runValidators: true }
    ).populate('jobId candidateId companyId');

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: `Candidatura ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao processar candidatura:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar candidatura' },
      { status: 500 }
    );
  }
}
