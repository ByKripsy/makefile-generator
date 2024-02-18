<script setup lang="ts">
import {VueFinalModal} from 'vue-final-modal'
import VCodeBlock from '@wdns/vue-code-block';

defineProps({
  content: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: boolean): void
}>()

</script>


<template>
  <VueFinalModal
      class="flex justify-center items-center"
      @update:model-value="val => emit('update:modelValue', val)"
  >
    <VCodeBlock
        :code="content"
        highlightjs
        lang="makefile"
        theme="atom-one-dark"
        class="code-block-content rounded-lg"
    />
  </VueFinalModal>
</template>

<style scoped>
.code-block-content {
  max-height: 800px;
  overflow-y: auto;
}

/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #FFFFFF00;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>