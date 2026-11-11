# SPEC.md — Especificação de Negócio, ORM e Autenticação (TaskFlow API v2)

## 1. Visão Geral e Fonte da Verdade do Contrato
Este projeto implementa a **TaskFlow API v2**, uma API RESTful para gerenciamento ágil de projetos e tarefas com **persistência relacional via ORM (SQLAlchemy 2.0)** e **controle de acesso Stateless via JWT e RBAC**.
O contrato base de rotas, parâmetros e JSON Schemas das entidades de domínio está definido em `@[TakFlow API.Apidog.json](TakFlow API.Apidog.json)`.

---

## 2. Prioridade Arquitetural: Extração de Tipos (Schema-First)
O sistema DEVE extrair e consolidar todas as tipagens estáticas (modelos Pydantic v2 em `src/api/schemas.py`) a partir dos `Data Schemas` do Apidog e dos requisitos de Autenticação **antes** de implementar os modelos ORM ou rotas HTTP:

1. **Enums de Domínio e Segurança:**
   - `TaskStatus`: `"TODO"`, `"IN_PROGRESS"`, `"DONE"`, `"BLOCKED"`
   - `Priority`: `"LOW"`, `"MEDIUM"`, `"HIGH"`
   - `ProjectStatus`: `"ACTIVE"`, `"ARCHIVED"`, `"ON_HOLD"`
   - `UserRole`: `"ADMIN"`, `"MEMBER"`
2. **Modelos de Autenticação e Usuário (Aula 08):**
   - `LoginRequestDTO`: `email` (str formato email), `password` (str, min 6 caracteres).
   - `UserResponse`: `id` (UUID str), `name` (str), `email` (str), `role` (`UserRole`).
   - `TokenResponseDTO`: `accessToken` (str JWT), `tokenType` (str, default `"bearer"`), `expiresIn` (int, em segundos), `user` (`UserResponse`).
3. **Modelos de Tarefa (Apidog):**
   - `Task`: `id` (UUID str), `title` (3 a 100 caracteres), `description` (opcional, até 500 caracteres), `status` (`TaskStatus`), `priority` (`Priority`, padrão `"MEDIUM"`), `dueDate` (`datetime` opcional), `projectId` (UUID str opcional), `createdAt` (`datetime`), `updatedAt` (`datetime`).
   - `CreateTaskDTO`: `title`, `description`, `priority`, `dueDate`, `projectId` (deve validar se `projectId`, quando enviado, é um UUID válido).
   - `UpdateTaskDTO`: `title`, `description`, `status`, `priority`, `dueDate` (todos opcionais para atualização parcial).
   - `PaginatedTasksResponse` & `Meta`: envelope `{ "data": [...], "meta": { "page", "limit", "totalItems", "totalPages", "hasNext" } }`.
4. **Modelos de Projeto (Apidog):**
   - `Project`: `id` (UUID str), `name` (3 a 80 caracteres), `slug` (padrão regex `^[a-z0-9-]+$`), `description` (opcional), `status` (`ProjectStatus`, padrão `"ACTIVE"`), `createdAt` (`datetime`), `updatedAt` (`datetime` opcional).
   - `CreateProjectDTO`: `name`, `slug`, `description`, `status`.
   - `ProjectsResponse`: `{ "data": List[Project] }`.
5. **Modelos de Erro (RFC 9457):**
   - `InvalidParam`: `name` (str), `reason` (str).
   - `ApiError`: `type` (URI str), `title` (str), `status` (int), `detail` (str), `instance` (str), `invalidParams` (lista opcional de `InvalidParam`).

---

## 3. Mapeamento Objeto-Relacional — ORM (Aula 09)
A camada de persistência (`src/api/models.py` e `src/api/database.py`) deve utilizar **SQLAlchemy 2.0 (`Mapped`, `mapped_column`, `relationship`)** sobre SQLite:

1. **Tabela `users` (`UserModel`):**
   - `id` (String(36) PK UUID), `name` (String(80)), `email` (String(120) Unique Index), `password_hash` (String(255)), `role` (String(20): `"ADMIN"` ou `"MEMBER"`).
2. **Tabela `projects` (`ProjectModel`):**
   - `id` (String(36) PK UUID), `name` (String(80)), `slug` (String(80) Index), `description` (String(500) Nullable), `status` (String(20)), `created_at` (DateTime), `updated_at` (DateTime Nullable).
   - Relacionamento `1:N`: `tasks: Mapped[list["TaskModel"]] = relationship(back_populates="project", cascade="all, delete-orphan")`.
3. **Tabela `tasks` (`TaskModel`):**
   - `id` (String(36) PK UUID), `title` (String(100)), `description` (String(500) Nullable), `status` (String(20)), `priority` (String(20)), `due_date` (DateTime Nullable), `project_id` (String(36) `ForeignKey("projects.id")`, Nullable), `created_at` (DateTime), `updated_at` (DateTime).
   - Relacionamento `N:1`: `project: Mapped[Optional["ProjectModel"]] = relationship(back_populates="tasks")`.
4. **Prevenção de N+1:** Na consulta do sub-recurso `GET /api/v1/projects/{projectId}/tasks`, utilize `selectinload(ProjectModel.tasks)` para carregar o projeto e suas tarefas de forma eficiente.

---

## 4. Autenticação JWT, Autorização RBAC e Regras dos Endpoints (Aula 08)

### 4.1. Coleção `Auth` (`/api/v1/auth`)
- **`POST /api/v1/auth/login`**:
  - Recebe `LoginRequestDTO` (`email` e `password`).
  - Se as credenciais forem válidas, retorna `200 OK` com `TokenResponseDTO` contendo o JWT assinado (`HS256`, validade de 3600s) com as claims `sub`, `email` e `role`.
  - Se o e-mail não existir ou a senha estiver incorreta, retorna `401 Unauthorized` no formato `ApiError` (RFC 9457, `type: "https://api.taskflow.dev/errors/unauthorized"`).
- **`GET /api/v1/auth/me`**:
  - Requer cabeçalho `Authorization: Bearer <token>`.
  - Retorna `200 OK` com `UserResponse` do usuário autenticado ou `401 Unauthorized` (RFC 9457).

### 4.2. Matriz de Controle de Acesso (RBAC) nas Rotas de Domínio
| Endpoint | Permissão Exigida | Comportamento de Segurança |
| :--- | :--- | :--- |
| `GET /api/v1/tasks` e `GET /api/v1/tasks/{id}` | Público (ou Token opcional) | Permite leitura sem bloqueio para facilitar testes de contrato do Apidog. |
| `GET /api/v1/projects`, `GET /api/v1/projects/{id}` e `GET /api/v1/projects/{projectId}/tasks` | Público (ou Token opcional) | Permite consulta livre e inspeção do relacionamento 1:N. |
| `POST /api/v1/tasks`, `PATCH /api/v1/tasks/{id}`, `POST /api/v1/projects` | Autenticado (`MEMBER` ou `ADMIN`) | Retorna `401 Unauthorized` (RFC 9457) se o token JWT estiver ausente, inválido ou expirado. |
| **`DELETE /api/v1/tasks/{id}`** | **Exclusivo `ADMIN`** | Retorna `401 Unauthorized` se sem token, e **`403 Forbidden` (RFC 9457)** caso o usuário autenticado possua role `MEMBER`. |

### 4.3. Comportamento Funcional de `Tasks` e `Projects`
- **`GET /api/v1/tasks`**: Paginação no banco via ORM (`offset`/`limit`), filtros por `status`, `priority` e busca case-insensitive (`ILIKE` / `lower()`) em `title` e `description`.
- **`POST /api/v1/tasks`**: Persiste no SQLite via SQLAlchemy, retorna `201 Created` e define o cabeçalho `Location: /api/v1/tasks/{id}`. Se `projectId` for informado e não existir no banco, retorna `404 Not Found` (RFC 9457).
- **`PATCH /api/v1/tasks/{id}`**: Atualiza parcialmente no banco e renova `updatedAt`.
- **`DELETE /api/v1/tasks/{id}`**: Restrito a `ADMIN`. Remove do banco e retorna `204 No Content`.
- **`GET /api/v1/projects/{projectId}/tasks`**: Usa `selectinload(ProjectModel.tasks)` para buscar o projeto e retornar `{ "data": List[Task] }` (ou `404` se o projeto não existir).

### 4.4. Seed Inicial do Banco de Dados e Expectations
A função de `seed` executada na inicialização do banco deve garantir a criação idempotente de:
1. **Usuários para Teste de Auth/RBAC:**
   - **Admin:** `email: "admin@fatec.sp.gov.br"`, `password: "Admin@2026"`, `role: "ADMIN"`
   - **Member:** `email: "aluno@fatec.sp.gov.br"`, `password: "Aluno@2026"`, `role: "MEMBER"`
2. **Projetos e Tarefas do Contrato Apidog:**
   - Projeto `a4e82b71-12cd-4f56-89ab-cdef01234567` (`"Portal Acadêmico Fatec"`, slug `"portal-academico-fatec"`, status `"ACTIVE"`).
   - Tarefa `9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d` vinculada ao projeto acima.
   - O UUID `00000000-0000-0000-0000-000000000000` NUNCA deve existir no banco (reservado para a Expectation de `404 Not Found`).
