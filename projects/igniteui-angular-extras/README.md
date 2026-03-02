## Ignite UI for Angular Extras
This package is part of our private npm feed hosted on https://packages.infragistics.com/npm/js-licensed/. If you are building a commercial product or your license has expired, you will need to [acquire a commercial license](https://www.infragistics.com/how-to-buy/product-pricing). There you will find the latest versions of the Ignite UI for Angular packages.

Use our [public repository](https://github.com/IgniteUI/igniteui-angular) for questions, issues and feature requests.

### Start using Ignite UI Angular Extras

#### Create a project from scratch
1. Execute the following commands
```
npm i -g @igniteui/angular-schematics
ng new <project name> --collection="@igniteui/angular-schematics" --template=<template id>
cd <project name>
ng g @igniteui/angular-schematics:component grid <component name>
npm install igniteui-angular-extras
```

> Note: If your app needs to be updated from trial to licensed package, check out our [official guide](https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/ignite-ui-licensing.html#upgrading-packages-using-our-angular-schematics-or-ignite-ui-cli) on the subject. Use `ng g @igniteui/angular-schematics:upgrade-packages`.


2. After the package is installed go ahead and:

## Updated Usage

### Before Version 19.x

In versions prior to 19.x, Ignite UI for Angular Extras required adding the `IgxExtrasModule` to your `app.module.ts` to enable components and directives. After installing the package, you would include the module in your `app.module.ts` as follows:

- Add the `IgxExtrasModule` to your app.module.ts
- Apply `igxChartIntegration`, `igxConditionalFormatting`, `igxContextMenu` directives to your grid:



```typescript
import { IgxExtrasModule } from 'igniteui-angular-extras';

@NgModule({
  declarations: [ ... ],
  imports: [ IgxExtrasModule, ... ],
  bootstrap: [ ... ]
})
export class AppModule { }
```

```html
<igx-grid #grid1 igxChartIntegration igxConditionalFormatting igxContextMenu
    [autoGenerate]="true" [paging]="true" [data]="localData" >
</igx-grid>
```

### After Version 19.x

Since version 19.x, Ignite UI for Angular Extras has adopted standalone components and directives, removing the need to add `IgxExtrasModule` to your `app.module.ts`. You can now directly import the required components and directives as standalone elements.

```typescript
import { IgxChartIntegrationDirective } from 'igniteui-angular-extras';
import { IgxConditionalFormattingDirective } from 'igniteui-angular-extras';
import { IgxContextMenuDirective } from 'igniteui-angular-extras';
```

```html
<igx-grid #grid1 igxChartIntegration igxConditionalFormatting igxContextMenu
    [autoGenerate]="true" [paging]="true" [data]="localData" >
</igx-grid>
```

3. Execute `npm run start`

### Build

Execute `npm run build:lib` to build the project. The build artifacts will be stored in the `dist/` directory. By default it builds the project with `--prod` flag for a production build.
In order to run the project with a small sample, execute `npm run start`
