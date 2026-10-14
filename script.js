const COUPLE_EMAIL = 'jt.raobelina@gmail.com';
const TARGET = new Date('2026-11-29T09:30:00+03:00').getTime();

const opening = document.getElementById('opening');
const site    = document.getElementById('site');

// Étape 1 — l'accueil est un visuel floral plein écran.
// Un clic suffit pour l'instant à révéler le site derrière, en attendant
// la vraie interaction d'ouverture.
function dismissOpening(){
  if (opening.classList.contains('gone')) return;
  site.setAttribute('aria-hidden','false');
  site.classList.add('visible');
  opening.classList.add('gone');
  document.body.style.overflow = 'auto';
}
opening.addEventListener('click', dismissOpening);
document.body.style.overflow = 'hidden';

const cdEls = {
  days:    document.querySelector('[data-k="days"]'),
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
  cdEls.days.textContent    = d;
  cdEls.hours.textContent   = pad(h);
  cdEls.minutes.textContent = pad(m);
  cdEls.seconds.textContent = pad(s);
}
tick();
setInterval(tick, 1000);

const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');

// Crée un backdrop pour fermer en cliquant à côté
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

const tabs = document.querySelectorAll('.tabbar .tab');
const sections = Array.from(tabs).map(t => document.getElementById(t.dataset.section)).filter(Boolean);

tabs.forEach(t => {
  t.addEventListener('click', () => {
    t.classList.add('tap');
    setTimeout(() => t.classList.remove('tap'), 500);
  });
});

// Observer pour mettre à jour l'onglet actif selon le scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      const id = entry.target.id;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.section === id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
sections.forEach(s => io.observe(s));

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
