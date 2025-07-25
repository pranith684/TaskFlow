// frontend/src/components/AuthAnimation.js

import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/task_animation.json';

function AuthAnimation() {
  // ✅ DEFINITIVE FIX: Wrap the Lottie player in a styled div.
  // This container creates a stable "box" for the animation to live in,
  // guaranteeing it will be visible.
  const containerStyle = {
    width: '100%',
    maxWidth: '500px', // You can adjust this value to make the animation bigger or smaller
    height: 'auto',
  };

  return (
    <div style={containerStyle}>
      <Lottie
        animationData={animationData}
        loop={true}
        // This style tells the animation to fill the container we just made
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default AuthAnimation;
