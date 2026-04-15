# VYRE AI Chatbot

> Intelligent conversational AI assistant for VYRE.AFRICA platform, powered by Groq Llama 3 and LangGraph.

![VYRE Chatbot](https://img.shields.io/badge/VYRE-Chatbot-43d8b8)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)

## 🌟 Overview

An advanced agentic AI chatbot that provides intelligent, context-aware responses about VYRE.AFRICA's streaming platform and fintech services. Built with a multi-agent architecture using LangGraph for sophisticated query routing and response synthesis.

### Key Features

-  **Multi-Agent Architecture** - Specialized agents for documentation search, web scraping, and response synthesis
-  **Hybrid Knowledge Retrieval** - Combines vector search (Pinecone) with live web scraping
-  **Real-time Streaming** - Smooth, word-by-word response delivery
-  **Conversational Memory** - Context-aware conversations with session management
-  **Brand-Specific** - Trained exclusively on VYRE.AFRICA content
-  **Free Embeddings** - Uses HuggingFace Transformers (no OpenAI costs)
-  **Responsive UI** - Full-screen and sidebar modes with modern design

##  Architecture

┌─────────────┐
│ Frontend │ Vue.js + TypeScript + Tailwind
│ (Port 5173)│
└──────┬──────┘
│ HTTP/SSE
▼
┌─────────────┐
│ Backend │ Node.js + Express + TypeScript
│ (Port 3000)│
└──────┬──────┘
│
├──► LangGraph (Agent Orchestration)
│ ├─ Supervisor (Routing)
│ ├─ Doc Specialist (Pinecone)
│ ├─ Web Specialist (Firecrawl/Cheerio)
│ └─ Synthesizer (Groq Llama 3)
│
├──► Pinecone (Vector Database)
├──► Groq Cloud (LLM Inference)
└──► Web Scraping (vyre.africa)


##  Project Structure

vyre-chatbot/
├── backend/ # Node.js API server
│ ├── src/
│ │ ├── agents/ # LangGraph agent definitions
│ │ ├── tools/ # Search and retrieval tools
│ │ ├── config/ # Configuration and brand voice
│ │ ├── utils/ # Utility functions
│ │ └── server.ts # Express server entry point
│ ├── docs/ # Knowledge base documents (PDFs, TXT, MD)
│ └── package.json
│
├── frontend/ # Vue.js application
│ ├── src/
│ │ ├── components/ # Vue components
│ │ ├── stores/ # Pinia state management
│ │ ├── types/ # TypeScript type definitions
│ │ └── assets/ # Styles and static assets
│ └── package.json
│
└── README.md


## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **API Keys**:
  - [Groq API Key](https://console.groq.com/keys) (for LLM)
  - [Pinecone API Key](https://app.pinecone.io/) (for vector DB)
  - (Optional) [Firecrawl API Key](https://firecrawl.dev/) (for web scraping)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/vyre-chatbot.git
cd vyre-chatbot

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

 ## Configuration
Backend Environment (backend/.env):

# LLM Provider
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama3-70b-8192

# Vector Database
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=vyre-knowledge

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173

# Frontend Environment (frontend/.env):

VITE_API_URL=http://localhost:3000

# Document Ingestion
Add your VYRE documentation to backend/docs/ then run:

cd backend
npm run ingest

## Development

# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm run dev

## Tech Stack
# Backend
Runtime: Node.js 20+
Language: TypeScript
Framework: Express.js
AI/ML:
- LangChain/LangGraph (agent orchestration)
- Groq (LLM inference)
- HuggingFace Transformers (embeddings)
Database: Pinecone (vector storage)
Tools: Cheerio (web scraping), Axios

# Frontend

Framework: Vue.js 3
Language: TypeScript
Styling: Tailwind CSS
State: Pinia
Build: Vite
Icons: Lucide Vue

## Testing

# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e

## Scripts
# Backend

npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Run production build
npm run ingest       # Ingest documents to Pinecone
npm run test-env     # Verify environment variables
npm run test-groq    # Test Groq API connection

# Frontend

npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run dev:clean    # Start with cleared cache

## Deployment
# Backend (Railway/Fly.io) 
cd backend
npm run build

# Frontend (Vercel/Netlify)
cd frontend
npm run build

🙏 Acknowledgments
Groq - Ultra-fast LLM inference
LangChain - Agent framework
Pinecone - Vector database
Vue.js - Frontend framework
