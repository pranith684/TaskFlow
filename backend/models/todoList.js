// backend/models/todoList.js

const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
    },
    // ✅ FIX: Add a reference to the User model
    // This links each todo item to the user who created it.
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});


const TodoList = mongoose.model("todo", todoSchema);

module.exports = TodoList;
