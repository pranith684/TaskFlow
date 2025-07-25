// frontend/src/layouts/MainLayout.js

import React from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion'; // ✅ Import animation components
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div>
      <Navbar />
      <main>
        {/* ✅ ENHANCEMENT: AnimatePresence allows components to animate when they are removed from the React tree. */}
        {/* The key={location.pathname} tells it to treat each page route as a new component to animate. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MainLayout;
