'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  Crown,
  Download,
  Upload,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  X
} from 'lucide-react';
import styles from './usuarios.module.css';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: 'candidato' | 'empresa' | 'admin';
  status: 'ativo' | 'inativo' | 'pendente' | 'bloqueado';
  dataCadastro: string;
  ultimoAcesso: string;
  telefone?: string;
  localizacao?: string;
  empresa?: string;
  cargo?: string;
  avatar?: string;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create' | 'delete'>('view');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadUsuarios();
    setLoading(false);
  }, [router]);

  const loadUsuarios = () => {
    // Dados simulados de usuários
    const usuariosSimulados: Usuario[] = [
      {
        id: '1',
        nome: 'João Silva',
        email: 'joao.silva@email.com',
        tipo: 'candidato',
        status: 'ativo',
        dataCadastro: '2024-01-15',
        ultimoAcesso: '2024-06-13',
        telefone: '+55 11 99999-9999',
        localizacao: 'São Paulo, SP',
        cargo: 'Desenvolvedor Full Stack',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
      },
      {
        id: '2',
        nome: 'Maria Santos',
        email: 'maria.santos@techcorp.ae',
        tipo: 'empresa',
        status: 'ativo',
        dataCadastro: '2024-01-10',
        ultimoAcesso: '2024-06-13',
        telefone: '+971 50 123-4567',
        localizacao: 'Dubai, UAE',
        empresa: 'TechCorp Dubai',
        cargo: 'Recrutadora Sênior',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
      },
      {
        id: '3',
        nome: 'Carlos Oliveira',
        email: 'carlos.oliveira@email.com',
        tipo: 'candidato',
        status: 'pendente',
        dataCadastro: '2024-06-12',
        ultimoAcesso: '2024-06-12',
        telefone: '+55 21 88888-8888',
        localizacao: 'Rio de Janeiro, RJ',
        cargo: 'UX Designer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      },
      {
        id: '4',
        nome: 'Ana Costa',
        email: 'ana.costa@innovhub.ae',
        tipo: 'empresa',
        status: 'ativo',
        dataCadastro: '2024-02-20',
        ultimoAcesso: '2024-06-11',
        telefone: '+971 55 987-6543',
        localizacao: 'Abu Dhabi, UAE',
        empresa: 'Innovation Hub',
        cargo: 'HR Manager',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
      },
      {
        id: '5',
        nome: 'Pedro Almeida',
        email: 'pedro.almeida@email.com',
        tipo: 'candidato',
        status: 'bloqueado',
        dataCadastro: '2024-03-05',
        ultimoAcesso: '2024-05-20',
        telefone: '+55 11 77777-7777',
        localizacao: 'São Paulo, SP',
        cargo: 'Product Manager',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
      },
      {
        id: '6',
        nome: 'Lucia Fernandes',
        email: 'lucia.fernandes@email.com',
        tipo: 'candidato',
        status: 'inativo',
        dataCadastro: '2024-01-30',
        ultimoAcesso: '2024-04-15',
        telefone: '+55 85 66666-6666',
        localizacao: 'Fortaleza, CE',
        cargo: 'Data Scientist',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face'
      }
    ];

    setUsuarios(usuariosSimulados);
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchTipo = filtroTipo === 'todos' || usuario.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || usuario.status === filtroStatus;
    const matchBusca = busca === '' || 
      usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.empresa?.toLowerCase().includes(busca.toLowerCase());
    
    return matchTipo && matchStatus && matchBusca;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'green';
      case 'inativo': return 'gray';
      case 'pendente': return 'yellow';
      case 'bloqueado': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo': return <CheckCircle size={14} />;
      case 'inativo': return <XCircle size={14} />;
      case 'pendente': return <Clock size={14} />;
      case 'bloqueado': return <AlertTriangle size={14} />;
      default: return <XCircle size={14} />;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'candidato': return <Users size={16} />;
      case 'empresa': return <Building2 size={16} />;
      case 'admin': return <Crown size={16} />;
      default: return <Users size={16} />;
    }
  };

  const handleViewUser = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditUser = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteUser = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreateUser = () => {
    setUsuarioSelecionado(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleStatusChange = (usuarioId: string, novoStatus: string) => {
    setUsuarios(prev => 
      prev.map(u => u.id === usuarioId ? { ...u, status: novoStatus as any } : u)
    );
  };

  const exportarUsuarios = () => {
    // Simular exportação
    alert('Exportando lista de usuários...');
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
    <div className={styles.usuariosPage}>
      <DashboardHeader user={user} userType="admin" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Gestão de Usuários</h1>
              <p>Gerencie todos os usuários da plataforma Leao Talent Bridge</p>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                onClick={exportarUsuarios}
                className="btn btn-secondary"
              >
                <Download size={16} />
                Exportar
              </button>
              <button 
                onClick={handleCreateUser}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Novo Usuário
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Users size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{usuarios.filter(u => u.tipo === 'candidato').length}</h3>
                <p>Candidatos</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Building2 size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{usuarios.filter(u => u.tipo === 'empresa').length}</h3>
                <p>Empresas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CheckCircle size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{usuarios.filter(u => u.status === 'ativo').length}</h3>
                <p>Ativos</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Clock size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{usuarios.filter(u => u.status === 'pendente').length}</h3>
                <p>Pendentes</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por nome, email ou empresa..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className={styles.filters}>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="todos">Todos os Tipos</option>
                <option value="candidato">Candidatos</option>
                <option value="empresa">Empresas</option>
                <option value="admin">Administradores</option>
              </select>

              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
                <option value="pendente">Pendentes</option>
                <option value="bloqueado">Bloqueados</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className={styles.tableSection}>
            <div className={styles.tableContainer}>
              <table className={styles.usersTable}>
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Último Acesso</th>
                    <th>Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>
                        <div className={styles.userInfo}>
                          <img src={usuario.avatar} alt={usuario.nome} />
                          <div className={styles.userDetails}>
                            <h4>{usuario.nome}</h4>
                            <p>{usuario.email}</p>
                            {usuario.empresa && (
                              <span className={styles.userCompany}>
                                <Building2 size={12} />
                                {usuario.empresa}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.userType}>
                          {getTipoIcon(usuario.tipo)}
                          <span>{usuario.tipo}</span>
                        </div>
                      </td>
                      <td>
                        <div className={`${styles.statusBadge} ${styles[getStatusColor(usuario.status)]}`}>
                          {getStatusIcon(usuario.status)}
                          <span>{usuario.status}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.dateText}>
                          {new Date(usuario.ultimoAcesso).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td>
                        <span className={styles.dateText}>
                          {new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => handleViewUser(usuario)}
                            className={styles.actionBtn}
                            title="Visualizar"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleEditUser(usuario)}
                            className={styles.actionBtn}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          {usuario.status === 'ativo' ? (
                            <button 
                              onClick={() => handleStatusChange(usuario.id, 'inativo')}
                              className={`${styles.actionBtn} ${styles.danger}`}
                              title="Desativar"
                            >
                              <UserX size={16} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleStatusChange(usuario.id, 'ativo')}
                              className={`${styles.actionBtn} ${styles.success}`}
                              title="Ativar"
                            >
                              <UserCheck size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(usuario)}
                            className={`${styles.actionBtn} ${styles.danger}`}
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {usuariosFiltrados.length === 0 && (
              <div className={styles.emptyState}>
                <Users size={48} />
                <h3>Nenhum usuário encontrado</h3>
                <p>Tente ajustar os filtros ou criar um novo usuário.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>
                {modalType === 'view' && 'Detalhes do Usuário'}
                {modalType === 'edit' && 'Editar Usuário'}
                {modalType === 'create' && 'Novo Usuário'}
                {modalType === 'delete' && 'Confirmar Exclusão'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {modalType === 'view' && usuarioSelecionado && (
                <div className={styles.userDetails}>
                  <div className={styles.userHeader}>
                    <img src={usuarioSelecionado.avatar} alt={usuarioSelecionado.nome} />
                    <div>
                      <h3>{usuarioSelecionado.nome}</h3>
                      <p>{usuarioSelecionado.email}</p>
                      <div className={`${styles.statusBadge} ${styles[getStatusColor(usuarioSelecionado.status)]}`}>
                        {getStatusIcon(usuarioSelecionado.status)}
                        <span>{usuarioSelecionado.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.userInfoGrid}>
                    <div className={styles.infoItem}>
                      <Phone size={16} />
                      <div>
                        <span className={styles.infoLabel}>Telefone</span>
                        <span className={styles.infoValue}>{usuarioSelecionado.telefone}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <MapPin size={16} />
                      <div>
                        <span className={styles.infoLabel}>Localização</span>
                        <span className={styles.infoValue}>{usuarioSelecionado.localizacao}</span>
                      </div>
                    </div>
                    {usuarioSelecionado.empresa && (
                      <div className={styles.infoItem}>
                        <Building2 size={16} />
                        <div>
                          <span className={styles.infoLabel}>Empresa</span>
                          <span className={styles.infoValue}>{usuarioSelecionado.empresa}</span>
                        </div>
                      </div>
                    )}
                    <div className={styles.infoItem}>
                      <Briefcase size={16} />
                      <div>
                        <span className={styles.infoLabel}>Cargo</span>
                        <span className={styles.infoValue}>{usuarioSelecionado.cargo}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <Calendar size={16} />
                      <div>
                        <span className={styles.infoLabel}>Data de Cadastro</span>
                        <span className={styles.infoValue}>
                          {new Date(usuarioSelecionado.dataCadastro).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <Clock size={16} />
                      <div>
                        <span className={styles.infoLabel}>Último Acesso</span>
                        <span className={styles.infoValue}>
                          {new Date(usuarioSelecionado.ultimoAcesso).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'delete' && usuarioSelecionado && (
                <div className={styles.deleteConfirmation}>
                  <div className={styles.warningIcon}>
                    <AlertTriangle size={48} />
                  </div>
                  <h3>Tem certeza que deseja excluir este usuário?</h3>
                  <p>
                    Esta ação não pode ser desfeita. O usuário <strong>{usuarioSelecionado.nome}</strong> será 
                    permanentemente removido do sistema.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button 
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                {modalType === 'delete' ? 'Cancelar' : 'Fechar'}
              </button>
              
              {modalType === 'delete' && (
                <button 
                  onClick={() => {
                    // Simular exclusão
                    setUsuarios(prev => prev.filter(u => u.id !== usuarioSelecionado?.id));
                    setShowModal(false);
                  }}
                  className="btn btn-danger"
                >
                  <Trash2 size={16} />
                  Confirmar Exclusão
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 