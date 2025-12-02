# 🔄 Fluxo Completo: Botão "FINALIZAR PAGAMENTO SEGURO"

## 📋 O que acontece quando o usuário clica no botão

### 1. **Frontend - Validação Inicial** (`handlePayment`)
   - ✅ Verifica se o usuário está autenticado (token no localStorage)
   - ✅ Se não autenticado, valida se email e nome foram preenchidos
   - ✅ Calcula o valor total do plano selecionado
   - ✅ Prepara o objeto de requisição com:
     - `planId`, `planName`, `amount`, `installments`
     - `paymentMethod` (credit ou pix)
     - `userType` (candidato ou empresa)
     - `userEmail` e `userName` (se não autenticado)

### 2. **Frontend - Envio da Requisição**
   ```javascript
   POST /api/payments/create-preference
   Headers: {
     'Content-Type': 'application/json',
     'Authorization': 'Bearer {token}' // se autenticado
   }
   Body: {
     planId: "anual-vista",
     planName: "Anual à Vista",
     amount: 5500,
     installments: 1,
     paymentMethod: "credit",
     userType: "candidato",
     userEmail: "usuario@email.com",
     userName: "Nome do Usuário"
   }
   ```

### 3. **Backend - Recepção e Validação** (`POST /api/payments/create-preference`)
   - ✅ Faz parse do JSON recebido
   - ✅ Verifica autenticação (se token fornecido)
   - ✅ Valida dados obrigatórios (email, nome se não autenticado)
   - ✅ Conecta ao banco de dados MongoDB

### 4. **Backend - Criação do Registro de Pagamento**
   ```javascript
   Payment.create({
     companyId: ObjectId (temporário se não autenticado),
     userId: ObjectId (se autenticado),
     guestEmail: "usuario@email.com" (se não autenticado),
     guestName: "Nome do Usuário" (se não autenticado),
     type: "subscription",
     purpose: "Assinatura - Anual à Vista",
     amount: 5500,
     currency: "BRL",
     status: "pending",
     paymentMethod: {
       type: "credit_card",
       provider: "mercadopago",
       providerId: "pending"
     },
     gateway: "mercadopago",
     metadata: { ... }
   })
   ```
   - ✅ Gera `paymentId` único automaticamente (ex: `PAY-1234567890-ABC123`)

### 5. **Backend - Criação da Preferência no Mercado Pago**
   ```javascript
   createPaymentPreference({
     userId: payment.paymentId, // Usado como external_reference
     userEmail: "usuario@email.com",
     userName: "Nome do Usuário",
     planId: "anual-vista",
     planName: "Anual à Vista",
     amount: 5500,
     installments: 1,
     paymentMethods: { ... },
     metadata: { ... }
   })
   ```
   - ✅ Usa o token do Mercado Pago configurado
   - ✅ Cria preferência de pagamento no Mercado Pago
   - ✅ Retorna `initPoint` e `sandboxInitPoint` (URLs do checkout)

### 6. **Backend - Atualização do Pagamento**
   - ✅ Atualiza o registro de pagamento com `preferenceId` do Mercado Pago
   - ✅ Salva no banco de dados

### 7. **Backend - Resposta para o Frontend**
   ```json
   {
     "success": true,
     "data": {
       "paymentId": "PAY-1234567890-ABC123",
       "preferenceId": "1234567890-abc123-def456",
       "initPoint": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
       "sandboxInitPoint": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
     }
   }
   ```

### 8. **Frontend - Redirecionamento**
   - ✅ Recebe a resposta com sucesso
   - ✅ Extrai a URL do checkout (`sandboxInitPoint` ou `initPoint`)
   - ✅ Redireciona o usuário para o checkout do Mercado Pago:
     ```javascript
     window.location.href = checkoutUrl
     ```

### 9. **Mercado Pago - Checkout**
   - ✅ Usuário preenche dados do cartão/PIX no site do Mercado Pago
   - ✅ Mercado Pago processa o pagamento
   - ✅ Mercado Pago envia webhook para `/api/payments/webhook`

### 10. **Webhook - Processamento Automático**
   - ✅ Recebe notificação do Mercado Pago
   - ✅ Busca pagamento usando `external_reference` (que contém o `paymentId`)
   - ✅ Atualiza status do pagamento
   - ✅ Se aprovado:
     - Cria conta automaticamente (se não autenticado)
     - Cria/atualiza assinatura ativa por 12 meses
   - ✅ Usuário recebe acesso imediato

### 11. **Retorno do Usuário**
   - ✅ Usuário é redirecionado de volta para:
     - Sucesso: `/candidato/pagamento/sucesso`
     - Erro: `/candidato/pagamento/erro`
     - Pendente: `/candidato/pagamento/pendente`

## ⚠️ Possíveis Erros

1. **Erro 405 (Method Not Allowed)**
   - Rota não encontrada ou método HTTP incorreto
   - Verificar se a rota está sendo buildada corretamente

2. **Erro 500 (Internal Server Error)**
   - Erro ao conectar ao MongoDB
   - Erro ao criar preferência no Mercado Pago
   - Credenciais do Mercado Pago inválidas

3. **Erro de Validação**
   - Email ou nome não preenchidos
   - Dados inválidos no request body

## 🔍 Logs Disponíveis

Com as melhorias implementadas, agora temos logs em:
- **Frontend**: Console do navegador mostra requisição e resposta
- **Backend**: Logs do servidor mostram cada etapa do processamento

## 📝 Nota Importante

O usuário **NÃO precisa preencher dados do cartão** na nossa aplicação. Isso é feito no checkout do Mercado Pago após o redirecionamento.

