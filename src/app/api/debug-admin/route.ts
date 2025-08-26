import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// GET - Verificar admin existente
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const admin = await User.findOne({ type: 'admin' });
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum admin encontrado no sistema'
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        type: admin.type,
        status: admin.status,
        createdAt: admin.createdAt
      },
      message: 'Admin encontrado'
    });
  } catch (error) {
    console.error('Erro ao buscar admin:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar admin' },
      { status: 500 }
    );
  }
}

// POST - Atualizar status do admin para approved
export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const admin = await User.findOne({ type: 'admin' });
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum admin encontrado no sistema'
      });
    }
    
    // Atualizar status para approved
    admin.status = 'approved';
    await admin.save();
    
    return NextResponse.json({
      success: true,
      data: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        type: admin.type,
        status: admin.status
      },
      message: 'Admin atualizado para status approved'
    });
  } catch (error) {
    console.error('Erro ao atualizar admin:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar admin' },
      { status: 500 }
    );
  }
}
