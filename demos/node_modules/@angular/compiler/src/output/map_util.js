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
        define("@angular/compiler/src/output/map_util", ["require", "exports", "@angular/compiler/src/output/output_ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var o = require("@angular/compiler/src/output/output_ast");
    function mapEntry(key, value) {
        return { key: key, value: value, quoted: false };
    }
    exports.mapEntry = mapEntry;
    function mapLiteral(obj) {
        return o.literalMap(Object.keys(obj).map(function (key) { return ({
            key: key,
            quoted: false,
            value: obj[key],
        }); }));
    }
    exports.mapLiteral = mapLiteral;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwX3V0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvb3V0cHV0L21hcF91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgsMkRBQWtDO0lBVWxDLGtCQUF5QixHQUFXLEVBQUUsS0FBbUI7UUFDdkQsTUFBTSxDQUFDLEVBQUMsR0FBRyxLQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBQyxDQUFDO0lBQ3JDLENBQUM7SUFGRCw0QkFFQztJQUVELG9CQUEyQixHQUFrQztRQUMzRCxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLENBQUM7WUFDTixHQUFHLEtBQUE7WUFDSCxNQUFNLEVBQUUsS0FBSztZQUNiLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDO1NBQ2hCLENBQUMsRUFKSyxDQUlMLENBQUMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFORCxnQ0FNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuL291dHB1dF9hc3QnO1xuXG5leHBvcnQgdHlwZSBNYXBFbnRyeSA9IHtcbiAga2V5OiBzdHJpbmcsXG4gIHF1b3RlZDogYm9vbGVhbixcbiAgdmFsdWU6IG8uRXhwcmVzc2lvblxufTtcblxuZXhwb3J0IHR5cGUgTWFwTGl0ZXJhbCA9IE1hcEVudHJ5W107XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXBFbnRyeShrZXk6IHN0cmluZywgdmFsdWU6IG8uRXhwcmVzc2lvbik6IE1hcEVudHJ5IHtcbiAgcmV0dXJuIHtrZXksIHZhbHVlLCBxdW90ZWQ6IGZhbHNlfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcExpdGVyYWwob2JqOiB7W2tleTogc3RyaW5nXTogby5FeHByZXNzaW9ufSk6IG8uRXhwcmVzc2lvbiB7XG4gIHJldHVybiBvLmxpdGVyYWxNYXAoT2JqZWN0LmtleXMob2JqKS5tYXAoa2V5ID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdW90ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG9ialtrZXldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSk7XG59XG4iXX0=