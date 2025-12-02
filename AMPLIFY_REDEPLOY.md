# 🔄 Forçar Redeploy no AWS Amplify

## ⚠️ Problema

Você adicionou a variável `MERCADOPAGO_ACCESS_TOKEN` no console do Amplify, mas ela ainda não está sendo detectada. Isso acontece porque **variáveis de ambiente só são aplicadas após um novo deploy**.

## ✅ Solução: Forçar Redeploy

### Opção 1: Via Console do Amplify (Recomendado)

1. Acesse: https://console.aws.amazon.com/amplify
2. Selecione seu app **leao-careers**
3. No menu lateral, clique em **"Deployments"** ou **"Deploys"**
4. Clique no botão **"Redeploy this version"** ou **"Redeploy"**
5. Aguarde o deploy terminar (pode levar alguns minutos)

### Opção 2: Fazer um Commit Vazio

1. No terminal, execute:
   ```bash
   git commit --allow-empty -m "trigger: forçar redeploy para aplicar variáveis de ambiente"
   git push origin main
   ```
2. O Amplify detectará o commit e fará um novo deploy automaticamente

### Opção 3: Editar e Salvar uma Variável

1. No console do Amplify, vá em **"App settings"** > **"Environment variables"**
2. Edite a variável `MERCADOPAGO_ACCESS_TOKEN`
3. Adicione um espaço no final e remova (ou não, tanto faz)
4. Clique em **"Save"**
5. Isso deve triggerar um novo deploy

## 🔍 Verificar Após Deploy

Após o deploy terminar, verifique:

1. **Endpoint de verificação:**
   ```
   https://uaecareers.com/api/payments/check-config
   ```
   Deve retornar `"tokenConfigured": true`

2. **Endpoint de debug (mostra todas as variáveis):**
   ```
   https://uaecareers.com/api/debug-env
   ```
   Deve mostrar `MERCADOPAGO_ACCESS_TOKEN_EXISTS: true`

## ⏱️ Tempo de Deploy

- Build: ~5-10 minutos
- Deploy: ~2-5 minutos
- **Total: ~7-15 minutos**

## 📝 Nota Importante

No AWS Amplify, variáveis de ambiente configuradas via console são aplicadas apenas em **novos deploys**. Se você adicionou a variável mas não fez deploy, ela não estará disponível.

## ✅ Checklist

- [ ] Variável `MERCADOPAGO_ACCESS_TOKEN` adicionada no console
- [ ] Redeploy iniciado
- [ ] Deploy concluído
- [ ] Verificação em `/api/payments/check-config` retorna `tokenConfigured: true`
- [ ] Teste de pagamento funcionando

