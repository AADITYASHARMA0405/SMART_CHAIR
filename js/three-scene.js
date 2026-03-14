import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three-stdlib';

export function initThreeScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();

  const aspect = canvas.clientWidth / canvas.clientHeight || 1.5;
  const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 1000);
  camera.position.set(4.5, 4.2, 6.8);
  camera.lookAt(0, 1.8, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.6;

  // === Soft studio lighting ===
  const ambient = new THREE.AmbientLight(0xffffff, 1.8);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
  keyLight.position.set(4, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xdae8e0, 0.8);
  fillLight.position.set(-4, 4, -2);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0x2a7d6b, 0.8, 15);
  rimLight.position.set(-2, 4, -3);
  scene.add(rimLight);

  // === Materials — clean, visible on light bg ===
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x2c2c2c,
    roughness: 0.55,
    metalness: 0.3,
  });

  const meshMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Clinical Blue for the mesh/cushions
    roughness: 0.7,
    metalness: 0.15,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.15,
    metalness: 0.95,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Clinical Blue Accent
    roughness: 0.35,
    metalness: 0.4,
  });

  const sensorGlow = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Clinical Blue Glow
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.2,
  });

  const pcbMat = new THREE.MeshStandardMaterial({
    color: 0x004400,
    roughness: 0.8,
    metalness: 0.1,
  });

  const wireMat = new THREE.MeshStandardMaterial({
    color: 0xcc3333,
    roughness: 0.5,
    metalness: 0.8,
  });

  const batteryMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.4,
    metalness: 0.2,
  });

  // === Build Chair ===
  const chairGroup = new THREE.Group();
  chairGroup.position.x = 1.0; // Shift the entire chair assembly to the right

  // Seat pan
  const seat = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.1, 1.4, 4, 0.02), darkMat);
  seat.position.y = 1.8;
  seat.castShadow = true;
  chairGroup.add(seat);

  // Seat cushion
  const cushion = new THREE.Mesh(new RoundedBoxGeometry(1.35, 0.12, 1.25, 4, 0.04), meshMat);
  cushion.position.set(0, 1.87, 0);
  chairGroup.add(cushion);

  // --- Backrest Group (for independent animation) ---
  const backrestGroup = new THREE.Group();
  backrestGroup.position.set(0, 1.8, -0.6); // Pivot point near the seat base
  
  // Backrest frame
  const backFrame = new THREE.Mesh(new RoundedBoxGeometry(1.4, 1.9, 0.08, 4, 0.02), darkMat);
  backFrame.position.set(0, 1.0, -0.06); // Relative to pivot
  backFrame.rotation.x = -0.04;
  backFrame.castShadow = true;
  backrestGroup.add(backFrame);

  // Backrest mesh/fabric
  const backMesh = new THREE.Mesh(new RoundedBoxGeometry(1.22, 1.65, 0.06, 4, 0.03), meshMat);
  backMesh.position.set(0, 0.95, 0);
  backMesh.rotation.x = -0.04;
  backrestGroup.add(backMesh);

  // Lumbar accent strip
  const lumbar = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.2, 0.12, 4, 0.04), accentMat);
  lumbar.position.set(0, 0.35, 0.05);
  backrestGroup.add(lumbar);

  // Headrest
  const headrest = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.32, 0.1, 4, 0.04), darkMat);
  headrest.position.set(0, 2.1, -0.02);
  backrestGroup.add(headrest);
  const headMount = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25), chromeMat);
  headMount.position.set(0, 1.92, -0.02);
  backrestGroup.add(headMount);

  chairGroup.add(backrestGroup);

  // Armrests
  [-0.78, 0.78].forEach(x => {
    const armPost = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4), chromeMat);
    armPost.position.set(x, 2.02, -0.08);
    chairGroup.add(armPost);
    const armPad = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.04, 0.38, 4, 0.015), accentMat);
    armPad.position.set(x, 2.24, -0.08);
    chairGroup.add(armPad);
  });

  // Center stem
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.5), chromeMat);
  stem.position.set(0, 1.05, 0); // Extended down to intersect the base center
  chairGroup.add(stem);

  // Star base legs (Fixed to look complete)
  const baseCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.15), chromeMat);
  baseCenter.position.set(0, 0.25, 0);
  chairGroup.add(baseCenter);

  const wheels = []; // Track wheels for animation

  [0, 72, 144, 216, 288].forEach(ang => {
    const rad = (ang * Math.PI) / 180;
    
    // Create a group for perfect radial alignment
    const legGroup = new THREE.Group();
    legGroup.rotation.y = rad;
    
    // Leg spanning outward (Tapered cylinder for premium look)
    const legGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.95, 8);
    // Rotate to point along +Z
    legGeo.rotateX(Math.PI / 2);
    // Translate origin to the start (Z=0)
    legGeo.translate(0, 0, 0.475);
    
    const leg = new THREE.Mesh(legGeo, chromeMat);
    leg.position.set(0, 0.22, 0);
    // Slope slightly downward
    leg.rotation.x = 0.15; 
    legGroup.add(leg);
    
    // Calculate end of the leg to perfectly place the castor
    const legLengthXY = Math.cos(0.15) * 0.95;
    const legEndY = 0.22 - Math.sin(0.15) * 0.95;
    
    // Wheel castor housing
    const castor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.08), darkMat);
    castor.position.set(0, legEndY, legLengthXY);
    legGroup.add(castor);

    // Wheel
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04), darkMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(0, legEndY - 0.05, legLengthXY);
    legGroup.add(wheel);
    wheels.push(wheel);
    
    chairGroup.add(legGroup);
  });

  // === Sensor points (subtle, evenly spaced) ===
  const sensorDots = [];

  // === IoT Components (ESP32, Battery, Wiring) ===
  
  // ESP32 Microcontroller Box (Back of the seat)
  const espBox = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 0.04), pcbMat);
  espBox.position.set(0, 0.25, -0.08);
  backrestGroup.add(espBox);
  
  // ESP32 Chip & Antenna details
  const espChip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.01), darkMat);
  espChip.position.set(-0.04, 0.25, -0.105);
  backrestGroup.add(espChip);
  const espAntenna = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.01), chromeMat);
  espAntenna.position.set(0.08, 0.28, -0.105);
  backrestGroup.add(espAntenna);
  
  // Status LED on ESP32
  const statusLed = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), sensorGlow.clone());
  statusLed.position.set(0.1, 0.2, -0.105);
  backrestGroup.add(statusLed);
  sensorDots.push(statusLed); // Add to pulse array

  // Battery Pack (Underside of the seat)
  const battery = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.4), batteryMat);
  battery.position.set(0, 1.72, -0.2);
  chairGroup.add(battery);

  // Visible Wiring Routes
  // Wire from Battery to ESP32
  const wire1Points = [
    new THREE.Vector3(0, 1.72, -0.4),
    new THREE.Vector3(0, 1.72, -0.65),
    new THREE.Vector3(0, 2.05, -0.65)
  ];
  const wire1Curve = new THREE.CatmullRomCurve3(wire1Points);
  const wire1 = new THREE.Mesh(new THREE.TubeGeometry(wire1Curve, 10, 0.005, 6, false), wireMat);
  chairGroup.add(wire1);

  // Wire trunk running up the backrest from ESP32
  const wire2Points = [
    new THREE.Vector3(-0.05, 0.34, -0.08),
    new THREE.Vector3(-0.05, 1.0, -0.03)
  ];
  const wire2Curve = new THREE.LineCurve3(wire2Points[0], wire2Points[1]);
  const wire2 = new THREE.Mesh(new THREE.TubeGeometry(wire2Curve, 2, 0.005, 6, false), wireMat);
  backrestGroup.add(wire2);


  // Seat sensors - 3x3 grid
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), sensorGlow.clone());
      dot.position.set(c * 0.35, 1.91, r * 0.35);
      chairGroup.add(dot);
      sensorDots.push(dot);
    }
  }

  // Back sensors - 3x2 grid
  for (let r = 0; r < 3; r++) {
    for (let c = -1; c <= 1; c += 2) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), sensorGlow.clone());
      dot.position.set(c * 0.3, 0.45 + r * 0.4, 0.08); // Relative to backrestGroup
      backrestGroup.add(dot);
      sensorDots.push(dot);
    }
  }

  // === Stylized Person (Bad Posture) ===
  const humanGroup = new THREE.Group();
  
  // Materials
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffe0bd, roughness: 0.5, metalness: 0.0 }); // Peach skin
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9, metalness: 0 }); // Off-white cloth
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
  const eyeIrisMat = new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.1 }); // dark purple
  const lidMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.4 }); // slightly darker skin for eyelids

  // === Head ===
  const headGroup = new THREE.Group();
  
  // Skull
  const skullGeo = new THREE.SphereGeometry(0.18, 32, 32);
  const skull = new THREE.Mesh(skullGeo, skinMat);
  skull.scale.set(1, 1.1, 0.95); 
  headGroup.add(skull);

  // Hair
  const hairGeo = new THREE.SphereGeometry(0.185, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.45);
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.y = 0.02;
  headGroup.add(hair);
  
  // Sideburns
  const sideburnGeo = new THREE.CapsuleGeometry(0.02, 0.05, 4, 8);
  const leftSideburn = new THREE.Mesh(sideburnGeo, hairMat);
  leftSideburn.position.set(-0.17, 0.02, 0.02);
  headGroup.add(leftSideburn);
  const rightSideburn = new THREE.Mesh(sideburnGeo, hairMat);
  rightSideburn.position.set(0.17, 0.02, 0.02);
  headGroup.add(rightSideburn);

  // Ears
  const earGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16);
  earGeo.rotateZ(Math.PI/2);
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(-0.18, -0.02, 0.0);
  headGroup.add(leftEar);
  const rightEar = new THREE.Mesh(earGeo, skinMat);
  rightEar.position.set(0.18, -0.02, 0.0);
  headGroup.add(rightEar);

  // Eyes
  const eyeR = 0.04;
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(eyeR, 32, 32), eyeWhiteMat);
  leftEye.position.set(-0.06, 0.02, 0.155);
  headGroup.add(leftEye);
  
  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(eyeR, 32, 32), eyeWhiteMat);
  rightEye.position.set(0.06, 0.02, 0.155);
  headGroup.add(rightEye);

  // Irises
  const irisR = 0.018;
  const leftIris = new THREE.Mesh(new THREE.SphereGeometry(irisR, 16, 16), eyeIrisMat);
  leftIris.position.set(-0.06, 0.02, 0.18);
  headGroup.add(leftIris);
  
  const rightIris = new THREE.Mesh(new THREE.SphereGeometry(irisR, 16, 16), eyeIrisMat);
  rightIris.position.set(0.06, 0.02, 0.18);
  headGroup.add(rightIris);

  // Eyelids (Sleepy)
  const lidGeo = new THREE.SphereGeometry(0.042, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const leftLid = new THREE.Mesh(lidGeo, lidMat);
  leftLid.position.copy(leftEye.position);
  leftLid.rotation.x = -Math.PI / 4; 
  headGroup.add(leftLid);
  
  const rightLid = new THREE.Mesh(lidGeo, lidMat);
  rightLid.position.copy(rightEye.position);
  rightLid.rotation.x = -Math.PI / 4;
  headGroup.add(rightLid);
  
  // Eyebrows
  const browGeo = new THREE.CapsuleGeometry(0.008, 0.05, 4, 8);
  browGeo.rotateZ(Math.PI/2);
  const leftBrow = new THREE.Mesh(browGeo, hairMat);
  leftBrow.position.set(-0.06, 0.09, 0.16);
  leftBrow.rotation.z = -0.1;
  headGroup.add(leftBrow);

  const rightBrow = new THREE.Mesh(browGeo, hairMat);
  rightBrow.position.set(0.06, 0.09, 0.16);
  rightBrow.rotation.z = 0.1;
  headGroup.add(rightBrow);

  // Nose
  const nose = new THREE.Mesh(new THREE.CapsuleGeometry(0.015, 0.02, 8, 8), skinMat);
  nose.position.set(0, -0.05, 0.17);
  nose.rotation.x = Math.PI/4;
  headGroup.add(nose);

  // Mouth
  const mouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.004, 0.03, 4, 8), lidMat);
  mouth.rotateZ(Math.PI/2);
  mouth.position.set(0, -0.1, 0.155);
  headGroup.add(mouth);

  headGroup.position.set(0, 0.78, 0.28); // jutting forward and down
  headGroup.rotation.x = -0.15; // looking up slightly

  // === Body (Torso) ===
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 2.05, 0.05); // hinge at pelvis (lifted up)
  torsoGroup.rotation.x = 0.45; // EXTREME SLOUCH

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.4, 16, 16), shirtMat); // Bulkier shirt
  torso.position.set(0, 0.35, 0.1);
  torsoGroup.add(torso);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.15, 16), skinMat);
  neck.position.set(0, 0.62, 0.15);
  neck.rotation.x = 0.4;
  torsoGroup.add(neck);
  
  torsoGroup.add(headGroup);

  // === Arms ===
  // Shoulders (Shirt)
  const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), shirtMat);
  leftShoulder.position.set(-0.25, 0.55, 0.1);
  torsoGroup.add(leftShoulder);
  
  const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), shirtMat);
  rightShoulder.position.set(0.25, 0.55, 0.1);
  torsoGroup.add(rightShoulder);

  // Upper Arms (Shirt)
  const upperArmGeo = new THREE.CapsuleGeometry(0.08, 0.25, 8, 16);
  const leftUpperArm = new THREE.Mesh(upperArmGeo, shirtMat);
  leftUpperArm.position.set(-0.28, 0.35, 0.15);
  leftUpperArm.rotation.x = -0.5; // reaching forward
  leftUpperArm.rotation.z = 0.15;
  torsoGroup.add(leftUpperArm);
  
  const rightUpperArm = new THREE.Mesh(upperArmGeo, shirtMat);
  rightUpperArm.position.set(0.28, 0.35, 0.15);
  rightUpperArm.rotation.x = -0.5;
  rightUpperArm.rotation.z = -0.15;
  torsoGroup.add(rightUpperArm);

  // Lower Arms (Shirt sleeve)
  const lowerArmGeo = new THREE.CapsuleGeometry(0.07, 0.25, 8, 16);
  const leftLowerArm = new THREE.Mesh(lowerArmGeo, shirtMat);
  leftLowerArm.position.set(-0.30, 0.14, 0.35);
  leftLowerArm.rotation.x = -1.5;
  torsoGroup.add(leftLowerArm);
  
  const rightLowerArm = new THREE.Mesh(lowerArmGeo, shirtMat);
  rightLowerArm.position.set(0.30, 0.14, 0.35);
  rightLowerArm.rotation.x = -1.5;
  torsoGroup.add(rightLowerArm);

  // Hands (Skin)
  const handGeo = new THREE.SphereGeometry(0.06, 16, 16);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.scale.set(1, 0.5, 1);
  leftHand.position.set(-0.30, 0.14, 0.52);
  torsoGroup.add(leftHand);

  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.scale.set(1, 0.5, 1);
  rightHand.position.set(0.30, 0.14, 0.52);
  torsoGroup.add(rightHand);

  torsoGroup.name = "slouchingTorso";
  humanGroup.add(torsoGroup);

  // === Legs (Pants / Lower Body) ===
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9, metalness: 0 }); // Slate dark pants

  // Pelvis 
  const pelvisGeo = new THREE.CapsuleGeometry(0.16, 0.15, 16, 16);
  const pelvis = new THREE.Mesh(pelvisGeo, pantsMat);
  pelvis.rotation.z = Math.PI / 2;
  pelvis.position.set(0, 2.02, 0.1); // Slightly lowered local Y to sit flush
  humanGroup.add(pelvis);

  // Upper Legs (resting on seatpan)
  const upperLegGeo = new THREE.CapsuleGeometry(0.1, 0.3, 16, 16);
  const leftUpperLeg = new THREE.Mesh(upperLegGeo, pantsMat);
  leftUpperLeg.rotation.x = Math.PI / 2;
  leftUpperLeg.position.set(-0.16, 2.05, 0.32);
  humanGroup.add(leftUpperLeg);

  const rightUpperLeg = new THREE.Mesh(upperLegGeo, pantsMat);
  rightUpperLeg.rotation.x = Math.PI / 2;
  rightUpperLeg.position.set(0.16, 2.05, 0.32);
  humanGroup.add(rightUpperLeg);

  // Lower Legs (hanging down)
  const lowerLegGeo = new THREE.CapsuleGeometry(0.09, 0.45, 16, 16);
  const leftLowerLeg = new THREE.Mesh(lowerLegGeo, pantsMat);
  leftLowerLeg.position.set(-0.16, 1.7, 0.54);
  leftLowerLeg.rotation.x = -0.1;
  humanGroup.add(leftLowerLeg);

  const rightLowerLeg = new THREE.Mesh(lowerLegGeo, pantsMat);
  rightLowerLeg.position.set(0.16, 1.7, 0.54);
  rightLowerLeg.rotation.x = -0.1;
  humanGroup.add(rightLowerLeg);

  // Shoes
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 });
  const footGeo = new THREE.CapsuleGeometry(0.06, 0.14, 16, 16);
  const leftFoot = new THREE.Mesh(footGeo, shoeMat);
  leftFoot.rotation.x = Math.PI / 2;
  leftFoot.position.set(-0.16, 1.45, 0.62);
  humanGroup.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeo, shoeMat);
  rightFoot.rotation.x = Math.PI / 2;
  rightFoot.position.set(0.16, 1.45, 0.62);
  humanGroup.add(rightFoot);

  // Group adjustment to ensure exact placement on the chair seat cushion (which is around Y=1.91)
  // Lifting Y and Z forward for a perfect 'on-top' sit without clipping
  humanGroup.scale.set(1.3, 1.3, 1.3);
  humanGroup.position.set(0, -0.62, 0.22); // Re-calibrated for new model positioning
  humanGroup.rotation.x = -0.05; // Slight forward lean for better posture visualization
  
  humanGroup.userData.isHuman = true;
  chairGroup.add(humanGroup);

  scene.add(chairGroup);

  // === Single subtle orbit ring ===
  const ringGeo = new THREE.TorusGeometry(2.0, 0.005, 8, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.3 }); // Bright Blue
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.3;
  ring.position.y = 2;
  ring.position.x = 1.0; // Shifted right to match chair
  scene.add(ring);

  // 3 orbiting dots on the ring
  const orbitDots = [];
  for (let i = 0; i < 3; i++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.8 }) // Bright Blue
    );
    scene.add(dot);
    orbitDots.push({ mesh: dot, angle: (Math.PI * 2 / 3) * i, speed: 0.4 });
  }

  // === Sparse floating particles ===
  const particleCount = 25;
  const particleGeo = new THREE.BufferGeometry();
  const pPositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    pPositions[i * 3] = (Math.random() - 0.5) * 8;
    pPositions[i * 3 + 1] = Math.random() * 6;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x8b5cf6, size: 0.025, transparent: true, opacity: 0.6, // Vibrant Purple
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  const shadowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.04 })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = -0.05;
  shadowDisc.position.x = 1.0; // Shifted right to match chair
  scene.add(shadowDisc);

  // === Mouse tracking ===
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // === Resize ===
  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);
  onResize();

  // === Animate ===
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.008;

    // Dynamic chair rotation
    const rotationSpeed = 0.0035; // Faster rotation
    chairGroup.rotation.y += rotationSpeed;

    // Animate wheels rolling realistically based on rotation speed and radius (r=0.06, dist=~0.94)
    wheels.forEach(w => {
      w.rotation.x -= (rotationSpeed * 0.94) / 0.06;
    });

    // Mouse parallax
    chairGroup.rotation.x += (mouseY * 0.06 - chairGroup.rotation.x) * 0.025;

    // Active 3D Animation: Backrest flexing to simulate smart posture adjustment
    backrestGroup.rotation.x = Math.sin(time * 1.5) * 0.12; // More pronounced flex

    // Dynamic float
    chairGroup.position.y = Math.sin(time * 1.2) * 0.15; // Higher, faster float

    // Animate the human's bad posture breathing
    const torso = chairGroup.getObjectByName("slouchingTorso");
    if (torso) {
      // Slow, exaggerated breathing while slouched
      torso.rotation.x = 0.35 + Math.sin(time * 2.5) * 0.04;
      torso.position.y = 1.9 + Math.sin(time * 2.5) * 0.01;
    }

    // Sensor pulse (sequential wave) - More intense glow
    sensorDots.forEach((dot, i) => {
      const wave = Math.sin(time * 3.0 + i * 0.6) * 0.5 + 0.5; // Faster, tighter wave
      dot.material.emissiveIntensity = 0.5 + wave * 1.5; // Brighter
      dot.scale.setScalar(0.7 + wave * 0.6); // Bigger throb
    });

    // Orbit ring rotation
    ring.rotation.z = time * 0.1;

    // Orbit dots
    orbitDots.forEach(d => {
      d.angle += 0.004 * d.speed;
      const tilt = Math.PI / 2.3;
      d.mesh.position.set(
        1.0 + Math.cos(d.angle) * 2.0, // Shifted right 1.0 to match chair
        2 + Math.sin(d.angle) * 2.0 * Math.cos(tilt),
        Math.sin(d.angle) * 2.0 * Math.sin(tilt)
      );
    });

    // Particles drift
    const pArr = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pArr[i * 3 + 1] += 0.001;
      if (pArr[i * 3 + 1] > 6) pArr[i * 3 + 1] = 0;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();
}
