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
        define("@angular/compiler/src/ast_path", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A path is an ordered set of elements. Typically a path is to  a
     * particular offset in a source file. The head of the list is the top
     * most node. The tail is the node that contains the offset directly.
     *
     * For example, the expression `a + b + c` might have an ast that looks
     * like:
     *     +
     *    / \
     *   a   +
     *      / \
     *     b   c
     *
     * The path to the node at offset 9 would be `['+' at 1-10, '+' at 7-10,
     * 'c' at 9-10]` and the path the node at offset 1 would be
     * `['+' at 1-10, 'a' at 1-2]`.
     */
    var AstPath = /** @class */ (function () {
        function AstPath(path, position) {
            if (position === void 0) { position = -1; }
            this.path = path;
            this.position = position;
        }
        Object.defineProperty(AstPath.prototype, "empty", {
            get: function () { return !this.path || !this.path.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AstPath.prototype, "head", {
            get: function () { return this.path[0]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AstPath.prototype, "tail", {
            get: function () { return this.path[this.path.length - 1]; },
            enumerable: true,
            configurable: true
        });
        AstPath.prototype.parentOf = function (node) {
            return node && this.path[this.path.indexOf(node) - 1];
        };
        AstPath.prototype.childOf = function (node) { return this.path[this.path.indexOf(node) + 1]; };
        AstPath.prototype.first = function (ctor) {
            for (var i = this.path.length - 1; i >= 0; i--) {
                var item = this.path[i];
                if (item instanceof ctor)
                    return item;
            }
        };
        AstPath.prototype.push = function (node) { this.path.push(node); };
        AstPath.prototype.pop = function () { return this.path.pop(); };
        return AstPath;
    }());
    exports.AstPath = AstPath;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0X3BhdGguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvYXN0X3BhdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSDs7Ozs7Ozs7Ozs7Ozs7OztPQWdCRztJQUNIO1FBQ0UsaUJBQW9CLElBQVMsRUFBUyxRQUFxQjtZQUFyQix5QkFBQSxFQUFBLFlBQW9CLENBQUM7WUFBdkMsU0FBSSxHQUFKLElBQUksQ0FBSztZQUFTLGFBQVEsR0FBUixRQUFRLENBQWE7UUFBRyxDQUFDO1FBRS9ELHNCQUFJLDBCQUFLO2lCQUFULGNBQXVCLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7OztXQUFBO1FBQ2hFLHNCQUFJLHlCQUFJO2lCQUFSLGNBQTBCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O1dBQUE7UUFDaEQsc0JBQUkseUJBQUk7aUJBQVIsY0FBMEIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7V0FBQTtRQUVuRSwwQkFBUSxHQUFSLFVBQVMsSUFBaUI7WUFDeEIsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFDRCx5QkFBTyxHQUFQLFVBQVEsSUFBTyxJQUFpQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEYsdUJBQUssR0FBTCxVQUFtQixJQUErQjtZQUNoRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUMvQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLFlBQVksSUFBSSxDQUFDO29CQUFDLE1BQU0sQ0FBSSxJQUFJLENBQUM7WUFDM0MsQ0FBQztRQUNILENBQUM7UUFFRCxzQkFBSSxHQUFKLFVBQUssSUFBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV2QyxxQkFBRyxHQUFILGNBQVcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLGNBQUM7SUFBRCxDQUFDLEFBdEJELElBc0JDO0lBdEJZLDBCQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEEgcGF0aCBpcyBhbiBvcmRlcmVkIHNldCBvZiBlbGVtZW50cy4gVHlwaWNhbGx5IGEgcGF0aCBpcyB0byAgYVxuICogcGFydGljdWxhciBvZmZzZXQgaW4gYSBzb3VyY2UgZmlsZS4gVGhlIGhlYWQgb2YgdGhlIGxpc3QgaXMgdGhlIHRvcFxuICogbW9zdCBub2RlLiBUaGUgdGFpbCBpcyB0aGUgbm9kZSB0aGF0IGNvbnRhaW5zIHRoZSBvZmZzZXQgZGlyZWN0bHkuXG4gKlxuICogRm9yIGV4YW1wbGUsIHRoZSBleHByZXNzaW9uIGBhICsgYiArIGNgIG1pZ2h0IGhhdmUgYW4gYXN0IHRoYXQgbG9va3NcbiAqIGxpa2U6XG4gKiAgICAgK1xuICogICAgLyBcXFxuICogICBhICAgK1xuICogICAgICAvIFxcXG4gKiAgICAgYiAgIGNcbiAqXG4gKiBUaGUgcGF0aCB0byB0aGUgbm9kZSBhdCBvZmZzZXQgOSB3b3VsZCBiZSBgWycrJyBhdCAxLTEwLCAnKycgYXQgNy0xMCxcbiAqICdjJyBhdCA5LTEwXWAgYW5kIHRoZSBwYXRoIHRoZSBub2RlIGF0IG9mZnNldCAxIHdvdWxkIGJlXG4gKiBgWycrJyBhdCAxLTEwLCAnYScgYXQgMS0yXWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBBc3RQYXRoPFQ+IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBwYXRoOiBUW10sIHB1YmxpYyBwb3NpdGlvbjogbnVtYmVyID0gLTEpIHt9XG5cbiAgZ2V0IGVtcHR5KCk6IGJvb2xlYW4geyByZXR1cm4gIXRoaXMucGF0aCB8fCAhdGhpcy5wYXRoLmxlbmd0aDsgfVxuICBnZXQgaGVhZCgpOiBUfHVuZGVmaW5lZCB7IHJldHVybiB0aGlzLnBhdGhbMF07IH1cbiAgZ2V0IHRhaWwoKTogVHx1bmRlZmluZWQgeyByZXR1cm4gdGhpcy5wYXRoW3RoaXMucGF0aC5sZW5ndGggLSAxXTsgfVxuXG4gIHBhcmVudE9mKG5vZGU6IFR8dW5kZWZpbmVkKTogVHx1bmRlZmluZWQge1xuICAgIHJldHVybiBub2RlICYmIHRoaXMucGF0aFt0aGlzLnBhdGguaW5kZXhPZihub2RlKSAtIDFdO1xuICB9XG4gIGNoaWxkT2Yobm9kZTogVCk6IFR8dW5kZWZpbmVkIHsgcmV0dXJuIHRoaXMucGF0aFt0aGlzLnBhdGguaW5kZXhPZihub2RlKSArIDFdOyB9XG5cbiAgZmlyc3Q8TiBleHRlbmRzIFQ+KGN0b3I6IHtuZXcgKC4uLmFyZ3M6IGFueVtdKTogTn0pOiBOfHVuZGVmaW5lZCB7XG4gICAgZm9yIChsZXQgaSA9IHRoaXMucGF0aC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgbGV0IGl0ZW0gPSB0aGlzLnBhdGhbaV07XG4gICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIGN0b3IpIHJldHVybiA8Tj5pdGVtO1xuICAgIH1cbiAgfVxuXG4gIHB1c2gobm9kZTogVCkgeyB0aGlzLnBhdGgucHVzaChub2RlKTsgfVxuXG4gIHBvcCgpOiBUIHsgcmV0dXJuIHRoaXMucGF0aC5wb3AoKSAhOyB9XG59XG4iXX0=