# 🛠️ TODO: SISTEMA ADMIN - CORREÇÕES E MELHORIAS

## 🚨 PROBLEMAS IDENTIFICADOS

### 1. **AUTENTICAÇÃO E LOGIN**
- [ ] **Problema**: Login admin não está funcionando corretamente
- [ ] **Solução**: Verificar AuthService.login() para admin
- [ ] **Ação**: Testar login com admin@teste.com / admin123

### 2. **LAYOUT QUEBRADO**
- [ ] **Problema**: CSS modules não estão sendo aplicados corretamente
- [ ] **Solução**: Verificar importação dos arquivos .module.css
- [ ] **Ação**: Criar/atualizar arquivos CSS para todas as páginas admin

### 3. **DADOS ESTÁTICOS**
- [ ] **Problema**: Páginas usando dados mock em vez de APIs reais
- [ ] **Solução**: Conectar todas as páginas às APIs do backend
- [ ] **Ação**: Implementar chamadas reais para MongoDB

---

## 📋 TODO DETALHADO POR PÁGINA

### 🔐 **PÁGINA DE LOGIN** (`/admin/login`)
- [ ] **Corrigir autenticação**
  - [ ] Testar login com admin@teste.com
  - [ ] Verificar redirecionamento após login
  - [ ] Implementar validação de credenciais
- [ ] **Melhorar layout**
  - [ ] Corrigir CSS do formulário
  - [ ] Adicionar validação visual
  - [ ] Implementar loading states
- [ ] **Adicionar funcionalidades**
  - [ ] Recuperação de senha
  - [ ] Lembrar sessão
  - [ ] Logs de tentativas de login

### 📊 **DASHBOARD** (`/admin/dashboard`)
- [ ] **Conectar APIs reais**
  - [ ] `/api/admin/stats` - estatísticas gerais
  - [ ] `/api/admin/reports?type=overview` - relatório geral
  - [ ] Implementar loading states
- [ ] **Melhorar visualização**
  - [ ] Gráficos interativos
  - [ ] Métricas em tempo real
  - [ ] Cards responsivos
- [ ] **Adicionar funcionalidades**
  - [ ] Filtros por período
  - [ ] Exportação de dados
  - [ ] Notificações em tempo real

### 👥 **GESTÃO DE USUÁRIOS** (`/admin/usuarios`)
- [ ] **Conectar APIs reais**
  - [ ] `GET /api/users` - listar usuários
  - [ ] `POST /api/users` - criar usuário
  - [ ] `PUT /api/users/[id]` - atualizar usuário
  - [ ] `DELETE /api/users/[id]` - deletar usuário
- [ ] **Implementar CRUD completo**
  - [ ] Modal de criação de usuário
  - [ ] Modal de edição
  - [ ] Confirmação de exclusão
  - [ ] Filtros avançados
- [ ] **Melhorar interface**
  - [ ] Paginação
  - [ ] Busca avançada
  - [ ] Exportação CSV/Excel
  - [ ] Bulk actions

### 🏢 **GESTÃO DE EMPRESAS** (`/admin/empresas`)
- [ ] **Conectar APIs reais**
  - [ ] `GET /api/companies` - listar empresas
  - [ ] `POST /api/companies` - criar empresa
  - [ ] `PUT /api/companies/[id]` - atualizar empresa
  - [ ] `DELETE /api/companies/[id]` - deletar empresa
- [ ] **Implementar funcionalidades**
  - [ ] Aprovação/rejeição de empresas
  - [ ] Verificação de documentos
  - [ ] Gestão de status
  - [ ] Relatórios de performance
- [ ] **Melhorar interface**
  - [ ] Cards de empresa
  - [ ] Filtros por indústria/tamanho
  - [ ] Métricas de cada empresa

### 💼 **GESTÃO DE VAGAS** (`/admin/vagas`)
- [ ] **Conectar APIs reais**
  - [ ] `GET /api/jobs` - listar vagas
  - [ ] `POST /api/jobs` - criar vaga
  - [ ] `PUT /api/jobs/[id]` - atualizar vaga
  - [ ] `DELETE /api/jobs/[id]` - deletar vaga
- [ ] **Implementar funcionalidades**
  - [ ] Aprovação/rejeição de vagas
  - [ ] Moderação de conteúdo
  - [ ] Gestão de status
  - [ ] Relatórios de performance
- [ ] **Melhorar interface**
  - [ ] Preview de vagas
  - [ ] Filtros por categoria/status
  - [ ] Métricas de candidaturas

### 📝 **APROVAÇÃO DE CANDIDATURAS** (`/admin/aprovacao-candidaturas`)
- [ ] **Conectar APIs reais**
  - [ ] `GET /api/admin/applications` - listar candidaturas
  - [ ] `POST /api/admin/applications` - aprovar/rejeitar
  - [ ] Implementar paginação
- [ ] **Implementar funcionalidades**
  - [ ] Sistema de aprovação/rejeição
  - [ ] Notas do admin
  - [ ] Timeline de eventos
  - [ ] Filtros avançados
- [ ] **Melhorar interface**
  - [ ] Cards de candidatura
  - [ ] Modal de detalhes
  - [ ] Sistema de notas
  - [ ] Histórico de ações

### 📊 **RELATÓRIOS** (`/admin/relatorios`)
- [ ] **Conectar APIs reais**
  - [ ] `GET /api/admin/reports?type=overview` - relatório geral
  - [ ] `GET /api/admin/reports?type=applications` - candidaturas
  - [ ] `GET /api/admin/reports?type=jobs` - vagas
  - [ ] `GET /api/admin/reports?type=companies` - empresas
- [ ] **Implementar funcionalidades**
  - [ ] Gráficos interativos
  - [ ] Filtros por período
  - [ ] Exportação PDF/Excel/CSV
  - [ ] Relatórios personalizados
- [ ] **Melhorar interface**
  - [ ] Dashboard de métricas
  - [ ] Gráficos responsivos
  - [ ] Comparativos temporais

---

## 🔧 **CORREÇÕES TÉCNICAS**

### **CSS E LAYOUT**
- [ ] **Verificar todos os arquivos .module.css**
  - [ ] `src/app/admin/login/login.module.css`
  - [ ] `src/app/admin/dashboard/dashboard.module.css`
  - [ ] `src/app/admin/usuarios/usuarios.module.css`
  - [ ] `src/app/admin/empresas/empresas.module.css`
  - [ ] `src/app/admin/vagas/vagas.module.css`
  - [ ] `src/app/admin/aprovacao-candidaturas/aprovacao-candidaturas.module.css`
  - [ ] `src/app/admin/relatorios/relatorios.module.css`
- [ ] **Corrigir responsividade**
  - [ ] Mobile-first design
  - [ ] Breakpoints corretos
  - [ ] Grid system funcional

### **APIS E BACKEND**
- [ ] **Verificar todas as APIs admin**
  - [ ] `/api/admin/stats` - funcionando ✅
  - [ ] `/api/admin/reports` - funcionando ✅
  - [ ] `/api/admin/applications` - funcionando ✅
  - [ ] `/api/users` - **CRIAR**
  - [ ] `/api/companies` - **CRIAR**
  - [ ] `/api/jobs` - **CRIAR**
- [ ] **Implementar autenticação JWT**
  - [ ] Verificar tokens
  - [ ] Middleware de proteção
  - [ ] Refresh tokens

### **COMPONENTES**
- [ ] **DashboardHeader**
  - [ ] Verificar navegação admin
  - [ ] Corrigir menu dropdown
  - [ ] Implementar notificações
- [ ] **Modais**
  - [ ] Modal de criação/edição
  - [ ] Modal de confirmação
  - [ ] Modal de detalhes
- [ ] **Tabelas**
  - [ ] Paginação
  - [ ] Ordenação
  - [ ] Filtros

---

## 🎯 **FUNCIONALIDADES AVANÇADAS**

### **SISTEMA DE NOTIFICAÇÕES**
- [ ] **Notificações em tempo real**
  - [ ] Novas candidaturas
  - [ ] Empresas pendentes
  - [ ] Vagas para aprovação
  - [ ] Alertas do sistema
- [ ] **Interface de notificações**
  - [ ] Badge no header
  - [ ] Dropdown de notificações
  - [ ] Marcar como lida

### **SISTEMA DE AUDITORIA**
- [ ] **Logs de ações**
  - [ ] Todas as ações do admin
  - [ ] Histórico de mudanças
  - [ ] Exportação de logs
- [ ] **Interface de auditoria**
  - [ ] Página de logs
  - [ ] Filtros por ação/usuário
  - [ ] Timeline de eventos

### **CONFIGURAÇÕES DO SISTEMA**
- [ ] **Página de configurações**
  - [ ] Configurações gerais
  - [ ] Configurações de email
  - [ ] Configurações de pagamento
  - [ ] Backup e restauração

---

## 🚀 **PRIORIDADES DE IMPLEMENTAÇÃO**

### **PRIORIDADE 1 (CRÍTICO)**
1. ✅ Corrigir login admin
2. 🔄 Conectar APIs reais
3. 🔄 Corrigir layouts quebrados
4. 🔄 Implementar CRUD básico

### **PRIORIDADE 2 (IMPORTANTE)**
1. 🔄 Sistema de notificações
2. 🔄 Relatórios avançados
3. 🔄 Filtros e busca
4. 🔄 Exportação de dados

### **PRIORIDADE 3 (MELHORIAS)**
1. 🔄 Sistema de auditoria
2. 🔄 Configurações avançadas
3. 🔄 Gráficos interativos
4. 🔄 Mobile optimization

---

## 📝 **NOTAS DE IMPLEMENTAÇÃO**

### **ESTRUTURA DE ARQUIVOS**
```
src/app/admin/
├── login/
│   ├── page.tsx ✅
│   └── login.module.css 🔄
├── dashboard/
│   ├── page.tsx ✅
│   └── dashboard.module.css 🔄
├── usuarios/
│   ├── page.tsx ✅
│   └── usuarios.module.css 🔄
├── empresas/
│   ├── page.tsx 🔄
│   └── empresas.module.css 🔄
├── vagas/
│   ├── page.tsx 🔄
│   └── vagas.module.css 🔄
├── aprovacao-candidaturas/
│   ├── page.tsx ✅
│   └── aprovacao-candidaturas.module.css 🔄
└── relatorios/
    ├── page.tsx ✅
    └── relatorios.module.css 🔄
```

### **APIS NECESSÁRIAS**
```
/api/admin/
├── stats ✅
├── reports ✅
└── applications ✅

/api/
├── users 🔄
├── companies 🔄
└── jobs 🔄
```

### **COMPONENTES NECESSÁRIOS**
```
src/components/
├── DashboardHeader.tsx ✅
├── AdminModal.tsx 🔄
├── AdminTable.tsx 🔄
├── AdminFilters.tsx 🔄
└── AdminCharts.tsx 🔄
```

---

## ✅ **STATUS ATUAL**

- **Login**: ✅ Funcionando (admin@teste.com / admin123)
- **Dashboard**: ✅ Conectado às APIs
- **Relatórios**: ✅ Implementado
- **Aprovação de Candidaturas**: ✅ Implementado
- **Usuários**: 🔄 Dados mock (precisa conectar APIs)
- **Empresas**: 🔄 Página não implementada
- **Vagas**: 🔄 Página não implementada
- **Layout**: 🔄 CSS quebrado em várias páginas

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Corrigir CSS** - Criar/atualizar todos os arquivos .module.css
2. **Conectar APIs** - Implementar APIs para usuários, empresas e vagas
3. **Implementar páginas** - Criar páginas de empresas e vagas
4. **Testar funcionalidades** - Verificar CRUD completo
5. **Melhorar UX** - Adicionar feedback visual e loading states
