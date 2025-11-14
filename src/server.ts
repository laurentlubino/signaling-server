import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Health check endpoint for Render
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'WebRTC Signaling Server',
    version: '1.0.0',
    connections: io.engine.clientsCount,
  });
});

interface SignalData {
  to: string;
  signal: unknown;
}

io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Relay signal to target socket
  socket.on('signal', (data: SignalData) => {
    const { to, signal } = data;

    if (!to || !signal) {
      console.error(`Invalid signal data from ${socket.id}`, data);
      return;
    }

    console.log(`Relaying signal from ${socket.id} to ${to}`);

    // Forward signal to target socket with sender's ID
    io.to(to).emit('signal', {
      from: socket.id,
      signal,
    });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
