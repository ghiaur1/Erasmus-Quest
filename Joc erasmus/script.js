// Enhanced Erasmus Quest - Phase 1: Packing Your Dreams
// Three-stage introduction system with fullscreen alert implementation

// Global variables for fullscreen alert system
let fullscreenAlert;
let enableFullscreenBtn;
let continueAnywayBtn;

// Global variables for three-stage introduction system
let continueButton1;
let continueButton2;
let startButton;
let startScreenStage1;
let startScreenStage2;
let startScreenStage3;
let phase1;
let canvas;
let ctx;
let bagItems;
let luggageCounter;
let nextChapterScreen;
let gameMessage;

// Initialize variables after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements for fullscreen alert system
  fullscreenAlert = document.getElementById('fullscreen-alert');
  enableFullscreenBtn = document.getElementById('enable-fullscreen-btn');
  continueAnywayBtn = document.getElementById('continue-anyway-btn');

  // Get DOM elements for three-stage system
  continueButton1 = document.getElementById('continue-button-1');
  continueButton2 = document.getElementById('continue-button-2');
  startButton = document.getElementById('start-button');
  startScreenStage1 = document.getElementById('start-screen-stage1');
  startScreenStage2 = document.getElementById('start-screen-stage2');
  startScreenStage3 = document.getElementById('start-screen-stage3');
  phase1 = document.getElementById('phase-1');
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  bagItems = document.getElementById('bag-items');
  luggageCounter = document.getElementById('luggage-counter');
  gameMessage = document.getElementById('game-message');

  // Initialize fullscreen alert system with a small delay to ensure DOM is ready
  setTimeout(() => {
    initializeFullscreenAlert();
  }, 100);

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
      playMusicTrack(1); // Start background music
      startScreenStage3.classList.add('hidden');
      phase1.classList.remove('hidden');
      preloadImages();
      showMessage(gameMessage, "Welcome to your room! Collect all items to pack your luggage.", 4000);
      drawGame();
    });
  }

  // Add event listener for canvas clicks (for debugging)
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log(`Canvas clicked at: (${x}, ${y})`);
  });

  // Add event listeners for pixel-art buttons
  document.querySelectorAll('.pixel-art-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      safePlaySound(uiClickSound);
    });
  });

  // Add keyboard event listeners
  window.addEventListener('keydown', (e) => keys[e.key] = true);
  window.addEventListener('keyup', (e) => keys[e.key] = false);

  // Create and add next chapter screen
  nextChapterScreen = document.createElement('div');
  nextChapterScreen.id = 'next-chapter-screen';
  nextChapterScreen.classList.add('hidden');
  document.body.appendChild(nextChapterScreen);
});

// Fullscreen Alert System Functions
function initializeFullscreenAlert() {
  console.log("=== Initializing fullscreen alert system ===");

  // Debug: Check if DOM elements exist
  console.log("Fullscreen alert element:", fullscreenAlert);
  console.log("Enable fullscreen button:", enableFullscreenBtn);
  console.log("Continue anyway button:", continueAnywayBtn);
  console.log("Start screen stage 1:", startScreenStage1);

  // Check if user has already seen the fullscreen alert
  const hasSeenAlert = localStorage.getItem('erasmusQuestFullscreenAlertShown');
  console.log("localStorage flag 'erasmusQuestFullscreenAlertShown':", hasSeenAlert);

  if (!hasSeenAlert) {
    console.log("✅ First visit detected - showing fullscreen alert");
    showFullscreenAlert();
  } else {
    console.log("⚠️ User has seen alert before - proceeding to game");
    proceedToGame();
  }
}

function showFullscreenAlert() {
  console.log("=== Attempting to show fullscreen alert ===");

  if (fullscreenAlert) {
    console.log("✅ Fullscreen alert element found");

    // Hide all start screen stages initially
    if (startScreenStage1) {
      startScreenStage1.classList.add('hidden');
      console.log("✅ Hidden start screen stage 1");
    }
    if (startScreenStage2) {
      startScreenStage2.classList.add('hidden');
      console.log("✅ Hidden start screen stage 2");
    }
    if (startScreenStage3) {
      startScreenStage3.classList.add('hidden');
      console.log("✅ Hidden start screen stage 3");
    }

    // Show the fullscreen alert with fade-in animation
    console.log("Removing 'hidden' class from fullscreen alert");
    fullscreenAlert.classList.remove('hidden');
    console.log("Fullscreen alert classes after showing:", fullscreenAlert.className);

    // Add event listeners for fullscreen alert buttons
    if (enableFullscreenBtn) {
      enableFullscreenBtn.addEventListener('click', handleEnableFullscreen);
      console.log("✅ Added event listener to Enable Fullscreen button");
    } else {
      console.error("❌ Enable Fullscreen button not found!");
    }

    if (continueAnywayBtn) {
      continueAnywayBtn.addEventListener('click', handleContinueAnyway);
      console.log("✅ Added event listener to Continue Anyway button");
    } else {
      console.error("❌ Continue Anyway button not found!");
    }

    // Add keyboard navigation support
    document.addEventListener('keydown', handleFullscreenAlertKeyboard);
    console.log("✅ Added keyboard navigation support");

    console.log("=== Fullscreen alert should now be visible ===");
  } else {
    console.error("❌ Fullscreen alert element not found!");
  }
}

function handleEnableFullscreen() {
  console.log("User clicked Enable Fullscreen");
  safePlaySound(uiClickSound);

  // Attempt to enable fullscreen using the Fullscreen API
  requestFullscreen()
    .then(() => {
      console.log("Fullscreen enabled successfully");
      dismissFullscreenAlert();
    })
    .catch((error) => {
      console.warn("Fullscreen request failed:", error);
      // Show a helpful message if fullscreen fails
      showFullscreenFallbackMessage();
      // Still proceed to dismiss the alert after a delay
      setTimeout(() => {
        dismissFullscreenAlert();
      }, 3000);
    });
}

function handleContinueAnyway() {
  console.log("User clicked Continue Anyway");
  safePlaySound(uiClickSound);
  dismissFullscreenAlert();
}

function requestFullscreen() {
  return new Promise((resolve, reject) => {
    const element = document.documentElement;

    // Check for Fullscreen API support and try different vendor prefixes
    if (element.requestFullscreen) {
      element.requestFullscreen().then(resolve).catch(reject);
    } else if (element.mozRequestFullScreen) { // Firefox
      element.mozRequestFullScreen().then(resolve).catch(reject);
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari, Opera
      element.webkitRequestFullscreen().then(resolve).catch(reject);
    } else if (element.msRequestFullscreen) { // IE/Edge
      element.msRequestFullscreen().then(resolve).catch(reject);
    } else {
      reject(new Error("Fullscreen API not supported"));
    }
  });
}

function showFullscreenFallbackMessage() {
  // Update the alert content to show fallback instructions
  const alertContent = fullscreenAlert.querySelector('.fullscreen-alert-content');
  if (alertContent) {
    alertContent.innerHTML = `
      <h2>Fullscreen Instructions</h2>
      <p>Your browser blocked the automatic fullscreen request. You can still enable fullscreen manually:</p>
      <p style="color: #ffcc00; font-size: 0.8em;">
        • Press <strong>F11</strong> on your keyboard<br>
        • Or use your browser's fullscreen option (usually in the View menu)
      </p>
      <div class="fullscreen-alert-buttons">
        <button id="continue-after-instructions" class="pixel-art-btn fullscreen-btn">Got it!</button>
      </div>
    `;

    // Add event listener for the new button
    const continueBtn = document.getElementById('continue-after-instructions');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        safePlaySound(uiClickSound);
        dismissFullscreenAlert();
      });
    }
  }
}

function dismissFullscreenAlert() {
  console.log("Dismissing fullscreen alert");

  // Mark that user has seen the alert
  localStorage.setItem('erasmusQuestFullscreenAlertShown', 'true');

  // Remove keyboard event listener
  document.removeEventListener('keydown', handleFullscreenAlertKeyboard);

  // Hide the alert with fade-out animation
  if (fullscreenAlert) {
    fullscreenAlert.classList.add('hidden');
  }

  // Proceed to the game after a short delay
  setTimeout(() => {
    proceedToGame();
  }, 500);
}

function proceedToGame() {
  console.log("Proceeding to game - showing Stage 1");

  // Show Stage 1 of the introduction system
  if (startScreenStage1) {
    startScreenStage1.classList.remove('hidden');
  }
}

function handleFullscreenAlertKeyboard(event) {
  // Handle keyboard navigation for accessibility
  if (event.key === 'Escape') {
    handleContinueAnyway();
  } else if (event.key === 'Enter' || event.key === ' ') {
    // If focus is on Enable Fullscreen button, trigger it
    if (document.activeElement === enableFullscreenBtn) {
      event.preventDefault();
      handleEnableFullscreen();
    } else if (document.activeElement === continueAnywayBtn) {
      event.preventDefault();
      handleContinueAnyway();
    }
  }
}

// Developer utility functions for testing fullscreen alert
// Call these functions in browser console for debugging

// Reset the localStorage flag and refresh to see alert again
function resetFullscreenAlert() {
  localStorage.removeItem('erasmusQuestFullscreenAlertShown');
  console.log("✅ Fullscreen alert flag cleared. Refresh the page to see the alert again.");
}

// Force show the fullscreen alert (for testing)
function forceShowFullscreenAlert() {
  console.log("🔧 Force showing fullscreen alert for testing");
  showFullscreenAlert();
}

// Check current localStorage state
function checkFullscreenAlertState() {
  const flag = localStorage.getItem('erasmusQuestFullscreenAlertShown');
  console.log("Current localStorage flag:", flag);
  console.log("Alert element exists:", !!fullscreenAlert);
  console.log("Alert element classes:", fullscreenAlert ? fullscreenAlert.className : "N/A");
}

// Complete debugging info
function debugFullscreenAlert() {
  console.log("=== FULLSCREEN ALERT DEBUG INFO ===");
  console.log("localStorage flag:", localStorage.getItem('erasmusQuestFullscreenAlertShown'));
  console.log("fullscreenAlert element:", fullscreenAlert);
  console.log("enableFullscreenBtn element:", enableFullscreenBtn);
  console.log("continueAnywayBtn element:", continueAnywayBtn);
  console.log("startScreenStage1 element:", startScreenStage1);

  if (fullscreenAlert) {
    console.log("Alert classes:", fullscreenAlert.className);
    console.log("Alert computed style display:", getComputedStyle(fullscreenAlert).display);
    console.log("Alert computed style opacity:", getComputedStyle(fullscreenAlert).opacity);
  }
}

// Enhanced transition functions for three-stage introduction system
function transitionToStage2() {
  console.log("Phase 1: Transitioning from Stage 1 to Stage 2");

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
  console.log("Phase 1: Transitioning from Stage 2 to Stage 3");

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

// Audio setup with enhanced audio management system
const uiClickSound = new Audio('Sounds/Effects/ui-click.wav');
const collectSound = new Audio('Sounds/Effects/collect.mp3');
const completeSound = new Audio('Sounds/Effects/complete.mp3');

// Set sound effect volumes
uiClickSound.volume = 0.3;
collectSound.volume = 0.4;
completeSound.volume = 0.5;

// Initialize background music with audio manager
document.addEventListener('DOMContentLoaded', () => {
  // Set up background music for Phase 1
  audioManager.setBackgroundMusic('Sounds/Music/song1.wav');
  console.log('🎵 Phase 1 audio initialized');
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





// nextChapterScreen este acum creat în DOMContentLoaded

// Event listener pentru canvas este acum în DOMContentLoaded

let player = { x: 577, y: 130, width: 80, height: 120 };
const playerSpeed = 10;
let animationFrame = 0;
let flipped = false;

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


///moving mechanics
function movePlayer() {
    let moved = false;

    if (keys['ArrowUp'] || keys['w']) {
        if (player.y > 0) {
            player.y -= playerSpeed;
            currentPlayerImage = playerImages.up[Math.floor(animationFrame / 10) % 2];
            flipped = false;
            moved = true;
        }
    }

    if (keys['ArrowLeft'] || keys['a']) {
        if (player.x > 0) {
            player.x -= playerSpeed;
            currentPlayerImage = playerImages.left[Math.floor(animationFrame / 10) % 2];
            flipped = false;
            moved = true;
        }
    }

    if (keys['ArrowRight'] || keys['d']) {
        if (player.x < canvas.width - player.width) {
            player.x += playerSpeed;
            currentPlayerImage = playerImages.right[Math.floor(animationFrame / 10) % 2];
            flipped = true;
            moved = true;
        }
    }

    if (keys['ArrowDown'] || keys['s']) {
        if (player.y < canvas.height - player.height) {
            player.y += playerSpeed;
            currentPlayerImage = playerImages.down[Math.floor(animationFrame / 10) % 2];
            flipped = false;
            moved = true;
        }
    }

    if (!moved) {
        currentPlayerImage = playerImages.down[0];
        flipped = false;
    }

    animationFrame++;
}
function drawPlayer() {
    ctx.drawImage(currentPlayerImage, player.x, player.y, player.width, player.height);
}


function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movePlayer();
    animationFrame++;

    if (flipped) {
        ctx.save();
        ctx.translate(player.x + player.width, player.y);
        ctx.scale(-1, 1);
        ctx.drawImage(currentPlayerImage, 0, 0, player.width, player.height);
        ctx.restore();
    } else {
        ctx.drawImage(currentPlayerImage, player.x, player.y, player.width, player.height);
    }

    objects.forEach((obj, index) => {
        const image = images[obj.imageSrc];
        if (image) {
            ctx.drawImage(image, obj.x, obj.y, obj.width, obj.height);
        }

if (isColliding(player, obj)) {
    safePlaySound(collectSound);
    addToBag(obj.name, obj.description);
    objects.splice(index, 1);
    checkAllObjectsCollected();
}
    });


    if (allCollected && Date.now() - collectionCompleteTime > 4000) {
        showNextChapterScreen();
        allCollected = false; // prevenim reapelarea
    }

    requestAnimationFrame(drawGame);
}






// Enhanced Erasmus essentials with better descriptions
let objects = [
    { x: 130, y: 95, width: 100, height: 100, name: "💻 Laptop", description: "Essential for studies and staying connected", imageSrc: "Image/Obiecte/laptop.png" },
    { x: 300, y: 150, width: 70, height: 80, name: "🍉 Snacks", description: "Energy for the journey ahead", imageSrc: "Image/Obiecte/pepene.png" },
    { x: 500, y: 250, width: 30, height: 40, name: "☕ Coffee", description: "Fuel for late-night study sessions", imageSrc: "Image/Obiecte/cafea.png" },
    { x: 368, y: 100, width: 70, height: 80, name: "📚 Study Materials", description: "Books and notes for your courses", imageSrc: "Image/Obiecte/carti.png" },
    { x: 150, y: 330, width: 70, height: 80, name: "👕 Clean Clothes", description: "Fresh outfits for your adventure", imageSrc: "Image/Obiecte/haine.png" }
];

let bag = [];
const keys = {};
const images = {};
let allCollected = false;
let collectionCompleteTime = null;

function preloadImages() {
    objects.forEach(obj => {
        const img = new Image();
        img.src = obj.imageSrc;
        images[obj.imageSrc] = img;
    });
}


// Event listener pentru butonul de start este acum în DOMContentLoaded




// Event listeners pentru tastatură sunt acum în DOMContentLoaded

function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function addToBag(itemName, description) {
    if (bag.length < 5) {
        bag.push(itemName);
        const li = document.createElement('li');
        li.textContent = itemName;
        li.title = description; // Add tooltip with description
        bagItems.appendChild(li);
        updateLuggageCounter();

        // Show collection message
        showMessage(gameMessage, `Collected: ${itemName}`, 2000);

        // Create particle effect at collection point
        if (typeof createParticles === 'function' && ctx) {
            createParticles(ctx, [], player.x + player.width/2, player.y + player.height/2,
                10, '#00ff00', {min: 2, max: 5}, {min: 2, max: 4}, {min: 30, max: 60});
        }
    } else {
        showMessage(gameMessage, 'Your luggage is full!', 2000);
    }
}
function updateLuggageCounter() {
    if (luggageCounter) {
        luggageCounter.textContent = `${bag.length}/5`;
    }
}

// ... (codul tău de la început rămâne neschimbat până la funcția checkAllObjectsCollected)

function checkAllObjectsCollected() {
    if (objects.length === 0 && !allCollected) {
        allCollected = true;
        collectionCompleteTime = Date.now();
        safePlaySound(completeSound);
        showMessage(gameMessage, "🎉 Excellent! Your luggage is packed and ready for the Erasmus adventure!", 4000);
        console.log('All items collected - preparing for next chapter');
    }
}




// Show Next Chapter screen after collecting all items
function showNextChapterScreen() {
    nextChapterScreen.innerHTML = `
        <div class="completion-content">
            <h1 style="color:#ffcc00; text-shadow: 0 0 15px #ffcc00;">Chapter 1 Complete!</h1>
            <p style="color:#00ffff; margin: 20px 0; font-size: 1em;">
                🎒 Your luggage is packed with all the Erasmus essentials!<br><br>
                📍 Next destination: The bus station<br>
                🚌 Time to catch your ride to the airport!
            </p>
            <button id="next-chapter-btn" class="pixel-art-btn">Continue to Chapter 2</button>
        </div>
    `;
    nextChapterScreen.classList.remove('hidden');

    const btn = document.getElementById('next-chapter-btn');
    if(btn) {
        btn.addEventListener('click', () => {
            safePlaySound(uiClickSound);
            startNextChapter();
        });
    }
}
// Loading screen and transition to chapter 2
function startNextChapter() {
    nextChapterScreen.classList.add('hidden');

    // Save current music state before transitioning
    audioManager.saveCurrentState();

    // Create enhanced loading screen
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.innerHTML = `
        <h1 style="color:#ffcc00; text-shadow: 0 0 15px #ffcc00;">Preparing for Your Journey...</h1>
        <p style="color:#00ffff; margin: 20px 0;">🚌 Heading to the bus station</p>
        <div id="loading-bar-container">
            <div id="loading-bar"></div>
        </div>
        <p style="color:#00ff00; margin-top: 20px; font-size: 0.8em;">Loading Chapter 2...</p>
    `;

    // Apply loading screen styles
    Object.assign(loadingScreen.style, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        background: 'rgba(0,0,0,0.95)',
        zIndex: '9999',
        fontFamily: "'Press Start 2P', cursive"
    });

    document.body.appendChild(loadingScreen);

    const loadingBar = loadingScreen.querySelector('#loading-bar');
    let progress = 0;

    // 5-second loading animation
    const interval = setInterval(() => {
        progress += 2;
        loadingBar.style.width = `${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                window.location.href = "phase2.html";
            }, 300);
        }
    }, 100);
}
