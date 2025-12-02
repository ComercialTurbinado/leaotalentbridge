'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';
import { GrMenu, GrClose } from 'react-icons/gr';
import GoogleTranslateWidget from './GoogleTranslateWidget';
import styles from './Header.module.css';

// Header component for the main landing page
interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`${styles.header} ${transparent ? styles.transparent : ''}`}>
      <div className="container">
        <div className={styles.headerContent}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <Image 
              src="/images/UAECareers-ow.svg" 
              alt="UAE Careers" 
              width={200} 
              height={100}
              className={styles.logoIcon}
            />
             
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            <Link href="#como-funciona" className={styles.navLink}>
              {t('header.howItWorks')}
            </Link>
            <Link href="#beneficios" className={styles.navLink}>
              {t('header.benefits')}
            </Link>
            <Link href="#sobre" className={styles.navLink}>
              {t('header.about')}
            </Link>
            <Link href="#contato" className={styles.navLink}>
              {t('header.contact')}
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className={styles.ctaButtons}>
            <GoogleTranslateWidget variant="header" />
            <Link href="/candidato/login" className="btn btn-secondary btn-small">
              {t('header.login')}
            </Link>
            <Link href="#cadastro" className="btn btn-primary btn-small">
              {t('header.register')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={styles.mobileMenuButton}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? t('header.close') : t('header.menu')}
          >
            {isMenuOpen ? <GrClose size={24} /> : <GrMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className={styles.mobileNav}>
            <div className={styles.mobileNavContent}>
              <Link 
                href="#como-funciona" 
                className={styles.mobileNavLink}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.howItWorks')}
              </Link>
              <Link 
                href="#beneficios" 
                className={styles.mobileNavLink}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.benefits')}
              </Link>
              <Link 
                href="#sobre" 
                className={styles.mobileNavLink}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.about')}
              </Link>
              <Link 
                href="#contato" 
                className={styles.mobileNavLink}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.contact')}
              </Link>
              
              <div className={styles.mobileCta}>
                <GoogleTranslateWidget variant="header" />
                <Link href="/candidato/login" className="btn btn-secondary">
                  {t('header.login')}
                </Link>
                <Link href="#cadastro" className="btn btn-primary">
                  {t('header.register')}
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
} 