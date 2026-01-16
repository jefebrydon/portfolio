# JeffBot RAG - Vector Store & Backend API

This directory contains scripts and server code for creating and managing the OpenAI vector store used by JeffBot, and the backend API server that handles chat requests.

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

# Assistant Configuration (from Phase 1 script output)
ASSISTANT_ID=your_assistant_id_here

# Server Configuration
PORT=3001
```

**Important**: Never commit the `.env` file to version control. It's already in `.gitignore`.

### 3. Create Vector Store and Assistant

Run the vector store creation script:

```bash
npm run create-store
```

This script will:
- Upload all PDF files from the `jeffbot_rag/` directory to OpenAI
- Wait for files to be processed
- Create a vector store with the uploaded files
- Create an Assistant with file_search tool attached
- Output the Vector Store ID and Assistant ID

**Note**: The script will check for existing vector stores and warn you if one exists. You may want to delete it first if you're recreating the store.

### 4. Update .env File

After running the script, copy the Assistant ID from the output and add it to your `.env` file:

```env
ASSISTANT_ID=asst_xxxxxxxxxxxxx
```

js/jeffbot-config.js is updated with the ASSISTANT_ID, so the frontend now defaults to that Assistant ID. (If you ever recreate the Assistant, just change the string there.)

## Vector Store & Assistant IDs

The Assistant permanently knows which vector store to use, so the vector store ID does **not** need to live in `.env`—only the `ASSISTANT_ID` must be private for the backend to authenticate. Keep these IDs here for quick reference when rotating assistants or cleaning up resources:

- **Vector Store ID:** `vs_6917bbec722c8191a53395ce618e6498`
- **Assistant ID (current default):** `asst_LmZ4JnFT5GAdJ8gydgYIVncj`

If you recreate either resource:
1. Update `ASSISTANT_ID` in `.env` for the backend.
2. Update `assistantId` in `js/jeffbot-config.js` so the frontend points to the same Assistant.
3. (Optional) Refresh the IDs in this README so future updates know which assets are active.

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

## File Limits

- Maximum file size: 512MB per file
- Maximum files per vector store: 10,000 files
- Supported formats: PDF, text files, and other formats supported by OpenAI

## Updating the Vector Store

If you need to update the vector store (e.g., after adding new PDFs):

1. Delete the existing vector store via OpenAI dashboard or API
2. Run `npm run create-store` again
3. Update the Assistant ID in your `.env` file if it changed

## Troubleshooting

### "OPENAI_API_KEY not found"
- Make sure you've created a `.env` file in this directory
- Verify the file contains `OPENAI_API_KEY=your_key_here`

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



