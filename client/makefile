STYLFILES := $(wildcard styl/*.styl)
JSFILES := $(wildcard js/*.js)

.PHONY: all depend clean

all: main.css bundle.js

clean:
	rm -rf css/ bundle.js main.css

depend:
	npm install

main.css: $(STYLFILES)
	mkdir -p css/
	stylus -o css/ styl/
	cat css/* >main.css
	rm -r css/

bundle.js: $(JSFILES)
	browserify -t babelify js/index.js -o bundle.js
