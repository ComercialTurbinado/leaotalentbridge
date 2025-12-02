# 💳 Fluxo Completo de Pagamento - Mercado Pago

## 🔄 Como Funciona o Pagamento

### 1. **Usuário Inicia Pagamento**
- Acessa `/candidato/pagamento` ou `/empresa/pagamento`
- Seleciona plano e método de pagamento
- Preenche dados (se não autenticado)

### 2. **Sistema Cria Preferência no Mercado Pago**
- **Endpoint:** `POST /api/payments/create-preference`
- **O que acontece:**
  1. Cria registro de pagamento no banco (status: `pending`)
  2. Cria preferência no Mercado Pago usando o `paymentId` como `external_reference`
  3. Retorna URL do checkout (`init_point` ou `sandbox_init_point`)

### 3. **Usuário é Redirecionado para Mercado Pago**
- Abre checkout do Mercado Pago em nova aba
- Usuário preenche dados do cartão/PIX
- Mercado Pago processa o pagamento

### 4. **Mercado Pago Envia Webhook**
- **Endpoint:** `POST /api/payments/webhook`
- **Quando:** Imediatamente após pagamento (aprovado, pendente ou rejeitado)
- **O que acontece:**
  1. Mercado Pago envia notificação com `payment_id`
  2. Sistema busca pagamento no banco usando `external_reference` (que contém o `paymentId`)
  3. Atualiza status do pagamento
  4. Se aprovado:
     - Cria conta automaticamente (se não existir)
     - Cria/atualiza assinatura ativa por 12 meses
     - Usuário recebe acesso imediato

### 5. **Usuário Retorna para o Site**
- **Sucesso:** `/candidato/pagamento/sucesso` ou `/empresa/pagamento/sucesso`
- **Erro:** `/candidato/pagamento/erro` ou `/empresa/pagamento/erro`
- **Pendente:** `/candidato/pagamento/pendente` ou `/empresa/pagamento/pendente`

## ⚠️ Importante

- **Webhook é ASSÍNCRONO:** O usuário pode retornar antes do webhook processar
- **Sistema verifica status:** Se webhook ainda não processou, sistema pode verificar status diretamente no Mercado Pago
- **Acesso liberado automaticamente:** Quando webhook processa pagamento aprovado, usuário já tem acesso

## 🔧 Variáveis de Ambiente Necessárias

```env
# Produção
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxx

# Teste (desenvolvimento)
MERCADOPAGO_TEST_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxx

# URL da API (para webhook)
NEXT_PUBLIC_API_URL=https://uaecareers.com/api
```

## 📝 Nota sobre PagSeguro

O sistema usa **Mercado Pago**, não PagSeguro. O fluxo é similar:
- Usuário paga no Mercado Pago
- Mercado Pago envia webhook
- Sistema processa e libera acesso

