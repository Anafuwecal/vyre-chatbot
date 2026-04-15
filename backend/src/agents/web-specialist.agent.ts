import { ChatGroq } from '@langchain/groq';
import { AgentStateType } from './state.js';
import { websiteSearchTool } from '../tools/index.js';
import { AIMessage } from '@langchain/core/messages';
import { config } from '../config/env.js';

const model = new ChatGroq({
  apiKey: config.groq.apiKey,
  modelName: config.groq.model,
  temperature: 0.3,
});

const modelWithTools = model.bindTools([websiteSearchTool]);

export async function webSpecialistNode(state: AgentStateType) {
  console.log('🌐 Web specialist activated');
  
  const response = await modelWithTools.invoke(state.messages);

  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];
    
    console.log('🔧 Calling tool:', toolCall.name);
    console.log('📝 Tool args:', toolCall.args);
    
    const toolResult = await websiteSearchTool.invoke(toolCall.args);

    console.log('✅ Tool result length:', toolResult.length);

    return {
      messages: [
        response,
        new AIMessage({
          content: toolResult,
          name: 'search_vyre_website',
        }),
      ],
      next: 'synthesize',
    };
  }

  return {
    messages: [response],
    next: 'synthesize',
  };
}