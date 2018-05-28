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
        define("@angular/compiler/src/schema/dom_security_schema", ["require", "exports", "tslib", "@angular/compiler/src/core"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var core_1 = require("@angular/compiler/src/core");
    // =================================================================================================
    // =================================================================================================
    // =========== S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P  ===========
    // =================================================================================================
    // =================================================================================================
    //
    //        DO NOT EDIT THIS LIST OF SECURITY SENSITIVE PROPERTIES WITHOUT A SECURITY REVIEW!
    //                               Reach out to mprobst for details.
    //
    // =================================================================================================
    /** Map from tagName|propertyName SecurityContext. Properties applying to all tags use '*'. */
    exports.SECURITY_SCHEMA = {};
    function registerContext(ctx, specs) {
        try {
            for (var specs_1 = tslib_1.__values(specs), specs_1_1 = specs_1.next(); !specs_1_1.done; specs_1_1 = specs_1.next()) {
                var spec = specs_1_1.value;
                exports.SECURITY_SCHEMA[spec.toLowerCase()] = ctx;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (specs_1_1 && !specs_1_1.done && (_a = specs_1.return)) _a.call(specs_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var e_1, _a;
    }
    // Case is insignificant below, all element and attribute names are lower-cased for lookup.
    registerContext(core_1.SecurityContext.HTML, [
        'iframe|srcdoc',
        '*|innerHTML',
        '*|outerHTML',
    ]);
    registerContext(core_1.SecurityContext.STYLE, ['*|style']);
    // NB: no SCRIPT contexts here, they are never allowed due to the parser stripping them.
    registerContext(core_1.SecurityContext.URL, [
        '*|formAction', 'area|href', 'area|ping', 'audio|src', 'a|href',
        'a|ping', 'blockquote|cite', 'body|background', 'del|cite', 'form|action',
        'img|src', 'img|srcset', 'input|src', 'ins|cite', 'q|cite',
        'source|src', 'source|srcset', 'track|src', 'video|poster', 'video|src',
    ]);
    registerContext(core_1.SecurityContext.RESOURCE_URL, [
        'applet|code',
        'applet|codebase',
        'base|href',
        'embed|src',
        'frame|src',
        'head|profile',
        'html|manifest',
        'iframe|src',
        'link|href',
        'media|src',
        'object|codebase',
        'object|data',
        'script|src',
    ]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX3NlY3VyaXR5X3NjaGVtYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9zY2hlbWEvZG9tX3NlY3VyaXR5X3NjaGVtYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxtREFBd0M7SUFFeEMsb0dBQW9HO0lBQ3BHLG9HQUFvRztJQUNwRyxvR0FBb0c7SUFDcEcsb0dBQW9HO0lBQ3BHLG9HQUFvRztJQUNwRyxFQUFFO0lBQ0YsMkZBQTJGO0lBQzNGLGtFQUFrRTtJQUNsRSxFQUFFO0lBQ0Ysb0dBQW9HO0lBRXBHLDhGQUE4RjtJQUNqRixRQUFBLGVBQWUsR0FBbUMsRUFBRSxDQUFDO0lBRWxFLHlCQUF5QixHQUFvQixFQUFFLEtBQWU7O1lBQzVELEdBQUcsQ0FBQyxDQUFlLElBQUEsVUFBQSxpQkFBQSxLQUFLLENBQUEsNEJBQUE7Z0JBQW5CLElBQU0sSUFBSSxrQkFBQTtnQkFBVyx1QkFBZSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQzthQUFBOzs7Ozs7Ozs7O0lBQ3RFLENBQUM7SUFFRCwyRkFBMkY7SUFFM0YsZUFBZSxDQUFDLHNCQUFlLENBQUMsSUFBSSxFQUFFO1FBQ3BDLGVBQWU7UUFDZixhQUFhO1FBQ2IsYUFBYTtLQUNkLENBQUMsQ0FBQztJQUNILGVBQWUsQ0FBQyxzQkFBZSxDQUFDLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsd0ZBQXdGO0lBQ3hGLGVBQWUsQ0FBQyxzQkFBZSxDQUFDLEdBQUcsRUFBRTtRQUNuQyxjQUFjLEVBQUUsV0FBVyxFQUFRLFdBQVcsRUFBUSxXQUFXLEVBQUssUUFBUTtRQUM5RSxRQUFRLEVBQVEsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsVUFBVSxFQUFNLGFBQWE7UUFDbkYsU0FBUyxFQUFPLFlBQVksRUFBTyxXQUFXLEVBQVEsVUFBVSxFQUFNLFFBQVE7UUFDOUUsWUFBWSxFQUFJLGVBQWUsRUFBSSxXQUFXLEVBQVEsY0FBYyxFQUFFLFdBQVc7S0FDbEYsQ0FBQyxDQUFDO0lBQ0gsZUFBZSxDQUFDLHNCQUFlLENBQUMsWUFBWSxFQUFFO1FBQzVDLGFBQWE7UUFDYixpQkFBaUI7UUFDakIsV0FBVztRQUNYLFdBQVc7UUFDWCxXQUFXO1FBQ1gsY0FBYztRQUNkLGVBQWU7UUFDZixZQUFZO1FBQ1osV0FBVztRQUNYLFdBQVc7UUFDWCxpQkFBaUI7UUFDakIsYUFBYTtRQUNiLFlBQVk7S0FDYixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U2VjdXJpdHlDb250ZXh0fSBmcm9tICcuLi9jb3JlJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gPT09PT09PT09PT0gUyBUIE8gUCAgIC0gIFMgVCBPIFAgICAtICBTIFQgTyBQICAgLSAgUyBUIE8gUCAgIC0gIFMgVCBPIFAgICAtICBTIFQgTyBQICA9PT09PT09PT09PVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy9cbi8vICAgICAgICBETyBOT1QgRURJVCBUSElTIExJU1QgT0YgU0VDVVJJVFkgU0VOU0lUSVZFIFBST1BFUlRJRVMgV0lUSE9VVCBBIFNFQ1VSSVRZIFJFVklFVyFcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWNoIG91dCB0byBtcHJvYnN0IGZvciBkZXRhaWxzLlxuLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLyoqIE1hcCBmcm9tIHRhZ05hbWV8cHJvcGVydHlOYW1lIFNlY3VyaXR5Q29udGV4dC4gUHJvcGVydGllcyBhcHBseWluZyB0byBhbGwgdGFncyB1c2UgJyonLiAqL1xuZXhwb3J0IGNvbnN0IFNFQ1VSSVRZX1NDSEVNQToge1trOiBzdHJpbmddOiBTZWN1cml0eUNvbnRleHR9ID0ge307XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyQ29udGV4dChjdHg6IFNlY3VyaXR5Q29udGV4dCwgc3BlY3M6IHN0cmluZ1tdKSB7XG4gIGZvciAoY29uc3Qgc3BlYyBvZiBzcGVjcykgU0VDVVJJVFlfU0NIRU1BW3NwZWMudG9Mb3dlckNhc2UoKV0gPSBjdHg7XG59XG5cbi8vIENhc2UgaXMgaW5zaWduaWZpY2FudCBiZWxvdywgYWxsIGVsZW1lbnQgYW5kIGF0dHJpYnV0ZSBuYW1lcyBhcmUgbG93ZXItY2FzZWQgZm9yIGxvb2t1cC5cblxucmVnaXN0ZXJDb250ZXh0KFNlY3VyaXR5Q29udGV4dC5IVE1MLCBbXG4gICdpZnJhbWV8c3JjZG9jJyxcbiAgJyp8aW5uZXJIVE1MJyxcbiAgJyp8b3V0ZXJIVE1MJyxcbl0pO1xucmVnaXN0ZXJDb250ZXh0KFNlY3VyaXR5Q29udGV4dC5TVFlMRSwgWycqfHN0eWxlJ10pO1xuLy8gTkI6IG5vIFNDUklQVCBjb250ZXh0cyBoZXJlLCB0aGV5IGFyZSBuZXZlciBhbGxvd2VkIGR1ZSB0byB0aGUgcGFyc2VyIHN0cmlwcGluZyB0aGVtLlxucmVnaXN0ZXJDb250ZXh0KFNlY3VyaXR5Q29udGV4dC5VUkwsIFtcbiAgJyp8Zm9ybUFjdGlvbicsICdhcmVhfGhyZWYnLCAgICAgICAnYXJlYXxwaW5nJywgICAgICAgJ2F1ZGlvfHNyYycsICAgICdhfGhyZWYnLFxuICAnYXxwaW5nJywgICAgICAgJ2Jsb2NrcXVvdGV8Y2l0ZScsICdib2R5fGJhY2tncm91bmQnLCAnZGVsfGNpdGUnLCAgICAgJ2Zvcm18YWN0aW9uJyxcbiAgJ2ltZ3xzcmMnLCAgICAgICdpbWd8c3Jjc2V0JywgICAgICAnaW5wdXR8c3JjJywgICAgICAgJ2luc3xjaXRlJywgICAgICdxfGNpdGUnLFxuICAnc291cmNlfHNyYycsICAgJ3NvdXJjZXxzcmNzZXQnLCAgICd0cmFja3xzcmMnLCAgICAgICAndmlkZW98cG9zdGVyJywgJ3ZpZGVvfHNyYycsXG5dKTtcbnJlZ2lzdGVyQ29udGV4dChTZWN1cml0eUNvbnRleHQuUkVTT1VSQ0VfVVJMLCBbXG4gICdhcHBsZXR8Y29kZScsXG4gICdhcHBsZXR8Y29kZWJhc2UnLFxuICAnYmFzZXxocmVmJyxcbiAgJ2VtYmVkfHNyYycsXG4gICdmcmFtZXxzcmMnLFxuICAnaGVhZHxwcm9maWxlJyxcbiAgJ2h0bWx8bWFuaWZlc3QnLFxuICAnaWZyYW1lfHNyYycsXG4gICdsaW5rfGhyZWYnLFxuICAnbWVkaWF8c3JjJyxcbiAgJ29iamVjdHxjb2RlYmFzZScsXG4gICdvYmplY3R8ZGF0YScsXG4gICdzY3JpcHR8c3JjJyxcbl0pO1xuIl19