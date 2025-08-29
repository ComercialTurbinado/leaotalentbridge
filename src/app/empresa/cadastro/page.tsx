'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiService } from '@/lib/api';
import { AuthService } from '@/lib/auth';
import { GrOrganization, GrMail, GrPhone, GrLocation, GrGroup, GrGlobe, GrView, GrHide, GrPrevious, GrStatusGood, GrDocument, GrLinkedin, GrStar } from 'react-icons/gr';
import styles from './cadastro.module.css';

export default function EmpresaCadastroPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomeEmpresa: '',
    cnpj: '',
    email: '',
    telefone: '',
    website: '',
    linkedin: '',
    endereco: '',
    cidade: '',
    estado: '',
    setor: '',
    tamanho: '',
    descricao: '',
    nomeContato: '',
    cargoContato: '',
    senha: '',
    confirmarSenha: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Primeiro registrar o usuário
      const userData = await ApiService.register({
        email: formData.email,
        password: formData.senha,
        name: formData.nomeContato,
        type: 'empresa'
      });

            // 2. Fazer login para obter token  
      const loginData = await AuthService.login(
        formData.email,
        formData.senha,
        'empresa'
      );

      // Verificar se o login foi bem-sucedido
      if (!loginData.success) {
        throw new Error('Erro ao fazer login após o cadastro');
      }

      // 3. Criar empresa
      const companyData = await ApiService.createCompany({
        name: formData.nomeEmpresa,
        email: formData.email,
        website: formData.website,
        description: formData.descricao,
        industry: formData.setor,
        size: formData.tamanho,
        address: {
          street: formData.endereco,
          city: formData.cidade,
          state: formData.estado,
          country: 'EAU'
        },
        phone: formData.telefone,
        primaryContact: {
          name: formData.nomeContato,
          position: formData.cargoContato,
          email: formData.email,
          phone: formData.telefone
        },
        socialMedia: {
          linkedin: formData.linkedin
        }
      });

      // Redirecionar para login com sucesso
      router.push('/empresa/login?cadastro=sucesso');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      alert(error instanceof Error ? error.message : 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.cadastroPage}>
      <div className={styles.cadastroContainer}>
        {/* Header */}
        <div className={styles.cadastroHeader}>
          <Link href="/" className={styles.backButton}>
            <GrPrevious size={20} />
            Voltar ao Início
          </Link>
          
          <div className={styles.logo}>
            <GrStar size={32} />
                            <span> UAE Careers</span>
          </div>
        </div>

        {/* Form Container */}
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1>Cadastro de Empresa</h1>
            <p>Registre sua empresa e encontre os melhores talentos brasileiros para os Emirados Árabes Unidos</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.cadastroForm}>
            {/* Dados da Empresa */}
            <div className={styles.formSection}>
              <h3>
                <GrOrganization size={20} />
                Dados da Empresa
              </h3>
              
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Nome da Empresa *</label>
                  <input
                    type="text"
                    name="nomeEmpresa"
                    className="form-input"
                    placeholder="Nome da sua empresa"
                    value={formData.nomeEmpresa}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Business ID *</label>
                  <input
                    type="text"
                    name="cnpj"
                    className="form-input"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">E-mail Corporativo *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="contato@empresa.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Telefone *</label>
                  <input
                    type="tel"
                    name="telefone"
                    className="form-input"
                    placeholder="+971 (0) 4 000-0000"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Website *</label>
                  <div className={styles.inputWithIcon}>
                    <GrGlobe size={20} />
                    <input
                      type="url"
                      name="website"
                      className="form-input"
                      placeholder="https://www.empresa.com"
                      value={formData.website}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn da Empresa *</label>
                  <div className={styles.inputWithIcon}>
                    <GrLinkedin size={20} />
                    <input
                      type="url"
                      name="linkedin"
                      className="form-input"
                      placeholder="https://linkedin.com/company/empresa"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className={styles.formSection}>
              <h3>
                <GrLocation size={20} />
                Localização
              </h3>
              
              <div className={styles.formGrid}>
                <div className="form-group form-group-full">
                  <label className="form-label">Endereço *</label>
                  <input
                    type="text"
                    name="endereco"
                    className="form-input"
                    placeholder="Endereço completo da empresa"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cidade *</label>
                  <input
                    type="text"
                    name="cidade"
                    className="form-input"
                    placeholder="Dubai"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estado/Emirado *</label>
                  <select
                    name="estado"
                    className="form-select"
                    value={formData.estado}
                    onChange={handleInputChange}
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
              <h3>
                <GrDocument size={20} />
                Informações da Empresa
              </h3>
              
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Setor de Atuação *</label>
                  <select
                    name="setor"
                    className="form-select"
                    value={formData.setor}
                    onChange={handleInputChange}
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

                <div className="form-group">
                  <label className="form-label">Tamanho da Empresa *</label>
                  <select
                    name="tamanho"
                    className="form-select"
                    value={formData.tamanho}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="startup">Startup (1-10 funcionários)</option>
                    <option value="pequena">Pequena (11-50 funcionários)</option>
                    <option value="media">Média (51-200 funcionários)</option>
                    <option value="grande">Grande (201-1000 funcionários)</option>
                    <option value="corporacao">Corporação (1000+ funcionários)</option>
                  </select>
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Descrição da Empresa *</label>
                  <textarea
                    name="descricao"
                    className="form-input"
                    placeholder="Descreva sua empresa, cultura e oportunidades..."
                    value={formData.descricao}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contato Responsável */}
            <div className={styles.formSection}>
              <h3>
                <GrGroup size={20} />
                Contato Responsável
              </h3>
              
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Nome do Responsável *</label>
                  <input
                    type="text"
                    name="nomeContato"
                    className="form-input"
                    placeholder="Nome completo"
                    value={formData.nomeContato}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cargo *</label>
                  <input
                    type="text"
                    name="cargoContato"
                    className="form-input"
                    placeholder="Ex: HR Manager"
                    value={formData.cargoContato}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Senha */}
            <div className={styles.formSection}>
              <h3>
                <GrStatusGood size={20} />
                Segurança
              </h3>
              
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Senha *</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="senha"
                      className="form-input"
                      placeholder="Mínimo 8 caracteres"
                      value={formData.senha}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.passwordToggle}
                    >
                      {showPassword ? <GrHide size={20} /> : <GrView size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirmar Senha *</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmarSenha"
                      className="form-input"
                      placeholder="Confirme sua senha"
                      value={formData.confirmarSenha}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={styles.passwordToggle}
                    >
                      {showConfirmPassword ? <GrHide size={20} /> : <GrView size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className={styles.formActions}>
              <button
                type="submit"
                className="btn btn-primary btn-large w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading"></div>
                    Criando Conta...
                  </>
                ) : (
                  'Criar Conta da Empresa'
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className={styles.loginLink}>
            <span>Já tem uma conta?</span>
            <Link href="/empresa/login">Fazer Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 