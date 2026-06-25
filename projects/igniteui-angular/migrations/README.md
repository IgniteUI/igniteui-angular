# Ignite UI for Angular — `ng update` Migrations

This directory hosts the migration schematics that run when consumers execute
`ng update igniteui-angular`. Each `update-*` folder is a versioned migration
listed in [`migration-collection.json`](./migration-collection.json) and
implemented in `update-*/index.ts`. Shared helpers live in
[`common/`](./common). The collection has `"encapsulation": true` so every
migration is loaded in its own isolated CommonJS context by the Angular
schematics tooling.

## Dynamic `@angular/compiler` import via `nativeImport`

`@angular/compiler` is an ES module. The migrations themselves are emitted as
CommonJS, so they cannot statically `import` it; they have to use a runtime
dynamic `import()`. To avoid TypeScript downleveling that dynamic call into a
synchronous `require()` (which would crash on an ESM target), the call is
routed through a tiny `.cjs` helper:

- [`common/import-helper.cts`](./common/import-helper.cts) — authored as
  a TypeScript CJS module. The dynamic `import()` is preserved in the emitted
  [`common/import-helper.cjs`](./common/import-helper.cjs) because the file's
  forced `.cjs` extension prevents the compiler from rewriting it.
- Migrations call it via:
  ```ts
  import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.cjs';
  // ...
  const { HtmlParser } = await nativeImport<typeof import('@angular/compiler')>(
      '@angular/compiler'
  );
  ```

### Why the bare `igniteui-angular/...` specifier

Schematics encapsulation (`"encapsulation": true` in
[`migration-collection.json`](./migration-collection.json)) wraps every
migration in a sandboxed module loader. Relative requires (`../common/...`)
go through that wrapper and the dynamic `import()` ends up being intercepted
and converted by the wrapper, defeating the purpose of the helper. A **bare
package specifier** bypasses the wrapper because the wrapper only encapsulates
the migration's own files, not requires that resolve to a real package.

This is the trick PR
[#13712 — fix(migrations,ng-add): turn on encapsulation for devkit/schematics deps](https://github.com/IgniteUI/igniteui-angular/pull/13712)
introduced when encapsulation was first enabled. Every migration that needs
`@angular/compiler` follows the same pattern.

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

## Running migration tests locally

`npm run test:schematics` compiles the migrations with
[`tsconfig.spec.json`](./tsconfig.spec.json) into `dist/igniteui-angular/...`
and runs the compiled `*.spec.js` files through Jasmine. In this repo there is
no `node_modules/igniteui-angular` (the library is the workspace itself), so
the bare `igniteui-angular/migrations/common/import-helper.cjs` specifier
would not resolve at runtime.

[`tsconfig-paths-bootstrap.js`](./tsconfig-paths-bootstrap.js) fixes that. It
is loaded with `node --require` before Jasmine starts and installs a runtime
path map (via the `tsconfig-paths` package) that points
`igniteui-angular/*` at `dist/igniteui-angular/*`. The bootstrap deliberately
does **not** read [`tsconfig.json`](./tsconfig.json) because:

- the compile-time map targets source under `../*` (i.e. `.ts` / `.cts`),
  which Jasmine cannot execute;
- the runtime map must point at the compiled output in `dist/`.

The wiring in [`package.json`](../../../package.json) looks like:

```text
node -r ./projects/igniteui-angular/migrations/tsconfig-paths-bootstrap.js \
     ./node_modules/jasmine/bin/jasmine.js \
     "dist/igniteui-angular/migrations/**/*.spec.js" \
     "dist/igniteui-angular/schematics/**/*.spec.js"
```

This setup is internal to the repo's test runner; published migrations are
unaffected and rely on the consumer's regular `node_modules` resolution.
