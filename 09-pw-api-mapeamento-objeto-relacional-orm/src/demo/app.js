/**
 * Programação Web - Fatec 2026.2
 * Aula 09: API: Mapeamento Objeto-Relacional (ORM)
 * Script do Apresentador Interativo & Simuladores de Banco de Dados
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

  // Keyboard navigation
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
    }, 4000);
  }

  // ==========================================
  // 2. SIMULADOR 1: O PROBLEMA N+1 E EAGER LOADING
  // ==========================================
  const n1StrategySelect = document.getElementById('n1-strategy-select');
  const n1CountSelect = document.getElementById('n1-count-select');
  const n1LatencyInput = document.getElementById('n1-latency-input');
  const btnRunN1 = document.getElementById('btn-run-n1');
  const n1Waterfall = document.getElementById('n1-waterfall');
  const n1QueriesCountDisplay = document.getElementById('n1-queries-count');
  const n1TotalTimeDisplay = document.getElementById('n1-total-time');
  const n1SqlOutput = document.getElementById('n1-sql-output');
  const n1StatusBadge = document.getElementById('n1-status-badge');

  if (btnRunN1) {
    btnRunN1.addEventListener('click', async () => {
      btnRunN1.disabled = true;
      btnRunN1.textContent = 'Executando Queries...';
      if (n1Waterfall) n1Waterfall.innerHTML = '';
      if (n1SqlOutput) n1SqlOutput.value = '';

      const strategy = n1StrategySelect ? n1StrategySelect.value : 'lazy';
      const count = parseInt(n1CountSelect ? n1CountSelect.value : '20', 10);
      const latency = parseInt(n1LatencyInput ? n1LatencyInput.value : '5', 10);

      let totalQueries = 0;
      let totalTime = 0;
      let sqlLog = '';

      if (strategy === 'lazy') {
        // 1 initial query + N queries
        totalQueries = 1 + count;
        totalTime = totalQueries * latency;

        if (n1StatusBadge) {
          n1StatusBadge.className = 'status-pill invalid';
          n1StatusBadge.innerHTML = `🚨 Gargalo N+1 Crítico: ${totalQueries} queries independentes!`;
        }

        sqlLog += `-- 1. Query inicial de busca dos autores (LIMIT ${count})\n`;
        sqlLog += `SELECT id, name FROM authors LIMIT ${count};\n\n`;
        sqlLog += `-- 2. No loop de serialização (author.books), o ORM dispara N consultas sob demanda:\n`;

        appendWaterfallRow('Query 1: SELECT * FROM authors LIMIT ' + count, latency, 'primary');

        for (let i = 1; i <= Math.min(count, 15); i++) {
          sqlLog += `SELECT id, title, author_id FROM books WHERE author_id = ${i};\n`;
          appendWaterfallRow(`Query ${i + 1}: SELECT * FROM books WHERE author_id = ${i}`, latency, 'rose');
        }
        if (count > 15) {
          sqlLog += `... (mais ${count - 15} queries idênticas repetidas no tráfego de rede) ...\n`;
          appendWaterfallRow(`... [Mais ${count - 15} queries de rede em cascata] ...`, latency * (count - 15), 'rose');
        }
      } else if (strategy === 'joined') {
        // 1 single query with LEFT JOIN
        totalQueries = 1;
        totalTime = latency;

        if (n1StatusBadge) {
          n1StatusBadge.className = 'status-pill valid';
          n1StatusBadge.innerHTML = '✅ Joined Load: 1 única query via LEFT JOIN!';
        }

        sqlLog += `-- 1. Query única combinando autores e livros com LEFT OUTER JOIN\n`;
        sqlLog += `SELECT authors.id, authors.name, books.id AS book_id, books.title\n`;
        sqlLog += `FROM authors\n`;
        sqlLog += `LEFT OUTER JOIN books ON authors.id = books.author_id\n`;
        sqlLog += `LIMIT ${count};\n\n`;
        sqlLog += `-- ATENÇÃO: Se cada autor tiver 20 livros, o banco retorna ${count * 20} linhas (Produto Cartesiano).\n`;

        appendWaterfallRow('Query 1: SELECT * FROM authors LEFT JOIN books LIMIT ' + count, latency, 'emerald');
      } else if (strategy === 'selectin') {
        // Exactly 2 queries
        totalQueries = 2;
        totalTime = latency * 2;

        if (n1StatusBadge) {
          n1StatusBadge.className = 'status-pill valid';
          n1StatusBadge.innerHTML = '⭐ Select-IN Load (Padrão Ouro): Exatamente 2 queries!';
        }

        const idsSample = Array.from({ length: Math.min(count, 10) }, (_, i) => i + 1).join(', ') + (count > 10 ? ', ...' : '');
        sqlLog += `-- 1. Query inicial dos autores\n`;
        sqlLog += `SELECT id, name FROM authors LIMIT ${count};\n\n`;
        sqlLog += `-- 2. Segunda query carregando todos os livros dos autores retornados via cláusula IN (...)\n`;
        sqlLog += `SELECT id, title, author_id FROM books WHERE author_id IN (${idsSample});\n\n`;
        sqlLog += `-- O ORM associa os livros aos autores em memória. Zero produto cartesiano!`;

        appendWaterfallRow(`Query 1: SELECT * FROM authors LIMIT ${count}`, latency, 'emerald');
        appendWaterfallRow(`Query 2: SELECT * FROM books WHERE author_id IN (...)`, latency, 'cyan');
      }

      if (n1QueriesCountDisplay) n1QueriesCountDisplay.textContent = totalQueries;
      if (n1TotalTimeDisplay) n1TotalTimeDisplay.textContent = `${totalTime} ms`;
      if (n1SqlOutput) n1SqlOutput.value = sqlLog;

      btnRunN1.disabled = false;
      btnRunN1.textContent = '⚡ Executar Consulta';
      showToast(`Consulta concluída: ${totalQueries} queries em ${totalTime}ms`, strategy === 'lazy' ? 'error' : 'success');
    });
  }

  function appendWaterfallRow(label, durationMs, colorType) {
    if (!n1Waterfall) return;
    const row = document.createElement('div');
    row.className = 'waterfall-row';
    let colorVar = 'var(--accent-cyan)';
    if (colorType === 'rose') colorVar = 'var(--accent-rose)';
    if (colorType === 'emerald') colorVar = 'var(--accent-emerald)';

    row.innerHTML = `
      <span style="color: ${colorVar};">${label}</span>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: var(--text-dim);">${durationMs}ms</span>
        <div class="waterfall-bar-wrap">
          <div class="waterfall-bar" style="background: ${colorVar}; width: 100%;"></div>
        </div>
      </div>
    `;
    n1Waterfall.appendChild(row);
  }

  // ==========================================
  // 3. SIMULADOR 2: TRANSAÇÕES & CONCORRÊNCIA
  // ==========================================
  const lockStrategySelect = document.getElementById('lock-strategy-select');
  const btnRunConcurrency = document.getElementById('btn-run-concurrency');
  const concurrencyLog = document.getElementById('concurrency-log');
  const stockDisplay = document.getElementById('stock-display');
  const versionDisplay = document.getElementById('version-display');

  let currentStock = 1;
  let currentVersion = 1;

  if (btnRunConcurrency) {
    btnRunConcurrency.addEventListener('click', async () => {
      btnRunConcurrency.disabled = true;
      btnRunConcurrency.textContent = 'Processando Concorrência...';
      if (concurrencyLog) concurrencyLog.value = '';

      const strategy = lockStrategySelect ? lockStrategySelect.value : 'none';
      let log = '';

      currentStock = 1;
      currentVersion = 1;
      updateStockUI();

      log += `[t=0ms] INÍCIO DO TESTE CONCORRENTE: Vagas no Voo: ${currentStock} | Versão: ${currentVersion}\n`;
      log += `[t=10ms] Usuário A e Usuário B clicam em "Comprar Último Assento" simultaneamente!\n\n`;

      if (strategy === 'none') {
        log += `--- MODO: SEM CONTROLE CONCORRENTE (LOST UPDATE / OVERSELLING) ---\n`;
        log += `[t=20ms] [Transação A] SELECT vagas FROM voo; ──► Lê vagas = 1\n`;
        log += `[t=22ms] [Transação B] SELECT vagas FROM voo; ──► Lê vagas = 1 (Concorrente lê o mesmo valor!)\n`;
        log += `[t=40ms] [Transação A] Calcula 1 - 1 = 0; UPDATE voo SET vagas = 0; COMMIT;\n`;
        log += `[t=45ms] [Transação B] Calcula 1 - 1 = 0; UPDATE voo SET vagas = 0; COMMIT;\n\n`;
        log += `🚨 DESASTRE EM PRODUÇÃO! Dois bilhetes foram emitidos para o mesmo assento 12A!\n`;
        log += `Ocorreu um "Lost Update" clássico por falta de trava transacional.\n`;
        currentStock = 0;
        showToast('Lost Update detectado: Dois usuários compraram a mesma vaga!', 'error');
      } else if (strategy === 'pessimistic') {
        log += `--- MODO: PESSIMISTIC LOCKING (SELECT FOR UPDATE) ---\n`;
        log += `[t=20ms] [Transação A] SELECT vagas FROM voo WHERE id = 12 FOR UPDATE;\n`;
        log += `         ► SGBD concede o LOCK exclusivo da linha para A!\n`;
        log += `[t=25ms] [Transação B] SELECT vagas FROM voo WHERE id = 12 FOR UPDATE;\n`;
        log += `         ► SGBD DETECTA CONFLITO! B fica BLOQUEADO (em espera na fila de lock)!\n`;
        log += `[t=60ms] [Transação A] UPDATE voo SET vagas = 0 WHERE id = 12; COMMIT;\n`;
        log += `         ► Transação A concluída com sucesso! Lock é liberado pelo banco.\n`;
        log += `[t=65ms] [Transação B] Destravado! Lê valor atualizado: vagas = 0!\n`;
        log += `[t=70ms] [Transação B] Detecta vagas = 0. Operação abortada com HTTP 409 Conflict!\n`;
        log += `✅ Concorrência blindada com sucesso via bloqueio pessimista no SGBD.\n`;
        currentStock = 0;
        showToast('Pessimistic Lock: Transação B bloqueada com segurança.', 'success');
      } else if (strategy === 'optimistic') {
        log += `--- MODO: OPTIMISTIC LOCKING (COLUNA VERSION) ---\n`;
        log += `[t=20ms] [Transação A] SELECT vagas, version FROM voo; ──► Lê vagas=1, version=1\n`;
        log += `[t=22ms] [Transação B] SELECT vagas, version FROM voo; ──► Lê vagas=1, version=1\n`;
        log += `[t=50ms] [Transação A] UPDATE voo SET vagas=0, version=2 WHERE id=12 AND version=1;\n`;
        log += `         ► Linhas afetadas: 1. Transação A comita com sucesso (version agora é 2)!\n`;
        log += `[t=55ms] [Transação B] UPDATE voo SET vagas=0, version=2 WHERE id=12 AND version=1;\n`;
        log += `         ► LINHAS AFETADAS: 0! (Pois a versão no banco já é 2, não 1!)\n`;
        log += `         ► ORM detecta 0 linhas afetadas e lança: OptimisticLockException (StaleDataError)!\n`;
        log += `[t=60ms] [Transação B] Trata a exceção, recarrega o estado fresco e avisa: "Assento esgotado!".\n`;
        log += `⭐ Concorrência segura sem bloquear threads do banco de dados!\n`;
        currentStock = 0;
        currentVersion = 2;
        showToast('Optimistic Lock: Conflito detectado via versão!', 'success');
      }

      if (concurrencyLog) concurrencyLog.value = log;
      updateStockUI();
      btnRunConcurrency.disabled = false;
      btnRunConcurrency.textContent = '🚀 Disparar Transações Concorrentes';
    });
  }

  function updateStockUI() {
    if (stockDisplay) stockDisplay.textContent = currentStock;
    if (versionDisplay) versionDisplay.textContent = currentVersion;
  }

  // ==========================================
  // 4. SIMULADOR 3: CICLO DE VIDA DE MIGRAÇÕES
  // ==========================================
  const btnMigrateUpgrade = document.getElementById('btn-migrate-upgrade');
  const btnMigrateDowngrade = document.getElementById('btn-migrate-downgrade');
  const btnMigrateReset = document.getElementById('btn-migrate-reset');
  const currentRevisionDisplay = document.getElementById('current-revision-display');
  const migrationSqlLog = document.getElementById('migration-sql-log');
  const schemaContainer = document.getElementById('schema-tables-container');

  const migrationsList = [
    {
      rev: 'a1b2c3d4',
      name: '001_create_users_table.py',
      upSql: 'CREATE TABLE users (\n  id UUID PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL\n);',
      downSql: 'DROP TABLE users;',
      tablesAdded: ['users']
    },
    {
      rev: 'e5f6g7h8',
      name: '002_create_orders_table.py',
      upSql: 'CREATE TABLE orders (\n  id UUID PRIMARY KEY,\n  user_id UUID REFERENCES users(id),\n  total NUMERIC(10, 2) NOT NULL\n);',
      downSql: 'DROP TABLE orders;',
      tablesAdded: ['orders']
    },
    {
      rev: 'i9j0k1l2',
      name: '003_add_phone_and_status.py',
      upSql: 'ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL;\nALTER TABLE orders ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT \'pending\';',
      downSql: 'ALTER TABLE users DROP COLUMN phone;\nALTER TABLE orders DROP COLUMN status;',
      columnsAdded: true
    }
  ];

  let appliedMigrationsCount = 0;

  function renderSchemaUI() {
    if (!schemaContainer) return;
    schemaContainer.innerHTML = '';

    // Always show alembic_version table
    const rev = appliedMigrationsCount === 0 ? 'NULL (Sem migrações)' : migrationsList[appliedMigrationsCount - 1].rev;
    if (currentRevisionDisplay) currentRevisionDisplay.textContent = rev;

    const alembicTable = document.createElement('div');
    alembicTable.className = 'schema-table-card';
    alembicTable.innerHTML = `
      <div class="schema-table-header" style="color: var(--accent-amber);">alembic_version</div>
      <div class="schema-col-row"><span>version_num</span><span style="color: var(--accent-cyan);">${rev}</span></div>
    `;
    schemaContainer.appendChild(alembicTable);

    if (appliedMigrationsCount >= 1) {
      const usersTable = document.createElement('div');
      usersTable.className = 'schema-table-card';
      let cols = `
        <div class="schema-col-row"><span>id (PK)</span><span>UUID</span></div>
        <div class="schema-col-row"><span>name</span><span>VARCHAR(100)</span></div>
        <div class="schema-col-row"><span>email</span><span>VARCHAR(255)</span></div>
      `;
      if (appliedMigrationsCount >= 3) {
        cols += `<div class="schema-col-row" style="color: var(--accent-emerald);"><span>phone</span><span>VARCHAR(20)</span></div>`;
      }
      usersTable.innerHTML = `<div class="schema-table-header">users</div>${cols}`;
      schemaContainer.appendChild(usersTable);
    }

    if (appliedMigrationsCount >= 2) {
      const ordersTable = document.createElement('div');
      ordersTable.className = 'schema-table-card';
      let cols = `
        <div class="schema-col-row"><span>id (PK)</span><span>UUID</span></div>
        <div class="schema-col-row"><span>user_id (FK)</span><span>UUID</span></div>
        <div class="schema-col-row"><span>total</span><span>NUMERIC(10,2)</span></div>
      `;
      if (appliedMigrationsCount >= 3) {
        cols += `<div class="schema-col-row" style="color: var(--accent-emerald);"><span>status</span><span>VARCHAR(20)</span></div>`;
      }
      ordersTable.innerHTML = `<div class="schema-table-header">orders</div>${cols}`;
      schemaContainer.appendChild(ordersTable);
    }
  }

  if (btnMigrateUpgrade) {
    btnMigrateUpgrade.addEventListener('click', () => {
      if (appliedMigrationsCount >= migrationsList.length) {
        showToast('O banco de dados já está na versão mais recente (HEAD)!', 'warning');
        return;
      }
      const mig = migrationsList[appliedMigrationsCount];
      appliedMigrationsCount++;
      if (migrationSqlLog) {
        migrationSqlLog.value = `-- [UPGRADE] Aplicando migração: ${mig.name}\n${mig.upSql}\n\nUPDATE alembic_version SET version_num = '${mig.rev}';`;
      }
      renderSchemaUI();
      showToast(`Migração ${mig.name} aplicada com sucesso!`, 'success');
    });
  }

  if (btnMigrateDowngrade) {
    btnMigrateDowngrade.addEventListener('click', () => {
      if (appliedMigrationsCount <= 0) {
        showToast('Nenhuma migração aplicada para reverter!', 'warning');
        return;
      }
      const mig = migrationsList[appliedMigrationsCount - 1];
      appliedMigrationsCount--;
      const newRev = appliedMigrationsCount === 0 ? 'NULL' : migrationsList[appliedMigrationsCount - 1].rev;
      if (migrationSqlLog) {
        migrationSqlLog.value = `-- [DOWNGRADE] Revertendo migração: ${mig.name}\n${mig.downSql}\n\nUPDATE alembic_version SET version_num = '${newRev}';`;
      }
      renderSchemaUI();
      showToast(`Migração ${mig.name} revertida com sucesso!`, 'warning');
    });
  }

  if (btnMigrateReset) {
    btnMigrateReset.addEventListener('click', () => {
      appliedMigrationsCount = 0;
      if (migrationSqlLog) migrationSqlLog.value = '-- Banco de dados resetado. Esquema limpo.';
      renderSchemaUI();
      showToast('Banco de dados resetado.', 'info');
    });
  }

  renderSchemaUI();
});
