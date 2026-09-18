---
marp: true

author: "Eduardo Cruz Araujo"
title: "Programação Web"
description: "Disciplina de Programação Web."

theme: "default"
class: "invert"

footer: "Eduardo Cruz Araujo | Fatec | 2026.2 | Programação Web | System Design: Arquitetura de Sistemas Distribuídos (Part. 2)"

paginate: "true"

---

# Programação Web :mortar_board:
## System Design: Arquitetura de Sistemas Distribuídos (Part. 2)

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 2)
## Paradigmas de Escalabilidade & Performance

---

## Escalabilidade: Vertical (Scale-Up) vs. Horizontal (Scale-Out)

A capacidade de um sistema atender a demandas crescentes de tráfego e dados divide-se em dois paradigmas fundamentais:

```text
       ESCALABILIDADE VERTICAL (Scale-Up)               ESCALABILIDADE HORIZONTAL (Scale-Out)
   ┌────────────────────────────────────────┐       ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
   │             SUPER SERVIDOR             │       │  Nó 01   │ │  Nó 02   │ │  Nó 03   │ │  Nó N... │
   │  ┌──────────┐ ┌──────────┐ ┌─────────┐ │       │ 4 vCPUs  │ │ 4 vCPUs  │ │ 4 vCPUs  │ │ 4 vCPUs  │
   │  │ 128 vCPU │ │ 1TB RAM  │ │ NVMe 8T │ │       │ 16GB RAM │ │ 16GB RAM │ │ 16GB RAM │ │ 16GB RAM │
   │  └──────────┘ └──────────┘ └─────────┘ │       └──────────┘ └──────────┘ └──────────┘ └──────────┘
   └────────────────────────────────────────┘             ▲            ▲            ▲            ▲
                      ▲                                   └────────────┴─────┬──────┴────────────┘
              [Limite Físico/Custo]                                   [Load Balancer]
```

* **Scale-Up (Vertical):** Adicionar mais recursos de hardware (CPU, RAM, Discos NVMe) a uma única máquina.
  * **Vantagens:** Nenhuma complexidade de rede distribuída; coerência de memória instantânea; transações ACID locais simplificadas.
  * **Desvantagens:** Teto físico rígido de hardware; custo exponencial (Lei dos Rendimentos Decrescentes); Ponto Único de Falha (*Single Point of Failure - SPOF*); tempo de inatividade (Downtime) para upgrades de hardware.
* **Scale-Out (Horizontal):** Adicionar múltiplos servidores de menor porte agrupados em cluster lógico.
  * **Vantagens:** Escalabilidade teoricamente ilimitada; resiliência a falhas individuais (*Fault Tolerance*); provisionamento elástico sob demanda (*Auto-scaling*).
  * **Desvantagens:** Complexidade de orquestração; latência de rede entre nós; consistência de dados eventual; necessidade de balanceadores de carga.

---

## Leis Fundamentais da Computação Paralela e Distribuída

Ao distribuir cargas de trabalho em múltiplos nós, o ganho de desempenho não é linear devido à sincronização e frações seriais do código:

### 1. Lei de Amdahl (Tamanho de Problema Fixo)
Mede o ganho máximo de aceleração (*Speedup*) ao adicionar *N* processadores, onde *P* é a fração paralelizada e *(1 - P)* é a fração estritamente sequencial:

```text
Speedup(N) = 1 / [ (1 - P) + (P / N) ]
```

* **Consequência Prática:** Se apenas **5%** do seu sistema for sequencial (ex: trava de escrita em banco relacional ou serialização JSON), mesmo com **infinitos servidores**, o ganho máximo global nunca ultrapassará **20x** (1 / 0.05 = 20).

### 2. Lei de Gustafson-Barsis (Tamanho de Problema Escalável)
Assume que o volume de dados e o problema crescem proporcionalmente ao poder de processamento adicionado:

```text
Speedup(N) = N - α(N - 1) = α + N(1 - α)
```

onde *α* (alfa) é a fração sequencial. Em sistemas de Big Data e streaming, adicionar nós permite processar datasets muito maiores no mesmo intervalo de tempo.

---

## Arquiteturas Stateless vs. Stateful

O estado de uma aplicação determina a complexidade necessária para balancear e escalar a infraestrutura:

```text
       ARQUITETURA STATEFUL (Acoplada)                   ARQUITETURA STATELESS (Desacoplada)
 ┌─────────┐      ┌─────────────────────────┐     ┌─────────┐      ┌─────────────────────────┐
 │ Cliente │ ──── │ Servidor 1 (Sessão Mem) │     │ Cliente │ ──── │ Servidor 1 (Sem Estado) │
 └─────────┘      └─────────────────────────┘     └─────────┘      └────────────┬────────────┘
      │              (Se cair, perde sessão!)                          JWT      │   Redis
      ▼                                                                 Token   ▼   Cluster
 ┌─────────┐      ┌─────────────────────────┐                               ┌────────────────┐
 │ Cliente │ ──── │ Servidor 2 (Sessão Mem) │                               │ Camada Cache / │
 └─────────┘      └─────────────────────────┘                               │ Sessão Externa │
                                                                            └────────────────┘
```

* **Stateful:** O nó retém o estado da conversa/sessão na memória local.
  * Requer **Sticky Sessions (Session Affinity)** no balanceador de carga. Se o nó falhar ou for desprovisionado em um auto-scaling, o usuário é desconectado e perde o contexto da transação.
* **Stateless:** Cada requisição HTTP contém todas as credenciais e metadados necessários para seu processamento independente.
  * O estado volátil de sessão é delegado para um cluster de cache distribuído em memória (ex: **Redis** / **Memcached**) ou codificado em tokens criptografados assinados (**JWT**). Qualquer servidor pode atender qualquer requisição.

---

## Métricas Críticas: Latência, Throughput e Bandwidth

Em System Design, a avaliação do desempenho de sistemas baseia-se em três pilares interdependentes:

```text
  ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
  │       LATÊNCIA       │      │      THROUGHPUT      │      │      BANDWIDTH       │
  │     (Tempo / ms)     │      │     (Vazão / RPS)    │      │    (Capacidade / bps)│
  │  Tempo total para um │      │  Quantidade de ações │      │  Volume máximo de    │
  │  dado ir do emissor  │      │  ou requisições com- │      │  bits por segundo que│
  │  ao receptor e voltar│      │  pletadas por segundo│      │  o meio pode trafegar│
  └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

### A Lei de Little (Equilíbrio em Filas Distribuídas)
Em um sistema estável, o número médio de requisições concorrentes em processamento (*L*) é igual à taxa de chegada/vazão (*λ*) multiplicada pelo tempo médio de resposta/latência (*W*):

```text
L = λ × W   ===>   Throughput (λ) = L / W
```

* **Exemplo:** Se sua API processa cada requisição em *W = 100ms* (0.1s) e você possui um pool com *L = 50* threads ativas, a vazão máxima teórica será:
```text
λ = 50 / 0.1 = 500 requisições/segundo (RPS)
```

---

## Percentis de Latência: Por que a Média é uma Ilusão Perigosa

Em ambientes de produção, utilizar a **Média Aritmética** de latência oculta a degradação da experiência dos usuários mais ativos (*The Flaw of Averages*):

```text
  Percentil   Definição Operacional                           Impacto em Produção
  ──────────────────────────────────────────────────────────────────────────────────────────
  P50 (Mediana) 50% das requisições são mais rápidas que X.    Representa o caso típico comum.
  P90 / P95    90% a 95% das requisições concluem abaixo de X. Identifica degradação moderada.
  P99          1 em cada 100 requisições é mais lenta que X.   Impacta clientes corporativos/pesados.
  P99.9        1 em cada 1.000 requisições sofre com essa cauda. Tail Latency crítica de microserviços.
```

```text
  Frequência de
  Requisições ▲
              │    P50 (18ms)      P95 (85ms)     P99 (450ms)           P99.9 (2100ms)
              │       │                 │              │                      │
              │  █████│███              │              │                      │
              │ ██████│████             │              │                      │
              │███████│██████           │              │                      │
              │███████│████████         │              │                      │
              │███████│███████████      │              │                      │
              │███████│███████████████  │              │                      │
              └───────┴─────────────────┴──────────────┴──────────────────────┴───────► Latência (ms)
                      ◄── Caso Típico ──►              ◄──── Tail Latency (Gargalos) ──►
```

> **Efeito Cascata em Microserviços:** Se uma página inicial faz **50 chamadas paralelas** a microserviços com latência P99 de 1%, a probabilidade de a página sofrer a latência P99 é:
> ```text
> P(Atraso) = 1 - (1 - 0.01)^50 = 1 - (0.99)^50 ≈ 39.5%
> ```
> Quase **40% de todos os usuários** experimentarão a lentidão da cauda longa!

---

## Confiabilidade e Disponibilidade: A Matemática dos "Noves"

A disponibilidade de infraestrutura é medida pela porcentagem de tempo em que o serviço permanece operacional e acessível:

| Disponibilidade ("Noves") | Downtime Máximo / Ano | Downtime Máximo / Mês | Downtime Máximo / Dia |
| :--- | :--- | :--- | :--- |
| **99%** ("Dois Noves") | 3 dias, 15 horas, 36 min | 7 horas, 18 min | 14 minutos, 24 seg |
| **99.9%** ("Três Noves") | 8 horas, 45 min, 57 seg | 43 minutos, 49 seg | 1 minuto, 26 seg |
| **99.99%** ("Quatro Noves") | 52 minutos, 35 seg | 4 minutos, 23 seg | 8.64 segundos |
| **99.999%** ("Cinco Noves") | **5 minutos, 15 seg** | **26.30 segundos** | **0.86 segundos** |

### O Framework SLI, SLO e SLA
* **SLI (Service Level Indicator):** A métrica real mensurada em tempo de execução.
  * *Exemplo:* "Percentual de requisições HTTP bem-sucedidas (status < 500) nos últimos 30 dias".
* **SLO (Service Level Objective):** A meta interna estabelecida pelo time de engenharia.
  * *Exemplo:* "Garantir 99.95% de requisições com latência < 200ms".
* **SLA (Service Level Agreement):** O contrato legal com o cliente que prevê penalidades e multas financeiras se o serviço for descumprido.
* **Error Budget:** A margem permitida de falha (100% - SLO). Se o SLO for 99.9%, o time possui 0.1% de margem para experimentar e fazer deploys arriscados no mês.

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 2)
## Intermediários de Rede: Proxies, Load Balancers & Gateways

---

## Intermediários de Rede: Forward Proxy vs. Reverse Proxy

Um **Proxy** é um elemento intermediário na topologia de rede que intercepta o fluxo de dados entre clientes e servidores:

```text
                  FORWARD PROXY (Protege e Representa o Cliente)
  ┌──────────────┐         ┌───────────────────────────┐         ┌───────────────────────────┐
  │   Cliente    │ ──────► │       FORWARD PROXY       │ ──────► │    Servidores da Web      │
  │ (Rede Local) │         │ • Oculta IP do cliente    │         │ (google.com, github.com)  │
  └──────────────┘         │ • Bloqueio de acessos     │         └───────────────────────────┘
                           │ • Cache corporativo       │
                           └───────────────────────────┘

                  REVERSE PROXY (Protege e Representa o Servidor)
  ┌──────────────┐         ┌───────────────────────────┐         ┌───────────────────────────┐
  │   Clientes   │ ──────► │       REVERSE PROXY       │ ──────► │    Cluster de Backend     │
  │ (Internet)   │         │ • TLS/SSL Termination     │         │ • API Server 1 (porta 8001)│
  └──────────────┘         │ • Caching HTTP & Compress │         │ • API Server 2 (porta 8002)│
                           │ • Defesa DDoS / Slowloris │         │ • Auth Service (porta 8003)│
                           └───────────────────────────┘         └───────────────────────────┘
```

* **Forward Proxy (Lado do Cliente):** Atua como representante de um grupo de clientes internos que saem para a Internet.
  * Usos: Políticas de segurança corporativa, filtro de conteúdo, auditoria de saída, cache de rede local e anonimização de IP.
* **Reverse Proxy (Lado do Servidor):** Atua como a porta de entrada única para clientes externos acessarem serviços privados.
  * Usos: Descarregamento criptográfico (*SSL/TLS Offloading*), compressão Gzip/Brotli, proteção de topologia interna e isolamento de portas.

---

## Configuração em Produção: Nginx como Reverse Proxy

Exemplo de configuração declarativa do Nginx gerenciando terminação TLS, compressão e repasse de cabeçalhos originais:

```nginx
# /etc/nginx/nginx.conf
http {
    upstream backend_cluster {
        server 10.0.1.10:8080 max_fails=3 fail_timeout=10s;
        server 10.0.1.11:8080 max_fails=3 fail_timeout=10s;
        keepalive 32; # Pool de conexões persistentes com o backend
    }

    server {
        listen 443 ssl http2;
        server_name api.fatec.sp.gov.br;

        ssl_certificate /etc/letsencrypt/live/api.fatec/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/api.fatec/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;

        gzip on;
        gzip_types application/json text/plain text/css;

        location / {
            proxy_pass http://backend_cluster;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            
            # Preservação da identidade e rastreabilidade do cliente original
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_connect_timeout 5s;
            proxy_read_timeout 30s;
        }
    }
}
```

---

## Load Balancing: Balanceamento em Camada 4 (L4) vs. Camada 7 (L7)

O balanceamento de carga distribui requisições entre instâncias computacionais operando em diferentes níveis do Modelo OSI:

```text
               BALANCEAMENTO L4 (Transporte / TCP/UDP)
 ┌──────────┐      ┌─────────────────────────────┐      ┌──────────────────────────┐
 │ Clientes │ ───► │  L4 Load Balancer (NLB/IPVS)│ ───► │ Servidor 1 (10.0.1.10)   │
 └──────────┘      │ • Avalia: IP Origem/Destino │      ├──────────────────────────┤
                   │ • Avalia: Porta TCP/UDP     │ ───► │ Servidor 2 (10.0.1.11)   │
                   │ • NÃO decodifica dados HTTP │      └──────────────────────────┘
                   └─────────────────────────────┘

               BALANCEAMENTO L7 (Aplicação / HTTP/HTTPS/gRPC)
 ┌──────────┐      ┌─────────────────────────────┐      ┌──────────────────────────┐
 │ Clientes │ ───► │  L7 Load Balancer (ALB/Nginx│ ───► │ Serviço /api/v1/auth     │
 └──────────┘      │ • Inspeciona Path URL (/api)│      ├──────────────────────────┤
                   │ • Avalia Headers & Cookies  │ ───► │ Serviço /api/v1/pedidos  │
                   │ • Descriptografa TLS/SSL    │      ├──────────────────────────┤
                   │ • Roteia por Método (GET/POST│ ──► │ Serviço /static (Assets) │
                   └─────────────────────────────┘      └──────────────────────────┘
```

* **L4 (Layer 4 - Transport Layer):** Toma decisões com base em cabeçalhos de rede e transporte (IP e Porta TCP/UDP).
  * **Vantagens:** Altíssimo throughput (milhões de pacotes/s); baixíssimo consumo de CPU/Memória; não quebra criptografia TLS.
  * **Casos de Uso:** AWS Network Load Balancer (NLB), HAProxy L4, Linux IPVS, proxies TCP para bancos de dados.
* **L7 (Layer 7 - Application Layer):** Toma decisões inspecionando o payload da aplicação (URI, Headers, Cookies, JSON).
  * **Vantagens:** Roteamento inteligente por rota (`/pagamento`, `/catalogo`); terminação TLS centralizada; manipulação de headers.
  * **Casos de Uso:** AWS Application Load Balancer (ALB), Envoy Proxy, Nginx, Traefik, Kong.

---

## Algoritmos de Balanceamento de Carga: Estáticos vs. Dinâmicos

A distribuição de requisições pode ser **estática** (baseada em heurísticas fixas) ou **dinâmica** (orientada à telemetria em tempo real):

```text
1. Round Robin (Circular Simples)
   • Roteamento sequencial (A ──► B ──► C ──► A...). Complexidade O(1).
   • Ideal para nós homogêneos com tarefas de tempo uniforme (APIs REST CRUD).

2. Weighted Round Robin (Ponderado por Hardware)
   • Servidor A (Peso 3): recebe 3 reqs; Servidor B (Peso 1): recebe 1 req.
   • Ideal para clusters com máquinas heterogêneas de capacidades distintas.

3. Least Connections & Weighted Least Conn
   • Roteia para o nó com o menor número de conexões TCP ativas no instante t.
   • Ideal para transações longas e assimétricas (WebSockets, uploads/downloads, streams).

4. IP Hash / Source Hash (Afinidade em L4)
   • Index = Hash(IP_Origem) % N. Mantém o mesmo cliente no mesmo servidor.
   • Risco: Clientes corporativos sob o mesmo NAT/Proxy causam Hot Spots severos em 1 nó.

5. Consistent Hashing (com Anel de Hash e Vnodes)
   • Mapeia nós e chaves em um anel de 0 a 2^32 - 1. Ao alterar nós, apenas (K/N) chaves migram.
   • Ideal para camadas de cache compartilhado (Redis/Memcached) e bancos particionados.

6. Least Response Time / TTFB Adaptativo
   • Roteia combinando menor carga com menor Time to First Byte recente.
   • Desvia tráfego de instâncias em nuvem sofrendo com ruído de I/O (Noisy Neighbors).

7. Power of Two Choices (P2C) & Peak EWMA
   • Sorteia 2 nós aleatórios e escolhe o de menor carga (complexidade O(1)).
   • Elimina o "Herd Effect" (efeito manada em Service Meshes como Envoy/Finagle).
```

---

## Detecção de Falhas: Health Checking vs. Heartbeats

Mecanismos complementares para identificação de degradação em sistemas distribuídos:

```text
          HEARTBEAT (PUSH: "Estou vivo")                    HEALTH CHECK (PULL: "Estou apto?")
   ┌────────────────┐   Frame UDP/TCP (Ping)         ┌───────────────┐   HTTP GET /health/ready
   │  Nó do Cluster │ ────────────────────────►      │ Load Balancer │ ────────────────────────►
   │                │ (A cada 3s para o líder)       │ / Orquestrador│ ◄────────────────────────
   └────────────────┘                                └───────────────┘   HTTP 200 OK / 503 Falha
```

| Dimensão | Heartbeats (Batimento Cardíaco) | Health Checking (Sondagem Funcional) |
| :--- | :--- | :--- |
| **Direção de Tráfego** | **PUSH** (O nó envia ativamente ao líder) | **PULL** (O balanceador/orquestrador sonda o nó) |
| **Pergunta Fundamental**| *"A máquina física/processo ainda existe?"* | *"O serviço está apto para processar trabalho real?"* |
| **Tamanho do Payload** | Mínimo (frame TCP/UDP, poucos bytes) | Estruturado (requisição HTTP/gRPC com status/JSON) |
| **Detecção de Falhas** | Quedas de máquina, kernel panic ou cabo desconectado | Deadlocks, saturação de threads, falha de dependências |
| **O Risco do "Nó Zumbi"**| **Suscetível:** thread de rede viva enviando pings enquanto o banco/aplicação está em deadlock! | **Imune:** valida diretamente a execução de transações e capacidade do nó de responder. |
| **Tecnologias Típicas** | Algoritmos de Consenso (Raft/Paxos), RabbitMQ, BGP | AWS ALB/NLB, Nginx upstream, Kubernetes Probes |

---

## Sondagens em Microsserviços: Liveness vs. Readiness Probes

Em orquestradores modernos (Kubernetes, Nomad, ECS), o ciclo de vida da aplicação é governado por sondagens com semânticas e consequências distintas:

```text
                        FLUXO OPERACIONAL DE PROBES (CICLO DE VIDA)
                 ┌─────────────────────────────────────────────────────────────┐
                 │                   INICIALIZAÇÃO DO CONTAINER                │
                 └──────────────────────────────┬──────────────────────────────┘
                                                ▼
                     ┌─────────────────────────────────────────────────────┐
                     │ STARTUP PROBE: Aplicação subiu e carregou configs? │
                     └──────────────────────────┬──────────────────────────┘
                                                ▼ (Sucesso)
       ┌────────────────────────────────────────┴────────────────────────────────────────┐
       ▼                                                                                  ▼
┌──────────────────────────────────────────────────┐  ┌──────────────────────────────────────────────────┐
│ LIVENESS PROBE (O processo travou em deadlock?)  │  │ READINESS PROBE (O nó está pronto para tráfego?) │
├──────────────────────────────────────────────────┤  ├──────────────────────────────────────────────────┤
│ • Status 200: Mantém o container executando      │  │ • Status 200: Adiciona nó no Load Balancer       │
│ • Status 5xx: REINICIA o container (SIGKILL)     │  │ • Status 5xx: ISOLA o nó da rota (Sem tráfego)   │
│                                                  │  │                 (NÃO reinicia o container!)      │
└──────────────────────────────────────────────────┘  └──────────────────────────────────────────────────┘
```

### A Regra de Ouro da Confiabilidade:
* **Liveness Probe:** Serve exclusivamente para recuperar de falhas irrecuperáveis do processo local (deadlocks e loops infinitos). Deve testar apenas a própria thread/porta HTTP.
* **Readiness Probe:** Serve para avaliar dependências e prontidão (banco conectado, cache aquecido, migrações concluídas).
* ⚠️ **O Desastre do "CrashLoopBackOff":** Se você colocar a checagem do banco de dados no `livenessProbe` e o banco sofrer uma lentidão transitória de 10 segundos, o orquestrador matará **todos os pods da aplicação simultaneamente**, criando uma indisponibilidade total e permanente em cascata!

---

## API Gateways: A Camada de Orquestração de Borda

O **API Gateway** consolida funções de infraestrutura e segurança em um único ponto de entrada para microsserviços:

```text
 ┌──────────────────┐
 │ Apps Mobile / Web│
 └────────┬─────────┘
          │  HTTPS / gRPC / WebSockets
          ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                             API GATEWAY                                     │
 │  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
 │  │ Autenticação (JWT/OIDC│  │ Rate Limiting & Quotas│  │ WAF & Segurança │  │
 │  └───────────────────────┘  └───────────────────────┘  └─────────────────┘  │
 │  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
 │  │ Roteamento Dinâmico   │  │ Agregação de APIs/BFF │  │ Telemetria &    │  │
 │  │ (Service Discovery)   │  │ (GraphQL / REST)      │  │ Tracing (OTel)  │  │
 │  └───────────────────────┘  └───────────────────────┘  └─────────────────┘  │
 └────────┬────────────────────────────┬────────────────────────────┬──────────┘
          │                            │                            │
          ▼                            ▼                            ▼
 ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
 │ Auth Service    │          │ Orders Service  │          │ Payment Service │
 └─────────────────┘          └─────────────────┘          └─────────────────┘
```

### Principais Tecnologias e Padrões
* **Padrão BFF (Backend For Frontend):** Gateways especializados gerando respostas otimizadas para diferentes tipos de clientes (ex: payloads compactos para mobile e completos para web).
* **Soluções de Mercado:** **Kong** (Open-source / Lua / Nginx), **Apache APISIX**, **Envoy Gateway**, **Traefik**, **AWS API Gateway**, **Spring Cloud Gateway**.

---

## Matriz Comparativa: Intermediários de Rede

| Critério | Forward Proxy | Reverse Proxy | Load Balancer (L4/L7) | API Gateway |
| :--- | :--- | :--- | :--- | :--- |
| **Ponto de Atuação** | Lado do Cliente (Saída) | Lado do Servidor (Entrada) | Lado do Servidor (Distribuição) | Borda de Microsserviços |
| **Função Primária** | Anonimato, Cache, Filtro | Terminação SSL, Segurança | Distribuição de carga, HA | Auth, Rate Limit, BFF, Roteamento |
| **Camada OSI** | Camadas 4 e 7 | Camada 7 (e Camada 4) | Camada 4 (TCP/UDP) ou 7 (HTTP) | Camada 7 (HTTP, gRPC, WS) |
| **Visibilidade de Payload**| Conforme protocolo | Completa (HTTP decodificado) | L4: Nenhuma / L7: Completa | Completa (Inspeção e Mutação) |
| **Exemplos Típicos** | Squid, Shadowsocks, Zscaler | Nginx, HAProxy, Caddy | AWS NLB/ALB, HAProxy, IPVS | Kong, Envoy, KrakenD, APISIX |

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 2)
## Proteção de Infraestrutura: Rate Limiting & Throttling

---

## Conceito e Diferenciação: Rate Limiting vs. Throttling

Para prevenir ataques de negação de serviço (DoS), scraping abusivo e saturação em cascata, aplicam-se duas estratégias:

```text
               RATE LIMITING (Rejeição Estrita)                  THROTTLING (Regulação / Suavização)
 ┌─────────┐     ┌─────────────────────────────┐   ┌─────────┐     ┌─────────────────────────────┐
 │ 150 RPS │ ──► │  Limite: 100 RPS            │   │ 150 RPS │ ──► │  Fila Buffer / Delay        │
 └─────────┘     │  • 100 Req ──► 200 OK       │   └─────────┘     │  • Suaviza o pico para 100  │
                 │  • 50 Req  ──► 429 Too Many │                   │    RPS constantes           │
                 │                Requests     │                   │  • Aumenta a latência em vez│
                 └─────────────────────────────┘                   │    de rejeitar de imediato  │
                                                                   └─────────────────────────────┘
```

* **Rate Limiting:** Política rígida de barreira. Se um cliente ultrapassar *K* requisições no intervalo *T*, as chamadas adicionais são instantaneamente rejeitadas com o status **`HTTP 429 Too Many Requests`**.
* **Throttling (Estrangulamento / Degradation):** Mecanismo elástico que reduz a velocidade de processamento, enfileira temporariamente requisições ou desativa funcionalidades secundárias não críticas para manter o núcleo do sistema estável.

### Cabeçalhos Padronizados pela IETF (RFC 6585 / Draft RFC 9651)
* `RateLimit-Limit: 100`: Número máximo de requisições permitidas por janela.
* `RateLimit-Remaining: 14`: Requisições restantes na janela vigente.
* `RateLimit-Reset: 32`: Segundos restantes até a redefinição total do limite.
* `Retry-After: 30`: Tempo que o cliente deve aguardar antes de tentar novamente após receber um código 429.

---

## Os 5 Algoritmos Fundamentais de Rate Limiting

```text
 1. Token Bucket            2. Leaky Bucket            3. Fixed Window            4. Sliding Window Log      5. Sliding Window Counter
 ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
 │ +Tokens a cada Δt     │  │ Fila FIFO de entrada  │  │ Contador fixo que     │  │ Armazena timestamp de │  │ Média ponderada da    │
 │ Cap máx = B           │  │ Vazamento a taxa      │  │ reseta no fim do bloco│  │ cada requisição       │  │ janela atual + fração │
 │ Permite rajadas (burst│  │ constante estrita     │  │ Vulnerável a estouro  │  │ Alta precisão, alto   │  │ da janela anterior    │
 │ controladas)          │  │ (Traffic Shaping)     │  │ 2x nas bordas de bloco│  │ consumo de memória    │  │ O(1) de memória, leve │
 └───────────────────────┘  └───────────────────────┘  └───────────────────────┘  └───────────────────────┘  └───────────────────────┘
```

---

## Algoritmo 1: Token Bucket (Balde de Tokens) - Mecânica

Um balde com capacidade máxima **B** acumula tokens gerados a uma taxa constante de **R** tokens por segundo:

```text
       GERADOR DE TOKENS (Taxa R tokens/seg)
                │
                ▼
         ┌─────────────┐
         │ 🪙 🪙 🪙    │ ◄─── Capacidade Máxima do Balde = B (Burst Permitido)
         │ 🪙 🪙 🪙 🪙 │
         └─────────────┘
                │
     Requisição chega ao Gateway (Custo = k tokens)
                │
       Há k tokens no balde?
         ├─── SIM ──► Consome k Tokens ──► Encaminha Requisição (HTTP 200 OK)
         └─── NÃO ──► Rejeita Imediatamente (HTTP 429 Too Many Requests)
```

### Cálculo On-Demand do Refil (Lazy Evaluation - Zero Cron Jobs)
Em vez de uma thread em segundo plano adicionando tokens continuamente, o recarregamento é calculado sob demanda no exato instante de cada requisição:

```text
Tokens Atuais = min(B, Tokens Anteriores + (Δt × R))
onde Δt = tempo_atual - tempo_ultimo_refil
```

---

## Token Bucket: Vantagens vs. Problemas & Trade-offs Críticos

### 🟢 Vantagens Principais
* **Suporte a Rajadas Naturais (Bursts):** Permite até **B** requisições instantâneas (capacidade máxima do balde) sem adicionar latência de fila se houver saldo acumulado. Essencial para aplicações web/mobile reais (ex: carregar uma página dispara 20 requisições HTTP paralelas para buscar dados, perfil, notificações e feed).
* **Extrema Eficiência Computacional (complexidade `O(1)` CPU e RAM):** Armazena apenas dois valores por usuário no Redis/Memória: `tokens_saldo` (float) e `ultimo_timestamp` (inteiro). Zero custo de varredura ou limpeza de logs.
* **Custo Ponderado por Rota:** Permite precificar requisições com base no consumo real de recursos:
  * `GET /api/v1/health` → Consome 1 Token
  * `POST /api/v1/relatorios/pdf` → Consome 5 Tokens (computacionalmente caro)

### 🔴 Problemas e Riscos em Produção
* **Zero Traffic Shaping (Risco Downstream):** Se o balde estiver cheio com **B = 100**, 100 requisições simultâneas passarão todas no mesmo milissegundo para os servidores internos, podendo saturar pools de conexões (`DB Connection Pool Exhaustion`) ou causar picos violentos de CPU no banco relacional.
* **Complexidade de Calibração (B vs. R):** Sintonizar dois parâmetros interdependentes é difícil. Se **B** for alto demais, o backend sofre; se **R** for baixo demais, usuários legítimos sofrem *throttling* indevido.
* **Condições de Corrida Concorrentes:** Em ambientes distribuídos, o ciclo de leitura → cálculo → escrita exige scripts atômicos (Redis Lua) para evitar que múltiplos nós consumam os mesmos tokens em paralelo.
* **Adoção na Indústria:** Padrão de mercado adotado por **AWS API Gateway**, **Stripe API**, **Kong Gateway** e **Google Guava**.

---

## Algoritmo 2: Leaky Bucket (Balde Furado) - Mecânica

Trabalha como uma fila FIFO com capacidade finita **B** que esvazia a uma taxa estritamente uniforme e constante de **R** requisições por segundo:

```text
     REQUISIÇÕES ENTRANTES (Rajadas caóticas: 100 RPS, 0 RPS, 70 RPS)
                │
                ▼
         ┌─────────────┐
         │ 💧 💧 💧 💧 │ ◄─── Fila FIFO com Capacidade Máxima B (Buffer)
         │ 💧 💧 💧 💧 │      Se a fila estiver cheia: Overflow ──► HTTP 429
         └──────┬──────┘
                │
                ▼ [Furo de Saída: Vazão Estritamente Constante = R reqs/seg]
         ┌─────────────┐
         │ Servidores  │ ◄─── Fluxo perfeitamente suavizado e previsível (Traffic Shaping)
         └─────────────┘
```

### Traffic Policing vs. Traffic Shaping
* **Policing (Token Bucket):** Permite rajadas instantâneas e descarta abruptamente o excedente.
* **Shaping (Leaky Bucket):** Enfileira e retarda as requisições para forçar uma vazão perfeitamente suave.

---

## Leaky Bucket: Vantagens vs. Problemas & Trade-offs Críticos

### 🟢 Vantagens Principais
* **Traffic Shaping Estrito (Vazão 100% Previsível):** Elimina completamente oscilações e variações abruptas de I/O no backend. A taxa de chegada nos servidores nunca ultrapassa **R** requisições por segundo.
* **Blindagem Máxima para Sistemas Frágeis:** Ideal para proteger bancos de dados relacionais (PostgreSQL/Oracle), *mainframes* legados e integrações com APIs de terceiros que impõem cotas duras e cobram multas por picos.
* **Absorção Graciosa de Picos Temporários:** Pequenas rajadas não são descartadas imediatamente com HTTP 429; elas são temporariamente enfileiradas no buffer e processadas sequencialmente assim que houver capacidade.

### 🔴 Problemas e Riscos em Produção
* **Penalidade Severa de Latência (Queue Delay):** Toda requisição recebida quando o balde já possui itens na fila é forçada a aguardar sua vez no buffer FIFO, **mesmo que os servidores de backend estejam 100% ociosos naquele instante**. A latência P99 e P99.9 explode.
* **Buffer Bloat & Timeout do Cliente (504 Gateway Timeout):** Se a rajada de tráfego for contínua, o buffer FIFO atinge a capacidade máxima. Requisições no fim da fila sofrem timeout no navegador/mobile antes mesmo de saírem do balde, desperdiçando recursos de CPU quando forem finalmente executadas.
* **Experiência Ruim para SPAs Modernas:** Uma interface moderna que envia 15 chamadas paralelas para carregar a dashboard terá 14 requisições enfileiradas ou descartadas, causando carregamento perceptivelmente lento.
* **Adoção na Indústria:** Módulo `limit_req` do **Nginx**, controle de tráfego de switches/roteadores (Linux `tc`), enfileiramento de Webhooks assíncronos (Shopify).

---

## Algoritmo 3: Janelas Temporais - Janela Fixa vs. Log Deslizante

```text
             FIXED WINDOW (Janela Fixa)                        SLIDING WINDOW LOG (Log Deslizante)
 Janela 1 (00:00-01:00)     Janela 2 (01:00-02:00)       Janela Móvel de 60s [t - 60s, t]
 ┌──────────────────────┐   ┌──────────────────────┐    ┌────────────────────────────────────────┐
 │                      │   │                      │    │ [00:15] [00:32] [00:48] [01:02] [01:09]│
 │  00:59               │   │ 01:01                │    └────────────────────────────────────────┘
 │  [50 Requisições]    │   │ [50 Requisições]     │                   │
 └──────────────────────┘   └──────────────────────┘                   ▼
           ▲                          ▲                      Calcula count(timestamps) no range
           └────────────┬─────────────┘                      • Precisão matemática de 100%.
             100 Requisições em 2 segundos!                  • Desvantagem: Consumo massivo de RAM
             (Estouro 2x o limite permitido)                   ao armazenar cada timestamp no Redis.
```

### O Dilema Entre Simplicidade e Precisão
* **Fixed Window (Janela Fixa):**
  * *Vantagem:* `O(1)` de memória e tempo. Uma única chave no Redis com TTL (`INCR key` + `EXPIRE key 60`).
  * *Problema Fatal (Estouro de Borda - Boundary Burst 2x):* Um atacante envia o limite máximo no último segundo da Janela 1 (ex: 50 reqs às 00:59) e o limite no primeiro segundo da Janela 2 (50 reqs às 01:01). O sistema processa **100 requisições em 2 segundos**, violando o limite nominal em 100%!
* **Sliding Window Log (Log Deslizante em Tempo Real):**
  * *Vantagem:* **Precisão Matemática de 100%:** Desliza a janela `[t - W, t]` de forma perfeitamente contínua no tempo. Elimina qualquer anomalia de borda.
  * *Problema Fatal (Explosão de Memória RAM `O(M)`):* Cada requisição grava seu timestamp num Sorted Set (`ZSET`) do Redis. Sob 10.000 req/s, o Redis armazena milhões de registros e a limpeza contínua via `ZREMRANGEBYSCORE` satura a CPU da thread do Redis.

---

## Algoritmo 4: Sliding Window Counter (Janela Híbrida - Cloudflare)

Combina o consumo mínimo de memória da Janela Fixa (`O(1)`) com a precisão do Log Deslizante através de uma **interpolação linear ponderada**:

```text
   Janela Anterior (Ex: 100 reqs)             Janela Atual (Ex: 30 reqs)
 ┌──────────────────────────────────────┐ ┌──────────────────────────────────────┐
 │                                      │ │                                      │
 └───────────────────┬──────────────────┘ └──────────────────┬───────────────────┘
                     │◄────────────── 60 Segundos ──────────►│
                                   [Janela Deslizante]
                                      70% Anterior + 30% Atual
```

### Equação de Estimativa de Carga em Tempo Real

```text
Requisições Estimadas = (Contador Janela Anterior × (1 - Progresso Janela Atual)) + Contador Janela Atual
```

* **Cálculo Numérico Prático:**
  * Limite da API = 100 req/min. Minuto anterior teve 100 requisições.
  * No minuto atual, já se passaram 18 segundos (30% do tempo da janela) e recebemos 30 requisições:
```text
Carga Estimada = (100 × (1 - 0.30)) + 30 = (100 × 0.70) + 30 = 70 + 30 = 100 requisições
```
  * A **31ª requisição** deste minuto será rejeitada com HTTP 429, **impedindo o estouro de borda**!

---

## Sliding Window Counter: Vantagens vs. Problemas & Trade-offs Críticos

### 🟢 Vantagens Principais
* **Consumo Mínimo de Memória (`O(1)`):** Armazena apenas 2 números inteiros por cliente/chave (`janela_anterior` e `janela_atual`), dispensando o armazenamento de listas de timestamps individuais.
* **Mitigação do Estouro de Borda (99.9% de Precisão):** Como o tráfego da janela anterior perde peso linearmente à medida que a janela atual avança, o ataque de borda é neutralizado com baixíssimo custo operacional.
* **Altíssima Performance:** Execução em microsegundos com comandos atômicos simples do Redis (`GET` e `INCR`), tornando-o ideal para nós de borda (Edge Workers / Cloudflare).

### 🔴 Problemas e Riscos em Produção
* **Premissa de Distribuição Uniforme (Erro de Interpolação):** O cálculo matemático assume que as requisições da janela anterior ocorreram de maneira uniforme ao longo do tempo.
  * *Cenário Crítico:* Se todas as 100 requisições do minuto anterior ocorreram nos primeiros 5 segundos e os 55 segundos seguintes foram de silêncio absoluto, a aproximação linear ainda considerará que 70% ou 50% daquele tráfego "ainda pesa", gerando **falsos positivos de limitação** no início do minuto seguinte.
  * *Impacto Estatístico:* Estudos da Cloudflare comprovam que esse desvio afeta menos de **0.05%** das requisições em tráfego de produção real, sendo o melhor custo-benefício da indústria.

---

## Matriz Comparativa Definitiva: Qual Algoritmo Escolher?

| Critério Arquitetural | Token Bucket | Leaky Bucket | Fixed Window | Sliding Window Log | Sliding Window Counter |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Suporta Rajadas (Bursts)?** | Sim (até capacidade B) | Não (Vazão R fixa) | Sim (apenas no início) | Não (Estrito na janela) | Parcial (amortecido) |
| **Faz Traffic Shaping?** | Não | **Sim (Estrito)** | Não | Não | Não |
| **Consumo de Memória** | **O(1)** (2 floats) | O(B) (Tamanho Fila) | **O(1)** (1 inteiro) | 🔴 **O(M)** (Timestamps) | **O(1)** (2 inteiros) |
| **Custo de CPU / Tempo** | **O(1)** (Lazy eval) | O(1) | **O(1)** | 🔴 O(log M) (ZSET) | **O(1)** (Interpolação) |
| **Vulnerável a Estouro 2x?** | Não | Não | 🔴 **Sim (Nas bordas)** | Não | Não (99.9% imune) |
| **Principal Risco em Prod** | Picos no DB downstream | Latência alta / Bloat | Estouro de borda 2x | **Esgotamento de RAM** | Erro de interpolação |
| **Melhor Cenário de Uso** | APIs REST, Gateways | Backends legados, DBs | Limites flexíveis/baixas reqs | Auditoria estrita / poucas reqs | **CDNs de Borda, APIs em Escala** |

---

## Rate Limiting Distribuído com Redis & Script Lua Atômico

Em clusters distribuídos, consultas e incrementos convencionais geram condições de corrida (*Race Conditions*). A execução atômica via **Script Lua** no Redis garante integridade:

```lua
-- Script Lua Atômico para Sliding Window / Token Bucket no Redis
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local current_time = tonumber(ARGV[2])
local window_size = tonumber(ARGV[3])

-- 1. Remove registros fora da janela deslizante
redis.call('ZREMRANGEBYSCORE', key, 0, current_time - window_size)

-- 2. Conta quantas requisições restam na janela
local current_requests = redis.call('ZCARD', key)

if current_requests < limit then
    -- 3. Adiciona a requisição atual com seu timestamp
    redis.call('ZADD', key, current_time, current_time)
    redis.call('EXPIRE', key, window_size)
    return {1, limit - current_requests - 1} -- [Permitido, Restantes]
else
    return {0, 0} -- [Bloqueado / 429, Restantes]
end
```

> **Por que Script Lua?** O Redis executa o script de forma mono-thread e atômica, eliminando *Race Conditions* entre dezenas de nós de API sem a necessidade de travas distribuídas (*Distributed Locks*) lentas.

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 2)
## Caching Distribuído & Content Delivery Networks (CDNs)

---

## A Hierarquia de Caching na Web

O cache opera em múltiplas camadas coordenadas para reduzir a distância física entre o dado e o usuário:

```text
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ 1. Client-Side (Navegador / App Mobile): Cache HTTP, Service Workers, IndexedDB│
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ 2. Edge Caching (CDN / POPs Globais): Cloudflare, CloudFront, Akamai, Fastly│
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ 3. Reverse Proxy & Gateway Cache: Varnish, Nginx, Apache Traffic Server     │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ 4. Application In-Memory Cache: Memória local do processo (Guava, Caffeine) │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ 5. Distributed Cache: Cluster Redis, Memcached, Hazelcast                   │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ 6. Database Buffers & Storage: PostgreSQL Shared Buffers, InnoDB Buffer Pool│
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## Padrões Estratégicos de Cache (Cache Patterns)

O gerenciamento de dados em cache exige a escolha deliberada de quando carregar e quando persistir dados entre a **Aplicação**, a **Camada de Cache (Redis/Memcached)** e a **Base de Dados Primária (SQL/NoSQL)**:

```text
                               TAXONOMIA DOS PADRÕES DE CACHE
 ┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────────────┐
 │         ESTRATÉGIAS DE LEITURA (READ)        │  │        ESTRATÉGIAS DE ESCRITA (WRITE)        │
 ├──────────────────────────────────────────────┤  ├──────────────────────────────────────────────┤
 │ • CACHE-ASIDE (Lazy Loading):                │  │ • WRITE-THROUGH:                             │
 │   A aplicação orquestra leitura no cache e   │  │   Escrita síncrona simultânea em Cache e DB. │
 │   repopula sob demanda no Cache Miss.        │  │ • WRITE-BEHIND (Write-Back):                 │
 │ • READ-THROUGH:                              │  │   Escrita imediata no Cache; fila assíncrona │
 │   O próprio cache busca no DB de forma       │  │   persiste em lote (batch) no DB.            │
 │   transparente para a aplicação.             │  │ • WRITE-AROUND:                              │
 │                                              │  │   Escrita vai direto ao DB sem tocar no cache│
 └──────────────────────────────────────────────┘  └──────────────────────────────────────────────┘
```

> **A Regra Fundamental de Consistência:** Toda camada intermediária de cache cria o risco inerente de **inconsistência eventual** ou **dados obsoletos (*stale data*)**. A escolha do padrão define o equilíbrio entre latência, throughput e consistência.

---

## Padrão 1: Cache-Aside (Lazy Loading) - Leitura e Invalidação

A aplicação é o orquestrador central: consulta o cache primeiro e só recorre ao banco em caso de falha (*Miss*):

```text
    FLUXO DE LEITURA (READ)                            FLUXO DE ESCRITA / ATUALIZAÇÃO (WRITE)
 ┌─────────┐ 1. GET key  ┌─────────┐                ┌─────────┐ 1. UPDATE DB  ┌─────────────┐
 │         │────────────►│  Redis  │                │         │──────────────►│    Banco    │
 │   App   │◄────────────│  Cache  │                │   App   │               │  de Dados   │
 │         │ 2. MISS     └─────────┘                │         │ 2. INVALIDA   └─────────────┘
 └───┬─────┘                  ▲                     └───┬─────┘    (DEL key)
     │ 3. SELECT *            │ 4. SET key (TTL)        │
     ▼                        │                         ▼
 ┌─────────┐                  │                     ┌─────────┐
 │  Banco  │──────────────────┘                     │  Redis  │ ◄── Próxima leitura
 │ de Dados│ (Popula sob demanda)                   │  Cache  │     sofrerá Cache Miss e
 └─────────┘                                        └─────────┘     buscará o dado novo!
```

### 🟢 Vantagens
* **Alocação Inteligente de Memória:** O cache armazena exclusivamente os dados quentes (*hot data*) que são realmente requisitados pelos usuários. Zero desperdício de RAM com registros inativos.
* **Resiliência a Falhas do Cache:** Se o cluster Redis cair, a aplicação degrada em performance (aumenta a latência), mas **não fica fora do ar**: todas as consultas simplesmente batem no banco de dados.

### 🔴 Problemas & Trade-offs Críticos
* **Penalidade Tripla no Miss (*Cache Miss Penalty*):** No primeiro acesso, a aplicação sofre latência tripla (consulta falha no cache + query no banco + gravação no cache).
* **Risco de Dados Obsoletos (*Stale Data*):** Se o banco for alterado por outro serviço sem invalidar a chave no Redis, a aplicação servirá dados defasados até o TTL expirar.
* **Por que INVALIDAR (DEL) em vez de ATUALIZAR (SET) no Cache?** Atualizar diretamente gera *Race Conditions* com escritas concorrentes; deletar força a próxima leitura a ler o estado definitivo do banco.

---

## Padrão 2: Write-Through - Consistência Estrita

A aplicação trata o cache como a fonte primária de escrita. O cache grava no banco de dados sincronamente antes de confirmar o sucesso para a aplicação:

```text
                       FLUXO DE ESCRITA SINCRONIZADA (WRITE-THROUGH)
 ┌───────────┐    1. WRITE(id, data)    ┌───────────┐   2. INSERT/UPDATE    ┌───────────┐
 │ Aplicação │ ───────────────────────► │   Cache   │ ────────────────────► │   Banco   │
 │           │ ◄─────────────────────── │ (Memória) │ ◄──────────────────── │ de Dados  │
 └───────────┘       4. 200 OK          └───────────┘       3. Confirmado   └───────────┘
```

### 🟢 Vantagens
* **Consistência Rigorosa e Imediata:** Cache e banco de dados estão sempre 100% sincronizados. Nunca há dados obsoletos servidos a partir do cache.
* **Leituras Sempre Aceleradas (100% Hit Rate para dados novos):** Qualquer registro recém-criado já está aquecido no cache para as próximas consultas imediatas.

### 🔴 Problemas & Trade-offs Críticos
* **Alta Latência de Escrita (Penalidade Dupla de I/O):** A aplicação precisa aguardar duas viagens de rede e escrita sequenciais: primeiro no cache e depois no disco do banco de dados relacional.
* **Poluição de Memória Cache (*Cache Churn / Waste*):** Se a aplicação grava dados em alta frequência que raramente ou nunca são relidos (ex: logs de auditoria, históricos), a memória RAM do cache fica lotada de registros frios, forçando a evicção prematura de dados úteis.
* **Casos de Uso Ideais:** Sistemas bancários, tabelas de permissões/perfis de usuários, transações de e-commerce onde a perda de consistência é inaceitável.

---

## Padrão 3: Write-Behind (Write-Back) - Throughput Extremo

A escrita é confirmada instantaneamente na memória RAM do cache. A persistência no banco relacional ocorre de forma **assíncrona** por meio de filas e workers em lote (*batching*):

```text
                      FLUXO ASSÍNCRONO EM LOTE (WRITE-BEHIND)
 ┌───────────┐   1. WRITE (Rápido)   ┌───────────┐
 │ Aplicação │ ────────────────────► │   Cache   │ ──► Confirma 200 OK imediatamente (~1ms)!
 └───────────┘ ◄──────────────────── │ (Memória) │
                   2. Sucesso Implícito └───┬───────┘
                                            │ 3. Fila / Buffer de Mudanças (Apenas RAM)
                                            ▼
                                     ┌─────────────┐
                                     │   Worker    │ ◄── Agrupa 500 escritas em 1 única
                                     │ Em Lote     │     transação SQL (Batch Coalescing)
                                     └──────┬──────┘
                                            │ 4. Bulk INSERT / UPDATE
                                            ▼
                                     ┌─────────────┐
                                     │ Banco Dados │
                                     └─────────────┘
```

### 🟢 Vantagens
* **Throughput de Escrita Excepcional:** A latência de escrita para o cliente é a velocidade da RAM do Redis (~1 milissegundo).
* **Amortização de Carga no Banco (*Write Coalescing*):** Se um contador ou registro for alterado 100 vezes em 2 segundos (ex: contagem de likes ou views em vídeo viral), o worker agrupa todas as alterações e executa **um único `UPDATE` no PostgreSQL**, salvando o banco de colapso.

### 🔴 Problemas & Trade-offs Críticos
* **💥 Risco Crítico de Perda Definitiva de Dados (*Data Loss*):** Se o servidor de cache travar ou faltar energia antes da fila assíncrona descarregar no banco, todas as escritas pendentes na RAM são perdidas para sempre.
* **Complexidade de Consistência Eventual:** O banco de dados fica defasado em relação ao cache até que o lote termine de rodar.

---

## Padrão 4: Write-Around - Blindagem Contra Poluição de RAM

A aplicação grava **diretamente no banco de dados**, contornando (*bypassando*) o cache por completo. O cache só será preenchido se o registro for lido posteriormente:

```text
                       FLUXO DE ESCRITA DIRETA (WRITE-AROUND)
                                  ┌─────────────┐
                                  │    Cache    │ ◄── Permanece limpo e intacto!
                                  │   (Redis)   │     (Zero poluição de RAM)
                                  └─────────────┘
                                         ▲
    1. WRITE direto no Banco             │ 3. Carrega no Cache APENAS SE
 ┌───────────┐                          │    for lido depois (via Cache-Aside)
 │ Aplicação │ ──────────────────────┐  │
 └───────────┘                       ▼  │
                              ┌─────────────┐
                              │ Banco Dados │
                              │ (Postgres)  │
                              └─────────────┘
```

### 🟢 Vantagens
* **Proteção Máxima da Memória RAM:** Evita poluir o cache com grandes volumes de dados que só serão lidos uma única vez ou após muito tempo (ex: arquivos anexos de usuários, logs de segurança, extratos antigos).
* **Ideal para Cargas *Write-Heavy / Read-Rare*:** Mantém a RAM reservada exclusivamente para os 20% de dados que geram 80% do tráfego de leitura (Princípio de Pareto).

### 🔴 Problemas & Trade-offs Críticos
* **Cache Miss Obrigatório na Primeira Leitura:** Se um registro acabou de ser escrito e for consultado imediatamente em seguida, a aplicação sofrerá inevitavelmente um *Cache Miss*, forçando uma consulta lenta ao banco.
* **Casos de Uso Ideais:** Upload de novos vídeos ou documentos, relatórios tributários anuais, históricos de faturamento e backups.

---

## Matriz Comparativa dos Padrões de Cache

| Critério Arquitetural | Cache-Aside (Lazy) | Write-Through | Write-Behind (Write-Back) | Write-Around |
| :--- | :--- | :--- | :--- | :--- |
| **Latência de Leitura** | ⚡ Rápida (após Miss inicial) | ⚡ Rápida (sempre aquecido) | ⚡ Rápida (sempre aquecido) | 🐢 Lenta na 1ª leitura |
| **Latência de Escrita** | Média (escreve DB + DEL cache)| 🐢 Lenta (escreve Cache + DB)| ⚡ Instantânea (RAM pura) | Normal (escreve só no DB) |
| **Consistência dos Dados** | Eventual (risco de stale) | **Estrita (Síncrona)** | Eventual (lag na fila) | Alta (banco é a fonte) |
| **Risco de Perda de Dados**| Zero (banco é a fonte) | Zero (banco é a fonte) | 🔴 **ALTO (se cache cair)** | Zero (banco é a fonte) |
| **Uso Eficiente de RAM** | **Excelente (só dados lidos)** | Ruim (guarda tudo que grava) | Ruim (guarda tudo que grava)| **Excelente (evita poluição)**|
| **Melhor Cenário de Aplicação**| Leituras frequentes (Redes Sociais, Catálogos) | Dados críticos e imutáveis (Bancos, Cadastros) | Picos violentos de escrita (IoT, Likes, Logs) | Dados raramente relidos (Relatórios, Backups) |

---

## Políticas de Evicção: Como o Cache Sobrevive à Memória Cheia

A memória RAM é um recurso finito e de alto custo. Quando o cluster de cache atinge o limite máximo estipulado (`maxmemory` no Redis), novas chaves só entram se chaves antigas forem sumariamente **descartadas (evictadas)**:

```text
                               POLÍTICAS FUNDAMENTAIS DE EVICÇÃO
 ┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────────────┐
 │ LRU (Least Recently Used)                    │  │ LFU (Least Frequently Used)                  │
 │ Descarta o item acessado há mais tempo.      │  │ Descarta o item com menor contagem de acessos│
 │ Foco na TEMPORALIDADE / RECÊNCIA.            │  │ Foco na POPULARIDADE HISTÓRICA.              │
 ├──────────────────────────────────────────────┤  ├──────────────────────────────────────────────┤
 │ FIFO (First In, First Out)                   │  │ TTL / VOLATILE-RANDOM                        │
 │ Descarta o item mais antigo inserido,        │  │ Descarta apenas chaves com tempo de expiração│
 │ ignorando se ele ainda é lido ou não.        │  │ configurado que estejam próximas do fim.     │
 └──────────────────────────────────────────────┘  └──────────────────────────────────────────────┘
```

> **Sem Política de Evicção (`noeviction` no Redis):** Quando a RAM atinge 100%, o Redis rejeita qualquer nova operação de escrita com o erro fatal `OOM command not allowed when used memory > 'maxmemory'`.

---

## LRU (Least Recently Used) em Detalhe: Arquitetura O(1)

Como manter uma lista perfeitamente ordenada por tempo de acesso com complexidade **`O(1)` tanto para leitura quanto para escrita**? Combinando duas estruturas de dados:

```text
             ARQUITETURA INTERNA DO LRU: HASH TABLE + LISTA DUPLAMENTE ENCADEADA
   HASH TABLE (Acesso O(1) por Chave)
 ┌───────────────┬──────────────────────┐
 │ Chave         │ Ponteiro para o Nó   │
 ├───────────────┼──────────────────────┤
 │ "user:1001"   │ ──► [ Nó A ]         │
 │ "user:1002"   │ ──► [ Nó B ]         │
 │ "user:1003"   │ ──► [ Nó C ]         │
 └───────────────┴──────────────────────┘
                           │
                           ▼
          DOUBLY LINKED LIST (Ordenada por Recência de Uso)
       ┌─────────────────────────────────────────────────────────────┐
       │                                                             │
  ┌────▼────┐  prev    ┌─────────┐  prev    ┌─────────┐  prev   ┌────┴────┐
  │  Nó A   │ ◄─────── │  Nó B   │ ◄─────── │  Nó C   │ ◄────── │  Nó D   │
  │ (Recent)│ ───────► │         │ ───────► │         │ ──────► │ (Antigo)│
  └─────────┘  next    └─────────┘  next    └─────────┘  next   └─────────┘
       ▲                                                             ▲
    HEAD (MRU: Most Recently Used)                                TAIL (LRU: Least Recently Used)
    • Item lido é movido para cá em O(1)                          • Item descartado em O(1) se RAM encher!
```

### O Ponto Fraco do LRU: A Poluição por Varredura Sequencial (*Scan Pollution*)
Se um script de backup ou análise executar um `SELECT * FROM transacoes` varrendo 100.000 registros antigos que nunca mais serão lidos, o LRU moverá todos esses dados para a cabeça (*Head*), **expulsando do cache os dados realmente quentes da aplicação**!

---

## LFU (Least Frequently Used) em Detalhe: Frequência vs. Envelhecimento

Em vez de olhar quando o dado foi lido pela última vez, o LFU mantém um **contador de acessos**:

```text
              ESTRUTURA DE BALDES DE FREQUÊNCIA (FREQUENCY BUCKETS)
 Frequência 1 Access          Frequência 5 Acessos          Frequência 1.000 Acessos
 ┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
 │ [ Chave X ] [Chave Y]│     │ [ Chave A ] [Chave B]│     │ [ HomeBanner ]       │
 └──────────┬───────────┘     └──────────────────────┘     └──────────────────────┘
            │
            ▼ Se a RAM encher:
  Descarta da Frequência Mais Baixa! (O(1))
```

### 🟢 Vantagem do LFU
* **Imune à Poluição por Varredura:** Uma chave que recebeu 5.000 acessos nos últimos 10 minutos não será expulsa por um script de varredura que leu um registro novo apenas 1 única vez.

### 🔴 O Problema Crítico do LFU: O Envelhecimento (*Cache Starvation / Decay*)
* *O Cenário da Black Friday:* Um produto recebe 1 milhão de acessos na sexta-feira de promoções. Quando a promoção acaba, aquele produto nunca mais é acessado, mas seu contador histórico é tão alto que **nenhuma chave nova consegue superá-lo**, mantendo lixo inútil no cache por semanas!
* *A Solução de Engenharia:* **Fator de Decaimento Logarítmico (`lfu-decay-time` no Redis)**. O contador de frequência é periodicamente reduzido pela metade se a chave passar *N* minutos sem novos acessos.

---

## TTL (Time-To-Live): Expiração Passiva vs. Ativa & O Risco do TTL Fixo

O TTL determina a data de validade de um registro no cache. No Redis, chaves expiradas são removidas por dois mecanismos complementares:

```text
                   OS DOIS MOTORES DE EXPIRAÇÃO DE TTL NO REDIS
 ┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────────────┐
 │ 1. EXPIRAÇÃO PASSIVA (Lazy on Read)          │  │ 2. EXPIRAÇÃO ATIVA (Active Sampling Daemon)  │
 ├──────────────────────────────────────────────┤  ├──────────────────────────────────────────────┤
 │ • A aplicação solicita uma chave via GET.    │  │ • 10 vezes por segundo (a cada 100ms), o     │
 │ • O Redis verifica: timestamp_atual > TTL?   │  │   Redis sorteia 20 chaves aleatórias com TTL.│
 │ • Se expirada: descarta a chave da RAM e     │  │ • Deleta imediatamente as expiradas.         │
 │   retorna `nil` (Cache Miss) para a App.     │  │ • Se > 25% estiverem expiradas, repete o     │
 │ • Problema: Chaves nunca relidas ficariam na │  │   ciclo para liberar RAM sem bloquear a CPU! │
 │   RAM para sempre ocupando espaço!           │  │                                              │
 └──────────────────────────────────────────────┘  └──────────────────────────────────────────────┘
```

### O Perigo Mortal do TTL Fixo
Configurar um TTL idêntico para milhões de chaves gravadas em lote (ex: `TTL = 3600` segundos) cria uma bomba-relógio arquitetural. No segundo 3.600, **todas as chaves expirarão no mesmíssimo instante**, disparando o temido colapso de **Cache Avalanche**.

---

## 💥 Falha Crítica 1: Cache Avalanche (Avalanche de Cache)

Ocorre quando uma enorme quantidade de chaves do cache expira simultaneamente ou quando o cluster de cache sofre uma reinicialização total inesperada:

```text
                          ANATOMIA DO CACHE AVALANCHE
  INSTANTE t = 3.599s                              INSTANTE t = 3.600s (EXPIRAÇÃO EM MASSA)
 ┌──────────────────────────┐                    ┌──────────────────────────┐
 │  Redis Cache: 99% HIT    │                    │  Redis Cache: 0% HIT     │ ◄── Milhares de chaves
 └────────────┬─────────────┘                    └────────────┬─────────────┘     expiram juntas!
              │ 1% Misses                                     │
              ▼                                               ▼ 10.000 REQUISIÇÕES/SEG EM MISS!
 ┌──────────────────────────┐                    ┌──────────────────────────┐
 │ Banco de Dados Relacional│                    │ Banco de Dados Relacional│ ◄── POOL DE CONEXÕES ESGOTA
 │ CPU: 15% (Tranquilo)     │                    │ CPU: 100% ──► CRASH! 💥  │     QUEDA EM CASCATA!
 └──────────────────────────┘                    └──────────────────────────┘
```

### 🛡️ Estratégias de Mitigação
1. **TTL Jitter (Aleatoriedade Controlada):** Adiciona uma variação randômica ao TTL base para dispersar as expirações no tempo:
```text
TTL Efetivo = TTL Base + random(0, Δt)
```
   *Exemplo:* Em vez de 3.600s fixos, aplicar `3600 + random(0, 300)` segundos. As expirações se distribuem suavemente ao longo de 5 minutos!
2. **Cluster de Cache com Alta Disponibilidade:** Implementar topologias com failover automático (Redis Sentinel ou Redis Cluster com réplicas multi-AZ) para impedir que a queda de um nó esvazie o cache.
3. **Cache Warming (Aquecimento Prévio):** Scripts de inicialização que pré-carregam dados críticos antes de abrir o tráfego em deploys.

---

## 🦬 Falha Crítica 2: Thundering Herd (Cache Stampede / Dogpiling)

Diferente da Avalanche (que envolve milhares de chaves), o **Thundering Herd** é causado pelo vencimento de **UMA ÚNICA CHAVE ULTRA-POPULAR** (*Hot Key*):

```text
                    ANATOMIA DO THUNDERING HERD (HOT KEY EXPIRADA)
                           Requisição A (Miss) ──► Executa Query Pesada no DB (250ms)
                         ┌────────────────────────────────────────────────────────┐
 "home_banner" EXPIRA ──►│ Requisição B (Miss) ──► Executa a MESMA Query no DB!   │ ──► 5.000 queries SQL
                         │ Requisição C (Miss) ──► Executa a MESMA Query no DB!   │     idênticas batem no
                         │ Requisição N (Miss) ──► Executa a MESMA Query no DB!   │     banco ao mesmo tempo!
                         └────────────────────────────────────────────────────────┘
```

### 🛡️ Estratégias de Mitigação
1. **Distributed Mutex / Lock Atômico no Redis (`SETNX`):**
   Apenas a primeira thread que sofre o miss ganha o direito de calcular a query no banco de dados. As outras aguardam ou dormem por 50ms:
   ```bash
   # Bloqueia a chave por 5 segundos exclusivamente para a Thread 1
   SET lock:home_banner "token_uuid" NX PX 5000
   ```
2. **Algoritmo XFetch (Probabilistic Early Refresh):**
   Atualiza o dado em background de forma probabilística **antes** de ele expirar, baseado no tempo de computação *δ* e agressividade *β*:
```text
Regenerar em background se: -β × δ × ln(random()) > TTL Restante
```
3. **Padrão Stale-While-Revalidate:** O cache entrega imediatamente a versão expirada para não travar o cliente, enquanto uma goroutine/thread assíncrona busca o dado novo no banco.

---

## 🕵️ Falha Crítica 3: Cache Penetration (Penetração de Cache)

Ocorre quando requisições consultam propositalmente ou acidentalmente **chaves que NÃO existem nem no Cache e nem no Banco de Dados**:

```text
                         ANATOMIA DO CACHE PENETRATION
 Atacante ou Bug Dispara
 GET /produtos/-9999999 ──► ┌───────────┐ ──► Cache Miss! ──► ┌───────────┐ ──► 404 NOT FOUND!
 GET /produtos/uuid-invalido│   Cache   │     (Não salva nada │   Banco   │     (Consulta custosa
 GET /produtos/ghost_9912   └───────────┘     no Redis!)      └───────────┘      de I/O em disco!)
                                  ▲                                 ▲
                                  └───────────────┬─────────────────┘
                                    100% DAS REQUISIÇÕES ATINGEM O BANCO!
```

### 🛡️ Estratégias de Mitigação
1. **Bloom Filter na Borda (Edge / API Gateway):**
   Uma estrutura de dados probabilística baseada em arrays de bits que responde com certeza absoluta:
   * *"O item DEFINITIVAMENTE NÃO EXISTE no banco"* → **Bloqueia a requisição imediatamente** com 404 sem tocar no cache nem no DB!
   * *"O item TALVEZ exista"* → Permite a consulta passar.
2. **Cache de Valor Nulo (Null Object Pattern):**
   Quando a busca no banco retornar que o registro não existe, grava no Redis a chave com valor nulo e um TTL curto (ex: 30 a 60 segundos):
   ```python
   # Exemplo em Python / Pseudo-código
   if user is None:
       redis.setex(f"user:{user_id}", 60, "NULL_VALUE") # Absorve ataques pelos próximos 60s!
   ```
3. **Validação Rigorosa de Parâmetros na Borda:** Rejeitar IDs negativos, UUIDs malformados e regex inválidos no API Gateway antes de rotear para as aplicações.

---

## Matriz Definitiva das Anomalias de Cache

| Critério Arquitetural | 💥 Cache Avalanche | 🦬 Thundering Herd (Stampede) | 🕵️ Cache Penetration |
| :--- | :--- | :--- | :--- |
| **Gatilho Principal** | **Milhares de chaves** expiram juntas ou queda total do nó de cache | **Uma única chave quente** (*Hot Key*) de alta concorrência expira | Requisições por **chaves inexistentes** que furam o cache |
| **Comportamento do Cache**| Esvaziamento em massa da memória | Cache Miss pontual em chave de 10.000 RPS | Cache Miss permanente em 100% das chamadas maliciosas |
| **Impacto no Banco de Dados**| Saturação instantânea do pool de conexões e colapso de CPU | Avalanche de queries SQL idênticas para o mesmo registro | Queries lentas de disco buscando registros que não existem |
| **Mitigação Nível 1** | **TTL Jitter** (Aleatoriedade no TTL) | **Distributed Mutex** (`SETNX`) | **Bloom Filter** na borda do Gateway |
| **Mitigação Nível 2** | Redis Cluster Multi-AZ + Cache Warming | Algoritmo **XFetch** / Stale-While-Revalidate | **Cache de Valores Nulos** (com TTL curto) |
| **Complexidade de Código**| Baixa (apenas adicionar `random()` no TTL) | Média/Alta (controle de concorrência distribuída) | Média (integração de Bloom Filter ou Null Cache) |

---

## Content Delivery Networks (CDNs) & Anycast Routing

Uma CDN aproxima assets estáticos e computação de borda (*Edge Computing*) dos usuários finais:

```text
                  ROTEAMENTO ANYCAST BGP (Mesmo Endereço IP Global: 198.51.100.1)
 ┌──────────────┐                 ┌──────────────┐                 ┌──────────────┐
 │ Usuário SP   │ ──────────────► │  PoP Brasil  │ ────► Origem?   │ Servidor     │
 └──────────────┘ (RFT = 8ms)     └──────────────┘ (Cache Hit 98%) │ de Origem    │
                                                                   │ (São Paulo)  │
 ┌──────────────┐                 ┌──────────────┐                 │              │
 │ Usuário Tóquio│ ──────────────► │  PoP Japão   │ ────► Origem?   │              │
 └──────────────┘ (RFT = 5ms)     └──────────────┘ (Cache Hit 95%) └──────────────┘
```

* **PoPs (Points of Presence):** Data centers distribuídos geograficamente contendo centenas de servidores de cache.
* **BGP Anycast:** O protocolo de roteamento da Internet direciona os pacotes do usuário automaticamente para o PoP mais próximo fisicamente em termos de saltos de rede.
* **Origin Shield:** Uma camada intermediária de cache consolidado que protege o servidor de origem contra *Cache Misses* simultâneos vindos de múltiplos PoPs ao redor do mundo.

---

## Anatomia dos Cabeçalhos HTTP de Cache (RFC 9111)

A coordenação entre navegadores, CDNs e servidores de origem é ditada por cabeçalhos padronizados:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=60
ETag: W/"33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Wed, 26 Aug 2026 18:00:00 GMT
Vary: Accept-Encoding, User-Agent
```

* `Cache-Control`:
  * `public`: Qualquer intermediário (CDN, proxy corporativo) pode armazenar em cache.
  * `private`: Armazenamento restrito ao dispositivo final do usuário (Navegador).
  * `no-cache`: Deve revalidar com o servidor de origem via `ETag` antes de servir a resposta.
  * `no-store`: Proibido armazenar em qualquer mídia não volátil (dados bancários/sigilosos).
  * `max-age=3600`: Válido por 1 hora no navegador do cliente.
  * `s-maxage=86400`: Válido por 24 horas em caches compartilhados/CDNs (*Shared Max Age*).
  * `stale-while-revalidate=60`: Serve conteúdo expirado instantaneamente enquanto busca uma nova versão em segundo plano.
* `ETag` (Entity Tag) & Validação Condicional:
  * Cliente envia requisição subsequente com `If-None-Match: W/"33a64df..."`.
  * Se o recurso não mudou, o servidor responde com **`HTTP 304 Not Modified`** com payload vazio (**0 bytes** de transferência).

---

## Arquitetura Integrada de Alta Performance em Produção

Visão arquitetural de ponta a ponta combinando todos os blocos construtivos estudados:

```text
 ┌──────────────┐
 │   CLIENTES   │
 └──────┬───────┘
        │ 1. Resolução DNS Anycast
        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ CDN / EDGE CLOUD (Cloudflare / CloudFront)                                  │
 │ • Terminação TLS na Borda • Caching de Assets Estáticos • WAF & Anti-DDoS   │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │ 2. Cache Miss / Requisições Dinâmicas
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ L4 LOAD BALANCING (AWS NLB / HAProxy TCP / Linux IPVS)                      │
 │ • Distribuição de conexões TCP de altíssima vazão (Milhões de PPS)          │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │ 3. Tráfego Balanceado
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ L7 REVERSE PROXY & API GATEWAY (Kong / Envoy / Nginx)                       │
 │ • Autenticação JWT • Rate Limiting Distribuído (Redis) • Tracing OTel       │
 └──────────────┬───────────────────────────────────────────────┬──────────────┘
                │ 4. Roteamento por Rota                        │
                ▼                                               ▼
 ┌──────────────────────────────┐                ┌─────────────────────────────┐
 │    SERVIÇO DE PEDIDOS        │                │    SERVIÇO DE CATÁLOGO      │
 │ ┌──────────────────────────┐ │                │ ┌─────────────────────────┐ │
 │ │ Node.js / Go Workers     │ │                │ │ Spring Boot / Go App    │ │
 │ └────────────┬─────────────┘ │                │ └────────────┬────────────┘ │
 └──────────────┼───────────────┘                └──────────────┼──────────────┘
                │                                               │
                ▼                                               ▼
 ┌──────────────────────────────┐                ┌─────────────────────────────┐
 │ CLUSTER REDIS (Distributed)  │                │ BANCO DE DADOS DISTRIBUÍDO  │
 │ • Sessões • Caches Quentes   │                │ • Primário (Escrita)        │
 │ • Chaves de Rate Limiting    │                │ • Read Replicas (Leitura)   │
 └──────────────────────────────┘                └─────────────────────────────┘
```

---

## Referências Bibliográficas e Leituras Recomendadas

* **KLEPPMANN, Martin.** *Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems*. O'Reilly Media, 2017.
* **XU, Alex.** *System Design Interview – An Insider's Guide (Volume 1 & 2)*. Independently Published, 2020/2022.
* **FIELDING, Roy T. et al.** *RFC 9111: HTTP Caching*. Internet Engineering Task Force (IETF), 2022.
* **BRAY, Tim.** *The Good Parts of AWS: The Real World Guide to Amazon Web Services*. 2019.
* **SRE GOOGLE TEAM.** *Site Reliability Engineering: How Google Runs Production Systems*. O'Reilly Media, 2016.

---

## Eduardo Cruz Araujo
### Fatec Ribeirão Preto • Análise e Desenvolvimento de Sistemas (ADS)
**Dúvidas, discussões e materiais:** [GitHub da Disciplina](https://github.com/edcaraujo/course-pw-fatec-20262)
