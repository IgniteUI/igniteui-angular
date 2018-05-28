/**
 * @license Angular v6.0.0
 * (c) 2010-2018 Google, Inc. https://angular.io/
 * License: MIT
 */

import { __values } from 'tslib';
import { Location, LocationStrategy } from '@angular/common';
import { MockLocationStrategy, SpyLocation } from '@angular/common/testing';
import { Compiler, Injectable, Injector, NgModule, NgModuleFactoryLoader, Optional } from '@angular/core';
import { ChildrenOutletContexts, NoPreloading, PreloadingStrategy, ROUTER_CONFIGURATION, ROUTES, Router, RouterModule, UrlHandlingStrategy, UrlSerializer, provideRoutes, ɵROUTER_PROVIDERS, ɵflatten } from '@angular/router';

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @description
 *
 * Allows to simulate the loading of ng modules in tests.
 *
 * ```
 * const loader = TestBed.get(NgModuleFactoryLoader);
 *
 * @Component({template: 'lazy-loaded'})
 * class LazyLoadedComponent {}
 * @NgModule({
 *   declarations: [LazyLoadedComponent],
 *   imports: [RouterModule.forChild([{path: 'loaded', component: LazyLoadedComponent}])]
 * })
 *
 * class LoadedModule {}
 *
 * // sets up stubbedModules
 * loader.stubbedModules = {lazyModule: LoadedModule};
 *
 * router.resetConfig([
 *   {path: 'lazy', loadChildren: 'lazyModule'},
 * ]);
 *
 * router.navigateByUrl('/lazy/loaded');
 * ```
 *
 *
 */
var SpyNgModuleFactoryLoader = /** @class */ (function () {
    function SpyNgModuleFactoryLoader(compiler) {
        this.compiler = compiler;
        /**
           * @docsNotRequired
           */
        this._stubbedModules = {};
    }
    Object.defineProperty(SpyNgModuleFactoryLoader.prototype, "stubbedModules", {
        /**
         * @docsNotRequired
         */
        get: /**
           * @docsNotRequired
           */
        function () { return this._stubbedModules; },
        /**
         * @docsNotRequired
         */
        set: /**
           * @docsNotRequired
           */
        function (modules) {
            var res = {};
            try {
                for (var _a = __values(Object.keys(modules)), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var t = _b.value;
                    res[t] = this.compiler.compileModuleAsync(modules[t]);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this._stubbedModules = res;
            var e_1, _c;
        },
        enumerable: true,
        configurable: true
    });
    SpyNgModuleFactoryLoader.prototype.load = function (path) {
        if (this._stubbedModules[path]) {
            return this._stubbedModules[path];
        }
        else {
            return Promise.reject(new Error("Cannot find module " + path));
        }
    };
    SpyNgModuleFactoryLoader.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    SpyNgModuleFactoryLoader.ctorParameters = function () { return [
        { type: Compiler, },
    ]; };
    return SpyNgModuleFactoryLoader;
}());
function isUrlHandlingStrategy(opts) {
    // This property check is needed because UrlHandlingStrategy is an interface and doesn't exist at
    // runtime.
    return 'shouldProcessUrl' in opts;
}
/**
 * Router setup factory function used for testing.
 *
 *
 */
function setupTestingRouter(urlSerializer, contexts, location, loader, compiler, injector, routes, opts, urlHandlingStrategy) {
    var router$$1 = new Router((null), urlSerializer, contexts, location, injector, loader, compiler, ɵflatten(routes));
    // Handle deprecated argument ordering.
    if (opts) {
        if (isUrlHandlingStrategy(opts)) {
            router$$1.urlHandlingStrategy = opts;
        }
        else if (opts.paramsInheritanceStrategy) {
            router$$1.paramsInheritanceStrategy = opts.paramsInheritanceStrategy;
        }
    }
    if (urlHandlingStrategy) {
        router$$1.urlHandlingStrategy = urlHandlingStrategy;
    }
    return router$$1;
}
/**
 * @description
 *
 * Sets up the router to be used for testing.
 *
 * The modules sets up the router to be used for testing.
 * It provides spy implementations of `Location`, `LocationStrategy`, and {@link
 * NgModuleFactoryLoader}.
 *
 * ### Example
 *
 * ```
 * beforeEach(() => {
 *   TestBed.configureTestModule({
 *     imports: [
 *       RouterTestingModule.withRoutes(
 *         [{path: '', component: BlankCmp}, {path: 'simple', component: SimpleCmp}]
 *       )
 *     ]
 *   });
 * });
 * ```
 *
 *
 */
var RouterTestingModule = /** @class */ (function () {
    function RouterTestingModule() {
    }
    RouterTestingModule.withRoutes = function (routes, config) {
        return {
            ngModule: RouterTestingModule,
            providers: [
                provideRoutes(routes),
                { provide: ROUTER_CONFIGURATION, useValue: config ? config : {} },
            ]
        };
    };
    RouterTestingModule.decorators = [
        { type: NgModule, args: [{
                    exports: [RouterModule],
                    providers: [
                        ɵROUTER_PROVIDERS, { provide: Location, useClass: SpyLocation },
                        { provide: LocationStrategy, useClass: MockLocationStrategy },
                        { provide: NgModuleFactoryLoader, useClass: SpyNgModuleFactoryLoader }, {
                            provide: Router,
                            useFactory: setupTestingRouter,
                            deps: [
                                UrlSerializer, ChildrenOutletContexts, Location, NgModuleFactoryLoader, Compiler, Injector,
                                ROUTES, ROUTER_CONFIGURATION, [UrlHandlingStrategy, new Optional()]
                            ]
                        },
                        { provide: PreloadingStrategy, useExisting: NoPreloading }, provideRoutes([])
                    ]
                },] }
    ];
    /** @nocollapse */
    RouterTestingModule.ctorParameters = function () { return []; };
    return RouterTestingModule;
}());

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This file only reexports content of the `src` folder. Keep it that way.

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SpyNgModuleFactoryLoader, setupTestingRouter, RouterTestingModule };
//# sourceMappingURL=testing.js.map
