// frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Auth.css'; 
import './styles/theme.css'; // ✅ Import the new global theme file

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
