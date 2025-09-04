'use client';

import { useEffect, useState } from 'react';
import { GrGlobe } from 'react-icons/gr';

export default function GoogleTranslate() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Verificar se já foi carregado
    if ((window as any).google && (window as any).google.translate) {
      setIsLoaded(true);
      return;
    }

    // Carregar o script do Google Translate
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    
    // Função de inicialização
    (window as any).googleTranslateElementInit = () => {
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
    };

    document.head.appendChild(script);

    return () => {
      // Limpar script ao desmontar
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="google-translate-container">
      {!isLoaded && (
        <div className="translate-loading">
          <GrGlobe size={16} />
          <span>🌐</span>
        </div>
      )}
      <div id="google_translate_element"></div>
      
      <style jsx>{`
        .google-translate-container {
          position: relative;
          z-index: 1000;
        }
        
        .translate-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--primary-gold);
          color: white;
          border-radius: 6px;
          font-size: 14px;
          min-width: 100px;
        }
        
        /* Estilizar o seletor do Google Translate */
        .goog-te-gadget {
          font-family: inherit !important;
          font-size: 14px !important;
        }
        
        .goog-te-gadget-simple {
          background: var(--primary-gold) !important;
          border: none !important;
          border-radius: 6px !important;
          padding: 8px 12px !important;
          color: white !important;
          font-size: 14px !important;
          min-width: 140px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        
        .goog-te-gadget-simple:hover {
          background: #c19b2e !important;
        }
        
        /* Esconder o texto "Traduzir" */
        .goog-te-gadget-simple .goog-te-menu-value span:first-child {
          display: none !important;
        }
        
        /* Adicionar ícone de globo */
        .goog-te-gadget-simple .goog-te-menu-value:before {
          content: "🌐" !important;
          margin-right: 8px !important;
        }
        
        /* Estilizar o dropdown */
        .goog-te-menu2 {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
          margin-top: 4px !important;
        }
        
        .goog-te-menu2-item {
          padding: 12px 16px !important;
          color: #374151 !important;
          font-size: 14px !important;
        }
        
        .goog-te-menu2-item:hover {
          background-color: #f9fafb !important;
        }
        
        .goog-te-menu2-item-selected {
          background-color: #f3f4f6 !important;
          color: var(--primary-gold) !important;
        }
        
        /* Esconder o banner do Google */
        .goog-te-banner-frame {
          display: none !important;
        }
        
        body {
          top: 0 !important;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
          .goog-te-gadget-simple {
            min-width: 120px !important;
            padding: 6px 10px !important;
            font-size: 13px !important;
          }
          
          .goog-te-gadget-simple .goog-te-menu-value span:last-child {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
