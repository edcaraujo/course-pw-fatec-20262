// Interactive Slide Deck Application Logic for API: Contextualização
document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnOverview = document.getElementById('btn-overview');
  const btnNotes = document.getElementById('btn-notes');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const slideCounter = document.getElementById('slide-counter');
  const progressBar = document.getElementById('progress-bar');
  const overviewModal = document.getElementById('overview-modal');
  const modalClose = document.getElementById('modal-close');
  const slideGridNav = document.getElementById('slide-grid-nav');
  const toastMsg = document.getElementById('toast-msg');

  let currentSlideIndex = 0;
  let presenterNotesVisible = false;

  // Initialize Slide Navigation Grid Modal
  slides.forEach((slide, idx) => {
    const titleEl = slide.querySelector('.slide-title') || slide.querySelector('.cover-title');
    const titleText = titleEl ? titleEl.textContent : (idx === 0 ? 'Capa da Apresentação' : `Slide ${idx + 1}`);
    const tagEl = slide.querySelector('.slide-tag');
    const tagText = tagEl ? tagEl.textContent : 'Tópico';

    const gridItem = document.createElement('div');
    gridItem.className = `grid-nav-item ${idx === 0 ? 'active' : ''}`;
    gridItem.innerHTML = `
      <div class="nav-item-num">SLIDE ${idx + 1} • ${tagText}</div>
      <div class="nav-item-title">${titleText}</div>
    `;
    gridItem.addEventListener('click', () => {
      goToSlide(idx);
      closeOverviewModal();
    });
    slideGridNav.appendChild(gridItem);
  });

  function updateSlides() {
    slides.forEach((slide, idx) => {
      if (idx === currentSlideIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update Counter & Progress
    slideCounter.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
    const progressPercent = ((currentSlideIndex + 1) / slides.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Update Grid Nav Highlights
    const navItems = slideGridNav.querySelectorAll('.grid-nav-item');
    navItems.forEach((item, idx) => {
      if (idx === currentSlideIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Button states
    btnPrev.disabled = currentSlideIndex === 0;
    btnNext.disabled = currentSlideIndex === slides.length - 1;
    btnPrev.style.opacity = currentSlideIndex === 0 ? '0.4' : '1';
    btnNext.style.opacity = currentSlideIndex === slides.length - 1 ? '0.4' : '1';
  }

  function goToSlide(index) {
    if (index >= 0 && index < slides.length) {
      currentSlideIndex = index;
      updateSlides();
    }
  }

  function nextSlide() {
    if (currentSlideIndex < slides.length - 1) {
      currentSlideIndex++;
      updateSlides();
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      updateSlides();
    }
  }

  function openOverviewModal() {
    overviewModal.classList.add('open');
  }

  function closeOverviewModal() {
    overviewModal.classList.remove('open');
  }

  function togglePresenterNotes() {
    presenterNotesVisible = !presenterNotesVisible;
    document.querySelectorAll('.presenter-notes-box').forEach(box => {
      box.style.display = presenterNotesVisible ? 'block' : 'none';
    });
    btnNotes.classList.toggle('active', presenterNotesVisible);
    showToast(presenterNotesVisible ? 'Notas do Apresentador Ativadas' : 'Notas do Apresentador Ocultas');
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        showToast('Não foi possível ativar tela cheia');
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  function showToast(text) {
    toastMsg.textContent = text;
    toastMsg.classList.add('show');
    setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 2500);
  }

  // Header Event Listeners
  btnPrev.addEventListener('click', prevSlide);
  btnNext.addEventListener('click', nextSlide);
  btnOverview.addEventListener('click', openOverviewModal);
  btnNotes.addEventListener('click', togglePresenterNotes);
  btnFullscreen.addEventListener('click', toggleFullscreen);
  modalClose.addEventListener('click', closeOverviewModal);

  overviewModal.addEventListener('click', (e) => {
    if (e.target === overviewModal) closeOverviewModal();
  });

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        prevSlide();
        break;
      case 'Home':
        goToSlide(0);
        break;
      case 'End':
        goToSlide(slides.length - 1);
        break;
      case 'm':
      case 'M':
        if (overviewModal.classList.contains('open')) {
          closeOverviewModal();
        } else {
          openOverviewModal();
        }
        break;
      case 'p':
      case 'P':
        togglePresenterNotes();
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'Escape':
        closeOverviewModal();
        break;
    }
  });

  // Copy-to-Clipboard Buttons
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const codeBlock = btn.closest('.code-block');
      const textToCopy = codeBlock ? codeBlock.querySelector('pre').textContent : '';
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('Conteúdo copiado com sucesso!');
        });
      }
    });
  });

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 1: REST URI Linter / Validator
  // -------------------------------------------------------------
  const uriInput = document.getElementById('uri-linter-input');
  const uriBtnCheck = document.getElementById('uri-linter-btn');
  const uriFeedback = document.getElementById('uri-linter-feedback');

  if (uriInput && uriBtnCheck && uriFeedback) {
    function evaluateUri() {
      const uri = (uriInput.value || '').trim();
      const issues = [];

      if (!uri.startsWith('/')) {
        issues.push('A URI deve começar com barra ("/"). Ex: "/api/v1/tasks".');
      }

      const verbRegex = /\b(get|post|create|delete|remove|update|find|fetch|list|add|patch|put)\b/i;
      if (verbRegex.test(uri)) {
        issues.push('Anti-padrão detectado: Contém verbo de ação na rota. No REST, a ação é definida pelo método HTTP (GET, POST, DELETE, etc.), e a URI identifica apenas substantivos.');
      }

      if (/[A-Z]/.test(uri)) {
        issues.push('Contém letras maiúsculas (CamelCase). Recomenda-se utilizar estritamente minúsculas para consistência universal.');
      }

      if (uri.includes('_')) {
        issues.push('Contém sublinhados ("_"). A convenção REST internacional preconiza o uso de hífens ("-") em kebab-case.');
      }

      const segments = uri.split('/').filter(Boolean);
      if (segments.length > 5) {
        issues.push('Excesso de aninhamento hierárquico (> 2 níveis de sub-recursos). Prefira rotas diretas com Query Parameters para filtros profundos.');
      }

      if (issues.length === 0) {
        uriFeedback.innerHTML = `
          <div style="padding: 12px; border-radius: 8px; background: rgba(52, 211, 153, 0.15); border: 1px solid #34d399; color: #34d399;">
            ✅ <strong>URI RESTful Excelente!</strong> A rota segue todas as boas práticas de substantivos, formatação minúscula, hífens e hierarquia controlada.
          </div>
        `;
      } else {
        uriFeedback.innerHTML = `
          <div style="padding: 12px; border-radius: 8px; background: rgba(244, 63, 94, 0.15); border: 1px solid #f43f5e; color: #f43f5e;">
            ⚠️ <strong>Pontos de melhoria identificados:</strong>
            <ul style="margin-left: 20px; margin-top: 8px;">
              ${issues.map(iss => `<li>${iss}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    }

    uriBtnCheck.addEventListener('click', evaluateUri);
    uriInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') evaluateUri();
    });
  }

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 2: HTTP Status Codes & Problem Details (RFC 9457 / RFC 7807) Explorer
  // -------------------------------------------------------------
  const statusSelect = document.getElementById('status-code-select');
  const statusBadge = document.getElementById('status-category-badge');
  const statusDesc = document.getElementById('status-description-text');
  const statusJsonPreview = document.getElementById('status-rfc7807-preview');

  const statusDatabase = {
    "200": {
      category: "2xx Sucesso",
      color: "#34d399",
      bg: "rgba(52, 211, 153, 0.2)",
      desc: "OK: Operação executada com êxito. Usado para requisições GET, PUT ou PATCH bem-sucedidas.",
      rfc: {
        id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        title: "Modelar Schemas OpenAPI",
        status: "DONE",
        priority: "HIGH"
      }
    },
    "201": {
      category: "2xx Sucesso",
      color: "#34d399",
      bg: "rgba(52, 211, 153, 0.2)",
      desc: "Created: Recurso criado com êxito. Deve acompanhar o cabeçalho 'Location: /api/v1/tasks/{id}'.",
      rfc: {
        id: "a4e82b71-12cd-4f56-89ab-cdef01234567",
        title: "Configurar pipeline de CI/CD",
        status: "TODO",
        createdAt: "2026-09-02T16:00:00Z"
      }
    },
    "204": {
      category: "2xx Sucesso",
      color: "#34d399",
      bg: "rgba(52, 211, 153, 0.2)",
      desc: "No Content: Ação executada com sucesso, mas o corpo da resposta deve ser estritamente vazio (típico de DELETE).",
      rfc: null
    },
    "400": {
      category: "4xx Erro do Cliente",
      color: "#f43f5e",
      bg: "rgba(244, 63, 94, 0.2)",
      desc: "Bad Request: Requisição sintaticamente incorreta (JSON malformado ou parâmetros obrigatórios ausentes).",
      rfc: {
        type: "https://api.taskflow.dev/errors/bad-request",
        title: "Sintaxe da Requisição Inválida",
        status: 400,
        detail: "O corpo da requisição não pôde ser interpretado como um JSON válido.",
        instance: "/api/v1/tasks"
      }
    },
    "401": {
      category: "4xx Erro do Cliente",
      color: "#f43f5e",
      bg: "rgba(244, 63, 94, 0.2)",
      desc: "Unauthorized: Autenticação necessária. Credenciais não enviadas ou token JWT expirado/inválido.",
      rfc: {
        type: "https://api.taskflow.dev/errors/unauthorized",
        title: "Não Autorizado",
        status: 401,
        detail: "O cabeçalho 'Authorization: Bearer <token>' é obrigatório para acessar este recurso.",
        instance: "/api/v1/tasks"
      }
    },
    "403": {
      category: "4xx Erro do Cliente",
      color: "#f43f5e",
      bg: "rgba(244, 63, 94, 0.2)",
      desc: "Forbidden: O cliente está autenticado, mas seu papel/permissão (RBAC) não autoriza a operação.",
      rfc: {
        type: "https://api.taskflow.dev/errors/forbidden",
        title: "Acesso Proibido",
        status: 403,
        detail: "Apenas administradores de projeto têm permissão para excluir tarefas da equipe.",
        instance: "/api/v1/tasks/123"
      }
    },
    "404": {
      category: "4xx Erro do Cliente",
      color: "#f43f5e",
      bg: "rgba(244, 63, 94, 0.2)",
      desc: "Not Found: O recurso solicitado não existe na base de dados para a URI informada.",
      rfc: {
        type: "https://api.taskflow.dev/errors/not-found",
        title: "Recurso Não Encontrado",
        status: 404,
        detail: "A tarefa com ID '00000000-0000-0000-0000-000000000000' não foi localizada no sistema.",
        instance: "/api/v1/tasks/00000000-0000-0000-0000-000000000000"
      }
    },
    "422": {
      category: "4xx Erro do Cliente",
      color: "#f43f5e",
      bg: "rgba(244, 63, 94, 0.2)",
      desc: "Unprocessable Entity: Sintaxe JSON correta, mas violação de validação semântica nos campos de dados.",
      rfc: {
        type: "https://api.taskflow.dev/errors/validation-failed",
        title: "Erro de Validação de Dados",
        status: 422,
        detail: "Foram encontrados erros nos campos enviados no corpo da requisição.",
        instance: "/api/v1/tasks",
        invalidParams: [
          { "name": "title", "reason": "O título deve possuir entre 3 e 100 caracteres." },
          { "name": "priority", "reason": "Valor inválido. Valores aceitos: LOW, MEDIUM, HIGH." }
        ]
      }
    },
    "500": {
      category: "5xx Erro do Servidor",
      color: "#fbbf24",
      bg: "rgba(251, 191, 36, 0.2)",
      desc: "Internal Server Error: Erro não tratado no servidor (exceção no banco ou falha no código de backend).",
      rfc: {
        type: "https://api.taskflow.dev/errors/internal-error",
        title: "Erro Interno do Servidor",
        status: 500,
        detail: "Ocorreu uma falha inesperada durante a execução. O incidente foi registrado com o ID #err-8821.",
        instance: "/api/v1/tasks"
      }
    }
  };

  if (statusSelect && statusBadge && statusDesc && statusJsonPreview) {
    function updateStatusExplorer() {
      const code = statusSelect.value;
      const data = statusDatabase[code] || statusDatabase["200"];

      statusBadge.textContent = data.category;
      statusBadge.style.color = data.color;
      statusBadge.style.backgroundColor = data.bg;
      statusBadge.style.border = `1px solid ${data.color}`;
      statusDesc.textContent = data.desc;

      if (data.rfc === null) {
        statusJsonPreview.textContent = "/* 204 No Content: O protocolo HTTP proíbe corpo de resposta nesta situação. */";
      } else {
        statusJsonPreview.textContent = JSON.stringify(data.rfc, null, 2);
      }
    }

    statusSelect.addEventListener('change', updateStatusExplorer);
    updateStatusExplorer();
  }

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 3: Síncrono vs Assíncrono Advisor
  // -------------------------------------------------------------
  const syncSelect = document.getElementById('sync-scenario-select');
  const syncFeedback = document.getElementById('sync-scenario-feedback');

  const syncDatabase = {
    "login": {
      model: "Síncrono (HTTP Request/Response)",
      color: "#34d399",
      icon: "⚡",
      explanation: "O usuário necessita de feedback imediato para saber se a senha está correta e para receber o token JWT de autorização antes de carregar o painel da aplicação."
    },
    "video": {
      model: "Assíncrono (Job Queue / Worker)",
      color: "#c084fc",
      icon: "⏳",
      explanation: "Renderizar vídeo 4K leva minutos ou horas. Manter uma conexão HTTP aberta causaria Timeout no browser ou gateway. Responde-se imediatamente '202 Accepted' e processa-se em background."
    },
    "payment": {
      model: "Assíncrono (Webhooks)",
      color: "#38bdf8",
      icon: "🔔",
      explanation: "O usuário paga o PIX no app do banco minutos depois. O gateway de pagamento emite um evento HTTP POST (Webhook) avisando seu servidor quando o valor for liquidado."
    },
    "chat": {
      model: "Assíncrono / Full-Duplex (WebSockets)",
      color: "#fbbf24",
      icon: "💬",
      explanation: "Manter requisições HTTP normais (polling) sobrecarrega a rede. Um canal WebSocket persistente permite que o servidor empurre mensagens para os clientes instantaneamente."
    },
    "task_details": {
      model: "Síncrono (HTTP GET)",
      color: "#34d399",
      icon: "🔍",
      explanation: "Uma consulta a uma tarefa individual via chave primária (UUID) no banco de dados leva poucos milissegundos (< 20ms), sendo perfeita para o ciclo síncrono padrão."
    }
  };

  if (syncSelect && syncFeedback) {
    function updateSyncAdvisor() {
      const val = syncSelect.value;
      const res = syncDatabase[val] || syncDatabase["login"];

      syncFeedback.innerHTML = `
        <div style="padding: 14px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: ${res.color}; font-size: 1.05rem;">
            <span>${res.icon}</span> <span>Modelo Recomendado: ${res.model}</span>
          </div>
          <p style="margin-top: 8px; color: var(--text-muted); font-size: 0.95rem; line-height: 1.5;">
            ${res.explanation}
          </p>
        </div>
      `;
    }

    syncSelect.addEventListener('change', updateSyncAdvisor);
    updateSyncAdvisor();
  }

  // Initialize slides view
  updateSlides();
});
