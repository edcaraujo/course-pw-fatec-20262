# STYLEGUIDE.md — Constituição Técnica (TaskFlow API)

## 1. Stack Tecnológica e Versões Obrigatórias
- **Linguagem:** Python 3.12+ com anotações de tipo (`typing`, `UUID`, `datetime`, `Enum`).
- **Framework Web:** FastAPI.
- **Validação e Serialização:** Pydantic v2 (`BaseModel`, `ConfigDict(populate_by_name=True)`, `Field`, `@field_validator`).
- **Persistência:** Camada de dados isolada em `database.py` (In-Memory Thread-Safe protegida por `threading.RLock` ou SQLAlchemy 2.0 `Mapped[...]`).
- **Suíte de Testes:** `pytest` + `fastapi.testclient.TestClient`.

---

## 2. Arquitetura de Diretórios e Separação de Camadas
Todo o código da API deve respeitar rigorosamente a estrutura abaixo:

```text
src/api/
├── __init__.py
├── main.py          # Instância FastAPI, CORS, middleware de JSON malformado e registro de rotas
├── schemas.py       # Exclusivamente contratos Pydantic v2 espelhando os Data Schemas do Apidog
├── database.py      # Camada de persistência isolada, seed inicial e operações de consulta/mutação
├── exceptions.py    # Exceções de domínio e handlers globais no padrão RFC 9457 (Problem Details)
├── requirements.txt # Dependências estritas do projeto
├── routers/
│   ├── __init__.py
│   ├── tasks.py     # Endpoints da coleção /api/v1/tasks
│   └── projects.py  # Endpoints da coleção /api/v1/projects
└── tests/
    ├── __init__.py
    ├── conftest.py      # Fixtures e reset de estado entre testes
    ├── test_tasks.py    # Testes de contrato da coleção Tasks
    ├── test_projects.py # Testes de contrato da coleção Projects
    └── test_errors.py   # Testes de conformidade RFC 9457 (400, 404, 422)
```

---

## 3. Regras Inegociáveis de Implementação

### 3.1. Tratamento de Erros Semântico (RFC 9457 / Problem Details)
- É **PROIBIDO** retornar erros no formato padrão do FastAPI (`{"detail": "..."}`).
- Qualquer erro HTTP (`400 Bad Request`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`) DEVE retornar um JSON compatível com o schema `ApiError`:
  - `type`: URI identificadora do erro (ex: `https://api.taskflow.dev/errors/not-found`, `https://api.taskflow.dev/errors/validation-error`, `https://api.taskflow.dev/errors/bad-request`).
  - `title`: Resumo curto e legível do tipo de erro.
  - `status`: Código HTTP numérico.
  - `detail`: Explicação clara sobre a ocorrência específica.
  - `instance`: Caminho da URI requisitada (`request.url.path`).
  - `invalidParams`: Lista de objetos `{"name": "<campo>", "reason": "<motivo>"}` obrigatória em falhas de validação (`400`/`422`).

### 3.2. Convenções de Nomenclatura JSON vs. Python
- Os payloads JSON de entrada e saída DEVEM preservar exatamente os nomes `camelCase` definidos no contrato do Apidog:
  - `dueDate`, `projectId`, `createdAt`, `updatedAt`
  - `totalItems`, `totalPages`, `hasNext`
  - `invalidParams`

### 3.3. Semântica de Verbos e Status HTTP
- `POST /api/v1/tasks`: Deve retornar `201 Created` e incluir obrigatoriamente o header `Location: /api/v1/tasks/{id}`.
- `POST /api/v1/projects`: Deve retornar `201 Created`.
- `PATCH /api/v1/tasks/{id}`: Deve aplicar atualização parcial (`exclude_unset=True`) e atualizar `updatedAt`.
- `DELETE /api/v1/tasks/{id}`: Deve retornar `204 No Content` sem corpo na resposta (`Response(status_code=status.HTTP_204_NO_CONTENT)`).
