# Zero Blocks -  Infragistics Angular2 Components

Components and supporting directives built with TypeScript and [Angular 2](https://angular.io/) 
including samples and tests. Source files under the `src` folder.

Current list of controls include:

- Basic toggle view framework, touch gestures
- Button, Icon
- Navigation drawer
- List component

## Setup
From the root folder run:

```
npm install
``` 

In case your editor cannot auto-compile the TypeScript files (VS, VS Code, others with plugins) 
there's a configured npm command in place to run the compiler in watch mode:
```
npm start
/// OR
npm run watch
``` 
This will compile all TypeScript files per the `tsconfig.json` setup and continue watching for 
file changes and recompile accordingly. 

## Running samples
The repo doesn't include a server by default - use your preffered. Can be the lite server from the 
[Angular 2 Guide](https://angular.io/docs/ts/latest/quickstart.html#!#package-json) or a simple node server.js
or a virtual directory in IIS pointing to this folder. Either way works by simple opening html files from
the samples folder aftarwards. 

## Contributing
[Coding Guidelines](/Infragistics/zero-blocks/wiki/Coding-guidelines-for-Zero-Blocks)
