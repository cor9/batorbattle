// Configuration - loaded from config.js
const API_URL = (window.APP_CONFIG && window.APP_CONFIG.API_URL) || 'http://localhost:8181';

// Game State
const gameState = {
  currentScreen: 'age-gate',
  isPlaying: false,
  isPaused: false,
  edgeLevel: 0,
  isStroking: false,
  timer: null,
  sessionTimer: null,
  sessionEndTime: null,
  gameMode: 'solo', // 'solo' or 'multiplayer'
  roomName: null,
  username: null,
  role: null, // 'player' or 'spectator'
  isHost: false,
  settings: {
    sessionLength: 30,
    difficulty: 2,
    orgasmChance: 50,
    soundEnabled: true,
  },
  difficultySettings: {
    1: {
      strokeMin: 15000,
      strokeMax: 40000,
      stopMin: 8000,
      stopMax: 20000,
      edgeGain: 8,
      edgeLoss: 3,
    },
    2: {
      strokeMin: 10000,
      strokeMax: 30000,
      stopMin: 5000,
      stopMax: 15000,
      edgeGain: 12,
      edgeLoss: 5,
    },
    3: {
      strokeMin: 5000,
      strokeMax: 20000,
      stopMin: 3000,
      stopMax: 10000,
      edgeGain: 18,
      edgeLoss: 8,
    },
  },
  room: {
    players: [],
    spectators: [],
    settings: {},
  },
};

// Instructions pool
const instructions = {
  stroke: [
    'Stroke Fast!',
    'Stroke Slow',
    'Normal Pace',
    'Lube Up and Stroke',
    'Steady Rhythm',
    'Build the Edge',
    'Keep Going',
    "Don't Stop",
    'Faster Now',
    'Slow and Steady',
  ],
  stop: [
    'Hands Off!',
    'Stop Touching',
    'No Stroking',
    'Hold the Edge',
    'Stay Still',
    "Don't Move",
    'Control Yourself',
    'Wait...',
    'Tease Yourself',
    'Just Watch',
  ],
};

// LiveKit and Socket.io connections
let socket = null;
let room = null;
let localVideoTrack = null;

// DOM Elements
const elements = {
  // Screens
  ageGate: document.getElementById('age-gate'),
  lobbyScreen: document.getElementById('lobby-screen'),
  roomWaitingScreen: document.getElementById('room-waiting-screen'),
  optionsScreen: document.getElementById('options-screen'),
  gameScreen: document.getElementById('game-screen'),

  // Age Gate
  enterBtn: document.getElementById('enter-btn'),
  exitBtn: document.getElementById('exit-btn'),

  // Lobby
  username: document.getElementById('username'),
  createRoomBtn: document.getElementById('create-room-btn'),
  roomCode: document.getElementById('room-code'),
  joinUsername: document.getElementById('join-username'),
  joinRoomBtn: document.getElementById('join-room-btn'),
  soloPlayBtn: document.getElementById('solo-play-btn'),
  lobbyBackBtn: document.getElementById('lobby-back-btn'),

  // Room Waiting
  roomNameDisplay: document.getElementById('room-name-display'),
  roomCodeDisplay: document.getElementById('room-code-display'),
  playerCount: document.getElementById('player-count'),
  spectatorCount: document.getElementById('spectator-count'),
  playersList: document.getElementById('players-list'),
  spectatorsList: document.getElementById('spectators-list'),
  startBattleBtn: document.getElementById('start-battle-btn'),
  leaveRoomBtn: document.getElementById('leave-room-btn'),
  roomSessionLength: document.getElementById('room-session-length'),
  roomSessionLengthValue: document.getElementById('room-session-length-value'),
  roomDifficulty: document.getElementById('room-difficulty'),
  roomDifficultyValue: document.getElementById('room-difficulty-value'),
  roomOrgasmChance: document.getElementById('room-orgasm-chance'),
  roomOrgasmChanceValue: document.getElementById('room-orgasm-chance-value'),
  webcamRequired: document.getElementById('webcam-required'),
  spectatorsAllowed: document.getElementById('spectators-allowed'),

  // Options (Solo)
  backToAgeGate: document.getElementById('back-to-age-gate'),
  startGameBtn: document.getElementById('start-game-btn'),
  sessionLength: document.getElementById('session-length'),
  sessionLengthValue: document.getElementById('session-length-value'),
  difficulty: document.getElementById('difficulty'),
  difficultyValue: document.getElementById('difficulty-value'),
  orgasmChance: document.getElementById('orgasm-chance'),
  orgasmChanceValue: document.getElementById('orgasm-chance-value'),
  soundEnabled: document.getElementById('sound-enabled'),

  // Game
  instruction: document.getElementById('instruction'),
  edgeBar: document.getElementById('edge-bar'),
  edgePercentage: document.getElementById('edge-percentage'),
  timerDisplay: document.getElementById('timer-display'),
  pauseBtn: document.getElementById('pause-btn'),
  failedBtn: document.getElementById('failed-btn'),
  endGameBtn: document.getElementById('end-game-btn'),
  videoGrid: document.getElementById('video-grid'),
  rankingsContainer: document.getElementById('rankings-container'),
  rankingsList: document.getElementById('rankings-list'),

  // End Game
  endOverlay: document.getElementById('end-overlay'),
  endTitle: document.getElementById('end-title'),
  endMessage: document.getElementById('end-message'),
  restartBtn: document.getElementById('restart-btn'),
  optionsBtn: document.getElementById('options-btn'),

  // Chat
  chatSidebar: document.getElementById('chat-sidebar'),
  chatHeader: document.getElementById('chat-header'),
  userCount: document.getElementById('user-count'),
  toggleChat: document.getElementById('toggle-chat'),
  chatMessages: document.getElementById('chat-messages'),
  chatInput: document.getElementById('chat-input'),
  sendBtn: document.getElementById('send-btn'),
  quickReactions: document.getElementById('quick-reactions'),
};

// Initialize
function init() {
  setupEventListeners();
  updateSettingsDisplay();
}

// Event Listeners
function setupEventListeners() {
  // Age gate
  elements.enterBtn.addEventListener('click', () => {
    showScreen('lobby-screen');
  });

  elements.exitBtn.addEventListener('click', () => {
    window.location.href = 'about:blank';
  });

  // Lobby
  elements.createRoomBtn.addEventListener('click', createRoom);
  elements.joinRoomBtn.addEventListener('click', joinRoom);
  elements.soloPlayBtn.addEventListener('click', () => {
    gameState.gameMode = 'solo';
    showScreen('options-screen');
  });
  elements.lobbyBackBtn.addEventListener('click', () => {
    showScreen('age-gate');
  });

  // Room waiting
  elements.startBattleBtn.addEventListener('click', startBattle);
  elements.leaveRoomBtn.addEventListener('click', leaveRoom);
  elements.roomSessionLength.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    elements.roomSessionLengthValue.textContent = value;
    if (gameState.isHost && socket) {
      gameState.room.settings.sessionLength = value;
      socket.emit('gameStateUpdate', { settings: gameState.room.settings });
    }
  });
  elements.roomDifficulty.addEventListener('input', (e) => {
    const diff = parseInt(e.target.value);
    const labels = ['Easy', 'Medium', 'Hard'];
    elements.roomDifficultyValue.textContent = labels[diff - 1];
    if (gameState.isHost && socket) {
      gameState.room.settings.difficulty = diff;
      socket.emit('gameStateUpdate', { settings: gameState.room.settings });
    }
  });
  elements.roomOrgasmChance.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    elements.roomOrgasmChanceValue.textContent = value;
    if (gameState.isHost && socket) {
      gameState.room.settings.orgasmChance = value;
      socket.emit('gameStateUpdate', { settings: gameState.room.settings });
    }
  });

  // Options (Solo)
  elements.backToAgeGate.addEventListener('click', () => {
    showScreen('age-gate');
  });
  elements.startGameBtn.addEventListener('click', () => {
    startGame();
  });
  elements.sessionLength.addEventListener('input', (e) => {
    gameState.settings.sessionLength = parseInt(e.target.value);
    elements.sessionLengthValue.textContent = e.target.value;
  });
  elements.difficulty.addEventListener('input', (e) => {
    const diff = parseInt(e.target.value);
    gameState.settings.difficulty = diff;
    const labels = ['Easy', 'Medium', 'Hard'];
    elements.difficultyValue.textContent = labels[diff - 1];
  });
  elements.orgasmChance.addEventListener('input', (e) => {
    gameState.settings.orgasmChance = parseInt(e.target.value);
    elements.orgasmChanceValue.textContent = e.target.value;
  });
  elements.soundEnabled.addEventListener('change', (e) => {
    gameState.settings.soundEnabled = e.target.checked;
  });

  // Game controls
  elements.pauseBtn.addEventListener('click', togglePause);
  elements.failedBtn.addEventListener('click', handleEarlyOrgasm);
  elements.endGameBtn.addEventListener('click', () => {
    endGame(false, 'Game ended by user');
  });

  // End game overlay
  elements.restartBtn.addEventListener('click', () => {
    resetGame();
    if (gameState.gameMode === 'multiplayer' && socket) {
      startBattle();
    } else {
      startGame();
    }
  });
  elements.optionsBtn.addEventListener('click', () => {
    resetGame();
    if (gameState.gameMode === 'multiplayer') {
      showScreen('room-waiting-screen');
    } else {
      showScreen('options-screen');
    }
  });

  // Chat
  elements.sendBtn.addEventListener('click', sendChatMessage);
  elements.chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });
  elements.toggleChat.addEventListener('click', () => {
    elements.chatSidebar.classList.toggle('open');
  });
  elements.quickReactions.addEventListener('click', (e) => {
    if (e.target.tagName === 'SPAN') {
      sendChatMessage(e.target.textContent);
    }
  });
}

// Screen Management
function showScreen(screenId) {
  elements.ageGate.classList.remove('active');
  elements.lobbyScreen.classList.remove('active');
  elements.roomWaitingScreen.classList.remove('active');
  elements.optionsScreen.classList.remove('active');
  elements.gameScreen.classList.remove('active');

  document.getElementById(screenId).classList.add('active');
  gameState.currentScreen = screenId;
}

// Settings Display
function updateSettingsDisplay() {
  elements.sessionLengthValue.textContent = gameState.settings.sessionLength;
  elements.orgasmChanceValue.textContent = gameState.settings.orgasmChance;
  const labels = ['Easy', 'Medium', 'Hard'];
  elements.difficultyValue.textContent = labels[gameState.settings.difficulty - 1];
}

// Room Management
function generateRoomCode() {
  return 'BATTLE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createRoom() {
  const username = elements.username.value.trim();
  if (!username) {
    alert('Please enter a username');
    return;
  }

  gameState.username = username;
  gameState.roomName = generateRoomCode();
  gameState.role = 'player';
  gameState.isHost = true;
  gameState.gameMode = 'multiplayer';

  await connectSocket();
  await joinLiveKitRoom('player');

  showScreen('room-waiting-screen');
  updateRoomDisplay();
}

async function joinRoom() {
  const roomCode = elements.roomCode.value.trim().toUpperCase();
  const username = elements.joinUsername.value.trim();

  if (!roomCode || !username) {
    alert('Please enter both room code and username');
    return;
  }

  gameState.username = username;
  gameState.roomName = roomCode;
  gameState.role = 'player';
  gameState.isHost = false;
  gameState.gameMode = 'multiplayer';

  await connectSocket();
  await joinLiveKitRoom('player');

  showScreen('room-waiting-screen');
  updateRoomDisplay();
}

function leaveRoom() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  if (room) {
    room.disconnect();
    room = null;
  }
  clearVideoGrid();
  gameState.roomName = null;
  gameState.username = null;
  showScreen('lobby-screen');
}

// Socket.io Connection
async function connectSocket() {
  if (socket) return;

  socket = io(API_URL);

  socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('joinRoom', {
      roomName: gameState.roomName,
      username: gameState.username,
      role: gameState.role,
      settings: gameState.room.settings,
    });
  });

  socket.on('roomUpdate', (data) => {
    gameState.room.players = data.players;
    gameState.room.spectators = data.spectators;
    if (data.settings) {
      gameState.room.settings = data.settings;
    }
    updateRoomDisplay();
  });

  socket.on('systemMessage', (data) => {
    addChatMessage(data.message, 'system');
  });

  socket.on('chatMessage', (data) => {
    addChatMessage(`${data.username}: ${data.message}`, data.isKing ? 'king' : 'normal', data.username);
  });

  socket.on('gameStart', (state) => {
    gameState.isPlaying = true;
    showScreen('game-screen');
    startGame();
  });

  socket.on('gameState', (state) => {
    if (state.isStroking !== undefined) {
      gameState.isStroking = state.isStroking;
      updateGameState(state);
    }
  });

  socket.on('playerUpdate', (data) => {
    updatePlayerRanking(data);
  });

  socket.on('gameEnd', (data) => {
    endGame(true, data.message, data.rankings);
  });
}

// LiveKit Integration
async function joinLiveKitRoom(role) {
  try {
    // Get token from server
    const response = await fetch(`${API_URL}/api/getToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName: gameState.roomName,
        participantName: gameState.username,
        canPublish: role === 'player',
      }),
    });

    const { token, url } = await response.json();

    // Connect to LiveKit room
    const { Room, VideoPresets } = LivekitClient;
    room = new Room();

    await room.connect(url, token);

    // Enable camera and microphone for players
    if (role === 'player') {
      localVideoTrack = await room.localParticipant.enableCameraAndMicrophone();
      addLocalVideo(localVideoTrack);
    }

    // Handle remote participants
    room.on('participantConnected', (participant) => {
      participant.on('trackSubscribed', (track, publication, participant) => {
        if (track.kind === 'video') {
          addRemoteVideo(track, participant);
        }
      });
    });

    // Handle existing participants
    room.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((publication) => {
        if (publication.kind === 'video' && publication.isSubscribed) {
          addRemoteVideo(publication.track, participant);
        }
      });
    });
  } catch (error) {
    console.error('Failed to join LiveKit room:', error);
    alert('Failed to connect to video room. Please check your camera permissions.');
  }
}

function addLocalVideo(track) {
  const video = document.createElement('video');
  video.srcObject = new MediaStream([track.mediaStreamTrack]);
  video.autoplay = true;
  video.muted = true;
  video.classList.add('local');

  const container = document.createElement('div');
  container.className = 'video-item local';
  container.appendChild(video);

  const label = document.createElement('div');
  label.className = 'video-label';
  label.textContent = `${gameState.username} (You)`;
  container.appendChild(label);

  elements.videoGrid.appendChild(container);
}

function addRemoteVideo(track, participant) {
  const video = document.createElement('video');
  video.srcObject = new MediaStream([track.mediaStreamTrack]);
  video.autoplay = true;

  const container = document.createElement('div');
  container.className = 'video-item';
  container.dataset.participantId = participant.identity;
  container.appendChild(video);

  const label = document.createElement('div');
  label.className = 'video-label';
  label.textContent = participant.identity || 'Player';
  container.appendChild(label);

  elements.videoGrid.appendChild(container);
}

function clearVideoGrid() {
  elements.videoGrid.innerHTML = '';
}

function updateRoomDisplay() {
  if (!gameState.roomName) return;

  elements.roomNameDisplay.textContent = gameState.roomName;
  elements.roomCodeDisplay.textContent = gameState.roomName;

  const playerCount = gameState.room.players.length;
  const spectatorCount = gameState.room.spectators.length;

  elements.playerCount.textContent = playerCount;
  elements.spectatorCount.textContent = spectatorCount;

  // Update players list
  elements.playersList.innerHTML = '';
  gameState.room.players.forEach((player) => {
    const item = document.createElement('div');
    item.className = 'player-item';
    if (player.failed) item.classList.add('failed');
    item.textContent = player.username;
    elements.playersList.appendChild(item);
  });

  // Update spectators list
  elements.spectatorsList.innerHTML = '';
  gameState.room.spectators.forEach((spectator) => {
    const item = document.createElement('div');
    item.className = 'spectator-item';
    item.textContent = spectator.username;
    elements.spectatorsList.appendChild(item);
  });

  // Update user count in chat
  elements.userCount.textContent = playerCount + spectatorCount;

  // Enable/disable start button
  if (gameState.isHost) {
    elements.startBattleBtn.disabled = playerCount < 2;
  } else {
    elements.startBattleBtn.style.display = 'none';
  }

  // Update settings display
  if (gameState.room.settings.sessionLength) {
    elements.roomSessionLength.value = gameState.room.settings.sessionLength;
    elements.roomSessionLengthValue.textContent = gameState.room.settings.sessionLength;
  }
  if (gameState.room.settings.difficulty) {
    elements.roomDifficulty.value = gameState.room.settings.difficulty;
    const labels = ['Easy', 'Medium', 'Hard'];
    elements.roomDifficultyValue.textContent = labels[gameState.room.settings.difficulty - 1];
  }
  if (gameState.room.settings.orgasmChance !== undefined) {
    elements.roomOrgasmChance.value = gameState.room.settings.orgasmChance;
    elements.roomOrgasmChanceValue.textContent = gameState.room.settings.orgasmChance;
  }
}

function startBattle() {
  if (!gameState.isHost || !socket) return;

  const settings = {
    sessionLength: parseInt(elements.roomSessionLength.value),
    difficulty: parseInt(elements.roomDifficulty.value),
    orgasmChance: parseInt(elements.roomOrgasmChance.value),
  };

  gameState.room.settings = settings;
  socket.emit('startGame');
}

// Chat Functions
function sendChatMessage(message = null) {
  if (!socket) return;

  const msg = message || elements.chatInput.value.trim();
  if (!msg) return;

  socket.emit('chatMessage', { message: msg });
  if (!message) {
    elements.chatInput.value = '';
  }
}

function addChatMessage(message, type = 'normal', username = '') {
  const div = document.createElement('div');
  div.className = `message ${type}`;

  if (type === 'system') {
    div.textContent = message;
  } else {
    const parts = message.split(':');
    if (parts.length > 1) {
      const userSpan = document.createElement('span');
      userSpan.className = 'username';
      userSpan.textContent = parts[0] + ':';
      div.appendChild(userSpan);
      div.appendChild(document.createTextNode(parts.slice(1).join(':')));
    } else {
      div.textContent = message;
    }
  }

  elements.chatMessages.appendChild(div);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Game Functions (Solo and Multiplayer)
function startGame() {
  gameState.isPlaying = true;
  gameState.isPaused = false;
  gameState.edgeLevel = 0;
  gameState.isStroking = false;

  showScreen('game-screen');
  elements.endOverlay.classList.add('hidden');
  elements.rankingsContainer.classList.add('hidden');

  // Hide video grid in solo mode
  if (gameState.gameMode === 'solo') {
    elements.videoGrid.style.display = 'none';
  } else {
    elements.videoGrid.style.display = 'grid';
  }

  // Calculate session end time
  const sessionLength = gameState.gameMode === 'multiplayer'
    ? gameState.room.settings.sessionLength
    : gameState.settings.sessionLength;
  const sessionMs = sessionLength * 60 * 1000;
  gameState.sessionEndTime = Date.now() + sessionMs;

  // Start session timer
  startSessionTimer();

  // Start first state change
  if (gameState.gameMode === 'solo') {
    changeState();
  } else if (gameState.isHost) {
    changeState();
  }

  // Try to enter fullscreen
  tryEnterFullscreen();
}

function tryEnterFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch(() => {});
  }
}

function startSessionTimer() {
  updateSessionTimer();
  gameState.sessionTimer = setInterval(updateSessionTimer, 1000);
}

function updateSessionTimer() {
  if (!gameState.isPlaying || gameState.isPaused) return;

  const remaining = gameState.sessionEndTime - Date.now();

  if (remaining <= 0) {
    endGame(true, 'Session complete!');
    return;
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  elements.timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function changeState() {
  if (!gameState.isPlaying || gameState.isPaused) return;

  gameState.isStroking = !gameState.isStroking;
  const settings = gameState.gameMode === 'multiplayer'
    ? gameState.room.settings
    : gameState.settings;
  const diff = gameState.difficultySettings[settings.difficulty];

  if (gameState.isStroking) {
    elements.gameScreen.className = 'screen active stroke-state';
    const randomInstruction = instructions.stroke[Math.floor(Math.random() * instructions.stroke.length)];
    elements.instruction.textContent = randomInstruction;

    const edgeGain = diff.edgeGain + (gameState.edgeLevel / 100) * 5;
    updateEdge(edgeGain);

    const baseTime = diff.strokeMin + Math.random() * (diff.strokeMax - diff.strokeMin);
    const escalationFactor = 1 - (gameState.edgeLevel / 200);
    const nextTime = Math.max(3000, baseTime * escalationFactor);

    gameState.timer = setTimeout(changeState, nextTime);

    if (gameState.settings.soundEnabled) {
      playSound('stroke');
    }
  } else {
    elements.gameScreen.className = 'screen active stop-state';
    const randomInstruction = instructions.stop[Math.floor(Math.random() * instructions.stop.length)];
    elements.instruction.textContent = randomInstruction;

    updateEdge(-diff.edgeLoss);

    const baseTime = diff.stopMin + Math.random() * (diff.stopMax - diff.stopMin);
    const nextTime = Math.max(2000, baseTime);

    gameState.timer = setTimeout(changeState, nextTime);

    if (gameState.settings.soundEnabled) {
      playSound('stop');
    }
  }

  // Broadcast state in multiplayer
  if (gameState.gameMode === 'multiplayer' && socket && gameState.isHost) {
    socket.emit('gameStateUpdate', {
      isStroking: gameState.isStroking,
      instruction: elements.instruction.textContent,
    });
  }
}

function updateGameState(state) {
  if (state.isStroking !== undefined) {
    gameState.isStroking = state.isStroking;
    elements.gameScreen.className = gameState.isStroking
      ? 'screen active stroke-state'
      : 'screen active stop-state';
  }
  if (state.instruction) {
    elements.instruction.textContent = state.instruction;
  }
}

function updateEdge(amount) {
  gameState.edgeLevel = Math.max(0, Math.min(100, gameState.edgeLevel + amount));
  elements.edgeBar.style.width = gameState.edgeLevel + '%';
  elements.edgePercentage.textContent = Math.round(gameState.edgeLevel);

  // Broadcast in multiplayer
  if (gameState.gameMode === 'multiplayer' && socket) {
    socket.emit('playerUpdate', {
      edgeLevel: gameState.edgeLevel,
      failed: false,
    });
  }

  if (gameState.edgeLevel >= 100) {
    handleEdgeReached();
  }
}

function handleEdgeReached() {
  clearTimeout(gameState.timer);

  const settings = gameState.gameMode === 'multiplayer'
    ? gameState.room.settings
    : gameState.settings;
  const roll = Math.random() * 100;
  const allowOrgasm = roll < settings.orgasmChance;

  if (allowOrgasm) {
    endGame(true, 'Cum now! Release yourself!');
  } else {
    endGame(false, 'Denied! No cum for you. Stay on edge.');
    setTimeout(() => {
      gameState.edgeLevel = 20;
      updateEdge(0);
      if (gameState.isPlaying && !gameState.isPaused) {
        changeState();
      }
    }, 3000);
  }
}

function togglePause() {
  gameState.isPaused = !gameState.isPaused;

  if (gameState.isPaused) {
    clearTimeout(gameState.timer);
    elements.pauseBtn.textContent = 'Resume';
    elements.instruction.textContent = 'Paused';
  } else {
    elements.pauseBtn.textContent = 'Pause';
    changeState();
  }
}

function handleEarlyOrgasm() {
  if (gameState.gameMode === 'multiplayer' && socket) {
    socket.emit('playerFailed');
  }
  endGame(false, 'Ruined orgasm! Let it dribble out slowly. No satisfaction for you.');
}

function endGame(allowOrgasm, message, rankings = null) {
  gameState.isPlaying = false;
  clearTimeout(gameState.timer);
  clearInterval(gameState.sessionTimer);

  if (gameState.gameMode === 'multiplayer' && socket && gameState.isHost) {
    socket.emit('endGame');
  }

  elements.endTitle.textContent = allowOrgasm ? 'Release!' : 'Game Over';
  elements.endMessage.textContent = message;

  // Show rankings if multiplayer
  if (rankings && rankings.length > 0) {
    elements.rankingsContainer.classList.remove('hidden');
    elements.rankingsList.innerHTML = '';
    rankings.forEach((rank) => {
      const item = document.createElement('div');
      item.className = `ranking-item rank-${rank.rank === 1 ? '1' : ''}`;
      item.innerHTML = `
        <span class="rank">#${rank.rank}</span>
        <span class="username">${rank.username}</span>
        <span class="edge-level">${Math.round(rank.edgeLevel)}%</span>
      `;
      elements.rankingsList.appendChild(item);
    });
  }

  elements.endOverlay.classList.remove('hidden');

  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}

function updatePlayerRanking(data) {
  // Update player display in video grid or rankings
  const player = gameState.room.players.find((p) => p.id === data.playerId);
  if (player) {
    player.edgeLevel = data.edgeLevel;
    player.failed = data.failed;
  }
}

function resetGame() {
  gameState.isPlaying = false;
  gameState.isPaused = false;
  gameState.edgeLevel = 0;
  gameState.isStroking = false;

  clearTimeout(gameState.timer);
  clearInterval(gameState.sessionTimer);

  elements.edgeBar.style.width = '0%';
  elements.edgePercentage.textContent = '0';
  elements.instruction.textContent = 'Get Ready...';
  elements.timerDisplay.textContent = '00:00';
  elements.gameScreen.className = 'screen active';
  elements.pauseBtn.textContent = 'Pause';
}

// Sound Effects
function playSound(type) {
  if (!gameState.settings.soundEnabled) return;

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (type === 'stroke') {
    oscillator.frequency.value = 400;
    oscillator.type = 'sine';
  } else if (type === 'stop') {
    oscillator.frequency.value = 200;
    oscillator.type = 'square';
  }

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
