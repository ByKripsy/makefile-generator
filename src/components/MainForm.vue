<script setup>
import vSelect from 'vue-select'
import {nextTick, ref, watch} from 'vue'
import {useModal} from 'vue-final-modal'
import CodeModal from './CodeModal.vue'
import Alert from "@/components/Alert.vue";

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
    vm.search.split(" ").forEach((file) => {
      selectedFiles.value.push(file)
    })
    console.log(selectedFiles.value)
    vm.search = ''
    nextTick(() => {
      vm.$forceUpdate()
    })
  }
}

const keyhook = (map, vm) => ({
  ...map,
  32: (e) => push(e, vm),
  9: (e) => push(e, vm),
})

let makefile = ref("")

function generateMakefile() {
  makefile.value = `NAME\t:= ${project.value}\n`
  makefile.value += `\n`
  makefile.value += `SRC_DIR\t:= ${sourceDir.value}\n`
  makefile.value += `OBJ_DIR\t:= ${objectDir.value}\n`
  if (dependencies.value) {
    for (let dep of dependencies.value.split(" ")) {
      makefile.value += `${dep.toUpperCase()}_D\t:= ${dep}\n`
    }
  }
  makefile.value += `\n`
  makefile.value += `CC\t\t:= ${compiler.value}\n`
  makefile.value += `CFLAGS\t:= ${compilerFlags.value}\n`
  makefile.value += `\n`
  makefile.value += `INCLUDE\t:= -I ${includeDir.value}`
  if (libs.value[0]) {
    makefile.value += `\nLDFLAGS\t:=`
    for (let lib of libs.value) {
      makefile.value += ` -l${lib}`
    }
  }
  if (dependencies.value) {
    for (let dep of dependencies.value.split(" ")) {
      makefile.value += ` -I $(${dep.toUpperCase()}_D)/include`
    }
    makefile.value += `\nLDLIBS\t:=`
    for (let dep of dependencies.value.split(" ")) {
      makefile.value += ` $(${dep.toUpperCase()}_D)/${dep}.a`
    }
  }
  makefile.value += `\n`
  makefile.value += `\n`
  makefile.value += `SRC\t\t:= ${selectedFiles.value.join(" ")}\n`
  makefile.value += `OBJ\t\t:= $(SRC:%.c=$(OBJ_DIR)/%.o)\n`
  makefile.value += `\n`
  makefile.value += `GREEN\t:= \\033[1;32m\n`
  makefile.value += `\n`
  makefile.value += `all: $(NAME)\n`
  makefile.value += `\n`
  makefile.value += `$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c\n`
  makefile.value += `\t@mkdir -p $(OBJ_DIR)\n`
  makefile.value += `\t@$(CC) $(CFLAGS) -o $@ -c $< && printf \"$(GREEN)✔️ $(notdir $<)[0m compiled\\n\"\n`
  makefile.value += `\n`
  makefile.value += `$(NAME): $(OBJ)\n`
  makefile.value += `\t@$(CC) $(OBJ) -o $(NAME) $(LDFLAGS) $(LDLIBS) && printf \"$(GREEN)✔️ $(NAME)[0m compiled\\n\"\n`
  makefile.value += `\n`
  makefile.value += `run: $(NAME)\n`
  makefile.value += `\t@./$(NAME)\n`
  makefile.value += `\n`
  makefile.value += `clean:\n`
  makefile.value += `\t@rm -rf $(OBJ_DIR)\n`
  makefile.value += `\n`
  makefile.value += `fclean: clean\n`
  makefile.value += `\t@rm -f $(NAME)\n`
  makefile.value += `\n`
  makefile.value += `re: clean all\n`
  makefile.value += `\n`
  if (valgrind.value) {
    makefile.value += `valgrind: $(NAME)\n`
    makefile.value += `\t@valgrind  --show-leak-kinds=all --leak-check=full --track-origins=yes ./$(NAME)\n`
    makefile.value += `\n`
  }
  if (gdb.value) {
    makefile.value += `gdb: $(NAME)\n`
    makefile.value += `\t@gdb ./$(NAME)\n`
    makefile.value += `\n`
  }
  makefile.value += `.PHONY: all clean fclean re run`
  if (valgrind.value)
    makefile.value += ` valgrind`
  if (gdb.value)
    makefile.value += ` gdb`
  makefile.value += `\n`
}

const {open} = useModal({
  component: CodeModal,
  attrs: {
    content: makefile
  },
})

function generate() {
  generateMakefile()
  open()
}
</script>

<template>
  <Alert />
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
                    placeholder="file1.cpp,file2.cpp"
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

<!--        <div>-->
<!--          <label class="text-white dark:text-gray-200" for="dependencies">Libraries</label>-->
<!--          <input id="dependencies" type="text" v-model="libs"-->
<!--                 class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring"-->
<!--                 placeholder="-lpthread -lm -lglfw">-->
<!--        </div>-->
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

        <div class="grid grid-cols-2 gap-4">
          <div>
            <input type="checkbox" id="valgrind" name="valgrind" v-model="valgrind">
            <label for="valgrind" class="text-white dark:text-gray-200"> Add Valgrind</label>
          </div>

          <div>
            <input type="checkbox" id="gdb" name="gdb" v-model="gdb">
            <label for="gdb" class="text-white dark:text-gray-200"> Add GDB</label>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <button type="submit"
                @click.prevent="() => generate()"
                class="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700 focus:outline-none focus:bg-gray-600">
          Generate
        </button>
      </div>
    </form>
  </section>
  <CodeModal v-model="modalIsOpen" content="">
  </CodeModal>
</template>

<style scoped>
>>> {
  --vs-dropdown-bg: #0f172a;
  --vs-border-color: #FFFFFF00;
}
</style>