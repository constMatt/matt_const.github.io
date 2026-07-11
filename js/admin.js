/* ============================================================
   admin.js — secret login + content editor
   ------------------------------------------------------------
   IMPORTANT SECURITY NOTE (read this):
   GitHub Pages only serves static files — there is no server or
   database. This admin system is a client-side convenience so
   YOU can preview edits in your own browser (stored in
   localStorage) and export them. It is NOT a secure login system:
   anyone who inspects the page's JavaScript could bypass it. Do
   not use this to gate anything truly sensitive. Real persistence
   for all visitors only happens when you export content-data.js
   and push it to GitHub.
   ============================================================ */

const ADMIN_HASH_KEY = 'adminPassHash';
const ADMIN_SESSION_KEY = 'adminLoggedIn';
const CONTENT_KEY = 'portfolioContent';

// ---- tiny SHA-256 helper (Web Crypto) ----
async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function isLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

// ============================================================
// SECRET TRIGGERS
// ============================================================
function initSecretTriggers() {
  // Trigger 1: click the footer dot 5x quickly
  const secretDot = document.getElementById('footerSecret');
  let clicks = 0, clickTimer = null;
  secretDot.addEventListener('click', () => {
    clicks++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clicks = 0; }, 1500);
    if (clicks >= 5) {
      clicks = 0;
      openAdminModal();
    }
  });

  // Trigger 2: keyboard shortcut Ctrl+Shift+L
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
      e.preventDefault();
      openAdminModal();
    }
  });
}

// ============================================================
// LOGIN MODAL
// ============================================================
function openAdminModal() {
  if (isLoggedIn()) {
    showAdminBar();
    return;
  }
  const modal = document.getElementById('adminModal');
  const hasHash = !!localStorage.getItem(ADMIN_HASH_KEY);
  document.getElementById('adminSetupView').classList.toggle('hidden', hasHash);
  document.getElementById('adminLoginView').classList.toggle('hidden', !hasHash);
  document.getElementById('setupError').textContent = '';
  document.getElementById('loginError').textContent = '';
  modal.classList.remove('hidden');
  const firstInput = modal.querySelector('input:not(.hidden)');
  setTimeout(() => { if (firstInput) firstInput.focus(); }, 100);
}
function closeAdminModal() {
  document.getElementById('adminModal').classList.add('hidden');
  document.getElementById('setupPass1').value = '';
  document.getElementById('setupPass2').value = '';
  document.getElementById('loginPass').value = '';
}

function initAdminModal() {
  document.getElementById('adminModalClose').addEventListener('click', closeAdminModal);
  document.getElementById('adminModal').addEventListener('click', (e) => {
    if (e.target.id === 'adminModal') closeAdminModal();
  });

  document.getElementById('setupSubmit').addEventListener('click', async () => {
    const p1 = document.getElementById('setupPass1').value;
    const p2 = document.getElementById('setupPass2').value;
    const errEl = document.getElementById('setupError');
    if (p1.length < 4) { errEl.textContent = 'Password must be at least 4 characters.'; return; }
    if (p1 !== p2) { errEl.textContent = "Passwords don't match."; return; }
    const hash = await sha256(p1);
    localStorage.setItem(ADMIN_HASH_KEY, hash);
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    closeAdminModal();
    showAdminBar();
    showToast('Password set. Edit mode unlocked.');
  });

  document.getElementById('loginSubmit').addEventListener('click', async () => {
    const pass = document.getElementById('loginPass').value;
    const errEl = document.getElementById('loginError');
    const storedHash = localStorage.getItem(ADMIN_HASH_KEY);
    const hash = await sha256(pass);
    if (hash === storedHash) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      closeAdminModal();
      showAdminBar();
      showToast('Welcome back. Edit mode unlocked.');
    } else {
      errEl.textContent = 'Incorrect password.';
    }
  });

  document.getElementById('loginPass').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('loginSubmit').click();
  });
  document.getElementById('setupPass2').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('setupSubmit').click();
  });

  document.getElementById('resetPassBtn').addEventListener('click', () => {
    if (confirm('This will remove the saved password on this browser so you can set a new one. Continue?')) {
      localStorage.removeItem(ADMIN_HASH_KEY);
      document.getElementById('adminSetupView').classList.remove('hidden');
      document.getElementById('adminLoginView').classList.add('hidden');
    }
  });
}

// ============================================================
// ADMIN BAR
// ============================================================
function showAdminBar() {
  document.getElementById('adminBar').classList.remove('hidden');
}
function hideAdminBar() {
  document.getElementById('adminBar').classList.add('hidden');
  document.getElementById('editDrawer').classList.add('hidden');
}

function initAdminBar() {
  document.getElementById('btnLogout').addEventListener('click', () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    hideAdminBar();
    showToast('Logged out.');
  });

  document.getElementById('btnEditContent').addEventListener('click', () => {
    buildEditForm();
    document.getElementById('editDrawer').classList.remove('hidden');
  });
  document.getElementById('editDrawerClose').addEventListener('click', () => {
    document.getElementById('editDrawer').classList.add('hidden');
  });

  document.getElementById('btnResetContent').addEventListener('click', () => {
    if (confirm('Reset all content back to the default values in content-data.js? This clears your local edits.')) {
      localStorage.removeItem(CONTENT_KEY);
      window.__rerenderPortfolio();
      showToast('Content reset to default.');
    }
  });

  document.getElementById('btnExportJson').addEventListener('click', exportContentFile);

  document.getElementById('saveContentBtn').addEventListener('click', saveEditForm);
}

// ============================================================
// EDIT FORM BUILDER
// ============================================================
function buildEditForm() {
  const content = JSON.parse(JSON.stringify(window.__getCurrentContent()));
  const body = document.getElementById('editDrawerBody');
  body.innerHTML = '';
  body.dataset.working = JSON.stringify(content);

  body.appendChild(block('Hero', `
    <div class="edit-field"><label>Name</label><input data-path="hero.name" value="${attr(content.hero.name)}"></div>
    <div class="edit-field"><label>Titles (one per line, will type-loop)</label><textarea data-path="hero.titles" rows="3">${esc((content.hero.titles || []).join('\n'))}</textarea></div>
    <div class="edit-field"><label>Tagline</label><textarea data-path="hero.tagline" rows="2">${esc(content.hero.tagline)}</textarea></div>
  `));

  body.appendChild(block('About', `
    <div class="edit-field"><label>About text</label><textarea data-path="about.text" rows="4">${esc(content.about.text)}</textarea></div>
    <div class="edit-field"><label>Terminal JSON snippet (raw)</label><textarea data-path="about.jsonRaw" rows="5">${esc(JSON.stringify(content.about.json, null, 2))}</textarea></div>
  `));

  // Stats (fixed 3 slots to match layout)
  const statsHtml = (content.about.stats || []).map((s, i) => `
    <div class="edit-repeat-item">
      <div class="edit-field"><label>Label</label><input data-path="about.stats.${i}.label" value="${attr(s.label)}"></div>
      <div class="edit-field"><label>Value</label><input type="number" data-path="about.stats.${i}.value" value="${attr(s.value)}"></div>
    </div>`).join('');
  body.appendChild(block('About Stats (keep 3 for layout)', statsHtml));

  // Skills (repeatable)
  const skillsHtml = (content.skills || []).map((s, i) => `
    <div class="edit-repeat-item" data-skill-item>
      <span class="edit-remove" data-remove="skills.${i}">&times;</span>
      <div class="edit-field"><label>Skill name</label><input data-path="skills.${i}.name" value="${attr(s.name)}"></div>
      <div class="edit-field"><label>Level (0-100)</label><input type="number" min="0" max="100" data-path="skills.${i}.level" value="${attr(s.level)}"></div>
    </div>`).join('');
  const skillsBlock = block('Skills', skillsHtml + `<button class="edit-add-btn" data-add="skills">+ Add skill</button>`);
  body.appendChild(skillsBlock);

  // Projects (repeatable)
  const projectsHtml = (content.projects || []).map((p, i) => `
    <div class="edit-repeat-item" data-project-item>
      <span class="edit-remove" data-remove="projects.${i}">&times;</span>
      <div class="edit-field"><label>Title</label><input data-path="projects.${i}.title" value="${attr(p.title)}"></div>
      <div class="edit-field"><label>Description</label><textarea rows="2" data-path="projects.${i}.description">${esc(p.description)}</textarea></div>
      <div class="edit-field"><label>Tech (comma separated)</label><input data-path="projects.${i}.techRaw" value="${attr((p.tech || []).join(', '))}"></div>
      <div class="edit-field"><label>GitHub link</label><input data-path="projects.${i}.github" value="${attr(p.github)}"></div>
      <div class="edit-field"><label>Live demo link</label><input data-path="projects.${i}.live" value="${attr(p.live)}"></div>
    </div>`).join('');
  const projectsBlock = block('Projects', projectsHtml + `<button class="edit-add-btn" data-add="projects">+ Add project</button>`);
  body.appendChild(projectsBlock);

  // Timeline (repeatable)
  const timelineHtml = (content.timeline || []).map((t, i) => `
    <div class="edit-repeat-item" data-timeline-item>
      <span class="edit-remove" data-remove="timeline.${i}">&times;</span>
      <div class="edit-field"><label>Type (education / experience)</label><input data-path="timeline.${i}.type" value="${attr(t.type)}"></div>
      <div class="edit-field"><label>Role / Degree</label><input data-path="timeline.${i}.role" value="${attr(t.role)}"></div>
      <div class="edit-field"><label>Organization / School</label><input data-path="timeline.${i}.org" value="${attr(t.org)}"></div>
      <div class="edit-field"><label>Period</label><input data-path="timeline.${i}.period" value="${attr(t.period)}"></div>
      <div class="edit-field"><label>Description</label><textarea rows="2" data-path="timeline.${i}.description">${esc(t.description)}</textarea></div>
    </div>`).join('');
  const timelineBlock = block('Journey (Experience / Education)', timelineHtml + `<button class="edit-add-btn" data-add="timeline">+ Add entry</button>`);
  body.appendChild(timelineBlock);

  body.appendChild(block('Contact', `
    <div class="edit-field"><label>Email</label><input data-path="contact.email" value="${attr(content.contact.email)}"></div>
    <div class="edit-field"><label>GitHub URL</label><input data-path="contact.github" value="${attr(content.contact.github)}"></div>
    <div class="edit-field"><label>LinkedIn URL</label><input data-path="contact.linkedin" value="${attr(content.contact.linkedin)}"></div>
  `));

  // add/remove handlers
  body.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-add');
      const working = getWorkingContent(body);
      if (key === 'skills') working.skills.push({ name: 'New Skill', level: 50 });
      if (key === 'projects') working.projects.push({ title: 'New Project', description: 'Description here.', tech: [], github: '#', live: '#' });
      if (key === 'timeline') working.timeline.push({ type: 'experience', role: 'Role', org: 'Organization', period: 'Year', description: 'Description here.' });
      body.dataset.working = JSON.stringify(working);
      buildEditFormFromWorking(working);
    });
  });
  body.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [key, idx] = btn.getAttribute('data-remove').split('.');
      const working = getWorkingContent(body);
      working[key].splice(parseInt(idx, 10), 1);
      body.dataset.working = JSON.stringify(working);
      buildEditFormFromWorking(working);
    });
  });
}

function buildEditFormFromWorking(working) {
  localStorage.setItem('__tempWorking', JSON.stringify(working));
  const originalGetter = window.__getCurrentContent;
  window.__getCurrentContent = () => working;
  buildEditForm();
  window.__getCurrentContent = originalGetter;
}

function getWorkingContent(body) {
  // Rebuild latest values from inputs into the stored working object before mutating arrays
  const working = collectFormValues(body);
  return working;
}

function block(title, innerHtml) {
  const div = document.createElement('div');
  div.className = 'edit-block';
  div.innerHTML = `<h4>${esc(title)}</h4>${innerHtml}`;
  return div;
}
function esc(v) { return (v === undefined || v === null) ? '' : String(v).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])); }
function attr(v) { return esc(v).replace(/"/g, '&quot;'); }

// ============================================================
// FORM -> CONTENT OBJECT
// ============================================================
function collectFormValues(body) {
  const base = JSON.parse(body.dataset.working);
  body.querySelectorAll('[data-path]').forEach(input => {
    const path = input.getAttribute('data-path');
    let value = input.value;
    setByPath(base, path, value);
  });

  // post-process special raw fields
  if (typeof base.hero.titles === 'string') {
    base.hero.titles = base.hero.titles.split('\n').map(s => s.trim()).filter(Boolean);
  }
  if (base.about.jsonRaw !== undefined) {
    try { base.about.json = JSON.parse(base.about.jsonRaw); } catch (e) { /* keep old json if invalid */ }
    delete base.about.jsonRaw;
  }
  (base.projects || []).forEach(p => {
    if (typeof p.techRaw === 'string') {
      p.tech = p.techRaw.split(',').map(s => s.trim()).filter(Boolean);
      delete p.techRaw;
    }
  });
  (base.about.stats || []).forEach(s => { s.value = parseInt(s.value, 10) || 0; });
  (base.skills || []).forEach(s => { s.level = Math.max(0, Math.min(100, parseInt(s.level, 10) || 0)); });

  return base;
}

function setByPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = isNaN(parts[i]) ? parts[i] : parseInt(parts[i], 10);
    if (cur[key] === undefined) cur[key] = isNaN(parts[i + 1]) ? {} : [];
    cur = cur[key];
  }
  const lastKey = isNaN(parts[parts.length - 1]) ? parts[parts.length - 1] : parseInt(parts[parts.length - 1], 10);
  cur[lastKey] = value;
}

// ============================================================
// SAVE / EXPORT
// ============================================================
function saveEditForm() {
  const body = document.getElementById('editDrawerBody');
  const finalContent = collectFormValues(body);
  localStorage.setItem(CONTENT_KEY, JSON.stringify(finalContent));
  window.__rerenderPortfolio();
  showToast('Saved! (stored in this browser)');
  document.getElementById('editDrawer').classList.add('hidden');
}

function exportContentFile() {
  const content = window.__getCurrentContent();
  const fileText = `/*
  content-data.js
  ----------------
  Exported from the Admin panel on ${new Date().toLocaleString()}.
  Replace your existing js/content-data.js with this file and push
  to GitHub to make these changes permanent for every visitor.
*/

const DEFAULT_CONTENT = ${JSON.stringify(content, null, 2)};

if (typeof module !== "undefined" && module.exports) {
  module.exports = DEFAULT_CONTENT;
}
`;
  const blob = new Blob([fileText], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'content-data.js';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Exported content-data.js — replace it in your project & push to GitHub.');
}

// ============================================================
// TOAST
// ============================================================
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3200);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initSecretTriggers();
  initAdminModal();
  initAdminBar();
  if (isLoggedIn()) showAdminBar();
});
