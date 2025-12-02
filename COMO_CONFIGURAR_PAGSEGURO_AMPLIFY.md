# 🔧 Como Configurar PagSeguro no AWS Amplify - Passo a Passo

## ⚠️ ERRO ATUAL

Você está recebendo: `PagSeguro não configurado. Configure PAGSEGURO_EMAIL e PAGSEGURO_TOKEN no servidor.`

## ✅ SOLUÇÃO - Passo a Passo

### 1. Obter Credenciais do PagSeguro

1. Acesse: https://pagseguro.uol.com.br/
2. Faça login na sua conta PagSeguro
3. No menu lateral, clique em **"Vendas Online"**
4. Clique em **"Integrações"**
5. Na seção **"Utilização de APIs"**, clique em **"Gerar Token"**
6. **Copie o Token de Segurança** gerado (guarde com cuidado!)
7. Anote o **Email** da sua conta PagSeguro

### 2. Configurar no AWS Amplify

1. **Acesse o AWS Amplify Console:**
   - Vá para: https://console.aws.amazon.com/amplify
   - Faça login na sua conta AWS

2. **Selecione seu App:**
   - Encontre e clique no app **leao-careers** (ou o nome do seu app)

3. **Acesse as Variáveis de Ambiente:**
   - No menu lateral esquerdo, clique em **"App settings"**
   - Clique em **"Environment variables"**

4. **Adicionar Variáveis:**
   - Clique no botão **"Manage variables"** ou **"Add variable"**
   
   **Variável 1:**
   - **Key:** `PAGSEGURO_EMAIL`
   - **Value:** Cole o email da sua conta PagSeguro
   - Clique em **"Add"** ou **"Save"**

   **Variável 2:**
   - **Key:** `PAGSEGURO_TOKEN`
   - **Value:** Cole o Token de Segurança que você copiou
   - Clique em **"Add"** ou **"Save"**

   **Variável 3 (Opcional - para testes):**
   - **Key:** `PAGSEGURO_ENV`
   - **Value:** `sandbox` (para testes) ou `production` (para produção)
   - Se não configurar, usa `production` por padrão

5. **Salvar:**
   - Clique em **"Save"** no final da página
   - O Amplify iniciará um novo deploy automaticamente

### 3. Aguardar Deploy

- O deploy pode levar alguns minutos
- Você pode acompanhar o progresso na aba **"Deployments"**
- Aguarde até que o status mostre **"Deploy succeeded"**

### 4. Verificar se Funcionou

Após o deploy, teste novamente o pagamento. O erro não deve mais aparecer.

## 🔍 Como Verificar se Está Configurado

Você pode verificar se as variáveis estão configuradas acessando:
```
https://uaecareers.com/api/debug-env
```

Deve mostrar:
```json
{
  "PAGSEGURO_EMAIL_EXISTS": true,
  "PAGSEGURO_TOKEN_EXISTS": true
}
```

## ⚠️ IMPORTANTE

- **NUNCA** compartilhe suas credenciais
- **NUNCA** commite credenciais no Git
- O Token de Segurança é sensível - guarde com cuidado
- Se gerar um novo token, o anterior será invalidado
- Após configurar, sempre aguarde o deploy terminar antes de testar

## 🆘 Ainda com Erro?

Se ainda der erro após configurar:

1. Verifique se copiou o token completo (sem espaços antes/depois)
2. Verifique se o email está correto
3. Verifique se o deploy terminou completamente
4. Aguarde alguns minutos e tente novamente
5. Verifique os logs do Amplify para ver se há outros erros

## 📝 Nota

O sistema foi migrado de Mercado Pago para PagSeguro. Certifique-se de que está usando as credenciais corretas do PagSeguro, não do Mercado Pago.

