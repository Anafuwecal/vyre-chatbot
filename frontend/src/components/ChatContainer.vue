<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { Maximize2, Minimize2, X, Send, Trash2 } from 'lucide-vue-next'
import MessageLine from './MessageLine.vue'
import StreamingMessage from './StreamingMessage.vue'

const chatStore = useChatStore()
const isFullScreen = ref(false)
const isOpen = ref(true)
const messageInput = ref('')
const chatContainer = ref<HTMLElement | null>(null)

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
      'flex flex-col bg-white border-[10px] border-black',
      isFullScreen
        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl h-[90vh] rounded-[20px] z-50'
        : 'bottom-4 right-4 w-[400px] h-[600px] rounded-[20px] animate-slide-in z-50'
    ]"
  >
    <!-- Header -->
     <div class="flex items-center justify-between p-4 border-b-2 border-black bg-white rounded-t-[10px]">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-[15px] text-black bg-[#43d8b8] border-[2px] border-black flex items-center justify-center font-bold"
        >
          V
        </div>
        <div>
          <h3 class="font-bold text-black tracking-tight">VYRE ASSISTANT</h3>
          <div class="flex items-center gap-3">
            <p class="text-xs text-gray-600">Always here to help</p>
            
            <!-- FIXED: Moved connection status here as sibling, not nested -->
            <div class="flex items-center gap-1">
              <div 
                :class="[
                  'w-2 h-2 rounded-full',
                  chatStore.isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                ]"
              ></div>
              <span class="text-xs text-gray-500">
                {{ chatStore.isLoading ? 'Thinking...' : 'Ready' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="chatStore.clearChat"
          class="p-2 hover:bg-black hover:text-white rounded-lg transition-colors"
          title="Clear chat"
        >
          <Trash2 :size="18" class="text-gray-600 " />
        </button>
        <button
          @click="toggleFullScreen"
          class="p-2 hover:bg-black hover:text-white rounded-lg transition-colors"
          :title="isFullScreen ? 'Minimize' : 'Maximize'"
        >
          <Maximize2 v-if="!isFullScreen" :size="18" class="text-gray-600 " />
          <Minimize2 v-else :size="18" class="text-gray-600 " />
        </button>
        <button @click="isOpen = false" class="p-2 hover:bg-black rounded-lg transition-colors">
          <X :size="18" class="text-gray-600 hover:text-red-600" />
        </button>
      </div>
    </div>

    <!-- Messages Container -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 bg-gray-50">
      <!-- Welcome message -->
      <div v-if="!chatStore.hasMessages" class="max-w-2xl mx-auto text-center py-8">
        <div
          class="w-16 h-16 text-black mx-auto mb-4 rounded-[15px] border-[4px] border-black bg-[#43d8b8] flex items-center justify-center text-2xl font-bold"
        >
          V
        </div>
        <h3 class="text-xl text-black font-bold mb-2">Welcome to VYRE</h3>
        <p class="text-gray-700 text-sm mb-6">
          Ask me anything about VYRE.AFRICA! I can help with features, pricing, technical questions,
          and more.
        </p>
        <div class="space-y-2">
          <button
            @click="messageInput = 'What is VYRE.AFRICA?'"
            class="w-full p-3 text-black border-2 hover:bg-black hover:text-white rounded-lg text-left text-sm transition-colors"
          >
            What is VYRE.AFRICA?
          </button>
          <button
            @click="messageInput = 'How do I create an account?'"
            class="w-full p-3 text-black border-2 hover:bg-black hover:text-white rounded-lg text-left text-sm transition-colors"
          >
            How do I create an account?
          </button>
          <button
            @click="messageInput = 'What features does VYRE offer?'"
            class="w-full p-3 text-black border-2 hover:bg-black hover:text-white rounded-lg text-left text-sm transition-colors"
          >
            What features does VYRE offer?
          </button>
        </div>
      </div>

      <!-- Chat messages - Max width container for fullscreen -->
      <div v-else :class="['space-y-4', isFullScreen ? 'max-w-3xl mx-auto' : '']">
        <MessageLine v-for="message in chatStore.messages" :key="message.id" :message="message" />

        <!-- Streaming message -->
        <StreamingMessage
          v-if="chatStore.isStreaming && chatStore.currentStreamingMessage"
          :content="chatStore.currentStreamingMessage"
        />
      </div>
    </div>

    <!-- Input Container - Max width for fullscreen -->
    <div :class="['p-4 border-t-2 border-black bg-white rounded-b-[10px]', isFullScreen ? 'max-w-3xl mx-auto w-full' : '']">
      <form @submit.prevent="handleSend" class="flex gap-2">
        <input
          id="chat-message-input"
          v-model="messageInput"
          type="text"
          name="message"
          placeholder="Ask about VYRE..."
          :disabled="chatStore.isLoading"
          class="flex-1 px-4 py-3 bg-gray-100 border-2 border-black rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-[#43d8b8] transition-colors disabled:opacity-50"
          @keydown.enter="handleSend"
        />
        <button
          type="submit"
          :disabled="!messageInput.trim() || chatStore.isLoading"
          class="px-6 py-3 bg-[#43d8b8] hover:bg-[#3bc9a9] text-black font-semibold rounded-full border-2 border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send :size="20" />
        </button>
      </form>
      <p class="text-xs text-gray-600 mt-2 text-center">Powered by Groq + Llama 3 | VYRE.AFRICA</p>
    </div>
  </div>

  <!-- Toggle button when closed -->
  <button
    v-else
    @click="isOpen = true"
    class="fixed bottom-4 right-4 px-4 py-3 bg-[#43d8b8] rounded-[20px] border-[4px] border-black shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform z-50"
  >
    <div class="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
      V
    </div>
    <span class="text-sm font-bold text-black">Need help?</span>
  </button>
</template>