// Sound effects and music
const bgMusic = new Audio('Sounds/Music/fightingSong.mp3');
const startScreenMusic = new Audio('Sounds/Music/goldenWind.mp3'); // Music for start screen
const uiClickSound = new Audio('Sounds/Effects/ui-click.wav');
const playerAttackSound = new Audio('Sounds/Music/throw.mp3'); // Updated to use throw.mp3
const playerSpecialSound = new Audio('Sounds/Music/throw.mp3'); // Updated to use throw.mp3 for special attacks too
const bossAttackSound = new Audio('Sounds/Effects/boss-attack.wav');
const hitSound = new Audio('Sounds/Music/hit.mp3'); // Updated to use hit.mp3
const victorySound = new Audio('Sounds/Effects/complete.mp3');
const defeatSound = new Audio('Sounds/Effects/complete.wav');

// Set volume levels
bgMusic.volume = 0.3;
uiClickSound.volume = 0.2;
playerAttackSound.volume = 0.3;
playerSpecialSound.volume = 0.4;
bossAttackSound.volume = 0.3;
hitSound.volume = 0.3;
victorySound.volume = 0.5;
defeatSound.volume = 0.4;

// Configurare pentru redarea goldenWind.mp3
document.addEventListener('DOMContentLoaded', () => {
  // Configurare pentru startScreenMusic
  startScreenMusic.loop = true; // Setăm loop la true pentru a se reda continuu
  startScreenMusic.volume = 0.3;

  // Adăugăm event listener pentru butonul PLAY MUSIC
  const playMusicButton = document.getElementById('playMusicButton');
  if (playMusicButton) {
    playMusicButton.addEventListener('click', () => {
      console.log("Play Music button clicked");

      // Încercăm să redăm muzica
      startScreenMusic.play()
        .then(() => {
          console.log("Music started successfully");
          // Ascundem butonul după ce muzica începe să se redea
          playMusicButton.style.display = 'none';
        })
        .catch(error => {
          console.error("Failed to play music:", error);
        });
    });
  }

  // Încercăm să redăm automat muzica (poate fi blocat de browser)
  startScreenMusic.play()
    .then(() => {
      console.log("Music autoplay successful");
      // Ascundem butonul dacă autoplay funcționează
      if (playMusicButton) {
        playMusicButton.style.display = 'none';
      }
    })
    .catch(error => {
      console.log("Autoplay blocked, user needs to click the button:", error);
      // Butonul rămâne vizibil pentru ca utilizatorul să poată porni muzica manual
    });
});

// Safe play function that won't crash if sound isn't loaded
function safePlaySound(sound) {
  try {
    if (sound && sound.play) {
      if (sound.readyState >= 2) {
        sound.currentTime = 0;
      }
      sound.play().catch(e => console.error('Error playing sound:', e));
    }
  } catch (e) {
    console.error('Error in safePlaySound:', e);
  }
}

// Game variables
let gameRunning = false;
let gamePaused = false;
let pauseTimer = 0;
let lastFrameTime = 0;
let playerHealth = 100;
let bossHealth = 200; // Reduced from 100 to 200 for better balance
let inspirationMeter = 0;
let currentPhase = 1;

// Player variables
const player = {
  x: 100,
  y: 350,
  width: 60,
  height: 90,
  speed: 5,
  direction: 'right', // Current facing direction: 'left', 'right', or 'forward'
  moving: false,      // Whether the player is currently moving
  baseWidth: 60,      // Base width for scaling effects
  baseHeight: 90,     // Base height for scaling effects
  attackCooldown: 0,
  sugarRushActive: false,
  sugarRushCooldown: 0,
  debugBombCooldown: 0,
  inspirationCooldown: 0,
  focusShieldActive: false,
  focusShieldCooldown: 0,
  invulnerable: false,
  invulnerabilityTimer: 0
};

// Boss variables
const boss = {
  x: 600,
  y: 250,
  width: 250,
  height: 200,
  baseWidth: 100,
  baseHeight: 150,
  speed: 3,
  moving: false,
  direction: 'left',
  moveTimer: 0,
  moveDelay: 1000, // Time between movement decisions
  trailTimer: 0,
  attackCooldown: 0,
  currentAttack: null,
  phase: 1,
  attackPatterns: {
    functionStorm: {
      active: false,
      projectiles: []
    },
    undefinedError: {
      active: false,
      timer: 0,
      x: 0,
      y: 0
    },
    chowChow: {
      active: false,
      x: 0,
      y: 0,
      direction: 1,
      speed: 8
    },
    snackBarrage: {
      active: false,
      projectiles: []
    },
    monologue: {
      active: false,
      timer: 0
    },
    glitchReality: {
      active: false,
      timer: 0,
      glitchObjects: []
    }
  }
};

// Player projectiles
const playerProjectiles = [];
const debugBombs = [];

// Trail effects
const playerTrail = [];
const bossTrail = [];

// Canvas and context variables
let canvas;
let ctx;

// Images
const bgImg = new Image();
const bossImg = new Image();
const muffinImg = new Image();
const debugBombImg = new Image();
const inspirationImg = new Image();
const codeProjectileImg = new Image();
const errorImg = new Image();
const chowChowImg = new Image();
const snackImg = new Image();
const glitchImg = new Image();

// Player images for different directions
const playerImages = {
  up: [new Image(), new Image()],
  down: [new Image(), new Image()],
  left: [new Image(), new Image()],
  right: [new Image(), new Image()]
};

// Current player image based on direction and animation frame
let currentPlayerImage;
let animationFrame = 0;
let animationTimer = 0;

// Initialize images
function initializeImages() {
  // Background image
  bgImg.src = 'Image/Fundal/code.jpg';
  bgImg.onerror = () => console.error('Failed to load background image:', bgImg.src);

  // Player images for different directions
  playerImages.up[0].src = 'Image/Personaje/EU/spateEu.png';
  playerImages.up[1].src = 'Image/Personaje/EU/spateEu.png';
  playerImages.left[0].src = 'Image/Personaje/EU/euStanga1.png';
  playerImages.left[1].src = 'Image/Personaje/EU/euStanga2.png';
  playerImages.right[0].src = 'Image/Personaje/EU/euStanga1.png';
  playerImages.right[1].src = 'Image/Personaje/EU/euStanga2.png';
  playerImages.down[0].src = 'Image/Personaje/EU/EU.png';
  playerImages.down[1].src = 'Image/Personaje/EU/EU.png';

  // Set initial player image
  currentPlayerImage = playerImages.down[0];

  // Boss image
  bossImg.src = 'Image/Personaje/Marcos.png';

  // Load projectile images
  muffinImg.src = 'Image/Projectiles/briosa.png';
  debugBombImg.src = 'Image/Projectiles/briosa.png'; // Use briosa for debug bomb too
  inspirationImg.src = 'Image/Projectiles/briosa.png'; // Use same image but will be larger and with glow effect

  // Load boss attack images
  codeProjectileImg.src = 'Image/Projectiles/error.png';
  errorImg.src = 'Image/Personaje/Marcos.png';
  chowChowImg.src = 'Image/Projectiles/chowchow.png'; // Use ChowChow image from Projectiles
  snackImg.src = 'Image/Projectiles/snack.png';
  glitchImg.src = 'Image/Projectiles/glitch.png';
}

// DOM elements
const startScreen = document.getElementById('start-screen');
const gameHeader = document.getElementById('game-header');
const battleContainer = document.getElementById('battle-container');
const gameOverScreen = document.getElementById('game-over-screen');
const victoryScreen = document.getElementById('victory-screen');
const loadingScreen = document.getElementById('loading-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const creditsButton = document.getElementById('credits-btn');
const playerHealthFill = document.getElementById('player-health-fill');
const bossHealthFill = document.getElementById('boss-health-fill');
const inspirationFill = document.getElementById('inspiration-fill');
const controlsInfo = document.getElementById('controls-info');
const gameMessage = document.getElementById('game-message');

// Movement controls
let moveUp = false;
let moveDown = false;
let moveLeft = false;
let moveRight = false;
let shooting = false;
let sugarRush = false;
let debugBomb = false;
let inspiration = false;
let focusShield = false;

// Event listeners
// Note: Start button event listener is now in DOMContentLoaded
restartButton.addEventListener('click', restartGame);
// Note: Credits button is no longer needed as we go directly to credits after GAME OVER

// Keyboard controls
document.addEventListener('keydown', function(e) {
  if (!gameRunning) return;

  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') moveUp = true;
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') moveDown = true;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight = true;

  if (e.key === ' ') shooting = true;
  if ((e.key === 'q' || e.key === 'Q') && player.sugarRushCooldown <= 0) sugarRush = true;
  if ((e.key === 'e' || e.key === 'E') && player.debugBombCooldown <= 0) debugBomb = true;
  if ((e.key === 'r' || e.key === 'R') && inspirationMeter >= 100) inspiration = true;
  if (e.key === 'Shift') focusShield = true;
});

document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') moveUp = false;
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') moveDown = false;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight = false;

  if (e.key === ' ') shooting = false;
  if (e.key === 'Shift') focusShield = false;
});

// Main game loop
function gameLoop(timestamp) {
  if (lastFrameTime === 0) {
    lastFrameTime = timestamp;
  }

  const deltaTime = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  if (gameRunning) {
    if (gamePaused) {
      // Update pause timer
      pauseTimer -= deltaTime;
      if (pauseTimer <= 0) {
        gamePaused = false;
      }

      // Still draw the game while paused
      drawGame();
    } else {
      // Normal game update when not paused
      updateGame(deltaTime);
      drawGame();
    }

    requestAnimationFrame(gameLoop);
  }
}

// Start the game
function startGame() {
  safePlaySound(uiClickSound);

  // Ascunde Start Screen și arată UI-ul de luptă
  startScreen.classList.add('hidden');
  gameHeader.classList.remove('hidden');
  battleContainer.classList.remove('hidden');
  controlsInfo.classList.remove('hidden');

  canvas = document.getElementById('battle-canvas');
  if (canvas) {
    ctx = canvas.getContext('2d');
    initializeImages();

    // 🔥 Oprește start screen music (goldenWind)
    try {
      startScreenMusic.pause();
      startScreenMusic.currentTime = 0;
    } catch (e) {
      console.warn("Could not stop start screen music:", e);
    }

    // 🔥 Oprește Web Audio API dacă e folosit
    if (window.audioSource) {
      try {
        window.audioSource.stop();
      } catch (e) {
        console.warn("Could not stop Web Audio API source:", e);
      }
    }

    // 🔥 Pornește muzica de luptă (fightingSong)
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    bgMusic.currentTime = 0;
    bgMusic.play().catch(e => {
      console.warn("Could not start battle music:", e);
    });

    resetGame();
    showMessage("Phase 1: Syntax Assault - Dodge the JavaScript!", true);
    gameRunning = true;
    lastFrameTime = 0;
    requestAnimationFrame(gameLoop);
  }
}

// Reset game state
function resetGame() {
  playerHealth = 100;
  bossHealth = 200; // Balanced boss health for engaging but not tedious fight
  inspirationMeter = 0;
  currentPhase = 1;

  // Update health bars
  playerHealthFill.style.width = '100%';
  bossHealthFill.style.width = '100%';
  inspirationFill.style.width = '0%';

  // Reset player
  player.x = 100;
  player.y = 350;
  player.attackCooldown = 0;
  player.sugarRushActive = false;
  player.sugarRushCooldown = 0;
  player.debugBombCooldown = 0;
  player.inspirationCooldown = 0;
  player.focusShieldActive = false;
  player.focusShieldCooldown = 0;
  player.invulnerable = false;
  player.invulnerabilityTimer = 0;

  // Reset boss
  boss.x = 600;
  boss.y = 250;
  boss.attackCooldown = 0;
  boss.currentAttack = null;
  boss.phase = 1;

  // Clear projectiles
  playerProjectiles.length = 0;
  debugBombs.length = 0;

  // Reset attack patterns
  resetBossAttacks();
}

// Reset boss attack patterns
function resetBossAttacks() {
  boss.attackPatterns.functionStorm.active = false;
  boss.attackPatterns.functionStorm.projectiles = [];
  boss.attackPatterns.functionStorm.timer = 0;

  boss.attackPatterns.undefinedError.active = false;
  boss.attackPatterns.undefinedError.timer = 0;

  boss.attackPatterns.chowChow.active = false;
  boss.attackPatterns.chowChow.x = 0;
  boss.attackPatterns.chowChow.y = 0;

  boss.attackPatterns.snackBarrage.active = false;
  boss.attackPatterns.snackBarrage.projectiles = [];
  boss.attackPatterns.snackBarrage.timer = 0;

  boss.attackPatterns.monologue.active = false;
  boss.attackPatterns.monologue.timer = 0;

  boss.attackPatterns.glitchReality.active = false;
  boss.attackPatterns.glitchReality.timer = 0;
  boss.attackPatterns.glitchReality.glitchObjects = [];
}

// Update game state
function updateGame(deltaTime) {
  // Update player
  updatePlayer(deltaTime);

  // Update boss
  updateBoss(deltaTime);

  // Update projectiles
  updateProjectiles(deltaTime);

  // Check collisions
  checkCollisions();

  // Check phase transitions
  checkPhaseTransitions();
}

// Update player
function updatePlayer(deltaTime) {
  // Reset moving state
  player.moving = false;

  // Handle movement
  if (moveUp && player.y > 0) {
    player.y -= player.speed * (player.sugarRushActive ? 2 : 1);
    player.moving = true;
    player.direction = 'forward';
  }
  if (moveDown && player.y < canvas.height - player.height) {
    player.y += player.speed * (player.sugarRushActive ? 2 : 1);
    player.moving = true;
    player.direction = 'forward';
  }
  if (moveLeft && player.x > 0) {
    player.x -= player.speed * (player.sugarRushActive ? 2 : 1);
    player.moving = true;
    player.direction = 'left';
  }
  if (moveRight && player.x < canvas.width - player.width) {
    player.x += player.speed * (player.sugarRushActive ? 2 : 1);
    player.moving = true;
    player.direction = 'right';
  }

  // Apply size changes based on direction
  if (player.direction === 'forward') {
    // When moving forward, make player appear smaller
    player.width = player.baseWidth * 0.8;
    player.height = player.baseHeight * 0.8;
  } else {
    // When moving left or right, use normal size
    player.width = player.baseWidth;
    player.height = player.baseHeight;
  }

  // Update animation frame
  if (player.moving) {
    animationTimer += deltaTime;
    if (animationTimer > 200) { // Switch animation frame every 200ms
      animationTimer = 0;
      animationFrame = (animationFrame + 1) % 2;
    }
  }

  // Update current player image based on direction
  if (player.direction === 'forward') {
    currentPlayerImage = playerImages.up[animationFrame];
  } else if (player.direction === 'left') {
    currentPlayerImage = playerImages.left[animationFrame];
  } else if (player.direction === 'right') {
    currentPlayerImage = playerImages.right[animationFrame];
  } else {
    currentPlayerImage = playerImages.down[animationFrame];
  }

  // Add trail effect when moving
  if (player.moving) {
    player.trailTimer += deltaTime;
    if (player.trailTimer > 100) { // Add trail particle every 100ms
      player.trailTimer = 0;

      // Add a new trail particle
      playerTrail.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        size: 10 + Math.random() * 10,
        opacity: 0.7,
        life: 500 // Lifetime in ms
      });
    }
  }

  // Update trail particles
  for (let i = playerTrail.length - 1; i >= 0; i--) {
    const trail = playerTrail[i];
    trail.life -= deltaTime;
    trail.opacity = trail.life / 500; // Fade out based on remaining life

    if (trail.life <= 0) {
      playerTrail.splice(i, 1);
    }
  }

  // Handle shooting - can't shoot during Monologue attack
  if (shooting && player.attackCooldown <= 0 && !boss.attackPatterns.monologue.active) {
    // Create a new muffin projectile
    playerProjectiles.push({
      x: player.x + player.width,
      y: player.y + player.height / 2 - 10,
      width: 30,
      height: 30,
      speed: 10,
      damage: 8 // Increased damage for more impactful attacks
    });

    safePlaySound(playerAttackSound);
    player.attackCooldown = player.sugarRushActive ? 150 : 400; // Faster shooting overall
  } else if (shooting && boss.attackPatterns.monologue.active && Math.random() < 0.1) {
    // Show message that you can't attack during monologue
    showMessage("Can't attack! Marcos is giving a lecture!");
  }

  // Handle sugar rush - can't use during Monologue attack
  if (sugarRush && player.sugarRushCooldown <= 0 && !boss.attackPatterns.monologue.active) {
    player.sugarRushActive = true;
    safePlaySound(playerAttackSound); // Use throw.mp3 for Sugar Rush

    // Sugar rush lasts for 5 seconds
    setTimeout(() => {
      player.sugarRushActive = false;
    }, 5000);

    player.sugarRushCooldown = 10000; // 10 second cooldown
  } else if (sugarRush && boss.attackPatterns.monologue.active && Math.random() < 0.1) {
    showMessage("Can't use Sugar Rush during lecture!");
  }

  // Handle debug bomb - can't use during Monologue attack
  if (debugBomb && player.debugBombCooldown <= 0 && !boss.attackPatterns.monologue.active) {
    // Create a debug bomb
    debugBombs.push({
      x: player.x + player.width / 2 - 25,
      y: player.y + player.height / 2 - 25,
      width: 50,
      height: 50,
      timer: 1000, // Explodes after 1 second
      radius: 0,
      maxRadius: 150,
      active: true
    });

    safePlaySound(playerAttackSound); // Use throw.mp3 for debug bomb
    player.debugBombCooldown = 15000; // 15 second cooldown
  } else if (debugBomb && boss.attackPatterns.monologue.active && Math.random() < 0.1) {
    showMessage("Can't use Debug Bomb during lecture!");
  }

  // Handle inspiration mode - can't use during Monologue attack
  if (inspiration && inspirationMeter >= 100 && !boss.attackPatterns.monologue.active) {
    // Create a giant cupcake projectile
    playerProjectiles.push({
      x: player.x + player.width,
      y: player.y + player.height / 2 - 40,
      width: 80,
      height: 80,
      speed: 8,
      damage: 40, // Increased damage for more powerful special attack
      isInspiration: true
    });

    safePlaySound(playerAttackSound); // Use throw.mp3 for Inspiration Mode
    inspirationMeter = 0;
    inspirationFill.style.width = '0%';
  } else if (inspiration && boss.attackPatterns.monologue.active && Math.random() < 0.1) {
    showMessage("Can't use Inspiration during lecture!");
  }

  // Handle focus shield
  if (focusShield && player.focusShieldCooldown <= 0) {
    player.focusShieldActive = true;

    // Focus shield lasts while key is held
    player.focusShieldCooldown = 5000; // 5 second cooldown after use
  }

  // Update cooldowns
  if (player.attackCooldown > 0) {
    player.attackCooldown -= deltaTime;
  }

  if (player.sugarRushCooldown > 0) {
    player.sugarRushCooldown -= deltaTime;
  }

  if (player.debugBombCooldown > 0) {
    player.debugBombCooldown -= deltaTime;
  }

  if (player.focusShieldCooldown > 0) {
    player.focusShieldCooldown -= deltaTime;
  }

  // Update invulnerability
  if (player.invulnerable) {
    player.invulnerabilityTimer -= deltaTime;
    if (player.invulnerabilityTimer <= 0) {
      player.invulnerable = false;
    }
  }

  // Gradually increase inspiration meter
  if (inspirationMeter < 100) {
    inspirationMeter += 0.08; // Faster inspiration gain for more frequent special attacks
    inspirationFill.style.width = `${inspirationMeter}%`;
  }
}

// Update boss
function updateBoss(deltaTime) {
  // Reset moving state
  boss.moving = false;

  // Handle boss movement
  boss.moveTimer += deltaTime;
  if (boss.moveTimer >= boss.moveDelay) {
    boss.moveTimer = 0;

    // Make a random movement decision
    const moveDecision = Math.random();

    if (moveDecision < 0.7) { // 70% chance to move
      // Choose a random direction
      const directionDecision = Math.random();

      if (directionDecision < 0.25) {
        // Move up if possible
        if (boss.y > 50) {
          boss.direction = 'forward';
          boss.moving = true;
        }
      } else if (directionDecision < 0.5) {
        // Move down if possible
        if (boss.y < canvas.height - boss.height - 50) {
          boss.direction = 'forward';
          boss.moving = true;
        }
      } else if (directionDecision < 0.75) {
        // Move left if possible
        if (boss.x > canvas.width / 2) {
          boss.direction = 'left';
          boss.moving = true;
        }
      } else {
        // Move right if possible
        if (boss.x < canvas.width - boss.width - 50) {
          boss.direction = 'right';
          boss.moving = true;
        }
      }
    }
  }

  // Apply movement
  if (boss.moving) {
    if (boss.direction === 'forward') {
      // Move up or down randomly
      if (Math.random() < 0.5 && boss.y > 50) {
        boss.y -= boss.speed;
      } else if (boss.y < canvas.height - boss.height - 50) {
        boss.y += boss.speed;
      }
    } else if (boss.direction === 'left' && boss.x > canvas.width / 2) {
      boss.x -= boss.speed;
    } else if (boss.direction === 'right' && boss.x < canvas.width - boss.width - 50) {
      boss.x += boss.speed;
    }

    // Apply size changes based on direction
    if (boss.direction === 'forward') {
      // When moving forward, make boss appear smaller
      boss.width = boss.baseWidth * 0.8;
      boss.height = boss.baseHeight * 0.8;
    } else {
      // When moving left or right, use normal size
      boss.width = boss.baseWidth;
      boss.height = boss.baseHeight;
    }

    // Add trail effect when moving
    boss.trailTimer += deltaTime;
    if (boss.trailTimer > 100) { // Add trail particle every 100ms
      boss.trailTimer = 0;

      // Add a new trail particle
      bossTrail.push({
        x: boss.x + boss.width / 2,
        y: boss.y + boss.height / 2,
        size: 10 + Math.random() * 10,
        opacity: 0.7,
        life: 500 // Lifetime in ms
      });
    }
  }

  // Update trail particles
  for (let i = bossTrail.length - 1; i >= 0; i--) {
    const trail = bossTrail[i];
    trail.life -= deltaTime;
    trail.opacity = trail.life / 500; // Fade out based on remaining life

    if (trail.life <= 0) {
      bossTrail.splice(i, 1);
    }
  }

  // Boss attack behavior based on current phase
  switch (currentPhase) {
    case 1: // Syntax Assault
      if (boss.attackCooldown <= 0) {
        // Choose a random attack
        const attack = Math.random() < 0.7 ? 'functionStorm' : 'undefinedError';

        if (attack === 'functionStorm') {
          startFunctionStorm();
        } else {
          startUndefinedError();
        }

        boss.attackCooldown = 2000; // Reduced to 2 seconds for more intense battle
      }
      break;

    case 2: // ChowChow Fury
      if (boss.attackCooldown <= 0) {
        // Choose a random attack
        const attack = Math.random() < 0.6 ? 'chowChow' : 'snackBarrage';

        if (attack === 'chowChow') {
          startChowChow();
        } else {
          startSnackBarrage();
        }

        boss.attackCooldown = 2500; // Reduced to 2.5 seconds for more intense battle
      }
      break;

    case 3: // The Monologue
      if (boss.attackCooldown <= 0 && !boss.attackPatterns.monologue.active) {
        startMonologue();
        boss.attackCooldown = 8000; // Reduced to 8 seconds for faster pacing
      }
      break;

    case 4: // Glitch Reality
      if (boss.attackCooldown <= 0) {
        startGlitchReality();
        boss.attackCooldown = 3000; // Reduced to 3 seconds for more intense final phase
      }
      break;
  }

  // Update boss attack cooldown
  if (boss.attackCooldown > 0) {
    boss.attackCooldown -= deltaTime;
  }

  // Update active attacks
  updateBossAttacks(deltaTime);
}

// Update boss attacks
function updateBossAttacks(deltaTime) {
  // Function Storm attack
  if (boss.attackPatterns.functionStorm.active) {
    // Move existing projectiles
    for (let i = boss.attackPatterns.functionStorm.projectiles.length - 1; i >= 0; i--) {
      const projectile = boss.attackPatterns.functionStorm.projectiles[i];
      projectile.x -= projectile.speed;

      // Remove projectiles that are off-screen
      if (projectile.x + projectile.width < 0) {
        boss.attackPatterns.functionStorm.projectiles.splice(i, 1);
      }
    }

    // Add new projectiles
    if (Math.random() < 0.1) {
      boss.attackPatterns.functionStorm.projectiles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 40),
        width: 80,
        height: 30,
        speed: 5 + Math.random() * 3,
        text: ['function()', 'let', 'const', '{}', '=>'][Math.floor(Math.random() * 5)]
      });
    }

    // End attack after a certain time
    boss.attackPatterns.functionStorm.timer -= deltaTime;
    if (boss.attackPatterns.functionStorm.timer <= 0) {
      boss.attackPatterns.functionStorm.active = false;
    }
  }

  // Undefined Error attack
  if (boss.attackPatterns.undefinedError.active) {
    boss.attackPatterns.undefinedError.timer -= deltaTime;
    if (boss.attackPatterns.undefinedError.timer <= 0) {
      boss.attackPatterns.undefinedError.active = false;
    }
  }

  // ChouChou attack
  if (boss.attackPatterns.chouChou.active) {
    const chouChou = boss.attackPatterns.chouChou;

    // Move ChouChou towards player
    const dx = player.x - chouChou.x;
    const dy = player.y - chouChou.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      chouChou.x += (dx / distance) * chouChou.speed;
      chouChou.y += (dy / distance) * chouChou.speed;
    }

    // End attack if ChouChou goes off-screen
    if (chouChou.x < -100 || chouChou.x > canvas.width + 100 ||
        chouChou.y < -100 || chouChou.y > canvas.height + 100) {
      boss.attackPatterns.chouChou.active = false;
    }
  }

  // Snack Barrage attack
  if (boss.attackPatterns.snackBarrage.active) {
    // Move existing projectiles
    for (let i = boss.attackPatterns.snackBarrage.projectiles.length - 1; i >= 0; i--) {
      const projectile = boss.attackPatterns.snackBarrage.projectiles[i];
      projectile.x += projectile.speedX;
      projectile.y += projectile.speedY;
      projectile.rotation = (projectile.rotation || 0) + 0.1;

      // Remove projectiles that are off-screen
      if (projectile.x < -50 || projectile.x > canvas.width + 50 ||
          projectile.y < -50 || projectile.y > canvas.height + 50) {
        boss.attackPatterns.snackBarrage.projectiles.splice(i, 1);
      }
    }

    // Add new projectiles
    if (Math.random() < 0.2) {
      const angle = Math.random() * Math.PI * 2;
      boss.attackPatterns.snackBarrage.projectiles.push({
        x: boss.x,
        y: boss.y,
        width: 40,
        height: 40,
        speedX: Math.cos(angle) * 5,
        speedY: Math.sin(angle) * 5,
        rotation: 0
      });
    }

    // End attack after a certain time
    boss.attackPatterns.snackBarrage.timer -= deltaTime;
    if (boss.attackPatterns.snackBarrage.timer <= 0) {
      boss.attackPatterns.snackBarrage.active = false;
    }
  }

  // Monologue attack
  if (boss.attackPatterns.monologue.active) {
    boss.attackPatterns.monologue.timer -= deltaTime;
    if (boss.attackPatterns.monologue.timer <= 0) {
      boss.attackPatterns.monologue.active = false;
      endRhythmGame();
    }
  }

  // Glitch Reality attack
  if (boss.attackPatterns.glitchReality.active) {
    // Move existing glitch objects
    for (let i = boss.attackPatterns.glitchReality.glitchObjects.length - 1; i >= 0; i--) {
      const glitch = boss.attackPatterns.glitchReality.glitchObjects[i];
      glitch.x += glitch.speedX;
      glitch.y += glitch.speedY;

      // Remove glitches that are off-screen
      if (glitch.x < -50 || glitch.x > canvas.width + 50 ||
          glitch.y < -50 || glitch.y > canvas.height + 50) {
        boss.attackPatterns.glitchReality.glitchObjects.splice(i, 1);
      }
    }

    // Add new glitch objects
    if (Math.random() < 0.1) {
      boss.attackPatterns.glitchReality.glitchObjects.push({
        x: Math.random() * canvas.width,
        y: -50,
        width: 30 + Math.random() * 50,
        height: 30 + Math.random() * 50,
        speedX: -2 + Math.random() * 4,
        speedY: 2 + Math.random() * 3
      });
    }

    // End attack after a certain time
    boss.attackPatterns.glitchReality.timer -= deltaTime;
    if (boss.attackPatterns.glitchReality.timer <= 0) {
      boss.attackPatterns.glitchReality.active = false;
    }
  }
}

// Start Function Storm attack
function startFunctionStorm() {
  boss.attackPatterns.functionStorm.active = true;
  boss.attackPatterns.functionStorm.timer = 5000; // 5 seconds duration
  boss.attackPatterns.functionStorm.projectiles = [];

  safePlaySound(bossAttackSound);
}

// Start Undefined Error attack
function startUndefinedError() {
  boss.attackPatterns.undefinedError.active = true;
  boss.attackPatterns.undefinedError.timer = 3000; // 3 seconds duration
  boss.attackPatterns.undefinedError.x = player.x;
  boss.attackPatterns.undefinedError.y = player.y;

  safePlaySound(bossAttackSound);
}

// Start ChowChow attack
function startChowChow() {
  boss.attackPatterns.chowChow.active = true;
  boss.attackPatterns.chowChow.x = boss.x;
  boss.attackPatterns.chowChow.y = boss.y;

  safePlaySound(bossAttackSound);
}

// Start Snack Barrage attack
function startSnackBarrage() {
  boss.attackPatterns.snackBarrage.active = true;
  boss.attackPatterns.snackBarrage.timer = 4000; // 4 seconds duration
  boss.attackPatterns.snackBarrage.projectiles = [];

  safePlaySound(bossAttackSound);
}

// Start Monologue attack
function startMonologue() {
  boss.attackPatterns.monologue.active = true;
  boss.attackPatterns.monologue.timer = 10000; // 10 seconds duration

  safePlaySound(bossAttackSound);
  startRhythmGame();
}

// Start Glitch Reality attack
function startGlitchReality() {
  boss.attackPatterns.glitchReality.active = true;
  boss.attackPatterns.glitchReality.timer = 6000; // 6 seconds duration
  boss.attackPatterns.glitchReality.glitchObjects = [];

  safePlaySound(bossAttackSound);
}

// Update projectiles
function updateProjectiles(deltaTime) {
  // Update player projectiles
  for (let i = playerProjectiles.length - 1; i >= 0; i--) {
    const projectile = playerProjectiles[i];
    projectile.x += projectile.speed;

    // Remove projectiles that are off-screen
    if (projectile.x > canvas.width) {
      playerProjectiles.splice(i, 1);
    }
  }

  // Update debug bombs
  for (let i = debugBombs.length - 1; i >= 0; i--) {
    const bomb = debugBombs[i];
    bomb.timer -= deltaTime;

    if (bomb.timer <= 0 && bomb.active) {
      // Explode the bomb
      bomb.active = false;

      // Disable all boss attacks for 3 seconds
      resetBossAttacks();
      boss.attackCooldown = 3000;

      // Apply damage to boss
      bossHealth -= 25; // Increased damage for more impactful debug bombs
      bossHealthFill.style.width = `${bossHealth}%`;

      // Play hit sound
      safePlaySound(hitSound);

      // Animation for explosion
      bomb.radius = 1;
      const explosionInterval = setInterval(() => {
        bomb.radius += 10;
        if (bomb.radius >= bomb.maxRadius) {
          clearInterval(explosionInterval);
          debugBombs.splice(i, 1);
        }
      }, 50);

      safePlaySound(hitSound); // Use hit.mp3 for Debug Bomb explosion

      // Show message
      showMessage("Debug Bomb exploded! Boss took damage!");
    }
  }
}

// Draw game elements
function drawGame() {
  if (!ctx || !canvas) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  if (bgImg.complete) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // Add glitch effect in phase 3+
    if (currentPhase >= 3) {
      applyGlitchEffect();
    }
  } else {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw player
  drawPlayer();

  // Draw boss
  drawBoss();

  // Draw projectiles
  drawProjectiles();

  // Draw boss attacks
  drawBossAttacks();

  // Draw cooldown indicators
  drawCooldowns();
}

// Draw player
function drawPlayer() {
  if (!ctx) return;

  // Draw player image
  if (currentPlayerImage && currentPlayerImage.complete && currentPlayerImage.naturalWidth !== 0) {
    ctx.save();

    // Flash effect when invulnerable
    if (player.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Draw focus shield if active
    if (player.focusShieldActive) {
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + player.height / 2,
              Math.max(player.width, player.height) * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Draw sugar rush effect if active
    if (player.sugarRushActive) {
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 15;
    }

    // Draw trail effect for player
    for (const trail of playerTrail) {
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 0, 0, ${trail.opacity})`; // Red trail for player
      ctx.fill();
    }

    // Draw player with correct image based on direction
    if (player.direction === 'left') {
      // For left direction, we need to flip the image horizontally
      ctx.translate(player.x + player.width, player.y);
      ctx.scale(-1, 1);
      ctx.drawImage(currentPlayerImage, 0, 0, player.width, player.height);
    } else {
      // Normal drawing for right and other directions
      ctx.drawImage(currentPlayerImage, player.x, player.y, player.width, player.height);
    }

    // Add a slight bounce effect when moving
    if (player.moving && Math.floor(Date.now() / 150) % 2 === 0) {
      // Draw a small shadow beneath the player
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(
        player.x + player.width / 2,
        player.y + player.height - 5,
        player.width / 2,
        10,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
  } else {
    // Draw placeholder if image not loaded
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
}

// Draw boss
function drawBoss() {
  if (!ctx) return;

  // Draw boss image
  if (bossImg.complete && bossImg.naturalWidth !== 0) {
    ctx.save();

    // Phase-specific effects
    if (currentPhase >= 3) {
      // Glitch effect in later phases
      if (Math.random() < 0.1) {
        ctx.globalAlpha = 0.7 + Math.random() * 0.3;
        ctx.drawImage(bossImg,
                     boss.x + (-5 + Math.random() * 10),
                     boss.y + (-5 + Math.random() * 10),
                     boss.width, boss.height);
      }
    }

    // Apply flip effect based on direction
    if (boss.direction === 'left') {
      // Flip horizontally for left direction
      ctx.translate(boss.x + boss.width, boss.y);
      ctx.scale(-1, 1);
      ctx.drawImage(bossImg, 0, 0, boss.width, boss.height);
    } else {
      // Normal drawing for right and forward directions
      ctx.drawImage(bossImg, boss.x, boss.y, boss.width, boss.height);
    }

    // Draw trail effect for boss
    for (const trail of bossTrail) {
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 255, ${trail.opacity})`; // Blue trail for boss
      ctx.fill();
    }

    // Draw phase indicator
    ctx.font = '16px "Press Start 2P"';
    ctx.fillStyle = '#ff0000';
    ctx.textAlign = 'center';
    ctx.fillText(`Phase ${currentPhase}`, boss.x + boss.width / 2, boss.y - 10);

    ctx.restore();
  } else {
    // Draw placeholder if image not loaded
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
  }
}

// Draw projectiles
function drawProjectiles() {
  if (!ctx) return;

  // Draw player projectiles
  for (const projectile of playerProjectiles) {
    if (muffinImg.complete && muffinImg.naturalWidth !== 0) {
      if (projectile.isInspiration) {
        // Draw inspiration projectile with glow effect
        ctx.save();
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 20;
        ctx.drawImage(inspirationImg, projectile.x, projectile.y, projectile.width, projectile.height);
        ctx.restore();
      } else {
        // Draw regular muffin projectile
        ctx.drawImage(muffinImg, projectile.x, projectile.y, projectile.width, projectile.height);
      }
    } else {
      // Draw placeholder if image not loaded
      ctx.fillStyle = projectile.isInspiration ? '#ffcc00' : '#ffffff';
      ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
    }
  }

  // Draw debug bombs
  for (const bomb of debugBombs) {
    if (bomb.active) {
      // Draw active bomb
      if (debugBombImg.complete && debugBombImg.naturalWidth !== 0) {
        ctx.drawImage(debugBombImg, bomb.x, bomb.y, bomb.width, bomb.height);
      } else {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(bomb.x, bomb.y, bomb.width, bomb.height);
      }
    } else {
      // Draw explosion
      ctx.beginPath();
      ctx.arc(bomb.x + bomb.width / 2, bomb.y + bomb.height / 2, bomb.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

// Draw boss attacks
function drawBossAttacks() {
  if (!ctx) return;

  // Draw Function Storm projectiles
  if (boss.attackPatterns.functionStorm.active) {
    for (const projectile of boss.attackPatterns.functionStorm.projectiles) {
      // Draw code projectile
      if (codeProjectileImg.complete && codeProjectileImg.naturalWidth !== 0) {
        ctx.drawImage(codeProjectileImg, projectile.x, projectile.y, projectile.width, projectile.height);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
      }

      // Draw code text
      ctx.font = '14px monospace';
      ctx.fillStyle = '#00ff00';
      ctx.textAlign = 'center';
      ctx.fillText(projectile.text, projectile.x + projectile.width / 2, projectile.y + projectile.height / 2 + 5);
    }
  }

  // Draw Undefined Error
  if (boss.attackPatterns.undefinedError.active) {
    const error = boss.attackPatterns.undefinedError;

    // Draw error message
    if (errorImg.complete && errorImg.naturalWidth !== 0) {
      ctx.drawImage(errorImg, error.x - 100, error.y - 50, 200, 100);
    } else {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.fillRect(error.x - 100, error.y - 50, 200, 100);
    }

    ctx.font = '12px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Undefined is not a function', error.x, error.y);
  }

  // Draw ChowChow
  if (boss.attackPatterns.chowChow.active) {
    const chowChow = boss.attackPatterns.chowChow;

    if (chowChowImg.complete && chowChowImg.naturalWidth !== 0) {
      ctx.drawImage(chowChowImg, chowChow.x - 50, chowChow.y - 50, 100, 100);
    } else {
      ctx.fillStyle = '#ff00ff';
      ctx.beginPath();
      ctx.arc(chowChow.x, chowChow.y, 50, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw Snack Barrage
  if (boss.attackPatterns.snackBarrage.active) {
    for (const projectile of boss.attackPatterns.snackBarrage.projectiles) {
      ctx.save();
      ctx.translate(projectile.x + projectile.width / 2, projectile.y + projectile.height / 2);
      ctx.rotate(projectile.rotation || 0);

      if (snackImg.complete && snackImg.naturalWidth !== 0) {
        ctx.drawImage(snackImg, -projectile.width / 2, -projectile.height / 2, projectile.width, projectile.height);
      } else {
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(-projectile.width / 2, -projectile.height / 2, projectile.width, projectile.height);
      }

      ctx.restore();
    }
  }

  // Draw Glitch Reality
  if (boss.attackPatterns.glitchReality.active) {
    for (const glitch of boss.attackPatterns.glitchReality.glitchObjects) {
      if (glitchImg.complete && glitchImg.naturalWidth !== 0) {
        ctx.drawImage(glitchImg, glitch.x, glitch.y, glitch.width, glitch.height);
      } else {
        ctx.fillStyle = 'rgba(255, 0, 255, 0.7)';
        ctx.fillRect(glitch.x, glitch.y, glitch.width, glitch.height);
      }
    }
  }
}

// Draw cooldown indicators
function drawCooldowns() {
  if (!ctx) return;

  const indicatorSize = 30;
  const spacing = 10;
  const startX = 10;
  const startY = canvas.height - indicatorSize - 10;

  // Sugar Rush cooldown
  ctx.fillStyle = player.sugarRushCooldown > 0 ? 'rgba(255, 0, 255, 0.3)' : 'rgba(255, 0, 255, 0.7)';
  ctx.fillRect(startX, startY, indicatorSize, indicatorSize);
  ctx.font = '16px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('Q', startX + indicatorSize / 2, startY + indicatorSize / 2 + 5);

  // Debug Bomb cooldown
  ctx.fillStyle = player.debugBombCooldown > 0 ? 'rgba(0, 255, 255, 0.3)' : 'rgba(0, 255, 255, 0.7)';
  ctx.fillRect(startX + indicatorSize + spacing, startY, indicatorSize, indicatorSize);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('E', startX + indicatorSize + spacing + indicatorSize / 2, startY + indicatorSize / 2 + 5);

  // Inspiration Mode
  ctx.fillStyle = inspirationMeter < 100 ? 'rgba(255, 204, 0, 0.3)' : 'rgba(255, 204, 0, 0.7)';
  ctx.fillRect(startX + (indicatorSize + spacing) * 2, startY, indicatorSize, indicatorSize);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('R', startX + (indicatorSize + spacing) * 2 + indicatorSize / 2, startY + indicatorSize / 2 + 5);

  // Focus Shield cooldown
  ctx.fillStyle = player.focusShieldCooldown > 0 ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 255, 0, 0.7)';
  ctx.fillRect(startX + (indicatorSize + spacing) * 3, startY, indicatorSize, indicatorSize);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('⇧', startX + (indicatorSize + spacing) * 3 + indicatorSize / 2, startY + indicatorSize / 2 + 5);
}

// Apply glitch effect to the canvas
function applyGlitchEffect() {
  if (!ctx || !canvas) return;

  // Random glitch lines
  if (Math.random() < 0.2) {
    const numLines = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < numLines; i++) {
      const y = Math.random() * canvas.height;
      const height = Math.random() * 10 + 1;

      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx.fillRect(0, y, canvas.width, height);
    }
  }

  // Random color shift
  if (Math.random() < 0.05) {
    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// Show a message
function showMessage(text) {
  gameMessage.textContent = text;
  gameMessage.classList.remove('hidden');

  setTimeout(() => {
    gameMessage.classList.add('hidden');
  }, 3000);
}

// Check collisions between game objects
function checkCollisions() {
  // Check player projectiles hitting boss
  for (let i = playerProjectiles.length - 1; i >= 0; i--) {
    const projectile = playerProjectiles[i];

    // Simple rectangle collision
    if (
      projectile.x < boss.x + boss.width &&
      projectile.x + projectile.width > boss.x &&
      projectile.y < boss.y + boss.height &&
      projectile.y + projectile.height > boss.y
    ) {
      // Hit the boss
      bossHealth -= projectile.damage;
      bossHealthFill.style.width = `${bossHealth}%`;

      // Remove the projectile
      playerProjectiles.splice(i, 1);

      // Play hit sound
      safePlaySound(hitSound);

      // Add inspiration for hitting the boss
      inspirationMeter += projectile.isInspiration ? 0 : 8; // Increased inspiration gain
      if (inspirationMeter > 100) inspirationMeter = 100;
      inspirationFill.style.width = `${inspirationMeter}%`;

      // Check if boss is defeated
      if (bossHealth <= 0) {
        if (currentPhase < 4) {
          // Advance to next phase
          currentPhase++;
          bossHealth = 150 + (currentPhase - 1) * 50; // Phase 2: 200, Phase 3: 250, Phase 4: 300
          bossHealthFill.style.width = '100%';

          // Show phase transition message
          const phaseMessages = [
            "",
            "Phase 2: ChouChou Fury - Watch out for the angry stuffed animal!",
            "Phase 3: The Monologue - Stay awake during Marcos' explanation!",
            "Final Phase: Glitch Reality - Reality is breaking down!"
          ];

          showMessage(phaseMessages[currentPhase - 1]);

          // Reset boss attacks
          resetBossAttacks();
        } else {
          // Game won
          showVictory();
        }
      }
    }
  }

  // Check boss attacks hitting player
  if (!player.invulnerable) {
    // Function Storm projectiles
    if (boss.attackPatterns.functionStorm.active) {
      for (const projectile of boss.attackPatterns.functionStorm.projectiles) {
        if (
          projectile.x < player.x + player.width &&
          projectile.x + projectile.width > player.x &&
          projectile.y < player.y + player.height &&
          projectile.y + projectile.height > player.y
        ) {
          // Player hit by code
          if (!player.focusShieldActive) {
            playerHit(10);
          } else {
            // Shield blocked it
            showMessage("Shield blocked the code!");
          }

          // Remove the projectile
          const index = boss.attackPatterns.functionStorm.projectiles.indexOf(projectile);
          if (index > -1) {
            boss.attackPatterns.functionStorm.projectiles.splice(index, 1);
          }
        }
      }
    }

    // Undefined Error
    if (boss.attackPatterns.undefinedError.active) {
      const error = boss.attackPatterns.undefinedError;
      const errorRadius = 100;

      // Distance between player center and error center
      const dx = (player.x + player.width / 2) - error.x;
      const dy = (player.y + player.height / 2) - error.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < errorRadius) {
        // Player caught in error
        if (!player.focusShieldActive) {
          playerHit(15);

          // Disable the error after hitting
          boss.attackPatterns.undefinedError.active = false;
        } else {
          // Shield blocked it
          showMessage("Shield blocked the error!");
        }
      }
    }

    // ChowChow attack
    if (boss.attackPatterns.chowChow.active) {
      const chowChow = boss.attackPatterns.chowChow;

      if (
        chowChow.x < player.x + player.width &&
        chowChow.x + 100 > player.x &&
        chowChow.y < player.y + player.height &&
        chowChow.y + 100 > player.y
      ) {
        // Player hit by ChowChow
        if (!player.focusShieldActive) {
          playerHit(20);

          // Disable ChowChow after hitting
          boss.attackPatterns.chowChow.active = false;
        } else {
          // Shield blocked it
          showMessage("Shield blocked ChowChow!");
        }
      }
    }

    // Snack Barrage
    if (boss.attackPatterns.snackBarrage.active) {
      for (const projectile of boss.attackPatterns.snackBarrage.projectiles) {
        if (
          projectile.x < player.x + player.width &&
          projectile.x + projectile.width > player.x &&
          projectile.y < player.y + player.height &&
          projectile.y + projectile.height > player.y
        ) {
          // Player hit by snack
          if (!player.focusShieldActive) {
            playerHit(5);
          } else {
            // Shield blocked it
            showMessage("Shield blocked the snack!");
          }

          // Remove the projectile
          const index = boss.attackPatterns.snackBarrage.projectiles.indexOf(projectile);
          if (index > -1) {
            boss.attackPatterns.snackBarrage.projectiles.splice(index, 1);
          }
        }
      }
    }

    // Glitch Reality
    if (boss.attackPatterns.glitchReality.active) {
      for (const glitch of boss.attackPatterns.glitchReality.glitchObjects) {
        if (
          glitch.x < player.x + player.width &&
          glitch.x + glitch.width > player.x &&
          glitch.y < player.y + player.height &&
          glitch.y + glitch.height > player.y
        ) {
          // Player hit by glitch
          if (!player.focusShieldActive) {
            playerHit(15);
          } else {
            // Shield blocked it
            showMessage("Shield blocked the glitch!");
          }

          // Remove the glitch
          const index = boss.attackPatterns.glitchReality.glitchObjects.indexOf(glitch);
          if (index > -1) {
            boss.attackPatterns.glitchReality.glitchObjects.splice(index, 1);
          }
        }
      }
    }
  }
}

// Handle player being hit
function playerHit(damage) {
  playerHealth -= damage;
  playerHealthFill.style.width = `${playerHealth}%`;

  // Play hit sound
  safePlaySound(hitSound);

  // Make player invulnerable briefly
  player.invulnerable = true;
  player.invulnerabilityTimer = 1000; // 1 second of invulnerability

  // Show damage message
  showMessage(`Ouch! -${damage} health`);

  // Check if player is defeated
  if (playerHealth <= 0) {
    showGameOver();
  }
}

// Check phase transitions
function checkPhaseTransitions() {
  // This is handled in the collision detection when boss health reaches 0
}

// Rhythm game functions have been removed

// Show game over screen
function showGameOver() {
  bgMusic.pause();
  safePlaySound(defeatSound);
  gameRunning = false;
  gameOverScreen.classList.remove('hidden');
}

// Restart the game
function restartGame() {
  safePlaySound(uiClickSound);

  gameOverScreen.classList.add('hidden');
  resetGame();

  // Restart background music
  bgMusic.currentTime = 0;
  bgMusic.play().catch(e => console.error('Error playing background music:', e));

  // Restart game loop
  gameRunning = true;
  lastFrameTime = 0;
  requestAnimationFrame(gameLoop);
}

// Show victory screen
function showVictory() {
  // Stop game music
  bgMusic.pause();

  // Stop game
  gameRunning = false;

  // Play victory sound
  safePlaySound(victorySound);

  // Show victory screen
  const victoryScreen = document.getElementById('victory-screen');
  victoryScreen.classList.remove('hidden');

  // Play outro music
  try {
    const outroMusic = new Audio('Sounds/Music/outro.wav');
    outroMusic.volume = 0.5;
    outroMusic.loop = true;
    outroMusic.play().catch(() => console.log('Could not play outro music'));

    // Store the music in a global variable so it doesn't stop when we change screens
    window.outroMusic = outroMusic;
  } catch (e) {
    console.log('Could not play outro music');
  }
}

// Function to handle finishing the project
function finishProject() {
  safePlaySound(uiClickSound);

  // Hide victory screen
  const victoryScreen = document.getElementById('victory-screen');
  victoryScreen.classList.add('hidden');

  // Show GAME OVER screen
  const finalGameOverScreen = document.getElementById('final-game-over-screen');
  finalGameOverScreen.classList.remove('hidden');

  // Wait 3 seconds before showing credits
  setTimeout(() => {
    // Navigate to credits page
    window.location.href = 'credits.html';
  }, 3000);
}

// Reset boss attack patterns
function resetBossAttacks() {
  boss.attackPatterns.functionStorm.active = false;
  boss.attackPatterns.functionStorm.projectiles = [];

  boss.attackPatterns.undefinedError.active = false;
  boss.attackPatterns.undefinedError.timer = 0;

  boss.attackPatterns.chowChow.active = false;
  boss.attackPatterns.chowChow.x = 0;
  boss.attackPatterns.chowChow.y = 0;

  boss.attackPatterns.snackBarrage.active = false;
  boss.attackPatterns.snackBarrage.projectiles = [];

  boss.attackPatterns.monologue.active = false;
  boss.attackPatterns.monologue.timer = 0;

  boss.attackPatterns.glitchReality.active = false;
  boss.attackPatterns.glitchReality.timer = 0;
  boss.attackPatterns.glitchReality.glitchObjects = [];
}

// Update game state
function updateGame(deltaTime) {
  // Update player
  updatePlayer(deltaTime);

  // Update boss
  updateBoss(deltaTime);

  // Update projectiles
  updateProjectiles(deltaTime);

  // Check collisions
  checkCollisions();

  // Check phase transitions
  checkPhaseTransitions();
}

// Update player
function updatePlayer(deltaTime) {
  // Handle movement
  if (moveUp && player.y > 0) {
    player.y -= player.speed * (player.sugarRushActive ? 2 : 1);
  }
  if (moveDown && player.y < canvas.height - player.height) {
    player.y += player.speed * (player.sugarRushActive ? 2 : 1);
  }
  if (moveLeft && player.x > 0) {
    player.x -= player.speed * (player.sugarRushActive ? 2 : 1);
  }
  if (moveRight && player.x < canvas.width - player.width) {
    player.x += player.speed * (player.sugarRushActive ? 2 : 1);
  }

  // Handle shooting
  if (shooting && player.attackCooldown <= 0) {
    // Create a new muffin projectile
    playerProjectiles.push({
      x: player.x + player.width,
      y: player.y + player.height / 2 - 10,
      width: 30,
      height: 30,
      speed: 10,
      damage: 8 // Consistent damage with main system
    });

    safePlaySound(playerAttackSound);
    player.attackCooldown = player.sugarRushActive ? 150 : 400; // Consistent with main system
  }

  // Handle sugar rush
  if (sugarRush && player.sugarRushCooldown <= 0) {
    player.sugarRushActive = true;
    safePlaySound(playerSpecialSound);

    // Sugar rush lasts for 5 seconds
    setTimeout(() => {
      player.sugarRushActive = false;
    }, 5000);

    player.sugarRushCooldown = 10000; // 10 second cooldown
  }

  // Handle debug bomb
  if (debugBomb && player.debugBombCooldown <= 0) {
    // Create a debug bomb
    debugBombs.push({
      x: player.x + player.width / 2 - 25,
      y: player.y + player.height / 2 - 25,
      width: 50,
      height: 50,
      timer: 1000, // Explodes after 1 second
      radius: 0,
      maxRadius: 150,
      active: true
    });

    safePlaySound(playerSpecialSound);
    player.debugBombCooldown = 15000; // 15 second cooldown
  }

  // Handle inspiration mode
  if (inspiration && inspirationMeter >= 100) {
    // Create a giant cupcake projectile
    playerProjectiles.push({
      x: player.x + player.width,
      y: player.y + player.height / 2 - 40,
      width: 80,
      height: 80,
      speed: 8,
      damage: 40, // Consistent with main system
      isInspiration: true
    });

    safePlaySound(playerSpecialSound);
    inspirationMeter = 0;
    inspirationFill.style.width = '0%';
  }

  // Handle focus shield
  if (focusShield && player.focusShieldCooldown <= 0) {
    player.focusShieldActive = true;

    // Focus shield lasts while key is held
    player.focusShieldCooldown = 5000; // 5 second cooldown after use
  }

  // Update cooldowns
  if (player.attackCooldown > 0) {
    player.attackCooldown -= deltaTime;
  }

  if (player.sugarRushCooldown > 0) {
    player.sugarRushCooldown -= deltaTime;
  }

  if (player.debugBombCooldown > 0) {
    player.debugBombCooldown -= deltaTime;
  }

  if (player.focusShieldCooldown > 0) {
    player.focusShieldCooldown -= deltaTime;
  }

  // Update invulnerability
  if (player.invulnerable) {
    player.invulnerabilityTimer -= deltaTime;
    if (player.invulnerabilityTimer <= 0) {
      player.invulnerable = false;
    }
  }

  // Gradually increase inspiration meter
  if (inspirationMeter < 100) {
    inspirationMeter += 0.05;
    inspirationFill.style.width = `${inspirationMeter}%`;
  }
}

// Update boss
function updateBoss(deltaTime) {
  // Boss behavior based on current phase
  switch (currentPhase) {
    case 1: // Syntax Assault
      if (boss.attackCooldown <= 0) {
        // Choose a random attack
        const attack = Math.random() < 0.7 ? 'functionStorm' : 'undefinedError';

        if (attack === 'functionStorm') {
          startFunctionStorm();
        } else {
          startUndefinedError();
        }

        boss.attackCooldown = 2000; // Consistent with main system
      }
      break;

    case 2: // ChowChow Fury
      if (boss.attackCooldown <= 0) {
        // Choose a random attack
        const attack = Math.random() < 0.6 ? 'chowChow' : 'snackBarrage';

        if (attack === 'chowChow') {
          startChowChow();
        } else {
          startSnackBarrage();
        }

        boss.attackCooldown = 2500; // Consistent with main system
      }
      break;

    case 3: // The Monologue
      if (boss.attackCooldown <= 0 && !boss.attackPatterns.monologue.active) {
        startMonologue();
        boss.attackCooldown = 8000; // Consistent with main system
      }
      break;

    case 4: // Glitch Reality
      if (boss.attackCooldown <= 0) {
        startGlitchReality();
        boss.attackCooldown = 3000; // Consistent with main system
      }
      break;
  }

  // Update boss attack cooldown
  if (boss.attackCooldown > 0) {
    boss.attackCooldown -= deltaTime;
  }

  // Update active attacks
  updateBossAttacks(deltaTime);
}

// Update boss attacks
function updateBossAttacks(deltaTime) {
  // Function Storm attack
  if (boss.attackPatterns.functionStorm.active) {
    // Move existing projectiles
    for (let i = boss.attackPatterns.functionStorm.projectiles.length - 1; i >= 0; i--) {
      const projectile = boss.attackPatterns.functionStorm.projectiles[i];
      projectile.x -= projectile.speed;

      // Remove projectiles that are off-screen
      if (projectile.x + projectile.width < 0) {
        boss.attackPatterns.functionStorm.projectiles.splice(i, 1);
      }
    }

    // Add new projectiles
    if (Math.random() < 0.1) {
      boss.attackPatterns.functionStorm.projectiles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 40),
        width: 80,
        height: 30,
        speed: 5 + Math.random() * 3,
        text: ['function()', 'let', 'const', '{}', '=>'][Math.floor(Math.random() * 5)]
      });
    }

    // End attack after a certain time
    boss.attackPatterns.functionStorm.timer -= deltaTime;
    if (boss.attackPatterns.functionStorm.timer <= 0) {
      boss.attackPatterns.functionStorm.active = false;
    }
  }

  // Undefined Error attack
  if (boss.attackPatterns.undefinedError.active) {
    boss.attackPatterns.undefinedError.timer -= deltaTime;
    if (boss.attackPatterns.undefinedError.timer <= 0) {
      boss.attackPatterns.undefinedError.active = false;
    }
  }

  // ChowChow attack
  if (boss.attackPatterns.chowChow.active) {
    const chowChow = boss.attackPatterns.chowChow;

    // Move ChowChow towards player
    const dx = player.x - chowChow.x;
    const dy = player.y - chowChow.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      chowChow.x += (dx / distance) * chowChow.speed;
      chowChow.y += (dy / distance) * chowChow.speed;
    }

    // End attack if ChowChow goes off-screen
    if (chowChow.x < -100 || chowChow.x > canvas.width + 100 ||
        chowChow.y < -100 || chowChow.y > canvas.height + 100) {
      boss.attackPatterns.chowChow.active = false;
    }
  }

  // Snack Barrage attack
  if (boss.attackPatterns.snackBarrage.active) {
    // Move existing projectiles
    for (let i = boss.attackPatterns.snackBarrage.projectiles.length - 1; i >= 0; i--) {
      const projectile = boss.attackPatterns.snackBarrage.projectiles[i];
      projectile.x += projectile.speedX;
      projectile.y += projectile.speedY;
      projectile.rotation += 0.1;

      // Remove projectiles that are off-screen
      if (projectile.x < -50 || projectile.x > canvas.width + 50 ||
          projectile.y < -50 || projectile.y > canvas.height + 50) {
        boss.attackPatterns.snackBarrage.projectiles.splice(i, 1);
      }
    }

    // Add new projectiles
    if (Math.random() < 0.2) {
      const angle = Math.random() * Math.PI * 2;
      boss.attackPatterns.snackBarrage.projectiles.push({
        x: boss.x,
        y: boss.y,
        width: 40,
        height: 40,
        speedX: Math.cos(angle) * 5,
        speedY: Math.sin(angle) * 5,
        rotation: 0
      });
    }

    // End attack after a certain time
    boss.attackPatterns.snackBarrage.timer -= deltaTime;
    if (boss.attackPatterns.snackBarrage.timer <= 0) {
      boss.attackPatterns.snackBarrage.active = false;
    }
  }

  // Monologue attack
  if (boss.attackPatterns.monologue.active) {
    boss.attackPatterns.monologue.timer -= deltaTime;

    // Apply periodic damage if player isn't paying attention
    boss.attackPatterns.monologue.damageTimer += deltaTime;
    if (boss.attackPatterns.monologue.damageTimer >= 3000) { // Every 3 seconds
      boss.attackPatterns.monologue.damageTimer = 0;

      // Random chance to apply damage if player isn't moving
      if (!player.moving && Math.random() < 0.7) {
        playerHit(5);
        showMessage("You're falling asleep! Move to stay awake!");
      }

      // Show random lecture messages
      const lectureMessages = [
        "JavaScript is a high-level, interpreted programming language...",
        "The DOM represents the document as nodes and objects...",
        "Closures are functions that remember their lexical scope...",
        "Promises are used for asynchronous computations...",
        "Arrow functions were introduced in ES6...",
        "The 'this' keyword behaves differently in different contexts..."
      ];

      // Show a random message and pause the game
      const messageIndex = boss.attackPatterns.monologue.messageIndex % lectureMessages.length;
      showMessage(lectureMessages[messageIndex], true); // Force pause
      boss.attackPatterns.monologue.messageIndex++;
    }

    if (boss.attackPatterns.monologue.timer <= 0) {
      boss.attackPatterns.monologue.active = false;
      showMessage("You survived the JavaScript lecture!", true);
    }
  }

  // Glitch Reality attack
  if (boss.attackPatterns.glitchReality.active) {
    // Move existing glitch objects
    for (let i = boss.attackPatterns.glitchReality.glitchObjects.length - 1; i >= 0; i--) {
      const glitch = boss.attackPatterns.glitchReality.glitchObjects[i];
      glitch.x += glitch.speedX;
      glitch.y += glitch.speedY;

      // Apply rotation if available
      if (glitch.rotationSpeed) {
        glitch.rotation = (glitch.rotation || 0) + glitch.rotationSpeed;
      }

      // Remove glitches that are off-screen
      if (glitch.x < -50 || glitch.x > canvas.width + 50 ||
          glitch.y < -50 || glitch.y > canvas.height + 50) {
        boss.attackPatterns.glitchReality.glitchObjects.splice(i, 1);
      }
    }

    // Increase intensity over time
    boss.attackPatterns.glitchReality.intensityTimer += deltaTime;
    if (boss.attackPatterns.glitchReality.intensityTimer >= 3000) { // Every 3 seconds
      boss.attackPatterns.glitchReality.intensityTimer = 0;
      boss.attackPatterns.glitchReality.intensity += 0.5;

      // Show message about increasing intensity
      if (Math.random() < 0.5) {
        showMessage("Reality is breaking down further!");
      }
    }

    // Add new glitch objects based on intensity
    const spawnChance = 0.05 * boss.attackPatterns.glitchReality.intensity;
    if (Math.random() < spawnChance) {
      createGlitchObject();
    }

    // End attack after a certain time
    boss.attackPatterns.glitchReality.timer -= deltaTime;
    if (boss.attackPatterns.glitchReality.timer <= 0) {
      boss.attackPatterns.glitchReality.active = false;
      showMessage("Reality has stabilized... for now.", true);
    }
  }
}

// Start Function Storm attack
function startFunctionStorm() {
  boss.attackPatterns.functionStorm.active = true;
  boss.attackPatterns.functionStorm.timer = 5000; // 5 seconds duration
  boss.attackPatterns.functionStorm.projectiles = [];

  safePlaySound(bossAttackSound);
}

// Start Undefined Error attack
function startUndefinedError() {
  boss.attackPatterns.undefinedError.active = true;
  boss.attackPatterns.undefinedError.timer = 3000; // 3 seconds duration
  boss.attackPatterns.undefinedError.x = player.x;
  boss.attackPatterns.undefinedError.y = player.y;

  safePlaySound(bossAttackSound);
}

// Start ChowChow attack
function startChowChow() {
  boss.attackPatterns.chowChow.active = true;
  boss.attackPatterns.chowChow.x = boss.x;
  boss.attackPatterns.chowChow.y = boss.y;

  safePlaySound(bossAttackSound);
}

// Start Snack Barrage attack
function startSnackBarrage() {
  boss.attackPatterns.snackBarrage.active = true;
  boss.attackPatterns.snackBarrage.timer = 4000; // 4 seconds duration
  boss.attackPatterns.snackBarrage.projectiles = [];

  safePlaySound(bossAttackSound);
}

// Start Monologue attack
function startMonologue() {
  boss.attackPatterns.monologue.active = true;
  boss.attackPatterns.monologue.timer = 8000; // Reduced to 8 seconds for faster pacing
  boss.attackPatterns.monologue.damageTimer = 0; // Timer for periodic damage
  boss.attackPatterns.monologue.messageIndex = 0; // Index for lecture messages

  safePlaySound(bossAttackSound);
  // Explicitly set isPauseMessage to true to ensure the game pauses
  showMessage("Marcos is giving a JavaScript lecture! Try to stay focused!", true);
}

// Start Glitch Reality attack
function startGlitchReality() {
  boss.attackPatterns.glitchReality.active = true;
  boss.attackPatterns.glitchReality.timer = 12000; // 12 seconds duration - longer and more intense
  boss.attackPatterns.glitchReality.glitchObjects = [];
  boss.attackPatterns.glitchReality.intensity = 1; // Starts at normal intensity
  boss.attackPatterns.glitchReality.intensityTimer = 0; // Timer for increasing intensity

  // Create initial glitch objects
  for (let i = 0; i < 5; i++) {
    createGlitchObject();
  }

  safePlaySound(bossAttackSound);
  showMessage("Reality is glitching! Watch out for distortions!");
}

// Create a new glitch object
function createGlitchObject() {
  // Random position and size
  const size = 30 + Math.random() * 50;

  // Random spawn location (top, bottom, left, or right of screen)
  let x, y, speedX, speedY;
  const side = Math.floor(Math.random() * 4);

  switch(side) {
    case 0: // Top
      x = Math.random() * canvas.width;
      y = -size;
      speedX = -2 + Math.random() * 4;
      speedY = 1 + Math.random() * 3;
      break;
    case 1: // Right
      x = canvas.width + size;
      y = Math.random() * canvas.height;
      speedX = -3 - Math.random() * 2;
      speedY = -2 + Math.random() * 4;
      break;
    case 2: // Bottom
      x = Math.random() * canvas.width;
      y = canvas.height + size;
      speedX = -2 + Math.random() * 4;
      speedY = -3 - Math.random() * 2;
      break;
    case 3: // Left
      x = -size;
      y = Math.random() * canvas.height;
      speedX = 1 + Math.random() * 3;
      speedY = -2 + Math.random() * 4;
      break;
  }

  boss.attackPatterns.glitchReality.glitchObjects.push({
    x: x,
    y: y,
    width: size,
    height: size,
    speedX: speedX,
    speedY: speedY,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: -0.05 + Math.random() * 0.1
  });
}

// Update projectiles
function updateProjectiles(deltaTime) {
  // Update player projectiles
  for (let i = playerProjectiles.length - 1; i >= 0; i--) {
    const projectile = playerProjectiles[i];
    projectile.x += projectile.speed;

    // Remove projectiles that are off-screen
    if (projectile.x > canvas.width) {
      playerProjectiles.splice(i, 1);
    }
  }

  // Update debug bombs
  for (let i = debugBombs.length - 1; i >= 0; i--) {
    const bomb = debugBombs[i];
    bomb.timer -= deltaTime;

    if (bomb.timer <= 0 && bomb.active) {
      // Explode the bomb
      bomb.active = false;

      // Disable all boss attacks for 3 seconds
      resetBossAttacks();
      boss.attackCooldown = 3000;

      // Apply damage to boss
      bossHealth -= 25; // Consistent damage with main system
      bossHealthFill.style.width = `${bossHealth}%`;

      // Play hit sound
      safePlaySound(hitSound);

      // Animation for explosion
      bomb.radius = 1;
      const explosionInterval = setInterval(() => {
        bomb.radius += 10;
        if (bomb.radius >= bomb.maxRadius) {
          clearInterval(explosionInterval);
          debugBombs.splice(i, 1);
        }
      }, 50);

      // Show message
      showMessage("Debug Bomb exploded! Boss took damage!");
    }
  }
}

// Draw game elements
function drawGame() {
  if (!ctx || !canvas) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  if (bgImg.complete) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // Add glitch effect in phase 3+
    if (currentPhase >= 3) {
      applyGlitchEffect();
    }
  } else {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw player
  drawPlayer();

  // Draw boss
  drawBoss();

  // Draw projectiles
  drawProjectiles();

  // Draw boss attacks
  drawBossAttacks();

  // Draw cooldown indicators
  drawCooldowns();
}

// Draw player
function drawPlayer() {
  if (!ctx) return;

  // Draw player image
  if (currentPlayerImage && currentPlayerImage.complete && currentPlayerImage.naturalWidth !== 0) {
    ctx.save();

    // Flash effect when invulnerable
    if (player.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Draw focus shield if active
    if (player.focusShieldActive) {
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + player.height / 2,
              Math.max(player.width, player.height) * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Draw sugar rush effect if active
    if (player.sugarRushActive) {
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 15;
    }

    // Apply flip effect based on direction
    if (player.direction === 'left') {
      // Flip horizontally for left direction
      ctx.translate(player.x + player.width, player.y);
      ctx.scale(-1, 1);
      ctx.drawImage(currentPlayerImage, 0, 0, player.width, player.height);
    } else {
      // Normal drawing for right and forward directions
      ctx.drawImage(currentPlayerImage, player.x, player.y, player.width, player.height);
    }

    // Add a slight bounce effect when moving
    if (player.moving && Math.floor(Date.now() / 150) % 2 === 0) {
      // Draw a small shadow beneath the player
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(
        player.x + player.width / 2,
        player.y + player.height - 5,
        player.width / 2,
        10,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
  } else {
    // Draw placeholder if image not loaded
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
}

// Draw boss
function drawBoss() {
  if (!ctx) return;

  // Draw boss image
  if (bossImg.complete && bossImg.naturalWidth !== 0) {
    ctx.save();

    // Phase-specific effects
    if (currentPhase >= 3) {
      // Glitch effect in later phases
      if (Math.random() < 0.1) {
        ctx.globalAlpha = 0.7 + Math.random() * 0.3;
        ctx.drawImage(bossImg,
                     boss.x + (-5 + Math.random() * 10),
                     boss.y + (-5 + Math.random() * 10),
                     boss.width, boss.height);
      }
    }

    // Apply flip effect based on direction
    if (boss.direction === 'left') {
      // Flip horizontally for left direction
      ctx.translate(boss.x + boss.width, boss.y);
      ctx.scale(-1, 1);
      ctx.drawImage(bossImg, 0, 0, boss.width, boss.height);
    } else {
      // Normal drawing for right and forward directions
      ctx.drawImage(bossImg, boss.x, boss.y, boss.width, boss.height);
    }

    // Draw trail effect for boss
    for (const trail of bossTrail) {
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 255, ${trail.opacity})`; // Blue trail for boss
      ctx.fill();
    }

    // Draw phase indicator
    ctx.font = '16px "Press Start 2P"';
    ctx.fillStyle = '#ff0000';
    ctx.textAlign = 'center';
    ctx.fillText(`Phase ${currentPhase}`, boss.x + boss.width / 2, boss.y - 10);

    ctx.restore();
  } else {
    // Draw placeholder if image not loaded
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
  }
}

// Draw projectiles
function drawProjectiles() {
  if (!ctx) return;

  // Draw player projectiles
  for (const projectile of playerProjectiles) {
    if (muffinImg.complete && muffinImg.naturalWidth !== 0) {
      if (projectile.isInspiration) {
        // Draw inspiration projectile with glow effect
        ctx.save();
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 20;
        ctx.drawImage(inspirationImg, projectile.x, projectile.y, projectile.width, projectile.height);
        ctx.restore();
      } else {
        // Draw regular muffin projectile
        ctx.drawImage(muffinImg, projectile.x, projectile.y, projectile.width, projectile.height);
      }
    } else {
      // Draw placeholder if image not loaded
      ctx.fillStyle = projectile.isInspiration ? '#ffcc00' : '#ffffff';
      ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
    }
  }

  // Draw debug bombs
  for (const bomb of debugBombs) {
    if (bomb.active) {
      // Draw active bomb
      if (debugBombImg.complete && debugBombImg.naturalWidth !== 0) {
        ctx.drawImage(debugBombImg, bomb.x, bomb.y, bomb.width, bomb.height);
      } else {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(bomb.x, bomb.y, bomb.width, bomb.height);
      }
    } else {
      // Draw explosion
      ctx.beginPath();
      ctx.arc(bomb.x + bomb.width / 2, bomb.y + bomb.height / 2, bomb.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

// Draw boss attacks
function drawBossAttacks() {
  if (!ctx) return;

  // Draw Function Storm projectiles
  if (boss.attackPatterns.functionStorm.active) {
    for (const projectile of boss.attackPatterns.functionStorm.projectiles) {
      // Draw code projectile
      if (codeProjectileImg.complete && codeProjectileImg.naturalWidth !== 0) {
        ctx.drawImage(codeProjectileImg, projectile.x, projectile.y, projectile.width, projectile.height);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
      }

      // Draw code text
      ctx.font = '14px monospace';
      ctx.fillStyle = '#00ff00';
      ctx.textAlign = 'center';
      ctx.fillText(projectile.text, projectile.x + projectile.width / 2, projectile.y + projectile.height / 2 + 5);
    }
  }

  // Draw Undefined Error
  if (boss.attackPatterns.undefinedError.active) {
    const error = boss.attackPatterns.undefinedError;

    // Draw error message
    if (errorImg.complete && errorImg.naturalWidth !== 0) {
      ctx.drawImage(errorImg, error.x - 100, error.y - 50, 200, 100);
    } else {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.fillRect(error.x - 100, error.y - 50, 200, 100);
    }

    ctx.font = '12px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Undefined is not a function', error.x, error.y);
  }

  // Draw ChowChow
  if (boss.attackPatterns.chowChow.active) {
    const chowChow = boss.attackPatterns.chowChow;

    if (chowChowImg.complete && chowChowImg.naturalWidth !== 0) {
      ctx.drawImage(chowChowImg, chowChow.x - 50, chowChow.y - 50, 100, 100);
    } else {
      ctx.fillStyle = '#ff00ff';
      ctx.beginPath();
      ctx.arc(chowChow.x, chowChow.y, 50, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw Snack Barrage
  if (boss.attackPatterns.snackBarrage.active) {
    for (const projectile of boss.attackPatterns.snackBarrage.projectiles) {
      ctx.save();
      ctx.translate(projectile.x + projectile.width / 2, projectile.y + projectile.height / 2);
      ctx.rotate(projectile.rotation);

      if (snackImg.complete && snackImg.naturalWidth !== 0) {
        ctx.drawImage(snackImg, -projectile.width / 2, -projectile.height / 2, projectile.width, projectile.height);
      } else {
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(-projectile.width / 2, -projectile.height / 2, projectile.width, projectile.height);
      }

      ctx.restore();
    }
  }

  // Draw Glitch Reality
  if (boss.attackPatterns.glitchReality.active) {
    for (const glitch of boss.attackPatterns.glitchReality.glitchObjects) {
      ctx.save();

      // Apply rotation if available
      if (glitch.rotation) {
        ctx.translate(glitch.x + glitch.width / 2, glitch.y + glitch.height / 2);
        ctx.rotate(glitch.rotation);

        if (glitchImg.complete && glitchImg.naturalWidth !== 0) {
          ctx.drawImage(glitchImg, -glitch.width / 2, -glitch.height / 2, glitch.width, glitch.height);
        } else {
          ctx.fillStyle = 'rgba(255, 0, 255, 0.7)';
          ctx.fillRect(-glitch.width / 2, -glitch.height / 2, glitch.width, glitch.height);
        }
      } else {
        if (glitchImg.complete && glitchImg.naturalWidth !== 0) {
          ctx.drawImage(glitchImg, glitch.x, glitch.y, glitch.width, glitch.height);
        } else {
          ctx.fillStyle = 'rgba(255, 0, 255, 0.7)';
          ctx.fillRect(glitch.x, glitch.y, glitch.width, glitch.height);
        }
      }

      // Add glitch effect based on intensity
      if (Math.random() < 0.3 * boss.attackPatterns.glitchReality.intensity) {
        ctx.globalCompositeOperation = 'exclusion';
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;

        if (glitch.rotation) {
          ctx.fillRect(-glitch.width / 2 - 5 + Math.random() * 10,
                      -glitch.height / 2 - 5 + Math.random() * 10,
                      glitch.width, glitch.height);
        } else {
          ctx.fillRect(glitch.x - 5 + Math.random() * 10,
                      glitch.y - 5 + Math.random() * 10,
                      glitch.width, glitch.height);
        }
      }

      ctx.restore();
    }
  }
}

// Draw cooldown indicators
function drawCooldowns() {
  if (!ctx) return;

  const indicatorSize = 30;
  const spacing = 10;
  const startX = 10;
  const startY = canvas.height - indicatorSize - 10;

  // Sugar Rush cooldown
  ctx.fillStyle = player.sugarRushCooldown > 0 ? 'rgba(255, 0, 255, 0.3)' : 'rgba(255, 0, 255, 0.7)';
  ctx.fillRect(startX, startY, indicatorSize, indicatorSize);
  ctx.font = '16px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('Q', startX + indicatorSize / 2, startY + indicatorSize / 2 + 5);

  // Debug Bomb cooldown
  ctx.fillStyle = player.debugBombCooldown > 0 ? 'rgba(0, 255, 255, 0.3)' : 'rgba(0, 255, 255, 0.7)';
  ctx.fillRect(startX + indicatorSize + spacing, startY, indicatorSize, indicatorSize);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('E', startX + indicatorSize + spacing + indicatorSize / 2, startY + indicatorSize / 2 + 5);

  // Inspiration Mode
  ctx.fillStyle = inspirationMeter < 100 ? 'rgba(255, 204, 0, 0.3)' : 'rgba(255, 204, 0, 0.7)';
  ctx.fillRect(startX + (indicatorSize + spacing) * 2, startY, indicatorSize, indicatorSize);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('R', startX + (indicatorSize + spacing) * 2 + indicatorSize / 2, startY + indicatorSize / 2 + 5);

  // Focus Shield cooldown
  ctx.fillStyle = player.focusShieldCooldown > 0 ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 255, 0, 0.7)';
  ctx.fillRect(startX + (indicatorSize + spacing) * 3, startY, indicatorSize, indicatorSize);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('⇧', startX + (indicatorSize + spacing) * 3 + indicatorSize / 2, startY + indicatorSize / 2 + 5);
}

// Apply glitch effect to the canvas
function applyGlitchEffect() {
  if (!ctx || !canvas) return;

  // Determine intensity based on phase
  const baseIntensity = currentPhase === 4 ? 0.4 : 0.2;
  const colorIntensity = currentPhase === 4 ? 0.15 : 0.05;
  const distortionIntensity = currentPhase === 4 ? 0.1 : 0;

  // Random glitch lines
  if (Math.random() < baseIntensity) {
    const numLines = Math.floor(Math.random() * (currentPhase === 4 ? 10 : 5)) + 1;

    for (let i = 0; i < numLines; i++) {
      const y = Math.random() * canvas.height;
      const height = Math.random() * 10 + 1;

      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx.fillRect(0, y, canvas.width, height);
    }
  }

  // Random color shift
  if (Math.random() < colorIntensity) {
    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Image distortion (phase 4 only)
  if (currentPhase === 4 && Math.random() < distortionIntensity) {
    // Save a portion of the canvas
    const x = Math.random() * (canvas.width - 100);
    const y = Math.random() * (canvas.height - 100);
    const width = 50 + Math.random() * 100;
    const height = 50 + Math.random() * 100;

    try {
      // Get image data
      const imageData = ctx.getImageData(x, y, width, height);

      // Apply distortion
      for (let i = 0; i < imageData.data.length; i += 4) {
        // Randomly shift RGB values
        if (Math.random() < 0.5) {
          const temp = imageData.data[i];
          imageData.data[i] = imageData.data[i + 2];
          imageData.data[i + 2] = temp;
        }
      }

      // Put the distorted image data back
      ctx.putImageData(imageData, x + (-10 + Math.random() * 20), y + (-10 + Math.random() * 20));
    } catch (e) {
      // Ignore any errors with image data manipulation
      console.error("Error applying image distortion:", e);
    }
  }
}

// Show a message
function showMessage(text, isPauseMessage = false) {
  gameMessage.textContent = text;
  gameMessage.classList.remove('hidden');

  // Determine if this is an important message that should pause the game
  // Phase announcements and Marcos' lectures are important
  if (isPauseMessage ||
      text.includes("Phase") ||
      text.includes("Marcos") ||
      text.includes("lecture") ||
      text.includes("JavaScript")) {

    // Pause the game
    gamePaused = true;
    pauseTimer = 3000; // Pause for 3 seconds

    // Make the message more prominent
    gameMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    gameMessage.style.padding = '15px';
    gameMessage.style.border = '2px solid white';
    gameMessage.style.fontSize = '18px';
    gameMessage.style.fontWeight = 'bold';
  } else {
    // Regular message styling
    gameMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    gameMessage.style.padding = '10px';
    gameMessage.style.border = 'none';
    gameMessage.style.fontSize = '16px';
    gameMessage.style.fontWeight = 'normal';
  }

  setTimeout(() => {
    gameMessage.classList.add('hidden');
  }, 3000);
}

// Show game over screen
function showGameOver() {
  bgMusic.pause();
  safePlaySound(defeatSound);
  gameRunning = false;
  gameOverScreen.classList.remove('hidden');
}

// Restart the game
function restartGame() {
  safePlaySound(uiClickSound);

  gameOverScreen.classList.add('hidden');
  resetGame();

  // Restart background music
  bgMusic.currentTime = 0;
  bgMusic.play().catch(e => console.error('Error playing background music:', e));

  // Restart game loop
  gameRunning = true;
  lastFrameTime = 0;
  requestAnimationFrame(gameLoop);
}

// Show victory screen
function showVictory() {
  bgMusic.pause();
  safePlaySound(victorySound);
  gameRunning = false;
  victoryScreen.classList.remove('hidden');
}

// Check collisions between game objects
function checkCollisions() {
  // Check player projectiles hitting boss
  for (let i = playerProjectiles.length - 1; i >= 0; i--) {
    const projectile = playerProjectiles[i];

    // Simple rectangle collision
    if (
      projectile.x < boss.x + boss.width &&
      projectile.x + projectile.width > boss.x &&
      projectile.y < boss.y + boss.height &&
      projectile.y + projectile.height > boss.y
    ) {
      // Hit the boss
      bossHealth -= projectile.damage;
      bossHealthFill.style.width = `${bossHealth}%`;

      // Remove the projectile
      playerProjectiles.splice(i, 1);

      // Play hit sound when boss is hit
      safePlaySound(hitSound);

      // Add inspiration for hitting the boss
      inspirationMeter += projectile.isInspiration ? 0 : 8; // Consistent with main system
      if (inspirationMeter > 100) inspirationMeter = 100;
      inspirationFill.style.width = `${inspirationMeter}%`;

      // Check if boss is defeated
      if (bossHealth <= 0) {
        if (currentPhase < 4) {
          // Advance to next phase
          currentPhase++;
          // Increase boss health for each phase
          bossHealth = 150 + (currentPhase - 1) * 50; // Consistent with main system
          bossHealthFill.style.width = '100%';

          // Show phase transition message
          const phaseMessages = [
            "",
            "Phase 2: ChowChow Fury - Watch out for the angry stuffed animal!",
            "Phase 3: The Monologue - Stay awake during Marcos' explanation!",
            "Final Phase: Glitch Reality - Reality is breaking down!"
          ];

          // Explicitly pause the game for phase transitions
          showMessage(phaseMessages[currentPhase - 1], true);

          // Reset boss attacks
          resetBossAttacks();
        } else {
          // Game won
          showVictory();
        }
      }
    }
  }

  // Check boss attacks hitting player
  if (!player.invulnerable) {
    // Function Storm projectiles
    if (boss.attackPatterns.functionStorm.active) {
      for (const projectile of boss.attackPatterns.functionStorm.projectiles) {
        if (
          projectile.x < player.x + player.width &&
          projectile.x + projectile.width > player.x &&
          projectile.y < player.y + player.height &&
          projectile.y + projectile.height > player.y
        ) {
          // Player hit by code
          if (!player.focusShieldActive) {
            playerHit(10);
          } else {
            // Shield blocked it
            showMessage("Shield blocked the code!");
          }

          // Remove the projectile
          const index = boss.attackPatterns.functionStorm.projectiles.indexOf(projectile);
          if (index > -1) {
            boss.attackPatterns.functionStorm.projectiles.splice(index, 1);
          }
        }
      }
    }

    // Undefined Error
    if (boss.attackPatterns.undefinedError.active) {
      const error = boss.attackPatterns.undefinedError;
      const errorRadius = 100;

      // Distance between player center and error center
      const dx = (player.x + player.width / 2) - error.x;
      const dy = (player.y + player.height / 2) - error.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < errorRadius) {
        // Player caught in error
        if (!player.focusShieldActive) {
          playerHit(15);

          // Disable the error after hitting
          boss.attackPatterns.undefinedError.active = false;
        } else {
          // Shield blocked it
          showMessage("Shield blocked the error!");
        }
      }
    }

    // ChowChow attack
    if (boss.attackPatterns.chowChow.active) {
      const chowChow = boss.attackPatterns.chowChow;

      if (
        chowChow.x < player.x + player.width &&
        chowChow.x + 100 > player.x &&
        chowChow.y < player.y + player.height &&
        chowChow.y + 100 > player.y
      ) {
        // Player hit by ChowChow
        if (!player.focusShieldActive) {
          playerHit(20);

          // Disable ChowChow after hitting
          boss.attackPatterns.chowChow.active = false;
        } else {
          // Shield blocked it
          showMessage("Shield blocked ChowChow!");
        }
      }
    }

    // Snack Barrage
    if (boss.attackPatterns.snackBarrage.active) {
      for (const projectile of boss.attackPatterns.snackBarrage.projectiles) {
        if (
          projectile.x < player.x + player.width &&
          projectile.x + projectile.width > player.x &&
          projectile.y < player.y + player.height &&
          projectile.y + projectile.height > player.y
        ) {
          // Player hit by snack
          if (!player.focusShieldActive) {
            playerHit(5);
          } else {
            // Shield blocked it
            showMessage("Shield blocked the snack!");
          }

          // Remove the projectile
          const index = boss.attackPatterns.snackBarrage.projectiles.indexOf(projectile);
          if (index > -1) {
            boss.attackPatterns.snackBarrage.projectiles.splice(index, 1);
          }
        }
      }
    }

    // Glitch Reality
    if (boss.attackPatterns.glitchReality.active) {
      for (const glitch of boss.attackPatterns.glitchReality.glitchObjects) {
        if (
          glitch.x < player.x + player.width &&
          glitch.x + glitch.width > player.x &&
          glitch.y < player.y + player.height &&
          glitch.y + glitch.height > player.y
        ) {
          // Player hit by glitch
          if (!player.focusShieldActive) {
            playerHit(15);
          } else {
            // Shield blocked it
            showMessage("Shield blocked the glitch!");
          }

          // Remove the glitch
          const index = boss.attackPatterns.glitchReality.glitchObjects.indexOf(glitch);
          if (index > -1) {
            boss.attackPatterns.glitchReality.glitchObjects.splice(index, 1);
          }
        }
      }
    }
  }
}

// Handle player being hit
function playerHit(damage) {
  playerHealth -= damage;
  playerHealthFill.style.width = `${playerHealth}%`;

  // Play hit sound when player is hit
  safePlaySound(hitSound);

  // Make player invulnerable briefly
  player.invulnerable = true;
  player.invulnerabilityTimer = 1000; // 1 second of invulnerability

  // Show damage message
  showMessage(`Ouch! -${damage} health`);

  // Check if player is defeated
  if (playerHealth <= 0) {
    showGameOver();
  }
}

// Check phase transitions
function checkPhaseTransitions() {
  // This is handled in the collision detection when boss health reaches 0
}

// Removed rhythm game functions as they are no longer needed

// Show credits
function showCredits() {
  safePlaySound(uiClickSound);

  victoryScreen.classList.add('hidden');
  loadingScreen.classList.add('visible'); // Use 'visible' class instead of removing 'hidden'

  // Start the loading bar animation
  const loadingBar = document.getElementById('loading-bar');
  let progress = 0;

  // Animation will last 5 seconds
  const interval = setInterval(() => {
    progress += 2;
    loadingBar.style.width = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        window.location.href = 'credits.html';
      }, 500);
    }
  }, 100);
}

// Start playing the start screen music when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Add event listener for the Finish Project button
  const finishProjectButton = document.getElementById('finish-project-btn');
  if (finishProjectButton) {
    finishProjectButton.addEventListener('click', finishProject);
  }

  // Add event listener for the Start Battle button to ensure music changes
  const startBattleButton = document.getElementById('start-button');
  if (startBattleButton) {
    startBattleButton.addEventListener('click', function() {
      // This will stop goldenWind.mp3 and start fightingSong.mp3
      startGame();
    });
  }
});
