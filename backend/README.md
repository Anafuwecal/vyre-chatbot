
```markdown
# VYRE Chatbot - Backend

> Node.js backend server with LangGraph multi-agent system for intelligent query routing and response generation.

## 🏗️ Architecture

This backend implements a **multi-agent RAG (Retrieval-Augmented Generation)** system:
User Query
↓
Supervisor Agent (Routing)
↓
├─→ Doc Specialist → Pinecone Search
├─→ Web Specialist → Website Scraping
└─→ Synthesizer → Final Response


## 📂 Directory Structure

backend/
├── src/
│ ├── agents/
│ │ ├── state.ts # LangGraph state definition
│ │ ├── supervisor.agent.ts # Query router
│ │ ├── doc-specialist.agent.ts # Document search
│ │ ├── web-specialist.agent.ts # Website search
│ │ ├── synthesizer.agent.ts # Response generation
│ │ └── graph.ts # LangGraph workflow
│ │
│ ├── tools/
│ │ ├── pinecone.tool.ts # Vector search
│ │ ├── web-search.tool.ts # Web scraping
│ │ └── index.ts # Tool exports
│ │
│ ├── config/
│ │ ├── env.ts # Environment validation
│ │ └── brand-voice.ts # System prompts
│ │
│ ├── utils/
│ │ └── embeddings.ts # Free HuggingFace embeddings
│ │
│ ├── memory/
│ │ └── checkpointer.ts # Conversation memory
│ │
│ ├── server.ts # Express server
│ └── ingest.ts # Document ingestion script
│
├── docs/ # Knowledge base (add your files here)
│ ├── vyre-overview.md
│ ├── vyre-team.md
│ └── *.pdf
│
├── .env # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md


## 🔧 Installation

```bash
npm install
```
## Environment Variables

# Required
GROQ_API_KEY=gsk_your_key_here
PINECONE_API_KEY=your_key_here
PINECONE_INDEX=vyre-knowledge

# Optional
GROQ_MODEL=llama3-70b-8192
PORT=3000
FRONTEND_URL=http://localhost:5173
FIRECRAWL_API_KEY=your_key_here

# Document Ingestion
Add documents to docs/ folder (supports PDF, TXT, MD)
Run ingestion:

npm run ingest

This will:

Load all documents from docs/
Split into chunks
Generate embeddings (FREE via HuggingFace)
Upload to Pinecone vector database
## Development

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

## Testing & Debugging
# Verify environment variables
npm run test-env

# Test Groq API connection
npm run test-groq

# Test Pinecone search
npm run test-pinecone

# List Pinecone indexes
npm run list-indexes

# Setup Pinecone index (first time)
npm run setup

## API Endpoints
GET /health
Health check endpoint.

Response:
{
  "status": "ok",
  "model": "llama3-70b-8192",
  "groqKeyPresent": true,
  "pineconeIndex": "vyre-knowledge"
}

# POST /api/session
Create a new chat session.

Response:

{
  "sessionId": "uuid-v4-string"
}

## POST /api/chat/stream
Stream chat response.

Request:
{
  "message": "What is VYRE?",
  "sessionId": "session-uuid"
}

Response: Server-Sent Events (SSE)

data: {"content":"VYRE"}
data: {"content":" is"}
data: {"content":" a"}
...
data: [DONE]

Agent System
Supervisor
Routes queries to appropriate specialist based on intent.

Doc Specialist
Searches Pinecone vector database for relevant documentation.

Web Specialist
Scrapes live content from vyre.africa for current information.

Synthesizer
Generates natural, conversational responses using retrieved context.

Monitoring
Add logging middleware in production:

import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

 Troubleshooting
Groq API Error:

Verify GROQ_API_KEY is correct
Check rate limits at console.groq.com
Pinecone Connection:

Ensure index exists: npm run list-indexes
Create index: npm run setup
Document Ingestion Fails:

Check PDF files aren't corrupted or password-protected
Verify file permissions in docs/ folder

 Dependencies
Core
express - Web server
@langchain/groq - Groq LLM integration
@langchain/langgraph - Agent orchestration
@langchain/pinecone - Vector database
Tools
@xenova/transformers - Free embeddings
cheerio - Web scraping
axios - HTTP client
Dev
typescript - Type safety
tsx - TypeScript execution
nodemon - Hot reload
🚀 Production Deployment
See DEPLOYMENT.md for platform-specific guides.