// Enhanced audio management for Phase 3
const uiClickSound = new Audio('Sounds/Effects/ui-click.wav');
const hitSound = new Audio('Sounds/Effects/hit.wav');
const throwSound = new Audio('Sounds/Effects/throw.wav');
const victorySound = new Audio('Sounds/Effects/complete.mp3');

// Set volume levels
uiClickSound.volume = 0.3;
hitSound.volume = 0.4;
throwSound.volume = 0.3;
victorySound.volume = 0.5;

// Initialize audio manager for Phase 3
document.addEventListener('DOMContentLoaded', () => {
  // Continue background music from previous phase or start Phase 3 music
  const currentInfo = audioManager.getCurrentInfo();
  if (!currentInfo || !currentInfo.isPlaying) {
    audioManager.setBackgroundMusic('Sounds/Music/song1.wav');
    audioManager.playBackgroundMusic();
  }
  console.log("🎵 Phase 3 audio initialized");
});

// Legacy functions for backward compatibility - now use AudioManager
function loadMusicState() {
  // This is now handled automatically by AudioManager
  return null;
}

// Save current music state
function saveMusicState() {
  // This is now handled automatically by AudioManager
  audioManager.saveCurrentState();
}

function playMusicTrack(trackNumber) {
  // Enhanced music management using AudioManager
  const trackPaths = {
    1: 'Sounds/Music/song1.wav',
    2: 'Sounds/Music/song2.wav'
  };

  const selectedTrack = trackPaths[trackNumber];
  if (selectedTrack) {
    // Check if this track is already playing
    const currentInfo = audioManager.getCurrentInfo();
    if (currentInfo && currentInfo.track === selectedTrack && currentInfo.isPlaying) {
      console.log(`🎵 Track ${trackNumber} already playing`);
      return;
    }

    audioManager.setBackgroundMusic(selectedTrack);
    audioManager.playBackgroundMusic();
    console.log(`🎵 Playing track ${trackNumber}: ${selectedTrack}`);
  }
}

// Canvas and context
const canvas = document.getElementById('battle-canvas');
const ctx = canvas.getContext('2d');

// Game variables
let player = {
  x: 400,
  y: 300,
  width: 80,
  height: 120,
  speed: 5,
  health: 100,
  soap: 12,
  hitCounter: 0 // Counter to track hits received
};

// Player animation variables
let animationFrame = 0;
let flipped = false;

// Player images with animation frames
const playerImages = {
  up: [new Image(), new Image()],
  left: [new Image(), new Image()],
  right: [new Image(), new Image()],
  down: [new Image(), new Image()]
};
playerImages.up[0].src = 'Image/Personaje/EU/spateEu.png';
playerImages.up[1].src = 'Image/Personaje/EU/spateEu.png';
playerImages.left[0].src = 'Image/Personaje/EU/euStanga1.png';
playerImages.left[1].src = 'Image/Personaje/EU/euStanga2.png';
playerImages.right[0].src = 'Image/Personaje/EU/euStanga1.png';
playerImages.right[1].src = 'Image/Personaje/EU/euStanga2.png';
playerImages.down[0].src = 'Image/Personaje/EU/EU.png';
playerImages.down[1].src = 'Image/Personaje/EU/EU.png';

let currentPlayerImage = playerImages.down[0];

// Soap projectile
const soapImg = new Image();
soapImg.src = 'Image/Obiecte/fcsoap.png';
let soapProjectiles = [];

// Rat enemy
const ratImg = new Image();
ratImg.src = 'Image/Obiecte/sobolan.png';

// Virus projectile
const virusImg = new Image();
virusImg.src = 'Image/Obiecte/virus.png';
let virusProjectiles = [];

// Background
const bgImg = new Image();
bgImg.src = 'Image/Fundal/buda.jpg';

// Rats array
let rats = [];
const totalRats = 4;

// Game state
let gameOver = false;
let gameWon = false;
let gameTime = 24; // 24 seconds to catch the bus
let lastFrameTime = 0;

// Keyboard state - SIMPLIFIED
let keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

// Event listeners for keyboard
window.addEventListener('keydown', function(e) {
  switch(e.key) {
    case 'ArrowUp':
    case 'w':
      keys.up = true;
      break;
    case 'ArrowDown':
    case 's':
      keys.down = true;
      break;
    case 'ArrowLeft':
    case 'a':
      keys.left = true;
      break;
    case 'ArrowRight':
    case 'd':
      keys.right = true;
      break;
  }
});

window.addEventListener('keyup', function(e) {
  switch(e.key) {
    case 'ArrowUp':
    case 'w':
      keys.up = false;
      break;
    case 'ArrowDown':
    case 's':
      keys.down = false;
      break;
    case 'ArrowLeft':
    case 'a':
      keys.left = false;
      break;
    case 'ArrowRight':
    case 'd':
      keys.right = false;
      break;
  }
});

// Mouse controls for shooting
canvas.addEventListener('click', function(e) {
  if (gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  shootSoap(mouseX, mouseY);
});

function shootSoap(targetX, targetY) {
  if (player.soap <= 0) return;

  player.soap--;

  // Play throw sound
  throwSound.currentTime = 0;
  throwSound.play();

  // Calculate direction
  const dx = targetX - (player.x + player.width/2);
  const dy = targetY - (player.y + player.height/2);
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Add soap projectile
  soapProjectiles.push({
    x: player.x + player.width/2 - 15,
    y: player.y + player.height/2 - 15,
    width: 30,
    height: 30,
    speedX: (dx / distance) * 10,
    speedY: (dy / distance) * 10
  });

  // Update soap counter display
  document.getElementById('soap-counter').textContent = `Soap: ${player.soap}`;
}

function createRats() {
  for (let i = 0; i < totalRats; i++) {
    rats.push({
      x: Math.random() * (canvas.width - 100) + 50,
      y: Math.random() * 150 + 50,
      width: 60,
      height: 60,
      health: 100,
      speed: 1 + Math.random(),
      lastShotTime: 0,
      shootCooldown: 2000 + Math.random() * 1000
    });
  }
}

function ratShoot(rat) {
  const now = Date.now();

  if (now - rat.lastShotTime < rat.shootCooldown) return;

  rat.lastShotTime = now;

  // Calculate direction towards player
  const dx = player.x - rat.x;
  const dy = player.y - rat.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Add virus projectile
  virusProjectiles.push({
    x: rat.x,
    y: rat.y,
    width: 25,
    height: 25,
    speedX: (dx / distance) * 5,
    speedY: (dy / distance) * 5
  });
}

function updateGame(timestamp) {
  // Calculate delta time
  if (!lastFrameTime) lastFrameTime = timestamp;
  const deltaTime = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  // Update timer
  if (gameTime > 0) {
    gameTime -= deltaTime / 1000; // Convert to seconds
    if (gameTime <= 0) {
      gameTime = 0;
      gameOver = true;

      // Show game over message
      setTimeout(() => {
        document.getElementById('restart-screen').classList.remove('hidden');
      }, 1000);
    }

    // Update timer display
    document.getElementById('timer').textContent = `Time: ${Math.ceil(gameTime)}s`;
  }

  // Move player
  let moved = false;

  if (keys.up) {
    player.y -= player.speed;
    if (player.y < 0) player.y = 0;
    currentPlayerImage = playerImages.up[Math.floor(animationFrame / 10) % 2];
    flipped = false;
    moved = true;
  } else if (keys.down) {
    player.y += player.speed;
    if (player.y > canvas.height - player.height)
      player.y = canvas.height - player.height;
    currentPlayerImage = playerImages.down[Math.floor(animationFrame / 10) % 2];
    flipped = false;
    moved = true;
  } else if (keys.left) {
    player.x -= player.speed;
    if (player.x < 0) player.x = 0;
    currentPlayerImage = playerImages.left[Math.floor(animationFrame / 10) % 2];
    flipped = false;
    moved = true;
  } else if (keys.right) {
    player.x += player.speed;
    if (player.x > canvas.width - player.width)
      player.x = canvas.width - player.width;
    currentPlayerImage = playerImages.right[Math.floor(animationFrame / 10) % 2];
    flipped = true;
    moved = true;
  }

  if (!moved) {
    currentPlayerImage = playerImages.down[0];
    flipped = false;
  }

  animationFrame++;
  if (animationFrame > 1000) animationFrame = 0;

  // Update soap projectiles
  for (let i = soapProjectiles.length - 1; i >= 0; i--) {
    const soap = soapProjectiles[i];
    soap.x += soap.speedX;
    soap.y += soap.speedY;

    // Remove if out of bounds
    if (soap.x < 0 || soap.x > canvas.width ||
        soap.y < 0 || soap.y > canvas.height) {
      soapProjectiles.splice(i, 1);
      continue;
    }

    // Check for collisions with rats
    for (let j = rats.length - 1; j >= 0; j--) {
      const rat = rats[j];
      if (isColliding(soap, rat)) {
        // Hit sound
        hitSound.currentTime = 0;
        hitSound.play();

        // Damage rat
        rat.health -= 25;

        // Remove soap
        soapProjectiles.splice(i, 1);

        // Remove rat if health depleted
        if (rat.health <= 0) {
          // Determine drop type: 40% chance for soap, 30% chance for health, 30% chance for nothing
          const dropChance = Math.random();

          if (dropChance < 0.4) {
            // Add 3 soap as drop
            player.soap += 3;
            // Update soap counter display
            document.getElementById('soap-counter').textContent = `Soap: ${player.soap}`;
            // Show message about soap drop
            showGameMessage("You got 3 soap bars!");
          }
          else if (dropChance < 0.7) {
            // Add 15 health points, but don't exceed 100
            player.health = Math.min(100, player.health + 15);
            // Update health bar
            updateHealthBar();
            // Show message about health drop
            showGameMessage("You got +15 health!");
          }
          // Remove the rat
          rats.splice(j, 1);
        }

        break;
      }
    }
  }

  // Update virus projectiles
  for (let i = virusProjectiles.length - 1; i >= 0; i--) {
    const virus = virusProjectiles[i];
    virus.x += virus.speedX;
    virus.y += virus.speedY;

    // Remove if out of bounds
    if (virus.x < 0 || virus.x > canvas.width ||
        virus.y < 0 || virus.y > canvas.height) {
      virusProjectiles.splice(i, 1);
      continue;
    }

    // Check for collision with player
    if (isColliding(virus, player)) {
      // Hit sound
      hitSound.currentTime = 0;
      hitSound.play();

      // Damage player
      player.health -= 10;
      updateHealthBar();

      // Increment hit counter
      player.hitCounter++;

      // Check if player received 2 hits
      if (player.hitCounter >= 2) {
        // Reset counter
        player.hitCounter = 0;

        // Add 2 soap bars
        player.soap += 2;

        // Update soap counter display
        document.getElementById('soap-counter').textContent = `Soap: ${player.soap}`;

        // Show message about soap reward
        showGameMessage("Got 2 soap bars for enduring hits!");
      }

      // Remove virus
      virusProjectiles.splice(i, 1);

      // Check if player is defeated
      if (player.health <= 0) {
        gameOver = true;
        setTimeout(() => {
          document.getElementById('restart-screen').classList.remove('hidden');
        }, 1000);
      }
    }
  }

  // Update rats
  rats.forEach(rat => {
    // Random movement
    rat.x += (Math.random() - 0.5) * rat.speed;
    rat.y += (Math.random() - 0.5) * rat.speed;

    // Keep rats within bounds
    rat.x = Math.max(0, Math.min(rat.x, canvas.width - rat.width));
    rat.y = Math.max(0, Math.min(rat.y, canvas.height / 2 - rat.height));

    // Shoot at player
    ratShoot(rat);
  });

  // Check if all rats are defeated
  if (rats.length === 0 && !gameWon) {
    gameWon = true;
    gameOver = true;

    // Play victory sound
    victorySound.currentTime = 0;
    victorySound.play();

    setTimeout(() => {
      document.getElementById('completion-screen').classList.remove('hidden');
    }, 1000);
  }
}

// Get player scale based on y position (smaller when higher on screen)
function getPlayerScale(y) {
  const minScale = 0.4;
  const maxScale = 1;
  const minY = 0;
  const maxY = canvas.height - player.height;
  const clampedY = Math.max(minY, Math.min(y, maxY));
  const t = (clampedY - minY) / (maxY - minY);
  return minScale + (maxScale - minScale) * Math.pow(t, 2);
}

// Draw player with perspective
function drawPlayer(ctx) {
  const scale = getPlayerScale(player.y);
  const drawWidth = player.width * scale;
  const drawHeight = player.height * scale;
  const drawX = player.x + (player.width - drawWidth) / 2;
  const drawY = player.y + (player.height - drawHeight);

  if (drawWidth <= 0 || drawHeight <= 0) return;

  if (flipped) {
    ctx.save();
    ctx.translate(drawX + drawWidth, drawY);
    ctx.scale(-1, 1);
    ctx.drawImage(currentPlayerImage, 0, 0, drawWidth, drawHeight);
    ctx.restore();
  } else {
    ctx.drawImage(currentPlayerImage, drawX, drawY, drawWidth, drawHeight);
  }
}

function drawGame() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // Draw player with perspective
  drawPlayer(ctx);

  // Draw soap projectiles
  soapProjectiles.forEach(soap => {
    ctx.drawImage(soapImg, soap.x, soap.y, soap.width, soap.height);
  });

  // Draw rats
  rats.forEach(rat => {
    ctx.drawImage(ratImg, rat.x, rat.y, rat.width, rat.height);

    // Draw rat health bar
    ctx.fillStyle = '#333';
    ctx.fillRect(rat.x, rat.y - 10, rat.width, 5);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(rat.x, rat.y - 10, (rat.health / 100) * rat.width, 5);
  });

  // Draw virus projectiles
  virusProjectiles.forEach(virus => {
    ctx.drawImage(virusImg, virus.x, virus.y, virus.width, virus.height);
  });
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function updateHealthBar() {
  const healthFill = document.getElementById('health-fill');
  healthFill.style.width = `${player.health}%`;

  // Change color based on health
  if (player.health < 25) {
    healthFill.style.backgroundColor = '#ff0000';
  } else if (player.health < 50) {
    healthFill.style.backgroundColor = '#ff6600';
  }
}

function gameLoop(timestamp) {
  if (!gameOver) {
    updateGame(timestamp);
    drawGame();
    requestAnimationFrame(gameLoop);
  }
}

function showGameMessage(message) {
  const messageElement = document.getElementById('game-message');
  messageElement.textContent = message;
  messageElement.classList.remove('hidden');

  setTimeout(() => {
    messageElement.classList.add('hidden');
  }, 2000);
}

function resetGame() {
  // Reset player
  player.x = 400;
  player.y = 300;
  player.health = 100;
  player.soap = 12;
  player.hitCounter = 0;

  // Reset animation variables
  animationFrame = 0;
  flipped = false;
  currentPlayerImage = playerImages.down[0];

  // Update UI
  updateHealthBar();
  document.getElementById('soap-counter').textContent = `Soap: ${player.soap}`;

  // Clear projectiles
  soapProjectiles = [];
  virusProjectiles = [];

  // Reset rats
  rats = [];
  createRats();

  // Reset game state
  gameOver = false;
  gameWon = false;
  gameTime = 24;
  lastFrameTime = 0;

  // Update timer display
  document.getElementById('timer').textContent = `Time: ${Math.ceil(gameTime)}s`;

  // Reset keyboard state
  keys.up = false;
  keys.down = false;
  keys.left = false;
  keys.right = false;

  // Hide screens
  document.getElementById('restart-screen').classList.add('hidden');

  // Restart game loop
  requestAnimationFrame(gameLoop);
}

// Start button event
document.getElementById('start-button').addEventListener('click', () => {
  playMusicTrack(1);
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('phase-3-container').classList.remove('hidden');
  document.getElementById('game-header').classList.remove('hidden');

  // Initialize game
  createRats();
  updateHealthBar();

  // Start game loop
  gameOver = false;
  requestAnimationFrame(gameLoop);

  // Add a message to help users
  showGameMessage("Use arrow keys or WASD to move, click to throw soap!");
});

// Restart button event
document.getElementById('restart-button').addEventListener('click', () => {
  uiClickSound.currentTime = 0;
  uiClickSound.play();
  resetGame();
});

// Next chapter button event
document.getElementById('next-chapter-btn').addEventListener('click', () => {
  uiClickSound.currentTime = 0;
  uiClickSound.play();

  // Save current music state before transitioning
  saveMusicState();

  // Hide completion screen
  document.getElementById('completion-screen').classList.add('hidden');

  // Show loading screen
  document.getElementById('loading-screen').classList.remove('hidden');

  // Start the loading bar animation
  const loadingBar = document.getElementById('loading-bar');
  let progress = 0;

  // Animation will last 5 seconds (50 steps * 100ms)
  const interval = setInterval(() => {
    progress += 2;
    loadingBar.style.width = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      // After loading completes, go to next chapter (phase4)
      setTimeout(() => {
        // Go to phase4.html
        window.location.href = "phase4.html";
      }, 500);
    }
  }, 100);
});
