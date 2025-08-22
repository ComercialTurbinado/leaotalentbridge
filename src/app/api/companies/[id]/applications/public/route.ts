import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import Company from '@/lib/models/Company';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

// Verificar autenticação de empresa
async function verifyCompanyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    await connectMongoDB();
    const user = await User.findById(decoded.userId);
    return user?.type === 'empresa' ? user : null;
  } catch (error) {
    return null;
  }
}

// GET - Listar candidaturas para empresa (sem informações pessoais dos candidatos)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyUser = await verifyCompanyAuth(request);
    if (!companyUser) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas empresas' },
        { status: 403 }
      );
    }

    const { id: companyId } = await params;
    await connectMongoDB();

    // Verificar se a empresa existe e se o usuário tem acesso
    const company = await Company.findById(companyId);
    if (!company || company.email !== companyUser.email) {
      return NextResponse.json(
        { success: false, message: 'Empresa não encontrada ou acesso negado' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const jobId = searchParams.get('jobId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    const adminApproved = searchParams.get('adminApproved');
    
    // Construir filtro - apenas candidaturas da empresa e aprovadas pelo admin
    const filter: any = { 
      companyId: companyId,
      adminApproved: true // Apenas candidaturas aprovadas pelo admin
    };
    
    if (status) filter.status = status;
    if (jobId) filter.jobId = jobId;
    if (adminApproved !== null) filter.adminApproved = adminApproved === 'true';
    
    const skip = (page - 1) * limit;
    
    // Buscar candidaturas com dados limitados do candidato
    let query = Application.find(filter)
      .populate('jobId', 'title status location workType salary category')
      .populate('candidateId', 'profile.experience profile.skills profile.education profile.languages')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Aplicar busca por habilidades ou experiência
    if (search) {
      query = query.populate({
        path: 'candidateId',
        match: { 
          $or: [
            { 'profile.skills': { $in: [new RegExp(search, 'i')] } },
            { 'profile.experience': { $regex: search, $options: 'i' } },
            { 'profile.education': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }
    
    const applications = await query;
    const total = await Application.countDocuments(filter);
    
    // Formatar dados para empresa (sem informações pessoais do candidato)
    const formattedApplications = applications.map(app => ({
      _id: app._id,
      jobId: app.jobId,
      status: app.status,
      appliedAt: app.appliedAt,
      coverLetter: app.coverLetter,
      salaryExpectation: app.salaryExpectation,
      availabilityDate: app.availabilityDate,
      customAnswers: app.customAnswers,
      screening: app.screening,
      // Dados anonimizados do candidato
      candidate: {
        id: app.candidateId._id,
        experience: app.candidateId.profile?.experience || 'Não informado',
        skills: app.candidateId.profile?.skills || [],
        education: app.candidateId.profile?.education || 'Não informado',
        languages: app.candidateId.profile?.languages || [],
        // Informações de contato não são fornecidas
        contactInfo: 'Disponível após aprovação do admin'
      },
      // Métricas da candidatura
      metrics: {
        matchScore: app.screening?.score || 0,
        responseTime: app.lastContactDate ? 
          Math.floor((new Date(app.lastContactDate).getTime() - new Date(app.appliedAt).getTime()) / (1000 * 60 * 60 * 24)) : 
          null, // dias
        priority: app.priority || 'medium'
      }
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedApplications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar candidaturas da empresa:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar candidaturas' },
      { status: 500 }
    );
  }
}
