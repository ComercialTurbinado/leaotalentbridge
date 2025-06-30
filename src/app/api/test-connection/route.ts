import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const conn = await connectMongoDB();
    
    // Verificar se a conexão está estabelecida
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        message: 'Não foi possível conectar ao MongoDB',
        readyState: mongoose.connection.readyState
      }, { status: 500 });
    }
    
    // Listar coleções disponíveis
    let collectionNames: string[] = [];
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      collectionNames = collections.map(c => c.name);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Conexão com MongoDB estabelecida com sucesso',
      database: mongoose.connection.db ? mongoose.connection.db.databaseName : 'unknown',
      collections: collectionNames,
      connectionInfo: {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        readyState: mongoose.connection.readyState
      }
    });
  } catch (error) {
    console.error('Erro ao testar conexão com MongoDB:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao testar conexão com MongoDB',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 