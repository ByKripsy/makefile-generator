<script setup>
defineProps({
  name: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="bg-gray-900 shadow">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-3 items-center py-4">
        <div
            class="flex items-center bg-gradient-to-r from-[#1AC4F4] via-[#1F8EE1] to-[#4B70C6] text-transparent tracking-wide bg-clip-text text-lg font-bold">
          <img src="../assets/logo.png" alt="" class="h-10 mr-5">
          {{ name }}
        </div>

        <div class="text-center">
          <a href="" class="text-white text-md font-semibold hover:text-blue-600">Home</a>
        </div>

        <div></div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>