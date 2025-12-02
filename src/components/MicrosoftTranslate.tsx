'use client';

import { useState, useEffect } from 'react';
import { GrGlobe } from 'react-icons/gr';

const languages = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪' }
];

export default function MicrosoftTranslate() {
  const [currentLang, setCurrentLang] = useState('pt');
  const [isTranslating, setIsTranslating] = useState(false);

  const translatePage = async (targetLang: string) => {
    if (targetLang === currentLang) return;
    
    setIsTranslating(true);
    
    try {
      // Usar Microsoft Translator API
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: document.body.innerText,
          from: currentLang,
          to: targetLang
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Aplicar tradução na página
        document.body.innerHTML = data.translatedText;
        setCurrentLang(targetLang);
      }
    } catch (error) {
      console.error('Erro na tradução:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="microsoft-translate">
      <div className="translate-selector">
        <GrGlobe size={16} />
        <select 
          value={currentLang} 
          onChange={(e) => translatePage(e.target.value)}
          disabled={isTranslating}
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
      
      <style jsx>{`
        .microsoft-translate {
          position: relative;
        }
        
        .translate-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--primary-gold);
          border-radius: 6px;
          color: white;
        }
        
        .translate-selector select {
          background: transparent;
          border: none;
          color: white;
          font-size: 14px;
          cursor: pointer;
        }
        
        .translate-selector select:focus {
          outline: none;
        }
        
        .translate-selector select option {
          background: #333;
          color: white;
        }
      `}</style>
    </div>
  );
}
