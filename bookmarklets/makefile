all: build $(patsubst ./%.js,build/%.js,$(wildcard ./*js))

build:
	mkdir -p build/

build/%.js: %.js
	echo -n "javascript:" > "$@"
	terser -m -c unsafe,toplevel -- "$<" >> "$@"
