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
        createdAt: admin.createdAt,
        // Mostrar credenciais para debug
        credentials: {
          email: admin.email,
          password: '****** (senha hasheada no banco)',
          note: 'Use o email para login, a senha foi definida no cadastro'
        }
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

// PUT - Criar ou redefinir admin
export async function PUT(request: NextRequest) {
  try {
    await connectMongoDB();
    
    // Verificar se já existe admin
    let admin = await User.findOne({ type: 'admin' });
    
    if (admin) {
      // Se existe, atualizar senha
      const { password } = await request.json();
      admin.password = password; // Será hasheada pelo middleware
      admin.status = 'approved';
      await admin.save();
      
      return NextResponse.json({
        success: true,
        data: {
          email: admin.email,
          name: admin.name,
          status: admin.status
        },
        message: 'Admin atualizado com nova senha'
      });
    } else {
      // Se não existe, criar novo admin
      const { email, password, name } = await request.json();
      
      const newAdmin = new User({
        email: email || 'admin@leaocareers.com',
        password: password || 'admin123',
        name: name || 'Admin Sistema',
        type: 'admin',
        status: 'approved'
      });
      
      await newAdmin.save();
      
      return NextResponse.json({
        success: true,
        data: {
          email: newAdmin.email,
          name: newAdmin.name,
          status: newAdmin.status
        },
        message: 'Admin criado com sucesso'
      });
    }
  } catch (error) {
    console.error('Erro ao criar/atualizar admin:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao criar/atualizar admin' },
      { status: 500 }
    );
  }
}
