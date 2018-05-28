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
        define("@angular/compiler/src/output/value_util", ["require", "exports", "@angular/compiler/src/util", "@angular/compiler/src/output/output_ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require("@angular/compiler/src/util");
    var o = require("@angular/compiler/src/output/output_ast");
    exports.QUOTED_KEYS = '$quoted$';
    function convertValueToOutputAst(ctx, value, type) {
        if (type === void 0) { type = null; }
        return util_1.visitValue(value, new _ValueOutputAstTransformer(ctx), type);
    }
    exports.convertValueToOutputAst = convertValueToOutputAst;
    var _ValueOutputAstTransformer = /** @class */ (function () {
        function _ValueOutputAstTransformer(ctx) {
            this.ctx = ctx;
        }
        _ValueOutputAstTransformer.prototype.visitArray = function (arr, type) {
            var _this = this;
            return o.literalArr(arr.map(function (value) { return util_1.visitValue(value, _this, null); }), type);
        };
        _ValueOutputAstTransformer.prototype.visitStringMap = function (map, type) {
            var _this = this;
            var entries = [];
            var quotedSet = new Set(map && map[exports.QUOTED_KEYS]);
            Object.keys(map).forEach(function (key) {
                entries.push(new o.LiteralMapEntry(key, util_1.visitValue(map[key], _this, null), quotedSet.has(key)));
            });
            return new o.LiteralMapExpr(entries, type);
        };
        _ValueOutputAstTransformer.prototype.visitPrimitive = function (value, type) { return o.literal(value, type); };
        _ValueOutputAstTransformer.prototype.visitOther = function (value, type) {
            if (value instanceof o.Expression) {
                return value;
            }
            else {
                return this.ctx.importExpr(value);
            }
        };
        return _ValueOutputAstTransformer;
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsdWVfdXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9vdXRwdXQvdmFsdWVfdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUdILG1EQUFvRTtJQUVwRSwyREFBa0M7SUFFckIsUUFBQSxXQUFXLEdBQUcsVUFBVSxDQUFDO0lBRXRDLGlDQUNJLEdBQWtCLEVBQUUsS0FBVSxFQUFFLElBQTBCO1FBQTFCLHFCQUFBLEVBQUEsV0FBMEI7UUFDNUQsTUFBTSxDQUFDLGlCQUFVLENBQUMsS0FBSyxFQUFFLElBQUksMEJBQTBCLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUhELDBEQUdDO0lBRUQ7UUFDRSxvQ0FBb0IsR0FBa0I7WUFBbEIsUUFBRyxHQUFILEdBQUcsQ0FBZTtRQUFHLENBQUM7UUFDMUMsK0NBQVUsR0FBVixVQUFXLEdBQVUsRUFBRSxJQUFZO1lBQW5DLGlCQUVDO1lBREMsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLGlCQUFVLENBQUMsS0FBSyxFQUFFLEtBQUksRUFBRSxJQUFJLENBQUMsRUFBN0IsQ0FBNkIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdFLENBQUM7UUFFRCxtREFBYyxHQUFkLFVBQWUsR0FBeUIsRUFBRSxJQUFlO1lBQXpELGlCQVFDO1lBUEMsSUFBTSxPQUFPLEdBQXdCLEVBQUUsQ0FBQztZQUN4QyxJQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLG1CQUFXLENBQUMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRztnQkFDMUIsT0FBTyxDQUFDLElBQUksQ0FDUixJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLGlCQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFFRCxtREFBYyxHQUFkLFVBQWUsS0FBVSxFQUFFLElBQVksSUFBa0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV6RiwrQ0FBVSxHQUFWLFVBQVcsS0FBVSxFQUFFLElBQVk7WUFDakMsRUFBRSxDQUFDLENBQUMsS0FBSyxZQUFZLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ2YsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwQyxDQUFDO1FBQ0gsQ0FBQztRQUNILGlDQUFDO0lBQUQsQ0FBQyxBQXpCRCxJQXlCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuXG5pbXBvcnQge091dHB1dENvbnRleHQsIFZhbHVlVHJhbnNmb3JtZXIsIHZpc2l0VmFsdWV9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4vb3V0cHV0X2FzdCc7XG5cbmV4cG9ydCBjb25zdCBRVU9URURfS0VZUyA9ICckcXVvdGVkJCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0VmFsdWVUb091dHB1dEFzdChcbiAgICBjdHg6IE91dHB1dENvbnRleHQsIHZhbHVlOiBhbnksIHR5cGU6IG8uVHlwZSB8IG51bGwgPSBudWxsKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIHZpc2l0VmFsdWUodmFsdWUsIG5ldyBfVmFsdWVPdXRwdXRBc3RUcmFuc2Zvcm1lcihjdHgpLCB0eXBlKTtcbn1cblxuY2xhc3MgX1ZhbHVlT3V0cHV0QXN0VHJhbnNmb3JtZXIgaW1wbGVtZW50cyBWYWx1ZVRyYW5zZm9ybWVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjdHg6IE91dHB1dENvbnRleHQpIHt9XG4gIHZpc2l0QXJyYXkoYXJyOiBhbnlbXSwgdHlwZTogby5UeXBlKTogby5FeHByZXNzaW9uIHtcbiAgICByZXR1cm4gby5saXRlcmFsQXJyKGFyci5tYXAodmFsdWUgPT4gdmlzaXRWYWx1ZSh2YWx1ZSwgdGhpcywgbnVsbCkpLCB0eXBlKTtcbiAgfVxuXG4gIHZpc2l0U3RyaW5nTWFwKG1hcDoge1trZXk6IHN0cmluZ106IGFueX0sIHR5cGU6IG8uTWFwVHlwZSk6IG8uRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgZW50cmllczogby5MaXRlcmFsTWFwRW50cnlbXSA9IFtdO1xuICAgIGNvbnN0IHF1b3RlZFNldCA9IG5ldyBTZXQ8c3RyaW5nPihtYXAgJiYgbWFwW1FVT1RFRF9LRVlTXSk7XG4gICAgT2JqZWN0LmtleXMobWFwKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBlbnRyaWVzLnB1c2goXG4gICAgICAgICAgbmV3IG8uTGl0ZXJhbE1hcEVudHJ5KGtleSwgdmlzaXRWYWx1ZShtYXBba2V5XSwgdGhpcywgbnVsbCksIHF1b3RlZFNldC5oYXMoa2V5KSkpO1xuICAgIH0pO1xuICAgIHJldHVybiBuZXcgby5MaXRlcmFsTWFwRXhwcihlbnRyaWVzLCB0eXBlKTtcbiAgfVxuXG4gIHZpc2l0UHJpbWl0aXZlKHZhbHVlOiBhbnksIHR5cGU6IG8uVHlwZSk6IG8uRXhwcmVzc2lvbiB7IHJldHVybiBvLmxpdGVyYWwodmFsdWUsIHR5cGUpOyB9XG5cbiAgdmlzaXRPdGhlcih2YWx1ZTogYW55LCB0eXBlOiBvLlR5cGUpOiBvLkV4cHJlc3Npb24ge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIG8uRXhwcmVzc2lvbikge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jdHguaW1wb3J0RXhwcih2YWx1ZSk7XG4gICAgfVxuICB9XG59XG4iXX0=