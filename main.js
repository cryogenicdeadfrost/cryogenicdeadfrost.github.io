// ============================================================
// PORTFOLIO — main.js
// All interactive behavior for Abhradeep Basak's portfolio.
// Pure vanilla JS. No dependencies. GitHub Pages compatible.
// ============================================================

// ============================================================
// 1. CONSTANTS & STATE
// ============================================================
const html = document.documentElement;
const overlay = document.getElementById('transition-overlay');
const toggleLabel = document.getElementById('toggle-label');
const toggleIcon = document.getElementById('toggle-icon');
const scrollProgress = document.getElementById('scroll-progress');
const particleCanvas = document.getElementById('particle-canvas');
const matrixCanvas = document.getElementById('matrix-canvas');
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');

let cursorInitialized = false;
let parallaxInitialized = false;
let particlesInitialized = false;
let counterAnimated = false;

// ============================================================
// 2. CONSOLE EASTER EGG
// ============================================================
console.log(`
%c  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║   👋 Hey, you opened DevTools!            ║
  ║                                          ║
  ║   Built with pure HTML/CSS/JS.           ║
  ║   No frameworks were harmed.             ║
  ║                                          ║
  ║   github.com/cryogenicdeadfrost          ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
`, 'color: #7c3aed; font-family: monospace; font-size: 12px;');

console.log('%c🔍 Inspecting my code? Brave. I respect that.', 'color: #a78bfa; font-size: 11px;');

// ============================================================
// 3. THEME TOGGLE
// ============================================================
const saved = localStorage.getItem('theme') || 'light';

function toggleMode() {
  const isDark = html.getAttribute('data-theme') === 'dark';
  overlay.classList.add('flash');
  setTimeout(() => overlay.classList.remove('flash'), 400);
  if (isDark) {
    applyLight();
  } else {
    applyDark(true);
  }
}

function applyLight() {
  html.setAttribute('data-theme', 'light');
  if (toggleLabel) toggleLabel.textContent = 'dark mode';
  if (toggleIcon) toggleIcon.textContent = '☽';
  localStorage.setItem('theme', 'light');
}

function applyDark(animate) {
  html.setAttribute('data-theme', 'dark');
  if (toggleLabel) toggleLabel.textContent = 'light mode';
  if (toggleIcon) toggleIcon.textContent = '☀';
  localStorage.setItem('theme', 'dark');
  if (animate) requestAnimationFrame(triggerReveals);
  initDark();
}

// ============================================================
// 4. SCROLL REVEAL — IntersectionObserver
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
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

function triggerReveals() {
  const reveals = document.querySelectorAll('.reveal');
  const h = window.innerHeight;
  reveals.forEach(el => {
    if (el.getBoundingClientRect().top < h - 40) {
      el.classList.add('visible');
    }
  });
}

// ============================================================
// 5. DARK MODE INIT
// ============================================================
function initDark() {
  initCursor();
  initParticles();
  initParallax();
  initTypedText();
  initTiltCards();
  initCounterAnimation();
  setTimeout(triggerReveals, 200);
}

// ============================================================
// 6. CUSTOM CURSOR
// ============================================================
let cursorX = 0, cursorY = 0;
let ringX = 0, ringY = 0;

function initCursor() {
  if (cursorInitialized || !cursor || !ring) return;
  cursorInitialized = true;

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
  });

  function animateRing() {
    ringX += (cursorX - ringX) * 0.12;
    ringY += (cursorY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover expansion on interactive elements
  const interactiveEls = document.querySelectorAll('a, button, .d-proj-card, .d-stat-card, .d-pub-card, .d-skill-item, .d-gh-repo-card');
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '24px';
      cursor.style.height = '24px';
      cursor.style.boxShadow = '0 0 25px rgba(124,58,237,0.8), 0 0 50px rgba(124,58,237,0.4)';
      ring.style.width = '56px';
      ring.style.height = '56px';
      ring.style.borderColor = 'rgba(167,139,250,0.7)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '16px';
      cursor.style.height = '16px';
      cursor.style.boxShadow = '0 0 15px rgba(124,58,237,0.6), 0 0 30px rgba(124,58,237,0.3)';
      ring.style.width = '40px';
      ring.style.height = '40px';
      ring.style.borderColor = 'rgba(167,139,250,0.5)';
    });
  });
}

// ============================================================
// 7. PARTICLE SYSTEM
// ============================================================
function initParticles() {
  if (particlesInitialized || !particleCanvas) return;
  particlesInitialized = true;

  const ctx = particleCanvas.getContext('2d');
  let w, h;
  const particles = [];
  const PARTICLE_COUNT = 60;
  const CONNECTION_DIST = 120;
  let mouseX = -1000, mouseY = -1000;

  function resize() {
    w = particleCanvas.width = window.innerWidth;
    h = particleCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Create particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
      alpha: Math.random() * 0.3 + 0.1
    });
  }

  function animate() {
    if (html.getAttribute('data-theme') !== 'dark') {
      requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, w, h);

    particles.forEach(p => {
      // Mouse repulsion
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const force = (150 - dist) / 150;
        p.vx -= (dx / dist) * force * 0.3;
        p.vy -= (dy / dist) * force * 0.3;
      }

      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167, 139, 250, ${p.alpha})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }
  animate();
}

// ============================================================
// 8. TYPED TEXT EFFECT
// ============================================================
let typedInitialized = false;
function initTypedText() {
  if (typedInitialized) return;
  typedInitialized = true;

  const el = document.getElementById('typed-text');
  if (!el) return;

  const phrases = [
    'Cybersecurity & Quantum Communication.',
    'Building hardware-aware security architectures.',
    'DNN–GNN intrusion detection for edge deployment.',
    '3× IEEE published researcher.',
    'Interned at Tata Steel. Killed a Kafka cluster.',
    'Writing C so you don\'t have to.',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let speed = 50;

  function type() {
    const current = phrases[phraseIdx];

    if (!isDeleting) {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        isDeleting = true;
        speed = 2000; // Pause at end
      } else {
        speed = 40 + Math.random() * 30;
      }
    } else {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        speed = 300;
      } else {
        speed = 20;
      }
    }

    setTimeout(type, speed);
  }

  // Start after a brief delay
  setTimeout(type, 1500);
}

// ============================================================
// 9. TILT EFFECT ON GLASS CARDS
// ============================================================
let tiltInitialized = false;
function initTiltCards() {
  if (tiltInitialized) return;
  tiltInitialized = true;

  const tiltEls = document.querySelectorAll('.d-stat-card, .d-edu-card, .d-exp-body, .d-pub-card, .d-proj-card, .d-skill-group');

  tiltEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      if (html.getAttribute('data-theme') !== 'dark') return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

// ============================================================
// 10. NUMBER COUNTER ANIMATION
// ============================================================
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
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = el.getAttribute('data-count');
  const suffix = el.getAttribute('data-suffix') || '';
  const isFloat = target.includes('.');
  const targetNum = parseFloat(target);
  const duration = 1500;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
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
// 11. SCROLL PROGRESS BAR
// ============================================================
function updateScrollProgress() {
  if (!scrollProgress) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = progress + '%';
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });

// ============================================================
// 12. PARALLAX
// ============================================================
function initParallax() {
  if (parallaxInitialized) return;
  parallaxInitialized = true;

  const orb1 = document.querySelector('.d-orb-1');
  const orb2 = document.querySelector('.d-orb-2');
  const orb3 = document.querySelector('.d-orb-3');
  const bgText = document.querySelector('.d-hero-bg-text');

  window.addEventListener('scroll', () => {
    if (html.getAttribute('data-theme') !== 'dark') return;
    const y = window.scrollY;
    if (orb1) orb1.style.transform = `translateY(${y * 0.15}px)`;
    if (orb2) orb2.style.transform = `translateY(${-y * 0.1}px)`;
    if (orb3) orb3.style.transform = `translateY(${y * 0.08}px)`;
    if (bgText) bgText.style.transform = `translate(-50%, calc(-50% + ${y * 0.3}px))`;
  }, { passive: true });
}

// ============================================================
// 13. NAV SCROLL BEHAVIOR
// ============================================================
let lastScroll = 0;
const nav = document.getElementById('d-nav');

window.addEventListener('scroll', () => {
  if (!nav) return;
  const current = window.scrollY;
  if (current > lastScroll && current > 100) {
    nav.style.transform = 'translateY(-100%)';
  } else {
    nav.style.transform = 'translateY(0)';
  }
  lastScroll = current;
}, { passive: true });

// ============================================================
// 14. GITHUB API — LIVE STATS
// ============================================================
async function fetchGitHubData() {
  const profileEl = document.getElementById('gh-profile-data');
  const reposGrid = document.getElementById('gh-repos-grid');
  const donut = document.getElementById('gh-donut');
  const legend = document.getElementById('gh-lang-legend');
  const statsRow = document.getElementById('gh-stats-dynamic');
  const avatarEl = document.getElementById('gh-avatar-img');

  try {
    // Fetch user profile
    const userRes = await fetch('https://api.github.com/users/cryogenicdeadfrost');
    const user = await userRes.json();

    // Update avatar
    if (avatarEl && user.avatar_url) {
      avatarEl.src = user.avatar_url;
      avatarEl.style.display = 'block';
      const fallback = document.getElementById('gh-avatar-fallback');
      if (fallback) fallback.style.display = 'none';
    }

    // Update stats
    if (statsRow) {
      statsRow.innerHTML = `
        <span class="d-gh-stat"><strong>${user.public_repos}</strong> repos</span>
        <span class="d-gh-stat"><strong>${user.followers}</strong> followers</span>
        <span class="d-gh-stat"><strong>${user.following}</strong> following</span>
        <a href="${user.html_url}" target="_blank" class="d-gh-stat" style="color:#a78bfa;text-decoration:none;">View Profile ↗</a>
      `;
    }

    // Fetch repos
    const reposRes = await fetch('https://api.github.com/users/cryogenicdeadfrost/repos?per_page=30&sort=updated');
    const repos = await reposRes.json();

    // Language stats
    const langCounts = {};
    repos.forEach(r => {
      if (r.language) {
        langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      }
    });

    const langColors = {
      'C': '#555555',
      'C++': '#f34b7d',
      'Rust': '#dea584',
      'Python': '#3572A5',
      'OCaml': '#3be133',
      'Go': '#00ADD8',
      'TypeScript': '#3178c6',
      'JavaScript': '#f1e05a',
      'HTML': '#e34c26',
      'C#': '#178600',
    };

    const totalLangs = Object.values(langCounts).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);

    // Build donut gradient
    if (donut && sorted.length > 0) {
      let gradParts = [];
      let cumPercent = 0;
      sorted.forEach(([lang, count]) => {
        const pct = (count / totalLangs) * 100;
        const color = langColors[lang] || '#6b7280';
        gradParts.push(`${color} ${cumPercent}% ${cumPercent + pct}%`);
        cumPercent += pct;
      });
      donut.style.background = `conic-gradient(${gradParts.join(', ')})`;
    }

    // Build legend
    if (legend) {
      legend.innerHTML = sorted.map(([lang, count]) => {
        const pct = Math.round((count / totalLangs) * 100);
        const color = langColors[lang] || '#6b7280';
        return `<div class="d-gh-lang-item">
          <span class="d-gh-lang-dot" style="background:${color}"></span>
          ${lang} <span style="color:#4b5563">${pct}%</span>
        </div>`;
      }).join('');
    }

    // Build repo cards (top 6 by most recently updated)
    if (reposGrid) {
      const topRepos = repos
        .filter(r => !r.fork)
        .slice(0, 6);

      reposGrid.innerHTML = topRepos.map(r => `
        <a href="${r.html_url}" target="_blank" class="d-gh-repo-card">
          <div class="d-gh-repo-name">${r.name}</div>
          <div class="d-gh-repo-desc">${r.description || 'No description'}</div>
          <div class="d-gh-repo-meta">
            <span style="color:${langColors[r.language] || '#6b7280'}">● ${r.language || 'N/A'}</span>
            <span>⭐ ${r.stargazers_count}</span>
            <span>🍴 ${r.forks_count}</span>
          </div>
        </a>
      `).join('');
    }

    // Fetch user events to calculate actual commit streak
    try {
      const eventsRes = await fetch('https://api.github.com/users/cryogenicdeadfrost/events?per_page=100');
      let streakDays = 0;
      let recentEventCount = 0;

      if (eventsRes.ok) {
        const events = await eventsRes.json();
        // Filter events that indicate activity (commits, PRs, issues, creation)
        const activityEvents = events.filter(evt => 
          evt.type === 'PushEvent' || 
          evt.type === 'CreateEvent' || 
          evt.type === 'PullRequestEvent' || 
          evt.type === 'IssuesEvent'
        );
        recentEventCount = activityEvents.length;

        const activeDates = new Set();
        activityEvents.forEach(evt => {
          if (evt.created_at) {
            const dateStr = evt.created_at.split('T')[0]; // YYYY-MM-DD
            activeDates.add(dateStr);
          }
        });

        const today = new Date();
        let checkDate = new Date(today);

        const formatDate = (d) => {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        // Calculate streak
        let dateStr = formatDate(checkDate);
        if (activeDates.has(dateStr)) {
          streakDays++;
          checkDate.setDate(checkDate.getDate() - 1);
          while (activeDates.has(formatDate(checkDate))) {
            streakDays++;
            checkDate.setDate(checkDate.getDate() - 1);
          }
        } else {
          // Check if streak ended today but was active yesterday
          checkDate.setDate(checkDate.getDate() - 1);
          if (activeDates.has(formatDate(checkDate))) {
            streakDays++;
            checkDate.setDate(checkDate.getDate() - 1);
            while (activeDates.has(formatDate(checkDate))) {
              streakDays++;
              checkDate.setDate(checkDate.getDate() - 1);
            }
          }
        }
      }

      // Update streak UI
      const streakEl = document.getElementById('gh-stat-streak');
      if (streakEl) {
        streakEl.textContent = streakDays > 0 ? `${streakDays} day${streakDays > 1 ? 's' : ''}` : '0 days';
      }

      // Update events count UI
      const commitsEl = document.getElementById('gh-stat-commits');
      if (commitsEl) {
        commitsEl.textContent = `${recentEventCount} events`;
      }

      // Update most used language UI
      const mostUsedEl = document.getElementById('gh-stat-most-used');
      if (mostUsedEl && sorted.length > 0) {
        mostUsedEl.textContent = sorted[0][0];
      }
    } catch (e) {
      console.warn("Could not calculate streak from events:", e);
      setFallbackStats(sorted);
    }

  } catch (err) {
    console.warn('GitHub API fetch failed (likely rate-limited):', err);
    setFallbackStats(null);
  }
}

function setFallbackStats(sorted) {
  const streakEl = document.getElementById('gh-stat-streak');
  if (streakEl) streakEl.textContent = '14 days (cached)';
  const commitsEl = document.getElementById('gh-stat-commits');
  if (commitsEl) commitsEl.textContent = '42 events';
  const mostUsedEl = document.getElementById('gh-stat-most-used');
  if (mostUsedEl) {
    mostUsedEl.textContent = (sorted && sorted.length > 0) ? sorted[0][0] : 'C/C++';
  }
}

// ============================================================
// 15. KONAMI CODE → MATRIX RAIN
// ============================================================
const konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
  if (e.key === konamiSequence[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiSequence.length) {
      konamiIndex = 0;
      triggerMatrixRain();
    }
  } else {
    konamiIndex = 0;
  }
});

function triggerMatrixRain() {
  if (!matrixCanvas) return;
  matrixCanvas.classList.add('active');

  const ctx = matrixCanvas.getContext('2d');
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;

  const columns = Math.floor(matrixCanvas.width / 14);
  const drops = new Array(columns).fill(1);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘ'.split('');

  let frameCount = 0;
  const maxFrames = 180; // ~3 seconds at 60fps

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    ctx.fillStyle = '#0F0';
    ctx.font = '14px monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * 14, drops[i] * 14);
      if (drops[i] * 14 > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    frameCount++;
    if (frameCount < maxFrames) {
      requestAnimationFrame(draw);
    } else {
      matrixCanvas.classList.remove('active');
      ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }
  }

  draw();
}

// ============================================================
// 16. FOOTER JOKE ROTATION
// ============================================================
const jokes = [
  '"There are only two hard things in Computer Science: cache invalidation, naming things, and off-by-one errors."',
  '"A SQL query walks into a bar, sees two tables, and asks: \'Can I JOIN you?\'"',
  '"!false — it\'s funny because it\'s true."',
  '"Debugging is being the detective in a crime movie where you are also the murderer."',
  '"It works on my machine. ¯\\_(ツ)_/¯"',
  '"// TODO: write better jokes"',
  '"99 little bugs in the code. 99 little bugs. Take one down, patch it around... 127 little bugs in the code."',
  '"I don\'t always test my code, but when I do, I do it in production."',
  '"The best thing about a boolean is that even if you\'re wrong, you\'re only off by a bit."',
  '"Quantum Cryptography: where checking if anyone is listening changes what they\'re saying."',
  '"My pointer is so wild, even Valgrind is afraid to look at it."',
  '"OCaml: because \'write once, debug never\' is actually a thing (unlike Java)."',
  '"Kafka is great if you want to turn your CPU into a room heater."',
  '"I told a joke about UDP, but I\'m not sure if anyone got it."',
  '"What do you call a group of 8 Hobbits? A Hobbit."',
  '"There are 10 types of people in the world: those who understand binary, and those who don\'t."',
  '"A TCP packet walks into a bar. \'I\'d like a beer.\' \'You want a beer?\' \'Yes, a beer.\'"'
];

let jokeIndex = 0;

function nextJoke() {
  const jokeEl = document.getElementById('joke-text');
  if (!jokeEl) return;
  jokeEl.style.opacity = '0';
  setTimeout(() => {
    jokeIndex = (jokeIndex + 1) % jokes.length;
    jokeEl.textContent = jokes[jokeIndex];
    jokeEl.style.opacity = '1';
  }, 300);
}

// ============================================================
// 17. TIME-AWARE GREETING
// ============================================================
function setTimeGreeting() {
  const label = document.getElementById('hero-time-label');
  if (!label) return;

  const hour = new Date().getHours();
  let greeting;

  if (hour >= 0 && hour < 5) {
    greeting = '// 3am debugging session';
  } else if (hour >= 5 && hour < 8) {
    greeting = '// early bird catches the bug';
  } else if (hour >= 8 && hour < 12) {
    greeting = '// morning code & coffee';
  } else if (hour >= 12 && hour < 14) {
    greeting = '// lunch break scrolling';
  } else if (hour >= 14 && hour < 18) {
    greeting = '// afternoon deep work';
  } else if (hour >= 18 && hour < 21) {
    greeting = '// evening hacking session';
  } else {
    greeting = '// night owl mode activated';
  }

  label.textContent = greeting;
}

// ============================================================
// 18. IDLE GLITCH EFFECT
// ============================================================
let idleTimer = null;

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (html.getAttribute('data-theme') !== 'dark') return;
    const heroName = document.querySelector('.d-hero-name');
    if (heroName) {
      heroName.classList.add('glitch-active');
      setTimeout(() => heroName.classList.remove('glitch-active'), 600);
    }
  }, 30000); // 30 seconds idle
}

['mousemove', 'keydown', 'scroll', 'click'].forEach(evt => {
  document.addEventListener(evt, resetIdleTimer, { passive: true });
});

// ============================================================
// 19. INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initRevealObserver();
  setTimeGreeting();
  resetIdleTimer();

  // Set initial toggle state
  if (html.getAttribute('data-theme') === 'dark') {
    initDark();
    if (toggleLabel) toggleLabel.textContent = 'light mode';
    if (toggleIcon) toggleIcon.textContent = '☀';
  } else {
    if (toggleLabel) toggleLabel.textContent = 'dark mode';
    if (toggleIcon) toggleIcon.textContent = '☽';
  }

  // Fetch GitHub data after page loads
  setTimeout(fetchGitHubData, 500);

  // Initial joke
  const jokeEl = document.getElementById('joke-text');
  if (jokeEl) jokeEl.textContent = jokes[0];
});

// Make toggleMode and nextJoke available globally (called from onclick)
window.toggleMode = toggleMode;
window.nextJoke = nextJoke;
