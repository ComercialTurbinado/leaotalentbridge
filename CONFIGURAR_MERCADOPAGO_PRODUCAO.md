# 🔧 Configurar Mercado Pago em Produção

## ⚠️ Problema Atual

O sistema está retornando erro 500 porque `MERCADOPAGO_ACCESS_TOKEN` não está configurado no servidor de produção.

## 📋 Passo a Passo

### 1. Obter Credenciais do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Faça login com sua conta Mercado Pago
3. Selecione sua aplicação (ou crie uma nova)
4. Acesse a aba **"Credenciais de produção"**
5. Copie o **Access Token** de produção

### 2. Configurar no Servidor

Você precisa adicionar a variável de ambiente `MERCADOPAGO_ACCESS_TOKEN` no seu servidor de produção.

#### Se estiver usando Vercel/Netlify/Amplify:

1. Acesse o painel do seu provedor
2. Vá em **Settings** > **Environment Variables**
3. Adicione:
   - **Name:** `MERCADOPAGO_ACCESS_TOKEN`
   - **Value:** `APP_USR-xxxxxxxxxxxxxxxxxxxxxxxx` (seu token de produção)
4. Salve e faça redeploy

#### Se estiver usando servidor próprio:

1. Edite o arquivo `.env` ou `.env.production` no servidor
2. Adicione:
   ```env
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Reinicie o servidor

### 3. Verificar Configuração

Após configurar, acesse:
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

### 4. Testar Pagamento

Após configurar, teste novamente o fluxo de pagamento.

## 🔑 Credenciais Necessárias

### Produção (obrigatório):
- `MERCADOPAGO_ACCESS_TOKEN` - Token de produção do Mercado Pago

### Teste (opcional, para desenvolvimento):
- `MERCADOPAGO_TEST_ACCESS_TOKEN` - Token de teste do Mercado Pago

## ⚠️ Importante

- **NUNCA** compartilhe suas credenciais
- **NUNCA** commite credenciais no Git
- Use sempre variáveis de ambiente
- O token de produção começa com `APP_USR-`
- O token de teste começa com `TEST-`

## 📝 Nota

O sistema está configurado para usar:
- **Produção:** `MERCADOPAGO_ACCESS_TOKEN` (quando `NODE_ENV=production`)
- **Teste:** `MERCADOPAGO_TEST_ACCESS_TOKEN` (quando `NODE_ENV=development`)

Como o servidor está em produção (`nodeEnv: "production"`), você precisa configurar `MERCADOPAGO_ACCESS_TOKEN`.

