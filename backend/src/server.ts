// THIS MUST BE FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { app as langGraphApp } from './agents/graph.js';
import { synthesizerStreamNode } from './agents/synthesizer.agent.js';
import { HumanMessage, BaseMessage } from '@langchain/core/messages';
import { initializePinecone } from './tools/index.js';
import { config } from './config/env.js';
import { v4 as uuidv4 } from 'uuid';

// ✅ FIX: Match the exact state type expected by LangGraph
interface GraphState {
  messages: BaseMessage[];
  next: string; // ✅ Made required instead of optional
}

const app = express();
const PORT = process.env.PORT || config.server.port || 3000;

app.use(express.json({ limit: '10mb' }));

// ✅ Allow multiple origins for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000', 
  'https://vyre-chatbot.vercel.app',  // ⚠️ REPLACE WITH YOUR VERCEL URL
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow no origin (server-to-server, Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed origin
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

const server = app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 VYRE Chatbot API`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🤖 Model: ${config.groq.model}`);
  console.log(`📚 Index: ${config.pinecone.index}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

server.timeout = 300000;
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

const sessions = new Map<string, string>();

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

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    
    res.write(': connected\n\n');

    const messages = [new HumanMessage(message)];

    const configGraph = {
      configurable: {
        thread_id: sessionId,
      },
      timeout: 120000,
    };

    console.log('🤖 Invoking LangGraph...');

    const graphPromise = langGraphApp.invoke({ messages }, configGraph);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Graph execution timeout')), 120000)
    );

    const rawState = await Promise.race([graphPromise, timeoutPromise]);

    console.log('✅ Graph execution complete');
    
    // ✅ FIX: Safely cast and provide default for 'next'
    const state: GraphState = {
      messages: (rawState as any).messages || [],
      next: (rawState as any).next || 'synthesize' // ✅ Provide default
    };

    console.log('📊 Messages in state:', state.messages?.length || 0);

    if (!state.messages || state.messages.length === 0) {
      console.error('❌ No messages in state!');
      res.write(`data: ${JSON.stringify({ error: 'No response generated' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const toolMessages = state.messages?.filter((m: BaseMessage) => 
      'name' in m || 'tool_calls' in m
    );
    
    if (toolMessages && toolMessages.length > 0) {
      console.log('🛠️  Tools used:', toolMessages.length);
    }

    console.log('🔄 Starting stream...\n');

    let chunkCount = 0;
    let totalContent = '';

    try {
      const keepAliveInterval = setInterval(() => {
        res.write(': ping\n\n');
      }, 15000);

      // ✅ FIX: Now state has the required 'next' property
      for await (const chunk of synthesizerStreamNode(state)) {
        if (chunk && chunk.toString().trim()) {
          chunkCount++;
          totalContent += chunk;
          
          res.write(`data: ${JSON.stringify({ content: chunk.toString() })}\n\n`);
        }
        
        if (Date.now() - startTime > 180000) {
          console.warn('⚠️  Stream timeout, breaking...');
          break;
        }
      }

      clearInterval(keepAliveInterval);

    } catch (streamError: any) {
      console.error('❌ Stream error:', streamError.message);
    }

    console.log(`✅ Streamed ${chunkCount} chunks (${totalContent.length} chars)`);
    
    if (chunkCount === 0 || totalContent.length === 0) {
      console.warn('⚠️  No content streamed, sending fallback...');
      const lastMsg = state.messages[state.messages.length - 1];
      
      if (lastMsg && 'content' in lastMsg) {
        const fallbackContent = typeof lastMsg.content === 'string' 
          ? lastMsg.content 
          : JSON.stringify(lastMsg.content);
        
        console.log('📤 Sending fallback, length:', fallbackContent.length);
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

app.post('/api/debug-stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  for (let i = 0; i < 10; i++) {
    res.write(`data: ${JSON.stringify({ content: `Chunk ${i + 1} ` })}\n\n`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  res.write('data: [DONE]\n\n');
  res.end();
});