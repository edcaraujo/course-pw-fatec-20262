---
marp: true

author: "Eduardo Cruz Araujo"
title: "Programação Web"
description: "Disciplina de Programação Web."

theme: "default"
class: "invert"

footer: "Eduardo Cruz Araujo | Fatec | 2026.2 | Programação Web | System Design: Arquitetura de Sistemas Distribuídos (Part. 1)"

paginate: "true"

---

# Programação Web :mortar_board:
## System Design: Arquitetura de Sistemas Distribuídos (Part. 1)

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 1)
## Fundamentos de Infraestrutura e Redes

---

## O Modelo em Camadas (OSI vs. TCP/IP)

A comunicação em sistemas distribuídos apoia-se em camadas lógicas de abstração.

* **Camada de Aplicação (HTTP/HTTPS, DNS, WebSockets, gRPC):** Interface direta com o software cliente e servidor.
* **Camada de Transporte (TCP, UDP, QUIC):** Comunicação fim-a-fim entre processos, portas e confiabilidade.
* **Camada de Rede (IP - IPv4 / IPv6):** Endereçamento lógico e roteamento global através de múltiplos saltos (Hops).
* **Camada de Enlace e Física (Ethernet, Wi-Fi, Fibra Óptica):** Transmissão de frames e pulsos físicos entre dispositivos adjacentes.

> **Encapsulamento:** Ao descer a pilha, cada camada anexa seu próprio *Header* (cabeçalho) aos dados (*Payload*). Na recepção ocorre o *Desencapsulamento*.

---

## O Conceito de MTU e MSS na Rede

O transporte de dados na Web é fragmentado em unidades finitas para evitar saturação.

* **MTU (Maximum Transmission Unit):** Maior tamanho de frame que a camada de enlace pode transmitir sem fragmentação (padrão Ethernet: **1500 bytes**).
* **MSS (Maximum Segment Size):** Carga útil máxima de dados TCP dentro de um pacote IP:
  $$\text{MSS} = \text{MTU} - (\text{IP Header (20B)} + \text{TCP Header (20B)}) = 1460\text{ bytes}$$
* **Impacto em System Design:** Requisições e payloads que ultrapassam o MSS exigem múltiplos pacotes e acknowledgment (ACK), impactando a latência e o throughput.

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 1)
## Anatomia dos Identificadores: URI vs. URL vs. URN

---

## URI, URL e URN: O Modelo Conceitual e Hierárquico

Todo recurso na Web é referenciado através de identificadores padronizados pela **RFC 3986** e **RFC 8141**.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                   URI (Uniform Resource Identifier)                         │
│   "Identificador Genérico: Identifica um recurso por nome, local ou ambos"  │
│                                                                             │
│   ┌──────────────────────────────────┐  ┌────────────────────────────────┐  │
│   │   URL (Uniform Resource Locator) │  │  URN (Uniform Resource Name)   │  │
│   │   "COMO acessar e ONDE está"     │  │  "O QUE É (Nome Persistente)" │  │
│   │   (Protocolo + Host + Caminho)   │  │  (Independente de endereço)   │  │
│   │   Ex: https://fatec.sp.gov.br    │  │  Ex: urn:isbn:978-0134494166   │  │
│   └──────────────────────────────────┘  └────────────────────────────────┘  │
│                                                                             │
│   Outras URIs (Identificadores de Esquema): mailto:..., tel:..., data:...    │
└─────────────────────────────────────────────────────────────────────────────┘
```

> **A Regra de Ouro:** Toda URL é uma URI. Toda URN é uma URI. Mas nem toda URI é uma URL ou uma URN.

---

## Anatomia Estrutural da URI (RFC 3986)

A sintaxe genérica de uma URI é composta por cinco componentes principais:

```text
URI = scheme ":" ["//" [userinfo "@"] host [":" port]] path ["?" query] ["#" fragment]
```

* **Scheme (Esquema):** Identificador do protocolo ou namespace (`https:`, `mailto:`, `urn:`, `ftp:`).
* **Authority (Autoridade):** Composto opcionalmente por `userinfo@` e obrigatoriamente por `host` e `:port`.
* **Path (Caminho):** Sequência hierárquica de segmentos que localiza o recurso no escopo do esquema.
* **Query (Consulta):** Dados não hierárquicos iniciados por `?` para parâmetros e filtros.
* **Fragment (Fragmento):** Identificador secundário iniciado por `#`, processado apenas no cliente.

### Exemplos de URIs Especiais
* E-mail: `mailto:professor@fatec.sp.gov.br`
* Telefonia: `tel:+55-16-99999-9999`
* Dados Embutidos: `data:text/plain;base64,SGVsbG8gV29ybGQ=`

---

## Anatomia Estrutural da URL (Uniform Resource Locator)

A URL identifica um recurso informando o **mecanismo de transporte e o endereço de rede** para localizá-lo:

```text
https://usuario:token@api.fatec.sp.gov.br:8443/v1/alunos/123?curso=ads&semestre=20262#grade
└─┬─┘   └─────┬─────┘ └───────┬────────┘ └─┬─┘ └──────┬─────┘ └──────────┬─────────┘ └──┬──┘
Scheme    UserInfo          Host          Port      Path            Query String       Fragment
```

* **Scheme:** Protocolo de comunicação (`http`, `https`, `wss`, `ftp`).
* **UserInfo:** Credenciais de autenticação básica (`usuario:senha@` ou `token@`).
* **Host:** Nome de domínio totalmente qualificado (FQDN) ou endereço IP (`api.fatec.sp.gov.br`).
* **Port:** Porta lógica TCP do processo servidor (`:8443` ou `:443` padrão).
* **Path:** Rota hierárquica da API ou arquivo (`/v1/alunos/123`).
* **Query String:** Parâmetros de consulta chave-valor (`?curso=ads&semestre=20262`).
* **Fragment (Hash):** Âncora de rolagem client-side (`#grade`), **nunca enviada na requisição HTTP**.

---

## Anatomia Estrutural da URN (Uniform Resource Name - RFC 8141)

A URN identifica um recurso pelo seu **nome institucional persistente**, independente de sua localização, servidor ou disponibilidade:

```text
urn:isbn:978-0-13-449416-6
└┬┘ └─┬┘ └────────┬───────┘
 │    │           └─────────── NSS (Namespace Specific String): Identificador único no escopo
 │    └─────────────────────── NID (Namespace Identifier): Nome do espaço registrado na IANA
 └──────────────────────────── Scheme fixo obrigatório ("urn")
```

```text
urn:ietf:rfc:7230
└┬┘ └─┬┘ └───┬───┘
 │    │      └──────────────── NSS: Identificador da especificação técnica ("rfc:7230")
 │    └─────────────────────── NID: Espaço de nomes da IETF (Internet Engineering Task Force)
 └──────────────────────────── Scheme fixo ("urn")
```

* **NID (Namespace Identifier):** Espaços nominais globais registrados (`isbn`, `uuid`, `ietf`, `doi`, `oasis`, `nbn`).
* **NSS (Namespace Specific String):** Código identificador exclusivo atribuído pela autoridade do namespace.
* **Persistência:** Se o site da livraria fechar ou mudar de URL, o `urn:isbn:978-0-13-449416-6` continua apontando exatamente para o mesmo livro para sempre.

---

## Matriz Comparativa: URI vs. URL vs. URN

| Critério | URI (Identifier) | URL (Locator) | URN (Name) |
| :--- | :--- | :--- | :--- |
| **Definição** | Superclasse de identificação | Localizador de acesso na rede | Nome persistente e imutável |
| **Responde a** | "Qual é a identidade?" | **"Onde está e como acessar?"** | **"Qual é o nome permanente?"** |
| **Dependência de Servidor** | Variável | **Total** (Se o servidor cai, a URL quebra) | **Nula** (Independe de hosting/IP) |
| **Sintaxe Canônica** | `scheme:[//auth]path` | `scheme://host:port/path?query#hash` | `urn:<NID>:<NSS>` |
| **Exemplos Reais** | `mailto:edc@sp.gov.br` | `https://fatec.sp.gov.br/ads` | `urn:isbn:978-0134494166` |
| **Casos em System Design** | Identificação genérica em esquemas XML/RDF | Roteamento de APIs REST e Web | UUIDs de entidades, esquemas de mensagens |

---

## Codificação de Caracteres (URL Encoding / Percent-Encoding)

Apenas um subconjunto de caracteres ASCII é seguro para tráfego em URLs.

* **Caracteres Não Reservados:** Letras (`A-Z`, `a-z`), dígitos (`0-9`) e os símbolos `-`, `_`, `.`, `~`.
* **Caracteres Reservados:** Possuem significado sintático especial no protocolo (`:`, `/`, `?`, `#`, `[`, `]`, `@`, `!`, `$`, `&`, `'`, `(`, `)`, `*`, `+`, `,`, `;`, `=`).
* **Percent-Encoding:** Caracteres especiais e espaços são convertidos no formato `%XX` (código hexadecimal ASCII).
  * Espaço $\rightarrow$ `%20` ou `+`
  * E comercial (`&`) $\rightarrow$ `%26`
  * Barra (`/`) $\rightarrow$ `%2F`

    
---

System Design: Arquitetura de Sistemas Distribuídos (Part. 1)
## A Jornada de uma Requisição ("What happens when you type a URL")

---

## A Jornada de uma Requisição: Visão Geral

O que acontece entre o pressionar do `Enter` e a renderização do primeiro pixel?

```text
[Navegador] ──(1. Cache/HSTS)──> [2. DNS Resolver] ──(3. Resolução Recursiva)──> [IP Servidor]
     │                                                                                 │
     └─────────(4. TCP 3-Way Handshake + 5. TLS 1.3 Handshake)─────────────────────────┘
     │
     ├─────────(6. HTTP Request: GET /api/v1/dashboard)───────────────────────────────>
     │                                                                        [Load Balancer / CDN]
     │                                                                                 │
     │<────────(7. HTTP Response: 200 OK + Payload)─────────────────────────── [Backend App / DB]
     │
     └─────────(8. Critical Rendering Path: DOM + CSSOM + Render Tree + Paint)
```

---

## Etapa 1: Parsing de Entrada, Cache Local e HSTS

1. **Autocompletar & Análise de Protocolo:** O navegador valida se o termo digitado é uma URL válida ou uma query de busca.
2. **HSTS Preload List (HTTP Strict Transport Security):**
   * O navegador verifica se o domínio exige conexão forçada em HTTPS antes mesmo de tocar a rede. Evita ataques de interceptação *SSL Stripping*.
3. **Verificação de Cache Local:**
   * **Memory Cache & Disk Cache do Navegador:** Se o recurso estiver válido no cache HTTP local (`Cache-Control: max-age`, `immutable`), ele é retornado instantaneamente sem tráfego de rede (0ms).
   * **Cache DNS do Navegador:** O navegador consulta sua própria tabela de resolução DNS interna (ex: `chrome://net-internals/#dns`).

---

## Etapa 2: Resolução DNS (Domain Name System)

Se o IP não estiver em cache, inicia-se a resolução hierárquica distribuída:

1. **OS DNS Cache & Arquivo `/etc/hosts`:** Consulta ao cache do sistema operacional.
2. **Recursive Resolver (ISP / 8.8.8.8 / 1.1.1.1):** Recebe a query do cliente.
3. **Root Name Servers (`.`):** Redireciona para os servidores TLD responsáveis (`.br`, `.com`).
4. **TLD Name Servers (`.br`):** Redireciona para o Authoritative Name Server do domínio.
5. **Authoritative Name Server:** Retorna o registro final (Registro **A** para IPv4 ou **AAAA** para IPv6) com seu respectivo **TTL (Time to Live)**.

> **Anycast DNS:** Provedores modernos roteiam requisições DNS para o datacenter mais próximo geograficamente via protocolo BGP.

---

## Etapa 3: Roteamento de Rede e Tráfego BGP

Com o endereço IP de destino em mãos, os pacotes IP navegam pela Internet global:

* **Sistemas Autônomos (AS - Autonomous Systems):** Redes de grande porte gerenciadas por operadoras, corporações (Google, Meta, AWS, Cloudflare) e provedores de trânsito.
* **BGP (Border Gateway Protocol):** Protocolo de roteamento dinâmico que decide o melhor caminho (menor número de AS Hops e menor latência) entre roteadores de borda.
* **PoPs de CDN / Edge Locations:** Se o serviço utiliza CDN (Cloudflare, CloudFront, Fastly), a requisição atinge a borda mais próxima do usuário, minimizando a distância física e o RTT (*Round-Trip Time*).

---

## Etapa 4: Estabelecimento de Conexão TCP (3-Way Handshake)

Para protocolos baseados em TCP (HTTP/1.1 e HTTP/2), o cliente e o servidor sincronizam seus números de sequência:

```text
CLIENTE                                          SERVIDOR
   │                                                │
   │ ──── 1. SYN (seq=X) ─────────────────────────> │ (Servidor aloca buffers)
   │                                                │
   │ <─── 2. SYN-ACK (seq=Y, ack=X+1) ───────────── │ (Confirmação do servidor)
   │                                                │
   │ ──── 3. ACK (seq=X+1, ack=Y+1) ──────────────> │ (Conexão ESTABELECIDA)
   │                                                │
```

* **Custo de Latência:** Requer **1 RTT completo** antes que qualquer dado de aplicação possa trafegar.

---

## Etapa 5: Negociação Criptográfica TLS (HTTPS)

Sobre o canal TCP aberto, ocorre o aperto de mão de segurança (**TLS Handshake**):

* **TLS 1.2:** Exigia 2 RTTs adicionais para troca de chaves e validação de certificados.
* **TLS 1.3 (Padrão Atual):** Reduz o handshake para apenas **1 RTT**:
  1. **Client Hello:** Envia versões suportadas, cifras criptográficas e sua parte do algoritmo de troca de chaves **Diffie-Hellman Ephemeral (ECDHE)**.
  2. **Server Hello:** Seleciona a cifra, envia sua chave pública, o **Certificado Digital X.509** assinado por uma Autoridade Certificadora (CA) e finaliza o segredo de sessão (*Master Secret*).
  3. **0-RTT Resumption:** Clientes que já se conectaram anteriormente podem enviar dados criptografados no primeiro pacote.

---

## Etapa 6: Processamento no Servidor & Reverse Proxy

A requisição atinge a infraestrutura do backend:

1. **Load Balancer / Reverse Proxy (NGINX, HAProxy, Envoy, Traefik):**
   * **TLS Termination:** Descriptografa o tráfego HTTPS na borda.
   * **Roteamento L7:** Encaminha com base na rota (`/api/v1/pedidos`) para a réplica ideal.
2. **Web Application Server (Node.js, Go, Java Spring, Python):**
   * Valida cabeçalhos de autenticação (JWT / Sessions).
   * Executa regras de negócio e consultas ao banco de dados / caches em memória (Redis).
3. **HTTP Response:** O servidor gera o código de status (`200 OK`, `201 Created`, `404 Not Found`), cabeçalhos de resposta (`Content-Type`, `Cache-Control`) e o corpo (*Body JSON/HTML*).

---

## Etapa 7: Critical Rendering Path no Navegador

Ao receber os primeiros bytes de HTML, o motor do navegador executa o pipeline visual:

1. **DOM (Document Object Model):** Converte tokens HTML em árvore de nós DOM.
2. **CSSOM (CSS Object Model):** Converte regras CSS em árvore hierárquica de estilos.
3. **Render Tree:** Combina DOM + CSSOM eliminando elementos ocultos (`display: none`).
4. **Layout (Reflow):** Calcula a geometria, largura, altura e coordenadas exatas de cada caixa na viewport.
5. **Paint (Repaint):** Preenche pixels na memória gráfica (cores, bordas, sombras, texto).
6. **Compositing:** Envia camadas independentes à GPU para desenho acelerado na tela.

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 1)
## Protocolos de Transporte: TCP vs. UDP

---

## TCP: Transmission Control Protocol (RFC 793)

O protocolo orientado à **confiabilidade total e garantia de entrega**.

### Características Fundamentais
* **Orientado a Conexão:** Exige o 3-Way Handshake antes da troca de dados.
* **Entrega Garantida e Ordenada:** Números de sequência garantem que pacotes perdidos sejam retransmitidos e reorganizados.
* **Controle de Fluxo (Sliding Window):** Evita que o transmissor sobrecarregue o buffer de memória do receptor.
* **Controle de Congestionamento (AIMD, CUBIC, BBR):** Ajusta dinamicamente a taxa de envio baseando-se no estado da rede.
* **Trade-off:** Maior latência inicial (Handshakes) e suscetibilidade a *Head-of-Line Blocking*.

---

## UDP: User Datagram Protocol (RFC 768)

O protocolo orientado à **velocidade máxima e mínima latência**.

### Características Fundamentais
* **Sem Conexão (Connectionless):** Envia datagramas diretamente sem handshakes prévios (0ms setup time).
* **Sem Garantia de Entrega ou Ordem:** Se um pacote cair na rede, ele é simplesmente descartado; não há retransmissão nativa.
* **Cabeçalho Ultraleve (8 bytes):** Mínimo overhead computacional comparado aos 20-60 bytes do cabeçalho TCP.
* **Sem Controle de Congestionamento:** Envia dados na velocidade requisitada pela aplicação.
* **Casos de Uso:** DNS, Streaming de áudio/vídeo em tempo real (VoIP, WebRTC), Jogos Multiplayer e a fundação do **HTTP/3 (QUIC)**.

---

## Tabela Comparativa: TCP vs. UDP

| Dimensão | TCP (Transmission Control Protocol) | UDP (User Datagram Protocol) |
| :--- | :--- | :--- |
| **Conexão** | Orientado a conexão (3-Way Handshake) | Sem conexão (Connectionless) |
| **Confiabilidade** | 100% garantida (Retransmissões e ACKs) | Não garantida (Best-effort delivery) |
| **Ordenação** | Garante entrega na ordem exata | Pacotes podem chegar fora de ordem |
| **Tamanho do Header** | 20 a 60 bytes | 8 bytes fixos |
| **Velocidade** | Menor (devido a controles e ACKs) | Máxima (latência mínima de envio) |
| **Controle de Fluxo** | Sim (Sliding Window) | Não |
| **Exemplos na Web** | HTTP/1.1, HTTP/2, REST, gRPC, SSH, SMTP | DNS, VoIP, WebRTC, Jogos, HTTP/3 (QUIC) |

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 1)
## A Evolução do Protocolo HTTP e Segurança HTTPS

---

## HTTP/1.0 vs. HTTP/1.1: Conexões Persistentes

A necessidade de otimizar o transporte de hipertexto na Web inicial.

### HTTP/1.0 (1996)
* **1 Conexão TCP por Recurso:** Cada arquivo (HTML, 10 imagens, 3 CSS) exigia um novo TCP Handshake e encerramento. Ineficiência crítica de latência e sobrecarga nos servidores.

### HTTP/1.1 (1997 - RFC 2616 / RFC 7230)
* **Keep-Alive (Conexões Persistentes):** Reutiliza a mesma conexão TCP para múltiplas requisições sequenciais.
* **Pipelining:** Tentativa de enviar requisições sem aguardar a resposta anterior (pouco adotado devido a falhas em proxies).
* **Host Header:** Permitiu hospedar múltiplos domínios virtuais no mesmo endereço IP.
* **Gargalo Principal:** **Head-of-Line (HoL) Blocking** na camada de aplicação.

---

## O Gargalo do Head-of-Line Blocking no HTTP/1.1

No HTTP/1.1, as requisições em uma mesma conexão TCP precisam ser respondidas em ordem estrita:

```text
Requisição 1: GET /api/relatorio-pesado.pdf (Demora 3.000ms) ──────────> [PROCESSANDO...]
Requisição 2: GET /css/estilo.css          (Demora 10ms)    ────[BLOQUEADA NA FILA!]
Requisição 3: GET /js/app.js               (Demora 15ms)    ────[BLOQUEADA NA FILA!]
```

### Técnicas de Contorno (Workarounds) no HTTP/1.1
* **Domain Sharding:** Distribuir arquivos entre subdomínios (`cdn1.site.com`, `cdn2.site.com`) para abrir múltiplos pools de conexões paralelas no navegador (limite de 6 conexões por domínio).
* **Sprites de Imagens & Concatenação de JS/CSS:** Agrupar dezenas de arquivos em um único arquivo gigante para economizar requisições.

---

## HTTP/2: Protocolo Binário e Multiplexação (RFC 7540)

Lançado em 2015, revolucionou a performance web baseando-se no projeto SPDY do Google.

* **Protocolo Binário:** Substituiu o texto puro por frames e streams binários, tornando o parsing computacional muito mais rápido e imune a ambiguidades.
* **Multiplexação Total:** Centenas de requisições e respostas bidirecionais trafegam simultaneamente em paralelo dentro de **uma única conexão TCP**.
* **Compressão de Cabeçalhos HPACK:** Elimina a redundância de headers HTTP repetitivos (ex: Cookies, User-Agent) através de tabelas estáticas e dinâmicas indexadas.
* **Priorização de Streams:** O navegador indica quais recursos são prioritários (CSS crítico antes de imagens do rodapé).
* **Server Push:** Capacidade do servidor enviar recursos essenciais antes do cliente requisitar.

---

## O Limite do HTTP/2: HoL Blocking no Nível de Transporte TCP

Apesar da multiplexação do HTTP/2 na camada de aplicação, o TCP subjacente não tem consciência dos múltiplos streams:

```text
Fluxo TCP Único: [Frame CSS] [Frame Imagem] [Frame JS - PACOTE PERDIDO ❌] [Frame API]
                                                           │
                                             (TCP Bloqueia TODOS os streams)
                                                           │
                                   ┌───────────────────────┴───────────────────────┐
                                   │  O TCP pausa a entrega de TODOS os frames     │
                                   │  até que o pacote do JS seja retransmitido.   │
                                   └───────────────────────────────────────────────┘
```

> Em redes instáveis (Wi-Fi oscilante ou dados móveis 3G/4G/5G com perda de pacotes), o HTTP/2 pode performar de forma inferior ao HTTP/1.1 com múltiplas conexões paralelas.

---

## HTTP/3 e o Protocolo QUIC (RFC 9000 / RFC 9114)

A reengenharia completa da camada de transporte para a Web moderna.

* **Baseado em UDP:** Substitui o TCP pelo protocolo **QUIC (Quick UDP Internet Connections)**.
* **Streams Totalmente Independentes no Transporte:** Se um pacote do stream de imagem é perdido, apenas aquela imagem é atrasada. Os streams de CSS e JS continuam fluindo sem interrupção!
* **Handshake Unificado 1-RTT / 0-RTT:** O estabelecimento do canal de transporte e a criptografia TLS 1.3 ocorrem em **um único passo de comunicação**.
* **Migração de Conexão (Connection ID):** A conexão é indexada por um identificador de 64 bits independente do IP do cliente. Trocar do Wi-Fi para o 4G/5G no smartphone **não derruba nem reinicia a conexão**.
* **Compressão QPACK:** Evolução do HPACK projetada para fluxos fora de ordem.

---

## Camadas de Segurança do HTTPS (TLS / SSL)

O HTTPS é o encapsulamento seguro do tráfego HTTP através do protocolo **TLS (Transport Layer Security)**.

### Os 3 Pilares de Segurança
1. **Confidencialidade (Privacidade):** Criptografia simétrica forte (AES-256-GCM ou ChaCha20-Poly1305). Terceiros no meio do caminho não conseguem ler os dados trafegados.
2. **Integridade:** Mecanismos de autenticação de mensagens (AEAD / HMAC). Garante que nenhum pacote foi alterado ou adulterado em trânsito (*Man-in-the-Middle*).
3. **Autenticidade (Identidade):** Certificados digitais X.509 emitidos por Autoridades Certificadoras (CAs) confiáveis validam que o servidor é realmente quem diz ser.

---

System Design: Arquitetura de Sistemas Distribuídos (Part. 1)
## Modelos de Comunicação Contínua e Tempo Real

---

## O Desafio da Comunicação Bidirecional na Web

O modelo clássico HTTP é estritamente **Request-Response** iniciado pelo cliente.

### A Necessidade de Tempo Real
* Chats e mensageria instantânea (WhatsApp Web, Slack, Discord).
* Dashboards financeiros e cotações de ações em tempo real.
* Plataformas de streaming, feeds de redes sociais e jogos multiplayer.
* Notificações push e acompanhamento de entregas (Uber, iFood).
* Streaming de tokens gerados por Modelos de Inteligência Artificial (LLMs).

---

## Técnicas: Short-Polling vs. Long-Polling

As primeiras abordagens para simular comunicação em tempo real sobre HTTP.

### Short-Polling (Consulta Periódica)
* O cliente faz requisições em intervalos fixos (ex: a cada 2 segundos).
* **Problema:** Desperdício massivo de banda de rede e processamento no servidor com milhares de respostas vazias (`304 Not Modified` ou `[]`).

### Long-Polling (Padrão Comet)
* O cliente faz uma requisição HTTP. O servidor **segura a conexão aberta** até que haja novos dados para entregar.
* Assim que o dado é entregue, a requisição fecha e o cliente **imediatamente abre uma nova requisição**.
* **Vantagens:** Reduz requisições vazias. **Desvantagens:** Overhead de cabeçalhos e reabertura contínua de conexões TCP/TLS.

---

## Server-Sent Events (SSE - EventSource API)

Comunicação contínua **Unidirecional (Servidor $\rightarrow$ Cliente)** nativa da Web.

* **Como Funciona:** O cliente abre uma conexão HTTP padrão com o cabeçalho `Accept: text/event-stream`. O servidor mantém a conexão aberta e envia mensagens em formato de texto estruturado.
* **Vantagens Nativas:**
  * Protocolo HTTP puro: Compatível nativamente com firewalls, proxies e balanceadores de carga HTTP/2 existentes.
  * Suporte nativo a **reconexão automática** no navegador e controle de último evento recebido (`Last-Event-ID`).
  * Altamente eficiente em conexões HTTP/2 multiplexadas.
* **Casos de Uso Ideais:** Feeds de notícias, monitoramento de métricas, cotações financeiras e **streaming de respostas de IA / LLMs**.

---

## WebSockets (RFC 6455)

Comunicação **Full-Duplex Bidirecional Persistente** sobre uma única conexão TCP.

* **HTTP Upgrade Handshake:** A conexão inicia como uma requisição HTTP tradicional (`Upgrade: websocket`) com status `101 Switching Protocols` e migra para um canal binário contínuo.
* **Baixíssimo Overhead:** Após o handshake inicial, os dados trafegam em frames com apenas **2 a 10 bytes de overhead** (sem cabeçalhos HTTP repetitivos).
* **Bidirecionalidade Real:** Tanto o cliente quanto o servidor podem emitir e escutar dados a qualquer momento com latência sub-milissegundo.
* **Desafios:** Exige infraestrutura de servidores com estado de conexão persistente (*Stateful*), gerenciamento de *Heartbeats/Ping-Pong* e suporte explícito de proxies.
* **Casos de Uso Ideais:** Jogos multiplayer, edição colaborativa em tempo real (Figma, Google Docs), salas de áudio/chat interativo.

---

## Matriz de Decisão: Escolhendo o Modelo Ideal

| Critério | Short-Polling | Long-Polling | Server-Sent Events (SSE) | WebSockets |
| :--- | :--- | :--- | :--- | :--- |
| **Direção dos Dados** | Unidirecional (Pull) | Unidirecional (Pull) | Unidirecional (Server $\rightarrow$ Client) | **Full-Duplex** (Bi-direcional) |
| **Protocolo** | HTTP clássico | HTTP clássico | HTTP padrão (`text/event-stream`) | Protocolo WS / WSS |
| **Overhead de Rede** | Muito Alto | Alto | Baixo | **Mínimo (2-10 bytes/frame)** |
| **Reconexão Automática** | Manual | Manual | **Nativa do Browser** | Manual / Via Libs (Socket.io) |
| **Compatibilidade Firewall** | 100% | 100% | 100% | Requer suporte a WS Upgrade |
| **Cenário Recomendado** | Scripts simples / Legado | Fallback para navegadores antigos | Dashboards, Cotações, LLM Streaming | Chats, Games, Colaboração Realtime |

---

# Obrigado :metal:

---

## Eduardo Cruz Araujo

- E-mail: [eduardo.araujo@cps.sp.gov.br](mailto:eduardo.araujo@cps.sp.gov.br)
- LinkedIn: [edcaraujo](https://www.linkedin.com/in/edcaraujo)
- GitHub: [edcaraujo](https://github.com/edcaraujo)
