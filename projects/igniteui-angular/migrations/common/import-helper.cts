/** Explicit module map, as generic T can't be resolved to a direct string literal via inference */
type ModuleMap = {
  '@angular/compiler': typeof import('@angular/compiler', { with: { "resolution-mode": "import" }});
};

/**
 * Native Node dynamic import helper
 * @remarks
 * NB: Import this via a bare specifier (igniteui-angular/migrations/common/import-helper.cjs)
 * to escape the schematics encapsulation for this file and thus the dynamic import inside.
 * This allows to dynamically import ESM modules from outside the schematics host context.
 */
export function nativeImport<T extends keyof ModuleMap>(name: T): Promise<ModuleMap[T]> {
    return import(name);
};
