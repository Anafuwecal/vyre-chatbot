import { ChatGroq } from '@langchain/groq';
import { HumanMessage } from '@langchain/core/messages';
import { config } from './config/env.js';

async function testGroq() {
  console.log('Testing Groq API...\n');

  try {
    const model = new ChatGroq({
      apiKey: config.groq.apiKey,
      modelName: config.groq.model,
      temperature: 0.7,
    });

    console.log('Sending test message to Groq...');
    
    const messages = [
      new HumanMessage('What is VYRE.AFRICA? Answer in one sentence.'),
    ];

    const response = await model.invoke(messages);

    console.log('Response received!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Response:', response.content);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test streaming
    console.log('Testing streaming...\n');

    const streamModel = new ChatGroq({
      apiKey: config.groq.apiKey,
      modelName: config.groq.model,
      temperature: 0.7,
      streaming: true,
    });

    const stream = await streamModel.stream(messages);

    let fullResponse = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        process.stdout.write(chunk.content.toString());
        fullResponse += chunk.content;
      }
    }

    console.log('\n\nStreaming works!');
    console.log('Total length:', fullResponse.length, 'characters\n');

  } catch (error: any) {
    console.error('Test failed:', error.message);
    console.error('\nFull error:', error);
    
    if (error.message.includes('API key')) {
      console.error('\n💡 Check your GROQ_API_KEY in .env file');
    }
  }
}

testGroq();