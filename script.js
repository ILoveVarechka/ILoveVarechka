/* ========== 1. Падающие сердечки на фоне ========== */
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function heartPath(x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.3);
  ctx.bezierCurveTo(x - s, y + s * 0.6, x, y + s * 0.9, x, y + s * 1.1);
  ctx.bezierCurveTo(x, y + s * 0.9, x + s, y + s * 0.6, x + s, y + s * 0.3);
  ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.3);
  ctx.fill();
}

const COLORS = ['#ff477e', '#ff6b9d', '#ff8fb1', '#ffa5c3', '#c9184a'];

class Heart {
  constructor(initial) { this.reset(initial); }
  reset(initial) {
    this.x = Math.random() * W;
    this.y = initial ? Math.random() * H : -40;
    this.size = 6 + Math.random() * 14;
    this.speed = 0.3 + Math.random() * 0.9;
    this.alpha = 0.12 + Math.random() * 0.35;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.005 + Math.random() * 0.02;
    this.color = COLORS[(Math.random() * COLORS.length) | 0];
  }
  update() {
    this.y += this.speed;
    this.wobble += this.wobbleSpeed;
    this.x += Math.sin(this.wobble) * 0.5;
    if (this.y > H + 40) this.reset(false);
  }
  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    heartPath(this.x, this.y, this.size);
    ctx.globalAlpha = 1;
  }
}

const hearts = Array.from({ length: 45 }, () => new Heart(true));
(function loop() {
  ctx.clearRect(0, 0, W, H);
  hearts.forEach(h => { h.update(); h.draw(); });
  requestAnimationFrame(loop);
})();

/* ========== 2. Счётчик времени вместе ========== */
const START_DATE = new Date('2025-05-07T15:50:00');

function updateCounter() {
  const diff = Math.max(0, Date.now() - START_DATE.getTime());
  const totalSec = Math.floor(diff / 1000);
  const days  = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins  = Math.floor((totalSec % 3600) / 60);
  const secs  = totalSec % 60;

  document.getElementById('days').textContent  = days;
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('mins').textContent  = String(mins).padStart(2, '0');
  document.getElementById('secs').textContent  = String(secs).padStart(2, '0');
}
updateCounter();
setInterval(updateCounter, 1000);

/* ========== 3. Эффект печатной машинки ========== */
const TYPE_TEXT = 'Ты — самая у меня лучшаая!! Спасибо, что ты есть <3';
const typeEl = document.getElementById('typewriter');
let typeIndex = 0;

function type() {
  if (typeIndex <= TYPE_TEXT.length) {
    typeEl.textContent = TYPE_TEXT.slice(0, typeIndex);
    typeIndex++;
    setTimeout(type, 55);
  }
}
setTimeout(type, 1000);

/* ========== 4. Взрыв сердечек по клику ========== */
document.getElementById('loveBtn').addEventListener('click', (e) => {
  const emojis = ['💖', '💕', '💗', '❤️', '💘', '💝'];
  for (let i = 0; i < 28; i++) {
    const el = document.createElement('span');
    el.className = 'burst-heart';
    el.textContent = emojis[(Math.random() * emojis.length) | 0];
    el.style.left = e.clientX + 'px';
    el.style.top = e.clientY + 'px';
    el.style.fontSize = (16 + Math.random() * 26) + 'px';
    el.style.setProperty('--tx', ((Math.random() - 0.5) * 400) + 'px');
    el.style.setProperty('--ty', ((Math.random() - 0.5) * 400 - 100) + 'px');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
});

/* ========== 5. Мини-игра «Поймай сердечки» ========== */
const gameArea = document.getElementById('gameArea');
const scoreEl  = document.getElementById('score');
const timerEl  = document.getElementById('timer');
const startBtn = document.getElementById('startGame');
const resultEl = document.getElementById('gameResult');

const WIN_SCORE = 10;
const GAME_TIME = 20;

let active = false, score = 0, timeLeft = GAME_TIME;
let gameTimer = null, spawnTimer = null;

function spawnHeart() {
  if (!active) return;
  const h = document.createElement('div');
  h.className = 'falling-heart';
  h.textContent = '💗';

  const maxX = gameArea.clientWidth - 50;
  h.style.left = Math.random() * maxX + 'px';
  h.style.animationDuration = (2 + Math.random() * 1.5) + 's';

  h.addEventListener('click', () => {
    if (!active || h.dataset.caught) return;
    h.dataset.caught = '1';
    score++;
    scoreEl.textContent = score;
    h.style.transform = 'scale(1.6)';
    h.style.opacity = '0';
    h.style.transition = 'transform .15s, opacity .15s';
    setTimeout(() => h.remove(), 150);
    if (score >= WIN_SCORE) endGame(true);
  });

  gameArea.appendChild(h);
  setTimeout(() => h.remove(), 4000);
}

function startGame() {
  score = 0;
  timeLeft = GAME_TIME;
  scoreEl.textContent = '0';
  timerEl.textContent = GAME_TIME;
  resultEl.textContent = '';
  resultEl.classList.remove('big-result');
  active = true;
  startBtn.style.display = 'none';

  gameArea.querySelectorAll('.falling-heart').forEach(h => h.remove());

  gameTimer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) endGame(false);
  }, 1000);

  spawnTimer = setInterval(spawnHeart, 480);
  spawnHeart();
}

function endGame(win) {
  active = false;
  clearInterval(gameTimer);
  clearInterval(spawnTimer);
  gameArea.querySelectorAll('.falling-heart').forEach(h => h.remove());

  startBtn.style.display = 'inline-block';
  startBtn.textContent = 'Ещё раз';

  resultEl.classList.add('big-result');

  if (win) {
    resultEl.innerHTML = `Поймала <b>${score}</b> сердечек!<br>Но моё ты поймала давно`;
  } else {
    resultEl.innerHTML = `Поймано: <b>${score}</b><br>Но моё сердце всё равно твоё`;
  }
}

startBtn.addEventListener('click', startGame);
