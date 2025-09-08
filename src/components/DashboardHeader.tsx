'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';

import { GrNotification, GrLogout, GrUser } from 'react-icons/gr';
import { AuthService, User as UserType } from '@/lib/auth';
import styles from './DashboardHeader.module.css';
import GoogleTranslateWidget from './GoogleTranslateWidget';

interface DashboardHeaderProps {
  user: UserType | null;
  userType: 'candidato' | 'empresa' | 'admin';
}

export default function DashboardHeader({ user, userType }: DashboardHeaderProps) {
  const { t } = useTranslation();
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
          { href: '/candidato/dashboard', label: t('nav.dashboard') },
          { href: '/candidato/entrevistas', label: t('nav.interviews') },
          { href: '/candidato/simulacoes', label: t('nav.simulations') },
          { href: '/candidato/documentos', label: t('nav.documents') },
          { href: '/candidato/cultura', label: t('nav.culture') },
          { href: '/candidato/perfil', label: t('nav.profile') }
        ];
      case 'empresa':
        return [
          { href: '/empresa/dashboard', label: t('nav.dashboard') },
          { href: '/empresa/vagas', label: t('nav.jobs') },
          { href: '/empresa/candidatos', label: t('nav.candidates') },
          { href: '/empresa/entrevistas', label: t('nav.interviews') },
          { href: '/empresa/perfil', label: t('nav.profile') }
        ];
      case 'admin':
        return [
          { href: '/admin/dashboard', label: t('nav.dashboard') },
          { href: '/admin/usuarios', label: t('nav.users') },
          { href: '/admin/candidatos', label: t('nav.candidates') },
          { href: '/admin/empresas', label: t('nav.companies') },
          { href: '/admin/vagas', label: t('nav.jobs') },
          { href: '/admin/relatorios', label: t('nav.reports') }
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
              src="/images/UAECareers-orig.svg" 
              alt="UAE Careers" 
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
          <GoogleTranslateWidget variant="header" />
          
          <button className={styles.notificationBtn}>
            <GrNotification size={20} />
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
                  <GrUser size={16} />
                  {t('nav.profile')}
                </Link>
              )}
              <button onClick={handleLogout} className={styles.userAction}>
                <GrLogout size={16} />
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 