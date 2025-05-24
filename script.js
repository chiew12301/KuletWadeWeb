let canvas, ctx;
let player, drops = [], score = 0, highScore = 0;
let gameInterval, dropInterval, timerInterval;
let isPaused = false;
let isDragging = false;
let dragOffsetX = 0;
let timeLeft = 60;

const images = {}, sounds = {};

function loadAssets() {
  images.water = new Image();
  images.water.src = 'assets/images/water.png';

  images.bomb = new Image();
  images.bomb.src = 'assets/images/bomb.png';

  images.container = new Image();
  images.container.src = 'assets/images/container.png';

  images.background = new Image();
  images.background.src = 'assets/images/background.jpg';

  sounds.collect = new Audio('assets/sounds/collect.mp3');
  sounds.bomb = new Audio('assets/sounds/bomb.mp3');
  sounds.bgm = new Audio('assets/sounds/bgm.mp3');
  sounds.bgm.loop = true;
}

function startGame() {
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('result-screen').classList.add('hidden');
  document.getElementById('pause-screen').classList.add('hidden');
  document.getElementById('pause-button').style.display = 'block';

  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  resizeCanvas();

  player = { x: canvas.width / 2 - 32, y: canvas.height - 100, width: 64, height: 64 };
  drops = [];
  score = 0;
  timeLeft = 60;
  isPaused = false;

  highScore = localStorage.getItem('highScore') || 0;

  canvas.addEventListener('mousedown', startDrag);
  canvas.addEventListener('mousemove', doDrag);
  canvas.addEventListener('mouseup', stopDrag);
  canvas.addEventListener('mouseleave', stopDrag);

  canvas.addEventListener('touchstart', startDrag, { passive: false });
  canvas.addEventListener('touchmove', doDrag, { passive: false });
  canvas.addEventListener('touchend', stopDrag);

  updateHUD();

  gameInterval = setInterval(updateGame, 30);
  dropInterval = setInterval(spawnDrop, 1000);
  timerInterval = setInterval(updateTimer, 1000);
  sounds.bgm.play();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);

function spawnDrop() {
  if (isPaused) return;
  const type = Math.random() < 0.7 ? 'water' : 'bomb';
  const x = Math.random() * (canvas.width - 32);
  drops.push({ x, y: 0, type });
}

function updateGame() {
  if (isPaused) return;

  ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(images.container, player.x, player.y, player.width, player.height);

  for (let i = drops.length - 1; i >= 0; i--) {
    const drop = drops[i];
    drop.y += 5;

    const caught = drop.y + 32 >= player.y &&
      drop.x < player.x + player.width &&
      drop.x + 32 > player.x;

    if (caught) {
      if (drop.type === 'water') {
        score += 10;
        sounds.collect.play();
      } else {
        score -= 10;
        sounds.bomb.play();
      }
      drops.splice(i, 1);
      updateHUD();
    } else if (drop.y > canvas.height) {
      drops.splice(i, 1);
    } else {
      const img = drop.type === 'water' ? images.water : images.bomb;
      ctx.drawImage(img, drop.x, drop.y, 32, 32);
    }
  }

  if (score >= 100 || score <= -50) endGame();
}

function updateTimer() {
  if (isPaused) return;
  timeLeft--;
  updateHUD();

  if (timeLeft <= 0) {
    endGame();
  }
}

function updateHUD() {
  document.getElementById('score').innerText = `Score: ${score}`;
  document.getElementById('timer').innerText = `Time Left: ${timeLeft}s`;
}

function pauseGame() {
  isPaused = true;
  clearInterval(gameInterval);
  clearInterval(dropInterval);
  clearInterval(timerInterval);
  document.getElementById('pause-screen').classList.remove('hidden');
  sounds.bgm.pause();
}

function resumeGame() {
  isPaused = false;
  document.getElementById('pause-screen').classList.add('hidden');
  gameInterval = setInterval(updateGame, 30);
  dropInterval = setInterval(spawnDrop, 1000);
  timerInterval = setInterval(updateTimer, 1000);
  sounds.bgm.play();
}

function restartGame() {
  clearInterval(gameInterval);
  clearInterval(dropInterval);
  clearInterval(timerInterval);
  startGame();
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(dropInterval);
  clearInterval(timerInterval);
  document.getElementById('pause-button').style.display = 'none';
  document.getElementById('result-screen').classList.remove('hidden');

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }

  document.getElementById('final-score').innerText = "Final Score: " + score;
  document.getElementById('high-score').innerText = "High Score: " + highScore;

  sounds.bgm.pause();
}

function getEventX(e) {
  return e.touches ? e.touches[0].clientX : e.clientX;
}

function startDrag(e) {
  const rect = canvas.getBoundingClientRect();
  const x = getEventX(e) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

  if (
    x >= player.x &&
    x <= player.x + player.width &&
    y >= player.y &&
    y <= player.y + player.height
  ) {
    isDragging = true;
    dragOffsetX = x - player.x;
    e.preventDefault();
  }
}

function doDrag(e) {
  if (!isDragging) return;
  const rect = canvas.getBoundingClientRect();
  const x = getEventX(e) - rect.left;

  player.x = x - dragOffsetX;
  player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
  e.preventDefault();
}

function stopDrag() {
  isDragging = false;
}

loadAssets();