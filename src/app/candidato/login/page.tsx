'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Crown, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import styles from './login.module.css';
import Image from 'next/image';

export default function CandidatoLogin() {
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
      const response = await AuthService.login(formData.email, formData.password, 'candidato');
      
      if (response.success) {
        router.push('/candidato/dashboard');
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
            <h1>Área do Candidato</h1>
            <p>Faça login para acessar suas oportunidades</p>
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
                Email
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="seu@email.com"
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
                <span>Lembrar de mim</span>
              </label>
              <Link href="/candidato/recuperar-senha" className={styles.forgotPassword}>
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
                  Entrar
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className={styles.divider}>
              <span>ou</span>
            </div>

            <div className={styles.signupPrompt}>
              <p>Ainda não tem uma conta?</p>
              <Link href="/candidato/cadastro" className="text-gold">
                Cadastre-se gratuitamente
              </Link>
            </div>
          </form>

          {/* Demo Credentials */}
          {/* <div className={styles.demoCredentials}>
            <h4>Credenciais de Teste:</h4>
            <p><strong>Email:</strong> candidato@teste.com</p>
            <p><strong>Senha:</strong> 123456</p>
          </div> */}
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