STYLFILES := $(wildcard styl/*.styl)
JSFILES := $(wildcard js/*.js)

STYLUS := node_modules/stylus/bin/stylus
BROWSERIFY := node_modules/browserify/bin/cmd.js

.PHONY: all depend clean

all: main.css bundle.js

clean:
	rm -rf css/ bundle.js main.css

depend:
	npm install

main.css: $(STYLFILES)
	mkdir -p css/
	$(STYLUS) -o css/ styl/
	cat css/* >main.css
	rm -r css/

bundle.js: $(JSFILES)
	$(BROWSERIFY) -t babelify js/index.js -o bundle.js_
	mv bundle.js_ bundle.js
