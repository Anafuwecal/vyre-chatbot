import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message } from '@/types/chat'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  const isStreaming = ref(false)
  const currentStreamingMessage = ref('')
  const sessionId = ref('')

  const hasMessages = computed(() => messages.value.length > 0)

  const initSession = async () => {
    if (sessionId.value) return
    try {
      console.log('🔑 Creating session...')
      const response = await fetch(`${API_URL}/api/session`, { method: 'POST' })
      const data = await response.json()
      sessionId.value = data.sessionId
      console.log('✅ Session created:', sessionId.value)
    } catch (error) {
      console.error('❌ Session failed:', error)
      sessionId.value = `local-${Date.now()}`
    }
  }

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    messages.value.push({
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date()
    })
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading.value) return
    if (!sessionId.value) await initSession()

    addMessage('user', content)
    isLoading.value = true
    isStreaming.value = true
    currentStreamingMessage.value = ''

    try {
      const response = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, sessionId: sessionId.value })
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('No reader')

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) currentStreamingMessage.value += parsed.content
            } catch (e) {}
          }
        }
      }

      if (currentStreamingMessage.value.trim()) {
        addMessage('assistant', currentStreamingMessage.value)
      } else {
        addMessage('assistant', 'No response received.')
      }
      currentStreamingMessage.value = ''
    } catch (error) {
      console.error('Chat error:', error)
      addMessage('assistant', 'Error occurred.')
      currentStreamingMessage.value = ''
    } finally {
      isLoading.value = false
      isStreaming.value = false
    }
  }

  const clearChat = () => {
    messages.value = []
    currentStreamingMessage.value = ''
  }

  initSession()

  return {
    messages,
    isLoading,
    isStreaming,
    currentStreamingMessage,
    sessionId,
    hasMessages,
    sendMessage,
    clearChat
  }
})
