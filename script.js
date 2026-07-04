/* =============================================
   ANIME PORTFOLIO — JAVASCRIPT ENGINE
   ============================================= */

'use strict';

// =============================================
// 1. LOADER
// =============================================
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
    initAnimations();
  }, 2400);
});

// =============================================
// 2. PARTICLE CANVAS BACKGROUND
// =============================================
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#c77dff','#f72585','#4cc9f0','#ffd166','#ffb7c5'];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 2 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.5 + 0.1;
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.02;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + Math.sin(this.pulse) * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha * (0.7 + 0.3 * Math.sin(this.pulse));
      ctx.fill();
    }
  }

  // Create 120 particles
  for (let i = 0; i < 120; i++) particles.push(new Particle());

  // Draw connection lines between nearby particles
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#c77dff';
          ctx.globalAlpha = (1 - dist / 100) * 0.08;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.globalAlpha = 1;
    drawLines();
    requestAnimationFrame(animate);
  }
  animate();
})();

// =============================================
// 3. SAKURA PETALS
// =============================================
(function initSakura() {
  const container = document.getElementById('sakuraContainer');
  const petals = ['🌸','🌺','✿','❀','🌼'];

  function createPetal() {
    const el = document.createElement('div');
    el.className = 'sakura-petal';
    el.textContent = petals[Math.floor(Math.random() * petals.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.fontSize = (Math.random() * 14 + 10) + 'px';
    el.style.animationDuration = (Math.random() * 8 + 6) + 's';
    el.style.animationDelay = Math.random() * 5 + 's';
    el.style.opacity = (Math.random() * 0.4 + 0.3).toString();
    container.appendChild(el);
    setTimeout(() => el.remove(), 14000);
  }

  // Create initial batch
  for (let i = 0; i < 15; i++) {
    setTimeout(() => createPetal(), Math.random() * 3000);
  }
  // Continue creating
  setInterval(createPetal, 800);
})();

// =============================================
// 4. CUSTOM CURSOR
// =============================================
(function initCursor() {
  const glow   = document.getElementById('cursorGlow');
  const trail  = document.getElementById('cursorTrail');
  const EMOJIS = ['✦','✧','⭐','🌸','💫','✨'];
  let lastTrail = 0;

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';

    // Trail sparkles
    const now = Date.now();
    if (now - lastTrail > 80) {
      lastTrail = now;
      const el = document.createElement('div');
      el.className = 'cursor-trail';
      el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      el.style.left = e.clientX + 'px';
      el.style.top  = e.clientY + 'px';
      el.style.fontSize = (Math.random() * 8 + 10) + 'px';
      trail.appendChild(el);
      setTimeout(() => el.remove(), 800);
    }
  });

  // Grow cursor on interactive elements
  document.querySelectorAll('a, button, .gallery-card, .skill-card, .trait-chip, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => {
      glow.style.width  = '40px';
      glow.style.height = '40px';
    });
    el.addEventListener('mouseleave', () => {
      glow.style.width  = '20px';
      glow.style.height = '20px';
    });
  });
})();

// =============================================
// 5. NAVBAR SCROLL BEHAVIOR
// =============================================
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const links   = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const btt     = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    // Scroll class
    navbar.classList.toggle('scrolled', y > 50);

    // Back to top
    btt.classList.toggle('visible', y > 500);

    // Active nav link
    let current = '';
    sections.forEach(s => {
      if (s.offsetTop - 100 <= y) current = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
  });

  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Mobile menu
  const toggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
})();

// =============================================
// 6. HERO KANJI RAIN
// =============================================
(function initKanjiRain() {
  const container = document.getElementById('kanjiRain');
  const KANJI = '愛夢力美空花星海月光風雪桜夜人生魂心道勇智';
  const cols = Math.floor(window.innerWidth / 40);

  for (let i = 0; i < cols; i++) {
    const el = document.createElement('div');
    el.className = 'kanji-char';
    el.textContent = KANJI[Math.floor(Math.random() * KANJI.length)];
    el.style.left = (i * 40 + Math.random() * 20) + 'px';
    el.style.animationDuration = (Math.random() * 8 + 6) + 's';
    el.style.animationDelay    = (Math.random() * 6) + 's';
    el.style.fontSize = (Math.random() * 12 + 14) + 'px';
    container.appendChild(el);
  }
})();

// =============================================
// 7. TYPEWRITER EFFECT
// =============================================
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  const words = [
    'Creative Soul ✨',
    'Anime Lover 🌸',
    'Adventure Seeker 🗺️',
    'Story Teller ✍️',
    'Dreamer & Doer 💫',
    'Content Creator 🎭'
  ];
  let wi = 0, ci = 0, deleting = false;
  const SPEED_TYPE = 80, SPEED_DELETE = 40, PAUSE = 2000;

  function type() {
    const word = words[wi];
    el.textContent = deleting ? word.substring(0, ci--) : word.substring(0, ci++);

    if (!deleting && ci === word.length + 1) {
      setTimeout(() => { deleting = true; type(); }, PAUSE);
      return;
    }
    if (deleting && ci < 0) {
      deleting = false;
      ci = 0;
      wi = (wi + 1) % words.length;
    }
    setTimeout(type, deleting ? SPEED_DELETE : SPEED_TYPE);
  }
  type();
})();

// =============================================
// 8. COUNTER ANIMATION
// =============================================
function animateCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = +el.dataset.target;
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current);
    }, 24);
  });
}

// =============================================
// 9. SCROLL REVEAL (IntersectionObserver)
// =============================================
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up').forEach(el => observer.observe(el));
}

// =============================================
// 10. SKILL BARS
// =============================================
function initSkillBars() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target.querySelector('.skill-fill');
        const level = entry.target.dataset.level;
        if (bar && level) {
          setTimeout(() => { bar.style.width = level + '%'; }, 200);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.skill-bar[data-level]').forEach(b => observer.observe(b));
}

// =============================================
// 11. COUNTER TRIGGER
// =============================================
function initCounterTrigger() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });
  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) observer.observe(statsEl);
}

// =============================================
// 12. GALLERY FILTER
// =============================================
(function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      items.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !show);
      });
    });
  });
})();

// =============================================
// 13. LIGHTBOX
// =============================================
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightboxImg');
  const lbCap    = document.getElementById('lightboxCaption');
  const lbDots   = document.getElementById('lightboxDots');
  const btnClose = document.getElementById('lightboxClose');
  const btnPrev  = document.getElementById('lightboxPrev');
  const btnNext  = document.getElementById('lightboxNext');

  const images = [
    { src: 'img1.jpg', caption: '🌿 Garden Serenity — A peaceful tropical moment' },
    { src: 'img2.jpg', caption: '🏙️ City Lights — Exploring vibrant city streets at dusk' },
    { src: 'img3.jpg', caption: '🏟️ Casual Vibes #98 — A day full of good energy' },
    { src: 'img4.jpg', caption: '🌸 Sakura Street — Every lane looks like an anime scene' }
  ];

  let currentIndex = 0;

  // Create dots
  images.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `lb-dot${i === 0 ? ' active' : ''}`;
    dot.addEventListener('click', () => showImage(i));
    lbDots.appendChild(dot);
  });

  function showImage(idx) {
    currentIndex = (idx + images.length) % images.length;
    lbImg.src = images[currentIndex].src;
    lbCap.textContent = images[currentIndex].caption;
    document.querySelectorAll('.lb-dot').forEach((d, i) => d.classList.toggle('active', i === currentIndex));
  }

  function openLightbox(idx) {
    showImage(idx);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery-expand').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openLightbox(+btn.dataset.index);
    });
  });

  document.querySelectorAll('.gallery-card').forEach((card, i) => {
    card.addEventListener('click', () => openLightbox(i));
  });

  btnClose.addEventListener('click', closeLightbox);
  btnPrev.addEventListener('click',  () => showImage(currentIndex - 1));
  btnNext.addEventListener('click',  () => showImage(currentIndex + 1));

  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
})();

// =============================================
// 14. QUOTE CAROUSEL
// =============================================
(function initQuoteCarousel() {
  const slides = document.querySelectorAll('.quote-slide');
  const dotsEl = document.getElementById('quoteDots');
  const btnPrev = document.getElementById('quotePrev');
  const btnNext = document.getElementById('quoteNext');
  let current = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `q-dot${i === 0 ? ' active' : ''}`;
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(idx) {
    slides[current].classList.remove('active');
    document.querySelectorAll('.q-dot')[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    document.querySelectorAll('.q-dot')[current].classList.add('active');
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));
  resetTimer();
})();

// =============================================
// 15. LANGUAGE TOGGLE (JP / EN nav labels)
// =============================================
(function initLangToggle() {
  const btn = document.getElementById('langToggle');
  const links = document.querySelectorAll('.nav-link');
  const titles = document.querySelectorAll('.section-title');
  let isJP = false;

  btn.addEventListener('click', () => {
    isJP = !isJP;
    btn.textContent = isJP ? 'EN / JP' : 'JP / EN';
    links.forEach(l => {
      l.textContent = isJP ? l.dataset.jp : l.dataset.en;
    });
    titles.forEach(t => {
      if (isJP && t.dataset.jp) {
        t.setAttribute('data-orig', t.textContent);
        t.textContent = t.dataset.jp;
      } else if (t.dataset.orig) {
        t.textContent = t.dataset.orig;
      }
    });
  });
})();

// =============================================
// 16. CONTACT FORM
// =============================================
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btn     = document.getElementById('submitBtn');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    btn.innerHTML = '<span class="btn-icon">⏳</span><span>Sending...</span><span class="btn-shine"></span>';
    btn.disabled = true;

    setTimeout(() => {
      success.classList.add('visible');
      btn.innerHTML = '<span class="btn-icon">✅</span><span>Sent!</span>';
      form.reset();
      setTimeout(() => {
        success.classList.remove('visible');
        btn.innerHTML = '<span class="btn-icon">🌸</span><span>Send Message</span><span class="btn-shine"></span>';
        btn.disabled = false;
      }, 4000);
    }, 1500);
  });
})();

// =============================================
// 17. HERO CHARACTER PARALLAX
// =============================================
(function initParallax() {
  const char = document.getElementById('heroChar');
  if (!char) return;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    char.style.transform = `translateY(${Math.sin(Date.now() * 0.001) * 15}px) perspective(600px) rotateY(${dx * 5}deg) rotateX(${-dy * 5}deg)`;
  });
})();

// =============================================
// 18. SECTION TITLE HOVER GLITCH (easter egg)
// =============================================
(function initGlitchEffect() {
  document.querySelectorAll('.section-title').forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.style.animation = 'glitchText 0.3s steps(2) 3';
    });
    el.addEventListener('animationend', () => {
      el.style.animation = '';
    });
  });
})();

// Add glitch keyframe dynamically
const glitchStyle = document.createElement('style');
glitchStyle.textContent = `
@keyframes glitchText {
  0%   { transform: translate(0); }
  20%  { transform: translate(-3px, 2px); filter: hue-rotate(90deg); }
  40%  { transform: translate(3px, -2px); }
  60%  { transform: translate(-2px, 0); filter: hue-rotate(-90deg); }
  80%  { transform: translate(2px, 2px); }
  100% { transform: translate(0); filter: none; }
}
`;
document.head.appendChild(glitchStyle);

// =============================================
// 19. ABOUT IMAGES TILT EFFECT
// =============================================
(function initTiltCards() {
  document.querySelectorAll('.about-img-main, .about-img-secondary, .skill-card, .gallery-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(600px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) scale(1.02) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// =============================================
// 20. SMOOTH SECTION ENTRANCE (nav links)
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// =============================================
// RUN ALL INITIALIZATIONS
// =============================================
function initAnimations() {
  initScrollReveal();
  initSkillBars();
  initCounterTrigger();

  // Initial counter if hero is already visible
  animateCounters();
}

// Also run in case DOM is ready immediately
document.addEventListener('DOMContentLoaded', () => {
  // Pre-init things that don't need loader finish
  initScrollReveal();
});
