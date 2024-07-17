# Ignite UI for Angular Elements

This project uses [Angular elements](https://angular.dev/guide/elements) to expose the Grid components of Ignite UI for Angular as Web Components (custom elements). Those are then used in packages for other products in the Ignite UI lineup - Blazor, React and Web Components.
The basic setup provided by the `@angular/elements` package (component creation, basic inputs and outputs) is mostly reused with some significant modifications and additions to functionality described below.
For the most part, the process is intended to be generic and automatic/with minimal maintenance.

To run the demo page:
```shell
npm run start:elements
```

> Note: This demo relies entirely on a single `index.html` on purpose - avoid adding code in external scripts outside of assets, otherwise those will be bundled in the build output.

To run Elements-specific tests:
```shell
npm run test:elements:watch
```

## Elements Analyzer
The [Elements Analyzer](./src/analyzer/analyzer.ts) uses the [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) to scan components source and build a config with additional metadata needed for extended functionality.

Changes to the components hierarchy or public API might need to be reflected in that config and for that run:
```shell
npm run elements:configure
```
and commit the changes for review. A CI step will will block PRs that produce uncommitted changes.

The leading entry for the Elements Analyzer is the `config.template.ts` which lists the root exported components (currently all Grids and Pivot's Data Selector), though it needs to scan most of the source to discover their possible child components and their own, repeating down the hierarchy. The latter is achieved via the `@igxParent` custom JSDoc tag applied to participating component. For example:
```ts
/**
 * Action Strip provides templatable area for one or more actions.
 *
 * @igxParent IgxGridComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent, IgxRowIslandComponent, *
 */
@Component({ /* ... */ })
export class IgxActionStripComponent { /* ... */ }
```
This marks the Action Strip as a potential child of all Grids, the Row Layout and the `*` is added to indicate it can also be a stand-alone component.

The resulting config is generated in `elements.config.ts` where the single `registerConfig` of type `ComponentConfig[]` is a critical part of the Elements source. It contains information about component hierarchy (parents, queries and provide aliases) as well as any additional properties to expose or ones that require special handling (such as templates) as well as methods.

> Note: Because the internal hierarchy is not reproduced and each leaf component is exposed as a stand-alone custom element, base properties will appear repeated across multiple components. That's expected.

### Analyzer mechanics
The first pass creates a `ts.Program` from all source files to discover all components and creates `AnalyzerComponent` for each. The component instances are responsible for extracting primarily member metadata such as public properties (respecting `@hidden` tags), content queries, methods and so on.

The second pass (`resolve()`) filters the gathered components to ones part of the root exported components or part of their hierarchy. This produces the final output config map.

The last step that config is emitted by the printer, responsible for creating the `registerConfig` config as well as ensuring additional type imports. The printer also formats the output using `prettier`.

## Elements creation & functionality
App initialization (subject to change) is only needed to extract the `Injector` from the setup which is required to create the wrapped components so they can defined as `igc-` elements.

### `create-custom-element.ts`

Custom elements are produced taking the `registerConfig` and passing it to `createIgxCustomElement` which wraps the `createCustomElement` from `@angular/elements` and replaces the default strategy with our customized one (more below).

Also extends the produced class with any additional properties and methods that need to be exposed, since the default handling only exposes inputs.

### `custom-strategy.ts`

Extends the `ComponentNgElementStrategy` into `IgxCustomNgElementStrategy`, emulating a couple of Angular runtime behaviors not provided by default:

- Overrides the initialization process and based on the config looks for the closest parent and tries to re-use its `Injector` for the child component and optionally an anchor `ViewContainerRef` to attach the child component to. This is critical for declarative children to be able to access DI tokens from the parent and function correctly as a whole.

- If the parent(s) have related content queries, schedule updates for those so that parents are correctly notified of the child component. Those are done in batch to avoid multiple children running multiple change detection cycles on the parent.

  > This is one major difference from normal Angular runtime that instantly (well, on `afterContentInit`) resolves children - in this regard in Elements children load after the parent is completely done and any issues with that are usually reproducible by dynamically adding children in Angular runtime.

- Patched the Grid's built-in handling of overlays for templated Ignite UI for Web Components alternatives by capturing those from their open event and hiding them on grid scroll.

Also overrides handling of inputs by providing boolean and numeric coercion to allow native attributes to be assigned as expected.
The last major addition is handling of template inputs, which are exposed as Lit `TemplateResult` normally created through the `html` string tag. Those are passed to a custom template wrapper to allow the Angular instances to use them. More below.

### `ng-element-strategy.ts`

  A copy of the default `ComponentNgElementStrategy` source from `@angular/elements`, since [it was later decided it won't be exported as public API after all](https://github.com/angular/angular/pull/49642). Should only be updated with changes from that source, if any.

### Template wrapper
This component allows the components to work with Lit templates and consists of two main parts:
- `template-ref-wrapper.ts`

  A custom wrapper around the Angular native `TemplateRef<C>` with one main purpose - to expose the entire provided context object as a single `context` property - this enables the template wrapper component to define a generic template for any component and use `let-context` to extract the full object.

  Additionally, it re-exposes the normal `$implicit` as `implicit` for slightly less-ugly DX for other platforms (per-template naming TBD) and adds some identifying props to the context for Blazor bridged (marshalled) scenarios, though those should see little to no use.

- `wrapper.component.ts`

  The `TemplateWrapperComponent` accepts the Lit template functions and creates a `<ng-template>` for each with a `display: contents` container as a target of a call to Lit's render with the context. This allows those to be queried as `TemplateRef` children (wrapped in our custom) that the Angular component instances can use to render templates.

## Library

The `lib` folder contains components specific to Elements. For now that's the `StateComponent` since the Angular directive can't be exposed directly in Elements (no such concept in native DOM), but can include extended versions of other components to allow for API additions or modifications without affecting the main source.

## Themes

Mirroring the themes in Angular, there are `light` and `dark` folder with each preset configured to be shipped with packages as pre-built CSS files.

The main difference is the `elements-theme` mixin defined in `_util.scss` that wraps the internal theme one and uses the `$theme-handler` callback to modify each included component's theme map to achieve the following:
- Rename all selectors that target `igx-` elements to target `igc-` elements as well.
- Replace component theme CSS variable names from the Angular `--igx-component-var` prefix to a WC/cross-plat `--ig-component-var`

## Packaging
An additional `index.js` sits in the source explicit as pure JavaScript file to avoid it being processed by the Angular build that imports the polyfills and main chunks of the build and re-exports. This both provides a single entry and also is used in an additional build step with `esbuild` to bundle the full result for consuming platforms that need it.
