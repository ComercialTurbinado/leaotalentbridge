# Configuração de URLs - UAE Careers

## 🌐 URL Oficial da Aplicação

**URL de Produção:** `https://uaecareers.com/`

## ⚠️ Importante

**NÃO usar localhost ou domínios genéricos para testes em produção.**

Todas as configurações devem apontar para a URL oficial: `https://uaecareers.com/`

## 📋 Configurações Necessárias

### Variáveis de Ambiente

```env
# URL da API (para frontend)
NEXT_PUBLIC_API_URL=https://uaecareers.com/api
```

### Mercado Pago - URLs de Retorno

As URLs de retorno configuradas no Mercado Pago devem ser:

**Sucesso:**
- Candidato: `https://uaecareers.com/candidato/pagamento/sucesso`
- Empresa: `https://uaecareers.com/empresa/pagamento/sucesso`

**Pendente:**
- Candidato: `https://uaecareers.com/candidato/pagamento/pendente`
- Empresa: `https://uaecareers.com/empresa/pagamento/pendente`

**Erro:**
- Candidato: `https://uaecareers.com/candidato/pagamento/erro`
- Empresa: `https://uaecareers.com/empresa/pagamento/erro`

**Webhook:**
- `https://uaecareers.com/api/payments/webhook`

## 🔧 Arquivos Configurados

### 1. `src/lib/services/mercadopago.ts`
- URLs de retorno configuradas dinamicamente baseadas em `NEXT_PUBLIC_API_URL`
- Fallback padrão: `https://uaecareers.com`

### 2. `env.example`
- Exemplo de configuração com URL oficial

## 🧪 Ambiente de Desenvolvimento

Para desenvolvimento local, você pode sobrescrever a variável:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Mas **sempre** use `https://uaecareers.com/` em produção.

## ✅ Checklist de Deploy

Antes de fazer deploy, verificar:

- [ ] `NEXT_PUBLIC_API_URL` configurada para `https://uaecareers.com/api`
- [ ] URLs de retorno no Mercado Pago apontam para `https://uaecareers.com`
- [ ] Webhook URL configurada no Mercado Pago: `https://uaecareers.com/api/payments/webhook`
- [ ] Nenhuma referência hardcoded a localhost em produção
- [ ] Testar fluxo completo com URLs de produção

## 📝 Notas

- A URL `https://uaecareers.com/` é a URL oficial e única da aplicação
- Todos os testes devem ser feitos com a URL oficial, não com localhost
- O sistema está configurado para usar a URL oficial por padrão

