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
        define("@angular/compiler/src/config", ["require", "exports", "@angular/compiler/src/core", "@angular/compiler/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var core_1 = require("@angular/compiler/src/core");
    var util_1 = require("@angular/compiler/src/util");
    var CompilerConfig = /** @class */ (function () {
        function CompilerConfig(_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.defaultEncapsulation, defaultEncapsulation = _c === void 0 ? core_1.ViewEncapsulation.Emulated : _c, _d = _b.useJit, useJit = _d === void 0 ? true : _d, _e = _b.jitDevMode, jitDevMode = _e === void 0 ? false : _e, _f = _b.missingTranslation, missingTranslation = _f === void 0 ? null : _f, preserveWhitespaces = _b.preserveWhitespaces, strictInjectionParameters = _b.strictInjectionParameters;
            this.defaultEncapsulation = defaultEncapsulation;
            this.useJit = !!useJit;
            this.jitDevMode = !!jitDevMode;
            this.missingTranslation = missingTranslation;
            this.preserveWhitespaces = preserveWhitespacesDefault(util_1.noUndefined(preserveWhitespaces));
            this.strictInjectionParameters = strictInjectionParameters === true;
        }
        return CompilerConfig;
    }());
    exports.CompilerConfig = CompilerConfig;
    function preserveWhitespacesDefault(preserveWhitespacesOption, defaultSetting) {
        if (defaultSetting === void 0) { defaultSetting = false; }
        return preserveWhitespacesOption === null ? defaultSetting : preserveWhitespacesOption;
    }
    exports.preserveWhitespacesDefault = preserveWhitespacesDefault;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUdILG1EQUFxRTtJQUdyRSxtREFBbUM7SUFFbkM7UUFRRSx3QkFDSSxFQVFNO2dCQVJOLDRCQVFNLEVBUkwsNEJBQWlELEVBQWpELDZFQUFpRCxFQUFFLGNBQWEsRUFBYixrQ0FBYSxFQUFFLGtCQUFrQixFQUFsQix1Q0FBa0IsRUFDcEYsMEJBQXlCLEVBQXpCLDhDQUF5QixFQUFFLDRDQUFtQixFQUFFLHdEQUF5QjtZQVE1RSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsb0JBQW9CLENBQUM7WUFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQztZQUMvQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7WUFDN0MsSUFBSSxDQUFDLG1CQUFtQixHQUFHLDBCQUEwQixDQUFDLGtCQUFXLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLElBQUksQ0FBQyx5QkFBeUIsR0FBRyx5QkFBeUIsS0FBSyxJQUFJLENBQUM7UUFDdEUsQ0FBQztRQUNILHFCQUFDO0lBQUQsQ0FBQyxBQXpCRCxJQXlCQztJQXpCWSx3Q0FBYztJQTJCM0Isb0NBQ0kseUJBQXlDLEVBQUUsY0FBc0I7UUFBdEIsK0JBQUEsRUFBQSxzQkFBc0I7UUFDbkUsTUFBTSxDQUFDLHlCQUF5QixLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQztJQUN6RixDQUFDO0lBSEQsZ0VBR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YX0gZnJvbSAnLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7TWlzc2luZ1RyYW5zbGF0aW9uU3RyYXRlZ3ksIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi9pZGVudGlmaWVycyc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtub1VuZGVmaW5lZH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGNsYXNzIENvbXBpbGVyQ29uZmlnIHtcbiAgcHVibGljIGRlZmF1bHRFbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbnxudWxsO1xuICBwdWJsaWMgdXNlSml0OiBib29sZWFuO1xuICBwdWJsaWMgaml0RGV2TW9kZTogYm9vbGVhbjtcbiAgcHVibGljIG1pc3NpbmdUcmFuc2xhdGlvbjogTWlzc2luZ1RyYW5zbGF0aW9uU3RyYXRlZ3l8bnVsbDtcbiAgcHVibGljIHByZXNlcnZlV2hpdGVzcGFjZXM6IGJvb2xlYW47XG4gIHB1YmxpYyBzdHJpY3RJbmplY3Rpb25QYXJhbWV0ZXJzOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAge2RlZmF1bHRFbmNhcHN1bGF0aW9uID0gVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQsIHVzZUppdCA9IHRydWUsIGppdERldk1vZGUgPSBmYWxzZSxcbiAgICAgICBtaXNzaW5nVHJhbnNsYXRpb24gPSBudWxsLCBwcmVzZXJ2ZVdoaXRlc3BhY2VzLCBzdHJpY3RJbmplY3Rpb25QYXJhbWV0ZXJzfToge1xuICAgICAgICBkZWZhdWx0RW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uLFxuICAgICAgICB1c2VKaXQ/OiBib29sZWFuLFxuICAgICAgICBqaXREZXZNb2RlPzogYm9vbGVhbixcbiAgICAgICAgbWlzc2luZ1RyYW5zbGF0aW9uPzogTWlzc2luZ1RyYW5zbGF0aW9uU3RyYXRlZ3ksXG4gICAgICAgIHByZXNlcnZlV2hpdGVzcGFjZXM/OiBib29sZWFuLFxuICAgICAgICBzdHJpY3RJbmplY3Rpb25QYXJhbWV0ZXJzPzogYm9vbGVhbixcbiAgICAgIH0gPSB7fSkge1xuICAgIHRoaXMuZGVmYXVsdEVuY2Fwc3VsYXRpb24gPSBkZWZhdWx0RW5jYXBzdWxhdGlvbjtcbiAgICB0aGlzLnVzZUppdCA9ICEhdXNlSml0O1xuICAgIHRoaXMuaml0RGV2TW9kZSA9ICEhaml0RGV2TW9kZTtcbiAgICB0aGlzLm1pc3NpbmdUcmFuc2xhdGlvbiA9IG1pc3NpbmdUcmFuc2xhdGlvbjtcbiAgICB0aGlzLnByZXNlcnZlV2hpdGVzcGFjZXMgPSBwcmVzZXJ2ZVdoaXRlc3BhY2VzRGVmYXVsdChub1VuZGVmaW5lZChwcmVzZXJ2ZVdoaXRlc3BhY2VzKSk7XG4gICAgdGhpcy5zdHJpY3RJbmplY3Rpb25QYXJhbWV0ZXJzID0gc3RyaWN0SW5qZWN0aW9uUGFyYW1ldGVycyA9PT0gdHJ1ZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlc2VydmVXaGl0ZXNwYWNlc0RlZmF1bHQoXG4gICAgcHJlc2VydmVXaGl0ZXNwYWNlc09wdGlvbjogYm9vbGVhbiB8IG51bGwsIGRlZmF1bHRTZXR0aW5nID0gZmFsc2UpOiBib29sZWFuIHtcbiAgcmV0dXJuIHByZXNlcnZlV2hpdGVzcGFjZXNPcHRpb24gPT09IG51bGwgPyBkZWZhdWx0U2V0dGluZyA6IHByZXNlcnZlV2hpdGVzcGFjZXNPcHRpb247XG59XG4iXX0=