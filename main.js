// ============================================================
// PORTFOLIO — main.js
// Cinema Gate, Lava-Lamp Physics & Interactive Protocol Engine
// ============================================================

(function () {
  'use strict';

  const html = document.documentElement;
  const toggleBtn = document.getElementById('mode-toggle');
  const toggleLabel = document.getElementById('toggle-label');
  const scrollProgress = document.getElementById('scroll-progress');
  const particleCanvas = document.getElementById('particle-canvas');
  const matrixCanvas = document.getElementById('matrix-canvas');
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  const animeGate = document.getElementById('anime-gate-overlay');

  let cursorInitialized = false;
  let lavaInitialized = false;
  let parallaxInitialized = false;
  let tiltInitialized = false;
  let lavaAnimationId = null;

  // ============================================================
  // 1. THEME SWITCH & CINEMATIC ANIME GATE TRANSITION
  // ============================================================
  function updateThemeUI(isModern) {
    if (toggleLabel) {
      toggleLabel.textContent = isModern ? 'MODERN VIEW' : 'NORMAL VIEW';
    }
    if (toggleBtn) {
      toggleBtn.classList.toggle('is-dark', isModern);
    }
  }

  function triggerAnimeGate(onComplete) {
    if (!animeGate) {
      if (onComplete) onComplete();
      return;
    }
    animeGate.classList.add('active');
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 450);
    setTimeout(() => {
      animeGate.classList.remove('active');
    }, 1100);
  }

  function applyLight() {
    triggerAnimeGate(() => {
      html.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      updateThemeUI(false);
      if (lavaAnimationId) {
        cancelAnimationFrame(lavaAnimationId);
        lavaAnimationId = null;
      }
    });
  }

  function applyDark() {
    triggerAnimeGate(() => {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      updateThemeUI(true);
      initModernSystems();
      requestAnimationFrame(triggerReveals);
    });
  }

  function toggleMode() {
    const isDark = html.getAttribute('data-theme') === 'dark';
    if (isDark) {
      applyLight();
    } else {
      applyDark();
    }
  }

  // ============================================================
  // 2. ADAPTIVE CURSOR THAT CHANGES LOOK PER SECTION
  // ============================================================
  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  function initCursor() {
    if (cursorInitialized || !cursor || !ring) return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    cursorInitialized = true;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }, { passive: true });

    function renderRing() {
      if (html.getAttribute('data-theme') === 'dark') {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);

    // Dynamic cursor changes across sections
    const sections = document.querySelectorAll('.d-section, .d-hero');
    window.addEventListener('scroll', () => {
      if (html.getAttribute('data-theme') !== 'dark') return;
      let activeSectionId = '';
      sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4) {
          activeSectionId = sec.id;
        }
      });
      // Style cursor specifically for section theme
      cursor.className = '';
      ring.className = '';
      if (activeSectionId) {
        cursor.classList.add('cursor-' + activeSectionId);
        ring.classList.add('cursor-' + activeSectionId);
      }
    }, { passive: true });

    // Hover interactive elements
    const hoverTargets = 'a, button, .d-stat-card, .d-pub-card, .d-proj-card, .d-skill-item, .d-gh-repo-card, .d-edu-card';
    document.querySelectorAll(hoverTargets).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
        ring.classList.add('active');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        ring.classList.remove('active');
      });
    });
  }

  // ============================================================
  // 3. ORGANIC LAVA-LAMP FLUID CANVAS
  // ============================================================
  function initLavaLamp() {
    if (lavaInitialized || !particleCanvas) return;
    lavaInitialized = true;

    const ctx = particleCanvas.getContext('2d', { alpha: true });
    let w, h;
    const blobs = [];
    const BLOB_COUNT = 7;

    function resize() {
      w = particleCanvas.width = window.innerWidth;
      h = particleCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Lava colors: Electric Cyan, Neon Magenta, Amber Gold, Acid Lime
    const colors = [
      'rgba(0, 240, 255,',   // Cyan
      'rgba(255, 0, 85,',    // Neon Pink
      'rgba(255, 230, 0,',   // Yellow
      'rgba(57, 255, 20,',   // Acid Lime
      'rgba(255, 0, 127,'    // Magenta
    ];

    for (let i = 0; i < BLOB_COUNT; i++) {
      blobs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 120 + 80,
        color: colors[i % colors.length],
        alpha: Math.random() * 0.25 + 0.15
      });
    }

    function renderLava() {
      if (html.getAttribute('data-theme') !== 'dark') {
        lavaAnimationId = null;
        return;
      }

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];

        // Soft cursor attraction/interaction
        const dx = mouseX - b.x;
        const dy = mouseY - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 250) {
          const force = (250 - dist) / 250;
          b.vx += (dx / dist) * force * 0.25;
          b.vy += (dy / dist) * force * 0.25;
        }

        b.vx *= 0.985;
        b.vy *= 0.985;
        b.x += b.vx;
        b.y += b.vy;

        if (b.x < -b.radius) b.x = w + b.radius;
        if (b.x > w + b.radius) b.x = -b.radius;
        if (b.y < -b.radius) b.y = h + b.radius;
        if (b.y > h + b.radius) b.y = -b.radius;

        // Render soft fluid gradient blob
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
        grad.addColorStop(0, b.color + b.alpha + ')');
        grad.addColorStop(0.6, b.color + (b.alpha * 0.4) + ')');
        grad.addColorStop(1, b.color + '0)');

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      lavaAnimationId = requestAnimationFrame(renderLava);
    }

    renderLava();
  }

  // ============================================================
  // 4. PARALLAX EFFECTS
  // ============================================================
  function initParallax() {
    if (parallaxInitialized) return;
    parallaxInitialized = true;

    const orb1 = document.querySelector('.d-orb-1');
    const orb2 = document.querySelector('.d-orb-2');
    const orb3 = document.querySelector('.d-orb-3');
    const bgText = document.querySelector('.d-hero-bg-text');

    let tX = 0, tY = 0, sX = 0, sY = 0;

    window.addEventListener('mousemove', (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      tX = (e.clientX - halfW) / halfW;
      tY = (e.clientY - halfH) / halfH;
    }, { passive: true });

    function tick() {
      if (html.getAttribute('data-theme') === 'dark') {
        sX += (tX - sX) * 0.06;
        sY += (tY - sY) * 0.06;
        const y = window.scrollY;

        if (orb1) orb1.style.transform = `translate3d(${sX * 40}px, ${y * 0.1 + sY * 40}px, 0)`;
        if (orb2) orb2.style.transform = `translate3d(${-sX * 50}px, ${-y * 0.08 - sY * 50}px, 0)`;
        if (orb3) orb3.style.transform = `translate3d(${sX * 30}px, ${y * 0.06 + sY * 30}px, 0)`;
        if (bgText) bgText.style.transform = `translate(-50%, -50%) translate3d(${-sX * 25}px, ${y * 0.25 - sY * 25}px, 0)`;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ============================================================
  // 5. 3D TACTILE CARD TILT
  // ============================================================
  function initTilt() {
    if (tiltInitialized || window.matchMedia('(hover: none)').matches) return;
    tiltInitialized = true;

    const cards = document.querySelectorAll('.d-stat-card, .d-pub-card, .d-proj-card, .d-edu-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotX = ((y - centerY) / centerY) * -7;
        const rotY = ((x - centerX) / centerX) * 7;
        card.style.transform = `perspective(900px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // ============================================================
  // 6. TYPEWRITER (Grenoble / Systems Focused)
  // ============================================================
  let typedStarted = false;
  function initTypedText() {
    if (typedStarted) return;
    const typedEl = document.getElementById('typed-text');
    if (!typedEl) return;
    typedStarted = true;

    const phrases = [
      'M1 Informatics @ Grenoble INP / Université Grenoble Alpes.',
      'Hardware-aware control & QKD single-photon detector feedback.',
      'Low-level systems programming in C, Rust, and raw sockets.',
      '100K+ packets/sec inline flow parsing & Shannon entropy.',
      'All things security & cryptography in the French Alps.'
    ];

    let pIdx = 0, cIdx = 0, isDel = false, speed = 50;

    function loop() {
      if (html.getAttribute('data-theme') !== 'dark') {
        setTimeout(loop, 400);
        return;
      }

      const curr = phrases[pIdx];
      if (isDel) {
        typedEl.textContent = curr.substring(0, cIdx - 1);
        cIdx--;
        speed = 25;
      } else {
        typedEl.textContent = curr.substring(0, cIdx + 1);
        cIdx++;
        speed = 50;
      }

      if (!isDel && cIdx === curr.length) {
        speed = 2200;
        isDel = true;
      } else if (isDel && cIdx === 0) {
        isDel = false;
        pIdx = (pIdx + 1) % phrases.length;
        speed = 400;
      }
      setTimeout(loop, speed);
    }
    loop();
  }

  // ============================================================
  // 7. SCROLL REVEALS
  // ============================================================
  function initRevealObserver() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));
  }

  function triggerReveals() {
    const reveals = document.querySelectorAll('.reveal:not(.visible)');
    const h = window.innerHeight;
    reveals.forEach(el => {
      if (el.getBoundingClientRect().top < h - 20) {
        el.classList.add('visible');
      }
    });
  }

  // ============================================================
  // 8. SCROLL PROGRESS & AUTO-HIDE NAV
  // ============================================================
  let lastY = 0;
  const nav = document.getElementById('d-nav');

  window.addEventListener('scroll', () => {
    const curY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollProgress && docHeight > 0) {
      scrollProgress.style.width = ((curY / docHeight) * 100).toFixed(2) + '%';
    }
    if (nav) {
      if (curY > lastY && curY > 120) {
        nav.style.transform = 'translateY(-100%)';
      } else {
        nav.style.transform = 'translateY(0)';
      }
    }
    lastY = curY;
  }, { passive: true });

  // ============================================================
  // 9. DYNAMIC GITHUB API LOADER
  // ============================================================
  async function fetchGitHubData() {
    try {
      const username = 'cryogenicdeadfrost';
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`)
      ]);

      if (userRes.ok) {
        const user = await userRes.json();
        const avatarImg = document.getElementById('gh-avatar-img');
        const fallback = document.getElementById('gh-avatar-fallback');
        if (avatarImg && user.avatar_url) {
          avatarImg.src = user.avatar_url;
          avatarImg.style.display = 'block';
          if (fallback) fallback.style.display = 'none';
        }

        const statsContainer = document.getElementById('gh-stats-dynamic');
        if (statsContainer) {
          statsContainer.innerHTML = `
            <span class="d-gh-stat"><strong>${user.public_repos || 8}</strong> repos</span>
            <span class="d-gh-stat"><strong>${user.followers || 0}</strong> followers</span>
            <a href="${user.html_url}" target="_blank" rel="noopener noreferrer" class="d-gh-stat" style="color:#00f0ff;text-decoration:none;">GitHub ↗</a>
          `;
        }
      }

      if (reposRes.ok) {
        const repos = await reposRes.json();
        if (Array.isArray(repos) && repos.length > 0) {
          const commitsEl = document.getElementById('gh-stat-commits');
          if (commitsEl) commitsEl.textContent = `${repos.length} Repos`;
          const streakEl = document.getElementById('gh-stat-streak');
          if (streakEl) streakEl.textContent = 'Active (2026)';
        }
      }
    } catch (e) {
      console.log('GitHub API offline / rate limited; using fallback UI');
    }
  }

  // ============================================================
  // 10. SYSTEM INIT
  // ============================================================
  function initModernSystems() {
    initCursor();
    initLavaLamp();
    initParallax();
    initTypedText();
    initTilt();
    setTimeout(triggerReveals, 150);
  }

  function setTimeGreeting() {
    const label = document.getElementById('hero-time-label');
    if (!label) return;
    const hour = new Date().getHours();
    let text = '// grenoble time: systems & security';
    if (hour >= 23 || hour < 5) text = '// late night session: kernel space debugging';
    else if (hour < 12) text = '// morning in the alps: compiler & research';
    else if (hour < 17) text = '// afternoon build: raw packets & experiments';
    else text = '// evening focus: architectural review';
    label.textContent = text;
  }

  // Konami code Matrix rain
  const konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let kIdx = 0;
  document.addEventListener('keydown', (e) => {
    if (e.key === konamiSeq[kIdx]) {
      kIdx++;
      if (kIdx === konamiSeq.length) {
        kIdx = 0;
        triggerMatrix();
      }
    } else {
      kIdx = 0;
    }
  });

  function triggerMatrix() {
    if (!matrixCanvas) return;
    matrixCanvas.classList.add('active');
    const ctx = matrixCanvas.getContext('2d');
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    const cols = Math.floor(matrixCanvas.width / 16);
    const drops = new Array(cols).fill(1);
    const chars = '01010101XYZQKDCRYPTOSHANNON_RUST_C_OCAML'.split('');
    let frames = 0;

    function render() {
      ctx.fillStyle = 'rgba(6, 9, 14, 0.08)';
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      ctx.fillStyle = '#39ff14';
      ctx.font = '13px "JetBrains Mono", monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 16, drops[i] * 16);
        if (drops[i] * 16 > matrixCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      frames++;
      if (frames < 200) {
        requestAnimationFrame(render);
      } else {
        matrixCanvas.classList.remove('active');
        ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      }
    }
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initRevealObserver();
    setTimeGreeting();

    const isDark = html.getAttribute('data-theme') === 'dark';
    updateThemeUI(isDark);
    if (isDark) {
      initModernSystems();
    }

    setTimeout(fetchGitHubData, 800);
  });

  window.toggleMode = toggleMode;
})();
