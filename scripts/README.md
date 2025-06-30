# Scripts de Seed - Leao Talent Bridge

Este diretório contém scripts para popular o banco de dados MongoDB com dados de exemplo para o sistema Leao Talent Bridge.

## 📋 Scripts Disponíveis

### 1. `seed-all.js` ⭐ **RECOMENDADO**
Script principal que popula todo o banco de dados em uma única execução.

```bash
node scripts/seed-all.js
```

**Dados criados:**
- ✅ 1 empresa (Tech Solutions Dubai)
- ✅ 1 usuário candidato (Carlos Silva Santos)
- ✅ 1 vaga de emprego (Senior Full Stack Developer)
- ✅ 1 simulação de entrevista (Técnica)
- ✅ 1 resposta de simulação
- ✅ 1 candidatura completa com screening

### 2. `seed-extended.js`
Script para dados básicos (User, Company, Job, Simulation, SimulationAnswer).

```bash
node scripts/seed-extended.js
```

### 3. `seed-advanced.js`
Script para dados avançados (Application, Payment, Notification, Analytics, Review).
**Requer que `seed-extended.js` seja executado primeiro.**

```bash
node scripts/seed-advanced.js
```

### 4. `seed-complete.js`
Script que executa `seed-extended.js` e `seed-advanced.js` em sequência.
**Nota:** Pode ter conflitos de modelo. Use `seed-all.js` em vez disso.

### 5. `verify-data.js`
Script para verificar se os dados foram criados corretamente.

```bash
node scripts/verify-data.js
```

## 🚀 Como Usar

### Opção 1: Seed Completo (Recomendado)
```bash
# Popular todo o banco de dados
node scripts/seed-all.js

# Verificar se os dados foram criados
node scripts/verify-data.js
```

### Opção 2: Seed por Partes
```bash
# 1. Dados básicos
node scripts/seed-extended.js

# 2. Dados avançados
node scripts/seed-advanced.js

# 3. Verificar
node scripts/verify-data.js
```

## 📊 Estrutura de Dados Criada

### 🏢 Empresa
- **Nome:** Tech Solutions Dubai
- **Email:** hr@techsolutions.ae
- **Indústria:** Technology
- **Status:** Active
- **Plano:** Premium
- **Localização:** Dubai, UAE

### 👤 Usuário Candidato
- **Nome:** Carlos Silva Santos
- **Email:** carlos.silva@email.com
- **Senha:** senha123
- **Tipo:** Candidato
- **Telefone:** +55 11 99999-1111

### 💼 Vaga de Emprego
- **Título:** Senior Full Stack Developer
- **Empresa:** Tech Solutions Dubai
- **Localização:** Dubai, UAE (Híbrido)
- **Salário:** 18,000 - 25,000 AED/mês
- **Status:** Active
- **Tecnologias:** React, Node.js, JavaScript, AWS, MongoDB

### 🎯 Simulação de Entrevista
- **Título:** Entrevista Técnica - Desenvolvedor Full Stack
- **Categoria:** Technical
- **Dificuldade:** Intermediate
- **Tempo Estimado:** 45 minutos
- **Perguntas:** Focadas em React e Node.js

### 📝 Candidatura
- **Status:** Qualified
- **Fonte:** Direct
- **Score de Screening:** 92/100
- **Documentos:** Currículo verificado
- **Expectativa Salarial:** 20,000 - 24,000 AED

## 🔧 Configuração

### Variáveis de Ambiente
O script usa a seguinte string de conexão por padrão:
```
MONGODB_URI=mongodb+srv://comercialturbinado:B3DfSzmasC0gDVdb@cluster0.vryeq.mongodb.net/
```

Para usar uma conexão diferente, defina a variável de ambiente:
```bash
export MONGODB_URI="sua-string-de-conexao"
node scripts/seed-all.js
```

### Dependências
Os scripts usam as seguintes dependências:
- `mongoose` - ODM para MongoDB
- `bcryptjs` - Hash de senhas

## ⚠️ Importante

1. **Limpeza de Dados:** Os scripts limpam as coleções existentes antes de inserir novos dados
2. **Senha Padrão:** Todos os usuários têm a senha `senha123`
3. **Dados de Exemplo:** Os dados são fictícios e destinados apenas para desenvolvimento/teste
4. **Conexão MongoDB:** Certifique-se de que a conexão com MongoDB está funcionando

## 🐛 Solução de Problemas

### Erro de Autorização
Se receber erro "not authorized", verifique:
- String de conexão MongoDB
- Permissões do usuário do banco
- Conectividade de rede

### Erro de Modelo Já Compilado
Se receber "Cannot overwrite model", use `seed-all.js` em vez dos scripts separados.

### Verificar Logs
Todos os scripts fornecem logs detalhados do progresso e erros.

## 📞 Suporte

Para problemas ou dúvidas sobre os scripts de seed, verifique:
1. Logs de erro detalhados
2. Conectividade com MongoDB
3. Versões das dependências
4. Configuração das variáveis de ambiente 