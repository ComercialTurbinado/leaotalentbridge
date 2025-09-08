import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Interview from '@/lib/models/Interview';
import User from '@/lib/models/User';
import Company from '@/lib/models/Company';
import { verifyAuth } from '@/lib/middleware/auth';

// GET - Listar entrevistas do candidato
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

    const interviews = await Interview.find({ candidateId: resolvedParams.id })
      .populate('companyId', 'name email')
      .populate('jobId', 'title')
      .sort({ scheduledDate: -1 });

    return NextResponse.json({
      success: true,
      data: interviews,
      message: `${interviews.length} entrevista(s) encontrada(s)`
    });
  } catch (error) {
    console.error('Erro ao buscar entrevistas:', error);
    return NextResponse.json({ success: false, message: 'Erro ao buscar entrevistas' }, { status: 500 });
  }
}

// POST - Agendar nova entrevista
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
    
    // Verificar se a empresa existe
    const company = await Company.findById(data.companyId);
    if (!company) {
      return NextResponse.json({ success: false, message: 'Empresa não encontrada' }, { status: 404 });
    }

    const newInterview = new Interview({
      candidateId: resolvedParams.id,
      companyId: data.companyId,
      jobId: data.jobId,
      title: data.title,
      description: data.description,
      scheduledDate: new Date(data.scheduledDate),
      duration: data.duration || 60,
      type: data.type,
      location: data.location,
      meetingUrl: data.meetingUrl,
      interviewerName: data.interviewerName,
      interviewerEmail: data.interviewerEmail,
      interviewerPhone: data.interviewerPhone,
      notes: data.notes,
      createdBy: user._id
    });

    await newInterview.save();

    // Populate para retornar dados completos
    await newInterview.populate('companyId', 'name email');
    await newInterview.populate('jobId', 'title');

    return NextResponse.json({
      success: true,
      data: newInterview,
      message: 'Entrevista agendada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao agendar entrevista:', error);
    return NextResponse.json({ success: false, message: 'Erro ao agendar entrevista' }, { status: 500 });
  }
}
