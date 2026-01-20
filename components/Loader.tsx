import React from 'react';
import './Loader.css';

interface LoaderProps {
  className?: string;
}

/**
 * Loader Component - Pulsing JeffBot icon
 * 
 * Reference React component for the loader animation.
 * The actual implementation is in CSS (jeff-brydon.webflow.css)
 * and created dynamically in JavaScript (jeffbot.js).
 * 
 * Uses JeffBot_button.svg as base with JeffBot_button_hover.svg
 * overlay that pulses (fades in 300ms, fades out 300ms).
 */
export const Loader: React.FC<LoaderProps> = ({ className = '' }) => {
  return (
    <div className={`jeffbot-loader ${className}`} role="status" aria-label="Loading response">
      <img 
        className="jeffbot-loader-base" 
        src="images/JeffBot_button.svg" 
        alt="" 
        aria-hidden="true" 
      />
      <img 
        className="jeffbot-loader-overlay" 
        src="images/JeffBot_button_hover.svg" 
        alt="" 
        aria-hidden="true" 
      />
    </div>
  );
};




