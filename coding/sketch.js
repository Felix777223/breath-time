/*
  Project:Breathing Time
  Name: Feiyang Zhou
  Date: 2026.01.11
  Author: Feiyang Zhou

  Description:
  This sketch visualises time as a growing archive of contour rings.
  The system continues slowly on its own, but breathing acts as a
  disturbance: it accelerates growth and leaves a darker, jagged trace.
  Over time, new rings appear lighter and gradually darken, so the image
  becomes a record of past events rather than a simple animation.

  Instructions:
  - Click "Connect Arduino" to use the stretch/breath sensor (WebSerial).
  - If not connected, hold the mouse to simulate breathing.
  - Press B to toggle background (white/black).
  - Press R to reset.
  - Click Fullscreen to enter/exit fullscreen.

  Acknowledgements:
  - Built using p5.js (https://p5js.org/)
*/

// =======================
// Serial (WebSerial)
// =======================
let port;
let reader;
let serialActive = false;
let sensorValue = 0; // 0..100 after normalisation

let connectBtn;
let fullscreenBtn;

// =======================
// Visual system
// =======================
let nodes = [];
let rings = [];
let gridStep = 10;
let cols, rows;
let fieldVals;

let strength = 0; // 0..1
let offset = 0;
let drift = 0;

let ringCursor = 0;
let ringSpacing = 7.2;
let maxRings = 160;

let bgMode = "white";
let contrast = 1.0;

// =======================
// Breath pulse
// =======================
let lastStrength = 0;
let lastPulseMs = 0;

const PULSE_COOLDOWN_MS = 450;
const PULSE_THRESHOLD = 0.55;
const PULSE_RISE = 0.18;

const BURST_COUNT = 14;
const BURST_SPREAD = 0.9;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(2);

  connectBtn = createButton("Connect Arduino");
  connectBtn.position(16, 16);
  connectBtn.mousePressed(connectSerial);

  fullscreenBtn = createButton("Fullscreen");
  fullscreenBtn.position(16, 52);
  fullscreenBtn.mousePressed(toggleFullscreen);

  initSystem();
}

function initSystem() {
  cols = floor(width / gridStep);
  rows = floor(height / gridStep);
  fieldVals = new Float32Array((cols + 1) * (rows + 1));

  nodes = [];
  for (let i = 0; i < 8; i++) {
    nodes.push(
      new FieldNode(
        random(width * 0.08, width * 0.92),
        random(height * 0.10, height * 0.90),
        random(min(width, height) * 0.06, min(width, height) * 0.16)
      )
    );
  }

  rings = [];
  ringCursor = 0;
  offset = 0;
  drift = 0;

  strength = 0;
  lastStrength = 0;
  lastPulseMs = 0;

  // seed some history
  for (let i = 0; i < 30; i++) {
    spawnRing(false);
    rings[rings.length - 1].bornMs -= (30 - i) * 300;
  }
}

function draw() {
  // ---- input ----
  let target = 0;
  if (serialActive) {
    target = map(sensorValue, 0, 100, 0, 1);
  } else {
    if (mouseIsPressed) target = map(mouseY, height, 0, 0.05, 1);
    else target = 0;
  }
  target = constrain(target, 0, 1);
  strength = lerp(strength, target, 0.14);

  // ---- dynamics ----
  offset += 0.12 + strength * 3.4;
  drift += 0.0018 + strength * 0.02;

  // ring growth (always on, faster when breathing)
  ringCursor += 0.08 + strength * 1.25;
  if (ringCursor >= 1.0) {
    let n = floor(ringCursor);
    ringCursor -= n;
    n = min(n, 2);
    for (let k = 0; k < n; k++) spawnRing(false);
  }

  // breath event -> burst
  detectBreathPulse();

  // update field sources
  for (let n of nodes) n.update(drift, strength);

  // compute field grid
  computeField(strength);

  // ---- render ----
  drawSolidBackground();
  for (let i = 0; i < rings.length; i++) rings[i].render();

  // overlay text
  noStroke();
  fill(bgMode === "white" ? 0 : 255, 170);
  textSize(13);
  text(serialActive ? "Serial: ON" : "Serial: OFF (mouse fallback)", 16, height - 54);
  text("Hold mouse = breathe | B toggle bg | R reset | Fullscreen", 16, height - 36);
  text("Strength: " + nf(strength, 1, 2) + "  Rings: " + rings.length, 16, height - 18);

  lastStrength = strength;
}

function detectBreathPulse() {
  const now = millis();
  if (now - lastPulseMs < PULSE_COOLDOWN_MS) return;

  const rise = strength - lastStrength;
  const crossed = lastStrength < PULSE_THRESHOLD && strength >= PULSE_THRESHOLD;

  if (crossed || rise > PULSE_RISE) {
    lastPulseMs = now;
    spawnRingBurst(BURST_COUNT);
  }
}

function spawnRingBurst(count) {
  const baseLevel = currentLevel();
  for (let i = 0; i < count; i++) {
    const t = count <= 1 ? 0 : i / (count - 1) - 0.5;
    const level = baseLevel + t * BURST_SPREAD * ringSpacing;
    rings.push(new RingLayer(level, millis(), true));
  }
  trimRings();
}

function currentLevel() {
  let level = -30 + (offset % (ringSpacing * 90));
  return level - 45;
}

function spawnRing(isBreath) {
  rings.push(new RingLayer(currentLevel(), millis(), isBreath));
  trimRings();
}

function trimRings() {
  while (rings.length > maxRings) rings.shift();
}

function drawSolidBackground() {
  if (bgMode === "white") background(255);
  else background(0);
}

function computeField(s) {
  let noiseAmp = lerp(3.0, 18.0, s);
  let noiseScale = 0.010;
  let grainScale = 0.030;

  let idx = 0;
  for (let gy = 0; gy <= rows; gy++) {
    let y = gy * gridStep;
    for (let gx = 0; gx <= cols; gx++) {
      let x = gx * gridStep;

      let dMin = 1e9;
      for (let n of nodes) {
        let d = dist(x, y, n.x, n.y) - n.r;
        if (d < dMin) dMin = d;
      }

      let n1 = noise(x * noiseScale, y * noiseScale, drift);
      let n2 = noise(x * grainScale + 100.0, y * grainScale + 200.0, drift * 1.4);

      let v =
        dMin +
        (n1 - 0.5) * 2.0 * noiseAmp +
        (n2 - 0.5) * 2.0 * 2.2;

      fieldVals[idx++] = v;
    }
  }
}

function drawContourAtLevel(level, strokeCol, sw, jaggyAmt) {
  stroke(strokeCol);
  strokeWeight(sw);
  noFill();

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let i0 = y * (cols + 1) + x;
      let i1 = i0 + 1;
      let i2 = i0 + (cols + 1);
      let i3 = i2 + 1;

      let v0 = fieldVals[i0];
      let v1 = fieldVals[i1];
      let v2 = fieldVals[i2];
      let v3 = fieldVals[i3];

      let code = 0;
      if (v0 < level) code |= 1;
      if (v1 < level) code |= 2;
      if (v3 < level) code |= 4;
      if (v2 < level) code |= 8;
      if (code === 0 || code === 15) continue;

      let x0 = x * gridStep;
      let y0 = y * gridStep;
      let x1p = (x + 1) * gridStep;
      let y1p = (y + 1) * gridStep;

      let A = lerpEdge(x0, y0, x1p, y0, v0, v1, level);
      let B = lerpEdge(x1p, y0, x1p, y1p, v1, v3, level);
      let C = lerpEdge(x0, y1p, x1p, y1p, v2, v3, level);
      let D = lerpEdge(x0, y0, x0, y1p, v0, v2, level);

      if (jaggyAmt > 0) {
        A = jagPoint(A, jaggyAmt, x, y);
        B = jagPoint(B, jaggyAmt, x + 13, y + 7);
        C = jagPoint(C, jaggyAmt, x + 29, y + 11);
        D = jagPoint(D, jaggyAmt, x + 41, y + 19);
      }

      switch (code) {
        case 1:  line(D.x, D.y, A.x, A.y); break;
        case 2:  line(A.x, A.y, B.x, B.y); break;
        case 3:  line(D.x, D.y, B.x, B.y); break;
        case 4:  line(B.x, B.y, C.x, C.y); break;
        case 5:  line(D.x, D.y, A.x, A.y); line(B.x, B.y, C.x, C.y); break;
        case 6:  line(A.x, A.y, C.x, C.y); break;
        case 7:  line(D.x, D.y, C.x, C.y); break;
        case 8:  line(D.x, D.y, C.x, C.y); break;
        case 9:  line(A.x, A.y, C.x, C.y); break;
        case 10: line(A.x, A.y, B.x, B.y); line(D.x, D.y, C.x, C.y); break;
        case 11: line(B.x, B.y, C.x, C.y); break;
        case 12: line(D.x, D.y, B.x, B.y); break;
        case 13: line(A.x, A.y, B.x, B.y); break;
        case 14: line(D.x, D.y, A.x, A.y); break;
      }
    }
  }
}

function jagPoint(p, amt, sx, sy) {
  const jx = (noise(sx * 0.13, sy * 0.13, drift * 1.7) - 0.5) * 2 * amt;
  const jy = (noise(sx * 0.13 + 99, sy * 0.13 + 77, drift * 1.7) - 0.5) * 2 * amt;
  return { x: p.x + jx, y: p.y + jy };
}

function lerpEdge(xA, yA, xB, yB, vA, vB, level) {
  let t = 0.5;
  let denom = vB - vA;
  if (abs(denom) > 1e-6) t = (level - vA) / denom;
  t = constrain(t, 0, 1);
  return { x: lerp(xA, xB, t), y: lerp(yA, yB, t) };
}

class FieldNode {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.vx = random(-0.18, 0.18);
    this.vy = random(-0.18, 0.18);
    this.seed = random(1000);
  }

  update(t, s) {
    let speed = lerp(0.22, 0.55, s);
    let nx = noise(this.seed, t) - 0.5;
    let ny = noise(this.seed + 100, t) - 0.5;

    this.x += (this.vx + nx * 0.7) * speed;
    this.y += (this.vy + ny * 0.7) * speed;

    if (this.x < width * 0.05 || this.x > width * 0.95) this.vx *= -1;
    if (this.y < height * 0.08 || this.y > height * 0.92) this.vy *= -1;
  }
}

class RingLayer {
  constructor(level, bornMs, isBreath) {
    this.level = level;
    this.bornMs = bornMs;
    this.isBreath = isBreath;
  }

  render() {
    let age = (millis() - this.bornMs) / 1000.0;

    let sw = lerp(0.7, 1.15, strength) * (this.isBreath ? 1.05 : 1.0);

    let a;
    if (this.isBreath) {
      a = map(age, 0, 14, 18, 200);
    } else {
      a = map(age, 0, 12, 35, 210);
    }
    a = constrain(a, 12, 220);
    a *= lerp(0.9, 1.25, strength) * contrast;

    let col = (bgMode === "white") ? color(0, 0, 0, a) : color(255, 255, 255, a);

    // keep this EXACTLY as requested
    let jaggyAmt = this.isBreath ? lerp(16, 4.4, strength) : 0;

    drawContourAtLevel(this.level, col, sw, jaggyAmt);
  }
}

function toggleFullscreen() {
  fullscreen(!fullscreen());
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initSystem();
}

function keyPressed() {
  if (key === "r" || key === "R") initSystem();
  if (key === "b" || key === "B") bgMode = bgMode === "white" ? "black" : "white";
}

// =======================
// WebSerial connect
// =======================
async function connectSerial() {
  if (!("serial" in navigator)) {
    alert("WebSerial not supported. Use Chrome/Edge desktop.");
    return;
  }
  if (!isSecureContext) {
    alert("WebSerial needs https/localhost. p5 editor is ok; file:// is not.");
    return;
  }
  if (serialActive) return;

  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();

    serialActive = true;
    connectBtn.html("Arduino Connected");

    let buffer = "";

    while (serialActive) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;

      buffer += value;
      let lines = buffer.split("\n");
      buffer = lines.pop();

      for (let line of lines) {
        let v = parseInt(line.trim(), 10);
        if (isNaN(v)) continue;

        // accept 0..100 OR 0..1023
        if (v > 100) v = Math.round(map(v, 0, 1023, 0, 100));
        v = constrain(v, 0, 100);

        sensorValue = v;
      }
    }

    await readableStreamClosed;
  } catch (err) {
    console.log(err);
    serialActive = false;
    connectBtn.html("Connect Arduino");
    alert("Serial connect/read failed. Check permissions and Arduino output.");
  }
}
