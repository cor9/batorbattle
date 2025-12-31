// Configuration - loaded from config.js
const API_URL =
  (window.APP_CONFIG && window.APP_CONFIG.API_URL) || "http://localhost:8181";

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
};

// Instructions pool from gamescreens.md
const instructions = {
  stroke: [
    "Jerk off ONLY the tip, use only TWO FINGERS",
    "Jerk off as fast as you can NOW!",
    "Hard and Fast",
    "Getting close",
    "You can jerk off now",
    "Wank it",
    "Slow and steady",
    "Stroke",
    "Use your other hand",
    "Focus on the head",
    "Stroke and twist",
    "Up and Down",
    "Gently slap your balls",
    "Slide up and down your length",
    "Pound your penis",
    "Jack off",
    "Slap that Dick on your belly",
    "Bate that dong",
    "Grip it Harder",
    "Light, quick strokes",
  ],
  stop: [
    "Fingers on your nipples",
    "Hands Off",
    "Dont touch your cock",
    "Stop and…",
    "Wait - pull on your balls",
    "Squeeze the tip until...",
    "STOP TOUCHING! Calm down, be ready for the next one...",
    "STOP",
    "No touching",
    "Hands to the sky",
    "Feel your body with your hands",
    "Lick your biceps",
    "Flex your biceps",
    "Hands behind your head",
    "Dont cum stop touching",
    "Rub your chest and belly",
  ],
  denied: [
    "STOP! Sorry, no cumshot for you",
    "Try again, maybe you will get lucky... Now get your hands off your dick until this is over.",
    "Uh Oh! You don't get to squirt this time",
    "Game Over - No release this time",
    "Don't hate me, Bator but NO NUT FOR YOU",
    "Soo close but no cigar. You may NOT cum.",
    "No Happy Ending today.",
  ],
  cum: [
    "You may cum now",
    "You have 10 seconds to cum",
    "Blow your load, you earned it",
    "Erupt like a volcano",
    "Cum now, make a mess",
    "Ejaculation may commence",
    "IT'S CUM TIME, Bro!",
  ],
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
  edgePercentage: document.getElementById("edge-percentage"),
  timerDisplay: document.getElementById("timer-display"),
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
  elements.toggleChat.addEventListener("click", () => {
    elements.chatSidebar.classList.toggle("open");
  });
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
    elements.startBattleBtn.disabled = playerCount < 2;
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

  const playerCount = gameState.room?.players?.length || 0;
  if (playerCount < 2) {
    console.error("Cannot start battle: Need at least 2 players");
    alert("You need at least 2 players to start a battle");
    return;
  }

  const settings = {
    sessionLength: parseInt(elements.roomSessionLength.value) || 30,
    difficulty: parseInt(elements.roomDifficulty.value) || 2,
    orgasmChance: parseInt(elements.roomOrgasmChance.value) || 50,
  };

  gameState.room.settings = settings;
  console.log("Emitting startGame with settings:", settings);
  socket.emit("startGame");
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

  showScreen("game-screen");
  elements.endOverlay.classList.add("hidden");
  elements.rankingsContainer.classList.add("hidden");

  // Hide video grid in solo mode
  if (gameState.gameMode === "solo") {
    elements.videoGrid.style.display = "none";
  } else {
    elements.videoGrid.style.display = "grid";
  }

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
  updateEdgeBarZones();

  // After 10 seconds, start the actual game
  setTimeout(() => {
    gameState.phase = "playing";
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
  }, 10000);
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
  elements.timerDisplay.textContent = `${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;

  // Update edge bar zones display
  updateEdgeBarZones();
}

function updateEdgeBarZones() {
  // Add visual zones to the edge bar container
  const container = elements.edgeBarContainer;
  
  // Remove existing zone markers and labels
  const existingZones = container.querySelectorAll(".edge-zone-marker, .edge-zone-label");
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

  gameState.isStroking = !gameState.isStroking;
  const settings =
    gameState.gameMode === "multiplayer"
      ? gameState.room.settings
      : gameState.settings;
  const diff = gameState.difficultySettings[settings.difficulty];

  // Speed multiplier based on session progress
  // Last quarter (75%+) gets progressively faster
  let speedMultiplier = 1;
  if (gameState.sessionProgress >= 0.75) {
    // In last quarter, speed up: 0.75 = 1x, 1.0 = 3x
    const lastQuarterProgress = (gameState.sessionProgress - 0.75) / 0.25;
    speedMultiplier = 1 + lastQuarterProgress * 2; // 1x to 3x speed
  }

  if (gameState.isStroking) {
    elements.gameScreen.className = "screen active stroke-state";
    const randomInstruction =
      instructions.stroke[
        Math.floor(Math.random() * instructions.stroke.length)
      ];
    elements.instruction.textContent = randomInstruction;

    const edgeGain = diff.edgeGain + (gameState.edgeLevel / 100) * 5;
    updateEdge(edgeGain);

    const baseTime =
      diff.strokeMin + Math.random() * (diff.strokeMax - diff.strokeMin);
    const escalationFactor = 1 - gameState.edgeLevel / 200;
    // Apply speed multiplier - faster in last quarter
    const nextTime = Math.max(
      2000,
      (baseTime * escalationFactor) / speedMultiplier
    );

    gameState.timer = setTimeout(changeState, nextTime);

    if (gameState.settings.soundEnabled) {
      playSound("stroke");
    }
  } else {
    elements.gameScreen.className = "screen active stop-state";
    const randomInstruction =
      instructions.stop[Math.floor(Math.random() * instructions.stop.length)];
    elements.instruction.textContent = randomInstruction;

    updateEdge(-diff.edgeLoss);

    const baseTime =
      diff.stopMin + Math.random() * (diff.stopMax - diff.stopMin);
    // Apply speed multiplier - faster in last quarter
    const nextTime = Math.max(1500, baseTime / speedMultiplier);

    gameState.timer = setTimeout(changeState, nextTime);

    if (gameState.settings.soundEnabled) {
      playSound("stop");
    }
  }

  // Broadcast state in multiplayer
  if (gameState.gameMode === "multiplayer" && socket && gameState.isHost) {
    socket.emit("gameStateUpdate", {
      isStroking: gameState.isStroking,
      instruction: elements.instruction.textContent,
    });
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

function updateEdge(amount) {
  gameState.edgeLevel = Math.max(
    0,
    Math.min(100, gameState.edgeLevel + amount)
  );
  elements.edgeBar.style.width = gameState.edgeLevel + "%";
  elements.edgePercentage.textContent = Math.round(gameState.edgeLevel);

  // Update zone display
  updateEdgeBarZones();

  // Broadcast in multiplayer
  if (gameState.gameMode === "multiplayer" && socket) {
    socket.emit("playerUpdate", {
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

  const settings =
    gameState.gameMode === "multiplayer"
      ? gameState.room.settings
      : gameState.settings;
  const roll = Math.random() * 100;
  const allowOrgasm = roll < settings.orgasmChance;

  if (allowOrgasm) {
    gameState.phase = "cumming";
    const cumMessage =
      instructions.cum[Math.floor(Math.random() * instructions.cum.length)];
    elements.instruction.textContent = cumMessage;
    elements.gameScreen.className = "screen active cum-state";

    // Give 10 seconds to cum
    setTimeout(() => {
      endGame(true, "Hope you enjoyed that release!");
    }, 10000);
  } else {
    gameState.phase = "denied";
    const deniedMessage =
      instructions.denied[
        Math.floor(Math.random() * instructions.denied.length)
      ];
    elements.instruction.textContent = deniedMessage;
    elements.gameScreen.className = "screen active denied-state";

    // Reset after showing denial message
    setTimeout(() => {
      gameState.phase = "playing";
      gameState.edgeLevel = 20;
      updateEdge(0);
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
  elements.edgePercentage.textContent = "0";
  elements.instruction.textContent = "Get Ready...";
  elements.timerDisplay.textContent = "00:00";
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
