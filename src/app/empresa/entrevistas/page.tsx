'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  Calendar,
  Clock,
  Users,
  MapPin,
  Video,
  Phone,
  CheckCircle,
  X,
  Edit,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import styles from './entrevistas.module.css';

interface Entrevista {
  id: number;
  candidatoId: string;
  codigoCandidato: string;
  vagaTitulo: string;
  data: string;
  horario: string;
  tipo: 'presencial' | 'video' | 'telefone';
  status: 'agendada' | 'confirmada' | 'realizada' | 'cancelada';
  localizacao?: string;
  linkVideo?: string;
  observacoes?: string;
}

export default function EmpresaEntrevistasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [statusFilter, setStatusFilter] = useState('todas');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'empresa') {
      router.push('/empresa/login');
      return;
    }
    setUser(currentUser);
    loadEntrevistas();
  }, [router]);

  const loadEntrevistas = () => {
    // Mock data - em produção viria da API
    const mockEntrevistas: Entrevista[] = [
      {
        id: 1,
        candidatoId: '1',
        codigoCandidato: 'CAND-2024-001',
        vagaTitulo: 'Desenvolvedor Full Stack Senior',
        data: '2024-01-20',
        horario: '14:00',
        tipo: 'video',
        status: 'confirmada',
        linkVideo: 'https://meet.google.com/abc-def-ghi',
        observacoes: 'Entrevista técnica - foco em React e Node.js'
      },
      {
        id: 2,
        candidatoId: '2',
        codigoCandidato: 'CAND-2024-002',
        vagaTitulo: 'Analista de Marketing Digital',
        data: '2024-01-22',
        horario: '10:30',
        tipo: 'presencial',
        status: 'agendada',
        localizacao: 'Escritório Dubai - Sala de Reuniões 3',
        observacoes: 'Apresentar portfólio de campanhas'
      },
      {
        id: 3,
        candidatoId: '3',
        codigoCandidato: 'CAND-2024-003',
        vagaTitulo: 'Gerente de Vendas',
        data: '2024-01-25',
        horario: '16:00',
        tipo: 'video',
        status: 'agendada',
        linkVideo: 'https://zoom.us/j/123456789',
        observacoes: 'Entrevista com diretor comercial'
      }
    ];

    setEntrevistas(mockEntrevistas);
    setLoading(false);
  };

  const filteredEntrevistas = entrevistas.filter(entrevista => {
    return statusFilter === 'todas' || entrevista.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendada':
        return <span className={`${styles.statusBadge} ${styles.statusAgendada}`}>Agendada</span>;
      case 'confirmada':
        return <span className={`${styles.statusBadge} ${styles.statusConfirmada}`}>Confirmada</span>;
      case 'realizada':
        return <span className={`${styles.statusBadge} ${styles.statusRealizada}`}>Realizada</span>;
      case 'cancelada':
        return <span className={`${styles.statusBadge} ${styles.statusCancelada}`}>Cancelada</span>;
      default:
        return null;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video':
        return <Video size={16} />;
      case 'telefone':
        return <Phone size={16} />;
      case 'presencial':
        return <MapPin size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEntrevistasDoMes = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return filteredEntrevistas.filter(entrevista => {
      const entrevistaDate = new Date(entrevista.data);
      return entrevistaDate.getFullYear() === year && entrevistaDate.getMonth() === month;
    });
  };

  const getDiasDoMes = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getEntrevistasNoDia = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return getEntrevistasDoMes().filter(entrevista => entrevista.data === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.entrevistasPage}>
      <DashboardHeader user={user} userType="empresa" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Calendário de Entrevistas</h1>
              <p>Gerencie e acompanhe suas entrevistas agendadas</p>
            </div>
            
            <div className={styles.headerActions}>
              <div className={styles.viewToggle}>
                <button 
                  className={viewMode === 'calendar' ? styles.active : ''}
                  onClick={() => setViewMode('calendar')}
                >
                  <Calendar size={16} />
                  Calendário
                </button>
                <button 
                  className={viewMode === 'list' ? styles.active : ''}
                  onClick={() => setViewMode('list')}
                >
                  <Users size={16} />
                  Lista
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.filters}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="todas">Todos os Status</option>
                <option value="agendada">Agendadas</option>
                <option value="confirmada">Confirmadas</option>
                <option value="realizada">Realizadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className={styles.calendarSection}>
              <div className={styles.calendarHeader}>
                <button onClick={() => navigateMonth('prev')} className={styles.navButton}>
                  <ChevronLeft size={20} />
                </button>
                <h2>
                  {currentDate.toLocaleDateString('pt-BR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h2>
                <button onClick={() => navigateMonth('next')} className={styles.navButton}>
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className={styles.calendar}>
                <div className={styles.weekDays}>
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className={styles.weekDay}>{day}</div>
                  ))}
                </div>
                
                <div className={styles.calendarGrid}>
                  {getDiasDoMes().map((day, index) => {
                    const entrevistasNoDia = getEntrevistasNoDia(day);
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isToday = day.toDateString() === new Date().toDateString();
                    
                    return (
                      <div 
                        key={index} 
                        className={`${styles.calendarDay} ${!isCurrentMonth ? styles.otherMonth : ''} ${isToday ? styles.today : ''}`}
                      >
                        <span className={styles.dayNumber}>{day.getDate()}</span>
                        {entrevistasNoDia.length > 0 && (
                          <div className={styles.entrevistasIndicator}>
                            {entrevistasNoDia.slice(0, 2).map(entrevista => (
                              <div 
                                key={entrevista.id} 
                                className={`${styles.entrevistaItem} ${styles[`status${entrevista.status.charAt(0).toUpperCase() + entrevista.status.slice(1)}`]}`}
                                title={`${entrevista.horario} - ${entrevista.codigoCandidato}`}
                              >
                                {getTipoIcon(entrevista.tipo)}
                                <span>{entrevista.horario}</span>
                              </div>
                            ))}
                            {entrevistasNoDia.length > 2 && (
                              <div className={styles.moreIndicator}>
                                +{entrevistasNoDia.length - 2}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className={styles.listSection}>
              {filteredEntrevistas.length === 0 ? (
                <div className={styles.emptyState}>
                  <Calendar size={48} className={styles.emptyIcon} />
                  <h3>Nenhuma entrevista encontrada</h3>
                  <p>Não há entrevistas agendadas com os filtros selecionados.</p>
                </div>
              ) : (
                <div className={styles.entrevistasList}>
                  {filteredEntrevistas
                    .sort((a, b) => new Date(a.data + ' ' + a.horario).getTime() - new Date(b.data + ' ' + b.horario).getTime())
                    .map((entrevista) => (
                    <div key={entrevista.id} className={styles.entrevistaCard}>
                      <div className={styles.entrevistaHeader}>
                        <div className={styles.entrevistaInfo}>
                          <h3>{entrevista.codigoCandidato}</h3>
                          <p className={styles.vagaTitulo}>{entrevista.vagaTitulo}</p>
                        </div>
                        <div className={styles.entrevistaStatus}>
                          {getStatusBadge(entrevista.status)}
                        </div>
                      </div>

                      <div className={styles.entrevistaMeta}>
                        <div className={styles.metaItem}>
                          <Calendar size={16} />
                          <span>{formatDate(entrevista.data)}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <Clock size={16} />
                          <span>{entrevista.horario}</span>
                        </div>
                        <div className={styles.metaItem}>
                          {getTipoIcon(entrevista.tipo)}
                          <span>
                            {entrevista.tipo === 'video' && 'Videoconferência'}
                            {entrevista.tipo === 'telefone' && 'Telefone'}
                            {entrevista.tipo === 'presencial' && 'Presencial'}
                          </span>
                        </div>
                      </div>

                      {(entrevista.localizacao || entrevista.linkVideo) && (
                        <div className={styles.entrevistaLocal}>
                          {entrevista.localizacao && (
                            <div className={styles.localInfo}>
                              <MapPin size={16} />
                              <span>{entrevista.localizacao}</span>
                            </div>
                          )}
                          {entrevista.linkVideo && (
                            <div className={styles.linkInfo}>
                              <Video size={16} />
                              <a href={entrevista.linkVideo} target="_blank" rel="noopener noreferrer">
                                Acessar Videoconferência
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {entrevista.observacoes && (
                        <div className={styles.observacoes}>
                          <strong>Observações:</strong>
                          <p>{entrevista.observacoes}</p>
                        </div>
                      )}

                      <div className={styles.entrevistaActions}>
                        <button className="btn btn-secondary btn-small">
                          <Edit size={14} />
                          Editar
                        </button>
                        {entrevista.status === 'agendada' && (
                          <button className="btn btn-primary btn-small">
                            <CheckCircle size={14} />
                            Confirmar
                          </button>
                        )}
                        {entrevista.status !== 'cancelada' && entrevista.status !== 'realizada' && (
                          <button className="btn btn-danger btn-small">
                            <X size={14} />
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 