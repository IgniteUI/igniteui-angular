# Ignite UI JS Blocks -  Infragistics Angular2 Components

[![Build Status](https://travis-ci.org/IgniteUI/igniteui-js-blocks.svg?branch=master)](https://travis-ci.org/IgniteUI/igniteui-js-blocks)
[![Coverage Status](https://coveralls.io/repos/github/IgniteUI/igniteui-js-blocks/badge.svg?branch=master)](https://coveralls.io/github/IgniteUI/igniteui-js-blocks?branch=master)
[![NPM version](https://img.shields.io/npm/v/zero-blocks.svg?style=flat)](https://www.npmjs.com/package/zero-blocks)

Components and supporting directives built with TypeScript and [Angular 2](https://angular.io/)
including samples and tests. Source files under the `src` folder.

Current list of controls include:

| *Components*          | Status              | Docs                                                     |     | *Directives*          | Status        | Docs                                                      |
| :-:                   | :-:                 | :-:                                                      | :-: | :-:                   | :-:           | :-:                                                       |
| **avatar**            |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks) |     | **button**            |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks)  |
| **badge**             |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks) |     | **filter**            |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks)  |
| **carousel**          |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks) |     | **ripple**            |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks)  |
| **list**              |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks) |     | **input**             |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks)  |
| **navbar**            |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks) |     | **label**             |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks)  |
| **tabbar**            |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks) |     | **layout**            |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks)  |
| **dialog**            |     Initial version | [Readme](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/modal/README.md) |     | **icon**              |     Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks)  |
| **navigation drawer** |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks) |     |                       |               |                                                           |
| **radio**             |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks) |     |                       |               |                                                           |
| **checkbox**          |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks) |     |                       |               |                                                           |
| **switch**            |           Available | [Readme](https://github.com/IgniteUI/igniteui-js-blocks) |     |                       |               |                                                           |
| **scroll**            |             Planned | [Readme](https://github.com/IgniteUI/igniteui-js-blocks) |     |                       |               |                                                           |

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
[Coding Guidelines](../../wiki/Coding-guidelines-for-Zero-Blocks)

## Demo App
[Warehouse Picklist App] (https://github.com/IgniteUI/warehouse-js-blocks)