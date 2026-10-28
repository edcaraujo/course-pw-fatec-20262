---
marp: true

author: "Eduardo Cruz Araujo"
title: "Programação Web"
description: "Disciplina de Programação Web."

theme: "default"
class: "invert"

footer: "Eduardo Cruz Araujo | Fatec | 2026.2 | Programação Web | System Design: Arquitetura de Sistemas Distribuídos (Part. 3)"

paginate: "true"

---

# Programação Web :mortar_board:
## System Design: Arquitetura de Sistemas Distribuídos (Part. 3)

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 3)
## Robustez e Disponibilidade: Alta Disponibilidade vs. Tolerância a Falhas

---

## Anatomia da Robustez em Sistemas Distribuídos Críticos

Em ambientes distribuídos modernos, falhas parciais não são exceções anômalas; são eventos estatisticamente inevitáveis e cotidianos (*Design for Failure*):

```text
                                  O ESPECTRO DA ROBUSTEZ SISTÊMICA
   ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
   │    CONFIABILIDADE    │      │     RESILIÊNCIA      │      │    DISPONIBILIDADE   │
   │    (Reliability)     │      │     (Resilience)     │      │    (Availability)    │
   ├──────────────────────┤      ├──────────────────────┤      ├──────────────────────┤
   │ Probabilidade de um  │      │ Capacidade do sistema│      │ Fração de tempo total│
   │ componente executar  │      │ absorver o impacto de│      │ em que o serviço está│
   │ sua função correta-  │ ───► │ falhas e se autorre- │ ───► │ operacional, acessí- │
   │ mente sem falhas por │      │ cuperar sem colapso  │      │ vel e apto a proces- │
   │ um intervalo de tempo│      │ catastrófico total.  │      │ sar requisições.     │
   └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

### A Taxonomia das Falhas em Ambientes de Produção:
* **Falhas Transitórias (Transient Faults):** Quedas momentâneas de pacotes, jitter de latência, timeouts por garbage collection (GC pause). Resolvidas via retentativas com backoff.
* **Falhas Intermitentes (Intermittent Faults):** Falhas que aparecem e desaparecem esporadicamente sob condições específicas de concorrência ou aquecimento de hardware.
* **Falhas Permanentes (Crash-Stop Faults):** Queima de placas de rede, falha de disco NVMe, kernel panic. O nó cessa operações definitivamente e requer intervenção ou failover.
* **Falhas Bizantinas (Byzantine / Arbitrary Faults):** O nó não apenas falha, mas continua emitindo dados corrompidos, conflitantes ou maliciosos para o cluster.

---

## Dicotomia Técnica: Fault Tolerance vs. High Availability

Embora frequentemente tratados como sinônimos no jargão informal, representam filosofias de engenharia e custos radicalmente distintos:

```text
       ALTA DISPONIBILIDADE (High Availability - HA)            TOLERÂNCIA A FALHAS (Fault Tolerance - FT)
   ┌─────────────┐        ┌─────────────┐                ┌─────────────┐        ┌─────────────┐
   │ Nó Primário │        │ Nó Standby  │                │   Nó A      │        │   Nó B      │
   │   (Ativo)   │        │  (Passivo)  │                │  (Lockstep) │        │  (Lockstep) │
   └──────┬──────┘        └──────▲──────┘                └──────┬──────┘        └──────▲──────┘
          │ (Batimento cardíaco) │                              │                      │
          └───────────┬──────────┘                              └───────────┬──────────┘
                      ▼                                                     ▼
           [Failover: 3s a 30s]                                  [Votação / Zero Downtime]
   "Aceita breve interrupção e degradação controlada"     "Zero interrupção, zero perda de estado em memória"
```

* **High Availability (HA - Alta Disponibilidade):**
  * **Objetivo:** Minimizar o tempo total de inatividade (*Downtime*) ao longo do ano, mirando SLAs contratuais (99.9% a 99.99%).
  * **Comportamento sob falha:** Quando o primário morre, o cluster detecta a perda de batimento cardíaco (*Heartbeat*), promove o nó secundário e redireciona o tráfego. Clientes sofrem breves reconexões ou erros 503 durante a transição (segundos).
  * **Custo & Viabilidade:** Custo linear/moderado. Padrão absoluto para aplicações web, e-commerces e SaaS.
* **Fault Tolerance (FT - Tolerância a Falhas):**
  * **Objetivo:** Continuidade operacional absoluta e determinística. **Zero downtime perceptível e zero perda de estado**.
  * **Comportamento sob falha:** Os nós operam em redundância modular síncrona (*Triple Modular Redundancy - TMR* ou CPU Lockstep). Se um componente físico falhar no meio de uma instrução, o outro já processou a mesma instrução no mesmo ciclo de clock. Nenhuma requisição é abortada.
  * **Custo & Viabilidade:** Custo astronômico (5x a 10x mais hardware, redes de altíssima fidelidade). Restrito a sistemas aeroespaciais, telecomunicações centrais, bolsas de valores de baixa latência e dispositivos médicos.

---

## Métricas Vitais de Confiabilidade: MTTF, MTTR, MTTD e MTBF

A avaliação científica da estabilidade de uma arquitetura baseia-se na decomposição temporal do ciclo de vida das falhas:

```text
  ◄────────────────────────────────── MTBF (Ciclo Completo) ──────────────────────────────────►
  ┌──────────────────────────────────────────────────────────┬────────────────────────────────┐
  │                 MTTF (Tempo Operacional)                 │    MTTR (Tempo de Reparo)      │
  │                  Mean Time To Failure                    │     Mean Time To Recovery      │
  └──────────────────────────────────────────────────────────┴────────────────────────────────┘
  ▲                                                          ▲       ▲                ▲       ▲
  │                                                          │       │                │       │
Sistema                                                    Falha   Detecção        Correção Sistema
Online                                                    Ocorre   (MTTD)          Aplicada Restaurado
```

* **MTTF (Mean Time To Failure):** Tempo médio que o sistema permanece operando de forma saudável entre o momento em que é ligado e sua próxima quebra. Aplicável a componentes não reparáveis ou ciclos úteis.
* **MTTD (Mean Time To Detect):** Tempo decorrido entre o instante exato em que a anomalia se instala e o momento em que a equipe ou o sistema de monitoramento toma ciência do incidente.
* **MTTR (Mean Time To Recovery / Repair):** Tempo médio decorrido desde o início da falha até a completa restauração do serviço operacional (detecção + diagnóstico + chaveamento/rollback).
* **MTBF (Mean Time Between Failures):** Intervalo médio entre o início de uma falha e o início da falha subsequente:
  ```text
  MTBF = MTTF + MTTR
  ```

---

## A Equação da Disponibilidade e a Obsessão pelo MTTR

A disponibilidade matemática (*A*) de qualquer sistema é expressa pela razão entre o tempo de funcionamento útil e o tempo total:

```text
                  MTTF                 MTBF - MTTR                  MTBF
A (Availability) = ────  ===>  A = ───────────────────  ≈  ──────────────────────
                  MTBF                     MTBF             MTBF + MTTR (se MTTR <<)
```

### O Dilema do Engenheiro: Maximizar MTTF ou Minimizar MTTR?
Historicamente, a engenharia clássica tentava aumentar o **MTTF** construindo softwares monolíticos à prova de falhas com validações infindáveis. Na computação em nuvem moderna, a estratégia inverteu-se:

```text
  Estratégia 1: Focar em MTTF (Tentativa de evitar falhas)
  MTTF = 1.000 horas, MTTR = 2 horas  ===>  A = 1000 / (1000 + 2) = 99.80% (Downtime: ~17h/ano)

  Estratégia 2: Focar em MTTR (Auto-healing, Pods descartáveis, CI/CD veloz)
  MTTF = 100 horas, MTTR = 10 segundos (0.00277h) ===> A = 100 / (100 + 0.00277) = 99.997% (Downtime: ~15min/ano)
```

> **Lei de Ouro da Arquitetura Distribuída:** Reduzir o **MTTR** em duas ordens de grandeza (via observabilidade preditiva, deploys canários automatizados e failover stateless) gera muito mais disponibilidade do que triplicar investimentos para aumentar o MTTF.

---

## Disponibilidade Composta: O Efeito Multiplicativo

Um sistema distribuído é uma composição de múltiplos nós e serviços. A arquitetura de interconexão define o destino do SLA global:

### 1. Componentes em Série (Cadeia de Dependência Rígida)
Se o serviço A depende estritamente do serviço B, que depende do banco C para responder ao usuário:

```text
    ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
──► │  Gateway    │ ────► │  Serviço A  │ ────► │   Banco C   │ ──►
    │ (A1 = 99.9%)│       │ (A2 = 99.9%)│       │ (A3 = 99.9%)│
    └─────────────┘       └─────────────┘       └─────────────┘
```

```text
A_global = A1 × A2 × A3 = 0.999 × 0.999 × 0.999 = 0.9970 (99.7%)
```
* **Consequência:** A disponibilidade composta em série é **sempre inferior** à do pior componente individual. Adicionar microsserviços dependentes sem isolamento corrói o SLA.

### 2. Componentes em Paralelo (Redundância e Failover)
Se dois nós redundantes atendem à mesma função atrás de um balanceador de carga:

```text
          ┌─────────────────────┐
     ┌──► │ Nó 01 (A1 = 99.0%)  │ ──┐
──► ─┤    └─────────────────────┘   ├──►  A_global = 1 - [ (1 - A1) × (1 - A2) ]
     └──► │ Nó 02 (A2 = 99.0%)  │ ──┘             = 1 - [ (0.01) × (0.01) ] = 0.9999 (99.99%)
          └─────────────────────┘
```
* **Consequência:** Nós individuais de 99% combinados em paralelo produzem uma disponibilidade de quatro noves (**99.99%**). A redundância compensa o hardware comum (*commodity hardware*).

---

## Topologias de Redundância e Estratégias de Failover

A escolha da topologia de failover equilibra a velocidade de recuperação operacional contra os custos de infraestrutura:

```text
  TOPOLOGIA                MECÂNICA OPERACIONAL                       TEMPO DE FAILOVER (RTO)  CUSTO
  ──────────────────────────────────────────────────────────────────────────────────────────────────
  Active-Passive (Cold)    Standby desligado ou sem dados.             Horas / Dezenas de min   $ (Mínimo)
                           Requer provisionamento e restore de backup.
  
  Active-Passive (Warm)    Standby ligado, sistema operacional pronto,  Minutos                  $$ (Médio)
                           dados replicados de forma assíncrona.
  
  Active-Passive (Hot)     Standby ligado, dados sincronizados em      Segundos (1s - 15s)      $$$ (Alto)
                           tempo real, pronto para chavear via VIP.
  
  Active-Active            Múltiplos nós processam tráfego em          Milissegundos (Instantâneo)$$$$ (Máximo)
                           simultâneo. Sem capacidade ociosa.
```

### O Desafio Crítico: Prevenção de Split-Brain no Chaveamento
Em arquiteturas Active-Passive Hot, se a linha de rede entre o Primário e o Secundário romper, o Secundário acreditará falsamente que o Primário morreu e se auto-promoverá a Líder. Se ambos continuarem recebendo escritas de clientes diferentes:
* **Corrupção Silenciosa de Dados:** Duas fontes de verdade divergentes geradas em paralelo.
* **Mitigação:** Requer mecanismos de **Quorum com árbitro independente (Witness/Quorum Node)**, **Fencing Tokens** e protocolos de consenso.

---

## Matriz Comparativa: HA vs. Fault Tolerance em Ambientes Reais

| Dimensão de Comparação | Alta Disponibilidade (High Availability) | Tolerância a Falhas (Fault Tolerance) |
| :--- | :--- | :--- |
| **Tempo de Downtime Máximo** | Breve interrupção tolerada (segundos/minutos para failover). | **Zero.** Continuidade ininterrupta de serviço. |
| **Perda de Transações em Andamento**| Requisições em voo podem falhar (HTTP 500/504) e exigir retry. | Nenhuma requisição é perdida; chaveamento atômico em memória. |
| **Complexidade de Engenharia** | Moderada (Health checks, Load Balancers, clusters padrão). | Extrema (Replicação determinística, sincronização de clock lockstep). |
| **Custo de Hardware & Nuvem** | Custo proporcional (Nós extras elásticos ativados sob demanda). | Custo 3x a 5x superior (Duplicação e triplicação perene de capacidade). |
| **Sensibilidade a Bugs de Software**| Resiliente a falhas físicas; suscetível a bugs de aplicação. | Se o bug corromper a lógica, ambos os nós falham em lockstep. |
| **Exemplos Tecnológicos** | AWS Multi-AZ RDS, Kubernetes ReplicaSets, Nginx HA. | Tandem NonStop, Stratus ftServer, Sistemas de Voo Espacial. |

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 3)
## Padrões Arquiteturais de Resiliência & Tratamento de Erros Sistêmicos

---

## A Falácia das Redes Confiáveis e Cascata de Falhas

Em sistemas distribuídos, assumir que a rede nunca falha é a gênese de desastres operacionais históricos. Em 1994, Peter Deutsch cunhou as clássicas **Falácias da Computação Distribuída**:

```text
 1. A rede é confiável.                       5. A topologia não muda.
 2. A latência é zero.                        6. Há apenas um administrador de rede.
 3. A largura de banda é infinita.            7. O custo de transporte é zero.
 4. A rede é totalmente segura.               8. A rede é homogênea.
```

### Anatomia da Falha em Cascata (Cascading Failure):
Quando um serviço downstream sofre degradação, a lentidão propaga-se como uma onda destrutiva para todo o ecossistema:

```text
  [1. Banco fica lento] ──► [2. Microsserviço de Pagamento retém conexões e threads]
                                                   │
  [4. COLAPSO TOTAL DA PLATAFORMA] ◄── [3. API Gateway esgota sockets e recusa clientes]
```

1. O serviço degradado responde em 10 segundos em vez de 50ms.
2. Clientes síncronos mantêm sockets TCP abertos aguardando respostas.
3. As threads do pool do chamador esgotam-se rapidamente (*Thread Pool Starvation*).
4. O chamador passa a enfileirar novas requisições até o estouro de memória (*Out of Memory - OOM*).
5. O efeito dominó derruba o API Gateway e toda a infraestrutura colapsa.

---

## Circuit Breaker (Disjuntor): Teoria e Máquina de Estados

Inspirado nos disjuntores eletromecânicos residenciais, o padrão **Circuit Breaker** (popularizado por Michael Nygard em *Release It!*) isola serviços doentes para prevenir falhas em cascata:

```text
                          ┌────────────────────────────────────────┐
                          │                                        │ Taxa de Sucesso > Limiar
                          │             CLOSED (Fechado)           │ (Restaura operação)
                          │        Requisições fluem normal        │
                          │                                        │
                          └────┬──────────────────────────────▲────┘
                               │                              │
                               │ Taxa de Erros                │
                               │ excede Threshold             │
                               │                              │
                               ▼                              │
                          ┌────────────────────────┐          │
                          │                        │          │
                          │      OPEN (Aberto)     │          │
                          │ Falha rápida instantâ- │          │
                          │ nea com Fallback local │          │
                          │                        │          │
                          └────────────┬───────────┘          │
                                       │                      │
                                       │ Tempo de Cooldown    │
                                       │ (Sleep Window) expira│
                                       │                      │
                                       ▼                      │
                          ┌────────────────────────┐          │
                          │       HALF-OPEN        │          │
                          │ Deixa passar N testes  ├──────────┘
                          │ (Se falhar 1, volta)   │
                          └────────────────────────┘
```

---

## Circuit Breaker: Dinâmica de Estados e Transições

* **Estado CLOSED (Fechado):**
  * O sistema opera normalmente. Todas as chamadas ao serviço remoto são disparadas.
  * O disjuntor mantém uma janela temporal deslizante (*Sliding Window*) registrando o volume de sucessos e falhas (erros 5xx, timeouts, conexões recusadas).
  * Se a taxa percentual de falhas ultrapassar a meta estabelecida (ex: $> 50\%$ de erros nas últimas 100 requisições), o disjuntor **dispara e transiciona para OPEN**.

* **Estado OPEN (Aberto):**
  * O serviço remoto é considerado indisponível e perigoso.
  * **Fast-Fail:** Todas as novas requisições são abortadas imediatamente no cliente/gateway, **sem abrir socket de rede**.
  * Executa a rota alternativa (*Fallback*) instantaneamente (ex: retorno de cache frio, valor default, degradação graciosa).
  * Protege o downstream combalido de receber tráfego adicional, permitindo que ele se recupere. Um temporizador de resfriamento (*Sleep Window*, ex: 30s) é iniciado.

* **Estado HALF-OPEN (Meio-Aberto):**
  * Após o término da Sleep Window, o disjuntor entra em modo de sonda/canário.
  * Permite que uma quantidade controlada de requisições de teste (ex: 5 chamadas) atravesse até o serviço remoto.
  * Se **todas** as chamadas de teste forem bem-sucedidas, o disjuntor assume que o serviço recuperou a saúde e retorna a **CLOSED**.
  * Se **uma única** chamada falhar, o disjuntor volta imediatamente para **OPEN** por mais uma rodada de cooldown.

---

## Implementação Prática: Circuit Breaker em Go / Microserviços

Implementação enxuta demonstrando a máquina de estados, proteção por Mutex e temporizador de reset:

```go
type State int
const (
    StateClosed State = iota
    StateOpen
    StateHalfOpen
)

type CircuitBreaker struct {
    mutex          sync.Mutex
    state          State
    failureCount   int
    failureThreshold int
    openTimeout    time.Duration
    lastStateChange time.Time
}

func (cb *CircuitBreaker) Execute(action func() error, fallback func() error) error {
    cb.mutex.Lock()
    now := time.Now()

    if cb.state == StateOpen {
        if now.Sub(cb.lastStateChange) > cb.openTimeout {
            cb.state = StateHalfOpen // Transiciona para teste
            cb.lastStateChange = now
        } else {
            cb.mutex.Unlock()
            return fallback() // Fast-fail imediato!
        }
    }
    cb.mutex.Unlock()

    err := action()

    cb.mutex.Lock()
    defer cb.mutex.Unlock()
    if err != nil {
        cb.failureCount++
        if cb.failureCount >= cb.failureThreshold || cb.state == StateHalfOpen {
            cb.state = StateOpen
            cb.lastStateChange = time.Now()
        }
        return fallback()
    }

    // Sucesso
    if cb.state == StateHalfOpen {
        cb.state = StateClosed
        cb.failureCount = 0
    }
    return nil
}
```

---

## Retry Patterns: Backoff Exponencial e a Vitalidade do Jitter

Retentar requisições com falha cega é uma das maiores causas de negação de serviço autoinfligida (*Self-Inflicted DDoS / Retry Storm*):

### O Perigo do Retry Imediato e do Backoff Linear
Se 1.000 clientes sofrem timeout simultâneo em um banco de dados e retentam imediatamente, o banco recebe 2.000 requisições simultâneas no milissegundo seguinte, garantindo que ele jamais consiga reiniciar:

```text
  Tentativa 0 (t = 0s)   : 1.000 clientes falham por sobrecarga.
  Retry Linear (t = 1s)  : 1.000 clientes disparam exatamente no mesmo instante! (Thundering Herd)
  Retry Linear (t = 2s)  : 1.000 clientes disparam novamente juntos! (Saturação mantida)
```

### A Fórmula do Exponential Backoff:
O tempo de espera dobra a cada nova tentativa com um teto máximo (*Cap*):

```text
t_wait = min( t_cap,  t_base × 2^(tentativa) )
```

```text
  Tentativa 1: 100ms × 2^1 = 200ms
  Tentativa 2: 100ms × 2^2 = 400ms
  Tentativa 3: 100ms × 2^3 = 800ms
  Tentativa 4: 100ms × 2^4 = 1600ms (1.6s)
```

---

## A Necessidade Matemática do Jitter no Backoff

Mesmo com Backoff Exponencial puro, se centenas de instâncias falham juntas, seus timers exponenciais continuam perfeitamente sincronizados no tempo (*Synchronized Pulsing*):

```text
  Backoff Exponencial PURO (Sem Jitter):
  Carga ▲       ████                    ████                                        ████
        │       ████                    ████                                        ████
        └───────┴───────────────────────┴───────────────────────────────────────────┴─────► Tempo
               t=200ms                 t=400ms                                     t=800ms
               (Todos os clientes disparam em rajada no mesmo exato milissegundo!)

  Backoff Exponencial com FULL JITTER:
  Carga ▲   █ █  █ █   █  █  █   █ █ █   █  █  █   █  █   █ █   █ █ █   █  █ █  █  █
        └─────────────────────────────────────────────────────────────────────────────────► Tempo
               (Carga uniformemente diluída ao longo do tempo. O servidor consegue processar!)
```

### As 3 Estratégias Clássicas de Jitter (AWS Architecture Paper):
* **Full Jitter (Recomendado na maioria dos casos):**
  ```text
  sleep = random_between(0, min(t_cap, t_base × 2^tentativa))
  ```
* **Equal Jitter (Garante um piso mínimo de espera):**
  ```text
  half = (t_base × 2^tentativa) / 2
  sleep = half + random_between(0, half)
  ```
* **Decorrelated Jitter (Baseado no tempo do retry anterior):**
  ```text
  sleep = min(t_cap, random_between(t_base, sleep_anterior × 3))
  ```

---

## Bulkhead Pattern (Isolamento por Anteparas)

Originado da arquitetura naval (anteparas estanques que impedem que o alagamento de um compartimento afunde o navio inteiro):

```text
       SEM BULKHEAD (Pool Global Compartilhado)               COM BULKHEAD (Pools Isolados por Domínio)
   ┌────────────────────────────────────────────┐       ┌──────────────────────┐ ┌──────────────────────┐
   │             Thread Pool Global             │       │    Pool Catálogo     │ │    Pool Pagamento    │
   │               (100 Threads)                │       │     (80 Threads)     │ │     (20 Threads)     │
   ├────────────────────────────────────────────┤       ├──────────────────────┤ ├──────────────────────┤
   │ [Catalog] [Catalog] [Catalog] [Catalog]    │       │ [Catalog]  [Catalog] │ │ [Pay]  [Pay]  [Pay]  │
   │ [Pay_Wait] [Pay_Wait] [Pay_Wait]           │       │ [Catalog]  [Catalog] │ │ [Pay_Wait] [Pay_Wait]│
   │ [Pay_Wait] [Pay_Wait] [Pay_Wait]           │       └──────────────────────┘ └──────────────────────┘
   │ [Pay_Wait] [Pay_Wait] [Pay_Wait]... (90!)  │                  ▲                        ▲
   └────────────────────────────────────────────┘                  │                        │
       Serviço de Pagamento trava e consome                Catálogo continua        Apenas o Pagamento
       todas as threads. O catálogo morre junto!           atendendo 100% liso!     esgota seu limite!
```

* **Mecanismos de Aplicação:**
  * **ThreadPool Isolation:** Cada cliente HTTP ou integração downstream possui um `ExecutorService` dedicado com número máximo fixo de threads e fila de espera delimitada.
  * **Semaphore Isolation:** Utiliza contadores atômicos leves (Semáforos) sem criar threads adicionais. Rejeita requisições excedentes instantaneamente com status `429` ou `503`.

---

## Graceful Degradation & Estratégias de Fallback

A arte de projetar sistemas que não quebram de forma binária (100% ligado vs 100% desligado), mas reduzem suas capacidades suavemente sob estresse extremo:

```text
  ESTRATÉGIA DE FALLBACK       DESCRIÇÃO ARQUITETURAL                              EXEMPLO REAL
  ──────────────────────────────────────────────────────────────────────────────────────────────────────────
  Cache Stale                  Serve dado expirado em memória enquanto a           Catálogo de produtos exibe
  (Stale-While-Revalidate)     origem estiver indisponível.                        preço com 5 min de atraso.
  
  Static Mock / Default        Substitui processamento complexo por valor          Sistema de recomendação
                               estático pré-computado.                             exibe lista dos "Mais Vendidos".
  
  Feature Disabling            Desativa seletivamente componentes não críticos     Streaming mantém reprodução,
                               da interface para salvar recursos da CPU.           mas oculta área de comentários.
  
  Asynchronous Offload         Converte chamada síncrona em tarefa de fila         Recebimento de pedido salva
  (Store and Forward)          persistida (RabbitMQ/SQS) respondendo HTTP 202.     em DLQ para emissão futura.
```

### O Modelo Mental "Degradar sem Desconectar":
1. **Pilar Essencial (Core Value):** O que o usuário *precisa* concluir (ex: efetuar o pagamento do pedido). Deve ter proteção máxima e prioridade de recursos.
2. **Pilar Periférico (Enrichment):** Cálculos preditivos de frete em tempo real, sugestões personalizadas, histórico de avaliações. Podem ser desativados silenciosamente sem impedir a conversão central.

---

## Distributed Timeouts & Context Deadlines

Em arquiteturas síncronas multicamadas, a ausência de propagação de tempo limite gera processos zumbis que drenam capacidade de processamento:

```text
  Fluxo Incorreto (Timeouts Estáticos Independentes):
  ┌──────────┐ 5s Timeout   ┌──────────┐ 10s Timeout  ┌──────────┐
  │ Gateway  │ ───────────► │  Serv A  │ ───────────► │  Serv B  │
  └──────────┘              └──────────┘              └──────────┘
       │                          │
  Após 5s: Gateway cancela        │ Serv A continua executando B por mais 5s
  e responde 504 ao cliente.      │ desperdiçando CPU e banco inutilmente!
```

```text
  Fluxo Correto (Context Propagation com Deadline Decrescente):
  ┌──────────┐  Deadline: 5.0s   ┌──────────┐  Deadline: 4.8s   ┌──────────┐
  │ Gateway  │ ────────────────► │  Serv A  │ ────────────────► │  Serv B  │
  └──────────┘                   └──────────┘                   └──────────┘
       │                               │                              │
  Se Gateway aborta ─────────► Cancela context A ─────────────► Aborta query B
```

* **Mecanismos de Propagação:**
  * **gRPC / HTTP/2:** Cabeçalho padrão `grpc-timeout` decrece a cada salto de rede.
  * **HTTP REST (W3C / RFC):** Cabeçalho `Request-Timeout` ou propagação de `X-Request-Deadline: 1728345600.500`.
  * **No Código (Go / Node):** Uso rigoroso de `context.WithTimeout()` ou `AbortController.timeout()` repassado a todos os drivers de banco e clientes de rede.

---

## Load Shedding & Prioritized Dropping

Quando o tráfego atinge 300% da capacidade projetada, enfileirar requisições em buffers infinitos é suicídio de memória (*Bufferbloat*). O sistema deve **descartar carga ativamente**:

```text
           Tráfego Entrante                                    Motor de Processamento
       ════════════════════════► ┌───────────────────────────┐ ════════════════════► (Capacidade: 1000 RPS)
                                 │   MOTOR DE LOAD SHEDDING  │
                                 │                           │ ──► HTTP 429 / 503 (Descarte Rápido)
                                 │ Descarta carga excedente  │     Latência de descarte: < 1ms
                                 │ baseado em CPU/P99 interno│     Preserva os 1000 RPS saudáveis!
                                 └───────────────────────────┘
```

### Rate Limiting vs. Load Shedding:
* **Rate Limiting:** Proativo e baseado na identidade do cliente (ex: "IP X excedeu 100 req/min"). Protege contra abusos pontuais.
* **Load Shedding:** Reativo e baseado na **saúde interna do servidor** (ex: "CPU atingiu 92% e latência P99 subiu de 50ms para 1.5s"). Descarta requisições mesmo de usuários bem-comportados para impedir o travamento total da JVM ou do processo Node.js.

### Classificação de Prioridade de Tráfego:
1. **Tráfego Crítico (P0):** Checkouts, transações bancárias, webhooks de parceiros financeiros.
2. **Tráfego Degradável (P1):** Buscas textuais, carregamento de feeds, navegação interna.
3. **Tráfego de Background (P2):** Rastreadores de SEO, logs de telemetria, rotinas batch assíncronas.

---

## Matriz de Resiliência: Padrões, Sintomas e Trade-offs

| Padrão Arquitetural | Sintoma Combatido | Comportamento sob Falha | Trade-off / Custo de Engenharia |
| :--- | :--- | :--- | :--- |
| **Circuit Breaker** | Falha em cascata e bloqueio de threads por downstream combalido. | Interrompe tráfego (*Fast-fail*) e dispara fallback local. | Adiciona complexidade na gestão de estado e escolha de limiares. |
| **Retry + Jitter** | Falhas transitórias de rede e erros 503 pontuais. | Retenta com intervalos crescentes e dispersão aleatória. | Pode aumentar latência P99 se mal configurado; risco de tempestade. |
| **Bulkhead** | Um subsistema lento devorando todos os recursos do processo. | Isola pools de threads e semáforos por destino. | Overhead de trocas de contexto (context switching) em múltiplos pools. |
| **Graceful Degradation** | Sobrecarga de CPU/banco impedindo a conversão do usuário. | Oculta recursos secundários ou serve cache desatualizado. | Requer planejamento de UX e código com múltiplos caminhos lógicos. |
| **Context Deadline** | Processamento inútil de requisições já canceladas na borda. | Propaga cancelamento cooperativo pela árvore de chamadas. | Exige que todo o pipeline de bibliotecas suporte cancelamento assíncrono. |
| **Load Shedding** | Colapso total por tráfego 3x acima do limite físico. | Rejeita imediatamente requisições de baixa prioridade. | Rejeição deliberada de requisições de clientes legítimos. |

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 3)
## Coordenação, Concorrência e Consenso Distribuído

---

## O Desafio da Coordenação sem Memória Compartilhada

Em um único servidor, múltiplos processos coordenam concorrência através de primitivas atômicas de CPU (`Compare-And-Swap`), mutexes de sistema operacional e ponteiros de RAM compartilhada. Em um cluster distribuído:

```text
 1. Não existe memória compartilhada. (Toda interação é via troca assíncrona de mensagens).
 2. A rede atrasa, reordena ou duplica pacotes sem aviso.
 3. Relógios físicos de nós distintos sofrem DRIFT contínuo devido a imprecisões de cristal de quartzo!
```

```text
  Servidor A (Relógio: 14:00:00.002) ────────► [Timestamp físico A: 14:00:00.002]
                                                                  ▲
                                                                  │ Conflito! Qual evento
                                                                  │ ocorreu primeiro?
                                                                  ▼
  Servidor B (Relógio: 14:00:00.000) ────────► [Timestamp físico B: 14:00:00.000]
```

### Relógios Lógicos de Lamport e Vector Clocks:
Como relógios de parede (*Wall Clocks*) não garantem ordenação segura, Leslie Lamport provou que a causalidade depende de **Relógios Lógicos**:
* Se o evento $A$ causou o evento $B$ ($A \to B$), então $L(A) < L(B)$.
* Cada nó incrementa um contador inteiro local a cada evento e anexa esse valor em cada mensagem trafegada.

---

## Mecanismo de Quorum: Teoria Matemática ($N$, $R$, $W$)

Popularizado pelo paper do **Amazon Dynamo (2007)** e adotado em sistemas leaderless (Apache Cassandra, Riak), o Quorum elimina a necessidade de um coordenador único central:

```text
                                CLUSTER DE DADOS (Fator de Replicação N = 5)
                ┌─────────────────────────────────────────────────────────────┐
                │                                                             │
                │        [Nó 1]          [Nó 2]          [Nó 3]               │
                │         (v2)            (v2)            (v2)                │
                │     ▲───────────────▲───────────────▲                       │
                │     │               │               │                       │
                │     └───────────────┼───────────────┘                       │
                │                     │                                       │
                │           Escrita: Quorum W = 3                             │
                │                                                             │
                │                             ┌───────────────┬───────────────┤
                │                             │               │               │
                │                             ▼               ▼               ▼
                │                           [Nó 3]          [Nó 4]          [Nó 5]
                │                            (v2)            (v1)            (v1)
                │                                                             │
                │                             Leitura: Quorum R = 3           │
                └─────────────────────────────────────────────────────────────┘
                                  Nó 3 é a intersecção obrigatória (Lê v2)!
```

---

## A Regra de Ouro do Quorum: $R + W > N$

Para que um sistema distribuído garanta **Consistência Estrita** (a leitura sempre retorna a versão mais recente escrita), deve satisfazer o **Princípio da Casa dos Pombos** (*Pigeonhole Principle*):

```text
                           R + W > N
```

* **$N$ (Replication Factor):** Quantidade total de nós que armazenam cópias do dado.
* **$W$ (Write Quorum):** Número mínimo de confirmações (*Acks*) necessárias para que uma operação de escrita seja declarada bem-sucedida.
* **$R$ (Read Quorum):** Número mínimo de nós consultados simultaneamente em uma operação de leitura.

### Por que a desigualdade garante consistência?
Se $R + W > N$, os conjuntos de nós acessados na escrita e na leitura contêm **necessariamente pelo menos um nó em comum**.
Esse nó de sobreposição conterá a versão mais recente gravada (identificada pelo timestamp ou vector clock mais alto).

```text
  Exemplo Clássico (N = 3, W = 2, R = 2):
  R + W = 2 + 2 = 4  ===>  4 > 3 (Consistência Estrita Garantida!)
  Se 1 nó morrer, o sistema ainda consegue ler (2 nós vivos) e escrever (2 nós vivos).
```

---

## Quorums Flexíveis e Trade-offs Operacionais

Variando os valores de $W$ e $R$, o engenheiro modula o comportamento do banco entre latência extrema e durabilidade:

```text
  CONFIGURAÇÃO               PERFIL OPERACIONAL                 VANTAGENS & RISCOS ARQUITETURAIS
  ──────────────────────────────────────────────────────────────────────────────────────────────────
  W = N,  R = 1              Otimizado para Leitura             Leitura ultrarrápida (1 nó). Porém, se UM
                             (Read-Heavy / Cache de Config)     único nó falhar, NENHUMA escrita é aceita.
  
  W = 1,  R = N              Otimizado para Escrita             Escrita instantânea (1 ack). Porém, a leitura
                             (Write-Heavy / Logging / IOT)      é lenta (consulta todos) e falha se 1 cair.
  
  W = Quorum, R = Quorum     Quorum Majoritário Balanceado      Tolera queda de minoria de nós (ex: N=5
  (W = 3, R = 3 para N=5)    (Padrão de Bancos Críticos)        tolera 2 quedas). Garante consistência forte.
  
  W + R <= N                 Consistência Eventual / Fraca      Altíssima disponibilidade e baixa latência.
  (ex: N=3, W=1, R=1)        (Eventual Consistency)             Risco real de Stale Reads (ler dado antigo).
```

### Mecanismos de Cura Automática de Réplicas:
* **Read Repair:** Durante uma leitura de quorum ($R=3$), se o Nó 1 e 2 devolverem versão `v2` e o Nó 3 devolver versão `v1`, o coordenador entrega `v2` ao cliente e envia uma escrita em background para atualizar o Nó 3.
* **Hinted Handoff:** Se um nó réplica estiver temporariamente fora do ar durante uma escrita, outro nó guarda uma "nota promissória" (*Hint*) e entrega o dado quando o nó ausente retornar.

---

## Topologia Leader / Follower e o Dilema do Failover

Na replicação baseada em líder (PostgreSQL, MySQL, Redis, MongoDB), todas as escritas são processadas por uma autoridade primária única:

```text
                                           ARQUITETURA LEADER / FOLLOWER
   ┌─────────┐                                 ┌─────────────────────────┐
   │ Cliente │ ────── Escrita (Write) ───────► │       Nó Líder (M)      │
   └─────────┘                                 └────────────┬────────────┘
        │                                                   │
        │ Consulta de Leitura (Read)         ┌──────────────┴──────────────┐
        ▼                                    ▼                             ▼
   ┌─────────┐                         ┌───────────┐                 ┌───────────┐
   │ Cliente │ ──────────────────────► │ Follower 1│                 │ Follower 2│
   └─────────┘                         └───────────┘                 └───────────┘
```

### O Trade-off da Sincronização de Log:
* **Replicação Totalmente Síncrona:** O Líder aguarda todos os seguidores confirmarem em disco antes de responder ao cliente.
  * *Vantagem:* RPO = 0 (Zero perda de dados em desastres).
  * *Desastre:* O cluster fica tão lento quanto o nó de pior latência de rede. Se uma réplica travar, o banco para de escrever.
* **Replicação Totalmente Assíncrona:** O Líder grava localmente e confirma imediatamente; réplicas puxam o log em background.
  * *Vantagem:* Escrita em sub-milissegundos.
  * *Desastre:* Janela de *Replication Lag*. Se o Líder queimar fisicamente antes da transmissão, os dados recentes são **irreversivelmente perdidos**.
* **Replicação Semi-Síncrona:** Pelo menos **uma** réplica síncrona garante durabilidade; as demais sincronizam assincronamente.

---

## A Anomalia do Split-Brain e Mitigação com Fencing Tokens

O pior pesadelo de uma arquitetura Leader/Follower ocorre quando a rede interna sofre uma partição:

```text
                                      CENÁRIO DE SPLIT-BRAIN
       PARTIÇÃO OESTE                                             PARTIÇÃO LESTE
   ┌─────────────────────┐       Corte de Conexão Física     ┌─────────────────────┐
   │   Líder Antigo      │ ◄─────────── X X X ─────────────► │   Novo Líder Eleito │
   │ (Ainda acha que manda│                                   │ (Acha que o antigo  │
   └──────────┬──────────┘                                   │  morreu!)           │
              │                                              └──────────┬──────────┘
              ▼                                                         ▼
     [Escritas de Clientes]                                    [Escritas de Clientes]
              │                                                         │
              ▼                                                         ▼
   ═════════════════════════════════════════════════════════════════════════════════════════
          DESASTRE: CORRUPÇÃO DE DADOS POR DIVERGÊNCIA DE ESCRITA SIMULTÂNEA!
```

### Blindagem Absoluta com Fencing Tokens:
O sistema de armazenamento ou banco compartilhado nunca deve confiar cegamente na palavra de um nó que se diz líder. Cada eleição gera um **Token Monotonicamente Crescente** (*Epoch / Generation Number*):

```text
  1. Cluster elege Líder A no Termo 34 (Token: 34).
  2. Ocorre partição. Cluster promove Líder B no Termo 35 (Token: 35).
  3. Armazenamento processa comando do Líder B (registra Último Token Válido = 35).
  4. Líder A antigo tenta gravar com Token 34 ===> REJEITADO! Token 34 < 35!
```

---

## Fundamentos de Consenso Distribuído: Raft e Paxos

Como um grupo de computadores autônomos chega a um acordo sobre uma sequência ordenada de ações em uma rede não confiável?

### O Paradigma da Máquina de Estados Replicada (RSM)
Se múltiplos nós iniciam no mesmo estado inicial e aplicam exatamente o mesmo log determinístico de comandos na mesma ordem, terminarão obrigatoriamente no mesmo estado final.

```text
                                   O PROTOCOLO RAFT (Visão Geral)
   ┌─────────────┐   Eleição por Voto   ┌───────────────┐  Heartbeat Periódico  ┌─────────────┐
   │  Follower   │ ───────────────────► │   Candidate   │ ────────────────────► │   Leader    │
   └─────────────┘                      └───────────────┘                       └──────┬──────┘
          ▲                                                                            │
          └───────────────────── Rebaixa se receber Term maior ────────────────────────┘
```

* **Os 3 Pilares do Algoritmo Raft (Criado por Ongaro & Ousterhout):**
  1. **Leader Election:** Se um seguidor não recebe batimento cardíaco (*Heartbeat*) dentro de um intervalo aleatório (*Randomized Election Timeout*, ex: 150ms a 300ms), ele se auto-proclama Candidato e solicita votos da maioria do cluster.
  2. **Log Replication:** O Líder recebe comandos do cliente, anexa no seu log local e transmite mensagens `AppendEntries` para todos os seguidores.
  3. **Commit Rule:** Quando a maioria estrita ($\lfloor N/2 \rfloor + 1$) confirma a gravação, o comando é marcado como *Committed* e aplicado à máquina de estados.

---

## Detecção de Falhas: Heartbeats e o Detector $\Phi$-Accrual

A abordagem ingênua de detecção de falha utiliza um timeout estático fixo (ex: "se não responder em 5 segundos, marque como morto").

### O Problema do Timeout Estático:
* **Timeout muito curto (500ms):** Picos passageiros de CPU ou pausas breves de Garbage Collection disparam falsos alarmes, causando eleições desnecessárias em cascata.
* **Timeout muito longo (30s):** O sistema demora meio minuto para reagir à morte real de um servidor primário.

### O Algoritmo $\Phi$-Accrual Failure Detector (Hayashibara et al.):
Adotado em sistemas de escala planetária como **Apache Cassandra** e **Akka Cluster**, substitui a decisão binária por uma escala contínua de suspeita estatística:

```text
                 Φ = - log10( P_later( t_now - t_last_heartbeat ) )
```

* O algoritmo armazena uma janela histórica deslizante dos intervalos entre batimentos cardíacos e calcula uma curva de distribuição normal (Gaussiana).
* $\Phi$ expressa o quão improvável é o atraso atual sob as condições normais da rede.
  * $\Phi = 1$: Probabilidade de falso positivo é de $10\%$.
  * $\Phi = 8$: Probabilidade de falso positivo é de $10^{-8}$ ($0.000001\%$).
* **Aplicação Dinâmica:** A aplicação pode agir em degraus: com $\Phi=3$, suspende envio de leituras secundárias; com $\Phi=8$, inicia o processo de failover e rebalanceamento.

---

## Gossip Protocol (Protocolo de Fofoca / Disseminação Epidêmica)

Como clusters massivos de 500 a 5.000 nós (DynamoDB, Cassandra, Consul) mantêm conhecimento da topologia sem sobrecarregar um coordenador central?

```text
   Rodada 1 (t=1):           Rodada 2 (t=2):                 Rodada 3 (t=3):
      [Nó A] (Novo dado)        [Nó A]      [Nó B]              [Nó A]      [Nó B]      [Nó C]
         │                         │           │                   │           │           │
         ├───► [Nó B]              ├──► [Nó C] ├──► [Nó D]         └──► [Nó E] └──► [Nó F] └──► ...
```

* **Mecânica Epidêmica:**
  * Periodicamente (ex: a cada 1 segundo), cada nó escolhe aleatoriamente $k$ outros nós do cluster (geralmente $k=2$ ou $3$) e troca mensagens leves em UDP contendo resumos de estado e números de versão (*Anti-entropy*).
  * Os nós contatados assimilam novidades e repassam para outros nós na rodada seguinte.

### Propriedades Matemáticas do Gossip:
* **Convergência Logarítmica:** O tempo para que 100% dos nós do cluster tomem conhecimento de uma alteração ou falha escala em **$O(\log N)$**. Em um cluster de 1.000 nós, a notícia se propaga para todos em menos de 10 rodadas.
* **Tolerância Massiva a Partições:** Como não depende de rotas fixas nem nós mestres, se 30% das máquinas caírem simultaneamente, a fofoca continua circulando entre os sobreviventes sem colapsar a rede.

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 3)
## Persistência, Particionamento e Consistência de Dados

---

## O Teorema CAP (Brewer): Formalização e a Verdade Prática

Formulado por Eric Brewer em 2000 e provado formalmente por Seth Gilbert e Nancy Lynch em 2002, o Teorema CAP estabelece os limites fundamentais de sistemas de dados distribuídos:

```text
                                        O TEOREMA CAP
                                     ┌──────────────────┐
                                     │   CONSISTÊNCIA   │
                                     │  (Linearizability│
                                     └────────┬─────────┘
                                             / \
                                            /   \
                                           /  ▲  \
                                          /   │   \
                                         /   SPOF  \
                                        /  (Mito CA)\
                                       /             \
                       ┌──────────────┴───┐       ┌───┴──────────────┐
                       │  DISPONIBILIDADE │───────│ TOLERÂNCIA A     │
                       │  (Availability)  │       │ PARTIÇÃO (P)     │
                       └──────────────────┘       └──────────────────┘
```

* **Consistency (Consistência Estrita / Linearizabilidade):** Toda leitura retorna o dado da escrita mais recente ou um erro explícito. O sistema se comporta como um registrador atômico único.
* **Availability (Disponibilidade):** Toda requisição recebida por um nó operacional não-falho deve resultar em uma resposta bem-sucedida (não-erro), sem garantias de que seja a versão mais atualizada.
* **Partition Tolerance (Tolerância a Partições):** O sistema continua processando requisições mesmo quando mensagens são perdidas ou atrasadas pela rede entre nós.

---

## Por que o Sistema "CA" Não Existe na Vida Real?

O mito mais persistente da literatura é a suposição de que o arquiteto pode escolher livremente qualquer combinação de duas letras: *CP, AP ou CA*.

```text
  No Mundo Físico Real:
  Redes quebram. Racks perdem energia. Switches queimam. Fibras ópticas são rompidas.
  Logo: A Tolerância a Partições de Rede (P) é uma propriedade INEGOCIÁVEL da física!
```

Quando uma partição de rede inevitavelmente ocorre, o engenheiro é forçado a um dilema estrito:

```text
                             OCORREU UMA PARTIÇÃO DE REDE (P)
                                             │
                     ┌───────────────────────┴───────────────────────┐
                     ▼                                               ▼
         ESCOLHA: CONSISTÊNCIA (CP)                      ESCOLHA: DISPONIBILIDADE (AP)
  Cancela ou rejeita escritas nos nós que          Permite que ambos os lados continuem
  não conseguem confirmar Quorum majoritário.      aceitando leituras e escritas normalmente.
  ► Garante que nenhum dado seja corrompido.       ► O sistema não cai para o cliente externo.
  ► Sacrifica a disponibilidade (clientes recebem  ► Sacrifica consistência (lados divergem e
    erros 503 até a partição ser curada).            geram conflitos silenciosos).
```

---

## O Teorema PACELC: A Extensão Moderna de Daniel Abadi

Em 2012, o professor Daniel Abadi observou uma lacuna crítica no Teorema CAP: **O CAP só se aplica quando a rede está com problemas (P)**. Mas redes operam normalmente 99.9% do tempo!
O que os bancos sacrificam em tempo de paz? **Latência!**

```text
                                    O TEOREMA PACELC
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
          SE HÁ PARTIÇÃO (P)?                           ELSE (E): TEMPO DE PAZ?
                    │                                             │
          ┌─────────┴─────────┐                         ┌─────────┴─────────┐
          ▼                   ▼                         ▼                   ▼
    DISPONIBILIDADE     CONSISTÊNCIA                 LATÊNCIA          CONSISTÊNCIA
          (A)                 (C)                       (L)                 (C)
```

```text
  Formulação Sintética:
  Se houver Partição (P), escolha entre Disponibilidade (A) ou Consistência (C);
  Else (E), escolha entre Latência (L) ou Consistência (C).
```

---

## Mapeamento PACELC dos Principais Motores de Banco de Dados

A classificação PACELC separa com precisão cirúrgica a vocação operacional de cada tecnologia:

```text
  CLASSIFICAÇÃO       TECNOLOGIAS DE MERCADO                COMPORTAMENTO EM PRODUÇÃO
  ──────────────────────────────────────────────────────────────────────────────────────────────────────────
  PC / EC             Google Spanner, CockroachDB,          Sob partição, prefere falhar a corromper (PC).
                      HBase, Apache ZooKeeper               Sem partição, aguarda consenso de rede (EC),
                                                            pagando maior latência em prol da consistência.
  
  PA / EL             Apache Cassandra, Amazon DynamoDB     Sob partição, nós isolados respondem normalmente (PA).
                      (modo default), CouchDB, Riak         Sem partição, grava local assíncrono e responde
                                                            imediatamente ao cliente com latência mínima (EL).
  
  PC / EL             MongoDB (com escrita local não-       Sob partição, não permite escrita se perder o primário.
                      majoritária), MySQL replicado         Sem partição, responde sem esperar sync das réplicas,
                                                            priorizando latência de escrita.
  
  PA / EC             Raro e atípico teoricamente           Tenta ser consistente em tempo de paz, mas desiste e
                                                            aceita divergência assim que a rede racha.
```

### Exemplo Arquitetural: Google Spanner vs. Cassandra
* **Google Spanner (PC/EC):** Utiliza relógios atômicos e GPS dedicados (*TrueTime API*) para garantir linearizabilidade planetária. Transações aguardam ativamente o commit de rede (*Wait-out-the-uncertainty*). Prioridade: corretude financeira absoluta.
* **Apache Cassandra (PA/EL):** Escritas respondem em $< 2ms$ gravando em *CommitLog* e *MemTable* em memória; resolve inconsistências via *Hinted Handoff* e reconciliação assíncrona. Prioridade: vazão e resiliência contínua.

---

## Estratégias de Replicação: Single-Leader vs. Multi-Leader vs. Leaderless

| Atributo Arquitetural | Single-Leader (MySQL / Postgres) | Multi-Leader (Ativo-Ativo Multi-Região) | Leaderless (Cassandra / Dynamo) |
| :--- | :--- | :--- | :--- |
| **Ponto de Escrita** | Um único nó primário central. | Múltiplos líderes (1 por região geográfica). | Qualquer nó coordenador do cluster. |
| **Tolerância a Falhas no Líder**| Requer eleição de novo líder (failover temporário de segundos). | Se a Região A falhar, Região B continua absorvendo escritas liso. | Imune a quedas de líderes; quorum lida com nós mortos. |
| **Conflitos de Escrita** | Impossíveis (líder serializa tudo). | **Inevitáveis e complexos** (requer resolução assíncrona). | Resolvidos no momento da leitura (Read Repair / Vector Clocks). |
| **Latência de Escrita Global**| Alta para clientes distantes do líder geográfico. | Baixíssima (cliente escreve no datacenter local mais próximo). | Baixa a moderada (depende da distância e do valor de $W$). |
| **Casos de Uso Ideais** | Finanças, ERPs, sistemas transacionais relacionais clássicos. | Plataformas globais colaborativas, e-commerces multinacionais. | IoT de alta ingestão, telemetria, carrinhos de compras resilientes. |

---

## Resolução de Conflitos em Escritas Concorrentes

Quando múltiplos líderes ou réplicas aceitam alterações simultâneas para o mesmo registro sem coordenação síncrona, a convergência final exige estratégias bem definidas:

### 1. Last-Write-Wins (LWW): A Roleta-Russa dos Relógios Físicos
* **Mecânica:** A escrita associada ao timestamp Unix mais recente sobrescreve todas as outras.
* **Risco Catastrófico:** Devido ao *Clock Drift* de servidores físicos, uma escrita que aconteceu de fato às 10:00:01 pode ter timestamp menor que uma escrita que ocorreu às 10:00:00. **Dados válidos de usuários são deletados silenciosamente sem deixar rastro.**

### 2. Relógios Vetoriais (Vector Clocks): Identificação Causal Estrita
* Cada réplica mantém um vetor de versões $[A: 1, B: 2]$. Se dois vetores são inconciliáveis (concorrentes), o banco não descarta nenhum dado e delega a reconciliação para a camada de aplicação (ex: juntar os dois carrinhos de compra).

### 3. CRDTs (Conflict-Free Replicated Data Types): Fusão Matemática sem Locks
* Estruturas de dados baseadas em teoria dos reticulados (*Semilattices* comutativos e associativos).
* Qualquer ordem de recebimento de atualizações converge **deterministicamente para exatamente o mesmo estado final** em todos os nós:
  * **PN-Counter:** Contadores distribuídos com contagem de incrementos e decrementos separados.
  * **LWW-Element-Set:** Coleções resilientes adotadas em editores colaborativos (Figma) e bancos como Redis Enterprise e Riak.

---

## Particionamento de Dados (Sharding): Estratégias e Hashing Consistente

Quando o volume de dados excede o teto de armazenamento de um único nó, a base deve ser fatiada em partições independentes (*Shards*):

```text
 1. Range-Based Sharding (Por Faixas)           2. Hash-Based Ingênuo: hash(id) % N
    Partição 1: Usuários A - F                     4 Nós: hash("usr_99") % 4 = Nó 3
    Partição 2: Usuários G - M                     Se adicionar Nó 5: hash("usr_99") % 5 = Nó 4
    Partição 3: Usuários N - Z                     ► 80% das chaves mudam de nó! Caos na rede!
    ► Risco Brutal: Hotspots por chave quente!
```

### Consistent Hashing (Hashing Consistente com Nós Virtuais):
Projetado por Karger et al. (MIT), mapeia chaves e servidores em um anel circular contínuo ($0$ a $2^{128}-1$):

```text
                                  O ANEL DE CONSISTENT HASHING
                                               0°
                                         [Nó A (v1)]
                                     .´               `.
                                  .´                     `.
                              .´                            `.
            [Chave K1] ────► *                                 [Nó B (v1)]
                          .´                                     `.
                        .´                                         `.
                    [Nó C (v1)]                                   [Nó A (v2)]
                         `.                                        .´
                           `.                                    .´
                             `.                                .´
                                [Nó B (v2)]             [Nó C (v2)]
                                             180°
```

* Cada nó físico assume dezenas de **Nós Virtuais (vnodes)** espalhados uniformemente pelo anel.
* **Adição/Remoção sem Caos:** Inserir um novo servidor afeta apenas seus vizinhos imediatos ($K/N$ chaves são migradas), mantendo o cluster operacional sem reindexação total.

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 3)
## Monitoramento, Observabilidade & Operações de Alta Criticidade

---

## Os Três Pilares da Observabilidade: Logs, Métricas e Traces

A transição de monólitos para sistemas distribuídos pulverizou a rastreabilidade das requisições. Monitorar apenas se a porta TCP está aberta (*Up/Down*) tornou-se obsoleto:

```text
                                  O TRIÂNGULO DA OBSERVABILIDADE
                                       ┌──────────────────┐
                                       │       LOGS       │
                                       │ (JSON Estruturado│
                                       └────────┬─────────┘
                                               / \
                                              /   \
                                             /     \
                                            /       \
                             ┌─────────────┴───┐ ┌───┴─────────────┐
                             │     MÉTRICAS    │─│     TRACES      │
                             │ (Séries Temp.)  │ │ (OpenTelemetry) │
                             └─────────────────┘ └─────────────────┘
```

* **Logs Estruturados:** Registros detalhados em JSON contendo metadados ricos (`trace_id`, `user_id`, `timestamp_nano`, `duration_ms`). Excelente para análise de causa raiz de eventos específicos.
* **Métricas Numéricas:** Séries temporais agregadas e numéricas (Prometheus, VictoriaMetrics). Custo computacional de armazenamento fixo e ultrabaixo, independente do tráfego. Ideais para disparar alertas e painéis executivos.
* **Distributed Tracing (Rastreamento Distribuído):** A reconstituição topológica da árvore de execução completa que uma requisição percorre através da malha de microsserviços.

---

## Metodologias Operacionais: Sinais Dourados, RED e USE

Engenheiros seniores não criam dashboards aleatórios com centenas de gráficos poluídos. Eles implementam frameworks padronizados:

### 1. Os 4 Sinais Dourados (Google SRE Handbook)
* **Latência:** O tempo que leva para atender a uma requisição (diferenciando latência de sucessos da latência de erros!).
* **Tráfego:** A demanda imposta ao sistema (Requisições HTTP/s, transações/s ou largura de banda consumida).
* **Erros:** A taxa de requisições que falharam (erros 5xx explícitos ou respostas com conteúdo incorreto).
* **Saturação:** O quão próximo da capacidade máxima o componente mais restrito está operando (utilização de memória, conexões de banco de dados, filas de thread).

### 2. O Método RED (Para Serviços de Aplicação e APIs)
* **Rate:** Volume de requisições por segundo.
* **Errors:** Número de requisições que retornam falha por segundo.
* **Duration:** Distribuição temporal das requisições em percentis (P50, P90, P99).

### 3. O Método USE (Para Recursos de Infraestrutura e Hardware)
* **Utilization:** Porcentagem de tempo em que o recurso físico esteve ocupado (CPU, Disco).
* **Saturation:** Fila de espera aguardando o recurso ficar disponível.
* **Errors:** Contagem de falhas de hardware ou pacotes descartados em interfaces de rede.

---

## Distributed Tracing em Detalhe: W3C TraceContext & OpenTelemetry

Como dezenas de microsserviços desacoplados colaboram para manter o contexto de uma única chamada de usuário?

```text
  [Browser / App] ──► [API Gateway] ──► [Auth Service] ──► [Order Service] ──► [PostgreSQL]
  Trace ID: a1b2c3d4   Trace ID: a1b2c3d4 Trace ID: a1b2c3d4 Trace ID: a1b2c3d4  Trace ID: a1b2c3d4
  Span ID: 0001        Span ID: 0002      Span ID: 0003      Span ID: 0004       Span ID: 0005
                       Parent: 0001       Parent: 0002       Parent: 0003        Parent: 0004
```

### A Anatomia do Padrão W3C TraceContext:
O contexto de rastreabilidade é propagado em cabeçalhos HTTP sob a especificação oficial:

```text
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
              │  └──────────────┬───────────────┘ └───────┬───────┘ └─┬┘
           Versão          Trace ID (16 bytes)      Span ID (8 bytes) Flags (01 = Sampled)
```

### Visualização Waterfall (Cascata de Spans):
```text
  Span: /api/v1/checkout  [=======================================================] (250ms)
    ├─ Span: AuthToken    [=====] (20ms)
    ├─ Span: ValidateCart       [======] (35ms)
    └─ Span: ProcessPayment            [==================================] (180ms)  <-- GARGALO IDENTIFICADO!
         └─ Span: SQL INSERT               [==============] (70ms)
```

---

## Engenharia do Caos (Chaos Engineering) & Self-Healing

Originada pela Netflix com o projeto **Chaos Monkey** após a migração para a AWS em 2010, a Engenharia do Caos substitui a esperança ingênua pela experimentação empírica:

```text
               O CICLO CIENTÍFICO DA ENGENHARIA DO CAOS
  ┌───────────────────────┐         ┌───────────────────────┐         ┌───────────────────────┐
  │ 1. Steady State       │         │ 2. Formular Hipótese  │         │ 3. Injetar Caos       │
  │ Mensura comportamento │ ──────► │ "Se a Zona B da AWS   │ ──────► │ Derruba 50% dos pods  │
  │ normal (SLI/SLO)      │         │ cair, o tráfego migra │         │ da Zona B em produção │
  │ em tempo real         │         │ sem elevar erros 5xx" │         │ sob tráfego real.     │
  └───────────────────────┘         └───────────────────────┘         └───────────┬───────────┘
                                                                                  │
                                                                                  ▼
  ┌───────────────────────┐         ┌───────────────────────┐         ┌───────────────────────┐
  │ 6. Automatizar Blindam│         │ 5. Analisar Desvios   │         │ 4. Verificar Hipótese │
  │ Transforma a melhoria │ ◄────── │ A hipótese falhou?    │ ◄────── │ O Steady State foi    │
  │ em teste contínuo de  │         │ Encontra o gargalo de │         │ mantido ou a taxa de  │
  │ regressão arquitetural│         │ configuração/timeout. │         │ erros explodiu?       │
  └───────────────────────┘         └───────────────────────┘         └───────────────────────┘
```

### Ferramental Moderno:
* **Chaos Mesh / LitmusChaos:** Injeção nativa de falhas em Kubernetes (latência de rede artificial, corrupção de pacotes, stress de memória, desligamento aleatório de nós).
* **GameDays:** Simulações com a equipe de engenharia para treinar resposta a incidentes sob pressão real.

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 3)
## Arquitetura de Referência & Síntese Integrada

---

## Arquitetura Distribuída Integrada de Alta Robustez

A união sinérgica de todos os pilares estudados em um blueprint corporativo de produção:

```text
                                        FLUXO DE PRODUÇÃO END-TO-END
  [ Clientes Globais / Web / Mobile ]
                 │
                 ▼
     ┌───────────────────────┐
     │  DNS ANYCAST COM GSLB │ ──► Roteia para o PoP mais próximo com menor latência
     └───────────┬───────────┘
                 ▼
     ┌───────────────────────┐
     │  EDGE CDN / WAF       │ ──► Terminação TLS, Caching estático, Bloqueio DDoS
     └───────────┬───────────┘
                 ▼
     ┌───────────────────────┐
     │  API GATEWAY L7       │ ──► Rate Limiting, Load Shedding, Injeção W3C TraceContext
     └───────────┬───────────┘
                 ▼
     ┌─────────────────────────────────────────────────────────────┐
     │             SERVICE MESH & MICROSSERVIÇOS                   │
     │  ┌───────────────────────┐       ┌───────────────────────┐  │
     │  │ Serviço A (Stateless) │ ────► │ Serviço B (Stateless) │  │ ──► Circuit Breaker
     │  │ • Bulkhead isolado    │       │ • Bulkhead isolado    │  │ ──► Retry c/ Full Jitter
     │  └───────────────────────┘       └───────────────────────┘  │ ──► Context Deadlines
     └──────────────────────────────┬──────────────────────────────┘
                                    │
                                    ▼
     ┌─────────────────────────────────────────────────────────────┐
     │           CAMADA DE DADOS E CONSENSO DISTRIBUÍDO            │
     │  ┌───────────────────────┐       ┌───────────────────────┐  │
     │  │ Cluster de Coordenação│       │ Banco de Dados        │  │ ──► Quorum R + W > N
     │  │ (etcd / Raft)         │       │ Replicado (Multi-AZ)  │  │ ──► Fencing Tokens
     │  └───────────────────────┘       └───────────────────────┘  │ ──► Consistent Hashing
     └─────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ Telemetria contínua
     ┌──────────────────────────────┴──────────────────────────────┐
     │           PLATAFORMA INTEGRADA DE OBSERVABILIDADE           │
     │  • OpenTelemetry Collector  • Prometheus  • Jaeger Tracing  │
     └─────────────────────────────────────────────────────────────┘
```

---

## Síntese de Decisão Arquitetural (Checklist de System Design)

Ao projetar ou avaliar a robustez de um sistema crítico em produção ou entrevistas técnicas:

1. **Defina a Fronteira de Disponibilidade:**
   * Qual é o orçamento de erro (*Error Budget*)? O sistema aceita recuperação automática em segundos (HA) ou exige hardware redundante sem perda de clock (Fault Tolerance)?
2. **Isole e Blindagem de Falhas em Cascata:**
   * Toda chamada de rede downstream possui um Circuit Breaker configurado?
   * As chamadas possuem timeouts e deadlines propagados no contexto?
   * Os retries implementam Backoff Exponencial com **Full Jitter**?
   * Recursos vitais utilizam Bulkheads para evitar esgotamento compartilhado?
3. **Equacione o Teorema CAP / PACELC no Modelo de Dados:**
   * Em caso de partição de rede, seu negócio aceita inconsistência temporária para continuar vendendo ($AP$) ou prefere rejeitar requisições para evitar corrupção ($CP$)?
   * O Quorum satisfaz a condição estrita $R + W > N$?
   * O failover de banco implementa Fencing Tokens para impedir Split-Brain?
4. **Garanta Observabilidade Operacional:**
   * O sistema exporta os 4 Sinais Dourados (Latência, Tráfego, Erros, Saturação)?
   * As requisições propagam cabeçalhos W3C `traceparent` de ponta a ponta?
   * A resiliência foi testada empiricamente com injeção de caos antes do ambiente produtivo?

---

## Referências Bibliográficas e Leituras Recomendadas

### Obras Fundamentais:
* **KLEPPMANN, Martin.** *Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems.* O'Reilly Media, 2017.
* **BEYER, Betsy; JONES, Chris; PETOFF, Jennifer; MURPHY, Niall Richard.** *Site Reliability Engineering: How Google Runs Production Systems.* O'Reilly Media, 2016.
* **NYGARD, Michael T.** *Release It! Design and Deploy Production-Ready Software.* 2ª ed. Pragmatic Bookshelf, 2018.
* **PETROV, Alex.** *Database Internals: A Deep Dive into How Distributed Data Systems Work.* O'Reilly Media, 2019.

### Papers Clássicos da Ciência da Computação:
* **DECANDIA, Giuseppe et al.** *Dynamo: Amazon's Highly Available Key-value Store.* SOSP '07, 2007.
* **ONGARO, Diego; OUSTERHOUT, John.** *In Search of an Understandable Consensus Algorithm (Raft).* USENIX ATC '14, 2014.
* **ABADI, Daniel J.** *Consistency Tradeoffs in Modern Distributed Database System Design: CAP is Only Part of the Story (PACELC).* IEEE Computer, 2012.
* **HAYASHIBARA, Naohiro et al.** *The $\phi$ Accrual Failure Detector.* SRDS '04, 2004.
* **CORBETT, James C. et al.** *Spanner: Google’s Globally-Distributed Database.* OSDI '12, 2012.

---

# Programação Web :mortar_board:
## Eduardo Cruz Araujo
### Fatec Ribeirão Preto - SP | 2026.2
### Dúvidas, Discussão Técnica & Prática nos Simuladores!
