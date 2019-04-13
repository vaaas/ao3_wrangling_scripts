all: build $(patsubst ./%.js,build/%.js,$(wildcard ./*js))

build:
	mkdir build/

build/%.js: %.js
	echo -n "javascript:" > "$@"
	terser -m -- "$<" >> "$@"
