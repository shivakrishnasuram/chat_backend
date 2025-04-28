import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const mongoURI = "mongodb+srv://sskrishna:Shiv%40123@mydatabase.yo2hy.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=mydatabase";

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

const MessageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);

// Register Route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ error: 'User already exists' });
  const user = new User({ username, password });
  await user.save();
  res.json({ success: true, message: 'Registered successfully' });
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, username }, 'SECRET', { expiresIn: '1d' });
  res.json({ token, username });
});

// Socket.IO chat
io.on('connection', (socket) => {
  console.log('🟢 A user connected');

  socket.on('send_message', async (data) => {
    const msg = new Message({ sender: data.sender, text: data.text });
    await msg.save();
    io.emit('receive_message', msg);
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected');
  });
});

server.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
