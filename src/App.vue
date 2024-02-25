<script setup>
import Header from "@/components/Header.vue";
import MainForm from "@/components/MainForm.vue";
import Footer from "@/components/Footer.vue";
import { ModalsContainer } from 'vue-final-modal';
</script>

<template>
  <div class="flex flex-col h-screen justify-between overflow-y-auto">
    <Header name="Makefile Generator" />
    <MainForm />
    <ModalsContainer />
    <Footer />
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: #FFFFFF00;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
