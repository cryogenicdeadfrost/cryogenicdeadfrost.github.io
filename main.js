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
  let sectionMotionInitialized = false;
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
    }, 720);
    setTimeout(() => {
      animeGate.classList.remove('active');
    }, 1680);
  }

  function applyLight() {
    triggerAnimeGate(() => {
      html.setAttribute('data-theme', 'light');
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
      updateThemeUI(true);
      initModernSystems();
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
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

  function initNormalNavigation() {
    document.querySelectorAll('.light-content a[href^="#l-"]').forEach(link => {
      link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();

        const go = () => {
          history.replaceState(null, '', targetId);
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        if (html.getAttribute('data-theme') === 'dark') {
          applyLight();
          setTimeout(go, 760);
        } else {
          go();
        }
      });
    });
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
          const repoCount = Number.isFinite(Number(user.public_repos)) ? Number(user.public_repos) : 8;
          const followerCount = Number.isFinite(Number(user.followers)) ? Number(user.followers) : 0;
          const githubUrl = typeof user.html_url === 'string' && /^https:\/\/github\.com\/cryogenicdeadfrost\/?$/i.test(user.html_url)
            ? user.html_url
            : 'https://github.com/cryogenicdeadfrost';

          statsContainer.replaceChildren();

          const reposStat = document.createElement('span');
          reposStat.className = 'd-gh-stat';
          reposStat.append(document.createTextNode(' '));
          const reposStrong = document.createElement('strong');
          reposStrong.textContent = String(repoCount);
          reposStat.replaceChildren(reposStrong, document.createTextNode(' repos'));

          const followersStat = document.createElement('span');
          followersStat.className = 'd-gh-stat';
          const followersStrong = document.createElement('strong');
          followersStrong.textContent = String(followerCount);
          followersStat.append(followersStrong, document.createTextNode(' followers'));

          const githubLink = document.createElement('a');
          githubLink.href = githubUrl;
          githubLink.target = '_blank';
          githubLink.rel = 'noopener noreferrer';
          githubLink.className = 'd-gh-stat';
          githubLink.style.cssText = 'color:#00f0ff;text-decoration:none;';
          githubLink.textContent = 'GitHub ↗';

          statsContainer.append(reposStat, followersStat, githubLink);
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
  // 9.5 SECTION LIQUID MOTION + SCROLL RHYTHM VISUALIZER
  // ============================================================
  function initSectionMotion() {
    if (sectionMotionInitialized) return;
    const sections = document.querySelectorAll('.dark-content .d-section, .dark-content .d-hero');
    if (!sections.length) return;
    sectionMotionInitialized = true;

    let rafPending = false;
    let previousY = window.scrollY;
    let velocity = 0;
    let lastPulse = 0;

    sections.forEach(section => {
      section.style.setProperty('--fluid-speed', (15 + Math.random() * 14).toFixed(1) + 's');
      section.style.setProperty('--fluid-speed-alt', (22 + Math.random() * 18).toFixed(1) + 's');
      section.style.setProperty('--fluid-delay', (-Math.random() * 18).toFixed(1) + 's');
    });

    const beam = document.querySelector('.rhythm-laser-beam');
    const state = document.getElementById('rhythm-state');
    const nodes = document.querySelectorAll('.rhythm-laser-node');

    function update() {
      const y = window.scrollY;
      velocity = velocity * 0.72 + (y - previousY) * 0.28;
      previousY = y;

      const viewportCenter = window.innerHeight * 0.5;
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const center = rect.top + rect.height * 0.5;
        const distance = (center - viewportCenter) / Math.max(window.innerHeight, rect.height);
        const clamped = Math.max(-1, Math.min(1, distance));
        const shift = clamped * 34;
        const opacity = 1 - Math.min(0.34, Math.abs(clamped) * 0.34);
        section.style.setProperty('--section-distance', shift.toFixed(2));
        section.style.setProperty('--section-opacity', opacity.toFixed(3));

        if (Math.abs(clamped) < 0.42) {
          section.classList.add('section-active');
          section.classList.remove('section-near-edge');
        } else {
          section.classList.remove('section-active');
          section.classList.add('section-near-edge');
        }

        const wave = Math.sin((distance + index * 0.19) * Math.PI * 2);
        section.style.setProperty('--fluid-x', (wave * 2.6).toFixed(2) + '%');
        section.style.setProperty('--fluid-y', (Math.cos(distance * Math.PI * 2) * 2.2).toFixed(2) + '%');
      });

      if (beam) {
        const projects = document.getElementById('d-projects');
        const rect = projects ? projects.getBoundingClientRect() : null;
        const progress = rect
          ? Math.max(0, Math.min(1, (viewportCenter - rect.top) / Math.max(rect.height, 1)))
          : 0;
        const intensity = Math.min(1, Math.abs(velocity) / 18);
        beam.style.left = (5 + progress * 90).toFixed(2) + '%';
        beam.style.opacity = (0.48 + intensity * 0.52).toFixed(2);
        if (state) {
          state.textContent = Math.abs(velocity) > 1.2
            ? 'PULSE / SCROLL INPUT DETECTED'
            : 'FLOW / POSITION TRACKING';
        }

        const now = performance.now();
        if (Math.abs(velocity) > 1.5 && now - lastPulse > 95) {
          lastPulse = now;
          nodes.forEach(node => {
            node.classList.remove('pulse');
            void node.offsetWidth;
            node.classList.add('pulse');
          });
        }
      }

      rafPending = false;
    }

    window.addEventListener('scroll', () => {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    window.addEventListener('resize', update, { passive: true });
    update();
  }
  // ============================================================
  // 10. SYSTEM INIT
  // ============================================================
  function initFluidSectionPalette() {
    const sections = document.querySelectorAll('.dark-content .d-hero, .dark-content .d-section');
    const darkContent = document.querySelector('.dark-content');
    if (!sections.length || !darkContent) return;

    const palettes = new Map([
      ['d-hero', ['#00f0ff', '#ff0055', '#ffe600']],
      ['d-about', ['#ffe600', '#ffffff', '#ff8a00']],
      ['d-education', ['#ffaa00', '#ff6a00', '#fff0a8']],
      ['d-experience', ['#ff007f', '#ff8800', '#ffe600']],
      ['d-publications', ['#ff0033', '#ff99aa', '#ffffff']],
      ['d-projects', ['#39ff14', '#00f0ff', '#a7f3d0']],
      ['d-skills', ['#00f0ff', '#ff007f', '#ffe600']],
      ['d-github', ['#00f0ff', '#7c3aed', '#ffffff']]
    ]);

    let raf = 0;
    let active = '';
    let current = ['#00f0ff', '#ff0055', '#ffe600'];
    let target = current.slice();
    let transitionStart = performance.now();
    const transitionDuration = 1800;

    function hexToRgb(hex) {
      const value = hex.replace('#', '');
      return [
        parseInt(value.slice(0, 2), 16),
        parseInt(value.slice(2, 4), 16),
        parseInt(value.slice(4, 6), 16)
      ];
    }

    function rgbToHex(rgb) {
      return '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
    }

    function mix(a, b, t) {
      const ar = hexToRgb(a);
      const br = hexToRgb(b);
      return rgbToHex(ar.map((v, i) => v + (br[i] - v) * t));
    }

    function animatePalette(now) {
      const raw = Math.min(1, (now - transitionStart) / transitionDuration);
      const eased = raw < 0.5
        ? 2 * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 2) / 2;

      darkContent.style.setProperty('--fluid-a', mix(current[0], target[0], eased));
      darkContent.style.setProperty('--fluid-b', mix(current[1], target[1], eased));
      darkContent.style.setProperty('--fluid-c', mix(current[2], target[2], eased));

      if (raw < 1) {
        requestAnimationFrame(animatePalette);
      } else {
        current = target.slice();
      }
    }

    function updatePalette() {
      raf = 0;
      const center = window.innerHeight * 0.5;
      let best = null;
      let bestDistance = Infinity;

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height * 0.5;
        const distance = Math.abs(sectionCenter - center);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = section;
        }
      });

      if (!best || best.id === active) return;
      active = best.id;
      const palette = palettes.get(active);
      if (!palette) return;

      current = [
        getComputedStyle(darkContent).getPropertyValue('--fluid-a').trim() || current[0],
        getComputedStyle(darkContent).getPropertyValue('--fluid-b').trim() || current[1],
        getComputedStyle(darkContent).getPropertyValue('--fluid-c').trim() || current[2]
      ];
      target = palette.slice();
      transitionStart = performance.now();
      requestAnimationFrame(animatePalette);
    }

    function schedule() {
      if (!raf) raf = requestAnimationFrame(updatePalette);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    updatePalette();
  }
  function initModernSystems() {
    initCursor();
    initLavaLamp();
    initParallax();
    initTypedText();
    initTilt();
    initSectionMotion();
    initScrollSpeedBreaker();
    initProjectDetails();
    initFluidSectionPalette();
    setTimeout(triggerReveals, 150);
  }

  function initAdminAccess() {
    const buttons = document.querySelectorAll('#admin-access, #admin-access-normal');
    buttons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.assign('https://thanatos.tail721b17.ts.net/admin');
      });
    });
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
    const normalDimensionTrigger = document.querySelector('.normal-dimension-trigger');
    if (normalDimensionTrigger) {
      normalDimensionTrigger.addEventListener('click', toggleMode);
    }

    initRevealObserver();
    initNormalNavigation();
    initAdminAccess();
    setTimeGreeting();

    html.setAttribute('data-theme', 'light');
    updateThemeUI(false);

    setTimeout(fetchGitHubData, 800);
  });

  window.toggleMode = toggleMode;

  // ============================================================
  // 9.8 SCROLL SPEED BREAKER
  // ============================================================
  let scrollSpeedInitialized = false;
  function initScrollSpeedBreaker() {
    if (scrollSpeedInitialized) return;
    scrollSpeedInitialized = true;

    const layer = document.createElement('div');
    layer.id = 'scroll-speed-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    let previousY = window.scrollY;
    let velocity = 0;
    let lastTime = performance.now();
    let fastTimer = null;
    let spawnTimer = null;

    function spawnStreak(intensity) {
      if (html.getAttribute('data-theme') !== 'dark') return;
      const streak = document.createElement('span');
      streak.className = 'scroll-speed-streak';
      streak.style.top = (8 + Math.random() * 84).toFixed(2) + '%';
      streak.style.setProperty('--streak-width', (10 + intensity * 28 + Math.random() * 18).toFixed(1) + 'vw');
      streak.style.setProperty('--streak-duration', Math.max(.18, .42 - intensity * .16).toFixed(2) + 's');
      layer.appendChild(streak);
      setTimeout(() => streak.remove(), 600);
    }

    function update() {
      const now = performance.now();
      const dt = Math.max(16, now - lastTime);
      const dy = window.scrollY - previousY;
      const instant = Math.abs(dy) / dt * 16.67;
      velocity = velocity * .72 + instant * .28;
      previousY = window.scrollY;
      lastTime = now;

      const intensity = Math.min(1, velocity / 42);
      if (velocity > 8) {
        document.body.classList.add('scrolling-fast');
        clearTimeout(fastTimer);
        fastTimer = setTimeout(() => document.body.classList.remove('scrolling-fast'), 120);
      } else if (velocity < 2) {
        document.body.classList.remove('scrolling-fast');
      }

      if (velocity > 10 && !spawnTimer) {
        spawnStreak(intensity);
        spawnTimer = setTimeout(() => { spawnTimer = null; }, Math.max(24, 90 - intensity * 55));
      }

      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // ============================================================
  // 9.9 PERSONA-STYLE PROJECT DETAILS
  // ============================================================
  let projectDetailsInitialized = false;
  function initProjectDetails() {
    if (projectDetailsInitialized) return;
    projectDetailsInitialized = true;

    const cards = document.querySelectorAll('#d-projects .d-proj-card');
    if (!cards.length) return;

    const overlay = document.createElement('div');
    overlay.id = 'project-detail-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="project-detail-panel" role="dialog" aria-modal="true" aria-labelledby="project-detail-title">
        <div class="project-detail-top">
          <div>
            <div class="project-detail-kicker">PROJECT // DETAIL VIEW</div>
            <h2 class="project-detail-title" id="project-detail-title"></h2>
          </div>
          <button class="project-detail-close" type="button" aria-label="Close project details">ESC / CLOSE</button>
        </div>
        <div class="project-detail-body">
          <div class="project-detail-lang"></div>
          <p class="project-detail-summary"></p>
          <div class="project-detail-grid">
            <div class="project-detail-box">
              <h4>Architecture</h4>
              <div class="project-detail-arch"></div>
            </div>
            <div class="project-detail-box">
              <h4>Signal</h4>
              <div class="project-detail-quip"></div>
              <div class="project-detail-tags"></div>
            </div>
          </div>
          <div class="project-detail-actions">
            <a class="project-detail-github" target="_blank" rel="noopener noreferrer">OPEN GITHUB ↗</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const panel = overlay.querySelector('.project-detail-panel');
    const title = overlay.querySelector('.project-detail-title');
    const lang = overlay.querySelector('.project-detail-lang');
    const summary = overlay.querySelector('.project-detail-summary');
    const arch = overlay.querySelector('.project-detail-arch');
    const quip = overlay.querySelector('.project-detail-quip');
    const tags = overlay.querySelector('.project-detail-tags');
    const github = overlay.querySelector('.project-detail-github');
    const close = overlay.querySelector('.project-detail-close');

    let lastFocused = null;

    function openCard(card) {
      lastFocused = document.activeElement;
      const name = card.querySelector('.d-proj-name')?.textContent.trim() || 'Project';
      const language = card.querySelector('.d-proj-lang')?.textContent.trim() || '';
      const description = card.querySelector('.d-proj-desc')?.textContent.trim() || '';
      const architecture = card.querySelector('.d-proj-arch')?.textContent.trim() || 'Architecture details unavailable.';
      const quote = card.querySelector('.d-proj-quip')?.textContent.trim() || '';
      const link = card.querySelector('.d-proj-link')?.href || '#';

      title.textContent = name;
      lang.textContent = language;
      summary.textContent = description;
      arch.textContent = architecture;
      quip.textContent = quote;
      github.href = link;
      tags.replaceChildren();

      card.querySelectorAll('.d-proj-tag').forEach(tag => {
        const chip = document.createElement('span');
        chip.textContent = tag.textContent.trim();
        tags.appendChild(chip);
      });

      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      close.focus();
    }

    function closeCard() {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    cards.forEach(card => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-haspopup', 'dialog');

      card.addEventListener('click', (event) => {
        if (event.target.closest('a, button')) return;
        openCard(card);
      });

      card.addEventListener('keydown', (event) => {
        if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('a, button')) {
          event.preventDefault();
          openCard(card);
        }
      });
    });

    close.addEventListener('click', closeCard);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeCard();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay.classList.contains('active')) closeCard();
    });
    panel.addEventListener('click', (event) => event.stopPropagation());
  }


})();