CXX=em++

jsfiles = libminisat.js libminicard.js

r: $(jsfiles)
d: $(jsfiles)

# For why WASM_... even though we're not using WASM: https://github.com/emscripten-core/emscripten/issues/12647
JSFLAGS=--memory-init-file 0 -s WASM=0 -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_RUNTIME_METHODS='["ccall"]' -s EXPORTED_FUNCTIONS='["_malloc", "_free"]' -s MODULARIZE=1 -s WASM_ASYNC_COMPILATION=0 -s EXPORT_NAME='createLib'
r: CFLAGS=-D NDEBUG -O3 --closure 1
d: CFLAGS=-D DEBUG -O0 --closure 0 -s ASSERTIONS=1

SATINC=minisat/
CARDINC=minicard/

minisat_objects = minisat.bc minisat/minisat/core/Solver.bc minisat/minisat/utils/System.bc
libminisat.js: $(minisat_objects)
	$(CXX) $(CFLAGS) $(JSFLAGS) -o $@ $^

minicard_objects = minicard.bc minicard/minicard/Solver.bc minicard/utils/System.bc
libminicard.js: $(minicard_objects)
	$(CXX) $(CFLAGS) $(JSFLAGS) -o $@ $^

minisat.bc: minisat.cpp
	$(CXX) -c $(CFLAGS) -I $(SATINC) -o $@ $^

minicard.bc: minicard.cpp
	$(CXX) -c $(CFLAGS) -I $(CARDINC) -o $@ $^

minisat/%.bc: minisat/%.cc
	$(CXX) -c $(CFLAGS) -I $(SATINC) -o $@ $^

minicard/%.bc: minicard/%.cc
	$(CXX) -c $(CFLAGS) -I $(CARDINC) -o $@ $^

clean:
	rm -f $(jsfiles) $(minisat_objects) $(minicard_objects)

.PHONY: clean
