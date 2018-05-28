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
        define("@angular/compiler/src/assertions", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function assertArrayOfStrings(identifier, value) {
        if (value == null) {
            return;
        }
        if (!Array.isArray(value)) {
            throw new Error("Expected '" + identifier + "' to be an array of strings.");
        }
        for (var i = 0; i < value.length; i += 1) {
            if (typeof value[i] !== 'string') {
                throw new Error("Expected '" + identifier + "' to be an array of strings.");
            }
        }
    }
    exports.assertArrayOfStrings = assertArrayOfStrings;
    var INTERPOLATION_BLACKLIST_REGEXPS = [
        /^\s*$/,
        /[<>]/,
        /^[{}]$/,
        /&(#|[a-z])/i,
        /^\/\//,
    ];
    function assertInterpolationSymbols(identifier, value) {
        if (value != null && !(Array.isArray(value) && value.length == 2)) {
            throw new Error("Expected '" + identifier + "' to be an array, [start, end].");
        }
        else if (value != null) {
            var start_1 = value[0];
            var end_1 = value[1];
            // black list checking
            INTERPOLATION_BLACKLIST_REGEXPS.forEach(function (regexp) {
                if (regexp.test(start_1) || regexp.test(end_1)) {
                    throw new Error("['" + start_1 + "', '" + end_1 + "'] contains unusable interpolation symbol.");
                }
            });
        }
    }
    exports.assertInterpolationSymbols = assertInterpolationSymbols;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9hc3NlcnRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgsOEJBQXFDLFVBQWtCLEVBQUUsS0FBVTtRQUNqRSxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsQixNQUFNLENBQUM7UUFDVCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLGVBQWEsVUFBVSxpQ0FBOEIsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFDRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3pDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBYSxVQUFVLGlDQUE4QixDQUFDLENBQUM7WUFDekUsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBWkQsb0RBWUM7SUFFRCxJQUFNLCtCQUErQixHQUFHO1FBQ3RDLE9BQU87UUFDUCxNQUFNO1FBQ04sUUFBUTtRQUNSLGFBQWE7UUFDYixPQUFPO0tBQ1IsQ0FBQztJQUVGLG9DQUEyQyxVQUFrQixFQUFFLEtBQVU7UUFDdkUsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRSxNQUFNLElBQUksS0FBSyxDQUFDLGVBQWEsVUFBVSxvQ0FBaUMsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBTSxPQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBVyxDQUFDO1lBQ2pDLElBQU0sS0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQVcsQ0FBQztZQUMvQixzQkFBc0I7WUFDdEIsK0JBQStCLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTTtnQkFDNUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFLLE9BQUssWUFBTyxLQUFHLCtDQUE0QyxDQUFDLENBQUM7Z0JBQ3BGLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBYkQsZ0VBYUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRBcnJheU9mU3RyaW5ncyhpZGVudGlmaWVyOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgJyR7aWRlbnRpZmllcn0nIHRvIGJlIGFuIGFycmF5IG9mIHN0cmluZ3MuYCk7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWVbaV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkICcke2lkZW50aWZpZXJ9JyB0byBiZSBhbiBhcnJheSBvZiBzdHJpbmdzLmApO1xuICAgIH1cbiAgfVxufVxuXG5jb25zdCBJTlRFUlBPTEFUSU9OX0JMQUNLTElTVF9SRUdFWFBTID0gW1xuICAvXlxccyokLywgICAgICAgIC8vIGVtcHR5XG4gIC9bPD5dLywgICAgICAgICAvLyBodG1sIHRhZ1xuICAvXlt7fV0kLywgICAgICAgLy8gaTE4biBleHBhbnNpb25cbiAgLyYoI3xbYS16XSkvaSwgIC8vIGNoYXJhY3RlciByZWZlcmVuY2UsXG4gIC9eXFwvXFwvLywgICAgICAgIC8vIGNvbW1lbnRcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRJbnRlcnBvbGF0aW9uU3ltYm9scyhpZGVudGlmaWVyOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgaWYgKHZhbHVlICE9IG51bGwgJiYgIShBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT0gMikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkICcke2lkZW50aWZpZXJ9JyB0byBiZSBhbiBhcnJheSwgW3N0YXJ0LCBlbmRdLmApO1xuICB9IGVsc2UgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICBjb25zdCBzdGFydCA9IHZhbHVlWzBdIGFzIHN0cmluZztcbiAgICBjb25zdCBlbmQgPSB2YWx1ZVsxXSBhcyBzdHJpbmc7XG4gICAgLy8gYmxhY2sgbGlzdCBjaGVja2luZ1xuICAgIElOVEVSUE9MQVRJT05fQkxBQ0tMSVNUX1JFR0VYUFMuZm9yRWFjaChyZWdleHAgPT4ge1xuICAgICAgaWYgKHJlZ2V4cC50ZXN0KHN0YXJ0KSB8fCByZWdleHAudGVzdChlbmQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWycke3N0YXJ0fScsICcke2VuZH0nXSBjb250YWlucyB1bnVzYWJsZSBpbnRlcnBvbGF0aW9uIHN5bWJvbC5gKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19