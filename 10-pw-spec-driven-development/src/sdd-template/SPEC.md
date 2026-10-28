# SPEC.md — Especificação de Negócio e Contrato (TaskFlow API)

## 1. Visão Geral e Fonte da Verdade do Contrato
Este projeto implementa a **TaskFlow API**, uma API RESTful para gerenciamento ágil de projetos e tarefas.
O contrato formal de interface (rotas, parâmetros, exemplos, respostas e JSON Schemas) está definido em `@[TakFlow API.Apidog.json](TakFlow API.Apidog.json)`.

---

## 2. Prioridade Arquitetural: Extração de Tipos (Schema-First)
O sistema DEVE extrair e consolidar todas as tipagens estáticas (modelos Pydantic v2 em `src/api/schemas.py`) diretamente dos `Data Schemas` do Apidog **antes** de implementar qualquer lógica de banco de dados ou rotas HTTP:

1. **Enums de Domínio:**
   - `TaskStatus`: `"TODO"`, `"IN_PROGRESS"`, `"DONE"`, `"BLOCKED"`
   - `Priority`: `"LOW"`, `"MEDIUM"`, `"HIGH"`
   - `ProjectStatus`: `"ACTIVE"`, `"ARCHIVED"`, `"ON_HOLD"`
2. **Modelos de Tarefa:**
   - `Task`: `id` (UUID str), `title` (3 a 100 caracteres), `description` (opcional, até 500 caracteres), `status` (`TaskStatus`), `priority` (`Priority`, padrão `"MEDIUM"`), `dueDate` (`datetime` opcional), `projectId` (UUID str opcional), `createdAt` (`datetime`), `updatedAt` (`datetime`).
   - `CreateTaskDTO`: `title`, `description`, `priority`, `dueDate`, `projectId` (deve validar se `projectId`, quando enviado, é um UUID válido).
   - `UpdateTaskDTO`: `title`, `description`, `status`, `priority`, `dueDate` (todos opcionais para atualização parcial).
   - `PaginatedTasksResponse` & `Meta`: envelope `{ "data": [...], "meta": { "page", "limit", "totalItems", "totalPages", "hasNext" } }`.
3. **Modelos de Projeto:**
   - `Project`: `id` (UUID str), `name` (3 a 80 caracteres), `slug` (padrão regex `^[a-z0-9-]+$`), `description` (opcional), `status` (`ProjectStatus`, padrão `"ACTIVE"`), `createdAt` (`datetime`), `updatedAt` (`datetime` opcional).
   - `CreateProjectDTO`: `name`, `slug`, `description`, `status`.
   - `ProjectsResponse`: `{ "data": List[Project] }`.
4. **Modelos de Erro (RFC 9457):**
   - `InvalidParam`: `name` (str), `reason` (str).
   - `ApiError`: `type` (URI str), `title` (str), `status` (int), `detail` (str), `instance` (str), `invalidParams` (lista opcional de `InvalidParam`).

---

## 3. Regras de Negócio e Comportamento dos Endpoints

### 3.1. Coleção `Tasks` (`/api/v1/tasks`)
- **`GET /api/v1/tasks`**:
  - Parâmetros de query: `page` (int, default `1`, min `1`), `limit` (int, default `10`, min `1`, max `100`), `status` (`TaskStatus` opcional), `priority` (`Priority` opcional), `search` (string opcional que filtra de forma case-insensitive tanto em `title` quanto em `description`).
  - Se os parâmetros de query violarem os tipos/limites, retornar `400 Bad Request` no formato `ApiError` (RFC 9457).
- **`POST /api/v1/tasks`**:
  - Cria uma nova tarefa atribuindo `id` (UUIDv4), `status = TaskStatus.TODO`, `createdAt` e `updatedAt` (UTC atual).
  - Retorna `201 Created` com o objeto `Task` e define o cabeçalho HTTP `Location: /api/v1/tasks/{id}`.
- **`GET /api/v1/tasks/{id}`**:
  - Valida se `id` é um UUID válido (caso contrário, `400 Bad Request`).
  - Retorna `200 OK` com a `Task` ou `404 Not Found` (RFC 9457) se não existir.
- **`PATCH /api/v1/tasks/{id}`**:
  - Atualiza parcialmente apenas os campos fornecidos no corpo (`UpdateTaskDTO`) e renova o timestamp `updatedAt`.
  - Retorna `200 OK` com a `Task` atualizada, `404 Not Found` se inexistente, ou `422 Unprocessable Entity` em erro semântico/validação.
- **`DELETE /api/v1/tasks/{id}`**:
  - Remove a tarefa e retorna `204 No Content` (sem corpo JSON) ou `404 Not Found` (RFC 9457).

### 3.2. Coleção `Projects` (`/api/v1/projects`)
- **`GET /api/v1/projects`**:
  - Lista todos os projetos no envelope `ProjectsResponse`, permitindo filtro opcional por query param `status` (`ProjectStatus`).
- **`POST /api/v1/projects`**:
  - Cadastra novo projeto e retorna `201 Created`.
- **`GET /api/v1/projects/{id}`**:
  - Retorna `200 OK` com o `Project` ou `404 Not Found` (RFC 9457).
- **`GET /api/v1/projects/{projectId}/tasks`**:
  - Sub-recurso hierárquico que valida a existência do projeto `projectId` (retornando `404` caso não exista) e retorna `{ "data": List[Task] }` contendo todas as tarefas vinculadas àquele projeto.

### 3.3. Expectations Especiais do Apidog e Resiliência
- **UUID de Simulação 404 (`00000000-0000-0000-0000-000000000000`):** Qualquer operação (`GET`, `PATCH`, `DELETE`) sobre este UUID DEVE retornar `404 Not Found` com `type: "https://api.taskflow.dev/errors/not-found"` e `title: "Recurso Inexistente"`.
- **Middleware de JSON Malformado:** Requisições `POST`, `PUT` ou `PATCH` com `Content-Type: application/json` contendo corpo JSON inválido devem retornar `400 Bad Request` no padrão RFC 9457.
- **Seed Inicial:** O banco em memória deve inicializar com projetos e tarefas de exemplo (incluindo o projeto `a4e82b71-12cd-4f56-89ab-cdef01234567` e a tarefa `9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d` documentados nos exemplos do Apidog).
