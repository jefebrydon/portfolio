/**
 * JeffBot Configuration
 * 
 * Configuration file for JeffBot frontend integration.
 * Uses the Responses API with file_search for RAG capabilities.
 */

(function() {
  'use strict';
  
  // System prompt for JeffBot - defines personality and behavior
  const SYSTEM_PROMPT = `You are JeffBot, a helpful assistant that answers questions about Jeff Brydon's design work, process, and philosophy using the provided case study documents. Be conversational and friendly. When answering questions, reference specific examples from the case studies when relevant.

Keep responses concise but informative. If you don't find relevant information in the documents, say so honestly rather than making things up.`;

  window.JEFFBOT_CONFIG = window.JEFFBOT_CONFIG || {
    // Vector Store ID - contains the indexed case study documents
    // Update this if you recreate the vector store
    vectorStoreId: 'vs_6917bbec722c8191a53395ce618e6498',
    
    // System prompt for the assistant
    systemPrompt: SYSTEM_PROMPT,
    
    // Model to use for responses
    model: 'gpt-4o',
    
    // File search configuration
    fileSearch: {
      maxNumResults: 10  // Limit chunks for faster responses
    },
    
    // API endpoint - auto-detect environment
    apiBaseUrl: (function() {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      
      // Local development: localhost, 127.0.0.1, or file:// protocol
      if (hostname === 'localhost' || hostname === '127.0.0.1' || protocol === 'file:') {
        return 'http://localhost:3001/api';
      }
      
      // Custom domains: Use Vercel production URL for API
      // (needed because jeffbrydon.com is hosted on GitHub Pages, not Vercel)
      if (hostname === 'www.jeffbrydon.com' || hostname === 'jeffbrydon.com') {
        return 'https://portfolio-jeff-brydons-projects.vercel.app/api';
      }
      
      // Vercel preview/production deployments: Use same origin
      return `${protocol}//${hostname}/api`;
    })()
  };
})();



