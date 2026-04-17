<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User, Bot } from 'lucide-vue-next'
import type { Message } from '@/types/chat'

const props = defineProps<{
  message: Message
}>()

const visible = ref(false)

onMounted(() => {
  setTimeout(() => {
    visible.value = true
  }, 50)
})

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatContent = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\n/g, '<br>')
}
</script>

<template>
  <!-- User message - Right aligned -->
  <div
    v-if="message.role === 'user'"
    :class="[
      'flex gap-3 justify-end transition-all duration-400',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    ]"
  >
    <div class="max-w-[80%]">
      <div class="flex items-center gap-2 mb-1 justify-end">
        <span class="text-xs text-gray-500">{{ formatTime(message.timestamp) }}</span>
        <span class="text-sm font-semibold text-gray-700">You</span>
      </div>
      <div class="bg-black text-white p-3 rounded-2xl rounded-tr-sm border-2 border-black">
        <div v-html="formatContent(message.content)" class="text-sm leading-relaxed" />
      </div>
    </div>
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-black flex items-center justify-center">
      <User :size="16" class="text-white" />
    </div>
  </div>

  <!-- Assistant message - Left aligned -->
  <div
    v-else
    :class="[
      'flex gap-3 justify-start transition-all duration-400',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    ]"
  >
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-[#43d8b8] border-2 border-black flex items-center justify-center">
      <Bot :size="16" class="text-black" />
    </div>
    <div class="max-w-[80%]">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-sm font-semibold text-gray-700">Vyre</span>
        <span class="text-xs text-gray-500">{{ formatTime(message.timestamp) }}</span>
      </div>
      <div class="bg-white border-2 border-black p-3 rounded-2xl rounded-tl-sm">
        <div v-html="formatContent(message.content)" class="text-sm text-gray-800 leading-relaxed" />
      </div>
    </div>
  </div>
</template>