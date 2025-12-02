# 🔧 Configurar PagSeguro

## ⚠️ IMPORTANTE

O sistema agora usa **PagSeguro** ao invés de Mercado Pago!

## 📋 Passo a Passo

### 1. Obter Credenciais do PagSeguro

1. Acesse: https://pagseguro.uol.com.br/
2. Faça login na sua conta PagSeguro
3. Vá em **"Vendas Online"** > **"Integrações"**
4. Na seção **"Utilização de APIs"**, clique em **"Gerar Token"**
5. Copie o **Token de Segurança** gerado
6. Anote também o **Email** da sua conta PagSeguro

### 2. Configurar no AWS Amplify

1. Acesse: https://console.aws.amazon.com/amplify
2. Selecione seu app
3. Vá em **"App settings"** > **"Environment variables"**
4. Clique em **"Manage variables"**
5. Adicione as seguintes variáveis:

   **Variável 1:**
   - **Key:** `PAGSEGURO_EMAIL`
   - **Value:** Seu email da conta PagSeguro (ex: `seu-email@exemplo.com`)

   **Variável 2:**
   - **Key:** `PAGSEGURO_TOKEN`
   - **Value:** O Token de Segurança que você copiou

   **Variável 3 (Opcional - para testes):**
   - **Key:** `PAGSEGURO_ENV`
   - **Value:** `sandbox` (para testes) ou `production` (para produção)
   - Se não configurar, usa `production` por padrão

6. Clique em **"Save"**
7. O Amplify fará um novo deploy automaticamente

### 3. Verificar Configuração

Após configurar e fazer deploy, acesse:
```
https://uaecareers.com/api/payments/check-config
```

Deve retornar que as credenciais estão configuradas.

### 4. Testar Pagamento

Após configurar, teste novamente o fluxo de pagamento.

## 🔑 Credenciais Necessárias

### Obrigatórias:
- `PAGSEGURO_EMAIL` - Email da sua conta PagSeguro
- `PAGSEGURO_TOKEN` - Token de Segurança gerado no painel

### Opcionais:
- `PAGSEGURO_ENV` - Ambiente: `sandbox` (teste) ou `production` (padrão)

## ⚠️ Importante

- **NUNCA** compartilhe suas credenciais
- **NUNCA** commite credenciais no Git
- Use sempre variáveis de ambiente
- O Token de Segurança é sensível - guarde com cuidado
- Se gerar um novo token, o anterior será invalidado

## 📝 Nota

O sistema foi migrado de Mercado Pago para PagSeguro. Todas as referências ao Mercado Pago foram substituídas por PagSeguro.

