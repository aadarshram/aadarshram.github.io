(function () {
  const root = document.getElementById("playground-root");
  if (!root || typeof THREE === "undefined") {
    return;
  }

  const unsupportedEl = document.getElementById("playground-unsupported");
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  const mount = document.getElementById("playground-canvas-mount");
  const hintPromptText = document.querySelector("#playground-hint [data-prompt-text]");
  const cardEl = document.getElementById("playground-card");
  const cardTitleEl = cardEl.querySelector("[data-card-title]");
  const cardTextEl = cardEl.querySelector("[data-card-text]");
  const mapToggleBtn = document.getElementById("playground-map-toggle");
  const mapOverlay = document.getElementById("playground-map-overlay");
  const mapCloseBtn = document.getElementById("playground-map-close");
  const mapCanvas = document.getElementById("playground-map-canvas");
  const mapCtx = mapCanvas.getContext("2d");
  const soundToggleBtn = document.getElementById("playground-sound-toggle");
  const povToggleBtn = document.getElementById("playground-pov-toggle");
  const speechBubbleEl = document.getElementById("playground-speech-bubble");
  const speechTextEl = speechBubbleEl.querySelector("[data-speech-text]");
  const joystickEl = document.getElementById("playground-joystick");
  const joystickKnobEl = document.getElementById("playground-joystick-knob");
  const touchActionsEl = document.getElementById("playground-touch-actions");
  const touchJumpBtn = document.getElementById("playground-touch-jump");
  const touchRoverBtn = document.getElementById("playground-touch-rover");

  const GROUND_SIZE = 150;
  const BOUND = GROUND_SIZE / 2 - 4;

  // ---------- material + helper utilities ----------

  function flatMat(hex) {
    return new THREE.MeshLambertMaterial({ color: hex, flatShading: true });
  }

  function metalMat(hex, metalness, roughness) {
    return new THREE.MeshStandardMaterial({ color: hex, metalness: metalness, roughness: roughness, flatShading: true });
  }

  function glowMat(hex, intensity) {
    return new THREE.MeshStandardMaterial({
      color: hex,
      emissive: hex,
      emissiveIntensity: intensity || 1.4,
      roughness: 0.4,
      metalness: 0.1
    });
  }

  function lerpAngle(a, b, t) {
    let d = b - a;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    return a + d * t;
  }

  function headingBetween(from, to) {
    return Math.atan2(to.x - from.x, to.z - from.z);
  }

  function makePathFollower(points, speed) {
    let seg = 0;
    let segT = 0;
    function segLen(i) {
      return Math.max(0.001, points[i].distanceTo(points[(i + 1) % points.length]));
    }
    return {
      update(dt) {
        let remaining = speed * dt;
        let guard = 0;
        while (remaining > 0 && guard < 8) {
          guard++;
          const len = segLen(seg);
          const left = (1 - segT) * len;
          if (remaining < left) {
            segT += remaining / len;
            remaining = 0;
          } else {
            remaining -= left;
            seg = (seg + 1) % points.length;
            segT = 0;
          }
        }
        const a = points[seg];
        const b = points[(seg + 1) % points.length];
        const pos = a.clone().lerp(b, segT);
        const heading = headingBetween(a, b);
        return { pos, heading };
      }
    };
  }

  function makeSignTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 144;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#b8341f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f2c230";
    ctx.fillRect(6, 6, canvas.width - 12, canvas.height - 12);
    ctx.fillStyle = "#b8341f";
    ctx.font = "bold 46px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🍕 PIZZA", canvas.width / 2, 56);
    ctx.font = "bold 20px Arial";
    ctx.fillText("AUTONOMOUS DELIVERY", canvas.width / 2, 102);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // ---------- audio ----------

  let audioEnabled = false;
  let audioCtx = null;
  let masterGain = null;
  let engineGain = null;
  let lastFootstepTime = -1;

  function ensureAudio() {
    if (audioCtx) {
      return;
    }
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);

    const ambientGain = audioCtx.createGain();
    ambientGain.gain.value = 0.2;
    ambientGain.connect(masterGain);

    [55, 82.5, 110].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = 0.04 + i * 0.015;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 2.5;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      const voiceGain = audioCtx.createGain();
      voiceGain.gain.value = 0.3 / (i + 1);
      osc.connect(voiceGain);
      voiceGain.connect(ambientGain);
      osc.start();
    });

    const engineOsc = audioCtx.createOscillator();
    engineOsc.type = "sawtooth";
    engineOsc.frequency.value = 70;
    const engineFilter = audioCtx.createBiquadFilter();
    engineFilter.type = "lowpass";
    engineFilter.frequency.value = 260;
    engineGain = audioCtx.createGain();
    engineGain.gain.value = 0;
    engineOsc.connect(engineFilter);
    engineFilter.connect(engineGain);
    engineGain.connect(masterGain);
    engineOsc.start();
  }

  function setAudioEnabled(next) {
    audioEnabled = next;
    if (next) {
      ensureAudio();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      masterGain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.4);
    } else if (audioCtx) {
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
    soundToggleBtn.classList.toggle("is-on", next);
    soundToggleBtn.querySelector(".fa").className = next ? "fa fa-volume-up" : "fa fa-volume-mute";
  }

  soundToggleBtn.addEventListener("click", () => setAudioEnabled(!audioEnabled));

  function playBlip(freq, duration) {
    if (!audioEnabled || !audioCtx) {
      return;
    }
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.18, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (duration || 0.15));
    osc.connect(g);
    g.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + (duration || 0.15) + 0.02);
  }

  function playFootstep() {
    if (!audioEnabled || !audioCtx) {
      return;
    }
    const bufferSize = Math.floor(audioCtx.sampleRate * 0.07);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 450;
    const g = audioCtx.createGain();
    g.gain.value = 0.22;
    noise.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
    noise.start();
  }

  function setEngineLevel(active) {
    if (!audioCtx || !engineGain) {
      return;
    }
    engineGain.gain.linearRampToValueAtTime(active ? 0.1 : 0, audioCtx.currentTime + 0.25);
  }

  let cachedVoices = [];
  if (window.speechSynthesis) {
    const loadVoices = () => { cachedVoices = window.speechSynthesis.getVoices(); };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function speakLine(text, speakerType) {
    if (!audioEnabled || !window.speechSynthesis) {
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = speakerType === "robot" ? 1.0 : 1.02;
    utter.pitch = speakerType === "robot" ? 0.25 : 1.1;
    utter.volume = 0.8;
    const preferred = cachedVoices.find((v) => /en/i.test(v.lang));
    if (preferred) {
      utter.voice = preferred;
    }
    window.speechSynthesis.speak(utter);
  }

  // ---------- scene setup ----------

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x11182a);
  scene.fog = new THREE.Fog(0x11182a, 60, 150);

  const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 500);
  camera.position.set(0, 10, 14);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch (e) {
    unsupportedEl.hidden = false;
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  mount.appendChild(renderer.domElement);

  const hemiLight = new THREE.HemisphereLight(0x8fb0e0, 0x3a3550, 0.85);
  scene.add(hemiLight);
  const sun = new THREE.DirectionalLight(0xffdeb0, 1.0);
  sun.position.set(30, 45, 15);
  scene.add(sun);
  const rimLight = new THREE.DirectionalLight(0x7a9bff, 0.5);
  rimLight.position.set(-25, 20, -30);
  scene.add(rimLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(3.2, 14, 14), glowMat(0xfff1c7, 1.8));
  scene.add(sunDisc);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x344163, roughness: 0.95, metalness: 0.05 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const grid = new THREE.GridHelper(GROUND_SIZE, 30, 0x6a93d6, 0x3a4a72);
  grid.position.y = 0.01;
  scene.add(grid);

  const starsMaterial = new THREE.PointsMaterial({ color: 0xcfe0ff, size: 0.7, sizeAttenuation: true, transparent: true, opacity: 0 });
  (function addStars() {
    const starCount = 260;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 70 + Math.random() * 60;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 25 + Math.random() * 55;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    scene.add(new THREE.Points(geo, starsMaterial));
  })();

  // distant skyline silhouette
  const skylineBeacons = [];
  (function addSkyline() {
    const towerMat = flatMat(0x0d1120);
    const count = 26;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = BOUND + 10 + Math.random() * 14;
      const height = 10 + Math.random() * 26;
      const tower = new THREE.Mesh(new THREE.BoxGeometry(5 + Math.random() * 4, height, 5 + Math.random() * 4), towerMat);
      tower.position.set(Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius);
      scene.add(tower);
      if (Math.random() > 0.6) {
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), glowMat(0xff6a3d, 1.1));
        beacon.position.set(tower.position.x, height + 0.6, tower.position.z);
        scene.add(beacon);
        skylineBeacons.push(beacon);
      }
    }
  })();

  function addLandingPad(position, color) {
    const pad = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 9.4, 40),
      new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.16, side: THREE.DoubleSide })
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(position.x, 0.015, position.z);
    scene.add(pad);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(9, 9.4, 48),
      new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(position.x, 0.02, position.z);
    scene.add(ring);
  }

  // ---------- figures ----------

  function buildPerson(opts) {
    opts = opts || {};
    const group = new THREE.Group();
    const skin = flatMat(opts.skin || 0xd9a06a);
    const shirt = flatMat(opts.shirt || 0x3f6b4f);
    const pants = flatMat(opts.pants || 0x2a2620);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.5), shirt);
    torso.position.y = 1.35;
    group.add(torso);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), skin);
    head.position.y = 2.2;
    group.add(head);

    if (opts.hair) {
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.22, 0.64), flatMat(opts.hair));
      hair.position.y = 2.46;
      group.add(hair);
    }

    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.0, 0.4), pants);
    legL.position.set(-0.24, 0.5, 0);
    const legR = legL.clone();
    legR.position.x = 0.24;
    group.add(legL, legR);

    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9, 0.28), skin);
    armL.position.set(-0.58, 1.4, 0);
    const armR = armL.clone();
    armR.position.x = 0.58;
    group.add(armL, armR);

    if (opts.cane) {
      const cane = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.05, 6), flatMat(0x6b4a2a));
      cane.position.set(0.68, 0.5, 0.1);
      group.add(cane);
    }

    if (opts.stoop) {
      group.rotation.x = 0.1;
    }

    group.userData.limbs = { legL, legR, armL, armR };
    return group;
  }

  function buildHumanoidRobot(accent) {
    const group = new THREE.Group();
    const metal = metalMat(0xc3ccd4, 0.65, 0.3);
    const dark = metalMat(0x2b2f3a, 0.4, 0.45);
    const glow = glowMat(accent, 1.6);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.05, 0.52), metal);
    torso.position.y = 1.35;
    group.add(torso);

    const chestLight = new THREE.Mesh(new THREE.CircleGeometry(0.11, 14), glow);
    chestLight.position.set(0, 1.45, 0.27);
    group.add(chestLight);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.48, 0.5), dark);
    head.position.y = 2.15;
    group.add(head);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.06), glow);
    visor.position.set(0, 2.17, 0.26);
    group.add(visor);

    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.92, 0.34), dark);
    legL.position.set(-0.22, 0.47, 0);
    const legR = legL.clone();
    legR.position.x = 0.22;
    group.add(legL, legR);

    const kneeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), glow);
    kneeL.position.set(-0.22, 0.95, 0.14);
    const kneeR = kneeL.clone();
    kneeR.position.x = 0.22;
    group.add(kneeL, kneeR);

    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.82, 0.25), metal);
    armL.position.set(-0.54, 1.42, 0);
    const armR = armL.clone();
    armR.position.x = 0.54;
    group.add(armL, armR);

    const elbowL = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), glow);
    elbowL.position.set(-0.54, 1.02, 0);
    const elbowR = elbowL.clone();
    elbowR.position.x = 0.54;
    group.add(elbowL, elbowR);

    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), dark);
    antenna.position.set(0, 2.52, 0);
    const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), glow);
    antennaTip.position.set(0, 2.68, 0);
    group.add(antenna, antennaTip);

    const point = new THREE.PointLight(accent, 0.5, 3.2);
    point.position.set(0, 1.6, 0.3);
    group.add(point);

    group.userData.limbs = { legL, legR, armL, armR };
    group.userData.glowParts = [chestLight, visor, kneeL, kneeR, elbowL, elbowR, antennaTip];
    return group;
  }

  function walkCycle(figure, phase, intensity) {
    const swing = Math.sin(phase) * (intensity || 0.5);
    figure.userData.limbs.legL.rotation.x = swing;
    figure.userData.limbs.legR.rotation.x = -swing;
    figure.userData.limbs.armL.rotation.x = -swing;
    figure.userData.limbs.armR.rotation.x = swing;
  }

  function buildPersonalRover() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 2.4), metalMat(0xcf6b2d, 0.3, 0.5));
    body.position.y = 0.75;
    group.add(body);

    const antennaMast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), flatMat(0x3a3a3a));
    antennaMast.position.set(0, 1.5, -0.8);
    const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), glowMat(0xe0935a));
    antennaTip.position.set(0, 1.95, -0.8);
    group.add(antennaMast, antennaTip);

    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 10);
    const wheelMat = flatMat(0x18181a);
    const wheelPositions = [
      [-0.95, 0.42, 0.85],
      [0.95, 0.42, 0.85],
      [-0.95, 0.42, -0.85],
      [0.95, 0.42, -0.85]
    ];
    const wheels = wheelPositions.map((p) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(p[0], p[1], p[2]);
      group.add(wheel);
      return wheel;
    });

    group.userData.wheels = wheels;
    return group;
  }

  function buildPizzaRover() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.6, 2.0), metalMat(0xe7e7e7, 0.25, 0.4));
    body.position.y = 0.6;
    group.add(body);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.15, 2.02), flatMat(0xb8341f));
    stripe.position.y = 0.42;
    group.add(stripe);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), flatMat(0x333333));
    mast.position.set(0, 1.05, 0);
    group.add(mast);

    const signTexture = makeSignTexture();
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.65, 0.08),
      new THREE.MeshStandardMaterial({ map: signTexture, roughness: 0.6 })
    );
    sign.position.set(0, 1.55, 0);
    group.add(sign);

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), glowMat(0xff5a36, 1.8));
    beacon.position.set(0, 1.95, 0);
    group.add(beacon);
    const beaconLight = new THREE.PointLight(0xff5a36, 0.6, 3);
    beaconLight.position.copy(beacon.position);
    group.add(beaconLight);

    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.26, 10);
    const wheelMat = flatMat(0x18181a);
    const wheels = [
      [-0.7, 0.3, 0.7],
      [0.7, 0.3, 0.7],
      [-0.7, 0.3, -0.7],
      [0.7, 0.3, -0.7]
    ].map((p) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(p[0], p[1], p[2]);
      group.add(wheel);
      return wheel;
    });

    group.userData.wheels = wheels;
    group.userData.beacon = beacon;
    return group;
  }

  // ---------- station builders ----------

  function buildWorkshopStation(station) {
    const group = new THREE.Group();
    const bench = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 1.4), flatMat(0x5a4330));
    bench.position.y = 0.6;
    group.add(bench);

    const robot = buildHumanoidRobot(station.color);
    robot.position.set(0.85, 0, 0);
    robot.rotation.y = -Math.PI * 0.4;
    group.add(robot);

    const human = buildPerson({ shirt: 0x3f6b4f });
    human.position.set(-0.95, 0, 0.3);
    human.rotation.y = Math.PI * 0.3;
    group.add(human);

    const part = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), flatMat(station.color));
    group.add(part);

    const robotHand = new THREE.Vector3(0.1, 1.5, 0.3);
    const humanHand = new THREE.Vector3(-0.75, 1.55, 0.35);
    const benchTop = new THREE.Vector3(0, 0.95, 0);

    group.userData.animate = (t) => {
      const cycle = (t * 0.35) % 1;
      let a, b, span;
      if (cycle < 0.45) {
        a = benchTop; b = robotHand; span = cycle / 0.45;
      } else if (cycle < 0.55) {
        a = robotHand; b = robotHand; span = 0;
      } else if (cycle < 0.95) {
        a = robotHand; b = humanHand; span = (cycle - 0.55) / 0.4;
      } else {
        a = humanHand; b = benchTop; span = (cycle - 0.95) / 0.05;
      }
      part.position.lerpVectors(a, b, Math.min(1, span));
      part.position.y += Math.sin(cycle * Math.PI * 2) * 0.12 + 0.12;

      robot.userData.limbs.armL.rotation.x = -0.3 + Math.sin(t * 2.2) * 0.35;
      robot.userData.limbs.armR.rotation.x = 0.2 + Math.sin(t * 2.2 + 1) * 0.25;
      human.userData.limbs.armR.rotation.x = -0.4 + Math.sin(t * 2.2 + 0.6) * 0.35;

      robot.userData.glowParts.forEach((mesh) => {
        mesh.material.emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.4;
      });
    };
    group.userData.speaker = robot;
    return group;
  }

  function buildCrosswalkStation(station) {
    const group = new THREE.Group();

    const stripeMat = flatMat(0xd9d4c4);
    for (let i = -3; i <= 3; i++) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 2.4), stripeMat);
      stripe.position.set(i * 0.9, 0.02, 0);
      group.add(stripe);
    }

    const pair = new THREE.Group();
    const elder = buildPerson({ hair: 0xe3e3e3, skin: 0xd9b48c, shirt: 0x5a6680, cane: true, stoop: true });
    elder.position.set(-0.55, 0, 0);
    const robot = buildHumanoidRobot(station.color);
    robot.position.set(0.55, 0, 0);
    pair.add(elder, robot);
    group.add(pair);

    const path = [new THREE.Vector3(0, 0, -3.6), new THREE.Vector3(0, 0, 3.6)];
    let dir = 1;
    let segT = 0;
    group.userData.animate = (t, dt) => {
      segT += dir * dt * 0.09;
      if (segT > 1) { segT = 1; dir = -1; }
      if (segT < 0) { segT = 0; dir = 1; }
      pair.position.lerpVectors(path[0], path[1], segT);
      pair.rotation.y = dir > 0 ? 0 : Math.PI;
      walkCycle(elder, t * 4.5, 0.3);
      walkCycle(robot, t * 4.5, 0.4);
      robot.userData.glowParts.forEach((mesh) => {
        mesh.material.emissiveIntensity = 1.3 + Math.sin(t * 3) * 0.3;
      });
    };
    group.userData.speaker = elder;
    return group;
  }

  function buildGardenStation(station) {
    const group = new THREE.Group();
    const plantMat = flatMat(0x3f6b4f);
    const plantCount = 5;
    const plants = [];
    for (let i = 0; i < plantCount; i++) {
      const plant = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 6), plantMat);
      plant.position.set(-2 + i * 1, 0.45, 1.4);
      group.add(plant);
      plants.push(plant);
    }

    const bot = new THREE.Group();
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.8), metalMat(station.color, 0.3, 0.5));
    chassis.position.y = 0.45;
    bot.add(chassis);
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), flatMat(0x888888));
    spout.position.set(0, 0.7, 0.4);
    spout.rotation.x = 0.6;
    bot.add(spout);
    const indicator = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), glowMat(station.color, 1.5));
    indicator.position.set(0, 0.85, 0);
    bot.add(indicator);
    bot.userData.indicator = indicator;
    group.add(bot);

    const droplets = plants.map(() => {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: 0x6fb8e6, transparent: true, opacity: 0 }));
      group.add(d);
      return d;
    });

    group.userData.animate = (t) => {
      const cycleLen = plantCount;
      const cyclePos = (t * 0.5) % cycleLen;
      const idx = Math.floor(cyclePos);
      const frac = cyclePos - idx;
      bot.position.x = -2 + cyclePos;
      droplets.forEach((d, i) => {
        if (i === idx && frac > 0.3 && frac < 0.8) {
          d.position.set(bot.position.x, 0.95 - (frac - 0.3) * 1.4, 1.1);
          d.material.opacity = 0.85;
        } else {
          d.material.opacity = 0;
        }
      });
      bot.userData.indicator.material.emissiveIntensity = 1.1 + Math.sin(t * 4) * 0.5;
    };
    group.userData.speaker = bot;
    return group;
  }

  function buildSafetyStation(station) {
    const group = new THREE.Group();

    const lane = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.02, 1.2), flatMat(0x23314a));
    group.add(lane);

    const bot = buildHumanoidRobot(station.color);
    group.add(bot);
    const caution = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.85, 24), new THREE.MeshBasicMaterial({ color: 0xf2b23a, transparent: true, opacity: 0, side: THREE.DoubleSide }));
    caution.rotation.x = -Math.PI / 2;
    caution.position.y = 0.03;
    group.add(caution);

    const walker = buildPerson({ shirt: 0x7a4f9e });
    group.add(walker);

    const botPath = [new THREE.Vector3(-3.6, 0, 0), new THREE.Vector3(3.6, 0, 0)];
    const walkerPath = [new THREE.Vector3(0, 0, -2.6), new THREE.Vector3(0, 0, 2.6)];
    let botDir = 1, botT = 0.1;
    let walkDir = 1, walkT = 0;

    group.userData.animate = (t, dt) => {
      walkT += walkDir * dt * 0.16;
      if (walkT > 1) { walkT = 1; walkDir = -1; }
      if (walkT < 0) { walkT = 0; walkDir = 1; }
      walker.position.lerpVectors(walkerPath[0], walkerPath[1], walkT);
      walker.rotation.y = walkDir > 0 ? 0 : Math.PI;
      walkCycle(walker, t * 4, 0.4);

      const botPos = botPath[0].clone().lerp(botPath[1], botT);
      const distanceToWalker = botPos.distanceTo(walker.position);
      const shouldYield = distanceToWalker < 1.6;

      if (!shouldYield) {
        botT += botDir * dt * 0.12;
        if (botT > 1) { botT = 1; botDir = -1; }
        if (botT < 0) { botT = 0; botDir = 1; }
      }
      bot.position.lerpVectors(botPath[0], botPath[1], botT);
      bot.rotation.y = botDir > 0 ? Math.PI / 2 : -Math.PI / 2;
      caution.position.x = bot.position.x;
      caution.position.z = bot.position.z;
      caution.material.opacity = shouldYield ? 0.55 + Math.sin(t * 10) * 0.25 : 0;

      if (!shouldYield) {
        walkCycle(bot, 0, 0);
        bot.userData.limbs.legL.rotation.x = Math.sin(t * 4) * 0.4;
        bot.userData.limbs.legR.rotation.x = -Math.sin(t * 4) * 0.4;
      }
      bot.userData.glowParts.forEach((mesh) => {
        mesh.material.emissiveIntensity = shouldYield ? 2.2 : 1.2 + Math.sin(t * 3) * 0.3;
      });
    };
    group.userData.speaker = bot;
    return group;
  }

  function buildSortingStation(station) {
    const group = new THREE.Group();
    const table = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 1.2), flatMat(0x3a3f4d));
    table.position.y = 0.5;
    group.add(table);

    const robot = buildHumanoidRobot(station.color);
    robot.position.set(0, 0, -0.9);
    robot.rotation.y = Math.PI;
    group.add(robot);

    const binColors = [0xd94f4f, 0x4f9ed9, 0x4fd97a];
    const bins = binColors.map((c, i) => {
      const bin = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.6), flatMat(c));
      bin.position.set(-1 + i * 1, 0.4, 1.1);
      group.add(bin);
      return bin;
    });

    const shapeGeos = [
      new THREE.BoxGeometry(0.3, 0.3, 0.3),
      new THREE.SphereGeometry(0.2, 10, 10),
      new THREE.ConeGeometry(0.2, 0.35, 8)
    ];
    const movers = shapeGeos.map((geo, i) => {
      const mesh = new THREE.Mesh(geo, flatMat(binColors[i]));
      mesh.visible = false;
      group.add(mesh);
      return mesh;
    });

    const pickupPoint = new THREE.Vector3(0, 0.95, -0.8);
    group.userData.animate = (t) => {
      const segDur = 1;
      const totalCycle = segDur * movers.length;
      const cyclePos = (t * 0.6) % totalCycle;
      const activeIndex = Math.floor(cyclePos / segDur);
      const frac = (cyclePos % segDur) / segDur;

      movers.forEach((mesh, i) => {
        mesh.visible = i === activeIndex;
      });

      const mesh = movers[activeIndex];
      const binPos = bins[activeIndex].position;
      const arcHeight = Math.sin(frac * Math.PI) * 0.9;
      mesh.position.lerpVectors(pickupPoint, new THREE.Vector3(binPos.x, binPos.y + 0.3, binPos.z), frac);
      mesh.position.y += arcHeight;
      mesh.rotation.y = frac * Math.PI * 2;

      robot.userData.limbs.armL.rotation.x = -0.6 + Math.sin(frac * Math.PI) * 0.9;
      robot.userData.limbs.armR.rotation.x = -0.6 + Math.sin(frac * Math.PI + 0.3) * 0.9;
      robot.rotation.y = Math.PI + Math.sin(frac * Math.PI) * 0.5 * (activeIndex - 1) * 0.3;
      robot.userData.glowParts.forEach((m) => {
        m.material.emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.4;
      });
    };
    group.userData.speaker = robot;
    return group;
  }

  function buildWheelchairPerson(opts) {
    opts = opts || {};
    const group = new THREE.Group();
    const skin = flatMat(opts.skin || 0xd9a06a);
    const shirt = flatMat(opts.shirt || 0x5a6680);
    const frameMat = metalMat(0x888f99, 0.5, 0.4);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.95, 0.5), shirt);
    torso.position.y = 1.0;
    group.add(torso);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), skin);
    head.position.y = 1.78;
    group.add(head);

    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.75, 0.26), skin);
    armL.position.set(-0.55, 0.95, 0);
    const armR = armL.clone();
    armR.position.x = 0.55;
    group.add(armL, armR);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.8), frameMat);
    seat.position.y = 0.55;
    group.add(seat);

    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.06, 20);
    const wheelMat = metalMat(0x2b2f3a, 0.3, 0.5);
    const wheelL = new THREE.Mesh(wheelGeo, wheelMat);
    wheelL.rotation.x = Math.PI / 2;
    wheelL.position.set(-0.5, 0.42, 0);
    const wheelR = wheelL.clone();
    wheelR.position.x = 0.5;
    group.add(wheelL, wheelR);

    const frontWheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.06, 12);
    const frontL = new THREE.Mesh(frontWheelGeo, wheelMat);
    frontL.rotation.x = Math.PI / 2;
    frontL.position.set(-0.42, 0.14, 0.5);
    const frontR = frontL.clone();
    frontR.position.x = 0.42;
    group.add(frontL, frontR);

    group.userData.limbs = { armL, armR };
    group.userData.wheels = [wheelL, wheelR];
    return group;
  }

  function buildRescueStation(station) {
    const group = new THREE.Group();
    const rubbleMat = flatMat(0x4a4a4f);
    for (let i = 0; i < 8; i++) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.35), rubbleMat);
      rock.position.set((Math.random() - 0.5) * 3.2, 0.25, (Math.random() - 0.5) * 2.4);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      group.add(rock);
    }

    const drone = new THREE.Group();
    const droneBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.5), metalMat(station.color, 0.6, 0.3));
    drone.add(droneBody);
    const armGeo = new THREE.BoxGeometry(0.7, 0.04, 0.06);
    const armA = new THREE.Mesh(armGeo, flatMat(0x2b2f3a));
    const armB = armA.clone();
    armB.rotation.y = Math.PI / 2;
    drone.add(armA, armB);
    const rotorMat = new THREE.MeshBasicMaterial({ color: 0x9fb3c8, transparent: true, opacity: 0.5 });
    const rotors = [
      [0.35, 0, 0.35], [-0.35, 0, 0.35], [0.35, 0, -0.35], [-0.35, 0, -0.35]
    ].map((p) => {
      const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 16), rotorMat);
      rotor.position.set(p[0], 0.08, p[2]);
      drone.add(rotor);
      return rotor;
    });
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), glowMat(station.color, 1.8));
    beacon.position.set(0, 0.12, 0);
    drone.add(beacon);
    drone.position.set(0, 2.4, 0);
    group.add(drone);

    const spotLight = new THREE.SpotLight(0xfff1c7, 2.2, 7, 0.4, 0.5);
    spotLight.position.set(0, 2.4, 0);
    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 0, 0);
    group.add(spotTarget);
    spotLight.target = spotTarget;
    group.add(spotLight);

    group.userData.animate = (t) => {
      const sweep = Math.sin(t * 0.5) * 1.3;
      drone.position.x = sweep;
      drone.position.y = 2.4 + Math.sin(t * 2) * 0.08;
      spotLight.position.x = sweep;
      spotTarget.position.x = sweep;
      rotors.forEach((rotor) => { rotor.rotation.y += 0.9; });
      beacon.material.emissiveIntensity = 1.4 + Math.sin(t * 8) * 0.6;
    };
    group.userData.speaker = drone;
    return group;
  }

  function buildMobilityStation(station) {
    const group = new THREE.Group();
    const pair = new THREE.Group();

    const rider = buildWheelchairPerson({});
    rider.position.set(-0.6, 0, 0);
    pair.add(rider);

    const robot = buildHumanoidRobot(station.color);
    robot.scale.setScalar(0.92);
    robot.position.set(0.55, 0, 0);
    pair.add(robot);

    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.2), flatMat(0x6b4a2a));
    bag.position.set(0.85, 1.1, 0);
    pair.add(bag);

    group.add(pair);

    const path = [new THREE.Vector3(-3.4, 0, 1.6), new THREE.Vector3(3.4, 0, -1.2)];
    let dir = 1;
    let segT = 0;
    group.userData.animate = (t) => {
      segT += dir * 0.016;
      if (segT > 1) { segT = 1; dir = -1; }
      if (segT < 0) { segT = 0; dir = 1; }
      pair.position.lerpVectors(path[0], path[1], segT);
      pair.rotation.y = headingBetween(path[0], path[1]) + (dir > 0 ? 0 : Math.PI);

      rider.userData.wheels.forEach((wheel) => { wheel.rotation.z += dir * 0.12; });
      rider.userData.limbs.armL.rotation.x = Math.sin(t * 2) * 0.1;
      bag.position.y = 1.1 + Math.sin(t * 2.4) * 0.03;
      walkCycle(robot, t * 4, 0.35);
      robot.userData.glowParts.forEach((m) => {
        m.material.emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.3;
      });
    };
    group.userData.speaker = rider;
    return group;
  }

  function buildHazardStation(station) {
    const group = new THREE.Group();

    const hazardMat = glowMat(0xff3b1f, 1.6);
    for (let i = 0; i < 6; i++) {
      const shard = new THREE.Mesh(new THREE.ConeGeometry(0.15 + Math.random() * 0.1, 0.05, 5), hazardMat);
      shard.rotation.x = Math.PI / 2;
      shard.position.set(1.4 + (Math.random() - 0.5) * 1.2, 0.03, (Math.random() - 0.5) * 1.2);
      group.add(shard);
    }
    const hazardLight = new THREE.PointLight(0xff3b1f, 1.2, 4);
    hazardLight.position.set(1.4, 0.6, 0);
    group.add(hazardLight);

    const track = metalMat(0x2b2f3a, 0.4, 0.5);
    const bot = new THREE.Group();
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 1.3), metalMat(station.color, 0.5, 0.35));
    chassis.position.y = 0.45;
    bot.add(chassis);
    [-0.52, 0.52].forEach((x) => {
      const tread = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 1.4), track);
      tread.position.set(x, 0.2, 0);
      bot.add(tread);
    });
    const probeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8), track);
    probeBase.position.set(0, 0.85, 0.4);
    bot.add(probeBase);
    const probeArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), track);
    probeArm.position.set(0, 1.0, 0.7);
    probeArm.rotation.x = Math.PI / 2.6;
    bot.add(probeArm);
    const probeTip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), glowMat(station.color, 1.6));
    probeTip.position.set(0, 0.75, 1.0);
    bot.add(probeTip);
    group.add(bot);

    const human = buildPerson({ shirt: 0xd9b23a });
    human.position.set(-2.4, 0, 0.6);
    human.rotation.y = Math.PI * 0.4;
    group.add(human);

    const botPath = [new THREE.Vector3(-0.8, 0, 0), new THREE.Vector3(0.6, 0, 0)];
    let botDir = 1, botT = 0;
    group.userData.animate = (t) => {
      botT += botDir * 0.01;
      if (botT > 1) { botT = 1; botDir = -1; }
      if (botT < 0) { botT = 0; botDir = 1; }
      bot.position.lerpVectors(botPath[0], botPath[1], botT);
      const extend = Math.max(0, Math.sin(botT * Math.PI));
      probeArm.rotation.x = Math.PI / 2.6 - extend * 0.4;
      probeTip.position.z = 1.0 + extend * 0.3;
      probeTip.material.emissiveIntensity = 1.2 + Math.sin(t * 5) * 0.6;
      hazardLight.intensity = 1.0 + Math.sin(t * 6) * 0.5;
      human.userData.limbs.armL.rotation.x = Math.sin(t * 1.5) * 0.08;
    };
    group.userData.speaker = human;
    return group;
  }

  function buildWarehouseStation(station) {
    const group = new THREE.Group();
    const palletMat = flatMat(0x6b5a3f);
    const boxMat = flatMat(0x8a7450);
    [-1.8, 1.8].forEach((x) => {
      for (let level = 0; level < 2; level++) {
        const stack = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.9), level === 0 ? palletMat : boxMat);
        stack.position.set(x, 0.35 + level * 0.72, -1.3);
        group.add(stack);
        const stack2 = stack.clone();
        stack2.position.z = 1.3;
        group.add(stack2);
      }
    });

    const bot = new THREE.Group();
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 1.2), metalMat(station.color, 0.4, 0.4));
    chassis.position.y = 0.4;
    bot.add(chassis);
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.1), metalMat(0x2b2f3a, 0.4, 0.5));
    mast.position.set(0, 1.0, 0.7);
    bot.add(mast);
    const forkCarriage = new THREE.Group();
    const forkA = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.6), metalMat(0x2b2f3a, 0.4, 0.5));
    forkA.position.set(-0.2, 0, 0.9);
    const forkB = forkA.clone();
    forkB.position.x = 0.2;
    forkCarriage.add(forkA, forkB);
    forkCarriage.position.set(0, 0.4, 0);
    bot.add(forkCarriage);
    const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.2, 10);
    const wheelMat = flatMat(0x18181a);
    const wheels = [[-0.35, 0.22, 0.4], [0.35, 0.22, 0.4], [-0.35, 0.22, -0.4], [0.35, 0.22, -0.4]].map((p) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(p[0], p[1], p[2]);
      bot.add(wheel);
      return wheel;
    });
    group.add(bot);

    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), flatMat(station.color));
    group.add(crate);

    const botPath = [new THREE.Vector3(0, 0, -1.3), new THREE.Vector3(0, 0, 1.3)];
    let dir = 1, segT = 0;
    group.userData.animate = (t) => {
      segT += dir * 0.01;
      let lifting = 0;
      if (segT > 1) { segT = 1; dir = -1; }
      if (segT < 0) { segT = 0; dir = 1; }
      const nearStop = segT < 0.08 || segT > 0.92;
      lifting = nearStop ? 1 : 0;
      bot.position.lerpVectors(botPath[0], botPath[1], segT);
      bot.rotation.y = dir > 0 ? 0 : Math.PI;
      const liftHeight = 0.4 + Math.sin(t * 3) * 0.05 * lifting + (segT > 0.5 ? 0.3 : 0);
      forkCarriage.position.y = liftHeight;
      crate.position.set(bot.position.x, liftHeight + 0.5, bot.position.z + (dir > 0 ? 0.9 : -0.9));
      wheels.forEach((wheel) => { wheel.rotation.x += dir * 0.15; });
    };
    group.userData.speaker = bot;
    return group;
  }

  // ---------- station registry ----------

  const STATIONS = [
    {
      id: "workshop",
      title: "Workshop",
      text: "A robot arm and a person share one bench, passing a part hand to hand. Neither waits idle for the other — the work moves because they're doing it together.",
      position: new THREE.Vector3(-46, 0, -24),
      radius: 9.5,
      color: 0xd98a4a,
      build: buildWorkshopStation,
      dialogue: { speaker: "robot", line: "Ready when you are." }
    },
    {
      id: "crosswalk",
      title: "Crosswalk Escort",
      text: "Human-shared environments means sharing the crossing too. The robot keeps pace, not ahead and not behind — helping offered at exactly the speed it's needed.",
      position: new THREE.Vector3(40, 0, -30),
      radius: 9.5,
      color: 0x6fa58a,
      build: buildCrosswalkStation,
      dialogue: { speaker: "human", line: "Thank you for waiting." }
    },
    {
      id: "garden",
      title: "Garden",
      text: "The unglamorous work: watering one plant, then the next, then the next. Reliable execution is the whole point — nobody applauds a robot for showing up on time.",
      position: new THREE.Vector3(0, 0, 44),
      radius: 9.5,
      color: 0x8a6fd9,
      build: buildGardenStation,
      dialogue: { speaker: "robot", line: "Row four, right on schedule." }
    },
    {
      id: "safety",
      title: "Safety Yield",
      text: "Adapting isn't just about new tasks — it's noticing a person stepped into the lane and pausing, every time, without being told to.",
      position: new THREE.Vector3(-44, 0, 26),
      radius: 9.5,
      color: 0xf2b23a,
      build: buildSafetyStation,
      dialogue: { speaker: "robot", line: "Hold on. Not yet." }
    },
    {
      id: "sorting",
      title: "Adaptive Sorting",
      text: "A box, a ball, a cone — different shapes, same reliable hand. Adapting quickly means not needing a new program for every new object.",
      position: new THREE.Vector3(44, 0, 24),
      radius: 9.5,
      color: 0x4fb8d9,
      build: buildSortingStation,
      dialogue: { speaker: "robot", line: "Box. Ball. Cone. Same hands." }
    },
    {
      id: "rescue",
      title: "Search & Rescue",
      text: "No GPS grid down here, just rubble and a spotlight sweeping methodically, row by row. Reliable doesn't mean fast — it means not missing a square.",
      position: new THREE.Vector3(0, 0, -52),
      radius: 9.5,
      color: 0xffa63d,
      build: buildRescueStation,
      dialogue: { speaker: "robot", line: "Scanning. Nothing missed yet." }
    },
    {
      id: "mobility",
      title: "Mobility Companion",
      text: "Not carrying the whole load — just walking alongside at the pace that's actually needed, bag in hand. Helping, matched to the person, not the task.",
      position: new THREE.Vector3(-60, 0, 2),
      radius: 9.5,
      color: 0x4fd9a0,
      build: buildMobilityStation,
      dialogue: { speaker: "human", line: "Good pace today." }
    },
    {
      id: "hazard",
      title: "Hazard Response",
      text: "The person stays well back. The robot gets close, probes, reports — the dangerous five minutes belong to the machine, every time.",
      position: new THREE.Vector3(34, 0, -56),
      radius: 9.5,
      color: 0xff5a36,
      build: buildHazardStation,
      dialogue: { speaker: "human", line: "I'll stay back." }
    },
    {
      id: "warehouse",
      title: "Warehouse Logistics",
      text: "Pallet to shelf, shelf to pallet, the same lift a thousand times a shift. Reliable execution at a scale a person wouldn't want, and wouldn't need to.",
      position: new THREE.Vector3(60, 0, -2),
      radius: 9.5,
      color: 0x5a8fd9,
      build: buildWarehouseStation,
      dialogue: { speaker: "robot", line: "Pallet forty-one, on time." }
    }
  ];

  STATIONS.forEach((station) => {
    const tableau = station.build(station);
    tableau.position.copy(station.position);
    scene.add(tableau);
    station.tableau = tableau;
    addLandingPad(station.position, station.color);
  });

  // roaming pizza delivery rover (not a fixed station, but still a proximity target)
  const pizzaColor = 0xe0935a;
  const pizzaLoop = [
    new THREE.Vector3(-14, 0, 2),
    new THREE.Vector3(14, 0, 2),
    new THREE.Vector3(14, 0, -14),
    new THREE.Vector3(-14, 0, -14)
  ];
  const pizzaRover = buildPizzaRover();
  pizzaRover.position.copy(pizzaLoop[0]);
  scene.add(pizzaRover);
  const pizzaFollower = makePathFollower(pizzaLoop, 5.5);
  const pizzaStation = {
    id: "pizza",
    title: "Autonomous Delivery",
    text: "No fixed stop — this one's always circling the block. Same reliability as the garden bot, just with a sign on top and somewhere to be.",
    radius: 7,
    color: pizzaColor,
    getPosition: () => pizzaRover.position,
    speakerMesh: pizzaRover,
    dialogue: { speaker: "robot", line: "Extra hot, still on schedule." }
  };
  STATIONS.push(pizzaStation);

  // ---------- ambient population ----------

  function buildAmbientCar(color) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.55, 2.6), metalMat(color, 0.3, 0.5));
    body.position.y = 0.55;
    group.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.4, 1.3), metalMat(color, 0.3, 0.5));
    cabin.position.set(0, 0.95, -0.1);
    group.add(cabin);
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.24, 10);
    const wheelMat = flatMat(0x16161a);
    const wheels = [
      [-0.68, 0.3, 0.85], [0.68, 0.3, 0.85], [-0.68, 0.3, -0.85], [0.68, 0.3, -0.85]
    ].map((p) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(p[0], p[1], p[2]);
      group.add(wheel);
      return wheel;
    });
    group.userData.wheels = wheels;
    return group;
  }

  function randomGroundPoint() {
    let point;
    let tries = 0;
    do {
      point = new THREE.Vector3((Math.random() * 2 - 1) * BOUND * 0.85, 0, (Math.random() * 2 - 1) * BOUND * 0.85);
      tries++;
    } while (STATIONS.some((s) => stationPos(s).distanceTo(point) < s.radius + 6) && tries < 20);
    return point;
  }

  function randomLoop(count) {
    const points = [];
    for (let i = 0; i < count; i++) {
      points.push(randomGroundPoint());
    }
    return points;
  }

  const skinTones = [0xd9a06a, 0xb97a4a, 0xecc39a, 0x8a5a3a];
  const shirtTones = [0x3f6b4f, 0x5a6680, 0x7a4f9e, 0xd9b23a, 0x4fb8d9, 0xb94f6f];
  const carTones = [0x4f6bd9, 0x5fae7e, 0x9a9fa8, 0xd97a4f, 0x7a7fd9];

  const ambientWanderers = [];
  for (let i = 0; i < 9; i++) {
    const figure = buildPerson({
      skin: skinTones[Math.floor(Math.random() * skinTones.length)],
      shirt: shirtTones[Math.floor(Math.random() * shirtTones.length)]
    });
    scene.add(figure);
    ambientWanderers.push({
      mesh: figure,
      follower: makePathFollower(randomLoop(3), 1.6 + Math.random() * 1.2),
      seed: Math.random() * 10
    });
  }

  const ambientCars = [];
  for (let i = 0; i < 6; i++) {
    const car = buildAmbientCar(carTones[Math.floor(Math.random() * carTones.length)]);
    scene.add(car);
    ambientCars.push({
      mesh: car,
      follower: makePathFollower(randomLoop(4), 7 + Math.random() * 3)
    });
  }

  // ---------- player ----------

  const person = buildPerson({});
  scene.add(person);

  const rover = buildPersonalRover();
  rover.visible = false;
  scene.add(rover);

  const state = {
    mode: "walk",
    pov: "third",
    pos: new THREE.Vector3(0, 0, 14),
    heading: Math.PI,
    activeCard: null,
    autopilot: null,
    speechTarget: null,
    jumpY: 0,
    jumpVel: 0,
    isJumping: false,
    keys: {},
    touchForward: 0,
    touchTurn: 0
  };

  const GRAVITY = 24;
  const JUMP_SPEED = 8.2;

  const SPEEDS = {
    walk: { move: 6.5, turn: 2.6 },
    drive: { move: 13, turn: 1.7 }
  };

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    state.keys[key] = true;
    if (key === "f") {
      toggleMode();
    }
    if (key === "m") {
      toggleMap();
    }
    if (key === "v") {
      togglePOV();
    }
    if (key === " " || key === "spacebar") {
      event.preventDefault();
      tryJump();
    }
  });
  window.addEventListener("keyup", (event) => {
    state.keys[event.key.toLowerCase()] = false;
  });

  if (isTouchDevice) {
    joystickEl.hidden = false;
    touchActionsEl.hidden = false;
    hintPromptText.closest("#playground-hint").hidden = true;

    const JOYSTICK_RADIUS = 42;
    let activeTouchId = null;
    let joystickCenter = { x: 0, y: 0 };

    function setJoystick(dx, dy) {
      const dist = Math.min(JOYSTICK_RADIUS, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx);
      const knobX = Math.cos(angle) * dist;
      const knobY = Math.sin(angle) * dist;
      joystickKnobEl.style.transform = "translate(" + knobX + "px, " + knobY + "px)";
      state.touchForward = Math.max(-1, Math.min(1, -knobY / JOYSTICK_RADIUS));
      state.touchTurn = Math.max(-1, Math.min(1, -knobX / JOYSTICK_RADIUS));
    }

    function resetJoystick() {
      activeTouchId = null;
      joystickKnobEl.style.transform = "translate(0, 0)";
      state.touchForward = 0;
      state.touchTurn = 0;
    }

    joystickEl.addEventListener("touchstart", (event) => {
      event.preventDefault();
      const touch = event.changedTouches[0];
      const rect = joystickEl.getBoundingClientRect();
      joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      activeTouchId = touch.identifier;
      setJoystick(touch.clientX - joystickCenter.x, touch.clientY - joystickCenter.y);
    });

    window.addEventListener("touchmove", (event) => {
      if (activeTouchId === null) {
        return;
      }
      const touch = Array.from(event.changedTouches).find((t) => t.identifier === activeTouchId);
      if (!touch) {
        return;
      }
      event.preventDefault();
      setJoystick(touch.clientX - joystickCenter.x, touch.clientY - joystickCenter.y);
    }, { passive: false });

    window.addEventListener("touchend", (event) => {
      if (activeTouchId === null) {
        return;
      }
      const touch = Array.from(event.changedTouches).find((t) => t.identifier === activeTouchId);
      if (touch) {
        resetJoystick();
      }
    });

    touchJumpBtn.addEventListener("touchstart", (event) => {
      event.preventDefault();
      tryJump();
    });

    touchRoverBtn.addEventListener("touchstart", (event) => {
      event.preventDefault();
      toggleMode();
    });
  }

  function updateMeshVisibility() {
    person.visible = state.mode === "walk" && state.pov !== "first";
    rover.visible = state.mode === "drive" && state.pov !== "first";
  }

  function toggleMode() {
    if (state.autopilot) {
      return;
    }
    state.mode = state.mode === "walk" ? "drive" : "walk";
    state.jumpY = 0;
    state.jumpVel = 0;
    state.isJumping = false;
    updateMeshVisibility();
    hintPromptText.textContent = state.mode === "walk" ? "summon rover" : "park rover";
    playBlip(state.mode === "drive" ? 880 : 660);
    setEngineLevel(false);
  }

  function togglePOV() {
    state.pov = state.pov === "third" ? "first" : "third";
    updateMeshVisibility();
    povToggleBtn.querySelector(".fa").className = state.pov === "first" ? "fa fa-street-view" : "fa fa-video";
    playBlip(state.pov === "first" ? 460 : 580, 0.1);
  }
  povToggleBtn.addEventListener("click", togglePOV);

  function tryJump() {
    if (state.mode !== "walk" || state.autopilot || state.isJumping) {
      return;
    }
    state.isJumping = true;
    state.jumpVel = JUMP_SPEED;
    playBlip(520, 0.1);
  }

  function updateJump(dt) {
    if (!state.isJumping) {
      return;
    }
    state.jumpVel -= GRAVITY * dt;
    state.jumpY += state.jumpVel * dt;
    if (state.jumpY <= 0) {
      state.jumpY = 0;
      state.jumpVel = 0;
      state.isJumping = false;
      playFootstep();
    }
  }

  function clampToGround(vec) {
    vec.x = Math.max(-BOUND, Math.min(BOUND, vec.x));
    vec.z = Math.max(-BOUND, Math.min(BOUND, vec.z));
    return vec;
  }

  function updateManualControl(dt, t) {
    if (state.autopilot) {
      return;
    }
    const speeds = SPEEDS[state.mode];
    const keyForward = (state.keys["w"] || state.keys["arrowup"] ? 1 : 0) - (state.keys["s"] || state.keys["arrowdown"] ? 1 : 0);
    const keyTurn = (state.keys["a"] || state.keys["arrowleft"] ? 1 : 0) - (state.keys["d"] || state.keys["arrowright"] ? 1 : 0);
    const forward = keyForward !== 0 ? keyForward : state.touchForward;
    const turn = keyTurn !== 0 ? keyTurn : state.touchTurn;

    state.heading += turn * speeds.turn * dt;
    if (forward !== 0) {
      state.pos.x += Math.sin(state.heading) * forward * speeds.move * dt;
      state.pos.z += Math.cos(state.heading) * forward * speeds.move * dt;
      clampToGround(state.pos);
    }

    const activeMesh = state.mode === "walk" ? person : rover;
    if (state.mode === "walk" && forward !== 0) {
      walkCycle(person, t * 9, 0.5);
      if (t - lastFootstepTime > 0.32) {
        lastFootstepTime = t;
        playFootstep();
      }
    }
    if (state.mode === "drive" && forward !== 0) {
      rover.userData.wheels.forEach((wheel) => {
        wheel.rotation.x += forward * speeds.move * dt * 1.6;
      });
    }
    setEngineLevel(state.mode === "drive" && forward !== 0);
    activeMesh.position.set(state.pos.x, state.mode === "walk" ? state.jumpY : 0, state.pos.z);
    activeMesh.rotation.y = state.heading;
  }

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function startAutopilot(target) {
    const distance = state.pos.distanceTo(target);
    state.autopilot = {
      start: state.pos.clone(),
      target: target.clone(),
      startHeading: state.heading,
      targetHeading: headingBetween(state.pos, target),
      duration: Math.max(1.1, distance / (SPEEDS[state.mode].move * 0.65)),
      elapsed: 0
    };
  }

  function updateAutopilot(dt) {
    const ap = state.autopilot;
    if (!ap) {
      return;
    }
    ap.elapsed += dt;
    const t = Math.min(1, ap.elapsed / ap.duration);
    const eased = easeInOutQuad(t);
    state.pos.lerpVectors(ap.start, ap.target, eased);
    state.heading = lerpAngle(ap.startHeading, ap.targetHeading, eased);

    const activeMesh = state.mode === "walk" ? person : rover;
    activeMesh.position.set(state.pos.x, state.mode === "walk" ? state.jumpY : 0, state.pos.z);
    activeMesh.rotation.y = state.heading;
    setEngineLevel(state.mode === "drive");

    if (t >= 1) {
      state.autopilot = null;
      setEngineLevel(false);
    }
  }

  function updateCamera(dt) {
    const activeMesh = state.mode === "walk" ? person : rover;

    if (state.pov === "first") {
      const eyeHeight = state.mode === "walk" ? 1.95 : 1.35;
      const eyePos = activeMesh.position.clone().add(new THREE.Vector3(0, eyeHeight, 0));
      camera.position.copy(eyePos);
      const lookDir = new THREE.Vector3(Math.sin(state.heading), 0, Math.cos(state.heading));
      camera.lookAt(eyePos.clone().add(lookDir));
      return;
    }

    const back = new THREE.Vector3(Math.sin(state.heading), 0, Math.cos(state.heading)).multiplyScalar(-8);
    const desired = activeMesh.position.clone().add(back).add(new THREE.Vector3(0, 6, 0));
    camera.position.lerp(desired, 1 - Math.pow(0.0025, dt));
    const lookTarget = activeMesh.position.clone().add(new THREE.Vector3(0, 1.4, 0));
    camera.lookAt(lookTarget);
  }

  function stationPos(station) {
    return station.getPosition ? station.getPosition() : station.position;
  }

  function updateProximity() {
    if (state.autopilot) {
      return;
    }
    let nearest = null;
    STATIONS.forEach((station) => {
      const p = stationPos(station);
      const d = Math.hypot(state.pos.x - p.x, state.pos.z - p.z);
      if (d < station.radius) {
        nearest = station;
      }
    });
    if (nearest !== state.activeCard) {
      state.activeCard = nearest;
      if (nearest) {
        cardTitleEl.textContent = nearest.title;
        cardTextEl.textContent = nearest.text;
        cardEl.hidden = false;
        requestAnimationFrame(() => cardEl.classList.add("is-visible"));
        playBlip(nearest.dialogue && nearest.dialogue.speaker === "robot" ? 520 : 740, 0.12);
        if (nearest.dialogue) {
          showSpeechBubble(nearest);
          speakLine(nearest.dialogue.line, nearest.dialogue.speaker);
        }
      } else {
        cardEl.classList.remove("is-visible");
        setTimeout(() => {
          if (!state.activeCard) {
            cardEl.hidden = true;
          }
        }, 350);
        hideSpeechBubble();
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      }
    }
  }

  function speakerMeshFor(station) {
    if (station.speakerMesh) {
      return station.speakerMesh;
    }
    return station.tableau ? station.tableau.userData.speaker : null;
  }

  let speechHideTimer = null;
  function showSpeechBubble(station) {
    const mesh = speakerMeshFor(station);
    if (!mesh) {
      return;
    }
    speechTextEl.textContent = "“" + station.dialogue.line + "”";
    speechBubbleEl.hidden = false;
    requestAnimationFrame(() => speechBubbleEl.classList.add("is-visible"));
    state.speechTarget = mesh;
    clearTimeout(speechHideTimer);
    speechHideTimer = setTimeout(hideSpeechBubble, 4200);
  }

  function hideSpeechBubble() {
    clearTimeout(speechHideTimer);
    speechBubbleEl.classList.remove("is-visible");
    state.speechTarget = null;
    setTimeout(() => {
      if (!state.speechTarget) {
        speechBubbleEl.hidden = true;
      }
    }, 300);
  }

  function updateSpeechBubble() {
    if (!state.speechTarget || speechBubbleEl.hidden) {
      return;
    }
    const worldPos = new THREE.Vector3();
    state.speechTarget.getWorldPosition(worldPos);
    worldPos.y += 2.5;
    worldPos.project(camera);
    if (worldPos.z > 1) {
      speechBubbleEl.classList.remove("is-visible");
      return;
    }
    const x = (worldPos.x * 0.5 + 0.5) * mount.clientWidth;
    const y = (-worldPos.y * 0.5 + 0.5) * mount.clientHeight;
    speechBubbleEl.style.left = x + "px";
    speechBubbleEl.style.top = y + "px";
  }

  function toggleMap() {
    const isHidden = mapOverlay.hidden;
    mapOverlay.hidden = !isHidden;
    playBlip(isHidden ? 520 : 400, 0.12);
    if (isHidden) {
      drawMap();
    }
  }
  mapToggleBtn.addEventListener("click", toggleMap);
  mapCloseBtn.addEventListener("click", toggleMap);

  function worldToMap(x, z) {
    const scale = mapCanvas.width / (GROUND_SIZE * 1.3);
    return { x: mapCanvas.width / 2 + x * scale, y: mapCanvas.height / 2 + z * scale };
  }

  function drawMap() {
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    mapCtx.fillStyle = "#1b2420";
    mapCtx.fillRect(0, 0, mapCanvas.width, mapCanvas.height);

    STATIONS.forEach((station) => {
      const wp = stationPos(station);
      const p = worldToMap(wp.x, wp.z);
      mapCtx.beginPath();
      mapCtx.arc(p.x, p.y, 9, 0, Math.PI * 2);
      mapCtx.fillStyle = "#" + station.color.toString(16).padStart(6, "0");
      mapCtx.fill();
      mapCtx.fillStyle = "rgba(240, 237, 230, 0.9)";
      mapCtx.font = "11px Archivo, sans-serif";
      mapCtx.textAlign = "center";
      mapCtx.fillText(station.title, p.x, p.y + 20);
    });

    const player = worldToMap(state.pos.x, state.pos.z);
    mapCtx.beginPath();
    mapCtx.arc(player.x, player.y, 6, 0, Math.PI * 2);
    mapCtx.fillStyle = "#f0ede6";
    mapCtx.fill();
  }

  mapCanvas.addEventListener("click", (event) => {
    const rect = mapCanvas.getBoundingClientRect();
    const clickX = (event.clientX - rect.left) * (mapCanvas.width / rect.width);
    const clickY = (event.clientY - rect.top) * (mapCanvas.height / rect.height);

    STATIONS.forEach((station) => {
      const wp = stationPos(station);
      const p = worldToMap(wp.x, wp.z);
      if (Math.hypot(clickX - p.x, clickY - p.y) < 16) {
        startAutopilot(wp);
        mapOverlay.hidden = true;
      }
    });
  });

  function onResize() {
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
  }
  window.addEventListener("resize", onResize);

  const DAY_LENGTH = 110;
  const nightColor = new THREE.Color(0x232c4d);
  const dayColor = new THREE.Color(0x7badde);
  const duskColor = new THREE.Color(0xe8a368);
  const bgColor = new THREE.Color();

  function updateDayNight() {
    const phase = (clock.elapsedTime / DAY_LENGTH) % 1;
    const angle = phase * Math.PI * 2;
    const elevation = Math.sin(angle);
    const azimuth = Math.cos(angle);
    const isNight = elevation < 0;

    const dir = new THREE.Vector3(azimuth * 85, elevation * 85 + 12, -28);
    sun.position.copy(dir);
    sunDisc.position.copy(dir).multiplyScalar(0.6);
    sunDisc.visible = elevation > -0.22;

    const daylight = THREE.MathUtils.clamp(elevation, 0, 1);
    const duskGlow = Math.max(0, 1 - Math.abs(elevation) * 1.6);

    bgColor.copy(nightColor).lerp(dayColor, daylight).lerp(duskColor, duskGlow * 0.55);
    scene.background.copy(bgColor);
    scene.fog.color.copy(bgColor);

    sun.intensity = 0.55 + daylight * 0.65;
    sun.color.set(isNight ? 0xa8bdff : 0xffe3b0);
    const discColor = isNight ? 0xcfdcff : 0xfff1c7;
    sunDisc.material.color.set(discColor);
    sunDisc.material.emissive.set(discColor);
    hemiLight.intensity = 0.55 + daylight * 0.45;

    starsMaterial.opacity = THREE.MathUtils.clamp(1 - daylight * 1.6, 0, 0.9);

    const nightBoost = 1 + (1 - daylight) * 0.7;
    skylineBeacons.forEach((beacon) => {
      beacon.material.emissiveIntensity = 1.1 * nightBoost;
    });
  }

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.elapsedTime;

    updateDayNight();
    updateJump(dt);
    updateAutopilot(dt);
    updateManualControl(dt, t);
    updateCamera(dt);
    updateProximity();
    updateSpeechBubble();

    STATIONS.forEach((station) => {
      if (station.tableau && station.tableau.userData.animate) {
        station.tableau.userData.animate(t, dt);
      }
    });

    const pizzaMove = pizzaFollower.update(dt);
    pizzaRover.position.copy(pizzaMove.pos);
    pizzaRover.rotation.y = pizzaMove.heading;
    pizzaRover.userData.wheels.forEach((wheel) => {
      wheel.rotation.x += dt * 4;
    });
    pizzaRover.userData.beacon.material.emissiveIntensity = 1.4 + Math.sin(t * 6) * 0.6;

    ambientWanderers.forEach((w) => {
      const move = w.follower.update(dt);
      w.mesh.position.copy(move.pos);
      w.mesh.rotation.y = move.heading;
      walkCycle(w.mesh, t * 4.5 + w.seed, 0.4);
    });

    ambientCars.forEach((c) => {
      const move = c.follower.update(dt);
      c.mesh.position.copy(move.pos);
      c.mesh.rotation.y = move.heading;
      c.mesh.userData.wheels.forEach((wheel) => {
        wheel.rotation.x += dt * 5;
      });
    });

    if (!mapOverlay.hidden) {
      drawMap();
    }

    renderer.render(scene, camera);
  }

  person.position.set(state.pos.x, 0, state.pos.z);
  animate();
})();
