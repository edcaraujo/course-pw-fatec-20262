# 🧪 Laboratório Prático: Design, Especificação e Mocks com Apidog
## Disciplina: Programação Web (2026.2) — Fatec Ribeirão Preto
### Aula 04: API: Contextualização

---

## 🎯 Objetivo da Prática

Neste laboratório prático, aplicaremos a abordagem **Design-First (Spec-Driven Design)** para conceber, especificar, simular e testar a **TaskFlow API** utilizando o **Apidog** como suíte integrada. 

Ao final desta atividade, você terá:
1. Modelado visualmente contratos no padrão **OpenAPI 3.0 / JSON Schema** sem escrever YAML manualmente.
2. Aplicado na prática as restrições arquiteturais REST (recursos semânticos, verbos HTTP corretos, códigos de status e padronização com **RFC 9457 / RFC 7807**).
3. Ativado um **Mock Server** inteligente com dados dinâmicos (**Faker.js**) e cenários condicionais (**Expectations**), permitindo testar requisições reais via terminal (`curl`) e desbloquear o desenvolvimento frontend **sem nenhuma linha de backend prévia**!

---

## 🛠️ Pré-requisitos & Ferramentas

* **Apidog instalado:** Aplicativo Desktop (Windows, macOS, Linux) ou acesso via navegador em [https://app.apidog.com](https://app.apidog.com).
* **Terminal de linha de comando:** `bash`, `zsh` ou PowerShell com o utilitário `curl` instalado.
* **Arquivo de especificação de referência:** Disponível em [`src/TakFlow API.Apidog.json`](src/TakFlow%20API.Apidog.json) para consulta e importação no Apidog.

---

## 📋 Roteiro Passo a Passo

### Etapa 1: Criação da Workspace & Projeto no Apidog

1. Abra o **Apidog** e faça login com sua conta institucional ou pessoal.
2. No painel superior esquerdo, clique no seletor de Workspace e crie uma nova:
   * **Nome da Workspace:** `Fatec ADS - Programação Web`
3. Dentro da workspace, clique no botão **"+ New Project"**:
   * **Tipo de Projeto:** `HTTP Project`
   * **Nome do Projeto:** `TaskFlow API`
4. Acesse **Project Settings** (engrenagem no canto inferior esquerdo) ➔ **Basic Settings**:
   * **Title:** `TaskFlow API`
   * **Version:** `1.0.0`
   * **Description:** `API de gerenciamento ágil de tarefas e projetos da disciplina de Programação Web.`
5. No canto superior direito, localize o seletor de ambientes e note os servidores nativos:
   * **Cloud Mock:** `https://mock.apidog.com/m1/...` (servidor de simulação em nuvem, acessível pela Internet).
   * **Local Mock:** `http://127.0.0.1:4523/m1/...` (servidor de simulação local provido pelo app desktop).

---

### Etapa 2: Modelagem Visual de Endpoints da Coleção `/tasks`

1. No menu lateral esquerdo, selecione a aba **APIs**.
2. Clique no ícone **"+"** ao lado de APIs ➔ **"New Folder"**:
   * **Folder Name:** `Tasks`
3. Com o botão direito sobre a pasta `Tasks`, clique em **"New API"** para criar cada rota do CRUD:

| Nome da API | Método | Path | Descrição / Parâmetros |
| :--- | :---: | :--- | :--- |
| **Listar Tarefas** | `GET` | `/api/v1/tasks` | Retorna lista de tarefas paginadas |
| **Criar Tarefa** | `POST` | `/api/v1/tasks` | Cadastra nova tarefa no sistema |
| **Obter Detalhes da Tarefa** | `GET` | `/api/v1/tasks/{id}` | Path Param `id` (Type: `string`, Format: `uuid`) |
| **Atualizar Tarefa** | `PATCH`| `/api/v1/tasks/{id}` | Atualiza status e prioridade da tarefa |
| **Remover Tarefa** | `DELETE`| `/api/v1/tasks/{id}` | Exclui o registro especificado |

> **Dica de Produtividade no Apidog:** Ao digitar `/api/v1/tasks/{id}` no campo de rota, o Apidog identifica automaticamente as chaves `{id}` e insere o parâmetro na aba **Parameters ➔ Path Parameters**. Configure seu tipo para `string` e formato para `uuid`.

---

### Etapa 3: Criação dos Data Schemas Reutilizáveis (OpenAPI 3.0)

Para manter o contrato no padrão **DRY (*Don't Repeat Yourself*)**, criaremos esquemas de dados compartilhados:

1. No menu lateral, clique na aba **"Data Schemas"** (ou *Components*).
2. Clique em **"+ New Schema"** e crie os modelos abaixo:

#### 1. Schema: `Task` (Entidade Completa)
* `id`: `string`, format `uuid`, Required
* `title`: `string`, minLength `3`, maxLength `100`, Required
* `description`: `string`, maxLength `500`
* `status`: `string`, Enum: `["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]`, Required
* `priority`: `string`, Enum: `["LOW", "MEDIUM", "HIGH"]`, Default: `MEDIUM`, Required
* `dueDate`: `string`, format `date-time`
* `projectId`: `string`, format `uuid`
* `createdAt`: `string`, format `date-time`, Required
* `updatedAt`: `string`, format `date-time`, Required

#### 2. Schema: `CreateTaskDTO` (Carga de Criação)
* `title`: `string`, minLength `3`, maxLength `100`, Required
* `description`: `string`, maxLength `500`
* `priority`: `string`, Enum: `["LOW", "MEDIUM", "HIGH"]`, Default: `MEDIUM`
* `dueDate`: `string`, format `date-time`
* `projectId`: `string`, format `uuid`

#### 3. Schema: `UpdateTaskDTO` (Carga de Atualização Parcial)
* `title`: `string`, minLength `3`, maxLength `100`
* `description`: `string`, maxLength `500`
* `status`: `string`, Enum: `["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]`
* `priority`: `string`, Enum: `["LOW", "MEDIUM", "HIGH"]`
* `dueDate`: `string`, format `date-time`

#### 4. Schema: `ApiError` (Padronização RFC 9457 / RFC 7807 - Problem Details)
* `type`: `string`, format `uri` (Ex: `https://api.taskflow.dev/errors/validation-error` ou `about:blank`)
* `title`: `string` (Ex: `Erro de Validação Semântica`)
* `status`: `integer` (Ex: `422`)
* `detail`: `string` (Ex: `O campo 'title' é obrigatório.`)
* `instance`: `string` (Ex: `/api/v1/tasks`)
* `invalidParams`: `array` de objetos contendo `name` (string) e `reason` (string)

---

### Etapa 4: Vinculação de Schemas & Status Codes Semânticos

Retorne à aba **APIs** e ajuste os corpos e respostas das rotas:

1. **`POST /api/v1/tasks`:**
   * Na aba **Body** (formato JSON): selecione **Generate from Schema** ➔ escolha `CreateTaskDTO`.
   * Em **Responses**:
     * Código `201 Created`: Selecione o schema `Task`.
       * Adicione o cabeçalho de resposta: `Location` (Exemplo: `/api/v1/tasks/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`).
     * Clique em **+ Add Response** ➔ Código `400 Bad Request`: Schema `ApiError`.
     * Adicione resposta ➔ Código `422 Unprocessable Entity`: Schema `ApiError`.
2. **`GET /api/v1/tasks/{id}`:**
   * Em **Responses**:
     * Código `200 OK`: Schema `Task`.
     * Adicione resposta ➔ Código `404 Not Found`: Schema `ApiError`.
3. **`PATCH /api/v1/tasks/{id}`:**
   * Na aba **Body**: Schema `UpdateTaskDTO`.
   * Em **Responses**: `200 OK` (Schema `Task`), `404 Not Found` (Schema `ApiError`), `422 Unprocessable Entity` (Schema `ApiError`).
4. **`DELETE /api/v1/tasks/{id}`:**
   * Em **Responses**: altere o código de sucesso para **`204 No Content`** (remova o corpo de resposta!).
   * Adicione resposta `404 Not Found`: Schema `ApiError`.

---

### Etapa 5: Query Parameters & Envelope Paginado

No endpoint `GET /api/v1/tasks`:

1. Acesse a aba **Parameters ➔ Query Parameters** e adicione:
   * `page`: Type `integer`, Default: `1`, Minimum: `1` (Descrição: "Página atual").
   * `limit`: Type `integer`, Default: `10`, Maximum: `100` (Descrição: "Itens por página").
   * `status`: Type `string`, Enum: `["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]` (Opcional).
   * `priority`: Type `string`, Enum: `["LOW", "MEDIUM", "HIGH"]` (Opcional).
   * `search`: Type `string` (Descrição: "Termo para busca textual no título").
2. Em **Data Schemas**, crie o schema **`PaginatedTasksResponse`**:
   * `data`: `array` de items com referência ao schema `Task`.
   * `meta`: `object` com os campos obrigatórios `page` (int), `limit` (int), `totalItems` (int), `totalPages` (int) e `hasNext` (boolean).
3. No endpoint `GET /api/v1/tasks`, defina a resposta `200 OK` utilizando o schema `PaginatedTasksResponse`.

---

### Etapa 6: Configuração de Smart Mocks & Expressões Faker

O motor de Smart Mock do Apidog gera automaticamente valores aleatórios verossímeis:

1. Acesse o schema **`Task`** em **Data Schemas**:
   * No campo `id`, clique na coluna **Mock** e configure a regra: `@guid`.
   * No campo `title`, configure a regra: `@ctitle(3, 7)`.
   * No campo `description`, configure a regra: `@cparagraph(1, 2)`.
   * No campo `dueDate`, configure a regra: `@datetime("yyyy-MM-dd'T'HH:mm:ss'Z'")`.
2. Acesse o schema **`PaginatedTasksResponse`**:
   * No campo `meta.totalItems`, configure: `@integer(20, 150)`.
   * No campo `meta.totalPages`, configure: `@integer(2, 15)`.

---

### Etapa 7: Configuração de Expectations Condicionais (Simulando 404)

Vamos configurar uma regra de negócio simulada: se o cliente solicitar um ID inexistente, o mock responderá automaticamente com **HTTP 404**:

1. Abra o endpoint **`GET /api/v1/tasks/{id}`**.
2. Vá até a aba **Mock** (ao lado de Run/Edit) ➔ Clique em **"+ New Expectation"**.
3. Configure a expectativa:
   * **Expectation Name:** `Simular Tarefa Inexistente (404)`
   * **Request Condition:**
     * Marque `Path Parameter 'id' equals`: `00000000-0000-0000-0000-000000000000`
   * **Response:**
     * Status Code: `404 Not Found`
     * Body (JSON):
       ```json
       {
         "type": "https://api.taskflow.dev/errors/not-found",
         "title": "Recurso Inexistente",
         "status": 404,
         "detail": "A tarefa informada com o identificador informado não foi localizada.",
         "instance": "/api/v1/tasks/00000000-0000-0000-0000-000000000000"
       }
       ```
4. Clique em **Save**.

---

### Etapa 8: Consumo Externo da API via Terminal (cURL)

Agora vamos testar nosso Mock Server disparando chamadas externas no terminal:

1. No Apidog, copie a **URL do Cloud Mock** (exemplo: `https://mock.apidog.com/m1/105432-0-default`).
2. Abra seu terminal e execute:

```bash
# 1. Listar tarefas com filtros e paginação
curl -X GET "https://mock.apidog.com/m1/SEU_ID/api/v1/tasks?page=1&limit=5&status=IN_PROGRESS" \
     -H "Accept: application/json"

# 2. Criar uma nova tarefa enviando payload JSON
curl -X POST "https://mock.apidog.com/m1/SEU_ID/api/v1/tasks" \
     -H "Content-Type: application/json" \
     -d '{"title": "Configurar migrations no Supabase", "priority": "HIGH"}'

# 3. Testar a nossa Expectation de 404 com o UUID configurado
curl -X GET "https://mock.apidog.com/m1/SEU_ID/api/v1/tasks/00000000-0000-0000-0000-000000000000" \
     -H "Accept: application/json"
```

Observe que o servidor responde instantaneamente com códigos de status precisos, cabeçalhos adequados e estruturas de dados dinâmicas sem termos programado nenhuma linha de Python/Node!

---

### Etapa 9: Publicação da Documentação & Test Scenarios

1. **Compartilhar a Documentação:**
   * No menu lateral esquerdo, clique em **Share** (ícone de link/globo).
   * Clique em **+ New Share** ➔ Defina o nome como `TaskFlow API - Documentação v1`.
   * Clique em **Save and Open** para abrir o portal interativo para desenvolvedores com console de testes ("Try it Out").
2. **Criar um Cenário de Teste Automatizado:**
   * No menu lateral, acesse **Testing ➔ Test Scenarios ➔ + New Scenario**.
   * Nome: `Validação de Contrato de Tarefas`.
   * Adicione o passo `POST /api/v1/tasks` com asserção: `Status Code equals 201`.
   * Adicione o passo `GET /api/v1/tasks` com asserção: `Status Code equals 200`.
   * Clique em **Run** e visualize o relatório 100% aprovado.

---

## 🏆 Desafio de Fixação (Laboratório Individual)

Para demonstrar autonomia na modelagem Design-First, expanda a especificação implementando o recurso **`Projects`**:

1. **Crie o Schema `Project` em Data Schemas:**
   * `id`: UUID (Obrigatório, Mock: `@guid`)
   * `name`: string, tamanho `3..80` (Obrigatório, Mock: `@ctitle(3, 6)`)
   * `slug`: string com padrão regex `^[a-z0-9-]+$` (Ex: `portal-academico`)
   * `description`: string (Opcional)
   * `status`: Enum `["ACTIVE", "ARCHIVED", "ON_HOLD"]` (Default: `ACTIVE`)
   * `createdAt` e `updatedAt`: date-time
2. **Crie a pasta `Projects` e modele os seguintes endpoints:**
   * `GET /api/v1/projects` (paginado, com filtro por status)
   * `POST /api/v1/projects` (com schema de entrada `CreateProjectDTO`)
   * `GET /api/v1/projects/{id}` (retornos `200` e `404` com `ApiError`)
   * `GET /api/v1/projects/{projectId}/tasks` (sub-recurso hierárquico retornando array de `Task`)
3. **Valide a Entrega:**
   * Realize uma chamada via `curl` contra o endpoint hierárquico `/api/v1/projects/{projectId}/tasks` e confirme a resposta no Mock Server.

---

## 📂 Arquivo de Referência

Caso precise comparar seu progresso ou importar a especificação completa de uma só vez no Apidog:
* Especificação do projeto Apidog: [`src/TakFlow API.Apidog.json`](src/TakFlow%20API.Apidog.json)

*(No Apidog: Settings ➔ Import Data ➔ Apidog ➔ Selecione o arquivo acima).*
