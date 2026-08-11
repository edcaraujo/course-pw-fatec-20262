---
marp: true

author: "Eduardo Cruz Araujo"
title: "Programação Web"
description: "Disciplina de Programação Web."

theme: "default"
class: "invert"

footer: "Eduardo Cruz Araujo | Fatec | 2026.2 | Programação Web | Desenvolvimento de aplicações Web: Overview (Part. 2)"

paginate: "true"

---

# Programação Web :mortar_board:
## Desenvolvimento de aplicações Web: Overview (Part. 2)

---

Desenvolvimento de aplicações Web: Overview (Part. 2)
## Considerações sobre o Desenvolvimento de Aplicações Web

---

Considerações sobre o Desenvolvimento de Aplicações Web
## Cache

---

## Estratégias de Cache (Caching Patterns)

O cache é a camada de armazenamento de alta velocidade que armazena um subconjunto de dados.

### Estratégias de Acesso
* **Cache-Aside (Lazy Loading):** A aplicação verifica o cache. Se não tiver (miss), busca no DB e atualiza o cache. *Melhor para leitura pesada.*
* **Write-Through:** Aplicação escreve no cache e no DB simultaneamente. *Garante consistência, mas escrita mais lenta.*
* **Write-Back (Write-Behind):** Escreve no cache e retorna rápido. O cache atualiza o DB assincronamente. *Alta performance de escrita, risco de perda de dados.*

---

## Estratégias de Cache (Caching Patterns)

O cache é a camada de armazenamento de alta velocidade que armazena um subconjunto de dados.

### Políticas de Evicção
* **TTL (Time to Live):** Tempo de vida do dado.
* **LRU (Least Recently Used):** Descarta o item menos usado recentemente quando o cache enche.

---

Considerações sobre o Desenvolvimento de Aplicações Web
## Geração de Conteúdo

---

## Geração de Conteúdo (Rendering Patterns)

O impacto na performance percebida e SEO.

* **SSR (Server-Side Rendering):** O HTML chega pronto.
    * *Prós:* SEO perfeito, primeira pintura (FCP) rápida. *Contras:* TTFB (Time to First Byte) maior, carga no servidor.
* **CSR (Client-Side Rendering):** Navegador baixa um HTML vazio + JS Bundle.
    * *Prós:* Interatividade rica (SPA), navegação rápida entre rotas. *Contras:* SEO complexo, carregamento inicial lento.

---

## Geração de Conteúdo (Rendering Patterns)

O impacto na performance percebida e SEO.

* **SSG (Static Site Generation):** HTML gerado no build.
    * *Prós:* Performance imbatível (CDN), seguro. *Contras:* Tempo de build longo para sites grandes.
* **ISR (Incremental Static Regeneration):** O melhor dos dois mundos. Gera páginas estáticas sob demanda ou em background, sem rebuild total.

---

Considerações sobre o Desenvolvimento de Aplicações Web
## Otimização

---

## Otimização de Performance Web

Performance é uma *feature*, não um luxo.

### Backend & Rede
* **HTTP/2 e HTTP/3 (QUIC):** Multiplexação (múltiplos requests na mesma conexão TCP), compressão de headers, e UDP para evitar *Head-of-Line Blocking*.
* **CDN (Content Delivery Network):** Cache na borda (Edge). Serve ativos estáticos a milissegundos do usuário.
* **Compression:** Brotli (melhor que Gzip) para texto.

---

## Otimização de Performance Web

Performance é uma *feature*, não um luxo.

### Frontend (Critical Rendering Path)
* **Code Splitting:** Dividir o JS em pedaços menores (chunks) carregados apenas quando necessários.
* **Tree Shaking:** Remover código morto das bibliotecas durante o build.
* **Otimização de Imagens:** Formatos modernos (AVIF, WebP), `srcset` para responsividade e `lazy-loading`.
* **Resource Hints:** `preload`, `prefetch`, `preconnect` para antecipar conexões.

---

Considerações sobre o Desenvolvimento de Aplicações Web
## Escalabilidade da Infraestrutura

---

## Escalabilidade da Infraestrutura

* **Vertical (Scale Up):** Servidor maior (Mais CPU/RAM). Limite físico rápido.
* **Horizontal (Scale Down):** Mais servidores. Teoricamente infinito.
* **Load Balancer (L4 vs L7):**
    * *Layer 4 (Transporte):* Decide baseado em IP/Porta. Muito rápido.
    * *Layer 7 (Aplicação):* Decide baseado na URL, Headers, Cookies. Mais inteligente.

---

## Escalabilidade da Infraestrutura

* **Auto Scaling:**
    * *Reativo:* Sobe máquinas quando CPU > 70%.
    * *Preditivo:* Sobe máquinas às 17h porque sabe que o tráfego aumenta às 18h (Machine Learning).

---

Considerações sobre o Desenvolvimento de Aplicações Web
## Resiliência e Tolerância a Falhas

---

## Resiliência e Tolerância a Falhas

Como o sistema se comporta quando algo quebra?

* **Circuit Breaker:** Se um serviço falha repetidamente, o "disjuntor" abre e rejeita chamadas imediatamente para evitar sobrecarga, dando tempo para o serviço se recuperar.
* **Retry com Exponential Backoff:** Tentar de novo, mas esperando cada vez mais (1s, 2s, 4s, 8s) para não derrubar o serviço de destino.

---

## Resiliência e Tolerância a Falhas

Como o sistema se comporta quando algo quebra?

* **Bulkhead:** Isolar recursos (threads/pools) para que a falha em uma funcionalidade (ex: upload de imagem) não derrube o site inteiro (ex: login).
* **Graceful Degradation:** Se o serviço de "Recomendações" cair, mostre "Mais Populares" em vez de um erro 500.

---

Considerações sobre o Desenvolvimento de Aplicações Web
## Monitoramento e Observabilidade

---

## Monitoramento e Observabilidade

Sair do "está funcionando?" para "por que está lento?".

### Os 3 Pilares
1.  **Logs:** "Ocorreu um erro na linha 42". (ELK Stack, Splunk). Detalhe do evento.
2.  **Métricas:** "Uso de CPU está em 90%". (Prometheus, Datadog). Tendências e alertas.
3.  **Tracing Distribuído:** "A requisição X passou pelo Serviço A (10ms), depois B (2000ms), depois C (5ms)". Identifica gargalos em microsserviços (Jaeger, Zipkin).

---

## Monitoramento e Observabilidade

Sair do "está funcionando?" para "por que está lento?".

### Estratégias de Alerta
* **Golden Signals (Google SRE):** Latência, Tráfego, Erros e Saturação.
* **SLA/SLO/SLI:** Definir níveis de serviço aceitáveis e monitorar o *Error Budget*.

---

Considerações sobre o Desenvolvimento de Aplicações Web
## Segurança

---

## Segurança (AppSec)

Segurança em camadas (Defense in Depth).

* **HTTPS/TLS:** Certificados SSL, HSTS para forçar conexão segura.
* **Autenticação (AuthN) vs Autorização (AuthZ):**
    * *OAuth2 / OIDC:* Padrão ouro para delegação de acesso e identidade federada.
* **Proteção de Inputs:** Sanitização contra **SQL Injection** e **XSS** (Cross-Site Scripting).
* **Rate Limiting:** Algoritmos como *Token Bucket* ou *Leaky Bucket* para evitar DDoS e brute-force.

---

## Segurança (AppSec)

Segurança em camadas (Defense in Depth).

* **WAF (Web Application Firewall):** Inspeção de pacotes para bloquear padrões de ataque conhecidos antes de chegarem à aplicação.

---

Considerações sobre o Desenvolvimento de Aplicações Web
## DevOps e Cultura de Entrega

---

## DevOps e Cultura de Entrega

Automatização e integração entre Dev e Ops.

### CI/CD (Pipeline)
1.  **Continuous Integration:** Commit -> Lint -> Unit Tests -> Build -> Integration Tests. Garante que o código novo não quebra o antigo.
2.  **Continuous Delivery:** O artefato (Docker Image) está pronto para deploy a qualquer momento.
3.  **Continuous Deployment:** O deploy vai para produção automaticamente se passar nos testes.

---

## DevOps e Cultura de Entrega

Automatização e integração entre Dev e Ops.

### Estratégias de Deploy
* **Blue/Green:** Ambiente "Blue" é a produção atual. "Green" é a nova versão. Roteador vira a chave instantaneamente. Risco baixo, custo dobrado.
* **Canary Release:** Libera a versão nova para 1%, depois 5%, depois 20% dos usuários. Se métricas de erro subirem, faz rollback automático.

---

# Obrigado :metal:

---

## Eduardo Cruz Araujo

- E-mail: [eduardo.araujo@cps.sp.gov.br](eduardo.araujo@cps.sp.gov.br)
- Linkedin: [edcaraujo](https://www.instagram.com/)
- Github: [edcaraujo](https://github.com/edcaraujo)
