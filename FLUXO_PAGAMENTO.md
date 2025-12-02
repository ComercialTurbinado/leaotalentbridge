# Fluxo Completo de Pagamento - UAE Careers

## 📋 Visão Geral

O sistema de pagamento integra com Mercado Pago para processar assinaturas de candidatos e empresas.

## 🔄 Fluxo Detalhado

### 1. **Início do Pagamento**
- **Candidato**: `/candidato/pagamento`
- **Empresa**: `/empresa/pagamento`

**O que acontece:**
- Usuário visualiza planos disponíveis
- Seleciona plano (Anual à Vista, 3x sem juros, 6x no cartão)
- Escolhe método de pagamento (Cartão de Crédito ou PIX)
- Clica em "Finalizar Pagamento Seguro"

### 2. **Criação da Preferência de Pagamento**
**Endpoint**: `POST /api/payments/create-preference`

**Processo:**
1. Valida token de autenticação
2. Cria preferência no Mercado Pago com:
   - Dados do usuário (email, nome)
   - Plano selecionado
   - Valor e parcelamento
   - URLs de retorno (sucesso, erro, pendente)
   - Webhook URL para notificações
3. Cria registro no banco de dados (status: `pending`)
4. Retorna URL do checkout do Mercado Pago

**Código relevante:**
```typescript
// src/app/api/payments/create-preference/route.ts
// src/lib/services/mercadopago.ts (createPaymentPreference)
```

### 3. **Checkout no Mercado Pago**
- Usuário é redirecionado para checkout do Mercado Pago
- Realiza pagamento (cartão ou PIX)
- Mercado Pago processa o pagamento

### 4. **Retorno do Mercado Pago**
Após o pagamento, o usuário é redirecionado para:

**✅ Sucesso:**
- Candidato: `/candidato/pagamento/sucesso?payment_id=xxx`
- Empresa: `/empresa/pagamento/sucesso?payment_id=xxx`

**⏳ Pendente:**
- Candidato: `/candidato/pagamento/pendente?payment_id=xxx`
- Empresa: `/empresa/pagamento/pendente?payment_id=xxx`

**❌ Erro:**
- Candidato: `/candidato/pagamento/erro?reason=xxx`
- Empresa: `/empresa/pagamento/erro?reason=xxx`

**Código relevante:**
```typescript
// src/app/candidato/pagamento/sucesso/page.tsx
// src/app/candidato/pagamento/pendente/page.tsx
// src/app/candidato/pagamento/erro/page.tsx
// src/app/empresa/pagamento/sucesso/page.tsx
// src/app/empresa/pagamento/pendente/page.tsx
// src/app/empresa/pagamento/erro/page.tsx
```

### 5. **Webhook do Mercado Pago**
**Endpoint**: `POST /api/payments/webhook`

**Processo:**
1. Mercado Pago envia notificação quando status do pagamento muda
2. Sistema busca detalhes do pagamento no Mercado Pago
3. Atualiza status no banco de dados:
   - `pending` → `processing` → `completed` ou `failed`
4. Se aprovado (`completed`):
   - Cria ou atualiza assinatura (12 meses)
   - Ativa recursos premium
   - Atualiza `completedAt` e `processedAt`
5. Se falhou:
   - Atualiza `failedAt`
   - Registra tentativa de pagamento

**Código relevante:**
```typescript
// src/app/api/payments/webhook/route.ts
// src/lib/services/mercadopago.ts (getPaymentById, mapMercadoPagoStatus)
```

### 6. **Verificação de Status**
**Endpoint**: `GET /api/payments/status?paymentId=xxx`

Permite verificar status atualizado do pagamento, consultando:
- Banco de dados local
- API do Mercado Pago (se houver `transactionId`)

## 📊 Modelo de Dados

### Payment (Pagamento)
```typescript
{
  paymentId: string (único)
  userId: ObjectId (candidato)
  companyId?: ObjectId (empresa)
  type: 'subscription'
  amount: number
  currency: 'BRL'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  paymentMethod: {
    type: 'credit_card' | 'bank_transfer'
    provider: 'mercadopago'
    providerId: string (preference ID)
  }
  transactionId?: string (payment ID do Mercado Pago)
  metadata: {
    preferenceId: string
    planId: string
    planName: string
    userType: 'candidato' | 'empresa'
  }
  gatewayResponse: object (resposta completa do Mercado Pago)
}
```

### Subscription (Assinatura)
```typescript
{
  companyId: ObjectId
  planId: string
  planName: string
  status: 'active' | 'trial' | 'expired' | 'cancelled'
  startDate: Date
  endDate: Date (12 meses após início)
  amount: number
  features: {
    maxJobs: number
    maxCandidates: number
    featuredJobs: number
    prioritySupport: boolean
    analyticsAccess: boolean
  }
  usage: {
    jobsUsed: number
    candidatesSearched: number
    featuredJobsUsed: number
  }
}
```

## 🔐 Segurança

1. **Autenticação**: Todas as rotas de pagamento exigem token JWT
2. **Validação**: Dados validados antes de criar preferência
3. **Webhook**: Verificação de origem do Mercado Pago (recomendado implementar)
4. **HTTPS**: Obrigatório em produção

## 🧪 Testes

### Ambiente de Desenvolvimento
- Usa credenciais de teste do Mercado Pago
- Sandbox mode ativado
- ⚠️ **IMPORTANTE**: Usar URL oficial `https://uaecareers.com/` mesmo em testes

### Ambiente de Produção
- Credenciais de produção
- URLs de retorno: `https://uaecareers.com/`
- Webhook URL: `https://uaecareers.com/api/payments/webhook`
- **URL Oficial**: `https://uaecareers.com/` (não usar localhost ou domínios genéricos)

## 📝 Variáveis de Ambiente Necessárias

```env
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_token_producao
MERCADOPAGO_TEST_ACCESS_TOKEN=seu_token_teste

# URLs
# URL oficial: https://uaecareers.com/
NEXT_PUBLIC_API_URL=https://uaecareers.com/api

# JWT
JWT_SECRET=seu_secret_jwt
```

## 🐛 Troubleshooting

### Pagamento não aparece no banco
- Verificar se webhook está configurado no Mercado Pago
- Verificar logs do webhook em `/api/payments/webhook`
- Verificar se `preferenceId` está sendo salvo corretamente

### Status não atualiza
- Verificar se webhook está recebendo notificações
- Verificar mapeamento de status em `mapMercadoPagoStatus`
- Verificar logs do console

### Assinatura não é criada
- Verificar se pagamento está com status `completed`
- Verificar função `createOrUpdateSubscription` no webhook
- Verificar se `userId` ou `companyId` está presente

## ✅ Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Webhook URL configurada no Mercado Pago
- [ ] URLs de retorno configuradas corretamente
- [ ] Testar fluxo completo em sandbox
- [ ] Verificar logs de webhook
- [ ] Testar diferentes métodos de pagamento
- [ ] Verificar criação de assinaturas
- [ ] Testar páginas de sucesso/erro/pendente

