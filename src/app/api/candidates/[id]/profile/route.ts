import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify';
    const decoded = jwt.verify(token, jwtSecret) as any;
    await connectMongoDB();
    return await User.findById(decoded.userId);
  } catch (error) {
    return null;
  }
}

// GET - Buscar perfil do candidato
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
    const candidate = await User.findById(resolvedParams.id).select('-password -__v');
    
    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Candidato não encontrado' }, { status: 404 });
    }

    if (candidate.type !== 'candidato') {
      return NextResponse.json({ success: false, message: 'Usuário não é um candidato' }, { status: 400 });
    }

    // Verificar permissões
    const canView = user.type === 'admin' || user._id.toString() === resolvedParams.id;
    if (!canView) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: candidate });
  } catch (error) {
    console.error('Erro ao buscar perfil do candidato:', error);
    return NextResponse.json({ success: false, message: 'Erro ao buscar perfil do candidato' }, { status: 500 });
  }
}

// PUT - Atualizar perfil do candidato
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
    const candidate = await User.findById(resolvedParams.id);
    
    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Candidato não encontrado' }, { status: 404 });
    }

    if (candidate.type !== 'candidato') {
      return NextResponse.json({ success: false, message: 'Usuário não é um candidato' }, { status: 400 });
    }

    // Verificar permissões
    const canEdit = user.type === 'admin' || user._id.toString() === resolvedParams.id;
    if (!canEdit) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const data = await request.json();
    
    // Preparar dados para atualização
    const updateData: any = {};
    
    // Informações pessoais básicas
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.birthDate) updateData.birthDate = data.birthDate;
    if (data.nationality) updateData.nationality = data.nationality;
    
    // Endereço
    if (data.address) {
      updateData.address = data.address;
    }
    
    // Informações profissionais
    if (data.professionalInfo) {
      updateData.professionalInfo = data.professionalInfo;
    }
    
    // Educação
    if (data.education) {
      updateData.education = data.education;
    }
    
    // Habilidades
    if (data.skills) {
      updateData.skills = data.skills;
    }
    
    // Idiomas
    if (data.languages) {
      updateData.languages = data.languages;
    }
    
    // Certificações
    if (data.certifications) {
      updateData.certifications = data.certifications;
    }
    
    // Mídia social
    if (data.socialMedia) {
      updateData.socialMedia = data.socialMedia;
    }
    
    // Atualizar perfil
    const updatedCandidate = await User.findByIdAndUpdate(
      resolvedParams.id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password -__v');

    return NextResponse.json({
      success: true,
      data: updatedCandidate,
      message: 'Perfil atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil do candidato:', error);
    return NextResponse.json({ success: false, message: 'Erro ao atualizar perfil do candidato' }, { status: 500 });
  }
}
