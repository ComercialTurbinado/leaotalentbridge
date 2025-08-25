import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
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

// GET - Buscar empresa específica
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
    
    const company = await Company.findById(id);
    
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
    
    const company = await Company.findById(id);
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Campos permitidos para atualização
    const allowedFields = ['name', 'email', 'industry', 'size', 'location', 'website', 'description', 'logo', 'status'];
    const updateData: any = {};
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });
    
    updateData.updatedAt = new Date();

    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

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

// DELETE - Deletar empresa
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
    
    const company = await Company.findById(id);
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    await Company.findByIdAndDelete(id);

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
