// Phase 5: Try Not to Fall Asleep
// Enhanced audio management for Phase 5
const uiClickSound = new Audio('Sounds/Effects/ui-click.wav');
const sleepySound = new Audio('Sounds/Effects/hit.wav');
const wakeUpSound = new Audio('Sounds/Effects/ui-click.wav');
const snoreSound = new Audio('Sounds/Effects/hit.wav');
const victorySound = new Audio('Sounds/Effects/complete.mp3');
const harshNoiseSound = new Audio('Sounds/Music/hit.mp3'); // Folosim hit.mp3 din Sounds/Music ca sunet harsh pentru greșeli

// Set volume levels
uiClickSound.volume = 0.3;
sleepySound.volume = 0.4;
wakeUpSound.volume = 0.4;
snoreSound.volume = 0.5;
victorySound.volume = 0.5;
harshNoiseSound.volume = 0.8; // Volum și mai mare pentru sunetul de greșeală

// Initialize audio manager for Phase 5
document.addEventListener('DOMContentLoaded', () => {
  // Set Phase 5 specific background music
  audioManager.setBackgroundMusic('Sounds/Music/song3.wav');
  audioManager.playBackgroundMusic();
  console.log("🎵 Phase 5 audio initialized");
});

// Adăugăm gestionarea erorilor pentru sunetul harsh
harshNoiseSound.onerror = function() {
  console.error('Eroare la încărcarea sunetului harsh (hit.mp3)');
  // Folosim un sunet alternativ în caz de eroare
  harshNoiseSound = new Audio('Sounds/Effects/hit.wav');
  harshNoiseSound.volume = 0.8;
};

// Safe play function that won't crash if sound isn't loaded
function safePlaySound(sound) {
  try {
    if (sound && sound.play) {
      // Resetăm timpul de redare
      if (sound.readyState >= 2) { // HAVE_CURRENT_DATA sau mai mult
        sound.currentTime = 0;
      }

      // Redăm sunetul cu gestionarea erorilor
      const playPromise = sound.play();

      // Gestionăm promisiunea returnată de play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing sound:', error);

          // Dacă sunetul este harshNoiseSound și avem o eroare, încercăm sunetul alternativ
          if (sound === harshNoiseSound) {
            console.log('Încercăm să redăm sunetul alternativ pentru harsh noise');
            const alternativeSound = new Audio('Sounds/Effects/hit.wav');
            alternativeSound.volume = 0.8;
            alternativeSound.play().catch(e => console.error('Error playing alternative sound:', e));
          }
        });
      }
    }
  } catch (e) {
    console.error('Error in safePlaySound:', e);
  }
}

// Game variables
let gameTime = 30; // 30 seconds to stay awake
let sleepiness = 0; // 0-100%
let gameOver = false;
let gameWon = false;
let lastFrameTime = 0;
let attackMeterActive = false;
let attackIndicatorPosition = 0;
let attackIndicatorDirection = 1; // 1 = right, -1 = left
let attackIndicatorSpeed = 3; // Increased speed for more challenge
// Progressive difficulty system for green zone
const ORIGINAL_ZONE_WIDTH = 60; // Original green zone width (180 - 120 = 60)
const MIN_ZONE_WIDTH = 20; // Minimum green zone width to prevent impossibility
const DIFFICULTY_REDUCTION = 0.12; // 12% reduction per successful hit

let currentZoneWidth = ORIGINAL_ZONE_WIDTH; // Current green zone width
let successfulHits = 0; // Track successful hits for difficulty progression
let difficultyLevel = 1; // Current difficulty level for display

// Calculate zone positions based on current width (centered at position 150)
let attackZoneStart = 150 - (currentZoneWidth / 2); // Position where green zone starts
let attackZoneEnd = 150 + (currentZoneWidth / 2); // Position where green zone ends

// Game variables continue
let dialogTexts = [
  "JavaScript is a single-threaded language...",
  "Blablabla... parseInt()... blabla...",
  "Function() {} is the key to success!",
  "Don't forget about semicolons!!!",
  "Collision detection is vital for platformers...",
  "Blablabla Scope blabla... variables...",
  "AJAX stands for Asynchronous... Zzz...",
  "You can do anything... with enough caffeine."
];
let currentDialogIndex = 0;
let dialogChangeTimer = 0;
let sleepinessIncreaseTimer = 0;
let failedAttempts = 0;

// Canvas and context variables
let canvas;
let ctx;

// Images
const bgImg = new Image();
const teacherImg = new Image();
const playerImg = new Image();

// Initialize images
function initializeImages() {
  // Background image
  bgImg.onload = function() {
    console.log('Background image loaded successfully');
  };
  bgImg.onerror = function() {
    console.error('Error loading background image');
    // Use a fallback color
    drawGame();
  };
  bgImg.src = 'Image/Fundal/escuela.jpg';

  // Teacher image
  teacherImg.onload = function() {
    console.log('Teacher image loaded successfully');
  };
  teacherImg.onerror = function() {
    console.error('Error loading teacher image');
  };
  teacherImg.src = 'Image/Personaje/Marcos.png';

  // Player image
  playerImg.onload = function() {
    console.log('Player image loaded successfully');
  };
  playerImg.onerror = function() {
    console.error('Error loading player image');
  };
  playerImg.src = 'Image/Personaje/EU/EU.png';
}

// Global variables for three-stage system
let continueButton1;
let continueButton2;
let startButton;
let startScreenStage1;
let startScreenStage2;
let startScreenStage3;

// DOM elements
const gameHeader = document.getElementById('game-header');
const phase5Container = document.getElementById('phase-5-container');
const restartScreen = document.getElementById('restart-screen');
const completionScreen = document.getElementById('completion-screen');
const loadingScreen = document.getElementById('loading-screen');
const restartButton = document.getElementById('restart-button');
const nextChapterButton = document.getElementById('next-chapter-btn');
const timerElement = document.getElementById('timer');
const sleepinessFill = document.getElementById('sleepiness-fill');
const attackMeter = document.getElementById('attack-meter');
const attackIndicator = document.getElementById('attack-indicator');
const gameMessage = document.getElementById('game-message');

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
      safePlaySound(uiClickSound);
      transitionToStage2();
    });
  }

  // Add event listener for continue button 2 (Stage 2 -> Stage 3)
  if (continueButton2) {
    continueButton2.addEventListener('click', () => {
      safePlaySound(uiClickSound);
      transitionToStage3();
    });
  }

  // Add event listener for start button (Stage 3 -> Game)
  if (startButton) {
    startButton.addEventListener('click', () => {
      safePlaySound(uiClickSound);
      startGame();
    });
  }

  // Add other event listeners
  if (restartButton) {
    restartButton.addEventListener('click', restartGame);
  }
  if (nextChapterButton) {
    nextChapterButton.addEventListener('click', goToNextChapter);
  }

  document.addEventListener('keydown', handleKeyPress);
});

// Enhanced transition functions for three-stage introduction system
function transitionToStage2() {
  console.log("Phase 5: Transitioning from Stage 1 to Stage 2");

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
  console.log("Phase 5: Transitioning from Stage 2 to Stage 3");

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

// Game initialization continues

// Main game loop
function gameLoop(timestamp) {
  if (lastFrameTime === 0) {
    lastFrameTime = timestamp;
  }

  const deltaTime = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  if (!gameOver && !gameWon) {
    updateGame(deltaTime);
    drawGame();
    requestAnimationFrame(gameLoop);
  }
}

// Update game state
function updateGame(deltaTime) {
  // Update timer
  if (gameTime > 0) {
    gameTime -= deltaTime / 1000;
    timerElement.textContent = `Time: ${Math.ceil(gameTime)}s`;

    if (gameTime <= 0) {
      gameTime = 0;
      gameWon = true;
      gameOver = true; // Stop the game loop
      completeLevel();
    }
  }

  // Update dialog text every 2 seconds
  dialogChangeTimer += deltaTime;
  if (dialogChangeTimer >= 2000) {
    dialogChangeTimer = 0;
    currentDialogIndex = (currentDialogIndex + 1) % dialogTexts.length;
  }

  // Increase sleepiness every 5 seconds
  sleepinessIncreaseTimer += deltaTime;
  if (sleepinessIncreaseTimer >= 5000) {
    sleepinessIncreaseTimer = 0;
    activateAttackMeter();
  }

  // Update attack indicator position
  if (attackMeterActive) {
    attackIndicatorPosition += attackIndicatorSpeed * attackIndicatorDirection;

    // Reverse direction when hitting the edges
    if (attackIndicatorPosition >= 295 || attackIndicatorPosition <= 0) {
      attackIndicatorDirection *= -1;
    }

    // Update indicator position
    attackIndicator.style.left = `${attackIndicatorPosition}px`;
  }
}

// Draw game elements
function drawGame() {
  if (!ctx || !canvas) {
    return; // Exit if context or canvas is not initialized
  }

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  if (bgImg.complete && bgImg.naturalWidth !== 0) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw teacher
  if (teacherImg.complete && teacherImg.naturalWidth !== 0) {
    // Position the teacher at the specified coordinates (70, 200)
    // Parameters are: image, x, y, width, height
    // Dimensions are 200x200
    ctx.drawImage(teacherImg, 70, 200, 200, 200);
  } else {
    // Draw placeholder for teacher
    ctx.fillStyle = '#666';
    ctx.fillRect(105, 283, 200, 270);
  }

  // Draw player
  if (playerImg.complete && playerImg.naturalWidth !== 0) {
    // Position the player on the right side of the screen
    // Parameters are: image, x, y, width, height
    ctx.drawImage(playerImg, canvas.width - 200, canvas.height - 180, 100, 150);
  } else {
    // Draw placeholder for player
    ctx.fillStyle = '#666';
    ctx.fillRect(canvas.width - 200, canvas.height - 180, 100, 150);
  }

  // Apply visual effects based on sleepiness
  applyVisualEffects();

  // Draw dialog bubble
  drawDialogBubble();
}

// Apply visual effects based on sleepiness level
function applyVisualEffects() {
  if (!canvas) return;

  canvas.classList.remove('blur-light', 'blur-medium', 'blur-heavy', 'shake');

  if (failedAttempts >= 1) {
    canvas.classList.add('blur-light');
  }

  if (failedAttempts >= 2) {
    canvas.classList.add('shake');
  }

  if (failedAttempts >= 3) {
    canvas.classList.add('blur-medium');
  }

  if (failedAttempts >= 4) {
    canvas.classList.add('blur-heavy');
  }
}

// Update difficulty progression system
function updateDifficulty() {
  successfulHits++;

  // Calculate new zone width with reduction
  const newWidth = Math.max(
    MIN_ZONE_WIDTH,
    ORIGINAL_ZONE_WIDTH * Math.pow(1 - DIFFICULTY_REDUCTION, successfulHits)
  );

  currentZoneWidth = newWidth;
  difficultyLevel = successfulHits + 1;

  // Recalculate zone positions (centered at position 150)
  attackZoneStart = 150 - (currentZoneWidth / 2);
  attackZoneEnd = 150 + (currentZoneWidth / 2);

  console.log(`🎯 Difficulty increased! Level ${difficultyLevel}, Zone width: ${Math.round(currentZoneWidth)}px`);
}

// Reset difficulty to original settings
function resetDifficulty() {
  currentZoneWidth = ORIGINAL_ZONE_WIDTH;
  successfulHits = 0;
  difficultyLevel = 1;
  attackZoneStart = 150 - (currentZoneWidth / 2);
  attackZoneEnd = 150 + (currentZoneWidth / 2);

  console.log("🔄 Difficulty reset to original level");
}

// Activate the attack meter with progressive difficulty
function activateAttackMeter() {
  attackMeterActive = true;
  attackMeter.classList.remove('hidden');
  attackIndicatorPosition = 0;
  attackIndicator.style.left = '0px';

  // Make sure the attack zone is properly positioned with current difficulty
  const attackZone = document.getElementById('attack-zone');
  if (attackZone) {
    attackZone.style.left = '50%';
    attackZone.style.transform = 'translateX(-50%)';
    attackZone.style.width = `${currentZoneWidth}px`; // Use current zone width
    attackZone.style.backgroundColor = '#00ff00';

    // Add visual indicator for difficulty level
    if (difficultyLevel > 1) {
      attackZone.style.boxShadow = `0 0 ${difficultyLevel * 2}px #ffff00`; // Yellow glow increases with difficulty
    } else {
      attackZone.style.boxShadow = 'none';
    }
  }

  // Sound warning 0.5 seconds before auto-fail
  setTimeout(() => {
    if (attackMeterActive) {
      // Play a warning sound
      safePlaySound(sleepySound);
    }
  }, 2500);

  // Auto-fail after 3 seconds if no input
  setTimeout(() => {
    if (attackMeterActive) {
      // Show a specific message for not pressing at all
      showMessage("You fell completely asleep! You didn't react in time!");
      failAttack();
    }
  }, 3000);

  // Show message with difficulty level
  const difficultyMessage = difficultyLevel > 1
    ? `You're feeling sleepy! Press SPACE to wake up! (Difficulty Level ${difficultyLevel})`
    : "You're feeling sleepy! Press SPACE to wake up!";

  showMessage(difficultyMessage);
}

// Handle key press events
function handleKeyPress(event) {
  // Check if Space was pressed during attack
  if (event.code === 'Space' && attackMeterActive) {
    checkAttackSuccess();
  }
}

// Check if attack was successful
function checkAttackSuccess() {
  attackMeterActive = false;
  attackMeter.classList.add('hidden');

  if (attackIndicatorPosition >= attackZoneStart && attackIndicatorPosition <= attackZoneEnd) {
    // Success - increase difficulty for next time
    safePlaySound(wakeUpSound);
    updateDifficulty();

    // Show success message with difficulty progression
    const successMessage = difficultyLevel > 2
      ? `Perfect timing! You're getting better at staying awake! (Level ${difficultyLevel})`
      : "You shake your head and wake up a bit!";

    showMessage(successMessage);
  } else {
    // Fail
    failAttack();
  }
}

// Handle failed attack
function failAttack() {
  attackMeterActive = false;
  attackMeter.classList.add('hidden');

  // Reset difficulty on failure
  resetDifficulty();

  failedAttempts++;
  sleepiness += 20;
  sleepinessFill.style.width = `${sleepiness}%`;

  // Play the harsh sound for mistake
  safePlaySound(harshNoiseSound);

  // Add visual flash effect for mistake
  if (canvas) {
    canvas.classList.add('mistake-flash');
    setTimeout(() => {
      canvas.classList.remove('mistake-flash');
    }, 500);
  }

  // After a short pause, play the sleepiness sound
  setTimeout(() => {
    safePlaySound(sleepySound);
  }, 300);

  // Show failure message with difficulty reset notification
  const failMessage = successfulHits > 0
    ? "Your eyelids droop. +20% sleepiness. (Difficulty reset!)"
    : "Your eyelids droop. +20% sleepiness.";

  showMessage(failMessage);

  if (failedAttempts >= 3) {
    setTimeout(() => {
      safePlaySound(snoreSound);
    }, 600);
  }

  if (sleepiness >= 100) {
    gameOver = true;
    showGameOver();
  }
}

// Show a message
function showMessage(text) {
  gameMessage.textContent = text;
  gameMessage.classList.remove('hidden');

  setTimeout(() => {
    gameMessage.classList.add('hidden');
  }, 2000);
}

// Draw dialog bubble on canvas
function drawDialogBubble() {
  if (!ctx || !canvas) return;

  const bubbleX = 280;
  const bubbleY = 220;
  const bubbleWidth = 300;
  const bubbleHeight = 100;
  const bubbleRadius = 20;
  const arrowSize = 10;

  // Save context state
  ctx.save();

  // Draw bubble background
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;

  // Draw rounded rectangle for bubble
  ctx.beginPath();
  ctx.moveTo(bubbleX + bubbleRadius, bubbleY);
  ctx.lineTo(bubbleX + bubbleWidth - bubbleRadius, bubbleY);
  ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + bubbleRadius);
  ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - bubbleRadius);
  ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - bubbleRadius, bubbleY + bubbleHeight);
  ctx.lineTo(bubbleX + bubbleRadius, bubbleY + bubbleHeight);
  ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - bubbleRadius);
  ctx.lineTo(bubbleX, bubbleY + bubbleRadius);
  ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + bubbleRadius, bubbleY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw arrow pointing to teacher
  ctx.beginPath();
  ctx.moveTo(bubbleX, bubbleY + 30);
  ctx.lineTo(bubbleX - arrowSize * 2, bubbleY + 40);
  ctx.lineTo(bubbleX, bubbleY + 50);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw text
  ctx.fillStyle = 'black';
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';

  // Get current dialog text
  const text = dialogTexts[currentDialogIndex];

  // Word wrap text
  const words = text.split(' ');
  let line = '';
  let y = bubbleY + 30;
  const maxWidth = bubbleWidth - 30;
  const lineHeight = 20;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, bubbleX + 15, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, bubbleX + 15, y);

  // Restore context state
  ctx.restore();
}

// Game functions continue

// Enhanced start game function for three-stage system
function startGame() {
  console.log("Starting Phase 5 game from three-stage system");

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

  // Show game elements
  gameHeader.classList.remove('hidden');
  phase5Container.classList.remove('hidden');

  // Initialize canvas after elements are visible
  canvas = document.getElementById('classroom-canvas');
  if (canvas) {
    ctx = canvas.getContext('2d');

    // Initialize images
    initializeImages();

    // Ensure background music is playing
    if (!audioManager.getCurrentInfo()?.isPlaying) {
      audioManager.playBackgroundMusic();
    }

    // Reset game state
    resetGame();

    // Start game loop
    lastFrameTime = 0;
    requestAnimationFrame(gameLoop);
  } else {
    console.error('Canvas element not found!');
  }
}

// Reset game state
function resetGame() {
  gameTime = 30;
  sleepiness = 0;
  sleepinessFill.style.width = '0%';
  gameOver = false;
  gameWon = false;
  failedAttempts = 0;
  currentDialogIndex = 0;
  dialogChangeTimer = 0;
  sleepinessIncreaseTimer = 0;
  attackMeterActive = false;
  attackMeter.classList.add('hidden');

  // Reset difficulty progression
  resetDifficulty();

  // Remove visual effects
  if (canvas) {
    canvas.classList.remove('blur-light', 'blur-medium', 'blur-heavy', 'shake');
  }
}

// Show game over screen
function showGameOver() {
  console.log("💤 Game over - player fell asleep");

  // Pause background music using audioManager
  if (audioManager && audioManager.pauseBackgroundMusic) {
    audioManager.pauseBackgroundMusic();
  }

  // Show restart screen
  if (restartScreen) {
    restartScreen.classList.remove('hidden');
    console.log("✅ Restart screen displayed");
  } else {
    console.error("❌ Restart screen element not found");
  }
}

// Restart the game
function restartGame() {
  console.log("🔄 Restarting Phase 5 game");
  safePlaySound(uiClickSound);

  // Hide restart screen
  if (restartScreen) {
    restartScreen.classList.add('hidden');
  }

  // Reset game state
  resetGame();

  // Restart background music using audioManager
  if (audioManager && audioManager.playBackgroundMusic) {
    audioManager.playBackgroundMusic();
  }

  // Restart game loop
  lastFrameTime = 0;
  requestAnimationFrame(gameLoop);

  console.log("✅ Game restarted successfully");
}

// Complete the level
function completeLevel() {
  console.log("🎉 Level completed! Showing completion screen");

  // Pause background music using audioManager
  if (audioManager && audioManager.pauseBackgroundMusic) {
    audioManager.pauseBackgroundMusic();
  }

  // Play victory sound
  safePlaySound(victorySound);

  // Show completion screen
  if (completionScreen) {
    completionScreen.classList.remove('hidden');
    console.log("✅ Completion screen displayed");
  } else {
    console.error("❌ Completion screen element not found");
  }
}

// Go to next chapter
function goToNextChapter() {
  safePlaySound(uiClickSound);

  completionScreen.classList.add('hidden');
  loadingScreen.classList.remove('hidden');

  // ✅ COMPREHENSIVE AUDIO CLEANUP FOR PHASE 5 TO PHASE 6 TRANSITION
  console.log("🔇 Starting comprehensive audio cleanup for phase5 to phase6 transition");

  try {
    // Stop and cleanup audioManager background music
    if (window.audioManager) {
      if (typeof window.audioManager.stopBackgroundMusic === 'function') {
        window.audioManager.stopBackgroundMusic();
        console.log("✅ Stopped audioManager background music");
      }

      // Clear audioManager state completely
      if (typeof window.audioManager.clearState === 'function') {
        window.audioManager.clearState();
      }

      // Reset audioManager to ensure clean state
      window.audioManager.currentMusic = null;
      window.audioManager.isPlaying = false;
      console.log("✅ Cleared audioManager state");
    }

    // Stop all audio elements that might be playing
    document.querySelectorAll('audio').forEach(audio => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
        console.log("🔇 Stopped audio element:", audio.src);
      }
    });

    // Stop specific phase5 audio elements
    const phase5AudioElements = [
      uiClickSound, sleepySound, wakeUpSound, snoreSound,
      victorySound, harshNoiseSound
    ];

    phase5AudioElements.forEach(audio => {
      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    console.log("✅ All phase5 audio stopped and cleaned up");

  } catch (error) {
    console.warn("⚠️ Error during audio cleanup:", error);
  }

  // Start the loading bar animation
  const loadingBar = document.getElementById('loading-bar');
  let progress = 0;

  // Animation will last 5 seconds (50 steps * 100ms)
  const interval = setInterval(() => {
    progress += 2;
    loadingBar.style.width = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        console.log("🎵 Transitioning to phase6.html - goldenWind.mp3 should start automatically");
        window.location.href = 'phase6.html'; // Go to next phase
      }, 500);
    }
  }, 100);
}
