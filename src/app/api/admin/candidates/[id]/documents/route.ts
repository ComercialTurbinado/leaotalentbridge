import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import CandidateDocument from '@/lib/models/CandidateDocument';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/middleware/auth';

// GET - Listar documentos do candidato
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const resolvedParams = await params;
    await connectMongoDB();

    // Verificar se o candidato existe
    const candidate = await User.findById(resolvedParams.id);
    if (!candidate || candidate.type !== 'candidato') {
      return NextResponse.json({ success: false, message: 'Candidato não encontrado' }, { status: 404 });
    }

    const documents = await CandidateDocument.find({ candidateId: resolvedParams.id })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: documents,
      message: `${documents.length} documento(s) encontrado(s)`
    });
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    return NextResponse.json({ success: false, message: 'Erro ao buscar documentos' }, { status: 500 });
  }
}

// POST - Criar novo documento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const resolvedParams = await params;
    await connectMongoDB();

    // Verificar se o candidato existe
    const candidate = await User.findById(resolvedParams.id);
    if (!candidate || candidate.type !== 'candidato') {
      return NextResponse.json({ success: false, message: 'Candidato não encontrado' }, { status: 404 });
    }

    const data = await request.json();
    
    const newDocument = new CandidateDocument({
      candidateId: resolvedParams.id,
      type: data.type,
      title: data.title,
      description: data.description,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      uploadedBy: 'admin',
      status: 'verified', // Documentos enviados pelo admin são automaticamente verificados
      verifiedBy: user._id,
      verifiedAt: new Date()
    });

    await newDocument.save();

    return NextResponse.json({
      success: true,
      data: newDocument,
      message: 'Documento criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    return NextResponse.json({ success: false, message: 'Erro ao criar documento' }, { status: 500 });
  }
}
