import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
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
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify';
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    await connectMongoDB();
    const user = await User.findById(decoded.userId);
    
    return user;
  } catch (error) {
    return null;
  }
}

// GET - Buscar empresa por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await connectMongoDB();
    
    const company = await Company.findById(resolvedParams.id).select('-__v');
    
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Empresa não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar empresa' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar empresa
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
    
    const company = await Company.findById(resolvedParams.id);
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Empresa não encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar permissões
    if (user.type !== 'admin' && company.email !== user.email) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    // Atualizar campos permitidos
    const allowedFields = [
      'name', 'website', 'description', 'industry', 'size', 'foundedYear',
      'address', 'phone', 'primaryContact', 'additionalContacts', 'preferences'
    ];
    
    // Apenas admin pode alterar status e plano
    if (user.type === 'admin') {
      allowedFields.push('status', 'isVerified', 'verificationDate', 'plan');
    }
    
    const updateData: any = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });
    
    const updatedCompany = await Company.findByIdAndUpdate(
      resolvedParams.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');
    
    return NextResponse.json({
      success: true,
      data: updatedCompany,
      message: 'Empresa atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar empresa' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar empresa (apenas admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.type !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - apenas administradores' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    await connectMongoDB();
    
    const company = await Company.findById(resolvedParams.id);
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Empresa não encontrada' },
        { status: 404 }
      );
    }
    
    await Company.findByIdAndDelete(resolvedParams.id);
    
    return NextResponse.json({
      success: true,
      message: 'Empresa deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar empresa:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao deletar empresa' },
      { status: 500 }
    );
  }
} 