const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const fs = require('fs');
const path = require('path');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Ensure file exists
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify({}));
}

function getMessages() {
  try {
    return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8') || '{}');
  } catch (e) {
    return {};
  }
}

function saveMessage(room, message) {
  const db = getMessages();
  if (!db[room]) db[room] = [];
  db[room].push(message);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(db, null, 2));
}

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for development local port bumping comfort
    methods: ["GET", "POST"],
  },
});

// Mock Database for status
const users = {}; // socket.id -> userId

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // User Joins
  socket.on('join_chat', ({ userId, roomCode }) => {
    const room = roomCode || 'main_chat';
    
    // Allow users to stay in multiple rooms simultaneously
    socket.join(room); 
    if (!users[socket.id]) users[socket.id] = { userId, rooms: [] };
    if (!users[socket.id].rooms.includes(room)) users[socket.id].rooms.push(room);
    
    console.log(`User ${userId} joined room: ${room}`);
    io.to(room).emit('user_status', { userId, status: 'online' });

    // Load historical messages for this room
    const db = getMessages();
    const roomMessages = db[room] || [];
    socket.emit('load_messages', roomMessages);
  });

  // Fetch Messages separately to avoid race condition
  socket.on('get_messages', ({ roomCode }) => {
    const db = getMessages();
    const roomMessages = db[roomCode] || [];
    socket.emit('load_messages', roomMessages);
  });

  // Message Handling
  socket.on('send_message', (data) => {
    if (data.roomCode) {
      // Save message to disk
      saveMessage(data.roomCode, data);
      // Broadcast only to users in THAT room
      socket.to(data.roomCode).emit('receive_message', data);
    }
  });

  // Typing Indicator
  socket.on('typing', (data) => {
    const user = users[socket.id];
    if (user && user.room) {
      socket.to(user.room).emit('user_typing', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
    const user = users[socket.id];
    if (user) {
      delete users[socket.id];
      io.to(user.room).emit('user_status', { userId: user.userId, status: 'offline' });
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
