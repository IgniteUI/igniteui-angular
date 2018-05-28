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
        define("@angular/compiler/src/ml_parser/xml_parser", ["require", "exports", "tslib", "@angular/compiler/src/ml_parser/parser", "@angular/compiler/src/ml_parser/xml_tags", "@angular/compiler/src/ml_parser/parser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var parser_1 = require("@angular/compiler/src/ml_parser/parser");
    var xml_tags_1 = require("@angular/compiler/src/ml_parser/xml_tags");
    var parser_2 = require("@angular/compiler/src/ml_parser/parser");
    exports.ParseTreeResult = parser_2.ParseTreeResult;
    exports.TreeError = parser_2.TreeError;
    var XmlParser = /** @class */ (function (_super) {
        tslib_1.__extends(XmlParser, _super);
        function XmlParser() {
            return _super.call(this, xml_tags_1.getXmlTagDefinition) || this;
        }
        XmlParser.prototype.parse = function (source, url, parseExpansionForms) {
            if (parseExpansionForms === void 0) { parseExpansionForms = false; }
            return _super.prototype.parse.call(this, source, url, parseExpansionForms);
        };
        return XmlParser;
    }(parser_1.Parser));
    exports.XmlParser = XmlParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1sX3BhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9tbF9wYXJzZXIveG1sX3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxpRUFBaUQ7SUFDakQscUVBQStDO0lBRS9DLGlFQUFvRDtJQUE1QyxtQ0FBQSxlQUFlLENBQUE7SUFBRSw2QkFBQSxTQUFTLENBQUE7SUFFbEM7UUFBK0IscUNBQU07UUFDbkM7bUJBQWdCLGtCQUFNLDhCQUFtQixDQUFDO1FBQUUsQ0FBQztRQUU3Qyx5QkFBSyxHQUFMLFVBQU0sTUFBYyxFQUFFLEdBQVcsRUFBRSxtQkFBb0M7WUFBcEMsb0NBQUEsRUFBQSwyQkFBb0M7WUFDckUsTUFBTSxDQUFDLGlCQUFNLEtBQUssWUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLG1CQUFtQixDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUNILGdCQUFDO0lBQUQsQ0FBQyxBQU5ELENBQStCLGVBQU0sR0FNcEM7SUFOWSw4QkFBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQYXJzZVRyZWVSZXN1bHQsIFBhcnNlcn0gZnJvbSAnLi9wYXJzZXInO1xuaW1wb3J0IHtnZXRYbWxUYWdEZWZpbml0aW9ufSBmcm9tICcuL3htbF90YWdzJztcblxuZXhwb3J0IHtQYXJzZVRyZWVSZXN1bHQsIFRyZWVFcnJvcn0gZnJvbSAnLi9wYXJzZXInO1xuXG5leHBvcnQgY2xhc3MgWG1sUGFyc2VyIGV4dGVuZHMgUGFyc2VyIHtcbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKGdldFhtbFRhZ0RlZmluaXRpb24pOyB9XG5cbiAgcGFyc2Uoc291cmNlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBwYXJzZUV4cGFuc2lvbkZvcm1zOiBib29sZWFuID0gZmFsc2UpOiBQYXJzZVRyZWVSZXN1bHQge1xuICAgIHJldHVybiBzdXBlci5wYXJzZShzb3VyY2UsIHVybCwgcGFyc2VFeHBhbnNpb25Gb3Jtcyk7XG4gIH1cbn1cbiJdfQ==