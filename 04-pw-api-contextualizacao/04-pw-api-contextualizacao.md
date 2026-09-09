---
marp: true

author: "Eduardo Cruz Araujo"
title: "Programação Web"
description: "Disciplina de Programação Web."

theme: "default"
class: "invert"

footer: "Eduardo Cruz Araujo | Fatec | 2026.2 | Programação Web | API: Contextualização"

paginate: "true"

---

# Programação Web :mortar_board:
## API: Contextualização
### Fundamentos, Estilos Arquiteturais, Protocolo HTTP, Padrões de Design RESTful e o Paradigma Design-First

---

API: Contextualização
## Agenda da Aula

* **Fundamentos e Papel das APIs:**
  * O que é uma API e seu papel como contrato formal de integração.
  * A analogia do restaurante e razões essenciais para o uso de APIs.
* **Protocolos e Estilos Arquiteturais:**
  * REST, SOAP, GraphQL e gRPC: análise comparativa e cenários ideais.
  * O ciclo de desenvolvimento: *Code-First* vs. *Design-First (Spec-Driven)*.
  * Apresentação do caso de uso da disciplina: **TaskFlow API**.
* **O Protocolo HTTP/HTTPS & O Estilo REST:**
  * Anatomia das mensagens HTTP e o princípio *Stateless*.
  * As 6 restrições fundamentais de Roy Fielding.
  * O Modelo de Maturidade de Richardson (Níveis 0 ao 3).
* **Padrões de Design e Boas Práticas RESTful (DX):**
  * Métodos HTTP: semântica, segurança (*Safe*) e idempotência (RFC 9110).
  * Códigos de status HTTP e padronização de erros com **RFC 9457 / RFC 7807 (Problem Details)**.
  * Recursos, nomenclatura de endpoints, pluralização e aninhamento seguro.
  * Formatos de dados: JSON vs. XML.
  * Navegação em coleções: paginação, filtros, ordenação e versionamento.
  * Modelos de comunicação: Síncrono vs. Assíncrono (Webhooks e WebSockets).
* **Encaminhamento:** Apresentação do laboratório prático com Apidog.

---

API: Contextualização
## O que é uma API?

Uma **API (Application Programming Interface)** é um conjunto padronizado de regras, protocolos e especificações que define como diferentes componentes de software devem se comunicar e interoperar.

```text
   CONSUMIDOR (Cliente)                                PROVEDOR (Servidor)
 ┌────────────────────────┐                             ┌───────────────────────┐
 │ Aplicação Web / Mobile │ ───┐                   ┌──▶ │ Serviço de Usuários   │
 └────────────────────────┘    │   HTTP / JSON     │    └───────────────────────┘
 ┌────────────────────────┐    ├──▶ [ CONTRATO ] ──┤    ┌───────────────────────┐
 │ Dispositivo IoT / B2B  │ ───┘    (Interface)    └──▶ │ Serviço de Pagamentos │
 └────────────────────────┘                             └───────────────────────┘
```

* Ela atua como um **contrato formal**: especifica *o que* o cliente pode solicitar, *como* deve formatar o pedido e *o que* receberá em resposta, sem expor detalhes internos de implementação do servidor.

---

API: Contextualização
## A Analogia Clássica do Restaurante

Para compreender o fluxo de comunicação de uma API na prática:

```text
 ┌─────────────┐             ┌─────────────────────┐             ┌─────────────┐
 │    VOCÊ     │ ──────────▶ │   GARÇOM (API)      │ ──────────▶ │   COZINHA   │
 │  (Cliente)  │ ◀────────── │ (Leva e traz dados) │ ◀────────── │ (Servidor)  │
 └─────────────┘             └─────────────────────┘             └─────────────┘
  Analisa o cardápio           Recebe seu pedido e               Processa a
  (Documentação da API)        o transporta padronizado          solicitação e
                               ao ambiente de execução           prepara a resposta
```

* **Você (Cliente):** Sua aplicação frontend (React, Vue) ou aplicativo mobile.
* **O Cardápio:** A documentação formal da API (especificação OpenAPI/Swagger).
* **O Garçom (A API):** A interface que valida a requisição e transmite a mensagem entre as partes.
* **A Cozinha (O Servidor/Banco):** As rotas de backend, regras de negócio e banco de dados.

---

API: Contextualização
## Por que Construímos e Usamos APIs?

* **Modularidade:** Sistemas divididos em serviços coesos e desacoplados, permitindo manutenção isolada.
* **Reutilização Multiplataforma:** O mesmo backend atende clientes Web, aplicativos iOS/Android, relógios inteligentes e integrações com terceiros.
* **Interoperabilidade:** Softwares construídos em linguagens e pilhas completamente distintas (ex: frontend em TypeScript e backend em Python ou Go) trocam dados de forma transparente.
* **Monetização e Ecossistemas de Dados:** Acesso seguro e controlado a serviços globais de missão crítica (gateways de pagamento, mapas, inteligência artificial, previsão meteorológica).

---

API: Contextualização
## Protocolos e Estilos Arquiteturais

A comunicação entre sistemas distribuídos adota diferentes estilos conforme os requisitos de negócio:

* **REST (Representational State Transfer):** O padrão arquitetural mais difundido na Web pública. Utiliza métodos e semântica HTTP para manipular recursos via representações (principalmente JSON).
* **SOAP (Simple Object Access Protocol):** Protocolo baseado em XML rígido com contratos WSDL. Altamente tipado e formal, comum em sistemas legados bancários e corporativos.
* **GraphQL:** Linguagem de consulta criada pelo Facebook. Permite ao cliente solicitar exatamente a estrutura de dados necessária em uma única requisição, mitigando *over-fetching* e *under-fetching*.
* **gRPC:** Framework de alta performance mantido pela Google. Opera sobre HTTP/2 com serialização binária compacta (Protocol Buffers), ideal para comunicação inter-serviços de baixíssima latência.

---

API: Contextualização
## Comparativo: REST vs. SOAP vs. GraphQL vs. gRPC

| Característica | REST (HTTP/JSON) | SOAP (XML) | GraphQL | gRPC (Protobuf) |
| :--- | :--- | :--- | :--- | :--- |
| **Paradigma** | Orientado a Recursos | Orientado a Ações/Operações | Orientado a Grafos/Consultas | RPC (Chamada Remota) |
| **Simplicidade** | **Alta** (humano-legível) | Baixa (complexo e verboso) | Média | Média |
| **Flexibilidade de Busca**| Média (endpoints fixos) | Baixa | **Altíssima** (cliente escolhe) | Baixa |
| **Protocolo Base** | HTTP/1.1, HTTP/2, HTTP/3 | HTTP, SMTP, TCP | HTTP | Estritamente HTTP/2 |
| **Formato de Carga** | **JSON**, XML, texto | Estritamente XML | JSON | Binário compacto |
| **Contrato Formal** | OpenAPI / Swagger | WSDL / XSD | GraphQL Schema (SDL) | Protocol Buffers (`.proto`) |
| **Cenário Ideal** | **APIs Públicas e Web APIs** | Legados corporativos | UIs com dados relacionais | Microsserviços internos |

---

API: Contextualização
## Paradigma de Desenvolvimento: Code-First vs. Design-First

A estratégia adotada para conceber e implementar uma API dita a qualidade da arquitetura:

```text
 1. FLUXO CODE-FIRST (Tradicional / Propenso a Retrabalho)
    ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
    │  Back-end    │ ───▶ │  Gera Docs   │ ───▶ │  Front-end   │ ───▶ │  Descobre    │
    │  codifica    │      │  a posteriori│      │  começa a cod│      │  Divergências│
    └──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
          Tempo de bloqueio do Frontend ══════════════════════▶ Retrabalho mútuo!

 2. FLUXO DESIGN-FIRST / SPEC-DRIVEN (Moderno / Escalável)
                          ┌───────────────────────────┐
                          │ Contrato OpenAPI no Apidog│
                          │   (Acordo entre equipes)  │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
    ┌──────────────────────────┐                  ┌──────────────────────────┐
    │  Front-end consome MOCK   │                  │  Back-end implementa a   │
    │  (Desenvolvimento livre) │                  │  especificação estrita   │
    └──────────────────────────┘                  └──────────────────────────┘
```

* **Design-First:** O contrato OpenAPI atua como a **Fonte Única da Verdade (SSOT)** desenhada e validada *antes* de escrever o backend, viabilizando paralelismo entre equipes através de simulação com **Mock Servers**.

---

API: Contextualização
## O Caso de Uso do Semestre: "TaskFlow API"

Durante a disciplina, projetaremos e implementaremos a **TaskFlow API** — um serviço ágil de gestão de demandas de software:

```text
  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │                           DOMÍNIO: TASKFLOW API (v1)                              │
  └───────────────────────────────────────────────────────────────────────────────────┘
         │ 1                                                    1 │
         ▼                                                        ▼
  ┌──────────────┐          ┌───────────────────────┐          ┌──────────────┐
  │    Users     │ 1      N │       Projects        │ 1      N │    Tasks     │
  │──────────────│◀─────────│───────────────────────│─────────▶│──────────────│
  │ id (UUID)    │          │ id (UUID)             │          │ id (UUID)    │
  │ name         │          │ name                  │          │ title        │
  │ email (UQ)   │          │ slug (UQ)             │          │ description  │
  │ role (ENUM)  │          │ owner_id (FK -> User) │          │ status (ENUM)│
  │ created_at   │          │ created_at            │          │ priority     │
  └──────────────┘          └───────────────────────┘          │ due_date     │
                                                               │ project_id FK│
                                                               └──────────────┘
```

* Este domínio servirá como fio condutor para todos os tópicos subsequentes: especificação de contratos, backend Python, mapeamento relacional (ORM), autenticação JWT e testes funcionais.

---

API: Contextualização
## O Protocolo HTTP/HTTPS

O **HTTP (Hypertext Transfer Protocol)** é a espinha dorsal de comunicação na Web:

* **Protocolo Baseado em Texto:** Mensagens formatadas com linhas de cabeçalhos ASCII legíveis por humanos e corpo opcional serializado.
* **Ciclo Requisição-Resposta:** O cliente inicia o diálogo enviando um pacote com método, URI e cabeçalhos; o servidor responde com código de status e representação.
* **HTTPS (HTTP Secure):**
  * O tráfego HTTP encapsulado sobre uma camada criptografada **TLS (Transport Layer Security)**.
  * Garante confidencialidade (evita espionagem de dados), integridade (impede alterações no trânsito) e autenticidade da identidade do servidor via certificados digitais.

> **Importante:** Em ambientes de produção modernos, o uso de HTTPS é obrigatório para qualquer API para assegurar proteção de tokens de autenticação e dados pessoais.

---

API: Contextualização
## REST (*Representational State Transfer*)

O **REST** é um estilo arquitetural para sistemas hipermídia distribuídos, formalizado por Roy Fielding em sua tese de doutorado no ano 2000.

* **Conceito Central:** Foco nos **recursos** (entidades de negócio identificáveis) e na transferência de suas **representações** (estados dos dados em determinado instante).
* Uma API construída em conformidade com as restrições arquiteturais do REST é classificada como **RESTful**.

```text
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                                AS 6 RESTRIÇÕES REST                              │
 ├─────────────────────────┬────────────────────────────┬───────────────────────────┤
 │ 1. Cliente-Servidor     │ 2. Stateless (Sem Estado)  │ 3. Cacheable (Cacheável)  │
 ├─────────────────────────┼────────────────────────────┼───────────────────────────┤
 │ 4. Interface Uniforme   │ 5. Sistema em Camadas      │ 6. Código sob Demanda *   │
 └─────────────────────────┴────────────────────────────┴───────────────────────────┘
```

*\* A restrição 6 (Code on Demand) é a única estritamente opcional.*

---

API: Contextualização
## As 6 Restrições Arquiteturais do REST

1. **Cliente-Servidor:** Separação estrita entre preocupações de interface do usuário e armazenamento/regras de dados, permitindo evolução independente.
2. **Stateless (Sem Estado):** Nenhuma sessão do cliente é retida na memória do servidor. Cada requisição deve conter todas as informações necessárias para seu processamento.
3. **Cacheable (Cacheável):** Respostas devem explicitar se podem ou não ser armazenadas em cache por clientes e intermediários, otimizando latência e banda.
4. **Interface Uniforme:** Padrão uniforme de comunicação em toda a API (o pilar fundamental do REST).
5. **Sistema em Camadas:** O cliente interage com a borda sem saber se está conectado diretamente ao servidor final ou a intermediários (proxies, load balancers, gateways).
6. **Código sob Demanda (Opcional):** Capacidade de estender funcionalidades do cliente enviando scripts executáveis temporários (ex: código JavaScript no browser).

---

API: Contextualização
## Aprofundamento no Princípio Stateless

Em uma arquitetura stateless, **cada requisição HTTP é atômica e independente**:

```text
   REQUISIÇÃO STATEFUL (Com Sessão em Memória) ❌      REQUISIÇÃO REST STATELESS ✅
 ┌─────────┐   GET /tasks/next                    ┌─────────┐   GET /api/v1/tasks?page=2
 │ Cliente │ ──────────────────────▶ Servidor     │ Cliente │ ──────────────────────────────▶ Servidor
 └─────────┘ (Servidor precisa lembrar quem é     └─────────┘   Headers: Authorization: Bearer <JWT>
             o cliente e o ponteiro da sessão!)                 (Toda a informação necessária está
                                                                presente no próprio pacote HTTP!)
```

* **Vantagens de Escala:**
  * **Scale-Out Descomplicado:** Qualquer nó do cluster atrás de um balanceador pode responder à chamada.
  * **Resiliência a Falhas:** A queda de uma instância não desconecta os usuários nem perde dados voláteis.
* **Autenticação em APIs Stateless:** Utilização de tokens assinados criptograficamente (**JWT - JSON Web Tokens**) transportados no cabeçalho `Authorization: Bearer <token>`.

---

API: Contextualização
## O Pilar da Interface Uniforme

A **Interface Uniforme** é o diferencial que desacopla completamente clientes de servidores:

1. **Identificação de Recursos:**
   * Cada recurso distinto possui um identificador unívoco na rede expresso através de uma URI (ex: `/api/v1/tasks/42`).
2. **Manipulação de Recursos via Representações:**
   * O cliente não acessa a tabela do banco diretamente; ele recebe e envia representações do recurso (geralmente documentos JSON).
3. **Mensagens Auto-descritivas:**
   * Cada mensagem HTTP contém metadados suficientes para indicar como deve ser interpretada:
     * `Content-Type: application/json` (tipo da carga enviada).
     * `Accept: application/json` (tipo de formato esperado na resposta).
4. **HATEOAS (*Hypermedia As The Engine Of Application State*):**
   * A representação do recurso contém hiperlinks que guiam o cliente dinamicamente sobre as próximas ações possíveis.

---

API: Contextualização
## O Modelo de Maturidade de Richardson

Leonard Richardson organizou a aderência aos conceitos REST em quatro níveis graduais:

```text
  NÍVEL 3: Controles Hipermídia (HATEOAS)
  ▲ Respostas contêm links para as próximas transições de estado do sistema (`_links`).
  │
  NÍVEL 2: Verbos HTTP + Códigos de Status Semânticos
  ▲ Uso correto de GET, POST, PUT, DELETE e respostas 200, 201, 204, 400, 404, etc.
  │
  NÍVEL 1: Recursos Individuais
  ▲ URIs exclusivas para cada entidade (`/tasks/1`, `/projects/2`) em vez de endpoint único.
  │
  NÍVEL 0: O Pântano do POX (The Swamp of POX)
  ■ Um único endpoint genérico (ex: `POST /apiService` trafegando envelopes XML ou JSON).
```

* **Padrão de Mercado:** A esmagadora maioria das APIs REST modernas da indústria atua com excelência no **Nível 2**, balanceando semântica rigorosa com simplicidade prática.

---

API: Contextualização
## Métodos HTTP (Verbos da Ação)

Os **métodos HTTP** indicam semanticamente qual operação está sendo solicitada sobre o recurso identificado na URI:

* **GET:** Solicita a representação de um recurso específico. Não altera o estado do servidor.
  * *Exemplo:* `GET /api/v1/tasks/123` (recupera a tarefa 123).
* **POST:** Submete dados para criar um novo recurso subordinado na coleção.
  * *Exemplo:* `POST /api/v1/tasks` (cadastra uma nova tarefa).
* **PUT:** Substituição integral de um recurso existente pelos dados fornecidos no corpo.
  * *Exemplo:* `PUT /api/v1/tasks/123` (substitui todo o registro da tarefa 123).
* **PATCH:** Aplica modificações parciais em atributos específicos do recurso.
  * *Exemplo:* `PATCH /api/v1/tasks/123` (atualiza unicamente o status para `DONE`).
* **DELETE:** Remove o recurso especificado do sistema.
  * *Exemplo:* `DELETE /api/v1/tasks/123` (exclui a tarefa 123).
* **HEAD & OPTIONS:**
  * `HEAD`: Semelhante ao GET, mas retorna apenas os cabeçalhos (sem o corpo), útil para checar existência ou tamanho.
  * `OPTIONS`: Consulta quais métodos HTTP e origens são aceitos pelo servidor (crucial para o protocolo **CORS**).

---

API: Contextualização
## Métodos HTTP: Segurança (*Safe*) & Idempotência

A especificação oficial **RFC 9110** categoriza os métodos HTTP em dois eixos vitais para a confiabilidade de sistemas:

```text
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ • Método Seguro (Safe): A execução NÃO provoca efeitos colaterais no servidor    │
 │   (operação puramente de leitura).                                               │
 │ • Método Idempotente: Executar a requisição 1 vez ou 100 vezes produz EXATAMENTE │
 │   o mesmo estado final no banco de dados.                                        │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

| Método HTTP | Propósito Semântico | Seguro? (*Safe*) | Idempotente? | Corpo no Request? |
| :---: | :--- | :---: | :---: | :---: |
| **GET** | Leitura de recurso | **SIM** | **SIM** | Não recomendado |
| **POST** | Criação de recurso | **NÃO** | **NÃO** | Sim (dados da entidade) |
| **PUT** | Substituição total | **NÃO** | **SIM** | Sim (objeto completo) |
| **PATCH** | Atualização parcial | **NÃO** | **NÃO\*** | Sim (campos a alterar) |
| **DELETE** | Remoção de recurso | **NÃO** | **SIM** | Opcional / Raro |

*\* Em implementações com operações delta cumulativas, PATCH pode não ser idempotente.*

---

API: Contextualização
## Códigos de Status HTTP (*Status Codes*)

Respostas numéricas enviadas pelo servidor para informar o resultado da operação:

* **1xx (Informacional):** A requisição foi recebida e o processamento continua em andamento.
* **2xx (Sucesso):** A requisição foi recebida, compreendida e processada com êxito:
  * **200 OK:** Sucesso padrão para consultas (GET) ou atualizações (PUT/PATCH).
  * **201 Created:** Novo recurso gerado com sucesso (acompanhado do header `Location`).
  * **204 No Content:** Operação bem-sucedida, mas a resposta não requer corpo (típico de DELETE).
* **3xx (Redirecionamento):** O cliente precisa executar ação complementar para acessar o recurso:
  * **301 Moved Permanently:** O recurso foi relocado definitivamente para uma nova URI.
  * **304 Not Modified:** O recurso não foi alterado desde a última consulta (otimização de cache).

---

API: Contextualização
## Códigos de Status: Erros do Cliente (4xx) & do Servidor (5xx)

* **4xx (Erro do Cliente):** Falha provocada pela requisição submetida pelo cliente:
  * **400 Bad Request:** Requisição malformada (sintaxe JSON inválida ou parâmetros ausentes).
  * **401 Unauthorized:** Autenticação necessária (credenciais ausentes ou token inválido).
  * **403 Forbidden:** O cliente está autenticado, mas não tem privilégio de acesso ao recurso.
  * **404 Not Found:** O recurso associado à URI informada não foi localizado.
  * **405 Method Not Allowed:** O verbo HTTP utilizado não é suportado pelo endpoint.
  * **409 Conflict:** Conflito de estado (ex: tentativa de cadastrar e-mail já existente).
  * **422 Unprocessable Entity:** Sintaxe correta, mas violação de regras de validação semântica.
* **5xx (Erro do Servidor):** Falha de infraestrutura interna ou código não tratado:
  * **500 Internal Server Error:** Exceção não capturada ou erro genérico de execução.
  * **502 Bad Gateway:** Servidor intermediário recebeu resposta inválida do servidor upstream.
  * **503 Service Unavailable:** Servidor temporariamente indisponível (sobrecarga ou manutenção).
  * **504 Gateway Timeout:** Tempo limite de resposta esgotado no servidor intermediário.

---

API: Contextualização
## Boas Práticas: O Erro Também é Parte do Contrato!

> **Anti-Padrão Crítico na Web:**
> Retornar cabeçalho `HTTP 200 OK` contendo no corpo:
> `{"error": true, "message": "Falha na autenticação"}`.
> Isso engana proxies reversos, anula regras de cache e impede ferramentas de observabilidade de computar métricas reais de erro!

### O Padrão RFC 9457 & RFC 7807 (Problem Details for HTTP APIs)
Formato estruturado universal para mensagens de erro padronizado pelo IETF (`application/problem+json`).

> **Nota de Atualização:** A **RFC 9457** (publicada em julho de 2023) é o padrão oficial vigente que tornou formalmente obsoleta a clássica RFC 7807. A nova especificação preserva integralmente os membros canônicos originais (`type`, `title`, `status`, `detail`, `instance`) e formaliza a URI default `about:blank` para erros sem documentação dedicada, além de estabelecer diretrizes estritas para extensões (como `invalidParams`).

```json
{
  "type": "https://api.taskflow.dev/errors/validation-failed",
  "title": "Erro de Validação de Dados",
  "status": 422,
  "detail": "O campo 'title' é obrigatório e deve conter no mínimo 3 caracteres.",
  "instance": "/api/v1/tasks",
  "invalidParams": [
    { "name": "title", "reason": "Tamanho insuficiente" }
  ]
}
```

---

API: Contextualização
## Formatos de Troca de Dados: JSON vs. XML

**JSON** e **XML** são os formatos de representação textual predominantes em APIs:

```text
         REPRESENTAÇÃO EM JSON                           REPRESENTAÇÃO EM XML
  {                                              <tarefa>
    "id": 42,                                      <id>42</id>
    "titulo": "Configurar Docker",                 <titulo>Configurar Docker</titulo>
    "concluida": false                             <concluida>false</concluida>
  }                                              </tarefa>
```

* **JSON (JavaScript Object Notation):**
  * **Vantagens:** Extremamente leve, parsing veloz e nativo em JavaScript/Python/todas as linguagens modernas, legibilidade superior.
  * **Uso:** Padrão quase unânime para novas APIs RESTful e aplicações Web/Mobile.
* **XML (Extensible Markup Language):**
  * **Vantagens:** Suporte avançado a schemas rígidos de validação (**XSD**), namespaces e estruturas hierárquicas altamente complexas.
  * **Uso:** Presente em integrações financeiras legadas, sistemas governamentais e APIs SOAP.

---

API: Contextualização
## Design de Recursos: Substantivos vs. Verbos

A URI de um endpoint identifica **o que** é o recurso; o método HTTP define **o que fazer** com ele:

* **Pense em Substantivos (Entidades do Mundo Real):**
  * Um usuário, um produto, um pedido, uma tarefa.
* **Anti-Padrões (Evitar terminantemente verbos na URI):**
  * ❌ `GET /getUsers`
  * ❌ `POST /createTask`
  * ❌ `POST /tasks/delete?id=12`
* **Padrões RESTful Recomendados:**
  * ✅ `GET /tasks` (listar tarefas)
  * ✅ `POST /tasks` (criar tarefa)
  * ✅ `DELETE /tasks/12` (remover a tarefa com identificador 12)

> **Regra Mnemônica:** A URI é a estante com a pasta de documentos; o método HTTP é a ação da sua mão sobre a pasta.

---

API: Contextualização
## Nomenclatura, Pluralização & Identificadores

1. **Sempre use substantivos no plural para coleções:**
   * `/products` (coleção de produtos).
   * `/tasks` (coleção de tarefas).
   * `/users` (coleção de usuários).
2. **Utilize minúsculas e hífens (*kebab-case*) para termos compostos:**
   * ✅ `/project-tasks`, `/audit-logs`.
   * ❌ `/projectTasks` (camelCase) ou `/project_tasks` (snake_case) em URLs.
3. **Identificação de recursos individuais:**
   * O identificador único (ID numérico ou UUID) segue imediatamente o nome da coleção:
     * `GET /products/42` (detalhes do produto 42).
     * `PUT /products/42` (atualização do produto 42).
     * `DELETE /products/42` (remoção do produto 42).

---

API: Contextualização
## Aninhamento de Recursos (*Nested Resources*)

Utilize rotas aninhadas para expressar relações de pertencimento e hierarquia natural entre recursos:

* **Sintaxe:** `/recurso-pai/{id-pai}/recurso-filho`
* **Exemplos no domínio TaskFlow:**
  * `GET /projects/10/tasks` (listar todas as tarefas subordinadas ao projeto 10).
  * `POST /projects/10/tasks` (criar uma nova tarefa vinculada diretamente ao projeto 10).

```text
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                         REGRA DE OURO DO ANINHAMENTO                             │
 │ Evite aninhar mais de 2 níveis de profundidade!                                  │
 │                                                                                  │
 │ ❌ Péssimo: /orgs/1/departments/2/teams/3/projects/4/tasks/5                     │
 │ ✅ Elegante: /tasks/5 ou /projects/4/tasks?teamId=3                              │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

* Para recursos que possuem identidade única global (ex: ID UUID), acesse o recurso diretamente pela sua coleção raiz (`GET /tasks/9b1deb4d...`).

---

API: Contextualização
## Matriz Resumo de Endpoints RESTful

| Verbo HTTP | Endpoint | Descrição da Operação | Resposta Típica |
| :---: | :--- | :--- | :---: |
| **`GET`** | `/tasks` | Recupera a lista de tarefas | `200 OK` (Array) |
| **`POST`** | `/tasks` | Cria uma nova tarefa | `201 Created` (`Location`) |
| **`GET`** | `/tasks/{id}` | Recupera os detalhes de uma tarefa | `200 OK` ou `404 Not Found` |
| **`PUT`** | `/tasks/{id}` | Substituição total da tarefa | `200 OK` |
| **`PATCH`** | `/tasks/{id}` | Atualização parcial (ex: status) | `200 OK` |
| **`DELETE`**| `/tasks/{id}` | Exclui a tarefa do banco | `204 No Content` |
| **`GET`** | `/projects/{id}/tasks`| Lista tarefas vinculadas a um projeto | `200 OK` (Array) |

---

API: Contextualização
## Design de Coleções: Paginação, Filtros e Ordenação

APIs corporativas nunca devem retornar todos os registros do banco de uma vez só:

```text
 1. PAGINAÇÃO BASEADA EM DESLOCAMENTO (Offset-Based):
    GET /api/v1/tasks?page=2&limit=10

 2. FILTRAGEM VIA QUERY PARAMETERS:
    GET /api/v1/tasks?status=IN_PROGRESS&priority=HIGH

 3. BUSCA TEXTUAL:
    GET /api/v1/tasks?q=relatorio+mensal

 4. ORDENAÇÃO DINÂMICA:
    GET /api/v1/tasks?sort=-createdAt,priority  (O sinal "-" indica ordem decrescente)
```

* **Diferença Conceitual:**
  * **Path Parameter (`/tasks/{id}`):** Identifica um recurso único obrigatório.
  * **Query Parameter (`/tasks?status=TODO`):** Modificador opcional da coleção.

---

API: Contextualização
## Versionamento de APIs

Conforme sua aplicação evolui em produção, alterações de contrato podem quebrar clientes existentes:

```text
 1. VERSIONAMENTO POR URI (Mais Claro e Recomendado pelo Mercado) ✅
    https://api.taskflow.dev/v1/tasks
    https://api.taskflow.dev/v2/tasks
    -> Visível, auditável e fácil de inspecionar em logs e ferramentas de monitoramento.

 2. VERSIONAMENTO POR CABEÇALHO HTTP (Header-based)
    GET /tasks
    Accept: application/vnd.taskflow.v1+json
    -> URLs permanecem imutáveis, mas dificulta testes em navegadores e ferramentas simples.

 3. VERSIONAMENTO POR QUERY PARAMETER
    GET /tasks?version=1
    -> Pouco recomendado: confunde filtros de coleção com a versão do contrato de dados.
```

---

API: Contextualização
## Modelos de Comunicação: Síncrono vs. Assíncrono

A natureza da tarefa determina como a API deve processar a requisição do cliente:

* **APIs Síncronas (Bloqueantes):**
  * O cliente dispara a requisição e **aguarda ativamente** a resposta do servidor.
  * *Analogia:* Ligar para uma pizzaria e permanecer na linha telefônica até a confirmação do pedido.
  * *Uso ideal:* Operações imediatas e rápidas (consultar saldo, validar login, obter perfil).
* **APIs Assíncronas (Não Bloqueantes):**
  * O cliente envia a requisição, recebe imediatamente um comprovante de aceite (`202 Accepted`) e **continua trabalhando**.
  * A resposta final é comunicada posteriormente via evento ou notificação.
  * *Analogia:* Fazer um pedido por aplicativo e receber uma notificação push quando o entregador chegar.
  * *Uso ideal:* Processamento pesado de vídeos, relatórios complexos, envio de e-mails em lote.

---

API: Contextualização
## Mecanismos Assíncronos: Webhooks & WebSockets

```text
      WEBHOOKS (Event-Driven HTTP Push)                WEBSOCKETS (Full-Duplex Contínuo)
 ┌──────────────┐         ┌──────────────┐       ┌──────────────┐         ┌──────────────┐
 │ Provedor Pag │ ──────▶ │ Seu Servidor │       │   Browser    │ ◀═════▶ │  Servidor    │
 └──────────────┘         └──────────────┘       └──────────────┘         └──────────────┘
  Dispara um POST HTTP no seu endpoint            Túnel TCP bidirecional permanente
  quando o evento ocorre (ex: "pix_pago")         Ideal para chats, cotações e jogos
```

| Cenário de Negócio | Comunicação Síncrona | Comunicação Assíncrona |
| :--- | :---: | :---: |
| Autenticação e Login de Usuário | **✔️** | ❌ |
| Consulta de detalhes de uma Tarefa | **✔️** | ❌ |
| Renderização e exportação de vídeo em 4K | ❌ | **✔️ (Job / Queue)** |
| Confirmação de pagamento via PIX / Cartão | ❌ | **✔️ (Webhook)** |
| Notificações em tempo real em chat colaborativo | ❌ | **✔️ (WebSocket)** |

---

API: Contextualização
## A Nova Fronteira: Contratos Vivos com OpenAPI & Apidog

Como transformar toda essa teoria arquitetural em software confiável e testável?

```text
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                                   APIDOG                                         │
 │                                                                                  │
 │ ┌───────────────────┐    ┌─────────────────────┐    ┌──────────────────────────┐ │
 │ │  OpenAPI 3.0/Doc  │    │  Smart Mock Server  │    │   Testes de Contrato     │ │
 │ │  Modelagem visual │ ─▶ │  Simulação imediata │ ─▶ │   Validação contínua     │ │
 │ │  sem YAML manual  │    │  sem nenhum backend │    │   de schemas e regras    │ │
 │ └───────────────────┘    └─────────────────────┘    └──────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

* O padrão **OpenAPI 3.0** formaliza parâmetros, schemas de dados e status codes.
* Ferramentas modernas como o **Apidog** permitem criar o contrato visualmente e simular uma API completa em minutos via **Smart Mocks**, permitindo que o time de frontend programe sem esperar pelo backend!

---

API: Contextualização
## Roteiro Prático da Aula: Laboratório no Apidog

Toda a prática da aula de hoje está estruturada em um roteiro laboratorial detalhado no arquivo:
📂 **`04-pw-api-contextualizacao-pratica-apidog.md`**

```text
  ROTEIRO DO LABORATÓRIO PRÁTICO:
  • Etapa 1: Criação da Workspace e Projeto "TaskFlow API" no Apidog.
  • Etapa 2: Modelagem visual da malha de endpoints da entidade /tasks.
  • Etapa 3: Definição dos Data Schemas OpenAPI (Task, CreateTaskDTO, ApiError RFC 9457 / RFC 7807).
  • Etapa 4: Configuração de Status Codes Semânticos (200, 201 com Location, 204, 404, 422).
  • Etapa 5: Parametrização de coleções: query params, filtros e envelope paginado.
  • Etapa 6: Ativação de Smart Mocks dinâmicos com regras Faker.js (@guid, @title, @date).
  • Etapa 7: Configuração de Expectations condicionais (simulação de 404 Not Found).
  • Etapa 8: Consumo externo real do Mock Server via terminal com cURL.
  • Etapa 9: Publicação da documentação viva e criação de Test Scenarios.
  • Etapa 10: Desafio de fixação — Modelagem da coleção /projects.
```

---

# Obrigado :metal:
## Programação Web • Fatec Ribeirão Preto

---

## Eduardo Cruz Araujo

* **E-mail:** [eduardo.araujo@cps.sp.gov.br](eduardo.araujo@cps.sp.gov.br)
* **LinkedIn:** [edcaraujo](https://www.linkedin.com/in/edcaraujo/)
* **GitHub:** [edcaraujo](https://github.com/edcaraujo)
