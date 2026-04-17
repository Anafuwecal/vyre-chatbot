// THIS MUST BE FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { app as langGraphApp } from './agents/graph.js';
import { synthesizerStreamNode } from './agents/synthesizer.agent.js';
import { HumanMessage } from '@langchain/core/messages';
import { initializePinecone } from './tools/index.js';
import { config } from './config/env.js';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = config.server.port;

// Increase timeout limits
app.use(express.json({ limit: '10mb' }));
app.use(cors({ 
  origin: config.server.frontendUrl,
  credentials: true
}));

// Set longer timeouts
const server = app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 VYRE Chatbot API`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🤖 Model: ${config.groq.model}`);
  console.log(`📚 Index: ${config.pinecone.index}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

// Increase server timeout to 5 minutes
server.timeout = 300000; // 5 minutes
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds

const sessions = new Map<string, string>();

// Initialize services
console.log('🔧 Initializing services...');
await initializePinecone();
console.log('✅ Pinecone & Tools initialized\n');

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    model: config.groq.model,
    groqKeyPresent: !!config.groq.apiKey,
    pineconeIndex: config.pinecone.index
  });
});

app.post('/api/session', (req, res) => {
  const sessionId = uuidv4();
  sessions.set(sessionId, JSON.stringify([]));
  res.json({ sessionId });
});

// IMPROVED STREAMING ENDPOINT WITH ERROR HANDLING
app.post('/api/chat/stream', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message, sessionId } = req.body;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 Message:', message);
    console.log('🔑 Session:', sessionId);

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Set SSE headers with keep-alive
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    
    // Send initial connection confirmation
    res.write(': connected\n\n');

    const messages = [new HumanMessage(message)];

    const configGraph = {
      configurable: {
        thread_id: sessionId,
      },
      // Add timeout configuration
      timeout: 120000, // 2 minutes for graph execution
    };

    console.log('🤖 Invoking LangGraph...');

    // Execute graph with timeout protection
    const graphPromise = langGraphApp.invoke({ messages }, configGraph);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Graph execution timeout')), 120000)
    );

    const state = await Promise.race([graphPromise, timeoutPromise]);

    console.log('✅ Graph execution complete');
    console.log('📊 Messages in state:', state.messages?.length || 0);

    if (!state.messages || state.messages.length === 0) {
      console.error('❌ No messages in state!');
      res.write(`data: ${JSON.stringify({ error: 'No response generated' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const toolMessages = state.messages?.filter((m: any) => m.name || m.tool_calls);
    if (toolMessages && toolMessages.length > 0) {
      console.log('🛠️  Tools used:', toolMessages.length);
    }

    console.log('🔄 Starting stream...\n');

    let chunkCount = 0;
    let totalContent = '';
    let lastSendTime = Date.now();

    try {
      // Keep-alive ping interval
      const keepAliveInterval = setInterval(() => {
        res.write(': ping\n\n');
      }, 15000); // Every 15 seconds

      for await (const chunk of synthesizerStreamNode(state)) {
        if (chunk && chunk.toString().trim()) {
          chunkCount++;
          totalContent += chunk;
          
          // Send the chunk
          res.write(`data: ${JSON.stringify({ content: chunk.toString() })}\n\n`);
          
          lastSendTime = Date.now();
        }
        
        // Safety: Break if streaming takes too long
        if (Date.now() - startTime > 180000) { // 3 minutes max
          console.warn('⚠️  Stream timeout, breaking...');
          break;
        }
      }

      clearInterval(keepAliveInterval);

    } catch (streamError: any) {
      console.error('❌ Stream error:', streamError.message);
    }

    console.log(`✅ Streamed ${chunkCount} chunks (${totalContent.length} chars)`);
    
    // If nothing was streamed, send fallback
    if (chunkCount === 0 || totalContent.length === 0) {
      console.warn('⚠️  No content streamed, sending fallback...');
      const lastMsg = state.messages[state.messages.length - 1];
      
      if (lastMsg && lastMsg.content) {
        const fallbackContent = typeof lastMsg.content === 'string' 
          ? lastMsg.content 
          : JSON.stringify(lastMsg.content);
        
        console.log('📤 Sending fallback, length:', fallbackContent.length);
        
        // Send as single chunk
        res.write(`data: ${JSON.stringify({ content: fallbackContent })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ error: 'No response content available' })}\n\n`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`⏱️  Total duration: ${duration}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    
    try {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Server error' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (writeError) {
      console.error('❌ Could not send error to client:', writeError);
    }
  }
});
// Add this for debugging
app.post('/api/debug-stream', async (req, res) => {
  const { message } = req.body;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send test chunks
  for (let i = 0; i < 10; i++) {
    res.write(`data: ${JSON.stringify({ content: `Chunk ${i + 1} ` })}\n\n`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  res.write('data: [DONE]\n\n');
  res.end();
});
