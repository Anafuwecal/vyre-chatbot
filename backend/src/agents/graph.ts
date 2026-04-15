import { StateGraph, END } from '@langchain/langgraph';
import { AgentState } from './state.js';
import { supervisorNode } from './supervisor.agent.js';
import { docSpecialistNode } from './doc-specialist.agent.js';
import { webSpecialistNode } from './web-specialist.agent.js';
import { synthesizerNode } from './synthesizer.agent.js';
import { memorySaver } from '../memory/checkpointer.js';

const workflow = new StateGraph(AgentState)
  .addNode('supervisor', supervisorNode)
  .addNode('doc_search', docSpecialistNode)
  .addNode('web_search', webSpecialistNode)
  .addNode('synthesize', synthesizerNode)

  .addEdge('__start__', 'supervisor')

  // IMPORTANT: This uses supervisor's decision
  .addConditionalEdges('supervisor', (state) => state.next, {
    doc_search: 'doc_search',
    web_search: 'web_search',
    synthesize: 'synthesize',
  })

  .addEdge('doc_search', 'synthesize')
  .addEdge('web_search', 'synthesize')
  .addEdge('synthesize', END);

export const app = workflow.compile({
  checkpointer: memorySaver,
});