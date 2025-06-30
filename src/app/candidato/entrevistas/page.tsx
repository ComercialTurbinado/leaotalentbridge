'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Crown, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  User, 
  Bell, 
  Settings, 
  LogOut,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  MessageSquare,
  FileText,
  Star,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Edit3,
  Trash2,
  MoreVertical,
  Building,
  Briefcase,
  Users,
  Award,
  Target,
  Zap,
  ChevronRight
} from 'lucide-react';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import styles from './entrevistas.module.css';

interface Interview {
  id: number;
  title: string;
  position: string;
  type: 'online' | 'presencial' | 'telefone';
  date: string;
  time: string;
  duration: number;
  status: 'agendada' | 'confirmada' | 'concluida' | 'cancelada' | 'reagendada';
  location?: string;
  meetingLink?: string;
  phone?: string;
  interviewer: string;
  interviewerRole: string;
  description: string;
  requirements?: string[];
  feedback?: string;
  rating?: number;
  nextSteps?: string;
  companyCode: string; // Código anônimo da empresa
  matchScore: number;
  preparationMaterials?: string[];
}

export default function EntrevistasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('proximas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: 1,
      title: 'Entrevista Técnica - Desenvolvedor Full Stack',
      position: 'Desenvolvedor Full Stack Sênior',
      type: 'online',
      date: '2024-12-20',
      time: '14:00',
      duration: 60,
      status: 'confirmada',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      interviewer: 'Sarah Johnson',
      interviewerRole: 'Tech Lead',
      description: 'Entrevista técnica focada em React, Node.js e arquitetura de sistemas. Será uma conversa sobre sua experiência e alguns desafios técnicos.',
      requirements: [
        'Conhecimento em React e Node.js',
        'Experiência com APIs REST',
        'Conceitos de arquitetura de software',
        'Experiência com bancos de dados'
      ],
      companyCode: 'TECH-001',
      matchScore: 92,
      preparationMaterials: [
        'Guia de Preparação Técnica',
        'Exercícios de Coding',
        'Perguntas Comportamentais'
      ]
    },
    {
      id: 2,
      title: 'Entrevista Cultural - Product Manager',
      position: 'Product Manager',
      type: 'online',
      date: '2024-12-22',
      time: '10:00',
      duration: 45,
      status: 'agendada',
      meetingLink: 'https://zoom.us/j/123456789',
      interviewer: 'Ahmed Al-Rashid',
      interviewerRole: 'Head of Product',
      description: 'Conversa sobre fit cultural, experiência em gestão de produtos e visão estratégica. Foco em adaptação ao mercado do Oriente Médio.',
      requirements: [
        'Experiência em gestão de produtos',
        'Conhecimento de metodologias ágeis',
        'Visão estratégica de negócios',
        'Adaptabilidade cultural'
      ],
      companyCode: 'INNOV-002',
      matchScore: 88,
      preparationMaterials: [
        'Guia Cultural - Emirados Árabes',
        'Metodologias de Product Management',
        'Casos de Estudo'
      ]
    },
    {
      id: 3,
      title: 'Entrevista Final - UX Designer',
      position: 'UX/UI Designer Sênior',
      type: 'presencial',
      date: '2024-12-18',
      time: '16:00',
      duration: 90,
      status: 'concluida',
      location: 'Dubai, UAE',
      interviewer: 'Maria Santos',
      interviewerRole: 'Design Director',
      description: 'Apresentação de portfolio e discussão sobre projetos. Entrevista final com a equipe de design.',
      feedback: 'Excelente apresentação do portfolio. Demonstrou forte conhecimento em UX research e design systems. Aprovado para próxima fase.',
      rating: 5,
      nextSteps: 'Aguardando proposta comercial. Previsão: 3-5 dias úteis.',
      companyCode: 'DESIGN-003',
      matchScore: 95
    },
    {
      id: 4,
      title: 'Entrevista Técnica - DevOps Engineer',
      position: 'DevOps Engineer',
      type: 'online',
      date: '2024-12-15',
      time: '11:00',
      duration: 75,
      status: 'concluida',
      meetingLink: 'https://teams.microsoft.com/l/meetup-join/...',
      interviewer: 'Carlos Rodriguez',
      interviewerRole: 'DevOps Manager',
      description: 'Avaliação técnica em AWS, Docker, Kubernetes e CI/CD. Discussão sobre infraestrutura como código.',
      feedback: 'Bom conhecimento técnico, mas precisa aprofundar em Kubernetes. Recomendado para segunda entrevista.',
      rating: 4,
      nextSteps: 'Segunda entrevista agendada para próxima semana.',
      companyCode: 'CLOUD-004',
      matchScore: 85
    }
  ]);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    AuthService.logout();
    router.push('/');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmada':
        return <CheckCircle size={16} className={styles.statusConfirmed} />;
      case 'agendada':
        return <Clock size={16} className={styles.statusScheduled} />;
      case 'concluida':
        return <CheckCircle size={16} className={styles.statusCompleted} />;
      case 'cancelada':
        return <XCircle size={16} className={styles.statusCancelled} />;
      case 'reagendada':
        return <AlertCircle size={16} className={styles.statusRescheduled} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'Confirmada';
      case 'agendada':
        return 'Agendada';
      case 'concluida':
        return 'Concluída';
      case 'cancelada':
        return 'Cancelada';
      case 'reagendada':
        return 'Reagendada';
      default:
        return 'Desconhecido';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'online':
        return <Video size={16} />;
      case 'presencial':
        return <MapPin size={16} />;
      case 'telefone':
        return <Phone size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'online':
        return 'Online';
      case 'presencial':
        return 'Presencial';
      case 'telefone':
        return 'Telefone';
      default:
        return 'Não definido';
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesTab = activeTab === 'proximas' 
      ? ['agendada', 'confirmada', 'reagendada'].includes(interview.status)
      : interview.status === 'concluida';
    
    const matchesSearch = interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.interviewer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || interview.status === selectedStatus;
    const matchesType = !selectedType || interview.type === selectedType;
    
    return matchesTab && matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: interviews.length,
    proximas: interviews.filter(i => ['agendada', 'confirmada', 'reagendada'].includes(i.status)).length,
    concluidas: interviews.filter(i => i.status === 'concluida').length,
    aprovacoes: interviews.filter(i => i.rating && i.rating >= 4).length
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.entrevistasPage}>
      <DashboardHeader user={user} userType="candidato" />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Minhas Entrevistas</h1>
              <p>Acompanhe suas entrevistas agendadas e histórico de processos seletivos</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Calendar size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.total}</h3>
                <p>Total de Entrevistas</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Clock size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.proximas}</h3>
                <p>Próximas Entrevistas</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CheckCircle size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.concluidas}</h3>
                <p>Concluídas</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Star size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.aprovacoes}</h3>
                <p>Avaliações Positivas</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={styles.tabsSection}>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'proximas' ? styles.active : ''}`}
                onClick={() => setActiveTab('proximas')}
              >
                <Clock size={18} />
                Próximas Entrevistas
                <span className={styles.tabBadge}>{stats.proximas}</span>
              </button>
              
              <button 
                className={`${styles.tab} ${activeTab === 'historico' ? styles.active : ''}`}
                onClick={() => setActiveTab('historico')}
              >
                <CheckCircle size={18} />
                Histórico
                <span className={styles.tabBadge}>{stats.concluidas}</span>
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBar}>
              <div className={styles.searchInput}>
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Buscar entrevistas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className={styles.filters}>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">Todos os tipos</option>
                  <option value="online">Online</option>
                  <option value="presencial">Presencial</option>
                  <option value="telefone">Telefone</option>
                </select>
                
                {activeTab === 'proximas' && (
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">Todos os status</option>
                    <option value="agendada">Agendada</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="reagendada">Reagendada</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Interviews List */}
          <div className={styles.interviewsSection}>
            <div className={styles.interviewsHeader}>
              <h2>
                {filteredInterviews.length} {filteredInterviews.length === 1 ? 'entrevista' : 'entrevistas'}
              </h2>
            </div>

            <div className={styles.interviewsList}>
              {filteredInterviews.map((interview) => (
                <div key={interview.id} className={styles.interviewCard}>
                  <div className={styles.interviewHeader}>
                    <div className={styles.interviewInfo}>
                      <div className={styles.interviewTitle}>
                        <h3>{interview.title}</h3>
                      </div>
                      
                      <div className={styles.interviewMeta}>
                        <div className={styles.metaItem}>
                          <Briefcase size={14} />
                          <span>{interview.position}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <Calendar size={14} />
                          <span>{new Date(interview.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <Clock size={14} />
                          <span>{interview.time} ({interview.duration}min)</span>
                        </div>
                        <div className={styles.metaItem}>
                          {getTypeIcon(interview.type)}
                          <span>{getTypeText(interview.type)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.interviewStatus}>
                      <div className={styles.statusBadge}>
                        {getStatusIcon(interview.status)}
                        <span>{getStatusText(interview.status)}</span>
                      </div>
                      
                      <div className={styles.matchScore}>
                        <Target size={14} />
                        <span>{interview.matchScore}% match</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.interviewContent}>
                    <div className={styles.description}>
                      <p>{interview.description}</p>
                    </div>

                    <div className={styles.interviewDetails}>
                      {interview.location && (
                        <div className={styles.location}>
                          <MapPin size={16} />
                          <span>{interview.location}</span>
                        </div>
                      )}

                      {interview.meetingLink && (
                        <div className={styles.meetingLink}>
                          <Video size={16} />
                          <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                            Link da Reunião
                          </a>
                        </div>
                      )}
                    </div>

                    {interview.requirements && (
                      <div className={styles.requirements}>
                        <h4>Tópicos da Entrevista:</h4>
                        <ul>
                          {interview.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {interview.preparationMaterials && (
                      <div className={styles.preparationMaterials}>
                        <h4>Material de Preparação:</h4>
                        <div className={styles.materialsList}>
                          {interview.preparationMaterials.map((material, index) => (
                            <span key={index} className={styles.materialTag}>
                              <FileText size={12} />
                              {material}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {interview.feedback && (
                      <div className={styles.feedback}>
                        <div className={styles.feedbackHeader}>
                          <MessageSquare size={16} />
                          <span>Feedback da Entrevista</span>
                          {interview.rating && (
                            <div className={styles.rating}>
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={14} 
                                  className={i < interview.rating! ? styles.starFilled : styles.starEmpty}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <p>{interview.feedback}</p>
                        {interview.nextSteps && (
                          <div className={styles.nextSteps}>
                            <strong>Próximos Passos:</strong> {interview.nextSteps}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={styles.interviewActions}>
                    {interview.status === 'agendada' && (
                      <button className="btn btn-primary btn-small">
                        <CheckCircle size={16} />
                        Confirmar Presença
                      </button>
                    )}
                    
                    {interview.meetingLink && ['agendada', 'confirmada'].includes(interview.status) && (
                      <a 
                        href={interview.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-small"
                      >
                        <Video size={16} />
                        Entrar na Reunião
                      </a>
                    )}
                    
                    <button className={styles.actionBtn} title="Ver detalhes">
                      <Eye size={16} />
                    </button>
                    
                    <button className={styles.actionBtn} title="Mais opções">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredInterviews.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <Calendar size={48} />
                </div>
                <h3>Nenhuma entrevista encontrada</h3>
                <p>
                  {activeTab === 'proximas' 
                    ? 'Você não tem entrevistas agendadas no momento. Quando nossa equipe indicar oportunidades para você, as entrevistas aparecerão aqui.'
                    : 'Você ainda não tem histórico de entrevistas concluídas.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 