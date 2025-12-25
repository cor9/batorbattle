const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',') 
      : ['https://batorbattle.space', 'http://localhost:8181'], // Custom domain + local dev
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// LiveKit configuration
// For production, use environment variables
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'ws://localhost:7880';

// Room state management
const rooms = new Map();

// Generate LiveKit access token
app.post('/api/getToken', (req, res) => {
  const { roomName, participantName, canPublish = true } = req.body;

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantName,
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: canPublish,
    canSubscribe: true,
  });

  res.json({
    token: token.toJwt(),
    url: LIVEKIT_URL,
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room
  socket.on('joinRoom', ({ roomName, username, role, settings }) => {
    socket.join(roomName);
    socket.roomName = roomName;
    socket.username = username;
    socket.role = role;
    socket.userId = socket.id;

    // Initialize room if it doesn't exist
    if (!rooms.has(roomName)) {
      rooms.set(roomName, {
        players: [],
        spectators: [],
        settings: settings || {},
        gameState: null,
        host: socket.id,
      });
    }

    const room = rooms.get(roomName);

    // Add user to appropriate list
    if (role === 'player') {
      if (room.players.length < 4) {
        room.players.push({
          id: socket.id,
          username,
          edgeLevel: 0,
          failed: false,
          score: 0,
        });
      } else {
        // Room full, force spectator
        socket.role = 'spectator';
        role = 'spectator';
      }
    }

    if (role === 'spectator') {
      room.spectators.push({
        id: socket.id,
        username,
      });
    }

    // Notify room
    io.to(roomName).emit('systemMessage', {
      type: 'join',
      message: `${username} joined as ${role}`,
      username,
      role,
    });

    // Send updated room state
    io.to(roomName).emit('roomUpdate', {
      players: room.players.map((p) => ({
        id: p.id,
        username: p.username,
        edgeLevel: p.edgeLevel,
        failed: p.failed,
      })),
      spectators: room.spectators.map((s) => ({
        id: s.id,
        username: s.username,
      })),
      settings: room.settings,
    });

    // Send current game state if game is active
    if (room.gameState) {
      socket.emit('gameState', room.gameState);
    }
  });

  // Chat messages
  socket.on('chatMessage', ({ message }) => {
    if (!socket.roomName) return;

    const room = rooms.get(socket.roomName);
    if (!room) return;

    io.to(socket.roomName).emit('chatMessage', {
      username: socket.username,
      message,
      role: socket.role,
      userId: socket.id,
      isKing: room.host === socket.id,
    });
  });

  // Game control events
  socket.on('startGame', () => {
    if (!socket.roomName) return;

    const room = rooms.get(socket.roomName);
    if (!room || room.host !== socket.id) return; // Only host can start

    // Initialize game state
    room.gameState = {
      isPlaying: true,
      isPaused: false,
      isStroking: false,
      instruction: '',
      round: 1,
      startTime: Date.now(),
    };

    io.to(socket.roomName).emit('gameStart', room.gameState);
  });

  socket.on('gameStateUpdate', (state) => {
    if (!socket.roomName) return;

    const room = rooms.get(socket.roomName);
    if (!room) return;

    // Update game state
    room.gameState = { ...room.gameState, ...state };

    // Broadcast to all except sender
    socket.to(socket.roomName).emit('gameState', room.gameState);
  });

  socket.on('playerUpdate', ({ edgeLevel, failed }) => {
    if (!socket.roomName) return;

    const room = rooms.get(socket.roomName);
    if (!room) return;

    // Update player's edge level
    const player = room.players.find((p) => p.id === socket.id);
    if (player) {
      player.edgeLevel = edgeLevel;
      player.failed = failed || player.failed;

      // Broadcast player update
      io.to(socket.roomName).emit('playerUpdate', {
        playerId: socket.id,
        username: socket.username,
        edgeLevel,
        failed: player.failed,
      });
    }
  });

  socket.on('playerFailed', () => {
    if (!socket.roomName) return;

    const room = rooms.get(socket.roomName);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (player) {
      player.failed = true;

      io.to(socket.roomName).emit('systemMessage', {
        type: 'fail',
        message: `${socket.username} failed and ruined!`,
        username: socket.username,
      });

      io.to(socket.roomName).emit('playerUpdate', {
        playerId: socket.id,
        username: socket.username,
        edgeLevel: player.edgeLevel,
        failed: true,
      });
    }
  });

  socket.on('endGame', () => {
    if (!socket.roomName) return;

    const room = rooms.get(socket.roomName);
    if (!room) return;

    // Calculate rankings
    const rankings = room.players
      .filter((p) => !p.failed)
      .sort((a, b) => b.edgeLevel - a.edgeLevel)
      .map((p, index) => ({
        rank: index + 1,
        username: p.username,
        edgeLevel: p.edgeLevel,
        score: p.score,
      }));

    io.to(socket.roomName).emit('gameEnd', {
      rankings,
      message: 'Game Over',
    });

    // Reset game state
    room.gameState = null;
    room.players.forEach((p) => {
      p.edgeLevel = 0;
      p.failed = false;
    });
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    if (!socket.roomName) return;

    const room = rooms.get(socket.roomName);
    if (!room) return;

    // Remove from players or spectators
    room.players = room.players.filter((p) => p.id !== socket.id);
    room.spectators = room.spectators.filter((s) => s.id !== socket.id);

    // If host left, assign new host
    if (room.host === socket.id && room.players.length > 0) {
      room.host = room.players[0].id;
    }

    // Notify room
    io.to(socket.roomName).emit('systemMessage', {
      type: 'leave',
      message: `${socket.username} left`,
      username: socket.username,
    });

    io.to(socket.roomName).emit('roomUpdate', {
      players: room.players.map((p) => ({
        id: p.id,
        username: p.username,
        edgeLevel: p.edgeLevel,
        failed: p.failed,
      })),
      spectators: room.spectators.map((s) => ({
        id: s.id,
        username: s.username,
      })),
      settings: room.settings,
    });

    // Clean up empty rooms
    if (room.players.length === 0 && room.spectators.length === 0) {
      rooms.delete(socket.roomName);
    }
  });
});

const PORT = process.env.PORT || 8181;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`LiveKit URL: ${LIVEKIT_URL}`);
  console.log(
    `For production, set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL environment variables`
  );
});

