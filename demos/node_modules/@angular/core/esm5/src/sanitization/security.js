/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A SecurityContext marks a location that has dangerous security implications, e.g. a DOM property
 * like `innerHTML` that could cause Cross Site Scripting (XSS) security bugs when improperly
 * handled.
 *
 * See DomSanitizer for more details on security in Angular applications.
 *
 *
 */
/**
 * A SecurityContext marks a location that has dangerous security implications, e.g. a DOM property
 * like `innerHTML` that could cause Cross Site Scripting (XSS) security bugs when improperly
 * handled.
 *
 * See DomSanitizer for more details on security in Angular applications.
 *
 *
 */
export var SecurityContext;
/**
 * A SecurityContext marks a location that has dangerous security implications, e.g. a DOM property
 * like `innerHTML` that could cause Cross Site Scripting (XSS) security bugs when improperly
 * handled.
 *
 * See DomSanitizer for more details on security in Angular applications.
 *
 *
 */
(function (SecurityContext) {
    SecurityContext[SecurityContext["NONE"] = 0] = "NONE";
    SecurityContext[SecurityContext["HTML"] = 1] = "HTML";
    SecurityContext[SecurityContext["STYLE"] = 2] = "STYLE";
    SecurityContext[SecurityContext["SCRIPT"] = 3] = "SCRIPT";
    SecurityContext[SecurityContext["URL"] = 4] = "URL";
    SecurityContext[SecurityContext["RESOURCE_URL"] = 5] = "RESOURCE_URL";
})(SecurityContext || (SecurityContext = {}));
/**
 * Sanitizer is used by the views to sanitize potentially dangerous values.
 *
 *
 */
var /**
 * Sanitizer is used by the views to sanitize potentially dangerous values.
 *
 *
 */
Sanitizer = /** @class */ (function () {
    function Sanitizer() {
    }
    return Sanitizer;
}());
/**
 * Sanitizer is used by the views to sanitize potentially dangerous values.
 *
 *
 */
export { Sanitizer };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9zYW5pdGl6YXRpb24vc2VjdXJpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7R0FNRztBQUVIOzs7Ozs7OztHQVFHOzs7Ozs7Ozs7O0FBQ0gsTUFBTSxDQUFOLElBQVksZUFPWDs7Ozs7Ozs7OztBQVBELFdBQVksZUFBZTtJQUN6QixxREFBUSxDQUFBO0lBQ1IscURBQVEsQ0FBQTtJQUNSLHVEQUFTLENBQUE7SUFDVCx5REFBVSxDQUFBO0lBQ1YsbURBQU8sQ0FBQTtJQUNQLHFFQUFnQixDQUFBO0dBTk4sZUFBZSxLQUFmLGVBQWUsUUFPMUI7Ozs7OztBQU9EOzs7OztBQUFBOzs7b0JBL0JBO0lBaUNDLENBQUE7Ozs7OztBQUZELHFCQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEEgU2VjdXJpdHlDb250ZXh0IG1hcmtzIGEgbG9jYXRpb24gdGhhdCBoYXMgZGFuZ2Vyb3VzIHNlY3VyaXR5IGltcGxpY2F0aW9ucywgZS5nLiBhIERPTSBwcm9wZXJ0eVxuICogbGlrZSBgaW5uZXJIVE1MYCB0aGF0IGNvdWxkIGNhdXNlIENyb3NzIFNpdGUgU2NyaXB0aW5nIChYU1MpIHNlY3VyaXR5IGJ1Z3Mgd2hlbiBpbXByb3Blcmx5XG4gKiBoYW5kbGVkLlxuICpcbiAqIFNlZSBEb21TYW5pdGl6ZXIgZm9yIG1vcmUgZGV0YWlscyBvbiBzZWN1cml0eSBpbiBBbmd1bGFyIGFwcGxpY2F0aW9ucy5cbiAqXG4gKlxuICovXG5leHBvcnQgZW51bSBTZWN1cml0eUNvbnRleHQge1xuICBOT05FID0gMCxcbiAgSFRNTCA9IDEsXG4gIFNUWUxFID0gMixcbiAgU0NSSVBUID0gMyxcbiAgVVJMID0gNCxcbiAgUkVTT1VSQ0VfVVJMID0gNSxcbn1cblxuLyoqXG4gKiBTYW5pdGl6ZXIgaXMgdXNlZCBieSB0aGUgdmlld3MgdG8gc2FuaXRpemUgcG90ZW50aWFsbHkgZGFuZ2Vyb3VzIHZhbHVlcy5cbiAqXG4gKlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU2FuaXRpemVyIHtcbiAgYWJzdHJhY3Qgc2FuaXRpemUoY29udGV4dDogU2VjdXJpdHlDb250ZXh0LCB2YWx1ZToge318c3RyaW5nfG51bGwpOiBzdHJpbmd8bnVsbDtcbn1cbiJdfQ==