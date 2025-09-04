'use client';

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { GrGlobe, GrCheckmark } from 'react-icons/gr';
import styles from './LanguageSelector.module.css';

const languages = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪' }
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
    
    // Atualizar direção do texto para árabe
    if (languageCode === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = languageCode;
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.languageSelector}>
      <button 
        className={styles.selectorButton}
        onClick={toggleDropdown}
        aria-label="Selecionar idioma"
      >
        <GrGlobe size={16} />
        <span className={styles.currentLanguage}>
          {currentLanguage.flag} {currentLanguage.name}
        </span>
        <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {languages.map((language) => (
            <button
              key={language.code}
              className={`${styles.languageOption} ${
                i18n.language === language.code ? styles.active : ''
              }`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className={styles.languageFlag}>{language.flag}</span>
              <span className={styles.languageName}>{language.name}</span>
              {i18n.language === language.code && (
                <GrCheckmark size={14} className={styles.checkmark} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
