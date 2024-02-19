<script setup>
import vSelect from 'vue-select'
import {nextTick, ref, watch} from 'vue'
import {useModal} from 'vue-final-modal'
import CodeModal from './CodeModal.vue'
import Alert from "@/components/Alert.vue";
import {useStore} from "vuex";
import {generateMakefile} from "@/makefileGenerator.js";

let project = ref("")
let selectedFiles = ref([])
let compilerFlags = ref("-Wextra -Wall -Werror")
let compiler = ref("clang")
let sourceDir = ref("src")
let objectDir = ref("obj")
let libs = ref([])
let libsOptions = ref(["readline", "pthread", "m", "glfw"])
let dependencies = ref("")
let includeDir = ref("include")
let gdb = ref(false)
let valgrind = ref(false)
let modalIsOpen = ref(false)

project = ref(localStorage.getItem("project") || "");
selectedFiles = ref(JSON.parse(localStorage.getItem("selectedFiles")) || []);
compilerFlags = ref(localStorage.getItem("compilerFlags") || "-Wextra -Wall -Werror");
compiler = ref(localStorage.getItem("compiler") || "clang");
sourceDir = ref(localStorage.getItem("sourceDir") || "src");
objectDir = ref(localStorage.getItem("objectDir") || "obj");
libs = ref(JSON.parse(localStorage.getItem("libs")) || []);
dependencies = ref(localStorage.getItem("dependencies") || "");
includeDir = ref(localStorage.getItem("includeDir") || "include");
gdb = ref(localStorage.getItem("gdb") === "true");
valgrind = ref(localStorage.getItem("valgrind") === "true");

watch(project, (newVal) => localStorage.setItem("project", newVal));
watch(selectedFiles, () => localStorage.setItem("selectedFiles", JSON.stringify(selectedFiles.value)));
watch(compilerFlags, (newVal) => localStorage.setItem("compilerFlags", newVal));
watch(compiler, (newVal) => localStorage.setItem("compiler", newVal));
watch(sourceDir, (newVal) => localStorage.setItem("sourceDir", newVal));
watch(objectDir, (newVal) => localStorage.setItem("objectDir", newVal));
watch(libs, (newVal) => localStorage.setItem("libs", JSON.stringify(newVal)));
watch(dependencies, (newVal) => localStorage.setItem("dependencies", newVal));
watch(includeDir, (newVal) => localStorage.setItem("includeDir", newVal));
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
let dropdownShouldOpen = () => false

function push(e, vm) {
  e.preventDefault()
  if (vm.search.length > 0) {
    vm.search.split(" ").forEach((file) => selectedFiles.value.push(file))
    localStorage.setItem("selectedFiles", JSON.stringify(selectedFiles.value));
    vm.search = ''
    nextTick(() => vm.$forceUpdate())
  }
}

const keyhook = (map, vm) => ({
  ...map,
  13: (e) => push(e, vm),
  32: (e) => push(e, vm),
  9: (e) => push(e, vm),
})

let makefile = ""

function validateFields() {
  const fields = [
    { value: project.value, error: 'Project name is required' },
    { value: selectedFiles.value.length, error: 'At least one source file is required' },
    { value: compiler.value, error: 'Compiler is required' },
    { value: sourceDir.value, error: 'Source directory is required' },
    { value: objectDir.value, error: 'Object directory is required' },
    { value: includeDir.value, error: 'Include directory is required' },
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
  makefile = generateMakefile(project.value, selectedFiles.value, compilerFlags.value, compiler.value, sourceDir.value, objectDir.value, libs.value, includeDir.value, dependencies.value, gdb.value, valgrind.value)
  useModal({
    component: CodeModal,
    attrs: {
      content: makefile
    },
  }).open()
}
</script>

<template>
  <Alert/>
  <section class="max-w-4xl p-6 mx-auto bg-indigo-600 rounded-md shadow-md dark:bg-gray-800 mt-20 z-0">
    <h1 class="text-xl font-bold text-white capitalize dark:text-white">Makefile Generator</h1>
    <form>
      <div class="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
        <div>
          <label class="text-white dark:text-gray-200" for="projectName">Project Name</label>
          <input id="projectName" type="text" v-model="project"
                 class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring">
        </div>

        <div>
          <label class="text-white dark:text-gray-200" for="sourceFiles">Source Files</label>
          <v-select id="sourceFiles" multiple taggable :create-option="file => ({ value: file, label: file })"
                    v-model="selectedFiles"
                    placeholder="file1.cpp, file2.cpp"
                    class="style-chooser block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md dark:bg-gray-800
                    dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring"
                    :dropdown-should-open="dropdownShouldOpen"
                    :map-keydown="keyhook">
          </v-select>
        </div>

        <div>
          <label class="text-white dark:text-gray-200" for="compilerFlags">Compiler Flags</label>
          <input id="compilerFlags" type="text" v-model="compilerFlags"
                 class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring"
                 placeholder="-Wextra -Wall -Werror">
        </div>

        <div>
          <label class="text-white dark:text-gray-200" for="compiler">Compiler</label>
          <select id="compiler" v-model="compiler"
                  class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring">
            <option>clang</option>
            <option>gcc</option>
            <option>clang++</option>
            <option>g++</option>
          </select>
        </div>

        <div>
          <label class="text-white dark:text-gray-200" for="sourceDir">Source Directory</label>
          <input id="sourceDir" type="text" v-model="sourceDir"
                 class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring"
                 placeholder="src">
        </div>

        <div>
          <label class="text-white dark:text-gray-200" for="objectDir">Object Directory</label>
          <input id="objectDir" type="text" v-model="objectDir"
                 class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring"
                 placeholder="obj">
        </div>

        <div>
          <label class="text-white dark:text-gray-200" for="sourceFiles">Libraries</label>
          <v-select id="sourceFiles" multiple taggable
                    :options="libsOptions"
                    v-model="libs"
                    class="style-chooser block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md dark:bg-gray-800
                    dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring"
                    >
          </v-select>
        </div>

        <div>
          <label class="text-white dark:text-gray-200" for="includeDir">Include Directory</label>
          <input id="includeDir" type="text" v-model="includeDir"
                 class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring"
                 placeholder="include">
        </div>

        <div>
          <label class="text-white dark:text-gray-200" for="dependencies">Dependencies</label>
          <input id="dependencies" type="text" v-model="dependencies"
                 class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring"
                 placeholder="libft mlx">
        </div>

        <div class="flex justify-evenly">
          <div class="flex">
            <input type="checkbox" id="valgrind" name="valgrind" v-model="valgrind" class="mt-1 rounded bg-gray-800">
            <label for="valgrind" class="ms-3 text-white dark:text-gray-200"> Add Valgrind</label>
          </div>

          <div class="flex">
            <input type="checkbox" id="gdb" name="gdb" v-model="gdb" class="mt-1 rounded bg-gray-800">
            <label for="gdb" class="ms-3 text-white dark:text-gray-200"> Add GDB</label>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <button type="submit"
                @click.prevent="() => generate()"
                class="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-blue-800 rounded-md hover:bg-blue-600">
          Generate
        </button>
      </div>
    </form>
  </section>
  <CodeModal v-model="modalIsOpen" content="">
  </CodeModal>
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