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
      console.log('Session created:', sessionId.value)
    } catch (error) {
      console.error('Session failed:', error)
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
  if (!content.trim() || isLoading.value) {
    console.log('Skipping send - empty or loading')
    return
  }

  if (!sessionId.value) {
    console.log('No session, creating one...')
    await initSession()
  }

  console.log('Sending message:', content)
  console.log('Using session:', sessionId.value)

  addMessage('user', content)
  isLoading.value = true
  isStreaming.value = true
  currentStreamingMessage.value = ''

  let abortController = new AbortController()
  let timeoutId: ReturnType<typeof setTimeout>
  try {
    // Set overall timeout (3 minutes)
    timeoutId = setTimeout(() => {
        console.warn('Request timeout, aborting...')
      abortController.abort()
    }, 180000)

    const response = await fetch(`${API_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: content,
        sessionId: sessionId.value,
      }),
      signal: abortController.signal,
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let buffer = ''
    let chunks = 0
    let lastChunkTime = Date.now()

    while (true) {
      // Read with timeout
      const readPromise = reader.read()
      const timeoutPromise = new Promise<{ done: true; value?: undefined }>((resolve) =>
        setTimeout(() => {
          console.warn('Read timeout')
          resolve({ done: true })
        }, 30000) // 30 seconds per chunk
      )

      const { done, value } = await Promise.race([readPromise, timeoutPromise])

      if (done) {
        console.log('✅ Stream complete. Total chunks:', chunks)
        break
      }

      if (!value) continue

      lastChunkTime = Date.now()

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')

      buffer = lines.pop() || ''

      for (const line of lines) {
        // Skip keep-alive pings
        if (line.startsWith(': ')) continue

        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()

          if (data === '[DONE]') {
            console.log('✅ Received [DONE]')
            break
          }

          if (data) {
            try {
              const parsed = JSON.parse(data)
              
              if (parsed.content) {
                chunks++
                currentStreamingMessage.value += parsed.content
              }
              
              if (parsed.error) {
                console.error('Stream error:', parsed.error)
                throw new Error(parsed.error)
              }
            } catch (e) {
              if (e instanceof Error && e.message.startsWith('Stream error')) {
                throw e
              }
              // Skip invalid JSON
              console.warn('Invalid JSON, skipping:', data.substring(0, 50))
            }
          }
        }
      }
    }

    // Clear timeout
    clearTimeout(timeoutId)

    // Add complete assistant message
    if (currentStreamingMessage.value.trim()) {
      console.log('Adding assistant message, length:', currentStreamingMessage.value.length)
      addMessage('assistant', currentStreamingMessage.value)
    } else {
      console.warn('No content received from stream')
      addMessage(
        'assistant',
        "I'm sorry, I didn't receive a complete response. Please try asking again."
      )
    }

    currentStreamingMessage.value = ''
  } catch (error: any) {
    console.error('Chat error:', error)

    // Clear timeout if exists
    if (timeoutId) clearTimeout(timeoutId)

    // Provide user-friendly error messages
    let errorMessage = 'Sorry, I encountered an error. Please try again.'

    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      errorMessage = 'The request took too long. Please try a simpler question or try again.'
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Cannot connect to the server. Please check your connection and try again.'
    }

    addMessage('assistant', errorMessage)
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
