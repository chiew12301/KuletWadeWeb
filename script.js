let canvas, ctx;
let player, drops = [], score = 0, highScore = 0;
let gameInterval, dropInterval;
let isPaused = false;
const images = {}, sounds = {};

let dragging = false;

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
  document.getElementById('game-screen').classList.remove('hidden');

  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  player = { x: 200, y: 580, width: 64, height: 64 };
  drops = [];
  score = 0;
  isPaused = false;
  highScore = localStorage.getItem('highScore') || 0;

  document.addEventListener('keydown', keyboardControl);
  canvas.addEventListener('mousedown', startDrag);
  canvas.addEventListener('mousemove', doDrag);
  canvas.addEventListener('mouseup', stopDrag);
  canvas.addEventListener('mouseleave', stopDrag);
  
  canvas.addEventListener('touchstart', startDrag);
  canvas.addEventListener('touchmove', doDrag);
  canvas.addEventListener('touchend', stopDrag);

  gameInterval = setInterval(updateGame, 30);
  dropInterval = setInterval(spawnDrop, 1000);

  sounds.bgm.play();
}

function spawnDrop() {
  if (isPaused) return;
  const type = Math.random() < 0.7 ? 'water' : 'bomb';
  const x = Math.random() * (canvas.width - 32);
  drops.push({ x, y: 0, type });
}

function keyboardControl(e) {
  if (e.key === "ArrowLeft") movePlayer(-20);
  if (e.key === "ArrowRight") movePlayer(20);
}

function movePlayer(amount) {
  player.x += amount;
  player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
}

function updateGame() {
  if (isPaused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    } else if (drop.y > canvas.height) {
      drops.splice(i, 1);
    } else {
      const img = drop.type === 'water' ? images.water : images.bomb;
      ctx.drawImage(img, drop.x, drop.y, 32, 32);
    }
  }

  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  if (score >= 100 || score <= -50) endGame();
}

function pauseGame() {
  isPaused = true;
  clearInterval(gameInterval);
  clearInterval(dropInterval);
  document.getElementById('pause-screen').classList.remove('hidden');
  sounds.bgm.pause();
}

function resumeGame() {
  isPaused = false;
  document.getElementById('pause-screen').classList.add('hidden');
  gameInterval = setInterval(updateGame, 30);
  dropInterval = setInterval(spawnDrop, 1000);
  sounds.bgm.play();
}

function restartGame() {
  document.location.reload();
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(dropInterval);
  document.removeEventListener('keydown', keyboardControl);
  document.getElementById('game-screen').classList.add('hidden');
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
const x = getEventX(e) - canvas.getBoundingClientRect().left;
if (x >= player.x && x <= player.x + player.width) {
    dragging = true;
    e.preventDefault();
}
}

function doDrag(e) {
if (!dragging) return;

const canvasRect = canvas.getBoundingClientRect();
const x = getEventX(e) - canvasRect.left;

player.x = x - player.width / 2;
player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));

e.preventDefault();
}

function stopDrag(e) {
dragging = false;
}

loadAssets();
