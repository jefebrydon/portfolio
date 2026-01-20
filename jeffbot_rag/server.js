/**
 * JeffBot Backend API Server
 * 
 * Express server using OpenAI Responses API with file_search for RAG.
 * Streams responses back to the client via Server-Sent Events (SSE).
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI client with timeout
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Error: OPENAI_API_KEY not found in .env file');
  process.exit(1);
}

const REQUEST_TIMEOUT_MS = 120000; // 2 minutes
const openai = new OpenAI({ 
  apiKey,
  timeout: REQUEST_TIMEOUT_MS,
});

// Configuration
const VECTOR_STORE_ID = process.env.VECTOR_STORE_ID;
if (!VECTOR_STORE_ID) {
  console.warn('Warning: VECTOR_STORE_ID not found in .env file');
  console.warn('The API will require vectorStoreId in request body');
}

const DEFAULT_MODEL = 'gpt-4o';
const DEFAULT_MAX_RESULTS = 10;
const DEFAULT_SYSTEM_PROMPT = `You are JeffBot, a helpful assistant that answers questions about Jeff Brydon's design work, process, and philosophy using the provided case study documents. Be conversational and friendly. When answering questions, reference specific examples from the case studies when relevant.

Keep responses concise but informative. If you don't find relevant information in the documents, say so honestly rather than making things up.`;

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
    
    // Production domains
    if (origin === 'https://www.jeffbrydon.com' || 
        origin === 'https://jeffbrydon.com') {
      return callback(null, true);
    }
    
    // For development, allow all origins
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

/**
 * POST /api/chat - Send a message and stream the response
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], config = {} } = req.body;
    
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
    
    const vectorStoreId = config.vectorStoreId || VECTOR_STORE_ID;
    if (!vectorStoreId) {
      return res.status(500).json({ 
        error: 'Vector Store ID not configured. Please set VECTOR_STORE_ID in .env or provide in request.' 
      });
    }
    
    // Build conversation input from history + new message
    const conversationInput = [
      // Include previous messages from history
      ...history.map(msg => ({
        type: 'message',
        role: msg.role,
        content: msg.content,
      })),
      // Add the new user message
      {
        type: 'message',
        role: 'user',
        content: message.trim(),
      },
    ];
    
    // Extract configuration with defaults
    const model = config.model || DEFAULT_MODEL;
    const maxNumResults = config.maxNumResults || DEFAULT_MAX_RESULTS;
    const systemPrompt = config.systemPrompt || DEFAULT_SYSTEM_PROMPT;
    
    // Set up SSE headers and flush immediately to start streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx/proxy buffering
    res.flushHeaders();
    
    try {
      // Create streaming response using OpenAI SDK
      const stream = await openai.responses.create({
        model,
        instructions: systemPrompt,
        input: conversationInput,
        tools: [
          {
            type: 'file_search',
            vector_store_ids: [vectorStoreId],
            max_num_results: maxNumResults,
          },
        ],
        stream: true,
      });
      
      // Process stream events
      for await (const event of stream) {
        // Forward text delta events to client
        if (event.type === 'response.output_text.delta') {
          res.write(`data: ${JSON.stringify({
            type: 'delta',
            content: event.delta,
          })}\n\n`);
        }
        // Forward completion events
        else if (event.type === 'response.output_text.done') {
          res.write(`data: ${JSON.stringify({
            type: 'text_done',
            content: event.text,
          })}\n\n`);
        }
        // Forward file search events for transparency
        else if (event.type === 'response.file_search_call.searching') {
          res.write(`data: ${JSON.stringify({
            type: 'searching',
          })}\n\n`);
        }
        else if (event.type === 'response.file_search_call.completed') {
          res.write(`data: ${JSON.stringify({
            type: 'search_complete',
          })}\n\n`);
        }
        // Handle errors
        else if (event.type === 'error') {
          res.write(`data: ${JSON.stringify({
            type: 'error',
            error: event.error?.message || 'Unknown error',
          })}\n\n`);
        }
      }
      
      // Send done event
      res.write('data: [DONE]\n\n');
      res.end();
      
    } catch (streamError) {
      console.error('Stream error:', streamError);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: streamError.message || 'Streaming error',
      })}\n\n`);
      res.end();
    }
    
  } catch (error) {
    console.error('Error in /api/chat:', error);
    
    // If headers already sent (streaming started), send error via SSE
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error.message || 'Internal server error',
      })}\n\n`);
      res.end();
      return;
    }
    
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
    vectorStoreId: VECTOR_STORE_ID ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`JeffBot API server running on http://localhost:${PORT}`);
  console.log(`  Vector Store ID: ${VECTOR_STORE_ID ? 'configured' : 'NOT CONFIGURED'}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
});
