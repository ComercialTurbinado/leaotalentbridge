'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Crown, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import styles from './login.module.css';
import Image from 'next/image';

export default function EmpresaLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await AuthService.login(formData.email, formData.password, 'empresa');
      
      if (response.success) {
        router.push('/empresa/dashboard');
      } else {
        setError(response.message || 'Erro ao fazer login');
      }
    } catch (error) {
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        {/* Background Pattern */}
        <div className={styles.backgroundPattern}></div>
        
        {/* Logo */}
        <div className={styles.logo}>
          <Image 
            src="/images/leao-talent-briddge-preto.svg" 
            alt="Leao Talent Bridge" 
            width={200} 
            height={140}
          />
          {/* <span>Leao <span className="text-gold">Talent Bridge</span></span> */}
        </div>

        {/* Login Form */}
        <div className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIcon}>
              <Building2 size={32} />
            </div>
            <h1>Portal da Empresa</h1>
            <p>Acesse sua conta para gerenciar vagas e candidatos</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {error && (
              <div className={styles.errorMessage}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <Mail size={18} />
                Email Corporativo
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="empresa@exemplo.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={18} />
                Senha
              </label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input type="checkbox" />
                <span>Manter conectado</span>
              </label>
              <Link href="/empresa/recuperar-senha" className={styles.forgotPassword}>
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-large w-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {!isLoading && (
                <>
                  Acessar Portal
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className={styles.divider}>
              <span>ou</span>
            </div>

            <div className={styles.signupPrompt}>
              <p>Sua empresa ainda não está cadastrada?</p>
              <Link href="/empresa/cadastro" className="text-gold">
                Cadastre sua empresa
              </Link>
            </div>
          </form>

          {/* Demo Credentials */}
          {/* <div className={styles.demoCredentials}>
            <h4>Credenciais de Teste:</h4>
            <p><strong>Email:</strong> empresa@teste.com</p>
            <p><strong>Senha:</strong> 123456</p>
          </div>

          {/* Enterprise Features */}
          <div className={styles.enterpriseFeatures} style={{ background: 'var(--primary-black)', border: '0px solid var(--primary-gold)' }}>
            <h4>Recursos Exclusivos:</h4>
            <ul>
              <li>✓ Gestão completa de vagas</li>
              <li>✓ Banco de talentos pré-selecionados</li>
               <li>✓ Suporte especializado</li>
            </ul>
          </div>
        </div>

        {/* Back to Home */}
        <div className={styles.backToHome}>
          <Link href="/">
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  );
} 