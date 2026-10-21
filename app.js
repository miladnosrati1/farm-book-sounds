/**
 * Farm Book Sounds & Subway Surfers Style Fullscreen Farm Runner
 * Author: miladnosrati1
 * Repo: farm-book-sounds
 */

// Comprehensive animal data with Persian sounds, habitats & favorite foods
const FALLBACK_ANIMALS = [
  {
    id: "hen",
    name: "مرغ",
    emoji: "🐔",
    audio: "audio/hen.mp3",
    sound_text: "قُد قُد قُدا!",
    habitat: "مرغ‌دانی و لانه کاه",
    action_hint: "در حال دانه خوردن 🌾",
    food_emoji: "🌽",
    food_name: "ذرت شیرین"
  },
  {
    id: "cow",
    name: "گاو",
    emoji: "🐄",
    audio: "audio/cow.mp3",
    sound_text: "ماااااا!",
    habitat: "چمن‌زار سرسبز",
    action_hint: "در حال چریدن علف 🍀",
    food_emoji: "🍀",
    food_name: "شبدر تازه"
  },
  {
    id: "sheep",
    name: "گوسفند",
    emoji: "🐑",
    audio: "audio/sheep.mp3",
    sound_text: "بَععععع!",
    habitat: "تپه علفی نرم",
    action_hint: "در حال دویدن در دشت 🌼",
    food_emoji: "🌿",
    food_name: "علف سبز"
  },
  {
    id: "goose",
    name: "غاز",
    emoji: "🪿",
    audio: "audio/goose.mp3",
    sound_text: "غا غا غار!",
    habitat: "کنار برکه آب",
    action_hint: "در حال بال زدن 💧",
    food_emoji: "🌾",
    food_name: "گندم طلایی"
  },
  {
    id: "duck",
    name: "اردک",
    emoji: "🦆",
    audio: "audio/duck.mp3",
    sound_text: "کواک کواک!",
    habitat: "داخل برکه نیلوفر",
    action_hint: "در حال شنا روی آب 🪷",
    food_emoji: "🍞",
    food_name: "نان و سبزه"
  },
  {
    id: "donkey",
    name: "الاغ",
    emoji: "🫏",
    audio: "audio/donkey.mp3",
    sound_text: "عَررر عَررر!",
    habitat: "کنار آسیاب و گاری کاه",
    action_hint: "در حال خوردن یونجه 🧺",
    food_emoji: "🥕",
    food_name: "هویج تازه"
  },
  {
    id: "dog",
    name: "سگ گله",
    emoji: "🐕",
    audio: "audio/dog.mp3",
    sound_text: "هاپ هاپ!",
    habitat: "درگاه چوبی مزرعه",
    action_hint: "در حال نگهبانی مزرعه 🪵",
    food_emoji: "🦴",
    food_name: "استخوان لذیذ"
  },
  {
    id: "horse",
    name: "اسب",
    emoji: "🐎",
    audio: "audio/horse.mp3",
    sound_text: "هیهااااء!",
    habitat: "محوطه اصطبل و نرده‌ها",
    action_hint: "در حال تاختن شاد 🏇",
    food_emoji: "🍎",
    food_name: "سیب سرخ"
  },
  {
    id: "goat",
    name: "بز",
    emoji: "🐐",
    audio: "audio/goat.mp3",
    sound_text: "مَععععع!",
    habitat: "صخره سنگی کوچک",
    action_hint: "در حال پریدن روی سنگ‌ها 🪨",
    food_emoji: "🥦",
    food_name: "کلم بروکلی"
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
const calloutFoodBadge = document.getElementById('callout-food-badge');
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
  setup3DFarmDiorama();
  renderAnimalsGrid();
  setupEventListeners();
  initSubwaySurfersGame();

  // Route URL parameter (?s=hen) from scanned QR code
  const targetId = getUrlAnimalId();
  selectAnimal(targetId, true);
}

// Interactive 3D Farm Diorama Parallax Tilt
function setup3DFarmDiorama() {
  const landscape = document.getElementById('farm-landscape');
  const container = document.getElementById('farm-view');
  if (!landscape || !container) return;

  let rafId = null;
  let targetRotateX = 15;
  let targetRotateY = 0;
  let currentRotateX = 15;
  let currentRotateY = 0;

  function updateTilt() {
    currentRotateX += (targetRotateX - currentRotateX) * 0.12;
    currentRotateY += (targetRotateY - currentRotateY) * 0.12;
    landscape.style.transform = `rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) scale(0.97)`;
    
    if (Math.abs(targetRotateX - currentRotateX) > 0.05 || Math.abs(targetRotateY - currentRotateY) > 0.05) {
      rafId = requestAnimationFrame(updateTilt);
    } else {
      rafId = null;
    }
  }

  function handleMove(clientX, clientY) {
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const normX = Math.max(-1, Math.min(1, (x / rect.width) * 2 - 1)); // -1 to +1
    const normY = Math.max(-1, Math.min(1, (y / rect.height) * 2 - 1)); // -1 to +1

    targetRotateX = 15 - (normY * 5); // tilt between 10deg and 20deg
    targetRotateY = normX * 6; // yaw between -6deg and +6deg

    if (!rafId) rafId = requestAnimationFrame(updateTilt);
  }

  container.addEventListener('mousemove', (e) => {
    handleMove(e.clientX, e.clientY);
  });

  container.addEventListener('mouseleave', () => {
    targetRotateX = 15;
    targetRotateY = 0;
    if (!rafId) rafId = requestAnimationFrame(updateTilt);
  });
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
  if (calloutFoodBadge) {
    calloutFoodBadge.textContent = `جمع‌آوری ${found.food_name || 'غذا'} ${found.food_emoji || '🌾'}`;
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
    // Scroll farm container smoothly to bring animal into center view on mobile
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

  // Launch Subway Surfers Game on Avatar Click or Callout Button Click!
  avatarContainer.addEventListener('click', openSubwaySurfersGame);
  avatarContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openSubwaySurfersGame();
    }
  });

  btnStartGame.addEventListener('click', openSubwaySurfersGame);

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

// Sound effects: Jump, Lane Switch, Food Eat, Duck/Slide, Bump, Fanfare
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
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.18);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch (e) {}
}

function playSfxSlide() {
  if (isGameAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {}
}

function playSfxLaneSwitch() {
  if (isGameAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch (e) {}
}

function playSfxFoodEat() {
  if (isGameAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [523, 659, 784, 1046].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.035;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.22, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.12);
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
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
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
      const delay = idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.2, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.25);
    });
  } catch (e) {}
}

// ==========================================================================
// FULLSCREEN 3-LANE SUBWAY SURFERS STYLE FARM RUNNER
// ==========================================================================
const gameModal = document.getElementById('game-modal');
const gameCanvas = document.getElementById('game-canvas');
const btnPauseGame = document.getElementById('btn-pause-game');
const hudCharAvatar = document.getElementById('hud-char-avatar');
const hudFoodIcon = document.getElementById('hud-food-icon');
const hudFoodCount = document.getElementById('hud-food-count');
const hudScoreValue = document.getElementById('hud-score-value');
const hudHighValue = document.getElementById('hud-high-value');
const btnGameSound = document.getElementById('btn-game-sound');

const gameStartScreen = document.getElementById('game-start-screen');
const gamePauseScreen = document.getElementById('game-pause-screen');
const gameOverScreen = document.getElementById('game-over-screen');

const startScreenEmoji = document.getElementById('start-screen-emoji');
const startScreenTitle = document.getElementById('start-screen-title');
const startAnimalName = document.getElementById('start-animal-name');
const startFoodName = document.getElementById('start-food-name');
const btnPlayGame = document.getElementById('btn-play-game');

const pauseFoodCount = document.getElementById('pause-food-count');
const pauseScoreValue = document.getElementById('pause-score-value');
const btnResumeGame = document.getElementById('btn-resume-game');
const btnRestartFromPause = document.getElementById('btn-restart-from-pause');
const btnExitToMain = document.getElementById('btn-exit-to-main');

const overFoodEmoji = document.getElementById('over-food-emoji');
const overFoodSummary = document.getElementById('over-food-summary');
const finalScoreEl = document.getElementById('final-score');
const gameEncouragement = document.getElementById('game-encouragement');
const btnRestartGame = document.getElementById('btn-restart-game');
const btnExitToFarm = document.getElementById('btn-exit-to-farm');

let gameCtx = null;
let gameRunning = false;
let gamePaused = false;
let gameAnimId = null;
let gameScore = 0;
let gameFoodCollected = 0;
let gameHighScore = 0;
let gameSpeed = 2.0;
let gameFrame = 0;

// Subway Surfers 3 Lanes (0: Left, 1: Center, 2: Right)
const runner = {
  currentLane: 1,
  targetLane: 1,
  x: 0,
  y: 0,
  baseY: 0,
  jumpY: 0,
  vy: 0,
  gravity: 0.48,
  jumpStrength: -11.0,
  isJumping: false,
  isDucking: false,
  duckTimer: 0,
  runBob: 0,
  width: 74,
  height: 80
};

// Lane coordinates calculated dynamically on resize
let horizonY = 0;
let trackBottomY = 0;
let lanePositions = [0, 0, 0];

// Game Objects (Obstacles & Food Collectibles)
let activeObstacles = [];
let activeFoods = [];
let floatingTexts = [];

// Rich Farm Obstacles Collection:
// Low (Jump over): Fences, Hay, Rocks, Puddles
// High (Duck/Slide under): Clothesline, Low Branch, Barn Sign
// Tall (Lane Blocker): Tractor, Hay Wagon
const OBSTACLES_DEF = [
  { type: 'low', emoji: '🪵', label: 'نرده چوبی', w: 70, h: 60, needJump: true },
  { type: 'low', emoji: '🌾', label: 'بسته کاه', w: 72, h: 62, needJump: true },
  { type: 'low', emoji: '🪨', label: 'سنگ مزرعه', w: 60, h: 54, needJump: true },
  { type: 'low', emoji: '💧', label: 'چاله گل', w: 64, h: 40, needJump: true },
  { type: 'high', emoji: '👕', label: 'طناب لباس', w: 84, h: 70, needDuck: true },
  { type: 'high', emoji: '🍃', label: 'شاخه درخت', w: 80, h: 68, needDuck: true },
  { type: 'blocker', emoji: '🚜', label: 'تراکتور', w: 78, h: 76, needDodge: true }
];

function initSubwaySurfersGame() {
  gameCtx = gameCanvas.getContext('2d');
  resizeGameCanvas();
  window.addEventListener('resize', resizeGameCanvas);

  // Load saved high score from localStorage
  try {
    const saved = localStorage.getItem('farm_subway_high_score');
    if (saved) gameHighScore = parseInt(saved, 10) || 0;
  } catch (e) {}
  updateHUD();

  // Control Listeners with both touch and click support (debounced to prevent duplicate fires)
  function bindTouchAndClick(elem, fn) {
    if (!elem) return;
    let lastTrigger = 0;
    const handler = (e) => {
      const now = Date.now();
      if (now - lastTrigger < 350) return;
      lastTrigger = now;
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      fn(e);
    };
    elem.addEventListener('click', handler);
    elem.addEventListener('touchend', handler);
  }

  bindTouchAndClick(btnPlayGame, startActiveRun);
  bindTouchAndClick(btnResumeGame, resumeGame);
  bindTouchAndClick(btnRestartFromPause, startActiveRun);
  bindTouchAndClick(btnExitToMain, closeSubwaySurfersGame);
  bindTouchAndClick(btnRestartGame, startActiveRun);
  bindTouchAndClick(btnExitToFarm, closeSubwaySurfersGame);
  bindTouchAndClick(btnPauseGame, pauseGame);

  // Touch Swipe & Tap Controls
  setupTouchGestures();

  // Keyboard Controls
  setupKeyboardControls();

  // Sound Toggle inside game
  bindTouchAndClick(btnGameSound, () => {
    isGameAudioMuted = !isGameAudioMuted;
    btnGameSound.textContent = isGameAudioMuted ? '🔇' : '🔊';
  });
}

function resizeGameCanvas() {
  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight;

  horizonY = gameCanvas.height * 0.28;
  trackBottomY = gameCanvas.height * 0.88;

  const trackWidth = Math.min(gameCanvas.width * 0.85, 520);
  const laneStep = trackWidth / 3;
  const centerX = gameCanvas.width / 2;

  // 3 Lanes (0: Left, 1: Center, 2: Right)
  lanePositions = [
    centerX - laneStep,
    centerX,
    centerX + laneStep
  ];

  runner.baseY = trackBottomY - runner.height;
  runner.x = lanePositions[runner.currentLane];
}

// Touch Gestures: Swipes (Left/Right/Up/Down) & Screen Click to Jump
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

function setupTouchGestures() {
  gameCanvas.addEventListener('touchstart', (e) => {
    if (!gameRunning || gamePaused) return;
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchStartTime = Date.now();
  }, { passive: false });

  gameCanvas.addEventListener('touchmove', (e) => {
    if (gameRunning && !gamePaused) {
      e.preventDefault(); // prevent browser pull-to-refresh
    }
  }, { passive: false });

  gameCanvas.addEventListener('touchend', (e) => {
    if (!gameRunning || gamePaused) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const dt = Date.now() - touchStartTime;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // Tap detected (movement < 25px) -> JUMP! (as user requested: کلیک روی صفحه بپره)
    if (absX < 25 && absY < 25 && dt < 480) {
      triggerPlayerJump();
      return;
    }

    // Horizontal Swipe (Lane Change)
    if (absX > absY && absX > 30) {
      if (dx < 0) {
        // Swipe Left
        moveLane(-1);
      } else {
        // Swipe Right
        moveLane(1);
      }
      return;
    }

    // Vertical Swipe (Jump Up or Duck Down)
    if (absY > absX && absY > 30) {
      if (dy < 0) {
        // Swipe Up -> Jump
        triggerPlayerJump();
      } else {
        // Swipe Down -> Duck / Slide
        triggerPlayerDuck();
      }
    }
  }, { passive: false });

  // Mouse fallback for desktop testing
  let isMouseDown = false;
  gameCanvas.addEventListener('mousedown', (e) => {
    if (!gameRunning || gamePaused) return;
    touchStartX = e.clientX;
    touchStartY = e.clientY;
    touchStartTime = Date.now();
    isMouseDown = true;
  });

  gameCanvas.addEventListener('mouseup', (e) => {
    if (!isMouseDown || !gameRunning || gamePaused) return;
    isMouseDown = false;
    const dx = e.clientX - touchStartX;
    const dy = e.clientY - touchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < 15 && absY < 15) {
      triggerPlayerJump();
      return;
    }

    if (absX > absY && absX > 30) {
      if (dx < 0) moveLane(-1);
      else moveLane(1);
    } else if (absY > absX && absY > 30) {
      if (dy < 0) triggerPlayerJump();
      else triggerPlayerDuck();
    }
  });
}

function setupKeyboardControls() {
  window.addEventListener('keydown', (e) => {
    if (gameModal.classList.contains('hidden')) return;

    if (e.code === 'KeyP' || e.code === 'Escape') {
      e.preventDefault();
      if (gameRunning && !gamePaused) pauseGame();
      else if (gamePaused) resumeGame();
      return;
    }

    if (!gameRunning && !gameStartScreen.classList.contains('hidden')) {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        startActiveRun();
      }
      return;
    }

    if (gameRunning && !gamePaused) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        moveLane(-1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        moveLane(1);
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        e.preventDefault();
        triggerPlayerJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        triggerPlayerDuck();
      }
    }
  });
}

function moveLane(dir) {
  const newLane = runner.currentLane + dir;
  if (newLane >= 0 && newLane <= 2) {
    runner.currentLane = newLane;
    runner.targetLane = newLane;
    playSfxLaneSwitch();
  }
}

function triggerPlayerJump() {
  if (!runner.isJumping) {
    runner.isJumping = true;
    runner.vy = runner.jumpStrength;
    runner.isDucking = false;
    playSfxJump();
  }
}

function triggerPlayerDuck() {
  runner.isDucking = true;
  runner.duckTimer = 40; // duck for ~40 frames
  // If in air, gentle quick drop to ground
  if (runner.isJumping) {
    runner.vy = 12;
  }
  playSfxSlide();
}

// Open / Close Fullscreen Modal
function openSubwaySurfersGame(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  getAudioContext();
  gameModal.style.setProperty('display', 'flex', 'important');
  gameModal.classList.remove('hidden');
  resizeGameCanvas();

  const animal = currentAnimal || animals[0];
  hudCharAvatar.textContent = animal.emoji;
  hudFoodIcon.textContent = animal.food_emoji || '🌽';
  startScreenEmoji.textContent = animal.emoji;
  startScreenTitle.textContent = `بازی دونده با ${animal.name}`;
  startAnimalName.textContent = animal.name;
  startFoodName.textContent = animal.food_name || 'غذاهای خوشمزه';

  gameStartScreen.style.setProperty('display', 'flex', 'important');
  gameStartScreen.classList.remove('hidden');
  gamePauseScreen.style.setProperty('display', 'none', 'important');
  gamePauseScreen.classList.add('hidden');
  gameOverScreen.style.setProperty('display', 'none', 'important');
  gameOverScreen.classList.add('hidden');
  gameRunning = false;
  gamePaused = false;

  resetGameEntities();
  drawSubwaySurfersFrame();
}

function closeSubwaySurfersGame(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  gameRunning = false;
  gamePaused = false;
  if (gameAnimId) cancelAnimationFrame(gameAnimId);
  gameModal.style.setProperty('display', 'none', 'important');
  gameModal.classList.add('hidden');
}

function pauseGame(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  if (!gameRunning || gamePaused) return;
  gamePaused = true;
  pauseFoodCount.textContent = gameFoodCollected.toString();
  pauseScoreValue.textContent = gameScore.toString();
  gamePauseScreen.style.setProperty('display', 'flex', 'important');
  gamePauseScreen.classList.remove('hidden');
}

function resumeGame(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  if (!gamePaused) return;
  gamePaused = false;
  gamePauseScreen.style.setProperty('display', 'none', 'important');
  gamePauseScreen.classList.add('hidden');
  lastFrameTime = performance.now();
  requestAnimationFrame(subwayGameLoop);
}

function resetGameEntities() {
  runner.currentLane = 1;
  runner.targetLane = 1;
  runner.x = lanePositions[1];
  runner.jumpY = 0;
  runner.vy = 0;
  runner.isJumping = false;
  runner.isDucking = false;
  runner.duckTimer = 0;
  runner.runBob = 0;

  activeObstacles = [];
  activeFoods = [];
  floatingTexts = [];

  gameScore = 0;
  gameFoodCollected = 0;
  gameSpeed = 2.0;
  gameFrame = 0;
  nextSpawnDistance = 120;
  updateHUD();
}

function startActiveRun(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  resetGameEntities();
  gameStartScreen.style.setProperty('display', 'none', 'important');
  gameStartScreen.classList.add('hidden');
  gamePauseScreen.style.setProperty('display', 'none', 'important');
  gamePauseScreen.classList.add('hidden');
  gameOverScreen.style.setProperty('display', 'none', 'important');
  gameOverScreen.classList.add('hidden');
  gameRunning = true;
  gamePaused = false;
  getAudioContext();
  playSfxJump();

  lastFrameTime = performance.now();
  if (gameAnimId) cancelAnimationFrame(gameAnimId);
  gameAnimId = requestAnimationFrame(subwayGameLoop);
}

let lastFrameTime = 0;
function subwayGameLoop(timestamp) {
  if (!gameRunning || gamePaused) return;

  updateSubwayState();
  drawSubwaySurfersFrame();

  gameAnimId = requestAnimationFrame(subwayGameLoop);
}

function updateSubwayState() {
  gameFrame++;
  gameScore += 1;

  // Very gentle kid-friendly progression (capped at 2.9)
  if (gameFrame % 650 === 0 && gameSpeed < 2.9) {
    gameSpeed += 0.06;
  }

  // Smooth lane interpolation
  const targetX = lanePositions[runner.currentLane];
  runner.x += (targetX - runner.x) * 0.26;

  // Jump physics
  if (runner.isJumping) {
    runner.jumpY -= runner.vy;
    runner.vy += runner.gravity;

    if (runner.jumpY <= 0) {
      runner.jumpY = 0;
      runner.vy = 0;
      runner.isJumping = false;
    }
  }

  // Duck timer
  if (runner.isDucking) {
    runner.duckTimer--;
    if (runner.duckTimer <= 0) {
      runner.isDucking = false;
    }
  }

  // Running trot bob
  runner.runBob = (!runner.isJumping && !runner.isDucking) ? Math.sin(gameFrame * 0.42) * 6 : 0;

  // Spawning Obstacles & Animal's Favorite Food
  spawnSubwayElements();

  // Update Moving Obstacles & Check Collisions
  updateObstacles();

  // Update Food Collectibles
  updateFoods();

  // Update floating score texts
  for (let f = floatingTexts.length - 1; f >= 0; f--) {
    const ft = floatingTexts[f];
    ft.y -= 1.5;
    ft.alpha -= 0.02;
    if (ft.alpha <= 0) floatingTexts.splice(f, 1);
  }

  updateHUD();
}

// Spawning Logic for 3-Lane Subway Surfers
let nextSpawnDistance = 0;

function spawnSubwayElements() {
  nextSpawnDistance -= gameSpeed;

  if (nextSpawnDistance <= 0) {
    nextSpawnDistance = 220 + Math.random() * 80;

    const animal = currentAnimal || animals[0];

    // For the first ~4 seconds (240 frames), spawn ONLY delicious food treats!
    const isEarlyRun = gameFrame < 240;

    if (!isEarlyRun && Math.random() < 0.7) {
      // Pick 1 lane for obstacle (leaving 2 lanes completely safe!)
      const lane = Math.floor(Math.random() * 3);
      const obDef = OBSTACLES_DEF[Math.floor(Math.random() * OBSTACLES_DEF.length)];

      activeObstacles.push({
        lane: lane,
        z: 0.05, // 0 at horizon, 1.0 at foreground
        speed: 0.0050 * (gameSpeed / 2.0), // ~3.2 seconds approach time
        def: obDef
      });

      // Spawn Animal's Favorite Food in one of the other 2 lanes!
      const foodLane = (lane + 1 + Math.floor(Math.random() * 2)) % 3;
      for (let k = 0; k < 2; k++) {
        activeFoods.push({
          lane: foodLane,
          z: 0.05 - (k * 0.08),
          speed: 0.0050 * (gameSpeed / 2.0),
          emoji: animal.food_emoji || '🌽',
          collected: false
        });
      }
    } else {
      // Friendly Food Run! Spawn 2 or 3 food treats in a line
      const foodLane = Math.floor(Math.random() * 3);
      for (let k = 0; k < 3; k++) {
        activeFoods.push({
          lane: foodLane,
          z: 0.05 - (k * 0.07),
          speed: 0.0050 * (gameSpeed / 2.0),
          emoji: animal.food_emoji || '🌽',
          collected: false
        });
      }
    }
  }
}

function updateObstacles() {
  for (let i = activeObstacles.length - 1; i >= 0; i--) {
    const ob = activeObstacles[i];
    ob.z += ob.speed;

    // Generous, kid-forgiving collision window
    if (ob.z >= 0.88 && ob.z <= 1.01) {
      if (ob.lane === runner.currentLane) {
        let isHit = false;

        if (ob.def.type === 'low') {
          // Low obstacle requires JUMP (forgiving clearance of 16px)
          if (!runner.isJumping || runner.jumpY < 16) {
            isHit = true;
          }
        } else if (ob.def.type === 'high') {
          // High obstacle requires DUCK / SLIDE
          if (!runner.isDucking) {
            isHit = true;
          }
        } else if (ob.def.type === 'blocker') {
          // Blocker must be dodged (cannot jump or duck)
          isHit = true;
        }

        if (isHit) {
          triggerGameOver();
          return;
        }
      }
    }

    // Remove past screen
    if (ob.z > 1.15) {
      activeObstacles.splice(i, 1);
    }
  }
}

function updateFoods() {
  for (let j = activeFoods.length - 1; j >= 0; j--) {
    const food = activeFoods[j];
    food.z += food.speed;

    // Collection check with generous kid-friendly magnet window
    if (!food.collected && food.z >= 0.80 && food.z <= 1.06) {
      if (food.lane === runner.currentLane) {
        food.collected = true;
        gameFoodCollected++;
        gameScore += 10;
        playSfxFoodEat();

        // Spawn floating indicator
        floatingTexts.push({
          x: runner.x,
          y: runner.baseY - runner.jumpY - 20,
          text: `+10 ${food.emoji}`,
          alpha: 1.0
        });

        triggerMiniConfetti();
      }
    }

    if (food.z > 1.15 || food.collected) {
      activeFoods.splice(j, 1);
    }
  }
}

function triggerGameOver() {
  gameRunning = false;
  playSfxBump();
  playSfxFanfare();
  triggerConfetti();

  if (gameScore > gameHighScore) {
    gameHighScore = gameScore;
    try {
      localStorage.setItem('farm_subway_high_score', gameHighScore.toString());
    } catch (e) {}
  }
  updateHUD();

  // Populate Game Over Screen
  const animal = currentAnimal || animals[0];
  overFoodEmoji.textContent = animal.food_emoji || '🌽';
  overFoodSummary.textContent = `${gameFoodCollected} تا ${animal.food_name || 'غذا'} جمع کردی!`;
  finalScoreEl.textContent = gameScore.toString();

  if (gameScore >= 250) {
    gameEncouragement.textContent = "فوق‌العاده بود! تو سلطان ساب‌وی سرفرز مزرعه‌ای! 🏆🥇";
  } else if (gameScore >= 120) {
    gameEncouragement.textContent = "خیلی عالی دویدی و موانع رو جا گذاشتی! آفرین! 🌟👏";
  } else {
    gameEncouragement.textContent = "خیلی تلاش قشنگی بود! دوباره امتحان کن تا رکورد بزنی! 🏃‍♂️";
  }

  gameOverScreen.style.setProperty('display', 'flex', 'important');
  gameOverScreen.classList.remove('hidden');
}

function updateHUD() {
  hudFoodCount.textContent = gameFoodCollected.toString();
  hudScoreValue.textContent = gameScore.toString();
  hudHighValue.textContent = gameHighScore.toString();
}

// ==========================================================================
// 3-LANE PERSPECTIVE RENDERING (Subway Surfers Farm Theme)
// ==========================================================================
function drawSubwaySurfersFrame() {
  if (!gameCtx) return;
  const w = gameCanvas.width;
  const h = gameCanvas.height;

  // 1. Sky & Sun
  const skyGrad = gameCtx.createLinearGradient(0, 0, 0, horizonY);
  skyGrad.addColorStop(0, '#38BDF8');
  skyGrad.addColorStop(1, '#BAE6FD');
  gameCtx.fillStyle = skyGrad;
  gameCtx.fillRect(0, 0, w, horizonY);

  // Sun
  gameCtx.font = "44px sans-serif";
  gameCtx.fillText("☀️", w * 0.8, horizonY * 0.45);

  // Distant clouds
  gameCtx.font = "32px sans-serif";
  gameCtx.fillText("☁️", ((gameFrame * 0.4) % (w + 100)) - 50, horizonY * 0.35);
  gameCtx.fillText("☁️", ((gameFrame * 0.2 + w * 0.4) % (w + 100)) - 50, horizonY * 0.6);

  // 2. Distant Mountains & Barn
  gameCtx.fillStyle = '#86EFAC';
  gameCtx.beginPath();
  gameCtx.ellipse(w * 0.2, horizonY, w * 0.35, 55, 0, 0, Math.PI * 2);
  gameCtx.ellipse(w * 0.8, horizonY, w * 0.4, 65, 0, 0, Math.PI * 2);
  gameCtx.fill();

  // Distant Red Barn at center horizon
  gameCtx.font = "36px sans-serif";
  gameCtx.textAlign = "center";
  gameCtx.fillText("🏡", w / 2, horizonY + 8);

  // 3. Rolling Green Grass Meadows
  const grassGrad = gameCtx.createLinearGradient(0, horizonY, 0, h);
  grassGrad.addColorStop(0, '#22C55E');
  grassGrad.addColorStop(1, '#15803D');
  gameCtx.fillStyle = grassGrad;
  gameCtx.fillRect(0, horizonY, w, h - horizonY);

  // 4. The 3 Farm Track Lanes (Perspective Road)
  const trackTopW = 70;
  const trackBotW = Math.min(w * 0.9, 560);
  const centerX = w / 2;

  // Dirt track bed
  gameCtx.fillStyle = '#D97706';
  gameCtx.beginPath();
  gameCtx.moveTo(centerX - trackTopW / 2, horizonY);
  gameCtx.lineTo(centerX + trackTopW / 2, horizonY);
  gameCtx.lineTo(centerX + trackBotW / 2, trackBottomY + 40);
  gameCtx.lineTo(centerX - trackBotW / 2, trackBottomY + 40);
  gameCtx.closePath();
  gameCtx.fill();

  // Sandy lane overlay
  gameCtx.fillStyle = '#FBBF24';
  gameCtx.beginPath();
  gameCtx.moveTo(centerX - trackTopW * 0.46, horizonY);
  gameCtx.lineTo(centerX + trackTopW * 0.46, horizonY);
  gameCtx.lineTo(centerX + trackBotW * 0.46, trackBottomY + 40);
  gameCtx.lineTo(centerX - trackBotW * 0.46, trackBottomY + 40);
  gameCtx.closePath();
  gameCtx.fill();

  // Perspective Lane Dividers (Dashed White/Wood)
  gameCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  gameCtx.lineWidth = 3;
  gameCtx.setLineDash([14, 14]);
  gameCtx.lineDashOffset = -(gameFrame * gameSpeed * 1.5) % 28;

  // Left divider
  gameCtx.beginPath();
  gameCtx.moveTo(centerX - trackTopW / 6, horizonY);
  gameCtx.lineTo(centerX - trackBotW / 6, trackBottomY + 40);
  gameCtx.stroke();

  // Right divider
  gameCtx.beginPath();
  gameCtx.moveTo(centerX + trackTopW / 6, horizonY);
  gameCtx.lineTo(centerX + trackBotW / 6, trackBottomY + 40);
  gameCtx.stroke();
  gameCtx.setLineDash([]); // reset

  // Wooden fence posts on roadside
  const fenceOffset = (gameFrame * gameSpeed * 1.8) % 60;
  gameCtx.font = "24px sans-serif";
  for (let fz = 0.15; fz <= 1.0; fz += 0.18) {
    const curZ = (fz + (gameFrame * 0.015)) % 0.9 + 0.1;
    const fy = horizonY + (trackBottomY - horizonY) * curZ;
    const fw = trackTopW + (trackBotW - trackTopW) * curZ;
    const scale = 0.4 + curZ * 0.8;
    gameCtx.save();
    gameCtx.font = `${Math.floor(28 * scale)}px sans-serif`;
    gameCtx.fillText("🪵", centerX - fw / 2 - 18 * scale, fy);
    gameCtx.fillText("🪵", centerX + fw / 2 + 18 * scale, fy);
    gameCtx.restore();
  }

  // Helper function to project a point in 3-lane space
  function projectLanePoint(lane, z) {
    const y = horizonY + (trackBottomY - horizonY) * z;
    const topLaneStep = trackTopW / 3;
    const botLaneStep = trackBotW / 3;
    const topX = (centerX - topLaneStep) + lane * topLaneStep;
    const botX = (centerX - botLaneStep) + lane * botLaneStep;
    const x = topX + (botX - topX) * z;
    const scale = 0.35 + z * 0.75;
    return { x, y, scale };
  }

  // 5. Render Distant Food Collectibles (Sorted by z for correct depth)
  activeFoods.forEach(food => {
    if (food.z > 0 && food.z <= 1.1) {
      const p = projectLanePoint(food.lane, food.z);
      const fontSize = Math.floor(48 * p.scale);
      gameCtx.save();
      gameCtx.font = `${fontSize}px sans-serif`;
      gameCtx.textAlign = "center";
      gameCtx.textBaseline = "middle";

      // Floating bobbing effect
      const foodBob = Math.sin((gameFrame * 0.2) + food.z * 10) * 8 * p.scale;
      gameCtx.fillText(food.emoji, p.x, p.y - 25 * p.scale + foodBob);
      gameCtx.restore();
    }
  });

  // 6. Render Moving Obstacles (Sorted by z)
  activeObstacles.forEach(ob => {
    if (ob.z > 0 && ob.z <= 1.1) {
      const p = projectLanePoint(ob.lane, ob.z);
      const fontSize = Math.floor(58 * p.scale);
      gameCtx.save();
      gameCtx.textAlign = "center";
      gameCtx.textBaseline = "bottom";

      if (ob.def.type === 'high') {
        // High overhead obstacle (hanging line / branch)
        gameCtx.font = `${fontSize}px sans-serif`;
        gameCtx.fillText(ob.def.emoji, p.x, p.y - 50 * p.scale);

        // Hanging warning sign
        gameCtx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        gameCtx.fillRect(p.x - 30 * p.scale, p.y - 88 * p.scale, 60 * p.scale, 16 * p.scale);
        gameCtx.fillStyle = '#FFFFFF';
        gameCtx.font = `bold ${Math.floor(10 * p.scale)}px Vazirmatn, sans-serif`;
        gameCtx.fillText("بشین! 👇", p.x, p.y - 75 * p.scale);
      } else {
        // Low or Blocker obstacle on the ground
        gameCtx.font = `${fontSize}px sans-serif`;
        gameCtx.fillText(ob.def.emoji, p.x, p.y);
      }
      gameCtx.restore();
    }
  });

  // 7. Render The Player (Selected Animal Running Forward!)
  const animal = currentAnimal || animals[0];
  const playerRenderY = (runner.baseY - runner.jumpY) + runner.runBob;
  const playerRenderX = runner.x;

  gameCtx.save();
  gameCtx.textAlign = "center";
  gameCtx.textBaseline = "bottom";

  // Ground shadow under animal
  gameCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  gameCtx.beginPath();
  const shadowScale = Math.max(0.3, 1 - (runner.jumpY / 120));
  gameCtx.ellipse(playerRenderX, runner.baseY + 12, (runner.width / 2) * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
  gameCtx.fill();

  // Animal Emoji Character
  if (runner.isDucking) {
    // Ducking / Sliding posture (squished & low)
    gameCtx.translate(playerRenderX, playerRenderY + 20);
    gameCtx.scale(1.25, 0.6);
    gameCtx.font = "78px sans-serif";
    gameCtx.fillText(animal.emoji, 0, 0);

    // Dust particles when sliding
    gameCtx.font = "20px sans-serif";
    gameCtx.fillText("💨", -30, -5);
  } else if (runner.isJumping) {
    // Jumping posture (high arc, slight joyful tilt)
    gameCtx.translate(playerRenderX, playerRenderY);
    gameCtx.rotate(-0.08);
    gameCtx.font = "82px sans-serif";
    gameCtx.fillText(animal.emoji, 0, 0);
  } else {
    // Running forward down the track!
    // Slight side tilt when moving between lanes
    const laneTilt = (runner.targetLane - runner.currentLane) * 0.12;
    gameCtx.translate(playerRenderX, playerRenderY);
    gameCtx.rotate(laneTilt);
    gameCtx.font = "80px sans-serif";
    gameCtx.fillText(animal.emoji, 0, 0);
  }
  gameCtx.restore();

  // 8. Render Floating Score Texts
  floatingTexts.forEach(ft => {
    gameCtx.save();
    gameCtx.font = "bold 24px Vazirmatn, sans-serif";
    gameCtx.fillStyle = `rgba(245, 158, 11, ${ft.alpha})`;
    gameCtx.textAlign = "center";
    gameCtx.fillText(ft.text, ft.x, ft.y);
    gameCtx.restore();
  });
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
