# VYRE Chatbot - Frontend

> Modern Vue.js chat interface with real-time streaming, full-screen mode, and smooth animations.

## ✨ Features

- 🎨 **Modern UI** - Clean design with Tailwind CSS
- 💬 **Real-time Streaming** - Word-by-word response animation
- 📱 **Responsive** - Full-screen and sidebar modes
- 🎭 **Smooth Animations** - Message fade-ins and transitions
- 💾 **State Management** - Pinia for reactive chat state
- 🎯 **TypeScript** - Full type safety
- ⚡ **Fast** - Vite for instant HMR

## 📂 Directory Structure

frontend/
├── src/
│ ├── components/
│ │ ├── ChatContainer.vue # Main chat UI
│ │ ├── MessageLine.vue # Individual message
│ │ └── StreamingMessage.vue # Animated streaming
│ │
│ ├── stores/
│ │ └── chat.ts # Pinia chat store
│ │
│ ├── types/
│ │ └── chat.ts # TypeScript types
│ │
│ ├── assets/
│ │ └── main.css # Global styles + Tailwind
│ │
│ ├── App.vue # Root component
│ └── main.ts # Application entry
│
├── public/ # Static assets
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json


## 🔧 Installation

```bash
npm install
```

Environment Variables
VITE_API_URL=http://localhost:3000

Development
# Start dev server
npm run dev

# Start with cleared cache
npm run dev:clean

# Build for production
npm run build

# Preview production build
npm run preview

🎨 Customization
Brand Colors
Edit tailwind.config.js:

module.exports = {
  theme: {
    extend: {
      colors: {
        vyre: {
          primary: '#43d8b8',   // Mint green
          black: '#000000',
          white: '#ffffff'
        }
      }
    }
  }
}

Components
ChatContainer
Main chat interface with:

Header with controls
Message list
Input area
Full-screen toggle
Props: None
Emits: None

MessageLine
Individual message display.

Props:

message: Message - Message object with role, content, timestamp
StreamingMessage
Animated streaming message display.

Props:

content: string - Current streaming content
🗂️ State Management
The chat store (src/stores/chat.ts) manages:

{
  messages: Message[]              // Chat history
  isLoading: boolean               // Request in progress
  isStreaming: boolean             // Currently streaming response
  currentStreamingMessage: string  // Partial response
  sessionId: string                // Session identifier
}

Actions:

sendMessage(content: string) - Send chat message
clearChat() - Reset conversation
initSession() - Create new session
🎭 Animations
Message Fade-in

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
}

Streaming Cursor
<span class="animate-pulse bg-[#43d8b8]"></span>

Testing
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

Responsive Breakpoints
Mobile: < 640px (sidebar mode only)
Tablet: 640px - 1024px
Desktop: > 1024px (full-screen available)
🚀 Production Build

# Build optimized bundle
npm run build

# Output: dist/
# - index.html
# - assets/
#   ├── index-[hash].js
#   └── index-[hash].css

🐛 Troubleshooting
White screen:

Check console for errors
Verify API_URL in .env
Ensure backend is running
No styling:

Clear cache: npm run dev:clean
Rebuild: rm -rf node_modules && npm install
TypeScript errors:

Run: npm run build to see all errors
Check tsconfig.json configuration
📊 Performance
Initial load: ~50KB gzipped
HMR: < 100ms
Build time: ~5 seconds
🚢 Deployment
Vercel

npm run build
vercel --prod

Netlify
npm run build
netlify deploy --prod --dir=dist