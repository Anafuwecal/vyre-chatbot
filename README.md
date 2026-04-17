# VYRE AI Chatbot

> Intelligent conversational AI assistant for the VYRE.AFRICA platform, powered by Groq Llama 3 and LangGraph.

![VYRE Chatbot](https://img.shields.io/badge/VYRE-Chatbot-43d8b8)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Document Ingestion](#document-ingestion)
- [Development](#development)
- [Tech Stack](#tech-stack)
- [Testing](#testing)
- [Scripts Reference](#scripts-reference)
- [Deployment](#deployment)
- [Acknowledgments](#acknowledgments)

---

## Overview

VYRE AI Chatbot is an advanced agentic AI system that delivers intelligent, context-aware responses about VYRE.AFRICA's platform and fintech services. It is built on a multi-agent architecture using LangGraph for sophisticated query routing and response synthesis.

### Key Features

- **Multi-Agent Architecture** — Specialized agents for documentation search, web scraping, and response synthesis.
- **Hybrid Knowledge Retrieval** — Combines Pinecone vector search with live web scraping.
- **Real-time Streaming** — Smooth, word-by-word response delivery via Server-Sent Events.
- **Conversational Memory** — Context-aware conversations with session management.
- **Brand-Specific Responses** — Trained exclusively on VYRE.AFRICA content.
- **Free Embeddings** — Uses HuggingFace Transformers (no OpenAI costs).
- **Responsive UI** — Full-screen and sidebar modes with a modern design.

---

## Architecture

```
+-------------------+
|     Frontend      |  Vue.js + TypeScript + Tailwind CSS
|   (Port 5173)     |
+--------+----------+
         |
         |  HTTP / SSE
         v
+--------+----------+
|     Backend       |  Node.js + Express + TypeScript
|   (Port 3000)     |
+--------+----------+
         |
         +---> LangGraph (Agent Orchestration)
         |       +-- Supervisor Agent   (Routing)
         |       +-- Doc Specialist     (Pinecone)
         |       +-- Web Specialist     (Firecrawl / Cheerio)
         |       +-- Synthesizer        (Groq Llama 3)
         |
         +---> Pinecone        (Vector Database)
         +---> Groq Cloud      (LLM Inference)
         +---> Web Scraping    (vyre.africa)
```

---

## Project Structure

```
vyre-chatbot/
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── agents/             # LangGraph agent definitions
│   │   ├── tools/              # Search and retrieval tools
│   │   ├── config/             # Configuration and brand voice
│   │   ├── utils/              # Utility functions
│   │   └── server.ts           # Express server entry point
│   ├── docs/                   # Knowledge base (PDFs, TXT, MD)
│   └── package.json
│
├── frontend/                   # Vue.js application
│   ├── src/
│   │   ├── components/         # Vue components
│   │   ├── stores/             # Pinia state management
│   │   ├── types/              # TypeScript type definitions
│   │   └── assets/             # Styles and static assets
│   └── package.json
│
└── README.md
```

---

## Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **API Keys**:
  - [Groq API Key](https://console.groq.com/keys) — for LLM inference
  - [Pinecone API Key](https://app.pinecone.io/) — for vector database
  - [Firecrawl API Key](https://firecrawl.dev/) — optional, for enhanced web scraping

---

## Installation

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

---

## Configuration

**Backend** — create `backend/.env`:

```env
# LLM Provider
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama3-70b-8192

# Vector Database
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=vyre-knowledge

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

---

## Document Ingestion

Place VYRE documentation files (PDF, TXT, or MD) in `backend/docs/`, then run:

```bash
cd backend
npm run ingest
```

This will load all documents, split them into chunks, generate embeddings via HuggingFace, and upload them to Pinecone.

---

## Development

```bash
# Terminal 1 — Start backend
cd backend
npm run dev

# Terminal 2 — Start frontend
cd frontend
npm run dev
```

---

## Tech Stack

### Backend

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Runtime        | Node.js 20+                             |
| Language       | TypeScript                              |
| Framework      | Express.js                              |
| Orchestration  | LangChain / LangGraph                   |
| LLM Inference  | Groq                                    |
| Embeddings     | HuggingFace Transformers                |
| Vector Storage | Pinecone                                |
| Web Scraping   | Cheerio, Axios                          |

### Frontend

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Framework      | Vue.js 3                                |
| Language       | TypeScript                              |
| Styling        | Tailwind CSS                            |
| State          | Pinia                                   |
| Build Tool     | Vite                                    |
| Icons          | Lucide Vue                              |

---

## Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test

# End-to-end tests
npm run test:e2e
```

---

## Scripts Reference

### Backend

| Command              | Description                        |
|----------------------|------------------------------------|
| `npm run dev`        | Start development server           |
| `npm run build`      | Build for production               |
| `npm run start`      | Run production build               |
| `npm run ingest`     | Ingest documents to Pinecone       |
| `npm run test-env`   | Verify environment variables       |
| `npm run test-groq`  | Test Groq API connection           |

### Frontend

| Command              | Description                        |
|----------------------|------------------------------------|
| `npm run dev`        | Start development server           |
| `npm run build`      | Build for production               |
| `npm run preview`    | Preview production build           |
| `npm run dev:clean`  | Start with cleared cache           |

---

## Deployment

```bash
# Backend (Railway / Fly.io)
cd backend
npm run build

# Frontend (Vercel / Netlify)
cd frontend
npm run build
```

---

## Acknowledgments

- [Groq](https://groq.com) — Ultra-fast LLM inference
- [LangChain](https://www.langchain.com) — Agent framework
- [Pinecone](https://www.pinecone.io) — Vector database
- [Vue.js](https://vuejs.org) — Frontend framework
