/**
 * Programação Web - Fatec 2026.2
 * Aula 08: API: Autenticação e Autorização
 * Script do Apresentador Interativo & Simuladores de Segurança
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
    // If typing in input, don't trigger slide shortcuts
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

  // Toast notifications
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
  // 2. SIMULADOR 1: JWT INSPECTOR & TAMPER LAB
  // ==========================================
  const jwtEncodedDisplay = document.getElementById('jwt-encoded-display');
  const jwtHeaderInput = document.getElementById('jwt-header-input');
  const jwtPayloadInput = document.getElementById('jwt-payload-input');
  const jwtSecretInput = document.getElementById('jwt-secret-input');
  const jwtStatusBadge = document.getElementById('jwt-status-badge');
  const btnJwtSign = document.getElementById('btn-jwt-sign');
  const btnJwtTamper = document.getElementById('btn-jwt-tamper');
  const btnJwtNoneAttack = document.getElementById('btn-jwt-none-attack');
  const btnJwtExpire = document.getElementById('btn-jwt-expire');

  // Base64URL Helpers
  function base64UrlEncode(str) {
    const b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return decodeURIComponent(escape(atob(str)));
  }

  // Native HMAC-SHA256 signature using browser WebCrypto
  async function computeHmacSha256(message, secret) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
    let binary = '';
    const bytes = new Uint8Array(signature);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return base64UrlEncode(binary);
  }

  let currentJwt = {
    headerB64: '',
    payloadB64: '',
    signatureB64: '',
    headerObj: { alg: 'HS256', typ: 'JWT' },
    payloadObj: {
      sub: 'usr_104',
      name: 'Mariana Silva',
      role: 'editor',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900
    },
    secret: 'chave_secreta_super_segura_da_fatec_2026'
  };

  async function renderJwtUI() {
    if (!jwtHeaderInput || !jwtPayloadInput) return;
    jwtHeaderInput.value = JSON.stringify(currentJwt.headerObj, null, 2);
    jwtPayloadInput.value = JSON.stringify(currentJwt.payloadObj, null, 2);
    if (jwtSecretInput) jwtSecretInput.value = currentJwt.secret;

    currentJwt.headerB64 = base64UrlEncode(JSON.stringify(currentJwt.headerObj));
    currentJwt.payloadB64 = base64UrlEncode(JSON.stringify(currentJwt.payloadObj));

    if (jwtEncodedDisplay) {
      jwtEncodedDisplay.innerHTML = `
        <span class="jwt-part-header" title="Header (Algoritmo e Tipo)">${currentJwt.headerB64}</span><span class="jwt-dot">.</span><span class="jwt-part-payload" title="Payload (Claims e Dados)">${currentJwt.payloadB64}</span><span class="jwt-dot">.</span><span class="jwt-part-signature" title="Assinatura Criptográfica">${currentJwt.signatureB64 || 'ASSINATURA_OMITIDA'}</span>
      `;
    }

    await verifyJwtIntegrity();
  }

  async function verifyJwtIntegrity() {
    if (!jwtStatusBadge) return;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    const isExpired = currentJwt.payloadObj.exp && currentJwt.payloadObj.exp < now;

    if (currentJwt.headerObj.alg === 'none') {
      jwtStatusBadge.className = 'status-pill warning';
      jwtStatusBadge.innerHTML = '⚠️ Algoritmo: NONE (Inseguro / Rejeitado em Produção!)';
      return;
    }

    if (!currentJwt.signatureB64) {
      jwtStatusBadge.className = 'status-pill invalid';
      jwtStatusBadge.innerHTML = '🚨 Assinatura Ausente!';
      return;
    }

    const expectedSig = await computeHmacSha256(
      `${currentJwt.headerB64}.${currentJwt.payloadB64}`,
      currentJwt.secret
    );

    if (expectedSig !== currentJwt.signatureB64) {
      jwtStatusBadge.className = 'status-pill invalid';
      jwtStatusBadge.innerHTML = '🚨 Assinatura INVÁLIDA! (Payload ou Segredo adulterados)';
    } else if (isExpired) {
      jwtStatusBadge.className = 'status-pill warning';
      jwtStatusBadge.innerHTML = '⏰ Assinatura Válida, mas TOKEN EXPIRADO (exp < agora)';
    } else {
      jwtStatusBadge.className = 'status-pill valid';
      jwtStatusBadge.innerHTML = '✅ Assinatura VÁLIDA & Token Ativo (Pronto para consumo)';
    }
  }

  async function signCurrentJwt() {
    try {
      currentJwt.headerObj = JSON.parse(jwtHeaderInput.value);
      currentJwt.payloadObj = JSON.parse(jwtPayloadInput.value);
      currentJwt.secret = jwtSecretInput.value;

      currentJwt.headerB64 = base64UrlEncode(JSON.stringify(currentJwt.headerObj));
      currentJwt.payloadB64 = base64UrlEncode(JSON.stringify(currentJwt.payloadObj));

      if (currentJwt.headerObj.alg === 'HS256') {
        currentJwt.signatureB64 = await computeHmacSha256(
          `${currentJwt.headerB64}.${currentJwt.payloadB64}`,
          currentJwt.secret
        );
      } else {
        currentJwt.signatureB64 = '';
      }

      await renderJwtUI();
      showToast('Token assinado com sucesso via HMAC-SHA256!', 'success');
    } catch (e) {
      showToast('JSON inválido no Header ou Payload!', 'error');
    }
  }

  if (btnJwtSign) btnJwtSign.addEventListener('click', signCurrentJwt);

  if (btnJwtTamper) {
    btnJwtTamper.addEventListener('click', async () => {
      // Tamper payload to superadmin without recalculating signature
      currentJwt.payloadObj.role = 'superadmin';
      currentJwt.payloadObj.tampered = true;
      currentJwt.payloadB64 = base64UrlEncode(JSON.stringify(currentJwt.payloadObj));
      jwtPayloadInput.value = JSON.stringify(currentJwt.payloadObj, null, 2);

      if (jwtEncodedDisplay) {
        jwtEncodedDisplay.innerHTML = `
          <span class="jwt-part-header">${currentJwt.headerB64}</span><span class="jwt-dot">.</span><span class="jwt-part-payload">${currentJwt.payloadB64}</span><span class="jwt-dot">.</span><span class="jwt-part-signature">${currentJwt.signatureB64}</span>
        `;
      }
      await verifyJwtIntegrity();
      showToast('Ataque simulado: Payload adulterado para "superadmin" sem a chave!', 'error');
    });
  }

  if (btnJwtNoneAttack) {
    btnJwtNoneAttack.addEventListener('click', async () => {
      currentJwt.headerObj.alg = 'none';
      currentJwt.payloadObj.role = 'superadmin';
      currentJwt.signatureB64 = '';
      await renderJwtUI();
      showToast('Ataque "alg: none" executado: Assinatura removida!', 'warning');
    });
  }

  if (btnJwtExpire) {
    btnJwtExpire.addEventListener('click', async () => {
      currentJwt.payloadObj.exp = Math.floor(Date.now() / 1000) - 600; // 10 min ago
      currentJwt.payloadB64 = base64UrlEncode(JSON.stringify(currentJwt.payloadObj));
      jwtPayloadInput.value = JSON.stringify(currentJwt.payloadObj, null, 2);
      await signCurrentJwt();
      showToast('Token gerado com expiração no passado!', 'warning');
    });
  }

  // Initialize JWT Simulator
  signCurrentJwt();

  // ==========================================
  // 3. SIMULADOR 2: HASHING & TIMING ATTACKS
  // ==========================================
  const hashAlgoSelect = document.getElementById('hash-algo-select');
  const hashCostInput = document.getElementById('hash-cost-input');
  const hashPasswordInput = document.getElementById('hash-password-input');
  const btnRunHash = document.getElementById('btn-run-hash');
  const hashResultOutput = document.getElementById('hash-result-output');
  const hashElapsedDisplay = document.getElementById('hash-elapsed-display');
  const hashGpuSpeedDisplay = document.getElementById('hash-gpu-speed-display');

  async function sha256Browser(str) {
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', enc.encode(str));
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  if (btnRunHash) {
    btnRunHash.addEventListener('click', async () => {
      const pwd = hashPasswordInput ? hashPasswordInput.value : 'senha123';
      const algo = hashAlgoSelect ? hashAlgoSelect.value : 'sha256';
      const cost = hashCostInput ? parseInt(hashCostInput.value, 10) : 10;

      btnRunHash.disabled = true;
      btnRunHash.textContent = 'Calculando...';

      const t0 = performance.now();
      let resultHash = '';
      let gpuSpeedText = '';

      if (algo === 'sha256') {
        resultHash = await sha256Browser(pwd);
        gpuSpeedText = '~20 Bilhões de tentativas/seg (RTX 4090). Senha de 8 chars quebrada em < 5 minutos!';
      } else if (algo === 'bcrypt') {
        // Simulate bcrypt exponential computation delay using client CPU
        const iterations = Math.pow(2, cost);
        // Run light iterations to simulate delay safely
        const loopCount = Math.min(iterations, 30000);
        let cur = pwd;
        for (let i = 0; i < loopCount; i++) {
          cur = await sha256Browser(cur + i);
        }
        resultHash = `$2b$${cost}$e8Yx9pZqW3...${cur.substring(0, 31)}`;
        gpuSpeedText = `~50.000 tentativas/seg (Custo ${cost}). Senha de 8 chars levaria ~12 anos para quebrar!`;
      } else if (algo === 'argon2id') {
        // Simulate Argon2 memory-hard operations
        const memKb = cost * 1024;
        const arr = new Uint8Array(memKb * 10);
        crypto.getRandomValues(arr.subarray(0, 50));
        let cur = pwd;
        for (let i = 0; i < 5000; i++) {
          cur = await sha256Browser(cur + arr[i % 50]);
        }
        resultHash = `$argon2id$v=19$m=${memKb},t=3,p=4$${cur.substring(0, 43)}`;
        gpuSpeedText = `~15 tentativas/seg (Esgota memória VRAM da GPU). Força bruta matematicamente inviável!`;
      }

      const t1 = performance.now();
      const elapsed = (t1 - t0).toFixed(2);

      if (hashResultOutput) hashResultOutput.value = resultHash;
      if (hashElapsedDisplay) hashElapsedDisplay.textContent = `${elapsed} ms`;
      if (hashGpuSpeedDisplay) hashGpuSpeedDisplay.textContent = gpuSpeedText;

      btnRunHash.disabled = false;
      btnRunHash.textContent = '⚡ Calcular Hash';
      showToast(`Hash calculado em ${elapsed}ms`, 'info');
    });
  }

  // ==========================================
  // 4. SIMULADOR 3: RBAC & MIDDLEWARE PIPELINE
  // ==========================================
  const simUserSelect = document.getElementById('sim-user-select');
  const simRouteSelect = document.getElementById('sim-route-select');
  const btnFirePipeline = document.getElementById('btn-fire-pipeline');
  const pipelineNodeRate = document.getElementById('node-rate');
  const pipelineNodeAuthN = document.getElementById('node-authn');
  const pipelineNodeAuthZ = document.getElementById('node-authz');
  const pipelineNodeBola = document.getElementById('node-bola');
  const pipelineNodeHandler = document.getElementById('node-handler');
  const pipelineResponseOutput = document.getElementById('pipeline-response-output');

  const usersDatabase = {
    anonymous: { name: 'Visitante Desconhecido', role: null, token: null },
    viewer: { name: 'Carlos (Leitor)', role: 'viewer', permissions: ['articles:read'], userId: 'usr_200' },
    editor: { name: 'Mariana (Editora)', role: 'editor', permissions: ['articles:read', 'articles:write'], userId: 'usr_104' },
    admin: { name: 'Eduardo (Administrador)', role: 'admin', permissions: ['*'], userId: 'usr_001' }
  };

  const routesRules = {
    'GET /api/v1/articles': { scope: 'articles:read', needAuth: false, isBola: false },
    'POST /api/v1/articles': { scope: 'articles:write', needAuth: true, isBola: false },
    'DELETE /api/v1/users/42': { scope: 'users:delete', needAuth: true, isBola: false },
    'GET /api/v1/documents/doc_104': { scope: 'documents:read', needAuth: true, isBola: true, ownerId: 'usr_104' }
  };

  function resetPipelineNodes() {
    [pipelineNodeRate, pipelineNodeAuthN, pipelineNodeAuthZ, pipelineNodeBola, pipelineNodeHandler].forEach(node => {
      if (node) {
        node.className = 'pipeline-node';
      }
    });
  }

  if (btnFirePipeline) {
    btnFirePipeline.addEventListener('click', async () => {
      resetPipelineNodes();
      btnFirePipeline.disabled = true;

      const userKey = simUserSelect ? simUserSelect.value : 'anonymous';
      const routeKey = simRouteSelect ? simRouteSelect.value : 'GET /api/v1/articles';
      const user = usersDatabase[userKey];
      const route = routesRules[routeKey];

      // Stage 1: Rate Limiting
      if (pipelineNodeRate) pipelineNodeRate.classList.add('active-pass');
      await new Promise(r => setTimeout(r, 250));

      // Stage 2: AuthN (Authentication)
      if (route.needAuth && userKey === 'anonymous') {
        if (pipelineNodeAuthN) pipelineNodeAuthN.classList.add('active-fail');
        renderPipelineResponse(401, 'Unauthorized', {
          type: 'https://api.fatec.sp.gov.br/errors/missing-credentials',
          title: 'Unauthorized',
          status: 401,
          detail: 'Cabeçalho Authorization ausente ou inválido.',
          code: 'AUTH_REQUIRED'
        });
        btnFirePipeline.disabled = false;
        return;
      }
      if (pipelineNodeAuthN) pipelineNodeAuthN.classList.add('active-pass');
      await new Promise(r => setTimeout(r, 250));

      // Stage 3: AuthZ (RBAC Role & Scope Check)
      const hasPermission = userKey === 'admin' ||
        (user.permissions && (user.permissions.includes(route.scope) || user.permissions.includes('*')));

      if (route.needAuth && !hasPermission) {
        if (pipelineNodeAuthZ) pipelineNodeAuthZ.classList.add('active-fail');
        renderPipelineResponse(403, 'Forbidden', {
          type: 'https://api.fatec.sp.gov.br/errors/insufficient-privileges',
          title: 'Forbidden',
          status: 403,
          detail: `Seu perfil (${user.role}) não possui a permissão requerida '${route.scope}'.`,
          code: 'RBAC_PERMISSION_DENIED'
        });
        btnFirePipeline.disabled = false;
        return;
      }
      if (pipelineNodeAuthZ) pipelineNodeAuthZ.classList.add('active-pass');
      await new Promise(r => setTimeout(r, 250));

      // Stage 4: BOLA (Broken Object Level Authorization check)
      if (route.isBola) {
        const isOwner = user.userId === route.ownerId || user.role === 'admin';
        if (!isOwner) {
          if (pipelineNodeBola) pipelineNodeBola.classList.add('active-fail');
          renderPipelineResponse(403, 'Forbidden (BOLA Defense)', {
            type: 'https://api.fatec.sp.gov.br/errors/bola-access-denied',
            title: 'Forbidden: Objeto pertence a outro usuário',
            status: 403,
            detail: `O documento 'doc_104' pertence a 'usr_104'. Acesso bloqueado para '${user.userId}'!`,
            code: 'BOLA_OBJECT_ID_MISMATCH'
          });
          btnFirePipeline.disabled = false;
          return;
        }
      }
      if (pipelineNodeBola) pipelineNodeBola.classList.add('active-pass');
      await new Promise(r => setTimeout(r, 250));

      // Stage 5: Route Handler (Success!)
      if (pipelineNodeHandler) pipelineNodeHandler.classList.add('active-pass');
      renderPipelineResponse(200, 'OK', {
        status: 200,
        message: 'Operação executada com sucesso!',
        requested_by: user.name,
        role: user.role || 'guest',
        route: routeKey,
        timestamp: new Date().toISOString()
      });
      btnFirePipeline.disabled = false;
    });
  }

  function renderPipelineResponse(status, title, body) {
    if (!pipelineResponseOutput) return;
    pipelineResponseOutput.value = `HTTP/1.1 ${status} ${title}\nContent-Type: application/problem+json\n\n` +
      JSON.stringify(body, null, 2);
  }

  // ==========================================
  // 5. SIMULADOR 4: REFRESH TOKEN ROTATION (RTR)
  // ==========================================
  const rtrAccessTimeElem = document.getElementById('rtr-access-time');
  const rtrRefreshTimeElem = document.getElementById('rtr-refresh-time');
  const rtrAccessProgress = document.getElementById('rtr-access-progress');
  const rtrRefreshProgress = document.getElementById('rtr-refresh-progress');
  const btnRtrCallApi = document.getElementById('btn-rtr-call-api');
  const btnRtrRefresh = document.getElementById('btn-rtr-refresh');
  const btnRtrReplayAttack = document.getElementById('btn-rtr-replay-attack');
  const rtrFamilyDisplay = document.getElementById('rtr-family-display');

  let accessTTL = 15;
  let refreshTTL = 60;
  let tokenFamilyGeneration = 1;
  let invalidatedTokens = [];
  let isSessionDead = false;

  setInterval(() => {
    if (isSessionDead) return;

    if (accessTTL > 0) accessTTL--;
    if (refreshTTL > 0) refreshTTL--;

    if (rtrAccessTimeElem) rtrAccessTimeElem.textContent = `${accessTTL}s`;
    if (rtrRefreshTimeElem) rtrRefreshTimeElem.textContent = `${refreshTTL}s`;

    if (rtrAccessProgress) rtrAccessProgress.style.width = `${(accessTTL / 15) * 100}%`;
    if (rtrRefreshProgress) rtrRefreshProgress.style.width = `${(refreshTTL / 60) * 100}%`;
  }, 1000);

  function updateFamilyTree() {
    if (!rtrFamilyDisplay) return;
    if (isSessionDead) {
      rtrFamilyDisplay.innerHTML = `<span style="color: var(--accent-rose); font-weight: bold;">🚨 SESSÃO TOTALMENTE REVOGADA! Roubo detectado. Forçado novo login.</span>`;
      return;
    }
    rtrFamilyDisplay.innerHTML = `
      <div><strong>Família de Tokens:</strong> Sessão ativa (Geração #${tokenFamilyGeneration})</div>
      <div>Access Token: <code style="color: var(--accent-emerald);">acc_tok_gen_${tokenFamilyGeneration}</code> (${accessTTL > 0 ? 'Válido' : 'Expirado'})</div>
      <div>Refresh Token Atual: <code style="color: var(--accent-cyan);">ref_tok_gen_${tokenFamilyGeneration}</code></div>
      <div>Tokens Antigos Revogados: [${invalidatedTokens.map(t => `<del style="color: var(--accent-rose);">${t}</del>`).join(', ') || 'Nenhum'}]</div>
    `;
  }

  if (btnRtrCallApi) {
    btnRtrCallApi.addEventListener('click', () => {
      if (isSessionDead) {
        showToast('Sessão revogada! Efetue login novamente.', 'error');
        return;
      }
      if (accessTTL <= 0) {
        showToast('HTTP 401 Unauthorized: Access Token expirou! Chame /refresh.', 'warning');
      } else {
        showToast(`HTTP 200 OK: Requisição autorizada (Restam ${accessTTL}s de token).`, 'success');
      }
    });
  }

  if (btnRtrRefresh) {
    btnRtrRefresh.addEventListener('click', () => {
      if (isSessionDead) {
        showToast('Sessão morta. Não é possível renovar.', 'error');
        return;
      }
      if (refreshTTL <= 0) {
        showToast('Refresh Token expirou! Sessão encerrada por inatividade.', 'error');
        isSessionDead = true;
        updateFamilyTree();
        return;
      }

      // Rotate tokens
      invalidatedTokens.push(`ref_tok_gen_${tokenFamilyGeneration}`);
      tokenFamilyGeneration++;
      accessTTL = 15;
      refreshTTL = 60;
      updateFamilyTree();
      showToast(`Refresh Token rotacionado! Geração #${tokenFamilyGeneration} emitida com sucesso.`, 'success');
    });
  }

  if (btnRtrReplayAttack) {
    btnRtrReplayAttack.addEventListener('click', () => {
      if (invalidatedTokens.length === 0) {
        showToast('Rotacione o token ao menos uma vez antes de simular o roubo!', 'warning');
        return;
      }
      const replayedToken = invalidatedTokens[invalidatedTokens.length - 1];
      isSessionDead = true;
      accessTTL = 0;
      refreshTTL = 0;
      updateFamilyTree();
      showToast(`🚨 ALARME: Reuso detectado do token ${replayedToken}! Toda a família foi revogada!`, 'error');
    });
  }

  updateFamilyTree();
});
