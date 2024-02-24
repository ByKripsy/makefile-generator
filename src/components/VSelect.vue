<script setup>
import VueSelect from 'vue-select'
import {defineProps, toRefs, defineExpose, defineEmits, nextTick, ref} from 'vue'

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
    type: Array,
    required: true
  },
  options: {
    type: Array,
    default: () => []
  },
  optional: {
    type: Boolean,
    default: false
  },
  multiple: {
    type: Boolean,
    default: false
  },
  taggable: {
    type: Boolean,
    default: false
  },
  noDropdown: {
    type: Boolean,
    default: false
  },
  keys: {
    type: Boolean,
    default: false
  }
})

let dropdownShouldOpen = () => false

const { name, label, modelValue, options, optional, multiple, taggable, noDropdown, keys } = toRefs(props)

defineExpose({ name, label, options, optional, multiple, taggable, noDropdown, keys })

const emit = defineEmits(['update:modelValue'])

let array = ref(JSON.parse(localStorage.getItem(name.value)) || []);

const updateValue = (value) => {
  if (!Array.isArray(value)) value = [value];
  emit('update:modelValue', array.value);
}

function push(e, vm) {
  e.preventDefault()
  if (vm.search.length > 0) {
    vm.search.split(" ").forEach((file) => array.value.push(file))
    localStorage.setItem(name.value, JSON.stringify(array.value));
    emit('update:modelValue', array.value);
    vm.search = ''
    nextTick(() => vm.$forceUpdate())
  }
}

const keyhook = (map, vm) => ({
  ...map,
  13: (e) => push(e, vm),
  32: (e) => push(e, vm),
  9: (e) => push(e, vm),
  8: () => {
    if (vm.search.length === 0 && array.value.length > 0) {
      array.value.pop()
      localStorage.setItem(name.value, JSON.stringify(array.value));
      emit('update:modelValue', array.value);
      nextTick(() => vm.$forceUpdate())
    }
  }
})

function addOption() {
  localStorage.setItem(name.value, JSON.stringify(array.value));
  emit('update:modelValue', array.value);
}
</script>

<template>
  <div>
    <label class="text-gray-200">{{ label }}</label>
    <span
      v-if="optional"
      class="text-gray-400"
    > (Optional)</span>
    <VueSelect
      :id="name"
      v-model="array"
      :multiple="multiple"
      :taggable="taggable"
      :dropdown-should-open="noDropdown ? dropdownShouldOpen : undefined"
      :options="options"
      :map-keydown="keys ? keyhook : undefined"
      class="style-chooser block w-full px-4 py-2 mt-2 border rounded-md bg-gray-800
                    text-gray-300 border-gray-600 focus:border-blue-500 focus:outline-none focus:ring"
      @option:selected="addOption"
    />
  </div>
</template>