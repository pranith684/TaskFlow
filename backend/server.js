// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

// Correctly require the models
const User = require('./models/user');
const TodoModel = require('./models/todoList');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- Database Connection ---
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
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: 'A token is required for authentication' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid Token' });
    }
};

// --- API Routes ---

// Auth Routes
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password || password.length < 6) {
            return res.status(400).json({ error: 'Please provide name, email, and a password of at least 6 characters.' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashedPassword });
        res.status(201).json({ status: 'ok', message: 'User registered successfully.' });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
        }
        const token = jwt.sign({ email: user.email, userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ status: 'ok', token });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// User Profile Routes
app.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json(user);
    } catch (err) {
        console.error('Get Me Error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

app.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Please provide current and new passwords (min 6 chars).' });
        }
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        if (!(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ error: 'Incorrect current password.' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error('Change Password Error:', err);
        res.status(500).json({ error: 'Server error while updating password.' });
    }
});

// Dashboard Stats Route
app.get('/stats', verifyToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const totalTasks = await TodoModel.countDocuments({ userId });
        const completedTasks = await TodoModel.countDocuments({ userId, status: 'Completed' });
        const pendingTasks = await TodoModel.countDocuments({ userId, status: 'Pending' });
        const inProgressTasks = await TodoModel.countDocuments({ userId, status: 'In Progress' });
        res.json({ totalTasks, completedTasks, pendingTasks, inProgressTasks });
    } catch (err) {
        console.error('Stats Error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
    }
});

// Todo List CRUD Routes
app.get('/getTodoList', verifyToken, async (req, res) => {
    try {
        const todos = await TodoModel.find({ userId: req.user.userId }).sort({ deadline: 1 });
        res.json(todos);
    } catch (err) {
        console.error('Get Todos Error:', err);
        res.status(500).json({ error: 'Failed to fetch tasks.' });
    }
});

app.post('/addTodoList', verifyToken, async (req, res) => {
    try {
        const newTodo = await TodoModel.create({ ...req.body, userId: req.user.userId });
        res.status(201).json(newTodo);
    } catch (err) {
        console.error('Add Todo Error:', err);
        res.status(400).json({ error: 'Failed to add task.' });
    }
});

app.post('/updateTodoList/:id', verifyToken, async (req, res) => {
    try {
        const updatedTodo = await TodoModel.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            req.body,
            { new: true }
        );
        if (!updatedTodo) {
            return res.status(404).json({ error: 'Task not found or user not authorized.' });
        }
        res.json(updatedTodo);
    } catch (err) {
        console.error('Update Todo Error:', err);
        res.status(400).json({ error: 'Failed to update task.' });
    }
});

app.delete('/deleteTodoList/:id', verifyToken, async (req, res) => {
    try {
        const deletedTodo = await TodoModel.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!deletedTodo) {
            return res.status(404).json({ error: 'Task not found or user not authorized.' });
        }
        res.json({ message: 'Task deleted successfully.' });
    } catch (err) {
        console.error('Delete Todo Error:', err);
        res.status(500).json({ error: 'Failed to delete task.' });
    }
});


// --- DEPLOYMENT CONFIGURATION ---
// Serve static files from the React app's 'build' directory
const frontendBuildPath = path.resolve(__dirname, '..', 'frontend', 'build');
app.use(express.static(frontendBuildPath));

// The "catchall" handler for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
