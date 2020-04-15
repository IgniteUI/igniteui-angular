## Ignite UI for Angular Extras

### Start using IgniteUI for Angular Extras

#### Create a project from scratch
```
npm i -g @igniteui/angular-schematics
ng new <project name> --collection="@igniteui/angular-schematics" --template=<template id>
cd <project name>
ng g @igniteui/angular-schematics:component grid <component name>
npm install @infragistics/igniteui-angular-extras
ng g @igniteui/angular-schematics:start
```

#### Adding IgniteUI for Angular Extras to Existing Project

Including the `igniteui-angular-extras` and `igniteui-cli` packages to your project:

```
ng add igniteui-angular-extras
```

* [Available templates](https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/cli-overview.html#add-template)

### Build

Run `build:extras:lib` to build the project. The build artifacts will be stored in the `dist/` directory. By default it builds the project with `--prod` flag for a production build.