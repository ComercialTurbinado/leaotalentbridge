# 🔐 **Requisitos de Autenticação e Autorização - Leão Talent Bridge**

## 📋 **Visão Geral**

Este documento descreve todos os requisitos de autenticação e autorização para adicionar, editar e remover recursos no sistema, organizados por responsáveis e áreas de acesso.

---

## 🏗️ **Estrutura de Autenticação**

### **Tipos de Usuário**
- **👨‍💼 Candidato**: Usuários que se candidatam a vagas
- **🏢 Empresa**: Empresas que publicam vagas
- **👨‍💻 Admin**: Administradores do sistema

### **Status de Usuário**
- **pending**: Aguardando aprovação
- **approved**: Aprovado e ativo
- **rejected**: Rejeitado
- **suspended**: Suspenso

---

## 🔐 **APIs ADMIN (Apenas Administradores)**

### **🏢 Gestão de Empresas** (`/api/admin/companies`)
- **Requisito**: `user.type === 'admin'`
- **Operações**:
  - ✅ `GET` - Listar todas as empresas
  - ✅ `POST` - Criar empresa + usuário automaticamente
  - ✅ `PUT` - Atualizar empresa
  - ✅ `DELETE` - Deletar empresa

### **👥 Gestão de Usuários** (`/api/admin/users`)
- **Requisito**: `user.type === 'admin'`
- **Operações**:
  - ✅ `GET` - Listar todos os usuários
  - ✅ `POST` - Criar usuário
  - ✅ `PUT` - Atualizar usuário
  - ✅ `DELETE` - Deletar usuário
  - ✅ `POST /approve` - Aprovar usuário
  - ✅ `POST /reject` - Rejeitar usuário

### **💼 Gestão de Vagas** (`/api/admin/jobs`)
- **Requisito**: `user.type === 'admin'`
- **Operações**:
  - ✅ `GET` - Listar todas as vagas
  - ✅ `POST` - Criar vaga
  - ✅ `PUT` - Atualizar vaga
  - ✅ `DELETE` - Deletar vaga
  - ✅ `POST /release` - Liberar vaga para candidatos

### **📝 Gestão de Candidaturas** (`/api/admin/applications`)
- **Requisito**: `user.type === 'admin'`
- **Operações**:
  - ✅ `GET` - Listar todas as candidaturas
  - ✅ `PUT` - Aprovar/rejeitar candidatura
  - ✅ `DELETE` - Deletar candidatura

### **📊 Relatórios** (`/api/admin/reports`)
- **Requisito**: `user.type === 'admin'`
- **Operações**:
  - ✅ `GET` - Relatórios administrativos

### **📈 Estatísticas** (`/api/admin/stats`)
- **Requisito**: `user.type === 'admin'`
- **Operações**:
  - ✅ `GET` - Estatísticas do sistema

### **🎯 Indicações** (`/api/admin/recommendations`)
- **Requisito**: `user.type === 'admin'`
- **Operações**:
  - ✅ `GET` - Listar indicações
  - ✅ `POST` - Criar indicação
  - ✅ `PUT` - Atualizar indicação

---

## 🏢 **APIs EMPRESA (Apenas Empresas Aprovadas)**

### **💼 Gestão de Vagas** (`/api/jobs`)
- **Requisito**: `user.type === 'empresa' && user.status === 'approved'`
- **Operações**:
  - ✅ `GET` - Listar vagas da empresa
  - ✅ `POST` - Criar vaga (apenas para própria empresa)
  - ✅ `PUT` - Atualizar vaga (apenas própria empresa)
  - ✅ `DELETE` - Deletar vaga (apenas própria empresa)

### **📝 Gestão de Candidaturas** (`/api/applications`)
- **Requisito**: `user.type === 'empresa' && user.status === 'approved'`
- **Operações**:
  - ✅ `GET` - Listar candidaturas para vagas da empresa
  - ✅ `PUT` - Atualizar status da candidatura
  - ❌ `DELETE` - Não pode deletar candidaturas

### **👥 Visualização de Candidatos** (`/api/companies/[id]/applications/public`)
- **Requisito**: `user.type === 'empresa' && user.status === 'approved'`
- **Operações**:
  - ✅ `GET` - Ver candidatos (dados anonimizados)
  - ❌ `POST/PUT/DELETE` - Não permitido

### **📊 Relatórios da Empresa** (`/api/companies/[id]/reports`)
- **Requisito**: `user.type === 'empresa' && user.status === 'approved'`
- **Operações**:
  - ✅ `GET` - Relatórios da própria empresa

### **📈 Estatísticas da Empresa** (`/api/companies/[id]/stats`)
- **Requisito**: `user.type === 'empresa' && user.status === 'approved'`
- **Operações**:
  - ✅ `GET` - Estatísticas da própria empresa

### **🎯 Indicações da Empresa** (`/api/companies/[id]/recommendations`)
- **Requisito**: `user.type === 'empresa' && user.status === 'approved'`
- **Operações**:
  - ✅ `GET` - Ver indicações para vagas da empresa
  - ✅ `PUT` - Responder às indicações

---

## 👨‍💼 **APIs CANDIDATO (Apenas Candidatos Aprovados)**

### **💼 Visualização de Vagas** (`/api/jobs`)
- **Requisito**: `user.type === 'candidato' && user.status === 'approved' && user.permissions.canAccessJobs`
- **Operações**:
  - ✅ `GET` - Ver vagas liberadas pelo admin
  - ❌ `POST/PUT/DELETE` - Não permitido

### **📝 Gestão de Candidaturas** (`/api/applications`)
- **Requisito**: `user.type === 'candidato' && user.status === 'approved' && user.permissions.canApplyToJobs`
- **Operações**:
  - ✅ `GET` - Ver próprias candidaturas
  - ✅ `POST` - Criar candidatura
  - ✅ `PUT` - Atualizar própria candidatura
  - ✅ `DELETE` - Cancelar própria candidatura

### **👤 Perfil do Candidato** (`/api/candidates/[id]/applications`)
- **Requisito**: `user.type === 'candidato' && user._id === params.id`
- **Operações**:
  - ✅ `GET` - Ver próprias candidaturas
  - ❌ `POST/PUT/DELETE` - Não permitido

### **🎯 Indicações do Candidato** (`/api/candidates/recommendations`)
- **Requisito**: `user.type === 'candidato' && user.status === 'approved'`
- **Operações**:
  - ✅ `GET` - Ver indicações recebidas
  - ✅ `PUT` - Responder às indicações

---

## 🔒 **APIs PÚBLICAS (Sem Autenticação)**

### **💼 Vagas Públicas** (`/api/jobs/public`)
- **Requisito**: Nenhum
- **Operações**:
  - ✅ `GET` - Ver vagas públicas (limitado)

### **🏢 Empresas Públicas** (`/api/companies`)
- **Requisito**: Nenhum (para GET)
- **Operações**:
  - ✅ `GET` - Listar empresas (dados limitados)

---

## 🛡️ **Sistema de Permissões por Usuário**

### **👨‍💼 Candidato**
```typescript
permissions: {
  canAccessJobs: boolean;        // Ver vagas liberadas
  canApplyToJobs: boolean;       // Se candidatar
  canViewCourses: boolean;       // Ver cursos (sempre true)
  canAccessSimulations: boolean; // Acessar simulações
  canContactCompanies: boolean;  // Contatar empresas
  releasedJobs?: ObjectId[];     // Vagas liberadas especificamente
}
```

### **🏢 Empresa**
```typescript
permissions: {
  canAccessJobs: boolean;        // Ver vagas (próprias)
  canApplyToJobs: boolean;       // Não aplicável
  canViewCourses: boolean;       // Ver cursos
  canAccessSimulations: boolean; // Acessar simulações
  canContactCompanies: boolean;  // Contatar candidatos
}
```

### **👨‍💻 Admin**
```typescript
// Admin tem TODAS as permissões automaticamente
// Não precisa verificar permissions específicas
```

---

## 🔍 **Verificações de Segurança**

### **1. Verificação de Token**
```typescript
const authHeader = request.headers.get('authorization');
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 401 });
}
```

### **2. Verificação de Tipo de Usuário**
```typescript
if (user.type !== 'admin') {
  return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
}
```

### **3. Verificação de Status**
```typescript
if (user.status !== 'approved') {
  return NextResponse.json({ success: false, message: 'Conta não aprovada' }, { status: 403 });
}
```

### **4. Verificação de Propriedade**
```typescript
// Empresa só pode acessar seus próprios recursos
if (user.type === 'empresa' && resource.companyId !== user.companyId) {
  return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
}
```

---

## 🚨 **Casos Especiais**

### **Criação de Empresa pelo Admin**
- ✅ Admin cria empresa
- ✅ Sistema cria usuário automaticamente
- ✅ Senha aleatória gerada
- ✅ Status 'approved' para acesso imediato

### **Liberação de Vagas para Candidatos**
- ✅ Admin libera vagas específicas
- ✅ Candidatos só veem vagas liberadas
- ✅ Controle granular por candidato

### **Aprovação de Candidaturas**
- ✅ Admin aprova candidaturas
- ✅ Empresas só veem candidaturas aprovadas
- ✅ Dados anonimizados para empresas

---

## 📝 **Checklist de Implementação**

### **✅ Implementado**
- [x] Autenticação JWT
- [x] Verificação de tipo de usuário
- [x] Verificação de status
- [x] APIs admin protegidas
- [x] APIs empresa protegidas
- [x] APIs candidato protegidas
- [x] Sistema de permissões
- [x] Middleware de autenticação

### **🔄 Em Desenvolvimento**
- [ ] Logs de auditoria
- [ ] Rate limiting
- [ ] Validação de entrada
- [ ] Sanitização de dados

### **❌ Pendente**
- [ ] Refresh tokens
- [ ] 2FA para admin
- [ ] Logs de segurança
- [ ] Monitoramento de tentativas de acesso

---

## 🔧 **Como Testar**

### **1. Teste de Admin**
```bash
# Login como admin
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "senha",
  "type": "admin"
}

# Criar empresa
POST /api/admin/companies
Authorization: Bearer <token>
```

### **2. Teste de Empresa**
```bash
# Login como empresa
POST /api/auth/login
{
  "email": "empresa@example.com",
  "password": "senha",
  "type": "empresa"
}

# Criar vaga
POST /api/jobs
Authorization: Bearer <token>
```

### **3. Teste de Candidato**
```bash
# Login como candidato
POST /api/auth/login
{
  "email": "candidato@example.com",
  "password": "senha",
  "type": "candidato"
}

# Ver vagas
GET /api/jobs
Authorization: Bearer <token>
```

---

## 📞 **Suporte**

Para dúvidas sobre autenticação e autorização:
1. Verifique os logs do console
2. Confirme o tipo de usuário
3. Verifique o status da conta
4. Confirme as permissões específicas
5. Teste com diferentes tipos de usuário
