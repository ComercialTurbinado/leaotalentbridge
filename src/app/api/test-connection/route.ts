import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';

export async function GET() {
  try {
    const mongoose = await connectMongoDB();
    
    if (!mongoose) {
      return NextResponse.json(
        { success: false, message: 'Falha na conexão com MongoDB' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Conexão com MongoDB estabelecida com sucesso',
        connectionString: process.env.MONGODB_URI?.split('@')[1] || 'URI não disponível'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao testar conexão com MongoDB:', error);
    return NextResponse.json(
      { success: false, message: `Erro ao conectar: ${error}` },
      { status: 500 }
    );
  }
} 