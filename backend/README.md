# VYRE Chatbot — Backend

> Node.js backend server with a LangGraph multi-agent system for intelligent query routing and response generation.

---

## Table of Contents

- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Document Ingestion](#document-ingestion)
- [Development](#development)
- [API Endpoints](#api-endpoints)
- [Agent System](#agent-system)
- [Testing and Debugging](#testing-and-debugging)
- [Monitoring](#monitoring)
- [Dependencies](#dependencies)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Architecture

This backend implements a **Multi-Agent RAG (Retrieval-Augmented Generation)** system:

```
User Query
    |
    v
Supervisor Agent  (Routing)
    |
    +---> Doc Specialist   ---> Pinecone Search
    +---> Web Specialist   ---> Website Scraping
    +---> Synthesizer      ---> Final Response
```

---

## Directory Structure

```
backend/
├── src/
│   ├── agents/
│   │   ├── state.ts                # LangGraph state definition
│   │   ├── supervisor.agent.ts     # Query router
│   │   ├── doc-specialist.agent.ts # Document search agent
│   │   ├── web-specialist.agent.ts # Website search agent
│   │   ├── synthesizer.agent.ts    # Response generation agent
│   │   └── graph.ts                # LangGraph workflow definition
│   │
│   ├── tools/
│   │   ├── pinecone.tool.ts        # Vector search tool
│   │   ├── web-search.tool.ts      # Web scraping tool
│   │   └── index.ts                # Tool exports
│   │
│   ├── config/
│   │   ├── env.ts                  # Environment validation
│   │   └── brand-voice.ts          # System prompts
│   │
│   ├── utils/
│   │   └── embeddings.ts           # HuggingFace embeddings helper
│   │
│   ├── memory/
│   │   └── checkpointer.ts         # Conversation memory
│   │
│   ├── server.ts                   # Express server entry point
│   └── ingest.ts                   # Document ingestion script
│
├── docs/                           # Knowledge base (PDF, TXT, MD)
│   ├── vyre-overview.md
│   ├── vyre-team.md
│   └── *.pdf
│
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Installation

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Required
GROQ_API_KEY=gsk_your_key_here
PINECONE_API_KEY=your_key_here
PINECONE_INDEX=vyre-knowledge

# Optional
GROQ_MODEL=llama3-70b-8192
PORT=3000
FRONTEND_URL=http://localhost:5173
FIRECRAWL_API_KEY=your_key_here
```

---

## Document Ingestion

1. Place your VYRE documentation files (PDF, TXT, or MD) into the `docs/` folder.
2. Run the ingestion script:

```bash
npm run ingest
```

This will:
- Load all documents from `docs/`
- Split them into chunks
- Generate embeddings via HuggingFace (free, no OpenAI required)
- Upload vectors to the Pinecone database

---

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

---

## API Endpoints

### `GET /health`

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "model": "llama3-70b-8192",
  "groqKeyPresent": true,
  "pineconeIndex": "vyre-knowledge"
}
```

---

### `POST /api/session`

Create a new chat session.

**Response:**

```json
{
  "sessionId": "uuid-v4-string"
}
```

---

### `POST /api/chat/stream`

Stream a chat response using Server-Sent Events (SSE).

**Request body:**

```json
{
  "message": "What is VYRE?",
  "sessionId": "session-uuid"
}
```

**Response (SSE stream):**

```
data: {"content":"VYRE"}
data: {"content":" is"}
data: {"content":" a"}
...
data: [DONE]
```

---

## Agent System

### Supervisor

Routes incoming queries to the appropriate specialist agent based on detected intent.

### Doc Specialist

Searches the Pinecone vector database for chunks of documentation relevant to the query.

### Web Specialist

Scrapes live content from `vyre.africa` to surface current, up-to-date information.

### Synthesizer

Generates natural, conversational responses using the context retrieved by the specialist agents, powered by Groq Llama 3.

---

## Testing and Debugging

```bash
# Verify environment variables
npm run test-env

# Test Groq API connection
npm run test-groq

# Test Pinecone search
npm run test-pinecone

# List available Pinecone indexes
npm run list-indexes

# Set up Pinecone index (first-time setup)
npm run setup
```

---

## Monitoring

Add a Winston logging middleware for production environments:

```ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## Dependencies

### Core

| Package                    | Purpose                         |
|----------------------------|---------------------------------|
| `express`                  | Web server framework            |
| `@langchain/groq`          | Groq LLM integration            |
| `@langchain/langgraph`     | Agent orchestration             |
| `@langchain/pinecone`      | Pinecone vector database client |

### Tools

| Package                    | Purpose                         |
|----------------------------|---------------------------------|
| `@xenova/transformers`     | Free local embeddings           |
| `cheerio`                  | Web scraping / HTML parsing     |
| `axios`                    | HTTP client                     |

### Development

| Package      | Purpose                              |
|--------------|--------------------------------------|
| `typescript` | Type safety                          |
| `tsx`        | TypeScript execution                 |
| `nodemon`    | Hot reload during development        |

---

## Deployment

See `DEPLOYMENT.md` for platform-specific deployment guides.

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## Troubleshooting

**Groq API error**
- Verify that `GROQ_API_KEY` is correct and active.
- Check your rate limits at [console.groq.com](https://console.groq.com).

**Pinecone connection failure**
- Confirm the index exists: `npm run list-indexes`
- Create the index if missing: `npm run setup`

**Document ingestion fails**
- Ensure PDF files are not corrupted or password-protected.
- Check that the `docs/` directory has correct read permissions.
