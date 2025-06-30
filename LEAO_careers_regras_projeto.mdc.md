
# 📘 Guia de Regras para Desenvolvimento da Plataforma Leao Talent Bridge

Este documento define diretrizes e boas práticas a serem seguidas durante o desenvolvimento da plataforma Leao Talent Bridge, com foco em consistência, clareza e alinhamento estratégico com os objetivos do projeto.

---

## 🔧 Estrutura do Projeto

- O projeto será desenvolvido em fases, começando pela **área administrativa (backoffice)**.
- A entrega de cada fase deve seguir a estrutura modular, escalável e com foco em usabilidade.
- Priorizar **organização lógica da informação** e **facilidade de manutenção** do código e das telas.

---

## ✏️ Design e UX/UI

- Seguir referências visuais modernas: **Indeed, Catho, RemoteJobsFinder, LinkedIn Recruiter**.
- Interface limpa, profissional, com foco em clareza e experiência fluida.
- Mobile-first: todos os componentes devem funcionar bem em dispositivos móveis.
- Tipografia recomendada: **Inter, Poppins ou Lato**.
- Paleta principal: **cinza claro, azul petróleo, branco**, com destaque em **verde/dourado discreto** para ações importantes.
- Evitar excesso de elementos decorativos. Clareza > estética exagerada.

---

## 🔒 Regras de Permissão e Acesso

- A área administrativa só pode ser acessada por usuários com permissão interna (cargos definidos: superadmin, analista, consultor).
- Candidatos e empresas só acessam suas áreas após **aprovação interna**.
- Logs devem ser registrados em toda movimentação crítica (cadastros, atualizações, encaminhamentos, contratos).

---

## 📥 Entradas Externas

- Candidatos e empresas preenchem apenas dados essenciais no primeiro momento.
- Nenhuma ação acontece sem aceite de termos e LGPD.
- Todo cadastro externo entra primeiro na área administrativa para triagem.

---

## 📊 Inteligência e Automação

- CVs devem passar por análise automatizada (IA) para sugerir compatibilidade com vagas futuras.
- Encaminhamentos e interesses devem gerar **notificações automáticas** ao admin.
- Relatórios devem ser exportáveis (PDF e CSV) com filtros por período, setor, status.

---

## 📁 Organização de Arquivos

- Utilizar estrutura modular de pastas (ex: /admin, /components, /services, /api).
- Nomeação de arquivos em inglês e em **kebab-case** (ex: candidate-profile.tsx).
- Separar lógica de interface da lógica de dados.

---

## 🤝 Comunicação e Alinhamento

- Todos os alinhamentos estratégicos devem ser feitos com **Paula e Andressa**, exclusivamente.
- Reuniões e decisões não devem envolver outros times ou lideranças externas sem alinhamento prévio.
- Preferência por comunicação assíncrona e organizada por fase/entrega.

---

## 🧪 Testes e Qualidade

- Cada módulo deverá ser validado internamente antes de liberar para uso real.
- Testes devem cobrir os principais fluxos: cadastro, aprovação, encaminhamento e contrato.
- Feedbacks dos usuários internos devem ser integrados nas melhorias contínuas.

---

Este documento pode ser atualizado a qualquer momento conforme evolução do projeto. Versão atual: **v1.0**

