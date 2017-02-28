# Ignite UI JS Blocks -  Infragistics Angular2 Components

[![Build Status](https://travis-ci.org/IgniteUI/igniteui-js-blocks.svg?branch=master)](https://travis-ci.org/IgniteUI/igniteui-js-blocks)
[![Coverage Status](https://coveralls.io/repos/github/IgniteUI/igniteui-js-blocks/badge.svg?branch=master)](https://coveralls.io/github/IgniteUI/igniteui-js-blocks?branch=master)
[![NPM version](https://img.shields.io/npm/v/igniteui-js-blocks.svg?style=flat)](https://www.npmjs.com/package/igniteui-js-blocks)

**Note:** as of January 3rd 2017 the license for this project has changed from MIT to Apache 2.0. For more information about these licenses please click [here](http://choosealicense.com/licenses/)

Components and supporting directives built with TypeScript and [Angular 2](https://angular.io/)
including samples and tests. Source files under the `src` folder.

Current list of controls include:

| *Components*          | Status              | Docs                                                                                            |     | *Directives*  | Status        | Docs                                                                                                  |
| :-:                   | :-:                 | :-:                                                                                             | :-: | :-:           | :-:           | :-:                                                                                                   |
| **avatar**            |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/avatar/README.md)       |     | **button**    |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/button/README.md)             |
| **badge**             |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/badge/README.md)        |     | **filter**    |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/directives/README-FILTER.md)  |
| **carousel**          |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/carousel/README.md)     |     | **ripple**    |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/directives/README-RIPPLE.md)  |
| **list**              |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/list/README.md)         |     | **input**     |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/input/README.md)              |
| **navbar**            |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/navbar/README.md)       |     | **label**     |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/label/README.md)              |
| **tabbar**            |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/tabbar/README.md)       |     | **layout**    |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/layout/README.md)             |
| **dialog**            |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/dialog/README.md)       |     |               |               |                                                                                                       |
| **snackbar**          |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/snackbar/README.md)     |     |               |               |                                                                                                       |
| **toast**             |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/toast/README.md)     |     |               |               |                                                                                                       |
| **navigation drawer** |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/navdrawer/README.md)    |     |               |               |                                                                                                       |
| **radio**             |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/radio/README.md)        |     |               |               |                                                                                                       |
| **checkbox**          |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/checkbox/README.md)     |     |               |               |                                                                                                       |
| **switch**            |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/switch/README.md)       |     |               |               |                                                                                                       |
| **scroll**            |             Planned | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/scroll/README.md)       |     |               |               |                                                                                                       |
| **linear progress**    |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/progressbar/README.md)  |     |               |               |                                                                                                       |
| **circular progress** |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/progressbar/README.md)  |     |               |               |                                                                                                       |
| **icon**              |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/tree/master/src/icon/README.md)         |     |               |               |                                                                                                       |
| **card**              |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/card/README.md)         |     |               |               |                                                                                                       |
| **grid**              |           Planned | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/README.md)         |     |               |               |                                                                                                       |
| **range**              |           In development | Not available         |     |               |               |                                                                                                       |
| **buttonGroup**              |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/buttonGroup/README.md)      |               |               |                                                                                                       |
## Setup
From the root folder run:

```
npm install
```

Demos can be run using either the [lite server](https://github.com/johnpapa/lite-server):
```
npm start
```
or by pointing a server of your choosing to the root directory of the repo (e.g. Virtual Directory in IIS pointing to this folder).
Either way works by simply opening html files from the samples folder (`samples/index.html`) afterwards.
The start script will also build and watch TypeScript files. For other options use the commands below.

## Build

In case your editor cannot auto-compile the TypeScript files (VS, VS Code, others with plugins)
there's a configured npm command in place to run the compiler:
```
npm run build
/// OR in watch mode
npm run watch
```
This will compile all TypeScript files per the `tsconfig.json` setup and optionally continue watching for
file changes and recompile accordingly.

## NPM Package

You can include Ignite UI JS Blocks in your project as a depencency using the NPM package.

`npm install igniteui-js-blocks --save-dev`

## Contributing
[Coding Guidelines](../../wiki//Coding-guidelines-for-Ignite-UI-JS-Blocks)

[General Naming Guidelines](../../wiki//General-Naming-Guidelines-for-Ignite-UI-JS-Blocks)

## Demo App
[Warehouse Picklist App] (https://github.com/IgniteUI/warehouse-js-blocks)
