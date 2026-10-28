# 📋 Folha de Cola do Professor: Prompts para Execução ao Vivo no Google Antigravity

Use esta folha de referência rápida durante a aula para copiar e colar os prompts no chat do **Google Antigravity** em cada uma das fases do **Spec-Driven Development (SDD)**.

---

## 🔹 Fase 3: Gerando o `PLAN.md` com a Persona `[Tech Lead]`

> **Pré-condição:** Arquivos `STYLEGUIDE.md`, `AGENTS.md`, `SPEC.md` e `TakFlow API.Apidog.json` criados na pasta do projeto.

### Prompt 1 — Planejamento Arquitetural (`[Tech Lead]`)
```text
Atuando como [Tech Lead], leia o @SPEC.md, o @"TakFlow API.Apidog.json" e nosso @STYLEGUIDE.md. Crie um arquivo chamado PLAN.md contendo um checklist sequencial e granular das tarefas técnicas necessárias para implementar esta API.

Não escreva código ainda, apenas detalhe os passos de arquitetura, configuração, geração de tipos Pydantic v2 a partir dos schemas do Apidog, camada de persistência, tratamento de erros RFC 9457, implementação das rotas e testes automatizados.
```

### Prompt Alternativo (Usando Slash Command `/grill-me` antes do Plano)
```text
/grill-me Atuando como [Tech Lead], leia o @SPEC.md, @"TakFlow API.Apidog.json" e @STYLEGUIDE.md. Antes de gerar o PLAN.md, faça até 3 perguntas objetivas sobre casos de borda ou decisões arquiteturais para alinharmos o plano.
```

---

## 🔹 Fase 4: Tasks & Implement com `[Backend Coder]` e `[QA Engineer]`

> **Pré-condição:** O professor revisou o `PLAN.md` gerado na tela com os alunos.

### Prompt 2 — Execução das Fases 1 e 2 (Estrutura + Tipagens do Apidog)
```text
Atuando como [Backend Coder], inicie a execução da Fase 1 e Fase 2 descritas no @PLAN.md (criação da estrutura de diretórios, requirements.txt e extração completa dos modelos Pydantic v2 em src/api/schemas.py).

Certifique-se de seguir estritamente as regras de arquitetura do @STYLEGUIDE.md e as tipagens do @"TakFlow API.Apidog.json". Marque os itens concluídos no @PLAN.md e avise quando terminar para podermos revisar e avançar para o próximo passo.
```

### Prompt 3 — Execução da Fase 3 (Exceções RFC 9457 + Banco em Memória com Seed)
```text
As tipagens em schemas.py foram revisadas e aprovadas! Agora, atuando como [Backend Coder], execute a Fase 3 do @PLAN.md (implementação de src/api/exceptions.py no padrão RFC 9457 e src/api/database.py com seed inicial e operações CRUD thread-safe).

Atualize os checkboxes correspondentes no @PLAN.md e aguarde nossa revisão.
```

### Prompt 4 — Execução da Fase 4 (Routers HTTP `/tasks` e `/projects` + `main.py`)
```text
Camada de dados e exceções revisadas e aprovadas! Atuando como [Backend Coder], execute a Fase 4 do @PLAN.md implementando src/api/routers/tasks.py, src/api/routers/projects.py e src/api/main.py.

Certifique-se de incluir o cabeçalho Location no POST /api/v1/tasks, retorno 204 no DELETE, middleware para JSON malformado (400 RFC 9457) e a Expectation de 404 para o UUID 00000000-0000-0000-0000-000000000000. Atualize o @PLAN.md ao concluir.
```

### Prompt 5 — Execução da Fase 5 (Testes de Contrato com `[QA Engineer]`)
```text
Atuando como [QA Engineer], execute a Fase 5 do @PLAN.md. Crie a suíte de testes automatizados em src/api/tests/ (conftest.py, test_tasks.py, test_projects.py, test_errors.py) validando todos os contratos, paginação, filtros, Expectations e erros RFC 9457 do @"TakFlow API.Apidog.json".

Em seguida, execute o pytest no terminal para comprovar 100% de aprovação e marque todos os itens restantes do @PLAN.md como concluídos!
```

---

## 🔹 Bônus: Evolução Iterativa Spec-Driven em Sala (Mudança de Requisito)

### Prompt 6 — Planejando e Implementando uma Nova Funcionalidade via SDD
```text
Atuando como [Tech Lead], queremos evoluir a API adicionando o endpoint POST /api/v1/tasks/{id}/complete que altera o status da tarefa diretamente para DONE (ou retorna 409 Conflict no formato RFC 9457 caso a tarefa esteja BLOCKED).

1. Atualize o @SPEC.md documentando esta regra na seção de Tasks.
2. Adicione a "Fase 6: Conclusão Rápida de Tarefa" no final do @PLAN.md detalhando os passos necessários. Não altere o código em src/ ainda!
```
*(Após revisar o `PLAN.md` atualizado com a turma, envie:)*
```text
Plano da Fase 6 aprovado! Atuando como [Backend Coder] e em seguida como [QA Engineer], implemente a Fase 6 do @PLAN.md e execute o pytest para garantir que os testes novos e antigos passem com 100% de sucesso.
```
