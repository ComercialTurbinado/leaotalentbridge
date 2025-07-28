import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
    JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
    JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
    // Não vamos mostrar os valores reais por segurança
    MONGODB_URI_PARTIAL: process.env.MONGODB_URI?.substring(0, 30) + '...' || 'não definida',
    JWT_SECRET_PARTIAL: process.env.JWT_SECRET?.substring(0, 10) + '...' || 'não definida'
  };

  return NextResponse.json({
    success: true,
    message: 'Debug das variáveis de ambiente',
    data: envVars
  });
} 