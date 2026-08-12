// Interactive Slide Deck Application Logic
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
  // INTERACTIVE MODULE 1: Web Lifecycle Simulator
  // -------------------------------------------------------------
  const lifecycleStepsData = [
    {
      title: "1. Entrada da URL",
      badge: "CLIENTE",
      desc: "O usuário digita https://www.fatec.sp.gov.br e o navegador valida o protocolo e o domínio.",
      code: "URL: https://www.fatec.sp.gov.br:443/index.html\nProtocolo: HTTPS (Porta 443)\nHost: www.fatec.sp.gov.br"
    },
    {
      title: "2. Resolução DNS",
      badge: "DNS LOOKUP",
      desc: "O navegador consulta o cache local e o servidor DNS para converter o nome de domínio no endereço IP do servidor destino.",
      code: "Consulta: www.fatec.sp.gov.br -> DNS Root -> TLD .br -> Authoritative NS\nResposta IP: 192.0.2.1 (Endereço IPv4 de destino)"
    },
    {
      title: "3. Conexão TCP / TLS Handshake",
      badge: "REDE TCP/IP",
      desc: "O navegador estabelece um canal confiável enviando pacotes SYN -> SYN-ACK -> ACK e negociando criptografia TLS 1.3.",
      code: "Client -> SYN (Seq=0)\nServer -> SYN-ACK (Seq=0, Ack=1)\nClient -> ACK (Seq=1, Ack=1)\n[Conexão Criptografada Segura Estabelecida]"
    },
    {
      title: "4. Requisição & Resposta HTTP",
      badge: "HTTP PROTOCOL",
      desc: "O cliente envia 'GET /index.html HTTP/1.1' com cabeçalhos. O servidor processa e responde com Status 200 OK e os ativos.",
      code: "REQUEST: GET /index.html HTTP/1.1 Host: www.fatec.sp.gov.br User-Agent: Chrome/128.0\nRESPONSE: HTTP/1.1 200 OK Content-Type: text/html; charset=utf-8\nPayload: <html><head>...</head><body>...</body></html>"
    },
    {
      title: "5. Renderização (DOM & Paint)",
      badge: "BROWSER ENGINE",
      desc: "O navegador processa o HTML (DOM Tree), interpreta o CSS (CSSOM Tree), executa scripts JS e desenha os pixels na tela.",
      code: "1. Construct DOM Tree\n2. Construct CSSOM Tree\n3. Combine into Render Tree\n4. Layout (Calcula dimensões)\n5. Paint (Desenha elementos na GPU)"
    }
  ];

  let currentLifecycleStep = 0;
  let lifecycleInterval = null;

  function renderLifecycleStep(stepIdx) {
    currentLifecycleStep = stepIdx;
    const nodes = document.querySelectorAll('.step-node');
    nodes.forEach((node, i) => {
      node.classList.remove('active', 'completed');
      if (i < stepIdx) node.classList.add('completed');
      if (i === stepIdx) node.classList.add('active');
    });

    const data = lifecycleStepsData[stepIdx];
    document.getElementById('lc-badge').textContent = data.badge;
    document.getElementById('lc-title').textContent = data.title;
    document.getElementById('lc-desc').textContent = data.desc;
    document.getElementById('lc-code').textContent = data.code;
  }

  document.querySelectorAll('.step-node').forEach((node, idx) => {
    node.addEventListener('click', () => {
      stopLifecycleAuto();
      renderLifecycleStep(idx);
    });
  });

  const btnLcPlay = document.getElementById('lc-btn-play');
  const btnLcNext = document.getElementById('lc-btn-next');
  const btnLcReset = document.getElementById('lc-btn-reset');

  function stopLifecycleAuto() {
    if (lifecycleInterval) {
      clearInterval(lifecycleInterval);
      lifecycleInterval = null;
      btnLcPlay.textContent = "▶ Executar Sequência";
    }
  }

  btnLcPlay.addEventListener('click', () => {
    if (lifecycleInterval) {
      stopLifecycleAuto();
    } else {
      btnLcPlay.textContent = "⏸ Pausar";
      lifecycleInterval = setInterval(() => {
        let next = (currentLifecycleStep + 1) % lifecycleStepsData.length;
        renderLifecycleStep(next);
      }, 2200);
    }
  });

  btnLcNext.addEventListener('click', () => {
    stopLifecycleAuto();
    let next = (currentLifecycleStep + 1) % lifecycleStepsData.length;
    renderLifecycleStep(next);
  });

  btnLcReset.addEventListener('click', () => {
    stopLifecycleAuto();
    renderLifecycleStep(0);
  });

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 2: DevTools Explorer Mockup
  // -------------------------------------------------------------
  const devtoolsPanelsData = {
    elements: {
      title: "Aba Elementos (DOM & CSS)",
      content: "Permite inspecionar a árvore DOM em tempo real, editar tags HTML, modificar propriedades CSS e testar responsividade visual instantaneamente. Ideal para ajustar layouts e entender a hierarquia da página."
    },
    console: {
      title: "Aba Console (JavaScript & Logs)",
      content: "Exibe mensagens de erro em tempo real, avisos, logs (console.log) e permite executar scripts JavaScript diretamente no contexto da página atual. É o principal terminal de depuração do desenvolvedor."
    },
    sources: {
      title: "Aba Fontes (Sources & Breakpoints)",
      content: "Inspecione todos os arquivos carregados pelo site (HTML, CSS, JS). Permite definir Breakpoints, pausar a execução do código linha por linha, observar variáveis no escopo e analisar a Call Stack."
    },
    network: {
      title: "Aba Rede (Network Requests)",
      content: "Monitora cada requisição HTTP/HTTPS realizada. Exibe o status da resposta (200 OK, 404, 500), tempo de resposta (Waterfall), tamanho dos pacotes e cabeçalhos de requisição e resposta."
    },
    performance: {
      title: "Aba Desempenho (Performance & FPS)",
      content: "Grava a atividade do navegador durante o carregamento ou interações para identificar gargalos de CPU, quedas de taxa de quadros (FPS), layout shifts e scripts que travam a Main Thread."
    },
    application: {
      title: "Aba Aplicação (Application & Storage)",
      content: "Inspecione o armazenamento local do cliente: Cookies de sessão, LocalStorage, SessionStorage, IndexedDB, Cache de Service Workers e dados de Progressive Web Apps (PWA)."
    },
    lighthouse: {
      title: "Aba Lighthouse (Auditoria Automática)",
      content: "Ferramenta automatizada de auditoria do Google que avalia 4 pilares: Desempenho, Acessibilidade, Melhores Práticas e SEO, gerando pontuações de 0 a 100 com dicas de otimização."
    }
  };

  const devtabs = document.querySelectorAll('.devtools-tab');
  devtabs.forEach(tab => {
    tab.addEventListener('click', () => {
      devtabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const panelKey = tab.getAttribute('data-tab');
      const data = devtoolsPanelsData[panelKey];
      if (data) {
        document.getElementById('dt-panel-title').textContent = data.title;
        document.getElementById('dt-panel-content').textContent = data.content;
      }
    });
  });

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 3: Architecture Comparison (Monolith vs Microservices)
  // -------------------------------------------------------------
  const archBtnMono = document.getElementById('arch-btn-mono');
  const archBtnMicro = document.getElementById('arch-btn-micro');
  const archDiagram = document.getElementById('arch-diagram');
  const btnSimCrash = document.getElementById('btn-sim-crash');
  let currentArchMode = 'monolith';

  function renderArchitectureMode(mode) {
    currentArchMode = mode;
    archBtnMono.classList.toggle('active', mode === 'monolith');
    archBtnMicro.classList.toggle('active', mode === 'microservices');

    if (mode === 'monolith') {
      archDiagram.innerHTML = `
        <div style="text-align: center; width: 100%;">
          <div style="background: rgba(56, 189, 248, 0.1); border: 2px dashed #38bdf8; border-radius: 12px; padding: 24px; max-width: 500px; margin: 0 auto;" id="mono-box">
            <h4 style="color: #38bdf8; font-size: 1.1rem; margin-bottom: 12px;">Monolito Modular (Aplicação Única)</h4>
            <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 16px;">
              <span style="background: #1e293b; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; border: 1px solid #334155;" class="mono-module">Módulo Usuários</span>
              <span style="background: #1e293b; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; border: 1px solid #334155;" class="mono-module">Módulo Vendas</span>
              <span style="background: #1e293b; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; border: 1px solid #334155;" class="mono-module">Módulo Pagamentos</span>
            </div>
            <p style="font-size: 0.85rem; color: #94a3b8;">Deploy único • Banco de dados compartilhado • Latência zero em memória</p>
          </div>
        </div>
      `;
    } else {
      archDiagram.innerHTML = `
        <div style="width: 100%;">
          <div style="display: flex; justify-content: center; gap: 16px; align-items: center; flex-wrap: wrap;">
            <div style="background: rgba(192, 132, 252, 0.15); border: 1px solid #c084fc; padding: 12px; border-radius: 10px; text-align: center; min-width: 120px;">
              <strong style="color: #c084fc; font-size: 0.85rem;">API Gateway</strong>
              <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 4px;">Roteador / Auth</div>
            </div>
            <div style="font-size: 1.2rem; color: #94a3b8;">➔</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;" id="micro-services-grid">
              <div style="background: #1e293b; border: 1px solid #34d399; padding: 14px; border-radius: 10px; text-align: center;" class="micro-box">
                <strong style="color: #34d399; font-size: 0.85rem;">Auth Service</strong>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 4px;">Node.js / Redis</div>
              </div>
              <div style="background: #1e293b; border: 1px solid #38bdf8; padding: 14px; border-radius: 10px; text-align: center;" class="micro-box">
                <strong style="color: #38bdf8; font-size: 0.85rem;">Order Service</strong>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 4px;">Go / Postgres</div>
              </div>
              <div style="background: #1e293b; border: 1px solid #fbbf24; padding: 14px; border-radius: 10px; text-align: center;" class="micro-box" id="pay-service">
                <strong style="color: #fbbf24; font-size: 0.85rem;">Payment Service</strong>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 4px;">Java / Kafka</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  archBtnMono.addEventListener('click', () => renderArchitectureMode('monolith'));
  archBtnMicro.addEventListener('click', () => renderArchitectureMode('microservices'));

  btnSimCrash.addEventListener('click', () => {
    if (currentArchMode === 'monolith') {
      const box = document.getElementById('mono-box');
      if (box) {
        box.style.borderColor = '#f43f5e';
        box.style.background = 'rgba(244, 63, 94, 0.2)';
        box.querySelector('h4').textContent = '⚠️ FALHA GERAL NO MONOLITO (SPOF)!';
        box.querySelector('h4').style.color = '#f43f5e';
        showToast('Monolito caiu! Toda a aplicação ficou indisponível.');
      }
    } else {
      const payService = document.getElementById('pay-service');
      if (payService) {
        payService.style.borderColor = '#f43f5e';
        payService.style.background = 'rgba(244, 63, 94, 0.2)';
        payService.querySelector('strong').textContent = '💥 Payment Service Offline';
        payService.querySelector('strong').style.color = '#f43f5e';
        showToast('Payment Service caiu! Auth Service e Order Service continuam rodando 100%.');
      }
    }
  });

  // Initial render
  renderArchitectureMode('monolith');

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 4: Stateless vs Stateful Failover Simulator
  // -------------------------------------------------------------
  const btnSimFailover = document.getElementById('btn-sim-failover');
  let isServer1Alive = true;

  if (btnSimFailover) {
    btnSimFailover.addEventListener('click', () => {
      isServer1Alive = !isServer1Alive;
      const s1 = document.getElementById('server-node-1');
      const s2 = document.getElementById('server-node-2');
      const statusStateless = document.getElementById('stateless-status-text');

      if (!isServer1Alive) {
        if (s1) {
          s1.style.borderColor = '#f43f5e';
          s1.style.background = 'rgba(244, 63, 94, 0.15)';
          s1.querySelector('.server-badge').textContent = 'OFFLINE';
          s1.querySelector('.server-badge').style.background = '#f43f5e';
        }
        if (s2) {
          s2.style.borderColor = '#34d399';
          s2.style.background = 'rgba(52, 211, 153, 0.15)';
          s2.querySelector('.server-badge').textContent = 'ROTEANDO REQUISIÇÕES';
          s2.querySelector('.server-badge').style.background = '#34d399';
        }
        if (statusStateless) {
          statusStateless.innerHTML = `<span style="color:#34d399;">✅ Servidor 1 caiu. A próxima requisição enviou o JWT para o Servidor 2, que validou a assinatura criptográfica e manteve o usuário logado com 0 segundos de interrupção!</span>`;
        }
        showToast('Failover executado! JWT permite troca de servidor instantânea.');
      } else {
        if (s1) {
          s1.style.borderColor = '#38bdf8';
          s1.style.background = '#1e293b';
          s1.querySelector('.server-badge').textContent = 'ONLINE (Instância A)';
          s1.querySelector('.server-badge').style.background = '#38bdf8';
        }
        if (s2) {
          s2.style.borderColor = '#3b82f6';
          s2.style.background = '#1e293b';
          s2.querySelector('.server-badge').textContent = 'ONLINE (Instância B)';
          s2.querySelector('.server-badge').style.background = '#3b82f6';
        }
        if (statusStateless) {
          statusStateless.textContent = 'Ambas as instâncias estão prontas para autenticar requisições com JWT.';
        }
      }
    });
  }

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 5: Dedicated CAP Theorem & Network Partition Simulator
  // -------------------------------------------------------------
  const capNodes = document.querySelectorAll('.cap-node');
  const capDetailsTitle = document.getElementById('cap-details-title');
  const capDetailsDesc = document.getElementById('cap-details-desc');
  const btnTogglePartition = document.getElementById('btn-toggle-partition');
  const netLinkStatus = document.getElementById('net-link-status');
  const netExplain = document.getElementById('net-partition-explain');

  let activeCapMode = 'c';
  let isNetworkPartitioned = false;

  const capInfo = {
    c: {
      title: "Consistência (Consistency)",
      desc: "<strong>Definição:</strong> Todos os nós da rede retornam exatamente os mesmos dados mais recentes simultaneamente. Uma leitura em qualquer servidor garante retornar a última escrita.<br><br><strong>Como funciona:</strong> Quando uma escrita ocorre no Nó A, ela bloqueia leituras no Nó B até que os dados sejam completamente propagados.<br><br><strong>Exemplo de Banco:</strong> PostgreSQL com Replicação Síncrona, MongoDB com Majority Write Concern."
    },
    a: {
      title: "Disponibilidade (Availability)",
      desc: "<strong>Definição:</strong> Toda requisição não-com falha enviada a qualquer nó funcional recebe uma resposta de sucesso (HTTP 200 OK), sem garantia de ser o dado mais recente.<br><br><strong>Como funciona:</strong> Mesmo se os servidores perderem comunicação entre si, cada servidor continua atendendo clientes com a cópia local de dados que possui.<br><br><strong>Exemplo de Banco:</strong> Apache Cassandra, AWS DynamoDB, CouchDB."
    },
    p: {
      title: "Tolerância a Partição (Partition Tolerance)",
      desc: "<strong>Definição:</strong> O sistema continua funcionando apesar de perdas arbitrárias de mensagens ou falhas de rede entre os nós.<br><br><strong>Premissa Inevitável:</strong> Em sistemas distribuídos na nuvem ou na Internet, <em>partições de rede sempre acontecem</em> (cabos rompidos, latência alta). Por isso, a escolha real é entre <strong>CP</strong> (Consistência + Partição) ou <strong>AP</strong> (Disponibilidade + Partição)."
    }
  };

  capNodes.forEach(node => {
    node.addEventListener('click', () => {
      capNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      activeCapMode = node.getAttribute('data-cap');
      updateCapDisplay();
    });
  });

  if (btnTogglePartition) {
    btnTogglePartition.addEventListener('click', () => {
      isNetworkPartitioned = !isNetworkPartitioned;
      updateCapDisplay();
    });
  }

  function updateCapDisplay() {
    if (capInfo[activeCapMode]) {
      capDetailsTitle.innerHTML = capInfo[activeCapMode].title;
      capDetailsDesc.innerHTML = capInfo[activeCapMode].desc;
    }

    if (isNetworkPartitioned) {
      netLinkStatus.textContent = "💥 PARTIÇÃO ATIVA (Cabo Rompido)";
      netLinkStatus.className = "network-link-status link-cut";
      btnTogglePartition.textContent = "🔌 Restaurar Conexão de Rede";

      if (activeCapMode === 'c') {
        netExplain.innerHTML = `<span style="color: #f43f5e; font-weight: 700;">[SISTEMA CP - MODO CONSISTÊNCIA]</span><br>A rede entre São Paulo e Virgínia caiu. Como a consistência é a prioridade, o Nó B <strong>bloqueia novas escritas (HTTP 500 Error)</strong> para evitar divergência de dados.</span>`;
        showToast('Partição simulada em sistema CP: Escrita bloqueada para manter consistência!');
      } else {
        netExplain.innerHTML = `<span style="color: #34d399; font-weight: 700;">[SISTEMA AP - MODO DISPONIBILIDADE]</span><br>A rede entre São Paulo e Virgínia caiu. O Nó A e o Nó B continuam respondendo <strong>HTTP 200 OK</strong> para os clientes. Os dados serão reconciliados futuramente via <strong>Consistência Eventual</strong>.</span>`;
        showToast('Partição simulada em sistema AP: Nós continuam operantes via Consistência Eventual!');
      }
    } else {
      netLinkStatus.textContent = "⚡ Conexão OK (Link Direto)";
      netLinkStatus.className = "network-link-status link-ok";
      btnTogglePartition.textContent = "⚡ Cortar Cabo de Rede (Partição)";
      netExplain.innerHTML = "<strong>Estado Normal:</strong> Os dois nós trocam confirmações de escrita síncronas sem falhas na rede.";
    }
  }

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 6: Dedicated Database Decision Matrix Engine
  // -------------------------------------------------------------
  const dbCheckboxes = document.querySelectorAll('.db-opt-btn');
  const dbRecommendationBadge = document.getElementById('db-rec-badge');
  const dbRecommendationReason = document.getElementById('db-rec-reason');
  const dbRecommendationSnippet = document.getElementById('db-rec-snippet');

  let selectedRequirements = new Set();

  dbCheckboxes.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-req');
      if (selectedRequirements.has(val)) {
        selectedRequirements.delete(val);
        btn.classList.remove('selected');
      } else {
        selectedRequirements.add(val);
        btn.classList.add('selected');
      }
      evaluateDatabaseMatch();
    });
  });

  function evaluateDatabaseMatch() {
    if (selectedRequirements.has('acid')) {
      dbRecommendationBadge.textContent = "Recomendação Otimizada: Banco Relacional SQL (PostgreSQL)";
      dbRecommendationBadge.style.borderColor = "#38bdf8";
      dbRecommendationBadge.style.color = "#38bdf8";
      dbRecommendationReason.innerHTML = "<strong>Por que escolher?</strong> Oferece suporte completo a transações ACID (Atomocidade, Consistência, Isolamento e Durabilidade), chaves estrangeiras e garantia absoluta contra corrupção de saldos ou duplicidades financeiras.";
      dbRecommendationSnippet.textContent = "CREATE TABLE contas (\n  id SERIAL PRIMARY KEY,\n  cliente_id INT NOT NULL,\n  saldo NUMERIC(15,2) CHECK (saldo >= 0)\n);";
    } else if (selectedRequirements.has('flexible')) {
      dbRecommendationBadge.textContent = "Recomendação Otimizada: NoSQL Documentos (MongoDB)";
      dbRecommendationBadge.style.borderColor = "#34d399";
      dbRecommendationBadge.style.color = "#34d399";
      dbRecommendationReason.innerHTML = "<strong>Por que escolher?</strong> Permite armazenar estruturas JSON/BSON complexas e aninhadas com esquema dinâmico. Excelente para catálogos de produtos com variações imprevisíveis e prototipagem ágil.";
      dbRecommendationSnippet.textContent = "db.produtos.insertOne({\n  nome: 'Smartphone Pro',\n  preco: 4500.00,\n  especificacoes: { ram: '12GB', armazenamento: '256GB' },\n  tags: ['eletronicos', 'mobile']\n});";
    } else if (selectedRequirements.has('highspeed')) {
      dbRecommendationBadge.textContent = "Recomendação Otimizada: NoSQL Chave-Valor em RAM (Redis)";
      dbRecommendationBadge.style.borderColor = "#c084fc";
      dbRecommendationBadge.style.color = "#c084fc";
      dbRecommendationReason.innerHTML = "<strong>Por que escolher?</strong> Armazena estruturas de dados diretamente na memória RAM com tempo de resposta sub-milissegundo (< 1ms). Essencial para controle de sessão JWT, rate-limiting de APIs e cache de consultas pesadas.";
      dbRecommendationSnippet.textContent = "// Salvar sessão com TTL de 3600 segundos (1h)\nSET session:token_9f8e7d '{\"user_id\": 1042, \"role\": \"admin\"}' EX 3600";
    } else if (selectedRequirements.has('timeseries')) {
      dbRecommendationBadge.textContent = "Recomendação Otimizada: NoSQL Wide-Column (Apache Cassandra / ScyllaDB)";
      dbRecommendationBadge.style.borderColor = "#fbbf24";
      dbRecommendationBadge.style.color = "#fbbf24";
      dbRecommendationReason.innerHTML = "<strong>Por que escolher?</strong> Arquitetura peer-to-peer sem ponto único de falha otimizada para gravar centenas de milhares de eventos por segundo em disco sequencial. Ideal para telemetria IoT e logs de auditoria.";
      dbRecommendationSnippet.textContent = "CREATE TABLE sensor_telemetria (\n  device_id uuid,\n  timestamp timestamp,\n  temperatura float,\n  PRIMARY KEY (device_id, timestamp)\n) WITH CLUSTERING ORDER BY (timestamp DESC);";
    } else if (selectedRequirements.has('graph')) {
      dbRecommendationBadge.textContent = "Recomendação Otimizada: NoSQL Grafos (Neo4j)";
      dbRecommendationBadge.style.borderColor = "#f43f5e";
      dbRecommendationBadge.style.color = "#f43f5e";
      dbRecommendationReason.innerHTML = "<strong>Por que escolher?</strong> Trata relacionamentos como cidadãos de primeira classe (Index-Free Adjacency). Perfeito para navegar rapidamente entre amigos de amigos, motores de recomendação e algoritmos de prevenção a fraudes.";
      dbRecommendationSnippet.textContent = "MATCH (u:Usuario {id: 42})-[:AMIGO_DE]->(f:Usuario)-[:GOSTOU_DE]->(p:Produto)\nRETURN p.nome, COUNT(*) ORDER BY COUNT(*) DESC LIMIT 5;";
    } else {
      dbRecommendationBadge.textContent = "Selecione requisitos acima para ver a sugestão";
      dbRecommendationBadge.style.borderColor = "var(--accent-purple)";
      dbRecommendationBadge.style.color = "var(--accent-purple)";
      dbRecommendationReason.textContent = "A escolha do banco de dados ideal deve equilibrar modelo de dados, padrão de acesso e requisitos de escalabilidade.";
      dbRecommendationSnippet.textContent = "// Selecione uma das opções acima para visualizar a sintaxe e modelo de dados recomendados.";
    }
  }

  // Set default view
  updateSlides();
});
