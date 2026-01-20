# JeffBot RAG - Vector Store & Backend API

This directory contains scripts and server code for creating and managing the OpenAI vector store used by JeffBot, and the backend API server that handles chat requests.

## Architecture

JeffBot uses the **OpenAI Responses API** with the `file_search` tool for RAG (Retrieval-Augmented Generation). This approach:
- Streams responses in real-time for better UX
- Uses client-side conversation history (stateless server)
- Queries indexed documents via vector store

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in this directory with the following variables:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Vector Store ID (from create-store script output)
VECTOR_STORE_ID=vs_xxxxxxxxxxxxx

# Server Configuration
PORT=3001
```

**Important**: Never commit the `.env` file to version control. It's already in `.gitignore`.

### 3. Create Vector Store

Run the vector store creation script:

```bash
npm run create-store
```

This script will:
- Upload all PDF files from the `jeffbot_rag/` directory to OpenAI
- Wait for files to be processed
- Create a vector store with the uploaded files
- Create an Assistant (legacy, for reference)
- Output the Vector Store ID

**Note**: The script will check for existing vector stores and warn you if one exists. You may want to delete it first if you're recreating the store.

### 4. Update Configuration

After running the script, copy the Vector Store ID from the output:

1. Add to your `.env` file:
```env
VECTOR_STORE_ID=vs_xxxxxxxxxxxxx
```

2. Update `js/jeffbot-config.js` with the same Vector Store ID:
```javascript
vectorStoreId: 'vs_xxxxxxxxxxxxx',
```

## Vector Store ID

The current Vector Store ID (update this when recreating):

- **Vector Store ID:** `vs_6917bbec722c8191a53395ce618e6498`

This ID is used by:
- Backend server (`server.js`) via `VECTOR_STORE_ID` env var
- Frontend (`jeffbot-config.js`) for client-side configuration
- Vercel serverless function (`api/chat.js`) via `VECTOR_STORE_ID` env var

## Running the Backend Server

Start the Express server:

```bash
npm start
```

Or for development:

```bash
npm run dev
```

The server will run on `http://localhost:3001` (or the port specified in your `.env` file).

### API Endpoints

- `POST /api/chat` - Send a message and receive a streaming response (SSE)
- `GET /api/health` - Health check endpoint

### Request Format

```json
{
  "message": "User's question",
  "history": [
    { "role": "user", "content": "Previous question" },
    { "role": "assistant", "content": "Previous answer" }
  ],
  "config": {
    "maxNumResults": 10
  }
}
```

### Response Format

Server-Sent Events (SSE) stream with the following event types:
- `delta` - Text chunk being generated
- `text_done` - Final complete text
- `searching` - File search started
- `search_complete` - File search finished
- `error` - Error occurred

## File Limits

- Maximum file size: 512MB per file
- Maximum files per vector store: 10,000 files
- Supported formats: PDF, text files, and other formats supported by OpenAI

## Updating the Vector Store

If you need to update the vector store (e.g., after adding new PDFs):

1. Delete the existing vector store via OpenAI dashboard or API
2. Run `npm run create-store` again
3. Update `VECTOR_STORE_ID` in your `.env` file
4. Update `vectorStoreId` in `js/jeffbot-config.js`

## Troubleshooting

### "OPENAI_API_KEY not found"
- Make sure you've created a `.env` file in this directory
- Verify the file contains `OPENAI_API_KEY=your_key_here`

### "VECTOR_STORE_ID not found"
- Run `npm run create-store` to create a vector store
- Copy the Vector Store ID to your `.env` file

### "No PDF files found"
- Ensure PDF files are in the `jeffbot_rag/` directory
- Check that files have `.pdf` extension (case-insensitive)

### File processing timeout
- Large files may take longer to process
- The script will wait up to 2 minutes per file
- If a file times out, check the OpenAI dashboard for processing status

### CORS errors
- Make sure the backend server is running
- Check that the frontend is using the correct API URL
- Verify CORS settings in `server.js` allow your frontend origin

### Streaming not working
- Check browser console for errors
- Verify the response `Content-Type` is `text/event-stream`
- Ensure no proxy is buffering the SSE response



