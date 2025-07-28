'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiService } from '@/lib/api';
import { AuthService } from '@/lib/auth';
import { GrUser, GrMail, GrPhone, GrLocation, GrBriefcase, GrView, GrHide, GrPrevious, GrStatusGood, GrDocument, GrCalendar, GrGlobe, GrLinkedin, GrBook, GrStar } from 'react-icons/gr';
import styles from './cadastro.module.css';

export default function CandidatoCadastroPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nomeCompleto: '',
    email: '',
    telefone: '',
    whatsapp: '',
    dataNascimento: '',
    nacionalidade: 'Brasileira',
    estadoCivil: '',
    
    // Endereço
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    pais: 'Brasil',
    
    // Profissional
    profissao: '',
    nivelExperiencia: '',
    areaAtuacao: '',
    salarioDesejado: '',
    disponibilidade: '',
    
    // Educação
    escolaridade: '',
    curso: '',
    instituicao: '',
    anoConclusao: '',
    
    // Idiomas
    ingles: '',
    arabe: '',
    outrosIdiomas: '',
    
    // Documentos
    temPassaporte: false,
    validadePassaporte: '',
    temVisto: false,
    tipoVisto: '',
    
    // Redes Sociais
    linkedin: '',
    portfolio: '',
    
    // Sobre
    objetivos: '',
    experiencias: '',
    habilidades: [] as string[],
    
    // Segurança
    senha: '',
    confirmarSenha: '',
    
    // Termos
    aceitaTermos: false,
    aceitaNewsletter: false
  });

  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      habilidades: [...prev.habilidades, newSkill.trim()]
    }));
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      habilidades: prev.habilidades.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem');
      return;
    }

    if (!formData.aceitaTermos) {
      alert('Você deve aceitar os termos de uso');
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Registrar usuário
      const userData = await ApiService.register({
        email: formData.email,
        password: formData.senha,
        name: formData.nomeCompleto,
        type: 'candidato'
      });

      // 2. Fazer login para obter token
      const loginData = await AuthService.login(
        formData.email,
        formData.senha,
        'candidato'
      );

      // 3. Atualizar perfil do usuário com dados completos
      const profileData = {
        profile: {
          phone: formData.telefone,
          whatsapp: formData.whatsapp,
          birthDate: formData.dataNascimento,
          nationality: formData.nacionalidade,
          maritalStatus: formData.estadoCivil,
          address: {
            street: formData.endereco,
            city: formData.cidade,
            state: formData.estado,
            zipCode: formData.cep,
            country: formData.pais
          },
          professional: {
            currentPosition: formData.profissao,
            experienceLevel: formData.nivelExperiencia,
            workArea: formData.areaAtuacao,
            desiredSalary: parseInt(formData.salarioDesejado) || 0,
            availability: formData.disponibilidade
          },
          education: {
            level: formData.escolaridade,
            course: formData.curso,
            institution: formData.instituicao,
            graduationYear: parseInt(formData.anoConclusao) || new Date().getFullYear()
          },
          languages: {
            english: formData.ingles,
            arabic: formData.arabe,
            others: formData.outrosIdiomas ? [formData.outrosIdiomas] : []
          },
          documents: {
            hasPassport: formData.temPassaporte,
            passportExpiry: formData.validadePassaporte || undefined,
            hasVisa: formData.temVisto,
            visaType: formData.tipoVisto || undefined
          },
          socialMedia: {
            linkedin: formData.linkedin,
            portfolio: formData.portfolio
          },
          objectives: formData.objetivos,
          experience: formData.experiencias,
          skills: formData.habilidades,
          preferences: {
            newsletter: formData.aceitaNewsletter
          }
        }
      };

      // Verificar se o login foi bem-sucedido
      if (loginData.success && loginData.user) {
        await ApiService.updateUser(loginData.user.id, profileData);
        // Redirecionar para dashboard
        router.push('/candidato/dashboard?cadastro=sucesso');
      } else {
        throw new Error('Erro ao fazer login após o cadastro');
      }
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
            <span>Leão Talent Bridge</span>
          </div>
        </div>

        {/* Form Container */}
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1>Cadastro de Candidato</h1>
            <p>Crie seu perfil e encontre as melhores oportunidades nos Emirados Árabes Unidos</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.cadastroForm}>
            {/* Dados Pessoais */}
            <div className={styles.formSection}>
              <h3>
                <GrUser size={20} />
                Dados Pessoais
              </h3>
              
              <div className={styles.formGrid}>
                <div className="form-group form-group-full">
                  <label className="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    name="nomeCompleto"
                    className="form-input"
                    placeholder="Seu nome completo"
                    value={formData.nomeCompleto}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">E-mail *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="seu@email.com"
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
                    placeholder="+55 (11) 99999-9999"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    className="form-input"
                    placeholder="+55 (11) 99999-9999"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Data de Nascimento *</label>
                  <input
                    type="date"
                    name="dataNascimento"
                    className="form-input"
                    value={formData.dataNascimento}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estado Civil</label>
                  <select
                    name="estadoCivil"
                    className="form-select"
                    value={formData.estadoCivil}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione</option>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className={styles.formSection}>
              <h3>
                <GrLocation size={20} />
                Endereço Atual
              </h3>
              
              <div className={styles.formGrid}>
                <div className="form-group form-group-full">
                  <label className="form-label">Endereço *</label>
                  <input
                    type="text"
                    name="endereco"
                    className="form-input"
                    placeholder="Rua, número, complemento"
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
                    placeholder="Sua cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estado *</label>
                  <select
                    name="estado"
                    className="form-select"
                    value={formData.estado}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">CEP</label>
                  <input
                    type="text"
                    name="cep"
                    className="form-input"
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Informações Profissionais */}
            <div className={styles.formSection}>
              <h3>
                <GrBriefcase size={20} />
                Informações Profissionais
              </h3>
              
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Profissão Atual *</label>
                  <input
                    type="text"
                    name="profissao"
                    className="form-input"
                    placeholder="Ex: Desenvolvedor Full Stack"
                    value={formData.profissao}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nível de Experiência *</label>
                  <select
                    name="nivelExperiencia"
                    className="form-select"
                    value={formData.nivelExperiencia}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="junior">Junior (0-2 anos)</option>
                    <option value="pleno">Pleno (2-5 anos)</option>
                    <option value="senior">Sênior (5-8 anos)</option>
                    <option value="especialista">Especialista (8+ anos)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Área de Atuação *</label>
                  <select
                    name="areaAtuacao"
                    className="form-select"
                    value={formData.areaAtuacao}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="tecnologia">Tecnologia</option>
                    <option value="engenharia">Engenharia</option>
                    <option value="saude">Saúde</option>
                    <option value="educacao">Educação</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="marketing">Marketing</option>
                    <option value="vendas">Vendas</option>
                    <option value="rh">Recursos Humanos</option>
                    <option value="operacoes">Operações</option>
                    <option value="design">Design</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Salário Desejado (AED/mês)</label>
                  <input
                    type="number"
                    name="salarioDesejado"
                    className="form-input"
                    placeholder="5000"
                    value={formData.salarioDesejado}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Disponibilidade *</label>
                  <select
                    name="disponibilidade"
                    className="form-select"
                    value={formData.disponibilidade}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="imediata">Imediata</option>
                    <option value="30dias">30 dias</option>
                    <option value="60dias">60 dias</option>
                    <option value="90dias">90 dias</option>
                    <option value="negociar">A negociar</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Educação */}
            <div className={styles.formSection}>
              <h3>
                <GrBook size={20} />
                Educação
              </h3>
              
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Escolaridade *</label>
                  <select
                    name="escolaridade"
                    className="form-select"
                    value={formData.escolaridade}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="medio">Ensino Médio</option>
                    <option value="tecnico">Técnico</option>
                    <option value="superior">Superior</option>
                    <option value="pos">Pós-graduação</option>
                    <option value="mestrado">Mestrado</option>
                    <option value="doutorado">Doutorado</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Curso</label>
                  <input
                    type="text"
                    name="curso"
                    className="form-input"
                    placeholder="Nome do curso"
                    value={formData.curso}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Instituição</label>
                  <input
                    type="text"
                    name="instituicao"
                    className="form-input"
                    placeholder="Nome da instituição"
                    value={formData.instituicao}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ano de Conclusão</label>
                  <input
                    type="number"
                    name="anoConclusao"
                    className="form-input"
                    placeholder="2023"
                    min="1950"
                    max="2030"
                    value={formData.anoConclusao}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Idiomas */}
            <div className={styles.formSection}>
              <h3>
                <GrGlobe size={20} />
                Idiomas
              </h3>
              
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Inglês *</label>
                  <select
                    name="ingles"
                    className="form-select"
                    value={formData.ingles}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="basico">Básico</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                    <option value="fluente">Fluente</option>
                    <option value="nativo">Nativo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Árabe</label>
                  <select
                    name="arabe"
                    className="form-select"
                    value={formData.arabe}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione</option>
                    <option value="basico">Básico</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                    <option value="fluente">Fluente</option>
                    <option value="nativo">Nativo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Outros Idiomas</label>
                  <input
                    type="text"
                    name="outrosIdiomas"
                    className="form-input"
                    placeholder="Ex: Espanhol, Francês"
                    value={formData.outrosIdiomas}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div className={styles.formSection}>
              <h3>
                <GrDocument size={20} />
                Documentos
              </h3>
              
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      name="temPassaporte"
                      checked={formData.temPassaporte}
                      onChange={handleInputChange}
                    />
                    <span>Possuo passaporte válido</span>
                  </label>
                </div>

                {formData.temPassaporte && (
                  <div className="form-group">
                    <label className="form-label">Validade do Passaporte</label>
                    <input
                      type="date"
                      name="validadePassaporte"
                      className="form-input"
                      value={formData.validadePassaporte}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      name="temVisto"
                      checked={formData.temVisto}
                      onChange={handleInputChange}
                    />
                    <span>Possuo visto para os Emirados Árabes Unidos</span>
                  </label>
                </div>

                {formData.temVisto && (
                  <div className="form-group">
                    <label className="form-label">Tipo de Visto</label>
                    <select
                      name="tipoVisto"
                      className="form-select"
                      value={formData.tipoVisto}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione</option>
                      <option value="trabalho">Visto de Trabalho</option>
                      <option value="turismo">Visto de Turismo</option>
                      <option value="residencia">Visto de Residência</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Redes Sociais */}
            <div className={styles.formSection}>
              <h3>
                <GrLinkedin size={20} />
                Redes Sociais e Portfólio
              </h3>
              
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    className="form-input"
                    placeholder="https://linkedin.com/in/seuperfil"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Portfólio/Website</label>
                  <input
                    type="url"
                    name="portfolio"
                    className="form-input"
                    placeholder="https://seuportfólio.com"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Habilidades */}
            <div className={styles.formSection}>
              <h3>
                <GrStatusGood size={20} />
                Habilidades e Competências
              </h3>
              
              <div className={styles.skillsSection}>
                <div className={styles.skillInput}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Digite uma habilidade..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <button 
                    type="button" 
                    onClick={addSkill}
                    className={styles.addBtn}
                  >
                    Adicionar
                  </button>
                </div>
                <div className={styles.skillTags}>
                  {formData.habilidades.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>
                      {skill}
                      <button 
                        type="button"
                        onClick={() => removeSkill(index)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sobre Você */}
            <div className={styles.formSection}>
              <h3>
                <GrUser size={20} />
                Sobre Você
              </h3>
              
              <div className={styles.formGrid}>
                <div className="form-group form-group-full">
                  <label className="form-label">Objetivos Profissionais</label>
                  <textarea
                    name="objetivos"
                    className="form-input"
                    placeholder="Descreva seus objetivos profissionais nos Emirados Árabes Unidos..."
                    value={formData.objetivos}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Experiência Profissional</label>
                  <textarea
                    name="experiencias"
                    className="form-input"
                    placeholder="Descreva sua experiência profissional relevante..."
                    value={formData.experiencias}
                    onChange={handleInputChange}
                    rows={4}
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

            {/* Termos */}
            <div className={styles.formSection}>
              <div className={styles.termsSection}>
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    name="aceitaTermos"
                    checked={formData.aceitaTermos}
                    onChange={handleInputChange}
                    required
                  />
                  <span>Aceito os <Link href="/termos">termos de uso</Link> e <Link href="/privacidade">política de privacidade</Link> *</span>
                </label>

                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    name="aceitaNewsletter"
                    checked={formData.aceitaNewsletter}
                    onChange={handleInputChange}
                  />
                  <span>Desejo receber newsletters com oportunidades de emprego</span>
                </label>
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
                  'Criar Minha Conta'
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className={styles.loginLink}>
            <span>Já tem uma conta?</span>
            <Link href="/candidato/login">Fazer Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 