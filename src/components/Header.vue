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
            class="bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 text-transparent tracking-wide bg-clip-text text-lg font-bold">
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