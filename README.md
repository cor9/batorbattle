# Bator Battle - Multiplayer Edge Control Game

A web-based adult edging game with **solo play** and **multiplayer battle rooms** featuring live webcams, real-time chat, and competitive rankings.

## Features

### Solo Mode
- **Customizable Settings**:
  - Session length (5-60 minutes)
  - Difficulty levels (Easy, Medium, Hard)
  - Orgasm chance percentage (0-100%)
  - Sound effects toggle
- **Dynamic Gameplay**:
  - Random stroking/stopping intervals
  - Escalating difficulty as edge level increases
  - Visual feedback with color-coded states (green = stroke, red = stop)
  - Progress bar showing edge level

### Multiplayer Battle Mode (2-4 Players)
- **Room System**:
  - Create or join rooms with unique codes
  - Host controls game settings
  - Supports 2-4 players + unlimited spectators
- **Live Webcams**:
  - WebRTC video streaming via LiveKit
  - Real-time video feeds for all players
  - Optional webcam requirement
- **Real-time Chat**:
  - Text chat for players and spectators
  - Quick reaction emojis (😂 🔥 🍤 🤏 🍆 💦)
  - System messages for game events
- **Synchronized Gameplay**:
  - All players follow the same instructions
  - Real-time edge level tracking
  - Competitive rankings
- **Spectator Mode**:
  - View-only access for unlimited watchers
  - Can chat but not participate in edging
  - See all player webcams and game state

### Game Controls
- Pause/Resume
- Early orgasm handling ("I Came Too Early")
- End game option
- Mobile responsive
- Fullscreen support

## File Structure

```
batorbattle/
├── index.html          # Main HTML file
├── styles.css          # Styling and animations
├── script.js           # Game logic (solo + multiplayer)
├── server.js           # Backend server (Express + Socket.io + LiveKit)
├── package.json        # Node.js dependencies
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── BATORLOGO.png       # Logo file
└── README.md           # This file
```

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- LiveKit account (free tier available at [livekit.io](https://livekit.io))
- Modern web browser with WebRTC support

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure LiveKit

#### Option A: LiveKit Cloud (Recommended for Production)
1. Sign up at [cloud.livekit.io](https://cloud.livekit.io)
2. Create a project and get your API key and secret
3. Note your LiveKit server URL (e.g., `wss://your-project.livekit.cloud`)

#### Option B: Self-Hosted LiveKit
1. Follow [LiveKit's self-hosting guide](https://docs.livekit.io/self-hosting/)
2. Note your server URL (e.g., `ws://localhost:7880`)

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your LiveKit credentials:

```env
LIVEKIT_API_KEY=your-api-key-here
LIVEKIT_API_SECRET=your-api-secret-here
LIVEKIT_URL=wss://your-livekit-server.com
PORT=3000
```

For local development with self-hosted LiveKit:

```env
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_URL=ws://localhost:7880
PORT=3000
```

### 4. Update Frontend API URL

In `script.js`, update the `API_URL` constant if your backend is hosted elsewhere:

```javascript
const API_URL = process.env.API_URL || 'http://localhost:3000';
```

For production, set this to your deployed backend URL.

### 5. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

### 6. Open the App

Open `index.html` in your browser, or serve it through a local web server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js http-server
npx http-server -p 8080
```

Then navigate to `http://localhost:8080`

## Deployment

### Backend (Server)

#### Option 1: Heroku
1. Install Heroku CLI
2. Create `Procfile`: `web: node server.js`
3. Set environment variables in Heroku dashboard
4. Deploy: `git push heroku main`

#### Option 2: Railway/Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

#### Option 3: AWS/Google Cloud/Azure
- Deploy Node.js app with environment variables configured
- Ensure WebSocket support is enabled

### Frontend

#### Option 1: Netlify
1. Drag and drop the project folder
2. Update `API_URL` in `script.js` to your backend URL
3. Deploy

#### Option 2: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Update `API_URL` in `script.js`

#### Option 3: GitHub Pages
1. Push to GitHub
2. Enable Pages in repository settings
3. Update `API_URL` in `script.js` to your backend URL

### Important Notes for Production

1. **HTTPS Required**: WebRTC requires HTTPS (except localhost)
2. **CORS**: Ensure your backend allows requests from your frontend domain
3. **Environment Variables**: Never commit `.env` file to git
4. **API URL**: Update `API_URL` in `script.js` for production

## Game Flow

### Solo Mode
1. Pass age gate
2. Click "Play Solo"
3. Configure settings
4. Start game
5. Follow on-screen instructions

### Multiplayer Mode
1. Pass age gate
2. Create or join a room
3. Wait for players (2-4 required)
4. Host configures settings
5. Host starts battle
6. All players follow synchronized instructions
7. Rankings displayed at end

### Spectator Mode
1. Join room as spectator (or room is full)
2. Watch player webcams and game state
3. Chat with players and other spectators
4. Cannot participate in edging

## Legal Considerations

- **Age Verification**: Mandatory 18+ gate included
- **Consent**: Clear rules about live webcams and recording
- **2257 Compliance**: If recording, collect ID/consent forms
- **Privacy**: No data collection or storage (all in-memory)
- **Moderation**: Host can control room settings
- **Hosting**: Ensure compliance with local laws regarding adult content

## Technical Details

### Tech Stack
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Node.js + Express
- **Real-time**: Socket.io for chat and game state sync
- **WebRTC**: LiveKit for video streaming
- **Hosting**: Any static host (frontend) + Node.js host (backend)

### Architecture
- **Client-Side**: Solo game runs entirely in browser
- **Server-Side**: Room management, game state sync, LiveKit token generation
- **WebRTC**: Peer-to-peer video via LiveKit SFU (Selective Forwarding Unit)

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari (may have WebRTC limitations)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Adjusting Difficulty
Edit `difficultySettings` in `script.js`:
- `strokeMin/Max`: Duration ranges for stroking
- `stopMin/Max`: Duration ranges for stopping
- `edgeGain`: Edge level increase per stroke
- `edgeLoss`: Edge level decrease per stop

### Adding Instructions
Modify the `instructions` object in `script.js` to add more variety.

### Styling
All styles are in `styles.css`. Customize colors, fonts, and animations.

### Room Settings
Modify room creation logic in `server.js` to change:
- Max players (default: 4)
- Spectator limits
- Room code format

## Troubleshooting

### Webcam Not Working
- Check browser permissions
- Ensure HTTPS (required for WebRTC)
- Try different browser
- Check LiveKit server connection

### Can't Connect to Server
- Verify backend is running
- Check `API_URL` in `script.js`
- Verify CORS settings
- Check browser console for errors

### LiveKit Connection Fails
- Verify API key and secret
- Check LiveKit server URL
- Ensure WebSocket support
- Check network firewall settings

## Security Notes

- All WebRTC traffic is encrypted by default
- Use HTTPS for production
- Validate room codes server-side
- Rate limit API endpoints
- Consider adding authentication for production

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all environment variables are set
3. Ensure LiveKit server is accessible
4. Test with solo mode first

## License

ISC
