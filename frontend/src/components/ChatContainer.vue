<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { Maximize2, Minimize2, X, Send, Trash2 } from 'lucide-vue-next'
import MessageLine from './MessageLine.vue'
import StreamingMessage from './StreamingMessage.vue'

const chatStore = useChatStore()
const isFullScreen = ref(false)
const isOpen = ref(true)
const messageInput = ref('')
const chatContainer = ref<HTMLElement | null>(null)

// Responsive breakpoints
const isMobile = ref(window.innerWidth < 768)
const isTablet = ref(window.innerWidth >= 768 && window.innerWidth < 1024)
const isDesktop = ref(window.innerWidth >= 1024)

const updateBreakpoints = () => {
  const width = window.innerWidth
  isMobile.value = width < 768
  isTablet.value = width >= 768 && width < 1024
  isDesktop.value = width >= 1024
}

onMounted(() => {
  updateBreakpoints()
  window.addEventListener('resize', updateBreakpoints)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateBreakpoints)
})

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value
}

const handleSend = async () => {
  if (!messageInput.value.trim() || chatStore.isLoading) return

  const message = messageInput.value.trim()
  messageInput.value = ''

  await chatStore.sendMessage(message)
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

watch(
  () => chatStore.messages.length,
  () => {
    scrollToBottom()
  }
)

watch(
  () => chatStore.currentStreamingMessage,
  () => {
    scrollToBottom()
  }
)
</script>

<template>
  <!-- Fullscreen Backdrop -->
  <div
    v-if="isOpen && isFullScreen"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
    @click="isFullScreen = false"
  ></div>

  <!-- Chat Container -->
  <div
    v-if="isOpen"
    :class="[
      'fixed transition-all duration-500 ease-in-out shadow-2xl',
      'flex flex-col bg-white border-4 sm:border-[10px] border-black',
      isFullScreen
        ? 'inset-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[90%] sm:max-w-4xl h-full sm:h-[85vh] lg:h-[75vh] rounded-none sm:rounded-[20px] z-50'
        : 'bottom-0 right-0 sm:bottom-4 sm:right-4 w-full sm:w-[400px] md:w-[420px] lg:w-[440px] h-[100dvh] sm:h-[600px] md:h-[650px] lg:h-[610px] rounded-t-[20px] sm:rounded-[20px] animate-slide-in z-50'
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-3 sm:p-4 border-b-2 border-black bg-white rounded-t-[10px] flex-shrink-0">
      <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div
          class="w-8 h-8 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[15px] text-black bg-[#43d8b8] border-2 border-black flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0"
        >
          V
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-bold text-black tracking-tight text-sm sm:text-base truncate">VYRE ASSISTANT</h3>
          <div class="flex items-center gap-2 sm:gap-3">
            <p class="text-xs text-gray-600 hidden sm:block">Always here to help</p>
            
            <!-- Connection Status -->
            <div class="flex items-center gap-1">
              <div 
                :class="[
                  'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0',
                  chatStore.isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                ]"
              ></div>
              <span class="text-xs text-gray-500 whitespace-nowrap">
                {{ chatStore.isLoading ? 'Thinking...' : 'Ready' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button
          @click="chatStore.clearChat"
          class="p-1.5 sm:p-2 hover:bg-black hover:text-white rounded-lg transition-colors touch-manipulation"
          title="Clear chat"
        >
          <Trash2 :size="16" class="text-gray-600 sm:w-[18px] sm:h-[18px]" />
        </button>
        <button
          @click="toggleFullScreen"
          class="p-1.5 sm:p-2 hover:bg-black hover:text-white rounded-lg transition-colors touch-manipulation hidden sm:flex"
          :title="isFullScreen ? 'Minimize' : 'Maximize'"
        >
          <Maximize2 v-if="!isFullScreen" :size="18" class="text-gray-600" />
          <Minimize2 v-else :size="18" class="text-gray-600" />
        </button>
        <button 
          @click="isOpen = false" 
          class="p-1.5 sm:p-2 hover:bg-black hover:text-white rounded-lg transition-colors touch-manipulation"
        >
          <X :size="16" class="text-gray-600 sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>
    </div>

    <!-- Messages Container -->
    <div 
      ref="chatContainer" 
      class="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 overscroll-contain"
      :class="{
        'max-h-[calc(100vh-200px)]': isFullScreen && isDesktop,
        'max-h-[calc(100vh-180px)]': isFullScreen && isTablet,
        'max-h-[calc(100dvh-160px)]': isFullScreen && isMobile
      }"
    >
      <!-- Welcome message -->
      <div v-if="!chatStore.hasMessages" class="max-w-2xl mx-auto text-center py-4 sm:py-8">
        <div
          class="w-12 h-12 sm:w-16 sm:h-16 text-black mx-auto mb-3 sm:mb-4 rounded-[12px] sm:rounded-[15px] border-2 sm:border-[4px] border-black bg-[#43d8b8] flex items-center justify-center text-xl sm:text-2xl font-bold"
        >
          V
        </div>
        <h3 class="text-lg sm:text-xl text-black font-bold mb-2">Welcome to VYRE</h3>
        <p class="text-gray-700 text-xs sm:text-sm mb-4 sm:mb-6 px-4">
          Ask me anything about VYRE.AFRICA! I can help with features, pricing, technical questions,
          and more.
        </p>
        <div class="space-y-2 px-4">
          <button
            @click="messageInput = 'What is VYRE.AFRICA?'"
            class="w-full p-2.5 sm:p-3 text-black border-2 hover:bg-black hover:text-white rounded-lg text-left text-xs sm:text-sm transition-colors touch-manipulation"
          >
            What is VYRE.AFRICA?
          </button>
          <button
            @click="messageInput = 'How do I create an account?'"
            class="w-full p-2.5 sm:p-3 text-black border-2 hover:bg-black hover:text-white rounded-lg text-left text-xs sm:text-sm transition-colors touch-manipulation"
          >
            How do I create an account?
          </button>
          <button
            @click="messageInput = 'What features does VYRE offer?'"
            class="w-full p-2.5 sm:p-3 text-black border-2 hover:bg-black hover:text-white rounded-lg text-left text-xs sm:text-sm transition-colors touch-manipulation"
          >
            What features does VYRE offer?
          </button>
        </div>
      </div>

      <!-- Chat messages -->
      <div v-else :class="['space-y-3 sm:space-y-4', isFullScreen ? 'max-w-3xl mx-auto' : '']">
        <MessageLine v-for="message in chatStore.messages" :key="message.id" :message="message" />

        <!-- Streaming message -->
        <StreamingMessage
          v-if="chatStore.isStreaming && chatStore.currentStreamingMessage"
          :content="chatStore.currentStreamingMessage"
        />
      </div>
    </div>

    <!-- Input Container -->
    <div 
      :class="[
        'p-3 sm:p-4 border-t-2 border-black bg-white rounded-b-[10px] flex-shrink-0',
        'pb-safe',
        isFullScreen ? 'max-w-3xl mx-auto w-full' : ''
      ]"
    >
      <form @submit.prevent="handleSend" class="flex gap-2">
        <input
          id="chat-message-input"
          v-model="messageInput"
          type="text"
          name="message"
          placeholder="Ask about VYRE..."
          :disabled="chatStore.isLoading"
          class="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-100 border-2 border-black rounded-xl text-sm sm:text-base text-black placeholder-gray-500 focus:outline-none focus:border-[#43d8b8] transition-colors disabled:opacity-50"
          @keydown.enter="handleSend"
        />
        <button
          type="submit"
          :disabled="!messageInput.trim() || chatStore.isLoading"
          class="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#43d8b8] hover:bg-[#3bc9a9] text-black font-semibold rounded-full border-2 border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex-shrink-0"
        >
          <Send :size="18" class="sm:w-5 sm:h-5" />
        </button>
      </form>
      <p class="text-xs text-gray-600 mt-2 text-center">Powered by Groq + Llama 3 | VYRE.AFRICA</p>
    </div>
  </div>

  <!-- Toggle button when closed -->
  <button
    v-else
    @click="isOpen = true"
    class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 px-3 py-2.5 sm:px-4 sm:py-3 bg-[#43d8b8] rounded-[16px] sm:rounded-[20px] border-2 sm:border-[4px] border-black shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform z-50 touch-manipulation"
  >
    <div class="w-7 h-7 sm:w-8 sm:h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
      V
    </div>
    <span class="text-xs sm:text-sm font-bold text-black">Need help?</span>
  </button>
</template>

<style scoped>
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

/* Safe area padding for mobile devices */
.pb-safe {
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
}

/* Smooth scrolling */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Prevent text selection on buttons */
button {
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Better scrollbar for webkit browsers */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>