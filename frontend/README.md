# VYRE Chatbot — Frontend

> Modern Vue.js chat interface with real-time streaming, full-screen mode, and smooth animations.

---

## Table of Contents

- [Features](#features)
- [Directory Structure](#directory-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Customization](#customization)
- [Components](#components)
- [State Management](#state-management)
- [Animations](#animations)
- [Testing](#testing)
- [Responsive Breakpoints](#responsive-breakpoints)
- [Production Build](#production-build)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Performance](#performance)

---

## Features

- **Modern UI** — Clean design built with Tailwind CSS.
- **Real-time Streaming** — Word-by-word response animation via SSE.
- **Responsive Layout** — Supports both full-screen and sidebar display modes.
- **Smooth Animations** — Message fade-ins and transitions throughout.
- **State Management** — Pinia for reactive chat state.
- **TypeScript** — Full type safety across all components.
- **Fast Development** — Vite for instant HMR.

---

## Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatContainer.vue       # Main chat UI
│   │   ├── MessageLine.vue         # Individual message renderer
│   │   └── StreamingMessage.vue    # Animated streaming display
│   │
│   ├── stores/
│   │   └── chat.ts                 # Pinia chat store
│   │
│   ├── types/
│   │   └── chat.ts                 # TypeScript type definitions
│   │
│   ├── assets/
│   │   └── main.css                # Global styles + Tailwind
│   │
│   ├── App.vue                     # Root component
│   └── main.ts                     # Application entry point
│
├── public/                         # Static assets
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Installation

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3000
```

---

## Development

```bash
# Start development server
npm run dev

# Start with cleared cache
npm run dev:clean

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Customization

### Brand Colors

Edit `tailwind.config.js` to update the VYRE color palette:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        vyre: {
          primary: '#43d8b8',   // Mint green
          black:   '#000000',
          white:   '#ffffff'
        }
      }
    }
  }
}
```

---

## Components

### ChatContainer

Main chat interface. Includes the header with controls, the scrollable message list, the text input area, and the full-screen toggle.

- **Props:** None
- **Emits:** None

---

### MessageLine

Renders a single chat message.

| Prop      | Type      | Description                                      |
|-----------|-----------|--------------------------------------------------|
| `message` | `Message` | Message object containing `role`, `content`, and `timestamp` |

---

### StreamingMessage

Displays an animated in-progress streaming message.

| Prop      | Type     | Description                      |
|-----------|----------|----------------------------------|
| `content` | `string` | The current partial response text |

---

## State Management

The Pinia store at `src/stores/chat.ts` manages the following state:

```ts
{
  messages:               Message[]   // Full chat history
  isLoading:              boolean     // True while a request is in-flight
  isStreaming:            boolean     // True while a response is streaming
  currentStreamingMessage: string    // Partial content of the active stream
  sessionId:              string      // Current session identifier
}
```

### Available Actions

| Action                        | Description                        |
|-------------------------------|------------------------------------|
| `sendMessage(content: string)` | Send a new chat message           |
| `clearChat()`                  | Reset the conversation            |
| `initSession()`                | Create a new session              |

---

## Animations

### Message Fade-in

```css
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
}
```

### Streaming Cursor

```html
<span class="animate-pulse bg-[#43d8b8]"></span>
```

---

## Testing

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# End-to-end tests
npm run test:e2e
```

---

## Responsive Breakpoints

| Breakpoint | Width            | Behavior                    |
|------------|------------------|-----------------------------|
| Mobile     | < 640px          | Sidebar mode only           |
| Tablet     | 640px – 1024px   | Adaptive layout             |
| Desktop    | > 1024px         | Full-screen mode available  |

---

## Production Build

```bash
npm run build
```

Output directory: `dist/`

```
dist/
├── index.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

---

## Deployment

### Vercel

```bash
npm run build
vercel --prod
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## Troubleshooting

**White screen on load**
- Check the browser console for errors.
- Verify `VITE_API_URL` is set correctly in `.env`.
- Ensure the backend server is running.

**No styling applied**
- Clear the cache: `npm run dev:clean`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**TypeScript errors**
- Run `npm run build` to surface all type errors.
- Review `tsconfig.json` for any misconfiguration.

---

## Performance

| Metric         | Target     |
|----------------|------------|
| Initial load   | ~50 KB gzipped |
| HMR update     | < 100 ms   |
| Build time     | ~5 seconds |
