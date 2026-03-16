import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three-stdlib';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

function createMaterials() {
  const frame = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.38, metalness: 0.82 });
  const shell = new THREE.MeshStandardMaterial({ color: 0x111217, roughness: 0.30, metalness: 0.75 });
  const fabric = new THREE.MeshStandardMaterial({ color: 0x0b1d30, roughness: 0.95, metalness: 0.0 });
  const fabricEdge = new THREE.MeshStandardMaterial({ color: 0x102840, roughness: 0.90, metalness: 0.0 });
  const aluminium = new THREE.MeshStandardMaterial({ color: 0xd4dae0, roughness: 0.03, metalness: 1.0, envMapIntensity: 1.2 });
  const dkAlum = new THREE.MeshStandardMaterial({ color: 0x282c30, roughness: 0.12, metalness: 0.94 });
  const midAlum = new THREE.MeshStandardMaterial({ color: 0x484e54, roughness: 0.18, metalness: 0.88 });
  const accent = new THREE.MeshStandardMaterial({ color: 0x00b4d8, roughness: 0.15, metalness: 0.65 });
  const accentGlow = new THREE.MeshStandardMaterial({ color: 0x00b4d8, emissive: 0x00b4d8, emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.4 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x080a0c, roughness: 0.96, metalness: 0.0 });
  const armPad = new THREE.MeshStandardMaterial({ color: 0x0d1015, roughness: 0.88, metalness: 0.0 });
  const pcb = new THREE.MeshStandardMaterial({ color: 0x012a00, roughness: 0.75, metalness: 0.12 });
  const chip = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.28, metalness: 0.85 });
  const wire = new THREE.MeshStandardMaterial({ color: 0xbb1a1a, roughness: 0.55, metalness: 0.45 });
  const battery = new THREE.MeshStandardMaterial({ color: 0x060608, roughness: 0.45, metalness: 0.35 });
  const logoGlow = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 2.2, roughness: 0.04, metalness: 0.0 });
  const sensorPressure = new THREE.MeshStandardMaterial({ color: 0xff3d3d, emissive: 0xff3d3d, emissiveIntensity: 1.0, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.92 });
  const sensorPosture = new THREE.MeshStandardMaterial({ color: 0x00c8ff, emissive: 0x00c8ff, emissiveIntensity: 1.0, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.92 });
  const sensorTemp = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 0.9, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.92 });
  const sensorIMU = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.9, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.92 });
  return { frame, shell, fabric, fabricEdge, aluminium, dkAlum, midAlum, accent, accentGlow, rubber, armPad, pcb, chip, wire, battery, logoGlow, sensorPressure, sensorPosture, sensorTemp, sensorIMU };
}

function createHeatmapTexture() {
  const SIZE = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = SIZE;
  const ctx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv);
  function update(ox, oy, intensity) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const cx = SIZE / 2 + ox * SIZE * 0.26, cy = SIZE / 2 + oy * SIZE * 0.26;
    const b = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE * 0.50);
    b.addColorStop(0, `rgba(0,180,216,${0.04 * intensity})`); b.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = b; ctx.fillRect(0, 0, SIZE, SIZE);
    const h1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, SIZE * 0.28);
    h1.addColorStop(0, `rgba(255,61,61,${0.80 * intensity})`); h1.addColorStop(0.35, `rgba(255,140,0,${0.55 * intensity})`);
    h1.addColorStop(0.70, `rgba(255,200,0,${0.20 * intensity})`); h1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = h1; ctx.fillRect(0, 0, SIZE, SIZE);
    const lx = cx + SIZE * 0.10, ly = cy + SIZE * 0.06;
    const h2 = ctx.createRadialGradient(lx, ly, 0, lx, ly, SIZE * 0.16);
    h2.addColorStop(0, `rgba(255,61,61,${0.42 * intensity})`); h2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = h2; ctx.fillRect(0, 0, SIZE, SIZE);
    tex.needsUpdate = true;
  }
  return { texture: tex, update };
}

function createBlobShadow() {
  const SIZE = 256; const cv = document.createElement('canvas'); cv.width = cv.height = SIZE;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.70)'); g.addColorStop(0.35, 'rgba(0,0,0,0.38)');
  g.addColorStop(0.72, 'rgba(0,0,0,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, SIZE, SIZE);
  const tex = new THREE.CanvasTexture(cv);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  mesh.rotation.x = -Math.PI / 2; mesh.position.set(0, -0.04, 0);
  return mesh;
}

function makeSensorDot(mat, radius, type, phase) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 12), mat);
  mesh.castShadow = false;
  return { mesh, type, phase };
}

function makeSensorRing(mat, ringRadius, tubeRadius) {
  return new THREE.Mesh(new THREE.TorusGeometry(ringRadius, tubeRadius, 6, 24), mat);
}

function buildSeat(mat, chairGroup, sensorDots) {
  const seatShell = new THREE.Mesh(new RoundedBoxGeometry(1.58, 0.090, 1.46, 8, 0.030), mat.frame);
  seatShell.position.y = 1.800; seatShell.castShadow = true; chairGroup.add(seatShell);
  const seatCushion = new THREE.Mesh(new RoundedBoxGeometry(1.40, 0.100, 1.28, 10, 0.052), mat.fabric);
  seatCushion.position.set(0, 1.874, 0.018); seatCushion.castShadow = true; chairGroup.add(seatCushion);
  const waterfall = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.040, 1.36, 32), mat.fabricEdge);
  waterfall.rotation.z = Math.PI / 2; waterfall.position.set(0, 1.850, 0.628); chairGroup.add(waterfall);
  [-1, 1].forEach(s => {
    const bolster = new THREE.Mesh(new RoundedBoxGeometry(0.068, 0.062, 1.14, 6, 0.018), mat.fabricEdge);
    bolster.position.set(s * 0.654, 1.900, 0); bolster.rotation.z = s * 0.055; chairGroup.add(bolster);
    const ribShell = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.060, 1.34), mat.frame);
    ribShell.position.set(s * 0.582, 1.765, 0); chairGroup.add(ribShell);
    [-0.67, 0.67].forEach(z => {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.019, 14, 10), mat.frame);
      cap.position.set(s * 0.582, 1.765, z); cap.scale.set(1, 1.6, 1); chairGroup.add(cap);
    });
  });
  const connPlate = new THREE.Mesh(new RoundedBoxGeometry(1.46, 0.068, 0.18, 6, 0.014), mat.dkAlum);
  connPlate.position.set(0, 1.778, -0.608); chairGroup.add(connPlate);
  const accentStrip = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.006, 0.008), mat.accentGlow);
  accentStrip.position.set(0, 1.865, 0.642); chairGroup.add(accentStrip);
  const tiltHousing = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.080, 0.46, 6, 0.020), mat.dkAlum);
  tiltHousing.position.set(0, 1.750, -0.06); chairGroup.add(tiltHousing);
  const tiltAccentLine = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.004, 0.005), mat.accentGlow);
  tiltAccentLine.position.set(0, 1.792, -0.04); chairGroup.add(tiltAccentLine);
  const tiltLever = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.011, 0.24, 12), mat.dkAlum);
  tiltLever.rotation.z = Math.PI / 2; tiltLever.position.set(-0.33, 1.733, -0.02); chairGroup.add(tiltLever);
  const tiltKnob = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 14), mat.rubber);
  tiltKnob.position.set(-0.45, 1.733, -0.02); chairGroup.add(tiltKnob);
  const heightPaddle = new THREE.Mesh(new RoundedBoxGeometry(0.058, 0.020, 0.110, 4, 0.006), mat.rubber);
  heightPaddle.position.set(0.29, 1.733, 0.14); chairGroup.add(heightPaddle);
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      const sd = makeSensorDot(mat.sensorPressure.clone(), 0.016, 'pressure', (r * 3 + c + 4) * 0.38);
      sd.mesh.position.set(c * 0.30, 1.928, r * 0.28); chairGroup.add(sd.mesh);
      const ring = makeSensorRing(mat.sensorPressure, 0.028, 0.003);
      ring.rotation.x = Math.PI / 2; ring.position.copy(sd.mesh.position); ring.position.y += 0.001;
      chairGroup.add(ring); sensorDots.push(sd);
    }
  }
}

function buildBackrest(mat, chairGroup, sensorDots) {
  const backrestGroup = new THREE.Group();
  backrestGroup.position.set(0, 1.80, -0.608);
  [-1, 1].forEach(s => {
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.026, 1.82, 16), mat.dkAlum);
    spine.position.set(s * 0.674, 0.912, -0.034); spine.rotation.z = s * 0.018; backrestGroup.add(spine);
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.72, 8), mat.accentGlow);
    stripe.position.set(s * 0.674, 0.912, 0.026); backrestGroup.add(stripe);
    [0.02, 1.84].forEach(y => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.024, 18), mat.aluminium);
      cap.position.set(s * 0.674, y, -0.034); backrestGroup.add(cap);
    });
  });
  const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 1.40, 16), mat.dkAlum);
  topBar.rotation.z = Math.PI / 2; topBar.position.set(0, 1.808, -0.034); backrestGroup.add(topBar);
  [-0.694, 0.694].forEach(x => {
    const tc = new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 14), mat.aluminium);
    tc.position.set(x, 1.808, -0.034); backrestGroup.add(tc);
  });
  const botBar = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 1.38, 14), mat.dkAlum);
  botBar.rotation.z = Math.PI / 2; botBar.position.set(0, 0.060, -0.034); backrestGroup.add(botBar);
  const backUpper = new THREE.Mesh(new RoundedBoxGeometry(1.24, 0.86, 0.050, 10, 0.022), mat.fabricEdge);
  backUpper.position.set(0, 1.348, 0.006); backrestGroup.add(backUpper);
  const backUpperInner = new THREE.Mesh(new RoundedBoxGeometry(1.16, 0.78, 0.038, 10, 0.020), mat.fabric);
  backUpperInner.position.set(0, 1.348, 0.014); backrestGroup.add(backUpperInner);
  const upperAccent = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.005, 0.006), mat.accentGlow);
  upperAccent.position.set(0, 1.765, 0.018); backrestGroup.add(upperAccent);
  const backLower = new THREE.Mesh(new RoundedBoxGeometry(1.20, 0.74, 0.048, 10, 0.022), mat.fabric);
  backLower.position.set(0, 0.550, 0.006); backrestGroup.add(backLower);
  const backLowerShell = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.80, 0.036, 10, 0.020), mat.shell);
  backLowerShell.position.set(0, 0.550, -0.004); backrestGroup.add(backLowerShell);
  const lumbarShell = new THREE.Mesh(new RoundedBoxGeometry(1.00, 0.240, 0.070, 8, 0.024), mat.shell);
  lumbarShell.position.set(0, 0.347, 0.028); backrestGroup.add(lumbarShell);
  const lumbarPod = new THREE.Mesh(new RoundedBoxGeometry(0.94, 0.200, 0.100, 8, 0.044), mat.fabric);
  lumbarPod.position.set(0, 0.347, 0.062); backrestGroup.add(lumbarPod);
  const lumbarAccent = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.005, 0.006), mat.accentGlow);
  lumbarAccent.position.set(0, 0.248, 0.068); backrestGroup.add(lumbarAccent);
  const lumbarDialH = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.024, 0.030, 22), mat.dkAlum);
  lumbarDialH.rotation.z = Math.PI / 2; lumbarDialH.position.set(0.510, 0.347, 0.058); backrestGroup.add(lumbarDialH);
  const lumbarDial = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.040, 18), mat.rubber);
  lumbarDial.rotation.z = Math.PI / 2; lumbarDial.position.set(0.528, 0.347, 0.058); backrestGroup.add(lumbarDial);
  const hrPostOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.200, 16), mat.dkAlum);
  hrPostOuter.position.set(0, 1.695, -0.018); backrestGroup.add(hrPostOuter);
  const hrPostInner = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.150, 14), mat.aluminium);
  hrPostInner.position.set(0, 1.818, -0.018); backrestGroup.add(hrPostInner);
  const hrCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.030, 0.036, 20), mat.dkAlum);
  hrCollar.position.set(0, 1.760, -0.018); backrestGroup.add(hrCollar);
  const hrCollarRing = new THREE.Mesh(new THREE.TorusGeometry(0.030, 0.003, 8, 28), mat.accentGlow);
  hrCollarRing.rotation.x = Math.PI / 2; hrCollarRing.position.set(0, 1.778, -0.018); backrestGroup.add(hrCollarRing);
  const hrShell = new THREE.Mesh(new RoundedBoxGeometry(0.495, 0.270, 0.068, 8, 0.026), mat.shell);
  hrShell.position.set(0, 1.896, -0.014); backrestGroup.add(hrShell);
  const hrPad = new THREE.Mesh(new RoundedBoxGeometry(0.432, 0.230, 0.046, 8, 0.024), mat.fabric);
  hrPad.position.set(0, 1.896, 0.020); backrestGroup.add(hrPad);
  [-1, 1].forEach(s => {
    const wing = new THREE.Mesh(new RoundedBoxGeometry(0.075, 0.190, 0.054, 6, 0.015), mat.shell);
    wing.position.set(s * 0.274, 1.896, -0.014); wing.rotation.z = s * -0.14; wing.rotation.y = s * 0.08; backrestGroup.add(wing);
    const wingPad = new THREE.Mesh(new RoundedBoxGeometry(0.062, 0.162, 0.040, 6, 0.013), mat.fabric);
    wingPad.position.set(s * 0.274, 1.896, 0.018); wingPad.rotation.z = s * -0.14; wingPad.rotation.y = s * 0.08; backrestGroup.add(wingPad);
  });
  const badgeShell = new THREE.Mesh(new RoundedBoxGeometry(0.110, 0.046, 0.009, 4, 0.006), mat.dkAlum);
  badgeShell.position.set(0, 1.640, -0.085); backrestGroup.add(badgeShell);
  const badgeGlow = new THREE.Mesh(new RoundedBoxGeometry(0.082, 0.028, 0.007, 4, 0.004), mat.logoGlow);
  badgeGlow.position.set(0, 1.640, -0.078); backrestGroup.add(badgeGlow);
  chairGroup.add(backrestGroup);
  for (let r = 0; r < 3; r++) {
    for (let c = -1; c <= 1; c += 2) {
      const sd = makeSensorDot(mat.sensorPosture.clone(), 0.013, 'posture', r * 0.85 + c * 0.28);
      sd.mesh.position.set(c * 0.258, 0.38 + r * 0.40, 0.055); backrestGroup.add(sd.mesh);
      const ring = makeSensorRing(mat.sensorPosture, 0.022, 0.0025);
      ring.rotation.x = Math.PI / 2; ring.position.copy(sd.mesh.position); backrestGroup.add(ring);
      sensorDots.push(sd);
    }
  }
  [-0.22, 0.22].forEach((x, i) => {
    const sd = makeSensorDot(mat.sensorTemp.clone(), 0.012, 'temp', i * 1.2);
    sd.mesh.position.set(x, 1.22, 0.030); backrestGroup.add(sd.mesh);
    const ring = makeSensorRing(mat.sensorTemp, 0.020, 0.0022);
    ring.rotation.x = Math.PI / 2; ring.position.copy(sd.mesh.position); backrestGroup.add(ring);
    sensorDots.push(sd);
  });
  return backrestGroup;
}

function buildArmrests(mat, chairGroup) {
  const armsGroup = new THREE.Group(); armsGroup.name = 'armsGroup';
  [-1, 1].forEach(s => {
    const ag = new THREE.Group(); ag.position.set(s * 0.818, 1.880, -0.054);
    const postOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.020, 0.196, 16), mat.dkAlum);
    postOuter.position.set(0, 0.098, -0.008); ag.add(postOuter);
    const postAccent = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.003, 8, 20), mat.accentGlow);
    postAccent.rotation.x = Math.PI / 2; postAccent.position.set(0, 0.178, -0.008); ag.add(postAccent);
    const bracketH = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.030, 0.145), mat.dkAlum);
    bracketH.position.set(0, 0.015, -0.073); ag.add(bracketH);
    const mountPlate = new THREE.Mesh(new RoundedBoxGeometry(0.158, 0.024, 0.420, 6, 0.010), mat.dkAlum);
    mountPlate.position.set(0, 0.212, -0.010); ag.add(mountPlate);
    const padBody = new THREE.Mesh(new RoundedBoxGeometry(0.140, 0.032, 0.392, 8, 0.014), mat.armPad);
    padBody.position.set(0, 0.230, -0.010); ag.add(padBody);
    const padSurface = new THREE.Mesh(new RoundedBoxGeometry(0.128, 0.013, 0.372, 8, 0.011), new THREE.MeshStandardMaterial({ color: 0x131820, roughness: 0.84, metalness: 0.0 }));
    padSurface.position.set(0, 0.242, -0.010); ag.add(padSurface);
    const padAccent = new THREE.Mesh(new RoundedBoxGeometry(0.128, 0.009, 0.024, 4, 0.003), mat.accentGlow);
    padAccent.position.set(0, 0.230, s > 0 ? 0.196 : -0.196); ag.add(padAccent);
    armsGroup.add(ag);
  });
  chairGroup.add(armsGroup);
  return armsGroup;
}

function buildBase(mat, chairGroup, baseGroup) {
  const WHEEL_RADIUS = 0.050;
  const seatFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.094, 0.030, 24), mat.frame);
  seatFlange.position.set(0, 1.764, 0); chairGroup.add(seatFlange);
  const cylUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.080, 0.072, 0.490, 24), mat.dkAlum);
  cylUpper.position.set(0, 1.514, 0); chairGroup.add(cylUpper);
  const pistonCap = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.026, 22), mat.aluminium);
  pistonCap.position.set(0, 1.264, 0); chairGroup.add(pistonCap);
  const pistonChrome = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 1.10, 22), mat.aluminium);
  pistonChrome.position.set(0, 0.720, 0); chairGroup.add(pistonChrome);
  const cylLower = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.090, 0.240, 22), mat.dkAlum);
  cylLower.position.set(0, 0.570, 0); baseGroup.add(cylLower);
  const baseCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.094, 0.094, 0.026, 24), mat.aluminium);
  baseCollar.position.set(0, 0.450, 0); chairGroup.add(baseCollar);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.188, 0.228, 0.050, 30), mat.dkAlum);
  hub.position.set(0, 0.274, 0); baseGroup.add(hub);
  const hubTop = new THREE.Mesh(new THREE.CylinderGeometry(0.158, 0.158, 0.012, 26), mat.aluminium);
  hubTop.position.set(0, 0.300, 0); chairGroup.add(hubTop);
  const hubRing = new THREE.Mesh(new THREE.TorusGeometry(0.168, 0.006, 10, 40), mat.accentGlow);
  hubRing.rotation.x = Math.PI / 2; hubRing.position.set(0, 0.302, 0); baseGroup.add(hubRing);
  const wheels = [];
  [0, 72, 144, 216, 288].forEach(ang => {
    const rad = ang * Math.PI / 180;
    const lg = new THREE.Group(); lg.rotation.y = rad;
    const armGeo = new THREE.CylinderGeometry(0.030, 0.016, 1.20, 14);
    armGeo.rotateX(Math.PI / 2); armGeo.translate(0, 0, 0.60);
    const arm = new THREE.Mesh(armGeo, mat.dkAlum);
    arm.position.set(0, 0.257, 0); arm.rotation.x = 0.195; lg.add(arm);
    const reach = Math.cos(0.195) * 1.20, tipY = 0.257 - Math.sin(0.195) * 1.20;
    const yoke = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.048, 16), mat.dkAlum);
    yoke.position.set(0, tipY + 0.014, reach); lg.add(yoke);
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.054, 12), mat.aluminium);
    axle.rotation.z = Math.PI / 2; axle.position.set(0, tipY - 0.012, reach); lg.add(axle);
    [-1, 1].forEach(s => {
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, 0.020, 20), mat.rubber);
      wh.rotation.z = Math.PI / 2; wh.position.set(s * 0.019, tipY - 0.025, reach); lg.add(wh);
      if (s === -1) wheels.push({ mesh: wh, radius: WHEEL_RADIUS });
      const hc = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.009, 16), mat.midAlum);
      hc.rotation.z = Math.PI / 2; hc.position.set(s * 0.032, tipY - 0.025, reach); lg.add(hc);
    });
    baseGroup.add(lg);
  });
  return wheels;
}

function buildIoT(mat, chairGroup, backrestGroup, sensorDots) {
  const espBoard = new THREE.Mesh(new THREE.BoxGeometry(0.268, 0.192, 0.036), mat.pcb);
  espBoard.position.set(0, 0.264, -0.080); backrestGroup.add(espBoard);
  const espChip = new THREE.Mesh(new THREE.BoxGeometry(0.080, 0.080, 0.013), mat.chip);
  espChip.position.set(-0.038, 0.264, -0.098); backrestGroup.add(espChip);
  const antenna = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.060, 0.008), mat.aluminium);
  antenna.position.set(0.087, 0.290, -0.098); backrestGroup.add(antenna);
  const statusLed = makeSensorDot(mat.sensorIMU.clone(), 0.009, 'imu', 0);
  statusLed.mesh.position.set(0.108, 0.212, -0.098); backrestGroup.add(statusLed.mesh);
  sensorDots.push(statusLed);
  const battery = new THREE.Mesh(new THREE.BoxGeometry(0.298, 0.052, 0.398), mat.battery);
  battery.position.set(0, 1.720, -0.175); chairGroup.add(battery);
  chairGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.720, -0.374), new THREE.Vector3(0, 1.720, -0.612), new THREE.Vector3(0, 1.978, -0.658)]), 14, 0.0042, 6, false), mat.wire));
  backrestGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.038, 0.320, -0.076), new THREE.Vector3(-0.038, 0.978, -0.028)), 2, 0.0042, 6, false), mat.wire));
}

function buildChair(mat) {
  const root = new THREE.Group(), chairGroup = new THREE.Group(), baseGroup = new THREE.Group();
  root.add(chairGroup); root.add(baseGroup);
  const sensorDots = [];
  buildSeat(mat, chairGroup, sensorDots);
  const backrestGroup = buildBackrest(mat, chairGroup, sensorDots);
  buildArmrests(mat, chairGroup);
  const wheels = buildBase(mat, chairGroup, baseGroup);
  buildIoT(mat, chairGroup, backrestGroup, sensorDots);
  return { root, chairGroup, backrestGroup, wheels, sensorDots };
}

function cSp(k = 0.08, d = 0.75) { return { value: 0, velocity: 0, target: 0, stiffness: k, damping: d }; }
function sSp(s) { s.velocity = s.velocity * s.damping + (s.target - s.value) * s.stiffness; s.value += s.velocity; return s.value; }

function updatePhysics(dt, time, sp, root, chairGroup, backrestGroup, wheels, mouseX, mouseY) {
  const rs = 0.0045;
  root.rotation.y += rs;
  wheels.forEach(w => { w.mesh.rotation.x -= rs / w.radius; });
  sp.rotXSp.target = mouseY * 0.022; sp.rotYSp.target = mouseX * 0.012;
  sSp(sp.rotXSp); sSp(sp.rotYSp);
  root.rotation.x = sp.rotXSp.value;
  sp.hgtSp.target = Math.sin(time * 0.7) * 0.045; sSp(sp.hgtSp);
  chairGroup.position.y = sp.hgtSp.value;
  const reclineTarget = Math.sin(time * 0.28) * 0.06 + 0.04;
  sp.recSp.target = Math.max(0, Math.min(0.10, reclineTarget)); sSp(sp.recSp);
  backrestGroup.rotation.x = -sp.recSp.value;
  sp.armSp.target = Math.sin(time * 0.7 + 0.3) * 0.012 + 0.008; sSp(sp.armSp);
  const arms = chairGroup.getObjectByName('armsGroup');
  if (arms) arms.position.y = sp.armSp.value;
}

const SENSOR_PROFILE = {
  pressure: { base: 0.55, amp: 1.2, speed: 1.8, minScale: 0.88, maxScale: 1.18 },
  posture: { base: 0.60, amp: 1.0, speed: 2.2, minScale: 0.90, maxScale: 1.15 },
  temp: { base: 0.45, amp: 0.7, speed: 0.9, minScale: 0.92, maxScale: 1.10 },
  imu: { base: 0.50, amp: 0.9, speed: 3.0, minScale: 0.90, maxScale: 1.12 },
};

function updateSensorFX(time, sensorDots) {
  sensorDots.forEach(({ mesh, type, phase }) => {
    const p = SENSOR_PROFILE[type] || SENSOR_PROFILE.posture;
    const pulse = (Math.sin(time * p.speed + phase) + 1) * 0.5;
    mesh.material.emissiveIntensity = p.base + pulse * p.amp;
    mesh.scale.setScalar(p.minScale + pulse * (p.maxScale - p.minScale));
  });
}

function updateRippleFX(dt, state, ripple, rippleMat, ripple2, ripple2Mat, ringMat, sensorDots) {
  if (!state.active) return;
  const RDUR = 1.5;
  state.t += dt / RDUR; state.t2 = Math.max(0, state.t - 0.20);
  const r1s = THREE.MathUtils.lerp(1.0, 3.6, state.t);
  const r1o = state.t < 0.25 ? THREE.MathUtils.lerp(0, 1.0, state.t / 0.25) : THREE.MathUtils.lerp(1.0, 0, (state.t - 0.25) / 0.75);
  ripple.scale.set(r1s, r1s, r1s); rippleMat.opacity = Math.max(0, r1o);
  if (state.t2 > 0) {
    const r2s = THREE.MathUtils.lerp(1.0, 3.0, state.t2);
    const r2o = state.t2 < 0.25 ? THREE.MathUtils.lerp(0, 0.65, state.t2 / 0.25) : THREE.MathUtils.lerp(0.65, 0, (state.t2 - 0.25) / 0.75);
    ripple2.scale.set(r2s, r2s, r2s); ripple2Mat.opacity = Math.max(0, r2o);
  }
  const at = Math.min(1, state.t * 3) * (1 - Math.min(1, state.t * 3));
  ringMat.color.setRGB(THREE.MathUtils.lerp(0.0, 1.0, at * 2), THREE.MathUtils.lerp(0.7, 0.24, at), THREE.MathUtils.lerp(0.85, 0.04, at * 2));
  if (state.t < 0.40) {
    const rf = (0.40 - state.t) / 0.40;
    sensorDots.forEach(({ mesh }) => { mesh.material.color.setRGB(1, 1 - rf * 0.65, 1 - rf * 0.90); mesh.material.emissive.setRGB(rf, 0.08 * rf, 0); });
  } else {
    const cols = { pressure: 0xff3d3d, posture: 0x00c8ff, temp: 0xffaa00, imu: 0x00ff88 };
    sensorDots.forEach(({ mesh, type }) => { const c = cols[type] || 0x00c8ff; mesh.material.color.setHex(c); mesh.material.emissive.setHex(c); });
  }
  if (state.t >= 1.0) {
    state.active = false; rippleMat.opacity = ripple2Mat.opacity = 0;
    ripple.scale.set(1, 1, 1); ripple2.scale.set(1, 1, 1); ringMat.color.setHex(0x00b4d8);
  }
}

function updateParticles(particles, pCount) {
  const arr = particles.geometry.attributes.position.array;
  for (let i = 0; i < pCount; i++) { arr[i * 3 + 1] += 0.0008; if (arr[i * 3 + 1] > 6) arr[i * 3 + 1] = 0; }
  particles.geometry.attributes.position.needsUpdate = true;
}

function updateBlobShadow(blobShadow, chairY) {
  const s = 1.0 - chairY * 0.15;
  blobShadow.scale.set(s, 1, s);
  blobShadow.material.opacity = 0.80 - Math.abs(chairY) * 0.28;
}

function debounce(fn, ms = 120) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }

export function initThreeScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) { console.error('hero-canvas not found'); return; }
  console.log('canvas size:', canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  const aspect = canvas.clientWidth / canvas.clientHeight || 1.5;
  const camera = new THREE.PerspectiveCamera(32, aspect, 0.1, 200);
  camera.position.set(5.5, 3.5, 8.5);
  camera.lookAt(0.4, 1.0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.65;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const pmremGen = new THREE.PMREMGenerator(renderer);
  pmremGen.compileEquirectangularShader();
  const envTexture = pmremGen.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture; pmremGen.dispose();

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const kL = new THREE.DirectionalLight(0xfff8f0, 3.2); kL.position.set(4, 8, 5); kL.castShadow = true; kL.shadow.mapSize.set(2048, 2048); kL.shadow.camera.near = 0.5; kL.shadow.camera.far = 30; kL.shadow.bias = -0.0004; scene.add(kL);
  const rL = new THREE.DirectionalLight(0x90d8ff, 1.4); rL.position.set(-4, 4, -5); scene.add(rL);
  const fL = new THREE.DirectionalLight(0xd0eeff, 0.85); fL.position.set(-3, 2, 4); scene.add(fL);
  const uL = new THREE.PointLight(0x4488aa, 0.35, 10); uL.position.set(0, -1, 1); scene.add(uL);
  const tL = new THREE.DirectionalLight(0xffffff, 0.70); tL.position.set(0, 12, 0); scene.add(tL);

  const mat = createMaterials();

  const { root, chairGroup, backrestGroup, wheels, sensorDots } = buildChair(mat);

  // ── Interactivity ──
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredPart = null;

  const labelsOverlay = document.createElement('div');
  labelsOverlay.id = 'three-labels-overlay';
  labelsOverlay.style.cssText = 'position:absolute; top:0; left:0; pointer-events:none; width:100%; height:100%; z-index:10;';
  canvas.parentElement.appendChild(labelsOverlay);
  
  const sensorLabels = [];
  const labelTypes = { pressure: "Pressure Sensor", posture: "Posture Sensor", temp: "Temp Sensor", imu: "IMU / Motion" };
  sensorDots.forEach(sd => {
    const div = document.createElement('div');
    div.style.cssText = 'position:absolute; background:rgba(0,0,0,0.8); color:white; padding:4px 8px; border-radius:4px; font-size:10px; border-left:2px solid #00b4d8; opacity:0; pointer-events:none; white-space:nowrap; transition:opacity 0.2s;';
    div.innerText = labelTypes[sd.type] || "Sensor";
    labelsOverlay.appendChild(div);
    sensorLabels.push({ div, dot: sd.mesh });
  });

  const heatmapData = createHeatmapTexture();
  const heatPlane = new THREE.Mesh(new THREE.CircleGeometry(0.60, 64), new THREE.MeshBasicMaterial({ map: heatmapData.texture, transparent: true, opacity: 0.78, depthWrite: false, blending: THREE.AdditiveBlending }));
  heatPlane.rotation.x = -Math.PI / 2; heatPlane.position.set(0, 1.938, 0.040);

  root.position.set(1.0, -0.6, 0); chairGroup.add(heatPlane); scene.add(root);

  const blobShadow = createBlobShadow(); blobShadow.position.set(1.0, -0.6, 0); scene.add(blobShadow);

  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00b4d8, transparent: true, opacity: 0.18 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.003, 8, 120), ringMat);
  ring.rotation.x = Math.PI / 2.8; ring.rotation.z = 0.3; ring.position.set(1.0, 1.2, 0); scene.add(ring);
  const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x0066ff, transparent: true, opacity: 0.10 });
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.002, 8, 120), ring2Mat);
  ring2.rotation.x = Math.PI / 2.2; ring2.rotation.y = 0.6; ring2.position.set(1.0, 1.2, 0); scene.add(ring2);

  const orbitDots = [];
  for (let i = 0; i < 4; i++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(i < 2 ? 0.022 : 0.015, 10, 10), new THREE.MeshBasicMaterial({ color: i < 2 ? 0x00c8ff : 0x0066ff, transparent: true, opacity: i < 2 ? 0.80 : 0.50 }));
    scene.add(d); orbitDots.push({ mesh: d, angle: (Math.PI * 2 / 4) * i, speed: i < 2 ? 0.32 : 0.22, r: i < 2 ? 2.4 : 3.0, tiltX: i < 2 ? Math.PI / 2.8 : Math.PI / 2.2 });
  }

  const pCount = 40; const pGeo = new THREE.BufferGeometry(); const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) { pPos[i * 3] = (Math.random() - 0.5) * 10; pPos[i * 3 + 1] = Math.random() * 7; pPos[i * 3 + 2] = (Math.random() - 0.5) * 10; }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x00b4d8, size: 0.018, transparent: true, opacity: 0.45 }));
  scene.add(particles);

  const rippleMat = new THREE.MeshBasicMaterial({ color: 0x00b4d8, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const ripple = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.010, 8, 90), rippleMat);
  ripple.rotation.x = -Math.PI / 2; ripple.position.set(0, 1.942, 0); chairGroup.add(ripple);
  const ripple2Mat = new THREE.MeshBasicMaterial({ color: 0x0055ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const ripple2 = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.006, 8, 90), ripple2Mat);
  ripple2.rotation.x = -Math.PI / 2; ripple2.position.set(0, 1.942, 0); chairGroup.add(ripple2);

  const rippleState = { active: false, t: 0, t2: 0 };
  let lastAlertTime = -999;
  const ALERT_INTERVAL = 9.0;

  let mouseX = 0, mouseY = 0;
  const onMouseMove = e => { 
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2; 
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2; 
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };
  document.addEventListener('mousemove', onMouseMove);

  const onResize = debounce(() => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); });
  window.addEventListener('resize', onResize); onResize();

  const sp = {
    recSp: cSp(0.028, 0.88), hgtSp: cSp(0.022, 0.90),
    armSp: cSp(0.045, 0.85), rotXSp: cSp(0.018, 0.90), rotYSp: cSp(0.018, 0.90),
  };

  let time = 0; const dt = 1 / 60; let animId;

  function animate() {
    animId = requestAnimationFrame(animate); time += dt;
    updatePhysics(dt, time, sp, root, chairGroup, backrestGroup, wheels, mouseX, mouseY);
    updateSensorFX(time, sensorDots);
    heatmapData.update(Math.sin(time * 0.18) * 0.38, Math.cos(time * 0.24) * 0.38, 0.055 + 0.025 * Math.sin(time * 0.55));
    if (time - lastAlertTime > ALERT_INTERVAL) { lastAlertTime = time; rippleState.active = true; rippleState.t = 0; rippleState.t2 = 0; }
    updateRippleFX(dt, rippleState, ripple, rippleMat, ripple2, ripple2Mat, ringMat, sensorDots);
    ring.rotation.z += 0.0015; ring2.rotation.z -= 0.0008;
    orbitDots.forEach(d => {
      d.angle += 0.003 * d.speed;
      d.mesh.position.set(1.0 + Math.cos(d.angle) * d.r, 1.2 + Math.sin(d.angle) * d.r * Math.cos(d.tiltX), Math.sin(d.angle) * d.r * Math.sin(d.tiltX));
    });
    updateParticles(particles, pCount);
    updateBlobShadow(blobShadow, sp.hgtSp.value);

    // Update Raycasting
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(chairGroup.children, true);
    if (hoveredPart) { hoveredPart.material.emissive.setHex(hoveredPart.userData.oldEmissive || 0); hoveredPart = null; }
    if (intersects.length > 0) {
      const part = intersects[0].object;
      if (part.material && part.material.emissive) {
        hoveredPart = part;
        if (part.userData.oldEmissive === undefined) part.userData.oldEmissive = part.material.emissive.getHex();
        part.material.emissive.setHex(0x0055ff);
      }
    }

    // Update Labels
    const v = new THREE.Vector3();
    sensorLabels.forEach(sl => {
      v.setFromMatrixPosition(sl.dot.matrixWorld);
      v.project(camera);
      const dist = camera.position.distanceTo(v.setFromMatrixPosition(sl.dot.matrixWorld));
      if (v.z < 1 && dist < 10) {
        sl.div.style.transform = `translate(${(v.x * 0.5 + 0.5) * canvas.clientWidth + 10}px, ${(-(v.y * 0.5) + 0.5) * canvas.clientHeight - 10}px)`;
        sl.div.style.opacity = (dist < 6) ? 1 : 0;
      } else { sl.div.style.opacity = 0; }
    });

    renderer.render(scene, camera);
  }

  animate();

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('mousemove', onMouseMove);
    renderer.dispose(); envTexture.dispose();
  };
}