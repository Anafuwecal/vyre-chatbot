import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { config } from '../config/env.js';
import { VYRE_BRAND_VOICE } from '../config/brand-voice.js';

const prompt = ChatPromptTemplate.fromMessages([
  ['system', VYRE_BRAND_VOICE],
  ['placeholder', '{messages}'],
]);

const model = new ChatGroq({
  apiKey: config.groq.apiKey,
  modelName: config.groq.model,
  temperature: 0.7,
  streaming: true,
});

const chain = prompt.pipe(model);

export async function simpleChat(messages: BaseMessage[]) {
  console.log('Simple chat invoked with', messages.length, 'messages');
  
  const response = await chain.invoke({
    messages,
  });

  console.log('Response received:', response.content.toString().substring(0, 100));
  
  return response;
}

export async function* simpleChatStream(messages: BaseMessage[]) {
  console.log('Simple chat stream invoked with', messages.length, 'messages');
  
  const stream = await chain.stream({
    messages,
  });

  let totalChunks = 0;
  for await (const chunk of stream) {
    totalChunks++;
    if (chunk.content) {
      yield chunk.content;
    }
  }
  
  console.log('Streamed', totalChunks, 'chunks');
}