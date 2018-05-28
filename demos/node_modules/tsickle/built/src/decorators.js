"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
/**
 * Returns the declarations for the given decorator.
 */
function getDecoratorDeclarations(decorator, typeChecker) {
    // Walk down the expression to find the identifier of the decorator function.
    var node = decorator;
    while (node.kind !== ts.SyntaxKind.Identifier) {
        if (node.kind === ts.SyntaxKind.Decorator || node.kind === ts.SyntaxKind.CallExpression) {
            node = node.expression;
        }
        else {
            // We do not know how to handle this type of decorator.
            return [];
        }
    }
    var decSym = typeChecker.getSymbolAtLocation(node);
    if (!decSym)
        return [];
    if (decSym.flags & ts.SymbolFlags.Alias) {
        decSym = typeChecker.getAliasedSymbol(decSym);
    }
    return decSym.getDeclarations() || [];
}
exports.getDecoratorDeclarations = getDecoratorDeclarations;
/**
 * Returns true if node has an exporting decorator  (i.e., a decorator with @ExportDecoratedItems
 * in its JSDoc).
 */
function hasExportingDecorator(node, typeChecker) {
    return node.decorators &&
        node.decorators.some(function (decorator) { return isExportingDecorator(decorator, typeChecker); });
}
exports.hasExportingDecorator = hasExportingDecorator;
/**
 * Returns true if the given decorator has an @ExportDecoratedItems directive in its JSDoc.
 */
function isExportingDecorator(decorator, typeChecker) {
    return getDecoratorDeclarations(decorator, typeChecker).some(function (declaration) {
        var range = ts.getLeadingCommentRanges(declaration.getFullText(), 0);
        if (!range) {
            return false;
        }
        try {
            for (var range_1 = __values(range), range_1_1 = range_1.next(); !range_1_1.done; range_1_1 = range_1.next()) {
                var _a = range_1_1.value, pos = _a.pos, end = _a.end;
                if (/@ExportDecoratedItems\b/.test(declaration.getFullText().substring(pos, end))) {
                    return true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (range_1_1 && !range_1_1.done && (_b = range_1.return)) _b.call(range_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return false;
        var e_1, _b;
    });
}

//# sourceMappingURL=decorators.js.map
