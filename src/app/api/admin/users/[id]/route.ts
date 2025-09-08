import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
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

// GET - Buscar usuário específico
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
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar usuário' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário
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
    
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Campos permitidos para atualização
    const allowedFields = ['name', 'email', 'type', 'status', 'profile'];
    const updateData: any = {};
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });
    
    updateData.updatedAt = new Date();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar usuário
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
    
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se não é o próprio admin
    if (user._id.toString() === admin._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'Não é possível deletar o próprio usuário admin' },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao deletar usuário' },
      { status: 500 }
    );
  }
}
