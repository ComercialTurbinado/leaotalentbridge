import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

// GET - Buscar usuário por ID
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
    const targetUser = await User.findById(resolvedParams.id).select('-password -__v');
    
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar permissões
    const canView = user.type === 'admin' || user._id.toString() === resolvedParams.id;
    if (!canView) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: targetUser });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao buscar usuário' }, { status: 500 });
  }
}

// PUT - Atualizar usuário
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
    const targetUser = await User.findById(resolvedParams.id);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar permissões
    const canEdit = user.type === 'admin' || user._id.toString() === resolvedParams.id;
    if (!canEdit) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const data = await request.json();
    
    // Campos permitidos para atualização
    let allowedFields = ['name', 'profile'];
    
    // Admin pode alterar mais campos
    if (user.type === 'admin') {
      allowedFields.push('type', 'email');
    }

    const updateData: any = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    // Se senha foi fornecida, criptografar
    if (data.password && (user.type === 'admin' || user._id.toString() === resolvedParams.id)) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(
      resolvedParams.id, updateData, { new: true, runValidators: true }
    ).select('-password -__v');

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao atualizar usuário' }, { status: 500 });
  }
}

// DELETE - Deletar usuário (apenas admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const resolvedParams = await params;
    await connectMongoDB();
    const targetUser = await User.findById(resolvedParams.id);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado' }, { status: 404 });
    }

    await User.findByIdAndDelete(resolvedParams.id);
    return NextResponse.json({ success: true, message: 'Usuário deletado com sucesso' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao deletar usuário' }, { status: 500 });
  }
} 