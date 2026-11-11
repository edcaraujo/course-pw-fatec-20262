# 📋 Folha de Cola de Prompts: Aula Prática SDD + ORM + Autenticação + Oficina P2

Use esta folha de referência rápida durante a aula para executar os prompts no **Google Antigravity** (tanto na demonstração integrada de **SDD + ORM + Auth** quanto na **Auditoria da Especificação da P2** dos grupos).

---

## 🔎 PARTE 1: Prompt para os Grupos Auditarem a Especificação da P2 (Apidog)

> **Como usar com os alunos:** Cada grupo (2 a 4 membros) exporta o arquivo `.Apidog.json` (ou OpenAPI `.json`) do seu projeto da P2 para a pasta de trabalho e executa o prompt abaixo para descobrir falhas antes de entregar o link no Teams!

### Prompt 0 — Auditoria da Entrega de 30% da P2 (`[Spec Auditor]`)
```text
Atuando como [Spec Auditor], inspecione o arquivo de especificação do Apidog do nosso projeto e avalie rigorosamente se ele cumpre os 5 critérios da entrega da P2 (peso 30%):

1. README / Documentação Inicial: Existe descrição clara do propósito da API e identificação da equipe (2 a 4 integrantes)?
2. Entidades e CRUD: Existem pelo menos 2 entidades de domínio com todas as 5 operações do CRUD (GET lista, POST criação, GET por id, PUT/PATCH atualização e DELETE remoção) e Status Codes semânticos?
3. Schemas Desacoplados (DRY): Os payloads de Request e Response estão referenciando componentes da seção Data Schemas ($ref) ou foram criados inline dentro das rotas?
4. Riqueza dos Schemas: Verifique atributo por atributo nos Data Schemas se possuem description, format (uuid, date-time, email, etc.), limites (minLength, maxLength, minimum, maximum), obrigatoriedade (required), enum, example e regras de Mock (@guid, @ctitle, etc.).

Gere uma tabela de diagnóstico com a nota estimada de 0 a 10 e uma lista exata do que precisamos corrigir no Apidog antes de gerar o link do Compartilhamento Rápido.
```

---

## 🏗️ PARTE 2: Construindo a API com ORM (Aula 09) e Auth JWT/RBAC (Aula 08) via SDD

> **Pré-condição:** Arquivos `STYLEGUIDE.md`, `AGENTS.md`, `SPEC.md` e `TakFlow API.Apidog.json` presentes na raiz do workspace.

### Prompt 1 — Planejamento Arquitetural (`[Tech Lead]`)
```text
Atuando como [Tech Lead], leia o @SPEC.md, o @"TakFlow API.Apidog.json" e nosso @STYLEGUIDE.md. Crie (ou atualize) o arquivo PLAN.md contendo um checklist sequencial e granular das tarefas técnicas necessárias para implementar a TaskFlow API v2 com SQLAlchemy 2.0 ORM e Autenticação JWT/RBAC.

Não escreva código Python ainda! Apenas detalhe as 6 fases:
- Fase 1: Estrutura de diretórios e requirements.txt
- Fase 2: Extração de schemas Pydantic v2 (Apidog + DTOs de Auth)
- Fase 3: Modelos ORM SQLAlchemy 2.0 (UserModel, ProjectModel, TaskModel com 1:N) e database.py com seed
- Fase 4: Exceções RFC 9457 (400, 401, 403, 404, 422) e security.py (JWT + RBAC)
- Fase 5: Routers (auth, tasks, projects com selectinload) e main.py
- Fase 6: Suíte completa de testes pytest (test_auth, test_tasks, test_projects, test_errors)
```

---

### Prompt 2 — Execução das Fases 1 e 2: Estrutura + Tipagens Pydantic v2 (`[Backend Coder]`)
```text
Atuando como [Backend Coder], execute a Fase 1 e a Fase 2 descritas no @PLAN.md (criação da estrutura de pastas, src/api/requirements.txt e extração completa dos modelos Pydantic v2 em src/api/schemas.py, incluindo os schemas do Apidog e os DTOs de autenticação LoginRequestDTO, UserResponse e TokenResponseDTO).

Siga estritamente o @STYLEGUIDE.md e o @SPEC.md. Marque os itens concluídos como [x] no @PLAN.md e pare para nossa revisão.
```

---

### Prompt 3 — Execução da Fase 3: Mapeamento ORM SQLAlchemy 2.0 + Seed (`[Backend Coder]`)
```text
Os contratos em schemas.py foram revisados e aprovados! Agora, atuando como [Backend Coder], execute a Fase 3 do @PLAN.md:
1. Implemente src/api/models.py usando SQLAlchemy 2.0 (Mapped, mapped_column, relationship, ForeignKey) para UserModel, ProjectModel e TaskModel.
2. Implemente src/api/database.py com a engine SQLite, get_db() e a função de seed inicial criando os usuários admin@fatec.sp.gov.br (ADMIN) e aluno@fatec.sp.gov.br (MEMBER), além do projeto e tarefas do contrato Apidog.

Marque a Fase 3 como [x] no @PLAN.md e aguarde nossa revisão.
```

---

### Prompt 4 — Execução da Fase 4: Segurança JWT/RBAC e Erros RFC 9457 (`[Backend Coder]`)
```text
Modelos ORM e banco revisados! Atuando como [Backend Coder], execute a Fase 4 do @PLAN.md:
1. Implemente src/api/exceptions.py garantindo respostas RFC 9457 (Problem Details) para 400, 401, 403, 404 e 422.
2. Implemente src/api/security.py com geração/validação de JWT (HS256) e as dependências FastAPI get_current_user (retornando 401 RFC 9457 se ausente/inválido) e require_roles (retornando 403 RFC 9457 se o papel do usuário não tiver permissão).

Atualize o @PLAN.md ao concluir e pare para revisão.
```

---

### Prompt 5 — Execução da Fase 5: Routers HTTP (`auth`, `tasks`, `projects`) e `main.py` (`[Backend Coder]`)
```text
Camada de segurança e exceções aprovadas! Atuando como [Backend Coder], execute a Fase 5 do @PLAN.md implementando:
1. src/api/routers/auth.py (POST /api/v1/auth/login e GET /api/v1/auth/me)
2. src/api/routers/tasks.py (integrado ao SQLAlchemy, exigindo autenticação no POST/PATCH e exigindo role ADMIN no DELETE /api/v1/tasks/{id})
3. src/api/routers/projects.py (usando selectinload(ProjectModel.tasks) no GET /api/v1/projects/{projectId}/tasks para prevenir queries N+1)
4. src/api/main.py (configurando lifespan para inicializar o banco e seed, CORS e middlewares).

Atualize os checkboxes da Fase 5 no @PLAN.md ao finalizar.
```

---

### Prompt 6 — Execução da Fase 6: Suíte de Testes de Contrato, ORM e RBAC (`[QA Engineer]`)
```text
Atuando como [QA Engineer], execute a Fase 6 do @PLAN.md:
1. Crie src/api/tests/conftest.py sobrescrevendo a dependência get_db para usar um banco SQLite isolado por teste e fornecendo fixtures com tokens JWT para ADMIN e MEMBER.
2. Crie test_auth.py, test_tasks.py, test_projects.py e test_errors.py testando todos os fluxos de login (200/401), proteção de rotas sem token (401), tentativa de DELETE por MEMBER (403 Forbidden RFC 9457), DELETE por ADMIN (204 No Content), relacionamento 1:N no ORM e casos do Apidog.
3. Execute o pytest no terminal para comprovar 100% de aprovação e marque todos os itens do @PLAN.md como concluídos!
```
