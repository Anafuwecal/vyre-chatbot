import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentStateType } from './state.js';
import { HumanMessage } from '@langchain/core/messages';
import { config } from '../config/env.js';

const supervisorPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are the VYRE AI Assistant routing system. Analyze the user's question and decide which specialist to use.

**ROUTING RULES (PRIORITY ORDER):**

1. **doc_search** - Use for:
   - Questions about VYRE team, CEO, founders, leadership
   - Technical details, features, API documentation
   - Internal processes, how things work
   - Pricing details, plans, subscriptions
   - Any question that could be answered from documentation
   
2. **web_search** - Use ONLY for:
   - Questions specifically asking "what's on the website"
   - Questions about current/live website content
   - When doc_search returns no results
   
3. **synthesize** - Use for:
   - Greetings (hello, hi, hey)
   - Simple questions you can answer directly
   - Casual conversation

**DEFAULT:** When in doubt, use "doc_search" first.

**IMPORTANT:** Questions about people (CEO, founders, team) should ALWAYS use doc_search first.

Respond with ONLY ONE WORD: doc_search, web_search, or synthesize`,
  ],
  ['placeholder', '{messages}'],
]);

const model = new ChatGroq({
  apiKey: config.groq.apiKey,
  modelName: config.groq.model,
  temperature: 0,
});

const supervisorChain = supervisorPrompt.pipe(model);

export async function supervisorNode(state: AgentStateType) {
  const response = await supervisorChain.invoke({
    messages: state.messages,
  });

  let decision = response.content.toString().trim().toLowerCase();
  
  // Extract just the specialist name if there's extra text
  if (decision.includes('doc_search')) {
    decision = 'doc_search';
  } else if (decision.includes('web_search')) {
    decision = 'web_search';
  } else if (decision.includes('synthesize')) {
    decision = 'synthesize';
  }

  console.log(`🧭 Supervisor decision: ${decision}`);

  return {
    next: decision,
  };
}