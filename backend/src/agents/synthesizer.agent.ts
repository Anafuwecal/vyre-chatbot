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
    `IMPORTANT: When answering, use the conversation history and any retrieved information to provide a NATURAL, CONVERSATIONAL response. 

Do NOT mention documents, sources, or where you got the information. 
Do NOT use phrases like "According to...", "Based on...", "The document says..."

Just answer the question naturally as if you already knew the information.`
  ],
  ['placeholder', '{messages}'],
]);

const model = new ChatGroq({
  apiKey: config.groq.apiKey,
  modelName: config.groq.model,
  temperature: 0.7,
  streaming: true,
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

export async function* synthesizerStreamNode(state: AgentStateType) {
  console.log('🌊 Synthesizer streaming...');

  if (!state.messages || state.messages.length === 0) {
    console.error('❌ No messages in state');
    yield 'Sorry, no response available.';
    return;
  }

  // Always generate a fresh, synthesized response
  console.log('🔄 Synthesizing natural response...');
  
  try {
    const stream = await chain.stream({
      messages: state.messages,
    });

    let totalContent = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        totalContent += chunk.content;
        yield chunk.content;
      }
    }

    console.log('✅ Synthesized', totalContent.length, 'characters');
  } catch (error: any) {
    console.error('❌ Synthesis error:', error.message);
    yield 'Sorry, I encountered an error. Please try again.';
  }
}