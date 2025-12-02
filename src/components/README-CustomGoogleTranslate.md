# CustomGoogleTranslate Component

## 📋 Descrição

Componente de tradução customizado que usa o Google Translate por baixo, mas com uma interface personalizada que mostra bandeiras dos países e remove o logo do Google.

## 🎯 Características

- ✅ **Bandeiras dos países** (🇧🇷 🇺🇸 🇦🇪)
- ✅ **Sem logo do Google** visível
- ✅ **Interface customizada** integrada ao design
- ✅ **Suporte RTL** para árabe
- ✅ **Responsivo** para mobile
- ✅ **Loading states** e feedback visual
- ✅ **LocalStorage** para salvar preferências

## 🚀 Como Usar

### Importação
```typescript
import CustomGoogleTranslate from '@/components/CustomGoogleTranslate';
```

### Uso Básico
```tsx
<CustomGoogleTranslate />
```

### Com Opções
```tsx
<CustomGoogleTranslate 
  variant="header"        // 'header' | 'footer' | 'sidebar'
  showCountry={true}      // Mostrar nome do país
  className="my-class"    // CSS customizado
/>
```

## 🎨 Variantes

### Header (Padrão)
```tsx
<CustomGoogleTranslate variant="header" />
```
- Botão compacto para headers
- Cores do tema (dourado)
- Hover effects

### Footer
```tsx
<CustomGoogleTranslate variant="footer" />
```
- Estilo adaptado para footers
- Pode ser mais discreto

### Sidebar
```tsx
<CustomGoogleTranslate variant="sidebar" />
```
- Estilo para barras laterais
- Largura adaptada

## 🌍 Idiomas Suportados

| Código | Idioma | Bandeira | País |
|--------|--------|----------|------|
| `pt` | Português | 🇧🇷 | Brasil |
| `en` | English | 🇺🇸 | United States |
| `ar` | العربية | 🇦🇪 | United Arab Emirates |

## 📱 Responsividade

- **Desktop**: Mostra bandeira + nome do idioma
- **Tablet**: Mostra bandeira + nome abreviado
- **Mobile**: Mostra apenas a bandeira

## 🔧 Funcionalidades Técnicas

### Google Translate Integration
- Carrega o script do Google Translate automaticamente
- Esconde o elemento original do Google
- Usa a API do Google para tradução real

### RTL Support
- Detecta automaticamente quando árabe é selecionado
- Aplica `dir="rtl"` no documento
- Ajusta layout dos componentes

### LocalStorage
- Salva preferência do usuário
- Restaura idioma na próxima visita
- Chave: `preferred-language`

### Loading States
- Spinner durante carregamento inicial
- Spinner durante tradução
- Estados de disabled apropriados

## 🎨 Estilização

### CSS Modules
- Arquivo: `CustomGoogleTranslate.module.css`
- Classes isoladas
- Suporte a dark mode
- Animações suaves

### Variáveis CSS
```css
--primary-gold: #d4af37;  /* Cor principal */
```

### Customização
```tsx
<CustomGoogleTranslate 
  className="my-custom-class"
/>
```

## 📍 Onde Está Implementado

### ✅ Já Integrado
- **Header principal** (`src/components/Header.tsx`)
- **Dashboard Header** (`src/components/DashboardHeader.tsx`)
- **Menu mobile** (Header.tsx)

### 🔄 Para Adicionar
- Páginas de login
- Páginas de cadastro
- Footer do site
- Páginas de erro

## 🚀 Exemplo Completo

```tsx
'use client';

import CustomGoogleTranslate from '@/components/CustomGoogleTranslate';

export default function MyPage() {
  return (
    <div>
      <header>
        <CustomGoogleTranslate 
          variant="header" 
          showCountry={false}
        />
      </header>
      
      <main>
        <h1>Conteúdo da página</h1>
        <p>Este texto será traduzido automaticamente pelo Google Translate</p>
      </main>
      
      <footer>
        <CustomGoogleTranslate 
          variant="footer" 
          showCountry={true}
        />
      </footer>
    </div>
  );
}
```

## 🔍 Debugging

### Verificar se está funcionando
1. Abrir DevTools
2. Verificar se o script do Google Translate foi carregado
3. Verificar se o elemento `#google_translate_element` existe (mesmo que oculto)
4. Testar mudança de idioma

### Problemas Comuns
- **Não traduz**: Verificar se o script do Google foi carregado
- **Layout quebrado**: Verificar se o CSS está sendo aplicado
- **RTL não funciona**: Verificar se `dir="rtl"` está sendo aplicado

## 🎯 Próximos Passos

1. ✅ Testar em diferentes páginas
2. ✅ Adicionar em páginas de login/cadastro
3. ✅ Implementar no footer
4. ✅ Testar responsividade
5. ✅ Validar traduções em árabe

## 📞 Suporte

Para dúvidas ou problemas:
- Verificar console do navegador
- Testar em diferentes dispositivos
- Validar se o Google Translate está funcionando
