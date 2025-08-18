import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Job from '@/lib/models/Job';
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

// POST - Liberar vaga para candidatos específicos
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAuth(request);
    if (!admin || admin.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const { jobId, candidateIds, releaseToAll } = await request.json();

    if (!jobId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID da vaga é obrigatório' 
      }, { status: 400 });
    }

    await connectMongoDB();
    
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ success: false, message: 'Vaga não encontrada' }, { status: 404 });
    }

    if (releaseToAll) {
      // Liberar para todos os candidatos aprovados
      await User.updateMany(
        { 
          type: 'candidato', 
          status: 'approved',
          'permissions.canAccessJobs': true 
        },
        { 
          $addToSet: { 'permissions.releasedJobs': jobId }
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Vaga liberada para todos os candidatos aprovados!'
      });

    } else if (candidateIds && candidateIds.length > 0) {
      // Liberar para candidatos específicos
      await User.updateMany(
        { 
          _id: { $in: candidateIds },
          type: 'candidato',
          status: 'approved'
        },
        { 
          $addToSet: { 'permissions.releasedJobs': jobId }
        }
      );

      return NextResponse.json({
        success: true,
        message: `Vaga liberada para ${candidateIds.length} candidato(s) selecionado(s)!`
      });

    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Selecione candidatos ou marque para liberar para todos' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro ao liberar vaga:', error);
    return NextResponse.json({ success: false, message: 'Erro ao liberar vaga' }, { status: 500 });
  }
}

// DELETE - Remover liberação de vaga
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAuth(request);
    if (!admin || admin.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const candidateId = searchParams.get('candidateId');

    if (!jobId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID da vaga é obrigatório' 
      }, { status: 400 });
    }

    await connectMongoDB();

    if (candidateId) {
      // Remover liberação para candidato específico
      await User.updateOne(
        { _id: candidateId },
        { $pull: { 'permissions.releasedJobs': jobId } }
      );
    } else {
      // Remover liberação para todos
      await User.updateMany(
        {},
        { $pull: { 'permissions.releasedJobs': jobId } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Liberação removida com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao remover liberação:', error);
    return NextResponse.json({ success: false, message: 'Erro ao remover liberação' }, { status: 500 });
  }
}
