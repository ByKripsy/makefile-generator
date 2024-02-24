<script setup>
import { defineProps, toRefs, defineExpose, defineEmits } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  optional: {
    type: Boolean,
    default: false
  }
})

const { name, label, modelValue, placeholder, options, optional } = toRefs(props)

defineExpose({ name, label, placeholder, options, optional })

const emit = defineEmits(['update:modelValue'])

const updateValue = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div>
    <label
      class="text-gray-200"
      :for="name"
    >{{ label }}</label>
    <span
      v-if="optional"
      class="text-gray-400"
    > (Optional)</span>
    <select
      :id="name"
      :value="modelValue"
      class="block w-full px-4 py-2 mt-2 border rounded-md
                   bg-gray-800 text-gray-300 border-gray-600 focus:border-blue-500 focus:outline-none focus:ring"
      @input="updateValue"
    >
      <option
        v-for="option in options"
        :key="option"
        :value="option"
      >
        {{ option }}
      </option>
    </select>
  </div>
</template>