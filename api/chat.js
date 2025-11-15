// api/chat.js - Vercel Serverless Function for JeffBot
//
// This function receives chat messages from the frontend, forwards them to
// OpenAI's Assistants API (using your existing Assistant + Vector Store),
// and returns the assistant's reply.
//
// It uses the low-level HTTPS API with `fetch` so we don't need any
// additional Node dependencies in this project.

const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const TIMEOUT_MS = 60000;

export default async function handler(req, res) {
  // Only allow POST requests; return 405 for others
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.ASSISTANT_ID;

  if (!apiKey || !assistantId) {
    return res.status(500).json({
      error: 'Server is missing OPENAI_API_KEY or ASSISTANT_ID',
    });
  }

  try {
    const { message, threadId } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string',
      });
    }

    let currentThreadId = threadId;

    // Helper to call OpenAI API with proper headers
    async function openaiFetch(path, options = {}) {
      const url = `${OPENAI_BASE_URL}${path}`;
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Assistants v2 beta header
        'OpenAI-Beta': 'assistants=v2',
        ...(options.headers || {}),
      };

      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errBody = await safeJson(response);
        const message = errBody?.error?.message || response.statusText;
        const error = new Error(`HTTP ${response.status}: ${message}`);
        error.status = response.status;
        error.body = errBody;
        throw error;
      }
      return response.json();
    }

    async function safeJson(response) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }

    // 1) Create thread if none provided
    if (!currentThreadId) {
      const thread = await openaiFetch('/threads', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      currentThreadId = thread.id;
    }

    // 2) Add user message to thread
    await openaiFetch(`/threads/${currentThreadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        role: 'user',
        content: message.trim(),
      }),
    });

    // 3) Create a run for this assistant
    const run = await openaiFetch(`/threads/${currentThreadId}/runs`, {
      method: 'POST',
      body: JSON.stringify({
        assistant_id: assistantId,
      }),
    });

    const runId = run.id;

    // 4) Poll run status until completed / failed / timeout
    const startTime = Date.now();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (Date.now() - startTime > TIMEOUT_MS) {
        throw new Error('Request timed out');
      }

      const runStatus = await openaiFetch(
        `/threads/${currentThreadId}/runs/${runId}`,
        { method: 'GET' },
      );

      if (runStatus.status === 'completed') {
        break;
      }

      if (
        runStatus.status === 'failed' ||
        runStatus.status === 'cancelled' ||
        runStatus.status === 'expired'
      ) {
        throw new Error(`Run ${runStatus.status}`);
      }

      // Still running: queued | in_progress
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 5) Fetch assistant messages (most recent first)
    const messages = await openaiFetch(
      `/threads/${currentThreadId}/messages?limit=5&order=desc`,
      { method: 'GET' },
    );

    const assistantMessage = (messages.data || []).find(
      (msg) => msg.role === 'assistant',
    );

    if (!assistantMessage) {
      return res.status(500).json({
        error: 'No response from assistant',
        threadId: currentThreadId,
      });
    }

    const text = (assistantMessage.content || [])
      .filter((item) => item.type === 'text')
      .map((item) => item.text?.value || '')
      .join('\n\n');

    return res.status(200).json({
      success: true,
      threadId: currentThreadId,
      response: text,
    });
  } catch (error) {
    console.error('api/chat error:', error);

    // Map known HTTP errors
    if (error.status) {
      return res.status(error.status).json({
        error: error.message || 'OpenAI API error',
      });
    }

    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}


