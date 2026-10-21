/**
 * Farm Book Sounds & Farm Runner Mini-Game
 * Author: miladnosrati1
 * Repo: farm-book-sounds
 */

// Comprehensive animal data with Persian sounds, habitats & kid-friendly actions
const FALLBACK_ANIMALS = [
  {
    id: "hen",
    name: "مرغ",
    emoji: "🐔",
    audio: "audio/hen.mp3",
    sound_text: "قُد قُد قُدا!",
    habitat: "مرغ‌دانی و لانه کاه",
    action_hint: "در حال دانه خوردن 🌾"
  },
  {
    id: "cow",
    name: "گاو",
    emoji: "🐄",
    audio: "audio/cow.mp3",
    sound_text: "ماااااا!",
    habitat: "چمن‌زار سرسبز",
    action_hint: "در حال چریدن علف 🍀"
  },
  {
    id: "sheep",
    name: "گوسفند",
    emoji: "🐑",
    audio: "audio/sheep.mp3",
    sound_text: "بَععععع!",
    habitat: "تپه علفی نرم",
    action_hint: "در حال دویدن در دشت 🌼"
  },
  {
    id: "goose",
    name: "غاز",
    emoji: "🪿",
    audio: "audio/goose.mp3",
    sound_text: "غا غا غار!",
    habitat: "کنار برکه آب",
    action_hint: "در حال بال زدن 💧"
  },
  {
    id: "duck",
    name: "اردک",
    emoji: "🦆",
    audio: "audio/duck.mp3",
    sound_text: "کواک کواک!",
    habitat: "داخل برکه نیلوفر",
    action_hint: "در حال شنا روی آب 🪷"
  },
  {
    id: "donkey",
    name: "الاغ",
    emoji: "🫏",
    audio: "audio/donkey.mp3",
    sound_text: "عَررر عَررر!",
    habitat: "کنار آسیاب و گاری کاه",
    action_hint: "در حال خوردن یونجه 🧺"
  },
  {
    id: "dog",
    name: "سگ گله",
    emoji: "🐕",
    audio: "audio/dog.mp3",
    sound_text: "هاپ هاپ!",
    habitat: "درگاه چوبی مزرعه",
    action_hint: "در حال نگهبانی مزرعه 🪵"
  },
  {
    id: "horse",
    name: "اسب",
    emoji: "🐎",
    audio: "audio/horse.mp3",
    sound_text: "هیهااااء!",
    habitat: "محوطه اصطبل و نرده‌ها",
    action_hint: "در حال تاختن شاد 🏇"
  },
  {
    id: "goat",
    name: "بز",
    emoji: "🐐",
    audio: "audio/goat.mp3",
    sound_text: "مَععععع!",
    habitat: "صخره سنگی کوچک",
    action_hint: "در حال پریدن روی سنگ‌ها 🪨"
  }
];

let animals = [...FALLBACK_ANIMALS];
let currentAnimal = null;
let isAudioPlaying = false;

// DOM Elements - Player Card
const playerCard = document.getElementById('player-card');
const avatarContainer = document.getElementById('avatar-container');
const activeEmoji = document.getElementById('active-emoji');
const activeName = document.getElementById('active-name');
const activeSoundText = document.getElementById('active-sound-text');
const activeTag = document.getElementById('active-tag');
const activeHabitatTag = document.getElementById('active-habitat-tag');
const calloutText = document.getElementById('callout-text');
const btnStartGame = document.getElementById('btn-start-game');

const btnPlayPause = document.getElementById('btn-play-pause');
const playIcon = document.getElementById('play-icon');
const playText = document.getElementById('play-text');
const btnReplay = document.getElementById('btn-replay');
const btnVolume = document.getElementById('btn-volume');
const volumeIcon = document.getElementById('volume-icon');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const directAudioLink = document.getElementById('direct-audio-link');
const autoplayBanner = document.getElementById('autoplay-banner');
const mainAudio = document.getElementById('main-audio');

// DOM Elements - Farm Scene & Tabs
const tabFarmView = document.getElementById('tab-farm-view');
const tabGridView = document.getElementById('tab-grid-view');
const farmView = document.getElementById('farm-view');
const gridView = document.getElementById('grid-view');

// ==========================================================================
// APPLICATION INITIALIZATION
// ==========================================================================
async function initApp() {
  try {
    const res = await fetch('data/animals.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        animals = data;
      }
    }
  } catch (e) {
    console.info("Using embedded animal dataset:", e.message);
  }

  setupFarmHabitats();
  renderAnimalsGrid();
  setupEventListeners();
  initFarmRunnerGame();

  // Route URL parameter (?s=hen) from scanned QR code
  const targetId = getUrlAnimalId();
  selectAnimal(targetId, true);
}

// Extract animal ID from query param (?s=hen or ?id=hen or #hen)
function getUrlAnimalId() {
  const params = new URLSearchParams(window.location.search);
  const s = params.get('s') || params.get('id');
  if (s) return s.toLowerCase().trim();

  if (window.location.hash) {
    const hash = window.location.hash.replace('#', '').toLowerCase().trim();
    if (hash) return hash;
  }
  return 'hen';
}

// Setup click and keyboard handlers on the Interactive Farm Habitats
function setupFarmHabitats() {
  const habitats = document.querySelectorAll('.farm-habitat');
  habitats.forEach(habitat => {
    const animalId = habitat.getAttribute('data-animal-id');
    
    habitat.addEventListener('click', () => {
      selectAnimal(animalId, false);
      playAudio();
      triggerMiniConfetti();
    });

    habitat.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectAnimal(animalId, false);
        playAudio();
      }
    });
  });
}

// Render fallback / alternative simple grid
function renderAnimalsGrid() {
  gridView.innerHTML = '';
  animals.forEach(animal => {
    const card = document.createElement('div');
    card.className = `animal-card card-${animal.id}`;
    card.id = `grid-card-${animal.id}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `انتخاب صدای ${animal.name}`);

    card.innerHTML = `
      <div class="card-emoji">${animal.emoji}</div>
      <div class="card-title">${animal.name}</div>
      <span class="card-play-badge">پخش صدا</span>
    `;

    card.addEventListener('click', () => {
      selectAnimal(animal.id, false);
      playAudio();
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectAnimal(animal.id, false);
        playAudio();
      }
    });

    gridView.appendChild(card);
  });
}

// Select an animal: Updates Player, Spotlights Farm Habitat, Sets Game Mascot
function selectAnimal(animalId, isInitialLoad = false) {
  const found = animals.find(a => a.id.toLowerCase() === animalId.toLowerCase()) || animals[0];
  currentAnimal = found;

  // 1. Update Active Player Card
  activeEmoji.textContent = found.emoji;
  activeName.textContent = found.name;
  if (activeSoundText) {
    activeSoundText.textContent = found.sound_text || `${found.name}!`;
  }
  activeTag.textContent = `شناسه: ${found.id} • صدای طبیعی`;
  if (activeHabitatTag) {
    activeHabitatTag.textContent = `🏡 ${found.habitat || 'مزرعه'}`;
  }
  if (calloutText) {
    calloutText.textContent = `روی عکسم بزن تا با ${found.name} بازی کنی!`;
  }
  document.title = `صدای ${found.name} ${found.emoji} | کتاب کودک`;

  // 2. Update Direct Audio Download Link
  directAudioLink.href = found.audio;
  directAudioLink.setAttribute('download', `${found.id}-sound.mp3`);

  // 3. Spotlight the Animal in the Interactive Farm Scene
  document.querySelectorAll('.farm-habitat').forEach(h => h.classList.remove('is-active-habitat'));
  const targetHabitat = document.getElementById(`farm-animal-${found.id}`);
  if (targetHabitat) {
    targetHabitat.classList.add('is-active-habitat');
    // Gently scroll farm container to bring animal into center view on mobile
    if (farmView) {
      const habitatLeft = targetHabitat.offsetLeft;
      const containerWidth = farmView.clientWidth;
      farmView.scrollTo({
        left: habitatLeft - (containerWidth / 2) + 40,
        behavior: 'smooth'
      });
    }
  }

  // 4. Update Grid View highlight
  document.querySelectorAll('.animal-card').forEach(c => c.classList.remove('is-selected'));
  const activeGridCard = document.getElementById(`grid-card-${found.id}`);
  if (activeGridCard) {
    activeGridCard.classList.add('is-selected');
  }

  // 5. Update Audio Source
  mainAudio.src = found.audio;
  mainAudio.currentTime = 0;
  progressBar.style.width = '0%';
  currentTimeEl.textContent = '00:00';
  totalDurationEl.textContent = '--:--';
  updatePlayingState(false);

  // 6. Update URL query string without page reload
  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.get('s') !== found.id) {
    currentUrl.searchParams.set('s', found.id);
    window.history.pushState({ animalId: found.id }, '', currentUrl.toString());
  }

  // 7. If initial scan from QR code, attempt autoplay
  if (isInitialLoad) {
    attemptAutoplay();
  }
}

// Attempt Autoplay (with graceful fallback if browser blocks it)
function attemptAutoplay() {
  const playPromise = mainAudio.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      updatePlayingState(true);
      autoplayBanner.classList.add('hidden');
    }).catch(() => {
      // Browser blocked autoplay without user gesture:
      updatePlayingState(false);
      autoplayBanner.classList.remove('hidden');
    });
  }
}

// Play Audio
function playAudio() {
  autoplayBanner.classList.add('hidden');
  mainAudio.play().then(() => {
    updatePlayingState(true);
  }).catch((err) => {
    console.warn("Play failed:", err);
    updatePlayingState(false);
  });
}

// Pause Audio
function pauseAudio() {
  mainAudio.pause();
  updatePlayingState(false);
}

// Toggle Play/Pause
function togglePlayPause() {
  if (mainAudio.paused) {
    playAudio();
  } else {
    pauseAudio();
  }
}

// Update UI Buttons & States
function updatePlayingState(playing) {
  isAudioPlaying = playing;
  if (playing) {
    playerCard.classList.add('is-playing');
    playIcon.textContent = '⏸️';
    playText.textContent = 'توقف صدا';
    activeTag.textContent = 'در حال پخش... 🎶';
  } else {
    playerCard.classList.remove('is-playing');
    playIcon.textContent = '▶️';
    playText.textContent = 'پخش صدا';
    if (currentAnimal) {
      activeTag.textContent = `شناسه: ${currentAnimal.id} • آماده پخش`;
    }
  }
}

// Setup Event Listeners
function setupEventListeners() {
  btnPlayPause.addEventListener('click', togglePlayPause);

  btnReplay.addEventListener('click', () => {
    mainAudio.currentTime = 0;
    playAudio();
    triggerMiniConfetti();
  });

  btnVolume.addEventListener('click', () => {
    mainAudio.muted = !mainAudio.muted;
    volumeIcon.textContent = mainAudio.muted ? '🔇' : '🔊';
  });

  // Audio lifecycle events
  mainAudio.addEventListener('timeupdate', () => {
    if (!isNaN(mainAudio.duration) && mainAudio.duration > 0) {
      const pct = (mainAudio.currentTime / mainAudio.duration) * 100;
      progressBar.style.width = `${pct}%`;
      currentTimeEl.textContent = formatTime(mainAudio.currentTime);
      totalDurationEl.textContent = formatTime(mainAudio.duration);
    }
  });

  mainAudio.addEventListener('loadedmetadata', () => {
    if (!isNaN(mainAudio.duration)) {
      totalDurationEl.textContent = formatTime(mainAudio.duration);
    }
  });

  mainAudio.addEventListener('ended', () => {
    updatePlayingState(false);
    progressBar.style.width = '100%';
    triggerConfetti();
  });

  mainAudio.addEventListener('error', () => {
    console.error("Audio error loading:", mainAudio.src);
    activeTag.textContent = 'خطا در بارگذاری فایل صوتی';
    updatePlayingState(false);
  });

  // Seek bar click
  progressContainer.addEventListener('click', (e) => {
    if (mainAudio.duration) {
      const rect = progressContainer.getBoundingClientRect();
      const clickPos = (e.clientX - rect.left) / rect.width;
      // In RTL, flip horizontal direction
      const seekRatio = 1 - clickPos;
      mainAudio.currentTime = seekRatio * mainAudio.duration;
    }
  });

  // View switch tabs (Farm Landscape vs Simple Grid)
  tabFarmView.addEventListener('click', () => {
    tabFarmView.classList.add('active');
    tabGridView.classList.remove('active');
    farmView.classList.remove('hidden');
    gridView.classList.add('hidden');
  });

  tabGridView.addEventListener('click', () => {
    tabGridView.classList.add('active');
    tabFarmView.classList.remove('active');
    gridView.classList.remove('hidden');
    farmView.classList.add('hidden');
  });

  // Launch Game on Avatar Click or Callout Button Click!
  avatarContainer.addEventListener('click', openFarmRunnerGame);
  avatarContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFarmRunnerGame();
    }
  });

  btnStartGame.addEventListener('click', openFarmRunnerGame);

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    const id = (e.state && e.state.animalId) || getUrlAnimalId();
    selectAnimal(id, false);
  });
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ==========================================================================
// JOYFUL WEB AUDIO SYNTHESIZER (Pure Web Audio API - Zero External Files)
// ==========================================================================
let audioCtx = null;
let isGameAudioMuted = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Kid-Friendly Sound Effects
function playSfxJump() {
  if (isGameAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.16);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  } catch (e) {}
}

function playSfxStar() {
  if (isGameAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [659, 880, 1046].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.05;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.2, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.14);
    });
  } catch (e) {}
}

function playSfxBump() {
  if (isGameAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.22);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch (e) {}
}

function playSfxFanfare() {
  if (isGameAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.1;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.22, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.25);
    });
  } catch (e) {}
}

// ==========================================================================
// FARM RUNNER MINI-GAME ENGINE (Google Dino Style)
// ==========================================================================
const gameModal = document.getElementById('game-modal');
const gameCanvas = document.getElementById('game-canvas');
const gamePlayerEmoji = document.getElementById('game-player-emoji');
const gamePlayerName = document.getElementById('game-player-name');
const gameScoreEl = document.getElementById('game-score');
const gameHighScoreEl = document.getElementById('game-high-score');
const btnGameSound = document.getElementById('btn-game-sound');
const btnCloseGame = document.getElementById('btn-close-game');
const btnTouchJump = document.getElementById('btn-touch-jump');

const gameStartScreen = document.getElementById('game-start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startScreenEmoji = document.getElementById('start-screen-emoji');
const finalScoreEl = document.getElementById('final-score');
const gameEncouragement = document.getElementById('game-encouragement');
const btnPlayGame = document.getElementById('btn-play-game');
const btnRestartGame = document.getElementById('btn-restart-game');
const btnExitToFarm = document.getElementById('btn-exit-to-farm');

let gameCtx = null;
let gameRunning = false;
let gameAnimId = null;
let gameScore = 0;
let gameHighScore = 0;
let gameSpeed = 4.8;
let gameFrame = 0;

// Player Physics
const player = {
  x: 90,
  y: 0,
  w: 48,
  h: 52,
  vy: 0,
  gravity: 0.72,
  jumpStrength: -13.8,
  isGrounded: true,
  runBob: 0
};

// Ground, Obstacles & Stars
const groundY = 250;
let obstacles = [];
let stars = [];
let sceneryClouds = [];
let sceneryFences = [];

// Available Farm Obstacles (Fences, Hay, Bushes, Rocks)
const OBSTACLE_TYPES = [
  { symbol: "🪵", name: "نرده", w: 38, h: 44, offsetY: 0 },
  { symbol: "🌾", name: "کاه", w: 42, h: 42, offsetY: 0 },
  { symbol: "🌿", name: "بوته", w: 36, h: 36, offsetY: 0 },
  { symbol: "🪨", name: "سنگ", w: 34, h: 32, offsetY: 0 }
];

function initFarmRunnerGame() {
  gameCtx = gameCanvas.getContext('2d');
  
  // Load saved high score from localStorage
  try {
    const saved = localStorage.getItem('farm_runner_high_score');
    if (saved) gameHighScore = parseInt(saved, 10) || 0;
  } catch (e) {}
  updateScoreDisplay();

  // Control Listeners
  btnPlayGame.addEventListener('click', startActiveRun);
  btnRestartGame.addEventListener('click', startActiveRun);
  btnExitToFarm.addEventListener('click', closeFarmRunnerGame);
  btnCloseGame.addEventListener('click', closeFarmRunnerGame);

  // Jump trigger bindings
  btnTouchJump.addEventListener('touchstart', (e) => { e.preventDefault(); doPlayerJump(); });
  btnTouchJump.addEventListener('mousedown', (e) => { e.preventDefault(); doPlayerJump(); });
  gameCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); doPlayerJump(); });
  gameCanvas.addEventListener('mousedown', (e) => { e.preventDefault(); doPlayerJump(); });

  window.addEventListener('keydown', (e) => {
    if (!gameModal.classList.contains('hidden')) {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        if (!gameRunning && !gameStartScreen.classList.contains('hidden')) {
          startActiveRun();
        } else if (!gameRunning && !gameOverScreen.classList.contains('hidden')) {
          startActiveRun();
        } else {
          doPlayerJump();
        }
      } else if (e.code === 'Escape') {
        closeFarmRunnerGame();
      }
    }
  });

  // Sound Toggle inside game
  btnGameSound.addEventListener('click', () => {
    isGameAudioMuted = !isGameAudioMuted;
    btnGameSound.textContent = isGameAudioMuted ? '🔇' : '🔊';
  });
}

function openFarmRunnerGame() {
  getAudioContext();
  gameModal.classList.remove('hidden');

  // Set active animal mascot in game
  const animal = currentAnimal || animals[0];
  gamePlayerEmoji.textContent = animal.emoji;
  gamePlayerName.textContent = `بازی با ${animal.name}`;
  startScreenEmoji.textContent = animal.emoji;

  // Show Start Screen
  gameStartScreen.classList.remove('hidden');
  gameOverScreen.classList.add('hidden');
  gameRunning = false;

  resetGameEntities();
  drawGameFrame();
}

function closeFarmRunnerGame() {
  gameRunning = false;
  if (gameAnimId) cancelAnimationFrame(gameAnimId);
  gameModal.classList.add('hidden');
}

function resetGameEntities() {
  player.y = groundY - player.h;
  player.vy = 0;
  player.isGrounded = true;
  player.runBob = 0;

  obstacles = [];
  stars = [];
  gameScore = 0;
  gameSpeed = 4.8;
  gameFrame = 0;
  updateScoreDisplay();

  // Initial decorative background clouds & fences
  sceneryClouds = [
    { x: 100, y: 35, speed: 0.6, icon: "☁️" },
    { x: 380, y: 55, speed: 0.4, icon: "☁️" },
    { x: 650, y: 30, speed: 0.8, icon: "☁️" }
  ];

  sceneryFences = [];
  for (let i = 0; i < 12; i++) {
    sceneryFences.push({ x: i * 80 });
  }
}

function startActiveRun() {
  resetGameEntities();
  gameStartScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  gameRunning = true;
  getAudioContext();
  playSfxJump();

  lastTimestamp = performance.now();
  if (gameAnimId) cancelAnimationFrame(gameAnimId);
  gameAnimId = requestAnimationFrame(gameLoop);
}

function doPlayerJump() {
  if (!gameRunning) return;
  if (player.isGrounded) {
    player.vy = player.jumpStrength;
    player.isGrounded = false;
    playSfxJump();
  }
}

let lastTimestamp = 0;
function gameLoop(timestamp) {
  if (!gameRunning) return;

  updateGameState();
  drawGameFrame();

  gameAnimId = requestAnimationFrame(gameLoop);
}

function updateGameState() {
  gameFrame++;

  // Gradually and gently increase speed (kid-friendly progression)
  if (gameFrame % 400 === 0 && gameSpeed < 8.2) {
    gameSpeed += 0.35;
  }

  // Player physics
  player.y += player.vy;
  player.vy += player.gravity;

  if (player.y >= groundY - player.h) {
    player.y = groundY - player.h;
    player.vy = 0;
    player.isGrounded = true;
  }

  // Run cycle wobble for cute kid animation
  player.runBob = player.isGrounded ? Math.sin(gameFrame * 0.35) * 4 : 0;

  // Background Cloud drift
  sceneryClouds.forEach(cloud => {
    cloud.x -= cloud.speed;
    if (cloud.x < -60) cloud.x = gameCanvas.width + 40;
  });

  // Background Fence drift
  sceneryFences.forEach(fence => {
    fence.x -= gameSpeed * 0.7;
    if (fence.x < -60) fence.x = gameCanvas.width + 20;
  });

  // Obstacle Spawning (generous, child-friendly intervals)
  const minObstacleDist = 240 + Math.random() * 160;
  const lastObstacle = obstacles[obstacles.length - 1];
  if (!lastObstacle || (gameCanvas.width - lastObstacle.x) > minObstacleDist) {
    if (Math.random() < 0.6) {
      const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
      obstacles.push({
        x: gameCanvas.width + 20,
        y: groundY - type.h + type.offsetY,
        w: type.w,
        h: type.h,
        symbol: type.symbol,
        name: type.name
      });

      // 40% chance to spawn a bonus star above/near the obstacle
      if (Math.random() < 0.45) {
        stars.push({
          x: gameCanvas.width + 45,
          y: groundY - type.h - 45 - (Math.random() * 30),
          w: 24,
          h: 24,
          collected: false
        });
      }
    }
  }

  // Update Obstacles & Collision Check
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const ob = obstacles[i];
    ob.x -= gameSpeed;

    // Check collision with generous forgiving hitbox
    const pad = 8;
    if (
      player.x + pad < ob.x + ob.w - pad &&
      player.x + player.w - pad > ob.x + pad &&
      player.y + pad < ob.y + ob.h - pad &&
      player.y + player.h > ob.y + pad
    ) {
      handleGameOver();
      return;
    }

    // Remove off-screen obstacles & increment score
    if (ob.x < -60) {
      obstacles.splice(i, 1);
      gameScore += 1;
      updateScoreDisplay();
    }
  }

  // Update Collectible Stars
  for (let j = stars.length - 1; j >= 0; j--) {
    const star = stars[j];
    star.x -= gameSpeed;

    // Check Star Collection
    if (
      !star.collected &&
      player.x < star.x + star.w &&
      player.x + player.w > star.x &&
      player.y < star.y + star.h &&
      player.y + player.h > star.y
    ) {
      star.collected = true;
      gameScore += 5;
      updateScoreDisplay();
      playSfxStar();
      triggerMiniConfetti();
    }

    if (star.x < -40 || star.collected) {
      stars.splice(j, 1);
    }
  }
}

function handleGameOver() {
  gameRunning = false;
  playSfxBump();
  playSfxFanfare();
  triggerConfetti();

  if (gameScore > gameHighScore) {
    gameHighScore = gameScore;
    try {
      localStorage.setItem('farm_runner_high_score', gameHighScore.toString());
    } catch (e) {}
  }
  updateScoreDisplay();

  // Populate Game Over Screen
  finalScoreEl.textContent = gameScore.toString();
  
  if (gameScore >= 20) {
    gameEncouragement.textContent = "فوق‌العاده بود! تو یک دونده حرفه‌ای مزرعه‌ای! 🏆🥇";
  } else if (gameScore >= 10) {
    gameEncouragement.textContent = "خیلی عالی پریدی قهرمان! آفرین به تو! 🌟👏";
  } else {
    gameEncouragement.textContent = "خیلی تلاش قشنگی بود! دوباره امتحان کن تا رکورد بزنی! 🏃‍♂️";
  }

  gameOverScreen.classList.remove('hidden');
}

function updateScoreDisplay() {
  gameScoreEl.textContent = gameScore.toString();
  gameHighScoreEl.textContent = gameHighScore.toString();
}

function drawGameFrame() {
  if (!gameCtx) return;
  const w = gameCanvas.width;
  const h = gameCanvas.height;

  // 1. Sky Gradient
  const skyGrad = gameCtx.createLinearGradient(0, 0, 0, groundY);
  skyGrad.addColorStop(0, '#BAE6FD');
  skyGrad.addColorStop(1, '#DCFCE7');
  gameCtx.fillStyle = skyGrad;
  gameCtx.fillRect(0, 0, w, h);

  // 2. Distant Soft Hills
  gameCtx.fillStyle = '#86EFAC';
  gameCtx.beginPath();
  gameCtx.ellipse(150, groundY - 20, 220, 60, 0, 0, Math.PI * 2);
  gameCtx.ellipse(550, groundY - 15, 260, 70, 0, 0, Math.PI * 2);
  gameCtx.fill();

  // 3. Clouds
  gameCtx.font = "26px sans-serif";
  sceneryClouds.forEach(cloud => {
    gameCtx.fillText(cloud.icon, cloud.x, cloud.y);
  });

  // 4. Background Fences
  gameCtx.font = "18px sans-serif";
  sceneryFences.forEach(fence => {
    gameCtx.fillText("🪵", fence.x, groundY - 14);
  });

  // 5. Ground Path
  gameCtx.fillStyle = '#16A34A';
  gameCtx.fillRect(0, groundY, w, h - groundY);

  gameCtx.fillStyle = '#22C55E';
  gameCtx.fillRect(0, groundY, w, 8);

  // Little grass tufts on ground
  gameCtx.fillStyle = '#15803D';
  for (let gx = 10; gx < w; gx += 40) {
    gameCtx.fillRect((gx - (gameFrame * 2) % 40), groundY + 12, 10, 3);
  }

  // 6. Draw Obstacles
  obstacles.forEach(ob => {
    gameCtx.font = "34px sans-serif";
    gameCtx.textAlign = "center";
    gameCtx.textBaseline = "bottom";
    gameCtx.fillText(ob.symbol, ob.x + ob.w / 2, ob.y + ob.h);
  });

  // 7. Draw Collectible Stars
  stars.forEach(star => {
    gameCtx.font = "24px sans-serif";
    gameCtx.textAlign = "center";
    gameCtx.textBaseline = "middle";
    // Gentle floating bob
    const starBob = Math.sin((gameFrame + star.x) * 0.1) * 4;
    gameCtx.fillText("⭐", star.x + star.w / 2, star.y + star.h / 2 + starBob);
  });

  // 8. Draw Player (The Active Animal!)
  const animal = currentAnimal || animals[0];
  gameCtx.save();
  gameCtx.font = "44px sans-serif";
  gameCtx.textAlign = "center";
  gameCtx.textBaseline = "bottom";

  const renderX = player.x + player.w / 2;
  const renderY = player.y + player.h + player.runBob;

  // Jump tilt
  if (!player.isGrounded) {
    gameCtx.translate(renderX, renderY);
    gameCtx.rotate(-0.15);
    gameCtx.fillText(animal.emoji, 0, 0);
  } else {
    gameCtx.fillText(animal.emoji, renderX, renderY);
  }
  gameCtx.restore();

  // Shadow under player
  gameCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  gameCtx.beginPath();
  const shadowW = Math.max(16, player.w - (groundY - player.y - player.h) * 0.4);
  gameCtx.ellipse(renderX, groundY + 4, shadowW / 2, 4, 0, 0, Math.PI * 2);
  gameCtx.fill();
}

// ==========================================================================
// JOYFUL CONFETTI SYSTEM
// ==========================================================================
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animFrameId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function triggerConfetti() {
  createParticles(80);
  if (!animFrameId) {
    animateConfetti();
  }
}

function triggerMiniConfetti() {
  createParticles(35);
  if (!animFrameId) {
    animateConfetti();
  }
}

function createParticles(count) {
  const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#F43F5E'];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 150,
      y: canvas.height * 0.4 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 1.2) * 12,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      alpha: 1.0
    });
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.35; // gravity
    p.vx *= 0.98; // friction
    p.rotation += p.rotSpeed;
    p.alpha -= 0.012;

    if (p.alpha <= 0 || p.y > canvas.height + 20) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  }

  if (particles.length > 0) {
    animFrameId = requestAnimationFrame(animateConfetti);
  } else {
    animFrameId = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
