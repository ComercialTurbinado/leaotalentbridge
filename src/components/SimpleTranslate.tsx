'use client';

import { useState, useEffect } from 'react';
import { GrGlobe, GrCheckmark } from 'react-icons/gr';

const languages = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪' }
];

export default function SimpleTranslate() {
  const [currentLang, setCurrentLang] = useState('pt');
  const [isOpen, setIsOpen] = useState(false);

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

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    localStorage.setItem('preferred-language', langCode);
    setIsOpen(false);
    
    // Aplicar direção RTL para árabe
    if (langCode === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = langCode;
    }
    
    // Ativar Google Translate se disponível
    if ((window as any).google && (window as any).google.translate) {
      const selectElement = document.querySelector('.goog-te-combo');
      if (selectElement) {
        (selectElement as HTMLSelectElement).value = langCode;
        selectElement.dispatchEvent(new Event('change'));
      }
    }
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <div className="simple-translate">
      <button 
        className="translate-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <GrGlobe size={16} />
        <span>{currentLanguage.flag} {currentLanguage.name}</span>
        <span className={`arrow ${isOpen ? 'up' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${currentLang === language.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className="flag">{language.flag}</span>
              <span className="name">{language.name}</span>
              {currentLang === language.code && (
                <GrCheckmark size={14} className="checkmark" />
              )}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .simple-translate {
          position: relative;
          display: inline-block;
        }
        
        .translate-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--primary-gold);
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          min-width: 140px;
        }
        
        .translate-button:hover {
          background: #c19b2e;
          transform: translateY(-1px);
        }
        
        .arrow {
          font-size: 10px;
          transition: transform 0.2s ease;
          margin-left: auto;
        }
        
        .arrow.up {
          transform: rotate(180deg);
        }
        
        .language-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          margin-top: 4px;
          overflow: hidden;
          animation: slideDown 0.2s ease;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .language-option {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: #374151;
          transition: background-color 0.2s ease;
        }
        
        .language-option:hover {
          background-color: #f9fafb;
        }
        
        .language-option.active {
          background-color: #f3f4f6;
          color: var(--primary-gold);
          font-weight: 500;
        }
        
        .flag {
          font-size: 18px;
          min-width: 24px;
          text-align: center;
        }
        
        .name {
          flex: 1;
          text-align: left;
        }
        
        .checkmark {
          color: var(--primary-gold);
          margin-left: auto;
        }
        
        /* Suporte para RTL */
        [dir="rtl"] .language-option {
          text-align: right;
        }
        
        [dir="rtl"] .checkmark {
          margin-left: 0;
          margin-right: auto;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
          .translate-button {
            min-width: 120px;
            padding: 6px 10px;
            font-size: 13px;
          }
          
          .translate-button span:nth-child(2) {
            display: none;
          }
          
          .language-dropdown {
            min-width: 160px;
            left: auto;
            right: 0;
          }
        }
      `}</style>
    </div>
  );
}
