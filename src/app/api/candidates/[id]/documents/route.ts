import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import CandidateDocument from '@/lib/models/CandidateDocument';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/middleware/auth';
import { DocumentValidationService } from '@/lib/services/DocumentValidationService';

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

    // Verificar se o usuário tem permissão para acessar os documentos
    if (user.type !== 'admin' && user._id.toString() !== resolvedParams.id) {
      return NextResponse.json({ success: false, message: 'Acesso negado aos documentos' }, { status: 403 });
    }

    console.log('🔍 Buscando documentos para candidato:', resolvedParams.id);
    
    const documents = await CandidateDocument.find({ candidateId: resolvedParams.id })
      .sort({ createdAt: -1 });

    console.log('📄 Documentos encontrados:', documents.length);
    console.log('📋 Documentos:', documents.map(d => ({ 
      id: d._id, 
      title: d.title, 
      uploadedBy: d.uploadedBy, 
      status: d.status 
    })));

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

// POST - Adicionar documento ao candidato
export async function POST(
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
    
    // Verificar permissões - apenas o próprio candidato pode adicionar documentos
    if (user._id.toString() !== resolvedParams.id) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const data = await request.json();
    
    // Validar dados obrigatórios
    if (!data.title || !data.type || !data.fileUrl || !data.fileName) {
      return NextResponse.json({ 
        success: false, 
        message: 'Título, tipo, URL e nome do arquivo são obrigatórios' 
      }, { status: 400 });
    }

    // Validar documento antes de salvar
    console.log('🔍 Validando documento...');
    const validationResult = await DocumentValidationService.validateDocument({
      type: data.type,
      fileType: data.fileType || 'pdf',
      title: data.title,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize || 0,
      mimeType: data.mimeType || 'application/pdf'
    });

    console.log('✅ Resultado da validação:', validationResult);

    // Determinar status inicial baseado na validação
    let initialStatus = 'pending';
    if (validationResult.errors.length > 0) {
      initialStatus = 'rejected';
    } else if (validationResult.warnings.length > 0) {
      initialStatus = 'under_review';
    }

    // Criar novo documento usando o modelo CandidateDocument
    const newDocument = new CandidateDocument({
      candidateId: resolvedParams.id,
      type: data.type,
      fileType: data.fileType || 'pdf',
      title: data.title,
      description: data.description || '',
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize || 0,
      mimeType: data.mimeType || 'application/pdf',
      status: initialStatus,
      uploadedBy: 'candidate',
      priority: DocumentValidationService.getDocumentPriority(data.type),
      validationResults: {
        fileIntegrity: validationResult.fileIntegrity,
        formatValid: validationResult.formatValid,
        sizeValid: validationResult.sizeValid,
        contentValid: validationResult.contentValid,
        errors: validationResult.errors
      },
      adminComments: validationResult.warnings.length > 0 ? 
        `Avisos de validação: ${validationResult.warnings.join(', ')}` : undefined
    });

    await newDocument.save();

    return NextResponse.json({
      success: true,
      data: newDocument,
      message: 'Documento adicionado com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar documento:', error);
    return NextResponse.json({ success: false, message: 'Erro ao adicionar documento' }, { status: 500 });
  }
}
