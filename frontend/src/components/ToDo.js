// frontend/src/components/ToDo.js

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Modal, Button, Form, FormControl } from 'react-bootstrap';
import { FaPlus, FaFilter, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import './ToDo.css';

// KEY CHANGE: Create a base axios instance without static headers.
const api = axios.create({
    baseURL: 'http://localhost:3001'
});

// Use an interceptor to dynamically add the latest token to every request.
// This is the standard way to handle JWT authentication and solves login issues.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Set the Authorization header for the outgoing request
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle any request errors
        return Promise.reject(error);
    }
);


const TodoCardSkeleton = () => (
    <div className="todo-card">
        <div className="card-header skeleton" style={{ height: '40px', marginBottom: '1rem' }}></div>
        <div className="card-body">
            <div className="skeleton" style={{ height: '20px', width: '80%', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ height: '16px', width: '50%' }}></div>
        </div>
    </div>
);


function Todo() {
    const [todoList, setTodoList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentTodo, setCurrentTodo] = useState(null);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTodos = useCallback(() => {
        setLoading(true);
        api.get('/getTodoList')
            .then(result => {
                setTodoList(result.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch Error:", err.response ? err.response.data : err.message);
                toast.error("Failed to fetch tasks.");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    useEffect(() => {
        let result = todoList;
        if (filter !== 'All') {
            result = result.filter(todo => todo.status === filter);
        }
        if (searchTerm) {
            result = result.filter(todo =>
                todo.task.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredList(result);
    }, [filter, searchTerm, todoList]);

    // --- Modal & API Handlers (No changes from your original) ---
    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);
    const handleShowEditModal = (todo) => {
        setCurrentTodo({
            ...todo,
            deadline: todo.deadline ? format(new Date(todo.deadline), "yyyy-MM-dd'T'HH:mm") : ''
        });
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setCurrentTodo(null);
    };
    const handleAddTask = (e) => {
        e.preventDefault();
        const { task, status, deadline } = e.target.elements;
        api.post('/addTodoList', { task: task.value, status: status.value, deadline: deadline.value })
        .then(() => {
            toast.success("Task added successfully!");
            fetchTodos();
            handleCloseAddModal();
        })
        .catch(err => {
            console.error("Add Task Error:", err.response ? err.response.data : err.message);
            toast.error("Failed to add task.");
        });
    };
    const handleUpdateTask = (e) => {
        e.preventDefault();
        const { task, status, deadline } = e.target.elements;
        api.post(`/updateTodoList/${currentTodo._id}`, { task: task.value, status: status.value, deadline: deadline.value })
        .then(() => {
            toast.success("Task updated successfully!");
            fetchTodos();
            handleCloseEditModal();
        })
        .catch(err => toast.error("Failed to update task."));
    };
    const handleDeleteTask = (id) => {
        toast(<div>
            <p>Are you sure you want to delete this task?</p>
            <Button variant="danger" size="sm" onClick={() => confirmDelete(id)}>Yes, Delete</Button>
            <Button variant="secondary" size="sm" className="ms-2" onClick={() => toast.dismiss()}>Cancel</Button>
        </div>, { autoClose: false, closeOnClick: false, draggable: false });
    };
    const confirmDelete = (id) => {
        api.delete(`/deleteTodoList/${id}`)
            .then(() => {
                toast.success("Task deleted successfully!");
                fetchTodos();
            })
            .catch(err => toast.error("Failed to delete task."))
            .finally(() => toast.dismiss());
    };
    const getStatusBadge = (status) => {
        switch(status.toLowerCase()) {
            case 'completed': return 'badge-success';
            case 'in progress': return 'badge-warning';
            case 'pending': return 'badge-danger';
            default: return 'badge-secondary';
        }
    };
    // --- End of Handlers ---

    return (
        <div className="todo-container">
            <div className="todo-header">
                <h1>My Tasks</h1>
                <div className="todo-actions">
                    <div className="search-container">
                        <FaSearch className="search-icon" />
                        <FormControl type="search" placeholder="Search tasks..." className="me-2" aria-label="Search" onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="filter-container">
                        <FaFilter />
                        <Form.Select size="sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option>All</option><option>Pending</option><option>In Progress</option><option>Completed</option>
                        </Form.Select>
                    </div>
                    <Button variant="primary" onClick={handleShowAddModal}><FaPlus /> Add Task</Button>
                </div>
            </div>

            <div className="todo-list">
                {loading ? (
                    Array.from({ length: 4 }).map((_, index) => <TodoCardSkeleton key={index} />)
                ) : (
                    filteredList.length > 0 ? filteredList.map((todo, index) => (
                        <motion.div
                            key={todo._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="todo-card"
                        >
                            <div className="card-header">
                                <span className={`status-badge ${getStatusBadge(todo.status)}`}>{todo.status}</span>
                                <div className="card-actions">
                                    <FaEdit className="action-icon" onClick={() => handleShowEditModal(todo)} />
                                    <FaTrash className="action-icon-delete" onClick={() => handleDeleteTask(todo._id)} />
                                </div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">{todo.task}</h5>
                                {todo.deadline && (
                                    <p className="card-deadline">
                                        Deadline: {format(new Date(todo.deadline), 'MMM dd, yyyy - h:mm a')}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )) : (
                        <div className="no-tasks-container">
                           <p className="no-tasks-message">No tasks found. Add one to get started!</p>
                        </div>
                    )
                )}
            </div>

            {/* Modals (No changes needed) */}
            <Modal show={showAddModal} onHide={handleCloseAddModal} centered>
                <Modal.Header closeButton><Modal.Title>Add New Task</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddTask}>
                        <Form.Group className="mb-3"><Form.Label>Task</Form.Label><Form.Control name="task" type="text" placeholder="Enter task description" required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Select name="status" required><option value="">Select Status</option><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></Form.Select></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Deadline</Form.Label><Form.Control name="deadline" type="datetime-local" required /></Form.Group>
                        <Button variant="primary" type="submit" className="w-100">Add Task</Button>
                    </Form>
                </Modal.Body>
            </Modal>
            {currentTodo && (
                <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
                    <Modal.Header closeButton><Modal.Title>Edit Task</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleUpdateTask}>
                            <Form.Group className="mb-3"><Form.Label>Task</Form.Label><Form.Control name="task" type="text" defaultValue={currentTodo.task} required /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Select name="status" defaultValue={currentTodo.status} required><option value="">Select Status</option><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></Form.Select></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Deadline</Form.Label><Form.Control name="deadline" type="datetime-local" defaultValue={currentTodo.deadline} required /></Form.Group>
                            <Button variant="success" type="submit" className="w-100">Save Changes</Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            )}
        </div>
    );
}

export default Todo;