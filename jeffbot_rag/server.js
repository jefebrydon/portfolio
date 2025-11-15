/**
 * JeffBot Backend API Server
 * 
 * Express server that proxies OpenAI Assistant API calls
 * Keeps API keys secure on the server-side
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI client
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ Error: OPENAI_API_KEY not found in .env file');
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    // Allow localhost and file:// protocols for development
    if (origin.startsWith('http://localhost') || 
        origin.startsWith('http://127.0.0.1') ||
        origin.startsWith('file://')) {
      return callback(null, true);
    }
    
    // In production, add your specific domain here
    // if (origin === 'https://www.jeffbrydon.com') {
    //   return callback(null, true);
    // }
    
    // For now, allow all origins (restrict in production)
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Configuration
const ASSISTANT_ID = process.env.ASSISTANT_ID;
if (!ASSISTANT_ID) {
  console.warn('⚠️  Warning: ASSISTANT_ID not found in .env file');
  console.warn('   The API will require assistantId in request body');
}

const TIMEOUT_MS = 60000; // 60 seconds
const POLL_INTERVAL = 1000; // 1 second
const MAX_POLL_ATTEMPTS = 120; // 2 minutes max

/**
 * Poll run status until completion
 */
async function pollRunStatus(threadId, runId) {
  let attempts = 0;
  
  while (attempts < MAX_POLL_ATTEMPTS) {
    try {
      const run = await openai.beta.threads.runs.retrieve(threadId, runId);
      
      if (run.status === 'completed') {
        return { status: 'completed', run };
      } else if (run.status === 'failed') {
        return { 
          status: 'failed', 
          error: run.last_error?.message || 'Run failed' 
        };
      } else if (run.status === 'requires_action') {
        return { 
          status: 'requires_action', 
          error: 'Assistant requires action (tool use)' 
        };
      } else if (run.status === 'cancelled' || run.status === 'expired') {
        return { 
          status: run.status, 
          error: `Run was ${run.status}` 
        };
      }
      
      // Still processing: queued, in_progress, cancelling
      attempts++;
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      
    } catch (error) {
      return { 
        status: 'error', 
        error: error.message || 'Error polling run status' 
      };
    }
  }
  
  return { 
    status: 'timeout', 
    error: 'Request timed out after 2 minutes' 
  };
}

/**
 * Extract text content from assistant message
 */
function extractMessageContent(message) {
  if (!message.content || !Array.isArray(message.content)) {
    return '';
  }
  
  return message.content
    .filter(item => item.type === 'text')
    .map(item => item.text?.value || '')
    .join('\n\n');
}

/**
 * POST /api/chat - Send a message to the assistant
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, threadId, assistantId } = req.body;
    
    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required and must be a non-empty string' 
      });
    }
    
    if (message.length > 2000) {
      return res.status(400).json({ 
        error: 'Message exceeds maximum length of 2000 characters' 
      });
    }
    
    const finalAssistantId = assistantId || ASSISTANT_ID;
    if (!finalAssistantId) {
      return res.status(500).json({ 
        error: 'Assistant ID not configured. Please set ASSISTANT_ID in .env or provide in request.' 
      });
    }
    
    let currentThreadId = threadId;
    
    // Create thread if not provided
    if (!currentThreadId) {
      try {
        const thread = await openai.beta.threads.create();
        currentThreadId = thread.id;
      } catch (error) {
        return res.status(500).json({ 
          error: `Failed to create thread: ${error.message}` 
        });
      }
    }
    
    // Add user message to thread
    try {
      await openai.beta.threads.messages.create(currentThreadId, {
        role: 'user',
        content: message.trim()
      });
    } catch (error) {
      return res.status(500).json({ 
        error: `Failed to add message to thread: ${error.message}` 
      });
    }
    
    // Run assistant
    let run;
    try {
      run = await openai.beta.threads.runs.create(currentThreadId, {
        assistant_id: finalAssistantId
      });
    } catch (error) {
      return res.status(500).json({ 
        error: `Failed to run assistant: ${error.message}` 
      });
    }
    
    // Poll for completion with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), TIMEOUT_MS);
    });
    
    const pollPromise = pollRunStatus(currentThreadId, run.id);
    
    let pollResult;
    try {
      pollResult = await Promise.race([pollPromise, timeoutPromise]);
    } catch (error) {
      return res.status(504).json({ 
        error: 'Request timed out. Please try again.' 
      });
    }
    
    if (pollResult.status !== 'completed') {
      return res.status(500).json({ 
        error: pollResult.error || 'Assistant run did not complete successfully' 
      });
    }
    
    // Retrieve assistant's response
    try {
      const messages = await openai.beta.threads.messages.list(currentThreadId, {
        limit: 1,
        order: 'desc'
      });
      
      const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
      if (!assistantMessage) {
        return res.status(500).json({ 
          error: 'No response from assistant' 
        });
      }
      
      const responseText = extractMessageContent(assistantMessage);
      
      return res.json({
        threadId: currentThreadId,
        response: responseText,
        success: true
      });
      
    } catch (error) {
      return res.status(500).json({ 
        error: `Failed to retrieve response: ${error.message}` 
      });
    }
    
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
});

/**
 * GET /api/health - Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    assistantId: ASSISTANT_ID ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 JeffBot API server running on http://localhost:${PORT}`);
  console.log(`   Assistant ID: ${ASSISTANT_ID ? 'configured' : 'NOT CONFIGURED'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});



