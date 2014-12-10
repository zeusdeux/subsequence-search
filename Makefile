# folders
SRC        = ./src
TEST       = ./test
BUILD      = ./build
BIN        = $(NODEMOD)/.bin
NODEMOD    = ./node_modules
TRANSFORMS = $(SRC)/transforms

# files
MAIN       = $(SRC)/index.js
MAPFILE    = subsequence-search.min.map

all: jshint test $(BUILD)/subsequence-search.min.js

force: $(BUILD)/subsequence-search.min.js

jshint:
	$(BIN)/jshint $(SRC)/*.js

test:
	$(BIN)/mocha -r should -u bdd -b $(TEST)/*

$(BUILD)/subsequence-search.min.js: $(BUILD)/subsequence-search.js
	$(BIN)/uglifyjs $^ \
  -o $@ \
  -c -m \
  --source-map $(BUILD)/$(MAPFILE) \
  --source-map-root ../../ \
  --source-map-url ./$(MAPFILE) \
  --comments \
  --stats

$(BUILD)/subsequence-search.js: $(SRC)/* $(NODEMOD)/auto-curry/index.js
	$(BIN)/browserify -s subsequenceSearch -e $(MAIN) -o $@

clean:
	rm -f $(BUILD)/*

.PHONY: all jshint test clean
