<script setup>
import { ref, onMounted } from 'vue';

const showAlert = ref(false);
const progress = ref(100);
const duration = ref(3000);

const showAlertWithProgress = () => {
  showAlert.value = true;
  let interval = setInterval(() => {
    progress.value -= 1;
    if (progress.value <= 0) {
      clearInterval(interval);
      showAlert.value = false;
    }
  }, duration.value / 100);
};

onMounted(showAlertWithProgress);
</script>

<template>
<!--  <div v-if="showAlert" class="right-0 w-full z-50">
    <div class="bg-white p-4 rounded shadow-lg max-w-sm w-full">
      <p class="text-gray-700">Ceci est une alerte</p>
      <div class="h-2 mt-4 bg-gray-200 rounded">
        <transition :duration="duration">
          <div v-if="showAlert" :style="{width: progress + '%'}" class="h-full bg-blue-500 rounded"></div>
        </transition>
      </div>
    </div>
  </div>-->
<!-- hover on top right -->
  <div v-if="showAlert" class="fixed right-0 m-4">
    <div class="bg-white p-4 rounded shadow-lg max-w-sm w-full">
      <p class="text-gray-700">Ceci est une alerte</p>
      <div class="h-2 mt-4 bg-gray-200 rounded">
        <transition :duration="duration">
          <div v-if="showAlert" :style="{width: progress + '%'}" class="h-full bg-blue-500 rounded"></div>
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