// THIS MUST BE FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { app as langGraphApp } from './agents/graph.js'; // ✅ FULL GRAPH WITH TOOLS
import { synthesizerStreamNode } from './agents/synthesizer.agent.js';
import { HumanMessage } from '@langchain/core/messages';
import { initializePinecone } from './tools/index.js';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config/env.js';

const app = express();
const PORT = config.server.port;

app.use(cors({ origin: config.server.frontendUrl }));
app.use(express.json());

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

// ✅ FULL CHAT ENDPOINT WITH TOOLS
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 Message:', message);
    console.log('🔑 Session:', sessionId);

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const messages = [new HumanMessage(message)];

    const configGraph = {
      configurable: {
        thread_id: sessionId,
      },
    };

    console.log('🤖 Invoking LangGraph with TOOLS...');

    const state = await langGraphApp.invoke(
      { messages },
      configGraph
    );

    console.log('✅ Graph execution complete');
    console.log('📊 Messages in state:', state.messages?.length || 0);

    const toolMessages = state.messages?.filter((m: any) => m.name || m.tool_calls);
    if (toolMessages && toolMessages.length > 0) {
      console.log('🛠️  Tools were used:', toolMessages.length);
    }

    console.log('🔄 Streaming response...\n');

    let chunkCount = 0;
    let totalContent = '';

    try {
      for await (const chunk of synthesizerStreamNode(state)) {
        if (chunk) {
          chunkCount++;
          totalContent += chunk;
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
      }
    } catch (streamError: any) {
      console.error('❌ Stream error:', streamError.message);
    }

    console.log(`✅ Streamed ${chunkCount} chunks (${totalContent.length} chars)`);
    
    // If nothing was streamed, send a fallback
    if (chunkCount === 0) {
      console.warn('⚠️  No content streamed, checking last message...');
      const lastMsg = state.messages[state.messages.length - 1];
      if (lastMsg && lastMsg.content) {
        console.log('📤 Sending last message as fallback');
        res.write(`data: ${JSON.stringify({ content: lastMsg.content })}\n\n`);
      } else {
        console.error('❌ No content available to stream!');
        res.write(`data: ${JSON.stringify({ error: 'No response generated' })}\n\n`);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 VYRE Chatbot API`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🤖 Model: ${config.groq.model}`);
  console.log(`📚 Index: ${config.pinecone.index}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});