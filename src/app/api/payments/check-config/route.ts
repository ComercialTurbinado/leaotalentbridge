import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para verificar configuração do Mercado Pago
 * Útil para debug em produção
 */
export async function GET(request: NextRequest) {
  try {
    const hasProductionToken = !!process.env.MERCADOPAGO_ACCESS_TOKEN;
    const hasTestToken = !!process.env.MERCADOPAGO_TEST_ACCESS_TOKEN;
    const nodeEnv = process.env.NODE_ENV || 'development';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://uaecareers.com/api';
    
    // Determinar qual token será usado
    const willUseProduction = nodeEnv === 'production';
    const tokenConfigured = willUseProduction ? hasProductionToken : hasTestToken;
    const tokenType = willUseProduction ? 'MERCADOPAGO_ACCESS_TOKEN' : 'MERCADOPAGO_TEST_ACCESS_TOKEN';
    
    return NextResponse.json({
      success: true,
      config: {
        nodeEnv,
        apiUrl,
        tokenConfigured,
        tokenType,
        hasProductionToken,
        hasTestToken,
        willUseProduction,
        // Não mostrar o token por segurança, apenas se está configurado
        tokenLength: willUseProduction 
          ? (process.env.MERCADOPAGO_ACCESS_TOKEN?.length || 0)
          : (process.env.MERCADOPAGO_TEST_ACCESS_TOKEN?.length || 0),
      },
      message: tokenConfigured 
        ? 'Configuração OK' 
        : `⚠️ ${tokenType} não está configurado! Configure a variável de ambiente no servidor.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao verificar configuração',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

