import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend root
dotenv.config({ path: join(__dirname, '../../.env') });

// Validate required environment variables
const requiredEnvVars = [
  'GROQ_API_KEY',
  'PINECONE_API_KEY',
  'PINECONE_INDEX',
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Please check your .env file in the backend folder');
  process.exit(1);
}

// Export validated config
export const config = {
  groq: {
    apiKey: process.env.GROQ_API_KEY!,
    model: process.env.GROQ_MODEL || 'llama3-70b-8192',
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT || 'us-east1-gcp',
    index: process.env.PINECONE_INDEX!,
  },
  firecrawl: {
    apiKey: process.env.FIRECRAWL_API_KEY,
  },
  tavily: {
    apiKey: process.env.TAVILY_API_KEY,
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};

console.log('✅ Environment configuration loaded');