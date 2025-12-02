# 🚀 Quick Start - Mercado Pago

## ⚡ 5 Passos para Ativar os Pagamentos

### 1️⃣ Obter Credenciais (5 minutos)
```
1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Faça login
3. Copie o "Access Token de teste"
```

### 2️⃣ Configurar .env.local (1 minuto)
```bash
# Criar arquivo
cp env.example .env.local

# Adicionar suas credenciais
MERCADOPAGO_ACCESS_TOKEN=TEST-seu-token-aqui
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3️⃣ Reiniciar Aplicação (30 segundos)
```bash
npm run dev
```

### 4️⃣ Testar Pagamento (2 minutos)
```
1. Acesse: http://localhost:3000/candidato/pagamento
2. Selecione um plano
3. Clique em "Finalizar Pagamento"
4. Use cartão de teste:
   Número: 5031 4332 1540 6351
   CVV: 123
   Validade: 11/25
   Nome: APRO
```

### 5️⃣ Configurar Webhook (3 minutos)
```bash
# Terminal 1 - Aplicação
npm run dev

# Terminal 2 - Expor localhost
npx ngrok http 3000

# Copie a URL (ex: https://abc123.ngrok.io)
# Cole em: https://www.mercadopago.com.br/developers/panel/webhooks
# URL: https://abc123.ngrok.io/api/payments/webhook
```

---

## ✅ Pronto!

Seu sistema de pagamentos está funcionando!

**Documentação completa:** Veja `PAGAMENTO_RESUMO.md`

---

## 🎯 Cartões de Teste Rápido

| Resultado | Nome | Número |
|-----------|------|--------|
| ✅ Aprovado | APRO | 5031 4332 1540 6351 |
| ❌ Recusado | OTHE | 5031 4332 1540 6351 |
| ⏳ Pendente | CONT | 5031 4332 1540 6351 |

**CVV:** 123  
**Validade:** 11/25  
**CPF:** 12345678909

---

## 🔍 Como Verificar se Funcionou

### No terminal você verá:
```
✅ Webhook recebido do Mercado Pago
✅ Pagamento PAY-XXX atualizado
✅ Assinatura criada para usuário
```

### Na aplicação:
- Usuário é redirecionado para `/candidato/pagamento/sucesso`
- Dashboard mostra acesso premium liberado

---

## ⚠️ Importante

- 🔸 Isso é ambiente de TESTE
- 🔸 Para produção, use credenciais de produção
- 🔸 Veja `MERCADOPAGO_SETUP.md` para detalhes

---

**Tempo total: ~10 minutos** ⏱️

