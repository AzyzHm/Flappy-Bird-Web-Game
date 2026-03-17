const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
const overlay      = document.getElementById('overlay');
const startBtn     = document.getElementById('startBtn');
const scoreHud     = document.getElementById('score-hud');
const overlayText  = document.getElementById('overlayText');
const scoreDisplay = document.getElementById('scoreDisplay');

const W = canvas.width;
const H = canvas.height;

// ── Palette ──────────────────────────────────────────────────────────────────
const SKY_TOP    = '#0f3460';
const SKY_BOT    = '#16213e';
const PIPE_COLOR = '#0f9b58';
const PIPE_DARK  = '#0a6b3d';
const PIPE_LIGHT = '#16d97a';
const GROUND_COL = '#c8a96e';
const GROUND_TOP = '#e8c97e';

// ── State ─────────────────────────────────────────────────────────────────────
let bird, pipes, score, bestScore, frame, running, dead;
bestScore = 0;

// Stars
const stars = Array.from({length: 60}, () => ({
  x: Math.random() * W,
  y: Math.random() * (H * 0.7),
  r: Math.random() * 1.5 + 0.3,
  a: Math.random()
}));

// Clouds
const clouds = Array.from({length: 4}, (_, i) => ({
  x: i * 120,
  y: 40 + Math.random() * 100,
  w: 80 + Math.random() * 60,
  speed: 0.3 + Math.random() * 0.2
}));

const GROUND_H = 60;
const PLAYH    = H - GROUND_H;
const GAP      = 155;
const PIPE_W   = 60;
const PIPE_SPD = 2.8;
const GRAVITY  = 0.38;
const JUMP     = -7.2;
const BIRD_R   = 14;

function initGame() {
  bird  = { x: 90, y: H / 2 - 40, vy: 0, angle: 0 };
  pipes = [];
  score = 0;
  frame = 0;
  dead  = false;
  running = true;
  scoreHud.textContent = '0';
}

function spawnPipe() {
  const minTop = 60;
  const maxTop = PLAYH - GAP - 60;
  const topH   = minTop + Math.random() * (maxTop - minTop);
  pipes.push({ x: W + 10, topH, passed: false });
}

// ── Draw helpers ─────────────────────────────────────────────────────────────
function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, PLAYH);
  g.addColorStop(0, SKY_TOP);
  g.addColorStop(1, SKY_BOT);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, PLAYH);
}

function drawStars() {
  stars.forEach(s => {
    s.a += 0.02;
    ctx.globalAlpha = 0.4 + 0.4 * Math.abs(Math.sin(s.a));
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawClouds() {
  clouds.forEach(c => {
    if (running && !dead) c.x -= c.speed;
    if (c.x + c.w < 0) c.x = W + 10;
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.w / 2, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(c.x - 25, c.y + 8, c.w / 3, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(c.x + 28, c.y + 6, c.w / 3.5, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawGround() {
  // ground body
  ctx.fillStyle = GROUND_COL;
  ctx.fillRect(0, PLAYH, W, GROUND_H);
  // top stripe
  ctx.fillStyle = GROUND_TOP;
  ctx.fillRect(0, PLAYH, W, 10);
  // animated stripes
  const stripeW = 30;
  const offset  = (frame * PIPE_SPD) % (stripeW * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let x = -stripeW * 2 + offset; x < W + stripeW; x += stripeW * 2) {
    ctx.fillRect(x, PLAYH, stripeW, GROUND_H);
  }
}

function drawPipe(p) {
  const gapY2 = p.topH + GAP;

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(p.x + 6, 0,       PIPE_W, p.topH);
  ctx.fillRect(p.x + 6, gapY2,   PIPE_W, PLAYH - gapY2);

  // pipe body gradient
  const pg = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
  pg.addColorStop(0,    PIPE_DARK);
  pg.addColorStop(0.3,  PIPE_COLOR);
  pg.addColorStop(0.7,  PIPE_COLOR);
  pg.addColorStop(1,    PIPE_DARK);
  ctx.fillStyle = pg;
  ctx.fillRect(p.x, 0,     PIPE_W, p.topH);
  ctx.fillRect(p.x, gapY2, PIPE_W, PLAYH - gapY2);

  // highlight
  ctx.fillStyle = PIPE_LIGHT;
  ctx.fillRect(p.x + 6, 0,     6, p.topH);
  ctx.fillRect(p.x + 6, gapY2, 6, PLAYH - gapY2);

  // caps
  const capW = PIPE_W + 14;
  const capH = 28;
  const capX = p.x - 7;

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(capX + 5, p.topH - capH + 3, capW, capH);
  ctx.fillRect(capX + 5, gapY2 + 3,          capW, capH);

  const cg = ctx.createLinearGradient(capX, 0, capX + capW, 0);
  cg.addColorStop(0,   PIPE_DARK);
  cg.addColorStop(0.3, PIPE_COLOR);
  cg.addColorStop(1,   PIPE_DARK);
  ctx.fillStyle = cg;
  ctx.fillRect(capX, p.topH - capH, capW, capH);
  ctx.fillRect(capX, gapY2,         capW, capH);

  ctx.fillStyle = PIPE_LIGHT;
  ctx.fillRect(capX + 5, p.topH - capH, 6, capH);
  ctx.fillRect(capX + 5, gapY2,         6, capH);
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.angle);

  // body
  const bg = ctx.createRadialGradient(-4, -4, 2, 0, 0, BIRD_R);
  bg.addColorStop(0, '#ffe066');
  bg.addColorStop(0.6, '#f5c800');
  bg.addColorStop(1,  '#c89000');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(0, 0, BIRD_R, BIRD_R - 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // wing
  const wingFlap = Math.sin(frame * 0.3) * 4;
  ctx.fillStyle = '#e8a800';
  ctx.beginPath();
  ctx.ellipse(-4, 2 + wingFlap, 8, 5, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // eye white
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(6, -4, 5, 0, Math.PI * 2);
  ctx.fill();

  // pupil
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(7.5, -3.5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // highlight
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(8.5, -4.5, 1, 0, Math.PI * 2);
  ctx.fill();

  // beak
  ctx.fillStyle = '#ff8c00';
  ctx.beginPath();
  ctx.moveTo(12, -2);
  ctx.lineTo(20, 0);
  ctx.lineTo(12, 4);
  ctx.closePath();
  ctx.fill();

  // red cheek
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#ff6060';
  ctx.beginPath();
  ctx.ellipse(4, 3, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ── Collision ─────────────────────────────────────────────────────────────────
function checkCollision(p) {
  const bx = bird.x, by = bird.y, r = BIRD_R - 3;
  const capX = p.x - 7, capW = PIPE_W + 14;
  const capH = 28;

  // top pipe + cap
  if (bx + r > capX && bx - r < capX + capW) {
    if (by - r < p.topH) return true;
  }
  if (bx + r > p.x && bx - r < p.x + PIPE_W) {
    if (by - r < p.topH - capH) return true;
  }

  // bottom pipe + cap
  const gapY2 = p.topH + GAP;
  if (bx + r > capX && bx - r < capX + capW) {
    if (by + r > gapY2) return true;
  }
  if (bx + r > p.x && bx - r < p.x + PIPE_W) {
    if (by + r > gapY2 + capH) return true;
  }

  return false;
}

// ── Particles ─────────────────────────────────────────────────────────────────
let particles = [];

function burst() {
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 2 + Math.random() * 4;
    particles.push({
      x: bird.x, y: bird.y,
      vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 1, color: ['#ffe066','#f5c800','#ff8c00','#ff6060'][Math.floor(Math.random()*4)]
    });
  }
}

function updateParticles() {
  particles = particles.filter(p => p.life > 0.05);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= 0.03;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.1, 4 * p.life), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// ── Screen shake ──────────────────────────────────────────────────────────────
let shakeFrames = 0;

function applyShake() {
  if (shakeFrames > 0) {
    const d = 5 * (shakeFrames / 10);
    ctx.translate(
      (Math.random() - 0.5) * d,
      (Math.random() - 0.5) * d
    );
    shakeFrames--;
  }
}

// ── Main loop ─────────────────────────────────────────────────────────────────
function gameLoop() {
  ctx.save();
  applyShake();

  drawSky();
  drawStars();
  drawClouds();

  if (running) {
    // Bird physics
    if (!dead) {
      bird.vy += GRAVITY;
      bird.y  += bird.vy;
      bird.angle = Math.min(Math.max(bird.vy * 0.06, -0.5), 1.2);
      frame++;

      // Spawn pipes
      if (frame % 90 === 0) spawnPipe();

      // Move & check pipes
      for (let p of pipes) {
        p.x -= PIPE_SPD;
        if (!p.passed && p.x + PIPE_W < bird.x) {
          p.passed = true;
          score++;
          scoreHud.textContent = score;
        }
        if (checkCollision(p)) {
          die();
        }
      }

      // Remove offscreen pipes
      pipes = pipes.filter(p => p.x + PIPE_W + 20 > 0);

      // Ground / ceiling
      if (bird.y + BIRD_R >= PLAYH || bird.y - BIRD_R <= 0) die();
    }

    // Draw
    pipes.forEach(drawPipe);
    drawGround();
    drawBird();
    updateParticles();

    if (dead) {
      // slow fade then show overlay
      ctx.fillStyle = 'rgba(10,10,30,0.04)';
      ctx.fillRect(0, 0, W, H);
    }
  } else {
    // Idle: draw background with a lone pipe for aesthetics
    drawGround();
    updateParticles();
  }

  ctx.restore();
  requestAnimationFrame(gameLoop);
}

function die() {
  if (dead) return;
  dead = true;
  burst();
  shakeFrames = 10;
  if (score > bestScore) bestScore = score;

  setTimeout(() => {
    overlayText.textContent = score > 0 ? 'GAME OVER' : 'STAY ALIVE!';
    scoreDisplay.innerHTML = `SCORE  : ${score}<br>BEST   : ${bestScore}`;
    startBtn.textContent = 'RETRY';
    overlay.classList.remove('hidden');
  }, 900);
}

function jump() {
  if (!running || dead) return;
  bird.vy = JUMP;
  particles.push({
    x: bird.x - 8, y: bird.y + 4,
    vx: -1 - Math.random(), vy: -1 - Math.random() * 2,
    life: 0.7, color: '#f5c800'
  });
}

startBtn.addEventListener('click', () => {
  initGame();
  overlay.classList.add('hidden');
});

document.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); jump(); }
});
canvas.addEventListener('click', jump);
document.addEventListener('touchstart', e => { e.preventDefault(); jump(); }, { passive: false });

running = false;
bird = { x: 90, y: H / 2 - 40, vy: 0, angle: 0 };
pipes = [];
score = 0;
frame = 0;
dead = false;
gameLoop();