# WebRTC Signaling Server

Simple Socket.io-based signaling server for WebRTC connections using simple-peer.

## Features

- Direct peer-to-peer signaling via socket IDs
- No room management - pure relay
- CORS enabled
- Health check endpoint for hosting platforms
- TypeScript

## Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

Server runs on `http://localhost:3000` by default.

## Client Usage

```javascript
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

const socket = io('http://localhost:3000');

// Get your socket ID when connected
socket.on('connect', () => {
  console.log('My socket ID:', socket.id);
});

// Create peer
const peer = new SimplePeer({
  initiator: true, // or false
  trickle: true
});

// Send signal to target peer
peer.on('signal', (signal) => {
  socket.emit('signal', {
    to: 'TARGET_SOCKET_ID', // The other peer's socket.id
    signal: signal
  });
});

// Receive signal from other peer
socket.on('signal', (data) => {
  const { from, signal } = data;
  console.log('Signal from:', from);
  peer.signal(signal);
});

// Handle connection
peer.on('connect', () => {
  console.log('Peer connected!');
});
```

## Deploy to Render

### Option 1: Using Render Dashboard

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub/GitLab repository
3. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Deploy!

### Option 2: Using render.yaml

Create a `render.yaml` file (already included):

```yaml
services:
  - type: web
    name: signaling-server
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /health
```

Then connect the repo and Render will auto-detect the configuration.

## Environment Variables

- `PORT` - Server port (automatically set by Render)

## API Endpoints

- `GET /` - Server info and connection count
- `GET /health` - Health check (returns `{ status: 'ok', timestamp: '...' }`)

## Socket Events

### Client → Server

**`signal`**
```typescript
{
  to: string;      // Target socket ID
  signal: unknown; // WebRTC signal data (offer/answer/ICE candidate)
}
```

### Server → Client

**`signal`**
```typescript
{
  from: string;    // Sender socket ID
  signal: unknown; // WebRTC signal data
}
```

## License

MIT

