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
        define("@angular/compiler/src/ml_parser/html_whitespaces", ["require", "exports", "@angular/compiler/src/ml_parser/ast", "@angular/compiler/src/ml_parser/parser", "@angular/compiler/src/ml_parser/tags"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var html = require("@angular/compiler/src/ml_parser/ast");
    var parser_1 = require("@angular/compiler/src/ml_parser/parser");
    var tags_1 = require("@angular/compiler/src/ml_parser/tags");
    exports.PRESERVE_WS_ATTR_NAME = 'ngPreserveWhitespaces';
    var SKIP_WS_TRIM_TAGS = new Set(['pre', 'template', 'textarea', 'script', 'style']);
    // Equivalent to \s with \u00a0 (non-breaking space) excluded.
    // Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
    var WS_CHARS = ' \f\n\r\t\v\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff';
    var NO_WS_REGEXP = new RegExp("[^" + WS_CHARS + "]");
    var WS_REPLACE_REGEXP = new RegExp("[" + WS_CHARS + "]{2,}", 'g');
    function hasPreserveWhitespacesAttr(attrs) {
        return attrs.some(function (attr) { return attr.name === exports.PRESERVE_WS_ATTR_NAME; });
    }
    /**
     * Angular Dart introduced &ngsp; as a placeholder for non-removable space, see:
     * https://github.com/dart-lang/angular/blob/0bb611387d29d65b5af7f9d2515ab571fd3fbee4/_tests/test/compiler/preserve_whitespace_test.dart#L25-L32
     * In Angular Dart &ngsp; is converted to the 0xE500 PUA (Private Use Areas) unicode character
     * and later on replaced by a space. We are re-implementing the same idea here.
     */
    function replaceNgsp(value) {
        // lexer is replacing the &ngsp; pseudo-entity with NGSP_UNICODE
        return value.replace(new RegExp(tags_1.NGSP_UNICODE, 'g'), ' ');
    }
    exports.replaceNgsp = replaceNgsp;
    /**
     * This visitor can walk HTML parse tree and remove / trim text nodes using the following rules:
     * - consider spaces, tabs and new lines as whitespace characters;
     * - drop text nodes consisting of whitespace characters only;
     * - for all other text nodes replace consecutive whitespace characters with one space;
     * - convert &ngsp; pseudo-entity to a single space;
     *
     * Removal and trimming of whitespaces have positive performance impact (less code to generate
     * while compiling templates, faster view creation). At the same time it can be "destructive"
     * in some cases (whitespaces can influence layout). Because of the potential of breaking layout
     * this visitor is not activated by default in Angular 5 and people need to explicitly opt-in for
     * whitespace removal. The default option for whitespace removal will be revisited in Angular 6
     * and might be changed to "on" by default.
     */
    var WhitespaceVisitor = /** @class */ (function () {
        function WhitespaceVisitor() {
        }
        WhitespaceVisitor.prototype.visitElement = function (element, context) {
            if (SKIP_WS_TRIM_TAGS.has(element.name) || hasPreserveWhitespacesAttr(element.attrs)) {
                // don't descent into elements where we need to preserve whitespaces
                // but still visit all attributes to eliminate one used as a market to preserve WS
                return new html.Element(element.name, html.visitAll(this, element.attrs), element.children, element.sourceSpan, element.startSourceSpan, element.endSourceSpan);
            }
            return new html.Element(element.name, element.attrs, html.visitAll(this, element.children), element.sourceSpan, element.startSourceSpan, element.endSourceSpan);
        };
        WhitespaceVisitor.prototype.visitAttribute = function (attribute, context) {
            return attribute.name !== exports.PRESERVE_WS_ATTR_NAME ? attribute : null;
        };
        WhitespaceVisitor.prototype.visitText = function (text, context) {
            var isNotBlank = text.value.match(NO_WS_REGEXP);
            if (isNotBlank) {
                return new html.Text(replaceNgsp(text.value).replace(WS_REPLACE_REGEXP, ' '), text.sourceSpan);
            }
            return null;
        };
        WhitespaceVisitor.prototype.visitComment = function (comment, context) { return comment; };
        WhitespaceVisitor.prototype.visitExpansion = function (expansion, context) { return expansion; };
        WhitespaceVisitor.prototype.visitExpansionCase = function (expansionCase, context) { return expansionCase; };
        return WhitespaceVisitor;
    }());
    function removeWhitespaces(htmlAstWithErrors) {
        return new parser_1.ParseTreeResult(html.visitAll(new WhitespaceVisitor(), htmlAstWithErrors.rootNodes), htmlAstWithErrors.errors);
    }
    exports.removeWhitespaces = removeWhitespaces;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF93aGl0ZXNwYWNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9tbF9wYXJzZXIvaHRtbF93aGl0ZXNwYWNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDBEQUE4QjtJQUM5QixpRUFBeUM7SUFDekMsNkRBQW9DO0lBRXZCLFFBQUEscUJBQXFCLEdBQUcsdUJBQXVCLENBQUM7SUFFN0QsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBRXRGLDhEQUE4RDtJQUM5RCxtR0FBbUc7SUFDbkcsSUFBTSxRQUFRLEdBQUcsMEVBQTBFLENBQUM7SUFDNUYsSUFBTSxZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBSyxRQUFRLE1BQUcsQ0FBQyxDQUFDO0lBQ2xELElBQU0saUJBQWlCLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBSSxRQUFRLFVBQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUUvRCxvQ0FBb0MsS0FBdUI7UUFDekQsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFvQixJQUFLLE9BQUEsSUFBSSxDQUFDLElBQUksS0FBSyw2QkFBcUIsRUFBbkMsQ0FBbUMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILHFCQUE0QixLQUFhO1FBQ3ZDLGdFQUFnRTtRQUNoRSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxtQkFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFIRCxrQ0FHQztJQUVEOzs7Ozs7Ozs7Ozs7O09BYUc7SUFDSDtRQUFBO1FBbUNBLENBQUM7UUFsQ0Msd0NBQVksR0FBWixVQUFhLE9BQXFCLEVBQUUsT0FBWTtZQUM5QyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JGLG9FQUFvRTtnQkFDcEUsa0ZBQWtGO2dCQUNsRixNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUNuQixPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQ3RGLE9BQU8sQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3RELENBQUM7WUFFRCxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUNuQixPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQ3RGLE9BQU8sQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFFRCwwQ0FBYyxHQUFkLFVBQWUsU0FBeUIsRUFBRSxPQUFZO1lBQ3BELE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxLQUFLLDZCQUFxQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNyRSxDQUFDO1FBRUQscUNBQVMsR0FBVCxVQUFVLElBQWUsRUFBRSxPQUFZO1lBQ3JDLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRWxELEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FDaEIsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hGLENBQUM7WUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELHdDQUFZLEdBQVosVUFBYSxPQUFxQixFQUFFLE9BQVksSUFBUyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUUxRSwwQ0FBYyxHQUFkLFVBQWUsU0FBeUIsRUFBRSxPQUFZLElBQVMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFFbEYsOENBQWtCLEdBQWxCLFVBQW1CLGFBQWlDLEVBQUUsT0FBWSxJQUFTLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ3BHLHdCQUFDO0lBQUQsQ0FBQyxBQW5DRCxJQW1DQztJQUVELDJCQUFrQyxpQkFBa0M7UUFDbEUsTUFBTSxDQUFDLElBQUksd0JBQWUsQ0FDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLGlCQUFpQixFQUFFLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEVBQ25FLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFKRCw4Q0FJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuL2FzdCc7XG5pbXBvcnQge1BhcnNlVHJlZVJlc3VsdH0gZnJvbSAnLi9wYXJzZXInO1xuaW1wb3J0IHtOR1NQX1VOSUNPREV9IGZyb20gJy4vdGFncyc7XG5cbmV4cG9ydCBjb25zdCBQUkVTRVJWRV9XU19BVFRSX05BTUUgPSAnbmdQcmVzZXJ2ZVdoaXRlc3BhY2VzJztcblxuY29uc3QgU0tJUF9XU19UUklNX1RBR1MgPSBuZXcgU2V0KFsncHJlJywgJ3RlbXBsYXRlJywgJ3RleHRhcmVhJywgJ3NjcmlwdCcsICdzdHlsZSddKTtcblxuLy8gRXF1aXZhbGVudCB0byBcXHMgd2l0aCBcXHUwMGEwIChub24tYnJlYWtpbmcgc3BhY2UpIGV4Y2x1ZGVkLlxuLy8gQmFzZWQgb24gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvUmVnRXhwXG5jb25zdCBXU19DSEFSUyA9ICcgXFxmXFxuXFxyXFx0XFx2XFx1MTY4MFxcdTE4MGVcXHUyMDAwLVxcdTIwMGFcXHUyMDI4XFx1MjAyOVxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdWZlZmYnO1xuY29uc3QgTk9fV1NfUkVHRVhQID0gbmV3IFJlZ0V4cChgW14ke1dTX0NIQVJTfV1gKTtcbmNvbnN0IFdTX1JFUExBQ0VfUkVHRVhQID0gbmV3IFJlZ0V4cChgWyR7V1NfQ0hBUlN9XXsyLH1gLCAnZycpO1xuXG5mdW5jdGlvbiBoYXNQcmVzZXJ2ZVdoaXRlc3BhY2VzQXR0cihhdHRyczogaHRtbC5BdHRyaWJ1dGVbXSk6IGJvb2xlYW4ge1xuICByZXR1cm4gYXR0cnMuc29tZSgoYXR0cjogaHRtbC5BdHRyaWJ1dGUpID0+IGF0dHIubmFtZSA9PT0gUFJFU0VSVkVfV1NfQVRUUl9OQU1FKTtcbn1cblxuLyoqXG4gKiBBbmd1bGFyIERhcnQgaW50cm9kdWNlZCAmbmdzcDsgYXMgYSBwbGFjZWhvbGRlciBmb3Igbm9uLXJlbW92YWJsZSBzcGFjZSwgc2VlOlxuICogaHR0cHM6Ly9naXRodWIuY29tL2RhcnQtbGFuZy9hbmd1bGFyL2Jsb2IvMGJiNjExMzg3ZDI5ZDY1YjVhZjdmOWQyNTE1YWI1NzFmZDNmYmVlNC9fdGVzdHMvdGVzdC9jb21waWxlci9wcmVzZXJ2ZV93aGl0ZXNwYWNlX3Rlc3QuZGFydCNMMjUtTDMyXG4gKiBJbiBBbmd1bGFyIERhcnQgJm5nc3A7IGlzIGNvbnZlcnRlZCB0byB0aGUgMHhFNTAwIFBVQSAoUHJpdmF0ZSBVc2UgQXJlYXMpIHVuaWNvZGUgY2hhcmFjdGVyXG4gKiBhbmQgbGF0ZXIgb24gcmVwbGFjZWQgYnkgYSBzcGFjZS4gV2UgYXJlIHJlLWltcGxlbWVudGluZyB0aGUgc2FtZSBpZGVhIGhlcmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXBsYWNlTmdzcCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gbGV4ZXIgaXMgcmVwbGFjaW5nIHRoZSAmbmdzcDsgcHNldWRvLWVudGl0eSB3aXRoIE5HU1BfVU5JQ09ERVxuICByZXR1cm4gdmFsdWUucmVwbGFjZShuZXcgUmVnRXhwKE5HU1BfVU5JQ09ERSwgJ2cnKSwgJyAnKTtcbn1cblxuLyoqXG4gKiBUaGlzIHZpc2l0b3IgY2FuIHdhbGsgSFRNTCBwYXJzZSB0cmVlIGFuZCByZW1vdmUgLyB0cmltIHRleHQgbm9kZXMgdXNpbmcgdGhlIGZvbGxvd2luZyBydWxlczpcbiAqIC0gY29uc2lkZXIgc3BhY2VzLCB0YWJzIGFuZCBuZXcgbGluZXMgYXMgd2hpdGVzcGFjZSBjaGFyYWN0ZXJzO1xuICogLSBkcm9wIHRleHQgbm9kZXMgY29uc2lzdGluZyBvZiB3aGl0ZXNwYWNlIGNoYXJhY3RlcnMgb25seTtcbiAqIC0gZm9yIGFsbCBvdGhlciB0ZXh0IG5vZGVzIHJlcGxhY2UgY29uc2VjdXRpdmUgd2hpdGVzcGFjZSBjaGFyYWN0ZXJzIHdpdGggb25lIHNwYWNlO1xuICogLSBjb252ZXJ0ICZuZ3NwOyBwc2V1ZG8tZW50aXR5IHRvIGEgc2luZ2xlIHNwYWNlO1xuICpcbiAqIFJlbW92YWwgYW5kIHRyaW1taW5nIG9mIHdoaXRlc3BhY2VzIGhhdmUgcG9zaXRpdmUgcGVyZm9ybWFuY2UgaW1wYWN0IChsZXNzIGNvZGUgdG8gZ2VuZXJhdGVcbiAqIHdoaWxlIGNvbXBpbGluZyB0ZW1wbGF0ZXMsIGZhc3RlciB2aWV3IGNyZWF0aW9uKS4gQXQgdGhlIHNhbWUgdGltZSBpdCBjYW4gYmUgXCJkZXN0cnVjdGl2ZVwiXG4gKiBpbiBzb21lIGNhc2VzICh3aGl0ZXNwYWNlcyBjYW4gaW5mbHVlbmNlIGxheW91dCkuIEJlY2F1c2Ugb2YgdGhlIHBvdGVudGlhbCBvZiBicmVha2luZyBsYXlvdXRcbiAqIHRoaXMgdmlzaXRvciBpcyBub3QgYWN0aXZhdGVkIGJ5IGRlZmF1bHQgaW4gQW5ndWxhciA1IGFuZCBwZW9wbGUgbmVlZCB0byBleHBsaWNpdGx5IG9wdC1pbiBmb3JcbiAqIHdoaXRlc3BhY2UgcmVtb3ZhbC4gVGhlIGRlZmF1bHQgb3B0aW9uIGZvciB3aGl0ZXNwYWNlIHJlbW92YWwgd2lsbCBiZSByZXZpc2l0ZWQgaW4gQW5ndWxhciA2XG4gKiBhbmQgbWlnaHQgYmUgY2hhbmdlZCB0byBcIm9uXCIgYnkgZGVmYXVsdC5cbiAqL1xuY2xhc3MgV2hpdGVzcGFjZVZpc2l0b3IgaW1wbGVtZW50cyBodG1sLlZpc2l0b3Ige1xuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogaHRtbC5FbGVtZW50LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGlmIChTS0lQX1dTX1RSSU1fVEFHUy5oYXMoZWxlbWVudC5uYW1lKSB8fCBoYXNQcmVzZXJ2ZVdoaXRlc3BhY2VzQXR0cihlbGVtZW50LmF0dHJzKSkge1xuICAgICAgLy8gZG9uJ3QgZGVzY2VudCBpbnRvIGVsZW1lbnRzIHdoZXJlIHdlIG5lZWQgdG8gcHJlc2VydmUgd2hpdGVzcGFjZXNcbiAgICAgIC8vIGJ1dCBzdGlsbCB2aXNpdCBhbGwgYXR0cmlidXRlcyB0byBlbGltaW5hdGUgb25lIHVzZWQgYXMgYSBtYXJrZXQgdG8gcHJlc2VydmUgV1NcbiAgICAgIHJldHVybiBuZXcgaHRtbC5FbGVtZW50KFxuICAgICAgICAgIGVsZW1lbnQubmFtZSwgaHRtbC52aXNpdEFsbCh0aGlzLCBlbGVtZW50LmF0dHJzKSwgZWxlbWVudC5jaGlsZHJlbiwgZWxlbWVudC5zb3VyY2VTcGFuLFxuICAgICAgICAgIGVsZW1lbnQuc3RhcnRTb3VyY2VTcGFuLCBlbGVtZW50LmVuZFNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgaHRtbC5FbGVtZW50KFxuICAgICAgICBlbGVtZW50Lm5hbWUsIGVsZW1lbnQuYXR0cnMsIGh0bWwudmlzaXRBbGwodGhpcywgZWxlbWVudC5jaGlsZHJlbiksIGVsZW1lbnQuc291cmNlU3BhbixcbiAgICAgICAgZWxlbWVudC5zdGFydFNvdXJjZVNwYW4sIGVsZW1lbnQuZW5kU291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdEF0dHJpYnV0ZShhdHRyaWJ1dGU6IGh0bWwuQXR0cmlidXRlLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBhdHRyaWJ1dGUubmFtZSAhPT0gUFJFU0VSVkVfV1NfQVRUUl9OQU1FID8gYXR0cmlidXRlIDogbnVsbDtcbiAgfVxuXG4gIHZpc2l0VGV4dCh0ZXh0OiBodG1sLlRleHQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgY29uc3QgaXNOb3RCbGFuayA9IHRleHQudmFsdWUubWF0Y2goTk9fV1NfUkVHRVhQKTtcblxuICAgIGlmIChpc05vdEJsYW5rKSB7XG4gICAgICByZXR1cm4gbmV3IGh0bWwuVGV4dChcbiAgICAgICAgICByZXBsYWNlTmdzcCh0ZXh0LnZhbHVlKS5yZXBsYWNlKFdTX1JFUExBQ0VfUkVHRVhQLCAnICcpLCB0ZXh0LnNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRDb21tZW50KGNvbW1lbnQ6IGh0bWwuQ29tbWVudCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGNvbW1lbnQ7IH1cblxuICB2aXNpdEV4cGFuc2lvbihleHBhbnNpb246IGh0bWwuRXhwYW5zaW9uLCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gZXhwYW5zaW9uOyB9XG5cbiAgdmlzaXRFeHBhbnNpb25DYXNlKGV4cGFuc2lvbkNhc2U6IGh0bWwuRXhwYW5zaW9uQ2FzZSwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGV4cGFuc2lvbkNhc2U7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVdoaXRlc3BhY2VzKGh0bWxBc3RXaXRoRXJyb3JzOiBQYXJzZVRyZWVSZXN1bHQpOiBQYXJzZVRyZWVSZXN1bHQge1xuICByZXR1cm4gbmV3IFBhcnNlVHJlZVJlc3VsdChcbiAgICAgIGh0bWwudmlzaXRBbGwobmV3IFdoaXRlc3BhY2VWaXNpdG9yKCksIGh0bWxBc3RXaXRoRXJyb3JzLnJvb3ROb2RlcyksXG4gICAgICBodG1sQXN0V2l0aEVycm9ycy5lcnJvcnMpO1xufVxuIl19