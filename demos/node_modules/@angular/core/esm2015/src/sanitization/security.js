/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** @enum {number} */
const SecurityContext = {
    NONE: 0,
    HTML: 1,
    STYLE: 2,
    SCRIPT: 3,
    URL: 4,
    RESOURCE_URL: 5,
};
export { SecurityContext };
SecurityContext[SecurityContext.NONE] = "NONE";
SecurityContext[SecurityContext.HTML] = "HTML";
SecurityContext[SecurityContext.STYLE] = "STYLE";
SecurityContext[SecurityContext.SCRIPT] = "SCRIPT";
SecurityContext[SecurityContext.URL] = "URL";
SecurityContext[SecurityContext.RESOURCE_URL] = "RESOURCE_URL";
/**
 * Sanitizer is used by the views to sanitize potentially dangerous values.
 *
 *
 * @abstract
 */
export class Sanitizer {
}
function Sanitizer_tsickle_Closure_declarations() {
    /**
     * @abstract
     * @param {?} context
     * @param {?} value
     * @return {?}
     */
    Sanitizer.prototype.sanitize = function (context, value) { };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9zYW5pdGl6YXRpb24vc2VjdXJpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBK0JBLE1BQU07Q0FFTCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBBIFNlY3VyaXR5Q29udGV4dCBtYXJrcyBhIGxvY2F0aW9uIHRoYXQgaGFzIGRhbmdlcm91cyBzZWN1cml0eSBpbXBsaWNhdGlvbnMsIGUuZy4gYSBET00gcHJvcGVydHlcbiAqIGxpa2UgYGlubmVySFRNTGAgdGhhdCBjb3VsZCBjYXVzZSBDcm9zcyBTaXRlIFNjcmlwdGluZyAoWFNTKSBzZWN1cml0eSBidWdzIHdoZW4gaW1wcm9wZXJseVxuICogaGFuZGxlZC5cbiAqXG4gKiBTZWUgRG9tU2FuaXRpemVyIGZvciBtb3JlIGRldGFpbHMgb24gc2VjdXJpdHkgaW4gQW5ndWxhciBhcHBsaWNhdGlvbnMuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGVudW0gU2VjdXJpdHlDb250ZXh0IHtcbiAgTk9ORSA9IDAsXG4gIEhUTUwgPSAxLFxuICBTVFlMRSA9IDIsXG4gIFNDUklQVCA9IDMsXG4gIFVSTCA9IDQsXG4gIFJFU09VUkNFX1VSTCA9IDUsXG59XG5cbi8qKlxuICogU2FuaXRpemVyIGlzIHVzZWQgYnkgdGhlIHZpZXdzIHRvIHNhbml0aXplIHBvdGVudGlhbGx5IGRhbmdlcm91cyB2YWx1ZXMuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNhbml0aXplciB7XG4gIGFic3RyYWN0IHNhbml0aXplKGNvbnRleHQ6IFNlY3VyaXR5Q29udGV4dCwgdmFsdWU6IHt9fHN0cmluZ3xudWxsKTogc3RyaW5nfG51bGw7XG59XG4iXX0=