# Sistema de Notificações - Leão Talent Bridge

## Visão Geral

O sistema de notificações implementado oferece uma solução completa para comunicação com usuários através de múltiplos canais: notificações push no navegador, emails e configurações personalizáveis por usuário.

## Funcionalidades Implementadas

### 1. Modelos de Dados

#### NotificationPreferences
- Configurações personalizadas por usuário
- Controle de canais (email, push, SMS)
- Preferências por tipo de notificação
- Horário de silêncio
- Frequência de envio
- Dias da semana permitidos

#### Notification (Atualizado)
- Novos tipos de notificação
- Sistema de entrega multi-canal
- Rastreamento de status de envio
- Agendamento de notificações

### 2. Serviços

#### EmailService
- Templates HTML responsivos
- Suporte a diferentes tipos de notificação
- Configuração SMTP
- Conversão HTML para texto

#### PushNotificationService
- Integração com Web Push API
- Templates de notificação
- Validação de subscriptions
- Envio em lote

#### NotificationService (Atualizado)
- Lógica de entrega inteligente
- Respeito às preferências do usuário
- Processamento de notificações agendadas
- Criação de preferências padrão

### 3. APIs

#### `/api/notifications`
- GET: Listar notificações do usuário
- POST: Criar nova notificação

#### `/api/notifications/[id]/read`
- PUT: Marcar notificação como lida

#### `/api/notifications/read-all`
- PUT: Marcar todas como lidas

#### `/api/notifications/preferences`
- GET: Buscar preferências
- PUT: Atualizar preferências

#### `/api/notifications/push-subscription`
- POST: Registrar subscription
- DELETE: Remover subscription

#### `/api/notifications/vapid-keys`
- GET: Obter chaves VAPID públicas

#### `/api/notifications/process-scheduled`
- POST: Processar notificações agendadas (cron)

### 4. Componentes Frontend

#### NotificationCenter
- Lista de notificações em tempo real
- Indicadores visuais de prioridade
- Ações de leitura
- Design responsivo

#### NotificationPreferences
- Interface completa de configurações
- Controles por tipo de usuário
- Configuração de horário de silêncio
- Frequência de envio

#### usePushNotifications Hook
- Gerenciamento de subscriptions
- Solicitação de permissões
- Estado de inscrição
- Tratamento de erros

### 5. Service Worker

#### sw.js
- Gerenciamento de notificações push
- Cache de recursos
- Ações de notificação
- Navegação inteligente

## Configuração

### Variáveis de Ambiente

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@leao-careers.com

# Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@leao-careers.com

# Cron Jobs
CRON_SECRET=your-cron-secret-key
```

### Chaves VAPID

Para gerar chaves VAPID:

```bash
npx web-push generate-vapid-keys
```

### Cron Job

Configure um cron job para processar notificações agendadas:

```bash
# A cada 5 minutos
*/5 * * * * curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/notifications/process-scheduled
```

## Tipos de Notificação

### Para Candidatos
- `job_recommendation`: Novas vagas recomendadas
- `application_update`: Atualizações de candidaturas
- `interview_invitation`: Convites para entrevistas
- `interview_scheduled`: Lembretes de entrevistas
- `feedback_available`: Feedback disponível
- `document_status`: Status de documentos

### Para Empresas
- `new_application`: Novas candidaturas
- `interview_response`: Respostas de entrevistas
- `candidate_feedback`: Feedback de candidatos
- `job_expiry_reminders`: Lembretes de expiração

### Para Administradores
- `new_interviews`: Novas entrevistas para aprovação
- `feedback_pending`: Feedback pendente de moderação
- `system_alerts`: Alertas do sistema
- `user_reports`: Relatórios de usuários

## Integração nos Dashboards

### Dashboard do Candidato
```tsx
import NotificationCenter from '@/components/NotificationCenter';
import { usePushNotifications } from '@/hooks/usePushNotifications';

// No componente
const { isSupported, isSubscribed, subscribe } = usePushNotifications();

// No JSX
<NotificationCenter 
  userId="current-user" 
  maxNotifications={5}
  showUnreadOnly={false}
/>
```

### Dashboard da Empresa
```tsx
// Similar ao candidato, mas com preferências específicas
<NotificationCenter 
  userId="current-user" 
  maxNotifications={10}
  showUnreadOnly={true}
/>
```

### Dashboard do Admin
```tsx
// Configurações específicas para admin
<NotificationCenter 
  userId="current-user" 
  maxNotifications={20}
  showUnreadOnly={true}
/>
```

## Templates de Email

O sistema inclui templates responsivos para:

1. **Convite para Entrevista**
   - Design profissional
   - Informações da entrevista
   - Botão de ação

2. **Resposta de Entrevista**
   - Confirmação de aceitação/rejeição
   - Detalhes da entrevista

3. **Feedback Disponível**
   - Notificação de feedback liberado
   - Link para visualização

4. **Nova Candidatura**
   - Informações do candidato
   - Link para revisão

5. **Atualização de Status**
   - Status da candidatura
   - Próximos passos

## Notificações Push

### Templates Disponíveis
- Convite para entrevista com ações
- Resposta de entrevista
- Feedback disponível
- Nova candidatura
- Atualização de status
- Lembrete de entrevista
- Feedback pendente (admin)
- Alertas do sistema

### Funcionalidades
- Ícones personalizados
- Ações interativas
- Navegação inteligente
- Suporte a imagens
- Vibração personalizada

## Preferências do Usuário

### Configurações Gerais
- Ativar/desativar canais
- Frequência de envio
- Horário de silêncio
- Dias da semana

### Configurações Específicas
- Por tipo de notificação
- Por role do usuário
- Preferências padrão automáticas

## Monitoramento e Logs

### Status de Entrega
- Email: enviado, falhou, erro
- Push: enviado, falhou, erro
- SMS: enviado, falhou, erro

### Métricas
- Taxa de entrega
- Taxa de abertura
- Taxa de cliques
- Horários de maior engajamento

## Segurança

### Autenticação
- JWT para todas as APIs
- Verificação de permissões
- Rate limiting

### Privacidade
- Dados criptografados
- Consentimento explícito
- Opção de opt-out

## Performance

### Otimizações
- Índices de banco de dados
- Cache de preferências
- Processamento assíncrono
- Limpeza automática

### Escalabilidade
- Processamento em lote
- Queue de notificações
- Load balancing
- CDN para assets

## Testes

### Testes Unitários
- Serviços de notificação
- Templates de email
- Validação de dados

### Testes de Integração
- APIs de notificação
- Fluxo completo
- Push notifications

### Testes E2E
- Configuração de preferências
- Recebimento de notificações
- Ações de notificação

## Manutenção

### Limpeza Automática
- Notificações expiradas
- Subscriptions inválidas
- Logs antigos

### Monitoramento
- Health checks
- Alertas de falha
- Métricas de performance

## Roadmap

### Próximas Funcionalidades
- [ ] Notificações SMS
- [ ] Templates personalizáveis
- [ ] Analytics avançados
- [ ] A/B testing
- [ ] Integração com Slack/Teams
- [ ] Notificações in-app
- [ ] Chat em tempo real

### Melhorias
- [ ] Interface de administração
- [ ] Relatórios detalhados
- [ ] API de webhooks
- [ ] Suporte a múltiplos idiomas
- [ ] Notificações agendadas avançadas
