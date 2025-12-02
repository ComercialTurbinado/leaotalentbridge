# 🔑 Como Obter o Access Token do Mercado Pago

## ⚠️ PROBLEMA ATUAL

O erro "UNAUTHORIZED" acontece porque você está usando o **Secret Key** ao invés do **Access Token**.

## ✅ SOLUÇÃO RÁPIDA

### 1. Acesse o Painel do Mercado Pago
- Vá para: https://www.mercadopago.com.br/developers/panel/credentials
- Faça login

### 2. Selecione sua Aplicação
- Se não tiver, crie uma nova aplicação
- Escolha "Pagamentos online"

### 3. Obtenha o ACCESS TOKEN (NÃO o Secret Key!)

#### Para PRODUÇÃO (Live):
1. Clique na aba **"Live"** (não "Test")
2. Procure por **"Access Token"** (não "Secret Key")
3. O Access Token começa com `APP_USR-`
4. Copie esse token

#### Para TESTE (Sandbox):
1. Clique na aba **"Test"**
2. Procure por **"Access Token"**
3. O Access Token começa com `TEST-`
4. Copie esse token

### 4. Configure no AWS Amplify

1. Acesse: https://console.aws.amazon.com/amplify
2. Selecione seu app
3. Vá em **"App settings"** > **"Environment variables"**
4. Clique em **"Manage variables"**
5. Adicione:
   - **Key:** `MERCADOPAGO_ACCESS_TOKEN`
   - **Value:** Cole o Access Token que você copiou (começa com `APP_USR-` ou `TEST-`)
6. Clique em **"Save"**
7. O Amplify fará um novo deploy automaticamente

## 🔍 COMO IDENTIFICAR

### ✅ Access Token (CORRETO):
- Começa com `APP_USR-` (produção)
- Começa com `TEST-` (teste)
- É usado para criar preferências de pagamento

### ❌ Secret Key (ERRADO):
- Não começa com `APP_USR-` ou `TEST-`
- Geralmente é uma string de números e letras
- NÃO funciona para criar preferências

## 📝 EXEMPLO

```
✅ CORRETO: APP_USR-123456789-123456-abcdef123456789abcdef123456789-123456789
❌ ERRADO: 88b173f9a3e5414fbd805901cc86528a
```

## ✅ VERIFICAR SE FUNCIONOU

Após configurar e fazer deploy, acesse:
```
https://uaecareers.com/api/payments/check-config
```

Deve retornar:
```json
{
  "success": true,
  "config": {
    "tokenConfigured": true,
    "tokenType": "MERCADOPAGO_ACCESS_TOKEN"
  }
}
```

## 🆘 AINDA COM ERRO?

Se ainda der erro "UNAUTHORIZED":
1. Verifique se copiou o Access Token completo (é uma string longa)
2. Verifique se não tem espaços antes/depois do token
3. Verifique se está na aba correta (Live para produção, Test para teste)
4. Aguarde o deploy do Amplify terminar (pode levar alguns minutos)

