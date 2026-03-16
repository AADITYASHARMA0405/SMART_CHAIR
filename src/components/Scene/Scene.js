import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import setCharacter from '../../utils/character/setCharacter';
import setAnimations from '../../utils/character/setAnimations';
import setLighting from '../../utils/character/setLighting';
import {
  handleMouseMove,
  handleTouchEnd,
  handleTouchMove,
} from '../../utils/character/mouseUtils';

gsap.registerPlugin(ScrollTrigger);

export function initScene(containerId = 'hero-canvas-container') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return;
  }

  // Create Load Overlay if it doesn't exist
  let loadOverlay = container.querySelector('.load-overlay');
  if (!loadOverlay) {
    loadOverlay = document.createElement('div');
    loadOverlay.className = 'load-overlay';
    loadOverlay.innerHTML = `
      <div class="load-bar-track">
        <div class="load-bar-fill" style="width: 0%; background: #0284c7"></div>
      </div>
      <p class="load-label">Loading smart chair...</p>
    `;
    container.appendChild(loadOverlay);
  }
  const loadBarFill = loadOverlay.querySelector('.load-bar-fill');

  const rect = container.getBoundingClientRect();
  const width = rect.width || window.innerWidth;
  const height = rect.height || window.innerHeight;
  const aspect = width / height;

  const scene = new THREE.Scene();

  // ── Renderer ───────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: true,
    canvas: container.querySelector('canvas') || undefined
  });
  
  if (!renderer.domElement.parentElement) {
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
  }
  
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.55;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ── Camera ─────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
  camera.position.set(0, 13.1, 24.7);
  camera.zoom = 1.1;
  camera.updateProjectionMatrix();

  // ── Lighting ───────────────────────────────────────────
  const lighting = setLighting(scene);

  // ── Load character ─────────────────────────────────────
  const { loadCharacter } = setCharacter(renderer, scene, camera);
  let mixer, animSystem, headBone, screenLight;
  const clock = new THREE.Clock();

  // Track load progress
  document.addEventListener('char-load-progress', (e) => {
    if (loadBarFill) loadBarFill.style.width = `${e.detail}%`;
  });

  loadCharacter().then((gltf) => {
    if (!gltf) return;

    animSystem = setAnimations(gltf);
    mixer = animSystem.mixer;

    const character = gltf.scene;
    scene.add(character);

    headBone = character.getObjectByName('spine006') || null;
    screenLight = character.getObjectByName('screenlight') || null;

    // Hover eyebrow interaction
    const hoverZone = container.querySelector('.character-hover');
    if (hoverZone) {
      animSystem.hover(gltf, hoverZone);
    }

    // Turn on lights + start intro after assets settle
    setTimeout(() => {
      lighting.turnOnLights();
      animSystem.startIntro();
      if (loadOverlay) {
        gsap.to(loadOverlay, { opacity: 0, duration: 0.5, onComplete: () => loadOverlay.remove() });
      }
    }, 2500);

    // Listen for posture alert from scroll triggers
    document.addEventListener('posture-alert', (e) => {
      const score = e.detail?.score || 50;
      if (animSystem) animSystem.setPostureScore(score);
      document.dispatchEvent(new CustomEvent('hud-flash', { detail: { score } }));
    });
  });

  // ── Mouse / touch tracking ────────────────────────────
  let mouse = { x: 0, y: 0 };

  const onMouseMove = (e) => {
    handleMouseMove(e, (x, y) => { mouse = { x, y }; });
  };

  document.addEventListener('mousemove', onMouseMove);

  // ── Resize ────────────────────────────────────────────
  const onResize = () => {
    const r = container.getBoundingClientRect();
    const w = r.width || window.innerWidth;
    const h = r.height || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    ScrollTrigger.refresh();
  };
  window.addEventListener('resize', onResize);

  // ── Animation loop ────────────────────────────────────
  const animate = () => {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (animSystem && headBone) {
      animSystem.update(
        delta,
        headBone,
        mouse,
        THREE.MathUtils.lerp,
        screenLight
      );
    } else if (mixer) {
      mixer.update(delta);
    }

    renderer.render(scene, camera);
  };
  animate();

  // Return cleanup function
  return () => {
    window.removeEventListener('resize', onResize);
    document.removeEventListener('mousemove', onMouseMove);
    scene.clear();
    renderer.dispose();
  };
}
