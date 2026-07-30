/**
 * Test-time bootstrap. Registered via `node --require` before jasmine runs so
 * the `igniteui-angular/...` bare specifier used by migrations (to escape the
 * schematic encapsulation for the dynamic import helper) resolves against the
 * built migrations in dist instead of `node_modules` (which has no
 * igniteui-angular install in this repo).
 *
 * The compile-time path map in ./tsconfig.json points at the sources under
 * ../*; at runtime we point at the compiled output under
 * <repo>/dist/igniteui-angular/* so the require resolves to the emitted .cjs.
 */
const path = require("path");
const tsConfigPaths = require("tsconfig-paths");

const distRoot = path.resolve(__dirname, "../../../dist/igniteui-angular");

tsConfigPaths.register({
    baseUrl: distRoot,
    paths: {
        "igniteui-angular/*": ["./*"],
        "@infragistics/igniteui-angular/*": ["./*"],
    },
});
