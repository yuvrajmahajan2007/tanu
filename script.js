/* ==========================================================
   UTILITIES
========================================================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function typeText(el, text, speed = 45) {
  return new Promise((resolve) => {
    if (reduceMotion) { el.textContent = text; resolve(); return; }
    el.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor-blink';
    let i = 0;
    function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        el.appendChild(cursor);
        i++;
        setTimeout(step, speed);
      } else {
        cursor.remove();
        resolve();
      }
    }
    step();
  });
}

/* ==========================================================
   IMAGE FALLBACK (until real photos are added to assets/images/)
========================================================== */
$$('img').forEach((img) => {
  img.addEventListener('error', () => {
    img.classList.add('img-missing');
    const label = document.createElement('div');
    label.className = 'img-missing-label';
    label.textContent = 'फोटो इथे टाका — ' + img.getAttribute('src').split('/').pop();
    img.parentElement.style.position = img.parentElement.style.position || 'relative';
    img.parentElement.appendChild(label);
  }, { once: true });
});

/* ==========================================================
   NIGHT SKY CANVAS (stars + shooting stars)
========================================================== */
const skyCanvas = $('#sky-canvas');
const skyCtx = skyCanvas.getContext('2d');
let stars = [];
let shootingStars = [];

function resizeSky() {
  skyCanvas.width = window.innerWidth;
  skyCanvas.height = document.documentElement.scrollHeight;
}

function initStars() {
  stars = [];
  const count = Math.min(220, Math.floor((window.innerWidth * window.innerHeight) / 6000));
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * skyCanvas.width,
      y: Math.random() * skyCanvas.height,
      r: Math.random() * 1.4 + 0.3,
      baseAlpha: Math.random() * 0.6 + 0.25,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    });
  }
}

function maybeSpawnShootingStar() {
  if (Math.random() < 0.003 && shootingStars.length < 2) {
    const startX = Math.random() * skyCanvas.width * 0.6 + skyCanvas.width * 0.2;
    const startY = Math.random() * (window.innerHeight * 0.3);
    shootingStars.push({ x: startX, y: startY, len: 0, life: 0, maxLife: 60 + Math.random() * 30 });
  }
}

function drawSky() {
  skyCtx.clearRect(0, 0, skyCanvas.width, skyCanvas.height);
  const t = Date.now() * 0.001;
  stars.forEach((s) => {
    const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed * 60 + s.phase) * 0.25;
    skyCtx.beginPath();
    skyCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    skyCtx.fillStyle = `rgba(255,255,255,${Math.max(0, alpha)})`;
    skyCtx.fill();
  });

  if (!reduceMotion) {
    maybeSpawnShootingStar();
    shootingStars.forEach((sh) => {
      sh.life++;
      sh.x += 4.5;
      sh.y += 2.2;
      sh.len = Math.min(90, sh.len + 6);
      const fade = 1 - sh.life / sh.maxLife;
      skyCtx.beginPath();
      const grad = skyCtx.createLinearGradient(sh.x, sh.y, sh.x - sh.len, sh.y - sh.len * 0.5);
      grad.addColorStop(0, `rgba(255,255,255,${fade})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      skyCtx.strokeStyle = grad;
      skyCtx.lineWidth = 2;
      skyCtx.moveTo(sh.x, sh.y);
      skyCtx.lineTo(sh.x - sh.len, sh.y - sh.len * 0.5);
      skyCtx.stroke();
    });
    shootingStars = shootingStars.filter((sh) => sh.life < sh.maxLife);
  }

  requestAnimationFrame(drawSky);
}

resizeSky();
initStars();
drawSky();
window.addEventListener('resize', () => { resizeSky(); initStars(); });

/* ==========================================================
   FIREFLIES
========================================================== */
function spawnFireflies() {
  const layer = $('#firefly-layer');
  const count = window.innerWidth < 640 ? 8 : 16;
  for (let i = 0; i < count; i++) {
    const f = document.createElement('div');
    f.className = 'firefly';
    f.style.left = Math.random() * 100 + 'vw';
    f.style.top = Math.random() * 100 + 'vh';
    f.style.setProperty('--fx', (Math.random() * 60 - 30) + 'px');
    f.style.setProperty('--fy', (Math.random() * -60 - 20) + 'px');
    f.style.setProperty('--fx2', (Math.random() * 80 - 40) + 'px');
    f.style.setProperty('--fy2', (Math.random() * -120 - 40) + 'px');
    f.style.animationDuration = (8 + Math.random() * 10) + 's';
    f.style.animationDelay = (Math.random() * 8) + 's';
    layer.appendChild(f);
  }
}
if (!reduceMotion) spawnFireflies();

/* ==========================================================
   CURSOR GLOW + HEART TRAIL
========================================================== */
const cursorGlow = $('#cursor-glow');
let lastHeartTime = 0;

function moveCursorGlow(x, y) {
  cursorGlow.style.transform = `translate(${x}px, ${y}px)`;
  const now = Date.now();
  if (!reduceMotion && now - lastHeartTime > 220) {
    lastHeartTime = now;
    spawnTrailHeart(x, y);
  }
}
window.addEventListener('pointermove', (e) => moveCursorGlow(e.clientX, e.clientY));

function spawnTrailHeart(x, y) {
  const layer = $('#heart-trail-layer');
  const h = document.createElement('span');
  h.className = 'trail-heart';
  h.textContent = '❤';
  h.style.left = x + (Math.random() * 16 - 8) + 'px';
  h.style.top = y + (Math.random() * 16 - 8) + 'px';
  layer.appendChild(h);
  setTimeout(() => h.remove(), 1100);
}

/* ==========================================================
   LOADER SEQUENCE
========================================================== */
const loader = $('#loader');
const experience = $('#experience');
const loaderTypeEl = $('#loader-type');
let loaderDone = false;

async function runLoaderTyping() {
  await typeText(loaderTypeEl, 'थांब जरा...\nतुझ्यासाठी एक छोटंसं Surprise तयार आहे... ❤️', 42);
}
runLoaderTyping();

function dismissLoader() {
  if (loaderDone) return;
  loaderDone = true;
  loader.classList.add('hide');
  document.body.style.overflowY = 'auto';
  experience.hidden = false;

  // start music right here, inside the click gesture, so browsers allow autoplay
  const audio = $('#bg-audio');
  if (audio) {
    audio.play().then(() => {
      $('#icon-play').hidden = true;
      $('#icon-pause').hidden = false;
    }).catch(() => {
      // autoplay blocked (rare) — user can just tap the play button
    });
  }

  setTimeout(() => {
    loader.style.display = 'none';
    AOS.init({ duration: 900, once: true, easing: 'ease-out-cubic' });
    startNameTyping();
    initSectionObservers();
  }, 950);
}
loader.addEventListener('click', dismissLoader);
document.body.style.overflowY = 'hidden';

// wire up music controls right away so play() above has listeners ready
initMusicPlayer();

/* ==========================================================
   NAME TYPING (welcome section)
========================================================== */
function startNameTyping() {
  const el = $('#name-type');
  if (el && !el.dataset.typed) {
    el.dataset.typed = '1';
    typeText(el, 'Tanu', 160);
  }
}

$('#continue-btn').addEventListener('click', () => {
  $('#eyes').scrollIntoView({ behavior: 'smooth' });
});

/* ==========================================================
   SECTION DOT NAV
========================================================== */
function initSectionObservers() {
  const dots = $$('#section-dots span');
  const sections = dots.map((d) => $('#' + d.dataset.target)).filter(Boolean);

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      $('#' + dot.dataset.target).scrollIntoView({ behavior: 'smooth' });
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          dots.forEach((d) => d.classList.remove('active'));
          const match = dots.find((d) => d.dataset.target === entry.target.id);
          if (match) match.classList.add('active');
        }
      });
    },
    { threshold: 0.5 }
  );
  sections.forEach((s) => observer.observe(s));

  // trigger letter + words + finale behaviours
  initEnvelope();
  initSareeSlider();
  initWordsRotation();
  initFinale();
}

/* ==========================================================
   ENVELOPE / LETTER
========================================================== */
const LETTER_TEXT =
`प्रिय Tanu,

हे पत्र लिहिताना खरं तर शब्द कमी पडतायत,
पण तरीही मनातलं थोडं तरी सांगावंसं वाटतं.

तुझ्यासारखी मैत्रीण मिळणं
ही खरंच खूप छान गोष्ट आहे.
तुझं साधेपण, तुझी काळजी,
आणि तू ज्या पद्धतीने प्रत्येकाशी वागतेस,
ते खूप काही शिकवून जातं.

आयुष्यात अशी माणसं फार कमी असतात
ज्यांच्यासोबत बोलताना कसलाही विचार करावा लागत नाही.
तू त्यातलीच एक आहेस.

अशीच राहा, अशीच हसत राहा,
आणि आपली मैत्री अशीच कायम राहो.

Happy Friendship Day ❤️
— Yuvraj`;

function initEnvelope() {
  const envelope = $('#envelope');
  const hint = $('#envelope-hint');
  const letterTextEl = $('#letter-text');
  let opened = false;

  envelope.addEventListener('click', async () => {
    if (opened) return;
    opened = true;
    envelope.classList.add('open');
    hint.style.opacity = '0';
    await new Promise((r) => setTimeout(r, 700));
    await typeText(letterTextEl, LETTER_TEXT, 24);
  });
}

/* ==========================================================
   SAREE SLIDER
========================================================== */
function initSareeSlider() {
  const track = $('#saree-track');
  const slides = $$('.saree-slide', track);
  const dotsWrap = $('#saree-dots');
  const prevBtn = $('#saree-prev');
  const nextBtn = $('#saree-next');
  let index = 0;

  slides.forEach((_, i) => {
    const d = document.createElement('span');
    if (i === 0) d.classList.add('active');
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });
  const dots = $$('span', dotsWrap);

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle('active', di === index));
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));

  // swipe support
  let startX = 0;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // autoplay, pauses politely
  let autoplay = setInterval(() => goTo(index + 1), 5000);
  track.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.addEventListener('mouseleave', () => { autoplay = setInterval(() => goTo(index + 1), 5000); });
}

/* ==========================================================
   SPECIAL WORDS ROTATION
========================================================== */
function initWordsRotation() {
  const cards = $$('.word-card');
  let i = 0;
  setInterval(() => {
    cards[i].classList.remove('active');
    i = (i + 1) % cards.length;
    cards[i].classList.add('active');
  }, 2600);
}

/* ==========================================================
   MUSIC PLAYER
========================================================== */
function initMusicPlayer() {
  const audio = $('#bg-audio');
  const toggle = $('#music-toggle');
  const iconPlay = $('#icon-play');
  const iconPause = $('#icon-pause');
  const progress = $('#music-progress');
  const volume = $('#music-volume');

  audio.volume = 0.7;

  toggle.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      iconPlay.hidden = true;
      iconPause.hidden = false;
    } else {
      audio.pause();
      iconPlay.hidden = false;
      iconPause.hidden = true;
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) progress.value = (audio.currentTime / audio.duration) * 100;
  });
  progress.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration;
  });
  volume.addEventListener('input', () => { audio.volume = volume.value / 100; });

  audio.addEventListener('ended', () => {
    iconPlay.hidden = false;
    iconPause.hidden = true;
  });
}

/* ==========================================================
   FINALE
========================================================== */
function initFinale() {
  const finale = $('#finale');
  const textEl = $('#finale-text');
  const subEl = $('#finale-sub');
  let played = false;

  const FINALE_TEXT =
`मैत्री म्हणजे
फक्त बोलणं नाही...

ती जपलेली आठवण असते.

तुझ्यासारखी सखी
आयुष्यात असणं
ही माझ्यासाठी
मोठी गोष्ट आहे.

Happy Friendship Day ❤️`;

  const FINALE_SUB =
`कायम अशीच हसत रहा...
माझ्या चहातल्या साखरेसारखी
आयुष्यभर गोड राहा. ☕❤️`;

  const observer = new IntersectionObserver(async (entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting && !played) {
        played = true;
        await typeText(textEl, FINALE_TEXT, 34);
        subEl.textContent = FINALE_SUB;
        subEl.classList.add('show');
        fireConfetti();
      }
    });
  }, { threshold: 0.5 });
  observer.observe(finale);
}

/* ==========================================================
   CONFETTI (finale burst)
========================================================== */
function fireConfetti() {
  if (reduceMotion) return;
  const canvas = $('#confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#8a6bff', '#ff85c8', '#f3c969', '#ffe3a1', '#b39dff'];
  const pieces = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * 200,
    r: Math.random() * 5 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    vy: Math.random() * 2 + 2,
    vx: Math.random() * 2 - 1,
    rot: Math.random() * 360,
    vr: Math.random() * 6 - 3,
  }));

  let frame = 0;
  function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
      ctx.restore();
    });
    if (frame < 260) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

window.addEventListener('resize', () => {
  const c = $('#confetti-canvas');
  c.width = window.innerWidth;
  c.height = window.innerHeight;
});
