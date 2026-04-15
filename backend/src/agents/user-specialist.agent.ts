import { ChatGroq } from '@langchain/groq';
import { AgentStateType } from './state.js';
import { userLookupTool, analyticsLookupTool, scheduleStreamTool } from '../tools/index.js';
import { AIMessage } from '@langchain/core/messages';

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  modelName: process.env.GROQ_MODEL || 'llama3-70b-8192',
  temperature: 0.3,
});

const modelWithTools = model.bindTools([
  userLookupTool,
  analyticsLookupTool,
  scheduleStreamTool,
]);

export async function userSpecialistNode(state: AgentStateType) {
  const response = await modelWithTools.invoke(state.messages);

  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];
    let toolResult: string;

    // Execute the appropriate tool
    switch (toolCall.name) {
      case 'lookup_user_account':
        toolResult = await userLookupTool.invoke(toolCall.args);
        break;
      case 'get_stream_analytics':
        toolResult = await analyticsLookupTool.invoke(toolCall.args);
        break;
      case 'schedule_stream':
        toolResult = await scheduleStreamTool.invoke(toolCall.args);
        break;
      default:
        toolResult = 'Tool not found';
    }

    return {
      messages: [
        response,
        new AIMessage({
          content: toolResult,
          name: toolCall.name,
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