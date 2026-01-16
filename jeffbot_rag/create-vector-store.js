#!/usr/bin/env node

/**
 * OpenAI Vector Store Creation Script
 * 
 * This script:
 * 1. Uploads all PDF files from the jeffbot_rag directory to OpenAI
 * 2. Creates a vector store with the uploaded files
 * 3. Creates an Assistant with file_search tool attached to the vector store
 * 4. Outputs the vector store ID and assistant ID for use in the application
 */

require('dotenv').config();
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI client
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ Error: OPENAI_API_KEY not found in .env file');
  console.error('   Please create a .env file with your OpenAI API key');
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

// Configuration
const SCRIPT_DIR = __dirname;
const MAX_FILE_SIZE = 512 * 1024 * 1024; // 512MB in bytes
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_ATTEMPTS = 60; // 2 minutes max wait time

/**
 * Get all PDF files from the current directory
 */
function getPDFFiles() {
  const files = fs.readdirSync(SCRIPT_DIR);
  return files
    .filter(file => file.toLowerCase().endsWith('.pdf'))
    .map(file => path.join(SCRIPT_DIR, file))
    .filter(filePath => {
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        return false;
      }
      if (stats.size > MAX_FILE_SIZE) {
        console.warn(`⚠️  Warning: ${path.basename(filePath)} exceeds 512MB limit (${(stats.size / 1024 / 1024).toFixed(2)}MB). Skipping.`);
        return false;
      }
      return true;
    });
}

/**
 * Upload a file to OpenAI
 */
async function uploadFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`📤 Uploading ${fileName}...`);
  
  try {
    const fileStream = fs.createReadStream(filePath);
    const file = await openai.files.create({
      file: fileStream,
      purpose: 'assistants'
    });
    
    console.log(`   ✓ Uploaded: ${fileName} (ID: ${file.id})`);
    return file;
  } catch (error) {
    console.error(`   ❌ Failed to upload ${fileName}:`, error.message);
    throw error;
  }
}

/**
 * Wait for file processing to complete
 */
async function waitForFileProcessing(fileId, fileName) {
  console.log(`   ⏳ Waiting for ${fileName} to be processed...`);
  
  let attempts = 0;
  while (attempts < MAX_POLL_ATTEMPTS) {
    try {
      const file = await openai.files.retrieve(fileId);
      
      if (file.status === 'processed') {
        console.log(`   ✓ ${fileName} processed successfully`);
        return true;
      } else if (file.status === 'error') {
        console.error(`   ❌ ${fileName} processing failed`);
        return false;
      } else if (file.status === 'pending' || file.status === 'processing') {
        attempts++;
        if (attempts % 5 === 0) {
          console.log(`   ⏳ Still processing... (${attempts * POLL_INTERVAL / 1000}s)`);
        }
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }
    } catch (error) {
      console.error(`   ❌ Error checking file status:`, error.message);
      return false;
    }
  }
  
  console.error(`   ❌ Timeout waiting for ${fileName} to process`);
  return false;
}

/**
 * Create vector store with file IDs
 */
async function createVectorStore(fileIds, fileNames) {
  if (fileIds.length === 0) {
    throw new Error('No files to add to vector store');
  }
  
  console.log(`\n📦 Creating vector store with ${fileIds.length} file(s)...`);
  
  try {
    const vectorStore = await openai.vectorStores.create({
      name: 'JeffBot RAG Vector Store',
      file_ids: fileIds
    });
    
    console.log(`   ✓ Vector store created (ID: ${vectorStore.id})`);
    return vectorStore;
  } catch (error) {
    console.error(`   ❌ Failed to create vector store:`, error.message);
    throw error;
  }
}

/**
 * Create Assistant with vector store
 */
async function createAssistant(vectorStoreId) {
  console.log(`\n🤖 Creating Assistant with vector store...`);
  
  try {
    const assistant = await openai.beta.assistants.create({
      name: 'JeffBot Assistant',
      instructions: "You are JeffBot, a helpful assistant that answers questions about Jeff Brydon's design work, process, and philosophy using the provided case study documents. Be conversational and friendly. When answering questions, reference specific examples from the case studies when relevant.",
      model: 'gpt-4o',
      tools: [{ type: 'file_search' }],
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStoreId]
        }
      }
    });
    
    console.log(`   ✓ Assistant created (ID: ${assistant.id})`);
    return assistant;
  } catch (error) {
    console.error(`   ❌ Failed to create assistant:`, error.message);
    throw error;
  }
}

/**
 * Check for existing vector store and assistant
 */
async function checkExistingResources() {
  try {
    // Check for existing vector stores (we'll use the first one if it exists)
    const vectorStores = await openai.beta.vectorStores.list({ limit: 10 });
    const existingStore = vectorStores.data.find(vs => vs.name === 'JeffBot RAG Vector Store');
    
    if (existingStore) {
      console.log(`\n⚠️  Found existing vector store: ${existingStore.id}`);
      console.log('   You may want to delete it before creating a new one.');
      return { vectorStore: existingStore, assistant: null };
    }
  } catch (error) {
    // Ignore errors, just continue
  }
  
  return { vectorStore: null, assistant: null };
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Vector Store Creation\n');
  
  try {
    // Check for existing resources
    const existing = await checkExistingResources();
    if (existing.vectorStore) {
      console.log('\n💡 Tip: To recreate the vector store, delete the existing one first.');
      console.log('   You can do this via the OpenAI dashboard or API.\n');
    }
    
    // Get PDF files
    const pdfFiles = getPDFFiles();
    if (pdfFiles.length === 0) {
      console.error('❌ No PDF files found in the jeffbot_rag directory');
      process.exit(1);
    }
    
    console.log(`📄 Found ${pdfFiles.length} PDF file(s):`);
    pdfFiles.forEach(file => {
      const stats = fs.statSync(file);
      console.log(`   - ${path.basename(file)} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
    });
    console.log();
    
    // Upload files
    const uploadedFiles = [];
    const fileNames = [];
    
    for (const filePath of pdfFiles) {
      try {
        const file = await uploadFile(filePath);
        const processed = await waitForFileProcessing(file.id, path.basename(filePath));
        
        if (processed) {
          uploadedFiles.push(file);
          fileNames.push(path.basename(filePath));
        } else {
          console.warn(`   ⚠️  Skipping ${path.basename(filePath)} due to processing failure`);
        }
      } catch (error) {
        console.error(`   ❌ Skipping ${path.basename(filePath)}:`, error.message);
      }
    }
    
    if (uploadedFiles.length === 0) {
      console.error('\n❌ No files were successfully uploaded and processed');
      process.exit(1);
    }
    
    // Create vector store
    const fileIds = uploadedFiles.map(f => f.id);
    const vectorStore = await createVectorStore(fileIds, fileNames);
    
    // Create assistant
    const assistant = await createAssistant(vectorStore.id);
    
    // Output results
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS!');
    console.log('='.repeat(60));
    console.log('\n📋 Configuration:');
    console.log(`   Vector Store ID: ${vectorStore.id}`);
    console.log(`   Assistant ID:    ${assistant.id}`);
    console.log(`   Files uploaded:  ${uploadedFiles.length}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Add these IDs to your .env file:');
    console.log(`      ASSISTANT_ID=${assistant.id}`);
    console.log('   2. Start the backend server: npm start');
    console.log('   3. Test the JeffBot sidebar in your browser');
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the script
main();



