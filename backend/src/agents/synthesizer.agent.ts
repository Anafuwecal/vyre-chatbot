import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentStateType } from './state.js';
import { VYRE_BRAND_VOICE } from '../config/brand-voice.js';
import { config } from '../config/env.js';
import { AIMessage, AIMessageChunk } from '@langchain/core/messages';

const synthesizerPrompt = ChatPromptTemplate.fromMessages([
  ['system', VYRE_BRAND_VOICE],
  [
    'system',
    `IMPORTANT: Provide complete, helpful responses. Never stop mid-sentence.`
  ],
  ['placeholder', '{messages}'],
]);

const model = new ChatGroq({
  apiKey: config.groq.apiKey,
  modelName: config.groq.model,
  temperature: 0.7,
  streaming: true,
  // Add timeout and retry settings
  timeout: 60000, // 60 seconds
  maxRetries: 2,
});

const chain = synthesizerPrompt.pipe(model);

export async function synthesizerNode(state: AgentStateType) {
  const response = await chain.invoke({
    messages: state.messages,
  });

  return {
    messages: [response],
    next: 'END',
  };
}

// IMPROVED STREAMING WITH BETTER ERROR HANDLING
export async function* synthesizerStreamNode(state: AgentStateType) {
  console.log('🌊 Synthesizer streaming...');

  if (!state.messages || state.messages.length === 0) {
    console.error('❌ No messages in state');
    yield 'Sorry, I encountered an error. Please try again.';
    return;
  }

  try {
    console.log('🔄 Generating response...');
    
    const stream = await chain.stream({
      messages: state.messages,
    });

    let totalContent = '';
    let chunkCount = 0;
    const startTime = Date.now();

    for await (const chunk of stream) {
      if (chunk.content) {
        const content = chunk.content.toString();
        
        if (content && content.trim()) {
          chunkCount++;
          totalContent += content;
          yield content;
        }
      }
      
      // Safety timeout
      if (Date.now() - startTime > 90000) { // 90 seconds
        console.warn('⚠️  Synthesizer timeout');
        break;
      }
    }

    console.log(`✅ Synthesized ${chunkCount} chunks (${totalContent.length} chars)`);

    // If we got very little content, it might be incomplete
    if (totalContent.length < 20) {
      console.warn('⚠️  Response seems too short, checking state...');
      
      // Try to get content from state
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.content) {
        const fallback = typeof lastMessage.content === 'string'
          ? lastMessage.content
          : JSON.stringify(lastMessage.content);
        
        if (fallback.length > totalContent.length) {
          console.log('📤 Using fallback from state');
          yield '\n\n' + fallback;
        }
      }
    }

  } catch (error: any) {
    console.error('❌ Synthesis error:', error.message);
    
    // Try to provide a fallback response
    if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
      yield 'I apologize, but my response was interrupted. Please ask your question again.';
    } else {
      yield 'Sorry, I encountered an error generating a response. Please try again.';
    }
  }
}