# Página de Gestão Individual do Candidato - Admin

## 📋 Funcionalidades Necessárias

### 1. **Visão Geral do Candidato**
- [ ] Informações pessoais completas
- [ ] Status atual (aprovado, pendente, etc.)
- [ ] Data de cadastro e última atividade
- [ ] Métricas de performance (candidaturas, entrevistas, etc.)

### 2. **Gestão de Documentos**
- [ ] **Documentos Enviados pelo Candidato**
  - Lista de documentos (CV, certificados, etc.)
  - Status de verificação (verificado, pendente, rejeitado)
  - Data de upload e verificação
  - Download dos documentos
  - Comentários do admin sobre cada documento

- [ ] **Documentos para Download pelo Candidato**
  - Upload de documentos pelo admin
  - Categorias (contratos, formulários, etc.)
  - Notificações para o candidato
  - Histórico de downloads

### 3. **Gestão de Entrevistas**
- [ ] **Entrevistas Realizadas**
  - Lista de entrevistas com empresas
  - Data, hora e duração
  - Empresa entrevistadora
  - Status (agendada, realizada, cancelada)
  - Feedback da empresa
  - Avaliação do candidato

- [ ] **Agendamento de Entrevistas**
  - Formulário para agendar nova entrevista
  - Seleção de empresa
  - Data e hora
  - Tipo de entrevista (presencial, online)
  - Notificações automáticas
  - Confirmação do candidato

### 4. **Conexão com Empresas**
- [ ] **Empresas Conectadas**
  - Lista de empresas que têm acesso ao perfil
  - Status da conexão (ativa, pendente, rejeitada)
  - Data da conexão
  - Permissões concedidas

- [ ] **Solicitar Conexão**
  - Formulário para conectar candidato a empresa
  - Seleção de empresa
  - Mensagem personalizada
  - Status da solicitação

### 5. **Conclusões e Feedback**
- [ ] **Avaliações do Candidato**
  - Feedback de entrevistas
  - Avaliações de empresas
  - Pontuações em diferentes critérios
  - Histórico de avaliações

- [ ] **Conclusões do Admin**
  - Comentários e observações
  - Recomendações
  - Status de aprovação/rejeição
  - Próximos passos

### 6. **Histórico e Timeline**
- [ ] **Timeline de Atividades**
  - Todas as ações realizadas
  - Datas e responsáveis
  - Status de cada ação
  - Comentários e observações

### 7. **Notificações e Comunicação**
- [ ] **Sistema de Notificações**
  - Notificar candidato sobre novos documentos
  - Notificar sobre entrevistas agendadas
  - Notificar empresas sobre candidatos
  - Histórico de notificações enviadas

## 🗂️ Estrutura de Dados Necessária

### Novos Modelos/Collections:
1. **CandidateDocuments** - Documentos do candidato
2. **AdminDocuments** - Documentos enviados pelo admin
3. **Interviews** - Entrevistas agendadas/realizadas
4. **CompanyConnections** - Conexões candidato-empresa
5. **CandidateEvaluations** - Avaliações e feedback
6. **CandidateTimeline** - Timeline de atividades

### Campos Adicionais nos Modelos Existentes:
1. **User** - Campos para gestão de candidatos
2. **Company** - Campos para conexões com candidatos

## 🎨 Interface e UX

### Layout da Página:
- **Header**: Informações básicas do candidato
- **Tabs/Sections**: 
  - Visão Geral
  - Documentos
  - Entrevistas
  - Conexões
  - Avaliações
  - Timeline
- **Sidebar**: Ações rápidas e estatísticas

### Componentes Necessários:
- DocumentUploader
- InterviewScheduler
- CompanyConnector
- TimelineViewer
- EvaluationForm
- NotificationCenter

## 🔧 APIs Necessárias

### Novas Rotas:
- `/api/admin/candidates/[id]/documents`
- `/api/admin/candidates/[id]/interviews`
- `/api/admin/candidates/[id]/connections`
- `/api/admin/candidates/[id]/evaluations`
- `/api/admin/candidates/[id]/timeline`
- `/api/admin/candidates/[id]/notifications`

## 📱 Responsividade
- Layout adaptativo para mobile
- Modais para ações rápidas
- Upload de arquivos otimizado
- Notificações em tempo real

## 🔒 Segurança
- Validação de permissões admin
- Upload seguro de arquivos
- Proteção de dados pessoais
- Logs de auditoria
