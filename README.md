[![apm](https://img.shields.io/apm/l/build-makensis.svg?style=flat-square)](https://atom.io/packages/build-makensis)
[![apm](https://img.shields.io/apm/v/build-makensis.svg?style=flat-square)](https://atom.io/packages/build-makensis)
[![apm](https://img.shields.io/apm/dm/build-makensis.svg?style=flat-square)](https://atom.io/packages/build-makensis)
[![Travis](https://img.shields.io/travis/idleberg/atom-build-makensis.svg?style=flat-square)](https://travis-ci.org/idleberg/atom-build-makensis)
[![David](https://img.shields.io/david/dev/idleberg/atom-build-makensis.svg?style=flat-square)](https://david-dm.org/idleberg/atom-build-makensis#info=dependencies)
[![Gitter](https://img.shields.io/badge/chat-Gitter-ff69b4.svg?style=flat-square)](https://gitter.im/NSIS-Dev/Atom)

# build-makensis

[Atom Build](https://atombuild.github.io/) provider for makensis, compiles [NSIS](https://nsis.sourceforge.net).

If you're preferred NSIS version is not available on your non-Windows platform, have a look at the separate [build-makensis-wine](https://atom.io/packages/build-makensis-wine) package.

## Installation

### apm

* Install package `apm install build-makensis` (or use the GUI)

### GitHub

1. Change directory `cd ~/.atom/packages/`
2. Clone repository `git clone https://github.com/idleberg/atom-build-makensis build-makensis`

## Usage

### Build

Before you can build, select an active target with your preferred build option.

Available targets:

* `makensis` — compile *as-is* (<kbd>Super</kbd>+<kbd>Alt</kbd>+<kbd>B</kbd>)
* `makensis /WX` – compile and stop at warnings (<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>Super</kbd>+<kbd>B</kbd>)

### Shortcuts

Here's a reminder of the default shortcuts you can use with this package:

**Select active target**

<kbd>Super</kbd>+<kbd>Alt</kbd>+<kbd>T</kbd> or <kbd>F7</kbd>

**Build script**

<kbd>Super</kbd>+<kbd>Alt</kbd>+<kbd>B</kbd> or <kbd>F9</kbd>

**Jump to error**

<kbd>Super</kbd>+<kbd>Alt</kbd>+<kbd>G</kbd> or <kbd>F4</kbd>

**Toggle build panel**

<kbd>Super</kbd>+<kbd>Alt</kbd>+<kbd>V</kbd> or <kbd>F8</kbd>

## License

This work is licensed under the [The MIT License](LICENSE.md).

## Donate

You are welcome support this project using [Flattr](https://flattr.com/submit/auto?user_id=idleberg&url=https://github.com/idleberg/atom-build-makensis) or Bitcoin `17CXJuPsmhuTzFV2k4RKYwpEHVjskJktRd`