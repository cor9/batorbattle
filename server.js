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
app.post('/api/getToken', async (req, res) => {
  try {
    const { roomName, participantName, canPublish = true } = req.body;

    // Validate required fields
    if (!roomName || !participantName) {
      return res.status(400).json({ error: 'roomName and participantName are required' });
    }

    // Validate LiveKit credentials
    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || LIVEKIT_API_KEY === 'devkey' || LIVEKIT_API_SECRET === 'secret') {
      console.error('LiveKit credentials not configured properly');
      return res.status(500).json({
        error: 'LiveKit credentials not configured',
        hasKey: !!LIVEKIT_API_KEY,
        hasSecret: !!LIVEKIT_API_SECRET
      });
    }

    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantName,
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: canPublish,
      canSubscribe: true,
    });

    // Generate JWT token - toJwt() is async in newer SDK versions
    const jwtToken = await token.toJwt();

    if (!jwtToken || typeof jwtToken !== 'string') {
      console.error('Token generation failed - invalid token returned', { jwtToken, type: typeof jwtToken });
      return res.status(500).json({
        error: 'Failed to generate token',
        debug: {
          hasKey: !!LIVEKIT_API_KEY,
          keyLength: LIVEKIT_API_KEY?.length,
          hasSecret: !!LIVEKIT_API_SECRET,
          secretLength: LIVEKIT_API_SECRET?.length,
          tokenType: typeof jwtToken,
          tokenValue: jwtToken
        }
      });
    }

    res.json({
      token: jwtToken,
      url: LIVEKIT_URL,
    });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    res.status(500).json({
      error: 'Failed to generate token',
      message: error.message
    });
  }
});

// Video URL extraction endpoint
const axios = require('axios');
const cheerio = require('cheerio');

app.get('/api/extract-video', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Basic validation
    if (!url.startsWith('http')) {
       return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if it's already a direct video link (allow query params)
    if (url.match(/\.(mp4|webm|ogg|mov)(?:\?.*)?$/i)) {
        return res.json({ videoUrl: url });
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    let videoUrl = null;

    // Strategy 1: Open Graph Video
    videoUrl = $('meta[property="og:video"]').attr('content') ||
               $('meta[property="og:video:url"]').attr('content') ||
               $('meta[property="og:video:secure_url"]').attr('content');

    // Strategy 2: Twitter Player Stream
    if (!videoUrl) {
       videoUrl = $('meta[name="twitter:player:stream"]').attr('content');
    }

    // Strategy 3: HTML5 Video tag src
    if (!videoUrl) {
       videoUrl = $('video').attr('src');
    }

    // Strategy 4: Source tag inside video
    if (!videoUrl) {
       videoUrl = $('video source').attr('src');
    }

    if (videoUrl) {
        // Resolve relative URLs
        if (videoUrl.startsWith('/')) {
            const urlObj = new URL(url);
            videoUrl = `${urlObj.protocol}//${urlObj.host}${videoUrl}`;
        }
        res.json({ videoUrl });
    } else {
        res.status(404).json({ error: 'No video found on this page' });
    }

  } catch (error) {
    console.error('Extraction error:', error.message);
    res.status(500).json({ error: 'Failed to extract video', details: error.message });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room
  socket.on('joinRoom', ({ roomName, username, role, settings, profile }) => {
    socket.join(roomName);
    socket.roomName = roomName;
    socket.username = username;
    socket.role = role;
    socket.userId = socket.id;
    // Phase 2: Store profile on socket for reference
    if (profile) {
        socket.profile = profile;
        socket.userId = profile.userId || socket.id;
    }

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
          profile: profile, // Phase 2
          userId: (profile && profile.userId) || socket.id // Phase 2
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
        profile: profile, // Phase 2
        userId: (profile && profile.userId) || socket.id // Phase 2
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

    // Phase 2: Update online users list for everyone
    const allUsers = [...room.players, ...room.spectators].map(u => ({
        userId: u.userId || u.username,
        username: u.username,
        profile: u.profile,
        status: u.failed ? 'Ruined' : 'Stroking'
    }));
    io.to(roomName).emit('onlineUsersUpdate', allUsers);
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
  socket.on('startGame', (data = {}) => {
    if (!socket.roomName) return;

    const room = rooms.get(socket.roomName);
    if (!room || room.host !== socket.id) return; // Only host can start

    // Initialize game state (only for edging game)
    const gameType = data.gameType || 'redlight';
    if (gameType === 'redlight') {
      room.gameState = {
        isPlaying: true,
        isPaused: false,
        isStroking: false,
        instruction: '',
        round: 1,
        startTime: Date.now(),
      };
    } else {
      // For other game types, just mark as playing
      room.gameState = {
        isPlaying: true,
        gameType: gameType,
      };
    }

    io.to(socket.roomName).emit('gameStart', { ...room.gameState, gameType: gameType });
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

  // Phase 2: Profile & Online Users
  socket.on('profileUpdate', ({ userId, profile }) => {
    // Determine which list (players/spectators) the user is in
    if (!socket.roomName) return;
    const room = rooms.get(socket.roomName);
    if (!room) return;

    // Update in memory lists
    const p = room.players.find(x => x.id === socket.id);
    if (p) {
        p.userId = userId;
        p.profile = profile;
    }
    const s = room.spectators.find(x => x.id === socket.id);
    if (s) {
        s.userId = userId;
        s.profile = profile;
    }

    // Broadcast updated online users list to room
    // Collect all unique users
    const allUsers = [...room.players, ...room.spectators].map(u => ({
        userId: u.userId || u.username, // Fallback if no profile ID
        username: u.username,
        profile: u.profile,
        status: u.failed ? 'Ruined' : 'Stroking'
    }));

    io.to(socket.roomName).emit('onlineUsersUpdate', allUsers);
  });

  socket.on('friendUpdate', ({ userId, action }) => {
      // Just for logging/stats in this improved version,
      // actual friend logic is client-side localStorage in this implementation phase.
      // But we could broadcast "Friend Request" here if we wanted.
  });

  socket.on('blockUpdate', ({ userId, action }) => {
      // Similarly, block logic is client-side for now to avoid complexity
  });

  socket.on('requestOnlineUsers', () => {
    if (!socket.roomName) return;
    const room = rooms.get(socket.roomName);
    if (!room) return;

    const allUsers = [...room.players, ...room.spectators].map(u => ({
        userId: u.userId || u.username || 'unknown',
        username: u.username,
        profile: u.profile,
        status: 'Online'
    }));
    socket.emit('onlineUsersUpdate', allUsers);
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

    // Update online users list for others
    const allUsers = [...room.players, ...room.spectators].map(u => ({
        userId: u.userId || u.username || 'unknown',
        username: u.username,
        profile: u.profile,
        status: 'Online'
    }));
    io.to(socket.roomName).emit('onlineUsersUpdate', allUsers);

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

