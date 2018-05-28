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
/**
 * Defines a matcher for requests based on URL, method, or both.
 *
 *
 * @record
 */
export function RequestMatch() { }
function RequestMatch_tsickle_Closure_declarations() {
    /** @type {?|undefined} */
    RequestMatch.prototype.method;
    /** @type {?|undefined} */
    RequestMatch.prototype.url;
}
/**
 * Controller to be injected into tests, that allows for mocking and flushing
 * of requests.
 *
 *
 * @abstract
 */
export class HttpTestingController {
}
function HttpTestingController_tsickle_Closure_declarations() {
    /**
     * Search for requests that match the given parameter, without any expectations.
     * @abstract
     * @param {?} match
     * @return {?}
     */
    HttpTestingController.prototype.match = function (match) { };
    /**
     * Expect that a single request has been made which matches the given URL, and return its
     * mock.
     *
     * If no such request has been made, or more than one such request has been made, fail with an
     * error message including the given request description, if any.
     * @abstract
     * @param {?} url
     * @param {?=} description
     * @return {?}
     */
    HttpTestingController.prototype.expectOne = function (url, description) { };
    /**
     * Expect that a single request has been made which matches the given parameters, and return
     * its mock.
     *
     * If no such request has been made, or more than one such request has been made, fail with an
     * error message including the given request description, if any.
     * @abstract
     * @param {?} params
     * @param {?=} description
     * @return {?}
     */
    HttpTestingController.prototype.expectOne = function (params, description) { };
    /**
     * Expect that a single request has been made which matches the given predicate function, and
     * return its mock.
     *
     * If no such request has been made, or more than one such request has been made, fail with an
     * error message including the given request description, if any.
     * @abstract
     * @param {?} matchFn
     * @param {?=} description
     * @return {?}
     */
    HttpTestingController.prototype.expectOne = function (matchFn, description) { };
    /**
     * Expect that a single request has been made which matches the given condition, and return
     * its mock.
     *
     * If no such request has been made, or more than one such request has been made, fail with an
     * error message including the given request description, if any.
     * @abstract
     * @param {?} match
     * @param {?=} description
     * @return {?}
     */
    HttpTestingController.prototype.expectOne = function (match, description) { };
    /**
     * Expect that no requests have been made which match the given URL.
     *
     * If a matching request has been made, fail with an error message including the given request
     * description, if any.
     * @abstract
     * @param {?} url
     * @param {?=} description
     * @return {?}
     */
    HttpTestingController.prototype.expectNone = function (url, description) { };
    /**
     * Expect that no requests have been made which match the given parameters.
     *
     * If a matching request has been made, fail with an error message including the given request
     * description, if any.
     * @abstract
     * @param {?} params
     * @param {?=} description
     * @return {?}
     */
    HttpTestingController.prototype.expectNone = function (params, description) { };
    /**
     * Expect that no requests have been made which match the given predicate function.
     *
     * If a matching request has been made, fail with an error message including the given request
     * description, if any.
     * @abstract
     * @param {?} matchFn
     * @param {?=} description
     * @return {?}
     */
    HttpTestingController.prototype.expectNone = function (matchFn, description) { };
    /**
     * Expect that no requests have been made which match the given condition.
     *
     * If a matching request has been made, fail with an error message including the given request
     * description, if any.
     * @abstract
     * @param {?} match
     * @param {?=} description
     * @return {?}
     */
    HttpTestingController.prototype.expectNone = function (match, description) { };
    /**
     * Verify that no unmatched requests are outstanding.
     *
     * If any requests are outstanding, fail with an error message indicating which requests were not
     * handled.
     *
     * If `ignoreCancelled` is not set (the default), `verify()` will also fail if cancelled requests
     * were not explicitly matched.
     * @abstract
     * @param {?=} opts
     * @return {?}
     */
    HttpTestingController.prototype.verify = function (opts) { };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvdGVzdGluZy9zcmMvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0QkEsTUFBTTtDQXdGTCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5pbXBvcnQge1Rlc3RSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuXG4vKipcbiAqIERlZmluZXMgYSBtYXRjaGVyIGZvciByZXF1ZXN0cyBiYXNlZCBvbiBVUkwsIG1ldGhvZCwgb3IgYm90aC5cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVlc3RNYXRjaCB7XG4gIG1ldGhvZD86IHN0cmluZztcbiAgdXJsPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIENvbnRyb2xsZXIgdG8gYmUgaW5qZWN0ZWQgaW50byB0ZXN0cywgdGhhdCBhbGxvd3MgZm9yIG1vY2tpbmcgYW5kIGZsdXNoaW5nXG4gKiBvZiByZXF1ZXN0cy5cbiAqXG4gKlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSHR0cFRlc3RpbmdDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIFNlYXJjaCBmb3IgcmVxdWVzdHMgdGhhdCBtYXRjaCB0aGUgZ2l2ZW4gcGFyYW1ldGVyLCB3aXRob3V0IGFueSBleHBlY3RhdGlvbnMuXG4gICAqL1xuICBhYnN0cmFjdCBtYXRjaChtYXRjaDogc3RyaW5nfFJlcXVlc3RNYXRjaHwoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbikpOiBUZXN0UmVxdWVzdFtdO1xuXG4gIC8qKlxuICAgKiBFeHBlY3QgdGhhdCBhIHNpbmdsZSByZXF1ZXN0IGhhcyBiZWVuIG1hZGUgd2hpY2ggbWF0Y2hlcyB0aGUgZ2l2ZW4gVVJMLCBhbmQgcmV0dXJuIGl0c1xuICAgKiBtb2NrLlxuICAgKlxuICAgKiBJZiBubyBzdWNoIHJlcXVlc3QgaGFzIGJlZW4gbWFkZSwgb3IgbW9yZSB0aGFuIG9uZSBzdWNoIHJlcXVlc3QgaGFzIGJlZW4gbWFkZSwgZmFpbCB3aXRoIGFuXG4gICAqIGVycm9yIG1lc3NhZ2UgaW5jbHVkaW5nIHRoZSBnaXZlbiByZXF1ZXN0IGRlc2NyaXB0aW9uLCBpZiBhbnkuXG4gICAqL1xuICBhYnN0cmFjdCBleHBlY3RPbmUodXJsOiBzdHJpbmcsIGRlc2NyaXB0aW9uPzogc3RyaW5nKTogVGVzdFJlcXVlc3Q7XG5cbiAgLyoqXG4gICAqIEV4cGVjdCB0aGF0IGEgc2luZ2xlIHJlcXVlc3QgaGFzIGJlZW4gbWFkZSB3aGljaCBtYXRjaGVzIHRoZSBnaXZlbiBwYXJhbWV0ZXJzLCBhbmQgcmV0dXJuXG4gICAqIGl0cyBtb2NrLlxuICAgKlxuICAgKiBJZiBubyBzdWNoIHJlcXVlc3QgaGFzIGJlZW4gbWFkZSwgb3IgbW9yZSB0aGFuIG9uZSBzdWNoIHJlcXVlc3QgaGFzIGJlZW4gbWFkZSwgZmFpbCB3aXRoIGFuXG4gICAqIGVycm9yIG1lc3NhZ2UgaW5jbHVkaW5nIHRoZSBnaXZlbiByZXF1ZXN0IGRlc2NyaXB0aW9uLCBpZiBhbnkuXG4gICAqL1xuICBhYnN0cmFjdCBleHBlY3RPbmUocGFyYW1zOiBSZXF1ZXN0TWF0Y2gsIGRlc2NyaXB0aW9uPzogc3RyaW5nKTogVGVzdFJlcXVlc3Q7XG5cbiAgLyoqXG4gICAqIEV4cGVjdCB0aGF0IGEgc2luZ2xlIHJlcXVlc3QgaGFzIGJlZW4gbWFkZSB3aGljaCBtYXRjaGVzIHRoZSBnaXZlbiBwcmVkaWNhdGUgZnVuY3Rpb24sIGFuZFxuICAgKiByZXR1cm4gaXRzIG1vY2suXG4gICAqXG4gICAqIElmIG5vIHN1Y2ggcmVxdWVzdCBoYXMgYmVlbiBtYWRlLCBvciBtb3JlIHRoYW4gb25lIHN1Y2ggcmVxdWVzdCBoYXMgYmVlbiBtYWRlLCBmYWlsIHdpdGggYW5cbiAgICogZXJyb3IgbWVzc2FnZSBpbmNsdWRpbmcgdGhlIGdpdmVuIHJlcXVlc3QgZGVzY3JpcHRpb24sIGlmIGFueS5cbiAgICovXG4gIGFic3RyYWN0IGV4cGVjdE9uZShtYXRjaEZuOiAoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbiksIGRlc2NyaXB0aW9uPzogc3RyaW5nKTpcbiAgICAgIFRlc3RSZXF1ZXN0O1xuXG4gIC8qKlxuICAgKiBFeHBlY3QgdGhhdCBhIHNpbmdsZSByZXF1ZXN0IGhhcyBiZWVuIG1hZGUgd2hpY2ggbWF0Y2hlcyB0aGUgZ2l2ZW4gY29uZGl0aW9uLCBhbmQgcmV0dXJuXG4gICAqIGl0cyBtb2NrLlxuICAgKlxuICAgKiBJZiBubyBzdWNoIHJlcXVlc3QgaGFzIGJlZW4gbWFkZSwgb3IgbW9yZSB0aGFuIG9uZSBzdWNoIHJlcXVlc3QgaGFzIGJlZW4gbWFkZSwgZmFpbCB3aXRoIGFuXG4gICAqIGVycm9yIG1lc3NhZ2UgaW5jbHVkaW5nIHRoZSBnaXZlbiByZXF1ZXN0IGRlc2NyaXB0aW9uLCBpZiBhbnkuXG4gICAqL1xuICBhYnN0cmFjdCBleHBlY3RPbmUoXG4gICAgICBtYXRjaDogc3RyaW5nfFJlcXVlc3RNYXRjaHwoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbiksXG4gICAgICBkZXNjcmlwdGlvbj86IHN0cmluZyk6IFRlc3RSZXF1ZXN0O1xuXG4gIC8qKlxuICAgKiBFeHBlY3QgdGhhdCBubyByZXF1ZXN0cyBoYXZlIGJlZW4gbWFkZSB3aGljaCBtYXRjaCB0aGUgZ2l2ZW4gVVJMLlxuICAgKlxuICAgKiBJZiBhIG1hdGNoaW5nIHJlcXVlc3QgaGFzIGJlZW4gbWFkZSwgZmFpbCB3aXRoIGFuIGVycm9yIG1lc3NhZ2UgaW5jbHVkaW5nIHRoZSBnaXZlbiByZXF1ZXN0XG4gICAqIGRlc2NyaXB0aW9uLCBpZiBhbnkuXG4gICAqL1xuICBhYnN0cmFjdCBleHBlY3ROb25lKHVybDogc3RyaW5nLCBkZXNjcmlwdGlvbj86IHN0cmluZyk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEV4cGVjdCB0aGF0IG5vIHJlcXVlc3RzIGhhdmUgYmVlbiBtYWRlIHdoaWNoIG1hdGNoIHRoZSBnaXZlbiBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBJZiBhIG1hdGNoaW5nIHJlcXVlc3QgaGFzIGJlZW4gbWFkZSwgZmFpbCB3aXRoIGFuIGVycm9yIG1lc3NhZ2UgaW5jbHVkaW5nIHRoZSBnaXZlbiByZXF1ZXN0XG4gICAqIGRlc2NyaXB0aW9uLCBpZiBhbnkuXG4gICAqL1xuICBhYnN0cmFjdCBleHBlY3ROb25lKHBhcmFtczogUmVxdWVzdE1hdGNoLCBkZXNjcmlwdGlvbj86IHN0cmluZyk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEV4cGVjdCB0aGF0IG5vIHJlcXVlc3RzIGhhdmUgYmVlbiBtYWRlIHdoaWNoIG1hdGNoIHRoZSBnaXZlbiBwcmVkaWNhdGUgZnVuY3Rpb24uXG4gICAqXG4gICAqIElmIGEgbWF0Y2hpbmcgcmVxdWVzdCBoYXMgYmVlbiBtYWRlLCBmYWlsIHdpdGggYW4gZXJyb3IgbWVzc2FnZSBpbmNsdWRpbmcgdGhlIGdpdmVuIHJlcXVlc3RcbiAgICogZGVzY3JpcHRpb24sIGlmIGFueS5cbiAgICovXG4gIGFic3RyYWN0IGV4cGVjdE5vbmUobWF0Y2hGbjogKChyZXE6IEh0dHBSZXF1ZXN0PGFueT4pID0+IGJvb2xlYW4pLCBkZXNjcmlwdGlvbj86IHN0cmluZyk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEV4cGVjdCB0aGF0IG5vIHJlcXVlc3RzIGhhdmUgYmVlbiBtYWRlIHdoaWNoIG1hdGNoIHRoZSBnaXZlbiBjb25kaXRpb24uXG4gICAqXG4gICAqIElmIGEgbWF0Y2hpbmcgcmVxdWVzdCBoYXMgYmVlbiBtYWRlLCBmYWlsIHdpdGggYW4gZXJyb3IgbWVzc2FnZSBpbmNsdWRpbmcgdGhlIGdpdmVuIHJlcXVlc3RcbiAgICogZGVzY3JpcHRpb24sIGlmIGFueS5cbiAgICovXG4gIGFic3RyYWN0IGV4cGVjdE5vbmUoXG4gICAgICBtYXRjaDogc3RyaW5nfFJlcXVlc3RNYXRjaHwoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbiksIGRlc2NyaXB0aW9uPzogc3RyaW5nKTogdm9pZDtcblxuICAvKipcbiAgICogVmVyaWZ5IHRoYXQgbm8gdW5tYXRjaGVkIHJlcXVlc3RzIGFyZSBvdXRzdGFuZGluZy5cbiAgICpcbiAgICogSWYgYW55IHJlcXVlc3RzIGFyZSBvdXRzdGFuZGluZywgZmFpbCB3aXRoIGFuIGVycm9yIG1lc3NhZ2UgaW5kaWNhdGluZyB3aGljaCByZXF1ZXN0cyB3ZXJlIG5vdFxuICAgKiBoYW5kbGVkLlxuICAgKlxuICAgKiBJZiBgaWdub3JlQ2FuY2VsbGVkYCBpcyBub3Qgc2V0ICh0aGUgZGVmYXVsdCksIGB2ZXJpZnkoKWAgd2lsbCBhbHNvIGZhaWwgaWYgY2FuY2VsbGVkIHJlcXVlc3RzXG4gICAqIHdlcmUgbm90IGV4cGxpY2l0bHkgbWF0Y2hlZC5cbiAgICovXG4gIGFic3RyYWN0IHZlcmlmeShvcHRzPzoge2lnbm9yZUNhbmNlbGxlZD86IGJvb2xlYW59KTogdm9pZDtcbn1cbiJdfQ==