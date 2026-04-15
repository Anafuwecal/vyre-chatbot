<script setup lang="ts">
import { ref, watch } from 'vue'
import { Bot } from 'lucide-vue-next'

const props = defineProps<{
  content: string
}>()

const displayLines = ref<string[]>([])

watch(
  () => props.content,
  (newContent) => {
    displayLines.value = newContent.split('\n').filter((line) => line.trim())
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex gap-3 justify-start">
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-[#43d8b8] border-2 border-black flex items-center justify-center">
      <Bot :size="16" class="text-black" />
    </div>
    <div class="max-w-[80%]">
      <div class="text-sm font-semibold text-gray-700 mb-1">VYRE Assistant</div>
      <div class="bg-white border-2 border-black p-3 rounded-2xl rounded-tl-sm">
        <div class="space-y-1">
          <TransitionGroup name="list">
            <p
              v-for="(line, index) in displayLines"
              :key="index"
              class="text-sm text-gray-800 leading-relaxed"
              :style="{ animationDelay: `${index * 0.05}s` }"
            >
              {{ line }}
            </p>
          </TransitionGroup>
          <span class="inline-block w-1 h-4 bg-[#43d8b8] animate-pulse"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
</style>