import { NextResponse } from 'next/server';

export async function GET() {
  // Listar TODAS as variáveis de ambiente disponíveis (para debug)
  const allEnvKeys = Object.keys(process.env).sort();
  const envKeysWithValues = allEnvKeys
    .filter(key => !key.includes('SECRET') && !key.includes('TOKEN') && !key.includes('PASSWORD') && !key.includes('KEY'))
    .map(key => ({ key, exists: true, length: process.env[key]?.length || 0 }));
  
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
    JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
    JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
    // Mercado Pago
    MERCADOPAGO_ACCESS_TOKEN_EXISTS: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
    MERCADOPAGO_ACCESS_TOKEN_LENGTH: process.env.MERCADOPAGO_ACCESS_TOKEN?.length || 0,
    MERCADOPAGO_ACCESS_TOKEN_PARTIAL: process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 10) + '...' || 'não definida',
    MERCADOPAGO_TEST_ACCESS_TOKEN_EXISTS: !!process.env.MERCADOPAGO_TEST_ACCESS_TOKEN,
    MERCADOPAGO_TEST_ACCESS_TOKEN_LENGTH: process.env.MERCADOPAGO_TEST_ACCESS_TOKEN?.length || 0,
    // Não vamos mostrar os valores reais por segurança
    MONGODB_URI_PARTIAL: process.env.MONGODB_URI?.substring(0, 30) + '...' || 'não definida',
    JWT_SECRET_PARTIAL: process.env.JWT_SECRET?.substring(0, 10) + '...' || 'não definida',
    // Listar todas as variáveis que começam com MERCADOPAGO
    ALL_MERCADOPAGO_VARS: Object.keys(process.env)
      .filter(key => key.includes('MERCADOPAGO'))
      .map(key => ({
        name: key,
        exists: !!process.env[key],
        length: process.env[key]?.length || 0
      })),
    // Listar algumas variáveis seguras para debug
    SAFE_ENV_VARS: envKeysWithValues.slice(0, 20), // Primeiras 20 variáveis seguras
    TOTAL_ENV_VARS_COUNT: allEnvKeys.length
  };

  return NextResponse.json({
    success: true,
    message: 'Debug das variáveis de ambiente',
    data: envVars
  });
} 