/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Used to load ng module factories.
 *
 */
var /**
 * Used to load ng module factories.
 *
 */
NgModuleFactoryLoader = /** @class */ (function () {
    function NgModuleFactoryLoader() {
    }
    return NgModuleFactoryLoader;
}());
/**
 * Used to load ng module factories.
 *
 */
export { NgModuleFactoryLoader };
var moduleFactories = new Map();
/**
 * Registers a loaded module. Should only be called from generated NgModuleFactory code.
 * @experimental
 */
export function registerModuleFactory(id, factory) {
    var existing = moduleFactories.get(id);
    if (existing) {
        throw new Error("Duplicate module registered for " + id + " - " + existing.moduleType.name + " vs " + factory.moduleType.name);
    }
    moduleFactories.set(id, factory);
}
export function clearModulesForTest() {
    moduleFactories = new Map();
}
/**
 * Returns the NgModuleFactory with the given id, if it exists and has been loaded.
 * Factories for modules that do not specify an `id` cannot be retrieved. Throws if the module
 * cannot be found.
 * @experimental
 */
export function getModuleFactory(id) {
    var factory = moduleFactories.get(id);
    if (!factory)
        throw new Error("No module with ID " + id + " loaded");
    return factory;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kdWxlX2ZhY3RvcnlfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvbGlua2VyL25nX21vZHVsZV9mYWN0b3J5X2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWNBOzs7O0FBQUE7OztnQ0FkQTtJQWdCQyxDQUFBOzs7OztBQUZELGlDQUVDO0FBRUQsSUFBSSxlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQWdDLENBQUM7Ozs7O0FBTTlELE1BQU0sZ0NBQWdDLEVBQVUsRUFBRSxPQUE2QjtJQUM3RSxJQUFNLFFBQVEsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDYixNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFtQyxFQUFFLFdBQy9CLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxZQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBTSxDQUFDLENBQUM7S0FDakY7SUFDRCxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztDQUNsQztBQUVELE1BQU07SUFDSixlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQWdDLENBQUM7Q0FDM0Q7Ozs7Ozs7QUFRRCxNQUFNLDJCQUEyQixFQUFVO0lBQ3pDLElBQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFBQyxNQUFNLElBQUksS0FBSyxDQUFDLHVCQUFxQixFQUFFLFlBQVMsQ0FBQyxDQUFDO0lBQ2hFLE1BQU0sQ0FBQyxPQUFPLENBQUM7Q0FDaEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGVGYWN0b3J5fSBmcm9tICcuL25nX21vZHVsZV9mYWN0b3J5JztcblxuLyoqXG4gKiBVc2VkIHRvIGxvYWQgbmcgbW9kdWxlIGZhY3Rvcmllcy5cbiAqXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZ01vZHVsZUZhY3RvcnlMb2FkZXIge1xuICBhYnN0cmFjdCBsb2FkKHBhdGg6IHN0cmluZyk6IFByb21pc2U8TmdNb2R1bGVGYWN0b3J5PGFueT4+O1xufVxuXG5sZXQgbW9kdWxlRmFjdG9yaWVzID0gbmV3IE1hcDxzdHJpbmcsIE5nTW9kdWxlRmFjdG9yeTxhbnk+PigpO1xuXG4vKipcbiAqIFJlZ2lzdGVycyBhIGxvYWRlZCBtb2R1bGUuIFNob3VsZCBvbmx5IGJlIGNhbGxlZCBmcm9tIGdlbmVyYXRlZCBOZ01vZHVsZUZhY3RvcnkgY29kZS5cbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyTW9kdWxlRmFjdG9yeShpZDogc3RyaW5nLCBmYWN0b3J5OiBOZ01vZHVsZUZhY3Rvcnk8YW55Pikge1xuICBjb25zdCBleGlzdGluZyA9IG1vZHVsZUZhY3Rvcmllcy5nZXQoaWQpO1xuICBpZiAoZXhpc3RpbmcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZSBtb2R1bGUgcmVnaXN0ZXJlZCBmb3IgJHtpZFxuICAgICAgICAgICAgICAgICAgICB9IC0gJHtleGlzdGluZy5tb2R1bGVUeXBlLm5hbWV9IHZzICR7ZmFjdG9yeS5tb2R1bGVUeXBlLm5hbWV9YCk7XG4gIH1cbiAgbW9kdWxlRmFjdG9yaWVzLnNldChpZCwgZmFjdG9yeSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhck1vZHVsZXNGb3JUZXN0KCkge1xuICBtb2R1bGVGYWN0b3JpZXMgPSBuZXcgTWFwPHN0cmluZywgTmdNb2R1bGVGYWN0b3J5PGFueT4+KCk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgTmdNb2R1bGVGYWN0b3J5IHdpdGggdGhlIGdpdmVuIGlkLCBpZiBpdCBleGlzdHMgYW5kIGhhcyBiZWVuIGxvYWRlZC5cbiAqIEZhY3RvcmllcyBmb3IgbW9kdWxlcyB0aGF0IGRvIG5vdCBzcGVjaWZ5IGFuIGBpZGAgY2Fubm90IGJlIHJldHJpZXZlZC4gVGhyb3dzIGlmIHRoZSBtb2R1bGVcbiAqIGNhbm5vdCBiZSBmb3VuZC5cbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1vZHVsZUZhY3RvcnkoaWQ6IHN0cmluZyk6IE5nTW9kdWxlRmFjdG9yeTxhbnk+IHtcbiAgY29uc3QgZmFjdG9yeSA9IG1vZHVsZUZhY3Rvcmllcy5nZXQoaWQpO1xuICBpZiAoIWZhY3RvcnkpIHRocm93IG5ldyBFcnJvcihgTm8gbW9kdWxlIHdpdGggSUQgJHtpZH0gbG9hZGVkYCk7XG4gIHJldHVybiBmYWN0b3J5O1xufVxuIl19