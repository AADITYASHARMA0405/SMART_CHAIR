import { PosturePredictor } from './ml-predictor.js';

export function initDashboard() {
  // ML Predictor
  const predictor = new PosturePredictor();
  predictor.loadModel('/models/posture_model.json');

  // Simulated live data
  let sessionSeconds = 0;
  let currentPostureId = 0; // 0: Upright, 1: Slouching, etc.
  let rawSensors = [0, 0, 0, 0, 0, 0, 0, 0];
  let isChairEmpty = false;

  // Toggle Logic
  const toggleBtn = document.getElementById('toggle-empty-chair');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isChairEmpty = !isChairEmpty;
      
      if (isChairEmpty) {
        toggleBtn.textContent = '🧍 Resume Sitting';
        toggleBtn.classList.replace('btn-secondary', 'btn-primary');
        
        // Visual reset for empty state
        const statusEl = document.getElementById('posture-status');
        if (statusEl) {
          statusEl.textContent = 'Chair Empty';
          statusEl.className = 'posture-status';
          statusEl.style.color = 'var(--text-3)';
        }
        document.getElementById('posture-score').textContent = '--';
        document.getElementById('posture-type-name').textContent = 'Waiting...';
      } else {
        toggleBtn.textContent = '🪑 Simulate Empty Chair';
        toggleBtn.classList.replace('btn-primary', 'btn-secondary');
      }
    });
  }

  // Start all dashboard simulations
  updatePostureScore();
  updateFatigue();
  updateSpine();
  updatePressureGrid();
  startSessionTimer();

  // Primary ML Simulation Loop
  // This simulates the "Hardware" sending sensor data every 2 seconds
  setInterval(simulateHardwareFeed, 3000);

  // Cycle UI updates
  setInterval(() => { if(!isChairEmpty) updateFatigue(); }, 5000);
  setInterval(() => { if(!isChairEmpty) updateSpine(); }, 3000);
  setInterval(() => { if(!isChairEmpty) updatePressureGrid(); }, 1500);

  function simulateHardwareFeed() {
    if (!predictor.isLoaded || isChairEmpty) return;

    // Simulate switching postures for demo purposes
    // We'll favor "Upright" (0) but occasionally switch
    const rand = Math.random();
    let targetClass = 0;
    if (rand > 0.6) targetClass = Math.floor(Math.random() * 6);

    // Generate sensor data matching the model's training distribution
    const weight = 65; // Simulated constant weight
    const w_base = (weight / 80.0) * 700;
    const noise = (scale) => (Math.random() - 0.5) * scale * 2;

    let s = [0, 0, 0, 0, 0, 0, 0, 0]; // FL, FR, BL, BR, LL, LR, Pitch, Roll
    
    if (targetClass === 0) { // Upright
        s = [w_base * 0.22, w_base * 0.22, w_base * 0.28, w_base * 0.28, w_base * 0.15, w_base * 0.15, 0, 0];
    } else if (targetClass === 1) { // Slouching
        s = [w_base * 0.10, w_base * 0.10, w_base * 0.45, w_base * 0.45, w_base * 0.05, w_base * 0.05, 18, 0];
    } else if (targetClass === 2) { // Left
        s = [w_base * 0.40, w_base * 0.10, w_base * 0.40, w_base * 0.10, w_base * 0.25, w_base * 0.05, 0, -15];
    } else if (targetClass === 3) { // Right
        s = [w_base * 0.10, w_base * 0.40, w_base * 0.10, w_base * 0.40, w_base * 0.05, w_base * 0.25, 0, 15];
    } else if (targetClass === 4) { // Forward
        s = [w_base * 0.45, w_base * 0.45, w_base * 0.10, w_base * 0.10, 0, 0, -15, 0];
    } else if (targetClass === 5) { // Reclined
        s = [w_base * 0.12, w_base * 0.12, w_base * 0.25, w_base * 0.25, w_base * 0.35, w_base * 0.35, 28, 0];
    }

    // Add noise to mimic real sensor jitter
    rawSensors = s.map((v, i) => i < 6 ? Math.max(0, Math.min(1023, v + noise(20))) : v + noise(2));

    // RUN ML PREDICTION
    const result = predictor.predict(rawSensors);
    currentPostureId = result.classId;

    // Update UI
    updatePostureType(result);
    updatePostureScore(result.confidence);
    updateAlerts(); // Trigger dynamic alerts logic
  }

  // === Posture Score Gauge ===
  function updatePostureScore(confidence = 0.9) {
    // Score based on posture class + model confidence
    let baseScore = 0;
    if (currentPostureId === 0) baseScore = 90;
    else if (currentPostureId === 5) baseScore = 80;
    else if (currentPostureId === 1) baseScore = 40;
    else baseScore = 60;

    const score = Math.floor(baseScore + (confidence * 10) - 5);
    
    const scoreEl = document.getElementById('posture-score');
    const gaugeFill = document.getElementById('gauge-fill');
    const statusEl = document.getElementById('posture-status');

    if (!scoreEl || !gaugeFill) return;

    animateValue(scoreEl, parseInt(scoreEl.textContent) || 0, score, 800);

    const offset = 251 - (251 * score / 100);
    gaugeFill.style.transition = 'stroke-dashoffset 1s ease';
    gaugeFill.setAttribute('stroke-dashoffset', offset);

    // Update status colors/text
    if (score >= 80) {
      statusEl.textContent = 'Good Posture';
      statusEl.className = 'posture-status good';
    } else if (score >= 60) {
      statusEl.textContent = 'Fair Posture';
      statusEl.className = 'posture-status fair';
    } else {
      statusEl.textContent = 'Poor Posture';
      statusEl.className = 'posture-status poor';
    }
  }

  // === Fatigue Level ===
  function updateFatigue() {
    const baseFatigue = Math.min(90, (sessionSeconds / 180) * 10 + Math.random() * 10);
    const fatigue = Math.floor(Math.max(5, baseFatigue));
    const fatigueBar = document.getElementById('fatigue-bar');
    const fatigueValue = document.getElementById('fatigue-value');
    const fatigueLabel = document.getElementById('fatigue-label');

    if (!fatigueBar) return;
    fatigueBar.style.width = fatigue + '%';
    fatigueValue.textContent = fatigue + '%';

    if (fatigue < 40) {
      fatigueBar.className = 'fatigue-bar';
      fatigueLabel.textContent = 'Low';
    } else if (fatigue < 65) {
      fatigueBar.className = 'fatigue-bar medium';
      fatigueLabel.textContent = 'Medium';
    } else {
      fatigueBar.className = 'fatigue-bar high';
      fatigueLabel.textContent = 'High';
    }
  }

  // === Spine Alignment ===
  function updateSpine() {
    const segments = ['spine-cervical', 'spine-thoracic', 'spine-lumbar', 'spine-sacral'];
    segments.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      
      // Map posture ID to spine stress
      let state = '';
      if (currentPostureId === 1) state = 'danger'; // Slouching
      else if (currentPostureId === 4 && i < 2) state = 'warning'; // Forward lean strains neck
      else if (currentPostureId === 2 || currentPostureId === 3) state = 'warning'; // Leaning
      
      el.className = `spine-segment ${state}`;
    });
  }

  // === Pressure Map ===
  function updatePressureGrid() {
    const grid = document.getElementById('pressure-grid');
    if (!grid || !predictor.isLoaded) return;

    if (grid.children.length === 0) {
      for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'pressure-cell';
        grid.appendChild(cell);
      }
    }

    // Map the 4 seat sensors and 2 lumbar sensors to the 16 grid cells
    Array.from(grid.children).forEach((cell, i) => {
      let val = 0;
      if (i < 4) val = (rawSensors[0] + rawSensors[1]) / 2 / 1024; // Front
      else if (i < 8) val = (rawSensors[0] + rawSensors[2]) / 2 / 1024; 
      else if (i < 12) val = (rawSensors[2] + rawSensors[3]) / 2 / 1024; // Back
      else val = (rawSensors[4] + rawSensors[5]) / 2 / 1024; // Lumbar

      val = Math.min(1, val + Math.random() * 0.2); // Add visual noise
      cell.style.opacity = 0.3 + val * 0.7;
      cell.style.background = val > 0.6 ? '#111' : (val > 0.3 ? '#888' : '#eee');
    });
  }

  // === Dynamic Health Alerts ===
  let consecutivePoorPosture = 0;
  let goodPostureStreak = 0;
  let lastAlert = null;
  
  function updateAlerts() {
    const alertsGrid = document.querySelector('.alerts-grid');
    if (!alertsGrid) return;
    
    // Clear initial static HTML on first run
    if (!alertsGrid.hasAttribute('data-initialized')) {
      alertsGrid.innerHTML = '';
      alertsGrid.setAttribute('data-initialized', 'true');
    }

    const currentType = document.getElementById('posture-type-name')?.textContent || '';
    const currentFatigue = parseInt(document.getElementById('fatigue-value')?.textContent || '0');
    
    let newAlert = null;

    // Analyze Posture for alerts
    if (['Slouch', 'Lean L', 'Lean R', 'Forward'].includes(currentType)) {
      consecutivePoorPosture++;
      goodPostureStreak = 0;
      
      if (consecutivePoorPosture === 5 || consecutivePoorPosture === 20) {
        let msg = '';
        if (currentType === 'Slouch') msg = "You've been slouching. Engage your core and sit back against the lumbar support.";
        else if (currentType.includes('Lean')) msg = `You are leaning to the ${currentType.includes('L') ? 'left' : 'right'}. Try to distribute your weight evenly.`;
        else msg = "You are leaning forward. Bring your screen closer instead of straining your neck.";
        
        newAlert = { 
          type: 'warning', 
          iconSVG: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', 
          title: 'Posture Correction Needed', 
          message: msg 
        };
      }
    } else if (currentType === 'Upright') {
      goodPostureStreak++;
      consecutivePoorPosture = 0;
      
      if (goodPostureStreak === 10) {
        newAlert = { 
          type: 'success', 
          iconSVG: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>', 
          title: 'Optimal Alignment', 
          message: 'You are maintaining excellent spinal alignment. Keep it up!' 
        };
      } else if (goodPostureStreak === 30) {
        newAlert = { 
          type: 'success', 
          iconSVG: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/></svg>', 
          title: 'Perfect Posture Streak', 
          message: 'Outstanding! Your posture has been perfect for an extended period.' 
        };
      }
    }

    // Check Fatigue
    if (currentFatigue > 65 && currentFatigue < 70 && sessionSeconds % 10 === 0) {
      newAlert = { 
        type: 'danger', 
        iconSVG: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', 
        title: 'High Fatigue Alert', 
        message: `Fatigue level detected at ${currentFatigue}%. We strongly recommend taking a 5-minute standing break.` 
      };
    }

    // Prevent identical consecutive alerts within 15 seconds
    if (newAlert) {
      const isDuplicate = lastAlert && lastAlert.title === newAlert.title && (Date.now() - lastAlert.time < 15000);
      if (!isDuplicate) {
        appendAlert(alertsGrid, newAlert.type, newAlert.iconSVG, newAlert.title, newAlert.message);
        lastAlert = { title: newAlert.title, time: Date.now() };
      }
    }
  }

  function appendAlert(grid, type, iconSVG, title, message) {
    const alertHTML = `
      <div class="alert-card alert-${type} animate-fade-in">
        <div class="alert-icon">${iconSVG}</div>
        <div class="alert-content">
          <h4>${title}</h4>
          <p>${message}</p>
          <span class="alert-time">Just now</span>
        </div>
      </div>
    `;
    // Add to top, keep max 4
    grid.insertAdjacentHTML('afterbegin', alertHTML);
    if (grid.children.length > 4) {
      grid.lastElementChild.remove();
    }
  }

  // === Session Timer ===
  function startSessionTimer() {
    setInterval(() => {
        if (isChairEmpty) return;
        
        sessionSeconds++;
        const h = Math.floor(sessionSeconds / 3600);
        const m = Math.floor((sessionSeconds % 3600) / 60);
        const s = sessionSeconds % 60;
        
        const hEl = document.getElementById('timer-hours');
        const mEl = document.getElementById('timer-minutes');
        const sEl = document.getElementById('timer-seconds');
        
        if (hEl) hEl.textContent = String(h).padStart(2, '0');
        if (mEl) mEl.textContent = String(m).padStart(2, '0');
        if (sEl) sEl.textContent = String(s).padStart(2, '0');
    }, 1000);
  }

  // === Posture Type UI Update ===
  function updatePostureType(result) {
    const iconsSVG = [
      '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M12 8v8"/><path d="m7 22 2-7 2-3h2l2 3 2 7"/><path d="M10 11H8a2 2 0 0 0-2 2v2"/><path d="M14 11h2a2 2 0 0 1 2 2v2"/></svg>', // Upright
      '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M12 8c-2 0-3 1-3 3v5c0 2 1 3 3 3s3-1 3-3v-5c0-2-1-3-3-3z"/><path d="M9 12H7a2 2 0 0 0-2 2v2"/><path d="M15 12h2a2 2 0 0 1 2 2v2"/><path d="m8 22 2-7"/><path d="m14 22-2-7"/></svg>', // Slouch
      '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="5" r="3"/><path d="M10 8v8"/><path d="m5 22 2-7 1-3h4l1 3 1 7"/><path d="M8 11H6a2 2 0 0 0-2 2v2"/><path d="M12 11h2a2 2 0 0 1 2 2v2"/></svg>', // Lean L
      '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="5" r="3"/><path d="M14 8v8"/><path d="m19 22-2-7-1-3h-4l-1 3-1 7"/><path d="M16 11h2a2 2 0 0 1 2 2v2"/><path d="M12 11h-2a2 2 0 0 0-2 2v2"/></svg>', // Lean R
      '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="5" r="3"/><path d="M15 8l-3 8"/><path d="m10 22 2-7 1-3h4l1 3 1 7"/><path d="M12 11H10a2 2 0 0 0-2 2v2"/><path d="M18 11h2a2 2 0 0 1 2 2v2"/></svg>', // Forward
      '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="3"/><path d="M9 8l3 8"/><path d="m14 22-2-7-1-3h-4l-1 3-1 7"/><path d="M6 11H4a2 2 0 0 0-2 2v2"/><path d="M12 11h2a2 2 0 0 1 2 2v2"/></svg>' // Reclined
    ];
    const types = ['upright', 'slouch', 'lean-l', 'lean-r', 'forward', 'reclined'];
    
    const iconEl = document.getElementById('posture-icon');
    const nameEl = document.getElementById('posture-type-name');
    const ptypeEls = document.querySelectorAll('.ptype');

    if (iconEl) iconEl.innerHTML = iconsSVG[result.classId];
    if (nameEl) nameEl.textContent = result.className;

    ptypeEls.forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-type') === types[result.classId]);
    });
  }
}

function animateValue(el, start, end, duration) {
  const startTime = performance.now();
  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (end - start) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
