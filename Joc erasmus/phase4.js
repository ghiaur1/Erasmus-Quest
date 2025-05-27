// Enhanced audio management for Phase 4
const uiClickSound = new Audio('Sounds/Effects/ui-click.wav');
const hitSound = new Audio('Sounds/Effects/hit.wav');
const victorySound = new Audio('Sounds/Effects/complete.mp3');

// Set volume levels
uiClickSound.volume = 0.3;
hitSound.volume = 0.4;
victorySound.volume = 0.5;

// Initialize audio manager for Phase 4
document.addEventListener('DOMContentLoaded', () => {
  // Continue background music from previous phase or start Phase 4 music
  const currentInfo = audioManager.getCurrentInfo();
  if (!currentInfo || !currentInfo.isPlaying) {
    audioManager.setBackgroundMusic('Sounds/Music/song2.wav');
    audioManager.playBackgroundMusic();
  }
  console.log("🎵 Phase 4 audio initialized");
});

// Safe play function that won't crash if sound isn't loaded
function safePlaySound(sound) {
  try {
    if (sound && sound.play) {
      sound.currentTime = 0;
      sound.play().catch(e => console.error('Error playing sound:', e));
    }
  } catch (e) {
    console.error('Error in safePlaySound:', e);
  }
}

// Background music is now handled by AudioManager

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
const canvas = document.getElementById('hostel-canvas');
const ctx = canvas.getContext('2d');

// Background
const bgImg = new Image();

// Add load event to ensure the image is loaded before starting the game
bgImg.onload = function() {
  console.log('Background image loaded successfully');
  // If the game has already started, redraw
  if (document.getElementById('phase-4-container').classList.contains('hidden') === false) {
    drawGame();
  }
};

// Add error handling for background image
bgImg.onerror = function() {
  console.error('Error loading background image');
  // Fallback to a solid color background if image fails to load
  bgImg.onload = null; // Prevent infinite loop
  // If the game has already started, redraw
  if (document.getElementById('phase-4-container').classList.contains('hidden') === false) {
    drawGame();
  }
};

// Set the source after adding event handlers
bgImg.src = 'Image/Fundal/room.jpg'; // Using room.jpg as the hostel room background

// Debug mode
let debugMode = false; // Set to true to see hitboxes

// Game variables
let player = {
  x: 400,
  y: 250,
  width: 80,
  height: 120,
  speed: 5,
  lives: 5,
  // Smaller hitbox for collision detection
  hitboxWidth: 50,
  hitboxHeight: 80
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

// Colleague images (băieți)
const colleagueImg1 = new Image();
colleagueImg1.src = 'Image/Personaje/Marian.png';
const colleagueImg2 = new Image();
colleagueImg2.src = 'Image/Personaje/baiat2.png';
const colleagueImg3 = new Image();
colleagueImg3.src = 'Image/Personaje/baiat3.png';
const colleagueImg4 = new Image();
colleagueImg4.src = 'Image/Personaje/baiat4.png';
const colleagueImg5 = new Image();
colleagueImg5.src = 'Image/Personaje/baiat5.png';

// Colleague states
const IDLE = 'idle';
const CHARGING = 'charging';
const DASHING = 'dashing';
const COOLDOWN = 'cooldown';

// Colleagues array
let colleagues = [];

// Game state
let gameOver = false;
let gameWon = false;
let gameTime = 20; // 20 seconds to survive
let lastFrameTime = 0;

// Simple movement variables
let moveUp = false;
let moveDown = false;
let moveLeft = false;
let moveRight = false;

// Simple keyboard controls
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowUp' || e.key === 'w') moveUp = true;
  if (e.key === 'ArrowDown' || e.key === 's') moveDown = true;
  if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft = true;
  if (e.key === 'ArrowRight' || e.key === 'd') moveRight = true;

  // Toggle debug mode with Ctrl+D
  if (e.key === 'd' && e.ctrlKey) {
    debugMode = !debugMode;
    console.log(`Debug mode ${debugMode ? 'enabled' : 'disabled'}`);
    e.preventDefault(); // Prevent default browser behavior
  }
});

document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowUp' || e.key === 'w') moveUp = false;
  if (e.key === 'ArrowDown' || e.key === 's') moveDown = false;
  if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft = false;
  if (e.key === 'ArrowRight' || e.key === 'd') moveRight = false;
});

// Create colleagues
function createColleagues() {
  colleagues = [
    {
      x: 100,
      y: 100,
      width: 70,
      height: 110,
      speed: 2,
      dashSpeed: 10,
      state: IDLE,
      stateTimer: 0,
      chargeTime: 2000, // 2 seconds to charge
      dashTime: 1000, // 1 second dash
      cooldownTime: 3000, // 3 seconds cooldown
      img: colleagueImg1,
      targetX: 0,
      targetY: 0
    },
    {
      x: 700,
      y: 100,
      width: 70,
      height: 110,
      speed: 2,
      dashSpeed: 8,
      state: IDLE,
      stateTimer: 0,
      chargeTime: 2500, // 2.5 seconds to charge
      dashTime: 1200, // 1.2 seconds dash
      cooldownTime: 2800, // 2.8 seconds cooldown
      img: colleagueImg2,
      targetX: 0,
      targetY: 0
    },
    {
      x: 400,
      y: 400,
      width: 70,
      height: 110,
      speed: 2,
      dashSpeed: 12,
      state: IDLE,
      stateTimer: 0,
      chargeTime: 1800, // 1.8 seconds to charge
      dashTime: 800, // 0.8 seconds dash
      cooldownTime: 3200, // 3.2 seconds cooldown
      img: colleagueImg3,
      targetX: 0,
      targetY: 0
    },
    {
      x: 200,
      y: 400,
      width: 70,
      height: 110,
      speed: 2.5,
      dashSpeed: 9,
      state: IDLE,
      stateTimer: 0,
      chargeTime: 2200, // 2.2 seconds to charge
      dashTime: 1100, // 1.1 seconds dash
      cooldownTime: 2500, // 2.5 seconds cooldown
      img: colleagueImg4,
      targetX: 0,
      targetY: 0
    },
    {
      x: 600,
      y: 300,
      width: 70,
      height: 110,
      speed: 1.8,
      dashSpeed: 11,
      state: IDLE,
      stateTimer: 0,
      chargeTime: 1900, // 1.9 seconds to charge
      dashTime: 900, // 0.9 seconds dash
      cooldownTime: 3500, // 3.5 seconds cooldown
      img: colleagueImg5,
      targetX: 0,
      targetY: 0
    }
  ];
}

// Update colleagues
function updateColleagues(deltaTime) {
  colleagues.forEach(colleague => {
    switch(colleague.state) {
      case IDLE:
        // Move randomly in idle state
        colleague.x += (Math.random() - 0.5) * colleague.speed;
        colleague.y += (Math.random() - 0.5) * colleague.speed;

        // Keep within bounds
        colleague.x = Math.max(0, Math.min(colleague.x, canvas.width - colleague.width));
        colleague.y = Math.max(0, Math.min(colleague.y, canvas.height - colleague.height));

        // Randomly decide to charge
        if (Math.random() < 0.01) { // 1% chance per frame to start charging
          colleague.state = CHARGING;
          colleague.stateTimer = colleague.chargeTime;

          // Set target (player's current position)
          colleague.targetX = player.x;
          colleague.targetY = player.y;
        }
        break;

      case CHARGING:
        // Countdown timer
        colleague.stateTimer -= deltaTime;

        // Visual effect (handled in draw function)

        // When charge time is up, start dashing
        if (colleague.stateTimer <= 0) {
          colleague.state = DASHING;
          colleague.stateTimer = colleague.dashTime;
        }
        break;

      case DASHING:
        // Move quickly toward target
        const dx = colleague.targetX - colleague.x;
        const dy = colleague.targetY - colleague.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          colleague.x += (dx / distance) * colleague.dashSpeed;
          colleague.y += (dy / distance) * colleague.dashSpeed;
        }

        // Check for wall collision
        if (colleague.x <= 0 || colleague.x >= canvas.width - colleague.width ||
            colleague.y <= 0 || colleague.y >= canvas.height - colleague.height) {
          // Hit wall, go to cooldown
          colleague.state = COOLDOWN;
          colleague.stateTimer = colleague.cooldownTime;

          // Keep within bounds
          colleague.x = Math.max(0, Math.min(colleague.x, canvas.width - colleague.width));
          colleague.y = Math.max(0, Math.min(colleague.y, canvas.height - colleague.height));
        }

        // Check for collision with player
        if (isColliding(colleague, player)) {
          // Hit player
          hitPlayer();

          // Go to cooldown
          colleague.state = COOLDOWN;
          colleague.stateTimer = colleague.cooldownTime;
        }

        // Countdown timer
        colleague.stateTimer -= deltaTime;

        // When dash time is up, go to cooldown
        if (colleague.stateTimer <= 0) {
          colleague.state = COOLDOWN;
          colleague.stateTimer = colleague.cooldownTime;
        }
        break;

      case COOLDOWN:
        // Countdown timer
        colleague.stateTimer -= deltaTime;

        // When cooldown is up, go back to idle
        if (colleague.stateTimer <= 0) {
          colleague.state = IDLE;
        }
        break;
    }
  });
}

// Hit player function
function hitPlayer() {
  // Play hit sound
  safePlaySound(hitSound);

  // Reduce lives
  player.lives--;

  // Update lives display
  document.getElementById('lives').textContent = `Lives: ${player.lives}`;

  // Show message
  showGameMessage("Ouch! That hurt!");

  // Check if game over
  if (player.lives <= 0) {
    gameOver = true;
    setTimeout(() => {
      document.getElementById('restart-screen').classList.remove('hidden');
    }, 1000);
  }
}

// Collision detection
function isColliding(a, b) {
  // If it's the player, use the smaller hitbox
  const bWidth = b.hitboxWidth || b.width;
  const bHeight = b.hitboxHeight || b.height;

  // Calculate hitbox position (centered within the sprite)
  const bX = b.x + (b.width - bWidth) / 2;
  const bY = b.y + (b.height - bHeight) / 2;

  return (
    a.x < bX + bWidth &&
    a.x + a.width > bX &&
    a.y < bY + bHeight &&
    a.y + a.height > bY
  );
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

// Update game state
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
      gameWon = true;
      gameOver = true;

      // Play victory sound
      safePlaySound(victorySound);

      setTimeout(() => {
        document.getElementById('completion-screen').classList.remove('hidden');
      }, 1000);
    }

    // Update timer display
    document.getElementById('timer').textContent = `Time: ${Math.ceil(gameTime)}s`;
  }

  // Move player
  let moved = false;

  if (moveUp) {
    player.y -= player.speed;
    if (player.y < 0) player.y = 0;
    currentPlayerImage = playerImages.up[Math.floor(animationFrame / 10) % 2];
    flipped = false;
    moved = true;
  } else if (moveDown) {
    player.y += player.speed;
    if (player.y > canvas.height - player.height)
      player.y = canvas.height - player.height;
    currentPlayerImage = playerImages.down[Math.floor(animationFrame / 10) % 2];
    flipped = false;
    moved = true;
  } else if (moveLeft) {
    player.x -= player.speed;
    if (player.x < 0) player.x = 0;
    currentPlayerImage = playerImages.left[Math.floor(animationFrame / 10) % 2];
    flipped = false;
    moved = true;
  } else if (moveRight) {
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

  // Update colleagues
  updateColleagues(deltaTime);
}

// Draw game
function drawGame() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  if (bgImg.complete && bgImg.naturalWidth !== 0) {
    // Image successfully loaded, draw it
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    // Image not loaded, use a solid color background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw player
  drawPlayer(ctx);

  // Draw hitboxes in debug mode
  if (debugMode) {
    // Draw player hitbox
    const hitboxX = player.x + (player.width - player.hitboxWidth) / 2;
    const hitboxY = player.y + (player.height - player.hitboxHeight) / 2;
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(hitboxX, hitboxY, player.hitboxWidth, player.hitboxHeight);
  }

  // Draw colleagues
  colleagues.forEach(colleague => {
    // Apply visual effects based on state
    if (colleague.state === CHARGING) {
      // Charging effect (pulsing)
      ctx.save();
      const pulseScale = 1 + 0.1 * Math.sin(Date.now() / 100);
      ctx.globalAlpha = 0.8 + 0.2 * Math.sin(Date.now() / 100);
      ctx.drawImage(
        colleague.img,
        colleague.x - (colleague.width * pulseScale - colleague.width) / 2,
        colleague.y - (colleague.height * pulseScale - colleague.height) / 2,
        colleague.width * pulseScale,
        colleague.height * pulseScale
      );
      ctx.restore();
    } else if (colleague.state === DASHING) {
      // Dashing effect (motion blur)
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.drawImage(
        colleague.img,
        colleague.x - 10,
        colleague.y,
        colleague.width,
        colleague.height
      );
      ctx.globalAlpha = 0.6;
      ctx.drawImage(
        colleague.img,
        colleague.x - 5,
        colleague.y,
        colleague.width,
        colleague.height
      );
      ctx.globalAlpha = 1;
      ctx.drawImage(
        colleague.img,
        colleague.x,
        colleague.y,
        colleague.width,
        colleague.height
      );
      ctx.restore();
    } else if (colleague.state === COOLDOWN) {
      // Cooldown effect (dizzy)
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.drawImage(
        colleague.img,
        colleague.x,
        colleague.y,
        colleague.width,
        colleague.height
      );
      ctx.restore();
    } else {
      // Normal drawing
      ctx.drawImage(
        colleague.img,
        colleague.x,
        colleague.y,
        colleague.width,
        colleague.height
      );
    }
  });
}

// Game loop
function gameLoop(timestamp) {
  if (!gameOver) {
    updateGame(timestamp);
    drawGame();
    requestAnimationFrame(gameLoop);
  }
}

// Show game message
function showGameMessage(message) {
  const messageElement = document.getElementById('game-message');
  messageElement.textContent = message;
  messageElement.classList.remove('hidden');

  setTimeout(() => {
    messageElement.classList.add('hidden');
  }, 2000);
}

// Reset game
function resetGame() {
  // Reset player
  player.x = 400;
  player.y = 250;
  player.lives = 3;

  // Reset animation variables
  animationFrame = 0;
  flipped = false;
  currentPlayerImage = playerImages.down[0];

  // Reset colleagues
  createColleagues();

  // Reset game state
  gameOver = false;
  gameWon = false;
  gameTime = 20; // 20 seconds to survive
  lastFrameTime = 0;

  // Reset movement flags
  moveUp = false;
  moveDown = false;
  moveLeft = false;
  moveRight = false;

  // Update UI
  document.getElementById('lives').textContent = `Lives: ${player.lives}`;
  document.getElementById('timer').textContent = `Time: ${Math.ceil(gameTime)}s`;

  // Hide screens
  document.getElementById('restart-screen').classList.add('hidden');

  // Restart game loop
  requestAnimationFrame(gameLoop);
}

// Start button event
document.getElementById('start-button').addEventListener('click', () => {
  playMusicTrack(2); // Play different music for this phase
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('phase-4-container').classList.remove('hidden');
  document.getElementById('game-header').classList.remove('hidden');

  // Initialize game
  createColleagues();

  // Focus the canvas to capture keyboard events
  canvas.focus();

  // Start game loop
  gameOver = false;
  requestAnimationFrame(gameLoop);

  // Add a message to help users
  showGameMessage("Avoid the boys until the teachers arrive!");
});

// Restart button event
document.getElementById('restart-button').addEventListener('click', () => {
  safePlaySound(uiClickSound);
  resetGame();
});

// Next chapter button event
document.getElementById('next-chapter-btn').addEventListener('click', () => {
  safePlaySound(uiClickSound);

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
      // After loading completes, go to next chapter (phase5)
      setTimeout(() => {
        // Go to phase5.html (next chapter)
        window.location.href = "phase5.html";
      }, 500);
    }
  }, 100);
});
