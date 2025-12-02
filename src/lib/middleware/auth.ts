import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { Subscription } from '@/lib/models/Payment';

export interface AuthenticatedUser {
  _id: string;
  email: string;
  name: string;
  type: 'candidato' | 'empresa' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  permissions: {
    canAccessJobs: boolean;
    canApplyToJobs: boolean;
    canViewCourses: boolean;
    canAccessSimulations: boolean;
    canContactCompanies: boolean;
  };
  profileVerified?: boolean;
  documentsVerified?: boolean;
  companyVerified?: boolean;
}

export async function verifyAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    console.log('🔍 [DEBUG] verifyAuth - Iniciando verificação...');
    
    const authHeader = request.headers.get('authorization');
    console.log('🔍 [DEBUG] Auth header:', authHeader ? 'presente' : 'ausente');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [DEBUG] Header de autorização inválido ou ausente');
      return null;
    }

    const token = authHeader.substring(7);
    console.log('🔍 [DEBUG] Token extraído:', token ? `${token.substring(0, 20)}...` : 'vazio');
    
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify';
    console.log('🔍 [DEBUG] JWT Secret configurado:', jwtSecret ? 'sim' : 'não');
    
    const decoded = jwt.verify(token, jwtSecret) as any;
    console.log('🔍 [DEBUG] Token decodificado:', decoded ? `userId: ${decoded.userId}` : 'falhou');
    
    await connectMongoDB();
    console.log('🔍 [DEBUG] MongoDB conectado');
    
    const user = await User.findById(decoded.userId).select('-password').lean();
    console.log('🔍 [DEBUG] Usuário encontrado no banco:', user ? 'sim' : 'não');
    
    if (!user) {
      console.log('❌ [DEBUG] Usuário não encontrado no banco');
      return null;
    }

    // Converter documento MongoDB para AuthenticatedUser
    const userData = user as any;
    const authenticatedUser = {
      _id: userData._id.toString(),
      email: userData.email || '',
      name: userData.name || '',
      type: userData.type || 'candidato',
      status: userData.status || 'pending',
      permissions: userData.permissions || {
        canAccessJobs: false,
        canApplyToJobs: false,
        canViewCourses: true,
        canAccessSimulations: true,
        canContactCompanies: false,
      },
      profileVerified: userData.profileVerified || false,
      documentsVerified: userData.documentsVerified || false,
      companyVerified: userData.companyVerified || false,
    } as AuthenticatedUser;
    
    console.log('✅ [DEBUG] Usuário autenticado com sucesso:', {
      id: authenticatedUser._id,
      name: authenticatedUser.name,
      type: authenticatedUser.type,
      status: authenticatedUser.status
    });
    
    return authenticatedUser;
  } catch (error) {
    console.error('❌ [DEBUG] Erro na verificação de auth:', error);
    return null;
  }
}

export function requireAuth(requiredType?: 'candidato' | 'empresa' | 'admin') {
  return async (request: NextRequest, handler: (user: AuthenticatedUser) => Promise<NextResponse>) => {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'Token inválido ou ausente' }, { status: 401 });
    }

    // Verificar se o usuário está aprovado (exceto admin)
    if (user.type !== 'admin' && user.status !== 'approved') {
      let message = 'Conta pendente de aprovação';
      if (user.status === 'rejected') {
        message = 'Conta rejeitada pelo administrador';
      } else if (user.status === 'suspended') {
        message = 'Conta suspensa';
      }
      
      return NextResponse.json({ 
        success: false, 
        message,
        statusCode: 'ACCOUNT_NOT_APPROVED'
      }, { status: 403 });
    }

    // Verificar tipo de usuário se especificado
    if (requiredType && user.type !== requiredType) {
      return NextResponse.json({ success: false, message: 'Tipo de usuário não autorizado' }, { status: 403 });
    }

    return handler(user);
  };
}

export function requirePermission(permission: keyof AuthenticatedUser['permissions']) {
  return async (request: NextRequest, handler: (user: AuthenticatedUser) => Promise<NextResponse>) => {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'Token inválido ou ausente' }, { status: 401 });
    }

    if (user.type !== 'admin' && user.status !== 'approved') {
      return NextResponse.json({ 
        success: false, 
        message: 'Conta não aprovada',
        statusCode: 'ACCOUNT_NOT_APPROVED'
      }, { status: 403 });
    }

    // Admin tem todas as permissões
    if (user.type === 'admin') {
      return handler(user);
    }

    // Verificar permissão específica
    if (!user.permissions?.[permission]) {
      return NextResponse.json({ 
        success: false, 
        message: `Permissão negada: ${permission}`,
        statusCode: 'PERMISSION_DENIED'
      }, { status: 403 });
    }

    return handler(user);
  };
}

export async function verifyAdminAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return null;
    }

    // Verificar se é admin
    if (user.type !== 'admin') {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Erro na verificação de admin auth:', error);
    return null;
  }
}

export function createProtectedRoute(
  routeHandler: (user: AuthenticatedUser, request: NextRequest) => Promise<NextResponse>,
  options?: {
    requiredType?: 'candidato' | 'empresa' | 'admin';
    requiredPermission?: keyof AuthenticatedUser['permissions'];
  }
) {
  return async (request: NextRequest) => {
    try {
      const user = await verifyAuth(request);
      
      if (!user) {
        return NextResponse.json({ success: false, message: 'Token inválido ou ausente' }, { status: 401 });
      }

      // Verificar status da conta (exceto para admin)
      if (user.type !== 'admin' && user.status !== 'approved') {
        let message = 'Conta pendente de aprovação';
        if (user.status === 'rejected') {
          message = 'Conta rejeitada pelo administrador';
        } else if (user.status === 'suspended') {
          message = 'Conta suspensa';
        }
        
        return NextResponse.json({ 
          success: false, 
          message,
          statusCode: 'ACCOUNT_NOT_APPROVED'
        }, { status: 403 });
      }

      // Verificar tipo de usuário
      if (options?.requiredType && user.type !== options.requiredType) {
        return NextResponse.json({ success: false, message: 'Tipo de usuário não autorizado' }, { status: 403 });
      }

      // Verificar permissão específica
      if (options?.requiredPermission && user.type !== 'admin') {
        if (!user.permissions?.[options.requiredPermission]) {
          return NextResponse.json({ 
            success: false, 
            message: `Permissão negada: ${options.requiredPermission}`,
            statusCode: 'PERMISSION_DENIED'
          }, { status: 403 });
        }
      }

      return routeHandler(user, request);
    } catch (error) {
      console.error('Erro na rota protegida:', error);
      return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 });
    }
  };
}

/**
 * Verifica se o usuário tem uma assinatura ativa e não expirada
 * @param userId - ID do usuário
 * @returns true se tiver assinatura ativa, false caso contrário
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    await connectMongoDB();
    
    const subscription = await Subscription.findOne({
      companyId: userId,
      status: 'active',
      endDate: { $gte: new Date() } // Assinatura não expirada
    }).lean();

    return !!subscription;
  } catch (error) {
    console.error('Erro ao verificar assinatura ativa:', error);
    return false;
  }
}

/**
 * Middleware para verificar se o usuário tem assinatura ativa
 * Use em rotas que requerem pagamento para acessar
 */
export function requireActiveSubscription() {
  return async (request: NextRequest, handler: (user: AuthenticatedUser) => Promise<NextResponse>) => {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'Token inválido ou ausente' }, { status: 401 });
    }

    // Admin sempre tem acesso
    if (user.type === 'admin') {
      return handler(user);
    }

    // Verificar se tem assinatura ativa
    const hasSubscription = await hasActiveSubscription(user._id);
    
    if (!hasSubscription) {
      return NextResponse.json({ 
        success: false, 
        message: 'Assinatura não encontrada ou expirada. Por favor, renove sua assinatura.',
        statusCode: 'SUBSCRIPTION_REQUIRED'
      }, { status: 403 });
    }

    return handler(user);
  };
}
