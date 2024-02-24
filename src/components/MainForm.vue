<script setup>
import {ref, watch} from 'vue'
import {useModal} from 'vue-final-modal'
import CodeModal from './CodeModal.vue'
import Alert from "@/components/Alert.vue";
import {useStore} from "vuex";
import {generateMakefile} from "@/makefileGenerator.js";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";
import VSelect from "@/components/VSelect.vue";

let project = ref(localStorage.getItem("project") || "");
let sourceFiles = ref(JSON.parse(localStorage.getItem("sourceFiles")) || []);
let compilerFlags = ref(localStorage.getItem("compilerFlags") || "-Wextra -Wall -Werror");
let compiler = ref(localStorage.getItem("compiler") || "clang");
let sourceDir = ref(localStorage.getItem("sourceDir") || "src");
let objectDir = ref(localStorage.getItem("objectDir") || "obj");
let libs = ref(JSON.parse(localStorage.getItem("libs")) || []);
let libsOptions = ref(["readline", "pthread", "m", "glfw"]);
let compilerOptions = ref(["clang", "gcc", "clang++", "g++"]);
let includeDir = ref(localStorage.getItem("includeDir") || "include");
let dependencies = ref(JSON.parse(localStorage.getItem("dependencies")) || []);
let args = ref(localStorage.getItem("args") || "");
let gdb = ref(localStorage.getItem("gdb") === "true");
let valgrind = ref(localStorage.getItem("valgrind") === "true");
let modalIsOpen = ref(false);

watch(project, (newVal) => localStorage.setItem("project", newVal));
watch(compilerFlags, (newVal) => localStorage.setItem("compilerFlags", newVal));
watch(compiler, (newVal) => localStorage.setItem("compiler", newVal));
watch(sourceDir, (newVal) => localStorage.setItem("sourceDir", newVal));
watch(objectDir, (newVal) => localStorage.setItem("objectDir", newVal));
watch(includeDir, (newVal) => localStorage.setItem("includeDir", newVal));
// watch(dependencies, (newVal) => localStorage.setItem("dependencies", newVal));
watch(args, (newVal) => localStorage.setItem("args", newVal));
watch(gdb, (newVal) => localStorage.setItem("gdb", newVal));
watch(valgrind, (newVal) => localStorage.setItem("valgrind", newVal));

watch([gdb, valgrind], () => {
  if (gdb.value || valgrind.value) {
    if (!compilerFlags.value.includes("-g")) {
      compilerFlags.value += " -g"
    }
  } else {
    compilerFlags.value = compilerFlags.value.replace(" -g", "")
  }
})

function validateFields() {
  const fields = [
    {value: project.value, error: 'Project name is required'},
    {value: sourceFiles.value.length, error: 'At least one source file is required'},
    {value: compiler.value, error: 'Compiler is required'},
    {value: sourceDir.value, error: 'Source directory is required'},
    {value: objectDir.value, error: 'Object directory is required'},
    {value: includeDir.value, error: 'Include directory is required'},
  ];

  for (let field of fields) if (!field.value) return field.error;
  return null;
}

const store = useStore();

function generate() {
  if (validateFields()) {
    store.commit('showAlertWithProgress', validateFields());
    return;
  }
  let makefile = generateMakefile(project.value, sourceFiles.value, compilerFlags.value, compiler.value, sourceDir.value, objectDir.value, libs.value, includeDir.value, dependencies.value, args.value, gdb.value, valgrind.value)
  useModal({
    component: CodeModal,
    attrs: {
      content: makefile
    },
  }).open()
}
</script>

<template>
  <Alert />
  <section class="max-w-4xl p-6 mx-auto bg-gray-800 rounded-md shadow-md mt-20 z-0">
    <form>
      <div class="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
        <Input
          v-model="project"
          name="projectName"
          label="Project Name"
          placeholder="my_project"
        />
        <VSelect
          name="sourceFiles"
          label="Source Files"
          :model-value="sourceFiles"
          multiple
          taggable
          no-dropdown
          keys
          @update:model-value="newVal => { sourceFiles = newVal }"
        />

        <Input
          v-model="compilerFlags"
          name="compilerFlags"
          label="Compiler Flags"
          placeholder="-Wextra -Wall -Werror"
        />
        <Select
          v-model="compiler"
          name="compiler"
          label="Compiler"
          :options="compilerOptions"
        />

        <Input
          v-model="sourceDir"
          name="sourceDir"
          label="Source Directory"
          placeholder="src"
        />
        <Input
          v-model="objectDir"
          name="objectDir"
          label="Object Directory"
          placeholder="obj"
        />

        <Input
          v-model="includeDir"
          name="includeDir"
          label="Include Directory"
          placeholder="include"
        />
        <Input
          v-model="args"
          name="arguments"
          label="Arguments"
          placeholder="5 500 200 200"
          optional
        />

        <VSelect
          name="libs"
          label="Libraries"
          :options="libsOptions"
          :model-value="libs"
          multiple
          taggable
          keys
          optional
          @update:model-value="newVal => { libs = newVal }"
        />
        <VSelect
          name="dependencies"
          label="Dependencies"
          :model-value="dependencies"
          multiple
          taggable
          no-dropdown
          keys
          optional
          @update:model-value="newVal => { dependencies = newVal }"
        />

        <div class="flex justify-center space-x-12">
          <div class="flex">
            <input
              id="valgrind"
              v-model="valgrind"
              type="checkbox"
              name="valgrind"
              class="mt-1 rounded bg-gray-800"
            >
            <label
              for="valgrind"
              class="ms-3 text-gray-200"
            > Add Valgrind</label>
          </div>

          <div class="flex">
            <input
              id="gdb"
              v-model="gdb"
              type="checkbox"
              name="gdb"
              class="mt-1 rounded bg-gray-800"
            >
            <label
              for="gdb"
              class="ms-3 text-gray-200"
            > Add GDB</label>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <button
          type="submit"
          class="px-6 py-2 leading-5 text-white transition-colors duration-200
                 transform bg-blue-800 rounded-md hover:bg-blue-600"
          @click.prevent="() => generate()"
        >
          Generate
        </button>
      </div>
    </form>
  </section>
  <CodeModal
    v-model="modalIsOpen"
    content=""
  />
</template>

<style scoped>
input[type="checkbox"]:focus {
  outline: none;
  box-shadow: none;
  border-color: #64748b;
}

>>> {
  --vs-dropdown-bg: #0f172a;
  --vs-border-color: #FFFFFF00;
}
</style>