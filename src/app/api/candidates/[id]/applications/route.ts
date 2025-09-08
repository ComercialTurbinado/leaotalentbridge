import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Application from '@/lib/models/Application';
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

// GET - Buscar candidaturas do candidato
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

    // Buscar candidaturas do candidato
    const applications = await Application.find({ 
      candidateId: resolvedParams.id 
    })
    .populate('jobId', 'title companyId location salary workType status')
    .populate('companyId', 'name logo')
    .sort({ appliedAt: -1 });

    return NextResponse.json({
      success: true,
      data: applications,
      message: 'Candidaturas carregadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error);
    return NextResponse.json({ success: false, message: 'Erro ao buscar candidaturas' }, { status: 500 });
  }
}
