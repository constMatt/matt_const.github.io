/* ============================================================
   main.js — content rendering + animations
   ============================================================ */

// ---- Content resolution: localStorage override > default file ----
function getContent() {
  try {
    const saved = localStorage.getItem('portfolioContent');
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore parse errors, fall back to default */ }
  return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
}

let CONTENT = getContent();

// ============================================================
// RENDER FUNCTIONS
// ============================================================
function renderAll() {
  renderHero();
  renderAbout();
  renderSkills();
  renderProjects();
  renderTimeline();
  renderContact();
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('footerName').textContent = CONTENT.hero.name;
  document.getElementById('logoName').textContent = (CONTENT.hero.name.split(' ')[0] || 'dev').toLowerCase();
}

function renderHero() {
  document.getElementById('heroName').textContent = CONTENT.hero.name;
  document.getElementById('heroTagline').textContent = CONTENT.hero.tagline;
  startTypingLoop(CONTENT.hero.titles && CONTENT.hero.titles.length ? CONTENT.hero.titles : ['Developer']);
}

function renderAbout() {
  document.getElementById('aboutText').textContent = CONTENT.about.text;
  document.getElementById('aboutJson').textContent = JSON.stringify(CONTENT.about.json, null, 2);
  const statsEls = document.querySelectorAll('.stat-num');
  const stats = CONTENT.about.stats || [];
  const statLabels = document.querySelectorAll('.stat-label');
  stats.forEach((s, i) => {
    if (statsEls[i]) statsEls[i].setAttribute('data-count', s.value);
    if (statLabels[i]) statLabels[i].textContent = s.label;
  });
}

function renderSkills() {
  const grid = document.getElementById('skillsGrid');
  grid.innerHTML = '';
  (CONTENT.skills || []).forEach(skill => {
    const card = document.createElement('div');
    card.className = 'skill-card reveal';
    card.innerHTML = `
      <div class="skill-head">
        <span class="skill-name">${escapeHtml(skill.name)}</span>
        <span class="skill-pct">${skill.level}%</span>
      </div>
      <div class="skill-bar-track"><div class="skill-bar-fill" data-level="${skill.level}"></div></div>
    `;
    grid.appendChild(card);
  });
  observeReveal();
}

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';
  (CONTENT.projects || []).forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'project-card reveal';
    card.innerHTML = `
      <div class="project-top">
        <div class="project-icon">${String(i + 1).padStart(2, '0')}</div>
        <div class="project-links">
          ${p.github ? `<a href="${escapeAttr(p.github)}" target="_blank" rel="noopener" title="GitHub">⌥</a>` : ''}
          ${p.live ? `<a href="${escapeAttr(p.live)}" target="_blank" rel="noopener" title="Live demo">↗</a>` : ''}
        </div>
      </div>
      <h3 class="project-title">${escapeHtml(p.title)}</h3>
      <p class="project-desc">${escapeHtml(p.description)}</p>
      <div class="project-tech">
        ${(p.tech || []).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
      </div>
    `;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
    grid.appendChild(card);
  });
  observeReveal();
}

function renderTimeline() {
  const list = document.getElementById('timelineList');
  list.innerHTML = '';
  (CONTENT.timeline || []).forEach(item => {
    const el = document.createElement('div');
    el.className = 'timeline-item reveal';
    el.innerHTML = `
      <div class="timeline-dot"></div>
      <span class="timeline-period">${escapeHtml(item.period)}</span>
      <span class="timeline-type">${escapeHtml(item.type || '')}</span>
      <h3 class="timeline-role">${escapeHtml(item.role)}</h3>
      <p class="timeline-org">${escapeHtml(item.org)}</p>
      <p class="timeline-desc">${escapeHtml(item.description)}</p>
    `;
    list.appendChild(el);
  });
  observeReveal();
}

function renderContact() {
  const c = CONTENT.contact || {};
  const emailEl = document.getElementById('contactEmail');
  const githubEl = document.getElementById('contactGithub');
  const linkedinEl = document.getElementById('contactLinkedin');
  emailEl.href = 'mailto:' + (c.email || '');
  document.getElementById('contactEmailText').textContent = c.email || '';
  githubEl.href = c.github || '#';
  document.getElementById('contactGithubText').textContent = (c.github || '').replace(/^https?:\/\//, '');
  linkedinEl.href = c.linkedin || '#';
  document.getElementById('contactLinkedinText').textContent = (c.linkedin || '').replace(/^https?:\/\//, '');
}

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function escapeAttr(str) { return escapeHtml(str); }

// ============================================================
// TYPING EFFECT (hero title loop)
// ============================================================
let typingTimer = null;
function startTypingLoop(words) {
  const el = document.getElementById('typedTitle');
  if (typingTimer) clearTimeout(typingTimer);
  let wordIndex = 0, charIndex = 0, deleting = false;

  function tick() {
    const current = words[wordIndex % words.length];
    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        typingTimer = setTimeout(tick, 1600);
        return;
      }
      typingTimer = setTimeout(tick, 55);
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        wordIndex++;
        typingTimer = setTimeout(tick, 300);
        return;
      }
      typingTimer = setTimeout(tick, 30);
    }
  }
  tick();
}

// ============================================================
// LOADER (boot sequence)
// ============================================================
function runLoader() {
  const loaderText = document.getElementById('loaderText');
  const loader = document.getElementById('loader');
  const msg = 'loading portfolio...';
  let i = 0;
  const interval = setInterval(() => {
    loaderText.textContent = msg.slice(0, i);
    i++;
    if (i > msg.length) {
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('hide');
        setTimeout(() => loader.remove(), 700);
      }, 350);
    }
  }, 35);
}

// ============================================================
// SCROLL REVEAL
// ============================================================
let revealObserver = null;
function observeReveal() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.classList.contains('skill-card')) {
            const fill = entry.target.querySelector('.skill-bar-fill');
            if (fill) fill.style.width = fill.getAttribute('data-level') + '%';
          }
          if (entry.target.querySelector && entry.target.querySelector('.stat-num')) {
            animateStats();
          }
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
  }
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
}

function animateStats() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    let current = 0;
    const duration = 1200;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = target / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current);
    }, stepTime);
  });
}

// ============================================================
// NAV: scroll state + mobile toggle
// ============================================================
function initNav() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ============================================================
// CURSOR GLOW
// ============================================================
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch
  document.addEventListener('mousemove', (e) => {
    glow.style.opacity = '1';
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
}

// ============================================================
// BACKGROUND CANVAS: circuit / network particles
// ============================================================
function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  function initParticles() {
    const count = Math.min(90, Math.floor((w * h) / 18000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6
    }));
  }
  function step() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.strokeStyle = `rgba(255,30,60,${(1 - dist / 140) * 0.16})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,77,99,0.55)';
      ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(step);
  }
  resize();
  initParticles();
  window.addEventListener('resize', () => { resize(); initParticles(); });
  step();
  if (reduceMotion) { step(); } // draw a single static frame only
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  runLoader();
  renderAll();
  initNav();
  initCursorGlow();
  initBgCanvas();
  observeReveal();

  // Re-render hook used by admin.js after content changes
  window.__rerenderPortfolio = function () {
    CONTENT = getContent();
    renderAll();
    observeReveal();
  };
  window.__getCurrentContent = function () { return CONTENT; };
});
