/**
 * Farm Book Sounds - Web Audio Player & Routing Logic
 * Author: miladnosrati1
 * Repo: farm-book-sounds
 */

// Fallback data in case data/animals.json is unavailable or opened via file://
const FALLBACK_ANIMALS = [
  { id: "hen", name: "مرغ", emoji: "🐔", audio: "audio/hen.mp3" },
  { id: "cow", name: "گاو", emoji: "🐄", audio: "audio/cow.mp3" },
  { id: "sheep", name: "گوسفند", emoji: "🐑", audio: "audio/sheep.mp3" },
  { id: "goose", name: "غاز", emoji: "🪿", audio: "audio/goose.mp3" },
  { id: "duck", name: "اردک", emoji: "🦆", audio: "audio/duck.mp3" },
  { id: "donkey", name: "الاغ", emoji: "🫏", audio: "audio/donkey.mp3" },
  { id: "dog", name: "سگ گله", emoji: "🐕", audio: "audio/dog.mp3" },
  { id: "horse", name: "اسب", emoji: "🐎", audio: "audio/horse.mp3" },
  { id: "goat", name: "بز", emoji: "🐐", audio: "audio/goat.mp3" }
];

let animals = [...FALLBACK_ANIMALS];
let currentAnimal = null;
let isAudioPlaying = false;

// DOM Elements
const playerCard = document.getElementById('player-card');
const activeEmoji = document.getElementById('active-emoji');
const activeName = document.getElementById('active-name');
const activeTag = document.getElementById('active-tag');
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
const animalsGrid = document.getElementById('animals-grid');
const autoplayBanner = document.getElementById('autoplay-banner');
const mainAudio = document.getElementById('main-audio');

// Initialize Application
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

  renderAnimalsGrid();
  setupEventListeners();

  // Route URL parameter: ?s=hen
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

// Render the 9 animals grid
function renderAnimalsGrid() {
  animalsGrid.innerHTML = '';
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

    animalsGrid.appendChild(card);
  });
}

// Select an animal and update UI & Audio source
function selectAnimal(animalId, isInitialLoad = false) {
  const found = animals.find(a => a.id.toLowerCase() === animalId.toLowerCase()) || animals[0];
  currentAnimal = found;

  // Update active card
  activeEmoji.textContent = found.emoji;
  activeName.textContent = found.name;
  activeTag.textContent = `شناسه: ${found.id} • صدای طبیعی`;
  document.title = `صدای ${found.name} ${found.emoji} | کتاب کودک`;

  // Update direct download link
  directAudioLink.href = found.audio;
  directAudioLink.setAttribute('download', `${found.id}-sound.mp3`);

  // Update grid highlight
  document.querySelectorAll('.animal-card').forEach(c => c.classList.remove('is-selected'));
  const activeGridCard = document.getElementById(`grid-card-${found.id}`);
  if (activeGridCard) {
    activeGridCard.classList.add('is-selected');
  }

  // Update audio source
  mainAudio.src = found.audio;
  mainAudio.currentTime = 0;
  progressBar.style.width = '0%';
  currentTimeEl.textContent = '00:00';
  totalDurationEl.textContent = '--:--';
  updatePlayingState(false);

  // Update browser URL query string without reloading
  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.get('s') !== found.id) {
    currentUrl.searchParams.set('s', found.id);
    window.history.pushState({ animalId: found.id }, '', currentUrl.toString());
  }

  // If initial load from scanning QR code, attempt autoplay
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

// Play audio function
function playAudio() {
  autoplayBanner.classList.add('hidden');
  mainAudio.play().then(() => {
    updatePlayingState(true);
  }).catch((err) => {
    console.warn("Play failed:", err);
    updatePlayingState(false);
  });
}

// Pause audio
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

// Update UI buttons and playing status
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

// Setup event listeners
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

/* ==========================================================================
   Lightweight Joyful Confetti Animation
   ========================================================================== */
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
