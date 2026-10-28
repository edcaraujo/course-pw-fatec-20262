---
marp: true

author: "Eduardo Cruz Araujo"
title: "Programação Web"
description: "Disciplina de Programação Web."

theme: "default"
class: "invert"

footer: "Eduardo Cruz Araujo | Fatec | 2026.2 | Programação Web | API: Autenticação e Autorização"

paginate: "true"

---

# Programação Web :mortar_board:
## API: Autenticação e Autorização
### Mecanismos de Segurança, Autenticação Stateless (JWT), Autorização RBAC, Middlewares e Proteção de Dados Sensíveis

---

API: Autenticação e Autorização
## Agenda e Roteiro de Aprendizagem

* **01. Fundamentos de Segurança em APIs & Dicotomia AuthN vs. AuthZ:**
  * Zero Trust Architecture ("Never trust, always verify") e superfície de ataque.
  * A distinção conceitual e operacional: Autenticação (*AuthN*) vs. Autorização (*AuthZ*).
  * O panorama de ameaças em APIs modernas segundo a **OWASP API Security Top 10 (2023)**.
* **02. Dicotomia Arquitetural: Stateful Sessions vs. Stateless Tokens:**
  * Mecanismo clássico: Cookies de sessão (`Set-Cookie`) e Session Stores centralizados.
  * Paradigma Stateless: Descentralização, escalabilidade horizontal e o princípio REST.
  * O desafio da invalidação: Blacklists no Redis, Token Introspection e estratégias híbridas.
* **03. Criptografia Aplicada, Hashing de Senhas e Armazenamento Seguro:**
  * Encoding vs. Criptografia vs. Hashing: a falácia do Base64 e do MD5/SHA-256 para senhas.
  * KDFs resistentes a hardware acelerado: Salt, Pepper, `bcrypt`, `argon2id` e `PBKDF2`.
  * Vulnerabilidades de tempo: Timing Attacks e verificação em tempo constante (`constant-time`).
* **04. JSON Web Tokens (JWT - RFC 7519) em Profundidade:**
  * Anatomia Base64URL: Header, Payload e Signature.
  * Tipos de Claims: Registered (`sub`, `exp`, `iat`, `jti`), Public e Private Claims.
  * Assinatura Simétrica (HS256) vs. Assimétrica (RS256 / ES256 / JWKS na RFC 7517).
* **05. Vetores de Ataque, Vulnerabilidades Críticas e Armazenamento Seguro no Cliente:**
  * Falhas clássicas: Algoritmo `none`, Algorithm Confusion (RS256 ➔ HS256) e chaves fracas.
  * LocalStorage vs. SessionStorage vs. Cookies `HttpOnly; Secure; SameSite=Strict`.
* **06. Ciclo de Vida e Renovação: Access Token vs. Refresh Token com Rotação (RTR):**
  * TTLs assimétricos e mitigação de roubo de credenciais.
  * Refresh Token Rotation (RTR) e detecção automática de reuso com revogação em cadeia.
* **07. Modelos de Controle de Acesso: RBAC, ABAC e Prevenção de BOLA/IDOR:**
  * RBAC (Role-Based Access Control) hierárquico e matrizes de permissão granular.
  * A armadilha do BOLA/BFLA: por que checar apenas o papel (Role) não protege recursos do usuário.
* **08. Pipeline de Middlewares, Interceptadores e Respostas Padronizadas:**
  * Arquitetura em camadas (Onion Architecture / Chain of Responsibility).
  * Semântica HTTP precisa: `401 Unauthorized` vs. `403 Forbidden` com RFC 9457 (Problem Details).
* **09. Gerenciamento Seguro de Segredos e Proteção de Dados Sensíveis:**
  * Princípios das 12-Factor Apps, cofres de segredos (Vault/KMS) e proteção de PII.
* **10. Arquitetura de Referência End-to-End, Checklist de Produção e Laboratório:**
  * Blueprint corporativo unificado, checklist de auditoria e exercícios no simulador interativo.

---

API: Autenticação e Autorização
## Fundamentos de Segurança em APIs & Dicotomia AuthN vs. AuthZ

---

## O Paradigma de Segurança em APIs Modernas: Zero Trust Architecture

Historicamente, redes corporativas operavam sob o **Modelo de Segurança de Castelo e Fosso (Perimeter Security)**: assumia-se que tudo o que estava dentro da rede local era confiável, e as ameaças vinham estritamente do exterior. Na computação em nuvem e nas APIs distribuídas, essa premissa é fatal:

```text
       MODELO OBSOLETO (Castelo & Fosso)                  MODELO MODERNO (Zero Trust Architecture)
   ┌────────────────────────────────────────┐       ┌──────────────────────────────────────────────────┐
   │             FOSSO (Firewall)           │       │             ZERO TRUST: NUNCA CONFIE             │
   │  Ameaças  ┌─────────────────────────┐  │       │                                                  │
   │  Externas │  Rede Interna           │  │       │   [Cliente] ──► [WAF / Gateway] ──► [Microsserv] │
   │   ────►   │  (Confiança Implícita)  │  │       │        │               │                 │       │
   │           │  [DB]  [API]  [Auth]    │  │       │        ▼               ▼                 ▼       │
   │           │  Se invadido: Movimento │  │       │   "Autentique     "Verifique        "Valide      │
   │           │  Lateral Destrutivo!    │  │       │    sempre"         permissões"       propriedade"│
   └───────────┴─────────────────────────┴──┘       └──────────────────────────────────────────────────┘
```

### Os 3 Postulados Fundamentais do Zero Trust (NIST SP 800-207):
1. **Never Trust, Always Verify (Nunca confie, sempre verifique):** Cada requisição HTTP deve carregar provas criptográficas autônomas de identidade e autorização, independentemente de se originar da internet ou da VPC interna.
2. **Assume Breach (Assuma a brecha como certa):** Projete a API sob a hipótese de que credenciais serão vazadas e servidores serão comprometidos. Isole recursos com menor privilégio possível.
3. **Least Privilege Access (Acesso com Privilégio Mínimo):** O cliente deve receber estritamente as permissões necessárias para a tarefa imediata, com escopo e validade temporal extremamente delimitados.

---

## Dicotomia Conceitual: Autenticação (AuthN) vs. Autorização (AuthZ)

Embora foneticamente similares, representam fases lógicas, protocolos e garantias arquiteturais completamente distintas no ciclo de vida de uma requisição:

```text
                          FLUXO SEQUENCIAL DE CONTROLE DE ACESSO
   ┌─────────────┐
   │  REQUISIÇÃO │
   │   ENTRANTE  │
   └──────┬──────┘
          │
          ▼
   ┌───────────────────────────────────────┐
   │        AUTENTICAÇÃO (AuthN)           │  "Quem é você?"
   │   • Validação de Senha / Hash         │  Valida a identidade alegada através
   │   • Assinatura Digital do Token       │  de fatores de prova (conhecimento,
   │   • Verificação de Validade/Expiração │  posse ou biometria).
   └──────────────────┬────────────────────┘
                      │ Identidade Confirmada (Subject ID: usr_104)
                      ▼
   ┌───────────────────────────────────────┐
   │         AUTORIZAÇÃO (AuthZ)           │  "O que você tem permissão para fazer?"
   │   • Checagem de Papéis (Roles)        │  Verifica se a identidade comprovada possui
   │   • Avaliação de Escopos / Permissões │  o direito de executar a operação solicitada
   │   • Validação de Posse do Recurso     │  sobre o recurso alvo específico.
   └──────────────────┬────────────────────┘
                      │ Permissão Concedida
                      ▼
   ┌───────────────────────────────────────┐
   │        EXECUÇÃO DA ROTA / DADO        │  Processamento de Negócio
   └───────────────────────────────────────┘
```

* **Autenticação (Authentication - AuthN):** Estabelece a **identidade**. É binária: a credencial fornecida é legítima ou ilegítima.
* **Autorização (Authorization - AuthZ):** Estabelece o **direito de acesso**. É contextual e multidimensional: depende da ação (HTTP Method), do recurso (`/api/v1/orders/884`), de papéis atribuídos e das condições do ambiente.

---

## Matriz Comparativa: AuthN vs. AuthZ em Engenharia de Software

| Dimensão de Comparação | Autenticação (AuthN) | Autorização (AuthZ) |
| :--- | :--- | :--- |
| **Pergunta Fundamental** | *"Quem é você?" (Verificação de Identidade)* | *"O que você pode fazer?" (Controle de Acesso)* |
| **Momento de Execução** | Primeiro estágio na fronteira da API. | Segundo estágio, logo após a identidade ser resolvida. |
| **Dados Manipulados** | Credenciais, senhas, chaves privadas, certificados, MFA. | Papéis (*roles*), escopos (*scopes*), permissões (*policies*). |
| **Padrões & Protocolos** | Senhas (bcrypt/argon2), OpenID Connect (OIDC), SAML, mTLS. | RBAC, ABAC, ReBAC, OAuth2 Scopes, XACML, Casbin. |
| **Resposta sob Falha** | **`401 Unauthorized`** *(Credenciais ausentes/inválidas)* | **`403 Forbidden`** *(Identificado, mas sem permissão)* |
| **Dependência de Estado** | Pode ser stateless via tokens assinados criptograficamente. | Frequentemente consulta permissões do usuário e posse de dados. |
| **Exemplo Prático** | Validar que o usuário `edcaraujo` enviou a senha correta. | Verificar se `edcaraujo` pode deletar a conta de outro usuário. |

---

## O Panorama de Ameaças: OWASP API Security Top 10 (2023)

O consórcio **OWASP (Open Web Application Security Project)** mantém a classificação canônica das falhas de segurança mais exploradas em interfaces de programação:

```text
   RANKING    VULNERABILIDADE                            NATUREZA DO VETOR
   ──────────────────────────────────────────────────────────────────────────────────────────────────
   API1:2023  Broken Object Level Authorization (BOLA)   Autorização falha na verificação de posse do ID.
   API2:2023  Broken Authentication                      Erros de implementação em tokens e senhas.
   API3:2023  Broken Object Property Level Auth          Exposição indevida de campos sensíveis (mass assign).
   API4:2023  Unrestricted Resource Consumption          Ausência de Rate Limiting e cotas de computação.
   API5:2023  Broken Function Level Authorization (BFLA) Falta de proteção em rotas administrativas.
   API6:2023  Unrestricted Access to Sensitive Flows     Abuso automatizado de fluxos de login/recuperação.
   API7:2023  Server Side Request Forgery (SSRF)         API induzida a disparar requisições maliciosas.
   API8:2023  Security Misconfiguration                  CORS excessivo, cabeçalhos inseguros, stack traces.
   API9:2023  Improper Inventory Management              Endpoints zumbis/antigos sem patch de segurança.
   API10:2023 Unsafe Consumption of APIs                 Confiança cega em dados de parceiros terceiros.
```

> **Atenção Máxima:** **BOLA (API1)** e **Broken Authentication (API2)** respondem historicamente por mais de 65% de todos os vazamentos massivos de dados corporativos no mundo.

---

API: Autenticação e Autorização
## Dicotomia Arquitetural: Stateful Sessions vs. Stateless Tokens

---

## A Arquitetura Clássica: Sessões com Estado (Stateful)

No início do desenvolvimento Web, servidores gerenciavam o estado de autenticação através do padrão de **Sessões no Servidor (Server-Side Sessions)**:

```text
               ARQUITETURA DE SESSÃO STATEFUL COM SESSION STORE CENTRALIZADO
   ┌──────────┐                               ┌──────────────────────┐         ┌─────────────────────┐
   │          │ ─── 1. POST /login (user,pwd) ─► │ Servidor de Aplicação │ ──────► │ Session Store       │
   │          │ ◄── 2. Set-Cookie: sess_id=x9 ── │                      │         │ (Redis / Memcached) │
   │          │                               └──────────────────────┘         └──────────┬──────────┘
   │ Cliente  │                                                                           │
   │ (Browser)│                               ┌──────────────────────┐                    │
   │          │ ─── 3. GET /profile ─────────► │ Servidor Instância 2 │                    │
   │          │    Cookie: sess_id=x9         │                      │ ◄── 4. Busca dados │
   │          │                               │                      │     da sessão      │
   └──────────┘                               └──────────────────────┘     [user_id: 104] ─┘
```

### Mecânica Operacional:
1. O cliente envia login e senha. O servidor valida as credenciais contra a base de dados.
2. O servidor gera uma string randômica de alta entropia (**Session ID**, ex: `sess_9f82a1c0...`).
3. O servidor salva o mapa `{ sess_id: { user_id: 104, role: "editor", created_at: ... } }` em um banco ou cache em memória (ex: Redis).
4. O servidor devolve o `sess_id` ao cliente no cabeçalho `Set-Cookie`.
5. Em cada requisição futura, o cliente envia o cookie automaticamente. O servidor deve **obrigatoriamente fazer uma consulta de rede ou memória (I/O)** no Session Store para saber quem é o usuário.

---

## O Paradigma Stateless: Tokens Criptográficos Autossuficientes

Com a ascensão de arquiteturas distribuídas e o princípio stateless do REST (Roy Fielding), a necessidade de consultar um repositório central em cada milissegundo tornou-se um gargalo de escala:

```text
               ARQUITETURA STATELESS COM TOKENS ASSINADOS CRIPTOGRAFICAMENTE
   ┌──────────┐                               ┌──────────────────────┐
   │          │ ─── 1. POST /login (user,pwd) ─► │ Auth Service         │ ── Gera e assina o token
   │          │ ◄── 2. { "access_token": jwt } ─ │                      │    com chave secreta/privada
   │          │                               └──────────────────────┘
   │ Cliente  │
   │ (Web/App)│                               ┌──────────────────────┐
   │          │ ─── 3. GET /orders ──────────► │ Resource Server (API)│ ── Não consulta banco de sessão!
   │          │    Authorization: Bearer jwt  │                      │    Apenas valida a assinatura
   │          │                               │                      │    matemática com CPU local!
   └──────────┘                               └──────────────────────┘    (Zero I/O de rede para AuthN)
```

### Por que Arquiteturas Modernas Adotam Tokens Stateless?
* **Zero I/O para Autenticação:** A validação é uma operação puramente computacional de CPU (verificação da assinatura criptográfica e da data de expiração).
* **Escalabilidade Horizontal Infinita:** Não existe *Session Store* centralizado para a leitura de identidade. Se você tiver 100 réplicas da sua API atrás de um Load Balancer, qualquer nó pode autenticar a requisição isoladamente.
* **Desacoplamento de Domínios (Cross-Domain):** Facilita que microsserviços distintos em diferentes subdomínios ou zonas de nuvem compartilhem a mesma prova de identidade.

---

## Matriz Comparativa Técnica: Stateful vs. Stateless

| Critério Arquitetural | Sessão Stateful (Cookies + Session Store) | Token Stateless (JWT / Bearer Token) |
| :--- | :--- | :--- |
| **Localização do Estado** | Servidor (Redis, Memcached, Banco Relacional). | Cliente (enviado em cada chamada no cabeçalho). |
| **Custo de I/O por Requisição** | **Alto:** Leitura de rede obrigatória a cada chamada HTTP. | **Zero:** Verificação puramente matemática via CPU. |
| **Tamanho do Payload de Rede** | Mínimo (~32 a 64 bytes para o Session ID). | Maior (~300 bytes a 2 KB contendo claims e assinatura). |
| **Revogação Imediata** | **Instantânea:** Basta deletar a chave no Redis. | **Complexa:** O token é válido até seu `exp` expirar. |
| **Afinidade de Sessão (Sticky)** | Exige sessões compartilhadas ou sticky sessions no LB. | Totalmente desnecessária; qualquer réplica processa. |
| **Cross-Platform & Mobile** | Complexo (gerenciamento de cookies em apps nativos). | Natural (cabeçalho HTTP padrão `Authorization`). |
| **Vulnerabilidade a CSRF** | Alta se armazenado em cookie (exige tokens anti-CSRF). | Baixa se transportado em cabeçalhos explícitos `Bearer`. |
| **Vulnerabilidade a XSS** | Baixa se usar cookie `HttpOnly`. | Alta se armazenado inadvertidamente no `localStorage`. |

---

## O Calcanhar de Aquiles do Stateless: O Desafio da Revogação

Se um token JWT é assinado e autossuficiente, como revogar o acesso imediatamente caso o notebook do usuário seja roubado ou a senha seja redefinida?

```text
               O DILEMA DA VALIDADE DETERMINÍSTICA DO TOKEN STATELESS
   ┌───────────────────────┐
   │ Token emitido às 14h  │ ────── Válido até às 15h ────────────────────────────► [15h: Expira]
   └───────────────────────┘
                                         ▲
                                         │
                             Usuário redefine a senha às 14:10!
                             O token antigo CONTINUA VÁLIDO até às 15h
                             a menos que um mecanismo híbrido exista!
```

### Estratégias Reais de Mitigação:
1. **TTL Extremamente Curto (Short-Lived Access Tokens):** O token de acesso tem vida útil minúscula (ex: 5 a 15 minutos). O impacto de uma janela de exposição é mitigado temporalmente.
2. **Blacklist / Revocation List em Cache Distribuído (Redis):** Tokens revogados antes do prazo têm seu identificador único (`jti`) inserido em uma lista negra no Redis com TTL igual ao tempo restante de vida do token.
3. **Token Versioning / Password Changed Timestamp:** O usuário possui uma coluna `token_version: int` ou `password_changed_at` no banco de dados. Esse dado é conferido esporadicamente ou em rotas críticas.
4. **Token Introspection (RFC 7662):** Endpoints específicos em que o Resource Server consulta o Authorization Server para saber se o token permanece ativo.

---

API: Autenticação e Autorização
## Criptografia Aplicada, Hashing de Senhas e Armazenamento Seguro

---

## A Tríade da Criptografia: Hashing vs. Criptografia vs. Encoding

Um dos erros conceituais mais graves cometidos por desenvolvedores iniciantes é confundir técnicas de transformação de dados:

```text
                     TRANSFORMAÇÃO DE DADOS NA SEGURANÇA DA INFORMAÇÃO
   ┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
   │        ENCODING        │      │      CRIPTOGRAFIA      │      │        HASHING         │
   ├────────────────────────┤      ├────────────────────────┤      ├────────────────────────┤
   │ Objetivo:              │      │ Objetivo:              │      │ Objetivo:              │
   │ Garantir transmissão   │      │ Confidencialidade e    │      │ Integridade matemática │
   │ segura em canais ASCII │      │ proteção contra leitura│      │ e prova unidirecional  │
   │ (Ex: Base64, Hex).     │      │ (Ex: AES-GCM, RSA).    │      │ (Ex: Argon2, SHA-256). │
   ├────────────────────────┤      ├────────────────────────┤      ├────────────────────────┤
   │ REVERSÍVEL SEM CHAVE!  │      │ REVERSÍVEL COM CHAVE!  │      │ IRREVERSÍVEL POR       │
   │ Qualquer um decodifica.│      │ Exige segredo/privada. │      │ PROJETO MATEMÁTICO!    │
   └────────────────────────┘      └────────────────────────┘      └────────────────────────┘
```

* **Encoding (Base64 / URL-Encode):** **NÃO É SEGURANÇA!** É apenas representação de bytes binários em caracteres imprimíveis.
* **Criptografia (Encryption):** Algoritmo bidirecional. O dado cifrado (*ciphertext*) pode ser decifrado de volta ao texto plano (*plaintext*) mediante a posse de uma chave criptográfica.
* **Hashing Criptográfico:** Função unidirecional matemática $H(m) = h$. Dado o hash $h$, deve ser computacionalmente inviável deduzir a mensagem original $m$ (*Resistência à Pré-Imagem*).

---

## Por que Funções Rápidas de Hash são Fatais para Senhas

Funções criptográficas de integridade como **MD5, SHA-1, SHA-256 e SHA-512** foram criadas para checar integridade de arquivos em gigabytes por segundo. **Isso as torna péssimas para proteger senhas!**

```text
                    VELOCIDADE DE PROCESSAMENTO EM GPUS MODERNAS (NVIDIA RTX 4090)
   Algoritmo: SHA-256  ──► ~ 20.000.000.000 (20 Bilhões) de hashes testados por segundo!
   Algoritmo: Argon2id ──► ~ 10 a 20 hashes testados por segundo (Memória intensiva)!
```

### Vetores de Ataque contra Hashes Fracos:
1. **Rainbow Tables (Tabelas Arco-Íris):** Dicionários gigantescos pré-computados contendo bilhões de senhas comuns associadas aos seus hashes diretos.
2. **GPU & ASIC Brute-Force:** Ataques distribuídos que testam todas as permutações alfanuméricas em minutos utilizando paralelismo massivo de núcleos de placas de vídeo.

```text
  ATAQUE POR RAINBOW TABLE (SEM SALT):
  Senha: "admin" ──► Hash SHA-256: 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
                                   ▲
  O atacante busca o valor direto na tabela pré-calculada e descobre "admin" em 0.1ms!
```

---

## Anatomia do Hashing Moderno: Salt, Pepper e Funções KDF

Para neutralizar Rainbow Tables e ataques acelerados por GPU, a engenharia de segurança introduziu **Key Derivation Functions (KDFs)** com parâmetros de custo computacional:

```text
                     FLUXO DE PROTEÇÃO COM SALT E PEPPER
   Senha do Usuário: "Sup3rS3cr3t!"
             │
             ├───► + Salt Único Aleatório: "$2b$12$e8Yx9p..." (Garante hashes distintos para senhas iguais)
             │
             ├───► + Pepper Secreto: (Chave mestra guardada no HSM / Secrets Manager fora do DB)
             │
             ▼
   ┌──────────────────────────────────────────────────────────────┐
   │ FUNÇÃO KDF LENTA (Argon2id / bcrypt / scrypt)                 │
   │ • Custo de Tempo (Iterações / Work Factor)                   │
   │ • Custo de Memória (Memory-Hardness: esgota VRAM da GPU)     │
   │ • Paralelismo (Threads de CPU)                               │
   └──────────────────────────────┬───────────────────────────────┘
                                  ▼
   Hash Seguro Armazenado: "$argon2id$v=19$m=65536,t=3,p=4$..."
```

* **Salt (Sal Criptográfico):** String aleatória de alta entropia gerada exclusivamente para cada usuário e armazenada publicamente junto ao hash. Invalida completamente Rainbow Tables globais.
* **Pepper (Pimenta):** Segredo adicional mantido no servidor de aplicação ou cofre de chaves. Se o banco de dados for vazado via SQL Injection, os hashes permanecem blindados sem o Pepper.

---

## Comparativo Técnico de KDFs Modernos

| Algoritmo | Categoria | Resistência a GPU/ASIC | Recomendação Oficial Atual |
| :--- | :--- | :--- | :--- |
| **Argon2id** | Memory-Hard KDF | **Máxima.** Vencedor da *Password Hashing Competition (PHC)*. Resistente a side-channels e GPUs. | **Padrão Ouro absoluto** (OWASP & RFC 9106). |
| **bcrypt** | Blowfish-based KDF | **Alta.** Custo de CPU ajustável via Work Factor exponencial ($2^{cost}$). | **Padrão de Mercado maduro**, amplamente suportado. |
| **scrypt** | Memory-Hard KDF | **Muito Alta.** Exige grandes quantidades de memória RAM por cálculo. | Excelente, predecessor histórico do Argon2. |
| **PBKDF2** | Iterative HMAC | **Média.** Não consome memória significativa; suscetível a aceleração por FPGA/ASICs. | Aceito por conformidade governamental legada (FIPS). |
| **MD5 / SHA-1** | Hash de Integridade | **Nula.** Quebrados criptograficamente. | **TOTALMENTE PROIBIDOS** para credenciais. |

---

## Implementação de Produção: Hashing Seguro com Python / Passlib

Exemplo de implementação defensiva com `argon2-cffi` e `bcrypt`, com mitigação nativa contra **Timing Attacks**:

```python
from passlib.context import CryptContext
import hmac

# Configuração robusta com Argon2id como esquema preferencial e bcrypt para retrocompatibilidade
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    argon2__memory_cost=65536,  # 64 MB de RAM por hash
    argon2__time_cost=3,        # 3 iterações
    argon2__parallelism=4,      # 4 threads
    bcrypt__rounds=12,          # 2^12 = 4096 rounds
    deprecated="auto"
)

def hash_password(password: str) -> str:
    """Gera hash salgado com work factor elevado."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Valida a senha em tempo constante, prevenindo side-channel timing attacks."""
    return pwd_context.verify(plain_password, hashed_password)

def is_hash_upgrade_needed(hashed_password: str) -> bool:
    """Detecta se o hash foi criado com parâmetros antigos e precisa de upgrade suave no login."""
    return pwd_context.needs_update(hashed_password)
```

---

## Vulnerabilidade Oculta: Timing Attacks na Verificação

Um erro clássico em segurança é utilizar operadores de comparação de string padrão (`if token == stored_token:` ou `if a == b:`) para validar segredos ou assinaturas:

```text
               TIMING ATTACK (COMPARAÇÃO NORMAL POR CARACTERE)
   Comparando: "secret_abc" com "secret_xyz"
   Posição:    0 1 2 3 4 5 6 7
   Bytes:     's' == 's' (Ok! Continua...)
              'e' == 'e' (Ok! Continua...)
              'c' == 'c' (Ok! Continua...)
              'r' == 'r' (Ok! Continua...)
              'e' == 'e' (Ok! Continua...)
              't' == 't' (Ok! Continua...)
              '_' == '_' (Ok! Continua...)
              'a' != 'x' ──► FALHA IMEDIATA! Aborta comparação e responde em 1.2 milissegundos.
```

* **O Ataque de Temporização:** O atacante envia milhões de requisições medindo a latência com precisão de nanossegundos. Ao identificar que uma string demorou 50 nanossegundos a mais para falhar, ele sabe que acertou o primeiro byte, deduzindo a chave byte a byte!
* **A Mitigação Obrigatória:** Uso estrito de **Constant-Time Comparison** (`hmac.compare_digest` em Python ou `crypto.timingSafeEqual` em Node.js), que sempre inspeciona todos os bytes independentemente de onde a discrepância ocorreu.

---

API: Autenticação e Autorização
## JSON Web Tokens (JWT - RFC 7519) em Profundidade

---

## Anatomia Estrutural do JWT: O Formato Compacto

Um **JSON Web Token (JWT)** é um padrão aberto (RFC 7519) que define uma forma compacta e autossuficiente para transmitir informações com segurança entre partes como um objeto JSON.

O token é composto por três partes separadas por pontos (`.`):

```text
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMTA0Iiwicm9sZSI6ImFkbWluIn0.dbL9bO...
  └──────────────────┬────────────────┘ └──────────────────────┬──────────────────────┘ └─────┬──────┘
                     │                                         │                              │
                 1. HEADER                                 2. PAYLOAD                    3. SIGNATURE
         (Algoritmo e tipo de token)                (Claims e metadados)             (Garantia criptográfica)
```

```text
   HEADER (JSON)                   PAYLOAD (JSON)                     ASSINATURA (BINÁRIA ➔ BASE64URL)
   {                               {                                  HMACSHA256(
     "alg": "HS256",                 "sub": "usr_104",                  base64UrlEncode(header) + "." +
     "typ": "JWT"                    "name": "Eduardo Cruz",            base64UrlEncode(payload),
   }                                 "role": "admin",                   secret_key
                                     "exp": 1728954000                )
                                   }
```

> **Axioma Crítico:** O JWT é **codificado em Base64URL**, e não encriptado! Qualquer usuário com acesso ao token pode ler seu conteúdo completo colando-o em ferramentas públicas como [jwt.io](https://jwt.io).

---

## Aprofundamento no Payload: A Semântica das Claims

Na RFC 7519, cada par chave/valor do payload de um JWT é denominado **Claim** (uma declaração sobre uma entidade e metadados associados). Dividem-se em três categorias:

### 1. Registered Claims (Padronizadas na RFC):
* **`sub` (Subject):** O identificador único da entidade dona do token (ex: UUID ou ID do usuário no banco).
* **`iss` (Issuer):** A autoridade de identidade que emitiu o token (ex: `https://auth.fatec.sp.gov.br`).
* **`aud` (Audience):** Os destinatários a que o token se destina (ex: `https://api.fatec.sp.gov.br`).
* **`exp` (Expiration Time):** Timestamp Unix da expiração exata do token. **Obrigatório em produção!**
* **`nbf` (Not Before):** Timestamp Unix indicando que o token não deve ser aceito antes desse instante.
* **`iat` (Issued At):** Timestamp Unix indicando o momento exato em que o token foi gerado.
* **`jti` (JWT ID):** Identificador randômico único do token. Essencial para prevenção de replay e blacklists.

### 2. Public & Private Claims (Customizadas):
* **Public Claims:** Nomes registrados na IANA ou colidíveis (ex: `"email"`, `"profile"`).
* **Private Claims:** Chaves específicas de negócio combinadas entre cliente e servidor (ex: `"role": "admin"`, `"tenant_id": "org_44"`, `"permissions": ["posts:write", "users:read"]`).

---

## A Assinatura Digital: HS256 (Simétrico) vs. RS256 (Assimétrico)

A integridade do token depende do algoritmo especificado no header. A escolha define a topologia de chaves:

```text
                 ASSINATURA SIMÉTRICA (HMAC-SHA256 - HS256)
     [ Auth Service ] ──(Emite com SECRET_KEY)──► [ Token JWT ] ──► [ Resource Server ]
                                                                   (Valida com a MESMA
                                                                    SECRET_KEY compartilhada!)
     * RISCO: Se qualquer microsserviço que valida o token vazar a chave, ele pode FORJAR
       tokens arbitrários com privilégios de SuperAdmin para todo o ecossistema!
```

```text
                 ASSINATURA ASSIMÉTRICA (RSA / ECDSA - RS256 / ES256)
     [ Auth Service ] ──(Emite com CHAVE PRIVADA)──► [ Token JWT ] ──► [ Resource Server ]
                                                                       (Valida com a CHAVE
                                                                        PÚBLICA distribuída!)
     * SEGURANÇA: Somente a Autoridade de Identidade possui a Chave Privada. Todos os outros
       serviços possuem apenas a Chave Pública (via JWKS RFC 7517). Ninguém pode forjar tokens!
```

---

## Comparativo Criptográfico: HS256 vs. RS256 vs. EdDSA (Ed25519)

| Propriedade Técnica | HS256 (HMAC-SHA256) | RS256 (RSA-SHA256) | EdDSA (Ed25519) |
| :--- | :--- | :--- | :--- |
| **Tipo de Criptografia** | Simétrica (Chave secreta única). | Assimétrica (Par Chave Pública/Privada). | Assimétrica de Curva Elíptica (Ed25519). |
| **Distribuição de Chaves** | Compartilhada com todos os validadores. | Pública distribuída; Privada ultra-segregada. | Pública distribuída; Privada ultra-segregada. |
| **Risco de Vazamento** | Catastrófico: um validador vaza tudo. | Seguro: vazar chave pública não permite emitir. | Seguro: chave pública pode ser livremente exposta. |
| **Velocidade de Assinatura**| **Ultrarrápida** (poucos microssegundos). | Moderada (operações exponenciais pesadas). | **Extremamente rápida** com alta entropia. |
| **Tamanho da Assinatura** | 32 bytes (Muito compacto). | 256 a 512 bytes (Token mais pesado). | 64 bytes (Compacto e elegante). |
| **Cenário de Aplicação** | Monólitos ou microsserviços pequenos. | Grandes arquiteturas corporativas, OAuth2/OIDC. | APIs modernas de altíssimo throughput. |

---

## O Ciclo Completo de Validação de um JWT pelo Servidor

Quando uma API recebe uma requisição com cabeçalho `Authorization: Bearer <token>`, o pipeline deve executar os seguintes passos matemáticos e lógicos sem atalhos:

```text
                             PIPELINE RÍGIDO DE VALIDAÇÃO DE JWT
   1. Extrair Token do Cabeçalho: Verificar prefixo "Bearer "
      │
   2. Decodificar Base64URL do Header e Payload
      │
   3. Inspecionar o Algoritmo Declarado: REJEITAR se for "none" ou divergente da lista branca
      │
   4. Recalcular a Assinatura Criptográfica:
      Assinatura_Calculada = CryptoFunc(Header.Payload, Chave)
      │
   5. Comparar Assinatura em Tempo Constante (Constant-Time Match) ──► Se diferente: HTTP 401
      │
   6. Validar Registered Claims Temporais:
      • Se agora > exp ──► HTTP 401 ("Token expired")
      • Se agora < nbf ──► HTTP 401 ("Token not yet valid")
      │
   7. Conferir Blacklist / Revogação: Checar se o `jti` está no cache de banidos ──► Se sim: HTTP 401
      │
   8. Injetar Identidade no Contexto da Requisição (`request.state.user = payload`)
```

---

API: Autenticação e Autorização
## Vetores de Ataque, Vulnerabilidades Críticas e Armazenamento Seguro

---

## A Vulnerabilidade do Algoritmo "none" (CVE-2015-9235)

Uma das falhas mais infames da história da segurança Web ocorreu quando bibliotecas ingênuas confiaram cegamente no campo `"alg"` contido no Header enviado pelo próprio cliente:

```text
                 O VETOR DE EXPLORAÇÃO DO ATAQUE "alg: none"
   Header Fraudulento:    Payload Manipulado:                 Assinatura Omitida:
   {                      {                                   ""
     "alg": "none",         "sub": "usr_hacker",              (Vazia!)
     "typ": "JWT"           "role": "superadmin"
   }                      }
                          Token resultante: "eyJhbGciOiJub25lIn0.eyJzdWIiOiJoYWNrZXIifQ."
```

* **A Falha:** A RFC 7519 permite a especificação `"none"` para cenários onde a integridade já foi garantida por TLS ou túneis privados.
* **A Tragédia:** Bibliotecas antigas verificavam: `if token.alg == "none": return True`. O invasor simplesmente alterava seu papel para `superadmin`, apagava a assinatura e o servidor aceitava a identidade forjada!
* **A Defesa:** O servidor **deve definir a lista branca de algoritmos permitidos de forma imutável** no código (`algorithms=["HS256"]`). Se o token alegar `"none"`, deve ser sumariamente descartado.

---

## Algorithm Confusion Attack (Confusão de Algoritmo RS256 ➔ HS256)

Ataque sofisticado que explora a coexistência de algoritmos assimétricos e simétricos na mesma biblioteca:

```text
               ANATOMIA DO ATTACK DE CONFUSÃO DE CHAVE (KEY CONFUSION)
   Cenário Legítimo: A API utiliza RS256 (RSA). Possui uma Chave Pública amplamente conhecida.
   ──────────────────────────────────────────────────────────────────────────────────────────
   1. O Invasor obtém a Chave Pública do servidor (que é pública por definição!).
   2. O Invasor cria um token fraudulento, mas altera o Header para: {"alg": "HS256"}.
   3. O Invasor assina o token utilizando a CHAVE PÚBLICA DO SERVIDOR como se fosse o segredo HMAC!
   4. A API vulnerável lê o Header: "Ah, o token diz que é HS256!".
   5. A API pega seu segredo configurado (que em código mal escrito é a mesma variável onde está a
      chave pública) e roda o HMAC-SHA256.
   6. A assinatura bate perfeitamente! O token forjado pelo hacker é aceito como legítimo!
```

### Mitigações Arquiteturais:
* **Explicitar o Algoritmo Esperado:** Jamais permita que o token dite qual algoritmo o servidor usará para verificar.
* **Segregação de Tipos de Chave:** Use bibliotecas modernas que diferenciam instâncias de chaves públicas RSA/ECDSA de strings brutas de segredo HMAC.

---

## O Dilema do Armazenamento no Cliente: LocalStorage vs. Cookies

Onde uma Single Page Application (React, Vue, Angular) deve armazenar o token JWT recebido?

```text
                     A GUERRA DE VETORES: LOCALSTORAGE VS. HTTPONLY COOKIE
   ┌──────────────────────────────────────────┐      ┌──────────────────────────────────────────┐
   │          HTML5 LOCALSTORAGE              │      │           HTTPONLY COOKIE                │
   ├──────────────────────────────────────────┤      ├──────────────────────────────────────────┤
   │ • Acessível via JavaScript (`window.ls`) │      │ • Bloqueado para JavaScript pelo browser │
   │ • IMUNE a CSRF (Cross-Site Request Forg.)│      │ • TOTALMENTE IMUNE a ataques XSS!        │
   │ • VULNERABILIDADE CRÍTICA A XSS!         │      │ • VULNERÁVEL a CSRF se mal configurado!  │
   │   Qualquer script injetado rouba o token │      │   Exige SameSite=Strict e tokens anti-   │
   │   imediatamente e envia ao C2 do hacker! │      │   CSRF ou verificação de Origin/Referer. │
   └──────────────────────────────────────────┘      └──────────────────────────────────────────┘
```

> **Recomendação Definitiva de Segurança:** Para aplicações Web com dados sensíveis, armazene o token de autenticação em **Cookies com as três flags mandatórias**:
> `Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict; Path=/api`

---

API: Autenticação e Autorização
## Ciclo de Vida e Renovação: Access Token vs. Refresh Token com Rotação (RTR)

---

## A Estratégia de Tokens Duplos (Dual-Token Strategy)

Para conciliar a necessidade de segurança máxima (revogação rápida) com uma excelente experiência de usuário (não deslogar a cada 10 minutos), adotamos a arquitetura de **Access Token + Refresh Token**:

```text
               MATRIZ DE RESPONSABILIDADES: ACCESS TOKEN VS. REFRESH TOKEN
   ┌────────────────────────────────────────┐      ┌────────────────────────────────────────┐
   │             ACCESS TOKEN               │      │            REFRESH TOKEN               │
   ├────────────────────────────────────────┤      ├────────────────────────────────────────┤
   │ • Finalidade: Acesso aos recursos API. │      │ • Finalidade: Obter novo Access Token. │
   │ • Vida Útil (TTL): 5 a 15 MINUTOS.     │      │ • Vida Útil (TTL): 7 a 30 DIAS.        │
   │ • Armazenamento: Memória / Cookie rest.│      │ • Armazenamento: Cookie seguro/DB.     │
   │ • Estado no Server: Stateless puro.    │      │ • Estado no Server: Stateful/Auditado. │
   │ • Trafegado: Em TODAS as requisições.  │      │ • Trafegado: APENAS na rota `/refresh`.│
   └────────────────────────────────────────┘      └────────────────────────────────────────┘
```

```text
  FLUXO TEMPORAL:
  [Login] ──► Recebe Access Token (expira em 10 min) + Refresh Token (expira em 14 dias)
     │
     ├── Minuto 09: Continua usando Access Token liso...
     ├── Minuto 10: Access Token expira (API retorna 401).
     └── Minuto 10: Frontend chama POST /api/v1/auth/refresh enviando o Refresh Token.
                    Recebe novo par e segue operando sem deslogar o usuário!
```

---

## Refresh Token Rotation (RTR) & Detecção de Roubo

A mera existência de um Refresh Token de longa vida cria um alvo valioso para criminosos. A técnica de **Refresh Token Rotation (RFC 6819 / OAuth 2.0 BCP)** neutraliza essa ameaça:

```text
                 MECÂNICA DE ROTAÇÃO E DETECÇÃO DE REUSO (REUSE DETECTION)
   1. USO LEGÍTIMO:
      Cliente envia: [ Refresh Token A ] ──► Servidor invalida A e emite: [ Refresh Token B ]
      Cliente descarta A e armazena B.

   2. DETECÇÃO DE ROUBO / REPLAY:
      O invasor capturou o antigo [ Refresh Token A ] no trânsito e tenta usá-lo:
      Invasor envia: [ Refresh Token A ] ──► Servidor detecta: "TOKEN A JÁ FOI UTILIZADO!"
                                             │
                                             ▼
                                     [ ALARME DE SEGURANÇA! ]
                                     Um token zumbi foi reutilizado!
                                     Revoga IMEDIATAMENTE toda a família
                                     de tokens daquela sessão (incluindo o B)!
                                     O usuário legítimo é forçado a reautenticar.
```

---

## Diagrama de Sequência: Ciclo de Vida Completo com Rotação

```text
  USUÁRIO / FRONTEND                    API GATEWAY / AUTH                  RESOURCE SERVER
       │                                       │                                   │
   1.  │── POST /login (user, password) ──────►│                                   │
   2.  │◄── 200 OK (AccessT_1, RefreshT_1) ────│                                   │
       │                                       │                                   │
   3.  │── GET /api/v1/projects (AccessT_1) ──────────────────────────────────────►│
   4.  │◄── 200 OK (Dados do projeto) ─────────────────────────────────────────────│
       │                                       │                                   │
       │  [... Passam-se 15 minutos: AccessT_1 expira ...]                        │
       │                                       │                                   │
   5.  │── GET /api/v1/projects (AccessT_1) ──────────────────────────────────────►│
   6.  │◄── 401 Unauthorized ("Token expired") ────────────────────────────────────│
       │                                       │                                   │
   7.  │── POST /api/v1/auth/refresh (RefT_1) ─►│                                   │
       │                                       │ Invalida RefT_1                   │
       │                                       │ Emite AccessT_2 + RefT_2          │
   8.  │◄── 200 OK (AccessT_2, RefreshT_2) ────│                                   │
       │                                       │                                   │
   9.  │── GET /api/v1/projects (AccessT_2) ──────────────────────────────────────►│
   10. │◄── 200 OK (Dados obtidos com sucesso!)────────────────────────────────────│
```

---

API: Autenticação e Autorização
## Modelos de Controle de Acesso: RBAC, ABAC e Prevenção de BOLA/IDOR

---

## O Modelo RBAC (Role-Based Access Control)

O **RBAC** organiza as decisões de autorização em torno de funções operacionais (papéis) desempenhadas pelos usuários na organização:

```text
                        MODELAGEM HIERÁRQUICA RBAC (NIST RBAC STANDARD)
   [ Usuário: Mariana ] ──┐
                          ├──► [ Papel: ADMINISTRADOR ] ──┬──► [ Permissão: users:delete ]
   [ Usuário: Carlos  ] ──┘                               ├──► [ Permissão: users:create ]
                                                          │
   [ Usuário: Roberto ] ──────► [ Papel: EDITOR ] ────────┼──► [ Permissão: posts:publish]
                                                          │
   [ Usuário: Anônimo ] ──────► [ Papel: VIEWER ] ────────┴──► [ Permissão: posts:read   ]
```

### Princípios Estruturais do RBAC:
1. **Atribuição de Papéis (Role Assignment):** Um usuário só pode exercer uma permissão se for associado formalmente a um papel.
2. **Autorização de Papéis (Role Authorization):** Cada papel é um agrupador de direitos de acesso atômicos (*Permissions* ou *Scopes*).
3. **Hierarquia de Papéis (Role Hierarchy):** Papéis superiores herdam automaticamente todos os privilégios dos papéis subordinados (`Admin > Editor > Viewer`).

---

## Matriz de Permissões Granular (Permissions Matrix)

Em sistemas maduros, endpoints não devem verificar diretamente strings de papéis como `if user.role == "admin"`. Em vez disso, validam **permissões de ação e recurso (Scopes)**:

```text
  ENDPOINT / RECURSO HTTP      ESCOPO REQUERIDO     VIEWER   EDITOR   FINANCEIRO   ADMIN
  ──────────────────────────────────────────────────────────────────────────────────────
  GET    /api/v1/articles      articles:read          ✅       ✅         ✅         ✅
  POST   /api/v1/articles      articles:write         ❌       ✅         ❌         ✅
  DELETE /api/v1/articles/:id  articles:delete        ❌       ❌         ❌         ✅
  GET    /api/v1/invoices      invoices:read          ❌       ❌         ✅         ✅
  POST   /api/v1/invoices/pay  invoices:pay           ❌       ❌         ✅         ✅
  DELETE /api/v1/users/:id     users:delete           ❌       ❌         ❌         ✅
```

```python
# Abordagem Frágil (Hardcoded Role):
if current_user.role != "admin":
    raise HTTPException(status_code=403)

# Abordagem Robusta e Extensível (Permission/Scope Based):
def require_permission(permission: str):
    def dependency(user: User = Depends(get_current_user)):
        if permission not in user.permissions:
            raise HTTPException(status_code=403, detail="Forbidden: Insufficient scope")
        return user
    return dependency
```

---

## O Abismo entre RBAC e BOLA (Broken Object Level Authorization)

O erro mais comum e custoso em desenvolvimento de APIs é acreditar que implementar RBAC resolve toda a segurança de autorização:

```text
               O CENÁRIO CLÁSSICO DE VULNERABILIDADE BOLA / IDOR (OWASP API1)
   Requisição do Usuário A (ID: 104, Papel: "Viewer"):
   GET /api/v1/documents/8892 HTTP/1.1
   Authorization: Bearer <token_do_usuario_104>
   
   1. O Middleware RBAC checa: "O usuário 104 tem a permissão 'documents:read'?"
      Resposta do RBAC: SIM! Ele é um 'Viewer' e Viewers podem ler documentos.
   
   2. O Controller executa cegamente:
      documento = db.query(Document).filter(id=8892).first()
      return documento  <─── CATASTRÓFICO! O documento 8892 pertence ao Usuário B!
```

> **Regra Fundamental de Engenharia:** O RBAC responde se o usuário tem o direito genérico de executar a ação `documents:read`. **Apenas o código de domínio ou uma política ABAC pode verificar se o documento específico pertence ao usuário requisitante:**
> ```python
> if document.owner_id != current_user.id and not current_user.is_superuser:
>     raise HTTPException(status_code=403, detail="Acesso negado a este recurso.")
> ```

---

## Evolução: ABAC (Attribute-Based Access Control)

Quando as regras de negócio tornam-se complexas demais para papéis fixos (ex: *"Médicos podem ver prontuários de pacientes desde que estejam de plantão no mesmo hospital e o paciente não esteja em segredo de justiça"*), transicionamos para o **ABAC**:

```text
                       O MOTOR DE AVALIAÇÃO DE POLÍTICAS ABAC
   ┌────────────────────────────────────────────────────────────────────────┐
   │ 1. Sujeito (Subject):    Role="Doctor", Department="Cardiology", OnDuty=True
   │ 2. Recurso (Resource):  Type="MedicalRecord", Classification="Restricted"
   │ 3. Ação (Action):        "READ"
   │ 4. Ambiente (Context):   Time=14:30, Location="Internal_Hospital_WiFi"
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │  MOTOR DE DECISÃO DE POLÍTICA │
                       │    (Ex: OPA - Open Policy Ag) │
                       └───────────────┬───────────────┘
                                       │
                                 [ PERMITIDO ]
```

---

API: Autenticação e Autorização
## Pipeline de Middlewares, Interceptadores e Respostas Padronizadas

---

## A Arquitetura em Camadas do Middleware (Onion Architecture)

Em frameworks de alta performance (FastAPI, Express, NestJS, Go Gin), o controle de requisições baseia-se no padrão **Chain of Responsibility**:

```text
                               FLUXO DO PIPELINE DE MIDDLEWARES
   REQUISIÇÃO
       │
       ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ 1. Middleware de Telemetria (Trace ID, W3C TraceContext)    │
   └──────────────────────────────┬──────────────────────────────┘
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ 2. Middleware de Rate Limiting (Proteção contra Brute-Force)│ ──► HTTP 429
   └──────────────────────────────┬──────────────────────────────┘
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ 3. Middleware de CORS & Security Headers (HSTS, CSP, XSS)   │
   └──────────────────────────────┬──────────────────────────────┘
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ 4. Middleware de AUTENTICAÇÃO (AuthN: Extrai e valida JWT)  │ ──► HTTP 401
   └──────────────────────────────┬──────────────────────────────┘
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ 5. Interceptador de AUTORIZAÇÃO (AuthZ: Checa RBAC & Escopo)│ ──► HTTP 403
   └──────────────────────────────┬──────────────────────────────┘
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ 6. Handler da Rota (Regra de Negócio + Checagem de Posse)   │ ──► HTTP 404 / 200
   └─────────────────────────────────────────────────────────────┘
```

---

## Implementação Completa de Middleware de Segurança em FastAPI

Construção de dependências desacopladas e seguras com verificação de credenciais e escopos:

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

app = FastAPI(title="TaskFlow API - Secure Core")
security = HTTPBearer()

SECRET_KEY = "sua_chave_mestra_super_secreta_e_longa_aqui"
ALGORITHM = "HS256"

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        roles: list = payload.get("roles", [])
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject.")
        return {"user_id": user_id, "roles": roles}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token signature.")

def require_role(required_role: str):
    def role_checker(user: dict = Depends(get_current_user)):
        if required_role not in user["roles"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operação restrita. Exige papel: {required_role}"
            )
        return user
    return role_checker

@app.delete("/api/v1/users/{target_id}")
async def delete_user(target_id: str, user: dict = Depends(require_role("admin"))):
    return {"message": f"Usuário {target_id} deletado pelo administrador {user['user_id']}."}
```

---

## Semântica e Padronização de Erros: RFC 9457 (Problem Details)

APIs profissionais não retornam mensagens de erro amadoras como `{"error": "acesso negado"}`. Elas seguem o padrão canônico **RFC 9457 (antiga RFC 7807)**:

### 1. Resposta para Falha de Autenticação (HTTP 401 Unauthorized):
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/problem+json
WWW-Authenticate: Bearer error="invalid_token", error_description="The signature is invalid or expired"

{
  "type": "https://api.fatec.sp.gov.br/errors/authentication-failed",
  "title": "Unauthorized",
  "status": 401,
  "detail": "O token fornecido no cabeçalho Authorization está expirado.",
  "instance": "/api/v1/projects/502",
  "code": "AUTH_TOKEN_EXPIRED"
}
```

### 2. Resposta para Falha de Autorização (HTTP 403 Forbidden):
```http
HTTP/1.1 403 Forbidden
Content-Type: application/problem+json

{
  "type": "https://api.fatec.sp.gov.br/errors/insufficient-privileges",
  "title": "Forbidden",
  "status": 403,
  "detail": "Sua conta não possui permissão para excluir registros nesta organização.",
  "instance": "/api/v1/projects/502",
  "code": "INSUFFICIENT_ROLE_PERMISSIONS"
}
```

---

API: Autenticação e Autorização
## Gerenciamento Seguro de Segredos e Práticas de Produção

---

## Os 5 Mandamentos do Gerenciamento de Segredos (12-Factor App)

1. **PROIBIDO Commitar Segredos no Git:** Nunca escreva senhas, chaves privadas ou `SECRET_KEY` diretamente no código-fonte. Utilize arquivos `.env` estritamente adicionados ao `.gitignore`.
2. **Utilize Cofres de Segredos Centralizados em Nuvem:**
   * AWS Secrets Manager / Parameter Store (SSM)
   * HashiCorp Vault
   * GCP Secret Manager / Azure Key Vault
3. **Imponha Rotação Contínua de Chaves (Key Rotation):** Chaves criptográficas de JWT devem possuir ciclo de vida programado para rotação (ex: a cada 90 dias) utilizando **JWKS (`kid` - Key ID)** sem derrubar sessões ativas.
4. **Mascaramento e Redação de Dados em Logs (PII Masking):**
   * Nunca registre tokens JWT completos ou senhas em texto puro nos logs do servidor.
   * Filtre campos sensíveis (`password`, `cvv`, `token`, `ssn`) em middlewares de auditoria.
5. **Criptografia em Repouso e Trânsito:** TLS 1.3 obrigatório para todo o tráfego HTTP. Campos ultra-sensíveis no banco de dados devem usar criptografia em nível de coluna (*Envelope Encryption* com AES-256-GCM).

---

API: Autenticação e Autorização
## Arquitetura de Referência End-to-End & Checklist de Produção

---

## Blueprint de Referência: Autenticação & Autorização Distribuída

```text
                                ARQUITETURA CORPORATIVA DE REFERÊNCIA
   [ Clientes Web / Mobile ]
               │
               ▼ HTTPS (TLS 1.3)
   ┌─────────────────────────────────────────────────────────────┐
   │ API GATEWAY L7 (Kong / Envoy / AWS API Gateway)             │
   │ • Terminação TLS & WAF (Bloqueio de ataques web)            │
   │ • Rate Limiting agressivo no /auth/* (Prevenção Brute-Force)│
   └───────────────┬─────────────────────────────────────────────┘
                   │
                   ├───► Rota Pública /auth/login /auth/refresh
                   │     │
                   │     ▼
                   │   ┌──────────────────────────────────────┐
                   │   │   SERVIÇO DE IDENTIDADE (IdP / Auth) │
                   │   │   • Hashing Argon2id de senhas       │
                   │   │   • Emissão de JWT (RS256 / Chv Priv)│
                   │   │   • Refresh Token Rotation (RTR)     │
                   │   └──────────────┬───────────────────────┘
                   │                  │
                   ▼                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ MICROSSERVIÇOS / RESOURCE SERVERS                           │
   │ • Baixam Chave Pública via JWKS (/oauth2/certs)             │
   │ • Validam JWT em CPU local (Stateless, Zero I/O)            │
   │ • Consultam Blacklist no Redis apenas para emergências (jti)│
   │ • Checam Permissões RBAC e validam posse do recurso (BOLA)  │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ CAMADA DE DADOS E AUDITORIA                                 │
   │ • PostgreSQL (RLS - Row Level Security)                     │
   │ • Trilha imutável de Logs de Auditoria (Security Audit Log) │
   └─────────────────────────────────────────────────────────────┘
```

---

## Checklist de Segurança em Produção (System Design Security)

Antes de promover qualquer API para ambiente de produção, audite cada um dos seguintes itens:

* [ ] **Transporte:** Toda a comunicação externa e interna ocorre exclusivamente sob TLS 1.3.
* [ ] **Hashing:** Senhas protegidas com `Argon2id` ou `bcrypt` (work factor $\ge 12$). Nenhum SHA-256 puro.
* [ ] **Timing Attacks:** Comparações de hashes e assinaturas feitas em tempo constante (`hmac.compare_digest`).
* [ ] **Validade do JWT:** O Access Token possui TTL reduzido (máximo 15 minutos).
* [ ] **Lista Branca de Algoritmos:** A API valida estritamente o algoritmo esperado; rejeita sumariamente `alg: none`.
* [ ] **Assinatura:** Chaves HS256 têm pelo menos 256 bits aleatórios; ou preferencialmente utiliza-se RS256/ES256.
* [ ] **Rotação de Refresh Token:** Implementado RTR com detecção e revogação imediata de famílias de tokens zumbis.
* [ ] **Proteção de Armazenamento:** Cookies com flags `HttpOnly; Secure; SameSite=Strict`.
* [ ] **Proteção contra BOLA:** Todas as rotas que recebem IDs de recursos verificam se o objeto pertence ao requisitante.
* [ ] **Rate Limiting:** Rotas de autenticação (`/login`, `/register`, `/recovery`) limitadas por IP e usuário.
* [ ] **Erros Semânticos:** Uso estrito de `401` para falha de identidade e `403` para falta de permissão via RFC 9457.
* [ ] **Segredos:** Nenhuma credencial commitada; segredos injetados via Secrets Manager e variáveis de ambiente.

---

## Referências Bibliográficas e Leituras Recomendadas

### Normas e Especificações Formais:
* **RFC 7519:** *JSON Web Token (JWT).* IETF, 2015.
* **RFC 7515:** *JSON Web Signature (JWS).* IETF, 2015.
* **RFC 6749:** *The OAuth 2.0 Authorization Framework.* IETF, 2012.
* **RFC 9457:** *Problem Details for HTTP APIs.* IETF, 2023.
* **NIST SP 800-63B:** *Digital Identity Guidelines: Authentication and Lifecycle Management.* NIST, 2020.
* **OWASP Foundation:** *OWASP API Security Top 10 (2023 Edition).*

### Livros de Referência:
* **DE RYCK, Philippe.** *API Security in Action.* Manning Publications, 2020.
* **PARECKI, Aaron.** *OAuth 2.0 Simplified.* Lulu Press, 2018.
* **KLEPPMANN, Martin.** *Designing Data-Intensive Applications.* O'Reilly Media, 2017.
* **FERRAIOLO, David F. et al.** *Role-Based Access Control.* 2ª ed. Artech House, 2007.

---

# Programação Web :mortar_board:
## Eduardo Cruz Araujo
### Fatec Ribeirão Preto - SP | 2026.2
### Dúvidas, Discussão Técnica & Prática nos Simuladores!
