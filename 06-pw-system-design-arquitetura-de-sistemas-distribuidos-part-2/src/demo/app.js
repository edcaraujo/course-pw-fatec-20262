// Interactive Slide Deck Application Logic for System Design (Part. 2)
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

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 1: SLA & Downtime Calculator (Slide 6)
  // -------------------------------------------------------------
  const slaSelect = document.getElementById('sla-select');
  const slaTraffic = document.getElementById('sla-traffic');
  const dtYear = document.getElementById('dt-year');
  const dtMonth = document.getElementById('dt-month');
  const dtWeek = document.getElementById('dt-week');
  const dtDay = document.getElementById('dt-day');
  const failedReqsPreview = document.getElementById('failed-reqs-preview');

  const slaData = {
    "0.99": {
      year: "3 dias, 15 horas, 36 min",
      month: "7 horas, 18 min",
      week: "1 hora, 40 min",
      day: "14 minutos, 24 seg",
      rate: 0.01
    },
    "0.999": {
      year: "8 horas, 45 min, 57 seg",
      month: "43 minutos, 49 seg",
      week: "10 minutos, 04 seg",
      day: "1 minuto, 26 seg",
      rate: 0.001
    },
    "0.9995": {
      year: "4 horas, 22 min, 58 seg",
      month: "21 minutos, 54 seg",
      week: "5 minutos, 02 seg",
      day: "43.2 segundos",
      rate: 0.0005
    },
    "0.9999": {
      year: "52 minutos, 35 seg",
      month: "4 minutos, 23 seg",
      week: "1 minuto, 00 seg",
      day: "8.64 segundos",
      rate: 0.0001
    },
    "0.99999": {
      year: "5 minutos, 15 seg",
      month: "26.30 segundos",
      week: "6.05 segundos",
      day: "0.86 segundos",
      rate: 0.00001
    }
  };

  function updateSlaCalculator() {
    const val = slaSelect.value;
    const info = slaData[val] || slaData["0.9999"];
    dtYear.textContent = info.year;
    dtMonth.textContent = info.month;
    dtWeek.textContent = info.week;
    dtDay.textContent = info.day;

    const traffic = parseFloat(slaTraffic.value) || 10000000;
    const allowedFails = Math.round(traffic * info.rate);
    failedReqsPreview.textContent = `Orçamento de Erro: ~${allowedFails.toLocaleString('pt-BR')} requisições permitidas com falha por mês.`;
  }

  if (slaSelect && slaTraffic) {
    slaSelect.addEventListener('change', updateSlaCalculator);
    slaTraffic.addEventListener('input', updateSlaCalculator);
    updateSlaCalculator();
  }

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 2: Load Balancer & Routing Simulator (Slide 10)
  // -------------------------------------------------------------
  const lbAlgoSelect = document.getElementById('lb-algo-select');
  const lbAlgoBadge = document.getElementById('lb-algo-badge');
  const btnSendReq = document.getElementById('btn-send-req');
  const btnSendBurst = document.getElementById('btn-send-burst');
  const btnToggleStream = document.getElementById('btn-toggle-stream');
  const btnResetLb = document.getElementById('btn-reset-lb');
  const lbTotalReqsEl = document.getElementById('lb-total-reqs');
  const clientItems = document.querySelectorAll('.client-node-item');
  const lbArena = document.getElementById('lb-arena');

  let selectedClientId = 0;
  let totalLbRequests = 0;
  let roundRobinIndex = 0;
  let isStreaming = false;
  let streamInterval = null;

  const servers = [
    { id: 0, name: "Alpha", weight: 3, healthy: true, activeConns: 0, totalReqs: 0, ip: "10.0.1.10" },
    { id: 1, name: "Beta", weight: 1, healthy: true, activeConns: 0, totalReqs: 0, ip: "10.0.1.11" },
    { id: 2, name: "Gamma", weight: 2, healthy: true, activeConns: 0, totalReqs: 0, ip: "10.0.1.12" }
  ];

  // Client Selection
  clientItems.forEach(item => {
    item.addEventListener('click', () => {
      clientItems.forEach(c => c.classList.remove('selected'));
      item.classList.add('selected');
      selectedClientId = parseInt(item.getAttribute('data-client-id'), 10);
    });
  });

  // Algorithm Badge
  if (lbAlgoSelect) {
    lbAlgoSelect.addEventListener('change', () => {
      lbAlgoBadge.textContent = lbAlgoSelect.options[lbAlgoSelect.selectedIndex].text.toUpperCase();
    });
  }

  window.toggleServerHealth = function(serverId) {
    const s = servers[serverId];
    if (!s) return;
    s.healthy = !s.healthy;
    const dot = document.getElementById(`srv-dot-${serverId}`);
    const card = document.getElementById(`srv-${serverId}`);
    if (s.healthy) {
      dot.classList.remove('dead');
      card.classList.remove('unhealthy');
      showToast(`Servidor ${s.name} recuperado e reintegrado.`);
    } else {
      dot.classList.add('dead');
      card.classList.add('unhealthy');
      s.activeConns = 0;
      updateServerUI(serverId);
      showToast(`Servidor ${s.name} marcado como INDISPONÍVEL.`);
    }
  };

  function updateServerUI(id) {
    const s = servers[id];
    document.getElementById(`srv-count-${id}`).textContent = s.totalReqs;
    document.getElementById(`srv-conn-${id}`).textContent = s.activeConns;
    const fillPercent = Math.min(s.activeConns * 15, 100);
    const bar = document.getElementById(`srv-bar-${id}`);
    bar.style.width = `${fillPercent}%`;
    bar.style.backgroundColor = fillPercent > 70 ? 'var(--accent-rose)' : fillPercent > 40 ? 'var(--accent-amber)' : 'var(--accent-cyan)';
  }

  function pickServer() {
    const healthyServers = servers.filter(s => s.healthy);
    if (healthyServers.length === 0) return null;

    const algo = lbAlgoSelect.value;

    if (algo === 'round-robin') {
      const srv = healthyServers[roundRobinIndex % healthyServers.length];
      roundRobinIndex++;
      return srv;
    } 
    else if (algo === 'weighted') {
      const weightedPool = [];
      healthyServers.forEach(s => {
        for (let i = 0; i < s.weight; i++) weightedPool.push(s);
      });
      const srv = weightedPool[roundRobinIndex % weightedPool.length];
      roundRobinIndex++;
      return srv;
    }
    else if (algo === 'least-conn') {
      let minConn = Infinity;
      let chosen = healthyServers[0];
      healthyServers.forEach(s => {
        if (s.activeConns < minConn) {
          minConn = s.activeConns;
          chosen = s;
        }
      });
      return chosen;
    }
    else if (algo === 'ip-hash' || algo === 'consistent-hash') {
      const clientIps = ["192.168.1.10", "10.0.0.52", "201.86.14.9"];
      const ip = clientIps[selectedClientId] || "127.0.0.1";
      let hash = 0;
      for (let i = 0; i < ip.length; i++) hash = (hash << 5) - hash + ip.charCodeAt(i);
      const idx = Math.abs(hash) % healthyServers.length;
      return healthyServers[idx];
    }

    return healthyServers[0];
  }

  function dispatchLbRequest() {
    const targetServer = pickServer();
    totalLbRequests++;
    lbTotalReqsEl.textContent = totalLbRequests;

    if (!targetServer) {
      showToast('ERRO 503: Nenhum servidor backend saudável!');
      return;
    }

    targetServer.totalReqs++;
    targetServer.activeConns++;
    updateServerUI(targetServer.id);

    // Visual pulse
    const srvCard = document.getElementById(`srv-${targetServer.id}`);
    srvCard.classList.add('receiving');
    setTimeout(() => srvCard.classList.remove('receiving'), 300);

    // Simulate completion / connection release
    const duration = 1000 + Math.random() * 1500;
    setTimeout(() => {
      if (targetServer.activeConns > 0) {
        targetServer.activeConns--;
        updateServerUI(targetServer.id);
      }
    }, duration);
  }

  if (btnSendReq) {
    btnSendReq.addEventListener('click', dispatchLbRequest);
    btnSendBurst.addEventListener('click', () => {
      for (let i = 0; i < 10; i++) {
        setTimeout(dispatchLbRequest, i * 60);
      }
    });

    btnToggleStream.addEventListener('click', () => {
      if (!isStreaming) {
        isStreaming = true;
        btnToggleStream.textContent = '⏹ Parar Stream';
        btnToggleStream.classList.add('active');
        streamInterval = setInterval(dispatchLbRequest, 250);
      } else {
        isStreaming = false;
        btnToggleStream.textContent = '▶ Auto Stream';
        btnToggleStream.classList.remove('active');
        clearInterval(streamInterval);
      }
    });

    btnResetLb.addEventListener('click', () => {
      if (isStreaming) {
        isStreaming = false;
        btnToggleStream.textContent = '▶ Auto Stream';
        btnToggleStream.classList.remove('active');
        clearInterval(streamInterval);
      }
      totalLbRequests = 0;
      lbTotalReqsEl.textContent = '0';
      roundRobinIndex = 0;
      servers.forEach(s => {
        s.totalReqs = 0;
        s.activeConns = 0;
        s.healthy = true;
        const dot = document.getElementById(`srv-dot-${s.id}`);
        const card = document.getElementById(`srv-${s.id}`);
        dot.classList.remove('dead');
        card.classList.remove('unhealthy');
        updateServerUI(s.id);
      });
      showToast('Simulador de Load Balancer resetado.');
    });
  }

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 3: Rate Limiter Playground (Slide 18)
  // -------------------------------------------------------------
  const rlAlgoSelect = document.getElementById('rl-algo-select');
  const rlBucketTitle = document.getElementById('rl-bucket-title');
  const rlLiquidFill = document.getElementById('rl-liquid-fill');
  const rlTokenCount = document.getElementById('rl-token-count');
  const rlMetricTotal = document.getElementById('rl-metric-total');
  const rlMetricAllowed = document.getElementById('rl-metric-allowed');
  const rlMetricBlocked = document.getElementById('rl-metric-blocked');
  const rlHeadersPreview = document.getElementById('rl-headers-preview');
  const btnRlRequest = document.getElementById('btn-rl-request');
  const btnRlBurst = document.getElementById('btn-rl-burst');
  const btnRlToggle = document.getElementById('btn-rl-toggle');
  const btnRlReset = document.getElementById('btn-rl-reset');

  const RL_CAPACITY = 10;
  let currentTokens = 10;
  let rlTotal = 0;
  let rlAllowed = 0;
  let rlBlocked = 0;
  let rlAutoInterval = null;

  // Refill timer for Token Bucket & Leaky Bucket
  setInterval(() => {
    const algo = rlAlgoSelect ? rlAlgoSelect.value : 'token-bucket';
    if (algo === 'token-bucket') {
      if (currentTokens < RL_CAPACITY) {
        currentTokens = Math.min(RL_CAPACITY, currentTokens + 1);
        updateRateLimiterUI();
      }
    } else if (algo === 'leaky-bucket') {
      if (currentTokens > 0) {
        currentTokens = Math.max(0, currentTokens - 1);
        updateRateLimiterUI();
      }
    }
  }, 600);

  function updateRateLimiterUI(lastStatus = 200, remaining = currentTokens) {
    if (!rlTokenCount) return;
    const algo = rlAlgoSelect.value;
    
    if (algo === 'token-bucket') {
      rlBucketTitle.textContent = `TOKEN BUCKET (Tokens: ${currentTokens}/${RL_CAPACITY})`;
      const pct = (currentTokens / RL_CAPACITY) * 100;
      rlLiquidFill.style.height = `${pct}%`;
      rlLiquidFill.style.background = 'linear-gradient(180deg, rgba(56, 189, 248, 0.8), rgba(37, 99, 235, 0.9))';
      rlTokenCount.textContent = `${currentTokens} 🪙`;
    } else if (algo === 'leaky-bucket') {
      rlBucketTitle.textContent = `LEAKY BUCKET (Fila: ${currentTokens}/${RL_CAPACITY})`;
      const pct = (currentTokens / RL_CAPACITY) * 100;
      rlLiquidFill.style.height = `${pct}%`;
      rlLiquidFill.style.background = 'linear-gradient(180deg, rgba(244, 63, 94, 0.8), rgba(225, 29, 72, 0.9))';
      rlTokenCount.textContent = `${currentTokens} 💧`;
    } else {
      rlBucketTitle.textContent = `JANELA CONTADORA (Carga: ${currentTokens}/${RL_CAPACITY})`;
      const pct = (currentTokens / RL_CAPACITY) * 100;
      rlLiquidFill.style.height = `${pct}%`;
      rlTokenCount.textContent = `${currentTokens} / ${RL_CAPACITY}`;
    }

    rlMetricTotal.textContent = rlTotal;
    rlMetricAllowed.textContent = rlAllowed;
    rlMetricBlocked.textContent = rlBlocked;

    if (lastStatus === 200) {
      rlHeadersPreview.innerHTML = `HTTP/1.1 200 OK<br>Content-Type: application/json<br><span style="color:var(--accent-emerald);">RateLimit-Limit: ${RL_CAPACITY}</span><br><span style="color:var(--accent-cyan);">RateLimit-Remaining: ${Math.max(0, remaining)}</span><br>RateLimit-Reset: 1s`;
    } else {
      rlHeadersPreview.innerHTML = `<span style="color:var(--accent-rose); font-weight:700;">HTTP/1.1 429 Too Many Requests</span><br>Content-Type: application/json<br><span style="color:var(--accent-rose);">RateLimit-Limit: ${RL_CAPACITY}</span><br><span style="color:var(--accent-rose);">RateLimit-Remaining: 0</span><br><span style="color:var(--accent-amber);">Retry-After: 3s</span><br>{"error": "Quota exceeded. Try again in 3s."}`;
    }
  }

  function handleRateLimitRequest() {
    rlTotal++;
    const algo = rlAlgoSelect.value;
    let allowed = false;

    if (algo === 'token-bucket') {
      if (currentTokens > 0) {
        currentTokens--;
        allowed = true;
      }
    } else if (algo === 'leaky-bucket') {
      if (currentTokens < RL_CAPACITY) {
        currentTokens++;
        allowed = true;
      }
    } else {
      // Fixed Window
      if (currentTokens < RL_CAPACITY) {
        currentTokens++;
        allowed = true;
      }
    }

    if (allowed) {
      rlAllowed++;
      updateRateLimiterUI(200, algo === 'token-bucket' ? currentTokens : RL_CAPACITY - currentTokens);
    } else {
      rlBlocked++;
      updateRateLimiterUI(429, 0);
    }
  }

  if (btnRlRequest) {
    btnRlRequest.addEventListener('click', handleRateLimitRequest);
    btnRlBurst.addEventListener('click', () => {
      for (let i = 0; i < 15; i++) {
        setTimeout(handleRateLimitRequest, i * 40);
      }
    });

    btnRlToggle.addEventListener('click', () => {
      if (!rlAutoInterval) {
        btnRlToggle.textContent = '⏹ Parar Gerador';
        btnRlToggle.classList.add('active');
        rlAutoInterval = setInterval(handleRateLimitRequest, 200);
      } else {
        btnRlToggle.textContent = '▶ Gerador Automático';
        btnRlToggle.classList.remove('active');
        clearInterval(rlAutoInterval);
        rlAutoInterval = null;
      }
    });

    btnRlReset.addEventListener('click', () => {
      if (rlAutoInterval) {
        clearInterval(rlAutoInterval);
        rlAutoInterval = null;
        btnRlToggle.textContent = '▶ Gerador Automático';
        btnRlToggle.classList.remove('active');
      }
      currentTokens = rlAlgoSelect.value === 'leaky-bucket' ? 0 : RL_CAPACITY;
      rlTotal = 0;
      rlAllowed = 0;
      rlBlocked = 0;
      updateRateLimiterUI(200, RL_CAPACITY);
      showToast('Playground de Rate Limiting resetado.');
    });

    if (rlAlgoSelect) {
      rlAlgoSelect.addEventListener('change', () => {
        currentTokens = rlAlgoSelect.value === 'leaky-bucket' ? 0 : RL_CAPACITY;
        updateRateLimiterUI();
      });
    }
  }

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 4: Cache Hierarchy & Anomaly Lab (Slide 24)
  // -------------------------------------------------------------
  const btnFlowHit = document.getElementById('btn-flow-hit');
  const btnFlowRedis = document.getElementById('btn-flow-redis');
  const btnFlowMiss = document.getElementById('btn-flow-miss');
  const btnSimAvalanche = document.getElementById('btn-sim-avalanche');
  const btnSimStampede = document.getElementById('btn-sim-stampede');
  const btnSimPenetration = document.getElementById('btn-sim-penetration');
  const anomalyTitle = document.getElementById('anomaly-title');
  const anomalyMetric = document.getElementById('anomaly-metric');
  const anomalyDesc = document.getElementById('anomaly-desc');

  const cacheNodes = {
    client: document.getElementById('c-node-client'),
    cdn: document.getElementById('c-node-cdn'),
    proxy: document.getElementById('c-node-proxy'),
    redis: document.getElementById('c-node-redis'),
    db: document.getElementById('c-node-db')
  };

  function resetCacheNodes() {
    Object.values(cacheNodes).forEach(node => {
      if (node) {
        node.className = 'cache-layer-node';
      }
    });
  }

  if (btnFlowHit) {
    btnFlowHit.addEventListener('click', () => {
      resetCacheNodes();
      cacheNodes.client.classList.add('active-flow');
      setTimeout(() => {
        cacheNodes.cdn.classList.add('hit');
        anomalyTitle.textContent = 'Resultado: Edge Cache Hit (CDN)';
        anomalyMetric.textContent = 'Latência Total: 8ms';
        anomalyDesc.textContent = 'A requisição foi resolvida no Point of Presence (PoP) mais próximo do usuário com zero tráfego repassado à origem.';
      }, 300);
    });

    btnFlowRedis.addEventListener('click', () => {
      resetCacheNodes();
      cacheNodes.client.classList.add('active-flow');
      cacheNodes.cdn.classList.add('miss');
      setTimeout(() => {
        cacheNodes.proxy.classList.add('active-flow');
        cacheNodes.redis.classList.add('hit');
        anomalyTitle.textContent = 'Resultado: Distributed Cache Hit (Redis Cluster)';
        anomalyMetric.textContent = 'Latência Total: 22ms';
        anomalyDesc.textContent = 'Cache Miss na CDN, porém o dado quente foi recuperado da memória RAM do cluster Redis, poupando a base de dados SQL.';
      }, 400);
    });

    btnFlowMiss.addEventListener('click', () => {
      resetCacheNodes();
      cacheNodes.client.classList.add('active-flow');
      cacheNodes.cdn.classList.add('miss');
      cacheNodes.proxy.classList.add('active-flow');
      cacheNodes.redis.classList.add('miss');
      setTimeout(() => {
        cacheNodes.db.classList.add('hit');
        anomalyTitle.textContent = 'Resultado: Full Cache Miss (DB Fetch & Cache-Aside)';
        anomalyMetric.textContent = 'Latência Total: 120ms';
        anomalyDesc.textContent = 'Dado ausente em todos os níveis. Buscado no disco do PostgreSQL e retroalimentado no Redis para as próximas consultas.';
      }, 600);
    });

    btnSimAvalanche.addEventListener('click', () => {
      resetCacheNodes();
      cacheNodes.redis.classList.add('miss');
      cacheNodes.db.classList.add('miss');
      anomalyTitle.innerHTML = '<span style="color:var(--accent-rose);">ALERTA: CACHE AVALANCHE DETECTADA!</span>';
      anomalyMetric.textContent = 'Queda do Banco de Dados';
      anomalyDesc.innerHTML = 'Milhares de chaves expiraram no mesmo segundo! <strong>Mitigação:</strong> Adicionar <code>TTL Jitter</code> (ex: TTL base 3600s + random(0, 300s)) para distribuir expirações no tempo.';
    });

    btnSimStampede.addEventListener('click', () => {
      resetCacheNodes();
      cacheNodes.redis.classList.add('miss');
      cacheNodes.db.classList.add('miss');
      anomalyTitle.innerHTML = '<span style="color:var(--accent-amber);">ALERTA: CACHE STAMPEDE / THUNDERING HERD</span>';
      anomalyMetric.textContent = '100 queries simultâneas para mesma chave';
      anomalyDesc.innerHTML = 'Chave quente expirou e centenas de threads dispararam queries concorrentes idênticas. <strong>Mitigação:</strong> Trava Distribuída (Mutex) ou Algoritmo XFetch (Probabilistic Early Refresh).';
    });

    btnSimPenetration.addEventListener('click', () => {
      resetCacheNodes();
      cacheNodes.db.classList.add('miss');
      anomalyTitle.innerHTML = '<span style="color:var(--accent-purple);">ALERTA: CACHE PENETRATION (Ataque Malicioso)</span>';
      anomalyMetric.textContent = 'Consultas por IDs inexistentes';
      anomalyDesc.innerHTML = 'Requisições buscando <code>id = -99999</code> bypassam o cache e atingem o banco. <strong>Mitigação:</strong> Adicionar <strong>Bloom Filters</strong> na borda ou cachear valores nulos.';
    });
  }

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 5: HTTP Cache Headers Sandbox (Slide 25)
  // -------------------------------------------------------------
  const httpCcSelect = document.getElementById('http-cc-select');
  const btnHttpFirst = document.getElementById('btn-http-first');
  const btnHttpCond = document.getElementById('btn-http-cond');
  const httpReqPreview = document.getElementById('http-req-preview');
  const httpResPreview = document.getElementById('http-res-preview');

  if (btnHttpFirst && btnHttpCond) {
    btnHttpFirst.addEventListener('click', () => {
      const cc = httpCcSelect.value;
      httpReqPreview.innerHTML = `GET /api/v1/cursos HTTP/1.1<br>Host: api.fatec.sp.gov.br<br>Accept: application/json`;
      httpResPreview.innerHTML = `<span style="color:var(--accent-emerald);">HTTP/1.1 200 OK</span><br>Content-Type: application/json<br>Cache-Control: ${cc}<br>ETag: W/"a9c41f92e8d"<br>CF-Cache-Status: MISS<br>Payload Size: 42.5 KB (Download Completo)`;
    });

    btnHttpCond.addEventListener('click', () => {
      const cc = httpCcSelect.value;
      httpReqPreview.innerHTML = `GET /api/v1/cursos HTTP/1.1<br>Host: api.fatec.sp.gov.br<br><span style="color:var(--accent-cyan);">If-None-Match: W/"a9c41f92e8d"</span><br>Accept: application/json`;
      
      if (cc.includes('no-store')) {
        httpResPreview.innerHTML = `<span style="color:var(--accent-emerald);">HTTP/1.1 200 OK</span><br>Content-Type: application/json<br>Cache-Control: no-store<br>Payload Size: 42.5 KB (Revalidação proibida por no-store)`;
      } else {
        httpResPreview.innerHTML = `<span style="color:var(--accent-cyan); font-weight:700;">HTTP/1.1 304 Not Modified</span><br>ETag: W/"a9c41f92e8d"<br>Cache-Control: ${cc}<br><span style="color:var(--accent-emerald); font-weight:700;">Payload Size: 0 Bytes (Servido da memória/disco local!)</span>`;
      }
    });
  }

});
