import { config } from './config/env.js';

console.log('🧪 Testing environment variables...\n');

console.log('Groq API Key:', config.groq.apiKey ? '✅ Present' : '❌ Missing');
console.log('Groq Model:', config.groq.model);
console.log('');

console.log('Pinecone API Key:', config.pinecone.apiKey ? '✅ Present' : '❌ Missing');
console.log('Pinecone Index:', config.pinecone.index);
console.log('');

console.log('Server Port:', config.server.port);
console.log('Frontend URL:', config.server.frontendUrl);
console.log('');

if (config.groq.apiKey && config.pinecone.apiKey) {
  console.log('✅ All required environment variables are set!');
  console.log('💡 You can now run: npm run dev');
} else {
  console.log('❌ Some required environment variables are missing!');
  console.log('💡 Check your .env file');
}