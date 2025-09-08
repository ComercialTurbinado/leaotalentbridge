import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// GET - Verificar admin existente
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const admins = await User.find({ type: 'admin' }).select('-password');
    
    if (!admins || admins.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum admin encontrado no sistema'
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        total: admins.length,
        admins: admins.map(admin => ({
          _id: admin._id,
          email: admin.email,
          name: admin.name,
          type: admin.type,
          status: admin.status || 'N/A',
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
          profile: admin.profile
        }))
      },
      message: `${admins.length} admin(s) encontrado(s) no sistema`
    });
  } catch (error) {
    console.error('Erro ao buscar admins:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar admins' },
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

// PATCH - Atualizar admin ou candidato existente com status e senha hasheada
export async function PATCH(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const { email, password, status } = await request.json();
    
    let user;
    
    if (email) {
      // Buscar usuário específico por email
      user = await User.findOne({ email });
    } else {
      // Buscar admin padrão
      user = await User.findOne({ type: 'admin' });
    }
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado no sistema'
      });
    }
    
    // Hash da senha se fornecida
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      console.log(`Senha atualizada para ${user.email}: ${password}`);
    }
    
    // Atualizar status se fornecido
    if (status) {
      user.status = status;
    }
    
    await user.save();
    
    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        type: user.type,
        status: user.status
      },
      message: `${user.type === 'admin' ? 'Admin' : 'Usuário'} atualizado com sucesso - Status: ${user.status}, Senha: hasheada`
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}


