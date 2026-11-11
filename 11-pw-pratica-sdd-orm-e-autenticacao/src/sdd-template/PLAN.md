# PLAN.md — Roteiro Técnico de Implementação (TaskFlow API v2: ORM + Auth)

> **Gerado por:** `[Tech Lead]`  
> **Fontes de Governança:** `@STYLEGUIDE.md`, `@AGENTS.md`, `@SPEC.md` e `@TakFlow API.Apidog.json`  
> **Status da Revisão Humana:** Aprovado para execução granular pelo `[Backend Coder]` e `[QA Engineer]`.

---

## Fase 1: Fundação e Estrutura Arquitetural
- [ ] **Passo 1.1:** Criar a árvore de diretórios do projeto (`src/api/`, `src/api/routers/`, `src/api/tests/`), arquivos `__init__.py` e `src/api/requirements.txt` (`fastapi`, `uvicorn`, `pydantic[email]`, `sqlalchemy`, `pyjwt`, `pytest`, `httpx`) respeitando a estrutura definida no `STYLEGUIDE.md`.

---

## Fase 2: Extração de Tipagens Estáticas do Apidog + DTOs de Auth (Schema-First)
- [ ] **Passo 2.1:** Implementar `src/api/schemas.py` extraindo todos os Data Schemas de `TakFlow API.Apidog.json` e os contratos de segurança de `SPEC.md`:
  - Enums `TaskStatus`, `Priority`, `ProjectStatus` e `UserRole`.
  - Modelos de Autenticação: `LoginRequestDTO`, `UserResponse` e `TokenResponseDTO` (`accessToken`, `tokenType`, `expiresIn`, `user`).
  - Modelos de erro RFC 9457: `InvalidParam` e `ApiError`.
  - Modelos de Tarefas: `Task` (com `from_attributes=True`), `CreateTaskDTO` (com validador de UUID para `projectId`), `UpdateTaskDTO`, `Meta` e `PaginatedTasksResponse`.
  - Modelos de Projetos: `Project`, `CreateProjectDTO` (com regex `^[a-z0-9-]+$` para `slug`) e `ProjectsResponse`.

---

## Fase 3: Mapeamento Objeto-Relacional (SQLAlchemy 2.0 ORM) e Seed Inicial
- [ ] **Passo 3.1:** Implementar `src/api/models.py` utilizando a sintaxe declarativa do SQLAlchemy 2.0 (`DeclarativeBase`, `Mapped`, `mapped_column`, `relationship`, `ForeignKey`):
  - `UserModel` (`users`), `ProjectModel` (`projects`) e `TaskModel` (`tasks`) com chave estrangeira `project_id -> projects.id` e relacionamento bidirecional `1:N`.
  - Métodos auxiliares ou propriedades de serialização compatíveis com os nomes `camelCase` dos schemas Pydantic.
- [ ] **Passo 3.2:** Implementar `src/api/database.py` com:
  - Configuração de `engine` SQLite (`sqlite:///./taskflow.db`, `connect_args={"check_same_thread": False}`), `SessionLocal` e gerador `get_db()` para injeção de dependência no FastAPI.
  - Função `init_db_and_seed(db: Session)` criando as tabelas (`Base.metadata.create_all`) e inserindo de forma idempotente os usuários (`admin@fatec.sp.gov.br` e `aluno@fatec.sp.gov.br`), o projeto `a4e82b71-12cd-4f56-89ab-cdef01234567` e as tarefas iniciais (incluindo `9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`).

---

## Fase 4: Segurança Stateless (JWT & RBAC) e Tratamento de Erros (RFC 9457)
- [ ] **Passo 4.1:** Implementar `src/api/exceptions.py` com:
  - Classe `ApiErrorException` e função `create_problem_details(...)` cobrindo os códigos `400`, `401`, `403`, `404` e `422` no padrão RFC 9457.
  - Exception handlers globais para converter falhas de validação de query/path (`400`) e body (`422`) em payloads `ApiError` com `invalidParams`.
- [ ] **Passo 4.2:** Implementar `src/api/security.py` com:
  - Utilitários de hash/verificação de senha e geração/decodificação de token JWT (`HS256` com `PyJWT`).
  - Dependência `get_current_user` que extrai e valida o cabeçalho `Authorization: Bearer <token>`, lançando `401 Unauthorized` (RFC 9457) quando ausente, malformado ou expirado.
  - Fábrica de dependência RBAC `require_roles(*roles: UserRole)` que verifica o papel do usuário autenticado e lança `403 Forbidden` (RFC 9457) caso o papel seja insuficiente.

---

## Fase 5: Implementação dos Routers HTTP (`auth`, `tasks`, `projects`) e `main.py`
- [ ] **Passo 5.1:** Implementar `src/api/routers/auth.py` com `POST /api/v1/auth/login` e `GET /api/v1/auth/me`.
- [ ] **Passo 5.2:** Implementar `src/api/routers/tasks.py` operando via sessão SQLAlchemy (`Depends(get_db)`):
  - `GET /api/v1/tasks` e `GET /api/v1/tasks/{id}` (públicos, com paginação/filtros no banco e validação de UUID).
  - `POST /api/v1/tasks` e `PATCH /api/v1/tasks/{id}` protegidos por `get_current_user` (`MEMBER` ou `ADMIN`), mantendo o cabeçalho `Location` no `POST`.
  - `DELETE /api/v1/tasks/{id}` protegido exclusivamente por `require_roles(UserRole.ADMIN)` (`403 Forbidden` para `MEMBER`, `204 No Content` para `ADMIN`).
- [ ] **Passo 5.3:** Implementar `src/api/routers/projects.py` operando via SQLAlchemy:
  - `GET /api/v1/projects`, `GET /api/v1/projects/{id}` e `POST /api/v1/projects` (protegido por `get_current_user`).
  - `GET /api/v1/projects/{projectId}/tasks` utilizando `selectinload(ProjectModel.tasks)` para evitar queries N+1.
- [ ] **Passo 5.4:** Implementar `src/api/main.py` com ciclo de vida (`lifespan`) inicializando o banco/seed, CORS, middleware de JSON malformado (`400` RFC 9457) e registro dos 3 routers.

---

## Fase 6: Verificação de Contrato, ORM e Segurança com `pytest`
- [ ] **Passo 6.1:** Implementar `src/api/tests/conftest.py` configurando um banco SQLite em memória/temporário isolado por teste via `app.dependency_overrides[get_db]`, além de fixtures `admin_headers` e `member_headers` com tokens JWT válidos.
- [ ] **Passo 6.2:** Implementar `test_auth.py`, `test_tasks.py`, `test_projects.py` e `test_errors.py` cobrindo login (`200`/`401`), acesso sem token (`401`), bloqueio RBAC de `MEMBER` no `DELETE` (`403`), sucesso de `ADMIN` no `DELETE` (`204`), persistência ORM 1:N e Expectations do Apidog.
- [ ] **Passo 6.3:** Executar `pytest -v` no terminal comprovando 100% de aprovação em todas as suítes.
