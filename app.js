const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const pool = require('./src/config/db');
const parkingRoutes = require('./src/routes/parkingRoutes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(h`elmet()`);
app.use(cors());
app.use(express.json());

app.use('/api/v1', parkingRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Smart Parking Server running on port ${PORT}`);
});

const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await pool.end();
      console.log('Database pool closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database pool closure:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;