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
        define("@angular/compiler/src/aot/formatted_error", ["require", "exports", "@angular/compiler/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require("@angular/compiler/src/util");
    var FORMATTED_MESSAGE = 'ngFormattedMessage';
    function indentStr(level) {
        if (level <= 0)
            return '';
        if (level < 6)
            return ['', ' ', '  ', '   ', '    ', '     '][level];
        var half = indentStr(Math.floor(level / 2));
        return half + half + (level % 2 === 1 ? ' ' : '');
    }
    function formatChain(chain, indent) {
        if (indent === void 0) { indent = 0; }
        if (!chain)
            return '';
        var position = chain.position ?
            chain.position.fileName + "(" + (chain.position.line + 1) + "," + (chain.position.column + 1) + ")" :
            '';
        var prefix = position && indent === 0 ? position + ": " : '';
        var postfix = position && indent !== 0 ? " at " + position : '';
        var message = "" + prefix + chain.message + postfix;
        return "" + indentStr(indent) + message + ((chain.next && ('\n' + formatChain(chain.next, indent + 2))) || '');
    }
    function formattedError(chain) {
        var message = formatChain(chain) + '.';
        var error = util_1.syntaxError(message);
        error[FORMATTED_MESSAGE] = true;
        error.chain = chain;
        error.position = chain.position;
        return error;
    }
    exports.formattedError = formattedError;
    function isFormattedError(error) {
        return !!error[FORMATTED_MESSAGE];
    }
    exports.isFormattedError = isFormattedError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0dGVkX2Vycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2FvdC9mb3JtYXR0ZWRfZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCxtREFBb0M7SUFtQnBDLElBQU0saUJBQWlCLEdBQUcsb0JBQW9CLENBQUM7SUFFL0MsbUJBQW1CLEtBQWE7UUFDOUIsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDMUIsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckUsSUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUMsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQscUJBQXFCLEtBQXdDLEVBQUUsTUFBa0I7UUFBbEIsdUJBQUEsRUFBQSxVQUFrQjtRQUMvRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDdEIsSUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFCLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxVQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFDLENBQUMsV0FBSSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBQyxDQUFDLE9BQUcsQ0FBQyxDQUFDO1lBQ25GLEVBQUUsQ0FBQztRQUNQLElBQU0sTUFBTSxHQUFHLFFBQVEsSUFBSSxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBSSxRQUFRLE9BQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQy9ELElBQU0sT0FBTyxHQUFHLFFBQVEsSUFBSSxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFPLFFBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2xFLElBQU0sT0FBTyxHQUFHLEtBQUcsTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBUyxDQUFDO1FBRXRELE1BQU0sQ0FBQyxLQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLElBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFFLENBQUM7SUFDL0csQ0FBQztJQUVELHdCQUErQixLQUE0QjtRQUN6RCxJQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQ3pDLElBQU0sS0FBSyxHQUFHLGtCQUFXLENBQUMsT0FBTyxDQUFtQixDQUFDO1FBQ3BELEtBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUN6QyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNwQixLQUFLLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFDaEMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNmLENBQUM7SUFQRCx3Q0FPQztJQUVELDBCQUFpQyxLQUFZO1FBQzNDLE1BQU0sQ0FBQyxDQUFDLENBQUUsS0FBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUZELDRDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3N5bnRheEVycm9yfSBmcm9tICcuLi91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbiB7XG4gIGZpbGVOYW1lOiBzdHJpbmc7XG4gIGxpbmU6IG51bWJlcjtcbiAgY29sdW1uOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRm9ybWF0dGVkTWVzc2FnZUNoYWluIHtcbiAgbWVzc2FnZTogc3RyaW5nO1xuICBwb3NpdGlvbj86IFBvc2l0aW9uO1xuICBuZXh0PzogRm9ybWF0dGVkTWVzc2FnZUNoYWluO1xufVxuXG5leHBvcnQgdHlwZSBGb3JtYXR0ZWRFcnJvciA9IEVycm9yICYge1xuICBjaGFpbjogRm9ybWF0dGVkTWVzc2FnZUNoYWluO1xuICBwb3NpdGlvbj86IFBvc2l0aW9uO1xufTtcblxuY29uc3QgRk9STUFUVEVEX01FU1NBR0UgPSAnbmdGb3JtYXR0ZWRNZXNzYWdlJztcblxuZnVuY3Rpb24gaW5kZW50U3RyKGxldmVsOiBudW1iZXIpOiBzdHJpbmcge1xuICBpZiAobGV2ZWwgPD0gMCkgcmV0dXJuICcnO1xuICBpZiAobGV2ZWwgPCA2KSByZXR1cm4gWycnLCAnICcsICcgICcsICcgICAnLCAnICAgICcsICcgICAgICddW2xldmVsXTtcbiAgY29uc3QgaGFsZiA9IGluZGVudFN0cihNYXRoLmZsb29yKGxldmVsIC8gMikpO1xuICByZXR1cm4gaGFsZiArIGhhbGYgKyAobGV2ZWwgJSAyID09PSAxID8gJyAnIDogJycpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRDaGFpbihjaGFpbjogRm9ybWF0dGVkTWVzc2FnZUNoYWluIHwgdW5kZWZpbmVkLCBpbmRlbnQ6IG51bWJlciA9IDApOiBzdHJpbmcge1xuICBpZiAoIWNoYWluKSByZXR1cm4gJyc7XG4gIGNvbnN0IHBvc2l0aW9uID0gY2hhaW4ucG9zaXRpb24gP1xuICAgICAgYCR7Y2hhaW4ucG9zaXRpb24uZmlsZU5hbWV9KCR7Y2hhaW4ucG9zaXRpb24ubGluZSsxfSwke2NoYWluLnBvc2l0aW9uLmNvbHVtbisxfSlgIDpcbiAgICAgICcnO1xuICBjb25zdCBwcmVmaXggPSBwb3NpdGlvbiAmJiBpbmRlbnQgPT09IDAgPyBgJHtwb3NpdGlvbn06IGAgOiAnJztcbiAgY29uc3QgcG9zdGZpeCA9IHBvc2l0aW9uICYmIGluZGVudCAhPT0gMCA/IGAgYXQgJHtwb3NpdGlvbn1gIDogJyc7XG4gIGNvbnN0IG1lc3NhZ2UgPSBgJHtwcmVmaXh9JHtjaGFpbi5tZXNzYWdlfSR7cG9zdGZpeH1gO1xuXG4gIHJldHVybiBgJHtpbmRlbnRTdHIoaW5kZW50KX0ke21lc3NhZ2V9JHsoY2hhaW4ubmV4dCAmJiAoJ1xcbicgKyBmb3JtYXRDaGFpbihjaGFpbi5uZXh0LCBpbmRlbnQgKyAyKSkpIHx8ICcnfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXR0ZWRFcnJvcihjaGFpbjogRm9ybWF0dGVkTWVzc2FnZUNoYWluKTogRm9ybWF0dGVkRXJyb3Ige1xuICBjb25zdCBtZXNzYWdlID0gZm9ybWF0Q2hhaW4oY2hhaW4pICsgJy4nO1xuICBjb25zdCBlcnJvciA9IHN5bnRheEVycm9yKG1lc3NhZ2UpIGFzIEZvcm1hdHRlZEVycm9yO1xuICAoZXJyb3IgYXMgYW55KVtGT1JNQVRURURfTUVTU0FHRV0gPSB0cnVlO1xuICBlcnJvci5jaGFpbiA9IGNoYWluO1xuICBlcnJvci5wb3NpdGlvbiA9IGNoYWluLnBvc2l0aW9uO1xuICByZXR1cm4gZXJyb3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Zvcm1hdHRlZEVycm9yKGVycm9yOiBFcnJvcik6IGVycm9yIGlzIEZvcm1hdHRlZEVycm9yIHtcbiAgcmV0dXJuICEhKGVycm9yIGFzIGFueSlbRk9STUFUVEVEX01FU1NBR0VdO1xufVxuIl19