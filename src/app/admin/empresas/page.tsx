'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { GrOrganization, GrSearch, GrFilter, GrAdd, GrEdit, GrTrash, GrView, GrMail, GrPhone, GrCalendar, GrLocation, GrGlobe, GrDownload, GrUpload, GrMore, GrStatusGood, GrStatusCritical, GrClock, GrStatusWarning, GrClose, GrUser, GrStar, GrBriefcase } from 'react-icons/gr';
import styles from './empresas.module.css';

interface Empresa {
  _id: string;
  name: string;
  email: string;
  cnpj?: string;
  phone?: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  website?: string;
  description?: string;
  logo?: string;
  primaryContact?: {
    name?: string;
    position?: string;
    email?: string;
    phone?: string;
  };
  status: 'pending' | 'active' | 'inactive' | 'suspended' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function AdminEmpresasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filtroIndustria, setFiltroIndustria] = useState('all');
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [filtroTamanho, setFiltroTamanho] = useState('all');
  const [busca, setBusca] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create' | 'delete'>('view');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cnpj: '',
    phone: '',
    industry: '',
    size: 'medium' as 'startup' | 'small' | 'medium' | 'large' | 'enterprise',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'EAU',
      zipCode: ''
    },
    website: '',
    description: '',
    logo: '',
    primaryContact: {
      name: '',
      position: '',
      email: '',
      phone: ''
    },
    status: 'active' as 'pending' | 'active' | 'inactive' | 'suspended' | 'rejected',
    tempPassword: ''
  });

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadEmpresas();
  }, [router, currentPage, filtroIndustria, filtroStatus, filtroTamanho, busca]);

  const loadEmpresas = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filtroIndustria !== 'all' && { industry: filtroIndustria }),
        ...(filtroStatus !== 'all' && { status: filtroStatus }),
        ...(filtroTamanho !== 'all' && { size: filtroTamanho }),
        ...(busca && { search: busca })
      });

      const response = await fetch(`/api/admin/companies?${params}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmpresas(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Erro ao carregar empresas');
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
    setLoading(false);
    }
  }, [currentPage, filtroIndustria, filtroStatus, filtroTamanho, busca]);

  const handleCreateEmpresa = async () => {
    try {
      setActionLoading('create');
      
      const token = AuthService.getToken();
      const user = AuthService.getUser();
      
      console.log('🔍 Debug - Token:', token ? 'Presente' : 'Ausente');
      console.log('🔍 Debug - Usuário:', user);
      console.log('🔍 Debug - Tipo:', user?.type);
      
      if (!token) {
        alert('Token não encontrado. Faça login novamente.');
        return;
      }
      
      if (user?.type !== 'admin') {
        alert('Usuário não é administrador.');
        return;
      }
      
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadEmpresas();
        setShowModal(false);
        setFormData({
          name: '', email: '', cnpj: '', phone: '', industry: '', size: 'medium',
          address: { street: '', city: '', state: '', country: 'EAU', zipCode: '' },
          website: '', description: '', logo: '',
          primaryContact: { name: '', position: '', email: '', phone: '' },
          status: 'active', tempPassword: ''
        });
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao criar empresa');
      }
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      alert('Erro ao criar empresa');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateEmpresa = async () => {
    if (!empresaSelecionada) return;
    
    try {
      setActionLoading('update');
      
      const response = await fetch(`/api/admin/companies/${empresaSelecionada._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadEmpresas();
        setShowModal(false);
        setFormData({
          name: '', email: '', cnpj: '', phone: '', industry: '', size: 'medium',
          address: { street: '', city: '', state: '', country: 'EAU', zipCode: '' },
          website: '', description: '', logo: '',
          primaryContact: { name: '', position: '', email: '', phone: '' },
          status: 'active', tempPassword: ''
        });
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao atualizar empresa');
      }
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      alert('Erro ao atualizar empresa');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteEmpresa = async () => {
    if (!empresaSelecionada) return;
    
    try {
      setActionLoading('delete');
      
      const response = await fetch(`/api/admin/companies/${empresaSelecionada._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        await loadEmpresas();
        setShowModal(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao deletar empresa');
      }
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      alert('Erro ao deletar empresa');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Ativa',
      inactive: 'Inativa',
      pending: 'Pendente',
      suspended: 'Suspensa',
      rejected: 'Rejeitada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'pending': return 'yellow';
      case 'suspended': return 'orange';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <GrStatusGood size={14} />;
      case 'inactive': return <GrStatusCritical size={14} />;
      case 'pending': return <GrClock size={14} />;
      case 'blocked': return <GrStatusWarning size={14} />;
      default: return <GrStatusCritical size={14} />;
    }
  };

  const getTamanhoLabel = (size: string) => {
    const labels = {
      small: 'Pequena',
      medium: 'Média',
      large: 'Grande',
      enterprise: 'Enterprise'
    };
    return labels[size as keyof typeof labels] || size;
  };

  const getIndustriaIcon = (industry: string) => {
    // Mapear indústrias para ícones
    const industryIcons: { [key: string]: any } = {
      'tecnologia': <GrBriefcase size={16} />,
      'saude': <GrUser size={16} />,
      'financeiro': <GrStar size={16} />,
      'educacao': <GrUser size={16} />,
      'varejo': <GrBriefcase size={16} />,
      'manufactura': <GrOrganization size={16} />,
      'servicos': <GrBriefcase size={16} />
    };
    return industryIcons[industry.toLowerCase()] || <GrOrganization size={16} />;
  };

  const handleViewEmpresa = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditEmpresa = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setFormData({
      name: empresa.name,
      email: empresa.email,
      cnpj: empresa.cnpj || '',
      phone: empresa.phone || '',
      industry: empresa.industry,
      size: empresa.size,
      address: {
        street: empresa.address?.street || '',
        city: empresa.address?.city || '',
        state: empresa.address?.state || '',
        country: empresa.address?.country || 'EAU',
        zipCode: empresa.address?.zipCode || ''
      },
      website: empresa.website || '',
      description: empresa.description || '',
      logo: empresa.logo || '',
      primaryContact: {
        name: empresa.primaryContact?.name || '',
        position: empresa.primaryContact?.position || '',
        email: empresa.primaryContact?.email || '',
        phone: empresa.primaryContact?.phone || ''
      },
      status: empresa.status, tempPassword: ''
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteEmpresaClick = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreateEmpresaClick = () => {
    setEmpresaSelecionada(null);
    setFormData({
      name: '', email: '', cnpj: '', phone: '', industry: '', size: 'medium',
      address: { street: '', city: '', state: '', country: 'EAU', zipCode: '' },
      website: '', description: '', logo: '',
      primaryContact: { name: '', position: '', email: '', phone: '' },
      status: 'active', tempPassword: ''
    });
    setModalType('create');
    setShowModal(true);
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
    <div className={styles.empresasPage}>
      <DashboardHeader user={user} userType="admin" />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Gestão de Empresas</h1>
              <p>Gerencie todas as empresas cadastradas na plataforma UAE Careers</p>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                onClick={handleCreateEmpresaClick}
                className="btn btn-primary"
              >
                <GrAdd size={16} />
                Nova Empresa
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrOrganization size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{empresas.length}</h3>
                <p>Total de Empresas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrStatusGood size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{empresas.filter(e => e.status === 'active').length}</h3>
                <p>Empresas Ativas</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GrClock size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{empresas.filter(e => e.status === 'pending').length}</h3>
                <p>Pendentes</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                  <GrOrganization size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{new Set(empresas.map(e => e.industry)).size}</h3>
                <p>Indústrias</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <GrSearch size={20} />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou indústria..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className={styles.filters}>
              <select
                value={filtroIndustria}
                onChange={(e) => setFiltroIndustria(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todas as Indústrias</option>
                <option value="tecnologia">Tecnologia</option>
                <option value="saude">Saúde</option>
                <option value="financeiro">Financeiro</option>
                <option value="educacao">Educação</option>
                <option value="varejo">Varejo</option>
                <option value="manufactura">Manufatura</option>
                <option value="servicos">Serviços</option>
              </select>

              <select
                value={filtroTamanho}
                onChange={(e) => setFiltroTamanho(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todos os Tamanhos</option>
                <option value="small">Pequena</option>
                <option value="medium">Média</option>
                <option value="large">Grande</option>
                <option value="enterprise">Enterprise</option>
              </select>

              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
                <option value="pending">Pendentes</option>
                <option value="blocked">Bloqueadas</option>
              </select>
            </div>
          </div>

          {/* Companies Table */}
          <div className={styles.tableSection}>
            <div className={styles.tableContainer}>
              <table className={styles.companiesTable}>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Indústria</th>
                    <th>Tamanho</th>
                    <th>Localização</th>
                    <th>Status</th>
                    <th>Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((empresa) => (
                    <tr key={empresa._id}>
                      <td>
                        <div className={styles.companyInfo}>
                          <img 
                            src={empresa.logo || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=face'} 
                            alt={empresa.name} 
                          />
                          <div className={styles.companyDetails}>
                            <h4>{empresa.name}</h4>
                            <p>{empresa.email}</p>
                            {empresa.website && (
                              <span className={styles.companyWebsite}>
                                <GrGlobe size={12} />
                                {empresa.website}
                            </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.industryInfo}>
                          {getIndustriaIcon(empresa.industry)}
                          <span>{empresa.industry}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.sizeBadge}>
                          {getTamanhoLabel(empresa.size)}
                        </span>
                      </td>
                      <td>
                                                 <div className={styles.locationInfo}>
                           <GrLocation size={14} />
                           <span>
                             {empresa.address?.city && empresa.address?.state 
                               ? `${empresa.address.city}, ${empresa.address.state}`
                               : empresa.address?.country || 'Não informado'
                             }
                           </span>
                        </div>
                      </td>
                      <td>
                        <div className={`${styles.statusBadge} ${styles[getStatusColor(empresa.status)]}`}>
                          {getStatusIcon(empresa.status)}
                          <span>{getStatusLabel(empresa.status)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.dateText}>
                          {new Date(empresa.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => handleViewEmpresa(empresa)}
                            className={styles.actionBtn}
                            title="Visualizar"
                          >
                            <GrView size={16} />
                          </button>
                              <button 
                            onClick={() => handleEditEmpresa(empresa)}
                            className={styles.actionBtn}
                            title="Editar"
                          >
                            <GrEdit size={16} />
                              </button>
                              <button 
                            onClick={() => handleDeleteEmpresaClick(empresa)}
                            className={`${styles.actionBtn} ${styles.danger}`}
                            title="Excluir"
                          >
                            <GrTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {empresas.length === 0 && (
              <div className={styles.emptyState}>
                <GrOrganization size={48} />
                <h3>Nenhuma empresa encontrada</h3>
                <p>Tente ajustar os filtros ou criar uma nova empresa.</p>
              </div>
            )}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={styles.paginationBtn}
              >
                Anterior
              </button>
              
              <span className={styles.pageInfo}>
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={styles.paginationBtn}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>
                {modalType === 'view' && 'Detalhes da Empresa'}
                {modalType === 'edit' && 'Editar Empresa'}
                {modalType === 'create' && 'Nova Empresa'}
                {modalType === 'delete' && 'Confirmar Exclusão'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className={styles.closeButton}
              >
                <GrClose size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {modalType === 'view' && empresaSelecionada && (
                <div className={styles.companyDetails}>
                  <div className={styles.companyHeader}>
                    <img 
                      src={empresaSelecionada.logo || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=face'} 
                      alt={empresaSelecionada.name} 
                    />
                    <div>
                      <h3>{empresaSelecionada.name}</h3>
                      <p>{empresaSelecionada.email}</p>
                      <div className={`${styles.statusBadge} ${styles[getStatusColor(empresaSelecionada.status)]}`}>
                        {getStatusIcon(empresaSelecionada.status)}
                        <span>{getStatusLabel(empresaSelecionada.status)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.companyInfoGrid}>
                    <div className={styles.infoItem}>
                      <GrMail size={16} />
                      <div>
                        <span className={styles.infoLabel}>Email</span>
                        <span className={styles.infoValue}>{empresaSelecionada.email}</span>
                      </div>
                    </div>
                    {empresaSelecionada.website && (
                    <div className={styles.infoItem}>
                        <GrGlobe size={16} />
                      <div>
                          <span className={styles.infoLabel}>Website</span>
                          <span className={styles.infoValue}>{empresaSelecionada.website}</span>
                      </div>
                    </div>
                    )}
                    <div className={styles.infoItem}>
                       <GrOrganization size={16} />
                      <div>
                         <span className={styles.infoLabel}>Indústria</span>
                         <span className={styles.infoValue}>{empresaSelecionada.industry}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <GrOrganization size={16} />
                      <div>
                        <span className={styles.infoLabel}>Tamanho</span>
                        <span className={styles.infoValue}>{getTamanhoLabel(empresaSelecionada.size)}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                       <GrLocation size={16} />
                      <div>
                         <span className={styles.infoLabel}>Localização</span>
                         <span className={styles.infoValue}>
                           {empresaSelecionada.address?.city && empresaSelecionada.address?.state 
                             ? `${empresaSelecionada.address.city}, ${empresaSelecionada.address.state}`
                             : empresaSelecionada.address?.country || 'Não informado'
                           }
                         </span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <GrCalendar size={16} />
                      <div>
                        <span className={styles.infoLabel}>Data de Cadastro</span>
                        <span className={styles.infoValue}>
                          {new Date(empresaSelecionada.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {empresaSelecionada.description && (
                    <div className={styles.descriptionSection}>
                      <h4>Descrição</h4>
                      <p>{empresaSelecionada.description}</p>
                      </div>
                  )}
                    </div>
              )}

              {(modalType === 'create' || modalType === 'edit') && (
                <div className={styles.formSection}>
                  {/* Dados da Empresa */}
                  <div className={styles.formSection}>
                    <h4>Dados da Empresa</h4>
                    
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Nome da Empresa *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Nome da empresa"
                          required
                        />
                  </div>
                      
                      <div className={styles.formGroup}>
                        <label>Business ID</label>
                        <input
                          type="text"
                          value={formData.cnpj || ''}
                          onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                          placeholder="00.000.000/0000-00"
                        />
                </div>
                      
                      <div className={styles.formGroup}>
                        <label>E-mail Corporativo *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="contato@empresa.com"
                          required
                        />
                  </div>
                      
                      <div className={styles.formGroup}>
                        <label>Telefone</label>
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+971 (0) 4 000-0000"
                        />
                </div>
                      
                      <div className={styles.formGroup}>
                        <label>Website</label>
                        <input
                          type="url"
                          value={formData.website || ''}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://www.empresa.com"
                        />
                  </div>
                    </div>
                  </div>

                  {/* Localização */}
                  <div className={styles.formSection}>
                    <h4>Localização</h4>
                    
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Endereço *</label>
                        <input
                          type="text"
                          value={formData.address.street}
                          onChange={(e) => setFormData({
                            ...formData,
                            address: { ...formData.address, street: e.target.value }
                          })}
                          placeholder="Endereço completo da empresa"
                          required
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Cidade *</label>
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) => setFormData({
                            ...formData,
                            address: { ...formData.address, city: e.target.value }
                          })}
                          placeholder="Dubai"
                          required
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Estado/Emirado *</label>
                        <select
                          value={formData.address.state}
                          onChange={(e) => setFormData({
                            ...formData,
                            address: { ...formData.address, state: e.target.value }
                          })}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="AZ">Abu Dhabi</option>
                          <option value="AJ">Ajman</option>
                          <option value="DU">Dubai</option>
                          <option value="FU">Fujairah</option>
                          <option value="RK">Ras Al Khaimah</option>
                          <option value="SH">Sharjah</option>
                          <option value="UQ">Umm Al Quwain</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Informações da Empresa */}
                  <div className={styles.formSection}>
                    <h4>Informações da Empresa</h4>
                    
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Setor de Atuação *</label>
                        <select
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="tecnologia">Tecnologia</option>
                          <option value="financeiro">Financeiro</option>
                          <option value="construcao">Construção</option>
                          <option value="petroleo">Petróleo e Gás</option>
                          <option value="turismo">Turismo e Hospitalidade</option>
                          <option value="saude">Saúde</option>
                          <option value="educacao">Educação</option>
                          <option value="varejo">Varejo</option>
                          <option value="logistica">Logística</option>
                          <option value="outros">Outros</option>
                        </select>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Tamanho da Empresa *</label>
                        <select
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value as any })}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="startup">Startup (1-10 funcionários)</option>
                          <option value="small">Pequena (11-50 funcionários)</option>
                          <option value="medium">Média (51-200 funcionários)</option>
                          <option value="large">Grande (201-1000 funcionários)</option>
                          <option value="enterprise">Corporação (1000+ funcionários)</option>
                        </select>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Descrição da Empresa *</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Descreva sua empresa, cultura e oportunidades..."
                          rows={4}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contato Responsável */}
                  <div className={styles.formSection}>
                    <h4>Contato Responsável</h4>
                    
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Nome do Responsável *</label>
                        <input
                          type="text"
                          value={formData.primaryContact.name}
                          onChange={(e) => setFormData({
                            ...formData,
                            primaryContact: { ...formData.primaryContact, name: e.target.value }
                          })}
                          placeholder="Nome completo"
                          required
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Cargo *</label>
                        <input
                          type="text"
                          value={formData.primaryContact.position}
                          onChange={(e) => setFormData({
                            ...formData,
                            primaryContact: { ...formData.primaryContact, position: e.target.value }
                          })}
                          placeholder="Ex: HR Manager"
                          required
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Email do Contato *</label>
                        <input
                          type="email"
                          value={formData.primaryContact.email}
                          onChange={(e) => setFormData({
                            ...formData,
                            primaryContact: { ...formData.primaryContact, email: e.target.value }
                          })}
                          placeholder="contato@empresa.com"
                          required
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Telefone do Contato</label>
                        <input
                          type="tel"
                          value={formData.primaryContact.phone || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            primaryContact: { ...formData.primaryContact, phone: e.target.value }
                          })}
                          placeholder="+971 (0) 4 000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status (apenas para admin) */}
                  <div className={styles.formGroup}>
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="pending">Pendente</option>
                      <option value="active">Ativa</option>
                      <option value="inactive">Inativa</option>
                      <option value="suspended">Suspensa</option>
                      <option value="rejected">Rejeitada</option>
                    </select>
                  </div>

                  {/* Senha Temporária (apenas para criação) */}
                  {modalType === 'create' && (
                    <div className={styles.formGroup}>
                      <label>Senha Temporária (opcional)</label>
                      <input
                        type="text"
                        value={formData.tempPassword}
                        onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                        placeholder="Deixe em branco para gerar senha automática"
                      />
                      <small className={styles.helpText}>
                        Se não informada, será gerada uma senha aleatória de 8 caracteres
                      </small>
                    </div>
                  )}
                </div>
              )}

              {modalType === 'delete' && empresaSelecionada && (
                <div className={styles.deleteConfirmation}>
                  <div className={styles.warningIcon}>
                    <GrStatusWarning size={48} />
                  </div>
                  <h3>Tem certeza que deseja excluir esta empresa?</h3>
                  <p>
                    Esta ação não pode ser desfeita. A empresa <strong>{empresaSelecionada.name}</strong> será 
                    permanentemente removida do sistema.
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
              
              {modalType === 'create' && (
                <button 
                  onClick={handleCreateEmpresa}
                  className="btn btn-primary"
                  disabled={actionLoading === 'create'}
                >
                  {actionLoading === 'create' ? 'Criando...' : 'Criar Empresa'}
                </button>
              )}
              
              {modalType === 'edit' && (
                <button 
                  onClick={handleUpdateEmpresa}
                  className="btn btn-primary"
                  disabled={actionLoading === 'update'}
                >
                  {actionLoading === 'update' ? 'Atualizando...' : 'Atualizar Empresa'}
                </button>
              )}
              
              {modalType === 'delete' && (
                <button 
                  onClick={handleDeleteEmpresa}
                  className="btn btn-danger"
                  disabled={actionLoading === 'delete'}
                >
                  {actionLoading === 'delete' ? 'Deletando...' : 'Confirmar Exclusão'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 