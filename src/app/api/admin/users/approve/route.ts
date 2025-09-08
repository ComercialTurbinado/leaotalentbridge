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

// POST - Aprovar ou rejeitar usuário
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAuth(request);
    if (!admin || admin.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const { userId, action, rejectionReason, permissions } = await request.json();

    if (!userId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        success: false, 
        message: 'userId e action (approve/reject) são obrigatórios' 
      }, { status: 400 });
    }

    await connectMongoDB();
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado' }, { status: 404 });
    }

    if (user.status !== 'pending') {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário já foi processado anteriormente' 
      }, { status: 400 });
    }

    if (action === 'approve') {
      // Definir permissões padrão baseado no tipo
      const defaultPermissions = {
        candidato: {
          canAccessJobs: true,
          canApplyToJobs: true,
          canViewCourses: true,
          canAccessSimulations: true,
          canContactCompanies: false // Inicialmente false, admin pode liberar depois
        },
        empresa: {
          canAccessJobs: false, // Empresas não veem vagas
          canApplyToJobs: false,
          canViewCourses: true,
          canAccessSimulations: false,
          canContactCompanies: true
        }
      };

      const userPermissions = permissions || defaultPermissions[user.type as keyof typeof defaultPermissions] || {};

      await User.findByIdAndUpdate(userId, {
        status: 'approved',
        approvedBy: admin._id,
        approvedAt: new Date(),
        permissions: userPermissions,
        ...(user.type === 'candidato' && { profileVerified: true }),
        ...(user.type === 'empresa' && { companyVerified: true })
      });

      return NextResponse.json({
        success: true,
        message: `${user.type === 'candidato' ? 'Candidato' : 'Empresa'} aprovado com sucesso!`
      });

    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json({ 
          success: false, 
          message: 'Motivo da rejeição é obrigatório' 
        }, { status: 400 });
      }

      await User.findByIdAndUpdate(userId, {
        status: 'rejected',
        approvedBy: admin._id,
        approvedAt: new Date(),
        rejectionReason,
        permissions: {
          canAccessJobs: false,
          canApplyToJobs: false,
          canViewCourses: false,
          canAccessSimulations: false,
          canContactCompanies: false
        }
      });

      return NextResponse.json({
        success: true,
        message: `${user.type === 'candidato' ? 'Candidato' : 'Empresa'} rejeitado.`
      });
    }

  } catch (error) {
    console.error('Erro ao processar aprovação:', error);
    return NextResponse.json({ success: false, message: 'Erro ao processar aprovação' }, { status: 500 });
  }
}
