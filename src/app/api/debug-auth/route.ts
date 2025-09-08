import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token não fornecido'
      });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('🔍 Token decodificado:', decoded);
    
    // Buscar usuário
    const user = await User.findById(decoded.userId);
    console.log('🔍 Usuário encontrado:', user ? {
      _id: user._id,
      email: user.email,
      name: user.name,
      type: user.type,
      status: user.status
    } : 'Não encontrado');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Verificar se é admin
    const isAdmin = user.type === 'admin';
    const isApproved = user.status === 'approved';
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          type: user.type,
          status: user.status
        },
        auth: {
          isAdmin,
          isApproved,
          canAccess: isAdmin && isApproved
        }
      },
      message: `Verificação completa - Admin: ${isAdmin}, Aprovado: ${isApproved}`
    });
    
  } catch (error) {
    console.error('Erro na verificação de auth:', error);
    return NextResponse.json(
      { success: false, message: 'Erro na verificação' },
      { status: 500 }
    );
  }
} 