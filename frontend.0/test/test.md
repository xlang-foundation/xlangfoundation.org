<a href="https://marked.js.org">
  <img width="60px" height="60px" src="https://marked.js.org/img/logo-black.svg" align="right" />
</a>

# Marked

[![npm](https://badgen.net/npm/v/marked)](https://www.npmjs.com/package/marked)
[![gzip size](https://badgen.net/badgesize/gzip/https://cdn.jsdelivr.net/npm/marked/marked.min.js)](https://cdn.jsdelivr.net/npm/marked/marked.min.js)
[![install size](https://badgen.net/packagephobia/install/marked)](https://packagephobia.now.sh/result?p=marked)
[![downloads](https://badgen.net/npm/dt/marked)](https://www.npmjs.com/package/marked)
[![github actions](https://github.com/markedjs/marked/workflows/Tests/badge.svg)](https://github.com/markedjs/marked/actions)
[![snyk](https://snyk.io/test/npm/marked/badge.svg)](https://snyk.io/test/npm/marked)

- ⚡ built for speed
- ⬇️ low-level compiler for parsing markdown without caching or blocking for long periods of time
- ⚖️ light-weight while implementing all markdown features from the supported flavors & specifications
- 🌐 works in a browser, on a server, or from a command line interface (CLI)

## Demo

Checkout the [demo page](https://marked.js.org/demo/) to see marked in action ⛹️

## Docs

Our [documentation pages](https://marked.js.org) are also rendered using marked 💯

Also read about:

* [Options](https://marked.js.org/#/USING_ADVANCED.md)
* [Extensibility](https://marked.js.org/#/USING_PRO.md)

## Compatibility

**Node.js:** Only [current and LTS](https://nodejs.org/en/about/releases/) Node.js versions are supported. End of life Node.js versions may become incompatible with Marked at any point in time.

**Browser:** Not IE11 :)

## Installation

**CLI:** 

```sh 
npm install -g marked
```

**In-browser:** 

```sh
npm install marked
npm install @types/marked # For TypeScript projects
```

## Usage

### Warning: 🚨 Marked does not [sanitize](https://marked.js.org/#/USING_ADVANCED.md#options) the output HTML. Please use a sanitize library, like [DOMPurify](https://github.com/cure53/DOMPurify) (recommended), [sanitize-html](https://github.com/apostrophecms/sanitize-html) or [insane](https://github.com/bevacqua/insane) on the *output* HTML! 🚨

```
DOMPurify.sanitize(marked.parse(`<img src="x" onerror="alert('not happening')">`));
```


**xlang code 1**

```xlang
x =1
def func(x:int,y:int,z:string):
	print(z)
	return x+y
func(10,20,"this is a demo")
```

```bash
# Print all options
$ marked --help
```

**xlang code 2**

```xlang
def xyz(x:int,y:int):
	print(x,y)
	return x+y
xyz(10,20)
```

## License

Copyright (c) 2011-2022, Christopher Jeffrey. (MIT License)
