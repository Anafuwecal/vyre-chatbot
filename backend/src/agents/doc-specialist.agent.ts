import { ChatGroq } from '@langchain/groq';
import { AgentStateType } from './state.js';
import { pineconeSearchTool } from '../tools/index.js';
import { AIMessage, ToolMessage } from '@langchain/core/messages';
import { config } from '../config/env.js';

const model = new ChatGroq({
  apiKey: config.groq.apiKey,
  modelName: config.groq.model,
  temperature: 0.3,
});

const modelWithTools = model.bindTools([pineconeSearchTool]);

export async function docSpecialistNode(state: AgentStateType) {
  const response = await modelWithTools.invoke(state.messages);

  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];
    
    // ✅ FIX: Properly invoke the tool with correct input structure
    const toolResult = await pineconeSearchTool.invoke({
      query: toolCall.args.query,
      k: toolCall.args.k || 5,
    });

    // ✅ FIX: Use ToolMessage instead of AIMessage for tool results
    return {
      messages: [
        response,
        new ToolMessage({
          content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
          tool_call_id: toolCall.id || '',
          name: 'search_documentation',
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