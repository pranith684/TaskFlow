import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Logo = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V17C5 18.1046 5.89543 19 7 19H17C18.1046 19 19 18.1046 19 17V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12L11 14L15 10" stroke="var(--secondary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        logout(navigate);
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(res => setUser(res.data))
            .catch(err => {
                console.error("Failed to fetch user data", err);
                handleLogout();
            });
        }
    }, [handleLogout]);

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/dashboard" className="navbar-brand">
                    <Logo />
                    <span>TaskFlow</span>
                </Link>
                <div className="navbar-links">
                    <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
                    <NavLink to="/todo" className="nav-link">Tasks</NavLink>
                </div>
            </div>
            <div className="navbar-right">
                {user && (
                    <Link to="/profile" className="navbar-username">
                        Welcome, {user.name}
                    </Link>
                )}
                <ThemeToggle />
                <button onClick={handleLogout} className="navbar-logout-btn">
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;