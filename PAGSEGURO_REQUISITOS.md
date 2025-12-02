# 📋 Requisitos para Pagamento Cartão e PIX no PagSeguro

## 🔑 Credenciais Necessárias

### Para Checkout Padrão (API v2 - o que estamos usando):

**O que você precisa:**
1. **Email da conta PagSeguro** - O email usado para fazer login
2. **Token de Segurança** - Gerado no painel em "Vendas Online" > "Integrações" > "Gerar Token"

**NÃO funciona com:**
- ❌ API KEY e SECRET KEY (essas são para outras APIs, como API Pix moderna)
- ❌ Basic Authentication

**Como obter:**
1. Acesse: https://pagseguro.uol.com.br/
2. Faça login
3. Vá em **"Vendas Online"** > **"Integrações"**
4. Na seção **"Utilização de APIs"**, clique em **"Gerar Token"**
5. Copie o **Token de Segurança** gerado
6. Anote o **Email** da sua conta

### Para Checkout Transparente (API moderna):

**O que você precisa:**
1. **API Key** - Do painel "Config & Keys"
2. **Secret Key** - Do painel "Config & Keys"
3. **App ID** e **App Key** (para algumas funcionalidades)

**Isso é diferente do Checkout Padrão!**

## 🎯 Qual Método Usar?

### Checkout Padrão (API v2) - O QUE ESTAMOS USANDO
- ✅ Mais simples de implementar
- ✅ Redireciona para o PagSeguro
- ✅ Funciona com **Email + Token**
- ✅ Suporta Cartão e PIX
- ❌ API KEY/SECRET KEY **NÃO FUNCIONAM** aqui

### Checkout Transparente (API moderna)
- ✅ Cliente não sai do seu site
- ✅ Mais complexo de implementar
- ✅ Usa **API KEY + SECRET KEY**
- ✅ Requer mais configuração

## ⚠️ PROBLEMA ATUAL

Você está usando **API KEY e SECRET KEY** (do painel "Config & Keys"), mas o código está tentando usar a **API v2 de Checkout Padrão**, que precisa de **Email + Token**.

**Solução:**
1. **Opção 1:** Obter Email + Token do PagSeguro e usar no código
2. **Opção 2:** Migrar para Checkout Transparente (mais complexo)

## 📝 O que o Código Atual Precisa

Para funcionar com Checkout Padrão (API v2):

```env
PAGSEGURO_EMAIL=seu-email@pagseguro.com.br
PAGSEGURO_TOKEN=seu-token-de-seguranca-gerado
```

**NÃO use:**
```env
PAGSEGURO_API_KEY=...  # Não funciona com API v2
PAGSEGURO_SECRET_KEY=...  # Não funciona com API v2
```

## 🔍 Como Verificar suas Credenciais

1. **API KEY/SECRET KEY** (do painel "Config & Keys"):
   - São para APIs modernas (Checkout Transparente, API Pix, etc.)
   - **NÃO funcionam** com `/v2/checkout`

2. **Email + Token** (do painel "Integrações"):
   - Funcionam com `/v2/checkout` (Checkout Padrão)
   - É o que precisamos para o código atual

## ✅ Próximos Passos

1. Acesse o PagSeguro
2. Vá em "Vendas Online" > "Integrações"
3. Gere um **Token de Segurança**
4. Use seu **Email** da conta
5. Configure no código (já está como fallback, mas precisa do email real)

