// Interactive Slide Deck Application Logic for System Design (Part. 3)
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
    const titleEl = slide.querySelector('.slide-title');
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

  window.goToSlide = function(index) {
    if (index >= 0 && index < slides.length) {
      currentSlideIndex = index;
      updateSlides();
    }
  };

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
        window.goToSlide(0);
        break;
      case 'End':
        window.goToSlide(slides.length - 1);
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

  // =========================================================================
  // INTERACTIVE LAB 1: Confiabilidade, MTBF/MTTR & Failover Simulator (Slide 6)
  // =========================================================================
  const sim1Mode = document.getElementById('sim1-mode-select');
  const sim1Mtbf = document.getElementById('sim1-mtbf');
  const sim1Mttr = document.getElementById('sim1-mttr');
  const sim1ValAvail = document.getElementById('sim1-val-avail');
  const sim1ValNines = document.getElementById('sim1-val-nines');
  const sim1ValDowntime = document.getElementById('sim1-val-downtime');
  const sim1ValStatus = document.getElementById('sim1-val-status');
  const btnSim1Fail = document.getElementById('btn-sim1-fail');
  const btnSim1Reset = document.getElementById('btn-sim1-reset');
  const nodePrimary = document.getElementById('sim1-node-primary');
  const nodeSecondary = document.getElementById('sim1-node-secondary');
  const badgeP1 = document.getElementById('sim1-badge-p1');
  const badgeP2 = document.getElementById('sim1-badge-p2');
  const p1Log = document.getElementById('sim1-p1-log');
  const p2Log = document.getElementById('sim1-p2-log');
  const p2Desc = document.getElementById('sim1-p2-desc');

  let sim1Timer = null;

  function calculateAvailability() {
    if (!sim1Mtbf || !sim1Mttr) return;
    const mtbfHours = parseFloat(sim1Mtbf.value) || 720;
    const mttrHours = (parseFloat(sim1Mttr.value) || 5) / 60; // converter minutos em horas
    const a = mtbfHours / (mtbfHours + mttrHours);
    const pct = (a * 100).toFixed(4);
    sim1ValAvail.textContent = `${pct}%`;

    const unavail = 1 - a;
    let nines = 0;
    if (unavail > 0) {
      nines = (-Math.log10(unavail)).toFixed(1);
    } else {
      nines = "9+";
    }
    sim1ValNines.textContent = `~${nines} Noves`;

    const downtimeHoursYear = 8760 * unavail;
    const dtH = Math.floor(downtimeHoursYear);
    const dtM = Math.round((downtimeHoursYear - dtH) * 60);
    sim1ValDowntime.textContent = `${dtH}h ${dtM}m`;
  }

  if (sim1Mtbf && sim1Mttr) {
    sim1Mtbf.addEventListener('input', calculateAvailability);
    sim1Mttr.addEventListener('input', calculateAvailability);
    sim1Mode.addEventListener('change', () => {
      resetSim1();
      calculateAvailability();
    });
    calculateAvailability();
  }

  function resetSim1() {
    clearTimeout(sim1Timer);
    nodePrimary.className = 'node-card primary';
    nodeSecondary.className = 'node-card standby';
    badgeP1.className = 'node-status-badge badge-active';
    badgeP1.textContent = 'ATIVO (LÍDER)';
    badgeP2.className = 'node-status-badge badge-standby';
    badgeP2.textContent = 'STANDBY (PASSIVO)';
    p1Log.textContent = '[P1] Recebendo requisições HTTP... [200 OK]';
    p2Log.textContent = '[P2] Monitorando batimentos cardíacos do Nó 01...';
    p2Desc.textContent = 'Aguardando sinal de falha do nó primário para iniciar promoção de liderança.';
    sim1ValStatus.textContent = 'ONLINE (200 OK)';
    sim1ValStatus.style.color = 'var(--accent-emerald)';
  }

  if (btnSim1Fail) {
    btnSim1Fail.addEventListener('click', () => {
      const mode = sim1Mode.value;
      nodePrimary.className = 'node-card failed';
      badgeP1.className = 'node-status-badge badge-dead';
      badgeP1.textContent = 'FALHA (OFFLINE)';
      p1Log.textContent = '[P1] KERNEL PANIC: Conexão interrompida! Sockets fechados!';

      if (mode === 'ha') {
        sim1ValStatus.textContent = 'DEGRADADO (FAILOVER EM CURSO)';
        sim1ValStatus.style.color = 'var(--accent-rose)';
        p2Log.textContent = '[P2] Heartbeat perdido! Iniciando timer de suspeita (1.5s)...';

        sim1Timer = setTimeout(() => {
          p2Log.textContent = '[P2] Promovendo Nó 02 a LÍDER. Atualizando Virtual IP...';
          badgeP2.className = 'node-status-badge badge-active';
          badgeP2.textContent = 'ATIVO (NOVO LÍDER)';
          nodeSecondary.className = 'node-card primary';
          p2Desc.textContent = 'Nó 02 assumiu o tráfego do cluster com sucesso após failover de 2.5s.';
          sim1ValStatus.textContent = 'ONLINE (200 OK - NÓ 02)';
          sim1ValStatus.style.color = 'var(--accent-emerald)';
          showToast('Failover HA concluído: Nó 02 assumiu como Líder.');
        }, 2200);
      } else {
        // FT Lockstep mode
        sim1ValStatus.textContent = 'ONLINE (LOCKSTEP - 0ms DOWNTIME)';
        sim1ValStatus.style.color = 'var(--accent-indigo)';
        badgeP2.className = 'node-status-badge badge-active';
        badgeP2.textContent = 'LOCKSTEP ASSUMIU';
        nodeSecondary.className = 'node-card lockstep';
        p2Log.textContent = '[P2] FT Lockstep: Falha do primário absorvida instantaneamente sem perda de clock!';
        p2Desc.textContent = 'Tolerância a Falhas em ação: Zero requisições abortadas. 100% dos pacotes preservados.';
        showToast('Fault Tolerance: Continuidade ininterrupta em hardware.');
      }
    });

    btnSim1Reset.addEventListener('click', () => {
      resetSim1();
      showToast('Simulador de Confiabilidade resetado.');
    });
  }

  // =========================================================================
  // INTERACTIVE LAB 2: Circuit Breaker Playground (Slide 10)
  // =========================================================================
  const cbFailRate = document.getElementById('cb-fail-rate');
  const cbThreshold = document.getElementById('cb-threshold');
  const cbSleepWin = document.getElementById('cb-sleep-win');
  const btnCbSend = document.getElementById('btn-cb-send');
  const btnCbBurst = document.getElementById('btn-cb-burst');
  const btnCbStream = document.getElementById('btn-cb-stream');
  const btnCbReset = document.getElementById('btn-cb-reset');

  const cbValState = document.getElementById('cb-val-state');
  const cbValSuccess = document.getElementById('cb-val-success');
  const cbValFailed = document.getElementById('cb-val-failed');
  const cbValFallbacks = document.getElementById('cb-val-fallbacks');
  const cbTerminal = document.getElementById('cb-terminal-logs');

  const cbBoxClosed = document.getElementById('cb-box-closed');
  const cbBoxOpen = document.getElementById('cb-box-open');
  const cbBoxHalfOpen = document.getElementById('cb-box-half-open');

  let cbState = 'CLOSED'; // 'CLOSED', 'OPEN', 'HALF-OPEN'
  let consecutiveFailures = 0;
  let totalRequests = 0;
  let successCount = 0;
  let failCount = 0;
  let fallbackCount = 0;
  let cbCooldownTimer = null;
  let cbStreamInterval = null;

  function logCb(msg) {
    if (!cbTerminal) return;
    const time = new Date().toTimeString().split(' ')[0];
    const line = `[${time}] ${msg}`;
    cbTerminal.innerHTML = `${line}<br>${cbTerminal.innerHTML.substring(0, 1500)}`;
  }

  function updateCbUI() {
    if (!cbValState) return;
    cbValState.textContent = cbState;
    cbValSuccess.textContent = `${totalRequests} / ${successCount}`;
    cbValFailed.textContent = failCount;
    cbValFallbacks.textContent = fallbackCount;

    if (cbBoxClosed && cbBoxOpen && cbBoxHalfOpen) {
      cbBoxClosed.classList.toggle('current', cbState === 'CLOSED');
      cbBoxOpen.classList.toggle('current', cbState === 'OPEN');
      cbBoxHalfOpen.classList.toggle('current', cbState === 'HALF-OPEN');
    }

    if (cbState === 'CLOSED') {
      cbValState.style.color = 'var(--accent-emerald)';
    } else if (cbState === 'OPEN') {
      cbValState.style.color = 'var(--accent-rose)';
    } else {
      cbValState.style.color = 'var(--accent-amber)';
    }
  }

  function executeCbRequest() {
    totalRequests++;
    const failRate = parseInt(cbFailRate.value, 10);
    const threshold = parseInt(cbThreshold.value, 10) || 3;
    const cooldownSec = parseInt(cbSleepWin.value, 10) || 4;

    if (cbState === 'OPEN') {
      fallbackCount++;
      logCb(`<span style="color:var(--accent-rose);">[FAST-FAIL]</span> Circuito ABERTO. Chamada abortada no cliente; Fallback retornado instantâneo.`);
      updateCbUI();
      return;
    }

    // Em CLOSED ou HALF-OPEN
    const isError = Math.random() * 100 < failRate;

    if (isError) {
      failCount++;
      consecutiveFailures++;
      logCb(`<span style="color:var(--accent-rose);">[ERRO 500]</span> Falha no backend! Consecutivas: ${consecutiveFailures}/${threshold}.`);

      if (cbState === 'HALF-OPEN') {
        cbState = 'OPEN';
        logCb(`<span style="color:var(--accent-rose); font-weight:700;">[CIRCUITO ABERTO]</span> Sonda falhou no estado HALF-OPEN! Retornando para OPEN.`);
        scheduleCooldown(cooldownSec);
      } else if (consecutiveFailures >= threshold) {
        cbState = 'OPEN';
        logCb(`<span style="color:var(--accent-rose); font-weight:700;">[DISPARO]</span> Limiar atingido (${threshold} erros)! Circuito transiciona para OPEN.`);
        scheduleCooldown(cooldownSec);
      }
    } else {
      successCount++;
      logCb(`<span style="color:var(--accent-emerald);">[200 OK]</span> Requisição bem-sucedida!`);

      if (cbState === 'HALF-OPEN') {
        cbState = 'CLOSED';
        consecutiveFailures = 0;
        logCb(`<span style="color:var(--accent-emerald); font-weight:700;">[RECUPERADO]</span> Sonda obteve sucesso! Circuito FECHADO.`);
      } else {
        consecutiveFailures = 0;
      }
    }

    updateCbUI();
  }

  function scheduleCooldown(seconds) {
    clearTimeout(cbCooldownTimer);
    cbCooldownTimer = setTimeout(() => {
      if (cbState === 'OPEN') {
        cbState = 'HALF-OPEN';
        logCb(`<span style="color:var(--accent-amber); font-weight:700;">[COOLDOWN EXPIRADO]</span> Transicionando para HALF-OPEN (Modo Sonda Canário).`);
        updateCbUI();
      }
    }, seconds * 1000);
  }

  if (btnCbSend) {
    btnCbSend.addEventListener('click', executeCbRequest);
    btnCbBurst.addEventListener('click', () => {
      for (let i = 0; i < 10; i++) {
        setTimeout(executeCbRequest, i * 60);
      }
    });

    btnCbStream.addEventListener('click', () => {
      if (!cbStreamInterval) {
        cbStreamInterval = setInterval(executeCbRequest, 250);
        btnCbStream.textContent = '⏹ Parar Stream';
        btnCbStream.classList.add('active');
      } else {
        clearInterval(cbStreamInterval);
        cbStreamInterval = null;
        btnCbStream.textContent = '▶ Auto Stream';
        btnCbStream.classList.remove('active');
      }
    });

    btnCbReset.addEventListener('click', () => {
      if (cbStreamInterval) {
        clearInterval(cbStreamInterval);
        cbStreamInterval = null;
        btnCbStream.textContent = '▶ Auto Stream';
        btnCbStream.classList.remove('active');
      }
      clearTimeout(cbCooldownTimer);
      cbState = 'CLOSED';
      consecutiveFailures = 0;
      totalRequests = 0;
      successCount = 0;
      failCount = 0;
      fallbackCount = 0;
      cbTerminal.innerHTML = '[Reset] Circuit Breaker resetado para o estado inicial CLOSED.';
      updateCbUI();
      showToast('Circuit Breaker resetado com sucesso.');
    });
  }

  // =========================================================================
  // INTERACTIVE LAB 3: Retry & Jitter Simulator (Slide 12)
  // =========================================================================
  const jitterStrategy = document.getElementById('jitter-strategy-select');
  const btnJitterSim = document.getElementById('btn-jitter-simulate');
  const btnJitterClear = document.getElementById('btn-jitter-clear');
  const jitterExpl = document.getElementById('jitter-explanation');
  const trackT1 = document.getElementById('track-t1');
  const trackT2 = document.getElementById('track-t2');
  const trackT3 = document.getElementById('track-t3');

  const clientColors = [
    '#38bdf8', '#34d399', '#c084fc', '#fbbf24', '#f43f5e',
    '#60a5fa', '#818cf8', '#a78bfa', '#f472b6', '#4ade80'
  ];

  function clearJitterTracks() {
    if (trackT1) trackT1.innerHTML = '';
    if (trackT2) trackT2.innerHTML = '';
    if (trackT3) trackT3.innerHTML = '';
  }

  if (btnJitterClear) {
    btnJitterClear.addEventListener('click', clearJitterTracks);
  }

  if (btnJitterSim) {
    btnJitterSim.addEventListener('click', () => {
      clearJitterTracks();
      const strat = jitterStrategy.value;

      if (strat === 'none') {
        jitterExpl.innerHTML = '<strong>Alerta de Avalanche:</strong> Sem backoff, todos os 10 clientes retentam imediatamente no mesmo instante (0ms). Isso gera colisão frontal garantindo que o servidor permaneça sufocado.';
        for (let i = 0; i < 10; i++) {
          const pt = document.createElement('div');
          pt.className = 'jitter-burst-point';
          pt.style.left = '5%';
          pt.style.backgroundColor = clientColors[i];
          trackT1.appendChild(pt);
        }
      } else if (strat === 'pure') {
        jitterExpl.innerHTML = '<strong>Rajadas Sincronizadas:</strong> Com Exponential Backoff puro sem Jitter, as retentativas acontecem em ondas sincronizadas exatamente nos tempos previstos (200ms, 400ms, 800ms), mantendo o Thundering Herd ativo.';
        for (let i = 0; i < 10; i++) {
          const p1 = document.createElement('div');
          p1.className = 'jitter-burst-point';
          p1.style.left = '50%';
          p1.style.backgroundColor = clientColors[i];
          trackT1.appendChild(p1);

          const p2 = document.createElement('div');
          p2.className = 'jitter-burst-point';
          p2.style.left = '50%';
          p2.style.backgroundColor = clientColors[i];
          trackT2.appendChild(p2);

          const p3 = document.createElement('div');
          p3.className = 'jitter-burst-point';
          p3.style.left = '50%';
          p3.style.backgroundColor = clientColors[i];
          trackT3.appendChild(p3);
        }
      } else {
        // FULL JITTER
        jitterExpl.innerHTML = '<strong>Full Jitter (Padrão AWS):</strong> Cada cliente escolhe um intervalo aleatório <code>random(0, backoff)</code>. A carga é uniformemente distribuída pela linha do tempo e o servidor absorve o fluxo suavemente.';
        for (let i = 0; i < 10; i++) {
          const pos1 = Math.random() * 90 + 5;
          const pos2 = Math.random() * 90 + 5;
          const pos3 = Math.random() * 90 + 5;

          const p1 = document.createElement('div');
          p1.className = 'jitter-burst-point';
          p1.style.left = `${pos1}%`;
          p1.style.backgroundColor = clientColors[i];
          trackT1.appendChild(p1);

          const p2 = document.createElement('div');
          p2.className = 'jitter-burst-point';
          p2.style.left = `${pos2}%`;
          p2.style.backgroundColor = clientColors[i];
          trackT2.appendChild(p2);

          const p3 = document.createElement('div');
          p3.className = 'jitter-burst-point';
          p3.style.left = `${pos3}%`;
          p3.style.backgroundColor = clientColors[i];
          trackT3.appendChild(p3);
        }
      }
      showToast('Simulação de Retentativas renderizada.');
    });
  }

  // =========================================================================
  // INTERACTIVE LAB 4: Quorum Distribuído Simulator (Slide 17)
  // =========================================================================
  const qWRange = document.getElementById('q-w-range');
  const qWVal = document.getElementById('q-w-val');
  const qRRange = document.getElementById('q-r-range');
  const qRVal = document.getElementById('q-r-val');
  const qFormulaText = document.getElementById('q-formula-text');
  const qStatusBadge = document.getElementById('q-status-badge');
  const qNodesContainer = document.getElementById('q-nodes-container');
  const qOutputLog = document.getElementById('q-output-log');
  const btnQWrite = document.getElementById('btn-q-write');
  const btnQRead = document.getElementById('btn-q-read');
  const btnQReset = document.getElementById('btn-q-reset');

  const N_NODES = 5;
  let qNodes = [
    { id: 1, healthy: true, version: 'v1' },
    { id: 2, healthy: true, version: 'v1' },
    { id: 3, healthy: true, version: 'v1' },
    { id: 4, healthy: true, version: 'v1' },
    { id: 5, healthy: true, version: 'v1' }
  ];

  function renderQuorumNodes() {
    if (!qNodesContainer) return;
    qNodesContainer.innerHTML = '';
    qNodes.forEach(node => {
      const box = document.createElement('div');
      box.className = `quorum-node-box ${node.healthy ? 'healthy' : 'unhealthy'}`;
      box.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; font-weight:700; color:#fff;">NÓ ${node.id}</span>
          <span class="heartbeat-dot" style="${node.healthy ? '' : 'background:var(--accent-rose); animation:none;'}"></span>
        </div>
        <div style="font-family:var(--font-mono); font-size:1.1rem; font-weight:700; color:${node.version === 'v2' ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
          ${node.version}
        </div>
        <div style="font-size:0.7rem; color:${node.healthy ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
          ${node.healthy ? 'ONLINE' : 'ISOLADO'}
        </div>
      `;
      box.addEventListener('click', () => {
        node.healthy = !node.healthy;
        renderQuorumNodes();
        qOutputLog.textContent = `[Nó ${node.id}] Marcado como ${node.healthy ? 'ONLINE' : 'FALHO / DESCONECTADO'}.`;
      });
      qNodesContainer.appendChild(box);
    });
  }

  function updateQuorumRule() {
    if (!qWRange || !qRRange) return;
    const w = parseInt(qWRange.value, 10);
    const r = parseInt(qRRange.value, 10);
    qWVal.textContent = w;
    qRVal.textContent = r;

    const sum = r + w;
    const isStrict = sum > N_NODES;

    qFormulaText.textContent = `R(${r}) + W(${w}) = ${sum} ${isStrict ? '>' : '<='} ${N_NODES}`;
    if (isStrict) {
      qStatusBadge.className = 'badge-active node-status-badge';
      qStatusBadge.textContent = 'CONSISTÊNCIA FORTE GARANTIDA';
    } else {
      qStatusBadge.className = 'badge-dead node-status-badge';
      qStatusBadge.textContent = 'RISCO DE STALE READS (INCONSISTÊNCIA)';
    }
  }

  if (qWRange && qRRange) {
    qWRange.addEventListener('input', updateQuorumRule);
    qRRange.addEventListener('input', updateQuorumRule);
    renderQuorumNodes();
    updateQuorumRule();
  }

  if (btnQWrite) {
    btnQWrite.addEventListener('click', () => {
      const w = parseInt(qWRange.value, 10);
      const healthyNodes = qNodes.filter(n => n.healthy);

      if (healthyNodes.length < w) {
        qOutputLog.innerHTML = `<span style="color:var(--accent-rose); font-weight:700;">[FALHA DE ESCRITA]</span> Nós saudáveis (${healthyNodes.length}) insuficientes para atingir Quorum W=${w}! Transação abortada.`;
        showToast('Erro: Quorum de Escrita não atingido.');
        return;
      }

      // Atualiza w nós saudáveis com versão v2
      for (let i = 0; i < w; i++) {
        healthyNodes[i].version = 'v2';
      }
      renderQuorumNodes();
      qOutputLog.innerHTML = `<span style="color:var(--accent-emerald); font-weight:700;">[ESCRITA CONCLUÍDA]</span> Versão 'v2' gravada com sucesso em ${w} nós! Confirmações recebidas.`;
      showToast(`Escrita gravada em ${w} nós.`);
    });
  }

  if (btnQRead) {
    btnQRead.addEventListener('click', () => {
      const r = parseInt(qRRange.value, 10);
      const w = parseInt(qWRange.value, 10);
      const healthyNodes = qNodes.filter(n => n.healthy);

      if (healthyNodes.length < r) {
        qOutputLog.innerHTML = `<span style="color:var(--accent-rose); font-weight:700;">[FALHA DE LEITURA]</span> Nós saudáveis (${healthyNodes.length}) insuficientes para atingir Quorum R=${r}! Leitura recusada.`;
        showToast('Erro: Quorum de Leitura não atingido.');
        return;
      }

      // Consulta r nós
      const consulted = healthyNodes.slice(0, r);
      const versions = consulted.map(n => n.version);
      const hasV2 = versions.includes('v2');
      const isStrict = r + w > N_NODES;

      if (isStrict) {
        qOutputLog.innerHTML = `<span style="color:var(--accent-cyan); font-weight:700;">[LEITURA CONSISTENTE]</span> Quorum R=${r} consultou nós [${consulted.map(n => n.id).join(', ')}]. Versão mais recente encontrada: '${hasV2 ? 'v2' : 'v1'}' (Consistência Forte honrada!).`;
      } else {
        if (!hasV2 && qNodes.some(n => n.version === 'v2')) {
          qOutputLog.innerHTML = `<span style="color:var(--accent-rose); font-weight:700;">[ANOMALIA: STALE READ DETECTADA]</span> R+W <= N. Nós consultados devolveram versão obsoleta 'v1' enquanto dados 'v2' já existiam em outros nós!`;
        } else {
          qOutputLog.innerHTML = `<span style="color:var(--accent-amber);">[LEITURA FRACA]</span> Retornou versão '${hasV2 ? 'v2' : 'v1'}' sem garantia formal de linearizabilidade.`;
        }
      }
    });
  }

  if (btnQReset) {
    btnQReset.addEventListener('click', () => {
      qNodes.forEach(n => {
        n.healthy = true;
        n.version = 'v1';
      });
      renderQuorumNodes();
      qOutputLog.textContent = '[Reset] Cluster restaurado para 5 nós saudáveis em versão v1.';
      showToast('Cluster de Quorum resetado.');
    });
  }

  // =========================================================================
  // INTERACTIVE LAB 5: PACELC Interactive Explorer (Slide 23)
  // =========================================================================
  const btnPacelcPart = document.getElementById('btn-pacelc-partition');
  const btnPacelcPeace = document.getElementById('btn-pacelc-peace');
  const pacelcTitleLeft = document.getElementById('pacelc-title-left');
  const pacelcDescLeft = document.getElementById('pacelc-desc-left');
  const pacelcTitleRight = document.getElementById('pacelc-title-right');
  const pacelcDescRight = document.getElementById('pacelc-desc-right');
  const pacelcDbsGrid = document.getElementById('pacelc-dbs-grid');

  if (btnPacelcPart && btnPacelcPeace) {
    btnPacelcPart.addEventListener('click', () => {
      btnPacelcPart.classList.add('active');
      btnPacelcPeace.classList.remove('active');

      pacelcTitleLeft.textContent = 'Sob Partição: Consistência (CP)';
      pacelcDescLeft.textContent = 'Recusa escritas nos nós minoritários para preservar a linearizabilidade estrita. Zero corrupção de dados.';

      pacelcTitleRight.textContent = 'Sob Partição: Disponibilidade (AP)';
      pacelcDescRight.textContent = 'Permite que clientes continuem lendo e escrevendo mesmo isolados. Gera divergências temporárias resolvidas via CRDTs ou Vector Clocks.';

      pacelcDbsGrid.innerHTML = `
        <div class="db-badge-card">
          <strong style="color: var(--accent-cyan);">Google Spanner</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted);">CP • Relógios Atômicos</span>
        </div>
        <div class="db-badge-card">
          <strong style="color: var(--accent-cyan);">etcd / ZooKeeper</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted);">CP • Raft / Zab Consensus</span>
        </div>
        <div class="db-badge-card">
          <strong style="color: var(--accent-emerald);">Apache Cassandra</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted);">AP • Dynamo Leaderless</span>
        </div>
        <div class="db-badge-card">
          <strong style="color: var(--accent-emerald);">Amazon DynamoDB</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted);">AP • Modo Eventual</span>
        </div>
      `;
    });

    btnPacelcPeace.addEventListener('click', () => {
      btnPacelcPeace.classList.add('active');
      btnPacelcPart.classList.remove('active');

      pacelcTitleLeft.textContent = 'Tempo de Paz: Latência Mínima (EL)';
      pacelcDescLeft.textContent = 'Grava localmente e responde de imediato ao cliente em < 3ms. Sincroniza réplicas em background.';

      pacelcTitleRight.textContent = 'Tempo de Paz: Consistência Estrita (EC)';
      pacelcDescRight.textContent = 'Aguarda confirmação síncrona de réplicas de rede antes de responder, aceitando latência maior.';

      pacelcDbsGrid.innerHTML = `
        <div class="db-badge-card">
          <strong style="color: var(--accent-emerald);">Apache Cassandra</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted);">PA / EL • Latência Ultra-baixa</span>
        </div>
        <div class="db-badge-card">
          <strong style="color: var(--accent-emerald);">DynamoDB / Riak</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted);">PA / EL • Escrita assíncrona</span>
        </div>
        <div class="db-badge-card">
          <strong style="color: var(--accent-cyan);">Google Spanner</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted);">PC / EC • Espera incerteza</span>
        </div>
        <div class="db-badge-card">
          <strong style="color: var(--accent-cyan);">CockroachDB</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted);">PC / EC • Raft Commit síncrono</span>
        </div>
      `;
    });
  }

  // =========================================================================
  // INTERACTIVE LAB 6: Distributed Tracing Waterfall Inspector (Slide 27)
  // =========================================================================
  const traceAnomalySelect = document.getElementById('trace-anomaly-select');
  const btnTraceRun = document.getElementById('btn-trace-run');
  const btnTraceReset = document.getElementById('btn-trace-reset');
  const traceIdPreview = document.getElementById('trace-id-preview');
  const traceTotalDur = document.getElementById('trace-total-dur');
  const traceStatusCode = document.getElementById('trace-status-code');

  const spanGateway = document.getElementById('span-gateway');
  const spanAuth = document.getElementById('span-auth');
  const spanOrder = document.getElementById('span-order');
  const spanInventory = document.getElementById('span-inventory');
  const spanPayment = document.getElementById('span-payment');

  function generateTraceId() {
    return '4bf' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
  }

  function resetTraceUI() {
    traceIdPreview.textContent = '4bf92f3577b34da6a3ce929d0e0e4736';
    traceTotalDur.textContent = '285ms';
    traceTotalDur.style.color = 'var(--accent-emerald)';
    traceStatusCode.textContent = '200 OK';
    traceStatusCode.style.color = 'var(--accent-emerald)';

    spanGateway.className = 'span-bar ok';
    spanGateway.style.width = '100%';
    spanGateway.textContent = '285ms';

    spanAuth.className = 'span-bar ok';
    spanAuth.style.width = '15%';
    spanAuth.textContent = '22ms';

    spanOrder.className = 'span-bar ok';
    spanOrder.style.width = '75%';
    spanOrder.textContent = '210ms';

    spanInventory.className = 'span-bar ok';
    spanInventory.style.width = '20%';
    spanInventory.textContent = '45ms';

    spanPayment.className = 'span-bar ok';
    spanPayment.style.width = '45%';
    spanPayment.textContent = '130ms';
  }

  if (btnTraceReset) {
    btnTraceReset.addEventListener('click', () => {
      resetTraceUI();
      showToast('Trace Inspector resetado.');
    });
  }

  if (btnTraceRun) {
    btnTraceRun.addEventListener('click', () => {
      const mode = traceAnomalySelect.value;
      traceIdPreview.textContent = generateTraceId();

      if (mode === 'none') {
        resetTraceUI();
        showToast('Transação distribuída concluída com sucesso (200 OK).');
      } else if (mode === 'latency') {
        traceTotalDur.textContent = '1.785ms (Tail Latency P99)';
        traceTotalDur.style.color = 'var(--accent-amber)';
        traceStatusCode.textContent = '200 OK (Degradado)';
        traceStatusCode.style.color = 'var(--accent-amber)';

        spanGateway.className = 'span-bar warn';
        spanGateway.style.width = '100%';
        spanGateway.textContent = '1.785ms';

        spanPayment.className = 'span-bar warn';
        spanPayment.style.width = '88%';
        spanPayment.textContent = '1.530ms (Gargalo Gateway Externo)';

        showToast('Alerta: Latência P99 detectada no Payment Processor.');
      } else if (mode === 'error') {
        traceTotalDur.textContent = '78ms';
        traceTotalDur.style.color = 'var(--accent-rose)';
        traceStatusCode.textContent = '500 Internal Server Error';
        traceStatusCode.style.color = 'var(--accent-rose)';

        spanGateway.className = 'span-bar error';
        spanGateway.style.width = '35%';
        spanGateway.textContent = '78ms [500]';

        spanInventory.className = 'span-bar error';
        spanInventory.style.width = '25%';
        spanInventory.textContent = 'Fail: Estoque Insuficiente';

        spanPayment.style.width = '0%';
        spanPayment.textContent = 'Cancelado';

        showToast('Erro 500 localizado: Inventory Service abortou a transação.');
      }
    });
  }

});
