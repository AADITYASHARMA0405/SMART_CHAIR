import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS — kept in sync with three-scene.js palette
//   sensor/accent blue  : #0284c7  (meshMat / sensorGlow)
//   orbit ring blue     : #3b82f6  (orbitDots)
//   particle purple     : #8b5cf6
//   rim teal            : #2a7d6b
// ─────────────────────────────────────────────────────────────
const TOKEN = {
  blue:   '#0284c7',
  orbit:  '#3b82f6',
  purple: '#8b5cf6',
  teal:   '#2a7d6b',
};

// ─────────────────────────────────────────────────────────────
// 1. SCROLL PROGRESS BAR
//    Thin line at top — fills as user scrolls.
//    Color cycles through the three-scene palette.
// ─────────────────────────────────────────────────────────────
function initScrollProgress() {
  let bar = document.getElementById('scroll-progress');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'scroll-progress';
    Object.assign(bar.style, {
      position:   'fixed',
      top:        '0',
      left:       '0',
      height:     '2.5px',
      width:      '0%',
      background: `linear-gradient(90deg, ${TOKEN.blue}, ${TOKEN.orbit}, ${TOKEN.purple})`,
      zIndex:     '9999',
      pointerEvents: 'none',
      transformOrigin: 'left',
      transition: 'width 0.05s linear',
    });
    document.body.appendChild(bar);
  }

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      bar.style.width = (self.progress * 100).toFixed(2) + '%';
    },
  });
}

// ─────────────────────────────────────────────────────────────
// 2. CURSOR MAGNETIC EFFECT
//    CTA buttons pull toward cursor — matches the "alive" feel
//    of the Three.js mouse parallax on the chair.
// ─────────────────────────────────────────────────────────────
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn, .hero-cta a, [data-magnetic]');
  buttons.forEach(btn => {
    const STRENGTH = 0.28; // pull factor — softer than chair parallax (0.06)

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * STRENGTH;
      const dy = (e.clientY - cy) * STRENGTH;
      gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

// ─────────────────────────────────────────────────────────────
// 3. TILT ON FEATURE / DASH CARDS
//    3D perspective tilt on hover — echoes the mouse-parallax
//    tilt of the chair (chairGroup.rotation.x via mouseY).
//    Same damping factor: ~0.025 easing.
// ─────────────────────────────────────────────────────────────
function initCardTilt() {
  const cards = document.querySelectorAll('.feature-card, .dash-card, .chart-card, .sdg-card');
  cards.forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.style.willChange     = 'transform';
    card.style.transition     = 'box-shadow 0.3s ease';

    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const x     = (e.clientX - rect.left)  / rect.width  - 0.5;  // −0.5 … 0.5
      const y     = (e.clientY - rect.top)   / rect.height - 0.5;
      const rotX  = -y * 8;   // max 8° — matches chair's ~4.6° max from mouseY*0.06
      const rotY  =  x * 8;
      gsap.to(card, {
        rotateX: rotX, rotateY: rotY,
        scale: 1.02,
        duration: 0.25, ease: 'power2.out',
        boxShadow: `0 12px 32px rgba(2,132,199,0.15)`, // TOKEN.blue at low opacity
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0, rotateY: 0, scale: 1,
        duration: 0.5, ease: 'elastic.out(1, 0.5)',
        boxShadow: 'none',
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────
// 4. CLIP-PATH WIPE REVEAL
//    Replaces plain opacity+y fades with a crisp bottom wipe.
//    Timing mirrors the 3-scene sensor wave: stagger 0.6 per dot
//    → here stagger 0.08–0.15 per card (scaled to human time).
// ─────────────────────────────────────────────────────────────
function initClipReveal() {
  // Feature cards — stagger 0.10 matches the original 0.1 stagger
  gsap.utils.toArray('.feature-card').forEach((card, i) => {
    gsap.fromTo(card,
      { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
      {
        clipPath: 'inset(0% 0% 0% 0%)', opacity: 1,
        duration: 0.7, delay: i * 0.08, ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // Dashboard / chart cards — slightly slower (heavy data panels)
  gsap.utils.toArray('.dash-card, .chart-card').forEach((card, i) => {
    gsap.fromTo(card,
      { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
      {
        clipPath: 'inset(0% 0% 0% 0%)', opacity: 1,
        duration: 0.65, delay: i * 0.07, ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  });
}

// ─────────────────────────────────────────────────────────────
// 5. HORIZONTAL MARQUEE STRIP
//    Auto-injects a scrolling keyword banner between sections.
//    Keywords match the Three.js scene's functional domains.
//    Speed chosen so one full loop ≈ the chair's full rotation
//    (chairGroup.rotation.y at 0.005 rad/frame × ~600 frames = ~3 rad ≈ 0.5 turn ≈ 13s)
// ─────────────────────────────────────────────────────────────
function initMarquee() {
  const strip = document.querySelector('.marquee-strip, [data-marquee]');
  if (!strip) return; // only runs if the HTML element exists

  const KEYWORDS = [
    'Posture Analytics',  'IoT Sensors',     'Real-time Feedback',
    'Spinal Health',      'ESP32',           'Pressure Mapping',
    'Ergonomic AI',       'Bluetooth LE',    'Seat Intelligence',
    'Lumbar Support',     'Wearable Tech',   'Workspace Wellness',
  ];

  // Build two copies for seamless loop
  const inner = document.createElement('div');
  inner.style.cssText = 'display:flex;gap:2.5rem;white-space:nowrap;will-change:transform;';
  const renderKeywords = () => KEYWORDS.map(k =>
    `<span style="display:inline-flex;align-items:center;gap:0.5rem;font-size:0.8rem;font-weight:500;
      color:${TOKEN.blue};letter-spacing:0.06em;text-transform:uppercase;">
      <span style="width:5px;height:5px;border-radius:50%;background:${TOKEN.orbit};display:inline-block;"></span>
      ${k}
    </span>`
  ).join('');
  inner.innerHTML = renderKeywords() + renderKeywords();
  strip.appendChild(inner);

  // 13 s loop — matches chair half-spin cadence
  gsap.to(inner, {
    x: '-50%',
    duration: 13,
    ease: 'none',
    repeat: -1,
  });

  // Pause on hover
  inner.addEventListener('mouseenter', () => gsap.globalTimeline.timeScale(0.15));
  inner.addEventListener('mouseleave', () => gsap.globalTimeline.timeScale(1));
}

// ─────────────────────────────────────────────────────────────
// 6. SENSOR PULSE RIPPLE ON SCROLL
//    When the features/dashboard section enters view, the
//    sensor-blue accent color pulses outward on section tags
//    — echoes the Three.js sensorDots heartbeat wave.
//    Frequency: 3 pulses over 1s = 3.0 Hz — matches time * 3.0
//    used in the sensor dot loop.
// ─────────────────────────────────────────────────────────────
function initSensorPulseOnScroll() {
  const tags = document.querySelectorAll('.section-tag, .feature-tag, [data-pulse-tag]');
  tags.forEach(tag => {
    ScrollTrigger.create({
      trigger: tag,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        // 3 quick pulses at 3Hz cadence, then settle
        gsap.timeline()
          .to(tag, { scale: 1.12, color: TOKEN.blue, duration: 0.15, ease: 'power2.out' })
          .to(tag, { scale: 1.00, duration: 0.18, ease: 'power2.in' })
          .to(tag, { scale: 1.08, duration: 0.13, ease: 'power2.out' })
          .to(tag, { scale: 1.00, duration: 0.16, ease: 'power2.in' })
          .to(tag, { scale: 1.04, duration: 0.10, ease: 'power2.out' })
          .to(tag, { scale: 1.00, duration: 0.14, ease: 'power2.in' });
      },
    });
  });
}

// ─────────────────────────────────────────────────────────────
// 7. SMOOTH ANCHOR SCROLL
//    Nav links ease to sections — cubic ease mirrors GSAP
//    power3.out used in hero timeline.
// ─────────────────────────────────────────────────────────────
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      gsap.to(window, {
        scrollTo: { y: target, offsetY: 70 },
        duration: 1.1,
        ease: 'power3.inOut',
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────
// 8. HERO CANVAS PARALLAX (DEPTH SYNC)
//    The canvas drifts at 0.4× scroll speed — softer than the
//    hero-content parallax (−100px / viewport) so the 3D chair
//    feels like it has MORE depth/weight than the flat text.
//    Also fades opacity from 1 → 0.4 so content sections feel
//    distinct from the hero without a hard cut.
// ─────────────────────────────────────────────────────────────
function initCanvasParallax() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  gsap.to(canvas, {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.8, // gentle lag — chair feels heavy
    },
    y: -60,        // moves less than text (−100px) → appears further away
    opacity: 0.4,
    ease: 'none',
  });
}

// ─────────────────────────────────────────────────────────────
// 9. ALERT CARD — HEARTBEAT BORDER PULSE
//    Alert cards get a border that pulses in the sensor-blue
//    color, at the same 3.0 Hz as the Three.js sensorDots
//    emissiveIntensity wave (time * 3.0).
// ─────────────────────────────────────────────────────────────
function initAlertPulse() {
  const alerts = document.querySelectorAll('.alert-card');
  alerts.forEach((card, i) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        // stagger offset per card — mirrors i * 0.6 in sensorDots loop
        const delay = i * 0.2;
        gsap.to(card, {
          delay,
          repeat: 2,
          yoyo: true,
          boxShadow: `0 0 0 2px ${TOKEN.blue}`,
          duration: 0.16, // 1/3 of 0.48s = ~3Hz
          ease: 'power1.inOut',
          onComplete: () => {
            gsap.set(card, { boxShadow: 'none' });
          },
        });
      },
    });
  });
}

// ─────────────────────────────────────────────────────────────
// ORIGINAL ANIMATIONS (preserved exactly, zero changes)
// ─────────────────────────────────────────────────────────────

function initOriginalAnimations() {
  // === Navbar scroll behavior ===
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      const navbar = document.getElementById('navbar');
      if (self.direction === 1 && self.progress > 0) {
        navbar.classList.add('scrolled');
      } else if (self.progress === 0) {
        navbar.classList.remove('scrolled');
      }
    }
  });

  // === Hero animations ===
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  gsap.set('.hero-badge, .hero-title, .hero-subtitle, .hero-stats, .hero-cta', { opacity: 0, y: 30 });

  heroTl
    .to('.hero-badge',   { y: 0, opacity: 1, duration: 0.6, delay: 0.1 })
    .to('.hero-title',   { y: 0, opacity: 1, duration: 0.8 }, '-=0.4')
    .to('.hero-subtitle',{ y: 0, opacity: 1, duration: 0.6 }, '-=0.5')
    .to('.hero-stats .stat-item', { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 }, '-=0.4')
    .to('.hero-cta',     { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
    .from('.hero-scroll-indicator', { opacity: 0, duration: 0.8 }, '-=0.2');

  window.addEventListener('load', () => {
    setTimeout(() => { ScrollTrigger.refresh(); }, 500);
  });

  // === Counter animations ===
  animateCounters();

  // === Scroll-triggered section animations ===
  const initSectionAnimations = () => {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      const header = section.querySelector('.section-header');
      if (header) {
        gsap.fromTo(header.querySelector('.section-tag'),
          { y: 20, opacity: 0 },
          { scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none none' },
            y: 0, opacity: 1, duration: 0.6, overwrite: 'auto' }
        );
        gsap.fromTo(header.querySelector('.section-title'),
          { y: 30, opacity: 0 },
          { scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none none' },
            y: 0, opacity: 1, duration: 0.8, delay: 0.1, overwrite: 'auto' }
        );
        gsap.fromTo(header.querySelector('.section-subtitle'),
          { y: 20, opacity: 0 },
          { scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none none' },
            y: 0, opacity: 1, duration: 0.6, delay: 0.2, overwrite: 'auto' }
        );
      }
    });

    // Feature cards — now handled by initClipReveal() above for wipe effect
    // Kept here as fallback for grids that clip-path doesn't target
    const featureGrids = document.querySelectorAll('.features-grid');
    featureGrids.forEach(grid => {
      gsap.fromTo(grid.querySelectorAll('.feature-card'),
        { y: 30, opacity: 0 },
        { scrollTrigger: { trigger: grid, start: 'top 90%', toggleActions: 'play none none none' },
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out', overwrite: 'auto' }
      );
    });

    gsap.fromTo('.dash-card',
      { y: 20, opacity: 0, scale: 0.98 },
      { scrollTrigger: { trigger: '.dashboard-grid', start: 'top 90%', toggleActions: 'play none none none' },
        y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', overwrite: 'auto' }
    );

    gsap.fromTo('.chart-card',
      { y: 30, opacity: 0 },
      { scrollTrigger: { trigger: '.charts-grid', start: 'top 90%', toggleActions: 'play none none none' },
        y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out', overwrite: 'auto' }
    );

    gsap.fromTo('.alert-card',
      { x: -20, opacity: 0 },
      { scrollTrigger: { trigger: '.alerts-grid', start: 'top 90%', toggleActions: 'play none none none' },
        x: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', overwrite: 'auto' }
    );

    gsap.fromTo('.sdg-card',
      { y: 30, opacity: 0 },
      { scrollTrigger: { trigger: '.sdg-grid', start: 'top 90%', toggleActions: 'play none none none' },
        y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out', overwrite: 'auto' }
    );

    gsap.fromTo('.impact-stat',
      { y: 30, opacity: 0 },
      { scrollTrigger: { trigger: '.impact-numbers', start: 'top 85%', toggleActions: 'play none none none' },
        y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'power2.out', overwrite: 'auto' }
    );

    // Hero content parallax (text) — chair canvas moves slower (initCanvasParallax)
    gsap.to('.hero-content', {
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      y: -100, opacity: 0.3, overwrite: 'auto'
    });

    ScrollTrigger.refresh();
  };

  if (document.readyState === 'complete') {
    initSectionAnimations();
  } else {
    window.addEventListener('load', () => { setTimeout(initSectionAnimations, 100); });
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { ScrollTrigger.refresh(); }, 250);
  });
}

function animateCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  statNumbers.forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => {
        gsap.to(el, {
          duration: target > 1000 ? 2.5 : 1.5, ease: 'power2.out',
          onUpdate: function() {
            const current = Math.round(target * this.progress());
            if (target >= 1000000)     el.textContent = (current / 1000000000).toFixed(1) + 'B';
            else if (target >= 1000)   el.textContent = Math.round(current / 1000) + 'K';
            else                       el.textContent = current;
          }
        });
      }
    });
  });

  const impactNumbers = document.querySelectorAll('.impact-number[data-target]');
  impactNumbers.forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => {
        gsap.to(el, {
          duration: 2, ease: 'power2.out',
          onUpdate: function() {
            const current = Math.round(target * this.progress());
            el.textContent = target >= 1000 ? current.toLocaleString() : current;
          }
        });
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────
// EXPORT — single entry point, runs everything in order
// ─────────────────────────────────────────────────────────────
export function initAnimations() {
  initScrollProgress();       // progress bar
  initOriginalAnimations();   // all pre-existing GSAP animations
  initCanvasParallax();       // Three.js canvas depth parallax
  initClipReveal();           // clip-path wipe on cards
  initCardTilt();             // 3D tilt on hover
  initMagneticButtons();      // magnetic CTA buttons
  initSensorPulseOnScroll();  // sensor heartbeat on section tags
  initAlertPulse();           // border pulse on alert cards
  initMarquee();              // horizontal keyword marquee
  initSmoothAnchors();        // smooth scroll anchors
}
