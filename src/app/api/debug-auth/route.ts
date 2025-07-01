import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Verificar se existe token no header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        message: 'Header Authorization não encontrado',
        debug: {
          headers: Object.fromEntries(request.headers.entries()),
        }
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Formato do token inválido - deve começar com "Bearer "',
        debug: {
          authHeader,
        }
      });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token não encontrado após "Bearer "',
        debug: {
          authHeader,
          token,
        }
      });
    }

    // Verificar JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify';
    
    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      return NextResponse.json({
        success: true,
        message: 'Token válido',
        debug: {
          token: token.substring(0, 20) + '...',
          decoded: {
            userId: decoded.userId,
            email: decoded.email,
            type: decoded.type,
            iat: decoded.iat,
            exp: decoded.exp,
            expiresAt: new Date(decoded.exp * 1000).toISOString()
          },
          jwtSecretUsed: process.env.JWT_SECRET ? 'Configurado via env' : 'Usando padrão',
          currentTime: new Date().toISOString()
        }
      });
    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        message: 'Token inválido ou expirado',
        debug: {
          token: token.substring(0, 20) + '...',
          jwtError: jwtError instanceof Error ? jwtError.message : String(jwtError),
          jwtSecretUsed: process.env.JWT_SECRET ? 'Configurado via env' : 'Usando padrão'
        }
      });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      debug: {
        error: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
} 