import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import CandidateDocument from '@/lib/models/CandidateDocument';
import { verifyAdminAuth } from '@/lib/middleware/auth';

// PUT - Mudar status do documento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const resolvedParams = await params;
    await connectMongoDB();

    const { status, comments, rejectionReason } = await request.json();

    // Validar status
    const validStatuses = ['pending', 'under_review', 'verified', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Status inválido. Use: pending, under_review, verified, rejected' 
      }, { status: 400 });
    }

    // Buscar o documento
    const document = await CandidateDocument.findById(resolvedParams.documentId);
    if (!document) {
      return NextResponse.json({ success: false, message: 'Documento não encontrado' }, { status: 404 });
    }

    // Atualizar status
    document.status = status;
    document.verifiedBy = admin._id;
    document.verifiedAt = new Date();
    
    if (comments) {
      document.adminComments = comments;
    }

    // Se for rejeitado, motivo é obrigatório
    if (status === 'rejected') {
      if (!rejectionReason) {
        return NextResponse.json({ 
          success: false, 
          message: 'Motivo da rejeição é obrigatório' 
        }, { status: 400 });
      }
      document.rejectionReason = rejectionReason;
    } else {
      // Limpar motivo de rejeição se não for rejeitado
      document.rejectionReason = undefined;
    }

    await document.save();

    console.log(`🔄 Documento ${resolvedParams.documentId} status alterado para ${status} por admin ${admin._id}`);

    return NextResponse.json({
      success: true,
      data: document,
      message: `Status do documento alterado para ${status} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao alterar status do documento:', error);
    return NextResponse.json({ success: false, message: 'Erro ao alterar status do documento' }, { status: 500 });
  }
}

// GET - Obter histórico de mudanças de status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const resolvedParams = await params;
    await connectMongoDB();

    const document = await CandidateDocument.findById(resolvedParams.documentId)
      .populate('verifiedBy', 'name email')
      .populate('candidateId', 'name email');

    if (!document) {
      return NextResponse.json({ success: false, message: 'Documento não encontrado' }, { status: 404 });
    }

    // Criar histórico de mudanças
    const history = [
      {
        action: 'created',
        status: 'pending',
        date: document.createdAt,
        by: document.uploadedBy === 'candidate' ? 'candidate' : 'admin',
        details: 'Documento enviado'
      }
    ];

    if (document.verifiedAt && document.verifiedBy) {
      history.push({
        action: 'status_changed',
        status: document.status,
        date: document.verifiedAt,
        by: 'admin',
        details: `Status alterado para ${document.status}${document.adminComments ? ` - ${document.adminComments}` : ''}`
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        document,
        history
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico do documento:', error);
    return NextResponse.json({ success: false, message: 'Erro ao buscar histórico do documento' }, { status: 500 });
  }
}
