import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    await connectMongoDB();
    return await User.findById(decoded.userId);
  } catch (error) {
    return null;
  }
}

// GET - Buscar entrevistas do candidato
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 401 });
    }

    const resolvedParams = await params;
    await connectMongoDB();
    
    // Verificar permissões - apenas o próprio candidato ou admin pode ver
    const canView = user.type === 'admin' || user._id.toString() === resolvedParams.id;
    if (!canView) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const candidate = await User.findById(resolvedParams.id);
    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Candidato não encontrado' }, { status: 404 });
    }

    // Por enquanto, retornar array vazio - as entrevistas virão de uma tabela separada
    // TODO: Implementar modelo de entrevistas quando necessário
    const interviews: any[] = [];

    return NextResponse.json({
      success: true,
      data: interviews,
      message: 'Entrevistas carregadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar entrevistas:', error);
    return NextResponse.json({ success: false, message: 'Erro ao buscar entrevistas' }, { status: 500 });
  }
}
