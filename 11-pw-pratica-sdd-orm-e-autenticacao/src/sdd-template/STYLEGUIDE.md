# STYLEGUIDE.md — Constituição Técnica (TaskFlow API: ORM & Auth Edition)

## 1. Stack Tecnológica e Versões Obrigatórias
- **Linguagem:** Python 3.12+ com anotações estáticas de tipo (`typing`, `UUID`, `datetime`, `Enum`, `Annotated`).
- **Framework Web:** FastAPI.
- **Validação e Serialização:** Pydantic v2 (`BaseModel`, `ConfigDict(populate_by_name=True, from_attributes=True)`, `Field`, `@field_validator`).
- **Persistência e ORM (Aula 09):** SQLAlchemy 2.0+ utilizando sintaxe declarativa moderna (`DeclarativeBase`, `Mapped`, `mapped_column`, `relationship`, `ForeignKey`) com banco SQLite (`sqlite:///./taskflow.db` em execução normal e banco isolado em memória/arquivo temporário nos testes).
- **Segurança, Autenticação e Autorização (Aula 08):** Autenticação Stateless via **JWT (`PyJWT`)** no padrão `Bearer Token` (`HTTPBearer`) e controle de acesso baseado em papéis (**RBAC**: `ADMIN` e `MEMBER`).
- **Suíte de Testes:** `pytest` + `fastapi.testclient.TestClient`.

---

## 2. Arquitetura de Diretórios e Separação de Camadas
Todo o código da API deve respeitar rigorosamente a estrutura abaixo:

```text
src/api/
├── __init__.py
├── main.py          # Instância FastAPI, lifespan (init_db + seed), CORS, middleware JSON e rotas
├── schemas.py       # Contratos Pydantic v2 espelhando os Data Schemas do Apidog + DTOs de Auth
├── models.py        # Entidades ORM SQLAlchemy 2.0 (UserModel, ProjectModel, TaskModel)
├── database.py      # Engine SQLAlchemy, SessionLocal, get_db (Dependency Injection) e seed inicial
├── security.py      # Geração/validação de JWT, hash de senha e dependências RBAC (get_current_user, require_role)
├── exceptions.py    # Exceções de domínio e handlers globais no padrão RFC 9457 (400, 401, 403, 404, 422)
├── requirements.txt # Dependências estritas do projeto (fastapi, uvicorn, pydantic, sqlalchemy, pyjwt, pytest, httpx)
├── routers/
│   ├── __init__.py
│   ├── auth.py      # Endpoints de autenticação (/api/v1/auth/login e /api/v1/auth/me)
│   ├── tasks.py     # Endpoints da coleção /api/v1/tasks (integrados ao ORM e protegidos por JWT/RBAC)
│   └── projects.py  # Endpoints da coleção /api/v1/projects (com eager loading selectinload)
└── tests/
    ├── __init__.py
    ├── conftest.py      # Override de get_db para banco SQLite isolado de teste e fixtures de tokens JWT
    ├── test_auth.py     # Testes de login, token inválido/ausente (401) e RBAC (403 Forbidden)
    ├── test_tasks.py    # Testes de contrato e persistência ORM da coleção Tasks
    ├── test_projects.py # Testes de contrato e relacionamento 1:N da coleção Projects
    └── test_errors.py   # Testes de conformidade RFC 9457 (400, 401, 403, 404, 422)
```

---

## 3. Regras Inegociáveis de Implementação

### 3.1. Tratamento de Erros Semântico (RFC 9457 / Problem Details)
- É **PROIBIDO** retornar erros no formato padrão do FastAPI (`{"detail": "..."}`).
- Qualquer erro HTTP (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`) DEVE retornar um JSON compatível com o schema `ApiError`:
  - `type`: URI identificadora do erro:
    - `https://api.taskflow.dev/errors/bad-request` (`400`)
    - `https://api.taskflow.dev/errors/unauthorized` (`401`)
    - `https://api.taskflow.dev/errors/forbidden` (`403`)
    - `https://api.taskflow.dev/errors/not-found` (`404`)
    - `https://api.taskflow.dev/errors/validation-error` (`422`)
  - `title`: Resumo curto e legível do tipo de erro.
  - `status`: Código HTTP numérico.
  - `detail`: Explicação clara sobre a ocorrência específica.
  - `instance`: Caminho da URI requisitada (`request.url.path`).
  - `invalidParams`: Lista de objetos `{"name": "<campo>", "reason": "<motivo>"}` obrigatória em falhas de validação (`400`/`422`).

### 3.2. Regras de ORM e Prevenção do Problema N+1 (Aula 09)
- Use exclusivamente **SQLAlchemy 2.0** (`select()`, `Session.scalars()`, `Mapped[...]`, `mapped_column(...)`).
- O relacionamento `1:N` entre `ProjectModel` (`projects`) e `TaskModel` (`tasks`) deve ser mapeado com `ForeignKey("projects.id")` e `relationship(...)`.
- Ao consultar projetos ou tarefas vinculadas (`GET /api/v1/projects/{projectId}/tasks`), utilize estratégias adequadas de consulta e carregamento (`selectinload` / `joinedload`) para **evitar o problema de queries N+1**.
- Toda operação de escrita (`POST`, `PATCH`, `DELETE`) deve gerenciar a transação explicitamente (`db.commit()`, `db.refresh()` ou `db.rollback()` em caso de falha).

### 3.3. Regras de Autenticação JWT e Autorização RBAC (Aula 08)
- Tokens JWT devem ser assinados com `HS256` contendo no payload: `sub` (ID do usuário), `email`, `role` (`ADMIN` ou `MEMBER`), `iat` e `exp`.
- Ausência de cabeçalho `Authorization: Bearer <token>`, token malformado ou expirado deve retornar **`401 Unauthorized`** no formato **RFC 9457 (`ApiError`)**.
- Tentativa de acessar um recurso autenticado sem o papel (`role`) exigido (ex.: um usuário `MEMBER` tentando executar `DELETE /api/v1/tasks/{id}`) deve retornar **`403 Forbidden`** no formato **RFC 9457 (`ApiError`)**.

### 3.4. Convenções de Nomenclatura JSON vs. Python
- Os payloads JSON de entrada e saída DEVEM preservar exatamente os nomes `camelCase` definidos no contrato do Apidog:
  - `dueDate`, `projectId`, `createdAt`, `updatedAt`
  - `totalItems`, `totalPages`, `hasNext`
  - `invalidParams`, `accessToken`, `tokenType`
