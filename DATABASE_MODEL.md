# 🏗️ **Modelo Entidade-Relacionamento - Leao Talent Bridge**

## 📋 **Visão Geral**

Este documento descreve o modelo completo de banco de dados MongoDB para o sistema Leao Talent Bridge, uma plataforma de conexão entre talentos brasileiros e oportunidades de trabalho no exterior, com foco em simulações de entrevista e processo seletivo inteligente.

---

## 🗂️ **Entidades Principais**

### 1. **User** (Usuários)
- **Arquivo**: `src/lib/models/User.ts`
- **Descrição**: Usuários do sistema (candidatos, empresas, admins)
- **Relacionamentos**:
  - 1:N com `Application` (candidaturas)
  - 1:N com `SimulationAnswer` (respostas de simulação)
  - 1:N com `Review` (avaliações feitas)
  - 1:N com `Notification` (notificações)
  - 1:1 com `NotificationPreference` (preferências)

### 2. **Company** (Empresas)
- **Arquivo**: `src/lib/models/Company.ts`
- **Descrição**: Empresas contratantes
- **Relacionamentos**:
  - 1:N com `Job` (vagas publicadas)
  - 1:N with `Application` (candidaturas recebidas)
  - 1:N com `Payment` (pagamentos)
  - 1:1 com `Subscription` (assinatura ativa)
  - 1:N com `Review` (avaliações recebidas)

### 3. **Job** (Vagas)
- **Arquivo**: `src/lib/models/Job.ts`
- **Descrição**: Oportunidades de trabalho
- **Relacionamentos**:
  - N:1 com `Company` (empresa publicante)
  - 1:N com `Application` (candidaturas)
  - 1:N com `AnalyticsEvent` (eventos de visualização)

### 4. **Application** (Candidaturas)
- **Arquivo**: `src/lib/models/Application.ts`
- **Descrição**: Candidaturas para vagas
- **Relacionamentos**:
  - N:1 com `User` (candidato)
  - N:1 com `Job` (vaga)
  - N:1 com `Company` (empresa)
  - 1:N com `Review` (feedback de entrevista)

### 5. **Simulation** (Simulações)
- **Arquivo**: `src/lib/models/Simulation.ts`
- **Descrição**: Simulações de entrevista
- **Relacionamentos**:
  - 1:N com `SimulationAnswer` (respostas)
  - 1:N com `Review` (avaliações de simulação)

### 6. **SimulationAnswer** (Respostas de Simulação)
- **Arquivo**: `src/lib/models/SimulationAnswer.ts`
- **Descrição**: Respostas dos usuários às simulações
- **Relacionamentos**:
  - N:1 com `User` (candidato)
  - N:1 com `Simulation` (simulação)

### 7. **Payment** (Pagamentos)
- **Arquivo**: `src/lib/models/Payment.ts`
- **Descrição**: Transações financeiras
- **Relacionamentos**:
  - N:1 com `Company` (empresa pagante)
  - N:1 com `Subscription` (assinatura relacionada)

### 8. **Subscription** (Assinaturas)
- **Arquivo**: `src/lib/models/Payment.ts`
- **Descrição**: Planos de assinatura das empresas
- **Relacionamentos**:
  - 1:1 com `Company` (empresa assinante)
  - 1:N com `Payment` (histórico de pagamentos)

### 9. **Notification** (Notificações)
- **Arquivo**: `src/lib/models/Notification.ts`
- **Descrição**: Sistema de notificações
- **Relacionamentos**:
  - N:1 com `User` ou `Company` (destinatário)
  - N:1 com `NotificationTemplate` (template usado)

### 10. **Review** (Avaliações)
- **Arquivo**: `src/lib/models/Review.ts`
- **Descrição**: Sistema de avaliações e feedback
- **Relacionamentos**:
  - N:1 com `User` ou `Company` (avaliador)
  - N:1 com `User`, `Company`, `Job`, etc. (alvo da avaliação)
  - N:1 com `Application` (candidatura relacionada)

### 11. **AnalyticsEvent** (Eventos de Analytics)
- **Arquivo**: `src/lib/models/Analytics.ts`
- **Descrição**: Eventos para análise e relatórios
- **Relacionamentos**:
  - N:1 com `User` (usuário do evento)
  - N:1 com `Company` (empresa relacionada)
  - N:1 com `Job` (vaga relacionada)

---

## 🔗 **Relacionamentos Principais**

### **Fluxo de Candidatura**
```
User (candidato) → Application → Job → Company
                     ↓
               SimulationAnswer → Simulation
                     ↓
                  Review (feedback)
```

### **Fluxo de Pagamento**
```
Company → Subscription → Payment
            ↓
       Features & Limits
```

### **Sistema de Notificações**
```
Event Trigger → Notification → NotificationTemplate
                    ↓
            User/Company (recipient)
```

### **Sistema de Analytics**
```
User Actions → AnalyticsEvent → AnalyticsReport
                                     ↓
                              AnalyticsDashboard
```

---

## 📊 **Índices Críticos**

### **Performance**
- `User`: `email`, `type`, `status`
- `Company`: `email`, `status`, `plan.type`
- `Job`: `companyId + status`, `category + location`
- `Application`: `jobId + status`, `candidateId + status`
- `Payment`: `companyId + status`, `transactionId`

### **Busca e Filtros**
- `Job`: Índice textual em `title`, `description`, `tags`
- `User`: Índice composto em `skills`, `experience`, `location`
- `Company`: Índice em `industry`, `size`, `location`

### **Analytics**
- `AnalyticsEvent`: `eventType + timestamp`, `userId + timestamp`
- `Notification`: `recipientId + status`, `type + createdAt`

---

## 🔒 **Controle de Acesso**

### **Níveis de Permissão**
1. **Admin**: Acesso total ao sistema
2. **Company**: Acesso às próprias vagas e candidatos
3. **User (Candidato)**: Acesso ao próprio perfil e candidaturas
4. **User (Recrutador)**: Acesso limitado às empresas vinculadas

### **Filtros por Contexto**
- Todas as consultas filtram por `companyId` quando aplicável
- Dados pessoais só acessíveis pelo próprio usuário
- Avaliações anônimas protegem identidade do avaliador

---

## 📈 **Métricas e KPIs**

### **Para Empresas**
- Total de vagas publicadas
- Candidaturas recebidas
- Taxa de conversão (candidatura → entrevista → contratação)
- Tempo médio de processo seletivo
- Rating médio da empresa

### **Para Candidatos**
- Simulações completadas
- Score médio das simulações
- Candidaturas enviadas
- Taxa de resposta das empresas
- Feedback recebido

### **Para a Plataforma**
- Usuários ativos
- Vagas publicadas
- Matching rate
- Receita por empresa
- Churn rate

---

## 🚀 **Recursos Avançados**

### **Machine Learning**
- Algoritmo de matching baseado em skills e experiência
- Análise de sentiment em reviews
- Predição de sucesso em candidaturas
- Recomendação de vagas personalizadas

### **Integração com APIs**
- Stripe/PayPal para pagamentos
- SendGrid para emails
- Twilio para SMS
- AWS S3 para armazenamento de documentos

### **Escalabilidade**
- Sharding por região geográfica
- Cache Redis para dados frequentes
- CDN para assets estáticos
- Rate limiting por empresa/usuário

---

## 🔧 **Comandos de Setup**

### **Instalação das Dependências**
```bash
npm install mongoose bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### **Variáveis de Ambiente**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

### **Inicialização do Banco**
```bash
npm run seed  # Popula dados iniciais
```

---

## 📝 **Exemplo de Uso**

### **Criar uma Candidatura**
```typescript
import Application from '@/lib/models/Application';
import User from '@/lib/models/User';
import Job from '@/lib/models/Job';

const application = await Application.create({
  jobId: job._id,
  candidateId: user._id,
  companyId: job.companyId,
  coverLetter: "Tenho interesse na vaga...",
  documents: [{
    type: 'resume',
    filename: 'curriculo.pdf',
    url: 'https://storage.com/curriculo.pdf'
  }]
});

// Atualizar métricas automaticamente
await job.updateMetrics();
```

### **Sistema de Notificações**
```typescript
import Notification from '@/lib/models/Notification';

const notification = await Notification.create({
  recipientId: company._id,
  recipientType: 'company',
  type: 'new_candidate',
  title: 'Nova candidatura recebida',
  message: `${candidate.name} se candidatou para ${job.title}`,
  channels: [
    { type: 'email', enabled: true },
    { type: 'in_app', enabled: true }
  ],
  relatedTo: {
    type: 'application',
    id: application._id
  }
});
```

---

## 🎯 **Próximos Passos**

1. **Implementar APIs REST** para todos os modelos
2. **Criar jobs de processamento** para notificações e analytics
3. **Implementar cache** para consultas frequentes
4. **Adicionar testes unitários** para os modelos
5. **Configurar monitoring** e alertas
6. **Implementar backup** automático

---

## 📞 **Suporte**

Para dúvidas sobre o modelo de dados:
- Documentação técnica: `docs/database/`
- Exemplos de uso: `examples/database/`
- Schemas atualizados: `src/lib/models/`

---

*Última atualização: Janeiro 2024*
*Versão do modelo: 1.0.0* 