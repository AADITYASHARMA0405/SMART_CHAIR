import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
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
  
  // Ensure elements are at least partially present if JS is slightly delayed
  gsap.set('.hero-badge, .hero-title, .hero-subtitle, .hero-stats, .hero-cta', { opacity: 0, y: 30 });

  heroTl
    .to('.hero-badge', { y: 0, opacity: 1, duration: 0.6, delay: 0.1 })
    .to('.hero-title', { y: 0, opacity: 1, duration: 0.8 }, '-=0.4')
    .to('.hero-subtitle', { y: 0, opacity: 1, duration: 0.6 }, '-=0.5')
    .to('.hero-stats .stat-item', {
      y: 0, opacity: 1, duration: 0.5,
      stagger: 0.08
    }, '-=0.4')
    .to('.hero-cta', { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
    .from('.hero-scroll-indicator', { opacity: 0, duration: 0.8 }, '-=0.2');

  // Force a refresh after a short delay to ensure Three.js and other dynamic content settled
  window.addEventListener('load', () => {
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);
  });

  // === Counter animations ===
  animateCounters();

  // === Scroll-triggered section animations ===
  const initSectionAnimations = () => {
    // Clear any existing ScrollTriggers to prevent duplicates on forced refresh
    ScrollTrigger.getAll().forEach(t => {
        // preserve navbar trigger
        if (t.vars.trigger !== null && t.vars.trigger !== undefined) {
             // do not kill navbar
        } else {
            // this might be navbar 
        }
    });

    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      // Section header
      const header = section.querySelector('.section-header');
      if (header) {
        gsap.fromTo(header.querySelector('.section-tag'), 
          { y: 20, opacity: 0 },
          {
            scrollTrigger: {
              trigger: header,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            y: 0, opacity: 1, duration: 0.6,
            overwrite: 'auto'
          }
        );
        gsap.fromTo(header.querySelector('.section-title'), 
          { y: 30, opacity: 0 },
          {
            scrollTrigger: {
              trigger: header,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            y: 0, opacity: 1, duration: 0.8, delay: 0.1,
            overwrite: 'auto'
          }
        );
        gsap.fromTo(header.querySelector('.section-subtitle'), 
          { y: 20, opacity: 0 },
          {
            scrollTrigger: {
              trigger: header,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            y: 0, opacity: 1, duration: 0.6, delay: 0.2,
            overwrite: 'auto'
          }
        );
      }
    });

    // === Feature cards stagger ===
    const featureGrids = document.querySelectorAll('.features-grid');
    featureGrids.forEach(grid => {
      gsap.fromTo(grid.querySelectorAll('.feature-card'), 
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: grid,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
          overwrite: 'auto',
        }
      );
    });

    // === Dashboard cards ===
    gsap.fromTo('.dash-card', 
      { y: 20, opacity: 0, scale: 0.98 },
      {
        scrollTrigger: {
          trigger: '.dashboard-grid',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        overwrite: 'auto',
      }
    );

    // === Chart cards ===
    gsap.fromTo('.chart-card', 
      { y: 30, opacity: 0 },
      {
        scrollTrigger: {
          trigger: '.charts-grid',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
        overwrite: 'auto',
      }
    );

    // === Alert cards ===
    gsap.fromTo('.alert-card', 
      { x: -20, opacity: 0 },
      {
        scrollTrigger: {
          trigger: '.alerts-grid',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        x: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        overwrite: 'auto',
      }
    );

    // === SDG cards ===
    gsap.fromTo('.sdg-card', 
      { y: 30, opacity: 0 },
      {
        scrollTrigger: {
          trigger: '.sdg-grid',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        overwrite: 'auto',
      }
    );

    // === Impact numbers ===
    gsap.fromTo('.impact-stat', 
      { y: 30, opacity: 0 },
      {
        scrollTrigger: {
          trigger: '.impact-numbers',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out',
        overwrite: 'auto'
      }
    );

    // === Parallax effect on hero ===
    gsap.to('.hero-content', {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      y: -100,
      opacity: 0.3,
      overwrite: 'auto'
    });
    
    ScrollTrigger.refresh();
  };

  // Wait for fonts and window to load before calculating grid trigger points
  if (document.readyState === 'complete') {
    initSectionAnimations();
  } else {
    window.addEventListener('load', () => {
      // Small timeout ensures CSS layout has settled
      setTimeout(initSectionAnimations, 100);
    });
  }

  // Handle Resize robustly
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });
}

function animateCounters() {
  // Hero stat counters
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  statNumbers.forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          duration: target > 1000 ? 2.5 : 1.5,
          ease: 'power2.out',
          onUpdate: function() {
            const progress = this.progress();
            const current = Math.round(target * progress);
            if (target >= 1000000) {
              el.textContent = (current / 1000000000).toFixed(1) + 'B';
            } else if (target >= 1000) {
              el.textContent = Math.round(current / 1000) + 'K';
            } else {
              el.textContent = current;
            }
          }
        });
      }
    });
  });

  // Impact number counters
  const impactNumbers = document.querySelectorAll('.impact-number[data-target]');
  impactNumbers.forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          duration: 2,
          ease: 'power2.out',
          onUpdate: function() {
            const progress = this.progress();
            const current = Math.round(target * progress);
            if (target >= 1000) {
              el.textContent = current.toLocaleString();
            } else {
              el.textContent = current;
            }
          }
        });
      }
    });
  });
}
