import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import CompanyConnection from '@/lib/models/CompanyConnection';
import User from '@/lib/models/User';
import Company from '@/lib/models/Company';
import { verifyAuth } from '@/lib/middleware/auth';

// GET - Listar conexões do candidato
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const resolvedParams = await params;
    await connectMongoDB();

    // Verificar se o candidato existe
    const candidate = await User.findById(resolvedParams.id);
    if (!candidate || candidate.type !== 'candidato') {
      return NextResponse.json({ success: false, message: 'Candidato não encontrado' }, { status: 404 });
    }

    const connections = await CompanyConnection.find({ candidateId: resolvedParams.id })
      .populate('companyId', 'name email industry')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: connections,
      message: `${connections.length} conexão(ões) encontrada(s)`
    });
  } catch (error) {
    console.error('Erro ao buscar conexões:', error);
    return NextResponse.json({ success: false, message: 'Erro ao buscar conexões' }, { status: 500 });
  }
}

// POST - Criar nova conexão
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const resolvedParams = await params;
    await connectMongoDB();

    // Verificar se o candidato existe
    const candidate = await User.findById(resolvedParams.id);
    if (!candidate || candidate.type !== 'candidato') {
      return NextResponse.json({ success: false, message: 'Candidato não encontrado' }, { status: 404 });
    }

    const data = await request.json();
    
    // Verificar se a empresa existe
    const company = await Company.findById(data.companyId);
    if (!company) {
      return NextResponse.json({ success: false, message: 'Empresa não encontrada' }, { status: 404 });
    }

    // Verificar se já existe uma conexão
    const existingConnection = await CompanyConnection.findOne({
      candidateId: resolvedParams.id,
      companyId: data.companyId
    });

    if (existingConnection) {
      return NextResponse.json({ 
        success: false, 
        message: 'Já existe uma conexão entre este candidato e empresa' 
      }, { status: 400 });
    }

    const newConnection = new CompanyConnection({
      candidateId: resolvedParams.id,
      companyId: data.companyId,
      status: data.status || 'active',
      requestedBy: 'admin',
      permissions: {
        canViewProfile: data.permissions?.canViewProfile ?? true,
        canViewDocuments: data.permissions?.canViewDocuments ?? false,
        canScheduleInterviews: data.permissions?.canScheduleInterviews ?? true,
        canSendMessages: data.permissions?.canSendMessages ?? true,
        canViewApplications: data.permissions?.canViewApplications ?? false
      },
      notes: data.notes,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
    });

    // Se o status for 'active', marcar como aprovado
    if (newConnection.status === 'active') {
      newConnection.approvedBy = user._id;
      newConnection.approvedAt = new Date();
    }

    await newConnection.save();

    // Populate para retornar dados completos
    await newConnection.populate('companyId', 'name email industry');

    return NextResponse.json({
      success: true,
      data: newConnection,
      message: 'Conexão criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar conexão:', error);
    return NextResponse.json({ success: false, message: 'Erro ao criar conexão' }, { status: 500 });
  }
}
