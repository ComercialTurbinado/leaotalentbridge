'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import styles from './Header.module.css';

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
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
              src="/images/leao-talent-briddge-branco.svg" 
              alt="Leao Talent Bridge" 
              width={200} 
              height={100}
              className={styles.logoIcon}
            />
             
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            <Link href="#como-funciona" className={styles.navLink}>
              Como Funciona
            </Link>
            <Link href="#beneficios" className={styles.navLink}>
              Benefícios
            </Link>
            <Link href="#sobre" className={styles.navLink}>
              Sobre
            </Link>
            <Link href="#contato" className={styles.navLink}>
              Contato
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className={styles.ctaButtons}>
            <Link href="/candidato/login" className="btn btn-secondary btn-small">
              Login
            </Link>
            <Link href="#cadastro" className="btn btn-primary btn-small">
              Cadastrar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={styles.mobileMenuButton}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
                Como Funciona
              </Link>
              <Link 
                href="#beneficios" 
                className={styles.mobileNavLink}
                onClick={() => setIsMenuOpen(false)}
              >
                Benefícios
              </Link>
              <Link 
                href="#sobre" 
                className={styles.mobileNavLink}
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link 
                href="#contato" 
                className={styles.mobileNavLink}
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
              
              <div className={styles.mobileCta}>
                <Link href="/candidato/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link href="#cadastro" className="btn btn-primary">
                  Cadastrar
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
} 