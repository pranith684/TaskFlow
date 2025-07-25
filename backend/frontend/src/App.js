// frontend/src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Login';
import Register from './components/Register';
import Todo from './components/ToDo';
import Profile from './components/Profile';
import Dashboard from './components/Dashboard';
import MainLayout from './layouts/MainLayout';
import { isAuthenticated } from './utils/auth';
import { ThemeProvider } from './context/ThemeContext'; // ✅ Import ThemeProvider

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? (
    <MainLayout>{children}</MainLayout>
  ) : (
    <Navigate to="/" />
  );
};

function App() {
  return (
    // ✅ Wrap the entire app in the ThemeProvider
    <ThemeProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored" // Use colored theme for better visibility in both modes
        />
        <Routes>
          <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Register />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/todo" element={<ProtectedRoute><Todo /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
