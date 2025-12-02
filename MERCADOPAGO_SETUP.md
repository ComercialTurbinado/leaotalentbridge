# 💳 Configuração do Mercado Pago

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Obter Credenciais](#obter-credenciais)
3. [Configurar Variáveis de Ambiente](#configurar-variáveis-de-ambiente)
4. [Configurar Webhook](#configurar-webhook)
5. [Testar Integração](#testar-integração)
6. [Deploy em Produção](#deploy-em-produção)

---

## 🎯 Pré-requisitos

- ✅ Conta no Mercado Pago (https://www.mercadopago.com.br)
- ✅ SDK do Mercado Pago instalado: `npm install mercadopago`
- ✅ Aplicação criada no painel de desenvolvedores

---

## 🔑 Obter Credenciais

### 1. Acessar o Painel de Desenvolvedores
- Acesse: https://www.mercadopago.com.br/developers/panel/credentials
- Faça login com sua conta Mercado Pago

### 2. Criar uma Aplicação
- Clique em "Criar aplicação"
- Escolha um nome (ex: "UAE Careers")
- Selecione "Pagamentos online e split de pagamento"

### 3. Obter Credenciais de Teste
- Acesse a aba "Credenciais de teste"
- Copie:
  - `Access Token` → `MERCADOPAGO_TEST_ACCESS_TOKEN`
  - `Public Key` → `MERCADOPAGO_TEST_PUBLIC_KEY`

### 4. Obter Credenciais de Produção
- Acesse a aba "Credenciais de produção"
- Complete o processo de ativação (se necessário)
- Copie:
  - `Access Token` → `MERCADOPAGO_ACCESS_TOKEN`
  - `Public Key` → `MERCADOPAGO_PUBLIC_KEY`

---

## ⚙️ Configurar Variáveis de Ambiente

### 1. Criar arquivo `.env.local`
```bash
cp env.example .env.local
```

### 2. Adicionar credenciais do Mercado Pago

```env
# Configurações de Pagamento - Mercado Pago
# Produção
MERCADOPAGO_ACCESS_TOKEN=APP_USR-123456789-123456-abcdef123456789abcdef123456789-123456789
MERCADOPAGO_PUBLIC_KEY=APP_USR-12345678-1234-1234-1234-123456789012

# Teste (Sandbox)
MERCADOPAGO_TEST_ACCESS_TOKEN=TEST-123456789-123456-abcdef123456789abcdef123456789-123456789
MERCADOPAGO_TEST_PUBLIC_KEY=TEST-12345678-1234-1234-1234-123456789012

# URL da API (importante para webhook e redirects)
NEXT_PUBLIC_API_URL=http://localhost:3000/api  # desenvolvimento
# NEXT_PUBLIC_API_URL=https://seu-dominio.com/api  # produção
```

### 3. Configurar para Teste ou Produção

**Para usar credenciais de teste (desenvolvimento):**
```typescript
// src/lib/services/mercadopago.ts
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_TEST_ACCESS_TOKEN || '',
  // ...
});
```

**Para usar credenciais de produção:**
```typescript
// src/lib/services/mercadopago.ts
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  // ...
});
```

---

## 🔔 Configurar Webhook

### 1. Expor URL Local (Desenvolvimento)

Para testar webhooks localmente, use **ngrok** ou **localtunnel**:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000

# URL será algo como: https://abc123.ngrok.io
```

### 2. Configurar Webhook no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/webhooks
2. Clique em "Criar notificação"
3. Escolha "Pagamentos"
4. Adicione a URL:
   - Desenvolvimento: `https://abc123.ngrok.io/api/payments/webhook`
   - Produção: `https://seu-dominio.com/api/payments/webhook`
5. Eventos para ouvir:
   - ✅ `payment.created`
   - ✅ `payment.updated`

### 3. Testar Webhook

Use a ferramenta de teste do Mercado Pago:
```bash
curl -X POST https://seu-dominio.com/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": "123456789"
    }
  }'
```

---

## 🧪 Testar Integração

### 1. Usuários de Teste

O Mercado Pago fornece usuários de teste. Para criar:

1. Acesse: https://www.mercadopago.com.br/developers/panel/test-users
2. Crie um comprador e um vendedor
3. Use as credenciais do comprador para testar pagamentos

### 2. Cartões de Teste

Use estes cartões para testar diferentes cenários:

**Cartão Aprovado:**
```
Número: 5031 4332 1540 6351
CVV: 123
Data: 11/25
Nome: APRO
```

**Cartão Recusado:**
```
Número: 5031 4332 1540 6351
CVV: 123
Data: 11/25
Nome: OTHE
```

**Outros cenários:**
- `APRO` - Pagamento aprovado
- `OTHE` - Recusado por erro geral
- `CONT` - Pendente
- `CALL` - Recusado, ligar para autorizar
- `FUND` - Recusado por saldo insuficiente
- `SECU` - Recusado por código de segurança
- `EXPI` - Recusado por data de expiração
- `FORM` - Recusado por erro no formulário

### 3. Fluxo de Teste Completo

```bash
# 1. Iniciar aplicação
npm run dev

# 2. Acessar página de pagamento
# http://localhost:3000/candidato/pagamento

# 3. Selecionar plano e método de pagamento

# 4. Clicar em "Finalizar Pagamento Seguro"
# → Será redirecionado para checkout do Mercado Pago

# 5. Usar cartão de teste para pagar

# 6. Após pagamento, será redirecionado para:
# - Sucesso: /candidato/pagamento/sucesso
# - Erro: /candidato/pagamento/erro
# - Pendente: /candidato/pagamento/pendente

# 7. Verificar webhook recebido nos logs:
# "Webhook recebido do Mercado Pago: ..."
```

---

## 🚀 Deploy em Produção

### 1. Checklist Pré-Deploy

- [ ] Alterar credenciais para produção no `.env`
- [ ] Configurar `NEXT_PUBLIC_API_URL` com domínio de produção
- [ ] Configurar webhook com URL de produção
- [ ] Ativar conta Mercado Pago (se necessário)
- [ ] Testar em ambiente de staging primeiro
- [ ] Configurar domínio com SSL/HTTPS

### 2. Variáveis de Ambiente no Servidor

**Vercel:**
```bash
vercel env add MERCADOPAGO_ACCESS_TOKEN production
vercel env add MERCADOPAGO_PUBLIC_KEY production
vercel env add NEXT_PUBLIC_API_URL production
```

**AWS Amplify:**
- Acesse console AWS Amplify
- Vá em "Environment variables"
- Adicione as variáveis

**Outras plataformas:**
- Adicione as variáveis no painel de configuração

### 3. Configurar Webhook de Produção

```bash
URL do Webhook: https://seu-dominio.com/api/payments/webhook
```

### 4. Monitoramento

Monitore pagamentos em:
- Painel Mercado Pago: https://www.mercadopago.com.br/activities
- Logs da aplicação
- Banco de dados (collection `payments`)

---

## 📊 Estrutura de Arquivos Criados

```
src/
├── lib/
│   └── services/
│       └── mercadopago.ts          # Serviço de integração
│
├── app/
│   ├── api/
│   │   └── payments/
│   │       ├── create-preference/
│   │       │   └── route.ts        # Criar preferência de pagamento
│   │       ├── webhook/
│   │       │   └── route.ts        # Receber notificações
│   │       └── status/
│   │           └── route.ts        # Verificar status
│   │
│   ├── candidato/
│   │   └── pagamento/
│   │       ├── page.tsx            # Página de checkout
│   │       ├── sucesso/
│   │       │   └── page.tsx
│   │       ├── erro/
│   │       │   └── page.tsx
│   │       └── pendente/
│   │           └── page.tsx
│   │
│   └── empresa/
│       └── pagamento/
│           ├── page.tsx            # Página de checkout
│           ├── sucesso/
│           │   └── page.tsx
│           ├── erro/
│           │   └── page.tsx
│           └── pendente/
│               └── page.tsx
```

---

## 🔍 APIs Criadas

### POST `/api/payments/create-preference`
Cria uma preferência de pagamento no Mercado Pago.

**Request:**
```json
{
  "planId": "anual-vista",
  "planName": "Plano Anual à Vista",
  "amount": 5500,
  "installments": 1,
  "paymentMethod": "credit",
  "userType": "candidato"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "PAY-123456789",
    "preferenceId": "123456789-abc123def456",
    "initPoint": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
  }
}
```

### POST `/api/payments/webhook`
Recebe notificações do Mercado Pago sobre mudanças no status de pagamentos.

### GET `/api/payments/status?paymentId=PAY-123456789`
Verifica o status atual de um pagamento.

---

## 💡 Dicas e Boas Práticas

1. **Segurança:**
   - Nunca exponha as credenciais no frontend
   - Use variáveis de ambiente
   - Valide assinatura do webhook (implementação futura)

2. **Testes:**
   - Sempre teste em ambiente de sandbox primeiro
   - Use cartões de teste fornecidos pelo Mercado Pago
   - Teste todos os cenários (aprovado, recusado, pendente)

3. **Monitoramento:**
   - Implemente logs detalhados
   - Configure alertas para pagamentos falhados
   - Monitore taxa de conversão

4. **UX:**
   - Mostre feedback claro durante processamento
   - Redirecione corretamente após pagamento
   - Envie emails de confirmação

---

## 🆘 Troubleshooting

### Erro: "Access token inválido"
- Verifique se copiou o token completo
- Confirme se está usando o token correto (teste vs produção)
- Verifique se o token não expirou

### Webhook não está sendo chamado
- Confirme URL do webhook no painel
- Verifique se a URL está acessível (use ngrok para local)
- Veja logs no painel do Mercado Pago

### Pagamento não atualiza no banco
- Verifique logs do webhook
- Confirme que o MongoDB está conectado
- Veja se `external_reference` está correto

### Redirecionamento não funciona
- Confirme `NEXT_PUBLIC_API_URL` está correto
- Verifique se as rotas de sucesso/erro existem
- Teste URLs manualmente

---

## 📞 Suporte

- **Documentação:** https://www.mercadopago.com.br/developers/pt/docs
- **Suporte:** https://www.mercadopago.com.br/developers/pt/support
- **SDKs:** https://www.mercadopago.com.br/developers/pt/docs/sdks-library/landing

---

## ✅ Checklist Final

- [ ] SDK instalado
- [ ] Credenciais configuradas
- [ ] Webhook configurado
- [ ] Testado com cartões de teste
- [ ] Páginas de retorno funcionando
- [ ] Banco de dados atualizando
- [ ] Assinaturas sendo criadas
- [ ] Emails sendo enviados (implementação futura)
- [ ] Deploy em produção realizado
- [ ] Monitoramento ativo

---

**Implementação concluída! 🎉**

Para qualquer dúvida, consulte a documentação oficial do Mercado Pago ou entre em contato com o suporte técnico.

