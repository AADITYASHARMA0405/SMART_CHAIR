import './style.css';
import { initThreeScene } from './js/three-scene.js';
import { initAnimations } from './js/animations.js';
import { initDashboard } from './js/dashboard.js';
import { initCharts } from './js/charts.js';

// === Initialize everything once DOM is ready ===
document.addEventListener('DOMContentLoaded', () => {
  // Three.js 3D Chair
  initThreeScene();

  // GSAP Animations
  initAnimations();

  // Dashboard simulation
  initDashboard();

  // Chart.js analytics
  initCharts();

  // Smooth scrolling for nav links
  setupSmoothScroll();

  // Mobile nav toggle
  setupMobileNav();
});

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        // Close mobile menu if open
        document.querySelector('.nav-links')?.classList.remove('active');
      }
    });
  });
}

function setupMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('active');
      toggle.classList.toggle('active');
    });

    // Close on link click
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('active');
        toggle.classList.remove('active');
      });
    });
  }
}
