// Enhanced Erasmus Quest - Phase 2: Bus Station Challenge
// Three-stage introduction system implementation

// Global variables for three-stage system
let continueButton1;
let continueButton2;
let startButton;
let startScreenStage1;
let startScreenStage2;
let startScreenStage3;

// Enhanced audio management for Phase 2
const uiClickSound = new Audio('Sounds/Effects/ui-click.wav');

// Set audio properties
uiClickSound.volume = 0.3;

// Note: safePlaySound is provided by common.js

// Initialize audio manager for Phase 2
document.addEventListener('DOMContentLoaded', () => {
  // Check if we should resume from previous phase or start fresh
  const currentInfo = audioManager.getCurrentInfo();
  if (!currentInfo || !currentInfo.isPlaying) {
    // Start Phase 2 background music
    audioManager.setBackgroundMusic('Sounds/Music/song2.wav');
    audioManager.playBackgroundMusic();
  }
  console.log("🎵 Phase 2 audio initialized");
});

// Check if there's saved music state
function loadMusicState() {
  const savedTrack = localStorage.getItem('currentMusicTrack');
  const savedPosition = localStorage.getItem('currentMusicPosition');

  if (savedTrack && savedPosition) {
    const trackNumber = parseInt(savedTrack);
    const position = parseFloat(savedPosition);

    if (trackNumber === 1) {
      bgSound1.currentTime = position;
      bgSound1.play();
    } else if (trackNumber === 2) {
      bgSound2.currentTime = position;
      bgSound2.play();
    }

    return trackNumber;
  }

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

// Enhanced DOM initialization with three-stage system
document.addEventListener('DOMContentLoaded', function() {
  // Initialize DOM elements for three-stage system
  continueButton1 = document.getElementById('continue-button-1');
  continueButton2 = document.getElementById('continue-button-2');
  startButton = document.getElementById('start-button');
  startScreenStage1 = document.getElementById('start-screen-stage1');
  startScreenStage2 = document.getElementById('start-screen-stage2');
  startScreenStage3 = document.getElementById('start-screen-stage3');

  // Add event listener for continue button 1 (Stage 1 -> Stage 2)
  if (continueButton1) {
    continueButton1.addEventListener('click', () => {
      window.safePlaySound(uiClickSound);
      transitionToStage2();
    });
  }

  // Add event listener for continue button 2 (Stage 2 -> Stage 3)
  if (continueButton2) {
    continueButton2.addEventListener('click', () => {
      window.safePlaySound(uiClickSound);
      transitionToStage3();
    });
  }

  // Add event listener for start button (Stage 3 -> Game)
  if (startButton) {
    startButton.addEventListener('click', () => {
      window.safePlaySound(uiClickSound);
      startGame();
    });
  }

  // Enhanced button click handling with safe audio play
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      window.safePlaySound(uiClickSound);
    });
  });

  // Add restart button event listener inside DOMContentLoaded to ensure element exists
  const restartButton = document.getElementById('restart-button');
  if (restartButton) {
    console.log("✅ Restart button found, adding event listener");

    // Add multiple event listeners to ensure it works
    restartButton.addEventListener('click', (event) => {
      console.log("🔄 Restart button clicked via addEventListener!");
      event.preventDefault();
      event.stopPropagation();

      // Use the global safePlaySound from common.js
      if (window.safePlaySound) {
        window.safePlaySound(uiClickSound);
      } else {
        // Fallback to direct play
        try {
          uiClickSound.currentTime = 0;
          uiClickSound.play().catch(e => console.error('Audio play error:', e));
        } catch (e) {
          console.error('Audio error:', e);
        }
      }

      resetGame();
    });

    // Also add onclick as backup
    restartButton.onclick = function(event) {
      console.log("🔄 Restart button clicked via onclick!");
      event.preventDefault();
      event.stopPropagation();

      if (window.safePlaySound) {
        window.safePlaySound(uiClickSound);
      }

      resetGame();
    };

    console.log("✅ Restart button event listeners added successfully");
  } else {
    console.error("❌ Restart button not found in DOM");
  }

  // Add next chapter button event listener inside DOMContentLoaded
  const nextChapterButton = document.getElementById('next-chapter-btn');
  if (nextChapterButton) {
    console.log("✅ Next chapter button found, adding event listener");
    nextChapterButton.addEventListener('click', () => {
      console.log("➡️ Next chapter button clicked");
      window.safePlaySound(uiClickSound);

      // Save current music state before transitioning
      audioManager.saveCurrentState();

      // Hide completion screen
      document.getElementById('completion-screen').classList.add('hidden');

      // Show bus animation screen
      document.getElementById('bus-loading-screen').classList.remove('hidden');

      // Start the loading bar animation
      const loadingBar = document.getElementById('loading-bar');
      let progress = 0;

      // Animation will last 5 seconds (50 steps * 100ms)
      const interval = setInterval(() => {
        progress += 2;
        loadingBar.style.width = `${progress}%`;

        if (progress >= 100) {
          clearInterval(interval);
          // After loading completes, go to phase 3
          setTimeout(() => {
            window.location.href = "phase3.html";
          }, 500);
        }
      }, 100);
    });
  } else {
    console.error("❌ Next chapter button not found in DOM");
  }
});

// Enhanced transition functions for three-stage introduction system
function transitionToStage2() {
  console.log("Phase 2: Transitioning from Stage 1 to Stage 2");

  // Add fade-out effect to stage 1
  if (startScreenStage1) {
    startScreenStage1.classList.add('fade-out');
  }

  // After fade-out animation completes, switch to stage 2
  setTimeout(() => {
    if (startScreenStage1) {
      startScreenStage1.classList.add('hidden');
    }
    if (startScreenStage2) {
      startScreenStage2.classList.remove('hidden');

      // Add fade-in effect to stage 2
      setTimeout(() => {
        startScreenStage2.classList.add('fade-in');
      }, 50); // Small delay to ensure the element is visible before animation
    }
  }, 500); // Match the CSS transition duration
}

function transitionToStage3() {
  console.log("Phase 2: Transitioning from Stage 2 to Stage 3");

  // Add fade-out effect to stage 2
  if (startScreenStage2) {
    startScreenStage2.classList.add('fade-out');
  }

  // After fade-out animation completes, switch to stage 3
  setTimeout(() => {
    if (startScreenStage2) {
      startScreenStage2.classList.add('hidden');
    }
    if (startScreenStage3) {
      startScreenStage3.classList.remove('hidden');

      // Add fade-in effect to stage 3
      setTimeout(() => {
        startScreenStage3.classList.add('fade-in');
      }, 50); // Small delay to ensure the element is visible before animation
    }
  }, 500); // Match the CSS transition duration
}

// Canvas and context
const busCanvas = document.getElementById('bus-canvas');
const busCtx = busCanvas.getContext('2d');

// Background
const busBgImg = new Image();
busBgImg.src = 'Image/Fundal/priscom.jpg';
// Boarding zone - corrected according to exact coordinates
const busZone = { x: 299, y: 300, width: 30, height: -30 };

// Obstacles moved higher (with positive values)
const obstacles = [
  { x: 2, y: 80, width: 1000, height: 20 },
  { x: 117, y: 123, width: 200, height: 100 },
  { x: 316, y: 135, width: 140, height: 100 },
];

// Player
let busPlayer = { x: 700, y: 140, width: 80, height: 120 };
const busPlayerSpeed = 3;
let busAnimationFrame = 0;
let busFlipped = false;

const busPlayerImages = {
  up: [new Image(), new Image()],
  left: [new Image(), new Image()],
  right: [new Image(), new Image()],
  down: [new Image(), new Image()]
};
busPlayerImages.up[0].src = 'Image/Personaje/EU/spateEu.png';
busPlayerImages.up[1].src = 'Image/Personaje/EU/spateEu.png';
busPlayerImages.left[0].src = 'Image/Personaje/EU/euStanga1.png';
busPlayerImages.left[1].src = 'Image/Personaje/EU/euStanga2.png';
busPlayerImages.right[0].src = 'Image/Personaje/EU/euStanga1.png';
busPlayerImages.right[1].src = 'Image/Personaje/EU/euStanga2.png';
busPlayerImages.down[0].src = 'Image/Personaje/EU/EU.png';
busPlayerImages.down[1].src = 'Image/Personaje/EU/EU.png';

let currentBusPlayerImage = busPlayerImages.down[0];

// Keyboard controls
const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// AABB collision function
function isColliding(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Check if player can move to a new point
function canMoveTo(newX, newY, width, height) {
  for (const obs of obstacles) {
    if (isColliding(newX, newY, width, height, obs.x, obs.y, obs.width, obs.height)) {
      return false;
    }
  }
  return true;
}

// Player movement (no diagonals)
function moveBusPlayer(canvas) {
  let moved = false;
  if (keys['ArrowUp'] || keys['w']) {
    let newY = busPlayer.y - busPlayerSpeed;
    if (newY >= 0 && canMoveTo(busPlayer.x, newY, busPlayer.width, busPlayer.height)) {
      busPlayer.y = newY;
      currentBusPlayerImage = busPlayerImages.up[Math.floor(busAnimationFrame / 10) % 2];
      busFlipped = false;
      moved = true;
    }
  } else if (keys['ArrowDown'] || keys['s']) {
    let newY = busPlayer.y + busPlayerSpeed;
    if (newY <= canvas.height - busPlayer.height && canMoveTo(busPlayer.x, newY, busPlayer.width, busPlayer.height)) {
      busPlayer.y = newY;
      currentBusPlayerImage = busPlayerImages.down[Math.floor(busAnimationFrame / 10) % 2];
      busFlipped = false;
      moved = true;
    }
  } else if (keys['ArrowLeft'] || keys['a']) {
    let newX = busPlayer.x - busPlayerSpeed;
    if (newX >= 0 && canMoveTo(newX, busPlayer.y, busPlayer.width, busPlayer.height)) {
      busPlayer.x = newX;
      currentBusPlayerImage = busPlayerImages.left[Math.floor(busAnimationFrame / 10) % 2];
      busFlipped = false;
      moved = true;
    }
  } else if (keys['ArrowRight'] || keys['d']) {
    let newX = busPlayer.x + busPlayerSpeed;
    if (newX <= canvas.width - busPlayer.width && canMoveTo(newX, busPlayer.y, busPlayer.width, busPlayer.height)) {
      busPlayer.x = newX;
      currentBusPlayerImage = busPlayerImages.right[Math.floor(busAnimationFrame / 10) % 2];
      busFlipped = true;
      moved = true;
    }
  }
  if (!moved) {
    currentBusPlayerImage = busPlayerImages.down[0];
    busFlipped = false;
  }
  busAnimationFrame++;
}

// Draw player with perspective
function getPlayerScale(y) {
  const minScale = 0.4;
  const maxScale = 1;
  const minY = 0;
  const maxY = busCanvas.height - busPlayer.height;
  const clampedY = Math.max(minY, Math.min(y, maxY));
  const t = (clampedY - minY) / (maxY - minY);
  return minScale + (maxScale - minScale) * Math.pow(t, 2);
}

function drawBusPlayer(ctx) {
  const scale = getPlayerScale(busPlayer.y);
  const drawWidth = busPlayer.width * scale;
  const drawHeight = busPlayer.height * scale;
  const drawX = busPlayer.x + (busPlayer.width - drawWidth) / 2;
  const drawY = busPlayer.y + (busPlayer.height - drawHeight);

  if (drawWidth <= 0 || drawHeight <= 0) return;

  if (busFlipped) {
    ctx.save();
    ctx.translate(drawX + drawWidth, drawY);
    ctx.scale(-1, 1);
    ctx.drawImage(currentBusPlayerImage, 0, 0, drawWidth, drawHeight);
    ctx.restore();
  } else {
    ctx.drawImage(currentBusPlayerImage, drawX, drawY, drawWidth, drawHeight);
  }
}

// Classmate images
const classmateImagePaths = [
  'Image/Personaje/baiat1.png',
  'Image/Personaje/fata1.png',
  'Image/Personaje/fata2.png',
  'Image/Personaje/profa1.png',
  'Image/Personaje/profa2.png'
];
const classmateImages = [];
let imagesLoaded = 0;

function loadClassmateImages(callback) {
  classmateImagePaths.forEach(path => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === classmateImagePaths.length) {
        callback();
      }
    };
    classmateImages.push(img);
  });
}

// Variable for finished countdown
let countdownFinished = false;

// Flag to prevent multiple alerts
let showingAlert = false;

// Classmate class with disappearance on boarding and blocking after timeout
class Classmate {
  constructor(img) {
    this.x = 50;
    this.y = 350;
    this.width = 60;
    this.height = 100;
    this.speed = 2;
    this.img = img;
    this.reachedBus = false;
    this.visible = true;
    this.boarding = false; // Flag for boarding animation
    this.boardingTime = 0; // Counter for boarding animation
  }

  update() {
    // No longer move toward the bus if time is up
    if (countdownFinished && !this.reachedBus) {
      // If time is up and they haven't reached the bus, they stop
      return;
    }

    if (!this.reachedBus && this.visible) {
      const dx = busZone.x + busZone.width / 2 - this.x;
      const dy = busZone.y + busZone.height / 2 - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.speed) {
        this.x = busZone.x + busZone.width / 2;
        this.y = busZone.y + busZone.height / 2;
        this.boarding = true; // Start boarding animation
      } else {
        this.x += this.speed * dx / dist;
        this.y += this.speed * dy / dist;
      }
    }

    // Process boarding animation
    if (this.boarding) {
      this.boardingTime += 1;
      if (this.boardingTime > 30) { // Short animation time (30 frames)
        this.reachedBus = true;
        this.visible = false; // Disappear after boarding
        this.boarding = false;
      }
    }
  }

  draw(ctx) {
    if (this.visible) {
      // We can add boarding animation here (decreasing opacity or scaling)
      if (this.boarding) {
        ctx.globalAlpha = 1 - (this.boardingTime / 30);
      }

      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);

      // Reset opacity
      if (this.boarding) {
        ctx.globalAlpha = 1;
      }
    }
  }
}

// Classmates
const classmates = [];
const maxClassmates = 5;
// Modificat: Reduce intervalul de apariție pentru a genera pasagerii mai rapid
const spawnInterval = 3000; // Redus de la 5000ms la 3000ms
let lastSpawnTime = 0;
let totalPassengersSpawned = 0;
const totalPassengersToSpawn = 5; // Fixed number of passengers that must board

// Timer with milliseconds
// Increased time to give player more time
let timer = 45; // Increased from 30s to 45s
// Reduced time speed factor to make the game less stressful
const timeSpeedFactor = 1.5; // Time passes 1.5 times faster instead of 2
let gameOver = false;

function drawTimer(ctx) {
  // Update HTML timer display
  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) {
    const timerColor = timer <= 10 ? '#ff0000' : (timer <= 20 ? '#ffff00' : '#00ff00');
    timerDisplay.textContent = `${timer.toFixed(2)}s`;
    timerDisplay.style.color = timerColor;
  }

  // Also draw on canvas for backup
  ctx.font = 'bold 16px "Press Start 2P", Arial, sans-serif';
  const timerColor = timer <= 10 ? '#ff0000' : (timer <= 20 ? '#ffff00' : '#00ff00');
  ctx.fillStyle = timerColor;
  ctx.fillText(`Time: ${timer.toFixed(1)}s`, 10, 30);
}

function drawPassengerCount(ctx) {
  // Update HTML passenger display
  const passengerDisplay = document.getElementById('passenger-display');
  const boardedPassengers = totalPassengersSpawned - classmates.length;

  if (passengerDisplay) {
    passengerDisplay.textContent = `${boardedPassengers}/${totalPassengersToSpawn}`;
    // Change color based on progress
    if (boardedPassengers === totalPassengersToSpawn) {
      passengerDisplay.style.color = '#00ff00'; // Green when all boarded
    } else if (boardedPassengers > 0) {
      passengerDisplay.style.color = '#ffff00'; // Yellow when some boarded
    } else {
      passengerDisplay.style.color = '#ffcc00'; // Default color
    }
  }

  // Also draw on canvas for backup
  ctx.font = 'bold 14px "Press Start 2P", Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Passengers: ${boardedPassengers}/${totalPassengersToSpawn}`, 10, 55);
}

function updateTimer(deltaTime) {
  if (timer > 0 && !gameOver) {
    // Modificat: Timpul scade mai repede folosind factorul de accelerare
    timer -= deltaTime * timeSpeedFactor;
    if (timer <= 0) {
      timer = 0;
      countdownFinished = true; // After timeout, no one else boards
      // Do not spawn new passengers after time expires
    }
  }
}

function spawnClassmate() {
  // Check if we still have passengers to generate and time hasn't expired
  if (totalPassengersSpawned < totalPassengersToSpawn && !countdownFinished) {
    const img = classmateImages[Math.floor(Math.random() * classmateImages.length)];
    classmates.push(new Classmate(img));
    totalPassengersSpawned++;
  }
}

// Check if all passengers have boarded the bus
function allPassengersBoarded() {
  return totalPassengersSpawned === totalPassengersToSpawn && classmates.length === 0;
}

let lastFrameTime = performance.now();

function drawBusGame() {
  const now = performance.now();
  const deltaTime = (now - lastFrameTime) / 1000;
  lastFrameTime = now;

  busCtx.clearRect(0, 0, busCanvas.width, busCanvas.height);
  busCtx.drawImage(busBgImg, 0, 0, busCanvas.width, busCanvas.height);

  // Obstacles (debug) - comment out for final version
  /*
  for (const obs of obstacles) {
    busCtx.fillStyle = "rgba(255,0,0,0.4)";
    busCtx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }
  */

  // Update and draw classmates, remove those who have boarded
  classmates.forEach(c => {
    c.update();
    c.draw(busCtx);
  });
  for (let i = classmates.length - 1; i >= 0; i--) {
    if (!classmates[i].visible) {
      classmates.splice(i, 1);
    }
  }

  // Player
  moveBusPlayer(busCanvas);
  drawBusPlayer(busCtx);

  // Bus zone (debug) - comment out for final version
  /*
  busCtx.strokeStyle = 'yellow';
  busCtx.lineWidth = 3;
  busCtx.strokeRect(busZone.x, busZone.y, busZone.width, busZone.height);
  */

  // Timer and passenger counter
  drawTimer(busCtx);
  drawPassengerCount(busCtx);
  updateTimer(deltaTime);

  // Spawn new passengers at interval (only if time hasn't expired and we haven't reached the max)
  if (now - lastSpawnTime > spawnInterval &&
      totalPassengersSpawned < totalPassengersToSpawn &&
      !countdownFinished) {
    spawnClassmate();
    lastSpawnTime = now;
  }

  // Check if player is in the bus zone
  if (!gameOver &&
      isColliding(busPlayer.x, busPlayer.y, busPlayer.width, busPlayer.height,
                  busZone.x, busZone.y, busZone.width, busZone.height)) {

    if (allPassengersBoarded() && timer > 0) {
      // All passengers have boarded and the player can board (caught the bus in time)
      gameOver = true;
      setTimeout(() => {
        // Show completion screen instead of alert
        document.getElementById('completion-screen').classList.remove('hidden');
      }, 100);
      return;
    } else if (!allPassengersBoarded() && timer > 0) {
      // Not all passengers have boarded yet, player cannot board
      // Push player back immediately without stopping the game
      busPlayer.y += 20;

      // Use a flag to prevent multiple messages
      if (!showingAlert) {
        showingAlert = true;
        // Show enhanced non-blocking message
        const gameMessage = document.getElementById('game-message');
        if (gameMessage && typeof showMessage === 'function') {
          showMessage(gameMessage, "🚌 Wait! You can't board yet! Let your classmates go first - it's European etiquette!", 3000);
        }

        // Reset the flag after the message duration
        setTimeout(() => {
          showingAlert = false;
        }, 3000);
      }
    } else if (timer === 0) {
      // Time expired, player can no longer board
      gameOver = true;
      setTimeout(() => {
        document.getElementById('restart-screen').classList.remove('hidden');
      }, 100);
      return;
    }
  }

  // If time expired and you are not on the bus
  if (!gameOver && timer === 0) {
    gameOver = true;
    // Show restart screen instead of alert
    setTimeout(() => {
      document.getElementById('restart-screen').classList.remove('hidden');
    }, 100);
    return;
  }

  if (!gameOver) {
    requestAnimationFrame(drawBusGame);
  }
}

// Preload classmate images but don't start the game automatically
// Game will only start when user clicks "Enter Bus Station"
loadClassmateImages(() => {
  console.log("✅ Classmate images loaded - ready to start game when user clicks button");
  // Don't start the game here - wait for user to click "Enter Bus Station"
});

// Function to reset the game state and restart gameplay directly
function resetGame() {
  console.log("🔄 Resetting game and restarting gameplay directly");

  // Stop the current game loop
  gameOver = true;

  // Reset game variables to initial state
  busPlayer = { x: 700, y: 140, width: 80, height: 120 };
  busAnimationFrame = 0;
  busFlipped = false;
  currentBusPlayerImage = busPlayerImages.down[0];

  // Reset classmates array
  classmates.length = 0;
  totalPassengersSpawned = 0;

  // Reset timer and game state
  timer = 45;
  gameOver = false;
  countdownFinished = false;
  showingAlert = false;

  // Reset spawn timing
  lastSpawnTime = 0;
  lastFrameTime = performance.now();

  // Hide restart screen and show game elements
  try {
    const restartScreen = document.getElementById('restart-screen');
    const gameContainer = document.getElementById('phase-2-container');
    const gameHeader = document.getElementById('game-header');
    const startScreenContainer = document.getElementById('start-screen-container');

    // Hide restart screen and start screen container
    if (restartScreen) restartScreen.classList.add('hidden');
    if (startScreenContainer) startScreenContainer.classList.add('hidden');

    // Hide all start screen stages
    if (startScreenStage1) startScreenStage1.classList.add('hidden');
    if (startScreenStage2) startScreenStage2.classList.add('hidden');
    if (startScreenStage3) startScreenStage3.classList.add('hidden');

    // Show game elements
    if (gameContainer) gameContainer.classList.remove('hidden');
    if (gameHeader) gameHeader.classList.remove('hidden');

    console.log("✅ Game elements shown, start screens hidden");
  } catch (error) {
    console.error("Error managing screen visibility:", error);
  }

  // Ensure background music is playing
  try {
    if (!audioManager.getCurrentInfo()?.isPlaying) {
      audioManager.playBackgroundMusic();
    }
  } catch (error) {
    console.error("Error managing audio:", error);
  }

  // Start the game loop immediately
  try {
    if (busBgImg.complete) {
      drawBusGame();
      console.log("✅ Game loop restarted with loaded background");
    } else {
      busBgImg.onload = function() {
        drawBusGame();
        console.log("✅ Game loop restarted after background load");
      };
    }
  } catch (error) {
    console.error("Error starting game loop:", error);
  }

  console.log("✅ Game reset completed - gameplay restarted directly");
}

// Function to show a non-blocking game message
function showGameMessage(message) {
  const messageElement = document.getElementById('game-message');
  messageElement.textContent = message;
  messageElement.classList.remove('hidden');

  // Hide the message after the animation completes
  setTimeout(() => {
    messageElement.classList.add('hidden');
  }, 2000); // Match the animation duration
}

// Enhanced start game function for three-stage system
function startGame() {
  console.log("Starting Phase 2 game from three-stage system");

  // Hide the entire start screen container
  const startScreenContainer = document.getElementById('start-screen-container');
  if (startScreenContainer) {
    startScreenContainer.classList.add('hidden');
    console.log("✅ Start screen container hidden");
  }

  // Hide all individual start screen stages as backup
  if (startScreenStage1) startScreenStage1.classList.add('hidden');
  if (startScreenStage2) startScreenStage2.classList.add('hidden');
  if (startScreenStage3) startScreenStage3.classList.add('hidden');

  // Initialize game state
  timer = 45; // Reset timer
  gameOver = false;
  countdownFinished = false;
  showingAlert = false;
  totalPassengersSpawned = 0;
  classmates.length = 0;

  // Ensure background music is playing
  if (!audioManager.getCurrentInfo()?.isPlaying) {
    audioManager.playBackgroundMusic();
  }

  // Show game elements
  document.getElementById('phase-2-container').classList.remove('hidden');
  document.getElementById('game-header').classList.remove('hidden');

  // Initialize game rendering with proper timing
  lastFrameTime = performance.now();
  lastSpawnTime = lastFrameTime;

  // Start the game loop
  if (busBgImg.complete) {
    drawBusGame();
  } else {
    busBgImg.onload = function() {
      drawBusGame();
    };
  }

  console.log("✅ Phase 2 game started successfully");
}

