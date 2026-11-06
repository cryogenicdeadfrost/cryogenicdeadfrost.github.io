// ============================================================
// PORTFOLIO — main.js (High-Performance Engine)
// Hardware-accelerated, zero-dependency, RAF batching
// ============================================================

(function () {
  'use strict';

  // State & Elements
  const html = document.documentElement;
  const overlay = document.getElementById('transition-overlay');
  const toggleBtn = document.getElementById('mode-toggle');
  const toggleLabel = document.getElementById('toggle-label');
  const scrollProgress = document.getElementById('scroll-progress');
  const particleCanvas = document.getElementById('particle-canvas');
  const matrixCanvas = document.getElementById('matrix-canvas');
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  const themeColorMeta = document.getElementById('theme-color-meta');

  let cursorInitialized = false;
  let particlesInitialized = false;
  let parallaxInitialized = false;
  let tiltInitialized = false;
  let counterAnimated = false;
  let particleCtx = null;
  let particleAnimationId = null;

  // ============================================================
  // 1. THEME SWITCHING (Interactive Tactical Switch)
  // ============================================================
  function updateThemeUI(isDark) {
    if (toggleLabel) {
      toggleLabel.textContent = isDark ? 'DARK [ACTIVE]' : 'LIGHT [RETRO]';
    }
    if (toggleBtn) {
      toggleBtn.classList.toggle('is-dark', isDark);
    }
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isDark ? '#06090e' : '#ffffff');
    }
  }

  function applyLight() {
    html.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    updateThemeUI(false);
    if (particleAnimationId) {
      cancelAnimationFrame(particleAnimationId);
      particleAnimationId = null;
    }
  }

  function applyDark(animate) {
    html.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    updateThemeUI(true);
    initDarkSystems();
    if (animate) {
      requestAnimationFrame(triggerReveals);
    }
  }

  function toggleMode() {
    const isDark = html.getAttribute('data-theme') === 'dark';
    if (overlay) {
      overlay.classList.add('flash');
      setTimeout(() => overlay.classList.remove('flash'), 350);
    }
    if (isDark) {
      applyLight();
    } else {
      applyDark(true);
    }
  }

  // ============================================================
  // 2. ULTRA-SMOOTH CUSTOM CURSOR & MAGNETIC EFFECT
  // ============================================================
  let mouseX = -100, mouseY = -100;
  let curX = -100, curY = -100;
  let ringX = -100, ringY = -100;
  let isMoving = false;

  function initCursor() {
    if (cursorInitialized || !cursor || !ring) return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    cursorInitialized = true;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isMoving) {
        isMoving = true;
        curX = mouseX;
        curY = mouseY;
        ringX = mouseX;
        ringY = mouseY;
      }
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }, { passive: true });

    function renderRing() {
      if (html.getAttribute('data-theme') === 'dark') {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);

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
  // 3. ELEGANT NEBULA / ORGANIC PARTICLE CONSTELLATION
  // ============================================================
  function initParticles() {
    if (particlesInitialized || !particleCanvas) return;
    particlesInitialized = true;

    particleCtx = particleCanvas.getContext('2d', { alpha: true });
    let w, h;
    const particles = [];
    // Balanced count for zero frame-drop
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 25 : 55;
    const connectionDist = 130;

    function resize() {
      w = particleCanvas.width = window.innerWidth;
      h = particleCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Organic color hues: Emerald, Cyan, Violet, Amber
    const colors = [
      'rgba(16, 185, 129,',   // Emerald
      'rgba(6, 182, 212,',    // Cyan
      'rgba(168, 85, 247,',   // Purple
      'rgba(59, 130, 246,'    // Blue
    ];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.8,
        color: colors[i % colors.length],
        alpha: Math.random() * 0.4 + 0.2
      });
    }

    function animateParticles() {
      if (html.getAttribute('data-theme') !== 'dark') {
        particleAnimationId = null;
        return;
      }

      particleCtx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Soft cursor deflection
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (140 - dist) / 140;
          p.vx -= (dx / dist) * force * 0.15;
          p.vy -= (dy / dist) * force * 0.15;
        }

        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Draw particle node
        particleCtx.beginPath();
        particleCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        particleCtx.fillStyle = p.color + p.alpha + ')';
        particleCtx.fill();

        // Connect nearby nodes with subtle fiber lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < connectionDist) {
            const lineAlpha = (1 - dist2 / connectionDist) * 0.12;
            particleCtx.beginPath();
            particleCtx.moveTo(p.x, p.y);
            particleCtx.lineTo(p2.x, p2.y);
            particleCtx.strokeStyle = `rgba(148, 163, 184, ${lineAlpha})`;
            particleCtx.lineWidth = 0.75;
            particleCtx.stroke();
          }
        }
      }

      particleAnimationId = requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  // ============================================================
  // 4. PARALLAX SYSTEM (Attached to Mouse & Scroll)
  // ============================================================
  function initParallax() {
    if (parallaxInitialized) return;
    parallaxInitialized = true;

    const orb1 = document.querySelector('.d-orb-1');
    const orb2 = document.querySelector('.d-orb-2');
    const orb3 = document.querySelector('.d-orb-3');
    const bgText = document.querySelector('.d-hero-bg-text');

    let targetMouseX = 0, targetMouseY = 0;
    let smoothMouseX = 0, smoothMouseY = 0;

    window.addEventListener('mousemove', (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetMouseX = (e.clientX - halfW) / halfW;
      targetMouseY = (e.clientY - halfH) / halfH;
    }, { passive: true });

    function tickParallax() {
      if (html.getAttribute('data-theme') === 'dark') {
        smoothMouseX += (targetMouseX - smoothMouseX) * 0.05;
        smoothMouseY += (targetMouseY - smoothMouseY) * 0.05;

        const scrollY = window.scrollY;

        if (orb1) {
          orb1.style.transform = `translate3d(${smoothMouseX * 35}px, ${scrollY * 0.12 + smoothMouseY * 35}px, 0)`;
        }
        if (orb2) {
          orb2.style.transform = `translate3d(${-smoothMouseX * 45}px, ${-scrollY * 0.08 - smoothMouseY * 45}px, 0)`;
        }
        if (orb3) {
          orb3.style.transform = `translate3d(${smoothMouseX * 25}px, ${scrollY * 0.06 + smoothMouseY * 25}px, 0)`;
        }
        if (bgText) {
          bgText.style.transform = `translate(-50%, -50%) translate3d(${-smoothMouseX * 20}px, ${scrollY * 0.25 - smoothMouseY * 20}px, 0)`;
        }
      }
      requestAnimationFrame(tickParallax);
    }
    requestAnimationFrame(tickParallax);
  }

  // ============================================================
  // 5. 3D TACTILE TILT ON CARDS
  // ============================================================
  function initTiltCards() {
    if (tiltInitialized || window.matchMedia('(hover: none)').matches) return;
    tiltInitialized = true;

    const cards = document.querySelectorAll('.d-stat-card, .d-pub-card, .d-proj-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // ============================================================
  // 6. TYPEWRITER EFFECT
  // ============================================================
  let typedInitialized = false;
  function initTypedText() {
    if (typedInitialized) return;
    const typedEl = document.getElementById('typed-text');
    if (!typedEl) return;
    typedInitialized = true;

    const phrases = [
      'Hardware-aware systems & security engineering.',
      'Superconducting detector feedback in TF-QKD networks.',
      'High-throughput packet parsing at 100K+ pps.',
      'Deep learning security & graph neural networks.',
      'M1 Informatics @ Grenoble INP / Université Grenoble Alpes.'
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let speed = 55;

    function type() {
      if (html.getAttribute('data-theme') !== 'dark') {
        setTimeout(type, 500);
        return;
      }

      const current = phrases[phraseIdx];
      if (isDeleting) {
        typedEl.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        speed = 28;
      } else {
        typedEl.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        speed = 55;
      }

      if (!isDeleting && charIdx === current.length) {
        speed = 2200; // Pause at end of sentence
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        speed = 400;
      }

      setTimeout(type, speed);
    }
    type();
  }

  // ============================================================
  // 7. INTERSECTION OBSERVER REVEAL & COUNTERS
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
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

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

  function initCounterAnimation() {
    if (counterAnimated) return;
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          counterAnimated = true;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(el => observer.observe(el));
  }

  function animateCounter(el) {
    const target = el.getAttribute('data-count');
    const suffix = el.getAttribute('data-suffix') || '';
    const isFloat = target.includes('.');
    const targetNum = parseFloat(target);
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Quintic ease out
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = isFloat
        ? (targetNum * eased).toFixed(2)
        : Math.floor(targetNum * eased);
      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  // ============================================================
  // 8. SCROLL PROGRESS & AUTO-HIDE NAV
  // ============================================================
  let lastScroll = 0;
  const nav = document.getElementById('d-nav');

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollProgress && docHeight > 0) {
      scrollProgress.style.width = ((scrollTop / docHeight) * 100).toFixed(2) + '%';
    }

    if (nav) {
      if (scrollTop > lastScroll && scrollTop > 120) {
        nav.style.transform = 'translateY(-100%)';
      } else {
        nav.style.transform = 'translateY(0)';
      }
    }
    lastScroll = scrollTop;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

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
            <span class="d-gh-stat"><strong>${user.public_repos || 8}</strong> repositories</span>
            <span class="d-gh-stat"><strong>${user.followers || 0}</strong> followers</span>
            <a href="${user.html_url}" target="_blank" rel="noopener noreferrer" class="d-gh-stat" style="color:var(--c-accent);text-decoration:none;">Profile ↗</a>
          `;
        }
      }

      if (reposRes.ok) {
        const repos = await reposRes.json();
        if (Array.isArray(repos) && repos.length > 0) {
          const commitsEl = document.getElementById('gh-stat-commits');
          if (commitsEl) commitsEl.textContent = `${repos.length} Public Repos`;
          
          const streakEl = document.getElementById('gh-stat-streak');
          if (streakEl) streakEl.textContent = 'Active (2026)';
        }
      }
    } catch (e) {
      // Graceful fallback to static data
      console.log('GitHub API offline or rate limited; using fallback UI');
    }
  }

  // ============================================================
  // 10. SYSTEM INIT
  // ============================================================
  function initDarkSystems() {
    initCursor();
    initParticles();
    initParallax();
    initTypedText();
    initTiltCards();
    initCounterAnimation();
    setTimeout(triggerReveals, 150);
  }

  function setTimeGreeting() {
    const label = document.getElementById('hero-time-label');
    if (!label) return;
    const hour = new Date().getHours();
    let text = '// research log: systems & security';
    if (hour >= 23 || hour < 5) text = '// late night session: low-level debugging';
    else if (hour < 12) text = '// morning workspace: compiler & papers';
    else if (hour < 17) text = '// afternoon build: telemetry & testing';
    else text = '// evening focus: architectural review';
    label.textContent = text;
  }

  // Konami code matrix easter egg
  const konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIdx = 0;
  document.addEventListener('keydown', (e) => {
    if (e.key === konamiSeq[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === konamiSeq.length) {
        konamiIdx = 0;
        triggerMatrix();
      }
    } else {
      konamiIdx = 0;
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
      ctx.fillStyle = '#10b981';
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

  // DOM Loaded
  document.addEventListener('DOMContentLoaded', () => {
    initRevealObserver();
    setTimeGreeting();

    const isDark = html.getAttribute('data-theme') === 'dark';
    updateThemeUI(isDark);
    if (isDark) {
      initDarkSystems();
    }

    setTimeout(fetchGitHubData, 800);
  });

  // Global exports for inline triggers
  window.toggleMode = toggleMode;
})();
