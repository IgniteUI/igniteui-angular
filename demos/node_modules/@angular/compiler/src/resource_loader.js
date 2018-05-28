/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/resource_loader", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * An interface for retrieving documents by URL that the compiler uses
     * to load templates.
     */
    var ResourceLoader = /** @class */ (function () {
        function ResourceLoader() {
        }
        ResourceLoader.prototype.get = function (url) { return ''; };
        return ResourceLoader;
    }());
    exports.ResourceLoader = ResourceLoader;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3Jlc291cmNlX2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVIOzs7T0FHRztJQUNIO1FBQUE7UUFFQSxDQUFDO1FBREMsNEJBQUcsR0FBSCxVQUFJLEdBQVcsSUFBNEIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekQscUJBQUM7SUFBRCxDQUFDLEFBRkQsSUFFQztJQUZZLHdDQUFjIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEFuIGludGVyZmFjZSBmb3IgcmV0cmlldmluZyBkb2N1bWVudHMgYnkgVVJMIHRoYXQgdGhlIGNvbXBpbGVyIHVzZXNcbiAqIHRvIGxvYWQgdGVtcGxhdGVzLlxuICovXG5leHBvcnQgY2xhc3MgUmVzb3VyY2VMb2FkZXIge1xuICBnZXQodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz58c3RyaW5nIHsgcmV0dXJuICcnOyB9XG59XG4iXX0=