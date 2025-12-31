// Configuration - loaded from config.js
const API_URL =
  (window.APP_CONFIG && window.APP_CONFIG.API_URL) || "http://localhost:8181";

// Feature Flags
const FEATURES = (window.APP_CONFIG && window.APP_CONFIG.FEATURES) || {
  PHASE2_PROFILES: false,
};
window.FEATURES = FEATURES;

// Game State
const gameState = {
  currentScreen: "age-gate",
  isPlaying: false,
  isPaused: false,
  edgeLevel: 0,
  isStroking: false,
  timer: null,
  sessionTimer: null,
  sessionEndTime: null,
  gameMode: "solo", // 'solo' or 'multiplayer'
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
  phase: "warmup", // 'warmup', 'playing', 'cumming', 'denied'
  sessionStartTime: null,
  sessionProgress: 0, // 0-1, how far through the session
  gameType: "redlight", // Main game: 'redlight' (BATOR BATTLE EDGING), or alternatives: 'dicedare', 'batecards', 'battleship', 'blitzedout', 'video-edging', 'hypno'
  mediaUrl: null,
  profile: null, // User profile (Phase 2)
  friends: [], // Friends list (Phase 2)
  blockedUsers: [], // Blocked users list (Phase 2)
};
window.gameState = gameState;

// Instructions pool from gamescreens.md
// Instructions pool loaded from gamescreens.js
const instructions = window.GAME_INSTRUCTIONS || {
  stroke: ["Stroke"],
  stop: ["Stop"],
  denied: ["Denied"],
  cum: ["Cum"],
};

// LiveKit and Socket.io connections
let socket = null;
let room = null;
let localVideoTrack = null;

// DOM Elements
const elements = {
  // Screens
  ageGate: document.getElementById("age-gate"),
  lobbyScreen: document.getElementById("lobby-screen"),
  roomWaitingScreen: document.getElementById("room-waiting-screen"),
  optionsScreen: document.getElementById("options-screen"),
  gameScreen: document.getElementById("game-screen"),

  // Age Gate
  enterBtn: document.getElementById("enter-btn"),
  exitBtn: document.getElementById("exit-btn"),

  // Lobby
  username: document.getElementById("username"),
  createRoomBtn: document.getElementById("create-room-btn"),
  roomCode: document.getElementById("room-code"),
  joinUsername: document.getElementById("join-username"),
  joinRoomBtn: document.getElementById("join-room-btn"),
  soloPlayBtn: document.getElementById("solo-play-btn"),
  lobbyBackBtn: document.getElementById("lobby-back-btn"),

  // Room Waiting
  roomNameDisplay: document.getElementById("room-name-display"),
  roomCodeDisplay: document.getElementById("room-code-display"),
  playerCount: document.getElementById("player-count"),
  spectatorCount: document.getElementById("spectator-count"),
  playersList: document.getElementById("players-list"),
  spectatorsList: document.getElementById("spectators-list"),
  startBattleBtn: document.getElementById("start-battle-btn"),
  leaveRoomBtn: document.getElementById("leave-room-btn"),
  roomSessionLength: document.getElementById("room-session-length"),
  roomSessionLengthValue: document.getElementById("room-session-length-value"),
  roomDifficulty: document.getElementById("room-difficulty"),
  roomDifficultyValue: document.getElementById("room-difficulty-value"),
  roomOrgasmChance: document.getElementById("room-orgasm-chance"),
  roomOrgasmChanceValue: document.getElementById("room-orgasm-chance-value"),
  roomGameType: document.getElementById("room-game-type"),
  mediaInputGroup: document.getElementById("media-input-group"),
  mediaUrl: document.getElementById("media-url"),
  mediaFile: document.getElementById("media-file"),
  loadMediaBtn: document.getElementById("load-media-btn"),
  webcamRequired: document.getElementById("webcam-required"),
  spectatorsAllowed: document.getElementById("spectators-allowed"),

  // Options (Solo)
  backToAgeGate: document.getElementById("back-to-age-gate"),
  startGameBtn: document.getElementById("start-game-btn"),
  sessionLength: document.getElementById("session-length"),
  sessionLengthValue: document.getElementById("session-length-value"),
  difficulty: document.getElementById("difficulty"),
  difficultyValue: document.getElementById("difficulty-value"),
  orgasmChance: document.getElementById("orgasm-chance"),
  orgasmChanceValue: document.getElementById("orgasm-chance-value"),
  soundEnabled: document.getElementById("sound-enabled"),

  // Game
  instruction: document.getElementById("instruction"),
  edgeBar: document.getElementById("edge-bar"),
  edgeBarContainer: document.getElementById("edge-bar-container"),
  edgePercentage: document.getElementById("edge-percentage"),
  timerDisplay: document.getElementById("timer-display"),
  progressContainer: document.getElementById("progress-container"),
  externalGameContainer: document.getElementById("external-game-container"),
  externalGameFrame: document.getElementById("external-game-frame"),
  videoEdgingContainer: document.getElementById("video-edging-container"),
  edgingVideoPlayer: document.getElementById("edging-video-player"),
  hypnoContainer: document.getElementById("hypno-container"),
  hypnoSpiral: document.getElementById("hypno-spiral"),
  hypnoAudioPlayer: document.getElementById("hypno-audio-player"),
  hypnoPlayPause: document.getElementById("hypno-play-pause"),
  hypnoSpeed: document.getElementById("hypno-speed"),
  hypnoSpeedValue: document.getElementById("hypno-speed-value"),

  pauseBtn: document.getElementById("pause-btn"),
  failedBtn: document.getElementById("failed-btn"),
  endGameBtn: document.getElementById("end-game-btn"),
  videoGrid: document.getElementById("video-grid"),
  rankingsContainer: document.getElementById("rankings-container"),
  rankingsList: document.getElementById("rankings-list"),

  // End Game
  endOverlay: document.getElementById("end-overlay"),
  endTitle: document.getElementById("end-title"),
  endMessage: document.getElementById("end-message"),
  restartBtn: document.getElementById("restart-btn"),
  optionsBtn: document.getElementById("options-btn"),

  // Chat
  chatSidebar: document.getElementById("chat-sidebar"),
  chatHeader: document.getElementById("chat-header"),
  userCount: document.getElementById("user-count"),
  toggleChat: document.getElementById("toggle-chat"),
  chatMessages: document.getElementById("chat-messages"),
  chatInput: document.getElementById("chat-input"),
  sendBtn: document.getElementById("send-btn"),
  quickReactions: document.getElementById("quick-reactions"),
  chatToggleBtn: document.getElementById("chat-toggle-btn"),
};

// Initialize
function init() {
  setupEventListeners();
  updateSettingsDisplay();
}

// Event Listeners
function setupEventListeners() {
  // Age gate
  elements.enterBtn.addEventListener("click", () => {
    // Phase 2: Check for profile if enabled
    if (FEATURES.PHASE2_PROFILES && window.ProfileSystem) {
      const profile = ProfileSystem.loadProfile();
      if (!profile) {
        showScreen("profile-screen");
        return;
      }
    }
    showScreen("lobby-screen");
  });

  elements.exitBtn.addEventListener("click", () => {
    window.location.href = "about:blank";
  });

  // Lobby
  elements.createRoomBtn.addEventListener("click", createRoom);
  elements.joinRoomBtn.addEventListener("click", joinRoom);
  elements.soloPlayBtn.addEventListener("click", () => {
    gameState.gameMode = "solo";
    showScreen("options-screen");
  });
  elements.lobbyBackBtn.addEventListener("click", () => {
    showScreen("age-gate");
  });

  // Room waiting
  elements.startBattleBtn.addEventListener("click", startBattle);
  elements.leaveRoomBtn.addEventListener("click", leaveRoom);
  elements.roomSessionLength.addEventListener("change", (e) => {
    const value = parseInt(e.target.value);
    if (gameState.isHost && socket) {
      gameState.room.settings.sessionLength = value;
      socket.emit("gameStateUpdate", { settings: gameState.room.settings });
    }
  });
  elements.roomDifficulty.addEventListener("input", (e) => {
    const diff = parseInt(e.target.value);
    const labels = ["Easy", "Medium", "Hard"];
    elements.roomDifficultyValue.textContent = labels[diff - 1];
    if (gameState.isHost && socket) {
      gameState.room.settings.difficulty = diff;
      socket.emit("gameStateUpdate", { settings: gameState.room.settings });
    }
  });
  elements.roomOrgasmChance.addEventListener("input", (e) => {
    const value = parseInt(e.target.value);
    elements.roomOrgasmChanceValue.textContent = value;
    if (gameState.isHost && socket) {
      gameState.room.settings.orgasmChance = value;
      socket.emit("gameStateUpdate", { settings: gameState.room.settings });
    }
  });
  elements.roomGameType.addEventListener("change", (e) => {
    const gameType = e.target.value;
    gameState.gameType = gameType;

    // Show/hide edging settings (only for redlight game)
    const edgingSettingsGroup = document.getElementById("edging-settings-group");
    if (edgingSettingsGroup) {
      if (gameType === "redlight") {
        edgingSettingsGroup.style.display = "block";
      } else {
        edgingSettingsGroup.style.display = "none";
      }
    }

    // Show/hide media input for video-edging and hypno
    if (gameType === "video-edging" || gameType === "hypno") {
      elements.mediaInputGroup.style.display = "block";
    } else {
      elements.mediaInputGroup.style.display = "none";
    }

    if (gameState.isHost && socket) {
      gameState.room.settings.gameType = gameType;
      socket.emit("gameStateUpdate", { settings: gameState.room.settings });
    }
  });
  elements.loadMediaBtn.addEventListener("click", loadMedia);
  elements.mediaFile.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      gameState.mediaUrl = url;
      elements.mediaUrl.value = url;
    }
  });

  // Options (Solo)
  elements.backToAgeGate.addEventListener("click", () => {
    showScreen("age-gate");
  });
  elements.startGameBtn.addEventListener("click", () => {
    startGame();
  });
  elements.sessionLength.addEventListener("change", (e) => {
    gameState.settings.sessionLength = parseInt(e.target.value);
  });
  elements.difficulty.addEventListener("input", (e) => {
    const diff = parseInt(e.target.value);
    gameState.settings.difficulty = diff;
    const labels = ["Easy", "Medium", "Hard"];
    elements.difficultyValue.textContent = labels[diff - 1];
  });
  elements.orgasmChance.addEventListener("input", (e) => {
    gameState.settings.orgasmChance = parseInt(e.target.value);
    elements.orgasmChanceValue.textContent = e.target.value;
  });
  elements.soundEnabled.addEventListener("change", (e) => {
    gameState.settings.soundEnabled = e.target.checked;
  });

  // Game controls
  elements.pauseBtn.addEventListener("click", togglePause);
  elements.failedBtn.addEventListener("click", handleEarlyOrgasm);
  elements.endGameBtn.addEventListener("click", () => {
    endGame(false, "Game ended by user");
  });

  // End game overlay
  elements.restartBtn.addEventListener("click", () => {
    resetGame();
    if (gameState.gameMode === "multiplayer" && socket) {
      startBattle();
    } else {
      startGame();
    }
  });
  elements.optionsBtn.addEventListener("click", () => {
    resetGame();
    if (gameState.gameMode === "multiplayer") {
      showScreen("room-waiting-screen");
    } else {
      showScreen("options-screen");
    }
  });

  // Chat
  elements.sendBtn.addEventListener("click", sendChatMessage);
  elements.chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendChatMessage();
    }
  });
  const handleChatToggle = () => {
    if (window.innerWidth <= 768) {
      elements.chatSidebar.classList.toggle("open");
    } else {
      elements.chatSidebar.classList.toggle("collapsed");
    }
  };

  elements.toggleChat.addEventListener("click", handleChatToggle);
  if (elements.chatToggleBtn) {
    elements.chatToggleBtn.addEventListener("click", handleChatToggle);
  }
  elements.quickReactions.addEventListener("click", (e) => {
    if (e.target.tagName === "SPAN") {
      sendChatMessage(e.target.textContent);
    }
  });
}

// Screen Management
function showScreen(screenId) {
  elements.ageGate.classList.remove("active");
  elements.lobbyScreen.classList.remove("active");
  elements.roomWaitingScreen.classList.remove("active");
  elements.optionsScreen.classList.remove("active");
  elements.gameScreen.classList.remove("active");

  document.getElementById(screenId).classList.add("active");
  gameState.currentScreen = screenId;
}

// Settings Display
function updateSettingsDisplay() {
  elements.sessionLength.value = gameState.settings.sessionLength;
  elements.orgasmChanceValue.textContent = gameState.settings.orgasmChance;
  const labels = ["Easy", "Medium", "Hard"];
  elements.difficultyValue.textContent =
    labels[gameState.settings.difficulty - 1];
}

// Room Management
function generateRoomCode() {
  return "BATTLE-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createRoom() {
  const username = elements.username.value.trim();
  if (!username) {
    alert("Please enter a username");
    return;
  }

  gameState.username = username;
  gameState.roomName = generateRoomCode();
  gameState.role = "player";
  gameState.isHost = true;
  gameState.gameMode = "multiplayer";

  await connectSocket();
  await joinLiveKitRoom("player");

  showScreen("room-waiting-screen");
  updateRoomDisplay();
}

async function joinRoom() {
  const roomCode = elements.roomCode.value.trim().toUpperCase();
  const username = elements.joinUsername.value.trim();

  if (!roomCode || !username) {
    alert("Please enter both room code and username");
    return;
  }

  gameState.username = username;
  gameState.roomName = roomCode;
  gameState.role = "player";
  gameState.isHost = false;
  gameState.gameMode = "multiplayer";

  await connectSocket();
  await joinLiveKitRoom("player");

  showScreen("room-waiting-screen");
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
  showScreen("lobby-screen");
}

// Socket.io Connection
async function connectSocket() {
  if (socket) return;

  socket = io(API_URL);

  socket.on("connect", () => {
    console.log("Connected to server");
    socket.emit("joinRoom", {
      roomName: gameState.roomName,
      username: gameState.username,
      role: gameState.role,
      settings: gameState.room.settings,
      profile: gameState.profile, // Phase 2: Send profile
    });
  });

  socket.on("roomUpdate", (data) => {
    gameState.room.players = data.players;
    gameState.room.spectators = data.spectators;
    if (data.settings) {
      gameState.room.settings = data.settings;
    }
    updateRoomDisplay();
  });

  socket.on("systemMessage", (data) => {
    addChatMessage(data.message, "system");
  });

  socket.on("chatMessage", (data) => {
    addChatMessage(
      `${data.username}: ${data.message}`,
      data.isKing ? "king" : "normal",
      data.username
    );
  });

  socket.on("gameStart", (state) => {
    gameState.isPlaying = true;
    // Update game type from server if provided
    if (state.gameType) {
      gameState.gameType = state.gameType;
      if (gameState.room) {
        gameState.room.settings.gameType = state.gameType;
      }
    }
    showScreen("game-screen");
    startGame();
  });

  socket.on("gameState", (state) => {
    if (state.isStroking !== undefined) {
      gameState.isStroking = state.isStroking;
      updateGameState(state);
    }
  });

  socket.on("playerUpdate", (data) => {
    updatePlayerRanking(data);
  });

  socket.on("onlineUsersUpdate", (users) => {
    if (window.ProfileSystem && window.ProfileSystem.updateOnlineUsers) {
      window.ProfileSystem.updateOnlineUsers(users);
    }
  });

  socket.on("gameEnd", (data) => {
    endGame(true, data.message, data.rankings);
  });
}

// Request camera and microphone permissions
async function requestMediaPermissions() {
  try {
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        "Your browser does not support camera and microphone access."
      );
    }

    // Request permissions explicitly
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // Stop the stream immediately - we just needed to get permission
    stream.getTracks().forEach((track) => track.stop());

    return true;
  } catch (error) {
    console.error("Permission request failed:", error);

    if (
      error.name === "NotAllowedError" ||
      error.name === "PermissionDeniedError"
    ) {
      throw new Error(
        "Camera and microphone permissions were denied. Please allow access in your browser settings and try again."
      );
    } else if (
      error.name === "NotFoundError" ||
      error.name === "DevicesNotFoundError"
    ) {
      throw new Error(
        "No camera or microphone found. Please connect a device and try again."
      );
    } else if (
      error.name === "NotReadableError" ||
      error.name === "TrackStartError"
    ) {
      throw new Error(
        "Camera or microphone is already in use by another application. Please close other applications and try again."
      );
    } else {
      throw new Error(
        `Failed to access camera and microphone: ${error.message}`
      );
    }
  }
}

// LiveKit Integration
async function joinLiveKitRoom(role) {
  try {
    // Request camera and microphone permissions first (for players)
    if (role === "player") {
      await requestMediaPermissions();
    }

    // Get token from server
    const response = await fetch(`${API_URL}/api/getToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName: gameState.roomName,
        participantName: gameState.username,
        canPublish: role === "player",
      }),
    });

    const { token, url } = await response.json();

    // Connect to LiveKit room
    const { Room, VideoPresets } = LivekitClient;
    room = new Room();

    await room.connect(url, token);

    // Enable camera and microphone for players
    if (role === "player") {
      try {
        const publications =
          await room.localParticipant.enableCameraAndMicrophone();
        // enableCameraAndMicrophone() returns an object with videoTrackPublication and audioTrackPublication
        if (publications && publications.videoTrackPublication) {
          localVideoTrack = publications.videoTrackPublication.track;
        } else if (publications && publications.videoTrack) {
          localVideoTrack = publications.videoTrack;
        } else if (publications && publications.track) {
          localVideoTrack = publications.track;
        } else {
          // Try to get video track from local participant's video track publications
          const videoPub = room.localParticipant.videoTrackPublications
            .values()
            .next().value;
          if (videoPub && videoPub.track) {
            localVideoTrack = videoPub.track;
          }
        }

        if (localVideoTrack) {
          addLocalVideo(localVideoTrack);
        } else {
          console.error("Failed to get local video track", publications);
        }
      } catch (error) {
        console.error("Error enabling camera:", error);
      }
    }

    // Handle remote participants
    room.on("participantConnected", (participant) => {
      participant.on("trackSubscribed", (track, publication, participant) => {
        if (track.kind === "video") {
          addRemoteVideo(track, participant);
        }
      });
    });

    // Handle existing participants
    room.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((publication) => {
        if (publication.kind === "video" && publication.isSubscribed) {
          addRemoteVideo(publication.track, participant);
        }
      });
    });
  } catch (error) {
    console.error("Failed to join LiveKit room:", error);

    // Show user-friendly error message
    const errorMessage =
      error.message ||
      "Failed to connect to video room. Please check your camera permissions.";
    alert(errorMessage);

    // Return to lobby if connection fails
    if (gameState.gameMode === "multiplayer") {
      leaveRoom();
    }
  }
}

function addLocalVideo(track) {
  if (!track) {
    console.error("addLocalVideo: track is undefined");
    return;
  }

  const video = document.createElement("video");

  // LiveKit tracks have a mediaStreamTrack property or can be attached directly
  try {
    if (track.attach) {
      // Use LiveKit's attach method if available
      track.attach(video);
    } else if (track.mediaStreamTrack) {
      video.srcObject = new MediaStream([track.mediaStreamTrack]);
    } else if (track instanceof MediaStreamTrack) {
      video.srcObject = new MediaStream([track]);
    } else {
      console.error("addLocalVideo: Unable to attach track", track);
      return;
    }
  } catch (error) {
    console.error("addLocalVideo: Error attaching track", error, track);
    return;
  }

  video.autoplay = true;
  video.muted = true;
  video.classList.add("local");

  const container = document.createElement("div");
  container.className = "video-item local";
  container.appendChild(video);

  const label = document.createElement("div");
  label.className = "video-label";
  label.textContent = `${gameState.username} (You)`;
  container.appendChild(label);

  elements.videoGrid.appendChild(container);
}

function addRemoteVideo(track, participant) {
  if (!track) {
    console.error("addRemoteVideo: track is undefined");
    return;
  }

  const video = document.createElement("video");

  // LiveKit tracks have an attach method or mediaStreamTrack property
  try {
    if (track.attach) {
      // Use LiveKit's attach method if available
      track.attach(video);
    } else if (track.mediaStreamTrack) {
      video.srcObject = new MediaStream([track.mediaStreamTrack]);
    } else if (track instanceof MediaStreamTrack) {
      video.srcObject = new MediaStream([track]);
    } else {
      console.error("addRemoteVideo: Unable to attach track", track);
      return;
    }
  } catch (error) {
    console.error("addRemoteVideo: Error attaching track", error, track);
    return;
  }

  video.autoplay = true;

  const container = document.createElement("div");
  container.className = "video-item";
  container.dataset.participantId = participant.identity;
  container.appendChild(video);

  const label = document.createElement("div");
  label.className = "video-label";
  label.textContent = participant.identity || "Player";
  container.appendChild(label);

  elements.videoGrid.appendChild(container);
}

function clearVideoGrid() {
  elements.videoGrid.innerHTML = "";
}

function updateRoomDisplay() {
  // Show/hide edging settings based on game type
  const gameType = gameState.room.settings.gameType || "redlight";
  const edgingSettingsGroup = document.getElementById("edging-settings-group");
  if (edgingSettingsGroup) {
    if (gameType === "redlight") {
      edgingSettingsGroup.style.display = "block";
    } else {
      edgingSettingsGroup.style.display = "none";
    }
  }

  // Show/hide media input based on game type
  if (gameType === "video-edging" || gameType === "hypno") {
    elements.mediaInputGroup.style.display = "block";
  } else {
    elements.mediaInputGroup.style.display = "none";
  }

  // Update game type selector
  if (gameState.room.settings.gameType) {
    elements.roomGameType.value = gameState.room.settings.gameType;
  }
  if (!gameState.roomName) return;

  elements.roomNameDisplay.textContent = gameState.roomName;
  elements.roomCodeDisplay.textContent = gameState.roomName;

  const playerCount = gameState.room.players.length;
  const spectatorCount = gameState.room.spectators.length;

  elements.playerCount.textContent = playerCount;
  elements.spectatorCount.textContent = spectatorCount;

  // Update players list
  elements.playersList.innerHTML = "";
  gameState.room.players.forEach((player) => {
    const item = document.createElement("div");
    item.className = "player-item";
    if (player.failed) item.classList.add("failed");
    item.textContent = player.username;
    elements.playersList.appendChild(item);
  });

  // Update spectators list
  elements.spectatorsList.innerHTML = "";
  gameState.room.spectators.forEach((spectator) => {
    const item = document.createElement("div");
    item.className = "spectator-item";
    item.textContent = spectator.username;
    elements.spectatorsList.appendChild(item);
  });

  // Update user count in chat
  elements.userCount.textContent = playerCount + spectatorCount;

  // Enable/disable start button
  if (gameState.isHost) {
    const gameType = gameState.room.settings.gameType || "redlight";
    // Only require 2 players for edging game
    // Allow starting with 1 player for testing
    elements.startBattleBtn.disabled = playerCount < 1;
  } else {
    elements.startBattleBtn.style.display = "none";
  }

  // Update settings display
  if (gameState.room.settings.sessionLength) {
    elements.roomSessionLength.value = gameState.room.settings.sessionLength;
  }
  if (gameState.room.settings.difficulty) {
    elements.roomDifficulty.value = gameState.room.settings.difficulty;
    const labels = ["Easy", "Medium", "Hard"];
    elements.roomDifficultyValue.textContent =
      labels[gameState.room.settings.difficulty - 1];
  }
  if (gameState.room.settings.orgasmChance !== undefined) {
    elements.roomOrgasmChance.value = gameState.room.settings.orgasmChance;
    elements.roomOrgasmChanceValue.textContent =
      gameState.room.settings.orgasmChance;
  }
}

function startBattle() {
  console.log("startBattle called", {
    isHost: gameState.isHost,
    socket: !!socket,
    socketConnected: socket?.connected,
    playerCount: gameState.room?.players?.length || 0,
  });

  if (!gameState.isHost) {
    console.error("Cannot start battle: User is not the host");
    alert("Only the room host can start the battle");
    return;
  }

  if (!socket) {
    console.error("Cannot start battle: Socket not connected");
    alert("Not connected to server. Please refresh the page.");
    return;
  }

  if (!socket.connected) {
    console.error("Cannot start battle: Socket not connected");
    alert("Connection lost. Please refresh the page.");
    return;
  }

  const gameType = elements.roomGameType?.value || "redlight";
  const playerCount = gameState.room?.players?.length || 0;


  if (playerCount < 1) {
    console.error("Cannot start battle: Need at least 1 player");
    alert("You need at least 1 player to start a battle");
    return;
  }

  // Build settings object
  const settings = {
    gameType: gameType,
  };

  // Only add edging-specific settings if it's the edging game
  if (gameType === "redlight") {
    settings.sessionLength = parseInt(elements.roomSessionLength.value) || 30;
    settings.difficulty = parseInt(elements.roomDifficulty.value) || 2;
    settings.orgasmChance = parseInt(elements.roomOrgasmChance.value) || 50;
  }

  // Save media URL if set (for video-edging or hypno)
  if (gameType === "video-edging" || gameType === "hypno") {
    if (gameState.mediaUrl) {
      settings.mediaUrl = gameState.mediaUrl;
    }
  }

  gameState.room.settings = { ...gameState.room.settings, ...settings };
  gameState.gameType = gameType;

  console.log("Emitting startGame with settings:", settings);
  socket.emit("startGame", { gameType: gameType });
}

// Chat Functions
function sendChatMessage(message = null) {
  if (!socket) return;

  const msg = message || elements.chatInput.value.trim();
  if (!msg) return;

  socket.emit("chatMessage", { message: msg });
  if (!message) {
    elements.chatInput.value = "";
  }
}

function addChatMessage(message, type = "normal", username = "") {
  const div = document.createElement("div");
  div.className = `message ${type}`;

  if (type === "system") {
    div.textContent = message;
  } else {
    const parts = message.split(":");
    if (parts.length > 1) {
      const userSpan = document.createElement("span");
      userSpan.className = "username";
      userSpan.textContent = parts[0] + ":";
      div.appendChild(userSpan);
      div.appendChild(document.createTextNode(parts.slice(1).join(":")));
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
  gameState.phase = "warmup";

  // Reset UI elements visibility
  if (elements.instruction) elements.instruction.style.display = "";
  if (elements.timerDisplay) elements.timerDisplay.style.display = "";

  // Get game type from room settings or default
  const gameType =
    gameState.gameMode === "multiplayer"
      ? gameState.room.settings.gameType || "redlight"
      : "redlight";
  gameState.gameType = gameType;

  showScreen("game-screen");
  elements.endOverlay.classList.add("hidden");
  elements.rankingsContainer.classList.add("hidden");

  // Hide all game containers initially
  elements.progressContainer?.classList.add("hidden");
  elements.externalGameContainer?.classList.add("hidden");
  elements.videoEdgingContainer?.classList.add("hidden");
  elements.hypnoContainer?.classList.add("hidden");

  // Show appropriate game type
  switch (gameType) {
    case "redlight":
      elements.progressContainer?.classList.remove("hidden");
      startRedLightGame();
      break;
    case "dicedare":
      loadExternalGame("https://dicedare.batecards.online/");
      break;
    case "batecards":
      loadExternalGame("https://batecards.online/");
      break;
    case "battleship":
      loadExternalGame("http://en.battleship-game.org/id85226959");
      break;
    case "blitzedout":
      loadExternalGame("https://blitzedout.com/");
      break;
    case "video-edging":
      // For video edging, we might keep instructions?
      // User requested "load file", so maybe "Load Video" instruction remains?
      // Let's hide main instruction to avoid "Get Ready..." overlap
      if (elements.instruction) elements.instruction.style.display = "none";
      loadVideoEdging();
      break;
    case "hypno":
      if (elements.instruction) elements.instruction.style.display = "none";
      loadHypnoExperience();
      break;
  }

  // Hide video grid in solo mode
  if (gameState.gameMode === "solo") {
    elements.videoGrid.style.display = "none";
  } else {
    elements.videoGrid.style.display = "grid";
  }
}

function startRedLightGame() {
  // Calculate session end time
  const sessionLength =
    gameState.gameMode === "multiplayer"
      ? gameState.room.settings.sessionLength
      : gameState.settings.sessionLength;
  const sessionMs = sessionLength * 60 * 1000;
  gameState.sessionStartTime = Date.now();
  gameState.sessionEndTime = Date.now() + sessionMs;
  gameState.sessionProgress = 0;

  // Start session timer
  startSessionTimer();

  // Start with warm-up phase
  startWarmupPhase();
}

function loadExternalGame(url) {
  if (!elements.externalGameContainer || !elements.externalGameFrame) return;

  if (elements.instruction) elements.instruction.style.display = "none";
  if (elements.timerDisplay) elements.timerDisplay.style.display = "none";

  elements.externalGameContainer.classList.remove("hidden");
  elements.externalGameFrame.src = url;

  // Use CSS class for styling, remove manual inline styles if any meant for legacy
  // But ensure iframe fills container
  elements.externalGameFrame.style.width = "100%";
  elements.externalGameFrame.style.height = "100%";

  // Try to enter fullscreen
  tryEnterFullscreen();
}

function loadVideoEdging() {
  if (!elements.videoEdgingContainer || !elements.edgingVideoPlayer) return;

  elements.videoEdgingContainer.classList.remove("hidden");

  if (gameState.mediaUrl) {
    elements.edgingVideoPlayer.src = gameState.mediaUrl;
    elements.edgingVideoPlayer
      .play()
      .catch((err) => console.error("Video play error:", err));
  } else {
    elements.instruction.textContent = "Please load a video URL or file first";
  }

  // Try to enter fullscreen
  tryEnterFullscreen();
}

function loadHypnoExperience() {
  if (
    !elements.hypnoContainer ||
    !elements.hypnoSpiral ||
    !elements.hypnoAudioPlayer
  )
    return;

  elements.hypnoContainer.classList.remove("hidden");

  // Initialize hypno spiral
  initHypnoSpiral();

  if (gameState.mediaUrl) {
    // Only set src if different to avoid reloading/glitching
    // Note: src property is absolute, so simple comparison might fail if mediaUrl is relative.
    // But usually mediaUrl here is absolute (http...) or user input.
    // If mediaElement.src includes the mediaUrl, we assume it's loaded.
    const currentSrc = elements.hypnoAudioPlayer.src;
    if (!currentSrc || currentSrc !== gameState.mediaUrl) {
         elements.hypnoAudioPlayer.src = gameState.mediaUrl;
    }

    elements.hypnoAudioPlayer
      .play()
      .catch((err) => console.error("Audio play error:", err));
  } else {
    elements.instruction.textContent = "Please load an audio URL or file first";
  }

  // Try to enter fullscreen
  tryEnterFullscreen();
}

async function loadMedia() {
  const url = elements.mediaUrl?.value.trim();
  if (!url) return;

  elements.loadMediaBtn.textContent = "Loading...";
  elements.loadMediaBtn.disabled = true;

  try {
    let finalUrl = url;

    // Check for both video and audio extensions
    const isDirectFile = /\.(mp4|webm|ogg|mov|mp3|wav|m4a|aac)$/i.test(url);

    if (!isDirectFile && url.startsWith('http')) {
        try {
            const res = await fetch(`${API_URL}/api/extract-video?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data.videoUrl) {
                finalUrl = data.videoUrl;
                console.log("Extracted media URL:", finalUrl);
            }
        } catch (e) {
            console.warn("Server extraction failed, using original URL:", e);
        }
    }

    gameState.mediaUrl = finalUrl;

    if (gameState.gameType === "video-edging" && elements.edgingVideoPlayer) {
      elements.edgingVideoPlayer.src = finalUrl;
      elements.edgingVideoPlayer.load();
    } else if (gameState.gameType === "hypno" && elements.hypnoAudioPlayer) {
      elements.hypnoAudioPlayer.src = finalUrl;
    }

    // Feedback
    elements.loadMediaBtn.textContent = "Loaded!";
    setTimeout(() => {
        elements.loadMediaBtn.textContent = "Load";
        elements.loadMediaBtn.disabled = false;
    }, 1000);

  } catch (error) {
    console.error("Error loading media:", error);
    elements.loadMediaBtn.textContent = "Error";
    elements.loadMediaBtn.disabled = false;
  }
}

function initHypnoSpiral() {
  const canvas = elements.hypnoSpiral;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const styleSelect = document.getElementById("hypno-style");

  // Ensure canvas fits container (preserving sidebar layout)
  const resize = () => {
      if (elements.hypnoContainer) {
          canvas.width = elements.hypnoContainer.clientWidth;
          canvas.height = elements.hypnoContainer.clientHeight;
      }
  };

  // Initial size
  resize();

  // Handle window resize
  window.removeEventListener('resize', canvas.resizeHandler);
  canvas.resizeHandler = resize;
  window.addEventListener('resize', canvas.resizeHandler);

  let rotation = 0;
  let animationId;

  function drawSpiral() {
    const style = styleSelect ? styleSelect.value : 'classic';
    const speed = parseFloat(elements.hypnoSpeed?.value || 1);

    // Theme Configuration
    let bg = '#000000';
    let fg = '#ffffff';
    let lineWidth = 3;

    switch (style) {
        case 'sissy':
            bg = '#ffb6c1'; // Light pink
            fg = '#800080'; // Purple
            break;
        case 'gooner':
            bg = '#050505';
            fg = '#00ff00'; // Terminal green
            break;
        case 'deepblue':
            bg = '#000022'; // Dark blue
            fg = '#00ffff'; // Cyan
            break;
        case 'rainbow':
            bg = '#000000';
            // Foreground calculated dynamically
            break;
        default: // classic
            bg = '#000000';
            fg = '#ffffff';
    }

    // Fill Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    // Radius should cover corners
    const maxRadius = Math.sqrt(centerX**2 + centerY**2);

    rotation += 0.05 * speed;

    // Set Stroke Style
    if (style === 'rainbow') {
        const hue = (Date.now() / 20) % 360;
        fg = `hsl(${hue}, 100%, 50%)`;
    }

    ctx.strokeStyle = fg;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();

    // Spiral Math
    const coils = 10;
    const points = 1000;
    const spacing = maxRadius / coils;

    // Draw logarithmic-ish or simple Archimedean spiral
    for (let i = 0; i < points; i++) {
      // Angle increases as we go out
      const angle = (i * 0.1) + rotation;

      // Radius increases linearly
      const radius = (i / points) * maxRadius;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Optional: Add a second interlaced spiral for some styles?
    if (style === 'sissy' || style === 'deepblue') {
        ctx.beginPath();
        ctx.strokeStyle = style === 'sissy' ? '#ff69b4' : '#0000ff';
        for (let i = 0; i < points; i++) {
            const angle = (i * 0.1) + rotation + Math.PI; // 180 deg offset
            const radius = (i / points) * maxRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    animationId = requestAnimationFrame(drawSpiral);
  }

  drawSpiral();

  // Store animation ID for cleanup
  canvas.animationId = animationId;

  // Handle speed changes
  if (elements.hypnoSpeed) {
    elements.hypnoSpeed.addEventListener("input", (e) => {
      const speed = parseFloat(e.target.value);
      if (elements.hypnoSpeedValue) {
        elements.hypnoSpeedValue.textContent = speed.toFixed(1) + "x";
      }
    });
  }

  // Handle play/pause
  if (elements.hypnoPlayPause && elements.hypnoAudioPlayer) {
    elements.hypnoPlayPause.addEventListener("click", () => {
      if (elements.hypnoAudioPlayer.paused) {
        elements.hypnoAudioPlayer.play();
        elements.hypnoPlayPause.textContent = "Pause";
      } else {
        elements.hypnoAudioPlayer.pause();
        elements.hypnoPlayPause.textContent = "Play";
      }
    });
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

function tryEnterFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch(() => {});
  }
}

function startWarmupPhase() {
  gameState.phase = "warmup";
  gameState.isStroking = false;

  // Show warm-up instructions
  const warmupMessage =
    "This is the warm-up round. Start jerking off and try to get to the edge when the bar gets to 100% of the EDGE zone.\n\nYou should be ready to cum when the bar reaches the CUM zone.\n\nTry to get as close as possible, it will make the rest of the game even more fun!";

  elements.instruction.textContent = warmupMessage;
  elements.instruction.style.fontSize = "1.2em";
  elements.instruction.style.lineHeight = "1.6";
  elements.instruction.style.textAlign = "center";
  elements.instruction.style.padding = "20px";
  elements.gameScreen.className = "screen active warmup-state";

  // Update edge bar to show zones
  // Update edge bar to show zones
  updateEdgeBarZones();

  // Animate the bar to 100% over the warmup duration
  // Use a slight delay to ensure the browser registers the transition property change
  setTimeout(() => {
    elements.edgeBar.style.transition = "width 45s linear";
    elements.edgeBar.style.width = "100%";

    // Animate percentage text loosely (optional, but nice)
    // We won't do precise JS animation for text to keep it simple,
    // or we could let the mutation observer handle it if we had one.
    // Let's just set the bar.
  }, 50);

  // After 45 seconds (warmup duration), start the actual game
  setTimeout(() => {
    gameState.phase = "playing";

    // Reset visuals for game start
    elements.edgeBar.style.transition = "width 1s ease";
    elements.edgeBar.style.width = "0%";
    gameState.edgeLevel = 0;
    elements.edgePercentage.textContent = "0";

    // Reset instruction styles
    elements.instruction.style.fontSize = "";
    elements.instruction.style.lineHeight = "";
    elements.instruction.style.textAlign = "";
    elements.instruction.style.padding = "";

    // Start first state change
    if (gameState.gameMode === "solo") {
      changeState();
    } else if (gameState.isHost) {
      changeState();
    }

    // Try to enter fullscreen
    tryEnterFullscreen();
  }, 45000);
}

function startSessionTimer() {
  updateSessionTimer();
  gameState.sessionTimer = setInterval(updateSessionTimer, 1000);
}

function updateSessionTimer() {
  if (!gameState.isPlaying || gameState.isPaused) return;

  const remaining = gameState.sessionEndTime - Date.now();

  if (remaining <= 0) {
    endGame(true, "Session complete!");
    return;
  }

  // Calculate session progress (0-1)
  const elapsed = Date.now() - gameState.sessionStartTime;
  const total = gameState.sessionEndTime - gameState.sessionStartTime;
  gameState.sessionProgress = Math.min(1, elapsed / total);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  // Timer hidden for surprise element
  // elements.timerDisplay.textContent = ...

  // Update edge bar zones display
  updateEdgeBarZones();
}

function updateEdgeBarZones() {
  // Add visual zones to the edge bar container
  const container = elements.edgeBarContainer;

  // Remove existing zone markers and labels
  const existingZones = container.querySelectorAll(
    ".edge-zone-marker, .edge-zone-label"
  );
  existingZones.forEach((el) => el.remove());

  // Calculate positions (EDGE at 100%, CUM extends beyond)
  const edgePosition = "100%";
  const cumPosition = "120%"; // CUM zone extends 20% beyond EDGE

  // Add EDGE zone marker at 100%
  const edgeZoneMarker = document.createElement("div");
  edgeZoneMarker.className = "edge-zone-marker edge-zone";
  edgeZoneMarker.style.left = edgePosition;
  edgeZoneMarker.style.position = "absolute";
  edgeZoneMarker.style.height = "100%";
  edgeZoneMarker.style.width = "3px";
  edgeZoneMarker.style.backgroundColor = "#ff6b6b";
  edgeZoneMarker.style.zIndex = "10";
  edgeZoneMarker.style.boxShadow = "0 0 10px rgba(255, 107, 107, 0.8)";
  container.style.position = "relative";
  container.appendChild(edgeZoneMarker);

  // Add EDGE label at the marker position
  const edgeLabel = document.createElement("div");
  edgeLabel.className = "edge-zone-label";
  edgeLabel.textContent = "EDGE";
  edgeLabel.style.position = "absolute";
  edgeLabel.style.left = edgePosition;
  edgeLabel.style.transform = "translateX(-50%)";
  edgeLabel.style.top = "-35px";
  edgeLabel.style.fontSize = "1.4rem";
  edgeLabel.style.color = "white";
  edgeLabel.style.fontWeight = "bold";
  edgeLabel.style.textShadow = "0 0 10px rgba(255, 255, 255, 0.5)";
  edgeLabel.style.whiteSpace = "nowrap";
  container.appendChild(edgeLabel);

  // Add CUM! label at the end
  const cumLabel = document.createElement("div");
  cumLabel.className = "edge-zone-label";
  cumLabel.textContent = "CUM!";
  cumLabel.style.position = "absolute";
  cumLabel.style.left = cumPosition;
  cumLabel.style.transform = "translateX(-50%)";
  cumLabel.style.top = "-35px";
  cumLabel.style.fontSize = "1.4rem";
  cumLabel.style.color = "#90ee90";
  cumLabel.style.fontWeight = "bold";
  cumLabel.style.textShadow = "0 0 10px rgba(144, 238, 144, 0.8)";
  cumLabel.style.whiteSpace = "nowrap";
  container.appendChild(cumLabel);

  // Show CUM zone when edge level reaches 100%
  if (gameState.edgeLevel >= 100) {
    container.classList.add("has-cum-zone");
  } else {
    container.classList.remove("has-cum-zone");
  }
}

function changeState() {
  if (
    !gameState.isPlaying ||
    gameState.isPaused ||
    gameState.phase === "warmup"
  )
    return;

  // Calculate 'next' state before determining duration to pick correct instruction pool
  gameState.isStroking = !gameState.isStroking;

  const settings =
    gameState.gameMode === "multiplayer"
      ? gameState.room.settings
      : gameState.settings;
  const diff = gameState.difficultySettings[settings.difficulty];

  // Speed multiplier based on session progress
  let speedMultiplier = 1;
  if (gameState.sessionProgress >= 0.75) {
    const lastQuarterProgress = (gameState.sessionProgress - 0.75) / 0.25;
    speedMultiplier = 1 + lastQuarterProgress * 2; // 1x to 3x speed
  }

  // Select instruction set based on state
  const instructionSet = gameState.isStroking
    ? instructions.stroke
    : instructions.stop;
  const selection =
    instructionSet[Math.floor(Math.random() * instructionSet.length)];

  let text = "";
  let baseDuration = 0;

  // Handle new array format [Text, Duration, Difficulty]
  if (Array.isArray(selection)) {
    text = selection[0];
    if (selection[1]) baseDuration = selection[1] * 1000;
  } else {
    text = selection;
  }

  // Calculate duration
  let duration = baseDuration;
  if (!duration) {
    // Fallback if no explicit duration provided
    if (gameState.isStroking) {
      const baseTime =
        diff.strokeMin + Math.random() * (diff.strokeMax - diff.strokeMin);
      const escalationFactor = 1 - gameState.edgeLevel / 200;
      duration = Math.max(2000, baseTime * escalationFactor);
    } else {
      const baseTime =
        diff.stopMin + Math.random() * (diff.stopMax - diff.stopMin);
      duration = Math.max(1500, baseTime);
    }
  }

  // Apply speed multiplier to ALL durations (even explicit ones) to escalate intensity
  duration = Math.max(1000, duration / speedMultiplier);
  duration = Math.round(duration);

  // RESET BAR: User wants it to "restart for every new instruction"
  // This turns the bar into a duration timer for the specific instruction
  elements.edgeBar.style.transition = 'none';
  elements.edgeBar.style.width = '0%';
  gameState.edgeLevel = 0;

  // Force reflow to ensure the 0% is rendered before we start the transition
  void elements.edgeBar.offsetWidth;

  // Apply transition for the filling animation
  elements.edgeBar.style.transition = `width ${duration}ms linear`;

  if (gameState.isStroking) {
    elements.gameScreen.className = "screen active stroke-state";
    elements.instruction.innerHTML = text; // innerHTML allows <br> tags

    if (gameState.settings.soundEnabled) {
      playSound("stroke");
    }

    // Target a high level (95-100%) to visually "Fill Up" the bar during the stroke
    let targetLevel = 95 + Math.random() * 5;

    // Occasional 100% push for edge triggering logic
    if (Math.random() < 0.15) {
        targetLevel = 100;
    }

    gameState.edgeLevel = targetLevel;

    // Animate Visuals
    elements.edgeBar.style.width = targetLevel + "%";
    elements.edgePercentage.textContent = Math.round(targetLevel);
    updateEdgeBarZones();

    // Broadcast
    if (gameState.gameMode === "multiplayer" && socket && gameState.isHost) {
        socket.emit("gameStateUpdate", {
            isStroking: gameState.isStroking,
            instruction: text,
        });
        socket.emit("playerUpdate", {
            edgeLevel: gameState.edgeLevel,
            failed: false,
        });
    }

    // Next Step
    if (targetLevel >= 100) {
        gameState.timer = setTimeout(handleEdgeReached, duration);
    } else {
        gameState.timer = setTimeout(changeState, duration);
    }

  } else {
    elements.gameScreen.className = "screen active stop-state";
    elements.instruction.innerHTML = text;

    if (gameState.settings.soundEnabled) {
      playSound("stop");
    }

    // For STOP, also fill the bar (Red) to act as a timer for the break
    let targetLevel = 100;

    gameState.edgeLevel = targetLevel;

    elements.edgeBar.style.width = targetLevel + "%";
    elements.edgePercentage.textContent = Math.round(targetLevel);
    updateEdgeBarZones();

    if (gameState.gameMode === "multiplayer" && socket && gameState.isHost) {
        socket.emit("gameStateUpdate", {
            isStroking: gameState.isStroking,
            instruction: text,
        });
        socket.emit("playerUpdate", {
            edgeLevel: gameState.edgeLevel,
            failed: false,
        });
    }

    gameState.timer = setTimeout(changeState, duration);
  }
}

function updateGameState(state) {
  if (state.isStroking !== undefined) {
    gameState.isStroking = state.isStroking;
    elements.gameScreen.className = gameState.isStroking
      ? "screen active stroke-state"
      : "screen active stop-state";
  }
  if (state.instruction) {
    elements.instruction.textContent = state.instruction;
  }
}

// Deprecated in favor of direct updates in changeState, but kept for compatibility if called elsewhere
function updateEdge(amount) {
   // Minimal implementation just in case
   gameState.edgeLevel = Math.max(0, Math.min(100, gameState.edgeLevel + amount));
   elements.edgeBar.style.transition = "width 0.3s ease"; // Default fast transition for manual updates
   elements.edgeBar.style.width = gameState.edgeLevel + "%";
   elements.edgePercentage.textContent = Math.round(gameState.edgeLevel);
   updateEdgeBarZones();
}

function handleEdgeReached() {
  clearTimeout(gameState.timer);

  // Snap to 100 if we aren't there visually
  elements.edgeBar.style.transition = "width 0.2s ease";
  elements.edgeBar.style.width = "100%";

  const settings =
    gameState.gameMode === "multiplayer"
      ? gameState.room.settings
      : gameState.settings;
  const roll = Math.random() * 100;
  const allowOrgasm = roll < settings.orgasmChance;

  if (allowOrgasm) {
    gameState.phase = "cumming";
    // Using simple string array now
    const cumMessage =
      instructions.cum[Math.floor(Math.random() * instructions.cum.length)];
    elements.instruction.innerHTML = cumMessage;
    elements.gameScreen.className = "screen active cum-state";

    // Give 10 seconds to cum (matching the instruction "You have 10 seconds to cum")
    setTimeout(() => {
      const postCumMessage = instructions.postCum
        ? instructions.postCum[Math.floor(Math.random() * instructions.postCum.length)]
        : "Game Over";
      endGame(true, postCumMessage);
    }, 10000);
  } else {
    gameState.phase = "denied";
    const deniedMessage =
      instructions.denied[
        Math.floor(Math.random() * instructions.denied.length)
      ];
    elements.instruction.innerHTML = deniedMessage;
    elements.gameScreen.className = "screen active denied-state";

    // Reset after showing denial message
    setTimeout(() => {
      gameState.phase = "playing";
      gameState.edgeLevel = 20;

      // Animate reset
      elements.edgeBar.style.transition = "width 1s ease";
      elements.edgeBar.style.width = "20%";
      elements.edgePercentage.textContent = "20";

      if (gameState.isPlaying && !gameState.isPaused) {
        changeState();
      }
    }, 5000);
  }
}

function togglePause() {
  gameState.isPaused = !gameState.isPaused;

  if (gameState.isPaused) {
    clearTimeout(gameState.timer);
    elements.pauseBtn.textContent = "Resume";
    elements.instruction.textContent = "Paused";
  } else {
    elements.pauseBtn.textContent = "Pause";
    changeState();
  }
}

function handleEarlyOrgasm() {
  if (gameState.gameMode === "multiplayer" && socket) {
    socket.emit("playerFailed");
  }
  endGame(
    false,
    "Ruined orgasm! Let it dribble out slowly. No satisfaction for you."
  );
}

function endGame(allowOrgasm, message, rankings = null) {
  gameState.isPlaying = false;
  clearTimeout(gameState.timer);
  clearInterval(gameState.sessionTimer);

  if (gameState.gameMode === "multiplayer" && socket && gameState.isHost) {
    socket.emit("endGame");
  }

  elements.endTitle.textContent = allowOrgasm ? "Release!" : "Game Over";
  elements.endMessage.textContent = message;

  // Show rankings if multiplayer
  if (rankings && rankings.length > 0) {
    elements.rankingsContainer.classList.remove("hidden");
    elements.rankingsList.innerHTML = "";
    rankings.forEach((rank) => {
      const item = document.createElement("div");
      item.className = `ranking-item rank-${rank.rank === 1 ? "1" : ""}`;
      item.innerHTML = `
        <span class="rank">#${rank.rank}</span>
        <span class="username">${rank.username}</span>
        <span class="edge-level">${Math.round(rank.edgeLevel)}%</span>
      `;
      elements.rankingsList.appendChild(item);
    });
  }

  elements.endOverlay.classList.remove("hidden");

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

  elements.edgeBar.style.width = "0%";
  elements.edgeBar.style.transition = "none"; // Reset transition
  elements.edgePercentage.textContent = "0";
  elements.instruction.textContent = "Get Ready...";
  // Timer hidden
  elements.timerDisplay.textContent = "";
  elements.gameScreen.className = "screen active";
  elements.pauseBtn.textContent = "Pause";
}

// Sound Effects
function playSound(type) {
  if (!gameState.settings.soundEnabled) return;

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (type === "stroke") {
    oscillator.frequency.value = 400;
    oscillator.type = "sine";
  } else if (type === "stop") {
    oscillator.frequency.value = 200;
    oscillator.type = "square";
  }

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.1
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Initialize on load
document.addEventListener("DOMContentLoaded", init);
