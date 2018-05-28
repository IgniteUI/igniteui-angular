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
        define("@angular/compiler/src/ml_parser/icu_ast_expander", ["require", "exports", "tslib", "@angular/compiler/src/parse_util", "@angular/compiler/src/ml_parser/ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var parse_util_1 = require("@angular/compiler/src/parse_util");
    var html = require("@angular/compiler/src/ml_parser/ast");
    // http://cldr.unicode.org/index/cldr-spec/plural-rules
    var PLURAL_CASES = ['zero', 'one', 'two', 'few', 'many', 'other'];
    /**
     * Expands special forms into elements.
     *
     * For example,
     *
     * ```
     * { messages.length, plural,
     *   =0 {zero}
     *   =1 {one}
     *   other {more than one}
     * }
     * ```
     *
     * will be expanded into
     *
     * ```
     * <ng-container [ngPlural]="messages.length">
     *   <ng-template ngPluralCase="=0">zero</ng-template>
     *   <ng-template ngPluralCase="=1">one</ng-template>
     *   <ng-template ngPluralCase="other">more than one</ng-template>
     * </ng-container>
     * ```
     */
    function expandNodes(nodes) {
        var expander = new _Expander();
        return new ExpansionResult(html.visitAll(expander, nodes), expander.isExpanded, expander.errors);
    }
    exports.expandNodes = expandNodes;
    var ExpansionResult = /** @class */ (function () {
        function ExpansionResult(nodes, expanded, errors) {
            this.nodes = nodes;
            this.expanded = expanded;
            this.errors = errors;
        }
        return ExpansionResult;
    }());
    exports.ExpansionResult = ExpansionResult;
    var ExpansionError = /** @class */ (function (_super) {
        tslib_1.__extends(ExpansionError, _super);
        function ExpansionError(span, errorMsg) {
            return _super.call(this, span, errorMsg) || this;
        }
        return ExpansionError;
    }(parse_util_1.ParseError));
    exports.ExpansionError = ExpansionError;
    /**
     * Expand expansion forms (plural, select) to directives
     *
     * @internal
     */
    var _Expander = /** @class */ (function () {
        function _Expander() {
            this.isExpanded = false;
            this.errors = [];
        }
        _Expander.prototype.visitElement = function (element, context) {
            return new html.Element(element.name, element.attrs, html.visitAll(this, element.children), element.sourceSpan, element.startSourceSpan, element.endSourceSpan);
        };
        _Expander.prototype.visitAttribute = function (attribute, context) { return attribute; };
        _Expander.prototype.visitText = function (text, context) { return text; };
        _Expander.prototype.visitComment = function (comment, context) { return comment; };
        _Expander.prototype.visitExpansion = function (icu, context) {
            this.isExpanded = true;
            return icu.type == 'plural' ? _expandPluralForm(icu, this.errors) :
                _expandDefaultForm(icu, this.errors);
        };
        _Expander.prototype.visitExpansionCase = function (icuCase, context) {
            throw new Error('Should not be reached');
        };
        return _Expander;
    }());
    // Plural forms are expanded to `NgPlural` and `NgPluralCase`s
    function _expandPluralForm(ast, errors) {
        var children = ast.cases.map(function (c) {
            if (PLURAL_CASES.indexOf(c.value) == -1 && !c.value.match(/^=\d+$/)) {
                errors.push(new ExpansionError(c.valueSourceSpan, "Plural cases should be \"=<number>\" or one of " + PLURAL_CASES.join(", ")));
            }
            var expansionResult = expandNodes(c.expression);
            errors.push.apply(errors, tslib_1.__spread(expansionResult.errors));
            return new html.Element("ng-template", [new html.Attribute('ngPluralCase', "" + c.value, c.valueSourceSpan)], expansionResult.nodes, c.sourceSpan, c.sourceSpan, c.sourceSpan);
        });
        var switchAttr = new html.Attribute('[ngPlural]', ast.switchValue, ast.switchValueSourceSpan);
        return new html.Element('ng-container', [switchAttr], children, ast.sourceSpan, ast.sourceSpan, ast.sourceSpan);
    }
    // ICU messages (excluding plural form) are expanded to `NgSwitch`  and `NgSwitchCase`s
    function _expandDefaultForm(ast, errors) {
        var children = ast.cases.map(function (c) {
            var expansionResult = expandNodes(c.expression);
            errors.push.apply(errors, tslib_1.__spread(expansionResult.errors));
            if (c.value === 'other') {
                // other is the default case when no values match
                return new html.Element("ng-template", [new html.Attribute('ngSwitchDefault', '', c.valueSourceSpan)], expansionResult.nodes, c.sourceSpan, c.sourceSpan, c.sourceSpan);
            }
            return new html.Element("ng-template", [new html.Attribute('ngSwitchCase', "" + c.value, c.valueSourceSpan)], expansionResult.nodes, c.sourceSpan, c.sourceSpan, c.sourceSpan);
        });
        var switchAttr = new html.Attribute('[ngSwitch]', ast.switchValue, ast.switchValueSourceSpan);
        return new html.Element('ng-container', [switchAttr], children, ast.sourceSpan, ast.sourceSpan, ast.sourceSpan);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWN1X2FzdF9leHBhbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9tbF9wYXJzZXIvaWN1X2FzdF9leHBhbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwrREFBMEQ7SUFFMUQsMERBQThCO0lBRTlCLHVEQUF1RDtJQUN2RCxJQUFNLFlBQVksR0FBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFOUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FzQkc7SUFDSCxxQkFBNEIsS0FBa0I7UUFDNUMsSUFBTSxRQUFRLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUNqQyxNQUFNLENBQUMsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUUsUUFBUSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkcsQ0FBQztJQUhELGtDQUdDO0lBRUQ7UUFDRSx5QkFBbUIsS0FBa0IsRUFBUyxRQUFpQixFQUFTLE1BQW9CO1lBQXpFLFVBQUssR0FBTCxLQUFLLENBQWE7WUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFTO1lBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUFHLENBQUM7UUFDbEcsc0JBQUM7SUFBRCxDQUFDLEFBRkQsSUFFQztJQUZZLDBDQUFlO0lBSTVCO1FBQW9DLDBDQUFVO1FBQzVDLHdCQUFZLElBQXFCLEVBQUUsUUFBZ0I7bUJBQUksa0JBQU0sSUFBSSxFQUFFLFFBQVEsQ0FBQztRQUFFLENBQUM7UUFDakYscUJBQUM7SUFBRCxDQUFDLEFBRkQsQ0FBb0MsdUJBQVUsR0FFN0M7SUFGWSx3Q0FBYztJQUkzQjs7OztPQUlHO0lBQ0g7UUFB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RyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDaEcsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FDbkIsY0FBYyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDOUYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQYXJzZUVycm9yLCBQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuXG5pbXBvcnQgKiBhcyBodG1sIGZyb20gJy4vYXN0JztcblxuLy8gaHR0cDovL2NsZHIudW5pY29kZS5vcmcvaW5kZXgvY2xkci1zcGVjL3BsdXJhbC1ydWxlc1xuY29uc3QgUExVUkFMX0NBU0VTOiBzdHJpbmdbXSA9IFsnemVybycsICdvbmUnLCAndHdvJywgJ2ZldycsICdtYW55JywgJ290aGVyJ107XG5cbi8qKlxuICogRXhwYW5kcyBzcGVjaWFsIGZvcm1zIGludG8gZWxlbWVudHMuXG4gKlxuICogRm9yIGV4YW1wbGUsXG4gKlxuICogYGBgXG4gKiB7IG1lc3NhZ2VzLmxlbmd0aCwgcGx1cmFsLFxuICogICA9MCB7emVyb31cbiAqICAgPTEge29uZX1cbiAqICAgb3RoZXIge21vcmUgdGhhbiBvbmV9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiB3aWxsIGJlIGV4cGFuZGVkIGludG9cbiAqXG4gKiBgYGBcbiAqIDxuZy1jb250YWluZXIgW25nUGx1cmFsXT1cIm1lc3NhZ2VzLmxlbmd0aFwiPlxuICogICA8bmctdGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiPTBcIj56ZXJvPC9uZy10ZW1wbGF0ZT5cbiAqICAgPG5nLXRlbXBsYXRlIG5nUGx1cmFsQ2FzZT1cIj0xXCI+b25lPC9uZy10ZW1wbGF0ZT5cbiAqICAgPG5nLXRlbXBsYXRlIG5nUGx1cmFsQ2FzZT1cIm90aGVyXCI+bW9yZSB0aGFuIG9uZTwvbmctdGVtcGxhdGU+XG4gKiA8L25nLWNvbnRhaW5lcj5cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhwYW5kTm9kZXMobm9kZXM6IGh0bWwuTm9kZVtdKTogRXhwYW5zaW9uUmVzdWx0IHtcbiAgY29uc3QgZXhwYW5kZXIgPSBuZXcgX0V4cGFuZGVyKCk7XG4gIHJldHVybiBuZXcgRXhwYW5zaW9uUmVzdWx0KGh0bWwudmlzaXRBbGwoZXhwYW5kZXIsIG5vZGVzKSwgZXhwYW5kZXIuaXNFeHBhbmRlZCwgZXhwYW5kZXIuZXJyb3JzKTtcbn1cblxuZXhwb3J0IGNsYXNzIEV4cGFuc2lvblJlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBub2RlczogaHRtbC5Ob2RlW10sIHB1YmxpYyBleHBhbmRlZDogYm9vbGVhbiwgcHVibGljIGVycm9yczogUGFyc2VFcnJvcltdKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgRXhwYW5zaW9uRXJyb3IgZXh0ZW5kcyBQYXJzZUVycm9yIHtcbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTb3VyY2VTcGFuLCBlcnJvck1zZzogc3RyaW5nKSB7IHN1cGVyKHNwYW4sIGVycm9yTXNnKTsgfVxufVxuXG4vKipcbiAqIEV4cGFuZCBleHBhbnNpb24gZm9ybXMgKHBsdXJhbCwgc2VsZWN0KSB0byBkaXJlY3RpdmVzXG4gKlxuICogQGludGVybmFsXG4gKi9cbmNsYXNzIF9FeHBhbmRlciBpbXBsZW1lbnRzIGh0bWwuVmlzaXRvciB7XG4gIGlzRXhwYW5kZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgZXJyb3JzOiBQYXJzZUVycm9yW10gPSBbXTtcblxuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogaHRtbC5FbGVtZW50LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgaHRtbC5FbGVtZW50KFxuICAgICAgICBlbGVtZW50Lm5hbWUsIGVsZW1lbnQuYXR0cnMsIGh0bWwudmlzaXRBbGwodGhpcywgZWxlbWVudC5jaGlsZHJlbiksIGVsZW1lbnQuc291cmNlU3BhbixcbiAgICAgICAgZWxlbWVudC5zdGFydFNvdXJjZVNwYW4sIGVsZW1lbnQuZW5kU291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdEF0dHJpYnV0ZShhdHRyaWJ1dGU6IGh0bWwuQXR0cmlidXRlLCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXR0cmlidXRlOyB9XG5cbiAgdmlzaXRUZXh0KHRleHQ6IGh0bWwuVGV4dCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIHRleHQ7IH1cblxuICB2aXNpdENvbW1lbnQoY29tbWVudDogaHRtbC5Db21tZW50LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gY29tbWVudDsgfVxuXG4gIHZpc2l0RXhwYW5zaW9uKGljdTogaHRtbC5FeHBhbnNpb24sIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy5pc0V4cGFuZGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gaWN1LnR5cGUgPT0gJ3BsdXJhbCcgPyBfZXhwYW5kUGx1cmFsRm9ybShpY3UsIHRoaXMuZXJyb3JzKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2V4cGFuZERlZmF1bHRGb3JtKGljdSwgdGhpcy5lcnJvcnMpO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb25DYXNlKGljdUNhc2U6IGh0bWwuRXhwYW5zaW9uQ2FzZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nob3VsZCBub3QgYmUgcmVhY2hlZCcpO1xuICB9XG59XG5cbi8vIFBsdXJhbCBmb3JtcyBhcmUgZXhwYW5kZWQgdG8gYE5nUGx1cmFsYCBhbmQgYE5nUGx1cmFsQ2FzZWBzXG5mdW5jdGlvbiBfZXhwYW5kUGx1cmFsRm9ybShhc3Q6IGh0bWwuRXhwYW5zaW9uLCBlcnJvcnM6IFBhcnNlRXJyb3JbXSk6IGh0bWwuRWxlbWVudCB7XG4gIGNvbnN0IGNoaWxkcmVuID0gYXN0LmNhc2VzLm1hcChjID0+IHtcbiAgICBpZiAoUExVUkFMX0NBU0VTLmluZGV4T2YoYy52YWx1ZSkgPT0gLTEgJiYgIWMudmFsdWUubWF0Y2goL149XFxkKyQvKSkge1xuICAgICAgZXJyb3JzLnB1c2gobmV3IEV4cGFuc2lvbkVycm9yKFxuICAgICAgICAgIGMudmFsdWVTb3VyY2VTcGFuLFxuICAgICAgICAgIGBQbHVyYWwgY2FzZXMgc2hvdWxkIGJlIFwiPTxudW1iZXI+XCIgb3Igb25lIG9mICR7UExVUkFMX0NBU0VTLmpvaW4oXCIsIFwiKX1gKSk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhwYW5zaW9uUmVzdWx0ID0gZXhwYW5kTm9kZXMoYy5leHByZXNzaW9uKTtcbiAgICBlcnJvcnMucHVzaCguLi5leHBhbnNpb25SZXN1bHQuZXJyb3JzKTtcblxuICAgIHJldHVybiBuZXcgaHRtbC5FbGVtZW50KFxuICAgICAgICBgbmctdGVtcGxhdGVgLCBbbmV3IGh0bWwuQXR0cmlidXRlKCduZ1BsdXJhbENhc2UnLCBgJHtjLnZhbHVlfWAsIGMudmFsdWVTb3VyY2VTcGFuKV0sXG4gICAgICAgIGV4cGFuc2lvblJlc3VsdC5ub2RlcywgYy5zb3VyY2VTcGFuLCBjLnNvdXJjZVNwYW4sIGMuc291cmNlU3Bhbik7XG4gIH0pO1xuICBjb25zdCBzd2l0Y2hBdHRyID0gbmV3IGh0bWwuQXR0cmlidXRlKCdbbmdQbHVyYWxdJywgYXN0LnN3aXRjaFZhbHVlLCBhc3Quc3dpdGNoVmFsdWVTb3VyY2VTcGFuKTtcbiAgcmV0dXJuIG5ldyBodG1sLkVsZW1lbnQoXG4gICAgICAnbmctY29udGFpbmVyJywgW3N3aXRjaEF0dHJdLCBjaGlsZHJlbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5zb3VyY2VTcGFuLCBhc3Quc291cmNlU3Bhbik7XG59XG5cbi8vIElDVSBtZXNzYWdlcyAoZXhjbHVkaW5nIHBsdXJhbCBmb3JtKSBhcmUgZXhwYW5kZWQgdG8gYE5nU3dpdGNoYCAgYW5kIGBOZ1N3aXRjaENhc2Vgc1xuZnVuY3Rpb24gX2V4cGFuZERlZmF1bHRGb3JtKGFzdDogaHRtbC5FeHBhbnNpb24sIGVycm9yczogUGFyc2VFcnJvcltdKTogaHRtbC5FbGVtZW50IHtcbiAgY29uc3QgY2hpbGRyZW4gPSBhc3QuY2FzZXMubWFwKGMgPT4ge1xuICAgIGNvbnN0IGV4cGFuc2lvblJlc3VsdCA9IGV4cGFuZE5vZGVzKGMuZXhwcmVzc2lvbik7XG4gICAgZXJyb3JzLnB1c2goLi4uZXhwYW5zaW9uUmVzdWx0LmVycm9ycyk7XG5cbiAgICBpZiAoYy52YWx1ZSA9PT0gJ290aGVyJykge1xuICAgICAgLy8gb3RoZXIgaXMgdGhlIGRlZmF1bHQgY2FzZSB3aGVuIG5vIHZhbHVlcyBtYXRjaFxuICAgICAgcmV0dXJuIG5ldyBodG1sLkVsZW1lbnQoXG4gICAgICAgICAgYG5nLXRlbXBsYXRlYCwgW25ldyBodG1sLkF0dHJpYnV0ZSgnbmdTd2l0Y2hEZWZhdWx0JywgJycsIGMudmFsdWVTb3VyY2VTcGFuKV0sXG4gICAgICAgICAgZXhwYW5zaW9uUmVzdWx0Lm5vZGVzLCBjLnNvdXJjZVNwYW4sIGMuc291cmNlU3BhbiwgYy5zb3VyY2VTcGFuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IGh0bWwuRWxlbWVudChcbiAgICAgICAgYG5nLXRlbXBsYXRlYCwgW25ldyBodG1sLkF0dHJpYnV0ZSgnbmdTd2l0Y2hDYXNlJywgYCR7Yy52YWx1ZX1gLCBjLnZhbHVlU291cmNlU3BhbildLFxuICAgICAgICBleHBhbnNpb25SZXN1bHQubm9kZXMsIGMuc291cmNlU3BhbiwgYy5zb3VyY2VTcGFuLCBjLnNvdXJjZVNwYW4pO1xuICB9KTtcbiAgY29uc3Qgc3dpdGNoQXR0ciA9IG5ldyBodG1sLkF0dHJpYnV0ZSgnW25nU3dpdGNoXScsIGFzdC5zd2l0Y2hWYWx1ZSwgYXN0LnN3aXRjaFZhbHVlU291cmNlU3Bhbik7XG4gIHJldHVybiBuZXcgaHRtbC5FbGVtZW50KFxuICAgICAgJ25nLWNvbnRhaW5lcicsIFtzd2l0Y2hBdHRyXSwgY2hpbGRyZW4sIGFzdC5zb3VyY2VTcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0LnNvdXJjZVNwYW4pO1xufVxuIl19