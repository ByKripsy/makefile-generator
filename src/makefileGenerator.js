export function generateMakefile(project, selectedFiles, compilerFlags, compiler, sourceDir, objectDir, libs, includeDir, dependencies, args, valgrind, gdb) {
    let makefile = '';
    makefile += `NAME\t:= ${project}\n`
    makefile += `\n`
    makefile += `SRC_DIR\t:= ${sourceDir}\n`
    makefile += `OBJ_DIR\t:= ${objectDir}\n`
    if (dependencies[0]) {
        for (let dep of dependencies) {
            makefile += `${dep.toUpperCase()}_D\t:= ${dep}\n`
        }
    }
    makefile += `\n`
    makefile += `CC\t\t:= ${compiler}\n`
    makefile += `CFLAGS\t:= ${compilerFlags}\n`
    makefile += `\n`
    makefile += `INCLUDE\t:= -I ${includeDir}`
    if (dependencies[0]) {
        for (let dep of dependencies) {
            makefile += ` -I $(${dep.toUpperCase()}_D)/include`
        }
    }
    if (libs[0]) {
        makefile += `\nLDFLAGS\t:=`
        for (let lib of libs) {
            makefile += ` -l${lib}`
        }
    }
    if (dependencies[0]) {
        makefile += `\nLDLIBS\t:=`
        for (let dep of dependencies) {
            // makefile += ` $(${dep.toUpperCase()}_D)/${dep}.a`
            makefile += ` -L $(${dep.toUpperCase()}_D) -l${dep}`
        }
    }
    makefile += `\n`
    makefile += `\n`
    makefile += `SRC\t\t:= ${selectedFiles.join(" ")}\n`
    makefile += `OBJ\t\t:= $(SRC:%.c=$(OBJ_DIR)/%.o)\n`
    makefile += `\n`
    if (args) {
        makefile += `ARGS\t:= ${args}\n`
    }
    makefile += `GREEN\t:= \\033[1;32m\n`
    makefile += `NC\t\t:= \\033[0m\n`
    makefile += `\n`
    makefile += `all: $(NAME)\n`
    makefile += `\n`
    makefile += `$(NAME): $(OBJ)\n`
    makefile += `\t@$(CC) $(OBJ) -o $(NAME)`
    if (libs[0]) {
        makefile += ` $(LDFLAGS)`
    }
    if (dependencies[0]) {
        makefile += ` $(LDLIBS)`
    }
    makefile += ` && printf \"$(GREEN)✔️ $(NAME)$(NC) compiled\\n\"\n`
    makefile += `\n`
    makefile += `$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c\n`
    makefile += `\t@mkdir -p $(OBJ_DIR)\n`
    makefile += `\t@$(CC) $(CFLAGS) -o $@ -c $< && printf \"$(GREEN)✔️ $(notdir $<)$(NC) compiled\\n\"\n`
    makefile += `\n`
    makefile += `run: $(NAME)\n`
    makefile += `\t@./$(NAME)`
    if (args) {
        makefile += ` $(ARGS)`
    }
    makefile += `\n\n`
    makefile += `clean:\n`
    makefile += `\t@rm -rf $(OBJ_DIR)\n`
    makefile += `\n`
    makefile += `fclean: clean\n`
    makefile += `\t@rm -f $(NAME)\n`
    makefile += `\n`
    makefile += `re: clean all\n`
    makefile += `\n`
    if (valgrind) {
        makefile += `valgrind: $(NAME)\n`
        makefile += `\t@valgrind  --show-leak-kinds=all --leak-check=full --track-origins=yes ./$(NAME)`
        if (args) {
            makefile += ` $(ARGS)`
        }
        makefile += `\n\n`
    }
    if (gdb) {
        makefile += `gdb: $(NAME)\n`
        makefile += `\t@gdb ./$(NAME)`
        if (args) {
            makefile += ` -ex 'start $(ARGS)'`
        }
        makefile += `\n\n`
    }
    makefile += `.PHONY: all clean fclean re run`
    if (valgrind) {
        makefile += ` valgrind`
    }
    if (gdb) {
        makefile += ` gdb`
    }
    makefile += `\n#──────────────────────────────────────`
    makefile += `\n#   ✨  Generated on bykripsy.live     `
    makefile += `\n#──────────────────────────────────────`
    return makefile;
}
