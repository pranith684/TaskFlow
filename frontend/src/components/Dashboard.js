// frontend/src/components/Dashboard.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTasks, FaCheckCircle, FaHourglassHalf, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Dashboard.css';

// ✅ ENHANCEMENT: Skeleton loader component
const StatCardSkeleton = () => (
  <div className="stat-card skeleton" style={{ backgroundColor: '#e0e0e0' }}></div>
);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setStats(res.data);
      setLoading(false);
    })
    .catch(err => {
      if (err.response) {
        setError(err.response.data.error || 'An unknown server error occurred.');
      } else {
        setError('Cannot connect to the server.');
      }
      setLoading(false);
    });
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (error) {
    return <div className="dashboard-container"><p className="dashboard-error">{error}</p></div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="stat-card blue">
              <div className="stat-icon"><FaTasks /></div>
              <div className="stat-info"><p>Total Tasks</p><span>{stats.totalTasks}</span></div>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="stat-card green">
              <div className="stat-icon"><FaCheckCircle /></div>
              <div className="stat-info"><p>Completed</p><span>{stats.completedTasks}</span></div>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="stat-card yellow">
              <div className="stat-icon"><FaSpinner /></div>
              <div className="stat-info"><p>In Progress</p><span>{stats.inProgressTasks}</span></div>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="stat-card red">
              <div className="stat-icon"><FaHourglassHalf /></div>
              <div className="stat-info"><p>Pending</p><span>{stats.pendingTasks}</span></div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
