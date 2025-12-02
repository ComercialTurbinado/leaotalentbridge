'use client';

import { useEffect } from 'react';
import '../lib/i18n';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // O i18n já é inicializado automaticamente quando importamos o arquivo
    console.log('I18n inicializado');
  }, []);

  return <>{children}</>;
}
