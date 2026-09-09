// Interactive Slide Deck Application Logic for System Design (Part. 1)
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
  // INTERACTIVE MODULE 1: URL, URN & URI Inspector (RFC 3986 / 8141)
  // -------------------------------------------------------------
  const idTabs = document.querySelectorAll('#identifier-tabs .btn-nav');
  const inspectorUrlBox = document.getElementById('inspector-url-box');
  const inspectorUrnBox = document.getElementById('inspector-urn-box');
  const inspectorUriBox = document.getElementById('inspector-uri-box');
  const urlParts = document.querySelectorAll('.url-part');
  const urlExplainText = document.getElementById('url-explain-text');

  const idData = {
    // URL Parts
    scheme: {
      name: "Scheme (Protocolo da URL)",
      color: "var(--accent-cyan)",
      text: "Define o protocolo de transporte e as regras de diálogo da requisição (ex: <code>https://</code> para HTTP Seguro, <code>wss://</code> para WebSockets criptografados, <code>ftp://</code> para arquivos)."
    },
    auth: {
      name: "UserInfo (Autorização Básica)",
      color: "var(--accent-amber)",
      text: "Identificação opcional de credenciais embutidas no formato <code>usuario:senha@</code>. Desencorajado em URLs públicas modernas por motivos de segurança e histórico de logs."
    },
    host: {
      name: "Host (Domínio ou Endereço IP)",
      color: "var(--accent-emerald)",
      text: "O nome de domínio totalmente qualificado (FQDN - <code>api.fatec.sp.gov.br</code>) ou endereço IP de destino resolvido via DNS global."
    },
    port: {
      name: "Port (Porta Lógica de Rede)",
      color: "var(--accent-rose)",
      text: "A porta TCP/UDP que identifica o processo do servidor. Padrão implícito: <code>:80</code> para HTTP e <code>:443</code> para HTTPS. No exemplo: porta customizada <code>:8443</code>."
    },
    path: {
      name: "Path (Caminho do Recurso)",
      color: "var(--accent-purple)",
      text: "Caminho hierárquico no sistema de arquivos ou roteamento de APIs (<code>/v1/sistemas/alunos</code>) que orienta o reverse proxy até a rota correspondente."
    },
    query: {
      name: "Query String (Parâmetros de Consulta)",
      color: "var(--accent-blue)",
      text: "Conjunto de pares chave-valor iniciados por <code>?</code> e separados por <code>&</code> (<code>?curso=ads&semestre=20262</code>), usados para filtragem, paginação e ordenação."
    },
    hash: {
      name: "Fragment / Hash (Âncora de Navegação)",
      color: "#f472b6",
      text: "Identificador iniciado por <code>#</code> (<code>#grade-curricular</code>). <strong>Importante:</strong> É processado exclusivamente pelo navegador (Client-Side) e NUNCA é enviado ao servidor na requisição HTTP."
    },

    // URN Parts (RFC 8141)
    'urn-prefix': {
      name: "URN Prefix (\"urn:\")",
      color: "var(--accent-cyan)",
      text: "Esquema formal obrigatório e invariável que designa que este identificador segue as regras de Uniform Resource Name da <strong>RFC 8141</strong>."
    },
    'urn-nid': {
      name: "NID (Namespace Identifier)",
      color: "var(--accent-amber)",
      text: "Identificador global do espaço nominal registrado na IANA. Exemplos: <code>isbn</code> (Livros), <code>uuid</code> (Identificadores Universais de 128 bits), <code>ietf</code> (RFCs da Internet), <code>doi</code> (Publicações Científicas), <code>oasis</code> (Padrões de Software)."
    },
    'urn-nss': {
      name: "NSS (Namespace Specific String)",
      color: "var(--accent-emerald)",
      text: "A cadeia de caracteres estruturada que identifica unicamente o recurso dentro daquele namespace (ex: <code>978-0-13-449416-6</code> ou <code>rfc:7230</code>). <strong>Persistência Garantida:</strong> Permanece imutável mesmo se o site da Fatec ou da editora mudar de servidor."
    },

    // Generic URI Parts
    'uri-mail-scheme': {
      name: "Scheme de E-mail (\"mailto:\")",
      color: "var(--accent-purple)",
      text: "Instrui o sistema operacional a abrir o cliente de correio eletrônico padrão configurado no dispositivo."
    },
    'uri-mail-ssp': {
      name: "Scheme-Specific Part (Endereço)",
      color: "var(--accent-blue)",
      text: "O endereço de destino do destinatário da mensagem (<code>professor@fatec.sp.gov.br</code>)."
    },
    'uri-tel-scheme': {
      name: "Scheme de Telefonia (\"tel:\")",
      color: "var(--accent-purple)",
      text: "Instrui o dispositivo móvel ou software VoIP a inicializar uma chamada telefônica."
    },
    'uri-tel-ssp': {
      name: "Scheme-Specific Part (Número E.164)",
      color: "var(--accent-blue)",
      text: "Número de telefone no padrão internacional E.164 com código de país e DDD (<code>+55-16-99999-9999</code>)."
    }
  };

  // Tab switching for URL vs URN vs URI
  idTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      idTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');

      if (inspectorUrlBox) inspectorUrlBox.style.display = target === 'url' ? 'flex' : 'none';
      if (inspectorUrnBox) inspectorUrnBox.style.display = target === 'urn' ? 'flex' : 'none';
      if (inspectorUriBox) inspectorUriBox.style.display = target === 'uri' ? 'flex' : 'none';

      // Default explanation per tab
      if (target === 'url') {
        urlExplainText.innerHTML = `<strong style="color: var(--accent-cyan);">URL (Uniform Resource Locator):</strong> Identifica <em>como acessar</em> e <em>onde está</em> o recurso na rede. Clique nos componentes para inspecionar.`;
      } else if (target === 'urn') {
        urlExplainText.innerHTML = `<strong style="color: var(--accent-emerald);">URN (Uniform Resource Name - RFC 8141):</strong> Identifica o recurso pelo seu <em>nome persistente</em> no formato <code>urn:&lt;NID&gt;:&lt;NSS&gt;</code>, independente de sua localização.`;
      } else {
        urlExplainText.innerHTML = `<strong style="color: var(--accent-purple);">URI Genérica:</strong> O superconjunto abrangente. Exemplos como <code>mailto:</code> e <code>tel:</code> identificam recursos de comunicação direta.`;
      }
    });
  });

  urlParts.forEach(part => {
    part.addEventListener('click', () => {
      urlParts.forEach(p => p.classList.remove('active'));
      part.classList.add('active');
      const key = part.getAttribute('data-part');
      const info = idData[key];
      if (info) {
        urlExplainText.innerHTML = `<strong style="color: ${info.color};">${info.name}:</strong> ${info.text}`;
      }
    });
  });

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 2: Request Journey Stepper
  // -------------------------------------------------------------
  const journeySteps = document.querySelectorAll('.journey-step');
  const btnJourneyPrev = document.getElementById('btn-journey-prev');
  const btnJourneyNext = document.getElementById('btn-journey-next');
  const btnJourneyReset = document.getElementById('btn-journey-reset');
  const journeyNodeTitle = document.getElementById('journey-node-title');
  const journeyNodeSub = document.getElementById('journey-node-sub');
  const journeyStepTitle = document.getElementById('journey-step-title');
  const journeyStepDesc = document.getElementById('journey-step-desc');

  let currentJourneyStep = 0;

  const journeyData = [
    {
      nodeTitle: "CLIENTE",
      nodeSub: "Navegador & Caches",
      title: "Etapa 1: Parsing de URL & Verificação de Caches Locais",
      desc: "O usuário digita a URL. O navegador valida a sintaxe, consulta a lista <strong>HSTS Preload</strong> (para forçar HTTPS imediatamente sem permitir SSL Stripping) e verifica se o recurso já está disponível no <strong>Memory Cache</strong> ou no <strong>Disk Cache</strong>."
    },
    {
      nodeTitle: "DNS HIERÁRQUICO",
      nodeSub: "Resolver ➔ Root ➔ TLD",
      title: "Etapa 2: Resolução DNS (Domain Name System)",
      desc: "O Recursive Resolver do provedor consulta os <strong>Root Servers (.)</strong>, que apontam para os servidores <strong>TLD (.br)</strong>, que redirecionam para o <strong>Authoritative DNS</strong> do domínio. Este responde com o registro <strong>Tipo A (IPv4)</strong> ou <strong>AAAA (IPv6)</strong>."
    },
    {
      nodeTitle: "TRANSPORTE TCP",
      nodeSub: "3-Way Handshake",
      title: "Etapa 3: Estabelecimento da Conexão TCP",
      desc: "O cliente envia o pacote <code>SYN</code>. O servidor responde com <code>SYN-ACK</code> e o cliente conclui com <code>ACK</code> (1 RTT de latência). Agora os números de sequência inicial (ISN) estão sincronizados para transmissão confiável."
    },
    {
      nodeTitle: "SEGURANÇA TLS 1.3",
      nodeSub: "Diffie-Hellman & Certificado",
      title: "Etapa 4: Negociação Criptográfica TLS 1.3",
      desc: "No pacote <code>Client Hello</code>, o navegador já envia sua chave pública efêmera (ECDHE). O servidor responde com <code>Server Hello</code>, sua chave pública e o <strong>Certificado Digital X.509</strong> assinado pela CA. O canal seguro é fechado em apenas 1 RTT."
    },
    {
      nodeTitle: "BACKEND & PROXY",
      nodeSub: "Reverse Proxy L7 & App",
      title: "Etapa 5: Processamento da Requisição HTTP e Resposta",
      desc: "A requisição <code>GET /api/v1/dashboard</code> chega ao Reverse Proxy (NGINX/Envoy), que faz SSL Termination, valida autenticação e encaminha ao cluster de aplicação. O backend consulta o banco PostgreSQL/Redis e devolve o <code>HTTP 200 OK</code> com payload JSON/HTML."
    },
    {
      nodeTitle: "GPU & RENDER",
      nodeSub: "DOM ➔ CSSOM ➔ Paint",
      title: "Etapa 6: Critical Rendering Path no Navegador",
      desc: "O navegador processa o HTML em <strong>DOM</strong>, o CSS em <strong>CSSOM</strong>, mescla-os na <strong>Render Tree</strong>, calcula as dimensões no <strong>Layout (Reflow)</strong> e pinta os pixels na tela através de <strong>Paint & Compositing</strong> acelerados por GPU."
    }
  ];

  function renderJourneyStep(stepIdx) {
    currentJourneyStep = stepIdx;
    journeySteps.forEach((step, idx) => {
      step.classList.remove('active', 'completed');
      if (idx === currentJourneyStep) {
        step.classList.add('active');
      } else if (idx < currentJourneyStep) {
        step.classList.add('completed');
      }
    });

    const data = journeyData[currentJourneyStep];
    if (data) {
      journeyNodeTitle.textContent = data.nodeTitle;
      journeyNodeSub.textContent = data.nodeSub;
      journeyStepTitle.textContent = data.title;
      journeyStepDesc.innerHTML = data.desc;
    }

    if (btnJourneyPrev) btnJourneyPrev.disabled = currentJourneyStep === 0;
    if (btnJourneyNext) btnJourneyNext.disabled = currentJourneyStep === journeyData.length - 1;
  }

  if (btnJourneyNext) {
    btnJourneyNext.addEventListener('click', () => {
      if (currentJourneyStep < journeyData.length - 1) {
        renderJourneyStep(currentJourneyStep + 1);
        showToast(`Avançou para: ${journeyData[currentJourneyStep].nodeTitle}`);
      }
    });
  }

  if (btnJourneyPrev) {
    btnJourneyPrev.addEventListener('click', () => {
      if (currentJourneyStep > 0) {
        renderJourneyStep(currentJourneyStep - 1);
      }
    });
  }

  if (btnJourneyReset) {
    btnJourneyReset.addEventListener('click', () => {
      renderJourneyStep(0);
      showToast('Jornada resetada para a Etapa 1.');
    });
  }

  journeySteps.forEach((step, idx) => {
    step.addEventListener('click', () => {
      renderJourneyStep(idx);
    });
  });

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 3: TCP vs UDP Packet Simulator (V2)
  // -------------------------------------------------------------
  const btnSendPackets = document.getElementById('btn-send-packets');
  const btnToggleLoss = document.getElementById('btn-toggle-loss');
  const simSpeedSelect = document.getElementById('sim-speed-select');
  const btnResetSim = document.getElementById('btn-reset-sim');
  const tcpStatusBadge = document.getElementById('tcp-status-badge');
  const udpStatusBadge = document.getElementById('udp-status-badge');
  const tcpClientDetail = document.getElementById('tcp-client-detail');
  const tcpServerDetail = document.getElementById('tcp-server-detail');
  const udpClientDetail = document.getElementById('udp-client-detail');
  const udpServerDetail = document.getElementById('udp-server-detail');
  const tcpDataPackets = document.getElementById('tcp-data-packets');
  const tcpAckPackets = document.getElementById('tcp-ack-packets');
  const udpDataPackets = document.getElementById('udp-data-packets');
  const transportExplainText = document.getElementById('transport-explain-text');

  let isLossEnabled = false;
  let isSimRunning = false;
  let activeTimeouts = [];

  const speedConfigs = {
    slow: {
      duration: 3600,       // ms for data packet traversal
      interval: 1100,       // ms between packet dispatches
      ackDuration: 2400,    // ms for ACK traversal
    },
    normal: {
      duration: 2400,
      interval: 750,
      ackDuration: 1600,
    },
    fast: {
      duration: 1500,
      interval: 450,
      ackDuration: 1000,
    }
  };

  function addSimTimeout(fn, delay) {
    const t = setTimeout(fn, delay);
    activeTimeouts.push(t);
    return t;
  }

  function clearAllSimTimeouts() {
    activeTimeouts.forEach(t => clearTimeout(t));
    activeTimeouts = [];
  }

  function resetSim() {
    clearAllSimTimeouts();
    isSimRunning = false;

    if (tcpDataPackets) tcpDataPackets.innerHTML = '';
    if (tcpAckPackets) tcpAckPackets.innerHTML = '';
    if (udpDataPackets) udpDataPackets.innerHTML = '';

    if (tcpStatusBadge) {
      tcpStatusBadge.textContent = 'STATUS: PRONTO';
      tcpStatusBadge.style.color = 'var(--text-muted)';
      tcpStatusBadge.style.borderColor = 'var(--border-color)';
    }

    if (udpStatusBadge) {
      udpStatusBadge.textContent = 'STATUS: PRONTO';
      udpStatusBadge.style.color = 'var(--accent-purple)';
      udpStatusBadge.style.borderColor = 'var(--accent-purple)';
    }

    if (tcpClientDetail) tcpClientDetail.textContent = 'Buffer: 4 Segs';
    if (tcpServerDetail) tcpServerDetail.textContent = 'Buffer: Aguardando';
    if (udpClientDetail) udpClientDetail.textContent = 'Buffer: 4 Datagramas';
    if (udpServerDetail) udpServerDetail.textContent = 'Buffer: Pronto';

    if (transportExplainText) {
      transportExplainText.innerHTML = `Clique em <strong>"🚀 Iniciar Envio"</strong> para disparar a transmissão de 4 pacotes em ambos os protocolos. Ative a opção <strong>"💥 Perda no Pacote #3"</strong> para observar o comportamento de retransmissão e <em>Head-of-Line Blocking</em> no TCP versus a continuidade ininterrupta no UDP.`;
    }

    if (btnSendPackets) {
      btnSendPackets.disabled = false;
      btnSendPackets.textContent = '🚀 Iniciar Envio (4 Pacotes)';
    }
  }

  if (btnToggleLoss) {
    btnToggleLoss.addEventListener('click', () => {
      isLossEnabled = !isLossEnabled;
      btnToggleLoss.setAttribute('data-loss', isLossEnabled ? 'true' : 'false');
      if (isLossEnabled) {
        btnToggleLoss.textContent = '💥 Perda no Pacote #3: ATIVADA';
        btnToggleLoss.style.borderColor = 'var(--accent-rose)';
        btnToggleLoss.style.color = 'var(--accent-rose)';
        showToast('Perda no Pacote #3 ATIVADA');
      } else {
        btnToggleLoss.textContent = '💥 Perda no Pacote #3: NÃO';
        btnToggleLoss.style.borderColor = 'var(--border-color)';
        btnToggleLoss.style.color = 'var(--text-main)';
        showToast('Perda de Pacote DESATIVADA');
      }
    });
  }

  if (btnResetSim) {
    btnResetSim.addEventListener('click', () => {
      resetSim();
      showToast('Simulador de pacotes resetado.');
    });
  }

  // Smooth JS-driven packet animation utility
  function animatePacket(container, opts) {
    const el = document.createElement('div');
    el.className = 'sim-packet-v2';
    el.textContent = opts.text;
    el.style.background = opts.bg || '#0284c7';
    el.style.color = opts.color || '#fff';
    el.style.border = opts.border || '1px solid #38bdf8';

    const isReverse = opts.reverse === true;
    const startLeft = isReverse ? 84 : 0;
    const targetLeft = isReverse ? 0 : 84;

    el.style.left = `${startLeft}%`;
    container.appendChild(el);

    const startTime = performance.now();
    let isDropped = false;

    function step(currentTime) {
      if (!isSimRunning) {
        if (el.parentNode) el.parentNode.removeChild(el);
        return;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / opts.duration, 1);

      if (opts.dropAt && progress >= opts.dropAt && !isDropped) {
        isDropped = true;
        el.textContent = opts.dropText || '💥 PERDIDO!';
        el.style.background = '#e11d48';
        el.style.border = '1px solid #f43f5e';
        el.style.transform = 'scale(1.15)';
        
        setTimeout(() => {
          el.style.opacity = '0';
          setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
          }, 400);
        }, 600);

        if (opts.onDrop) opts.onDrop();
        return;
      }

      if (isDropped) return;

      const currentPos = startLeft + (targetLeft - startLeft) * progress;
      el.style.left = `${currentPos}%`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (opts.onArrival) opts.onArrival();
        setTimeout(() => {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 300);
      }
    }

    requestAnimationFrame(step);
  }

  if (btnSendPackets) {
    btnSendPackets.addEventListener('click', () => {
      if (isSimRunning) return;
      isSimRunning = true;
      btnSendPackets.disabled = true;
      btnSendPackets.textContent = '⏳ Transmitindo Pacotes...';

      const speedKey = simSpeedSelect ? simSpeedSelect.value : 'slow';
      const speed = speedConfigs[speedKey] || speedConfigs.slow;

      tcpDataPackets.innerHTML = '';
      tcpAckPackets.innerHTML = '';
      udpDataPackets.innerHTML = '';

      tcpStatusBadge.textContent = 'STATUS: TRANSMITINDO';
      tcpStatusBadge.style.color = 'var(--accent-cyan)';
      tcpStatusBadge.style.borderColor = 'var(--accent-cyan)';

      udpStatusBadge.textContent = 'STATUS: STREAMING';
      udpStatusBadge.style.color = 'var(--accent-purple)';
      udpStatusBadge.style.borderColor = 'var(--accent-purple)';

      transportExplainText.innerHTML = `Transmissão iniciada. Observe o fluxo de ida dos dados e a volta das confirmações (ACKs) no <strong>TCP</strong> contra o streaming contínuo sem ACKs no <strong>UDP</strong>.`;

      // Dispatch 4 packets sequentially
      for (let i = 1; i <= 4; i++) {
        const packetNum = i;
        const delay = (i - 1) * speed.interval;

        addSimTimeout(() => {
          if (!isSimRunning) return;

          // ------------------------------------
          // 1. TCP Packet
          // ------------------------------------
          tcpClientDetail.textContent = `Enviando: Seg #${packetNum}`;

          if (packetNum === 3 && isLossEnabled) {
            // Drop packet #3 in TCP
            animatePacket(tcpDataPackets, {
              text: `TCP Seg #3 [DATA]`,
              bg: '#0284c7',
              border: '1px solid #38bdf8',
              duration: speed.duration,
              dropAt: 0.45,
              dropText: `❌ PKT #3 PERDIDO!`,
              onDrop: () => {
                tcpStatusBadge.textContent = '⚠️ PERDA DE PACOTE #3!';
                tcpStatusBadge.style.color = 'var(--accent-rose)';
                tcpStatusBadge.style.borderColor = 'var(--accent-rose)';
                showToast('Falha na rede: Pacote TCP #3 descartado!');
              }
            });
          } else {
            // Normal TCP packet
            animatePacket(tcpDataPackets, {
              text: `TCP Seg #${packetNum} [DATA]`,
              bg: '#0284c7',
              border: '1px solid #38bdf8',
              duration: speed.duration,
              onArrival: () => {
                if (packetNum === 4 && isLossEnabled) {
                  // Packet 4 arrives, but #3 was lost! HoL Blocking!
                  tcpServerDetail.textContent = `Recebido: #4 (FALTA #3!)`;
                  tcpStatusBadge.textContent = '⛔ BUFFER PAUSADO (HoL Blocking)';
                  tcpStatusBadge.style.color = 'var(--accent-rose)';
                  tcpStatusBadge.style.borderColor = 'var(--accent-rose)';

                  // Server sends DUP-ACK #3 (alerting missing #3)
                  addSimTimeout(() => {
                    animatePacket(tcpAckPackets, {
                      text: `⚠️ DUP-ACK #3`,
                      bg: '#d97706',
                      border: '1px solid #fbbf24',
                      duration: speed.ackDuration,
                      reverse: true,
                      onArrival: () => {
                        tcpClientDetail.textContent = `Dup-ACK #3! Retransmitindo...`;
                        
                        // Retransmit Packet #3
                        addSimTimeout(() => {
                          animatePacket(tcpDataPackets, {
                            text: `🔁 TCP Seg #3 [RETRANSMISSÃO]`,
                            bg: '#e11d48',
                            border: '1px solid #f43f5e',
                            duration: speed.duration,
                            onArrival: () => {
                              tcpServerDetail.textContent = `Buffer: #1, #2, #3, #4 OK!`;
                              tcpStatusBadge.textContent = '✅ BUFFER LIBERADO (Em Ordem)';
                              tcpStatusBadge.style.color = 'var(--accent-emerald)';
                              tcpStatusBadge.style.borderColor = 'var(--accent-emerald)';

                              // Send final cumulative ACK #5
                              animatePacket(tcpAckPackets, {
                                text: `ACK #5 [Tudo OK]`,
                                bg: '#059669',
                                border: '1px solid #34d399',
                                duration: speed.ackDuration,
                                reverse: true,
                                onArrival: () => {
                                  tcpClientDetail.textContent = `Todos ACKs recebidos!`;
                                  finalizeSimulation(true);
                                }
                              });
                            }
                          });
                        }, 500);
                      }
                    });
                  }, 200);

                } else {
                  // Normal TCP arrival
                  tcpServerDetail.textContent = `Recebido: Seg #${packetNum}`;
                  
                  // Send ACK back
                  addSimTimeout(() => {
                    animatePacket(tcpAckPackets, {
                      text: `ACK #${packetNum + 1}`,
                      bg: '#059669',
                      border: '1px solid #34d399',
                      duration: speed.ackDuration,
                      reverse: true,
                      onArrival: () => {
                        tcpClientDetail.textContent = `ACK #${packetNum + 1} OK`;
                        if (packetNum === 4 && !isLossEnabled) {
                          finalizeSimulation(false);
                        }
                      }
                    });
                  }, 150);
                }
              }
            });
          }

          // ------------------------------------
          // 2. UDP Datagram
          // ------------------------------------
          const mediaTypes = ['Áudio', 'Vídeo', 'Vídeo', 'Áudio'];
          const mediaName = mediaTypes[packetNum - 1] || 'Media';
          udpClientDetail.textContent = `Enviando: DG #${packetNum}`;

          if (packetNum === 3 && isLossEnabled) {
            // Drop UDP datagram #3
            animatePacket(udpDataPackets, {
              text: `UDP DG #3 [${mediaName}]`,
              bg: '#7c3aed',
              border: '1px solid #c084fc',
              duration: speed.duration * 0.9,
              dropAt: 0.45,
              dropText: `💥 QUADRO #3 DESCARTADO`,
              onDrop: () => {
                udpStatusBadge.textContent = '⚡ QUADRO PERDIDO (Sem Pausa)';
                udpStatusBadge.style.color = 'var(--accent-amber)';
                udpStatusBadge.style.borderColor = 'var(--accent-amber)';
              }
            });
          } else {
            // Normal UDP packet
            animatePacket(udpDataPackets, {
              text: `UDP DG #${packetNum} [${mediaName}]`,
              bg: '#7c3aed',
              border: '1px solid #c084fc',
              duration: speed.duration * 0.9,
              onArrival: () => {
                udpServerDetail.textContent = `Reproduzindo ${mediaName} #${packetNum}`;
                if (packetNum === 4) {
                  udpStatusBadge.textContent = isLossEnabled ? '⚡ STREAM CONCLUÍDO (1 perda ignorada)' : '✅ STREAM COMPLETO (0 latência extra)';
                  udpStatusBadge.style.color = 'var(--accent-emerald)';
                  udpStatusBadge.style.borderColor = 'var(--accent-emerald)';
                }
              }
            });
          }

        }, delay);
      }

      function finalizeSimulation(hadLoss) {
        isSimRunning = false;
        btnSendPackets.disabled = false;
        btnSendPackets.textContent = '🚀 Iniciar Envio (4 Pacotes)';

        if (hadLoss) {
          transportExplainText.innerHTML = `
            <strong style="color:var(--accent-rose);">CONFRONTO TÉCNICO OBSERVADO:</strong><br>
            • <strong>TCP:</strong> A perda do Pacote #3 gerou <em>Head-of-Line Blocking</em> no servidor. O Pacote #4 precisou esperar no buffer até que o cliente retransmitisse o #3 após receber o <em>Dup-ACK</em>. <strong>Garantia de 100% de integridade com penalidade de latência.</strong><br>
            • <strong>UDP:</strong> O Datagrama #3 foi descartado pela rede, mas o Datagrama #4 foi reproduzido <strong>instantaneamente sem pausa ou retransmissão</strong>. Ideal para streaming ao vivo, WebRTC e jogos.
          `;
          showToast('Simulação concluída: Observe a diferença de comportamento!');
        } else {
          transportExplainText.innerHTML = `
            <strong style="color:var(--accent-emerald);">TRANSMISSÃO CONCLUÍDA (Sem perdas):</strong><br>
            • <strong>TCP:</strong> Todos os 4 segmentos foram confirmados com ACKs no sentido inverso.<br>
            • <strong>UDP:</strong> Todos os 4 datagramas foram entregues com latência mínima e sem overhead de canal reverso.
          `;
          showToast('Transmissão concluída com sucesso!');
        }
      }

    });
  }


  // -------------------------------------------------------------
  // INTERACTIVE MODULE 4: HTTP Evolution Waterfall Comparator
  // -------------------------------------------------------------
  const httpTabs = document.querySelectorAll('#http-version-tabs .btn-nav');
  const httpTitle = document.getElementById('http-waterfall-title');
  const httpDesc = document.getElementById('http-waterfall-desc');
  const wfHttpHandshake = document.getElementById('wf-http-handshake');
  const wfHttpDownload = document.getElementById('wf-http-download');
  const wfHttpTotal = document.getElementById('wf-http-total');

  const httpData = {
    http1: {
      title: "HTTP/1.1 (Conexões Seriais / Keep-Alive)",
      desc: "Abre até 6 conexões TCP paralelas por domínio. Cada conexão sofre com <strong>Head-of-Line Blocking na aplicação</strong>: requisições lentas travam as subsequentes.",
      handshakeWidth: "45%", handshakeText: "150ms (3x TCP + TLS 1.2)",
      downloadWidth: "85%", downloadText: "450ms (Conexões em Fila)",
      totalWidth: "95%", totalText: "600ms (Suscetível a Fila)"
    },
    http2: {
      title: "HTTP/2 (Multiplexação em 1 Conexão TCP)",
      desc: "Centenas de streams multiplexados em uma única conexão TCP binária com compressão HPACK. <strong>Porém</strong>, se 1 pacote é perdido, o TCP pausa todos os streams (TCP HoL Blocking).",
      handshakeWidth: "30%", handshakeText: "100ms (1x TCP + TLS 1.2)",
      downloadWidth: "60%", downloadText: "250ms (Multiplexado)",
      totalWidth: "70%", totalText: "350ms (Sensível a Perdas)"
    },
    http3: {
      title: "HTTP/3 & QUIC (Baseado em UDP)",
      desc: "Handshake unificado de <strong>1-RTT (Transporte + TLS 1.3)</strong>. Streams 100% independentes: a perda de 1 pacote atrasa apenas aquele arquivo específico, com zero bloqueio nos demais!",
      handshakeWidth: "20%", handshakeText: "50ms (1-RTT TLS 1.3)",
      downloadWidth: "45%", downloadText: "150ms (Multiplexação UDP)",
      totalWidth: "50%", totalText: "200ms (Sem Bloqueio HoL)"
    }
  };

  httpTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      httpTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const version = tab.getAttribute('data-version');
      const data = httpData[version];
      if (data) {
        httpTitle.textContent = data.title;
        httpDesc.innerHTML = data.desc;
        wfHttpHandshake.style.width = data.handshakeWidth;
        wfHttpHandshake.textContent = data.handshakeText;
        wfHttpDownload.style.width = data.downloadWidth;
        wfHttpDownload.textContent = data.downloadText;
        wfHttpTotal.style.width = data.totalWidth;
        wfHttpTotal.textContent = data.totalText;
      }
    });
  });

  // -------------------------------------------------------------
  // INTERACTIVE MODULE 5: Real-Time Stream Inspector
  // -------------------------------------------------------------
  const rtModeBtns = document.querySelectorAll('#realtime-mode-selector .btn-nav:not(#btn-rt-clear)');
  const btnRtClear = document.getElementById('btn-rt-clear');
  const streamConsole = document.getElementById('stream-console');
  const rtActiveModelName = document.getElementById('rt-active-model-name');
  const rtOverheadMetric = document.getElementById('rt-overhead-metric');
  const rtConnectionsMetric = document.getElementById('rt-connections-metric');

  let rtInterval = null;
  let activeRtMode = 'ws';

  const rtProfiles = {
    short: {
      name: "Short-Polling (Consulta Periódica)",
      overhead: "~850 bytes por requisição (Headers HTTP completos)",
      connections: "Novas conexões TCP abertas e fechadas a cada 2s",
      generateLog: () => {
        const time = new Date().toLocaleTimeString();
        return `
          <div class="stream-log-entry">
            <span class="log-time">[${time}]</span>
            <span class="log-client">[GET /noticias]</span>
            <span>Cabeçalhos: 820 bytes ➔ Resposta: 304 Not Modified (Sem novos dados).</span>
          </div>
        `;
      }
    },
    long: {
      name: "Long-Polling (Comet Pattern)",
      overhead: "~850 bytes na abertura + latência de reconexão",
      connections: "Conexão HTTP suspensa até haver evento, depois reabre",
      generateLog: () => {
        const time = new Date().toLocaleTimeString();
        return `
          <div class="stream-log-entry">
            <span class="log-time">[${time}]</span>
            <span class="log-server">[POLL RETORNO]</span>
            <span>Servidor entregou: {"status": "OK"} ➔ Conexão fechada. Reabrindo nova requisição...</span>
          </div>
        `;
      }
    },
    sse: {
      name: "Server-Sent Events (SSE - EventSource)",
      overhead: "~15 bytes por mensagem (Stream contínuo de texto)",
      connections: "1 Conexão HTTP Unidirecional persistente (Server ➔ Client)",
      generateLog: () => {
        const time = new Date().toLocaleTimeString();
        const tokens = ["'System'", "' Design'", "' em'", "' Arquitetura'", "' Distribuída'"];
        const token = tokens[Math.floor(Math.random() * tokens.length)];
        return `
          <div class="stream-log-entry">
            <span class="log-time">[${time}]</span>
            <span class="log-server">[SSE CHUNK]</span>
            <span>data: {"token": ${token}} (id: ${Math.floor(Math.random() * 9000 + 1000)})</span>
          </div>
        `;
      }
    },
    ws: {
      name: "WebSockets Full-Duplex (RFC 6455)",
      overhead: "2 a 6 bytes por frame binário/texto",
      connections: "1 Conexão TCP Full-Duplex Persistente",
      generateLog: () => {
        const time = new Date().toLocaleTimeString();
        const isClient = Math.random() > 0.5;
        if (isClient) {
          return `
            <div class="stream-log-entry">
              <span class="log-time">[${time}]</span>
              <span class="log-client">[CLIENT WS FRAME]</span>
              <span>Enviou ação: {"action": "PING", "ts": ${Date.now()}} (2 bytes overhead)</span>
            </div>
          `;
        } else {
          return `
            <div class="stream-log-entry">
              <span class="log-time">[${time}]</span>
              <span class="log-ws">[SERVER WS FRAME]</span>
              <span>Push de mercado: {"ticker": "PETR4", "preco": 39.80} (4 bytes overhead)</span>
            </div>
          `;
        }
      }
    }
  };

  function startRtSimulation(mode) {
    activeRtMode = mode;
    const profile = rtProfiles[mode];
    if (!profile) return;

    rtActiveModelName.textContent = profile.name;
    rtOverheadMetric.textContent = profile.overhead;
    rtConnectionsMetric.textContent = profile.connections;

    if (rtInterval) clearInterval(rtInterval);

    rtInterval = setInterval(() => {
      const logHtml = profile.generateLog();
      streamConsole.insertAdjacentHTML('beforeend', logHtml);
      streamConsole.scrollTop = streamConsole.scrollHeight;

      // Keep max 25 entries in console
      while (streamConsole.children.length > 25) {
        streamConsole.removeChild(streamConsole.firstChild);
      }
    }, mode === 'ws' || mode === 'sse' ? 1400 : 2200);
  }

  rtModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rtModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-mode');
      startRtSimulation(mode);
      showToast(`Modo alterado para: ${rtProfiles[mode].name}`);
    });
  });

  if (btnRtClear) {
    btnRtClear.addEventListener('click', () => {
      streamConsole.innerHTML = '';
      showToast('Console de rede limpo.');
    });
  }

  // Start default WS simulation
  startRtSimulation('ws');

  // Initial slide presentation update
  updateSlides();
});
