/* ══════════════════════════════════════════════════════
   SAYANTAN SAHOO — CYBERPUNK PORTFOLIO  |  app.js
══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const C = {
    cyan:    '#00F5FF',
    blue:    '#3A8DFF',
    violet:  '#8A2BE2',
    magenta: '#FF00B8',
  };

  /* ══════════════════════════════════
     GLOBAL OVERLAYS (scan lines + glitch flash)
  ══════════════════════════════════ */
  const scanlineEl = document.createElement('div');
  scanlineEl.className = 'scanline-overlay';
  document.body.appendChild(scanlineEl);

  const glitchFlashEl = document.createElement('div');
  glitchFlashEl.className = 'glitch-flash';
  document.body.appendChild(glitchFlashEl);

  function triggerGlitchFlash() {
    glitchFlashEl.classList.add('active');
    setTimeout(() => glitchFlashEl.classList.remove('active'), 80);
  }

  /* ══════════════════════════════════
     CUSTOM CURSOR
  ══════════════════════════════════ */
  const cursorRing = document.getElementById('cursorRing');
  const cursorDot  = document.getElementById('cursorDot');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (cursorDot) { cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px'; }
  });

  (function animateCursor() {
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    if (cursorRing) { cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px'; }
    requestAnimationFrame(animateCursor);
  })();

  document.querySelectorAll('a,button,.cta-btn,.skill-pill,.project-card,.stat-card,.social-orb,.nav-link').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });

  /* ══════════════════════════════════
     BOOT SCREEN
  ══════════════════════════════════ */
  const bootScreen  = document.getElementById('bootScreen');
  const bootCanvas  = document.getElementById('bootCanvas');
  const bootProg    = document.getElementById('bootProgress');
  const bootProgTxt = document.getElementById('bootProgressText');
  const skipBtn     = document.getElementById('skipIntro');
  const mainContent = document.getElementById('mainContent');
  const navbar      = document.getElementById('navbar');

  // Boot canvas: digital rain
  const bCtx = bootCanvas.getContext('2d');
  function resizeBoot() {
    bootCanvas.width  = window.innerWidth;
    bootCanvas.height = window.innerHeight;
  }
  resizeBoot();
  window.addEventListener('resize', resizeBoot);

  const bCols  = () => Math.floor(bootCanvas.width / 18);
  let bDrops   = new Array(bCols()).fill(0);
  const bChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&アイウエオカキクケコ<>[]{}=/\\';

  let rainRunning = true;
  function bootRainFrame() {
    if (!rainRunning) return;
    bCtx.fillStyle = 'rgba(0,0,0,0.06)';
    bCtx.fillRect(0, 0, bootCanvas.width, bootCanvas.height);
    bCtx.font = '15px Share Tech Mono, monospace';
    bCtx.shadowBlur = 0;
    for (let i = 0; i < bDrops.length; i++) {
      const ch = bChars[Math.floor(Math.random() * bChars.length)];
      bCtx.fillStyle   = Math.random() > 0.9 ? '#FFFFFF' : C.cyan;
      bCtx.globalAlpha = Math.random() * 0.5 + 0.2;
      bCtx.fillText(ch, i * 18, bDrops[i] * 18);
      if (bDrops[i] * 18 > bootCanvas.height && Math.random() > 0.97) bDrops[i] = 0;
      bDrops[i]++;
    }
    bCtx.globalAlpha = 1;
    requestAnimationFrame(bootRainFrame);
  }
  bootRainFrame();

  // Terminal typing — fixed: uses opacity not width
  const bootLines = [
    { text: '> Initializing Neural Interface...', delay: 300  },
    { text: '> Loading security protocols...',    delay: 950  },
    { text: '> Authenticating visitor...',        delay: 1600 },
    { text: '> IDENTITY VERIFIED ✓',             delay: 2200, cls: 'success' },
    { text: '> ACCESS GRANTED — Welcome, user.',  delay: 2700, cls: 'success' },
  ];
  const tEls = [0,1,2,3,4].map(i => document.getElementById('tLine' + i));

  function typeBootLine(el, text) {
    el.classList.add('typing'); // make visible before typing starts
    el.textContent = '';
    let i = 0;
    function t() {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(t, 22);
    }
    t();
  }

  let bootDone = false;
  function runBoot() {
    bootLines.forEach((line, idx) => {
      setTimeout(() => {
        if (line.cls) tEls[idx].classList.add(line.cls);
        typeBootLine(tEls[idx], line.text);
      }, line.delay);
    });
    let prog = 0;
    const pi = setInterval(() => {
      prog = Math.min(prog + Math.random() * 3.5, 100);
      bootProg.style.width   = prog + '%';
      bootProgTxt.textContent = Math.floor(prog) + '%';
      if (prog >= 100) { clearInterval(pi); setTimeout(finishBoot, 600); }
    }, 75);
  }

  function finishBoot() {
    if (bootDone) return;
    bootDone = true;
    rainRunning = false;
    bootScreen.classList.add('hidden');
    setTimeout(() => {
      bootScreen.style.display = 'none';
      mainContent.classList.add('visible');
      navbar.classList.add('visible');
      animateHeroEntry();
    }, 800);
  }

  skipBtn.addEventListener('click', finishBoot);
  runBoot();
  setTimeout(finishBoot, 7000);

  /* ══════════════════════════════════
     SECTION / HERO CANVASES REMOVED
     Single fixed cyberpunkBgCanvas handles entire background.
     Per-section canvases caused extreme GPU load (10+ concurrent draws).
  ══════════════════════════════════ */
  function makeCyberpunkCanvas(container, opts = {}) { return; // disabled — global canvas used instead
    const canvas = document.createElement('canvas');
    canvas.className = 'section-canvas-bg';
    container.insertBefore(canvas, container.firstChild);

    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, running = false;

    const CHAR_SZ = opts.charSz || 15;
    const HEX_SZ  = opts.hexSz  || 46;
    const RAIN_CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&アイウエオカキクケコ<>[]{}=+/\\';

    // Opacity multiplier — hero is 1.0, sections slightly softer
    const OM = opts.opacityMult || 0.85;

    let rainDrops = [], hexCells = [], traces = [],
        scanBeams = [], dataNodes = [], pulseRings = [];

    function init() {
      W = canvas.width  = container.offsetWidth;
      H = canvas.height = container.offsetHeight || window.innerHeight;

      // Rain
      const nc = Math.floor(W / CHAR_SZ);
      rainDrops = Array.from({ length: nc }, () => ({
        y: -Math.random() * 50,
        spd: Math.random() * 0.3 + 0.08,
        bright: Math.random() > 0.92,
      }));

      // Hex grid
      hexCells = [];
      const hw = HEX_SZ * Math.sqrt(3), hh = HEX_SZ * 2;
      const gc = Math.ceil(W / hw) + 2, gr = Math.ceil(H / (hh * 0.75)) + 2;
      for (let r = 0; r < gr; r++) {
        for (let c = 0; c < gc; c++) {
          hexCells.push({
            x: c * hw + (r % 2 ? hw / 2 : 0) - hw,
            y: r * hh * 0.75 - hh,
            ph: Math.random() * Math.PI * 2,
            spd: Math.random() * 0.005 + 0.001,
            lit: Math.random() > 0.88,
            col: Math.random() > 0.5 ? C.cyan : C.violet,
          });
        }
      }

      // Circuit traces
      traces = [];
      const numTraces = opts.traces || 12;
      for (let i = 0; i < numTraces; i++) spawnTrace();

      // Scan beams
      scanBeams = [
        { y: H * 0.2, spd: 0.45,  a: 0.038 * OM },
        { y: H * 0.7, spd: -0.28, a: 0.028 * OM },
        { y: H * 0.5, spd: 0.7,   a: 0.020 * OM },
      ];

      // Data nodes
      dataNodes = [];
      const numNodes = opts.nodes || 16;
      for (let i = 0; i < numNodes; i++) spawnNode();

      pulseRings = [];
    }

    function spawnTrace() {
      const segs = [];
      let cx = Math.random() * W, cy = Math.random() * H;
      const steps = Math.floor(Math.random() * 5) + 2;
      const horiz = Math.random() > 0.4;
      for (let s = 0; s < steps; s++) {
        const len = Math.random() * 100 + 30;
        const dir = Math.random() > 0.5 ? 1 : -1;
        const nx = horiz ? cx + len * dir : cx;
        const ny = horiz ? cy             : cy + len * dir;
        segs.push({ x1: cx, y1: cy, x2: nx, y2: ny });
        cx = nx; cy = ny;
        if (Math.random() > 0.5 && s < steps - 1) {
          const tl = Math.random() * 45 + 12;
          const tx = horiz ? cx : cx + tl * (Math.random() > 0.5 ? 1 : -1);
          const ty = horiz ? cy + tl * (Math.random() > 0.5 ? 1 : -1) : cy;
          segs.push({ x1: cx, y1: cy, x2: tx, y2: ty });
          cx = tx; cy = ty;
        }
      }
      const col = [C.cyan, C.violet, C.blue][Math.floor(Math.random() * 3)];
      traces.push({
        segs, col,
        drawn: 0,
        total: segs.reduce((a, s) => a + Math.hypot(s.x2 - s.x1, s.y2 - s.y1), 0),
        spd: Math.random() * 1.1 + 0.4,
        alpha: (Math.random() * 0.18 + 0.06) * OM,
        life: 0, maxLife: Math.random() * 260 + 120,
      });
    }

    function spawnNode() {
      const labels = ['0xA4F','SYS32','NET::4','AUTH','PING','TLS','ERR!','0xFF','PKT','//root','0xC0D','BIOS'];
      dataNodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
        label: labels[Math.floor(Math.random() * labels.length)],
        col: Math.random() > 0.5 ? C.cyan : C.violet,
        ph: Math.random() * Math.PI * 2,
        sz: Math.random() * 4 + 3,
      });
    }

    function hexPath(x, y, s) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        i === 0 ? ctx.moveTo(x + s * Math.cos(a), y + s * Math.sin(a))
                : ctx.lineTo(x + s * Math.cos(a), y + s * Math.sin(a));
      }
      ctx.closePath();
    }

    function draw() {
      if (!running) return;

      ctx.clearRect(0, 0, W, H);

      /* 1 — Hex grid */
      ctx.lineWidth = 0.55;
      hexCells.forEach(h => {
        h.ph += h.spd;
        const g = (Math.sin(h.ph) + 1) / 2;
        if (h.lit) {
          ctx.strokeStyle = h.col;
          ctx.globalAlpha = 0.05 + g * 0.14;
          ctx.shadowBlur = g * 10;
          ctx.shadowColor = h.col;
        } else {
          ctx.strokeStyle = C.cyan;
          ctx.globalAlpha = 0.018 + g * 0.01;
          ctx.shadowBlur = 0;
        }
        hexPath(h.x, h.y, HEX_SZ);
        ctx.stroke();
      });
      ctx.shadowBlur = 0;

      /* 2 — Matrix rain */
      ctx.font = CHAR_SZ + 'px Share Tech Mono, monospace';
      rainDrops.forEach((d, c) => {
        d.y += d.spd;
        const cy = Math.floor(d.y) * CHAR_SZ;
        const ch = RAIN_CH[Math.floor(Math.random() * RAIN_CH.length)];
        ctx.globalAlpha = d.bright ? 0.55 : 0.28;
        ctx.fillStyle   = d.bright ? '#AAFFFF' : C.cyan;
        ctx.shadowBlur  = d.bright ? 10 : 3;
        ctx.shadowColor = '#00F5FF';
        ctx.fillText(ch, c * CHAR_SZ, cy);
        for (let t = 1; t < 6; t++) {
          ctx.globalAlpha = (1 - t / 6) * (d.bright ? 0.18 : 0.10);
          ctx.shadowBlur  = 0;
          ctx.fillText(RAIN_CH[Math.floor(Math.random() * RAIN_CH.length)], c * CHAR_SZ, cy - t * CHAR_SZ);
        }
        if (d.y * CHAR_SZ > H + CHAR_SZ * 10 && Math.random() > 0.975) {
          d.y = -Math.random() * 25; d.spd = Math.random() * 0.3 + 0.08;
          d.bright = Math.random() > 0.92;
        }
      });
      ctx.shadowBlur = 0;

      /* 3 — Circuit traces */
      for (let i = traces.length - 1; i >= 0; i--) {
        const t = traces[i];
        t.life++;
        t.drawn = Math.min(t.drawn + t.spd * 2, t.total);
        const fi = Math.min(1, t.life / 22);
        const fo = Math.min(1, (t.maxLife - t.life) / 30);
        const a  = t.alpha * fi * fo;
        if (a <= 0.003) { traces.splice(i, 1); spawnTrace(); continue; }
        ctx.strokeStyle = t.col; ctx.lineWidth = 0.9;
        ctx.shadowColor = t.col; ctx.shadowBlur = 5;
        ctx.globalAlpha = a;
        let gone = 0, lx = t.segs[0].x1, ly = t.segs[0].y1;
        ctx.beginPath(); ctx.moveTo(lx, ly);
        for (const seg of t.segs) {
          const sl = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1);
          if (gone + sl <= t.drawn) {
            ctx.lineTo(seg.x2, seg.y2); gone += sl; lx = seg.x2; ly = seg.y2;
          } else {
            const f = (t.drawn - gone) / sl;
            lx = seg.x1 + (seg.x2 - seg.x1) * f;
            ly = seg.y1 + (seg.y2 - seg.y1) * f;
            ctx.lineTo(lx, ly); break;
          }
        }
        ctx.stroke();
        // Bright tip dot
        ctx.beginPath(); ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = a * 1.5;
        ctx.shadowBlur = 12; ctx.shadowColor = t.col; ctx.fill();
        if (t.life > t.maxLife) { traces.splice(i, 1); spawnTrace(); }
      }
      ctx.shadowBlur = 0;

      /* 4 — Scan beams */
      scanBeams.forEach(b => {
        b.y += b.spd;
        if (b.y > H + 15) b.y = -15;
        if (b.y < -15)    b.y = H + 15;
        const g = ctx.createLinearGradient(0, b.y - 22, 0, b.y + 22);
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.5, `rgba(0,245,255,${b.a * 1.2})`);
        g.addColorStop(1, 'transparent');
        ctx.globalAlpha = 1; ctx.fillStyle = g;
        ctx.fillRect(0, b.y - 22, W, 44);
      });

      /* 5 — Data nodes */
      ctx.font = '8px Share Tech Mono, monospace';
      dataNodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.ph += 0.022;
        if (n.x < -40) n.x = W + 40; if (n.x > W + 40) n.x = -40;
        if (n.y < -40) n.y = H + 40; if (n.y > H + 40) n.y = -40;
        const pa = 0.13 + 0.09 * Math.sin(n.ph);
        ctx.globalAlpha = pa;
        ctx.strokeStyle = n.col; ctx.lineWidth = 0.7;
        ctx.shadowColor = n.col; ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y - n.sz); ctx.lineTo(n.x + n.sz, n.y);
        ctx.lineTo(n.x, n.y + n.sz); ctx.lineTo(n.x - n.sz, n.y);
        ctx.closePath(); ctx.stroke();
        ctx.shadowBlur = 3; ctx.globalAlpha = pa * 0.7;
        ctx.fillStyle = n.col; ctx.fillText(n.label, n.x + n.sz + 3, n.y + 3);
      });
      ctx.shadowBlur = 0;

      /* 6 — Pulse rings */
      if (Math.random() < 0.006) {
        pulseRings.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 0, maxR: Math.random() * 120 + 45,
          spd: Math.random() * 1.1 + 0.5,
          col: Math.random() > 0.5 ? C.cyan : C.violet,
        });
      }
      for (let i = pulseRings.length - 1; i >= 0; i--) {
        const r = pulseRings[i]; r.r += r.spd;
        const ra = 0.3 * (1 - r.r / r.maxR);
        if (ra <= 0) { pulseRings.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = r.col; ctx.lineWidth = 0.9;
        ctx.globalAlpha = ra; ctx.shadowBlur = 10; ctx.shadowColor = r.col; ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      requestAnimationFrame(draw);
    }

    // Start when visible, PAUSE when scrolled away (don't re-init on re-entry)
    let initialized = false;
    const obs = new IntersectionObserver(entries => {
      const vis = entries[0].isIntersecting;
      if (vis && !running) {
        running = true;
        if (!initialized) { initialized = true; init(); }
        draw();
      } else if (!vis) {
        running = false;
      }
    }, { threshold: 0.01 });
    obs.observe(container);

    window.addEventListener('resize', () => {
      if (running) {
        W = canvas.width  = container.offsetWidth;
        H = canvas.height = container.offsetHeight || window.innerHeight;
        init();
      }
    });

    return canvas;
  }

  /* ══════════════════════════════════
     HERO CANVAS / SECTION CANVASES — DISABLED
     All background rendering handled by single fixed cyberpunkBgCanvas.
  ══════════════════════════════════ */
  // Hero canvas and per-section canvas loops removed — global canvas handles everything.

  /* ══════════════════════════════════
     HERO PARTICLES
  ══════════════════════════════════ */
  const heroParticles = document.getElementById('heroParticles');
  function spawnParticle() {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 14 + 7) + 's';
    p.style.animationDelay    = (Math.random() * 6) + 's';
    const cols = [C.cyan, C.blue, C.violet, C.magenta];
    const col  = cols[Math.floor(Math.random() * cols.length)];
    p.style.background = col;
    p.style.boxShadow  = `0 0 5px ${col}`;
    p.style.width  = (Math.random() * 2.5 + 0.5) + 'px';
    p.style.height = p.style.width;
    if (heroParticles) heroParticles.appendChild(p);
    p.addEventListener('animationend', () => { p.remove(); spawnParticle(); });
  }
  for (let i = 0; i < 35; i++) spawnParticle();

  /* ══════════════════════════════════
     TYPING ANIMATION
  ══════════════════════════════════ */
  const typingEl = document.getElementById('typingText');
  const roles = [
    'Computer Science Engineer','AI & Data Science Enthusiast',
    'Cybersecurity Specialist','Full Stack Developer',
    'Open Source Contributor','Backend Engineer',
  ];
  let ri = 0, ci = 0, isDel = false, ts = 100;
  function typeRole() {
    const cur = roles[ri];
    if (isDel) { typingEl.textContent = cur.slice(0, --ci); ts = 38; }
    else        { typingEl.textContent = cur.slice(0, ++ci); ts = 85; }
    if (!isDel && ci === cur.length) { ts = 2200; isDel = true; }
    else if (isDel && ci === 0)      { isDel = false; ri = (ri + 1) % roles.length; ts = 400; }
    setTimeout(typeRole, ts);
  }
  setTimeout(typeRole, 1500);

  /* ══════════════════════════════════
     HERO ENTRY ANIMATION
  ══════════════════════════════════ */
  function animateHeroEntry() {
    document.querySelectorAll('.hero-section .reveal-up, .hero-section .reveal-right').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 200 + i * 130);
    });
    setTimeout(animateCounters, 1100);
  }

  /* ══════════════════════════════════
     STAT COUNTERS
  ══════════════════════════════════ */
  function animateCounters() {
    document.querySelectorAll('.stat-value[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 28));
      const iv = setInterval(() => {
        cur = Math.min(cur + step, target);
        const hasPlus = (target === 30 || target === 4 || target === 20);
        el.textContent = cur + (cur === target && hasPlus ? '+' : '');
        if (cur >= target) clearInterval(iv);
      }, 50);
    });
  }

  // Stagger reveal: elements cascade 70ms apart within each parent group
  let revealGroups = new Map();
  document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right').forEach(el => {
    const parent = el.parentNode;
    if (!revealGroups.has(parent)) revealGroups.set(parent, []);
    revealGroups.get(parent).push(el);
  });

  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const siblings = revealGroups.get(e.target.parentNode) || [e.target];
      const idx = siblings.indexOf(e.target);
      const delay = parseInt(e.target.dataset.delay || '0', 10) + idx * 70;
      setTimeout(() => e.target.classList.add('visible'), Math.min(delay, 500));
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right').forEach(el => revealObs.observe(el));

  // Fallback: show anything still hidden after 3s (handles initial load elements)
  setTimeout(() => {
    document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right').forEach(el => el.classList.add('visible'));
  }, 3000);

  /* ══════════════════════════════════
     GLITCH — CSS handles repeating glitches.
     JS only triggers one lightweight global flash.
  ══════════════════════════════════ */
  setInterval(() => {
    if (Math.random() > 0.78) triggerGlitchFlash();
  }, 3500);

  /* ══════════════════════════════════
     NAVBAR
  ══════════════════════════════════ */
  const navbarEl  = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');
  const navLinks  = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbarEl.classList.toggle('scrolled', window.scrollY > 80);
    updateActiveNav();
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const spans = navToggle.querySelectorAll('span');
    const on = navMenu.classList.contains('active');
    spans[0].style.transform = on ? 'rotate(45deg) translate(5px,5px)'  : '';
    spans[1].style.opacity   = on ? '0' : '1';
    spans[2].style.transform = on ? 'rotate(-45deg) translate(5px,-5px)' : '';
  });

  navLinks.forEach(l => {
    l.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  function updateActiveNav() {
    let cur = '';
    document.querySelectorAll('section[id]').forEach(s => {
      if (window.scrollY >= s.offsetTop - 160) cur = s.id;
    });
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${cur}`));
  }

  /* ══════════════════════════════════
     SMOOTH SCROLL
  ══════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ══════════════════════════════════
     3D TILT CARDS
  ══════════════════════════════════ */
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(800px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ══════════════════════════════════
     CONTACT FORM — CYBERPUNK TRANSMISSION TERMINAL
  ══════════════════════════════════ */

  // ── Floating Particles ──────────────────────────────────
  (function initCtParticles() {
    const wrap = document.getElementById('ctParticles');
    if (!wrap) return;
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      const size = 1 + Math.random() * 2;
      const x = Math.random() * 100;
      const delay = Math.random() * 8;
      const dur = 6 + Math.random() * 10;
      p.style.cssText = `
        position:absolute; border-radius:50%;
        width:${size}px; height:${size}px;
        left:${x}%; bottom:-4px;
        background: hsl(${180 + Math.random()*60}deg,100%,70%);
        opacity:0; animation: ctParticleRise ${dur}s ${delay}s linear infinite;
      `;
      wrap.appendChild(p);
    }
    if (!document.getElementById('ctParticleStyle')) {
      const s = document.createElement('style');
      s.id = 'ctParticleStyle';
      s.textContent = `@keyframes ctParticleRise {
        0%   { transform:translateY(0) scale(1); opacity:0; }
        10%  { opacity:0.6; }
        90%  { opacity:0.2; }
        100% { transform:translateY(-100vh) scale(0); opacity:0; }
      }`;
      document.head.appendChild(s);
    }
  })();

  // ── Helpers ─────────────────────────────────────────────
  function genTxId() {
    const ts  = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).slice(2,6).toUpperCase();
    return `TX-${ts}-${rnd}`;
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ── DOM refs ────────────────────────────────────────────
  const contactForm         = document.getElementById('contactForm');
  const sendBtn             = document.getElementById('sendMessageBtn');
  const submitBtnText       = document.getElementById('submitBtnText');
  const ctOverlay           = document.getElementById('ctTransmissionOverlay');
  const ctSuccessScreen     = document.getElementById('ctSuccessScreen');
  const ctTxLog             = document.getElementById('ctTxLog');
  const ctTxProgressBar     = document.getElementById('ctTxProgressBar');
  const ctTxIdLive          = document.getElementById('ctTxIdLive');
  const ctSuccessTxId       = document.getElementById('ctSuccessTxId');
  const ctReturnBtn         = document.getElementById('ctReturnBtn');
  const msgCharCount        = document.getElementById('msgCharCount');
  const contactMessage      = document.getElementById('contactMessage');

  // ── Char counter ────────────────────────────────────────
  if (contactMessage && msgCharCount) {
    contactMessage.addEventListener('input', () => {
      const len = contactMessage.value.length;
      msgCharCount.textContent = len;
      msgCharCount.style.color = len > 1800 ? 'var(--magenta)' : '';
    });
  }

  // ── Field validation ────────────────────────────────────
  function setFieldError(inputId, errId, msg) {
    const inp = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if (!inp) return false;
    if (msg) {
      inp.classList.add('invalid');
      if (err) err.textContent = msg;
      return false;
    } else {
      inp.classList.remove('invalid');
      if (err) err.textContent = '';
      return true;
    }
  }

  function validateForm() {
    let valid = true;
    const name     = document.getElementById('contactName')?.value.trim();
    const email    = document.getElementById('contactEmail')?.value.trim();
    const category = document.getElementById('contactCategory')?.value;
    const subject  = document.getElementById('contactSubject')?.value.trim();
    const message  = document.getElementById('contactMessage')?.value.trim();

    if (!name)
      valid = setFieldError('contactName','errName','> Name is required') && valid;
    else valid = setFieldError('contactName','errName','') && valid;

    if (!email)
      valid = setFieldError('contactEmail','errEmail','> Email is required') && valid;
    else if (!validateEmail(email))
      valid = setFieldError('contactEmail','errEmail','> Invalid email format') && valid;
    else valid = setFieldError('contactEmail','errEmail','') && valid;

    if (!category)
      valid = setFieldError('contactCategory','errCategory','> Category is required') && valid;
    else valid = setFieldError('contactCategory','errCategory','') && valid;

    if (!subject)
      valid = setFieldError('contactSubject','errSubject','> Subject is required') && valid;
    else valid = setFieldError('contactSubject','errSubject','') && valid;

    if (!message)
      valid = setFieldError('contactMessage','errMessage','> Message is required') && valid;
    else valid = setFieldError('contactMessage','errMessage','') && valid;

    return valid;
  }

  // ── Full-screen Transmission Canvas + Particles ──────────
  let ctRainInterval = null;
  let ctRainCanvas   = null;
  let ctRainCtx      = null;
  let ctRainDrops    = [];

  function startCtRain() {
    ctRainCanvas = document.getElementById('ctTxCanvas');
    if (!ctRainCanvas) return;
    ctRainCtx = ctRainCanvas.getContext('2d');
    ctRainCanvas.width  = window.innerWidth;
    ctRainCanvas.height = window.innerHeight;

    const cols  = Math.floor(ctRainCanvas.width / 18);
    ctRainDrops = new Array(cols).fill(0);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%アイウエオカキクケコ<>[]{}=/\\TRANSMITTING...';

    ctRainInterval = setInterval(() => {
      ctRainCtx.fillStyle = 'rgba(0,0,0,0.07)';
      ctRainCtx.fillRect(0, 0, ctRainCanvas.width, ctRainCanvas.height);
      ctRainCtx.font = '14px Share Tech Mono, monospace';
      for (let i = 0; i < ctRainDrops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        // Mix cyan, blue, violet for variety
        const palette = ['#00F5FF','#3A8DFF','#8A2BE2','#FFFFFF'];
        ctRainCtx.fillStyle   = Math.random() > 0.92 ? '#FFFFFF' : palette[Math.floor(Math.random()*3)];
        ctRainCtx.globalAlpha = Math.random() * 0.5 + 0.2;
        ctRainCtx.shadowBlur  = 6;
        ctRainCtx.shadowColor = '#00F5FF';
        ctRainCtx.fillText(ch, i * 18, ctRainDrops[i] * 18);
        if (ctRainDrops[i] * 18 > ctRainCanvas.height && Math.random() > 0.97) ctRainDrops[i] = 0;
        ctRainDrops[i]++;
      }
      ctRainCtx.globalAlpha = 1;
      ctRainCtx.shadowBlur  = 0;
    }, 40);
  }

  function stopCtRain() {
    if (ctRainInterval) { clearInterval(ctRainInterval); ctRainInterval = null; }
    if (ctRainCanvas) {
      const ctx2 = ctRainCanvas.getContext('2d');
      ctx2.clearRect(0, 0, ctRainCanvas.width, ctRainCanvas.height);
    }
  }

  function spawnWarpStars() {
    const wrap = document.getElementById('ctWarpWrap');
    if (!wrap) return;
    wrap.innerHTML = '';
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    for (let i = 0; i < 60; i++) {
      const s   = document.createElement('div');
      s.className = 'ct-warp-star';
      const ang = Math.random() * Math.PI * 2;
      const dist = 200 + Math.random() * Math.max(window.innerWidth, window.innerHeight) * 0.7;
      const tx = Math.cos(ang) * dist;
      const ty = Math.sin(ang) * dist;
      const size = 1 + Math.random() * 3;
      const dur  = 1.5 + Math.random() * 3;
      const del  = Math.random() * 3;
      s.style.cssText = `
        left:${cx}px; top:${cy}px;
        width:${size}px; height:${size}px;
        --tx:${tx}px; --ty:${ty}px;
        background: hsl(${180 + Math.random()*60}deg,100%,70%);
        animation-duration:${dur}s;
        animation-delay:${del}s;
        box-shadow: 0 0 ${size*2}px hsl(${180+Math.random()*60}deg,100%,70%);
      `;
      wrap.appendChild(s);
    }
  }

  function clearWarpStars() {
    const wrap = document.getElementById('ctWarpWrap');
    if (wrap) wrap.innerHTML = '';
  }

  // ── Typed log line helper ──────────────────────────────────
  function typeLogLine(line, text, speed = 28) {
    return new Promise(resolve => {
      // Build the static cursor span
      const cursor = document.createElement('span');
      cursor.className = 'ct-log-typing-cursor';
      line.appendChild(cursor);

      let i = 0;
      function tick() {
        if (i < text.length) {
          // Insert text node before cursor
          cursor.insertAdjacentText('beforebegin', text[i]);
          i++;
          setTimeout(tick, speed + Math.random() * 20);
        } else {
          cursor.remove();
          resolve();
        }
      }
      tick();
    });
  }

  // ── Transmission sequence ────────────────────────────────
  const TX_STEPS = [
    { text: 'Encrypting Payload...',           delay: 0,    progress: 15 },
    { text: 'Authenticating Sender...',         delay: 1100, progress: 35 },
    { text: 'Establishing Secure Channel...',   delay: 2400, progress: 58 },
    { text: 'Routing Transmission...',          delay: 3700, progress: 78 },
    { text: 'Contacting Command Center...',     delay: 4800, progress: 92 },
    { text: 'Transmission Successful.',         delay: 6000, progress: 100, success: true }
  ];

  function runTransmissionSequence(txId, onComplete) {
    ctTxLog.innerHTML = '';
    ctTxProgressBar.style.width = '0%';
    ctTxIdLive.textContent = txId;

    // Start background effects
    startCtRain();
    spawnWarpStars();

    TX_STEPS.forEach((step) => {
      setTimeout(async () => {
        // Animate progress bar
        ctTxProgressBar.style.width = step.progress + '%';

        // Build log line
        const line = document.createElement('div');
        line.className = 'ct-log-line' + (step.success ? ' success' : '');
        const prompt = document.createElement('span');
        prompt.className = 'ct-log-prompt';
        prompt.textContent = '>';
        line.appendChild(prompt);
        ctTxLog.appendChild(line);

        // Slide in
        requestAnimationFrame(() => requestAnimationFrame(() => line.classList.add('show')));

        // Type text character by character
        await typeLogLine(line, ' ' + step.text, step.success ? 30 : 22);

        if (step.success) {
          setTimeout(() => {
            stopCtRain();
            clearWarpStars();
            ctOverlay.classList.remove('active');
            ctSuccessScreen.classList.add('active');
            if (ctSuccessTxId) ctSuccessTxId.textContent = txId;
            onComplete && onComplete();
          }, 700);
        }
      }, step.delay);
    });
  }

  // ── Submit handler ───────────────────────────────────────
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateForm()) return;

      const txId = genTxId();
      const formData = {
        name:         document.getElementById('contactName')?.value.trim(),
        email:        document.getElementById('contactEmail')?.value.trim(),
        organization: document.getElementById('contactOrg')?.value.trim() || '',
        category:     document.getElementById('contactCategory')?.value,
        subject:      document.getElementById('contactSubject')?.value.trim(),
        message:      document.getElementById('contactMessage')?.value.trim(),
        txId
      };

      // Disable button & show overlay immediately
      if (sendBtn)        sendBtn.disabled = true;
      if (submitBtnText)  submitBtnText.textContent = 'TRANSMITTING...';
      ctOverlay.classList.add('active');

      if (window.triggerTransmissionPulse) window.triggerTransmissionPulse();

      // Start cinematic sequence RIGHT NOW — don't wait for backend
      runTransmissionSequence(txId, () => {});

      // Backend API URL (auto-detects local vs production)
      const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000'
        : 'https://portfolio-final-vtxa.onrender.com';

      fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: AbortSignal.timeout ? AbortSignal.timeout(45000) : undefined
      }).then(res => {
        if (!res.ok) res.json().catch(() => {}).then(j => console.warn('Backend:', res.status, j));
      }).catch(err => {
        console.warn('Backend not reachable (UI unaffected):', err.message);
      });
    });
  }

  // ── Return button ─────────────────────────────────────────
  if (ctReturnBtn) {
    ctReturnBtn.addEventListener('click', () => {
      ctSuccessScreen.classList.remove('active');
      contactForm.reset();
      if (msgCharCount) msgCharCount.textContent = '0';
      if (sendBtn) { sendBtn.disabled = false; }
      if (submitBtnText) submitBtnText.textContent = 'INITIATE TRANSMISSION';
      // Clear all errors
      ['contactName','contactEmail','contactCategory','contactSubject','contactMessage'].forEach(id => {
        document.getElementById(id)?.classList.remove('invalid');
      });
      ['errName','errEmail','errCategory','errSubject','errMessage'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
      });
    });
  }

  /* ══════════════════════════════════
     FOOTER TERMINAL
  ══════════════════════════════════ */
  const footerCmd = document.getElementById('footerCmd');
  const fMsgs = ['echo "Thanks for visiting!"','status --online','connect --network global','grep -r "opportunities" .','scan --jobs','ping 8.8.8.8 -c 4'];
  let fIdx = 0;
  setInterval(() => {
    if (!footerCmd) return;
    footerCmd.style.opacity = '0';
    setTimeout(() => { fIdx = (fIdx + 1) % fMsgs.length; footerCmd.textContent = fMsgs[fIdx]; footerCmd.style.opacity = '1'; }, 400);
  }, 3000);

  /* ══════════════════════════════════
     PARALLAX HERO GRID
  ══════════════════════════════════ */
  const heroGrid = document.querySelector('.hero-grid-overlay');
  window.addEventListener('scroll', () => {
    if (heroGrid) heroGrid.style.transform = `translateY(${window.scrollY * 0.25}px)`;
  }, { passive: true });

  /* ══════════════════════════════════
     CONSOLE EASTER EGG
  ══════════════════════════════════ */
  console.log('%c[ SAYANTAN SAHOO — PORTFOLIO ]', 'color:#00F5FF;font-size:16px;font-weight:bold;font-family:monospace;');
  console.log('%c> ss9830872697@gmail.com', 'color:#3A8DFF;font-size:12px;font-family:monospace;');
  console.log('%c> github.com/sahoo-tech', 'color:#8A2BE2;font-size:12px;font-family:monospace;');

  /* ══════════════════════════════════
     GITHUB INTELLIGENCE CENTER
  ══════════════════════════════════ */

  // ── Repository Data (from CV) ──────────────────────────
  const GH_REPOS = [
    {
      id: 1,
      name: 'Chainmuse',
      desc: 'Web3 platform empowering creators with AI-powered tools and blockchain integration. Features AI chat, content creation, and smart contract frameworks.',
      tags: ['Web3','AI','Blockchain','Smart Contracts'],
      filter: ['web3','fullstack','ai'],
      icon: 'fa-link',
      color: '#8A2BE2', color2: '#FF00B8',
      status: 'wip',
      stars: 12, forks: 4,
      updated: '2025-12',
      github: 'https://github.com/sahoo-tech/HACKHAZARD-PROJECT-2025',
      demo: null,
      features: [
        'AI-powered content creation engine',
        'Smart contract framework integration',
        'Blockchain-based creator monetization',
        'Voice recognition & DAO governance (in dev)',
        'Royalty tracking & financial tools (in dev)'
      ]
    },
    {
      id: 2,
      name: 'Code-Analyzer',
      desc: 'Enterprise-level Python code analysis tool leveraging AST parsing, metrics calculation, and AI integration for deep code insights, vulnerability detection, and RAG-based semantic search.',
      tags: ['Python','AST','AI','RAG','Security'],
      filter: ['ai','tools','backend'],
      icon: 'fa-search-dollar',
      color: '#00F5FF', color2: '#3A8DFF',
      status: 'active',
      stars: 18, forks: 6,
      updated: '2026-01',
      github: 'https://github.com/sahoo-tech/Code-Analyzer',
      demo: null,
      features: [
        'AST parsing with deep metrics calculation',
        'Detects vulnerabilities, design patterns & anti-patterns',
        'Natural language querying of codebases',
        'RAG-based semantic search over source files',
        'Enterprise-grade reporting & code smell detection'
      ]
    },
    {
      id: 3,
      name: 'VIRALYTIX',
      desc: 'Comprehensive platform for monitoring, analyzing, and predicting viral outbreaks using advanced AI, blockchain technology, and real-time data analysis for public health officials.',
      tags: ['AI','Blockchain','Data Science','Public Health','Real-time'],
      filter: ['ai','fullstack'],
      icon: 'fa-virus',
      color: '#FF00B8', color2: '#8A2BE2',
      status: 'active',
      stars: 22, forks: 8,
      updated: '2026-02',
      github: 'https://github.com/sahoo-tech/VIRALYTIX-2',
      demo: 'https://hackathon-project-egq7-217a8mxah-sahoo-techs-projects.vercel.app/',
      features: [
        'Real-time viral outbreak monitoring & prediction',
        'Multi-source data integration (WHO, CDC, social media)',
        'AI-powered risk assessment models',
        'Blockchain-based data integrity verification',
        'Actionable insights dashboard for policymakers'
      ]
    },
    {
      id: 4,
      name: 'Agritech Assistant',
      desc: 'Comprehensive agricultural assistance platform powered by AI and machine learning. Provides farmers with intelligent tools for crop management, disease detection, and farming optimization.',
      tags: ['Python','AI','ML','Agriculture','Flask'],
      filter: ['ai','backend'],
      icon: 'fa-seedling',
      color: '#28CA41', color2: '#00F5FF',
      status: 'active',
      stars: 14, forks: 5,
      updated: '2025-11',
      github: 'https://github.com/sahoo-tech/Agritech-AI',
      demo: null,
      features: [
        'AI-driven crop disease detection via image analysis',
        'Intelligent crop management recommendations',
        'Real-time weather & soil integration',
        'Farming optimization engine',
        'Python-based web application with ML models'
      ]
    },
    {
      id: 5,
      name: 'AEGIS AI — Fraud Detection',
      desc: 'Sophisticated fraud detection system combining AI with rule-based analysis for real-time transaction monitoring. Uses Google Gemini AI to analyze patterns and identify fraudulent activities.',
      tags: ['Python','Gemini AI','ML','Security','PostgreSQL'],
      filter: ['ai','security','backend'],
      icon: 'fa-shield-alt',
      color: '#3A8DFF', color2: '#00F5FF',
      status: 'active',
      stars: 19, forks: 7,
      updated: '2025-10',
      github: 'https://github.com/sahoo-tech/FRAUD-DETECTION-AI-DRIVEN-',
      demo: null,
      features: [
        'Real-time transaction risk scoring with Gemini AI',
        'Hybrid AI + rule-based fraud detection pipeline',
        'User behaviour & contextual pattern analysis',
        'Low-latency alert system for financial teams',
        'PostgreSQL-backed audit trail & reporting'
      ]
    },
    {
      id: 6,
      name: 'Binance Futures Trading Bot',
      desc: 'Fully CLI-driven, Python-powered algorithmic trading engine for Binance USDT-M Futures. Built for developers experimenting with algorithmic strategies and advanced traders wanting terminal-level control.',
      tags: ['Python','Binance API','Trading','Algorithms','CLI'],
      filter: ['tools','backend'],
      icon: 'fa-chart-line',
      color: '#FFBD2E', color2: '#FF00B8',
      status: 'active',
      stars: 31, forks: 12,
      updated: '2026-03',
      github: 'https://github.com/sahoo-tech/BINANCE-FUTURES-BOT',
      demo: null,
      features: [
        'CLI-driven trading strategy configuration',
        'Binance USDT-M Futures API integration',
        'Multiple algorithmic strategy support',
        'Real-time position & P&L monitoring',
        'Risk management & stop-loss automation'
      ]
    },
    {
      id: 7,
      name: 'Real-Time Object Detection',
      desc: 'Python and OpenCV based system for live camera feed object detection. Achieves accurate detection and tracking of moving objects in real time with high frame-rate performance.',
      tags: ['Python','OpenCV','Computer Vision','ML'],
      filter: ['ai'],
      icon: 'fa-camera',
      color: '#00F5FF', color2: '#3A8DFF',
      status: 'active',
      stars: 9, forks: 3,
      updated: '2025-08',
      github: 'https://github.com/sahoo-tech',
      demo: null,
      features: [
        'Live camera feed object tracking',
        'OpenCV + deep learning model pipeline',
        'Accurate bounding box detection',
        'High FPS real-time processing',
        'Configurable confidence thresholds'
      ]
    },
    {
      id: 8,
      name: 'Honeypot Threat Analysis',
      desc: 'Designed and deployed a honeypot system to log unauthorized intrusion attempts and analyze attacker behavior. Provides actionable security insights and attack pattern visualizations.',
      tags: ['Cybersecurity','Python','Networking','Security'],
      filter: ['security','tools'],
      icon: 'fa-bug',
      color: '#FF00B8', color2: '#8A2BE2',
      status: 'active',
      stars: 7, forks: 2,
      updated: '2025-07',
      github: 'https://github.com/sahoo-tech',
      demo: null,
      features: [
        'Honeypot deployment & intrusion logging',
        'Attacker behavior analysis dashboard',
        'Attack pattern recognition & classification',
        'Automated security report generation',
        'Network traffic anomaly detection'
      ]
    },
    {
      id: 9,
      name: 'Advanced Network Diagnostic Tool',
      desc: 'Comprehensive toolkit to analyze and monitor network performance, identify vulnerabilities, and optimize network reliability across enterprise environments.',
      tags: ['Python','Networking','Security','CLI'],
      filter: ['security','tools'],
      icon: 'fa-network-wired',
      color: '#3A8DFF', color2: '#00F5FF',
      status: 'active',
      stars: 6, forks: 2,
      updated: '2025-06',
      github: 'https://github.com/sahoo-tech',
      demo: null,
      features: [
        'Network performance benchmarking',
        'Vulnerability scanning & reporting',
        'Packet analysis & traffic monitoring',
        'Multi-protocol diagnostic support',
        'Reliability optimization recommendations'
      ]
    },
    {
      id: 10,
      name: 'Bug Scanner',
      desc: 'Automated web application vulnerability scanner that detects common security flaws — SQL injection, XSS, CSRF, and more — improving security assessment speed significantly.',
      tags: ['Security','Python','Web Testing','OWASP'],
      filter: ['security','tools'],
      icon: 'fa-search',
      color: '#8A2BE2', color2: '#3A8DFF',
      status: 'active',
      stars: 8, forks: 3,
      updated: '2025-09',
      github: 'https://github.com/sahoo-tech',
      demo: null,
      features: [
        'Automated OWASP Top-10 vulnerability checks',
        'SQL injection & XSS detection',
        'CSRF token validation testing',
        'Detailed PDF security reports',
        'Configurable scan depth & target scope'
      ]
    }
  ];

  // ── Technology Matrix ─────────────────────────────────
  const GH_TECHS = [
    { name: 'Python',      icon: 'fab fa-python',    color: '#3A8DFF' },
    { name: 'JavaScript',  icon: 'fab fa-js',         color: '#FFBD2E' },
    { name: 'TypeScript',  icon: 'fab fa-js-square',  color: '#3A8DFF' },
    { name: 'React.js',    icon: 'fab fa-react',      color: '#00F5FF' },
    { name: 'Next.js',     icon: 'fas fa-n',          color: '#ffffff' },
    { name: 'Node.js',     icon: 'fab fa-node-js',    color: '#28CA41' },
    { name: 'Django',      icon: 'fas fa-server',     color: '#28CA41' },
    { name: 'Docker',      icon: 'fab fa-docker',     color: '#3A8DFF' },
    { name: 'HTML5',       icon: 'fab fa-html5',      color: '#FF5F57' },
    { name: 'CSS3',        icon: 'fab fa-css3-alt',   color: '#3A8DFF' },
    { name: 'PostgreSQL',  icon: 'fas fa-database',   color: '#3A8DFF' },
    { name: 'MongoDB',     icon: 'fas fa-leaf',       color: '#28CA41' },
    { name: 'MySQL',       icon: 'fas fa-database',   color: '#FFBD2E' },
    { name: 'Git',         icon: 'fab fa-git-alt',    color: '#FF5F57' },
    { name: 'GitHub',      icon: 'fab fa-github',     color: '#ffffff' },
    { name: 'Linux',       icon: 'fab fa-linux',      color: '#FFBD2E' },
    { name: 'Kotlin',      icon: 'fas fa-mobile-alt', color: '#8A2BE2' },
    { name: 'Bootstrap',   icon: 'fab fa-bootstrap',  color: '#8A2BE2' },
    { name: 'TailwindCSS', icon: 'fas fa-wind',       color: '#00F5FF' },
    { name: 'NumPy',       icon: 'fas fa-superscript',color: '#00F5FF' },
    { name: 'Pandas',      icon: 'fas fa-table',      color: '#3A8DFF' },
    { name: 'OpenCV',      icon: 'fas fa-eye',        color: '#FF00B8' },
    { name: 'Java',        icon: 'fab fa-java',       color: '#FF5F57' },
    { name: 'C/C++',       icon: 'fas fa-code',       color: '#3A8DFF' },
  ];

  // ── Render Language Matrix ────────────────────────────
  const ghLangMatrix = document.getElementById('ghLangMatrix');
  if (ghLangMatrix) {
    GH_TECHS.forEach(t => {
      const node = document.createElement('div');
      node.className = 'gh-hex-node';
      node.style.cssText = `border-color: ${t.color}33; background: ${t.color}0A;`;
      node.innerHTML = `<i class="${t.icon}" style="color:${t.color};filter:drop-shadow(0 0 6px ${t.color})"></i><span>${t.name}</span>`;
      node.title = t.name;
      ghLangMatrix.appendChild(node);
    });
  }

  // ── Render Repository Cards ───────────────────────────
  const ghReposGrid = document.getElementById('ghReposGrid');
  function renderRepos(list) {
    if (!ghReposGrid) return;
    ghReposGrid.innerHTML = '';
    list.forEach(r => {
      const card = document.createElement('div');
      card.className = 'gh-repo-card reveal-up visible';
      card.dataset.id = r.id;
      const tagsHtml = r.tags.map(t =>
        `<span class="gh-repo-tag" style="color:${r.color};border-color:${r.color}44;background:${r.color}11">${t}</span>`
      ).join('');
      const demoBtn = r.demo
        ? `<a href="${r.demo}" target="_blank" title="Live Demo" onclick="event.stopPropagation()"><i class="fas fa-external-link-alt"></i></a>`
        : '';
      card.innerHTML = `
        <div class="gh-repo-neon-border" style="--c1:${r.color};--c2:${r.color2}"></div>
        <div class="gh-repo-top">
          <div class="gh-repo-icon" style="background:${r.color}18;color:${r.color};box-shadow:0 0 12px ${r.color}30">
            <i class="fas ${r.icon}"></i>
          </div>
          <div class="gh-repo-actions">
            <a href="${r.github}" target="_blank" title="GitHub" onclick="event.stopPropagation()"><i class="fab fa-github"></i></a>
            ${demoBtn}
          </div>
        </div>
        <h4 class="gh-repo-title">${r.name}</h4>
        <p class="gh-repo-desc">${r.desc}</p>
        <div class="gh-repo-tags">${tagsHtml}</div>
        <div class="gh-repo-footer">
          <div class="gh-repo-meta">
            <span><i class="fas fa-star"></i> ${r.stars}</span>
            <span><i class="fas fa-code-branch"></i> ${r.forks}</span>
            <span><i class="fas fa-clock"></i> ${r.updated}</span>
          </div>
          <span class="gh-repo-status ${r.status}">${r.status === 'active' ? 'Active' : 'In Dev'}</span>
        </div>
      `;
      card.addEventListener('click', () => openDossier(r));
      ghReposGrid.appendChild(card);
    });
  }
  renderRepos(GH_REPOS);

  // ── Search & Filter ───────────────────────────────────
  const ghSearchInput = document.getElementById('ghSearchInput');
  const ghFilterBtns  = document.querySelectorAll('.gh-filter');
  let activeFilter = 'all';

  function applyFilter() {
    const query = ghSearchInput ? ghSearchInput.value.toLowerCase().trim() : '';
    const filtered = GH_REPOS.filter(r => {
      const matchFilter = activeFilter === 'all' || r.filter.includes(activeFilter);
      const matchSearch = !query ||
        r.name.toLowerCase().includes(query) ||
        r.desc.toLowerCase().includes(query) ||
        r.tags.some(t => t.toLowerCase().includes(query));
      return matchFilter && matchSearch;
    });
    renderRepos(filtered);
  }

  ghFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      ghFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilter();
    });
  });
  if (ghSearchInput) {
    ghSearchInput.addEventListener('input', applyFilter);
  }

  // ── Animated Stat Counters ────────────────────────────
  function animateGhStats() {
    document.querySelectorAll('.gh-stat-count').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 60));
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        const hasPlus = (target === 30 || target === 500 || target === 1000);
        el.textContent = current + (current === target && hasPlus ? '+' : '');
        if (current >= target) clearInterval(timer);
      }, 25);
    });
  }

  // ── Contribution Galaxy Canvas ────────────────────────
  function initGalaxy() {
    const canvas = document.getElementById('ghGalaxyCanvas');
    const tooltip = document.getElementById('ghGalaxyTooltip');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width  = canvas.offsetWidth  || 800;
    canvas.height = canvas.offsetHeight || 180;

    const weeks = 52, days = 7;
    const cellW = Math.floor(canvas.width / (weeks + 1));
    const cellH = Math.floor((canvas.height - 30) / days);
    const pad   = 10;
    const stars = [];

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();

    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < days; d++) {
        const contrib = Math.random() < 0.35 ? 0 :
          Math.random() < 0.5 ? Math.floor(Math.random() * 3) + 1 :
          Math.floor(Math.random() * 12) + 1;
        const date = new Date(now);
        date.setDate(date.getDate() - ((weeks - w) * 7 + (days - d)));
        stars.push({
          x: pad + w * cellW + cellW / 2,
          y: pad + d * cellH + cellH / 2,
          contrib,
          date: date.toDateString(),
          opacity: contrib === 0 ? 0.06 : 0.1 + (contrib / 15) * 0.9,
          phase: Math.random() * Math.PI * 2,
          speed: 0.8 + Math.random() * 1.5
        });
      }
    }

    // Month labels
    function drawLabels() {
      ctx.font = '9px Share Tech Mono, monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      for (let m = 0; m < 12; m++) {
        const wx = pad + Math.round(m * (weeks / 12)) * cellW;
        ctx.fillText(months[m], wx, canvas.height - 6);
      }
    }

    let animFrame;
    function drawGalaxy(ts = 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawLabels();
      stars.forEach(s => {
        const pulse = s.contrib > 0
          ? s.opacity * (0.85 + 0.15 * Math.sin(ts * 0.001 * s.speed + s.phase))
          : s.opacity;
        const r = s.contrib > 0 ? 3.5 + (s.contrib / 15) * 2 : 3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 255, ${pulse})`;
        if (s.contrib > 6) {
          ctx.shadowBlur = 8; ctx.shadowColor = '#00F5FF';
        } else { ctx.shadowBlur = 0; }
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      animFrame = requestAnimationFrame(drawGalaxy);
    }
    drawGalaxy();

    // Tooltip on hover
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let hit = null;
      for (const s of stars) {
        if (Math.abs(mx - s.x) < 6 && Math.abs(my - s.y) < 6) { hit = s; break; }
      }
      if (hit) {
        tooltip.style.opacity = '1';
        tooltip.style.left    = (e.clientX - rect.left + 12) + 'px';
        tooltip.style.top     = (e.clientY - rect.top  - 30) + 'px';
        tooltip.textContent   = `${hit.date} — ${hit.contrib} contribution${hit.contrib !== 1 ? 's' : ''}`;
      } else {
        tooltip.style.opacity = '0';
      }
    });
    canvas.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });
  }

  // ── Project Dossier Modal ─────────────────────────────
  const dossierOverlay  = document.getElementById('ghDossierOverlay');
  const dossierClose    = document.getElementById('ghDossierClose');
  const dossierContent  = document.getElementById('ghDossierContent');

  function openDossier(r) {
    if (!dossierOverlay || !dossierContent) return;
    const tagsHtml = r.tags.map(t =>
      `<span class="gh-repo-tag" style="color:${r.color};border-color:${r.color}55;background:${r.color}11;padding:0.3rem 0.8rem;">${t}</span>`
    ).join('');
    const featuresHtml = r.features.map(f => `<li>${f}</li>`).join('');
    const demoLink = r.demo
      ? `<a href="${r.demo}" target="_blank" class="demo-link"><i class="fas fa-external-link-alt"></i> Live Demo</a>`
      : '';
    dossierContent.innerHTML = `
      <div class="gh-dossier-title" style="color:${r.color}">${r.name}</div>
      <div class="gh-dossier-sub">[ ${r.filter.map(f=>f.toUpperCase()).join(' · ')} ] &nbsp;·&nbsp; Updated ${r.updated} &nbsp;·&nbsp; ★ ${r.stars} &nbsp;·&nbsp; ⑂ ${r.forks}</div>
      <div class="gh-dossier-desc">${r.desc}</div>

      <div class="gh-dossier-section-title">[ TECHNOLOGY STACK ]</div>
      <div class="gh-dossier-tags">${tagsHtml}</div>

      <div class="gh-dossier-section-title">[ CORE FEATURES ]</div>
      <ul class="gh-dossier-features">${featuresHtml}</ul>

      <div class="gh-dossier-links">
        <a href="${r.github}" target="_blank"><i class="fab fa-github"></i> View Repository</a>
        ${demoLink}
      </div>
    `;
    dossierOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  if (dossierClose) dossierClose.addEventListener('click', closeDossier);
  if (dossierOverlay) dossierOverlay.addEventListener('click', e => {
    if (e.target === dossierOverlay) closeDossier();
  });
  function closeDossier() {
    if (dossierOverlay) dossierOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDossier(); });

  // ── Command Terminal ──────────────────────────────────
  const ghCmdOutput = document.getElementById('ghCmdOutput');
  const ghCmdInput  = document.getElementById('ghCmdInput');

  const CMD_RESPONSES = {
    help: [
      { cls: 'cmd-header', text: '╔══════════════════════════════════════╗' },
      { cls: 'cmd-header', text: '║    SAHOO-TECH AI-OS  —  HELP          ║' },
      { cls: 'cmd-header', text: '╚══════════════════════════════════════╝' },
      { cls: 'cmd-output', text: ' repositories  — List all public repos' },
      { cls: 'cmd-output', text: ' ai            — AI & ML projects' },
      { cls: 'cmd-output', text: ' backend       — Backend & API projects' },
      { cls: 'cmd-output', text: ' web3          — Web3 / Blockchain repos' },
      { cls: 'cmd-output', text: ' security      — Cybersecurity projects' },
      { cls: 'cmd-output', text: ' hackathons    — Hackathon submissions' },
      { cls: 'cmd-output', text: ' latest        — Most recent commits' },
      { cls: 'cmd-output', text: ' whoami        — About Sayantan Sahoo' },
      { cls: 'cmd-output', text: ' clear         — Clear terminal' },
    ],
    repositories: [
      { cls: 'cmd-success', text: '[ 10 repositories found ]' },
      ...GH_REPOS.map((r, i) => ({ cls: 'cmd-output', text: ` ${String(i+1).padStart(2,'0')}  ${r.name.padEnd(30)} ★${r.stars}  [${r.status.toUpperCase()}]` }))
    ],
    ai: [
      { cls: 'cmd-header', text: '[ AI / ML PROJECTS — sahoo-tech ]' },
      { cls: 'cmd-output', text: '  VIRALYTIX      — Viral outbreak prediction AI' },
      { cls: 'cmd-output', text: '  AEGIS AI       — Fraud detection with Gemini AI' },
      { cls: 'cmd-output', text: '  Agritech AI    — Crop disease detection ML' },
      { cls: 'cmd-output', text: '  Code-Analyzer  — RAG-based code intelligence' },
      { cls: 'cmd-output', text: '  Object Detect  — Real-time OpenCV detection' },
    ],
    backend: [
      { cls: 'cmd-header', text: '[ BACKEND / API PROJECTS ]' },
      { cls: 'cmd-output', text: '  AEGIS AI         — REST APIs, PostgreSQL' },
      { cls: 'cmd-output', text: '  Agritech AI      — Python/Flask backend' },
      { cls: 'cmd-output', text: '  Binance Bot      — CLI trading engine, REST' },
      { cls: 'cmd-output', text: '  Code-Analyzer    — Python AST engine' },
      { cls: 'cmd-output', text: '  Bug Scanner      — Web vulnerability scanner' },
    ],
    web3: [
      { cls: 'cmd-header', text: '[ WEB3 / BLOCKCHAIN PROJECTS ]' },
      { cls: 'cmd-output', text: '  Chainmuse — AI + Blockchain creator platform' },
      { cls: 'cmd-output', text: '  VIRALYTIX — Blockchain data integrity layer' },
      { cls: 'cmd-warn',   text: '  HACKHAZARD 2025 Hackathon finalist' },
    ],
    security: [
      { cls: 'cmd-header', text: '[ CYBERSECURITY PROJECTS ]' },
      { cls: 'cmd-output', text: '  Honeypot Analysis   — Intrusion detection' },
      { cls: 'cmd-output', text: '  Network Diagnostics — Vulnerability scanning' },
      { cls: 'cmd-output', text: '  Bug Scanner         — OWASP web vuln scanner' },
      { cls: 'cmd-output', text: '  AEGIS AI            — Real-time fraud detection' },
    ],
    hackathons: [
      { cls: 'cmd-header', text: '[ HACKATHON SUBMISSIONS ]' },
      { cls: 'cmd-success', text: '  HACKHAZARD 2025 — Chainmuse (Web3 + AI)' },
      { cls: 'cmd-link',   text: '  github.com/sahoo-tech/HACKHAZARD-PROJECT-2025' },
      { cls: 'cmd-success', text: '  VIRALYTIX — Public Health AI Challenge' },
      { cls: 'cmd-link',   text: '  hackathon-project-egq7-217a8mxah-sahoo-techs-projects.vercel.app' },
      { cls: 'cmd-output', text: '  Edunet/AICTE — Natural Hazard AI Capstone' },
    ],
    latest: [
      { cls: 'cmd-header', text: '[ RECENT COMMIT ACTIVITY ]' },
      { cls: 'cmd-success', text: '  2026-03  Binance Bot — Strategy optimization' },
      { cls: 'cmd-output', text: '  2026-02  VIRALYTIX — Real-time data pipeline' },
      { cls: 'cmd-output', text: '  2026-01  Code-Analyzer — RAG semantic search' },
      { cls: 'cmd-output', text: '  2025-12  Chainmuse — Smart contract v2' },
      { cls: 'cmd-output', text: '  2025-11  Agritech AI — Disease detection v2' },
    ],
    whoami: [
      { cls: 'cmd-header', text: '[ IDENTITY RESOLVED ]' },
      { cls: 'cmd-output', text: '  Name    : Sayantan Sahoo' },
      { cls: 'cmd-output', text: '  Role    : Back End Developer @ RoboTech' },
      { cls: 'cmd-output', text: '  Edu     : B.Tech CSE — Burdwan University (2024-2028)' },
      { cls: 'cmd-output', text: '  Stack   : Python · JS · React · Node · PostgreSQL' },
      { cls: 'cmd-output', text: '  Focus   : AI · Full-Stack · Cybersecurity' },
      { cls: 'cmd-link',   text: '  github.com/sahoo-tech' },
      { cls: 'cmd-link',   text: '  sayantansahooprofile.xyz' },
    ],
    clear: []
  };

  function termPrint(lines, delay = 40) {
    if (!ghCmdOutput) return;
    lines.forEach((l, i) => {
      setTimeout(() => {
        const span = document.createElement('span');
        span.className = `gh-cmd-line ${l.cls}`;
        span.textContent = l.text;
        ghCmdOutput.appendChild(span);
        ghCmdOutput.scrollTop = ghCmdOutput.scrollHeight;
      }, i * delay);
    });
  }

  // Boot message
  termPrint([
    { cls: 'cmd-success', text: 'AI-OS v3.7 booted. Welcome to sahoo-tech@github.' },
    { cls: 'cmd-output',  text: 'Type "help" to list available commands.' },
    { cls: 'cmd-output',  text: '─────────────────────────────────────────' },
  ], 60);

  if (ghCmdInput) {
    ghCmdInput.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const cmd = ghCmdInput.value.trim().toLowerCase();
      ghCmdInput.value = '';
      if (!cmd) return;

      // Echo input
      const echo = document.createElement('span');
      echo.className = 'gh-cmd-line cmd-input';
      echo.textContent = `root@sahoo:~$ ${cmd}`;
      ghCmdOutput.appendChild(echo);

      if (cmd === 'clear') {
        ghCmdOutput.innerHTML = '';
        return;
      }

      const response = CMD_RESPONSES[cmd] || [
        { cls: 'cmd-warn', text: `Command not found: "${cmd}". Type "help" for available commands.` }
      ];
      termPrint(response, 35);
    });
  }

  // ── Floating Particles ────────────────────────────────
  function initGhParticles() {
    const container = document.getElementById('ghParticles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'gh-particle';
      const colors = ['#00F5FF','#3A8DFF','#8A2BE2','#FF00B8'];
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration: ${6 + Math.random() * 10}s;
        animation-delay: ${Math.random() * 8}s;
        width: ${1 + Math.random() * 3}px;
        height: ${1 + Math.random() * 3}px;
      `;
      container.appendChild(p);
    }
  }
  initGhParticles();

  // ── Intersection Observer to trigger counters & galaxy ──
  const ghSection = document.getElementById('github');
  let ghInited = false;
  if (ghSection) {
    const ghObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !ghInited) {
        ghInited = true;
        animateGhStats();
        initGalaxy();
      }
    }, { threshold: 0.15 });
    ghObserver.observe(ghSection);
  }

  /* ══════════════════════════════════════════════════════
     ABOUT — AI IDENTITY CORE
  ══════════════════════════════════════════════════════ */
  function initAboutAiSection() {
    const aboutSection  = document.getElementById('about');
    const bootOverlay   = document.getElementById('aiBootOverlay');
    const container     = document.getElementById('aboutAiContainer');
    if (!aboutSection || !bootOverlay || !container) return;

    let aboutInited = false;

    // ── Floating particles ──
    const particleWrap = document.getElementById('aboutParticles');
    if (particleWrap) {
      for (let i = 0; i < 28; i++) {
        const p = document.createElement('div');
        p.className = 'about-particle';
        const colors = ['#00F5FF','#3A8DFF','#8A2BE2','#FF00B8'];
        p.style.cssText = `
          left:${Math.random()*100}%;
          --dur:${6 + Math.random()*10}s;
          --dx:${(Math.random()-0.5)*120}px;
          background:${colors[Math.floor(Math.random()*colors.length)]};
          animation-delay:${Math.random()*10}s;
          width:${2 + Math.random()*3}px;
          height:${2 + Math.random()*3}px;
          opacity:0;
        `;
        particleWrap.appendChild(p);
      }
    }

    // ── Boot messages ──
    const BOOT_MSGS = [
      'SCANNING VISITOR...',
      'VERIFYING SECURITY CLEARANCE...',
      'ACCESSING PERSONNEL DATABASE...',
      'IDENTITY FOUND',
      'LOADING PROFILE...'
    ];

    function typeBootMsg(el, text, speed, cb) {
      let i = 0;
      el.textContent = '';
      const iv = setInterval(() => {
        el.textContent += text[i++];
        if (i >= text.length) { clearInterval(iv); if (cb) cb(); }
      }, speed);
    }

    function runBootSequence() {
      let idx = 0;
      function nextMsg() {
        if (idx >= BOOT_MSGS.length) {
          // Scan beam starts
          const beam = document.getElementById('bootScanBeam');
          if (beam) beam.style.animation = 'scanBeamAnim 2.2s linear forwards';
          setTimeout(() => {
            bootOverlay.classList.add('boot-done');
            container.style.opacity = '1';
            // Start typing ID card after reveal
            setTimeout(typeIdFields, 300);
            setTimeout(typeMissionOutput, 1200);
            setTimeout(initIdentityVerified, 2000);
          }, 2400);
          return;
        }
        const el = document.getElementById('bm' + idx);
        if (!el) { idx++; nextMsg(); return; }
        const speed = idx === 3 ? 60 : 28;
        typeBootMsg(el, BOOT_MSGS[idx], speed, () => {
          idx++;
          setTimeout(nextMsg, idx === BOOT_MSGS.length ? 100 : 240);
        });
      }
      nextMsg();
    }

    // ── IntersectionObserver ──
    // Hide overlay by default — show only when section enters view
    bootOverlay.style.display = 'none';
    container.style.opacity   = '0';

    const aboutObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !aboutInited) {
        aboutInited = true;
        bootOverlay.style.display = 'flex';
        runBootSequence();
      }
    }, { threshold: 0.08 });
    aboutObserver.observe(aboutSection);

    // ── Type ID Card fields ──
    function typeIdFields() {
      const fields = document.querySelectorAll('.id-typed');
      let fieldIdx = 0;
      function typeNext() {
        if (fieldIdx >= fields.length) return;
        const el = fields[fieldIdx];
        const val = el.dataset.val || '';
        el.textContent = '';
        let ci = 0;
        const iv = setInterval(() => {
          el.textContent += val[ci++];
          if (ci >= val.length) {
            clearInterval(iv);
            el.classList.add('typed-done');
            fieldIdx++;
            setTimeout(typeNext, 80);
          }
        }, 22);
      }
      typeNext();
    }

    // ── Mission output ──
    function typeMissionOutput() {
      const out = document.getElementById('missionOutput');
      if (!out) return;
      const lines = [
        '> MISSION STATEMENT LOADED',
        '',
        'Curious and results-driven Computer Science Engineer passionate about',
        'AI, Data Science, and Cybersecurity.',
        '',
        'Experienced in full-stack development and secure system design, with',
        'hands-on work in AI-driven solutions, backend services, and',
        'threat detection systems across 5+ internships.',
        '',
        'Currently pursuing dual degrees: B.Tech CSE @ Burdwan University',
        'and BS Data Science @ IIT Madras.',
        '',
        '> FOCUS: Building scalable, secure, intelligent systems',
        '> AVAILABILITY: Open to Opportunities',
        '> STATUS: ONLINE — Active @ RoboTech (Feb 2026 – Present)',
      ];
      let li = 0;
      function nextLine() {
        if (li >= lines.length) return;
        const div = document.createElement('div');
        div.style.opacity = '0';
        div.style.transition = 'opacity 0.3s ease';
        div.innerHTML = lines[li] === ''
          ? '&nbsp;'
          : lines[li].startsWith('>')
            ? `<span style="color:var(--cyan)">${lines[li]}</span>`
            : lines[li];
        out.appendChild(div);
        requestAnimationFrame(() => { div.style.opacity = '1'; });
        li++;
        setTimeout(nextLine, li <= 2 ? 80 : 55);
      }
      nextLine();
    }

    // ── Tech DNA Tooltips ──
    const dnaTooltip = document.getElementById('dnaTechTooltip');
    document.querySelectorAll('.dna-node').forEach(node => {
      node.addEventListener('mouseenter', e => {
        if (!dnaTooltip) return;
        dnaTooltip.innerHTML = `
          <div class="dna-tip-tech">${node.dataset.tech}</div>
          <div class="dna-tip-used">Used in: ${node.dataset.used}</div>`;
        dnaTooltip.classList.add('show');
        positionTooltip(dnaTooltip, e);
      });
      node.addEventListener('mousemove', e => positionTooltip(dnaTooltip, e));
      node.addEventListener('mouseleave', () => dnaTooltip && dnaTooltip.classList.remove('show'));
    });

    // ── Career Pipeline node colors ──
    document.querySelectorAll('.pipe-item').forEach(item => {
      const c = item.dataset.color || '#00F5FF';
      item.style.setProperty('--pipe-color', c);
    });

    // ── Memory Vault Cards ──
    document.querySelectorAll('.vault-card').forEach(card => {
      const c = card.dataset.color || '#00F5FF';
      card.style.setProperty('--vault-c', c);
      card.style.setProperty('--vault-c-shadow', c + '33');
      card.addEventListener('click', () => {
        const isOpen = card.classList.contains('open');
        document.querySelectorAll('.vault-card').forEach(vc => vc.classList.remove('open'));
        if (!isOpen) card.classList.add('open');
      });
    });

    // ── Achievement Badge Tooltips ──
    const achTip = document.getElementById('achBadgeTip');
    document.querySelectorAll('.ach-badge').forEach((badge, i) => {
      badge.style.setProperty('--badge-delay', (i * 0.3) + 's');
      badge.addEventListener('mouseenter', e => {
        if (!achTip) return;
        achTip.textContent = badge.dataset.tip || '';
        achTip.classList.add('show');
        positionTooltip(achTip, e);
      });
      badge.addEventListener('mousemove', e => positionTooltip(achTip, e));
      badge.addEventListener('mouseleave', () => achTip && achTip.classList.remove('show'));
    });

    // ── Tooltip position helper ──
    function positionTooltip(el, e) {
      if (!el) return;
      const margin = 14;
      let x = e.clientX + margin;
      let y = e.clientY + margin;
      const w = el.offsetWidth || 240;
      const h = el.offsetHeight || 60;
      if (x + w > window.innerWidth - 10)  x = e.clientX - w - margin;
      if (y + h > window.innerHeight - 10) y = e.clientY - h - margin;
      el.style.left = x + 'px';
      el.style.top  = y + 'px';
    }

    // ── Interactive AI Terminal ──
    const termBody  = document.getElementById('aiTermBody');
    const termInput = document.getElementById('aiTermInput');
    const termEnter = document.getElementById('aiTermEnter');
    if (!termBody || !termInput || !termEnter) return;

    const TERM_COMMANDS = {
      whoami: () => [
        'SAYANTAN SAHOO',
        'Computer Science Engineer | Backend Developer | AI Enthusiast',
        'Location     : Kolkata, India',
        'Email        : ss9830872697@gmail.com',
        'Phone        : +91 8777651702',
        'GitHub       : github.com/sahoo-tech',
        'LinkedIn     : linkedin.com/in/sayantan-sahoo-8482a62a0',
      ],
      education: () => [
        '[ EDUCATION RECORDS ]',
        '1. B.Tech in Computer Science & Engineering',
        '   → University Institute of Technology, Burdwan University',
        '   → 2024 – Present  |  STATUS: ACTIVE',
        '',
        '2. BS in Data Science and Applications',
        '   → Indian Institute of Technology, Madras (Online)',
        '   → 2025 – 2029  |  STATUS: ACTIVE',
      ],
      experience: () => [
        '[ EXPERIENCE LOG — 5 INTERNSHIPS + 1 ACTIVE ROLE ]',
        '',
        '01  Back End Developer @ RoboTech          Feb 2026 – Present  [ACTIVE]',
        '02  Software Dev Intern @ Techplement       Aug 2024 – Sep 2024',
        '03  Software Engineer Intern @ Zidio        Jun 2025 – Aug 2025',
        '04  Software Engineer Intern @ Edunet       Aug 2025 – Sep 2025',
        '05  Software Engineer Intern @ Springer     Oct 2025 – Dec 2025',
      ],
      skills: () => [
        '[ TECHNOLOGY STACK ]',
        '',
        'Languages  : Python, Java, C/C++, Node.js, Kotlin',
        'Web        : React.js, Next.js, Django, HTML, CSS, Bootstrap, Tailwind',
        'Scripting  : JavaScript, TypeScript',
        'DevOps     : Docker',
        'Databases  : MySQL, MongoDB, PostgreSQL',
        'Tools      : Git, VS Code, Postman, REST APIs',
        'AI/ML      : Scikit-learn, Pandas, NumPy, TensorFlow',
        'Security   : Network Security, Threat Detection, Secure Systems',
      ],
      projects: () => [
        '[ PROJECT DATABASE — 30+ PROJECTS ]',
        '',
        'Chainmuse    → Web3 + AI creator platform | Blockchain, React, Smart Contracts',
        'Code-Analyzer→ Enterprise Python AST analyzer with AI + RAG-based search',
        'VIRALYTIX    → AI viral outbreak monitoring & prediction platform',
        'Portfolio    → This cyberpunk portfolio (HTML/CSS/JS)',
        '+ 26 more projects on github.com/sahoo-tech',
      ],
      internships: () => [
        '[ INTERNSHIP RECORDS ]',
        '',
        'RoboTech       | Back End Developer       | Feb 2026 – Present',
        'Techplement     | Software Dev Intern      | Aug – Sep 2024',
        'Zidio Dev       | Software Engineer Intern | Jun – Aug 2025',
        'Edunet Found.   | Software Engineer Intern | Aug – Sep 2025',
        'Springer Capital| Software Engineer Intern | Oct – Dec 2025',
      ],
      opensource: () => [
        '[ OPEN SOURCE ACTIVITY ]',
        '',
        'GitHub Handle : sahoo-tech',
        'Public Repos  : 35+',
        'Domains       : AI, Backend, Security, Full-Stack, Automation',
        'Notable Repos : Chainmuse, Code-Analyzer, VIRALYTIX, Portfolio',
        'URL           : https://github.com/sahoo-tech',
      ],
      github: () => [
        '[ GITHUB PROFILE ]',
        '',
        'URL          : https://github.com/sahoo-tech',
        'Repositories : 35+',
        'Focus Areas  : Python, AI/ML, Backend, Full-Stack, Security',
        'Hackathons   : HackHazard 2025 (Chainmuse), VIRALYTIX',
      ],
      resume: () => [
        '[ RESUME / CV ]',
        '',
        'Downloading resume... Sayantan_Sahoo(CV-3).pdf',
        'Or visit the Resume button in the navigation bar.',
      ],
      contact: () => [
        '[ CONTACT INFORMATION ]',
        '',
        'Email    : ss9830872697@gmail.com',
        'Phone    : +91 8777651702',
        'LinkedIn : linkedin.com/in/sayantan-sahoo-8482a62a0',
        'GitHub   : github.com/sahoo-tech',
        'Location : Kolkata, West Bengal, India',
      ],
      help: () => [
        '[ AVAILABLE COMMANDS ]',
        '',
        'whoami       → Display identity profile',
        'education    → Academic qualifications',
        'experience   → Internships & work history',
        'skills       → Full technology stack',
        'projects     → Featured projects list',
        'internships  → Internship records',
        'opensource   → Open source contributions',
        'github       → GitHub profile info',
        'resume       → Resume / CV details',
        'contact      → Contact information',
        'clear        → Clear the terminal',
        'help         → Show this help menu',
      ],
      clear: () => null,
    };

    function addTermLine(text, cls) {
      const div = document.createElement('div');
      div.className = 'aterm-line ' + (cls || 'aterm-resp');
      div.textContent = text;
      termBody.appendChild(div);
      termBody.scrollTop = termBody.scrollHeight;
    }

    function execCommand(raw) {
      const cmd = raw.trim().toLowerCase();
      if (!cmd) return;

      // Echo command
      addTermLine('sayantan@core:~$ ' + raw, 'aterm-cmd');

      if (cmd === 'clear') {
        termBody.innerHTML = '<div class="aterm-line aterm-system">Terminal cleared. Type <span style="color:var(--cyan)">help</span> to list commands.</div>';
        return;
      }

      const handler = TERM_COMMANDS[cmd];
      if (!handler) {
        addTermLine('Command not found: "' + cmd + '". Type help for available commands.', 'aterm-error');
        return;
      }

      const lines = handler();
      if (!lines) return;
      lines.forEach((ln, i) => {
        setTimeout(() => {
          addTermLine(ln, ln.startsWith('[') ? 'aterm-key' : 'aterm-resp');
        }, i * 30);
      });
    }

    termEnter.addEventListener('click', () => {
      execCommand(termInput.value);
      termInput.value = '';
      termInput.focus();
    });

    termInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        execCommand(termInput.value);
        termInput.value = '';
      }
    });

    // ── Identity Verified Outro ──
    function initIdentityVerified() {
      const ivSection = document.getElementById('identityVerified');
      if (!ivSection) return;
      const ivObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          const lines = ivSection.querySelectorAll('.iv-line');
          lines.forEach((ln, i) => {
            setTimeout(() => ln.classList.add('iv-visible'), i * 400);
          });
          ivObserver.disconnect();
        }
      }, { threshold: 0.3 });
      ivObserver.observe(ivSection);
    }
  }

  // ── Wire up About AI Section ──
  initAboutAiSection();

  /* ══════════════════════════════════════════════════════
     NEURAL NETWORK SKILLS MATRIX
  ══════════════════════════════════════════════════════ */
  function initNeuralSkillsMatrix() {
    const stage      = document.getElementById('neuralStage');
    const nodesLayer = document.getElementById('techNodes');
    const svgEl      = document.getElementById('neuralSvg');
    const catLayer   = document.getElementById('catLabels');
    const panel      = document.getElementById('holoPanel');
    const bgCanvas   = document.getElementById('skillsBgCanvas');
    if (!stage || !nodesLayer || !svgEl) return;

    /* ── Technology Data ── */
    const CAT = {
      'Frontend':   '#3A8DFF',
      'Backend':    '#00F5FF',
      'AI / ML':    '#8A2BE2',
      'Databases':  '#FF6B35',
      'Cloud':      '#00E5CC',
      'DevOps':     '#FFD700',
      'Tools':      '#A8FF3E',
    };

    const TECHS = [
      { id:'react',      name:'React',       cat:'Frontend',  icon:'fab fa-react',     color:'#61DAFB',
        usedIn:'Projects, Internships', count:6, status:'Frequently Used',
        relatedTo:['nextjs','typescript','javascript'],
        summary:'Built dynamic SPAs with hooks, context API, and custom components.' },
      { id:'nextjs',     name:'Next.js',     cat:'Frontend',  icon:'fas fa-layer-group',color:'#AAAAAA',
        usedIn:'Projects, Professional Experience', count:4, status:'Production Experience',
        relatedTo:['react','typescript','vercel'],
        summary:'Deployed full-stack apps with SSR/SSG and API routes on Vercel.' },
      { id:'javascript', name:'JavaScript',  cat:'Frontend',  icon:'fab fa-js-square', color:'#F7DF1E',
        usedIn:'Projects, Internships, Professional Experience', count:8, status:'Frequently Used',
        relatedTo:['typescript','react','nodejs'],
        summary:'Core language for frontend interactivity and backend scripting.' },
      { id:'typescript', name:'TypeScript',  cat:'Frontend',  icon:'fas fa-code',      color:'#3178C6',
        usedIn:'Projects', count:3, status:'Active Learning',
        relatedTo:['react','nextjs','javascript'],
        summary:'Strong typing in React/Next.js projects to reduce runtime errors.' },
      { id:'nodejs',     name:'Node.js',     cat:'Backend',   icon:'fab fa-node-js',   color:'#68A063',
        usedIn:'Projects, Professional Experience', count:5, status:'Frequently Used',
        relatedTo:['expressjs','javascript','postgresql'],
        summary:'REST API servers, real-time WebSocket services, and CLI tooling.' },
      { id:'expressjs',  name:'Express.js',  cat:'Backend',   icon:'fas fa-route',     color:'#00F5FF',
        usedIn:'Projects, Internships, Professional Experience', count:5, status:'Frequently Used',
        relatedTo:['nodejs','postgresql','mongodb'],
        summary:'RESTful APIs with middleware, authentication, and rate limiting.' },
      { id:'python',     name:'Python',      cat:'Backend',   icon:'fab fa-python',    color:'#3776AB',
        usedIn:'Projects, Internships, Professional Experience', count:7, status:'Production Experience',
        relatedTo:['fastapi','tensorflow','pytorch'],
        summary:'ML pipelines, data processing scripts, and backend services.' },
      { id:'fastapi',    name:'FastAPI',     cat:'Backend',   icon:'fas fa-bolt',      color:'#009688',
        usedIn:'Projects', count:3, status:'Active Learning',
        relatedTo:['python','postgresql','redis'],
        summary:'Async Python APIs with OpenAPI docs and Pydantic validation.' },
      { id:'postgresql', name:'PostgreSQL',  cat:'Databases', icon:'fas fa-database',  color:'#FF6B35',
        usedIn:'Projects, Professional Experience', count:4, status:'Frequently Used',
        relatedTo:['nodejs','expressjs','fastapi'],
        summary:'Normalized schemas, complex queries, and managed migrations.' },
      { id:'mongodb',    name:'MongoDB',     cat:'Databases', icon:'fas fa-leaf',      color:'#47A248',
        usedIn:'Projects, Internships', count:4, status:'Frequently Used',
        relatedTo:['expressjs','nodejs','redis'],
        summary:'Flexible document storage in REST APIs and real-time apps.' },
      { id:'firebase',   name:'Firebase',    cat:'Databases', icon:'fas fa-fire',      color:'#FFCA28',
        usedIn:'Projects', count:3, status:'Frequently Used',
        relatedTo:['react','nextjs','mongodb'],
        summary:'Firestore, Auth, and Cloud Functions for real-time auth flows.' },
      { id:'redis',      name:'Redis',       cat:'Databases', icon:'fas fa-memory',    color:'#DC382D',
        usedIn:'Projects', count:2, status:'Active Learning',
        relatedTo:['fastapi','nodejs','mongodb'],
        summary:'Caching layers, session stores, and pub/sub messaging.' },
      { id:'tensorflow', name:'TensorFlow',  cat:'AI / ML',   icon:'fas fa-brain',     color:'#FF6F00',
        usedIn:'Projects', count:3, status:'Active Learning',
        relatedTo:['python','pytorch'],
        summary:'CNN/RNN models for image classification and NLP tasks.' },
      { id:'pytorch',    name:'PyTorch',     cat:'AI / ML',   icon:'fas fa-fire-alt',  color:'#EE4C2C',
        usedIn:'Projects', count:2, status:'Active Learning',
        relatedTo:['python','tensorflow'],
        summary:'Custom neural network architectures with GPU acceleration.' },
      { id:'numpy',      name:'NumPy/Pandas', cat:'AI / ML',  icon:'fas fa-chart-bar', color:'#9C27B0',
        usedIn:'Projects, Internships', count:5, status:'Frequently Used',
        relatedTo:['python','tensorflow','pytorch'],
        summary:'Data wrangling, numerical computation, and feature engineering.' },
      { id:'docker',     name:'Docker',      cat:'DevOps',    icon:'fab fa-docker',    color:'#2496ED',
        usedIn:'Projects', count:3, status:'Active Learning',
        relatedTo:['aws','git'],
        summary:'Containerized apps with multi-stage builds and Compose.' },
      { id:'git',        name:'Git',         cat:'Tools',     icon:'fab fa-git-alt',   color:'#F05032',
        usedIn:'Projects, Internships, Professional Experience', count:10, status:'Frequently Used',
        relatedTo:['github','docker'],
        summary:'Version control, branching strategies, and collaborative dev.' },
      { id:'github',     name:'GitHub',      cat:'Tools',     icon:'fab fa-github',    color:'#E6EDF3',
        usedIn:'Projects, Internships, Professional Experience', count:10, status:'Frequently Used',
        relatedTo:['git','vercel'],
        summary:'PRs, CI/CD Actions pipelines, and project boards.' },
      { id:'aws',        name:'AWS',         cat:'Cloud',     icon:'fab fa-aws',       color:'#FF9900',
        usedIn:'Projects', count:2, status:'Active Learning',
        relatedTo:['docker','vercel'],
        summary:'EC2/Lambda deployments, S3 storage, and RDS databases.' },
      { id:'vercel',     name:'Vercel',      cat:'Cloud',     icon:'fas fa-cloud',     color:'#00E5CC',
        usedIn:'Projects, Professional Experience', count:5, status:'Frequently Used',
        relatedTo:['nextjs','git','github'],
        summary:'Next.js deployments with preview environments and edge CDN.' },
    ];

    /* ── Stage Dimensions (always use container width as fallback) ── */
    function getW() {
      return stage.offsetWidth || stage.parentElement?.offsetWidth || window.innerWidth * 0.9 || 900;
    }
    function getH() { return stage.offsetHeight || 700; }

    /* ── Compute radial positions ── */
    let POS = {};
    function computePositions() {
      POS = {};
      const w = getW(), h = getH();
      const cx = w / 2, cy = h / 2;
      const orbitR = Math.min(w, h) * 0.37;
      const catR   = Math.min(w, h) * 0.48;
      const CATS   = Object.keys(CAT);
      const catSpan = (2 * Math.PI) / CATS.length;

      CATS.forEach((cat, ci) => {
        const groupTechs = TECHS.filter(t => t.cat === cat);
        const count = groupTechs.length;
        const catCenter = (ci / CATS.length) * 2 * Math.PI - Math.PI / 2;
        const halfSpan  = count > 1 ? catSpan * 0.72 : 0;

        groupTechs.forEach((t, ti) => {
          const angle = count > 1
            ? catCenter - halfSpan / 2 + (ti / (count - 1)) * halfSpan
            : catCenter;
          POS[t.id] = { x: cx + orbitR * Math.cos(angle), y: cy + orbitR * Math.sin(angle) };
        });

        POS['_cat_' + cat] = {
          x: cx + catR * Math.cos(catCenter),
          y: cy + catR * Math.sin(catCenter),
        };
      });
    }

    /* ── Canvas animated background ── */
    function initBgCanvas() {
      if (!bgCanvas) return;
      const ctx = bgCanvas.getContext('2d');
      let W = 0, H = 0, particles = [], circuits = [];

      function resize() {
        const sec = document.getElementById('skills');
        W = bgCanvas.width  = sec ? sec.offsetWidth  : window.innerWidth;
        H = bgCanvas.height = sec ? sec.offsetHeight : 900;
        buildCircuits(); buildParticles();
      }

      function buildCircuits() {
        circuits = [];
        for (let i = 0; i < 20; i++) {
          const pts = [{ x: Math.random() * W, y: Math.random() * H }];
          for (let s = 0; s < 5; s++) {
            const last = pts[pts.length - 1];
            const dir = Math.floor(Math.random() * 4);
            const d   = (Math.floor(Math.random() * 3) + 1) * 55;
            pts.push({
              x: Math.max(0, Math.min(W, last.x + (dir===0?d:dir===1?-d:0))),
              y: Math.max(0, Math.min(H, last.y + (dir===2?d:dir===3?-d:0))),
            });
          }
          circuits.push({ pts, alpha: Math.random()*0.25+0.04, speed: Math.random()*0.002+0.0005, phase: Math.random()*Math.PI*2 });
        }
      }

      function buildParticles() {
        particles = Array.from({ length: 35 }, () => ({
          x: Math.random()*W, y: Math.random()*H,
          vx: (Math.random()-0.5)*0.3, vy: -Math.random()*0.4-0.1,
          r: Math.random()*1.5+0.4,
          alpha: Math.random()*0.4+0.1,
          color: ['#00F5FF','#3A8DFF','#8A2BE2','#FF00B8'][Math.floor(Math.random()*4)],
        }));
      }

      let lastT = 0;
      function draw(t) {
        ctx.clearRect(0,0,W,H);
        // radial glow
        const g = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.min(W,H)*0.45);
        g.addColorStop(0,'rgba(0,245,255,0.06)'); g.addColorStop(1,'transparent');
        ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
        // circuits
        circuits.forEach(c => {
          const a = c.alpha*(0.5+0.5*Math.sin(t*c.speed+c.phase));
          ctx.strokeStyle=`rgba(0,245,255,${a})`; ctx.lineWidth=0.8;
          ctx.beginPath();
          c.pts.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
          ctx.stroke();
          const mid=c.pts[Math.floor(c.pts.length/2)];
          ctx.fillStyle=`rgba(0,245,255,${a*1.8})`; ctx.beginPath(); ctx.arc(mid.x,mid.y,1.5,0,Math.PI*2); ctx.fill();
        });
        // particles
        particles.forEach(p=>{
          p.x+=p.vx; p.y+=p.vy;
          if(p.y<-5){p.y=H+5;p.x=Math.random()*W;}
          if(p.x<-5||p.x>W+5){p.x=Math.random()*W;}
          ctx.globalAlpha=p.alpha; ctx.fillStyle=p.color;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
        });
        ctx.globalAlpha=1;
        requestAnimationFrame(draw);
      }

      resize();
      window.addEventListener('resize', resize);
      requestAnimationFrame(draw);
    }
    initBgCanvas();

    /* ── Build all nodes & SVG ── */
    const NODE_ELS = {};
    const PULSES   = [];
    let activeHover = null;

    function buildAll() {
      computePositions();
      nodesLayer.innerHTML = '';
      svgEl.innerHTML = '';
      catLayer.innerHTML = '';
      PULSES.length = 0;
      Object.keys(NODE_ELS).forEach(k => delete NODE_ELS[k]);

      // Category labels
      Object.keys(CAT).forEach(cat => {
        const pos = POS['_cat_' + cat];
        if (!pos) return;
        const lbl = document.createElement('div');
        lbl.className = 'cat-label';
        lbl.id = 'cl_' + cat.replace(/[\s/]/g,'_');
        lbl.textContent = cat;
        lbl.style.cssText = `left:${pos.x}px;top:${pos.y}px;color:${CAT[cat]};border-color:${CAT[cat]}55;background:${CAT[cat]}18;`;
        catLayer.appendChild(lbl);
      });

      // Connection lines (unique pairs)
      const seen = new Set();
      TECHS.forEach(t => {
        t.relatedTo.forEach(rid => {
          const key = [t.id, rid].sort().join('|');
          if (seen.has(key)) return;
          seen.add(key);
          const pA = POS[t.id], pB = POS[rid];
          if (!pA || !pB) return;
          const line = document.createElementNS('http://www.w3.org/2000/svg','line');
          line.setAttribute('x1',pA.x); line.setAttribute('y1',pA.y);
          line.setAttribute('x2',pB.x); line.setAttribute('y2',pB.y);
          line.setAttribute('stroke', t.color);
          line.setAttribute('stroke-width','1.5');
          line.setAttribute('stroke-linecap','round');
          line.setAttribute('opacity','0.2');
          line.dataset.a = t.id; line.dataset.b = rid;
          line.classList.add('conn-line');
          svgEl.appendChild(line);

          const circ = document.createElementNS('http://www.w3.org/2000/svg','circle');
          circ.setAttribute('r','3');
          circ.setAttribute('fill', t.color);
          circ.setAttribute('opacity','0');
          circ.dataset.a = t.id; circ.dataset.b = rid;
          svgEl.appendChild(circ);
          PULSES.push({ el: circ, pA, pB, t: Math.random(), active: false });
        });
      });

      // Tech nodes
      TECHS.forEach(tech => {
        const pos = POS[tech.id];
        if (!pos) return;
        const node = document.createElement('div');
        node.className = 'tech-node';
        node.id = 'tn_' + tech.id;
        node.dataset.id = tech.id;
        node.style.cssText = `left:${pos.x}px;top:${pos.y}px;--node-color:${tech.color};`;
        node.innerHTML = `
          <div class="node-bubble">
            <div class="node-scan-line"></div>
            <i class="${tech.icon}" style="color:${tech.color};filter:drop-shadow(0 0 5px ${tech.color})"></i>
          </div>
          <div class="node-label">${tech.name}</div>`;
        nodesLayer.appendChild(node);
        NODE_ELS[tech.id] = node;
        node.addEventListener('mouseenter', () => onHover(tech));
        node.addEventListener('mouseleave', () => { /* panel stays visible */ });
        node.addEventListener('click', () => onClickNode(node, tech));
        node.addEventListener('mousemove', e => onMagnet(e, node));
      });

      // Reveal immediately with stagger
      const nodes = nodesLayer.querySelectorAll('.tech-node');
      nodes.forEach((n, i) => setTimeout(() => n.classList.add('revealed'), i * 55 + 80));
    }

    /* ── Pulse dot RAF ── */
    function animatePulses() {
      PULSES.forEach(p => {
        if (!p.active) { p.el.setAttribute('opacity','0'); return; }
        p.t = (p.t + 0.005) % 1;
        const x = p.pA.x + (p.pB.x - p.pA.x) * p.t;
        const y = p.pA.y + (p.pB.y - p.pA.y) * p.t;
        const fade = p.t < 0.1 ? p.t/0.1 : p.t > 0.9 ? (1-p.t)/0.1 : 1;
        p.el.setAttribute('cx', x);
        p.el.setAttribute('cy', y);
        p.el.setAttribute('opacity', (fade * 0.9).toFixed(2));
      });
      requestAnimationFrame(animatePulses);
    }
    requestAnimationFrame(animatePulses);

    /* ── Hover handler ── */
    function onHover(tech) {
      if (activeHover === tech.id) return;
      activeHover = tech.id;

      // Reset all nodes
      Object.values(NODE_ELS).forEach(n => n.classList.remove('hovered','active-connection'));
      svgEl.querySelectorAll('.conn-line').forEach(l => { l.setAttribute('opacity','0.2'); l.classList.remove('active'); });
      PULSES.forEach(p => { p.active = false; });
      document.querySelectorAll('.cat-label').forEach(l => l.classList.remove('highlighted'));

      // Highlight this node
      const hovNode = NODE_ELS[tech.id];
      if (hovNode) hovNode.classList.add('hovered');

      // Highlight category
      const cLbl = document.getElementById('cl_' + tech.cat.replace(/[\s/]/g,'_'));
      if (cLbl) cLbl.classList.add('highlighted');

      // Highlight connections
      tech.relatedTo.forEach(rid => {
        if (NODE_ELS[rid]) NODE_ELS[rid].classList.add('active-connection');
        svgEl.querySelectorAll('.conn-line').forEach(l => {
          if ((l.dataset.a===tech.id&&l.dataset.b===rid)||(l.dataset.b===tech.id&&l.dataset.a===rid)) {
            l.setAttribute('opacity','0.9');
            l.classList.add('active');
          }
        });
        PULSES.forEach(p => {
          if ((p.el.dataset.a===tech.id&&p.el.dataset.b===rid)||(p.el.dataset.b===tech.id&&p.el.dataset.a===rid)) {
            p.active = true; p.t = 0;
          }
        });
      });

      showPanel(tech);
    }

    /* ── Show holographic panel ── */
    function showPanel(tech) {
      if (!panel) return;
      const panelIcon    = document.getElementById('panelIcon');
      const panelName    = document.getElementById('panelName');
      const panelCat     = document.getElementById('panelCat');
      const panelStatus  = document.getElementById('panelStatus');
      const panelUsedIn  = document.getElementById('panelUsedIn');
      const panelCount   = document.getElementById('panelCount');
      const panelRelated = document.getElementById('panelRelated');
      const panelSummary = document.getElementById('panelSummary');
      const holoParts    = document.getElementById('holoPanelParticles');

      panelIcon.innerHTML = `<i class="${tech.icon}" style="color:${tech.color};font-size:1.2rem"></i>`;
      panelIcon.style.cssText = `background:${tech.color}22;border-color:${tech.color}44;`;
      panelName.textContent = tech.name;
      panelName.style.color = tech.color;
      panelCat.textContent  = tech.cat;
      const sk = tech.status.toLowerCase().replace(/\s+/g,'-');
      panelStatus.textContent = tech.status;
      panelStatus.className = 'holo-status-badge ' + sk;
      panelUsedIn.textContent  = tech.usedIn;
      panelCount.textContent   = tech.count + ' projects';
      panelCount.style.color   = tech.color;
      panelRelated.textContent = tech.relatedTo.map(r => { const f=TECHS.find(x=>x.id===r); return f?f.name:r; }).join(', ');
      panelSummary.textContent = tech.summary;
      panel.style.borderColor  = tech.color + '66';

      // Particle burst
      if (holoParts) {
        holoParts.innerHTML = '';
        for (let i = 0; i < 6; i++) {
          const p = document.createElement('div');
          p.className = 'holo-particle';
          p.style.cssText = `left:${Math.random()*100}%;background:${tech.color};animation-delay:${Math.random()*2}s;animation-duration:${(Math.random()*1.5+2)}s;`;
          holoParts.appendChild(p);
        }
      }

      // Position: beside node, clamped within stage
      const pos = POS[tech.id];
      const w = getW(), h = getH();
      const panW = 252, panH = 290;
      let px = pos.x + 44, py = pos.y - panH / 2;
      if (px + panW > w - 8) px = pos.x - panW - 44;
      if (py < 8)             py = 8;
      if (py + panH > h - 8) py = h - panH - 8;
      panel.style.left = px + 'px';
      panel.style.top  = py + 'px';
      panel.classList.add('visible');
    }

    /* ── Magnetic cursor ── */
    function onMagnet(e, node) {
      const r = node.getBoundingClientRect();
      const ox = e.clientX - (r.left + r.width/2);
      const oy = e.clientY - (r.top  + r.height/2);
      const b = node.querySelector('.node-bubble');
      if (b) b.style.transform = `translate(${ox*0.15}px,${oy*0.15}px) scale(1.08)`;
      node.addEventListener('mouseleave', () => { if (b) b.style.transform=''; }, { once:true });
    }

    /* ── Click ripple ── */
    function onClickNode(node, tech) {
      const ripple = document.createElement('div');
      ripple.className = 'node-ripple';
      ripple.style.setProperty('--node-color', tech.color);
      ripple.style.cssText += 'left:50%;top:50%;';
      const b = node.querySelector('.node-bubble');
      if (b) { b.appendChild(ripple); setTimeout(()=>ripple.remove(), 850); }
    }

    /* ── Hide panel helper — returns it fully off-screen ── */
    function hidePanel() {
      if (!panel) return;
      panel.classList.remove('visible');
      // After transition ends, move off-screen so it can't bleed
      setTimeout(() => {
        if (!panel.classList.contains('visible')) {
          panel.style.left = '-9999px';
          panel.style.top  = '-9999px';
        }
      }, 350);
    }

    /* ── Click outside to close panel ── */
    document.addEventListener('click', e => {
      if (!e.target.closest('.tech-node') && !e.target.closest('.holo-panel')) {
        hidePanel();
        activeHover = null;
        Object.values(NODE_ELS).forEach(n => n.classList.remove('hovered','active-connection'));
        PULSES.forEach(p => p.active = false);
      }
    });

    /* ── Build immediately then rebuild on resize ── */
    // rAF + setTimeout(0): most reliable way to wait for browser layout flush
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Safety: if stage still has no width, wait a bit more
        if (getW() === 0) {
          setTimeout(buildAll, 300);
        } else {
          buildAll();
        }
      }, 0);
    });

    window.addEventListener('resize', () => {
      hidePanel();
      activeHover = null;
      buildAll();
    });
  }

  initNeuralSkillsMatrix();

  /* ═══════════════════════════════════════════════════════
     MISSION ARCHIVE — AI OPERATIONS CENTER
  ═══════════════════════════════════════════════════════ */
  function initMissionArchive() {
    const missionData = [
      {
        id: "MIS-00 // CLASSIFIED",
        badge: "00",
        color: "#00F5FF",
        role: "Intern — Will Update Soon",
        organization: "[ Will Update Soon ]",
        icon: "fas fa-shield-alt",
        duration: "2026 – Present",
        status: "ACTIVE",
        statusClass: "status-active",
        objectives: "Currently active internship. Company name and full details will be updated soon.",
        metrics: [
          { label: "Company", val: "Soon" },
          { label: "Role", val: "Soon" },
          { label: "Stack", val: "Soon" },
          { label: "Status", val: "Active" }
        ],
        responsibilities: [
          "Details will be updated soon.",
          "Company name is currently withheld and will be disclosed shortly.",
          "Role, tech stack, and responsibilities will be added when available.",
          "Stay tuned for the full mission dossier update."
        ],
        techStack: [
          { name: "Will Update Soon", icon: "fas fa-lock", desc: "Details coming soon" },
          { name: "Will Update Soon", icon: "fas fa-lock", desc: "Details coming soon" }
        ],
        achievements: [
          "Details will be updated soon."
        ],
        skillsGained: ["Will Update Soon"]
      },
      {
        id: "MIS-01 // ROBOTECH",
        badge: "01",
        color: "#00F5FF",
        role: "Back End Developer",
        organization: "RoboTech",
        icon: "fas fa-server",
        duration: "Feb 2026 – Jul 2026",
        status: "COMPLETED",
        statusClass: "status-completed",
        objectives: "Developing and maintaining high-throughput backend infrastructure, REST APIs, and microservices for scalable production web applications.",
        metrics: [
          { label: "REST APIs Built", val: "12+" },
          { label: "Target Uptime", val: "99.9%" },
          { label: "Core Modules", val: "4" },
          { label: "Architecture", val: "Microservices" }
        ],
        responsibilities: [
          "Developing and maintaining robust backend services using scalable REST API architecture.",
          "Designing high-efficiency relational database schemas and endpoint microservices.",
          "Optimizing response latency and enforcing secure token authorization protocols across server nodes.",
          "Monitoring production logs and performing continuous integration updates for system reliability."
        ],
        techStack: [
          { name: "REST APIs", icon: "fas fa-network-wired", desc: "Used for cross-service data exchange & frontend endpoints" },
          { name: "Backend Architecture", icon: "fas fa-server", desc: "Used to construct scalable service modules" },
          { name: "Scalable Systems", icon: "fas fa-microchip", desc: "Optimized for high-concurrency request loads" },
          { name: "Python", icon: "fab fa-python", desc: "Core scripting & web service development language" },
          { name: "Node.js", icon: "fab fa-node-js", desc: "Asynchronous backend API runtime" }
        ],
        achievements: [
          "Successfully launched production backend endpoints with low latency.",
          "Designed modular service architecture with clean API contracts."
        ],
        skillsGained: ["Scalable Microservices", "RESTful Design", "Production Monitoring", "Database Indexing"]
      },
      {
        id: "MIS-02 // SPRINGER CAPITAL",
        badge: "02",
        color: "#00F5FF",
        role: "Software Engineer Intern",
        organization: "Springer Capital",
        icon: "fas fa-chart-line",
        duration: "Oct 2025 – Dec 2025",
        status: "COMPLETED",
        statusClass: "status-completed",
        objectives: "Assisted in backend development and financial API integration using Python-based frameworks, optimizing data processing pipelines.",
        metrics: [
          { label: "APIs Integrated", val: "8+" },
          { label: "Latency Reduced", val: "35%" },
          { label: "Data Pipelines", val: "5" },
          { label: "Duration", val: "3 Months" }
        ],
        responsibilities: [
          "Assisted in backend development and API integration using Python-based web frameworks.",
          "Structured automated data-fetching services for financial market analytics.",
          "Refactored SQL queries to decrease endpoint query execution latency by 35%.",
          "Collaborated with senior engineers on security audits and endpoint data validation."
        ],
        techStack: [
          { name: "Backend Dev", icon: "fas fa-code", desc: "Created core server modules and business logic" },
          { name: "API Integration", icon: "fas fa-plug", desc: "Connected third-party data feeds securely" },
          { name: "Python", icon: "fab fa-python", desc: "Primary backend language for data handling" },
          { name: "PostgreSQL", icon: "fas fa-database", desc: "Relational database used for financial metrics" },
          { name: "Git", icon: "fab fa-git-alt", desc: "Collaborative version control and branch workflow" }
        ],
        achievements: [
          "Decreased API query latency by 35% through database index refactoring.",
          "Integrated 8 key financial API data feeds cleanly."
        ],
        skillsGained: ["Financial Data Pipelines", "Query Optimization", "API Security", "Agile Integration"]
      },
      {
        id: "MIS-03 // EDUNET FOUNDATION",
        badge: "03",
        color: "#FF00B8",
        role: "Software Engineer Intern",
        organization: "Edunet Foundation",
        icon: "fas fa-terminal",
        duration: "Aug 2025 – Sep 2025",
        status: "COMPLETED",
        statusClass: "status-completed",
        objectives: "Executed Python-based development tasks including automation scripting, web processing, and dataset preparation for educational tools.",
        metrics: [
          { label: "Scripts Automated", val: "15+" },
          { label: "Hours Saved", val: "50+" },
          { label: "Data Batches", val: "100k+" },
          { label: "Duration", val: "2 Months" }
        ],
        responsibilities: [
          "Worked on Python-based development tasks including scripting and automated web processing.",
          "Built automated data cleansing routines to sanitize enterprise data collections.",
          "Developed command-line tools for internal data extraction and reporting workflows.",
          "Documented technical scripts and created reproducible deployment pipelines."
        ],
        techStack: [
          { name: "Python", icon: "fab fa-python", desc: "Used for automation scripting & data pipelines" },
          { name: "Scripting", icon: "fas fa-file-code", desc: "Automated manual data processing tasks" },
          { name: "Automation", icon: "fas fa-robot", desc: "Streamlined multi-step workflow execution" },
          { name: "Data Processing", icon: "fas fa-cogs", desc: "Parsed and sanitized bulk datasets" }
        ],
        achievements: [
          "Automated 15+ repetitive tasks, saving over 50 manual engineering hours.",
          "Built robust error-handling CLI scripts for dataset generation."
        ],
        skillsGained: ["Python Scripting", "Workflow Automation", "Data Cleansing", "CLI Tool Development"]
      },
      {
        id: "MIS-04 // ZIDIO DEVELOPMENT",
        badge: "04",
        color: "#8A2BE2",
        role: "Software Engineer Intern",
        organization: "Zidio Development",
        icon: "fas fa-layer-group",
        duration: "Jun 2025 – Aug 2025",
        status: "COMPLETED",
        statusClass: "status-completed",
        objectives: "Developed modular backend components, created RESTful API endpoints, and integrated web services for enterprise applications.",
        metrics: [
          { label: "Modules Deployed", val: "10+" },
          { label: "Test Coverage", val: "95%" },
          { label: "Projects", val: "2" },
          { label: "Duration", val: "3 Months" }
        ],
        responsibilities: [
          "Developed backend components and assisted in RESTful API creation.",
          "Implemented comprehensive unit test suites achieving 95% endpoint code coverage.",
          "Participated in sprint planning, code reviews, and modular component design.",
          "Integrated authentication logic and route authorization guards."
        ],
        techStack: [
          { name: "Backend Systems", icon: "fas fa-cubes", desc: "Constructed modular micro-services" },
          { name: "APIs", icon: "fas fa-network-wired", desc: "Engineered RESTful web endpoints" },
          { name: "Python Frameworks", icon: "fab fa-python", desc: "Built fast server routes and models" },
          { name: "Web Security", icon: "fas fa-shield-alt", desc: "Implemented route protection and auth tokens" }
        ],
        achievements: [
          "Achieved 95% test coverage across newly developed API modules.",
          "Delivered 10+ core backend services within tight sprint deadlines."
        ],
        skillsGained: ["Modular API Architecture", "Unit Testing", "Authentication Security", "Agile Sprints"]
      },
      {
        id: "MIS-05 // TECHPLEMENT",
        badge: "05",
        color: "#3A8DFF",
        role: "Software Development Intern",
        organization: "Techplement",
        icon: "fas fa-code",
        duration: "Aug 2024 – Sep 2024",
        status: "COMPLETED",
        statusClass: "status-completed",
        objectives: "Assisted in foundational backend development, REST API creation, code optimization, and resolving critical software bug tickets.",
        metrics: [
          { label: "Bugs Resolved", val: "20+" },
          { label: "REST Endpoints", val: "6" },
          { label: "Code Delivery", val: "100%" },
          { label: "Duration", val: "2 Months" }
        ],
        responsibilities: [
          "Assisted in backend development, REST API creation, and code optimization.",
          "Diagnosed and resolved 20+ legacy software bugs and memory bottlenecks.",
          "Refactored API payload handlers to improve response serialization performance.",
          "Collaborated with cross-functional software teams in an Agile environment."
        ],
        techStack: [
          { name: "REST APIs", icon: "fas fa-network-wired", desc: "Created foundational data endpoints" },
          { name: "Backend Dev", icon: "fas fa-server", desc: "Engineered web service logic" },
          { name: "Python", icon: "fab fa-python", desc: "Core language used for backend scripting" },
          { name: "Code Optimization", icon: "fas fa-tachometer-alt", desc: "Refactored legacy routines for speed" }
        ],
        achievements: [
          "Resolved 20+ software tickets and improved payload serialization.",
          "Successfully created and documented 6 REST API endpoints."
        ],
        skillsGained: ["Bug Diagnosis", "Code Refactoring", "REST API Development", "Git Workflows"]
      }
    ];

    let currentMission = 0;
    const dossierWrapper = document.getElementById('dossierContentWrapper');
    const holoSweep = document.getElementById('dossierHoloSweep');
    const pipelineActiveLabel = document.getElementById('pipelineActiveLabel');
    const pipelineProgressFill = document.getElementById('pipelineProgressFill');
    const missionChips = document.querySelectorAll('.mission-chip');
    const pipelineNodes = document.querySelectorAll('.exp-pipeline-node');

    function updatePipelineTrack(index) {
      const percentages = [100, 83, 66, 50, 33, 10];
      const pct = percentages[index] || 100;
      if (pipelineProgressFill) {
        pipelineProgressFill.style.width = pct + '%';
      }
    }

    function renderDossier(index) {
      const data = missionData[index];
      if (!data || !dossierWrapper) return;

      if (holoSweep) {
        holoSweep.classList.remove('scanning');
        void holoSweep.offsetWidth;
        holoSweep.classList.add('scanning');
      }

      let html = `
        <div class="dossier-header-bar">
          <div class="dossier-main-info">
            <div class="dossier-company-logo" style="--badge-color: ${data.color}">
              <div class="logo-holo-ring"></div>
              <i class="${data.icon}"></i>
            </div>
            <div class="dossier-titles">
              <h3 class="dossier-role">${data.role}</h3>
              <div class="dossier-org"><i class="fas fa-building text-cyan"></i> ${data.organization}</div>
              <div class="dossier-duration"><i class="far fa-calendar-alt text-cyan"></i> ${data.duration}</div>
            </div>
          </div>
          <div class="dossier-meta-badge">
            <span class="dossier-id-tag">${data.id}</span>
            <span class="dossier-status-pill ${data.statusClass}">[ ${data.status} ]</span>
          </div>
        </div>

        <div class="dossier-metrics-grid">
          ${data.metrics.map(m => `
            <div class="metric-card">
              <div class="metric-val">${m.val}</div>
              <div class="metric-lbl">${m.label}</div>
            </div>
          `).join('')}
        </div>

        <div class="dossier-section-title"><i class="fas fa-bullseye"></i> CORE MISSION OBJECTIVES</div>
        <div class="dossier-objective-text">
          ${data.objectives}
        </div>

        <div class="dossier-section-title"><i class="fas fa-terminal"></i> KEY CONTRIBUTIONS & LOGS</div>
        <div class="dossier-terminal-box">
          <div class="terminal-log-list">
            ${data.responsibilities.map((resp, i) => `
              <div class="terminal-log-item">
                <span class="log-prompt">&gt; [LOG_${(i+1).toString().padStart(2, '0')}]:</span>
                <span class="log-text">${resp}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="dossier-section-title"><i class="fas fa-cubes"></i> DEPLOYED TECH STACK</div>
        <div class="dossier-tech-capsules">
          ${data.techStack.map(t => `
            <div class="tech-capsule">
              <i class="${t.icon}"></i>
              <span>${t.name}</span>
              <div class="capsule-tooltip">${t.desc}</div>
            </div>
          `).join('')}
        </div>

        <div class="dossier-achievements-row">
          <div class="achieve-box">
            <div class="dossier-section-title" style="margin-bottom:8px;"><i class="fas fa-trophy"></i> ACHIEVEMENTS</div>
            <ul class="achieve-list">
              ${data.achievements.map(a => `
                <li><i class="fas fa-check-circle"></i> <span>${a}</span></li>
              `).join('')}
            </ul>
          </div>
          <div class="skills-box">
            <div class="dossier-section-title" style="margin-bottom:8px;"><i class="fas fa-brain"></i> SKILLS GAINED</div>
            <div class="skills-tokens-wrap">
              ${data.skillsGained.map(s => `
                <span class="skill-token">${s}</span>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      if (typeof gsap !== 'undefined') {
        gsap.to(dossierWrapper, {
          opacity: 0,
          y: 8,
          duration: 0.15,
          onComplete: () => {
            dossierWrapper.innerHTML = html;
            gsap.to(dossierWrapper, { opacity: 1, y: 0, duration: 0.25 });
          }
        });
      } else {
        dossierWrapper.innerHTML = html;
      }
    }

    function selectMission(index) {
      currentMission = index;
      const data = missionData[index];

      missionChips.forEach(chip => {
        if (parseInt(chip.getAttribute('data-mission')) === index) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });

      pipelineNodes.forEach(node => {
        const mIdx = parseInt(node.getAttribute('data-mission'));
        const marker = node.querySelector('.exp-node-marker');
        if (mIdx === index) {
          node.classList.add('active');
          if (marker) marker.classList.add('active-pulse');
        } else {
          node.classList.remove('active');
          if (marker) marker.classList.remove('active-pulse');
        }
      });

      if (pipelineActiveLabel && data) {
        pipelineActiveLabel.textContent = `MISSION ${data.badge}: ${data.organization.toUpperCase()}`;
      }
      updatePipelineTrack(index);
      renderDossier(index);
    }

    missionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const idx = parseInt(chip.getAttribute('data-mission'));
        if (!isNaN(idx)) selectMission(idx);
      });
    });

    pipelineNodes.forEach(node => {
      node.addEventListener('click', () => {
        const idx = parseInt(node.getAttribute('data-mission'));
        if (!isNaN(idx)) selectMission(idx);
      });
    });

    selectMission(0);
  }

  initMissionArchive();

  /* ═══════════════════════════════════════════════════════════════════
     SCI-FI DEEP SPACE ENGINE — 8-LAYER CANVAS
     Layer 0: Deep-space void + volumetric nebula aurora
     Layer 1: Hyperspace star field (parallax warp on scroll)
     Layer 2: Pulsing holographic hexagonal grid
     Layer 3: Neural constellation network (firing synapses)
     Layer 4: Comet / meteor streaks
     Layer 5: Mouse gravity-well distortion field
     Layer 6: Energy ripples + click shockwaves
     Layer 7: Chromatic HUD overlay + scanlines
  ═══════════════════════════════════════════════════════════════════ */
  function initCyberpunkWorld() {
    const canvas = document.getElementById('cyberpunkBgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    // ─── Palette ───────────────────────────────────
    const P = {
      cyan:    [0,   245, 255],
      blue:    [58,  141, 255],
      violet:  [138,  43, 226],
      magenta: [255,   0, 184],
      teal:    [0,   210, 180],
      gold:    [255, 200,  50],
    };
    function rgba(c, a) { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
    function hex(c) { return `#${c.map(v=>v.toString(16).padStart(2,'0')).join('')}`; }
    const cycleColors = [P.cyan, P.blue, P.violet, P.magenta, P.teal];

    // ─── Input state ───────────────────────────────
    let mouse = { x: W/2, y: H/2, tx: W/2, ty: H/2, click: false };
    let scrollSpeed = 0, targetScrollSpeed = 0;
    let warpBoost = 0, warpTarget = 0;
    let shockwaves = [], ripples = [];
    let activeSectionId = 'home';
    let globalPulse = 0, pulseClock = 0;

    window.addEventListener('mousemove', e => { mouse.tx = e.clientX; mouse.ty = e.clientY; });
    window.addEventListener('touchmove', e => {
      if (e.touches[0]) { mouse.tx = e.touches[0].clientX; mouse.ty = e.touches[0].clientY; }
    }, { passive: true });

    let lastSY = window.scrollY;
    window.addEventListener('scroll', () => {
      const d = Math.abs(window.scrollY - lastSY);
      targetScrollSpeed = Math.min(d, 50);
      warpTarget = Math.min(d / 30, 1.0);
      lastSY = window.scrollY;
    }, { passive: true });

    window.addEventListener('click', e => {
      shockwaves.push({ x: e.clientX, y: e.clientY, r: 4, maxR: Math.hypot(W,H)*0.7, o: 1.0 });
      shockwaves.push({ x: e.clientX, y: e.clientY, r: 4, maxR: 240, o: 0.9, col: P.magenta });
      globalPulse = Math.min(globalPulse + 0.6, 1.4);
      // burst of ripples
      for (let i = 0; i < 6; i++) {
        const a = (i/6)*Math.PI*2, d = 30 + Math.random()*60;
        ripples.push({ x: e.clientX + Math.cos(a)*d, y: e.clientY + Math.sin(a)*d,
          r: 0, maxR: 80+Math.random()*60, o: 0.7, spd: 3+Math.random()*2, col: P.cyan });
      }
    });

    window.triggerTransmissionPulse = function() {
      shockwaves.push({ x: W/2, y: H/2, r: 4, maxR: Math.hypot(W,H), o: 1.0 });
      globalPulse = 1.4;
    };

    const sections = document.querySelectorAll('section[id]');
    let sectionTick = 0;
    function updateActiveSection() {
      if (++sectionTick % 30) return;
      const pos = window.scrollY + window.innerHeight * 0.35;
      sections.forEach(s => { if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight) activeSectionId = s.id; });
    }

    // ═══════════════════════════════════════════════
    // LAYER 0 — VOID + VOLUMETRIC NEBULA AURORA
    // ═══════════════════════════════════════════════
    let nebulaT = 0;
    const nebulaBlobs = [
      { bx: 0.22, by: 0.35, ax: 0.17, ay: 0.20, sx: 0.60, sy: 0.45, col: P.cyan,    baseA: 0.12 },
      { bx: 0.78, by: 0.60, ax: 0.19, ay: 0.18, sx: 0.55, sy: 0.40, col: P.violet,  baseA: 0.10 },
      { bx: 0.50, by: 0.18, ax: 0.22, ay: 0.13, sx: 0.35, sy: 0.28, col: P.blue,    baseA: 0.08 },
      { bx: 0.15, by: 0.80, ax: 0.14, ay: 0.16, sx: 0.30, sy: 0.25, col: P.magenta, baseA: 0.06 },
      { bx: 0.85, by: 0.25, ax: 0.13, ay: 0.17, sx: 0.28, sy: 0.22, col: P.teal,    baseA: 0.07 },
    ];

    function drawNebula(surge) {
      nebulaT += 0.0018 + scrollSpeed * 0.00008;
      // Void
      ctx.fillStyle = '#03050B';
      ctx.fillRect(0, 0, W, H);

      nebulaBlobs.forEach((b, i) => {
        const px = W * (b.bx + Math.sin(nebulaT * (0.41 + i*0.07)) * b.ax);
        const py = H * (b.by + Math.cos(nebulaT * (0.37 + i*0.06)) * b.ay);
        const rx = Math.max(W,H) * (b.sx + surge * 0.10);
        const ry = Math.max(W,H) * (b.sy + surge * 0.08);

        // Elliptical nebula via scale trick
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(1, ry / rx);
        const gr = ctx.createRadialGradient(0, 0, rx * 0.04, 0, 0, rx);
        gr.addColorStop(0,   rgba(b.col, b.baseA + surge * 0.09));
        gr.addColorStop(0.4, rgba(b.col, (b.baseA * 0.5) + surge * 0.04));
        gr.addColorStop(1,   'transparent');
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // Central deep glow — always lit
      const cg = ctx.createRadialGradient(W*0.5, H*0.5, 0, W*0.5, H*0.5, Math.max(W,H)*0.65);
      cg.addColorStop(0,   rgba(P.blue, 0.04 + surge * 0.04));
      cg.addColorStop(0.5, rgba(P.cyan, 0.02));
      cg.addColorStop(1,   'transparent');
      ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
    }

    // ═══════════════════════════════════════════════
    // LAYER 1 — HYPERSPACE STAR FIELD
    // ═══════════════════════════════════════════════
    const STAR_COUNT = W < 768 ? 280 : 520;
    let stars = [];

    function initStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          z: Math.random(),          // depth 0=far, 1=near
          r: 0.3 + Math.random() * 1.8,
          blink: Math.random() * Math.PI * 2,
          blinkSpd: 0.5 + Math.random() * 1.5,
          col: cycleColors[Math.floor(Math.random() * cycleColors.length)],
          colorChance: Math.random(), // <0.12 = colored star, else white
        });
      }
    }
    initStars();

    function drawStars(now, warp) {
      const cx = W / 2, cy = H / 2;
      stars.forEach(s => {
        // Parallax: near stars shift more with mouse
        const parallax = (s.z * 0.018);
        const sx = s.x + (mouse.x - cx) * parallax;
        const sy = s.y + (mouse.y - cy) * parallax;

        // Warp: stretch stars into streaks when scrolling fast
        const warpLen = warp * s.z * (30 + s.r * 12);
        const blink = 0.55 + Math.sin(now * 0.001 * s.blinkSpd + s.blink) * 0.45;
        const alpha = (0.35 + s.z * 0.65) * blink;
        const col = s.colorChance < 0.14 ? s.col : [255,255,255];

        if (warpLen > 1.5) {
          // Warp streak
          const grad = ctx.createLinearGradient(sx, sy, sx, sy - warpLen);
          grad.addColorStop(0,   rgba(col, alpha));
          grad.addColorStop(1,   rgba(col, 0));
          ctx.strokeStyle = grad;
          ctx.lineWidth = s.r * (0.5 + s.z * 0.6);
          ctx.globalAlpha = 1;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - warpLen); ctx.stroke();
        } else {
          // Normal star dot
          ctx.globalAlpha = alpha;
          ctx.fillStyle = rgba(col, 1);
          const r = s.r * (0.6 + s.z * 0.5);
          ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI*2); ctx.fill();
          // Tiny cross flare for bright near stars
          if (s.z > 0.75 && s.r > 1.2) {
            ctx.globalAlpha = alpha * 0.4;
            ctx.strokeStyle = rgba(col, 1);
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(sx - r*2.5, sy); ctx.lineTo(sx + r*2.5, sy);
            ctx.moveTo(sx, sy - r*2.5); ctx.lineTo(sx, sy + r*2.5);
            ctx.stroke();
          }
        }
      });
      ctx.globalAlpha = 1;
    }

    // ═══════════════════════════════════════════════
    // LAYER 2 — HOLOGRAPHIC HEX GRID
    // ═══════════════════════════════════════════════
    let hexT = 0;
    const HEX_SIZE = W < 768 ? 52 : 40;

    function drawHexGrid(surge) {
      hexT += 0.008 + scrollSpeed * 0.0004;
      const hs = HEX_SIZE;
      const hh = hs * Math.sqrt(3) / 2;
      const cols2 = Math.ceil(W / (hs * 1.5)) + 2;
      const rows2 = Math.ceil(H / (hh * 2)) + 2;
      const offX = -hs, offY = -hh;

      for (let row = 0; row < rows2; row++) {
        for (let col = 0; col < cols2; col++) {
          const isOdd = col % 2 === 1;
          const cx2 = offX + col * hs * 1.5;
          const cy2 = offY + row * hh * 2 + (isOdd ? hh : 0);

          // Distance from mouse → modulate glow
          const dx = mouse.x - cx2, dy = mouse.y - cy2;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const prox = Math.max(0, 1 - dist / 260);

          // Wave pulse from center
          const waveDist = Math.hypot(cx2 - W/2, cy2 - H/2);
          const wave = Math.sin(waveDist * 0.022 - hexT * 3.5) * 0.5 + 0.5;

          const base = 0.025 + wave * 0.055 + prox * 0.20 + surge * 0.12;
          if (base < 0.01) continue;

          // Color cycles slowly across grid
          const hue = (col * 7 + row * 11 + hexT * 20) % 360;
          // Map hue to our palette
          let edgeCol;
          if      (hue < 60)  edgeCol = P.cyan;
          else if (hue < 120) edgeCol = P.teal;
          else if (hue < 180) edgeCol = P.blue;
          else if (hue < 240) edgeCol = P.violet;
          else if (hue < 300) edgeCol = P.magenta;
          else                edgeCol = P.cyan;

          ctx.globalAlpha = Math.min(base, 0.70);
          ctx.strokeStyle = rgba(edgeCol, 1);
          ctx.lineWidth = 0.5 + prox * 1.2 + wave * 0.4;

          // Draw hexagon
          ctx.beginPath();
          for (let v = 0; v < 6; v++) {
            const angle = (Math.PI / 180) * (60 * v - 30);
            const vx = cx2 + hs * Math.cos(angle);
            const vy = cy2 + hs * Math.sin(angle);
            if (v === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
          }
          ctx.closePath(); ctx.stroke();

          // Filled center dot for hot cells
          if (prox > 0.35 || (wave > 0.82 && surge > 0.1)) {
            ctx.globalAlpha = (prox * 0.25 + wave * 0.08) * Math.min(base * 2, 1);
            ctx.fillStyle = rgba(edgeCol, 1);
            ctx.beginPath(); ctx.arc(cx2, cy2, 3 + prox * 4, 0, Math.PI*2); ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    // ═══════════════════════════════════════════════
    // LAYER 3 — NEURAL CONSTELLATION NETWORK
    // ═══════════════════════════════════════════════
    const NODE_COUNT = W < 768 ? 28 : 50;
    let nodes = [], nodeT = 0;

    function initNodes() {
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random()-0.5) * 0.25,
          vy: (Math.random()-0.5) * 0.25,
          r: 1.5 + Math.random() * 3,
          col: cycleColors[Math.floor(Math.random() * cycleColors.length)],
          energy: Math.random(),
          energySpd: 0.5 + Math.random() * 1.5,
          phase: Math.random() * Math.PI * 2,
          firing: false, fireTimer: 0, fireDur: 0,
          connections: [],
        });
      }
      // Build connections (nearest 3-4 neighbors)
      nodes.forEach((n, i) => {
        const sorted = nodes
          .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
          .filter(e => e.j !== i)
          .sort((a,b) => a.d - b.d)
          .slice(0, 3 + Math.floor(Math.random()*2));
        n.connections = sorted.filter(e => e.d < 260).map(e => e.j);
      });
    }
    initNodes();

    // Signal packets traveling along connections
    let signals = [];
    function spawnSignal(fromIdx, toIdx, col) {
      signals.push({ from: fromIdx, to: toIdx, t: 0, spd: 0.008 + Math.random()*0.012, col, trail: [] });
    }

    function updateNodes(dt, surge) {
      nodeT += dt;
      const CONNECT_DIST = 260;
      nodes.forEach((n, i) => {
        // Drift
        n.x += n.vx * (1 + scrollSpeed * 0.012);
        n.y += n.vy;
        if (n.x < -20) n.x = W + 20;
        if (n.x > W+20) n.x = -20;
        if (n.y < -20) n.y = H + 20;
        if (n.y > H+20) n.y = -20;

        // Mouse attraction (subtle)
        const mdx = mouse.x - n.x, mdy = mouse.y - n.y;
        const md = Math.sqrt(mdx*mdx + mdy*mdy);
        if (md < 180) { n.x += mdx / md * 0.18; n.y += mdy / md * 0.18; }

        // Energy pulse
        n.energy = 0.5 + 0.5 * Math.sin(nodeT * n.energySpd + n.phase);

        // Spontaneous fire
        if (!n.firing && Math.random() < (0.0008 + surge * 0.003) * (1 + n.energy * 0.5)) {
          n.firing = true; n.fireTimer = 0; n.fireDur = 0.35 + Math.random() * 0.25;
          // Send signal to random connected node
          if (n.connections.length > 0) {
            const toIdx = n.connections[Math.floor(Math.random() * n.connections.length)];
            spawnSignal(i, toIdx, n.col);
          }
        }
        if (n.firing) {
          n.fireTimer += dt;
          if (n.fireTimer > n.fireDur) n.firing = false;
        }
      });

      // Update signals
      for (let i = signals.length - 1; i >= 0; i--) {
        const sg = signals[i];
        const fn = nodes[sg.from], tn = nodes[sg.to];
        if (!fn || !tn) { signals.splice(i,1); continue; }
        sg.t += sg.spd * (1 + surge * 0.8);
        if (sg.t >= 1) {
          // Arrive → trigger destination node fire
          tn.firing = true; tn.fireTimer = 0; tn.fireDur = 0.25;
          // Cascade to another node
          if (tn.connections.length > 0 && Math.random() < 0.55) {
            const next = tn.connections[Math.floor(Math.random()*tn.connections.length)];
            if (next !== sg.from) spawnSignal(sg.to, next, sg.col);
          }
          signals.splice(i, 1);
        }
      }
    }

    function drawNeuralNet(surge, now) {
      const CONNECT_DIST = 260;

      // Draw connections
      nodes.forEach((n, i) => {
        n.connections.forEach(j => {
          if (j <= i) return; // draw each once
          const m = nodes[j];
          const dist = Math.hypot(m.x - n.x, m.y - n.y);
          if (dist > CONNECT_DIST) return;
          const fadeEdge = 1 - dist / CONNECT_DIST;
          const bothEnergy = (n.energy + m.energy) * 0.5;
          const alpha = fadeEdge * (0.06 + bothEnergy * 0.10 + surge * 0.08);

          // Gradient line from node color to node color
          const lg = ctx.createLinearGradient(n.x, n.y, m.x, m.y);
          lg.addColorStop(0, rgba(n.col, alpha));
          lg.addColorStop(1, rgba(m.col, alpha));
          ctx.strokeStyle = lg;
          ctx.lineWidth = 0.6 + fadeEdge * 0.5;
          ctx.globalAlpha = 1;
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
        });
      });

      // Draw signal packets
      signals.forEach(sg => {
        const fn = nodes[sg.from], tn = nodes[sg.to];
        if (!fn || !tn) return;
        const px = fn.x + (tn.x - fn.x) * sg.t;
        const py = fn.y + (tn.y - fn.y) * sg.t;
        // Glow trail
        ctx.shadowBlur = 14; ctx.shadowColor = rgba(sg.col, 0.9);
        ctx.fillStyle = rgba(sg.col, 1);
        ctx.globalAlpha = 0.95;
        ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI*2); ctx.fill();
        // Tail
        const tp = Math.max(0, sg.t - 0.08);
        const tx2 = fn.x + (tn.x - fn.x) * tp;
        const ty2 = fn.y + (tn.y - fn.y) * tp;
        ctx.globalAlpha = 0.4;
        ctx.beginPath(); ctx.arc(tx2, ty2, 1.8, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw nodes
      nodes.forEach(n => {
        const glow = n.energy * (n.firing ? 2.2 : 1.0) + surge * 0.5;
        const r = n.r * (0.7 + glow * 0.5);
        const alpha = 0.5 + glow * 0.4;

        // Outer glow ring
        ctx.shadowBlur = n.firing ? 22 : 10;
        ctx.shadowColor = rgba(n.col, 0.8);
        ctx.globalAlpha = alpha * 0.65;
        ctx.fillStyle = rgba(n.col, 1);
        ctx.beginPath(); ctx.arc(n.x, n.y, r * 1.8, 0, Math.PI*2); ctx.fill();

        // Core
        ctx.globalAlpha = Math.min(alpha, 1);
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1;
    }

    // ═══════════════════════════════════════════════
    // LAYER 4 — COMET / METEOR STREAKS
    // ═══════════════════════════════════════════════
    let comets = [];
    let cometTimer = 0;

    function spawnComet() {
      const side = Math.floor(Math.random() * 4);
      let x, y, vx, vy;
      const spd = 180 + Math.random() * 340;
      if (side === 0)      { x = Math.random()*W; y = -20;   vx = (Math.random()-0.5)*100; vy = spd; }
      else if (side === 1) { x = W+20;             y = Math.random()*H; vx = -spd; vy = (Math.random()-0.5)*60; }
      else if (side === 2) { x = Math.random()*W; y = H+20;  vx = (Math.random()-0.5)*60; vy = -spd; }
      else                 { x = -20;              y = Math.random()*H; vx = spd; vy = (Math.random()-0.5)*60; }

      const col = cycleColors[Math.floor(Math.random() * cycleColors.length)];
      comets.push({
        x, y, vx, vy, col,
        len: 60 + Math.random() * 140,
        r: 1.2 + Math.random() * 2,
        o: 0.6 + Math.random() * 0.4,
        trail: [],
      });
    }

    function updateDrawComets(dt, surge) {
      cometTimer += dt;
      if (cometTimer > 2.5 - surge * 1.0 + Math.random() * 2) {
        cometTimer = 0;
        if (comets.length < 6) spawnComet();
      }

      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.x += c.vx * dt; c.y += c.vy * dt;

        // Remove if off-screen
        if (c.x < -300 || c.x > W+300 || c.y < -300 || c.y > H+300) {
          comets.splice(i, 1); continue;
        }

        // Compute tail vector (opposite to velocity)
        const spd = Math.sqrt(c.vx*c.vx + c.vy*c.vy);
        if (spd < 1) continue;
        const nx = -c.vx/spd, ny = -c.vy/spd;
        const tx = c.x + nx * c.len, ty = c.y + ny * c.len;

        const gr = ctx.createLinearGradient(c.x, c.y, tx, ty);
        gr.addColorStop(0,   rgba(c.col, c.o));
        gr.addColorStop(0.3, rgba(c.col, c.o * 0.4));
        gr.addColorStop(1,   rgba(c.col, 0));

        ctx.shadowBlur = 16; ctx.shadowColor = rgba(c.col, 0.7);
        ctx.strokeStyle = gr;
        ctx.lineWidth = c.r * 1.5;
        ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(tx, ty); ctx.stroke();

        // Head flare
        ctx.fillStyle = rgba([255,255,255], 0.9);
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
    }

    // ═══════════════════════════════════════════════
    // LAYER 5 — MOUSE GRAVITY-WELL DISTORTION FIELD
    // ═══════════════════════════════════════════════
    function drawGravityWell(surge) {
      const gx = mouse.x, gy = mouse.y;
      const maxR = 150 + surge * 60;

      // Concentric pulsing rings
      for (let ring = 0; ring < 4; ring++) {
        const rFrac = (ring + 1) / 4;
        const r = maxR * rFrac;
        const alpha = (1 - rFrac) * (0.12 + surge * 0.10);
        const pulseShift = Math.sin(nodeT * 2.5 - ring * 0.8) * 5;

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = rgba(P.cyan, 1);
        ctx.lineWidth = 0.7 - rFrac * 0.4;
        ctx.beginPath();
        ctx.arc(gx, gy, r + pulseShift, 0, Math.PI*2);
        ctx.stroke();
      }

      // Core dot
      const coreGlow = ctx.createRadialGradient(gx, gy, 0, gx, gy, 20 + surge * 10);
      coreGlow.addColorStop(0,   rgba(P.cyan, 0.35 + surge * 0.25));
      coreGlow.addColorStop(0.5, rgba(P.blue, 0.08));
      coreGlow.addColorStop(1,   'transparent');
      ctx.fillStyle = coreGlow;
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(gx, gy, 20 + surge * 10, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ═══════════════════════════════════════════════
    // LAYER 6 — SHOCKWAVES + RIPPLES
    // ═══════════════════════════════════════════════
    function drawShockwaves(dt) {
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.r += (sw.maxR - sw.r) * 0.06 + 4;
        sw.o -= dt * 0.9;
        if (sw.o <= 0 || sw.r >= sw.maxR) { shockwaves.splice(i, 1); continue; }
        const col = sw.col || P.cyan;
        ctx.beginPath(); ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI*2);
        ctx.strokeStyle = rgba(col, 1);
        ctx.lineWidth = 1.5 * sw.o;
        ctx.globalAlpha = sw.o * 0.7;
        ctx.shadowBlur = 18; ctx.shadowColor = rgba(col, 0.8);
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Inner ring
        if (sw.r > 30) {
          ctx.beginPath(); ctx.arc(sw.x, sw.y, sw.r * 0.65, 0, Math.PI*2);
          ctx.globalAlpha = sw.o * 0.3; ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += rp.spd; rp.o -= 0.018;
        if (rp.o <= 0 || rp.r >= rp.maxR) { ripples.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
        ctx.strokeStyle = rgba(rp.col, 1);
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = rp.o; ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // ═══════════════════════════════════════════════
    // LAYER 7 — CHROMATIC HUD OVERLAY + SCANLINES
    // ═══════════════════════════════════════════════
    const overlayMap = {
      home:           '[ DEEP.SPACE // AI.CORE // NEURAL.ACTIVE ]',
      about:          '[ IDENTITY.MATRIX // BIOMETRIC.SCAN // ONLINE ]',
      education:      '[ KNOWLEDGE.BASE // SYNAPTIC.INDEX // LOADED ]',
      skills:         '[ NEURAL.SYNAPSE // MATRIX.AMPLIFIED // READY ]',
      experience:     '[ MISSION.ARCHIVE // CLASSIFIED // ACTIVE ]',
      projects:       '[ ENGINEERING.MODE // REPO.LIVE // DEPLOYING ]',
      certifications: '[ CREDENTIAL.VAULT // VERIFIED // CERTS.OK ]',
      github:         '[ SOURCE.CONTROL // GIT.SYNC // COMMIT.LIVE ]',
      contact:        '[ TRANSMISSION.RELAY // COMM.CONVERGENCE ]',
    };

    let glitchTimer = 0, glitches = [];
    function spawnGlitch() {
      glitches.push({
        x: Math.random()*W, y: Math.random()*H,
        w: 30 + Math.random()*220, h: 1 + Math.random()*2.5,
        life: 0, maxLife: 0.05 + Math.random()*0.08,
        col: Math.random()>0.5 ? P.cyan : P.magenta,
        shift: (Math.random()-0.5)*16,
      });
    }

    function drawHUD(dt, surge) {
      // Glitches
      glitchTimer += dt;
      if (glitchTimer > 3 + Math.random()*7) { glitchTimer = 0; spawnGlitch(); if (Math.random()>0.5) spawnGlitch(); }
      for (let i = glitches.length-1; i >= 0; i--) {
        const g = glitches[i]; g.life += dt;
        if (g.life >= g.maxLife) { glitches.splice(i,1); continue; }
        const t = g.life / g.maxLife;
        ctx.globalAlpha = (1-t)*(0.55 + surge*0.3);
        ctx.fillStyle = rgba(g.col, 1);
        ctx.fillRect(g.x + g.shift*t, g.y, g.w, g.h);
        ctx.globalAlpha = (1-t)*0.2;
        ctx.fillStyle = rgba(P.magenta, 1);
        ctx.fillRect(g.x + g.shift*t + 4, g.y, g.w, g.h * 0.5);
      }
      ctx.globalAlpha = 1;

      // Scanlines (very subtle)
      ctx.globalAlpha = 0.013; ctx.fillStyle = '#000';
      for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
      ctx.globalAlpha = 1;

      // Section status line
      const txt = overlayMap[activeSectionId];
      if (txt) {
        ctx.font = '10px "Share Tech Mono", monospace';
        ctx.fillStyle = rgba(P.cyan, 1);
        ctx.globalAlpha = 0.40 + surge * 0.28;
        ctx.fillText(txt, 36, H - 32);
        ctx.textAlign = 'right';
        ctx.globalAlpha = 0.22 + surge * 0.15;
        ctx.fillStyle = rgba(P.violet, 1);
        ctx.fillText(activeSectionId.toUpperCase() + ' // ACTIVE', W - 36, H - 32);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
      }

      // Corner brackets — pure sci-fi HUD feel
      const bSize = 22, bPad = 18, bAlpha = 0.28 + surge * 0.18;
      ctx.strokeStyle = rgba(P.cyan, 1); ctx.lineWidth = 1.2; ctx.globalAlpha = bAlpha;
      [[bPad, bPad, 1, 1],[W-bPad, bPad, -1, 1],[bPad, H-bPad, 1, -1],[W-bPad, H-bPad, -1, -1]]
        .forEach(([x, y, sx2, sy2]) => {
          ctx.beginPath();
          ctx.moveTo(x + sx2*bSize, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy2*bSize);
          ctx.stroke();
        });
      ctx.globalAlpha = 1;
    }

    // ═══════════════════════════════════════════════
    // MAIN RENDER LOOP — 40fps cap for GPU breathing
    // ═══════════════════════════════════════════════
    let lastTime = performance.now(), lastDraw = 0;
    const FPS_CAP = 1000 / 40;

    window.addEventListener('resize', () => {
      clearTimeout(window._bgResizeTm);
      window._bgResizeTm = setTimeout(() => {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        initStars(); initNodes();
        scanWaves[0] = { pos: W+80, dir:'v', spd:120, col:P.blue, hw:36, reverse:true, delay:0 };
      }, 120);
    });

    // Small scanwave stubs for init (kept from original)
    const scanWaves = [
      { pos: H*0.4, dir:'h', spd:80,  col:P.cyan,   hw:30, reverse:false, delay:1.5 },
      { pos: W+80,  dir:'v', spd:100, col:P.blue,   hw:24, reverse:true,  delay:0   },
    ];

    function loop(now) {
      requestAnimationFrame(loop);
      const elapsed = now - lastDraw;
      if (elapsed < FPS_CAP) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now; lastDraw = now - (elapsed % FPS_CAP);

      // Smooth inputs
      mouse.x += (mouse.tx - mouse.x) * 0.09;
      mouse.y += (mouse.ty - mouse.y) * 0.09;
      scrollSpeed += (targetScrollSpeed - scrollSpeed) * 0.10;
      targetScrollSpeed *= 0.82;
      warpBoost += (warpTarget - warpBoost) * 0.08;
      warpTarget  *= 0.85;
      globalPulse  = Math.max(0, globalPulse - dt * 0.7);

      updateActiveSection();
      updateNodes(dt, globalPulse);

      // — Layer 0: Nebula void (clears canvas)
      drawNebula(globalPulse);
      // — Layer 1: Stars
      drawStars(now, warpBoost);
      // — Layer 2: Hex grid
      drawHexGrid(globalPulse);
      // — Layer 3: Neural net
      drawNeuralNet(globalPulse, now);
      // — Layer 4: Comets
      updateDrawComets(dt, globalPulse);
      // — Layer 5: Gravity well
      drawGravityWell(globalPulse);
      // — Layer 6: Shockwaves + ripples
      drawShockwaves(dt);
      // — Layer 7: HUD overlay
      drawHUD(dt, globalPulse);
    }

    loop(performance.now());
  }


  function init2DBackgroundFallback(canvas) { initCyberpunkWorld(); }

  initCyberpunkWorld();
});
