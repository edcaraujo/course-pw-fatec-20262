/**
 * Programação Web - Fatec 2026.2
 * Aula 10: Spec-Driven Development (SDD) & Google Antigravity
 * Script do Apresentador Interativo & Simuladores SDD
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. MOTOR DE SLIDES & NAVEGAÇÃO
  // ==========================================
  const slides = document.querySelectorAll('.slide');
  const slideCounter = document.getElementById('slide-counter');
  const progressBar = document.getElementById('progress-bar');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnOverview = document.getElementById('btn-overview');
  const btnNotes = document.getElementById('btn-notes');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const modalBackdrop = document.getElementById('overview-modal');
  const modalClose = document.getElementById('modal-close');
  const tocGrid = document.getElementById('toc-grid');

  let currentSlide = 0;
  const totalSlides = slides.length;

  function updateSlides() {
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentSlide);
    });

    if (slideCounter) {
      slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;
    }

    if (progressBar) {
      const pct = (currentSlide / (totalSlides - 1)) * 100;
      progressBar.style.width = `${pct}%`;
    }

    if (btnPrev) btnPrev.disabled = currentSlide === 0;
    if (btnNext) btnNext.disabled = currentSlide === totalSlides - 1;
  }

  function nextSlide() {
    if (currentSlide < totalSlides - 1) {
      currentSlide++;
      updateSlides();
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      currentSlide--;
      updateSlides();
    }
  }

  function goToSlide(idx) {
    if (idx >= 0 && idx < totalSlides) {
      currentSlide = idx;
      updateSlides();
      closeOverviewModal();
    }
  }

  function togglePresenterNotes() {
    document.body.classList.toggle('show-notes');
    if (btnNotes) btnNotes.classList.toggle('active', document.body.classList.contains('show-notes'));
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  function openOverviewModal() {
    if (modalBackdrop) modalBackdrop.classList.add('show');
  }

  function closeOverviewModal() {
    if (modalBackdrop) modalBackdrop.classList.remove('show');
  }

  function populateTOC() {
    if (!tocGrid) return;
    tocGrid.innerHTML = '';
    slides.forEach((slide, idx) => {
      const titleElem = slide.querySelector('.slide-title') || slide.querySelector('.cover-title');
      const title = titleElem ? titleElem.textContent.trim() : `Slide ${idx + 1}`;

      const item = document.createElement('div');
      item.className = 'toc-item';
      item.innerHTML = `
        <span class="toc-index">#${(idx + 1).toString().padStart(2, '0')}</span>
        <span class="toc-text">${title}</span>
      `;
      item.addEventListener('click', () => goToSlide(idx));
      tocGrid.appendChild(item);
    });
  }

  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      return;
    }

    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      if (modalBackdrop && modalBackdrop.classList.contains('show')) {
        closeOverviewModal();
      } else {
        openOverviewModal();
      }
    } else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      togglePresenterNotes();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'Escape') {
      closeOverviewModal();
    }
  });

  if (btnPrev) btnPrev.addEventListener('click', prevSlide);
  if (btnNext) btnNext.addEventListener('click', nextSlide);
  if (btnNotes) btnNotes.addEventListener('click', togglePresenterNotes);
  if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);
  if (btnOverview) btnOverview.addEventListener('click', openOverviewModal);
  if (modalClose) modalClose.addEventListener('click', closeOverviewModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeOverviewModal();
    });
  }

  populateTOC();
  updateSlides();

  function showToast(text, type = 'info') {
    const container = document.getElementById('toast-container') || document.body;
    const toast = document.createElement('div');
    toast.className = 'toast';
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '🚨';
    if (type === 'warning') icon = '⚠️';
    toast.innerHTML = `<span>${icon}</span> <span>${text}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ==========================================
  // 2. SIMULADOR 1: VIBE CODING VS SDD
  // ==========================================
  const sim1Mode = document.getElementById('sim1-mode');
  const sim1Iterations = document.getElementById('sim1-iterations');
  const btnRunSim1 = document.getElementById('btn-run-sim1');
  const sim1Timeline = document.getElementById('sim1-timeline');
  const sim1Fidelity = document.getElementById('sim1-fidelity');
  const sim1Rework = document.getElementById('sim1-rework');
  const sddSimBadge = document.getElementById('sdd-sim-badge');

  function runSim1() {
    if (!sim1Timeline) return;
    sim1Timeline.innerHTML = '';
    const mode = sim1Mode ? sim1Mode.value : 'sdd';
    const count = parseInt(sim1Iterations ? sim1Iterations.value : '6', 10);

    const vibeEvents = [
      { step: 'Turno 1: "Cria CRUD de Tasks"', status: 'OK inicial, mas sem RFC 9457', color: 'amber', pct: 80 },
      { step: 'Turno 2: "Adiciona paginação aí"', status: 'Quebrou formato de resposta (sem meta)', color: 'rose', pct: 65 },
      { step: 'Turno 3: "Arruma o bug do filtro"', status: 'Injetou lógica direto na rota HTTP', color: 'rose', pct: 55 },
      { step: 'Turno 4: "Cria rotas de Projects"', status: 'Usou snake_case (due_date) em vez de camelCase', color: 'rose', pct: 45 },
      { step: 'Turno 5: "Coloca erro padrão"', status: 'Ignorou invalidParams da RFC 9457', color: 'rose', pct: 38 },
      { step: 'Turno 6: "Faz rota projects/{id}/tasks"', status: 'Import circular entre main.py e tasks.py!', color: 'rose', pct: 32 },
      { step: 'Turno 7: "Conserta o ImportError"', status: 'Apagou validação de UUID sem avisar', color: 'rose', pct: 28 },
      { step: 'Turno 8: "Roda teste no UUID zerado"', status: 'Retornou 500 Internal Server Error em vez de 404', color: 'rose', pct: 25 },
      { step: 'Turno 9: "Arruma o 500"', status: 'Context Rot: Janela de contexto saturada', color: 'rose', pct: 22 },
      { step: 'Turno 10: "Refatora tudo"', status: 'Colapso Arquitetural: 62% de retrabalho', color: 'rose', pct: 20 }
    ];

    const sddEvents = [
      { step: 'Fase 1 (Constitution): AGENTS.md + STYLEGUIDE.md', status: 'Regras e Personas ativas no Antigravity', color: 'emerald', pct: 100 },
      { step: 'Fase 2 (Specify): TakFlow API.Apidog.json + SPEC.md', status: 'Contrato OpenAPI 3.0 ancorado', color: 'emerald', pct: 100 },
      { step: 'Fase 3 (Plan): [Tech Lead] gera PLAN.md', status: 'Ordem topológica revisada pelo humano', color: 'cyan', pct: 100 },
      { step: 'Task 2.1: [Backend Coder] gera schemas.py', status: '100% fiel aos Data Schemas do Apidog', color: 'emerald', pct: 100 },
      { step: 'Task 3.1: [Backend Coder] gera exceptions.py', status: 'RFC 9457 (Problem Details) garantida', color: 'emerald', pct: 100 },
      { step: 'Task 3.2: [Backend Coder] gera database.py', status: 'Repositório Thread-Safe + Seed Apidog', color: 'emerald', pct: 100 },
      { step: 'Task 4.1: [Backend Coder] gera routers/tasks.py', status: 'Header Location no 201 e 204 no DELETE', color: 'emerald', pct: 100 },
      { step: 'Task 4.2: [Backend Coder] gera routers/projects.py', status: 'Sub-recurso /projects/{id}/tasks validado', color: 'emerald', pct: 100 },
      { step: 'Task 5.1: [QA Engineer] executa pytest -v', status: '19/19 testes aprovados de primeira!', color: 'emerald', pct: 100 },
      { step: 'Evolução v1.1: Atualiza SPEC.md -> PLAN.md', status: 'Zero regressão de contrato!', color: 'emerald', pct: 100 }
    ];

    const events = (mode === 'vibe' ? vibeEvents : sddEvents).slice(0, count);

    events.forEach((ev) => {
      const row = document.createElement('div');
      row.className = 'waterfall-row';
      let colorVar = 'var(--accent-emerald)';
      if (ev.color === 'rose') colorVar = 'var(--accent-rose)';
      if (ev.color === 'amber') colorVar = 'var(--accent-amber)';
      if (ev.color === 'cyan') colorVar = 'var(--accent-cyan)';

      row.innerHTML = `
        <div>
          <div style="color: #fff; font-weight: 600;">${ev.step}</div>
          <div style="color: ${colorVar}; font-size: 0.74rem;">${ev.status}</div>
        </div>
        <div class="waterfall-bar-wrap">
          <div class="waterfall-bar" style="background: ${colorVar}; width: ${ev.pct}%;"></div>
        </div>
      `;
      sim1Timeline.appendChild(row);
    });

    if (mode === 'vibe') {
      const lastPct = events[events.length - 1].pct;
      if (sim1Fidelity) {
        sim1Fidelity.textContent = `${lastPct}%`;
        sim1Fidelity.style.color = 'var(--accent-rose)';
      }
      if (sim1Rework) {
        sim1Rework.textContent = `${count * 2 - 1} quebras`;
        sim1Rework.style.color = 'var(--accent-rose)';
      }
      if (sddSimBadge) {
        sddSimBadge.className = 'status-pill invalid';
        sddSimBadge.textContent = '🚨 Deriva Arquitetural Detectada (Vibe Coding)';
      }
      showToast('Vibe Coding gerou quebra de contrato com o Apidog!', 'error');
    } else {
      if (sim1Fidelity) {
        sim1Fidelity.textContent = '100%';
        sim1Fidelity.style.color = 'var(--accent-emerald)';
      }
      if (sim1Rework) {
        sim1Rework.textContent = '0 falhas';
        sim1Rework.style.color = 'var(--accent-emerald)';
      }
      if (sddSimBadge) {
        sddSimBadge.className = 'status-pill valid';
        sddSimBadge.textContent = '✅ Conformidade Estrita SDD (100% Determinístico)';
      }
      showToast('Fluxo SDD manteve 100% de conformidade com o Apidog!', 'success');
    }
  }

  if (btnRunSim1) {
    btnRunSim1.addEventListener('click', runSim1);
    runSim1();
  }

  // ==========================================
  // 3. SIMULADOR 2: EXTRATOR APIDOG -> PYDANTIC V2
  // ==========================================
  const sim2Select = document.getElementById('sim2-schema-select');
  const btnRunSim2 = document.getElementById('btn-run-sim2');
  const sim2Json = document.getElementById('sim2-apidog-json');
  const sim2Pydantic = document.getElementById('sim2-pydantic-code');

  const schemaCatalog = {
    Task: {
      json: `{
  "name": "Task",
  "id": "#/definitions/17551220",
  "schema": {
    "type": "object",
    "required": ["id", "title", "status", "priority", "createdAt", "updatedAt"],
    "properties": {
      "id": { "type": "string", "format": "uuid" },
      "title": { "type": "string", "minLength": 3, "maxLength": 100 },
      "description": { "type": "string", "maxLength": 500 },
      "status": {
        "type": "string",
        "enum": ["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]
      },
      "priority": {
        "type": "string",
        "enum": ["LOW", "MEDIUM", "HIGH"],
        "default": "MEDIUM"
      },
      "dueDate": { "type": "string", "format": "date-time" },
      "projectId": { "type": "string", "format": "uuid" }
    }
  }
}`,
      pydantic: `class TaskStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"
    BLOCKED = "BLOCKED"

class Task(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., description="UUID da tarefa")
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: TaskStatus = Field(...)
    priority: Priority = Field(default=Priority.MEDIUM)
    dueDate: Optional[datetime] = Field(None)
    projectId: Optional[str] = Field(None)
    createdAt: datetime = Field(...)
    updatedAt: datetime = Field(...)`
    },
    CreateProjectDTO: {
      json: `{
  "name": "CreateProjectDTO",
  "id": "#/definitions/17551224",
  "schema": {
    "type": "object",
    "required": ["name", "slug"],
    "properties": {
      "name": {
        "type": "string",
        "minLength": 3,
        "maxLength": 80,
        "examples": ["Portal do Aluno"]
      },
      "slug": {
        "type": "string",
        "pattern": "^[a-z0-9-]+$",
        "examples": ["portal-do-aluno"]
      },
      "description": { "type": "string" },
      "status": {
        "type": "string",
        "enum": ["ACTIVE", "ARCHIVED", "ON_HOLD"],
        "default": "ACTIVE"
      }
    }
  }
}`,
      pydantic: `class ProjectStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"
    ON_HOLD = "ON_HOLD"

class CreateProjectDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(..., min_length=3, max_length=80, examples=["Portal do Aluno"])
    slug: str = Field(
        ...,
        pattern=r"^[a-z0-9-]+$",
        description="Slug validado conforme regex do Apidog",
        examples=["portal-do-aluno"]
    )
    description: Optional[str] = Field(None)
    status: Optional[ProjectStatus] = Field(default=ProjectStatus.ACTIVE)`
    },
    ApiError: {
      json: `{
  "name": "Error",
  "id": "#/definitions/17551226",
  "description": "RFC 9457 / RFC 7807 (Problem Details)",
  "schema": {
    "type": "object",
    "required": ["type", "title", "status", "detail", "instance"],
    "properties": {
      "type": { "type": "string", "format": "uri" },
      "title": { "type": "string" },
      "status": { "type": "integer" },
      "detail": { "type": "string" },
      "instance": { "type": "string" },
      "invalidParams": {
        "type": "array",
        "items": {
          "properties": {
            "name": { "type": "string" },
            "reason": { "type": "string" }
          }
        }
      }
    }
  }
}`,
      pydantic: `class InvalidParam(BaseModel):
    name: str = Field(..., examples=["title"])
    reason: str = Field(..., examples=["Tamanho inferior a 3 caracteres"])

class ApiError(BaseModel):
    """Padronização RFC 9457 exigida pelo STYLEGUIDE.md e Apidog."""
    type: str = Field(..., examples=["https://api.taskflow.dev/errors/validation-error"])
    title: str = Field(..., examples=["Erro de Validação Semântica"])
    status: int = Field(..., examples=[422])
    detail: str = Field(...)
    instance: str = Field(..., examples=["/api/v1/tasks"])
    invalidParams: Optional[List[InvalidParam]] = Field(default=None)`
    },
    PaginatedTasksResponse: {
      json: `{
  "name": "PaginatedTasksResponse",
  "id": "#/definitions/17551225",
  "schema": {
    "type": "object",
    "required": ["data", "meta"],
    "properties": {
      "data": {
        "type": "array",
        "items": { "$ref": "#/definitions/17551220" }
      },
      "meta": {
        "type": "object",
        "required": ["page", "limit", "totalItems", "totalPages", "hasNext"],
        "properties": {
          "page": { "type": "integer" },
          "limit": { "type": "integer" },
          "totalItems": { "type": "integer" },
          "totalPages": { "type": "integer" },
          "hasNext": { "type": "boolean" }
        }
      }
    }
  }
}`,
      pydantic: `class Meta(BaseModel):
    page: int = Field(..., examples=[1])
    limit: int = Field(..., examples=[10])
    totalItems: int = Field(..., examples=[42])
    totalPages: int = Field(..., examples=[5])
    hasNext: bool = Field(..., examples=[True])

class PaginatedTasksResponse(BaseModel):
    data: List[Task] = Field(..., description="Lista de tarefas da página")
    meta: Meta = Field(..., description="Metadados de paginação")`
    }
  };

  function updateSim2() {
    if (!sim2Select) return;
    const key = sim2Select.value;
    const item = schemaCatalog[key];
    if (item && sim2Json && sim2Pydantic) {
      sim2Json.value = item.json;
      sim2Pydantic.value = item.pydantic;
    }
  }

  if (sim2Select) sim2Select.addEventListener('change', updateSim2);
  if (btnRunSim2) {
    btnRunSim2.addEventListener('click', () => {
      updateSim2();
      showToast(`Schema '${sim2Select.value}' extraído com precisão para Pydantic v2!`, 'success');
    });
  }
  updateSim2();

  // ==========================================
  // 4. SIMULADOR 3: CICLO AGÊNTICO NO ANTIGRAVITY
  // ==========================================
  const btnSim3Next = document.getElementById('btn-sim3-next');
  const btnSim3Reset = document.getElementById('btn-sim3-reset');
  const sim3PlanView = document.getElementById('sim3-plan-view');
  const sim3AgentLog = document.getElementById('sim3-agent-log');
  const sim3StatusPill = document.getElementById('sim3-status-pill');

  let sim3Stage = 0;

  const sim3StagesData = [
    {
      pillClass: 'status-pill warning',
      pillText: 'Fase 3: [Tech Lead] gerou PLAN.md (Aguardando Revisão Humana)',
      plan: `# PLAN.md — TaskFlow API (Gerado por [Tech Lead])
- [ ] Passo 1.1: Criar estrutura src/api/ e requirements.txt
- [ ] Passo 2.1: Extrair schemas Pydantic v2 de TakFlow API.Apidog.json
- [ ] Passo 3.1: Implementar exceptions.py (RFC 9457 Problem Details)
- [ ] Passo 3.2: Implementar database.py (Thread-Safe + Seed Apidog)
- [ ] Passo 4.1: Implementar routers/tasks.py (CRUD + Location + 204)
- [ ] Passo 4.2: Implementar routers/projects.py + main.py
- [ ] Passo 5.1: Criar e rodar suíte pytest (19 testes de contrato)`,
      log: `[Antigravity System] Carregado automaticamente: AGENTS.md (Raiz do Workspace)
[User Prompt] Atuando como [Tech Lead], leia @SPEC.md, @"TakFlow API.Apidog.json" e @STYLEGUIDE.md. Crie o PLAN.md sem escrever código.
[Tech Lead] Analisando 9 endpoints e 7 Data Schemas no Apidog...
[Tech Lead] Arquivo PLAN.md criado com 7 passos em ordem topológica.
[Human-in-the-Loop] Plano auditado e aprovado pelo professor!`
    },
    {
      pillClass: 'status-pill valid',
      pillText: 'Fase 4 (Lote 1): [Backend Coder] concluiu Passos 1.1 a 3.2',
      plan: `# PLAN.md — TaskFlow API
- [x] Passo 1.1: Criar estrutura src/api/ e requirements.txt
- [x] Passo 2.1: Extrair schemas Pydantic v2 de TakFlow API.Apidog.json
- [x] Passo 3.1: Implementar exceptions.py (RFC 9457 Problem Details)
- [x] Passo 3.2: Implementar database.py (Thread-Safe + Seed Apidog)
- [ ] Passo 4.1: Implementar routers/tasks.py (CRUD + Location + 204)
- [ ] Passo 4.2: Implementar routers/projects.py + main.py
- [ ] Passo 5.1: Criar e rodar suíte pytest (19 testes de contrato)`,
      log: `[User Prompt] Atuando como [Backend Coder], execute as Fases 1, 2 e 3 do @PLAN.md.
[Backend Coder] Criando src/api/schemas.py com Task, Project, ApiError (RFC 9457)...
[Backend Coder] Criando src/api/exceptions.py e src/api/database.py...
[Backend Coder] Checkboxes 1.1, 2.1, 3.1 e 3.2 marcados como [x] no PLAN.md.
[Backend Coder] Pausando execução para revisão humana no Visual Diff Overlay.`
    },
    {
      pillClass: 'status-pill valid',
      pillText: 'Fase 4 (Lote 2): [Backend Coder] concluiu Routers e main.py',
      plan: `# PLAN.md — TaskFlow API
- [x] Passo 1.1: Criar estrutura src/api/ e requirements.txt
- [x] Passo 2.1: Extrair schemas Pydantic v2 de TakFlow API.Apidog.json
- [x] Passo 3.1: Implementar exceptions.py (RFC 9457 Problem Details)
- [x] Passo 3.2: Implementar database.py (Thread-Safe + Seed Apidog)
- [x] Passo 4.1: Implementar routers/tasks.py (CRUD + Location + 204)
- [x] Passo 4.2: Implementar routers/projects.py + main.py
- [ ] Passo 5.1: Criar e rodar suíte pytest (19 testes de contrato)`,
      log: `[User Prompt] Diffs aprovados! Atuando como [Backend Coder], execute a Fase 4 do @PLAN.md.
[Backend Coder] Implementando src/api/routers/tasks.py (POST 201 c/ header Location, DELETE 204, UUID zerado -> 404 RFC 9457)...
[Backend Coder] Implementando src/api/routers/projects.py (incluindo GET /projects/{projectId}/tasks)...
[Backend Coder] Configurando src/api/main.py com middleware de JSON malformado (400).`
    },
    {
      pillClass: 'status-pill valid',
      pillText: '✅ Ciclo SDD 100% Concluído e Verificado pelo [QA Engineer]!',
      plan: `# PLAN.md — TaskFlow API (100% CONCLUÍDO)
- [x] Passo 1.1: Criar estrutura src/api/ e requirements.txt
- [x] Passo 2.1: Extrair schemas Pydantic v2 de TakFlow API.Apidog.json
- [x] Passo 3.1: Implementar exceptions.py (RFC 9457 Problem Details)
- [x] Passo 3.2: Implementar database.py (Thread-Safe + Seed Apidog)
- [x] Passo 4.1: Implementar routers/tasks.py (CRUD + Location + 204)
- [x] Passo 4.2: Implementar routers/projects.py + main.py
- [x] Passo 5.1: Criar e rodar suíte pytest (19 testes de contrato)`,
      log: `[User Prompt] Atuando como [QA Engineer], execute o Passo 5.1 do @PLAN.md e rode o pytest.
[QA Engineer] Executando: pytest src/api/tests -v
test_errors.py::test_malformed_json_returns_400_rfc9457 PASSED
test_tasks.py::test_create_task_returns_201_and_location PASSED
test_tasks.py::test_get_task_apidog_zero_uuid_404 PASSED
test_projects.py::test_get_project_tasks_hierarchy PASSED
================ 19 passed in 0.38s ================`
    }
  ];

  function renderSim3() {
    const data = sim3StagesData[sim3Stage];
    if (sim3PlanView) sim3PlanView.value = data.plan;
    if (sim3AgentLog) sim3AgentLog.value = data.log;
    if (sim3StatusPill) {
      sim3StatusPill.className = data.pillClass;
      sim3StatusPill.textContent = data.pillText;
    }

    for (let i = 1; i <= 4; i++) {
      const card = document.getElementById(`step-card-${i}`);
      if (!card) continue;
      card.classList.remove('active', 'done');
      if (i - 1 < sim3Stage) {
        card.classList.add('done');
      } else if (i - 1 === sim3Stage) {
        card.classList.add('active');
      }
    }
  }

  if (btnSim3Next) {
    btnSim3Next.addEventListener('click', () => {
      if (sim3Stage < sim3StagesData.length - 1) {
        sim3Stage++;
        renderSim3();
        showToast(`Etapa ${sim3Stage + 1}/4 executada no Google Antigravity!`, 'success');
      } else {
        showToast('Todas as fases do PLAN.md já foram concluídas e testadas!', 'info');
      }
    });
  }

  if (btnSim3Reset) {
    btnSim3Reset.addEventListener('click', () => {
      sim3Stage = 0;
      renderSim3();
      showToast('Ciclo SDD reiniciado para a Fase 3 ([Tech Lead]).', 'warning');
    });
  }

  renderSim3();
});
