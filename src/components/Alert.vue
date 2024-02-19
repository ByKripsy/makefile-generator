<script setup>
import {ref, watch} from 'vue';
import {useStore} from 'vuex';

const store = useStore();

const showAlert = ref(false);
const progress = ref(100);
const duration = ref(3000);

watch(() => store.state.showAlert, newVal => showAlert.value = newVal);

watch(() => store.state.progress, newVal => progress.value = newVal);
</script>

<template>
  <div v-if="showAlert" class="fixed right-0 m-4">
    <div class="bg-gray-800 rounded-md shadow-lg max-w-sm w-80">
      <p class="text-sm font-medium text-red-400 p-3">
        <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
             fill="currentColor" viewBox="0 0 20 20">
          <path
              d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
        </svg>
        {{ store.state.message }}
      </p>
      <div class="h-1 bg-gray-200 inset-x-0 bottom-0">
        <transition :duration="duration">
          <div v-if="showAlert" :style="{width: progress + '%'}" class="h-full bg-blue-500"></div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
</style>