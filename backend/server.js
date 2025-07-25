// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const dotenv = require('dotenv');

const User = require('./models/user');
const TodoModel = require("./models/todoList");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully.');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }
};
connectDB();

const JWT_SECRET = process.env.JWT_SECRET;

// --- Middleware to Verify JWT Token ---
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: 'A token is required for authentication' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({ error: 'Invalid Token' });
    }
    return next();
};


// --- Authentication Routes ---
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Please provide name, email, and a password of at least 6 characters.' });
  }
  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ status: 'ok', message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration. Please try again later.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
      }
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ email: user.email, userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ status: 'ok', token: token });
      }
      return res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
  } catch(err) {
      console.error(err);
      res.status(500).json({ error: 'Server error during login. Please try again later.' });
  }
});


// --- User Profile Routes ---
app.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/change-password', verifyToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.user;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Please provide current password and a new password of at least 6 characters.' });
    }
    try {
        const user = await User.findById(userId);
        if (!user) { return res.status(404).json({ error: 'User not found.' }); }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) { return res.status(401).json({ error: 'Incorrect current password.' }); }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();
        res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while updating password.' });
    }
});


// --- Dashboard Stats Route ---
app.get('/stats', verifyToken, async (req, res) => {
    try {
        const totalTasks = await TodoModel.countDocuments({ userId: req.user.userId });
        const completedTasks = await TodoModel.countDocuments({ userId: req.user.userId, status: 'Completed' });
        const pendingTasks = await TodoModel.countDocuments({ userId: req.user.userId, status: 'Pending' });
        const inProgressTasks = await TodoModel.countDocuments({ userId: req.user.userId, status: 'In Progress' });

        res.json({
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks
        });
    } catch (err) {
        // ✅ FIX: Log the specific error to the server console for debugging
        console.error("Error fetching stats:", err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});


// --- Todo List API Routes ---
app.get("/getTodoList", verifyToken, (req, res) => {
    TodoModel.find({ userId: req.user.userId }).sort({ deadline: 1 })
        .then(result => res.json(result))
        .catch(err => res.status(500).json({ error: 'Failed to fetch tasks' }));
});

app.post("/addTodoList", verifyToken, (req, res) => {
    const { task, status, deadline } = req.body;
    TodoModel.create({ task, status, deadline, userId: req.user.userId })
    .then(result => res.status(201).json(result))
    .catch(err => res.status(400).json({ error: 'Failed to add task' }));
});

app.post("/updateTodoList/:id", verifyToken, (req, res) => {
    const { id } = req.params;
    const { task, status, deadline } = req.body;
    TodoModel.findOneAndUpdate({ _id: id, userId: req.user.userId }, { task, status, deadline }, { new: true })
    .then(result => {
        if (!result) return res.status(404).json({ error: 'Task not found or user not authorized' });
        res.json(result);
    })
    .catch(err => res.status(400).json({ error: 'Failed to update task' }));
});

app.delete("/deleteTodoList/:id", verifyToken, (req, res) => {
    const { id } = req.params;
    TodoModel.findOneAndDelete({ _id: id, userId: req.user.userId })
    .then(result => {
        if (!result) return res.status(404).json({ error: 'Task not found or user not authorized' });
        res.json({ message: 'Task deleted successfully' });
    })
    .catch(err => res.status(500).json({ error: 'Failed to delete task' }));
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
