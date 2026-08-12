// Interactive Slide Deck Application Logic for Part 2
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
    const titleText = titleEl ? titleEl.textContent : `Slide ${idx + 1}`;
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
      document.documentElement.requestFullscreen().catch(err => {
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

  // Event Listeners
  btnPrev.addEventListener('click', prevSlide);
  btnNext.addEventListener('click', nextSlide);
  btnOverview.addEventListener('click', openOverviewModal);
  btnNotes.addEventListener('click', togglePresenterNotes);
  btnFullscreen.addEventListener('click', toggleFullscreen);
  modalClose.addEventListener('click', closeOverviewModal);

  overviewModal.addEventListener('click', (e) => {
    if (e.target === overviewModal) closeOverviewModal();
  });

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

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
    }
  });

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 1: Cache Pattern Simulator (Cache-Aside)
  // -------------------------------------------------------------
  const btnCacheRead = document.getElementById('btn-cache-read');
  const btnCacheClear = document.getElementById('btn-cache-clear');
  const cacheStatusLabel = document.getElementById('cache-status-label');
  const cacheExplainText = document.getElementById('cache-explain-text');
  const cacheNodeBox = document.getElementById('cache-node-box');

  let isCachePopulated = false;

  if (btnCacheRead) {
    btnCacheRead.addEventListener('click', () => {
      if (!isCachePopulated) {
        // Cache Miss
        cacheStatusLabel.textContent = "MISS ➔ LER DO DB (150ms)";
        cacheStatusLabel.style.color = "#f43f5e";
        cacheNodeBox.style.borderColor = "#f43f5e";
        cacheExplainText.innerHTML = `<span style="color:#f43f5e; font-weight:700;">CACHE MISS!</span> A aplicação não encontrou o dado no Redis Cache. Foi ao banco PostgreSQL (150ms), retornou ao cliente e salvou uma cópia no Redis Cache.`;
        showToast('Cache Miss! Dado consultado no banco e populado no Redis.');
        isCachePopulated = true;
      } else {
        // Cache Hit
        cacheStatusLabel.textContent = "HIT ➔ RETORNADO DA MEMÓRIA (1ms)";
        cacheStatusLabel.style.color = "#34d399";
        cacheNodeBox.style.borderColor = "#34d399";
        cacheExplainText.innerHTML = `<span style="color:#34d399; font-weight:700;">CACHE HIT!</span> O dado estava pronto na memória RAM do Redis. Retornado em 1ms sem tocar no banco de dados.`;
        showToast('Cache Hit! Leitura em 1ms a partir da RAM.');
      }
    });
  }

  if (btnCacheClear) {
    btnCacheClear.addEventListener('click', () => {
      isCachePopulated = false;
      cacheStatusLabel.textContent = "STATUS: VAZIO (MISS)";
      cacheStatusLabel.style.color = "#aaa";
      cacheNodeBox.style.borderColor = "var(--border-color)";
      cacheExplainText.textContent = "Cache evicto / descarregado. A próxima leitura resultará em Cache Miss.";
      showToast('Cache limpo!');
    });
  }

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 2: Rendering Pattern Waterfall Timeline
  // -------------------------------------------------------------
  const renderBtns = document.querySelectorAll('#rendering-tabs-bar .btn-nav');
  const renderTitle = document.getElementById('render-pattern-title');
  const renderDesc = document.getElementById('render-pattern-desc');
  const wfTTFB = document.getElementById('wf-ttfb');
  const wfFCP = document.getElementById('wf-fcp');
  const wfHydr = document.getElementById('wf-hydr');

  const renderData = {
    ssr: {
      title: "Server-Side Rendering (SSR)",
      desc: "O servidor processa a requisição, busca dados no banco e envia o HTML 100% pronto. <strong>Prós:</strong> Excelente SEO e visualização rápida (FCP). <strong>Contras:</strong> Maior tempo até o primeiro byte (TTFB).",
      ttfb: "45%", ttfbText: "450ms (Server Render)",
      fcp: "55%", fcpText: "550ms (HTML Visual)",
      hydr: "75%", hydrText: "750ms (JS Hydrated)"
    },
    csr: {
      title: "Client-Side Rendering (CSR - SPA)",
      desc: "O servidor envia um HTML praticamente vazio com uma tag de script JS. O navegador baixa o bundle JS e renderiza a tela. <strong>Prós:</strong> Transições de rota ultra fluidas. <strong>Contras:</strong> SEO complexo e FCP inicial lento.",
      ttfb: "15%", ttfbText: "100ms (HTML Vazio)",
      fcp: "70%", fcpText: "900ms (Baixou JS)",
      hydr: "90%", hydrText: "1200ms (Executou App)"
    },
    ssg: {
      title: "Static Site Generation (SSG)",
      desc: "As páginas HTML são pré-geradas durante o Build do projeto e servidas via CDN Edge. <strong>Prós:</strong> Performance imbatível (TTFB sub-50ms) e segurança máxima. <strong>Contras:</strong> Tempo de build longo para milhares de páginas.",
      ttfb: "10%", ttfbText: "40ms (CDN Edge Hit)",
      fcp: "25%", fcpText: "150ms (Pintura Tela)",
      hydr: "40%", hydrText: "300ms (Pronto)"
    },
    isr: {
      title: "Incremental Static Regeneration (ISR)",
      desc: "Combina o melhor do SSG e SSR: gera páginas estáticas sob demanda ou em background com revalidação temporal (stale-while-revalidate). <strong>Prós:</strong> Escala milhões de páginas sem rebuild total.",
      ttfb: "15%", ttfbText: "60ms (Static Cache)",
      fcp: "30%", fcpText: "180ms (Paint)",
      hydr: "45%", hydrText: "350ms (Background Revalidate)"
    }
  };

  renderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      renderBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-render');
      const data = renderData[key];
      if (data) {
        renderTitle.innerHTML = data.title;
        renderDesc.innerHTML = data.desc;
        wfTTFB.style.width = data.ttfb;
        wfTTFB.textContent = data.ttfbText;
        wfFCP.style.width = data.fcp;
        wfFCP.textContent = data.fcpText;
        wfHydr.style.width = data.hydr;
        wfHydr.textContent = data.hydrText;
      }
    });
  });

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 3: Circuit Breaker State Machine
  // -------------------------------------------------------------
  const btnCbTrigger = document.getElementById('btn-cb-trigger');
  const btnCbReset = document.getElementById('btn-cb-reset');
  const cbNodeClosed = document.getElementById('cb-node-closed');
  const cbNodeOpen = document.getElementById('cb-node-open');
  const cbNodeHalf = document.getElementById('cb-node-half');
  const cbStatusText = document.getElementById('cb-status-text');

  let cbState = 'closed'; // closed, open, half

  function setCbState(state) {
    cbState = state;
    cbNodeClosed.className = 'cb-state-node';
    cbNodeOpen.className = 'cb-state-node';
    cbNodeHalf.className = 'cb-state-node';

    if (state === 'closed') {
      cbNodeClosed.classList.add('active-closed');
      cbStatusText.innerHTML = `O disjuntor está <strong style="color:var(--accent-emerald);">FECHADO (Normal)</strong>. Todas as requisições passam diretamente para o serviço de destino.`;
    } else if (state === 'open') {
      cbNodeOpen.classList.add('active-open');
      cbStatusText.innerHTML = `<span style="color:var(--accent-rose); font-weight:700;">⚠️ DISJUNTOR ABERTO!</span> O serviço destino apresentou falhas consecutivas. Requisições são <strong>rejeitadas instantaneamente</strong> sem sobrecarregar a rede.`;
    } else {
      cbNodeHalf.classList.add('active-half');
      cbStatusText.innerHTML = `<span style="color:var(--accent-amber); font-weight:700;">🟡 DISJUNTOR HALF-OPEN (Teste)</span>. Enviando requisições de sonda para verificar se o serviço de destino se recuperou.`;
    }
  }

  if (btnCbTrigger) {
    btnCbTrigger.addEventListener('click', () => {
      if (cbState === 'closed') {
        setCbState('open');
        showToast('5 falhas consecutivas! Circuit Breaker abriu.');
      } else if (cbState === 'open') {
        setCbState('half');
        showToast('Tempo de cooldown expirou. Circuit Breaker entrou em Half-Open.');
      } else {
        setCbState('closed');
        showToast('Teste de sonda aprovado! Circuit Breaker fechou.');
      }
    });
  }

  if (btnCbReset) {
    btnCbReset.addEventListener('click', () => {
      setCbState('closed');
      showToast('Circuit Breaker resetado para o estado Fechado.');
    });
  }

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 4: Token Bucket Rate Limiter
  // -------------------------------------------------------------
  const btnSendRequest = document.getElementById('btn-send-request');
  const bucketDisplay = document.getElementById('token-bucket-display');
  const bucketExplainText = document.getElementById('bucket-explain-text');

  let tokensAvailable = 4;
  const maxTokens = 4;

  if (btnSendRequest) {
    btnSendRequest.addEventListener('click', () => {
      if (tokensAvailable > 0) {
        tokensAvailable--;
        renderBucketTokens();
        bucketExplainText.innerHTML = `<span style="color:var(--accent-cyan); font-weight:700;">REQUISIÇÃO ACEITA (HTTP 200 OK)</span>. Tokens restantes no balde: ${tokensAvailable}/${maxTokens}.`;
        showToast('HTTP 200 OK - Requisição permitida');
      } else {
        bucketExplainText.innerHTML = `<span style="color:var(--accent-rose); font-weight:700;">⚠️ HTTP 429 TOO MANY REQUESTS!</span> O balde de tokens esvaziou. A API bloqueou a requisição para conter abusos / DDoS.`;
        showToast('HTTP 429 Too Many Requests - Taxa limite atingida!');
      }
    });

    // Auto-refill tokens every 3 seconds
    setInterval(() => {
      if (tokensAvailable < maxTokens) {
        tokensAvailable++;
        renderBucketTokens();
      }
    }, 3000);
  }

  function renderBucketTokens() {
    bucketDisplay.innerHTML = '';
    for (let i = 0; i < tokensAvailable; i++) {
      const pill = document.createElement('div');
      pill.className = 'token-pill';
      bucketDisplay.appendChild(pill);
    }
  }

  // Initial render
  updateSlides();
});
