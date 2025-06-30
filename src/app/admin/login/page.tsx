'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Crown, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Shield, Settings } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import styles from './login.module.css';
import Image from 'next/image';

export default function AdminLogin() {
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
      const response = await AuthService.login(formData.email, formData.password, 'admin');
      
      if (response.success) {
        router.push('/admin');
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
            src="/images/leao-talent-briddge-branco.svg" 
            alt="Leao Talent Bridge" 
            width={32} 
            height={32}
          />
          <span>Leao <span className="text-gold">Talent Bridge</span></span>
        </div>

        {/* Login Form */}
        <div className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIcon}>
              <Shield size={32} />
            </div>
            <h1>Área Administrativa</h1>
            <p>Acesso restrito para administradores do sistema</p>
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
                Email Administrativo
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="admin@leaocareers.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={18} />
                Senha de Administrador
              </label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Digite sua senha administrativa"
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
                <span>Manter sessão ativa</span>
              </label>
              <Link href="/admin/recuperar-senha" className={styles.forgotPassword}>
                Problemas de acesso?
              </Link>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-large w-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {!isLoading && (
                <>
                  Acessar Sistema
                  <Settings size={20} />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          {/* <div className={styles.demoCredentials}>
            <h4>Credenciais de Teste:</h4>
            <p><strong>Email:</strong> admin@leaocareers.com</p>
            <p><strong>Senha:</strong> 123456</p>
          </div>

          {/* Security Info */}
          <div className={styles.securityInfo}>
            <div className={styles.securityHeader}>
              <Shield size={16} />
              <h4>Segurança</h4>
            </div>
            <ul>
              <li>🔒 Acesso criptografado com TLS 1.3</li>
              <li>🔑 Autenticação em dois fatores</li>
              <li>📊 Logs de auditoria completos</li>
              <li>⏰ Sessão expira em 8 horas</li>
            </ul>
          </div>

          {/* Admin Features */}
          <div className={styles.adminFeatures}>
            <h4>Funcionalidades Administrativas:</h4>
            <div className={styles.featureGrid}>
              <div className={styles.feature}>
                <span>👥</span>
                <span>Gestão de Usuários</span>
              </div>
              <div className={styles.feature}>
                <span>📈</span>
                <span>Relatórios Avançados</span>
              </div>
              <div className={styles.feature}>
                <span>⚙️</span>
                <span>Configurações do Sistema</span>
              </div>
              <div className={styles.feature}>
                <span>🔍</span>
                <span>Auditoria Completa</span>
              </div>
            </div>
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