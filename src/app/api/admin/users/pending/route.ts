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

// GET - Buscar usuários pendentes de aprovação
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // candidato, empresa
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const filter: any = { status: 'pending' };
    if (type && ['candidato', 'empresa'].includes(type)) {
      filter.type = type;
    }

    const pendingUsers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: pendingUsers,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários pendentes:', error);
    return NextResponse.json({ success: false, message: 'Erro ao buscar usuários pendentes' }, { status: 500 });
  }
}
