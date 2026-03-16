import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three-stdlib';


function createHeatmapTexture() {
  const SIZE = 256; const cv = document.createElement('canvas'); cv.width = cv.height = SIZE;
  const ctx = cv.getContext('2d'); const tex = new THREE.CanvasTexture(cv);
  function update(ox, oy, intensity) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const cx = SIZE / 2 + ox * SIZE * 0.28, cy = SIZE / 2 + oy * SIZE * 0.28;
    const b = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE * 0.48); b.addColorStop(0, `rgba(59,130,246,${0.06 * intensity})`); b.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = b; ctx.fillRect(0, 0, SIZE, SIZE);
    const h1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, SIZE * 0.30); h1.addColorStop(0, `rgba(239,68,68,${0.72 * intensity})`); h1.addColorStop(0.4, `rgba(251,146,60,${0.50 * intensity})`); h1.addColorStop(0.75, `rgba(251,191,36,${0.22 * intensity})`); h1.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = h1; ctx.fillRect(0, 0, SIZE, SIZE);
    const lx = cx + SIZE * 0.09, ly = cy + SIZE * 0.05; const h2 = ctx.createRadialGradient(lx, ly, 0, lx, ly, SIZE * 0.18); h2.addColorStop(0, `rgba(239,68,68,${0.38 * intensity})`); h2.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = h2; ctx.fillRect(0, 0, SIZE, SIZE);
    tex.needsUpdate = true;
  }
  return { texture: tex, update };
}

function buildChair(sensorGlow) {
  const root = new THREE.Group();
  const chairGroup = new THREE.Group();
  const baseGroup = new THREE.Group();
  root.add(chairGroup);
  root.add(baseGroup);

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.32, metalness: 0.72 });
  const frame2Mat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.28, metalness: 0.68 });
  const meshMat = new THREE.MeshStandardMaterial({ color: 0x05426e, roughness: 0.88, metalness: 0.02 });
  const meshLightMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.80, metalness: 0.04 });
  const aluminiumMat = new THREE.MeshStandardMaterial({ color: 0xc8d0d8, roughness: 0.04, metalness: 0.99 });
  const dkAlumMat = new THREE.MeshStandardMaterial({ color: 0x303438, roughness: 0.08, metalness: 0.96 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.22, metalness: 0.58 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.98, metalness: 0.0 });
  const padMat = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.82, metalness: 0.0 });
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x003300, roughness: 0.80, metalness: 0.10 });
  const wireMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.50, metalness: 0.60 });
  const batteryMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.40, metalness: 0.30 });
  const logoGlowMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 1.6, roughness: 0.05, metalness: 0.0 });

  // SEAT
  const seatShell = new THREE.Mesh(new RoundedBoxGeometry(1.56, 0.085, 1.44, 8, 0.028), frameMat);
  seatShell.position.y = 1.800; seatShell.castShadow = true; chairGroup.add(seatShell);
  const seatCushion = new THREE.Mesh(new RoundedBoxGeometry(1.38, 0.095, 1.26, 8, 0.048), meshMat);
  seatCushion.position.set(0, 1.872, 0.018); chairGroup.add(seatCushion);
  const waterfall = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.038, 1.34, 28), meshLightMat);
  waterfall.rotation.z = Math.PI / 2; waterfall.position.set(0, 1.848, 0.624); chairGroup.add(waterfall);
  [-1, 1].forEach(s => {
    const bolster = new THREE.Mesh(new RoundedBoxGeometry(0.065, 0.058, 1.12, 6, 0.016), meshLightMat);
    bolster.position.set(s * 0.652, 1.898, 0.0); bolster.rotation.z = s * 0.055; chairGroup.add(bolster);
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.058, 1.32), frameMat);
    rib.position.set(s * 0.58, 1.764, 0); chairGroup.add(rib);
    [-0.66, 0.66].forEach(z => {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), frameMat);
      cap.position.set(s * 0.58, 1.764, z); cap.scale.set(1, 1.6, 1); chairGroup.add(cap);
    });
  });
  const connPlate = new THREE.Mesh(new RoundedBoxGeometry(1.44, 0.065, 0.18, 6, 0.014), frameMat);
  connPlate.position.set(0, 1.775, -0.605); chairGroup.add(connPlate);

  // TILT
  const tiltHousing = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.078, 0.44, 6, 0.018), dkAlumMat);
  tiltHousing.position.set(0, 1.748, -0.06); chairGroup.add(tiltHousing);
  const tiltLever = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.010, 0.22, 10), dkAlumMat);
  tiltLever.rotation.z = Math.PI / 2; tiltLever.position.set(-0.32, 1.732, -0.02); chairGroup.add(tiltLever);
  const tiltKnob = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 12), rubberMat);
  tiltKnob.position.set(-0.43, 1.732, -0.02); chairGroup.add(tiltKnob);
  const heightPaddle = new THREE.Mesh(new RoundedBoxGeometry(0.055, 0.018, 0.105, 4, 0.006), rubberMat);
  heightPaddle.position.set(0.28, 1.732, 0.14); chairGroup.add(heightPaddle);

  // BACKREST
  const backrestGroup = new THREE.Group();
  backrestGroup.position.set(0, 1.80, -0.605);
  [-1, 1].forEach(s => {
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.024, 1.80, 14), dkAlumMat);
    spine.position.set(s * 0.672, 0.910, -0.032); spine.rotation.z = s * 0.018; backrestGroup.add(spine);
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.68, 8), accentMat);
    stripe.position.set(s * 0.672, 0.910, 0.024); backrestGroup.add(stripe);
    [0.02, 1.82].forEach(y => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.022, 16), aluminiumMat);
      cap.position.set(s * 0.672, y, -0.032); backrestGroup.add(cap);
    });
  });
  const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.38, 14), dkAlumMat);
  topBar.rotation.z = Math.PI / 2; topBar.position.set(0, 1.805, -0.032); backrestGroup.add(topBar);
  [-0.692, 0.692].forEach(x => {
    const tc = new THREE.Mesh(new THREE.SphereGeometry(0.024, 14, 12), aluminiumMat);
    tc.position.set(x, 1.805, -0.032); backrestGroup.add(tc);
  });
  const botBar = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 1.36, 12), dkAlumMat);
  botBar.rotation.z = Math.PI / 2; botBar.position.set(0, 0.058, -0.032); backrestGroup.add(botBar);
  const midBar = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 1.26, 12), aluminiumMat);
  midBar.rotation.z = Math.PI / 2; midBar.position.set(0, 0.935, 0.012); backrestGroup.add(midBar);
  const backUpper = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.84, 0.048, 8, 0.020), meshLightMat);
  backUpper.position.set(0, 1.345, 0.006); backrestGroup.add(backUpper);
  const backUpperDetail = new THREE.Mesh(new RoundedBoxGeometry(1.14, 0.76, 0.036, 8, 0.018), new THREE.MeshStandardMaterial({ color: 0x044e86, roughness: 0.92, metalness: 0.02 }));
  backUpperDetail.position.set(0, 1.345, 0.012); backrestGroup.add(backUpperDetail);
  const backLower = new THREE.Mesh(new RoundedBoxGeometry(1.18, 0.72, 0.046, 8, 0.020), meshMat);
  backLower.position.set(0, 0.548, 0.006); backrestGroup.add(backLower);
  const backLowerDetail = new THREE.Mesh(new RoundedBoxGeometry(1.10, 0.64, 0.034, 8, 0.018), new THREE.MeshStandardMaterial({ color: 0x033659, roughness: 0.94, metalness: 0.02 }));
  backLowerDetail.position.set(0, 0.548, 0.012); backrestGroup.add(backLowerDetail);

  // LUMBAR
  const lumbarPod = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.195, 0.095, 8, 0.042), meshMat);
  lumbarPod.position.set(0, 0.345, 0.058); backrestGroup.add(lumbarPod);
  const lumbarFrame = new THREE.Mesh(new RoundedBoxGeometry(0.98, 0.230, 0.065, 6, 0.022), frameMat);
  lumbarFrame.position.set(0, 0.345, 0.028); backrestGroup.add(lumbarFrame);
  const lumbarAccent = new THREE.Mesh(new RoundedBoxGeometry(0.80, 0.028, 0.038, 4, 0.010), accentMat);
  lumbarAccent.position.set(0, 0.242, 0.065); backrestGroup.add(lumbarAccent);
  const lumbarDialH = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.022, 0.028, 20), dkAlumMat);
  lumbarDialH.rotation.z = Math.PI / 2; lumbarDialH.position.set(0.508, 0.345, 0.055); backrestGroup.add(lumbarDialH);
  const lumbarDial = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 0.038, 16), rubberMat);
  lumbarDial.rotation.z = Math.PI / 2; lumbarDial.position.set(0.525, 0.345, 0.055); backrestGroup.add(lumbarDial);

  // HEADREST
  const hrPostOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.195, 14), dkAlumMat);
  hrPostOuter.position.set(0, 1.692, -0.016); backrestGroup.add(hrPostOuter);
  const hrPostInner = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.145, 12), aluminiumMat);
  hrPostInner.position.set(0, 1.812, -0.016); backrestGroup.add(hrPostInner);
  const hrCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.034, 18), dkAlumMat);
  hrCollar.position.set(0, 1.756, -0.016); backrestGroup.add(hrCollar);
  const hrCollarRing = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.003, 8, 24), accentMat);
  hrCollarRing.rotation.x = Math.PI / 2; hrCollarRing.position.set(0, 1.773, -0.016); backrestGroup.add(hrCollarRing);
  const hrShell = new THREE.Mesh(new RoundedBoxGeometry(0.485, 0.265, 0.065, 8, 0.024), frameMat);
  hrShell.position.set(0, 1.892, -0.012); backrestGroup.add(hrShell);
  const hrPad = new THREE.Mesh(new RoundedBoxGeometry(0.425, 0.225, 0.044, 8, 0.022), meshMat);
  hrPad.position.set(0, 1.892, 0.018); backrestGroup.add(hrPad);
  [-1, 1].forEach(s => {
    const wing = new THREE.Mesh(new RoundedBoxGeometry(0.072, 0.185, 0.052, 6, 0.014), frameMat);
    wing.position.set(s * 0.272, 1.892, -0.012); wing.rotation.z = s * -0.14; wing.rotation.y = s * 0.08; backrestGroup.add(wing);
    const wingPad = new THREE.Mesh(new RoundedBoxGeometry(0.060, 0.158, 0.038, 6, 0.012), meshMat);
    wingPad.position.set(s * 0.272, 1.892, 0.015); wingPad.rotation.z = s * -0.14; wingPad.rotation.y = s * 0.08; backrestGroup.add(wingPad);
  });
  const badgeShell = new THREE.Mesh(new RoundedBoxGeometry(0.105, 0.044, 0.008, 4, 0.006), dkAlumMat);
  badgeShell.position.set(0, 1.638, -0.082); backrestGroup.add(badgeShell);
  const badgeGlow = new THREE.Mesh(new RoundedBoxGeometry(0.078, 0.026, 0.006, 4, 0.004), logoGlowMat);
  badgeGlow.position.set(0, 1.638, -0.076); backrestGroup.add(badgeGlow);
  chairGroup.add(backrestGroup);

  // ARMRESTS
  const armsGroup = new THREE.Group(); armsGroup.name = 'armsGroup';
  [-1, 1].forEach(s => {
    const ag = new THREE.Group(); ag.position.set(s * 0.815, 1.878, -0.052);
    const postOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.018, 0.192, 14), dkAlumMat);
    postOuter.position.set(0, 0.096, -0.008); ag.add(postOuter);
    const bracketH = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.028, 0.142), dkAlumMat);
    bracketH.position.set(0, 0.014, -0.071); ag.add(bracketH);
    const postRing = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.004, 8, 18), accentMat);
    postRing.rotation.x = Math.PI / 2; postRing.position.set(0, 0.175, -0.008); ag.add(postRing);
    const mountPlate = new THREE.Mesh(new RoundedBoxGeometry(0.155, 0.022, 0.415, 6, 0.009), dkAlumMat);
    mountPlate.position.set(0, 0.210, -0.010); ag.add(mountPlate);
    const padBody = new THREE.Mesh(new RoundedBoxGeometry(0.138, 0.030, 0.388, 8, 0.013), padMat);
    padBody.position.set(0, 0.228, -0.010); ag.add(padBody);
    const padSurface = new THREE.Mesh(new RoundedBoxGeometry(0.126, 0.012, 0.368, 8, 0.010), new THREE.MeshStandardMaterial({ color: 0x181c22, roughness: 0.86, metalness: 0.0 }));
    padSurface.position.set(0, 0.240, -0.010); ag.add(padSurface);
    const padAccent = new THREE.Mesh(new RoundedBoxGeometry(0.126, 0.008, 0.022, 4, 0.003), accentMat);
    padAccent.position.set(0, 0.228, s > 0 ? 0.194 : -0.194); ag.add(padAccent);
    armsGroup.add(ag);
  });
  chairGroup.add(armsGroup);

  // GAS LIFT
  const seatFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.092, 0.028, 22), frameMat);
  seatFlange.position.set(0, 1.762, 0); chairGroup.add(seatFlange);
  const cylUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.070, 0.485, 22), dkAlumMat);
  cylUpper.position.set(0, 1.512, 0); chairGroup.add(cylUpper);
  const pistonCap = new THREE.Mesh(new THREE.CylinderGeometry(0.070, 0.070, 0.025, 20), aluminiumMat);
  pistonCap.position.set(0, 1.262, 0); chairGroup.add(pistonCap);
  const pistonChrome = new THREE.Mesh(new THREE.CylinderGeometry(0.050, 0.050, 0.580, 20), aluminiumMat);
  pistonChrome.position.set(0, 0.975, 0); chairGroup.add(pistonChrome);
  const cylLower = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.088, 0.235, 20), dkAlumMat);
  cylLower.position.set(0, 0.568, 0); baseGroup.add(cylLower);
  const baseCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.092, 0.024, 22), aluminiumMat);
  baseCollar.position.set(0, 0.448, 0); chairGroup.add(baseCollar);

  // BASE
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.225, 0.048, 28), dkAlumMat);
  hub.position.set(0, 0.272, 0); baseGroup.add(hub);
  const hubTop = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.010, 24), aluminiumMat);
  hubTop.position.set(0, 0.298, 0); chairGroup.add(hubTop);
  const hubRing = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.007, 10, 36), accentMat);
  hubRing.rotation.x = Math.PI / 2; hubRing.position.set(0, 0.300, 0); baseGroup.add(hubRing);

  const wheels = [];
  [0, 72, 144, 216, 288].forEach(ang => {
    const rad = ang * Math.PI / 180;
    const lg = new THREE.Group(); lg.rotation.y = rad;
    const armGeo = new THREE.CylinderGeometry(0.028, 0.014, 1.18, 12);
    armGeo.rotateX(Math.PI / 2); armGeo.translate(0, 0, 0.59);
    const arm = new THREE.Mesh(armGeo, dkAlumMat);
    arm.position.set(0, 0.255, 0); arm.rotation.x = 0.195; lg.add(arm);
    const ribGeo = new THREE.CylinderGeometry(0.010, 0.006, 1.12, 8);
    ribGeo.rotateX(Math.PI / 2); ribGeo.translate(0, -0.018, 0.56);
    const rib = new THREE.Mesh(ribGeo, frameMat);
    rib.position.set(0, 0.255, 0); rib.rotation.x = 0.195; lg.add(rib);
    const reach = Math.cos(0.195) * 1.18, tipY = 0.255 - Math.sin(0.195) * 1.18;
    const yoke = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.046, 14), dkAlumMat);
    yoke.position.set(0, tipY + 0.012, reach); lg.add(yoke);
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.052, 10), aluminiumMat);
    axle.rotation.z = Math.PI / 2; axle.position.set(0, tipY - 0.012, reach); lg.add(axle);
    [-1, 1].forEach(s => {
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.019, 18), rubberMat);
      wh.rotation.z = Math.PI / 2; wh.position.set(s * 0.018, tipY - 0.025, reach);
      lg.add(wh); if (s === -1) wheels.push(wh);
      const hc = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.008, 14), dkAlumMat);
      hc.rotation.z = Math.PI / 2; hc.position.set(s * 0.030, tipY - 0.025, reach); lg.add(hc);
    });
    baseGroup.add(lg);
  });

  // IOT
  const sensorDots = [];
  const espBoard = new THREE.Mesh(new THREE.BoxGeometry(0.262, 0.188, 0.034), pcbMat);
  espBoard.position.set(0, 0.262, -0.078); backrestGroup.add(espBoard);
  const espChip = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.078, 0.012), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.8 }));
  espChip.position.set(-0.036, 0.262, -0.096); backrestGroup.add(espChip);
  const antenna = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.058, 0.007), aluminiumMat);
  antenna.position.set(0.085, 0.288, -0.096); backrestGroup.add(antenna);
  const statusLed = new THREE.Mesh(new THREE.SphereGeometry(0.008, 10, 10), sensorGlow.clone());
  statusLed.position.set(0.106, 0.210, -0.096); backrestGroup.add(statusLed); sensorDots.push(statusLed);
  const battery = new THREE.Mesh(new THREE.BoxGeometry(0.295, 0.050, 0.395), batteryMat);
  battery.position.set(0, 1.718, -0.172); chairGroup.add(battery);
  chairGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.718, -0.372), new THREE.Vector3(0, 1.718, -0.608), new THREE.Vector3(0, 1.975, -0.655)]), 12, 0.0040, 6, false), wireMat));
  backrestGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.036, 0.318, -0.074), new THREE.Vector3(-0.036, 0.975, -0.026)), 2, 0.0040, 6, false), wireMat));
  for (let r = -1; r <= 1; r++) for (let c = -1; c <= 1; c++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), sensorGlow.clone());
    d.position.set(c * 0.295, 1.918, r * 0.295); chairGroup.add(d); sensorDots.push(d);
  }
  for (let r = 0; r < 3; r++) for (let c = -1; c <= 1; c += 2) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), sensorGlow.clone());
    d.position.set(c * 0.255, 0.395 + r * 0.395, 0.052); backrestGroup.add(d); sensorDots.push(d);
  }
  return { root, chairGroup, backrestGroup, armsGroup, wheels, sensorDots };
}


export function initThreeScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const aspect = canvas.clientWidth / canvas.clientHeight || 1.5;
  const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
  camera.position.set(4.5, 3.8, 6.0); camera.lookAt(0.5, 1.8, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.55;

  scene.add(new THREE.AmbientLight(0xfff0e8, 2.2));
  const kL = new THREE.DirectionalLight(0xfff5ee, 2.4); kL.position.set(3, 7, 5); kL.castShadow = true; kL.shadow.mapSize.set(1024, 1024); scene.add(kL);
  const fL = new THREE.DirectionalLight(0xddeeff, 1.05); fL.position.set(-5, 3, -2); scene.add(fL);
  const rL = new THREE.PointLight(0x4488cc, 0.85, 12); rL.position.set(-2, 5, -3); scene.add(rL);
  const bL = new THREE.PointLight(0xffe8d0, 0.72, 8); bL.position.set(1.0, 0.5, 2.0); scene.add(bL);
  const sL = new THREE.PointLight(0x4a90d8, 0.50, 3.5); sL.position.set(0.8, 3.4, 1.5); scene.add(sL);
  const tL = new THREE.DirectionalLight(0xfff0e0, 0.95); tL.position.set(0, 10, 2); scene.add(tL);

  const sensorGlowMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.8, roughness: 0.2, metalness: 0.2 });

  const heatmapData = createHeatmapTexture();
  const heatPlane = new THREE.Mesh(new THREE.CircleGeometry(0.58, 48), new THREE.MeshBasicMaterial({ map: heatmapData.texture, transparent: true, opacity: 0.80, depthWrite: false, blending: THREE.AdditiveBlending }));
  heatPlane.rotation.x = -Math.PI / 2; heatPlane.position.set(0, 1.935, 0.038);

  const { root, chairGroup, backrestGroup, armsGroup, wheels, sensorDots } = buildChair(sensorGlowMat);
  root.position.x = 1.0;
  chairGroup.add(heatPlane);

  scene.add(root);

  const ringMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.3 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.005, 8, 100), ringMat);
  ring.rotation.x = Math.PI / 2.3; ring.position.set(1.0, 2, 0); scene.add(ring);
  const orbitDots = [];
  for (let i = 0; i < 3; i++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.8 }));
    scene.add(d); orbitDots.push({ mesh: d, angle: (Math.PI * 2 / 3) * i, speed: 0.4 });
  }

  const pCount = 25; const pGeo = new THREE.BufferGeometry(); const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) { pPos[i * 3] = (Math.random() - 0.5) * 8; pPos[i * 3 + 1] = Math.random() * 6; pPos[i * 3 + 2] = (Math.random() - 0.5) * 8; }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x8b5cf6, size: 0.025, transparent: true, opacity: 0.6 }));
  scene.add(particles);

  const shadowDisc = new THREE.Mesh(new THREE.CircleGeometry(1.2, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.05 }));
  shadowDisc.rotation.x = -Math.PI / 2; shadowDisc.position.set(1.0, -0.05, 0); scene.add(shadowDisc);

  const rippleMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const ripple = new THREE.Mesh(new THREE.TorusGeometry(0.60, 0.012, 8, 80), rippleMat);
  ripple.rotation.x = -Math.PI / 2; ripple.position.set(0, 1.94, 0); chairGroup.add(ripple);
  const ripple2Mat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const ripple2 = new THREE.Mesh(new THREE.TorusGeometry(0.60, 0.007, 8, 80), ripple2Mat);
  ripple2.rotation.x = -Math.PI / 2; ripple2.position.set(0, 1.94, 0); chairGroup.add(ripple2);
  let rippleActive = false, rippleT = 0, ripple2T = 0, lastAlertTime = -999;
  const RDUR = 1.4, RCOOL = 6.0;

  let hudFlash = 0, hudScore = 85;

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => { mouseX = (e.clientX / window.innerWidth - 0.5) * 2; mouseY = (e.clientY / window.innerHeight - 0.5) * 2; });

  function onResize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); }
  window.addEventListener('resize', onResize); onResize();

  function cSp(k = 0.08, d = 0.75) { return { value: 0, velocity: 0, target: 0, stiffness: k, damping: d }; }
  function sSp(s) { s.velocity = s.velocity * s.damping + (s.target - s.value) * s.stiffness; s.value += s.velocity; return s.value; }

  const recSp = cSp(0.055, 0.72), hgtSp = cSp(0.045, 0.78), armSp = cSp(0.10, 0.68);

  let time = 0; const dt = 1 / 60;

  function animate() {
    requestAnimationFrame(animate); time += dt;

    const rs = 0.005;
    root.rotation.y += rs;
    wheels.forEach(w => { w.rotation.x -= (rs * 0.94) / 0.06; });
    root.rotation.x += (mouseY * 0.06 - root.rotation.x) * 0.025;

    hgtSp.target = Math.sin(time * 1.2) * 0.12; sSp(hgtSp); chairGroup.position.y = hgtSp.value;
    recSp.target = (Math.sin(time * 0.8 + 2.0) + 1) * 0.20; sSp(recSp); backrestGroup.rotation.x = -recSp.value;
    armSp.target = (Math.sin(time * 1.5 + 4.0) + 1) * 0.038; sSp(armSp);
    const arms = chairGroup.getObjectByName('armsGroup'); if (arms) arms.position.y = armSp.value;



    sensorDots.forEach((dot, i) => { const t1 = (time * 3.0 + i * 0.6) % (Math.PI * 2); const pulse = Math.exp(-2 * Math.pow(t1 - 1.2, 2)) + 0.4 * Math.exp(-4 * Math.pow(t1 - 1.9, 2)); dot.material.emissiveIntensity = 0.5 + pulse * 1.8; dot.scale.setScalar(0.7 + pulse * 0.5); });

    hudFlash = Math.max(0, hudFlash - dt * 1.8);
    heatmapData.update(0, 0, 0.1);

    if (false) { lastAlertTime = time; rippleActive = true; rippleT = ripple2T = 0; hudFlash = 1.0; }
    if (rippleActive) {
      rippleT += dt / RDUR; ripple2T = Math.max(0, rippleT - 0.18);
      const r1s = THREE.MathUtils.lerp(1.0, 3.4, rippleT);
      const r1o = rippleT < 0.3 ? THREE.MathUtils.lerp(0, 0.9, rippleT / 0.3) : THREE.MathUtils.lerp(0.9, 0, (rippleT - 0.3) / 0.7);
      ripple.scale.set(r1s, r1s, r1s); rippleMat.opacity = Math.max(0, r1o);
      if (ripple2T > 0) { const r2s = THREE.MathUtils.lerp(1.0, 2.8, ripple2T); const r2o = ripple2T < 0.3 ? THREE.MathUtils.lerp(0, 0.6, ripple2T / 0.3) : THREE.MathUtils.lerp(0.6, 0, (ripple2T - 0.3) / 0.7); ripple2.scale.set(r2s, r2s, r2s); ripple2Mat.opacity = Math.max(0, r2o); }
      const at = Math.min(1, rippleT * 3) * (1 - Math.min(1, rippleT * 3));
      ringMat.color.setRGB(THREE.MathUtils.lerp(0.231, 0.98, at * 2), THREE.MathUtils.lerp(0.510, 0.75, at), THREE.MathUtils.lerp(0.965, 0.07, at * 2));
      if (rippleT < 0.35) { const rf = (0.35 - rippleT) / 0.35; sensorDots.forEach(d => { d.material.color.setRGB(1, 1 - rf * 0.6, 1 - rf * 0.85); d.material.emissive.setRGB(rf, 0.1 * rf, 0); }); }
      else { sensorDots.forEach(d => { d.material.color.setHex(0x0284c7); d.material.emissive.setHex(0x0284c7); }); }
      if (rippleT >= 1.0) { rippleActive = false; rippleMat.opacity = ripple2Mat.opacity = 0; ripple.scale.set(1, 1, 1); ripple2.scale.set(1, 1, 1); ringMat.color.setHex(0x3b82f6); }
    }

    ring.rotation.z = time * 0.1;
    orbitDots.forEach(d => { d.angle += 0.004 * d.speed; const tilt = Math.PI / 2.3; d.mesh.position.set(1.0 + Math.cos(d.angle) * 2.0, 2 + Math.sin(d.angle) * 2.0 * Math.cos(tilt), Math.sin(d.angle) * 2.0 * Math.sin(tilt)); });

    const pArr = particles.geometry.attributes.position.array;
    for (let i = 0; i < pCount; i++) { pArr[i * 3 + 1] += 0.001; if (pArr[i * 3 + 1] > 6) pArr[i * 3 + 1] = 0; }
    particles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();
}