'use client';

import { useState, useEffect, useRef } from 'react';
import { GrGlobe, GrCheckmark } from 'react-icons/gr';
import styles from './GoogleTranslateWidget.module.css';

const languages = [
  { 
    code: 'pt', 
    name: 'Português', 
    flag: '🇧🇷',
    country: 'Brasil'
  },
  { 
    code: 'en', 
    name: 'English', 
    flag: '🇺🇸',
    country: 'United States'
  },
  { 
    code: 'ar', 
    name: 'العربية', 
    flag: '🇦🇪',
    country: 'United Arab Emirates'
  }
];

interface GoogleTranslateWidgetProps {
  variant?: 'header' | 'footer' | 'sidebar';
  showCountry?: boolean;
  className?: string;
}

export default function GoogleTranslateWidget({ 
  variant = 'header', 
  showCountry = false,
  className = '' 
}: GoogleTranslateWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLang, setCurrentLang] = useState('pt');
  const [isTranslating, setIsTranslating] = useState(false);
  const googleTranslateRef = useRef<HTMLDivElement>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  useEffect(() => {
    // Carregar idioma salvo
    const savedLang = localStorage.getItem('preferred-language') || 'pt';
    setCurrentLang(savedLang);
    
    // Aplicar direção RTL para árabe
    if (savedLang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = savedLang;
    }
  }, []);

  useEffect(() => {
    const initializeGoogleTranslate = () => {
      // Verificar se o Google Translate já foi carregado
      if ((window as any).google && (window as any).google.translate) {
        try {
          if (googleTranslateRef.current) {
            new (window as any).google.translate.TranslateElement(
              {
                pageLanguage: 'pt',
                includedLanguages: 'pt,en,ar',
                layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
                multilanguagePage: true
              },
              'google_translate_element'
            );
            setIsLoaded(true);
            
            // Esconder o elemento do Google Translate
            setTimeout(() => {
              const googleElement = document.getElementById('google_translate_element');
              if (googleElement) {
                googleElement.style.display = 'none';
              }
            }, 100);
          }
        } catch (error) {
          console.error('Erro ao inicializar Google Translate:', error);
          setIsLoaded(true); // Permitir uso mesmo com erro
        }
        return;
      }

      // Se não estiver carregado, tentar carregar
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        
        const script = document.createElement('script');
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        
        // Função de inicialização
        (window as any).googleTranslateElementInit = () => {
          setTimeout(initializeGoogleTranslate, 100);
        };

        // Adicionar listener para erro de carregamento
        script.onerror = () => {
          console.warn(`Tentativa ${retryCount.current} de carregar Google Translate falhou`);
          setTimeout(initializeGoogleTranslate, 1000);
        };

        document.head.appendChild(script);
      } else {
        console.warn('Google Translate não pôde ser carregado após várias tentativas');
        setIsLoaded(true); // Permitir uso mesmo sem Google Translate
      }
    };

    // Aguardar um pouco antes de inicializar
    const timer = setTimeout(initializeGoogleTranslate, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    if (languageCode === currentLang) {
      setIsOpen(false);
      return;
    }
    
    setIsTranslating(true);
    setCurrentLang(languageCode);
    localStorage.setItem('preferred-language', languageCode);
    setIsOpen(false);
    
    // Aplicar direção RTL para árabe
    if (languageCode === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = languageCode;
    }
    
    // Tentar usar o Google Translate
    setTimeout(() => {
      try {
        const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (selectElement) {
          selectElement.value = languageCode;
          selectElement.dispatchEvent(new Event('change'));
        } else {
          // Fallback: usar window.location para recarregar com parâmetro
          const url = new URL(window.location.href);
          url.searchParams.set('hl', languageCode);
          window.location.href = url.toString();
        }
      } catch (error) {
        console.error('Erro ao usar Google Translate:', error);
        // Fallback: recarregar página
        window.location.reload();
      }
      
      setIsTranslating(false);
    }, 500);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(`.${styles.languageSelector}`)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`${styles.languageSelector} ${styles[variant]} ${className}`}>
      {/* Elemento oculto do Google Translate */}
      <div 
        ref={googleTranslateRef}
        id="google_translate_element" 
        style={{ display: 'none' }}
      />
      
      <button 
        className={`${styles.selectorButton} ${isTranslating ? styles.translating : ''}`}
        onClick={toggleDropdown}
        disabled={isTranslating}
        aria-label="Selecionar idioma"
        aria-expanded={isOpen}
      >
        <GrGlobe size={16} />
        <span className={styles.currentLanguage}>
          <span className={styles.flag}>{currentLanguage.flag}</span>
          <span className={styles.languageName}>{currentLanguage.name}</span>
          {showCountry && (
            <span className={styles.countryName}>{currentLanguage.country}</span>
          )}
        </span>
        <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>
          ▼
        </span>
        {isTranslating && (
          <div className={styles.translatingSpinner}></div>
        )}
        {!isLoaded && (
          <div className={styles.loadingSpinner}></div>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <GrGlobe size={16} />
            <span>Selecionar Idioma</span>
          </div>
          
          {languages.map((language) => (
            <button
              key={language.code}
              className={`${styles.languageOption} ${
                currentLang === language.code ? styles.active : ''
              }`}
              onClick={() => handleLanguageChange(language.code)}
              disabled={isTranslating}
            >
              <span className={styles.languageFlag}>{language.flag}</span>
              <div className={styles.languageInfo}>
                <span className={styles.languageName}>{language.name}</span>
                {showCountry && (
                  <span className={styles.countryName}>{language.country}</span>
                )}
              </div>
              {currentLang === language.code && (
                <GrCheckmark size={14} className={styles.checkmark} />
              )}
            </button>
          ))}
          
          <div className={styles.dropdownFooter}>
            <small>🌐 Powered by Google Translate</small>
          </div>
        </div>
      )}
    </div>
  );
}
