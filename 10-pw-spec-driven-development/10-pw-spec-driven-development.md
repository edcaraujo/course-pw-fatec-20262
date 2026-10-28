---
marp: true

author: "Eduardo Cruz Araujo"
title: "Programação Web"
description: "Disciplina de Programação Web."

theme: "default"
class: "invert"

footer: "Eduardo Cruz Araujo | Fatec | 2026.2 | Programação Web | Spec-Driven Development (SDD)"

paginate: "true"

---

# Programação Web :mortar_board:
## Spec-Driven Development (SDD) na Prática
### Engenharia de Software Determinística com Agentes de IA, Contratos OpenAPI/Apidog e Google Antigravity

---

Spec-Driven Development (SDD)
## Agenda e Roteiro de Aprendizagem (2h)

* **01. O Fim do "Vibe Coding" e a Metodologia SDD (20 min):**
  * A crise do *Vibe Coding*: tentativa e erro no chat, *Context Drift* e dívida técnica silenciosa.
  * O que é **Spec-Driven Development (SDD)**: da escrita imperativa à especificação rigorosa de intenções.
  * As **4 Fases do Ciclo SDD**: *Constitution*, *Specify*, *Plan* e *Tasks & Implement*.
  * Como Agentes de IA operam: janela de contexto, *Progressive Disclosure* e o loop agêntico no **Google Antigravity**.
* **02. Fases 1 & 2: Constitution e Specify com Apidog (40 min):**
  * **Constitution:** Governança imutável da IA com `STYLEGUIDE.md` (arquitetura/padrões) e `AGENTS.md` (personas e regras nativas do Antigravity).
  * **Specify:** Utilizando o contrato da **TaskFlow API** (`TakFlow API.Apidog.json`) e construindo o `SPEC.md`.
* **03. Fase 3: A Etapa Crucial do "Plan" (30 min):**
  * Por que nunca devemos pular direto da especificação para o código (*One-Shot Coding Fallacy*).
  * Atuando como `[Tech Lead]` no Antigravity para sintetizar `STYLEGUIDE.md` + `SPEC.md` em um `PLAN.md` determinístico.
  * *Human-in-the-Loop (HITL)*: A auditoria e revisão arquitetural humana do plano.
* **04. Fase 4: Tasks & Implement no Google Antigravity (30 min):**
  * Execução granular (*Task by Task*) com `[Backend Coder]` e validação com `[QA Engineer]`.
  * Conformidade contínua com a *Constitution*, geração de tipos Pydantic v2, ORM SQLAlchemy 2.0 e testes `pytest`.

---

Spec-Driven Development (SDD)
## Parte 1: O Fim do "Vibe Coding" e a Metodologia SDD (20 min)

---

## A Anatomia do "Vibe Coding" e Seus Riscos Sistêmicos

O termo **"Vibe Coding"** descreve a prática informal de construir software conversando livremente com um LLM por tentativa e erro ("*cria uma API de tarefas aí*", "*deu erro na linha 40, arruma*", "*agora coloca banco de dados*"), guiando-se apenas pela intuição momentânea:

```text
                        O CICLO VICIOSO DO "VIBE CODING"
   ┌────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
   │ 1. Prompt Vago no Chat │ ──► │ 2. IA Alucina Padrões  │ ──► │ 3. Código Funciona     │
   │ "Faz um CRUD de Tasks" │     │ (Escolhe libs/estilos  │     │ Parcialmente, mas Viola│
   └────────────────────────┘     │  arbitrários a cada    │     │ Arquitetura e Contratos│
               ▲                  │  nova resposta)        │     └───────────┬────────────┘
               │                  └────────────────────────┘                 │
   ┌───────────┴────────────┐                                                ▼
   │ 5. Colapso de Contexto │ ◄───────────────────────────────── ┌────────────────────────┐
   │ A IA quebra a Rota A   │     "Arruma esse bug aqui..."      │ 4. Patch sob Demanda   │
   │ ao tentar consertar B! │                                    │ Sem Visão Sistêmica    │
   └────────────────────────┘                                    └────────────────────────┘
```

### Por que o Vibe Coding colapsa em projetos reais de engenharia?
1. **Deriva Arquitetural (*Architectural Drift*):** Na primeira mensagem a IA usa *Repository Pattern*; na quinta mensagem ela injeta queries SQL puras direto dentro do controller HTTP.
2. **Violação Silenciosa de Contratos:** A IA altera nomes de campos (`due_date` vs. `dueDate`) ou formatos de erro (strings soltas em vez da **RFC 9457**), quebrando o frontend e integrações móveis.
3. **Poluição da Janela de Contexto (*Context Rot*):** Conversas longas cheias de tentativas frustradas confundem o mecanismo de atenção (*Self-Attention*) do modelo.

---

## O Paradigma Spec-Driven Development (SDD)

O **Spec-Driven Development (Desenvolvimento Orientado por Especificação)** substitui a improvisação conversacional por um fluxo de engenharia de software **determinístico, rastreável e escalável**.

```text
          DESENVOLVIMENTO TRADICIONAL / VIBE                  SPEC-DRIVEN DEVELOPMENT (SDD)
   ┌──────────────────────────────────────────┐     ┌──────────────────────────────────────────┐
   │  Ideia ──► Prompt/Código ──► Doc Depois  │     │  Constitution ──► Specify ──► Plan       │
   │                                          │     │         │                      │         │
   │  • O código é a única fonte da verdade.  │     │         ▼                      ▼         │
   │  • A especificação (quando existe) fica  │     │    [Governança]        [Código Auditável]│
   │    defasada na primeira semana.          │     │                                          │
   │  • A IA adivinha decisões de design.     │     │  • A Especificação é a Fonte da Verdade. │
   └──────────────────────────────────────────┘     │  • A IA executa contratos sob restrições.│
                                                    └──────────────────────────────────────────┘
```

> **Princípio Central do SDD:** Na engenharia assistida por Agentes de IA, a qualidade do código gerado é uma função matemática direta da **precisão das restrições (Constitution)**, da **formalidade do contrato (Specify)** e da **granularidade do roteiro técnico (Plan)**.

---

## Comparativo Técnico: Vibe Coding vs. Spec-Driven Development

| Dimensão de Engenharia | Vibe Coding (Ad-Hoc Prompting) | Spec-Driven Development (SDD) |
| :--- | :--- | :--- |
| **Fonte da Verdade** | Histórico volátil do chat (se perde ao fechar a sessão). | Artefatos versionados no Git (`STYLEGUIDE.md`, `AGENTS.md`, `SPEC.md`, `PLAN.md`). |
| **Contrato de Interface** | Implícito; a IA inventa payloads e status HTTP na hora. | Explícito e imutável (OpenAPI 3.0 / `TakFlow API.Apidog.json`). |
| **Papel do Engenheiro** | "Bombeiro" copiando stacktraces de erro de volta para o chat. | **Arquiteto de Sistemas e Revisor** de especificações e planos técnicos. |
| **Previsibilidade da IA** | Baixa (não-determinística; cada execução gera uma estrutura). | **Alta** (ancorada em regras arquiteturais e schemas estritos). |
| **Custo de Contexto (Tokens)**| Explosivo (histórico de tentativas e refatorações falhas). | Enxuto e modular (leitura cirúrgica por tarefa planejada). |
| **Trabalho em Equipe** | Impossível de escalar (conhecimento preso no chat individual). | **Colaborativo** (qualquer dev ou agente reproduz o projeto). |

---

## As 4 Fases Fundamentais do Ciclo SDD

A metodologia SDD estrutura o trabalho entre humanos e agentes de IA em **quatro fases sequenciais com portões de validação (*Quality Gates*)**:

```text
  ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
  │  1. CONSTITUTION     │    │  2. SPECIFY          │    │  3. PLAN             │    │  4. TASKS & IMPLEMENT│
  │  (Regras Imutáveis)  │───►│  (Intenção/Contrato) │───►│  (Roteiro Técnico)   │───►│  (Execução Granular) │
  ├──────────────────────┤    ├──────────────────────┤    ├──────────────────────┤    ├──────────────────────┤
  │ • STYLEGUIDE.md      │    │ • Apidog / OpenAPI   │    │ • PLAN.md            │    │ • Task-by-Task Code  │
  │ • AGENTS.md          │    │   (TakFlow API.json) │    │ • Checklist atômico  │    │ • Conformidade estrita│
  │ • Stack, camadas,    │    │ • SPEC.md            │    │ • Ordem topológica   │    │ • Testes de contrato │
  │   lint e RFC 9457.   │    │ • Regras de negócio. │    │ • Revisão Humana!    │    │   (pytest / curl).   │
  └──────────────────────┘    └──────────────────────┘    └──────────────────────┘    └──────────────────────┘
             │                           │                           ▲                           │
             └───────────────────────────┴───────────────────────────┴───────────────────────────┘
                           Todos os artefatos permanecem ativos no contexto do Agente!
```

1. **Constitution:** Define **COMO** codificar e **QUEM** atua (regras arquiteturais inegociáveis e personas técnicas).
2. **Specify:** Define **O QUE** deve ser construído (contratos de API do Apidog + requisitos de domínio no `SPEC.md`).
3. **Plan:** Define **EM QUE ORDEM** construir (decomposição arquitetural validada pelo desenvolvedor antes do código).
4. **Tasks & Implement:** Executa o plano **PASSO A PASSO**, verificando cada entrega contra o contrato e o guia de estilo.

---

## Como os Agentes de IA Consomem Esses Artefatos

Diferente de um chatbot passivo que apenas responde texto, um **Agente de Engenharia (como o Google Antigravity)** opera em um loop autônomo de percepção, raciocínio e ação (*ReAct / Agentic Loop*):

```text
                               ARQUITETURA DE CONTEXTO DO AGENTE NO SDD
   ┌────────────────────────────────────────────────────────────────────────────────────────┐
   │                           JANELA DE CONTEXTO (CONTEXT WINDOW)                          │
   │  ┌─────────────────────┐  ┌─────────────────────┐  ┌────────────────┐  ┌────────────┐  │
   │  │ System & Workspace  │  │ Contrato & Intenção │  │ Roteiro Ativo  │  │ Memória de │  │
   │  │ Rules (Auto-Loaded) │  │ (@Mentions / Read)  │  │ (@PLAN.md)     │  │ Trabalho   │  │
   │  │ • AGENTS.md         │  │ • SPEC.md           │  │ • [x] Task 1   │  │ • Diffs    │  │
   │  │ • STYLEGUIDE.md     │  │ • TakFlow API.json  │  │ • [ ] Task 2 ◄─┼──│ • Pytest   │  │
   │  └─────────────────────┘  └─────────────────────┘  └────────────────┘  └────────────┘  │
   └────────────────────────────────────────────┬───────────────────────────────────────────┘
                                                │
                                                ▼
               ┌─────────────────────────────────────────────────────────────────┐
               │   LOOP AGÊNTICO:  Raciocínio ──► Ferramenta ──► Verificação     │
               │   (Read File ──► Edit/Write Code ──► Run Pytest ──► Fix/Done)   │
               └─────────────────────────────────────────────────────────────────┘
```

* Quando fornecemos a **Constitution** e a **Specification**, reduzimos drasticamente a entropia (incerteza) do espaço de busca probabilístico do LLM: o agente não precisa "inventar" nomes de rotas, tipos ou pastas — ele apenas **traduz especificações formais em implementação verificável**.

---

## O Ecossistema Google Antigravity (AI-First Platform)

Nesta aula utilizaremos o **Google Antigravity** (Antigravity IDE / Antigravity 2.0 / CLI `agy`) como nossa plataforma de desenvolvimento orientada a agentes:

```text
                        MODALIDADES DE INTERAÇÃO NO GOOGLE ANTIGRAVITY
   ┌───────────────────────────┬───────────────────────────┬───────────────────────────┐
   │  1. PASSIVA (Tab)         │  2. INSTRUTIVA (Ctrl+I)   │  3. COLABORATIVA (Agent)  │
   ├───────────────────────────┼───────────────────────────┼───────────────────────────┤
   │ • Antigravity Tab         │ • Inline Command no editor│ • Sidebar Chat & Canvas   │
   │ • Supercomplete (diffs)   │ • Refatoração cirúrgica   │ • Multi-step Agent Mode   │
   │ • Tab to Jump / Import    │   de blocos selecionados  │ • Planning Mode & Subagent│
   │ • Ideal para micro-edições│ • Ideal para funções/docs │ • Ideal para o ciclo SDD! │
   └───────────────────────────┴───────────────────────────┴───────────────────────────┘
```

### Recursos Nativos do Antigravity Essenciais para o SDD:
* **Descoberta Automática de Regras (`AGENTS.md` / `GEMINI.md`):** O Antigravity percorre o diretório do projeto até a raiz do repositório e carrega automaticamente as regras do `AGENTS.md` (com orçamento dedicado de até `24 KB` por arquivo / `20.000 tokens` globais).
* **Menções Explícitas (`@`):** Permite anexar arquivos de especificação (`@SPEC.md`, `@TakFlow API.Apidog.json`) diretamente no prompt do agente.
* **Slash Commands (`/plan`, `/grill-me`, `/goal`):** Atalhos nativos que acionam fluxos estruturados de planejamento, entrevista de alinhamento arquitetural e execução autônoma.
* **Customizações de Workspace (`.agents/skills/`):** Permite empacotar fluxos repetitivos do SDD em *Skills* sob demanda (*Progressive Disclosure*).

---

Spec-Driven Development (SDD)
## Parte 2: Fases 1 & 2 — Constitution e Specify com Apidog (40 min)

---

## Fase 1: Constitution — As Regras Imutáveis do Projeto

Na política e no direito, uma **Constituição** é a lei fundamental que nenhuma lei ordinária pode violar. No **Spec-Driven Development**, a *Constitution* é o conjunto de documentos que governa o comportamento técnico da IA:

```text
                               A CONSTITUIÇÃO DO PROJETO (FASE 1)
                                               │
                    ┌──────────────────────────┴──────────────────────────┐
                    ▼                                                     ▼
     ┌─────────────────────────────┐                       ┌─────────────────────────────┐
     │        STYLEGUIDE.md        │                       │          AGENTS.md          │
     │   (Constituição Técnica)    │                       │ (Constituição Operacional)  │
     ├─────────────────────────────┤                       ├─────────────────────────────┤
     │ • Linguagem & Versões       │                       │ • Descoberto nativamente    │
     │ • Arquitetura de Pastas     │                       │   pelo Google Antigravity!  │
     │ • Convenções de Código      │                       │ • Define Personas (Papéis): │
     │ • Padrão de Erros (RFC 9457)│                       │   - [Tech Lead]             │
     │ • Regras de ORM e Tipagem   │                       │   - [Backend Coder]         │
     │ • Proibições Expressas      │                       │   - [QA Engineer]           │
     └─────────────────────────────┘                       └─────────────────────────────┘
```

> **Regra de Ouro:** O agente de IA **jamais** tem permissão para alterar a *Constitution* por conta própria durante a implementação. Se um requisito exigir mudança arquitetural, o humano atualiza a Constituição primeiro.

---

## Anatomia do `STYLEGUIDE.md` (Regras Técnicas e Arquitetura)

Um bom `STYLEGUIDE.md` para agentes não deve ser um texto filosófico longo — deve ser **direto, prescritivo e cheio de restrições verificáveis**:

```markdown
# STYLEGUIDE.md — Constituição Técnica (TaskFlow API)

## 1. Stack Tecnológica Obrigatória
- **Runtime & Framework:** Python 3.12+ com FastAPI.
- **Validação & Serialização:** Pydantic v2 (`BaseModel`, `ConfigDict`, `Field`, `@field_validator`).
- **Persistência / ORM:** SQLAlchemy 2.0 (estilo declarativo moderno com `DeclarativeBase`, `Mapped[...]` e `mapped_column`) ou Repositório Thread-Safe tipado.
- **Testes Automatizados:** `pytest` + `httpx` (`TestClient`).

## 2. Arquitetura de Diretórios e Separação de Responsabilidades
- `src/api/main.py`: Inicialização do app FastAPI, middlewares, CORS e registro de exception handlers.
- `src/api/schemas.py`: Exclusivamente contratos de entrada/saída (DTOs Pydantic v2) espelhando o Apidog.
- `src/api/models.py` & `database.py`: Camada de persistência e modelos de dados.
- `src/api/exceptions.py`: Exceções de domínio e formatadores RFC 9457 (Problem Details).
- `src/api/routers/`: Rotas HTTP divididas por recurso (`tasks.py`, `projects.py`). Proibido colocar lógica de banco diretamente na rota sem passar pela camada de dados.

## 3. Regras Inegociáveis de Implementação
1. **Padronização de Erros (RFC 9457):** Todo erro HTTP (400, 404, 422) DEVE retornar o schema `ApiError` (`type`, `title`, `status`, `detail`, `instance`, `invalidParams`).
2. **Nomenclatura JSON vs. Python:** Respeitar exatamente o `camelCase` definido no contrato OpenAPI (`dueDate`, `projectId`, `createdAt`, `updatedAt`, `totalItems`, `totalPages`, `hasNext`).
3. **Semântica HTTP Estrita:** `POST` retorna `201 Created` com header `Location`; `DELETE` retorna `204 No Content` sem corpo.
```

---

## Anatomia do `AGENTS.md` (Personas no Google Antigravity)

No **Google Antigravity**, o arquivo `AGENTS.md` na raiz do workspace é carregado automaticamente em todas as interações. Nele ancoramos o `STYLEGUIDE.md` e definimos as **Personas de Execução**:

```markdown
# AGENTS.md — Governança de Agentes e Personas (SDD)

Você opera sob a metodologia **Spec-Driven Development (SDD)**.
Antes de qualquer ação, você DEVE respeitar integralmente as regras técnicas de `@[STYLEGUIDE.md](STYLEGUIDE.md)` e o contrato em `@[SPEC.md](SPEC.md)`.

## Personas de Atuação

### 1. `[Tech Lead]` (Arquiteto de Software & Planejador)
- **Missão:** Ler `STYLEGUIDE.md`, `SPEC.md` e a especificação do Apidog (`TakFlow API.Apidog.json`) para gerar ou refinar o arquivo `PLAN.md`.
- **Restrição Estrita:** É PROIBIDO escrever código de aplicação (`*.py`) enquanto estiver atuando como `[Tech Lead]`. Produza apenas arquitetura, análise de impacto e o checklist sequencial no `PLAN.md`.

### 2. `[Backend Coder]` (Engenheiro de Implementação)
- **Missão:** Executar estritamente a tarefa solicitada do `PLAN.md`, seguindo `STYLEGUIDE.md` e os schemas do Apidog.
- **Restrição Estrita:** Implemente apenas os passos autorizados pelo desenvolvedor humano. Não invente endpoints, campos ou dependências fora do contrato. Ao concluir uma tarefa, marque `[x]` no `PLAN.md`.

### 3. `[QA Engineer]` (Engenheiro de Qualidade e Testes de Contrato)
- **Missão:** Escrever e executar testes automatizados (`pytest`) validando casos positivos, negativos, limites e conformidade RFC 9457 conforme as expectativas do Apidog.
```

---

## Fase 2: Specify — O Papel Brilhante do Apidog no SDD

A maior dificuldade na fase de *Specify* sempre foi fazer humanos escreverem especificações técnicas sem ambiguidade. É aqui que o **Apidog** se encaixa perfeitamente:

```text
                       O APIDOG COMO MOTOR DA FASE DE "SPECIFY"
   ┌───────────────────────────────────────┐       ┌───────────────────────────────────────┐
   │     MODELAGEM VISUAL NO APIDOG        │       │    ARTEFATO FORMAL EXPORTADO          │
   │  • Endpoints (/tasks, /projects)      │       │  • TakFlow API.Apidog.json            │
   │  • Data Schemas (Task, Project, Error)│ ────► │  • OpenAPI 3.0 / JSON Schema (yaml)   │
   │  • Validações (minLength, enum, regex)│       │  • Casos de teste e Expectations (404)│
   │  • Exemplos e Status Codes (201, 204) │       │  • 100% legível por Agentes de IA!    │
   └───────────────────────────────────────┘       └───────────────────┬───────────────────┘
                                                                       │
                                                                       ▼
                                                   ┌───────────────────────────────────────┐
                                                   │               SPEC.md                 │
                                                   │  Unifica o Contrato do Apidog com as  │
                                                   │  Regras de Negócio e Persistência!    │
                                                   └───────────────────────────────────────┘
```

* O Apidog elimina a ambiguidade da linguagem natural: em vez de escrever um texto vago dizendo *"a tarefa tem status e prioridade"*, o arquivo [`TakFlow API.Apidog.json`](../04-pw-api-contextualizacao/src/TakFlow%20API.Apidog.json) especifica formalmente `"enum": ["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]`!

---

## Dissecando o Contrato: `TakFlow API.Apidog.json`

Na Aula 04 modelamos a **TaskFlow API** no Apidog. Vamos inspecionar o que o arquivo `TakFlow API.Apidog.json` entrega de bandeja para o nosso Agente no Antigravity:

| Categoria no Apidog | Detalhamento Extraído pelo Agente de IA |
| :--- | :--- |
| **Coleção `Tasks`** | `GET /api/v1/tasks` (paginado + filtros `status`, `priority`, `search`), `POST /api/v1/tasks` (`201` + Header `Location`), `GET /api/v1/tasks/{id}`, `PATCH /api/v1/tasks/{id}`, `DELETE /api/v1/tasks/{id}` (`204`). |
| **Coleção `Projects`** | `GET /api/v1/projects` (filtro `status`), `POST /api/v1/projects`, `GET /api/v1/projects/{id}`, `GET /api/v1/projects/{projectId}/tasks` (sub-recurso hierárquico). |
| **Data Schemas** | `Task`, `CreateTaskDTO`, `UpdateTaskDTO`, `PaginatedTasksResponse`, `Project`, `CreateProjectDTO`, `Error` (RFC 9457). |
| **Restrições de Domínio** | `title` (`minLength: 3`, `maxLength: 100`), `slug` (`pattern: ^[a-z0-9-]+$`), `limit` (`default: 10`, `maximum: 100`), UUIDs validados. |
| **Expectations / Casos** | Simulação explícita de `404 Not Found` para o UUID `00000000-0000-0000-0000-000000000000` com payload RFC 9457 completo. |

> **Vantagem Competitiva:** O Agente no Antigravity consegue ler diretamente o JSON/YAML do Apidog e extrair **100% das tipagens estáticas (Pydantic v2)** sem errar um único nome de atributo ou regra de validação!

---

## Construindo o `SPEC.md` (Unificando Contrato e Negócio)

Enquanto o arquivo do Apidog descreve a **interface externa (HTTP/JSON)**, o arquivo `SPEC.md` conecta esse contrato às **decisões internas de negócio e infraestrutura** do projeto:

```markdown
# SPEC.md — Especificação do Produto e Contrato (TaskFlow API)

## 1. Visão Geral e Fonte de Contrato
Este projeto implementa o backend oficial da **TaskFlow API**, cuja especificação de contrato HTTP, rotas, parâmetros, códigos de status e schemas JSON está definida em `@[TakFlow API.Apidog.json](TakFlow API.Apidog.json)`.

## 2. Diretrizes de Extração de Tipagem (Schema-First)
- O sistema DEVE priorizar a extração das tipagens estáticas (modelos Pydantic v2 em `schemas.py`) diretamente dos `Data Schemas` do Apidog (`Task`, `CreateTaskDTO`, `UpdateTaskDTO`, `PaginatedTasksResponse`, `Project`, `CreateProjectDTO`, `ApiError`) **antes** de implementar qualquer rota ou regra de negócio.

## 3. Regras de Negócio e Persistência
1. **Gerenciamento de Estado / Banco:** Utilizar armazenamento estruturado com pré-carregamento (*seed*) inicial contendo projetos e tarefas para viabilizar testes imediatos.
2. **Criação de Tarefas (`POST /api/v1/tasks`):**
   - Toda nova tarefa recebe automaticamente `id` (UUIDv4), `status = "TODO"`, `createdAt` e `updatedAt` (UTC ISO 8601).
   - Se `projectId` for informado, deve ser um UUID válido; na rota `GET /api/v1/projects/{projectId}/tasks`, verificar se o projeto existe (retornando 404 RFC 9457 caso não exista).
3. **Expectations Obrigatórias do Apidog:**
   - Qualquer consulta, atualização ou remoção pelo UUID `00000000-0000-0000-0000-000000000000` DEVE retornar `404 Not Found` no padrão RFC 9457 (`type: https://api.taskflow.dev/errors/not-found`).
```

---

Spec-Driven Development (SDD)
## Parte 3: Fase 3 — A Etapa Crucial do "Plan" (30 min)

---

## Por Que Não Devemos Pular da Especificação Direto para o Código?

Um erro clássico ao adotar SDD é criar o `SPEC.md` e imediatamente pedir: *"Agora implemente todo o sistema"*. Saltar a fase de **Plan** reintroduz o caos por três motivos técnicos:

```text
               O ABISMO COGNITIVO: ESPECIFICAÇÃO ──► CÓDIGO DIRETO
   ┌──────────────────────────┐                     ┌──────────────────────────┐
   │  SPEC.md + Apidog.json   │ ─── [ PULO CEGO ] ─►│  15 Arquivos Gerados de  │
   │  (2.300 linhas de JSON + │                     │  Uma Vez com Imports     │
   │   requisitos de domínio) │                     │  Circulares e Bugs!      │
   └──────────────────────────┘                     └──────────────────────────┘

               A PONTE ARQUITETURAL: ESPECIFICAÇÃO ──► PLAN.md ──► CÓDIGO
   ┌──────────────────────────┐     ┌──────────────────────────┐     ┌──────────────────────────┐
   │  SPEC.md + Apidog.json   │ ──► │         PLAN.md          │ ──► │  Execução Determinística │
   │  + STYLEGUIDE.md         │     │  (Decomposição Topológica│     │  Passo 1 ──► Passo 2     │
   └──────────────────────────┘     │   Auditada pelo Humano)  │     │  com Validação Contínua! │
                                    └──────────────────────────┘     └──────────────────────────┘
```

1. **Dependência Topológica:** Rotas dependem de repositórios e exceções; repositórios e rotas dependem de schemas Pydantic. O `PLAN.md` força a IA a ordenar a construção da base para o topo.
2. **Custo de Correção (*Cost of Change*):** Corrigir uma decisão arquitetural errada em uma linha de texto no `PLAN.md` leva **10 segundos**. Corrigir a mesma decisão depois que a IA gerou 1.500 linhas de código leva **horas**.
3. **Alinhamento Mental (Humano + IA):** O `PLAN.md` externaliza o raciocínio do modelo antes da execução.

---

## Acionando o `[Tech Lead]` no Google Antigravity

Com os arquivos `STYLEGUIDE.md`, `AGENTS.md`, `SPEC.md` e `TakFlow API.Apidog.json` no workspace, abrimos o chat do **Antigravity** (ou usamos o comando `/plan` / `/grill-me`) e executamos o prompt da **Fase 3**:

```text
Prompt no Chat do Google Antigravity:
──────────────────────────────────────────────────────────────────────────────────────────
Atuando como [Tech Lead], leia o @SPEC.md, o @"TakFlow API.Apidog.json" e nosso
@STYLEGUIDE.md. Crie um arquivo chamado PLAN.md contendo um checklist sequencial e
granular das tarefas técnicas necessárias para implementar esta API.

Não escreva código de aplicação ainda! Apenas detalhe os passos de arquitetura,
configuração do ambiente, extração de tipos Pydantic v2 dos schemas do Apidog,
camada de dados, tratamento de erros RFC 9457, implementação das rotas e testes.
```

> **Dica de Comando Slash no Antigravity:**
> * Use **`/plan`** quando quiser que o Antigravity entre em modo de planejamento estruturado antes de executar mudanças.
> * Use **`/grill-me`** quando quiser que o agente faça uma entrevista rápida de alinhamento arquitetural com você para tirar dúvidas sobre casos de borda antes de fechar o `PLAN.md`!

---

## Anatomia do `PLAN.md` Gerado pela IA

O resultado do trabalho do `[Tech Lead]` é um documento `PLAN.md` com passos atômicos, dependências claras e critérios de aceite para cada etapa:

```markdown
# PLAN.md — Roteiro Técnico de Implementação (TaskFlow API)

## Fase 1: Fundação e Configuração do Projeto
- [ ] **Passo 1.1:** Criar a estrutura de diretórios (`src/api/`, `src/api/routers/`, `src/api/tests/`) e arquivos `__init__.py` e `requirements.txt` conforme `STYLEGUIDE.md`.

## Fase 2: Extração de Tipagens e Contratos (Schema-First)
- [ ] **Passo 2.1:** Implementar `src/api/schemas.py` extraindo fielmente os Data Schemas de `TakFlow API.Apidog.json`: Enums (`TaskStatus`, `Priority`, `ProjectStatus`), `InvalidParam`, `ApiError` (RFC 9457), `Task`, `CreateTaskDTO`, `UpdateTaskDTO`, `Meta`, `PaginatedTasksResponse`, `Project`, `CreateProjectDTO` e `ProjectsResponse`.

## Fase 3: Tratamento de Erros Semânticos (RFC 9457) e Camada de Dados
- [ ] **Passo 3.1:** Implementar `src/api/exceptions.py` com `ApiErrorException` e handlers globais para `400 Bad Request` (JSON malformado/query inválida), `404 Not Found` e `422 Unprocessable Entity` gerando `invalidParams`.
- [ ] **Passo 3.2:** Implementar `src/api/database.py` com armazenamento estruturado thread-safe (`RLock`), seed inicial e operações CRUD paginadas/filtradas para Tasks e Projects.

## Fase 4: Implementação dos Routers HTTP e Entrypoint
- [ ] **Passo 4.1:** Implementar `src/api/routers/tasks.py` (`GET`, `POST` com header `Location`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}` com `204`) respeitando a Expectation do UUID zerado (`404`).
- [ ] **Passo 4.2:** Implementar `src/api/routers/projects.py` (`GET`, `POST`, `GET /{id}`, `GET /{projectId}/tasks`) e conectar tudo em `src/api/main.py`.

## Fase 5: Verificação e Testes de Contrato Automatizados
- [ ] **Passo 5.1:** Implementar suíte de testes em `src/api/tests/` (`test_tasks.py`, `test_projects.py`, `test_errors.py`) e validar 100% de aprovação via `pytest`.
```

---

## A Revisão Humana do Plano (*Human-in-the-Loop*)

A etapa mais nobre do engenheiro de software no SDD acontece **agora**: ler e auditar o `PLAN.md` gerado pela IA antes de autorizar o `[Backend Coder]`.

```text
                       CHECKLIST DE AUDITORIA HUMANA DO PLAN.md
   ┌──────────────────────────────────────────────────────────────────────────────────┐
   │ 1. A ordem dos passos evita dependências quebradas?                              │
   │    ✔ Sim: Schemas (Passo 2.1) vêm antes de Database/Exceptions (Passo 3) e Rotas.│
   │                                                                                  │
   │ 2. Algum requisito do Apidog ou do SPEC.md foi esquecido?                        │
   │    ⚠ Se a IA esqueceu o sub-recurso GET /api/v1/projects/{projectId}/tasks       │
   │      ou o middleware de JSON malformado (400), editamos o PLAN.md agora!         │
   │                                                                                  │
   │ 3. A IA propôs alguma complexidade desnecessária (Over-Engineering)?             │
   │    ⚠ Se a IA incluiu Celery, Redis ou Kafka sem pedirmos no SPEC.md,             │
   │      removemos do PLAN.md com um simples Delete!                                 │
   └──────────────────────────────────────────────────────────────────────────────────┘
```

> **Lição Prática:** Nunca aprove um `PLAN.md` sem ler cada item do checklist. O `PLAN.md` é o contrato de execução entre você (Tech Manager/Arquiteto) e o Agente Codificador.

---

Spec-Driven Development (SDD)
## Parte 4: Fase 4 — Tasks & Implement no Antigravity (30 min)

---

## Executando o Plano de Forma Granular (*Task by Task*)

Com o `PLAN.md` validado, trocamos o chapéu do agente para a persona **`[Backend Coder]`** e delegamos a construção em blocos controlados (1 ou 2 passos por vez):

```text
Prompt no Chat do Google Antigravity:
──────────────────────────────────────────────────────────────────────────────────────────
Atuando como [Backend Coder], inicie a execução do Passo 1.1 e Passo 2.1 descritos
no @PLAN.md.

Certifique-se de seguir estritamente as regras de arquitetura do @STYLEGUIDE.md e
extrair todas as tipagens, enums, validações (minLength, maxLength, pattern, UUID)
do @"TakFlow API.Apidog.json". Atualize o checklist no @PLAN.md e avise quando
terminar para podermos revisar e avançar para o próximo passo.
```

```text
                   FLUXO DE EXECUÇÃO GRANULAR NA FASE 4 (TASKS & IMPLEMENT)
   ┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
   │ Delega Passo 1 e 2 │ ──► │ Agente Lê Regras + │ ──► │ Revisão Humana no  │ ──► │ Delega Passo 3 e 4 │
   │ ao [Backend Coder] │     │ Gera Código + Marca│     │ Visual Diff Overlay│     │ até concluir 100%  │
   │                    │     │ [x] no PLAN.md     │     │ do Antigravity IDE │     │ do PLAN.md!        │
   └────────────────────┘     └────────────────────┘     └────────────────────┘     └────────────────────┘
```

---

## Como a IA Consulta a Constitution Durante a Implementação

Enquanto o `[Backend Coder]` executa o **Passo 2.1 (`schemas.py`)** e o **Passo 3.1 (`exceptions.py`)**, veja como cada linha de código gerada reflete diretamente os artefatos do SDD:

```python
# src/api/schemas.py — Gerado pelo [Backend Coder]
# 1. Extraído de TakFlow API.Apidog.json (#/definitions/17551226)
# 2. Governado por STYLEGUIDE.md (Pydantic v2 + RFC 9457 + camelCase)
class ApiError(BaseModel):
    type: str = Field(..., examples=["https://api.taskflow.dev/errors/validation-error"])
    title: str = Field(..., examples=["Erro de Validação Semântica"])
    status: int = Field(..., examples=[422])
    detail: str = Field(...)
    instance: str = Field(..., examples=["/api/v1/tasks"])
    invalidParams: Optional[List[InvalidParam]] = Field(default=None)

class CreateProjectDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    name: str = Field(..., min_length=3, max_length=80)
    # Regex extraída diretamente do schema Project no Apidog!
    slug: str = Field(..., pattern=r"^[a-z0-9-]+$")
    description: Optional[str] = Field(None)
    status: Optional[ProjectStatus] = Field(default=ProjectStatus.ACTIVE)
```

* O agente não precisou "adivinhar" se o campo de erro era `message`, `error` ou `detail`, nem qual era o regex do `slug`: tudo estava formalizado no contrato do Apidog e exigido pelo `STYLEGUIDE.md`!

---

## Avançando no `PLAN.md`: Rotas e Semântica HTTP (Passos 4.1 e 4.2)

Após inspecionar os diffs de `schemas.py`, `exceptions.py` e `database.py` no **Visual Diff Overlay** do Antigravity, autorizamos o próximo bloco:

```text
Prompt no Chat do Google Antigravity:
──────────────────────────────────────────────────────────────────────────────────────────
O Passo 1, 2 e 3 foram revisados e aprovados. Agora, atuando como [Backend Coder],
execute os Passos 4.1 e 4.2 do @PLAN.md (implementação dos routers de Tasks,
Projects e entrypoint main.py). Respeite todas as regras de status HTTP (201 com
header Location, 204 sem corpo, 404 para o UUID zerado do Apidog) definidas no
@SPEC.md e @STYLEGUIDE.md.
```

```python
# Trecho gerado em src/api/routers/tasks.py respeitando SPEC.md + STYLEGUIDE.md:
@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(payload: CreateTaskDTO, response: Response):
    task = db.create_task(payload)
    # Regra estrita do STYLEGUIDE.md e Apidog: Header Location obrigatório no 201!
    response.headers["Location"] = f"/api/v1/tasks/{task.id}"
    return task
```

---

## Fechando o Ciclo: Verificação com `[QA Engineer]` (Passo 5.1)

No SDD, nenhuma tarefa está completa sem **verificação determinística**. No último passo do `PLAN.md`, acionamos a persona **`[QA Engineer]`** no Antigravity:

```text
Prompt no Chat do Google Antigravity:
──────────────────────────────────────────────────────────────────────────────────────────
Atuando como [QA Engineer], execute o Passo 5.1 do @PLAN.md. Crie a suíte de testes
em src/api/tests/ cobrindo todos os endpoints de Tasks, Projects e o contrato de
erros RFC 9457 (incluindo os casos de teste e a Expectation do UUID zerado do
@"TakFlow API.Apidog.json"). Em seguida, execute o pytest no terminal para comprovar
que 100% dos testes passam e marque o Passo 5.1 como concluído no @PLAN.md.
```

```text
$ pytest src/api/tests -v
================================ test session starts ================================
collected 19 items

src/api/tests/test_errors.py::test_malformed_json_returns_400_rfc9457 PASSED  [  5%]
src/api/tests/test_errors.py::test_validation_error_returns_422_rfc9457 PASSED[ 10%]
src/api/tests/test_projects.py::test_list_projects PASSED                     [ 15%]
src/api/tests/test_projects.py::test_create_project_invalid_slug PASSED       [ 21%]
src/api/tests/test_projects.py::test_get_project_tasks_hierarchy PASSED       [ 26%]
src/api/tests/test_tasks.py::test_list_tasks_pagination_and_filters PASSED    [ 31%]
src/api/tests/test_tasks.py::test_create_task_returns_201_and_location PASSED [ 36%]
src/api/tests/test_tasks.py::test_get_task_apidog_zero_uuid_404 PASSED        [ 42%]
...
================================ 19 passed in 0.42s =================================
```

---

## Evoluindo o Projeto com SDD: Como Mudar Requisitos?

O verdadeiro poder do Spec-Driven Development aparece no **Dia 2**, quando um novo requisito surge (ex: *"Precisamos migrar o armazenamento em memória para SQLAlchemy 2.0 com SQLite/PostgreSQL"* ou *"Adicionar campo `assigneeId` na Task"*):

```text
                  COMO EVOLUIR UM SISTEMA EM SPEC-DRIVEN DEVELOPMENT
   ┌──────────────────────────────────────────────────────────────────────────────────┐
   │  ❌ JEITO ERRADO (Voltar ao Vibe Coding):                                        │
   │     Pedir direto no chat: "Muda o banco para SQLAlchemy 2.0 aí".                 │
   │     Resultado: A especificação fica defasada e o agente quebra metade das rotas. │
   ├──────────────────────────────────────────────────────────────────────────────────┤
   │  ✅ JEITO CERTO (Ciclo SDD Iterativo):                                           │
   │     1. Atualize o Contrato no Apidog (se mudar a API) ou o SPEC.md / STYLEGUIDE. │
   │     2. Peça ao [Tech Lead] para adicionar uma "Fase 6: Migração ORM SQLAlchemy"  │
   │        no PLAN.md.                                                               │
   │     3. Revise o plano, aprove com [Backend Coder] e rode a suíte do [QA Engineer]│
   │        para garantir regressão zero nos contratos HTTP!                          │
   └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Empacotando o Workflow em uma Skill do Antigravity (`.agents/skills/`)

Para não precisar repetir instruções em novos projetos da equipe, podemos transformar nosso fluxo SDD + Apidog em uma **Skill nativa do Google Antigravity**:

```markdown
---
name: sdd-apidog-workflow
description: >-
  Executa o ciclo Spec-Driven Development (Constitution, Specify, Plan, Implement)
  a partir de um arquivo de contrato do Apidog (*.Apidog.json ou openapi.yaml).
  Ative esta skill quando o usuário pedir para planejar ou implementar endpoints
  seguindo a metodologia SDD.
---

# Workflow SDD com Apidog

## Procedimento Obrigatório
1. **Verificação da Constitution:** Confirme que `STYLEGUIDE.md` e `AGENTS.md` existem na raiz.
2. **Verificação da Specification:** Leia `SPEC.md` e o arquivo `*.Apidog.json`.
3. **Gate de Planejamento:** Nunca edite arquivos em `src/` se a tarefa não estiver listada e aprovada em `PLAN.md`.
4. **Verificação Contínua:** Após concluir qualquer item do `PLAN.md`, execute `pytest` antes de marcar `[x]`.
```

* Graças ao **Progressive Disclosure** do Antigravity, o agente mantém apenas o nome e a descrição da Skill em memória, carregando o manual completo somente quando o workflow SDD é acionado!

---

## Os 5 Antipatterns Clássicos em Spec-Driven Development

1. **Spec Drift (Deriva de Especificação):**
   * Alterar o código manualmente ou via prompt rápido sem atualizar o `SPEC.md` e o projeto no Apidog. Quando outro agente ler o `SPEC.md` desatualizado, ele sobrescreverá sua alteração manual!
2. **Rubber-Stamp Planning (Aprovação Cega do `PLAN.md`):**
   * Gerar o `PLAN.md` com o `[Tech Lead]` e imediatamente mandar o `[Backend Coder]` executar sem ler o plano. Se o plano tiver uma falha arquitetural, a IA vai implementá-la com 100% de convicção.
3. **Mega-Task Execution (Executar o Plano Inteiro de Uma Vez):**
   * Pedir *"Execute todos os 25 passos do PLAN.md de uma vez"*. Isso esgota o orçamento de tokens de saída e impede a revisão incremental de diffs. Execute **1 a 2 passos por turno**.
4. **Constituição Contraditória ou Prolixa:**
   * Colocar 50 páginas de texto genérico no `AGENTS.md` (excedendo o limite de `24 KB` por arquivo do Antigravity) ou regras que contradizem o `SPEC.md`. Mantenha a Constituição enxuta, objetiva e prescritiva.
5. **Ausência de Testes de Contrato no Final de Cada Fase:**
   * Confiar apenas na leitura visual do código gerado sem rodar `pytest` ou o corredor de cenários do Apidog.

---

## Checklist de Governança SDD para Sala de Aula e Produção

Antes de iniciar qualquer implementação assistida por IA no Google Antigravity, verifique:

* [ ] **1. Constitution Técnica (`STYLEGUIDE.md`):** Define claramente linguagem, framework, versão de bibliotecas (ex: Pydantic v2, SQLAlchemy 2.0), estrutura de pastas e padrão de erros (RFC 9457)?
* [ ] **2. Constitution Operacional (`AGENTS.md`):** Está na raiz do projeto para descoberta automática do Antigravity e separa claramente os papéis `[Tech Lead]`, `[Backend Coder]` e `[QA Engineer]`?
* [ ] **3. Contrato Formal Exportado (`TakFlow API.Apidog.json`):** Os endpoints, status HTTP, parâmetros de query/path e Data Schemas estão exportados na pasta do projeto?
* [ ] **4. Especificação Unificada (`SPEC.md`):** Conecta o arquivo do Apidog às regras de negócio, banco de dados e prioriza a extração de tipos antes da lógica?
* [ ] **5. Roteiro Técnico Auditado (`PLAN.md`):** Foi gerado pelo `[Tech Lead]` sem código de aplicação e revisado linha a linha por um humano?
* [ ] **6. Execução Granular e Testada:** Cada tarefa do `PLAN.md` foi implementada individualmente pelo `[Backend Coder]`, revisada no *Diff Overlay* e validada com `pytest` pelo `[QA Engineer]`?

---

## Referências Bibliográficas e Documentação Oficial

### Documentação e Guias de Engenharia Assistida por IA:
* **GOOGLE ANTIGRAVITY DOCUMENTATION:** *Antigravity IDE, Antigravity 2.0, Workspace Rules (`AGENTS.md`) & Skills Guide.* Disponível em: `https://antigravity.google/docs`.
* **APIDOG OFFICIAL DOCS:** *Design-First API Development, Data Schemas, Smart Mocks & OpenAPI Specification.* Disponível em: `https://docs.apidog.com`.
* **OPENAPI INITIATIVE:** *OpenAPI Specification v3.0.3 / v3.1.0.* Linux Foundation.
* **IETF RFC 9457:** *Problem Details for HTTP APIs* (Substitui a RFC 7807 — Nottingham, M., Wilde, E., Dalal, S., 2023).

### Engenharia de Software e Arquitetura:
* **FOWLER, Martin.** *Patterns of Enterprise Application Architecture.* Addison-Wesley, 2002.
* **EVANS, Eric.** *Domain-Driven Design: Tackling Complexity in the Heart of Software.* Addison-Wesley, 2003.
* **FASTAPI & PYDANTIC V2 DOCS:** *Schema-First Design and Type-Safe Validation in Python.*

---

# Programação Web :mortar_board:
## Eduardo Cruz Araujo
### Fatec Ribeirão Preto - SP | 2026.2
### Hora da Prática: Vamos executar o ciclo completo do SDD no Google Antigravity!
