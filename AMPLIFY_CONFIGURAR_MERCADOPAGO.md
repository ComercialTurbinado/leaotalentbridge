# 🔧 Configurar Mercado Pago no AWS Amplify

## ⚠️ Problema Identificado

O sistema está retornando erro 500 porque `MERCADOPAGO_ACCESS_TOKEN` não está configurado no AWS Amplify.

## 📋 Como Configurar

### Opção 1: Via Console do AWS Amplify (Recomendado)

1. Acesse o **AWS Amplify Console**: https://console.aws.amazon.com/amplify
2. Selecione seu app **leao-careers** (ou o nome do seu app)
3. No menu lateral, clique em **"App settings"** > **"Environment variables"**
4. Clique em **"Manage variables"**
5. Adicione a nova variável:
   - **Key:** `MERCADOPAGO_ACCESS_TOKEN`
   - **Value:** `APP_USR-xxxxxxxxxxxxxxxxxxxxxxxx` (seu token de produção do Mercado Pago)
6. Clique em **"Save"**
7. O Amplify fará um novo deploy automaticamente

### Opção 2: Via Arquivo amplify.yml

Você pode adicionar a variável diretamente no arquivo `amplify.yml`:

```yaml
environment:
  variables:
    MERCADOPAGO_ACCESS_TOKEN: APP_USR-xxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **ATENÇÃO:** Se fizer isso, **NÃO commite** o arquivo com o token real no Git! Use apenas para referência local.

### Opção 3: Via AWS CLI

```bash
aws amplify update-app --app-id <seu-app-id> \
  --environment-variables MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔑 Obter o Token do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Faça login
3. Selecione sua aplicação
4. Vá em **"Credenciais de produção"**
5. Copie o **Access Token** (começa com `APP_USR-`)

## ✅ Verificar Configuração

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
  },
  "message": "Configuração OK"
}
```

## 📝 Variáveis de Ambiente Atuais no Amplify

Baseado no `amplify.yml`, você já tem configurado:
- ✅ `MONGODB_URI`
- ✅ `NODE_ENV=production`
- ✅ `NEXTAUTH_URL`
- ✅ `NEXT_PUBLIC_API_URL`
- ✅ `JWT_SECRET`
- ✅ `JWT_EXPIRES_IN`
- ✅ `NEXTAUTH_SECRET`
- ❌ `MERCADOPAGO_ACCESS_TOKEN` ← **FALTA ESTA!**

## ⚠️ Importante

- O token de produção começa com `APP_USR-`
- O token de teste começa com `TEST-`
- Como `NODE_ENV=production`, o sistema usa `MERCADOPAGO_ACCESS_TOKEN`
- Após adicionar a variável, o Amplify fará um novo deploy automaticamente
- Aguarde o deploy terminar antes de testar

## 🚀 Próximos Passos

1. Adicione `MERCADOPAGO_ACCESS_TOKEN` no console do Amplify
2. Aguarde o deploy terminar
3. Verifique em: `https://uaecareers.com/api/payments/check-config`
4. Teste o fluxo de pagamento

