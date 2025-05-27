/**
 * Common JavaScript functions and classes for all phases of Erasmus Quest
 */

// Particle system
class Particle {
  constructor(x, y, color, size, speedX, speedY, life, gravity = 0, fadeRate = 0.02) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.initialSize = size;
    this.speedX = speedX;
    this.speedY = speedY;
    this.life = life;
    this.gravity = gravity;
    this.fadeRate = fadeRate;
    this.alpha = 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity;
    this.life--;
    this.alpha -= this.fadeRate;
    this.size = Math.max(0, this.size - (this.initialSize / this.life));
    return this.life > 0 && this.alpha > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Function to create particles
function createParticles(ctx, particles, x, y, count, color, size, speedRange, life, gravity = 0, fadeRate = 0.02) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = speedRange.min + Math.random() * (speedRange.max - speedRange.min);
    const speedX = Math.cos(angle) * speed;
    const speedY = Math.sin(angle) * speed;
    const particleSize = size.min + Math.random() * (size.max - size.min);
    const particleLife = life.min + Math.random() * (life.max - life.min);

    particles.push(new Particle(
      x, y, color, particleSize, speedX, speedY, particleLife, gravity, fadeRate
    ));
  }
}

// Function to update and draw particles
function updateAndDrawParticles(ctx, particles) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const isAlive = particles[i].update();
    if (!isAlive) {
      particles.splice(i, 1);
    } else {
      particles[i].draw(ctx);
    }
  }
}

/**
 * Comprehensive Audio Management System for Erasmus Quest
 * Features: Continuous background music, audio ducking, persistence across phases
 */
class AudioManager {
  constructor() {
    this.backgroundMusic = null;
    this.currentTrack = null;
    this.normalVolume = 0.7; // 70% normal volume
    this.duckedVolume = 0.35; // 35% ducked volume
    this.fadeDuration = 250; // 250ms fade transitions
    this.isInitialized = false;
    this.isDucked = false;
    this.activeSoundEffects = new Set();
    this.fadeInterval = null;

    // Initialize on first user interaction
    this.initializeOnUserGesture();
  }

  // Initialize audio context on first user interaction (required by browsers)
  initializeOnUserGesture() {
    const initAudio = () => {
      if (!this.isInitialized) {
        this.isInitialized = true;
        this.loadPersistedState();
        console.log('🎵 AudioManager initialized');
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
      }
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
  }

  // Load persisted audio state from localStorage
  loadPersistedState() {
    try {
      const savedState = localStorage.getItem('erasmusQuestAudio');
      if (savedState) {
        const state = JSON.parse(savedState);
        if (state.currentTrack && state.currentTime !== undefined) {
          this.resumeBackgroundMusic(state.currentTrack, state.currentTime, state.volume || this.normalVolume);
        }
      }
    } catch (e) {
      console.warn('Could not load persisted audio state:', e);
    }
  }

  // Save current audio state to localStorage
  saveCurrentState() {
    if (this.backgroundMusic && this.currentTrack) {
      try {
        const state = {
          currentTrack: this.currentTrack,
          currentTime: this.backgroundMusic.currentTime,
          volume: this.backgroundMusic.volume
        };
        localStorage.setItem('erasmusQuestAudio', JSON.stringify(state));
      } catch (e) {
        console.warn('Could not save audio state:', e);
      }
    }
  }

  // Set background music track
  setBackgroundMusic(audioPath, loop = true) {
    // Save current state before switching
    if (this.backgroundMusic) {
      this.saveCurrentState();
      this.backgroundMusic.pause();
    }

    this.currentTrack = audioPath;
    this.backgroundMusic = new Audio(audioPath);
    this.backgroundMusic.loop = loop;
    this.backgroundMusic.volume = this.normalVolume;

    // Add event listeners
    this.backgroundMusic.addEventListener('loadeddata', () => {
      console.log(`🎵 Background music loaded: ${audioPath}`);
    });

    this.backgroundMusic.addEventListener('error', (e) => {
      console.error(`❌ Error loading background music: ${audioPath}`, e);
    });

    return this.backgroundMusic;
  }

  // Resume background music from saved position
  resumeBackgroundMusic(audioPath, startTime = 0, volume = this.normalVolume) {
    this.setBackgroundMusic(audioPath);
    this.backgroundMusic.currentTime = startTime;
    this.backgroundMusic.volume = volume;
    this.playBackgroundMusic();
  }

  // Play background music
  playBackgroundMusic() {
    if (this.backgroundMusic && this.isInitialized) {
      const playPromise = this.backgroundMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('🎵 Background music playing');
          })
          .catch(e => {
            console.warn('Background music autoplay blocked:', e);
            this.showPlayButton();
          });
      }
    }
  }

  // Show play button when autoplay is blocked
  showPlayButton() {
    // Create or show existing play button
    let playButton = document.getElementById('audio-play-button');
    if (!playButton) {
      playButton = document.createElement('button');
      playButton.id = 'audio-play-button';
      playButton.textContent = '🎵 Enable Audio';
      playButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 10px 15px;
        background: #00ff00;
        color: #000;
        border: none;
        border-radius: 5px;
        font-family: 'Press Start 2P', cursive;
        font-size: 0.8em;
        cursor: pointer;
        box-shadow: 0 0 10px #00ff00;
      `;
      document.body.appendChild(playButton);
    }

    playButton.style.display = 'block';
    playButton.onclick = () => {
      this.playBackgroundMusic();
      playButton.style.display = 'none';
    };
  }

  // Smooth volume fade
  fadeVolume(targetVolume, duration = this.fadeDuration) {
    if (!this.backgroundMusic) return;

    const startVolume = this.backgroundMusic.volume;
    const volumeDiff = targetVolume - startVolume;
    const steps = Math.max(10, duration / 16); // ~60fps
    const stepSize = volumeDiff / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    this.fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = startVolume + (stepSize * currentStep);

      if (currentStep >= steps) {
        this.backgroundMusic.volume = targetVolume;
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      } else {
        this.backgroundMusic.volume = Math.max(0, Math.min(1, newVolume));
      }
    }, stepDuration);
  }

  // Duck audio (reduce volume for sound effects)
  duckAudio() {
    if (!this.isDucked && this.backgroundMusic) {
      this.isDucked = true;
      this.fadeVolume(this.duckedVolume);
    }
  }

  // Restore audio (return to normal volume)
  restoreAudio() {
    if (this.isDucked && this.backgroundMusic) {
      this.isDucked = false;
      this.fadeVolume(this.normalVolume);
    }
  }

  // Enhanced sound effect playing with auto-ducking
  playSoundEffect(sound, autoDuck = true) {
    if (!sound) return;

    try {
      // Duck background music if enabled
      if (autoDuck) {
        this.duckAudio();
        this.activeSoundEffects.add(sound);
      }

      // Reset sound to beginning
      if (sound.readyState >= 2) {
        sound.currentTime = 0;
      }

      // Play sound
      const playPromise = sound.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Set up event listener to restore audio when sound ends
            if (autoDuck) {
              const onSoundEnd = () => {
                this.activeSoundEffects.delete(sound);
                if (this.activeSoundEffects.size === 0) {
                  // Delay restoration slightly to avoid rapid volume changes
                  setTimeout(() => {
                    if (this.activeSoundEffects.size === 0) {
                      this.restoreAudio();
                    }
                  }, 100);
                }
                sound.removeEventListener('ended', onSoundEnd);
              };
              sound.addEventListener('ended', onSoundEnd);
            }
          })
          .catch(e => console.error('Error playing sound effect:', e));
      }
    } catch (e) {
      console.error('Error in playSoundEffect:', e);
      if (autoDuck) {
        this.activeSoundEffects.delete(sound);
      }
    }
  }

  // Pause background music (for transitions)
  pauseBackgroundMusic() {
    if (this.backgroundMusic) {
      this.saveCurrentState();
      this.backgroundMusic.pause();
    }
  }

  // Stop background music completely
  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.currentTrack = null;
      localStorage.removeItem('erasmusQuestAudio');
    }
  }

  // Get current playback info
  getCurrentInfo() {
    if (this.backgroundMusic && this.currentTrack) {
      return {
        track: this.currentTrack,
        currentTime: this.backgroundMusic.currentTime,
        duration: this.backgroundMusic.duration,
        volume: this.backgroundMusic.volume,
        isPlaying: !this.backgroundMusic.paused
      };
    }
    return null;
  }
}

// Create global audio manager instance
window.audioManager = new AudioManager();

// Legacy function for backward compatibility
function safePlaySound(sound) {
  window.audioManager.playSoundEffect(sound, true);
}

// Function to show a message
function showMessage(messageElement, text, duration = 3000) {
  if (!messageElement) return;

  messageElement.textContent = text;
  messageElement.classList.remove('hidden');

  setTimeout(() => {
    messageElement.classList.add('hidden');
  }, duration);
}

// Function to create a loading screen transition
function showLoadingScreen(loadingScreenElement, nextPage, duration = 3000) {
  if (!loadingScreenElement) return;

  // Show loading screen
  loadingScreenElement.classList.remove('hidden');

  // Get loading bar element
  const loadingBar = document.getElementById('loading-bar');
  if (loadingBar) {
    // Animate loading bar
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      loadingBar.style.width = `${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        // Navigate to next page
        setTimeout(() => {
          window.location.href = nextPage;
        }, 500);
      }
    }, duration / 100);
  } else {
    // If loading bar not found, just wait and redirect
    setTimeout(() => {
      window.location.href = nextPage;
    }, duration);
  }
}

// Function to add screen shake effect
function screenShake(canvas, intensity = 5, duration = 500) {
  if (!canvas) return;

  const originalPosition = {
    x: canvas.style.transform ? parseInt(canvas.style.transform.replace(/[^\d-]/g, '')) || 0 : 0,
    y: canvas.style.transform ? parseInt(canvas.style.transform.replace(/[^\d-]/g, '')) || 0 : 0
  };

  let startTime = Date.now();
  let elapsed = 0;

  function shake() {
    elapsed = Date.now() - startTime;

    if (elapsed < duration) {
      const diminishingFactor = 1 - (elapsed / duration);
      const shakeX = (Math.random() * 2 - 1) * intensity * diminishingFactor;
      const shakeY = (Math.random() * 2 - 1) * intensity * diminishingFactor;

      canvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;

      requestAnimationFrame(shake);
    } else {
      // Reset to original position
      canvas.style.transform = `translate(${originalPosition.x}px, ${originalPosition.y}px)`;
    }
  }

  shake();
}

// Export functions and classes
window.Particle = Particle;
window.createParticles = createParticles;
window.updateAndDrawParticles = updateAndDrawParticles;
window.safePlaySound = safePlaySound;
window.showMessage = showMessage;
window.showLoadingScreen = showLoadingScreen;
window.screenShake = screenShake;
window.AudioManager = AudioManager;
