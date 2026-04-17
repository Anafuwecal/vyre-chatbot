import { ChatGroq } from '@langchain/groq';
import { AgentStateType } from './state.js';
import { userLookupTool, analyticsLookupTool, scheduleStreamTool } from '../tools/index.js';
import { ToolMessage } from '@langchain/core/messages';
import { config } from '../config/env.js';

const model = new ChatGroq({
  apiKey: config.groq.apiKey,
  modelName: config.groq.model,
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
    let toolResult: string | any;

    // ✅ FIX: Execute the appropriate tool with proper args destructuring
    switch (toolCall.name) {
      case 'lookup_user_account':
        toolResult = await userLookupTool.invoke({
          userId: toolCall.args.userId,
          queryType: toolCall.args.queryType,
        });
        break;
      case 'get_stream_analytics':
        toolResult = await analyticsLookupTool.invoke({
          creatorId: toolCall.args.creatorId,
          timeframe: toolCall.args.timeframe,
          metric: toolCall.args.metric,
        });
        break;
      case 'schedule_stream':
        toolResult = await scheduleStreamTool.invoke({
          creatorId: toolCall.args.creatorId,
          date: toolCall.args.date,
          time: toolCall.args.time,
          title: toolCall.args.title,
          duration: toolCall.args.duration,
        });
        break;
      default:
        toolResult = 'Tool not found';
    }

    // ✅ FIX: Use ToolMessage and ensure content is a string
    return {
      messages: [
        response,
        new ToolMessage({
          content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
          tool_call_id: toolCall.id || '',
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