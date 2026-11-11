# 🧪 Aula 11 — Laboratório Prático Integrado: SDD + ORM + Autenticação JWT & Oficina da P2
## Disciplina: Programação Web (2026.2) — Fatec Ribeirão Preto
### Aula 11: Da Especificação no Apidog (30% da P2) à Arquitetura Completa com SQLAlchemy 2.0 e RBAC no Google Antigravity

---

## 🎯 Objetivos da Aula Prática

Esta aula é 100% prática e conecta os quatro pilares centrais do 2º bimestre:
1. **API Design-First no Apidog (Aula 04 — Entrega de 30% da P2):** Revisar, refinar e auditar os contratos de API das equipes (2 a 4 membros) usando Agentes de IA como auditores de qualidade (`[Spec Auditor]`).
2. **Autenticação & Autorização Stateless (Aula 08):** Aplicar **JWT (`HS256`)** e **RBAC (`ADMIN` vs. `MEMBER`)** diretamente na Constituição e Especificação do projeto, exigindo retornos padronizados `401 Unauthorized` e `403 Forbidden` (RFC 9457).
3. **Mapeamento Objeto-Relacional — ORM (Aula 09):** Substituir o armazenamento em memória por **SQLAlchemy 2.0 (`Mapped`, `mapped_column`, `relationship`)** com banco SQLite, chave estrangeira `1:N` (`Project` ➔ `Tasks`) e prevenção de queries **N+1** com `selectinload`.
4. **Spec-Driven Development — SDD (Aula 10):** Demonstrar na prática que, no SDD, evoluir uma arquitetura (adicionando ORM e JWT) é feito governando `STYLEGUIDE.md`, `SPEC.md` e `PLAN.md` com as personas `[Tech Lead]`, `[Backend Coder]` e `[QA Engineer]`.

---

## ⏱️ Dinâmica e Cronograma da Aula (2h / 120 min)

| Bloco | Duração | Atividade Prática em Sala | Artefatos Utilizados |
| :--- | :---: | :--- | :--- |
| **Bloco 1** | `15 min` | **Alinhamento da Entrega da P2 (30%):** Explicação dos 5 critérios da tarefa no Teams (README com equipe de 2–4 membros, mínimo 2 entidades CRUD, Data Schemas separados, riqueza de atributos/Mocks e link do Compartilhamento Rápido). | Enunciado da Tarefa no Teams |
| **Bloco 2** | `45 min` | **Hands-on Guiado (SDD + ORM + Auth):** Execução ao vivo dos Prompts 1 a 6 construindo a **TaskFlow API v2** com SQLAlchemy 2.0 ORM, login JWT e proteção RBAC a partir dos templates da Aula 11. | [`src/sdd-template/`](src/sdd-template/) + [`PROMPTS_AULA.md`](src/sdd-template/PROMPTS_AULA.md) |
| **Bloco 3** | `45 min` | **Oficina Prática das Equipes (Foco P2):** Os grupos (2–4 alunos) finalizam seus Data Schemas no Apidog, exportam o `.Apidog.json` e rodam o **Prompt 0 (`[Spec Auditor]`)** no Antigravity para auditar a nota da especificação antes da entrega. | Projeto Apidog do Grupo + Prompt 0 |
| **Bloco 4** | `15 min` | **Desafio de Geração para o Projeto do Grupo:** Os grupos adaptam o `SPEC.md` para as 2 entidades do próprio tema e usam o `[Tech Lead]` e `[Backend Coder]` para gerar o `schemas.py` e `models.py` (SQLAlchemy) do projeto semestral deles! | Workspace do Grupo |

---

## 📂 Estrutura do Template SDD desta Aula (`src/sdd-template/`)

Todos os arquivos necessários para a prática já estão prontos em [`src/sdd-template/`](src/sdd-template/):

* **[`STYLEGUIDE.md`](src/sdd-template/STYLEGUIDE.md):** Constituição Técnica exigindo Python 3.12+, FastAPI, Pydantic v2, **SQLAlchemy 2.0 ORM** (`Mapped`, `relationship`, `selectinload`), **JWT/RBAC** (`PyJWT`, `HTTPBearer`) e **RFC 9457** (`400`, `401`, `403`, `404`, `422`).
* **[`AGENTS.md`](src/sdd-template/AGENTS.md):** Governança automática do Google Antigravity com **4 personas**:
  1. `[Spec Auditor]` *(Novo! Audita o `.Apidog.json` dos grupos segundo o barema da P2)*
  2. `[Tech Lead]` *(Planeja o `PLAN.md` sem escrever código)*
  3. `[Backend Coder]` *(Implementa lote a lote com ORM e JWT)*
  4. `[QA Engineer]` *(Valida contratos, persistência SQLite e RBAC com `pytest`)*
* **[`SPEC.md`](src/sdd-template/SPEC.md):** Especificação de negócio da **TaskFlow API v2**, unindo o contrato do Apidog com as tabelas `users`, `projects` e `tasks` (1:N) e a matriz RBAC (`POST`/`PATCH` autenticados, `DELETE` exclusivo para `ADMIN`).
* **[`PLAN.md`](src/sdd-template/PLAN.md):** Roteiro técnico dividido em **6 Fases** (Fundação, Schemas Pydantic v2, Modelos ORM SQLAlchemy 2.0 + Seed, Segurança JWT/RBAC + Exceções RFC 9457, Routers HTTP e Testes Automatizados).
* **[`PROMPTS_AULA.md`](src/sdd-template/PROMPTS_AULA.md):** Folha de cola com todos os prompts prontos para copiar e colar no Google Antigravity.
* **[`TakFlow API.Apidog.json`](src/sdd-template/TakFlow%20API.Apidog.json):** Contrato completo exportado do Apidog.

---

## 🚀 Parte 1: Roteiro Passo a Passo — Construindo a API com ORM e Auth via SDD

### Passo 1: Preparando o Ambiente no Google Antigravity
1. Abra o diretório [`11-pw-pratica-sdd-orm-e-autenticacao/src/sdd-template`](src/sdd-template/) como workspace no **Google Antigravity** (ou copie seu conteúdo para uma pasta limpa `taskflow-v2-live/`).
2. Mostre à turma as diferenças fundamentais no [`STYLEGUIDE.md`](src/sdd-template/STYLEGUIDE.md) e no [`SPEC.md`](src/sdd-template/SPEC.md) em relação à aula anterior:
   * Inclusão de `models.py` (SQLAlchemy 2.0) e `security.py` (JWT + RBAC).
   * Matriz de permissões na seção 4.2 do `SPEC.md` diferenciando `401 Unauthorized` (sem token/token inválido) de `403 Forbidden` (`MEMBER` tentando deletar uma tarefa que exige `ADMIN`).

---

### Passo 2: Planejamento Arquitetural com `[Tech Lead]` (Prompt 1)
Abra o chat do Google Antigravity e execute o **Prompt 1**:

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

> **💡 Ponto de Discussão com os Alunos:** Observe no `PLAN.md` como a ordem arquitetural evita retrabalho: primeiro nascem os contratos (`schemas.py`), depois o mapeamento relacional (`models.py` + `database.py`), em seguida os middlewares/dependências de segurança (`exceptions.py` + `security.py`) e só então os endpoints (`routers/`).

---

### Passo 3: Extração dos Schemas Pydantic v2 + DTOs de Auth (Prompt 2)
Execute o **Prompt 2** com a persona `[Backend Coder]`:

```text
Atuando como [Backend Coder], execute a Fase 1 e a Fase 2 descritas no @PLAN.md (criação da estrutura de pastas, src/api/requirements.txt e extração completa dos modelos Pydantic v2 em src/api/schemas.py, incluindo os schemas do Apidog e os DTOs de autenticação LoginRequestDTO, UserResponse e TokenResponseDTO).

Siga estritamente o @STYLEGUIDE.md e o @SPEC.md. Marque os itens concluídos como [x] no @PLAN.md e pare para nossa revisão.
```

---

### Passo 4: Implementando o ORM SQLAlchemy 2.0 e o Seed Relacional (Prompt 3)
Após revisar `src/api/schemas.py`, execute o **Prompt 3**:

```text
Os contratos em schemas.py foram revisados e aprovados! Agora, atuando como [Backend Coder], execute a Fase 3 do @PLAN.md:
1. Implemente src/api/models.py usando SQLAlchemy 2.0 (Mapped, mapped_column, relationship, ForeignKey) para UserModel, ProjectModel e TaskModel.
2. Implemente src/api/database.py com a engine SQLite, get_db() e a função de seed inicial criando os usuários admin@fatec.sp.gov.br (ADMIN) e aluno@fatec.sp.gov.br (MEMBER), além do projeto e tarefas do contrato Apidog.

Marque a Fase 3 como [x] no @PLAN.md e aguarde nossa revisão.
```

**O que destacar na tela para a turma (Revisão da Aula 09):**
* Abra `src/api/models.py` e mostre a tipagem moderna do SQLAlchemy 2.0 (`Mapped[str] = mapped_column(...)`), a `ForeignKey("projects.id")` em `TaskModel` e o `relationship(back_populates=...)` conectando `ProjectModel` e `TaskModel`.
* Abra `src/api/database.py` e mostre o gerador `get_db()` com `yield` e `finally: db.close()`, que será injetado pelo FastAPI.

---

### Passo 5: Implementando Segurança JWT, RBAC e RFC 9457 (Prompt 4)
Execute o **Prompt 4**:

```text
Modelos ORM e banco revisados! Atuando como [Backend Coder], execute a Fase 4 do @PLAN.md:
1. Implemente src/api/exceptions.py garantindo respostas RFC 9457 (Problem Details) para 400, 401, 403, 404 e 422.
2. Implemente src/api/security.py com geração/validação de JWT (HS256) e as dependências FastAPI get_current_user (retornando 401 RFC 9457 se ausente/inválido) e require_roles (retornando 403 RFC 9457 se o papel do usuário não tiver permissão).

Atualize o @PLAN.md ao concluir e pare para revisão.
```

**O que destacar na tela para a turma (Revisão da Aula 08):**
* Abra `src/api/security.py` e mostre a diferença prática entre **Autenticação (`get_current_user` ➔ 401 Unauthorized)** e **Autorização (`require_roles` ➔ 403 Forbidden)**, ambas retornando o JSON padronizado da RFC 9457!

---

### Passo 6: Routers HTTP com `Depends`, RBAC e `selectinload` (Prompt 5)
Execute o **Prompt 5**:

```text
Camada de segurança e exceções aprovadas! Atuando como [Backend Coder], execute a Fase 5 do @PLAN.md implementando:
1. src/api/routers/auth.py (POST /api/v1/auth/login e GET /api/v1/auth/me)
2. src/api/routers/tasks.py (integrado ao SQLAlchemy, exigindo autenticação no POST/PATCH e exigindo role ADMIN no DELETE /api/v1/tasks/{id})
3. src/api/routers/projects.py (usando selectinload(ProjectModel.tasks) no GET /api/v1/projects/{projectId}/tasks para prevenir queries N+1)
4. src/api/main.py (configurando lifespan para inicializar o banco e seed, CORS e middlewares).

Atualize os checkboxes da Fase 5 no @PLAN.md ao finalizar.
```

---

### Passo 7: Bateria de Testes Automatizados com `[QA Engineer]` (Prompt 6)
Finalize a construção convocando o `[QA Engineer]` com o **Prompt 6**:

```text
Atuando como [QA Engineer], execute a Fase 6 do @PLAN.md:
1. Crie src/api/tests/conftest.py sobrescrevendo a dependência get_db para usar um banco SQLite isolado por teste e fornecendo fixtures com tokens JWT para ADMIN e MEMBER.
2. Crie test_auth.py, test_tasks.py, test_projects.py e test_errors.py testando todos os fluxos de login (200/401), proteção de rotas sem token (401), tentativa de DELETE por MEMBER (403 Forbidden RFC 9457), DELETE por ADMIN (204 No Content), relacionamento 1:N no ORM e casos do Apidog.
3. Execute o pytest no terminal para comprovar 100% de aprovação e marque todos os itens do @PLAN.md como concluídos!
```

---

## 🔎 Parte 2: Oficina Prática das Equipes — Fechando a Especificação da P2 (30%)

Nos 60 minutos finais da aula, reúna os grupos (**obrigatoriamente de 2 a 4 integrantes**) para fechar e auditar a especificação da API do projeto semestral no **Apidog**.

### Roteiro de Bancada para os Alunos

1. **Passo A — Checklist no Apidog do Grupo:**
   * Criar o documento Markdown **`README`** na árvore de APIs descrevendo o propósito da API, as entidades e o nome/RA dos **2 a 4 membros da equipe**.
   * Garantir que as **2 (ou mais) entidades** possuam todas as 5 rotas do **CRUD** (`GET`, `POST`, `GET/{id}`, `PUT/PATCH/{id}`, `DELETE/{id}`).
   * Criar todos os modelos na aba **Schemas (Data Schemas)** (incluindo um relacionamento entre as duas entidades, ex.: `categoryId`, `userId`, `projectId`) e referenciá-los nas rotas (sem schemas inline!).
   * Preencher em cada atributo do Schema: `Description`, `Format`, `Required`, limites (`minLength`/`maxLength`/`minimum`/`maximum`), `Enum`, `Example` e regra de `Mock` (`@guid`, `@cname`, `@ctitle`, etc.).

2. **Passo B — Auditoria Automatizada da Nota com o `[Spec Auditor]` (Prompt 0):**
   * No Apidog, vá em **Settings ➔ Export Data ➔ Apidog (ou OpenAPI JSON)** e salve o arquivo `.json` na pasta do projeto aberta no Google Antigravity.
   * Execute o **Prompt 0** do arquivo [`PROMPTS_AULA.md`](src/sdd-template/PROMPTS_AULA.md):
     ```text
     Atuando como [Spec Auditor], inspecione o arquivo de especificação do Apidog do nosso projeto e avalie rigorosamente se ele cumpre os 5 critérios da entrega da P2 (peso 30%):

     1. README / Documentação Inicial: Existe descrição clara do propósito da API e identificação da equipe (2 a 4 integrantes)?
     2. Entidades e CRUD: Existem pelo menos 2 entidades de domínio com todas as 5 operações do CRUD (GET lista, POST criação, GET por id, PUT/PATCH atualização e DELETE remoção) e Status Codes semânticos?
     3. Schemas Desacoplados (DRY): Os payloads de Request e Response estão referenciando componentes da seção Data Schemas ($ref) ou foram criados inline dentro das rotas?
     4. Riqueza dos Schemas: Verifique atributo por atributo nos Data Schemas se possuem description, format (uuid, date-time, email, etc.), limites (minLength, maxLength, minimum, maximum), obrigatoriedade (required), enum, example e regras de Mock (@guid, @ctitle, etc.).

     Gere uma tabela de diagnóstico com a nota estimada de 0 a 10 e uma lista exata do que precisamos corrigir no Apidog antes de gerar o link do Compartilhamento Rápido.
     ```
   * Corrija no Apidog todos os pontos apontados pelo `[Spec Auditor]` até atingir nota **10/10** na auditoria!

3. **Passo C — Publicação e Entrega no Teams:**
   * No Apidog, acesse **Share Docs ➔ Quick Share (Compartilhamento Rápido)**, gere o link público da documentação e entregue na tarefa do Microsoft Teams.
   * **Bônus em Sala:** Com o `.Apidog.json` do grupo 100% aprovado, adapte o `SPEC.md` para as duas entidades do grupo e peça ao `[Tech Lead]` e ao `[Backend Coder]` para gerarem automaticamente os arquivos `schemas.py` (Pydantic v2) e `models.py` (SQLAlchemy 2.0) do projeto de vocês!
