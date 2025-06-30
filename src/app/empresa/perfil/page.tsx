'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  Building2,
  Save,
  MapPin,
  Users,
  Camera,
  X,
  Plus
} from 'lucide-react';
import styles from './perfil.module.css';

interface EmpresaProfile {
  nomeEmpresa: string;
  descricao: string;
  setor: string;
  tamanho: string;
  website: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  pais: string;
  anoFundacao: string;
  logoUrl?: string;
  beneficios: string[];
  cultura: string[];
  missao: string;
  visao: string;
  valores: string[];
}

export default function EmpresaPerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [profile, setProfile] = useState<EmpresaProfile>({
    nomeEmpresa: '',
    descricao: '',
    setor: '',
    tamanho: '',
    website: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    pais: 'Emirados Árabes Unidos',
    anoFundacao: '',
    beneficios: [],
    cultura: [],
    missao: '',
    visao: '',
    valores: []
  });

  const [newBenefit, setNewBenefit] = useState('');
  const [newCultura, setNewCultura] = useState('');
  const [newValor, setNewValor] = useState('');

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'empresa') {
      router.push('/empresa/login');
      return;
    }
    setUser(currentUser);
    loadProfile();
  }, [router]);

  const loadProfile = () => {
    // Mock data - em produção viria da API
    const mockProfile: EmpresaProfile = {
      nomeEmpresa: 'Tech Solutions DMCC',
      descricao: 'Empresa líder em soluções tecnológicas para o mercado do Oriente Médio.',
      setor: 'Tecnologia',
      tamanho: '51-200 funcionários',
      website: 'https://techsolutions.ae',
      telefone: '+971 4 123 4567',
      email: 'contato@techsolutions.ae',
      endereco: 'DMCC Business Centre, Level 13',
      cidade: 'Dubai',
      pais: 'Emirados Árabes Unidos',
      anoFundacao: '2018',
      beneficios: ['Plano de saúde premium', 'Seguro de vida', 'Auxílio educação'],
      cultura: ['Inovação', 'Colaboração', 'Diversidade'],
      missao: 'Transformar negócios através da tecnologia.',
      visao: 'Ser a principal ponte entre o talento brasileiro e as oportunidades nos UAE.',
      valores: ['Excelência', 'Integridade', 'Inovação']
    };

    setProfile(mockProfile);
    setLoading(false);
  };

  const handleInputChange = (field: keyof EmpresaProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addItem = (type: 'beneficios' | 'cultura' | 'valores', value: string, setter: (value: string) => void) => {
    if (!value.trim()) return;
    
    setProfile(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }));
    setter('');
  };

  const removeItem = (type: 'beneficios' | 'cultura' | 'valores', index: number) => {
    setProfile(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'geral', label: 'Informações Gerais', icon: Building2 },
    { id: 'contato', label: 'Contato & Localização', icon: MapPin },
    { id: 'cultura', label: 'Cultura & Valores', icon: Users }
  ];

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
    <div className={styles.perfilPage}>
      <DashboardHeader user={user} userType="empresa" />

      <main className={styles.mainContent}>
        <div className="container">
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Perfil da Empresa</h1>
              <p>Gerencie as informações e apresentação da sua empresa</p>
            </div>
          </div>

          <div className={styles.profileContainer}>
            <div className={styles.logoSection}>
              <div className={styles.logoUpload}>
                {profile.logoUrl ? (
                  <img src={profile.logoUrl} alt="Logo da empresa" />
                ) : (
                  <div className={styles.logoPlaceholder}>
                    <Building2 size={48} />
                    <span>Logo da Empresa</span>
                  </div>
                )}
                <button className={styles.uploadBtn}>
                  <Camera size={16} />
                  Alterar Logo
                </button>
              </div>
              <div className={styles.logoInfo}>
                <h3>{profile.nomeEmpresa || 'Nome da Empresa'}</h3>
                <p>{profile.setor} • {profile.cidade}, {profile.pais}</p>
              </div>
            </div>

            <div className={styles.tabs}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className={styles.profileForm}>
              {activeTab === 'geral' && (
                <div className={styles.tabContent}>
                  <h2>Informações Gerais</h2>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="nomeEmpresa">Nome da Empresa *</label>
                      <input
                        type="text"
                        id="nomeEmpresa"
                        value={profile.nomeEmpresa}
                        onChange={(e) => handleInputChange('nomeEmpresa', e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="setor">Setor de Atuação *</label>
                      <select
                        id="setor"
                        value={profile.setor}
                        onChange={(e) => handleInputChange('setor', e.target.value)}
                        required
                      >
                        <option value="">Selecione o setor</option>
                        <option value="Tecnologia">Tecnologia</option>
                        <option value="Financeiro">Financeiro</option>
                        <option value="Saúde">Saúde</option>
                        <option value="Educação">Educação</option>
                        <option value="Varejo">Varejo</option>
                        <option value="Construção">Construção</option>
                        <option value="Turismo">Turismo</option>
                        <option value="Energia">Energia</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="descricao">Descrição da Empresa *</label>
                    <textarea
                      id="descricao"
                      value={profile.descricao}
                      onChange={(e) => handleInputChange('descricao', e.target.value)}
                      placeholder="Descreva sua empresa, seus produtos/serviços e diferenciais..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="tamanho">Tamanho da Empresa</label>
                      <select
                        id="tamanho"
                        value={profile.tamanho}
                        onChange={(e) => handleInputChange('tamanho', e.target.value)}
                      >
                        <option value="">Selecione o tamanho</option>
                        <option value="1-10 funcionários">1-10 funcionários</option>
                        <option value="11-50 funcionários">11-50 funcionários</option>
                        <option value="51-200 funcionários">51-200 funcionários</option>
                        <option value="201-500 funcionários">201-500 funcionários</option>
                        <option value="500+ funcionários">500+ funcionários</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="anoFundacao">Ano de Fundação</label>
                      <input
                        type="number"
                        id="anoFundacao"
                        value={profile.anoFundacao}
                        onChange={(e) => handleInputChange('anoFundacao', e.target.value)}
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="website">Website</label>
                    <input
                      type="url"
                      id="website"
                      value={profile.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.suaempresa.com"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'contato' && (
                <div className={styles.tabContent}>
                  <h2>Contato & Localização</h2>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="email">E-mail Corporativo *</label>
                      <input
                        type="email"
                        id="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="telefone">Telefone</label>
                      <input
                        type="tel"
                        id="telefone"
                        value={profile.telefone}
                        onChange={(e) => handleInputChange('telefone', e.target.value)}
                        placeholder="+971 4 123 4567"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="endereco">Endereço</label>
                    <input
                      type="text"
                      id="endereco"
                      value={profile.endereco}
                      onChange={(e) => handleInputChange('endereco', e.target.value)}
                      placeholder="Rua, número, andar, sala..."
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="cidade">Cidade *</label>
                      <select
                        id="cidade"
                        value={profile.cidade}
                        onChange={(e) => handleInputChange('cidade', e.target.value)}
                        required
                      >
                        <option value="">Selecione a cidade</option>
                        <option value="Dubai">Dubai</option>
                        <option value="Abu Dhabi">Abu Dhabi</option>
                        <option value="Sharjah">Sharjah</option>
                        <option value="Ajman">Ajman</option>
                        <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                        <option value="Fujairah">Fujairah</option>
                        <option value="Umm Al Quwain">Umm Al Quwain</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="pais">País</label>
                      <input
                        type="text"
                        id="pais"
                        value={profile.pais}
                        onChange={(e) => handleInputChange('pais', e.target.value)}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cultura' && (
                <div className={styles.tabContent}>
                  <h2>Cultura & Valores</h2>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="missao">Missão</label>
                    <textarea
                      id="missao"
                      value={profile.missao}
                      onChange={(e) => handleInputChange('missao', e.target.value)}
                      placeholder="Qual é o propósito da sua empresa?"
                      rows={3}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="visao">Visão</label>
                    <textarea
                      id="visao"
                      value={profile.visao}
                      onChange={(e) => handleInputChange('visao', e.target.value)}
                      placeholder="Onde sua empresa quer chegar?"
                      rows={3}
                    />
                  </div>

                  <div className={styles.listSection}>
                    <label>Valores da Empresa</label>
                    <div className={styles.listInput}>
                      <input
                        type="text"
                        value={newValor}
                        onChange={(e) => setNewValor(e.target.value)}
                        placeholder="Digite um valor..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('valores', newValor, setNewValor))}
                      />
                      <button 
                        type="button" 
                        onClick={() => addItem('valores', newValor, setNewValor)}
                        className={styles.addBtn}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className={styles.listTags}>
                      {profile.valores.map((valor, index) => (
                        <span key={index} className={styles.listTag}>
                          {valor}
                          <button 
                            type="button"
                            onClick={() => removeItem('valores', index)}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.listSection}>
                    <label>Cultura Organizacional</label>
                    <div className={styles.listInput}>
                      <input
                        type="text"
                        value={newCultura}
                        onChange={(e) => setNewCultura(e.target.value)}
                        placeholder="Digite um aspecto cultural..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('cultura', newCultura, setNewCultura))}
                      />
                      <button 
                        type="button" 
                        onClick={() => addItem('cultura', newCultura, setNewCultura)}
                        className={styles.addBtn}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className={styles.listTags}>
                      {profile.cultura.map((item, index) => (
                        <span key={index} className={styles.listTag}>
                          {item}
                          <button 
                            type="button"
                            onClick={() => removeItem('cultura', index)}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.listSection}>
                    <label>Benefícios Oferecidos</label>
                    <div className={styles.listInput}>
                      <input
                        type="text"
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        placeholder="Digite um benefício..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('beneficios', newBenefit, setNewBenefit))}
                      />
                      <button 
                        type="button" 
                        onClick={() => addItem('beneficios', newBenefit, setNewBenefit)}
                        className={styles.addBtn}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className={styles.listTags}>
                      {profile.beneficios.map((beneficio, index) => (
                        <span key={index} className={styles.listTag}>
                          {beneficio}
                          <button 
                            type="button"
                            onClick={() => removeItem('beneficios', index)}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="loading"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 