# Ignite UI for Angular — `ng update` Migrations

This directory hosts the migration schematics that run when consumers execute
`ng update igniteui-angular`. Each `update-*` folder is a versioned migration
listed in [`migration-collection.json`](./migration-collection.json) and
implemented in `update-*/index.ts`. Shared helpers live in
[`common/`](./common).

See [Wiki pages under Migrations & Schematics](https://github.com/IgniteUI/igniteui-angular/wiki#migrations--schematics)
for authoring and testing guidance. 

## Encapsulation and external ESM like `@angular/compiler`
The collection has `"encapsulation": true` so every
migration is loaded in its own isolated VM context by the Angular
schematics tooling. That also restricts some API access/functionality.

See the description of [#13712 — fix(migrations,ng-add): turn on encapsulation for devkit/schematics deps](https://github.com/IgniteUI/igniteui-angular/pull/13712) when encapsulation was first enabled for mechanism details.

### Dynamic `@angular/compiler` import via `nativeImport`

`@angular/compiler` is an ES module. The migrations themselves are emitted and consumed
(`require()`-d) by the Angular schematics as CommonJS, so they cannot statically `import` it;
they have to use a runtime dynamic `import()`.

- [`common/import-helper.cts`](./common/import-helper.cts) — authored as
  a TypeScript CJS module. The dynamic `import()` is preserved in the emitted.
- Migrations call it via:
  ```ts
  import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.cjs';
  // ...
  const { HtmlParser } = await nativeImport('@angular/compiler');
  ```

### Why the bare `igniteui-angular/...` specifier

Schematics encapsulation being a VM execution is affected by the
[Support of dynamic import() in compilation APIs](https://nodejs.org/api/vm.html#support-of-dynamic-import-in-compilation-apis)
and at this time Angular schematics do not implement [importModuleDynamically](https://github.com/angular/angular-cli/blob/e5eb3e37c9756669b3b91b5b681a73cc9b616cb9/packages/angular/cli/src/command-builder/utilities/schematic-engine-host.ts#L50).

A **bare package specifier** effectively passes through the schematics host encapsulation again and escapes [the relative wrapping ](https://github.com/angular/angular-cli/blob/e5eb3e37c9756669b3b91b5b681a73cc9b616cb9/packages/angular/cli/src/command-builder/utilities/schematic-engine-host.ts#L177-L178) out into [the original schematic require](https://github.com/angular/angular-cli/blob/e5eb3e37c9756669b3b91b5b681a73cc9b616cb9/packages/angular/cli/src/command-builder/utilities/schematic-engine-host.ts#L203-L204).
This means just the `import-helper.cjs` script is ran outside of encapsulation and as such can perform dynamic imports.

Every migration that needs `@angular/compiler` follows the same pattern.

To keep TypeScript happy with the bare specifier at compile time,
[`tsconfig.json`](./tsconfig.json) maps it back to the source:

```jsonc
"paths": {
    "igniteui-angular/*": ["../*"],
    "@infragistics/igniteui-angular/*": ["../*"]
}
```

At consumer install time the specifier resolves naturally through their
`node_modules/igniteui-angular/migrations/common/import-helper.cjs`.

### Tests setup for the bare specifier

`npm run test:schematics` compiles the migrations with
[`tsconfig.spec.json`](./tsconfig.spec.json) into `dist/igniteui-angular/...`
and runs the compiled `*.spec.js` files through Jasmine. In this repo there is
no `node_modules/igniteui-angular` (the library is the workspace itself), so
the bare `igniteui-angular/migrations/common/import-helper.cjs` specifier
would not resolve at runtime.

[`tsconfig-paths-bootstrap.js`](./tsconfig-paths-bootstrap.js) fixes that. It
is loaded with `node --require` before Jasmine starts and installs a runtime
path map (via the `tsconfig-paths` package) that points
`igniteui-angular/*` at `./dist/igniteui-angular/*`.

The wiring in [`package.json`](../../../package.json) looks like:

```text
node -r ./projects/igniteui-angular/migrations/tsconfig-paths-bootstrap.js \
     ./node_modules/jasmine/bin/jasmine.js \
     "dist/igniteui-angular/migrations/**/*.spec.js" \
     "dist/igniteui-angular/schematics/**/*.spec.js"
```
