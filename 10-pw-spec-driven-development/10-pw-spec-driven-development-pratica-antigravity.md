# 🧪 Laboratório Prático e Guia de Sala de Aula: Spec-Driven Development (SDD) no Google Antigravity
## Disciplina: Programação Web (2026.2) — Fatec Ribeirão Preto
### Aula 10: Da Especificação no Apidog à Implementação Determinística com Agentes de IA

---

## 🎯 Objetivo da Prática

Neste laboratório prático, abandonaremos o **"Vibe Coding"** (tentativa e erro no chat) e aplicaremos o fluxo formal de **Spec-Driven Development (SDD)** dentro do **Google Antigravity** para construir e evoluir a **TaskFlow API** a partir do contrato modelado no **Apidog** ([`TakFlow API.Apidog.json`](src/sdd-template/TakFlow%20API.Apidog.json)).

Ao final desta aula prática de 2 horas, os alunos terão vivenciado na prática as **4 Fases do SDD**:
1. **Constitution (As Regras Imutáveis):** Configurar `STYLEGUIDE.md` e `AGENTS.md` (carregado nativamente pelo Google Antigravity) com regras de arquitetura em Python/FastAPI/Pydantic v2 e personas de execução (`[Tech Lead]`, `[Backend Coder]`, `[QA Engineer]`).
2. **Specify (A Intenção e o Contrato):** Conectar o arquivo exportado do Apidog (`TakFlow API.Apidog.json`) ao documento de requisitos `SPEC.md`, priorizando a extração de tipagens estáticas antes da lógica de negócio.
3. **Plan (O Roteiro Técnico):** Utilizar o agente como `[Tech Lead]` (e recursos como `/plan` e `/grill-me` no Antigravity) para gerar um checklist técnico determinístico (`PLAN.md`) e realizar a **auditoria humana (*Human-in-the-Loop*)** antes de qualquer linha de código ser escrita.
4. **Tasks & Implement (A Execução Granular):** Executar o `PLAN.md` passo a passo (*Task by Task*) com o `[Backend Coder]`, inspecionar diffs no Antigravity e validar 100% de conformidade com `pytest` através do `[QA Engineer]`.

---

## ⏱️ Cronograma de Condução para o Professor (2h / 120 min)

| Bloco | Duração | Tópico / Atividade em Sala | Artefatos Envolvidos |
| :--- | :---: | :--- | :--- |
| **Bloco 1** | `20 min` | **Conceituação:** O fim do Vibe Coding, as 4 fases do SDD e funcionamento da janela de contexto e customizações no Google Antigravity. | Slides Parte 1 (`10-pw-spec-driven-development.md`) |
| **Bloco 2** | `40 min` | **Fases 1 & 2 (Constitution & Specify):** Criação ao vivo do `STYLEGUIDE.md`, `AGENTS.md` (explicando a descoberta automática do Antigravity), exportação do `TakFlow API.Apidog.json` e escrita do `SPEC.md`. | `STYLEGUIDE.md`, `AGENTS.md`, `TakFlow API.Apidog.json`, `SPEC.md` |
| **Bloco 3** | `30 min` | **Fase 3 (Plan):** Execução do prompt de `[Tech Lead]` no Antigravity para gerar o `PLAN.md`. Demonstração de revisão humana ao vivo (ajustando/auditando o plano antes de codar). | `PLAN.md` |
| **Bloco 4** | `30 min` | **Fase 4 (Tasks & Implement):** Execução granular dos passos do `PLAN.md` com `[Backend Coder]`, revisão no *Visual Diff Overlay* e bateria de testes automatizados com `[QA Engineer]`. | Código em `src/api/` + `pytest` |

---

## 🛠️ Prep-Work do Professor (Validação Antes da Aula)

Antes de entrar em sala, você pode testar ou demonstrar o fluxo usando o diretório pronto de referência em [`src/sdd-template/`](src/sdd-template/):

1. **Verifique os artefatos prontos de referência:**
   * [`src/sdd-template/STYLEGUIDE.md`](src/sdd-template/STYLEGUIDE.md)
   * [`src/sdd-template/AGENTS.md`](src/sdd-template/AGENTS.md)
   * [`src/sdd-template/SPEC.md`](src/sdd-template/SPEC.md)
   * [`src/sdd-template/PLAN.md`](src/sdd-template/PLAN.md)
   * [`src/sdd-template/PROMPTS_AULA.md`](src/sdd-template/PROMPTS_AULA.md) *(Folha de cola rápida com todos os prompts para copiar e colar durante a aula!)*
   * [`src/sdd-template/TakFlow API.Apidog.json`](src/sdd-template/TakFlow%20API.Apidog.json)
2. **Para simular do zero em sala com os alunos:**
   Crie uma pasta limpa (ex: `taskflow-sdd-live/`) ou copie apenas o `TakFlow API.Apidog.json` para ela e abra-a como workspace no **Google Antigravity**.

---

## 📋 Passo a Passo Detalhado (Execução em Sala de Aula)

---

### Passo 0: Preparação do Workspace no Google Antigravity

1. No terminal, crie um diretório limpo para o projeto da aula e copie o contrato do Apidog:
   ```bash
   mkdir -p taskflow-sdd && cd taskflow-sdd
   cp ../04-pw-api-contextualizacao/src/"TakFlow API.Apidog.json" ./
   ```
   *(Alternativamente, no Apidog: abra o projeto **TaskFlow API** ➔ **Settings** ➔ **Export Data** ➔ **Apidog / OpenAPI** e salve na raiz do workspace).*
2. Abra a pasta `taskflow-sdd` no **Google Antigravity** (Antigravity IDE ou Antigravity 2.0).

---

### Passo 1: Fase 1 — Constitution (As Regras Imutáveis)

Explique aos alunos que **antes** de falar sobre tarefas ou projetos, precisamos definir as leis imutáveis que o Agente de IA não pode violar.

#### 1.1. Criando o `STYLEGUIDE.md` (Constituição Técnica)
Crie o arquivo `STYLEGUIDE.md` na raiz do workspace com o seguinte conteúdo:

````markdown
# STYLEGUIDE.md — Constituição Técnica (TaskFlow API)

## 1. Stack Tecnológica e Versões
- **Linguagem:** Python 3.12+ com tipagem estática obrigatória (`typing`, `UUID`, `datetime`).
- **Framework Web:** FastAPI.
- **Validação e Contratos:** Pydantic v2 (`BaseModel`, `ConfigDict(populate_by_name=True)`, `Field`, `@field_validator`).
- **Persistência:** Camada de dados desacoplada (In-Memory Thread-Safe com `threading.RLock` ou SQLAlchemy 2.0 `Mapped[...]`).
- **Testes:** `pytest` + `fastapi.testclient.TestClient`.

## 2. Arquitetura de Pastas Obrigatória
Todo o código-fonte da aplicação deve residir em `src/api/` seguindo estritamente esta divisão:
```text
src/api/
├── __init__.py
├── main.py          # Instância FastAPI, CORS, middleware de JSON malformado e registro de rotas
├── schemas.py       # Modelos Pydantic v2 extraídos fielmente dos Data Schemas do Apidog
├── database.py      # Camada de persistência isolada e dados iniciais (seed)
├── exceptions.py    # Exceções customizadas e handlers globais no padrão RFC 9457
├── requirements.txt # Dependências do projeto
├── routers/
│   ├── __init__.py
│   ├── tasks.py     # Endpoints de /api/v1/tasks
│   └── projects.py  # Endpoints de /api/v1/projects
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_tasks.py
    ├── test_projects.py
    └── test_errors.py
```

## 3. Regras Inegociáveis de Engenharia
1. **Padronização de Erros (RFC 9457 - Problem Details):**
   - NUNCA retorne erros no formato padrão do FastAPI (`{"detail": "..."}`).
   - Todo erro HTTP (`400`, `404`, `422`) DEVE retornar um JSON obedecendo ao schema `ApiError`:
     - `type` (URI, ex: `https://api.taskflow.dev/errors/not-found`)
     - `title` (string resumida)
     - `status` (int HTTP status code)
     - `detail` (mensagem legível explicando o erro)
     - `instance` (path da requisição, ex: `/api/v1/tasks`)
     - `invalidParams` (lista opcional de `{"name": "...", "reason": "..."}` para erros 422).
2. **Fidelidade ao Contrato JSON (`camelCase`):**
   - Os atributos expostos no JSON devem respeitar exatamente a grafia do Apidog: `dueDate`, `projectId`, `createdAt`, `updatedAt`, `totalItems`, `totalPages`, `hasNext`, `invalidParams`.
3. **Semântica HTTP Estrita:**
   - `POST /api/v1/tasks` e `POST /api/v1/projects` retornam `201 Created` (incluindo header `Location: /api/v1/tasks/{id}` na criação de tarefas).
   - `DELETE /api/v1/tasks/{id}` retorna `204 No Content` sem corpo de resposta.
   - `PATCH /api/v1/tasks/{id}` realiza atualização parcial (`exclude_unset=True`).
````

#### 1.2. Criando o `AGENTS.md` (Constituição Operacional Nativa do Antigravity)
Destaque em sala: **O Google Antigravity descobre e carrega automaticamente o arquivo `AGENTS.md` localizado na raiz do projeto em todas as conversas!** Crie o arquivo `AGENTS.md` na raiz:

```markdown
# AGENTS.md — Governança de Agentes e Personas (SDD)

Este repositório utiliza a metodologia **Spec-Driven Development (SDD)**.
Todas as decisões de código e arquitetura estão subordinadas à Constituição Técnica em `@[STYLEGUIDE.md](STYLEGUIDE.md)` e à Especificação de Contrato em `@[SPEC.md](SPEC.md)`.

## Regras Globais do Agente
1. **Zero Vibe Coding:** Nunca escreva ou altere arquivos de código em `src/` sem que a tarefa esteja previamente descrita em `PLAN.md` e expressamente autorizada pelo usuário.
2. **Fonte Única da Verdade:** Os schemas, nomes de campos, validações (`minLength`, `maxLength`, `pattern`, `enum`) e códigos de status HTTP devem seguir estritamente o arquivo `@[TakFlow API.Apidog.json](TakFlow API.Apidog.json)`.
3. **Rastreabilidade:** Ao concluir uma tarefa autorizada, atualize o status correspondente em `PLAN.md` de `[ ]` para `[x]`.

---

## Personas de Execução

Quando o usuário invocar uma persona entre colchetes no início do prompt, assuma estritamente o papel correspondente:

### 1. `[Tech Lead]`
- **Foco:** Análise de especificação, design de arquitetura e planejamento técnico.
- **Comportamento:** Lê `SPEC.md`, `STYLEGUIDE.md` e `TakFlow API.Apidog.json` para criar ou atualizar o arquivo `PLAN.md`.
- **Restrição Absoluta:** NÃO escreva código Python de aplicação (`*.py`) enquanto atuar como `[Tech Lead]`. Produza exclusivamente o roteiro técnico sequencial e granular no `PLAN.md`.

### 2. `[Backend Coder]`
- **Foco:** Implementação limpa, tipada e aderente ao contrato.
- **Comportamento:** Executa **apenas** os passos do `PLAN.md` solicitados pelo usuário no turno atual, consultando constantemente o `STYLEGUIDE.md` e os schemas do Apidog.
- **Restrição Absoluta:** Pare imediatamente após concluir os passos solicitados e aguarde a revisão humana antes de avançar para os próximos itens do `PLAN.md`.

### 3. `[QA Engineer]`
- **Foco:** Verificação de contrato, testes automatizados (`pytest`) e casos de borda.
- **Comportamento:** Implementa e executa testes automatizados baseados nas categorias de teste e Expectations do `TakFlow API.Apidog.json`. Não dá uma tarefa por encerrada até que `pytest` passe com 100% de sucesso.
```

---

### Passo 2: Fase 2 — Specify (A Intenção e o Contrato)

Agora vamos conectar o contrato visual exportado do Apidog (`TakFlow API.Apidog.json`) aos requisitos de funcionamento do nosso backend criando o arquivo `SPEC.md` na raiz:

```markdown
# SPEC.md — Especificação do Sistema (TaskFlow API)

## 1. Objetivo e Contrato da API
Este projeto implementa a **TaskFlow API**, definida formalmente no arquivo de especificação do Apidog `@[TakFlow API.Apidog.json](TakFlow API.Apidog.json)`.

## 2. Estratégia Schema-First (Extração de Tipagens)
O sistema DEVE priorizar a extração das tipagens estáticas (modelos Pydantic v2 em `src/api/schemas.py`) diretamente dos `Data Schemas` definidos no Apidog **antes** de implementar qualquer rota ou lógica de negócio:
1. **`Task`:** `id` (UUID string), `title` (3..100 chars), `description` (opcional, máx 500 chars), `status` (`TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`), `priority` (`LOW`, `MEDIUM`, `HIGH`, default `MEDIUM`), `dueDate` (datetime opcional), `projectId` (UUID string opcional), `createdAt` (datetime), `updatedAt` (datetime).
2. **`CreateTaskDTO`:** `title`, `description`, `priority`, `dueDate`, `projectId` (validar formato UUID quando informado).
3. **`UpdateTaskDTO`:** `title`, `description`, `status`, `priority`, `dueDate` (todos opcionais para `PATCH`).
4. **`PaginatedTasksResponse`:** envelope contendo `data` (`List[Task]`) e `meta` (`page`, `limit`, `totalItems`, `totalPages`, `hasNext`).
5. **`Project` & `CreateProjectDTO`:** `id` (UUID), `name` (3..80 chars), `slug` (regex `^[a-z0-9-]+$`), `description` (opcional), `status` (`ACTIVE`, `ARCHIVED`, `ON_HOLD`, default `ACTIVE`), `createdAt`, `updatedAt`.
6. **`ApiError` & `InvalidParam`:** estrutura completa RFC 9457 conforme definição `#/definitions/17551226` do Apidog.

## 3. Regras de Negócio e Comportamento dos Endpoints
1. **Coleção `/api/v1/tasks`:**
   - `GET /api/v1/tasks`: Suporta paginação (`page >= 1`, `1 <= limit <= 100`, default `limit=10`), filtros exatos por `status` e `priority`, e busca textual case-insensitive (`search`) no título ou descrição.
   - `POST /api/v1/tasks`: Cria tarefa com status inicial `TODO`, gera UUIDv4 e timestamps UTC, e retorna `201 Created` com cabeçalho HTTP `Location: /api/v1/tasks/{id}`.
   - `GET /api/v1/tasks/{id}`, `PATCH /api/v1/tasks/{id}`, `DELETE /api/v1/tasks/{id}`: Operam sobre o recurso pelo UUID. `DELETE` retorna `204 No Content`.
2. **Coleção `/api/v1/projects`:**
   - `GET /api/v1/projects`: Lista projetos com filtro opcional por `status`.
   - `POST /api/v1/projects`: Cria novo projeto (`201 Created`) validando o padrão de `slug`.
   - `GET /api/v1/projects/{id}`: Retorna detalhes do projeto ou `404` (RFC 9457).
   - `GET /api/v1/projects/{projectId}/tasks`: Sub-recurso hierárquico que retorna as tarefas vinculadas ao `projectId` (ou `404` caso o projeto não exista).
3. **Expectations e Casos de Teste do Apidog:**
   - O UUID `00000000-0000-0000-0000-000000000000` é reservado pelas Expectations do Apidog para simular recurso inexistente e DEVE sempre retornar `404 Not Found` com payload RFC 9457.
   - Payloads com JSON sintaticamente malformado em requisições `POST`/`PATCH` devem ser interceptados e retornar `400 Bad Request` no padrão RFC 9457.
```

---

### Passo 3: Fase 3 — Plan (O Roteiro Técnico com o `[Tech Lead]`)

Mostre aos alunos que agora temos a **Constitution** (`STYLEGUIDE.md` + `AGENTS.md`) e a **Specification** (`SPEC.md` + `TakFlow API.Apidog.json`).

#### 3.1. Executando o Prompt de Planejamento no Antigravity
Abra o painel de Chat do Agente no **Google Antigravity** e envie o comando abaixo (usando `@` para referenciar os arquivos no contexto):

```text
Atuando como [Tech Lead], leia o @SPEC.md, o @"TakFlow API.Apidog.json" e nosso @STYLEGUIDE.md. Crie um arquivo chamado PLAN.md contendo um checklist sequencial e granular das tarefas técnicas necessárias para implementar esta API.

Não escreva código ainda! Apenas detalhe os passos de arquitetura, configuração, extração de tipos Pydantic v2 a partir dos schemas do Apidog, camada de banco em memória com seed, tratamento de erros RFC 9457, implementação das rotas e suíte de testes pytest.
```

> **💡 Demonstração Pedagógica em Sala (Slash Commands do Antigravity):**
> Mostre aos alunos que no Antigravity eles também podem digitar **`/plan`** para acionar o modo nativo de planejamento ou **`/grill-me`** para pedir que o agente faça perguntas de alinhamento sobre requisitos ambíguos antes de consolidar o plano!

#### 3.2. A Validação Humana do `PLAN.md` (*Human-in-the-Loop*)
Abra o arquivo `PLAN.md` recém-criado pelo agente no editor do Antigravity e faça uma revisão crítica ao vivo com a turma:
1. **Verifique a precedência topológica:** O passo de criar `src/api/schemas.py` veio **antes** de `database.py` e `routers/`? (Tem que vir, pois todo o sistema depende das tipagens extraídas do Apidog!).
2. **Verifique requisitos específicos:** O plano menciona explicitamente o cabeçalho `Location` no `POST /api/v1/tasks`, a Expectation do UUID `00000000-0000-0000-0000-000000000000` e o sub-recurso `/api/v1/projects/{projectId}/tasks`?
3. **Intervenção Humana:** Edite manualmente uma linha do `PLAN.md` na frente dos alunos (por exemplo, adicionando um critério de aceite extra em um passo) e salve o arquivo. Explique: *"Quem manda na arquitetura somos nós; o `PLAN.md` revisado agora é a lei de execução do `[Backend Coder]`"*.

---

### Passo 4: Fase 4 — Tasks & Implement (Execução Granular)

Agora que o roteiro técnico está fechado e auditado, delegamos a construção **passo a passo** (em pequenos lotes verificáveis).

#### 4.1. Lote 1: Estrutura Base e Extração de Tipagens (Passos 1 e 2)
No chat do Antigravity, envie:

```text
Atuando como [Backend Coder], inicie a execução da Fase 1 (configuração/estrutura) e Fase 2 (extração das tipagens em src/api/schemas.py) descritas no @PLAN.md.

Certifique-se de seguir estritamente as regras de arquitetura do @STYLEGUIDE.md e as tipagens e validações do @"TakFlow API.Apidog.json". Marque os itens concluídos no @PLAN.md e avise quando terminar para podermos revisar e avançar para o próximo passo.
```

**O que observar com os alunos:**
* Abra o arquivo `src/api/schemas.py` gerado.
* Mostre como o agente extraiu os Enums (`TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`), o regex `^[a-z0-9-]+$` do `slug` de `Project`, os limites `min_length=3, max_length=100` e a classe `ApiError` idêntica à definição `#/definitions/17551226` do `TakFlow API.Apidog.json`.
* Mostre que o agente parou exatamente onde mandamos e marcou `[x]` nos passos correspondentes do `PLAN.md`!

#### 4.2. Lote 2: Tratamento de Erros RFC 9457 e Camada de Dados (Fase 3 do Plano)
Após aprovar os schemas no *Diff Overlay* do Antigravity, envie o comando para o próximo bloco:

```text
Os schemas foram revisados e aprovados! Agora, atuando como [Backend Coder], execute a Fase 3 do @PLAN.md (implementação de src/api/exceptions.py no padrão RFC 9457 e src/api/database.py com seed inicial e operações CRUD thread-safe).

Respeite o @STYLEGUIDE.md e o @SPEC.md. Atualize o @PLAN.md ao finalizar e aguarde nossa revisão.
```

#### 4.3. Lote 3: Implementação dos Routers e Entrypoint FastAPI (Fase 4 do Plano)
Após revisar `exceptions.py` e `database.py`, autorize a criação das rotas HTTP:

```text
Camada de dados e exceções aprovadas! Atuando como [Backend Coder], execute a Fase 4 do @PLAN.md implementando src/api/routers/tasks.py, src/api/routers/projects.py e src/api/main.py.

Garanta o cumprimento do header Location no POST, status 204 no DELETE, middleware para JSON malformado (400 RFC 9457) e a Expectation de 404 para o UUID 00000000-0000-0000-0000-000000000000.
```

#### 4.4. Lote 4: Verificação de Contrato Automatizada com `[QA Engineer]` (Fase 5 do Plano)
Para encerrar o ciclo com engenharia de verdade, convocamos o `[QA Engineer]`:

```text
Atuando como [QA Engineer], execute a Fase 5 do @PLAN.md. Crie a suíte de testes automatizados em src/api/tests/ (test_tasks.py, test_projects.py, test_errors.py) cobrindo os cenários positivos, negativos, limites e RFC 9457 definidos no @"TakFlow API.Apidog.json".

Em seguida, execute o pytest no terminal para comprovar que todos os testes passam com 100% de sucesso e marque o @PLAN.md como 100% concluído!
```

---

### Passo 5: Demonstração Bônus — Evolução Spec-Driven (Mudança de Requisito ao Vivo)

Para provar aos alunos por que o SDD supera o Vibe Coding na manutenção de sistemas, proponha uma evolução rápida nos últimos 10 minutos da aula:

**Novo Requisito de Produto:**
*"Precisamos de um endpoint `POST /api/v1/tasks/{id}/complete` que marca uma tarefa diretamente como `DONE` e atualiza o `updatedAt`, retornando `409 Conflict` (no padrão RFC 9457) caso a tarefa esteja com status `BLOCKED`."*

Mostre o fluxo correto em 3 minutos:
1. Adicione a regra da rota `POST /api/v1/tasks/{id}/complete` em uma seção **"4. Evolução v1.1"** no `SPEC.md`.
2. Peça ao **`[Tech Lead]`**:
   ```text
   Atuando como [Tech Lead], leia a seção 4 recém-adicionada no @SPEC.md e adicione uma "Fase 6: Endpoint de Conclusão Rápida de Tarefa (v1.1)" ao nosso @PLAN.md com os passos necessários em database, exceptions, routers e tests. Não escreva código ainda.
   ```
3. Revise os 3 itens novos no `PLAN.md` e peça ao **`[Backend Coder]`** + **`[QA Engineer]`** para executarem a Fase 6 e rodarem o `pytest`.
4. **Resultado:** Funcionalidade nova entregue em minutos, 100% documentada na especificação, seguindo a RFC 9457 e com testes automatizados passando!

---

## 🏆 Desafio Prático para os Alunos (Em Sala ou Para Casa)

Utilizando o template SDD da aula no **Google Antigravity**:

1. **FaseSpecify:** Atualize o `SPEC.md` adicionando o requisito de **Comentários em Tarefas (`Task Comments`)**:
   * `GET /api/v1/tasks/{taskId}/comments` (lista comentários da tarefa ou retorna `404` RFC 9457 se a tarefa não existir).
   * `POST /api/v1/tasks/{taskId}/comments` (cria comentário com `author`: string `2..60` chars e `content`: string `1..300` chars, retornando `201 Created`).
2. **Fase Plan:** Use a persona `[Tech Lead]` no Antigravity para adicionar os passos de implementação no `PLAN.md`.
3. **Fase Implement:** Execute os passos com `[Backend Coder]` e valide com `[QA Engineer]` rodando `pytest -v`.
4. **Entrega:** Os arquivos `SPEC.md`, `PLAN.md` (com todos os checkboxes `[x]`) e os testes passando no `pytest`.
