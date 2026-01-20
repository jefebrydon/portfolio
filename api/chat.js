// api/chat.js - Vercel Serverless Function for JeffBot
//
// Uses OpenAI's Responses API with file_search for RAG capabilities.
// Streams responses back to the client via Server-Sent Events (SSE).

const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const REQUEST_TIMEOUT_MS = 120000; // 2 minutes

// Default configuration (can be overridden by request)
const DEFAULT_MODEL = 'gpt-4o';
const DEFAULT_MAX_RESULTS = 10;
const DEFAULT_SYSTEM_PROMPT = `You are JeffBot, a helpful assistant that answers questions about Jeff Brydon's design work, process, and philosophy using the provided case study documents. Be conversational and friendly. When answering questions, reference specific examples from the case studies when relevant.

Keep responses concise but informative. If you don't find relevant information in the documents, say so honestly rather than making things up.`;

// Check if origin is allowed (includes localhost for development)
function isAllowedOrigin(origin) {
  if (!origin) return false;
  
  const allowedOrigins = [
    'https://www.jeffbrydon.com',
    'https://jeffbrydon.com',
    'https://portfolio-six-nu-9myb2s6fia.vercel.app',
  ];
  
  if (allowedOrigins.includes(origin)) return true;
  
  // Allow localhost for development
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    return true;
  }
  
  return false;
}

export default async function handler(req, res) {
  // CORS configuration
  const requestOrigin = req.headers.origin;
  if (isAllowedOrigin(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.jeffbrydon.com');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const vectorStoreId = process.env.VECTOR_STORE_ID;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing OPENAI_API_KEY' });
  }

  if (!vectorStoreId) {
    return res.status(500).json({ error: 'Server is missing VECTOR_STORE_ID' });
  }

  try {
    const { message, history = [], config = {} } = req.body || {};

    // Validate message
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string',
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: 'Message exceeds maximum length of 2000 characters',
      });
    }

    // Build conversation input from history + new message
    const conversationInput = [
      // Include previous messages from history
      ...history.map((msg) => ({
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

    // Build the Responses API request
    const requestBody = {
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
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response;
    try {
      // Call OpenAI Responses API with streaming
      response = await fetch(`${OPENAI_BASE_URL}/responses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({ error: 'Request timed out after 2 minutes' });
      }
      throw fetchError;
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMessage = errorBody?.error?.message || response.statusText;
      return res.status(response.status).json({
        error: `OpenAI API error: ${errorMessage}`,
      });
    }

    // Set up SSE headers for streaming and flush immediately
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders(); // Send headers immediately to start streaming

    // Stream the response to the client
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Send done event
          res.write('data: [DONE]\n\n');
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              res.write('data: [DONE]\n\n');
              continue;
            }

            try {
              const event = JSON.parse(data);
              
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
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    res.end();
  } catch (error) {
    console.error('api/chat error:', error);

    // If headers already sent (streaming started), we can't send JSON error
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error.message || 'Internal server error',
      })}\n\n`);
      res.end();
      return;
    }

    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}
