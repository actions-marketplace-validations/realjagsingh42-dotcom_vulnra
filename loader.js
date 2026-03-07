(function () {
    const loaderHTML = `
  <div id="vx-loader" aria-hidden="true">
    <div class="vx-backdrop"></div>
    <div class="vx-panel">
      <span class="vx-corner tl"></span>
      <span class="vx-corner tr"></span>
      <span class="vx-corner bl"></span>
      <span class="vx-corner br"></span>
      <div class="vx-logo">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <polygon points="16,2 30,28 2,28" stroke="#b8ff57" stroke-width="1.5" fill="none"/>
          <polygon points="16,9 24,24 8,24" fill="#b8ff57" opacity="0.15"/>
          <line x1="16" y1="9" x2="16" y2="21" stroke="#b8ff57" stroke-width="1.5"/>
        </svg>
        VULNRA
      </div>
      <div class="vx-bar-track">
        <div class="vx-bar-fill" id="vx-bar"></div>
        <div class="vx-bar-glow" id="vx-glow"></div>
      </div>
      <div class="vx-status">
        <span class="vx-dot"></span>
        <span class="vx-status-text" id="vx-status-text">INITIALIZING</span>
      </div>
      <div class="vx-hex" id="vx-hex">0x00</div>
    </div>
    <div class="vx-scanlines"></div>
  </div>
  <div id="vx-flash"></div>`;

    const parser = new DOMParser();
    const doc = parser.parseFromString(loaderHTML, 'text/html');
    while (doc.body.firstChild) {
        document.body.appendChild(doc.body.firstChild);
    }

    const loader = document.getElementById('vx-loader');
    const barEl = document.getElementById('vx-bar');
    const glowEl = document.getElementById('vx-glow');
    const statusEl = document.getElementById('vx-status-text');
    const hexEl = document.getElementById('vx-hex');
    const flash = document.getElementById('vx-flash');

    const MSGS = ['INITIALIZING', 'LOADING MODULES', 'VERIFYING SESSION', 'RESOLVING ROUTES', 'BUILDING CONTEXT', 'READY'];
    let hexTimer, msgTimer, rafId, isActive = false;

    function startHex() {
        let v = 0;
        hexTimer = setInterval(() => {
            v = (v + Math.floor(Math.random() * 18 + 4)) & 0xFF;
            hexEl.textContent = '0x' + v.toString(16).padStart(2, '0').toUpperCase();
        }, 72);
    }

    function reset() {
        clearInterval(hexTimer); clearInterval(msgTimer); cancelAnimationFrame(rafId);
        if (barEl) barEl.style.width = '0%';
        if (glowEl) glowEl.style.left = '0%';
        if (statusEl) statusEl.textContent = MSGS[0];
        if (hexEl) hexEl.textContent = '0x00';
        isActive = false;
    }

    function runProgress(onDone) {
        let msgIdx = 0;
        statusEl.textContent = MSGS[0];
        msgTimer = setInterval(() => {
            msgIdx = Math.min(msgIdx + 1, MSGS.length - 1);
            statusEl.textContent = MSGS[msgIdx];
        }, 150);

        const start = performance.now(), DURATION = 800;
        function tick(now) {
            const t = Math.min((now - start) / DURATION, 1);
            const pct = (1 - Math.pow(2, -10 * t)) * 92;
            barEl.style.width = pct + '%';
            glowEl.style.left = pct + '%';
            if (t < 1) { rafId = requestAnimationFrame(tick); }
            else {
                clearInterval(msgTimer);
                statusEl.textContent = 'READY';
                barEl.style.width = '100%'; glowEl.style.left = '100%';
                clearInterval(hexTimer); hexEl.textContent = '0xFF';
                setTimeout(onDone, 120);
            }
        }
        rafId = requestAnimationFrame(tick);
    }

    function show(href) {
        if (isActive) return;
        isActive = true;
        reset(); isActive = true;
        loader.classList.add('active');
        startHex();
        runProgress(() => {
            window.location.href = href;
        });
    }

    window.triggerLoader = show;

    document.addEventListener('click', function (e) {
        let node = e.target;
        while (node && node !== document.body) {
            if (node.tagName === 'A' && node.href && !node.target && !node.getAttribute('href').startsWith('#')) {
                try {
                    const url = new URL(node.href, window.location.href);
                    if (url.hostname !== window.location.hostname) return;
                    if (url.hash && url.pathname === window.location.pathname) return;
                    if (node.dataset.noLoader !== undefined) return;
                    e.preventDefault();
                    show(node.href);
                    return;
                } catch (_) { return; }
            }
            node = node.parentElement;
        }
    }, true);

    requestAnimationFrame(() => flash.classList.add('flash-in'));
})();
