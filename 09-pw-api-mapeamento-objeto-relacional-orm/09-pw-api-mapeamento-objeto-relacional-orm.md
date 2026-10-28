---
marp: true

author: "Eduardo Cruz Araujo"
title: "Programação Web"
description: "Disciplina de Programação Web."

theme: "default"
class: "invert"

footer: "Eduardo Cruz Araujo | Fatec | 2026.2 | Programação Web | API: Mapeamento Objeto-Relacional (ORM)"

paginate: "true"

---

# Programação Web :mortar_board:
## API: Mapeamento Objeto-Relacional (ORM)
### Persistência de Dados, Modelagem de Entidades e Relacionamentos, Migrações Estruturais, Transações ACID e Mitigação do Problema N+1

---

API: Mapeamento Objeto-Relacional (ORM)
## Agenda e Roteiro de Aprendizagem

* **01. O Descasamento de Impedância Objeto-Relacional (Object-Relational Impedance Mismatch):**
  * O conflito entre o modelo orientado a objetos (grafos em memória) e o modelo relacional (tabelas e tuplas).
  * O espectro de persistência: Raw SQL vs. Query Builders vs. Micro-ORMs vs. Full ORMs.
* **02. Padrões Arquiteturais Fundamentais de Persistência:**
  * Active Record (Martin Fowler) vs. Data Mapper: anatomia, trade-offs e acoplamento.
  * O padrão Repository e Unit of Work (UoW): Change Tracking, Dirty Checking e sincronização atômica.
* **03. Mapeamento de Entidades, Tipos e Restrições de Integridade:**
  * Definição declarativa de tabelas, tipos nativos e tipos modernos (JSONB, UUIDv4 vs. UUIDv7).
  * Chaves primárias, índices compostos e o ciclo de vida das entidades (Hooks & Interceptadores).
* **04. Mapeamento de Relacionamentos e Integridade Referencial:**
  * Associações 1:1, 1:N / N:1 e N:N com tabelas de junção (*Junction Tables*).
  * Ações em cascata (*Cascade Actions*) e os riscos de integridade: *Hard Delete* vs. *Soft Delete*.
* **05. Estratégias de Carregamento e o Infame Gargalo de Consultas N+1:**
  * Anatomia do problema N+1 e a explosão de latência por round-trips de rede.
  * Lazy Loading vs. Eager Loading: Joined Load (`LEFT JOIN`) vs. Select-IN Load (`IN (...)`).
* **06. Gerenciamento de Transações, Concorrência e Propriedades ACID:**
  * Ciclo de vida transacional no ORM: `begin()`, `add()`, `flush()`, `commit()` e `rollback()`.
  * A diferença crítica entre `flush()` e `commit()`.
  * Níveis de isolamento SQL e controle de concorrência: Pessimistic Locking (`FOR UPDATE`) vs. Optimistic Locking (`version`).
* **07. Migrações Estruturais de Esquema (Database Migrations):**
  * Infraestrutura como Código (IaC) aplicada a banco de dados com Alembic / Prisma.
  * Boas práticas para migrações em produção sem downtime (*Zero-Downtime Migrations*).
* **08. Implementação de Produção com SQLAlchemy 2.0 Moderno (Python / FastAPI):**
  * Modelagem tipada com `Mapped[...]`, `DeclarativeBase` e sessões assíncronas (`AsyncSession`).
* **09. Connection Pooling, Profiling e Antipatterns de Performance:**
  * Dimensionamento do pool de conexões (`QueuePool`), *Hydration Overhead* e *Bulk Operations*.
* **10. Síntese Arquitetural, Checklist de Persistência e Laboratório Interativo:**
  * Árvore de decisão de persistência, auditoria pré-deploy e exercícios no simulador interativo.

---

API: Mapeamento Objeto-Relacional (ORM)
## O Descasamento de Impedância Objeto-Relacional (Impedance Mismatch)

---

## O Conflito Paradigmático entre Aplicação e Banco de Dados

Em engenharia de software contemporânea, quase todas as aplicações de backend operam sob o paradigma **Orientado a Objetos (OOP)** ou manipulam estruturas complexas em memória (estruturas tipadas, grafos de dependência). Simultaneamente, os repositórios corporativos predominantes baseiam-se no **Modelo Relacional** (Edgar F. Codd, 1970):

```text
       PARADIGMA ORIENTADO A OBJETOS                      PARADIGMA RELACIONAL (SQL)
   ┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐
   │ • Grafos de objetos interligados       │       │ • Tabelas bidimensionais (Relações)    │
   │ • Encapsulamento de comportamento/dado │       │ • Tuplas (Linhas) e Atributos (Colunas)│
   │ • Herança, Polimorfismo e Interfaces   │ ◄───► │ • Teoria dos Conjuntos e Álgebra Relac.│
   │ • Identidade por Referência de Memória │       │ • Chaves Primárias e Integridade Refer.│
   │ • Navegabilidade bidirecional livre    │       │ • Operações relacionais: JOIN, UNION   │
   └────────────────────────────────────────┘       └────────────────────────────────────────┘
                       ▲                                                 ▲
                       └───────────────[ O ABISMO ]──────────────────────┘
                                  (Impedance Mismatch)
```

### Os 4 Pilares da Incompatibilidade Técnica:
1. **Representação de Dados:** Objetos possuem coleções aninhadas (`user.orders`). Tabelas relacionais são planas e normalizadas (1FN, 2FN, 3FN), exigindo tabelas associativas e foreign keys.
2. **Herança vs. Tabelas Planas:** SQL não possui conceito nativo de herança polimórfica (exige estratégias como *Single Table*, *Joined Table* ou *Table Per Concrete Class*).
3. **Identidade vs. Igualdade:** Em OOP, dois objetos são idênticos se ocupam o mesmo endereço de memória (`a is b`). No banco, a identidade é definida exclusivamente pelo valor de uma Chave Primária (`id == 104`).
4. **Encapsulamento:** Objetos protegem seu estado interno com modificadores de visibilidade (`private`). Bancos relacionais expõem dados publicamente para consultas e projeções arbitrárias.

---

## O Espectro das Técnicas de Acesso a Dados

Engenheiros de software não enfrentam uma escolha binária entre "SQL puro" ou "ORM mágico". Existe um gradiente contínuo de abstrações de acesso a dados:

```text
                 O ESPECTRO DE ABSTRAÇÃO DE ACESSO A DADOS
   Menor Abstração                                                           Maior Abstração
   Maior Controle                                                            Maior Produtividade
   ┌─────────────────┬───────────────────┬───────────────────┬───────────────────┐
   │    RAW SQL      │   QUERY BUILDER   │    MICRO-ORM      │     FULL ORM      │
   │ (Drivers Puros) │  (Knex / Core)    │ (Dapper / SQLx)   │(SQLAlchemy/Prisma)│
   ├─────────────────┼───────────────────┼───────────────────┼───────────────────┤
   │ Comandos SQL em │ Construtores de   │ Mapeia queries    │ Mapeia entidades, │
   │ strings puras   │ consulta via API  │ SQL escritas na   │ gerencia o grafo, │
   │ executados via  │ programática e    │ mão direto para   │ executa tracking  │
   │ cursor nativo.  │ tipada.           │ objetos planos.   │ de mudanças (UoW).│
   └─────────────────┴───────────────────┴───────────────────┴───────────────────┘
```

```text
  RAW SQL:
  cursor.execute("SELECT id, name FROM users WHERE active = %s", (True,))
  rows = cursor.fetchall()  # Retorna lista de tuplas brutas: [(1, 'Eduardo'), ...]

  QUERY BUILDER (SQLAlchemy Core):
  stmt = select(users_table.c.id, users_table.c.name).where(users_table.c.active == True)
  result = conn.execute(stmt)

  FULL ORM (SQLAlchemy ORM 2.0):
  stmt = select(User).where(User.active.is_(True)).options(selectinload(User.orders))
  users = session.scalars(stmt).all()  # Retorna instâncias ricas da classe User!
```

---

## Matriz Comparativa: Raw SQL vs. Query Builder vs. Full ORM

| Dimensão de Comparação | Raw SQL Puro (Drivers) | Query Builders | Full ORM (SQLAlchemy / Hibernate) |
| :--- | :--- | :--- | :--- |
| **Curva de Aprendizado** | Baixa (se souber SQL nativo). | Baixa a Moderada. | **Alta** (requer entender UoW, Lazy, Flushing). |
| **Controle de Performance**| **Absoluto** (otimização de índices/planos). | Muito Alto. | Médio a Alto (exige profiling contínuo). |
| **Independência de SGBD** | Baixa (dialetos específicos de SQL). | Alta (traduz para Postgres, MySQL, SQLite). | **Muito Alta** (abstração de dialeto e tipos). |
| **Segurança contra SQLi** | Manual (requer bindings parametrizados). | **Nativa** (parametrização automática). | **Nativa** (parametrização compulsória). |
| **Refatoração no Código** | Frágil (queries em strings soltas). | Segura (detectada em tempo de compilação/lint). | **Excelente** (tipagem estrita com IDE autocomplete). |
| **Gargalos Escondidos** | Raros (você vê exatamente o que roda). | Incomuns. | **Frequentes se mal usado** (ex: N+1 queries). |
| **Cenário Ideal** | Relatórios analíticos, ETL, bulk massivo. | Migrações, relatórios e queries dinâmicas. | **APIs OLTP, CRUDs complexos, domínios ricos**. |

---

API: Mapeamento Objeto-Relacional (ORM)
## Padrões Arquiteturais Fundamentais de Persistência

---

## Padrões de Persistência: Active Record vs. Data Mapper

Descritos por Martin Fowler no clássico *Patterns of Enterprise Application Architecture (P of EAA)*, os dois padrões representam filosofias opostas de acoplamento:

```text
         PADRÃO ACTIVE RECORD                              PADRÃO DATA MAPPER
   ┌───────────────────────────────┐           ┌───────────────────┐     ┌───────────────────┐
   │       User (Classe Única)     │           │   User (Entidade) │     │  UserRepository   │
   ├───────────────────────────────┤           ├───────────────────┤     ├───────────────────┤
   │ Propriedades: name, email     │           │ name: str         │     │ findById(id)      │
   │ Regras de Negócio: canLogin() │           │ email: str        │     │ save(user)        │
   │ Persistência: save(), find()  │           │ canLogin()        │     │ delete(user)      │
   └───────────────┬───────────────┘           └─────────┬─────────┘     └─────────┬─────────┘
                   │                                     │                         │
                   ▼                                     └────────────┬────────────┘
        [ BANCO DE DADOS ]                                            ▼
   Acoplamento total entre o dado                               [ BANCO DE DADOS ]
   e a infraestrutura de rede!                     Separação estrita: Entidade Pura vs. Persistência!
```

* **Active Record (Django ORM, Rails ActiveRecord, Prisma parcialmente):**
  * O objeto carrega tanto os dados quanto os métodos de acesso ao banco (`user.save()`, `User.objects.filter()`).
  * **Trade-off:** Alta velocidade inicial de desenvolvimento, mas viola o *Single Responsibility Principle (SRP)* e dificulta testes unitários puros sem banco acoplado.
* **Data Mapper (SQLAlchemy 2.0, Hibernate/JPA, TypeORM DataMapper):**
  * A entidade de domínio não sabe que existe um banco de dados. Um serviço separado (*Session / Repository*) cuida de sincronizar dados com o disco.
  * **Trade-off:** Mais coeso, favorece *Domain-Driven Design (DDD)* e arquiteturas limpas (*Clean Architecture*).

---

## O Padrão Unit of Work (Unidade de Trabalho) & Change Tracking

Em ORMs baseados em Data Mapper, a **Unidade de Trabalho (Unit of Work - UoW)** atua como um gerenciador de contexto em memória que rastreia tudo o que aconteceu durante a transação:

```text
                           O CICLO DE VIDA DO UNIT OF WORK (UOW)
   1. Carrega Entidade do Banco:
      user = session.get(User, 104) ──► UoW tira um "Snapshot" do estado original em memória!
      
   2. Modifica Propriedade na Memória:
      user.email = "novo@fatec.sp.gov.br"  (Nenhum SQL executado ainda!)
      
   3. Cria Novo Objeto Relacionado:
      order = Order(user=user, total=250.0)
      session.add(order)
      
   4. Dispara o Commit da Transação:
      session.commit()
      │
      ├───► DIRTY CHECKING: Compara estado atual com o snapshot original.
      ├───► DETERMINAÇÃO TOPOLÓGICA: Descobre a ordem correta de persistência.
      ├───► DISPATCH ATÔMICO EM LOTE:
      │     UPDATE users SET email = 'novo@fatec.sp.gov.br' WHERE id = 104;
      │     INSERT INTO orders (user_id, total) VALUES (104, 250.0);
      └───► COMMIT TRANSACIONAL NO BANCO!
```

> **A Mágica do Dirty Checking:** Você não precisa chamar `user.update()`. O ORM detecta automaticamente quais propriedades foram alteradas e gera o `UPDATE` cirúrgico contendo apenas as colunas modificadas.

---

API: Mapeamento Objeto-Relacional (ORM)
## Mapeamento de Entidades, Tipos e Restrições de Integridade

---

## Anatomia do Mapeamento Declarativo Moderno (SQLAlchemy 2.0)

A partir da versão 2.0 do SQLAlchemy, a declaração de modelos adota tipagem estrita de Python (PEP 484) combinando `DeclarativeBase` e `Mapped[...]`:

```python
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import String, Numeric, ForeignKey, DateTime, func, Index
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    # Chave Primária com UUID
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relacionamento 1:N (Um usuário possui múltiplos pedidos)
    orders: Mapped[list["Order"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_users_email_active", "email", "is_active"),
    )
```

---

## Estratégias de Chaves Primárias: Auto-Increment vs. UUIDv4 vs. UUIDv7

A escolha da chave primária afeta diretamente a segurança da API e a performance de fragmentação de índices B-Tree:

```text
  ESTRATÉGIA    EXEMPLO             VANTAGENS                            DESVANTAGENS
  ──────────────────────────────────────────────────────────────────────────────────────────────────
  Sequence /    1, 2, 3, 4          • Ocupa apenas 4 a 8 bytes (BIGINT). • VAZA MÉTRICAS DE NEGÓCIO!
  Auto-Incr.                        • Inserção sequencial perfeita no    • Suscetível a varredura IDOR.
                                      índice B-Tree (zero fragmentação). • Conflito em bancos distribuídos.
  
  UUIDv4        550e8400-e29b-      • Globalmente único (sem colisão).   • Ocupa 16 bytes.
  (Aleatório)   41d4-a716-          • Seguro contra enumeração/IDOR.     • TOTALMENTE ALEATÓRIO:
                446655440000        • Gerável no cliente antes do save.    Fragmenta violentamente o
                                                                           índice B-Tree em escritas!
  
  UUIDv7        018d3c5f-9e2a-      • PADRÃO OURO MODERNO!               • Especificação recente (RFC 9562).
  (Time-Ordered)7a8b-8c11-...       • 48 bits de Timestamp Unix inicial. • Requer biblioteca ou PG 17+.
                                    • Ordenável no tempo (B-Tree feliz!).
```

```text
   FRAGMENTAÇÃO DE ÍNDICE B-TREE:
   Chave Sequencial / UUIDv7 ──► Inserções sempre no final do bloco da folha (Append-Only veloz).
   Chave Aleatória UUIDv4    ──► Inserções forçam quebra de nós intermediários (Page Splits e lentidão de I/O).
```

---

API: Mapeamento Objeto-Relacional (ORM)
## Mapeamento de Relacionamentos e Integridade Referencial

---

## Os 3 Tipos Fundamentais de Associação no Mapeamento

```text
   1. UM-PARA-UM (1:1)                      2. UM-PARA-MUITOS (1:N)
   ┌──────────┐      ┌──────────┐           ┌──────────┐      ┌──────────┐
   │  User    │ 1──1 │ Profile  │           │  User    │ 1──* │  Order   │
   │  id (PK) │      │ user_id  │           │  id (PK) │      │ user_id  │
   └──────────┘      │ (FK, UNQ)│           └──────────┘      │ (FK)     │
                     └──────────┘                             └──────────┘
   A chave estrangeira reside no lado       A chave estrangeira reside no lado "Muitos".
   dependente com restrição UNIQUE.

   3. MUITOS-PARA-MUITOS (N:N) COM TABELA ASSOCIATIVA (JUNCTION / PIVOT)
   ┌──────────────┐          ┌──────────────────────┐          ┌──────────────┐
   │   Student    │ 1      * │      Enrollment      │ *      1 │    Course    │
   ├──────────────┤ ─────────┼──────────────────────┼───────── ├──────────────┤
   │ id (PK)      │          │ student_id (FK, PK)  │          │ id (PK)      │
   │ name         │          │ course_id (FK, PK)   │          │ title        │
   └──────────────┘          │ enrolled_at, grade   │          └──────────────┘
                             └──────────────────────┘
   A tabela intermediária resolve a cardinalidade N:N e pode carregar atributos próprios!
```

---

## Integridade e Ações em Cascata: O Perigo do Cascade Delete

Quando um registro pai é excluído, o que deve acontecer com seus filhos na base de dados?

```text
  AÇÃO CASCADE           COMPORTAMENTO NO SGBD                         EXEMPLO DE USO RECOMENDADO
  ──────────────────────────────────────────────────────────────────────────────────────────────────
  CASCADE                Exclui automaticamente todos os filhos.       Itens de uma fatura excluída.
                         ⚠️ RISCO BRUTAL: Excluir um usuário pode      (Itens não existem sem a fatura).
                         apagar anos de histórico financeiro!
  
  RESTRICT / NO ACTION   Bloqueia a exclusão do pai se houver          Bloquear exclusão de usuário
                         filhos dependentes (lança erro de FK).        que possui pedidos no histórico.
  
  SET NULL               Mantém os filhos vivos, mas define sua        Ao deletar uma categoria,
                         coluna de FK como NULL.                       os produtos ficam "Sem categoria".
```

### Soft Delete (Exclusão Lógica) vs. Hard Delete (Exclusão Física)
Em sistemas corporativos, quase nunca apagamos registros fiscais ou transacionais com `DELETE`:
* **Soft Delete:** A tabela possui uma coluna `deleted_at: datetime | None`. Ao "deletar", o ORM executa:
  `UPDATE orders SET deleted_at = NOW() WHERE id = 104;`
* **Armadilha com ORMs:** O desenvolvedor precisa garantir que **todas as consultas** incluam o filtro `.where(Order.deleted_at.is_(None))`, ou configurar filtros globais de sessão (*Global Query Filters*).

---

API: Mapeamento Objeto-Relacional (ORM)
## Estratégias de Carregamento e o Infame Gargalo de Consultas N+1

---

## Anatomia do Problema de Consultas N+1 (The N+1 Query Problem)

O **Problema N+1** é o gargalo de desempenho mais devastador e recorrente em APIs que utilizam ORMs. Ele ocorre quando o desenvolvedor itera sobre uma coleção carregada por *Lazy Loading* (carregamento sob demanda):

```text
                             O FLUXO DESTRUTIVO DO PROBLEMA N+1
   Código da API (Aparência inocente):
   authors = session.scalars(select(Author).limit(50)).all()  <── 1 QUERY EXECUTADA!
   for author in authors:
       print(author.books)  <── LAZY LOAD DISPARA 1 QUERY PARA CADA AUTOR NO LOOP!
```

```text
  TRÁFEGO REAL DE REDE GERADO NO BANCO DE DADOS:
  Query 1: SELECT * FROM authors LIMIT 50;                         (1 consulta)
  Query 2: SELECT * FROM books WHERE author_id = 1;                (N = 1)
  Query 3: SELECT * FROM books WHERE author_id = 2;                (N = 2)
  Query 4: SELECT * FROM books WHERE author_id = 3;                (N = 3)
  ...
  Query 51: SELECT * FROM books WHERE author_id = 50;              (N = 50)
  ══════════════════════════════════════════════════════════════════════════════
  TOTAL: 1 + 50 = 51 QUERIES INDEPENDENTES VIA REDE!
```

* **Impacto em Produção:** Se a latência de rede entre o servidor da API e o banco for de míseros **4ms**, apenas o overhead de round-trip de rede consumirá:
  $$51 \times 4\text{ms} = 204\text{ms}$$
  Sem contar o tempo de processamento do banco de dados! A API fica lenta e o pool de conexões satura.

---

## As Duas Grandes Estratégias de Eager Loading

Para exterminar o N+1, instruímos o ORM a carregar os dados relacionados antecipadamente (*Eager Loading*):

```text
               ESTRATÉGIA 1: JOINED EAGER LOADING (selectinload vs joinedload)
   Executa um único comando SQL combinando as tabelas via LEFT OUTER JOIN:
   
   SELECT authors.id, authors.name, books.id, books.title
   FROM authors
   LEFT OUTER JOIN books ON authors.id = books.author_id
   LIMIT 50;
   
   • Vantagem: Exatamente 1 única consulta enviada ao banco de dados!
   • PERIGO - O Produto Cartesiano: Se cada autor tiver 100 livros, o banco retorna 5.000 linhas
     duplicando todos os dados do autor milhares de vezes no tráfego de rede!
```

```text
               ESTRATÉGIA 2: SELECT-IN EAGER LOADING (Padrão Ouro para 1:N)
   O ORM executa EXATAMENTE DUAS consultas cirúrgicas:
   
   Query 1: SELECT * FROM authors LIMIT 50;
   Query 2: SELECT * FROM books WHERE author_id IN (1, 2, 3, ..., 50);
   
   • Vantagem Absoluta: Não duplica dados em produto cartesiano.
   • Resolução em Memória: O ORM recebe os livros e popula o atributo author.books de cada autor!
   • Custo Fixo Previsível: São SEMPRE 2 queries, quer você busque 10 ou 1.000 autores!
```

---

## Comparativo de Estratégias de Carregamento

| Estratégia | Como Opera no SQL | Qtd. de Queries | Risco / Desvantagem Principal | Cenário Ideal |
| :--- | :--- | :--- | :--- | :--- |
| **Lazy Loading** | Dispara `SELECT` sob demanda ao acessar o atributo. | **$1 + N$** *(Explosivo)* | Gargalo brutal de latência N+1 e risco de erro assíncrono. | Aplicações desktop legadas; **evitar em APIs REST**. |
| **Joined Load** (`joinedload`) | `LEFT OUTER JOIN` na mesma query. | **$1$** | Produto cartesiano duplica linhas na rede para coleções 1:N. | Relações **1:1** ou **N:1** (*Many-to-One*). |
| **Select-IN Load** (`selectinload`) | Query inicial + `SELECT ... WHERE id IN (...)`. | **$2$** | Tamanho da lista de IDs no `IN` (dividido em batches). | **Padrão Ouro para 1:N** (*One-to-Many*). |
| **Subquery Load** (`subqueryload`) | Query inicial + `WHERE id IN (SELECT id FROM ...)`. | **$2$** | Subqueries correlacionadas podem ser lentas em bancos sem bom otimizador. | Coleções 1:N paginadas complexas. |

```python
# Como usar de forma limpa em SQLAlchemy 2.0:
stmt = (
    select(Author)
    .options(selectinload(Author.books))  # Resolve N+1 em 2 queries limpas!
    .limit(50)
)
authors = session.scalars(stmt).all()
```

---

API: Mapeamento Objeto-Relacional (ORM)
## Gerenciamento de Transações, Concorrência e Propriedades ACID

---

## O Ciclo Transacional no ORM: flush() vs. commit()

Uma das maiores fontes de confusão em transações com ORM é a diferença entre **enviar dados ao banco (`flush`)** e **efetivar a gravação final (`commit`)**:

```text
                           ANATOMIA DO CICLO TRANSACIONAL
   Aplicação (Memória)           Buffer do SGBD / Transação Aberta         Disco / WAL / Persistido
   ┌──────────────────────┐      ┌───────────────────────────────┐      ┌─────────────────────────┐
   │ user = User(...)     │      │                               │      │                         │
   │ session.add(user)    │      │                               │      │                         │
   │                      │      │                               │      │                         │
   │ session.flush() ──────────► │ SQL INSERT executado!         │      │                         │
   │                      │      │ ID gerado via sequence/DB     │      │ (Outras transações NÃO  │
   │                      │      │ Visível na MESMA transação!   │      │  veem nada ainda:       │
   │                      │      │                               │      │  Isolamento ACID)       │
   │                      │      │                               │      │                         │
   │ session.commit() ────────────────────────────────────────────────► │ COMMIT emitido!         │
   │                      │      │ Locks de linha liberados!     │      │ Dados gravados no WAL   │
   │                      │      │                               │      │ e visíveis a todos!     │
   └──────────────────────┘      └───────────────────────────────┘      └─────────────────────────┘
```

* **`session.flush()`:** Despeja as alterações pendentes para o banco de dados. Executa os `INSERTs/UPDATEs` necessários para que IDs auto-incrementados existam e restrições de FK sejam validadas. **A transação continua aberta e pode sofrer rollback!**
* **`session.commit()`:** Efetiva a transação no banco (`COMMIT`). Libera todos os locks de concorrência e encerra a transação.

---

## Concorrência de Escrita: Pessimistic vs. Optimistic Locking

Quando dois usuários tentam reservar o último ingresso de um show ou debitar o saldo da mesma conta bancária ao mesmo tempo (*Race Condition / Lost Update*):

```text
         PESSIMISTIC LOCKING (Bloqueio Físico de Linha)           OPTIMISTIC LOCKING (Checagem de Versão)
   ┌──────────────────────────────────────────────────┐      ┌───────────────────────────────────────────────┐
   │ Transação A lê com bloqueio:                     │      │ Transação A lê: Saldo=100, Versão=1           │
   │ SELECT * FROM accounts WHERE id=1 FOR UPDATE;    │      │ Transação B lê: Saldo=100, Versão=1           │
   │                                                  │      │                                               │
   │ Transação B tenta executar o mesmo comando:      │      │ Transação A grava primeiro:                   │
   │ SELECT * FROM accounts WHERE id=1 FOR UPDATE;    │      │ UPDATE accounts SET saldo=50, versao=2        │
   │ ──► BANCO ENFILEIRA B! B dorme aguardando A!     │      │ WHERE id=1 AND versao=1; ──► (1 linha afetada)│
   │                                                  │      │                                               │
   │ Transação A conclui: saldo = 50; COMMIT;         │      │ Transação B tenta gravar:                     │
   │ ──► B é destravado e lê o saldo atualizado (50)! │      │ UPDATE accounts SET saldo=20, versao=2        │
   │                                                  │      │ WHERE id=1 AND versao=1; ──► (0 LINHAS AFET.) │
   │ Vantagem: Segurança matemática determinística.   │      │ ──► CONFLITO DETECTADO! Lança exceção e B     │
   │ Custo: Contenção de banco e risco de Deadlock.   │      │     retenta a operação com dados frescos!     │
   └──────────────────────────────────────────────────┘      └───────────────────────────────────────────────┘
```

```python
# Implementação de Optimistic Lock com SQLAlchemy:
class Account(Base):
    __tablename__ = "accounts"
    id: Mapped[int] = mapped_column(primary_key=True)
    balance: Mapped[float]
    version: Mapped[int] = mapped_column(default=1)

    __mapper_args__ = {
        "version_id_col": version  # O ORM controla o incremento e checagem automaticamente!
    }
```

---

API: Mapeamento Objeto-Relacional (ORM)
## Migrações Estruturais de Esquema (Database Migrations)

---

## O Princípio da Infraestrutura como Código (IaC) no Banco

Em projetos profissionais, **nunca executamos comandos manuais `ALTER TABLE` ou `CREATE TABLE` diretamente no banco de produção**. O esquema do banco evolui como código versionado no Git através de ferramentas de migração (*Alembic* para SQLAlchemy, *Prisma Migrate*, *Flyway*, *Liquibase*):

```text
                             O FLUXO DE MIGRAÇÃO COM ALEMBIC
   1. Desenvolvedor altera a entidade no código:
      User.phone: Mapped[str] = mapped_column(String(20), nullable=True)
      
   2. Gera o arquivo de migração comparando código com o banco:
      $ alembic revision --autogenerate -m "add phone to users"
      
   3. Arquivo gerado no repositório (ex: 20261014_add_phone.py):
      def upgrade() -> None:
          op.add_column('users', sa.Column('phone', sa.String(length=20), nullable=True))

      def downgrade() -> None:
          op.drop_column('users', 'phone')
          
   4. Aplica a migração no banco de dados local ou CI/CD:
      $ alembic upgrade head
```

* **A Tabela `alembic_version`:** O banco de dados mantém uma tabela interna contendo o identificador da migração atual (`version_num: 'a1b2c3d4'`). O Alembic sabe exatamente quais scripts já foram executados e quais estão pendentes.

---

## Boas Práticas: Migrações em Produção com Zero Downtime

Adicionar ou alterar colunas em tabelas de produção com milhões de registros pode travar o banco (*Table Lock*) e derrubar a aplicação inteira.

```text
   CENÁRIO PERIGOSO: Adicionar coluna NOT NULL com valor default em tabela de 50M de linhas:
   ALTER TABLE orders ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';
   ► EFEITO: O PostgreSQL reescreve a tabela inteira em disco, retendo um ACCESS EXCLUSIVE LOCK.
   ► CONSEQUÊNCIA: Todas as leituras e escritas da API travam. Timeout global no sistema!
```

### O Padrão de 3 Etapas para Migrações Seguras (Expand & Contract):
1. **Fase 1 (Expand):** Adicione a coluna permitindo valores nulos (`nullable=True`), sem lock pesado:
   `ALTER TABLE orders ADD COLUMN status VARCHAR(20) NULL;`
2. **Fase 2 (Backfill):** Popule os registros antigos em lotes pequenos em background (ex: 5.000 linhas por vez), sem sobrecarregar a CPU:
   `UPDATE orders SET status = 'pending' WHERE status IS NULL LIMIT 5000;`
3. **Fase 3 (Contract):** Adicione a restrição `NOT NULL` após todos os dados estarem preenchidos:
   `ALTER TABLE orders ALTER COLUMN status SET NOT NULL;`

---

API: Mapeamento Objeto-Relacional (ORM)
## Implementação de Produção com SQLAlchemy 2.0 Moderno & FastAPI

---

## Arquitetura de Conexão e Sessão Assíncrona

Estruturação idiomática do gerenciador de banco de dados com suporte assíncrono nativo (`asyncpg` / `aiosqlite`):

```python
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "postgresql+asyncpg://postgres:secret@localhost:5432/taskflow_db"

# Engine com Connection Pool configurado
engine = create_async_engine(
    DATABASE_URL,
    echo=False,                # Ativar apenas em dev para inspecionar SQL
    pool_size=10,              # Conexões ativas permanentes
    max_overflow=20,           # Conexões extras sob pico de tráfego
    pool_timeout=30,           # Tempo máximo de espera por conexão livre
    pool_pre_ping=True         # Checa se a conexão socket está viva antes de usar
)

# Fábrica de Sessões Assíncronas
async_session_factory = async_sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
    class_=AsyncSession
)

# Injeção de Dependência no FastAPI
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

---

## Padrão Repository & Service com FastAPI

Isolando consultas SQL complexas da camada de controle HTTP:

```python
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id_with_orders(self, user_id: UUID) -> User | None:
        stmt = (
            select(User)
            .where(User.id == user_id)
            .options(selectinload(User.orders))  # Eager Loading para evitar N+1!
        )
        return await self.session.scalar(stmt)

    async def create(self, name: str, email: str) -> User:
        user = User(name=name, email=email)
        self.session.add(user)
        await self.session.flush()  # Gera user.id sem comitar a transação global
        return user

@app.get("/api/v1/users/{user_id}", response_model=UserResponse)
async def read_user(user_id: UUID, db: AsyncSession = Depends(get_db_session)):
    repo = UserRepository(db)
    user = await repo.get_by_id_with_orders(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return user
```

---

API: Mapeamento Objeto-Relacional (ORM)
## Connection Pooling, Profiling e Antipatterns de Performance

---

## Dimensionamento do Pool de Conexões (Connection Pooling)

Abrir uma conexão TCP com um banco de dados relacional exige handshake de rede, autenticação criptográfica e alocação de memória no servidor. O **Pool de Conexões** mantém sockets reutilizáveis:

```text
                               O POOL DE CONEXÕES EM PRODUÇÃO
   Requisições HTTP Entrantes (50 RPS)
        │
        ├──► [Req 1] ──► Pega Conexão #1 do Pool (Disponível) ──► Executa SQL ──► Devolve ao Pool
        ├──► [Req 2] ──► Pega Conexão #2 do Pool (Disponível) ──► Executa SQL ──► Devolve ao Pool
        └──► [Req 3] ──► Pool cheio! Aguarda na fila por até `pool_timeout=30s`.
```

### A Fórmula Clássica de Dimensionamento (HikariCP / PostgreSQL):
Mais conexões não significam mais velocidade! Conexões excessivas causam sobrecarga de troca de contexto de CPU (*Context Switching*) e contenção de disco no SGBD:

$$\text{Tamanho do Pool} = (\text{Qtd. de Núcleos de CPU} \times 2) + \text{Qtd. de Discos Efetivos}$$

* Em um servidor com 4 núcleos de CPU e disco SSD rápido:
  $$\text{Pool} = (4 \times 2) + 1 = 9 \text{ a } 12 \text{ conexões!}$$

---

## Os 4 Antipatterns Clássicos com ORMs

```text
  1. HYDRATION OVERHEAD (Sobrecarga de Hidratação)
     Fazer `select(User).all()` para uma tabela de 50.000 linhas instancia 50.000 objetos Python
     em memória, rastreados pelo UoW, consumindo centenas de megabytes de RAM!
     ► SOLUÇÃO: Use projeções de colunas com tuplas: `select(User.id, User.name)` ou paginação!

  2. LOOP INSERTS EM VEZ DE BATCH INSERTS
     for item in 10000_items:
         session.add(item)
         session.commit()  # CATASTRÓFICO! 10.000 transações de rede individuais!
     ► SOLUÇÃO: Use `session.add_all(itens)` ou `insert(Model).values([...])` em batch único!

  3. BUSCA DE DADO DENTRO DO LOOP DE SERIALIZAÇÃO
     Serializadores ingênuos (como Marshmallow ou Pydantic sem prefetch) acessam propriedades
     relacionadas em loop, disparando o problema N+1 silenciosamente dentro da camada HTTP.

  4. VAZAMENTO DE CONEXÃO (Connection Leak)
     Esquecer de fechar a sessão em caso de erro, retendo a conexão do pool indefinidamente
     até que todas as threads travem com `TimeoutError: QueuePool limit of size 10 overflow 20 reached`.
```

---

API: Mapeamento Objeto-Relacional (ORM)
## Síntese Arquitetural, Checklist de Persistência e Conclusão

---

## Árvore de Decisão de Persistência em APIs

Ao desenhar a camada de dados de um novo serviço, utilize esta árvore de decisão arquitetural:

```text
                             QUAL ESTRATÉGIA DE PERSISTÊNCIA ADOTAR?
                                                │
                          A lógica de negócio tem regras ricas de domínio
                          e entidades altamente interconectadas (OLTP)?
                                       /                 \
                                   [SIM]                 [NÃO]
                                    /                       \
                      Equipe prefere tipagem rígida,         É uma API simples de CRUD ou
                      DDD e desacoplamento de infra?         microserviço focado em leitura?
                              /             \                           /             \
                          [SIM]             [NÃO]                   [SIM]             [NÃO]
                           /                   \                     /                   \
                  DATA MAPPER             ACTIVE RECORD         QUERY BUILDER         RAW SQL
              (SQLAlchemy 2.0,           (Django ORM,          (Knex.js,             (Analytics,
               Hibernate/JPA)             Prisma ORM)           SQLAlchemy Core)      Relatórios massivos,
                                                                                      ETL de Big Data)
```

---

## Checklist de Persistência & ORM para Produção

Antes de colocar qualquer API com ORM em ambiente produtivo, audite:

* [ ] **Prevenção de N+1:** Todas as rotas que retornam entidades com relacionamentos utilizam `selectinload` ou `joinedload`.
* [ ] **Chaves Primárias:** Modelagem com UUIDv7 ou BigInt sequencial; evitado UUIDv4 como PK clusterizada em tabelas de alto volume.
* [ ] **Projeção em Relatórios:** Consultas de listagem massiva buscam apenas colunas necessárias em vez de hidratar entidades completas.
* [ ] **Paginação Obrigatória:** Nenhum endpoint executa `.all()` em tabelas ilimitadas sem cláusulas `LIMIT` e `OFFSET` ou cursor-based.
* [ ] **Migrações Automatizadas:** Toda alteração de schema é controlada via Alembic/Prisma com scripts reversíveis (`upgrade` e `downgrade`).
* [ ] **Zero-Downtime:** Colunas novas criadas inicialmente como `nullable=True` ou com defaults seguros sem lock exclusivo de tabela.
* [ ] **Connection Pool Ajustado:** `pool_size`, `max_overflow` e `pool_pre_ping=True` configurados conforme os núcleos do banco.
* [ ] **Concorrência Protegida:** Operações críticas de saldo/estoque utilizam *Optimistic Locking* (coluna `version`) ou `SELECT FOR UPDATE`.
* [ ] **Lifecycle Transacional:** Injeção de dependência garantindo `session.commit()` em caso de sucesso e `session.rollback()` sob exceção.
* [ ] **Logs de SQL em Dev:** Profiler de consultas ativado em ambiente de teste para auditoria de quantidade de queries executadas por requisição.

---

## Referências Bibliográficas e Leituras Recomendadas

### Obras Fundamentais:
* **FOWLER, Martin.** *Patterns of Enterprise Application Architecture (P of EAA).* Addison-Wesley Professional, 2002.
* **MIHALCEA, Vlad.** *High-Performance Java Persistence.* 1ª ed., 2016. (Leitura definitiva sobre internals de ORMs, transações, caching e N+1).
* **WINAND, Markus.** *SQL Performance Explained.* 1ª ed., 2012. (A bíblia de indexação e funcionamento do B-Tree).
* **KLEPPMANN, Martin.** *Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems.* O'Reilly Media, 2017.

### Especificações & Documentação Oficial:
* **SQLAlchemy 2.0 Documentation:** *Unified Tutorial & ORM Mapped Declarative Guide.*
* **PostgreSQL Global Development Group:** *Concurrency Control & MVCC Internals.*
* **Alembic Documentation:** *Auto-Generating Migrations & Offline Scripts.*
* **HikariCP Engineering Paper:** *About Pool Sizing (Down the Rabbit Hole).*

---

# Programação Web :mortar_board:
## Eduardo Cruz Araujo
### Fatec Ribeirão Preto - SP | 2026.2
### Dúvidas, Discussão Técnica & Prática nos Simuladores!
