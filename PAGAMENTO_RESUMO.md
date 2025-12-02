# 💳 Integração com Mercado Pago - Resumo Executivo

## ✅ O que foi implementado

### 1. **SDK e Serviços** 
- ✅ Instalado pacote `mercadopago`
- ✅ Criado serviço de integração (`src/lib/services/mercadopago.ts`)
- ✅ Funções para criar preferência, verificar status e processar reembolsos

### 2. **APIs Backend (3 rotas)**
- ✅ `POST /api/payments/create-preference` - Cria checkout
- ✅ `POST /api/payments/webhook` - Recebe notificações do Mercado Pago
- ✅ `GET /api/payments/status` - Verifica status de pagamento

### 3. **Páginas Frontend (6 páginas)**
**Candidatos:**
- ✅ `/candidato/pagamento/sucesso` - Confirmação de pagamento
- ✅ `/candidato/pagamento/erro` - Erro no pagamento
- ✅ `/candidato/pagamento/pendente` - Pagamento pendente

**Empresas:**
- ✅ `/empresa/pagamento/sucesso` - Confirmação de pagamento
- ✅ `/empresa/pagamento/erro` - Erro no pagamento
- ✅ `/empresa/pagamento/pendente` - Pagamento pendente

### 4. **Integração Frontend**
- ✅ Botão de pagamento integrado com API
- ✅ Redirecionamento para checkout do Mercado Pago
- ✅ Tratamento de erros e loading states

### 5. **Banco de Dados**
- ✅ Registro de pagamentos na collection `payments`
- ✅ Criação automática de assinaturas
- ✅ Histórico de tentativas de pagamento

---

## 🔧 O que você precisa configurar

### 1️⃣ **Obter Credenciais do Mercado Pago** (OBRIGATÓRIO)

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Crie uma aplicação
3. Copie as credenciais:
   - Access Token (Teste e Produção)
   - Public Key (Teste e Produção)

### 2️⃣ **Configurar Variáveis de Ambiente** (OBRIGATÓRIO)

Crie ou edite o arquivo `.env.local`:

```env
# Mercado Pago - TESTE (para desenvolvimento)
MERCADOPAGO_ACCESS_TOKEN=TEST-123456789-123456-abcdef123456789-123456789
MERCADOPAGO_PUBLIC_KEY=TEST-12345678-1234-1234-1234-123456789012

# Mercado Pago - PRODUÇÃO (para deploy)
# MERCADOPAGO_ACCESS_TOKEN=APP_USR-123456789-123456-abcdef123456789-123456789
# MERCADOPAGO_PUBLIC_KEY=APP_USR-12345678-1234-1234-1234-123456789012

# URL da API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3️⃣ **Configurar Webhook** (OBRIGATÓRIO)

**Para desenvolvimento local:**
```bash
# Instalar ngrok
npm install -g ngrok

# Expor localhost
ngrok http 3000
```

**Configurar no Mercado Pago:**
1. Acesse: https://www.mercadopago.com.br/developers/panel/webhooks
2. Adicione URL: `https://sua-url.ngrok.io/api/payments/webhook`
3. Selecione eventos: `payment.created` e `payment.updated`

**Para produção:**
- URL: `https://seu-dominio.com/api/payments/webhook`

### 4️⃣ **Atualizar Configuração do Serviço** (OBRIGATÓRIO)

Edite `src/lib/services/mercadopago.ts` linha 4-6:

**Para TESTE (desenvolvimento):**
```typescript
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_TEST_ACCESS_TOKEN || '',
  // ...
});
```

**Para PRODUÇÃO:**
```typescript
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  // ...
});
```

---

## 🧪 Como Testar

### 1. Iniciar aplicação
```bash
npm run dev
```

### 2. Acessar página de pagamento
- Candidato: http://localhost:3000/candidato/pagamento
- Empresa: http://localhost:3000/empresa/pagamento

### 3. Usar cartões de teste

**Aprovado:**
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: APRO
CPF: 12345678909
```

**Recusado:**
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: OTHE
CPF: 12345678909
```

### 4. Verificar fluxo completo
1. Selecionar plano
2. Escolher método de pagamento
3. Clicar em "Finalizar Pagamento Seguro"
4. Será redirecionado para Mercado Pago
5. Pagar com cartão de teste
6. Será redirecionado para página de sucesso/erro
7. Verificar webhook nos logs do servidor
8. Conferir pagamento no banco de dados

---

## 📁 Arquivos Criados/Modificados

```
✅ NOVOS ARQUIVOS:
├── src/lib/services/mercadopago.ts
├── src/app/api/payments/create-preference/route.ts
├── src/app/api/payments/webhook/route.ts
├── src/app/api/payments/status/route.ts
├── src/app/candidato/pagamento/sucesso/page.tsx
├── src/app/candidato/pagamento/erro/page.tsx
├── src/app/candidato/pagamento/pendente/page.tsx
├── src/app/empresa/pagamento/sucesso/page.tsx
├── src/app/empresa/pagamento/erro/page.tsx
├── src/app/empresa/pagamento/pendente/page.tsx
├── MERCADOPAGO_SETUP.md (documentação completa)
└── PAGAMENTO_RESUMO.md (este arquivo)

✏️ ARQUIVOS MODIFICADOS:
├── src/app/candidato/pagamento/page.tsx (integração com API)
├── src/app/empresa/pagamento/page.tsx (integração com API)
├── env.example (novas variáveis)
└── package.json (dependência mercadopago)
```

---

## 🚀 Deploy em Produção

### Checklist antes do deploy:

- [ ] Obter credenciais de PRODUÇÃO do Mercado Pago
- [ ] Atualizar `.env` com credenciais de produção
- [ ] Alterar `MERCADOPAGO_ACCESS_TOKEN` no código
- [ ] Configurar `NEXT_PUBLIC_API_URL` com domínio real
- [ ] Configurar webhook com URL de produção
- [ ] Adicionar variáveis de ambiente no serviço de hosting (Vercel/AWS/etc)
- [ ] Testar em staging antes
- [ ] Monitorar logs após deploy

### Variáveis para adicionar no hosting:
```
MERCADOPAGO_ACCESS_TOKEN
MERCADOPAGO_PUBLIC_KEY
NEXT_PUBLIC_API_URL
MONGODB_URI
JWT_SECRET
```

---

## 💰 Fluxo de Pagamento

```
1. Usuário acessa /candidato/pagamento ou /empresa/pagamento
   ↓
2. Seleciona plano e método de pagamento
   ↓
3. Clica em "Finalizar Pagamento Seguro"
   ↓
4. Frontend chama POST /api/payments/create-preference
   ↓
5. Backend cria preferência no Mercado Pago
   ↓
6. Backend salva Payment no MongoDB (status: pending)
   ↓
7. Usuário é redirecionado para checkout do Mercado Pago
   ↓
8. Usuário paga no Mercado Pago
   ↓
9. Mercado Pago chama webhook POST /api/payments/webhook
   ↓
10. Backend atualiza Payment no MongoDB (status: completed)
    ↓
11. Backend cria/atualiza Subscription no MongoDB
    ↓
12. Usuário é redirecionado para página de sucesso
    ↓
13. Usuário recebe acesso premium na plataforma
```

---

## 🔍 Verificar se está funcionando

### No Terminal:
```bash
# Deve aparecer quando receber webhook:
"Webhook recebido do Mercado Pago: { type: 'payment', data: { id: '123' } }"
"Pagamento PAY-XXX atualizado para status: completed"
"Assinatura criada/atualizada para usuário XXX"
```

### No MongoDB:
```javascript
// Collection: payments
{
  paymentId: "PAY-1729XXX-XXX",
  status: "completed",
  amount: 5500,
  currency: "BRL",
  transactionId: "123456789",
  // ...
}

// Collection: subscriptions
{
  companyId: ObjectId("..."),
  status: "active",
  planType: "premium",
  endDate: Date("2026-10-20"),
  // ...
}
```

### No Mercado Pago:
- Acesse: https://www.mercadopago.com.br/activities
- Veja os pagamentos realizados

---

## 🆘 Problemas Comuns

### "Access token inválido"
- ❌ Você não configurou as variáveis de ambiente
- ✅ Configure o `.env.local` com suas credenciais

### "Webhook não está sendo chamado"
- ❌ URL não está acessível
- ✅ Use ngrok para expor localhost

### "Erro ao redirecionar para Mercado Pago"
- ❌ `NEXT_PUBLIC_API_URL` não está configurada
- ✅ Configure no `.env.local`

### "Pagamento não atualiza no banco"
- ❌ Webhook não está configurado
- ✅ Configure webhook no painel do Mercado Pago

---

## 📞 Próximos Passos

1. **Configurar credenciais do Mercado Pago** ⭐ PRIORITÁRIO
2. **Testar localmente com cartões de teste**
3. **Configurar webhook para desenvolvimento**
4. **Testar fluxo completo**
5. **Preparar para produção**

---

## 📚 Documentação Adicional

- 📖 **MERCADOPAGO_SETUP.md** - Guia completo de configuração
- 🌐 **Documentação Oficial:** https://www.mercadopago.com.br/developers/pt/docs
- 💬 **Suporte:** https://www.mercadopago.com.br/developers/pt/support

---

**Status:** ✅ Implementação 100% completa!
**Aguardando:** 🔑 Configuração das credenciais do Mercado Pago

---

*Última atualização: 20/10/2025*

