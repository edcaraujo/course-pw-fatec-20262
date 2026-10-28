# PLAN.md — Roteiro Técnico de Implementação (TaskFlow API)

> **Gerado por:** `[Tech Lead]`  
> **Fontes de Governança:** `@STYLEGUIDE.md`, `@AGENTS.md`, `@SPEC.md` e `@TakFlow API.Apidog.json`  
> **Status da Revisão Humana:** Aprovado para execução granular pelo `[Backend Coder]` e `[QA Engineer]`.

---

## Fase 1: Fundação e Estrutura Arquitetural
- [ ] **Passo 1.1:** Criar a árvore de diretórios do projeto (`src/api/`, `src/api/routers/`, `src/api/tests/`), arquivos `__init__.py` e `src/api/requirements.txt` (`fastapi`, `uvicorn`, `pydantic`, `pytest`, `httpx`) respeitando a estrutura definida no `STYLEGUIDE.md`.

---

## Fase 2: Extração de Tipagens Estáticas do Apidog (Schema-First)
- [ ] **Passo 2.1:** Implementar `src/api/schemas.py` extraindo todos os Data Schemas de `TakFlow API.Apidog.json`:
  - Enums `TaskStatus`, `Priority` e `ProjectStatus`.
  - Modelos de erro RFC 9457: `InvalidParam` e `ApiError`.
  - Modelos de Tarefas: `Task`, `CreateTaskDTO` (com validador de UUID para `projectId`), `UpdateTaskDTO`, `Meta` e `PaginatedTasksResponse`.
  - Modelos de Projetos: `Project`, `CreateProjectDTO` (com regex `^[a-z0-9-]+$` para `slug`) e `ProjectsResponse`.

---

## Fase 3: Tratamento de Erros (RFC 9457) e Camada de Persistência
- [ ] **Passo 3.1:** Implementar `src/api/exceptions.py` com:
  - Classe `ApiErrorException` e função auxiliar `create_problem_details(...)`.
  - Exception handlers customizados para diferenciar erros de query/path (`400 Bad Request`) de erros de validação semântica do body (`422 Unprocessable Entity`), populando a lista `invalidParams`.
- [ ] **Passo 3.2:** Implementar `src/api/database.py` com:
  - Repositório em memória thread-safe protegido por `threading.RLock`.
  - Função de `seed` pré-carregando o projeto `a4e82b71-12cd-4f56-89ab-cdef01234567` e tarefas iniciais (incluindo `9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`), garantindo que o UUID `00000000-0000-0000-0000-000000000000` nunca exista.
  - Métodos de paginação, filtragem (`status`, `priority`, `search`) e CRUD para tarefas e projetos.

---

## Fase 4: Implementação dos Routers HTTP e Aplicação Principal
- [ ] **Passo 4.1:** Implementar `src/api/routers/tasks.py` contendo os 5 endpoints da coleção `/api/v1/tasks`:
  - `GET /api/v1/tasks` (paginado e filtrado).
  - `POST /api/v1/tasks` (retornando `201 Created` e header `Location: /api/v1/tasks/{id}`).
  - `GET /api/v1/tasks/{id}`, `PATCH /api/v1/tasks/{id}` e `DELETE /api/v1/tasks/{id}` (`204 No Content`).
- [ ] **Passo 4.2:** Implementar `src/api/routers/projects.py` contendo os 4 endpoints da coleção `/api/v1/projects`:
  - `GET /api/v1/projects`, `POST /api/v1/projects`, `GET /api/v1/projects/{id}` e o sub-recurso `GET /api/v1/projects/{projectId}/tasks`.
- [ ] **Passo 4.3:** Implementar `src/api/main.py` configurando a instância FastAPI, CORS (`expose_headers=["Location"]`), middleware de interceptação de JSON malformado (`400 Bad Request` RFC 9457), handlers de exceção e rotas de health-check (`/`, `/health`).

---

## Fase 5: Verificação de Contrato e Testes Automatizados (`pytest`)
- [ ] **Passo 5.1:** Implementar `src/api/tests/conftest.py` (fixture de reset do banco em memória antes de cada teste) e as suítes `test_tasks.py`, `test_projects.py` e `test_errors.py`.
- [ ] **Passo 5.2:** Executar `pytest -v` validando 100% dos casos de teste (paginação, filtros, criação com Location, PATCH parcial, DELETE 204, Expectation 404 do UUID zerado, validação de slug e erros RFC 9457).
