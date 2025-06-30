'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { 
  Bell, 
  Settings, 
  LogOut,
  User
} from 'lucide-react';
import { AuthService, User as UserType } from '@/lib/auth';
import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  user: UserType | null;
  userType: 'candidato' | 'empresa' | 'admin';
}

export default function DashboardHeader({ user, userType }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    AuthService.logout();
    router.push('/');
  };

  // Configuração de navegação baseada no tipo de usuário
  const getNavLinks = () => {
    switch (userType) {
      case 'candidato':
        return [
          { href: '/candidato/dashboard', label: 'Dashboard' },
          { href: '/candidato/entrevistas', label: 'Entrevistas' },
          { href: '/candidato/simulacoes', label: 'Simulações' },
          { href: '/candidato/documentos', label: 'Documentos' },
          { href: '/candidato/cursos', label: 'Cursos' },
          { href: '/candidato/cultura', label: 'Cultura' },
          { href: '/candidato/perfil', label: 'Perfil' }
        ];
      case 'empresa':
        return [
          { href: '/empresa/dashboard', label: 'Dashboard' },
          { href: '/empresa/vagas', label: 'Vagas' },
          { href: '/empresa/candidatos', label: 'Candidatos' },
          { href: '/empresa/entrevistas', label: 'Entrevistas' },
          { href: '/empresa/perfil', label: 'Perfil' }
        ];
      case 'admin':
        return [
          { href: '/admin/dashboard', label: 'Dashboard' },
          { href: '/admin/usuarios', label: 'Usuários' },
          { href: '/admin/empresas', label: 'Empresas' },
          { href: '/admin/vagas', label: 'Vagas' },
          { href: '/admin/relatorios', label: 'Relatórios' }
        ];
      default:
        return [];
    }
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'candidato':
        return 'Candidato';
      case 'empresa':
        return 'Empresa';
      case 'admin':
        return 'Administrador';
      default:
        return 'Usuário';
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link href="/" className={styles.logoLink}>
            <Image 
              src="/images/leao-talent-briddge-preto.svg" 
              alt="Leao Talent Bridge" 
              width={200} 
              height={140}
            />
          </Link>
        </div>
        
        <nav className={styles.headerNav}>
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        <div className={styles.headerActions}>
          <button className={styles.notificationBtn}>
            <Bell size={20} />
            <span className={styles.notificationBadge}>3</span>
          </button>
          
          <div className={styles.userMenu}>
            <div className={styles.userInfo}>
              <Image
                src={user?.profile?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'} 
                alt={user?.name || 'Usuário'} 
                width={40}
                height={40}
              />
            </div>
            
            <div className={styles.userActions}>
              {userType !== 'admin' && (
                <Link href={`/${userType}/perfil`} className={styles.userAction}>
                  <User size={16} />
                  Perfil
                </Link>
              )}
              <button onClick={handleLogout} className={styles.userAction}>
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 