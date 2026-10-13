const COUPLE_EMAIL = 'jt.raobelina@gmail.com';
const TARGET = new Date('2026-11-29T09:30:00+03:00').getTime();

const curtain  = document.getElementById('curtainStage');
const openBtn  = document.getElementById('openBtn');
const opening  = document.getElementById('opening');
const site     = document.getElementById('site');

(function makePleats(){
  const N = 8;
  curtain.querySelectorAll('.curtain').forEach(panel => {
    const first = panel.firstChild;
    for (let i = 0; i < N; i++){
      const p = document.createElement('div');
      p.className = 'pleat';
      p.style.setProperty('--i', i);
      panel.insertBefore(p, first);
    }
  });
})();

function openCurtain(){
  if (curtain.classList.contains('opening-anim')) return;
  curtain.classList.add('opening-anim');

  setTimeout(() => {
    site.setAttribute('aria-hidden','false');
    site.classList.add('visible');
  }, 950);

  setTimeout(() => {
    opening.classList.add('gone');
    document.body.style.overflow = 'auto';
  }, 2500);
}
openBtn.addEventListener('click', openCurtain);
document.body.style.overflow = 'hidden';

/* =========================================================
   COMPTE À REBOURS — jours en gros + h/m/s en grille
   ========================================================= */
const cdBig = document.getElementById('cdDays');
const cdEls = {
  hours:   document.querySelector('[data-k="hours"]'),
  minutes: document.querySelector('[data-k="minutes"]'),
  seconds: document.querySelector('[data-k="seconds"]'),
};
function pad(n){ return String(n).padStart(2,'0'); }
function tick(){
  const diff = Math.max(0, TARGET - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (cdBig) cdBig.textContent = d;
  if (cdEls.hours)   cdEls.hours.textContent   = pad(h);
  if (cdEls.minutes) cdEls.minutes.textContent = pad(m);
  if (cdEls.seconds) cdEls.seconds.textContent = pad(s);
}
tick();
setInterval(tick, 1000);

/* =========================================================
   DRAWER
   ========================================================= */
const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');

const backdrop = document.createElement('div');
backdrop.className = 'drawer-backdrop';
document.body.appendChild(backdrop);

function openDrawer(){
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
  backdrop.classList.add('show');
}
function closeDrawer(){
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden','true');
  backdrop.classList.remove('show');
}
burger.addEventListener('click', (e) => {
  e.stopPropagation();
  drawer.classList.contains('open') ? closeDrawer() : openDrawer();
});
backdrop.addEventListener('click', closeDrawer);
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

/* =========================================================
   SMOOTH SCROLL — ancres et "scroll-next"
   ========================================================= */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length <= 1) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior:'smooth', block:'start' });
  });
});

/* =========================================================
   APPARITION DES SCÈNES AU SCROLL (IntersectionObserver)
   ========================================================= */
const scenes = document.querySelectorAll('.scene');
const sceneIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('in-view');
    } else {
      // Replay à chaque entrée dans le viewport pour un effet immersif
      if (entry.boundingClientRect.top > 0){
        entry.target.classList.remove('in-view');
      }
    }
  });
}, { threshold: 0.18 });
scenes.forEach(s => sceneIO.observe(s));

/* =========================================================
   TABBAR actif selon le scroll
   ========================================================= */
const tabs = document.querySelectorAll('.tabbar .tab');
const tabSections = Array.from(tabs).map(t => document.getElementById(t.dataset.section)).filter(Boolean);

tabs.forEach(t => {
  t.addEventListener('click', () => {
    t.classList.add('tap');
    setTimeout(() => t.classList.remove('tap'), 500);
  });
});

const tabIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      const id = entry.target.id;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.section === id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
tabSections.forEach(s => tabIO.observe(s));

/* =========================================================
   JEU
   ========================================================= */
document.querySelectorAll('.choices').forEach(group => {
  group.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    group.querySelectorAll('button').forEach(b => b.classList.remove('picked'));
    btn.classList.add('picked');
    try { localStorage.setItem('quiz_' + btn.dataset.pair, btn.dataset.pick); } catch {}
  });
});
document.querySelectorAll('.choices button').forEach(b => {
  try {
    const saved = localStorage.getItem('quiz_' + b.dataset.pair);
    if (saved && saved === b.dataset.pick) b.classList.add('picked');
  } catch {}
});

const quizForm = document.getElementById('quizForm');
const quizOk = document.getElementById('quizOk');
const QUIZ_QUESTIONS = {
  q1: 'Qui a dit « Je t\'aime » en premier ?',
  q2: 'Qui est le meilleur cuisinier ?',
  q3: 'Qui raconte toujours les blagues ?',
  q4: 'Qui met le plus de temps à se préparer ?',
  q5: 'Qui est le plus gros dormeur ?',
};
quizForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = (quizForm.elements['name'].value || 'Un invité anonyme').trim();
  const picks = {};
  document.querySelectorAll('.choices button.picked').forEach(b => { picks[b.dataset.pair] = b.dataset.pick; });

  let body = `Réponses au jeu « Mariée ou Marié ? »\n\nDe : ${name}\n\n`;
  Object.keys(QUIZ_QUESTIONS).forEach(k => {
    const p = picks[k];
    const ans = p === 'b' ? 'Mariée' : p === 'g' ? 'Marié' : '— (sans réponse)';
    body += `• ${QUIZ_QUESTIONS[k]}\n  → ${ans}\n\n`;
  });

  const subject = `Jeu Mariée ou Marié — ${name}`;
  window.location.href = `mailto:${COUPLE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  try { localStorage.setItem('quiz_submission_' + Date.now(), JSON.stringify({name, picks})); } catch {}
  quizOk.hidden = false;
  setTimeout(() => { quizOk.hidden = true; }, 5000);
});

/* =========================================================
   RSVP
   ========================================================= */
const rsvp = document.getElementById('rsvpForm');
const rsvpOk = document.getElementById('rsvpOk');
rsvp.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(rsvp).entries());

  const attendTxt = data.attend === 'yes' ? 'Oui, avec joie'
                  : data.attend === 'no'  ? 'Malheureusement non'
                  : '—';

  const body =
`Nouvelle confirmation RSVP

Nom : ${data.name}
Présence : ${attendTxt}
Nombre d'invités : ${data.guests}

Message :
${data.message || '—'}
`;

  const subject = `RSVP mariage — ${data.name}`;
  window.location.href = `mailto:${COUPLE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  try { localStorage.setItem('rsvp_' + Date.now(), JSON.stringify(data)); } catch {}
  rsvp.reset();
  rsvpOk.hidden = false;
  setTimeout(() => { rsvpOk.hidden = true; }, 5000);
});
