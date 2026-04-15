<script setup lang="ts">
import ChatContainer from './components/ChatContainer.vue'
</script>

<template>
  <div class="min-h-screen bg-vyre-white">
    <!-- Your main app content goes here -->
    <div class="container mx-auto p-8">
      <h1 class="text-4xl font-bold text-black mb-4">VYRE.AFRICA</h1>
      <p class="text-gray-400">Chat with our AI assistant using the widget below.</p>
    </div>

    <!-- Chatbot -->
    <ChatContainer />
  </div>
</template>