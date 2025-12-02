# 🔍 Onde Encontrar as Credenciais Corretas do PagSeguro

## ⚠️ IMPORTANTE

As credenciais que você está vendo em **"Config & Keys"** (API KEY e SECRET KEY) **NÃO funcionam** com a API v2 de Checkout Padrão que estamos usando!

## ✅ Onde Encontrar as Credenciais Corretas

### Para API v2 Checkout Padrão (o que precisamos):

1. **Acesse o PagSeguro:**
   - https://pagseguro.uol.com.br/
   - Faça login

2. **Navegue até "Vendas Online":**
   - No menu lateral, procure por **"Vendas Online"** ou **"Venda Online"**
   - Pode estar em um menu diferente, dependendo da versão do painel

3. **Acesse "Integrações":**
   - Dentro de "Vendas Online", clique em **"Integrações"**
   - Ou procure por **"Integrações"** no menu

4. **Gere o Token de Segurança:**
   - Procure pela seção **"Utilização de APIs"**
   - Clique em **"Gerar Token"** ou **"Token de Segurança"**
   - Um token será gerado - **COPIE ELE** (você só verá uma vez!)

5. **Anote seu Email:**
   - Use o **email da sua conta PagSeguro** (o mesmo que você usa para fazer login)

## 📋 O que você precisa:

- ✅ **PAGSEGURO_EMAIL** = Email da sua conta PagSeguro
- ✅ **PAGSEGURO_TOKEN** = Token de Segurança gerado em "Integrações"

## ❌ O que NÃO usar:

- ❌ API KEY (de "Config & Keys")
- ❌ SECRET KEY (de "Config & Keys")

Essas são para outras APIs e não funcionam com `/v2/checkout`.

## 🔄 Se não encontrar "Vendas Online" > "Integrações"

Algumas versões do painel podem ter nomes diferentes:
- "Integrações" pode estar em "Configurações"
- "Token" pode estar em "API" ou "Desenvolvedores"
- Procure por "Token de Segurança" ou "Gerar Token"

## 📝 Alternativa: Verificar Documentação

Se não encontrar, acesse:
- https://dev.pagseguro.uol.com.br/
- Procure por "Checkout Padrão" ou "API v2"
- A documentação mostra exatamente onde encontrar as credenciais

