# 🔧 Configuração do PagSeguro - Checkout Transparente (API Moderna)

## ✅ Credenciais Necessárias

Para usar o **Checkout Transparente** com **API moderna**, você precisa de:

1. **PAGSEGURO_API_KEY** - Sua API Key (obtida em "Config & Keys" no painel PagSeguro)
2. **PAGSEGURO_SECRET_KEY** - Sua Secret Key (obtida em "Config & Keys" no painel PagSeguro)

## 📍 Onde Encontrar

1. Acesse: https://pagseguro.uol.com.br/
2. Faça login
3. No menu lateral, clique em **"Config & keys"**
4. Na aba **"Test"** ou **"Live"**, você verá:
   - **API key**: Copie este valor
   - **Secret key**: Clique em "Reveal secret key" e copie

## ⚙️ Configuração no AWS Amplify

1. Acesse o painel do AWS Amplify
2. Vá em **App settings** > **Environment variables**
3. Adicione as seguintes variáveis:

```
PAGSEGURO_API_KEY=sua-api-key-aqui
PAGSEGURO_SECRET_KEY=sua-secret-key-aqui
PAGSEGURO_ENV=production  # ou 'sandbox' para testes
```

## 🎯 Como Funciona

### PIX
- Cria um pedido (order) no PagSeguro
- Retorna um **QR Code** para o usuário escanear
- O pagamento é confirmado via webhook

### Cartão de Crédito
- Cria um pedido (order) no PagSeguro
- Retorna um **orderId** para processar o cartão no frontend
- O cartão será capturado em uma etapa separada (a implementar)

## 🔐 Autenticação

A API usa **Basic Authentication** com:
- Username: `PAGSEGURO_API_KEY`
- Password: `PAGSEGURO_SECRET_KEY`

## 📝 Notas Importantes

- ✅ Usa API moderna do PagSeguro (`api.pagseguro.com`)
- ✅ Suporta PIX e Cartão de Crédito
- ✅ Checkout Transparente (cliente não sai do site)
- ⚠️ Para PIX, ainda precisa implementar a exibição do QR Code
- ⚠️ Para Cartão, ainda precisa implementar a captura do cartão no frontend

## 🧪 Ambiente de Testes

Para testar, configure:
```
PAGSEGURO_ENV=sandbox
```

E use as credenciais da aba **"Test"** no painel PagSeguro.
