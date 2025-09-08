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
    console.log('=== INÍCIO useEffect Google Translate ===');
    console.log('Hostname:', window.location.hostname);
    console.log('URL:', window.location.href);
    
    // Verificar se estamos em localhost
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('192.168.');
    
    console.log('É localhost?', isLocalhost);
    
    if (isLocalhost) {
      console.log('Ambiente localhost detectado - Google Translate desabilitado para desenvolvimento');
      setIsLoaded(true); // Marcar como carregado para permitir uso do widget
      return;
    }
    
    // Função para inicializar o Google Translate (apenas em produção)
    const initializeGoogleTranslate = () => {
      console.log('Inicializando Google Translate...');
      
      // Verificar se já foi carregado
      if ((window as any).google && (window as any).google.translate) {
        console.log('Google Translate já carregado, inicializando...');
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
            console.log('Google Translate inicializado com sucesso!');
            
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
          setIsLoaded(true);
        }
        return;
      }

      console.log('Carregando script do Google Translate...');
      
      // Remover scripts existentes primeiro
      const existingScripts = document.querySelectorAll('script[src*="translate.google.com"]');
      existingScripts.forEach(script => script.remove());
      
      // Carregar o script do Google Translate
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      
      // Função de inicialização
      (window as any).googleTranslateElementInit = () => {
        console.log('Callback do Google Translate chamado');
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
            console.log('Google Translate inicializado via callback!');
            
            // Esconder o elemento do Google Translate
            setTimeout(() => {
              const googleElement = document.getElementById('google_translate_element');
              if (googleElement) {
                googleElement.style.display = 'none';
              }
            }, 100);
          }
        } catch (error) {
          console.error('Erro ao inicializar Google Translate via callback:', error);
          setIsLoaded(true);
        }
      };

      // Adicionar listener para erro de carregamento
      script.onerror = () => {
        console.warn('Erro ao carregar Google Translate');
        setIsLoaded(true);
      };

      // Adicionar listener para sucesso
      script.onload = () => {
        console.log('Script do Google Translate carregado com sucesso');
      };

      document.head.appendChild(script);
    };

    // Aguardar um pouco antes de inicializar
    const timer = setTimeout(initializeGoogleTranslate, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    console.log('=== INÍCIO handleLanguageChange ===');
    console.log('Idioma solicitado:', languageCode);
    console.log('Idioma atual:', currentLang);
    console.log('Hostname:', window.location.hostname);
    console.log('URL atual:', window.location.href);
    
    if (languageCode === currentLang) {
      console.log('Mesmo idioma, fechando dropdown');
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
      console.log('Aplicado RTL para árabe');
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = languageCode;
      console.log('Aplicado LTR para', languageCode);
    }
    
    // Verificar se estamos em localhost
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('192.168.');
    
    console.log('É localhost?', isLocalhost);
    
    if (isLocalhost) {
      console.log('Ambiente localhost detectado - usando fallback de recarregamento');
      // Em localhost, usar fallback de recarregamento
      const url = new URL(window.location.href);
      url.searchParams.set('hl', languageCode);
      console.log('Nova URL:', url.toString());
      console.log('Recarregando página...');
      window.location.href = url.toString();
      return;
    }
    
    // Tentar usar o Google Translate (apenas em produção)
    console.log('Tentando usar Google Translate...');
    setTimeout(() => {
      try {
        const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        console.log('Elemento Google Translate encontrado:', !!selectElement);
        if (selectElement) {
          selectElement.value = languageCode;
          selectElement.dispatchEvent(new Event('change'));
          console.log('Google Translate: Idioma alterado para', languageCode);
        } else {
          console.warn('Elemento do Google Translate não encontrado, tentando recarregar...');
          // Fallback: recarregar página com parâmetro de idioma
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
    }, 1000);
    
    console.log('=== FIM handleLanguageChange ===');
  };

  const toggleDropdown = () => {
    console.log('=== TOGGLE DROPDOWN ===');
    console.log('Estado atual isOpen:', isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.translateWidget} ${styles[variant]} ${className}`}>
      {/* Elemento oculto do Google Translate */}
      <div id="google_translate_element" ref={googleTranslateRef} style={{ display: 'none' }}></div>
      
      {/* Widget customizado */}
      <div className={styles.widgetContainer}>
        <button 
          className={styles.translateButton}
          onClick={toggleDropdown}
          disabled={isTranslating}
          aria-label="Selecionar idioma"
        >
          <GrGlobe size={16} />
          <span className={styles.languageText}>
            {currentLanguage.flag} {currentLanguage.name}
          </span>
          {isTranslating && <div className={styles.loadingSpinner}></div>}
        </button>

        {isOpen && (
          <div className={styles.dropdown}>
            {languages.map((language) => (
              <button
                key={language.code}
                className={`${styles.languageOption} ${currentLang === language.code ? styles.active : ''}`}
                onClick={() => handleLanguageChange(language.code)}
                disabled={isTranslating}
              >
                <span className={styles.flag}>{language.flag}</span>
                <span className={styles.languageName}>{language.name}</span>
                {showCountry && (
                  <span className={styles.country}>{language.country}</span>
                )}
                {currentLang === language.code && (
                  <GrCheckmark size={14} className={styles.checkIcon} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}