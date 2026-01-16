import React from 'react';
import './Loader.css';

interface LoaderProps {
  className?: string;
}

/**
 * Loader Component - Three bouncing teal dots
 * 
 * Reference React component for the loader animation.
 * The actual implementation is in CSS (jeff-brydon.webflow.css)
 * and created dynamically in JavaScript (jeffbot.js).
 */
export const Loader: React.FC<LoaderProps> = ({ className = '' }) => {
  return (
    <div className={`jeffbot-loader ${className}`} role="status" aria-label="Loading response">
      <div className="jeffbot-loader-dot"></div>
      <div className="jeffbot-loader-dot"></div>
      <div className="jeffbot-loader-dot"></div>
    </div>
  );
};




