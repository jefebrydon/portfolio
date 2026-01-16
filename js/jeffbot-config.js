/**
 * JeffBot Configuration
 * 
 * Configuration file for JeffBot frontend integration.
 * Update the assistantId after running the vector store creation script.
 */

(function() {
  'use strict';
  
  // Assistant ID - Update this after running create-vector-store.js
  // You can also set this via window.JEFFBOT_CONFIG.assistantId in your HTML
  window.JEFFBOT_CONFIG = window.JEFFBOT_CONFIG || {
    assistantId: 'asst_LmZ4JnFT5GAdJ8gydgYIVncj', // Update if you recreate the Assistant
    apiBaseUrl: (function() {
      // Auto-detect environment
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001/api';
      }

      // Production: call the Vercel serverless function directly
      return 'https://portfolio-six-nu-9myb2s6fia.vercel.app/api';
    })()
  };
})();



