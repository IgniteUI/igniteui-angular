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
 * Abstract class from which real backends are derived.
 *
 * The primary purpose of a `ConnectionBackend` is to create new connections to fulfill a given
 * {\@link Request}.
 *
 * @deprecated use \@angular/common/http instead
 * @abstract
 */
export class ConnectionBackend {
}
function ConnectionBackend_tsickle_Closure_declarations() {
    /**
     * @abstract
     * @param {?} request
     * @return {?}
     */
    ConnectionBackend.prototype.createConnection = function (request) { };
}
/**
 * Abstract class from which real connections are derived.
 *
 * @deprecated use \@angular/common/http instead
 * @abstract
 */
export class Connection {
}
function Connection_tsickle_Closure_declarations() {
    /** @type {?} */
    Connection.prototype.readyState;
    /** @type {?} */
    Connection.prototype.request;
    /** @type {?} */
    Connection.prototype.response;
}
/**
 * An XSRFStrategy configures XSRF protection (e.g. via headers) on an HTTP request.
 *
 * @deprecated use \@angular/common/http instead
 * @abstract
 */
export class XSRFStrategy {
}
function XSRFStrategy_tsickle_Closure_declarations() {
    /**
     * @abstract
     * @param {?} req
     * @return {?}
     */
    XSRFStrategy.prototype.configureRequest = function (req) { };
}
/**
 * Interface for options to construct a RequestOptions, based on
 * [RequestInit](https://fetch.spec.whatwg.org/#requestinit) from the Fetch spec.
 *
 * @deprecated use \@angular/common/http instead
 * @record
 */
export function RequestOptionsArgs() { }
function RequestOptionsArgs_tsickle_Closure_declarations() {
    /** @type {?|undefined} */
    RequestOptionsArgs.prototype.url;
    /** @type {?|undefined} */
    RequestOptionsArgs.prototype.method;
    /**
     * @deprecated from 4.0.0. Use params instead.
     * @type {?|undefined}
     */
    RequestOptionsArgs.prototype.search;
    /** @type {?|undefined} */
    RequestOptionsArgs.prototype.params;
    /** @type {?|undefined} */
    RequestOptionsArgs.prototype.headers;
    /** @type {?|undefined} */
    RequestOptionsArgs.prototype.body;
    /** @type {?|undefined} */
    RequestOptionsArgs.prototype.withCredentials;
    /** @type {?|undefined} */
    RequestOptionsArgs.prototype.responseType;
}
/**
 * Required structure when constructing new Request();
 * @record
 */
export function RequestArgs() { }
function RequestArgs_tsickle_Closure_declarations() {
    /** @type {?} */
    RequestArgs.prototype.url;
}
/**
 * Interface for options to construct a Response, based on
 * [ResponseInit](https://fetch.spec.whatwg.org/#responseinit) from the Fetch spec.
 *
 * @deprecated use \@angular/common/http instead
 * @record
 */
export function ResponseOptionsArgs() { }
function ResponseOptionsArgs_tsickle_Closure_declarations() {
    /** @type {?|undefined} */
    ResponseOptionsArgs.prototype.body;
    /** @type {?|undefined} */
    ResponseOptionsArgs.prototype.status;
    /** @type {?|undefined} */
    ResponseOptionsArgs.prototype.statusText;
    /** @type {?|undefined} */
    ResponseOptionsArgs.prototype.headers;
    /** @type {?|undefined} */
    ResponseOptionsArgs.prototype.type;
    /** @type {?|undefined} */
    ResponseOptionsArgs.prototype.url;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJmYWNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2h0dHAvc3JjL2ludGVyZmFjZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxQkEsTUFBTTtDQUEwRjs7Ozs7Ozs7Ozs7Ozs7O0FBT2hHLE1BQU07Q0FJTDs7Ozs7Ozs7Ozs7Ozs7O0FBT0QsTUFBTTtDQUErRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtSZWFkeVN0YXRlLCBSZXF1ZXN0TWV0aG9kLCBSZXNwb25zZUNvbnRlbnRUeXBlLCBSZXNwb25zZVR5cGV9IGZyb20gJy4vZW51bXMnO1xuaW1wb3J0IHtIZWFkZXJzfSBmcm9tICcuL2hlYWRlcnMnO1xuaW1wb3J0IHtSZXF1ZXN0fSBmcm9tICcuL3N0YXRpY19yZXF1ZXN0JztcbmltcG9ydCB7VVJMU2VhcmNoUGFyYW1zfSBmcm9tICcuL3VybF9zZWFyY2hfcGFyYW1zJztcblxuLyoqXG4gKiBBYnN0cmFjdCBjbGFzcyBmcm9tIHdoaWNoIHJlYWwgYmFja2VuZHMgYXJlIGRlcml2ZWQuXG4gKlxuICogVGhlIHByaW1hcnkgcHVycG9zZSBvZiBhIGBDb25uZWN0aW9uQmFja2VuZGAgaXMgdG8gY3JlYXRlIG5ldyBjb25uZWN0aW9ucyB0byBmdWxmaWxsIGEgZ2l2ZW5cbiAqIHtAbGluayBSZXF1ZXN0fS5cbiAqXG4gKiBAZGVwcmVjYXRlZCB1c2UgQGFuZ3VsYXIvY29tbW9uL2h0dHAgaW5zdGVhZFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29ubmVjdGlvbkJhY2tlbmQgeyBhYnN0cmFjdCBjcmVhdGVDb25uZWN0aW9uKHJlcXVlc3Q6IGFueSk6IENvbm5lY3Rpb247IH1cblxuLyoqXG4gKiBBYnN0cmFjdCBjbGFzcyBmcm9tIHdoaWNoIHJlYWwgY29ubmVjdGlvbnMgYXJlIGRlcml2ZWQuXG4gKlxuICogQGRlcHJlY2F0ZWQgdXNlIEBhbmd1bGFyL2NvbW1vbi9odHRwIGluc3RlYWRcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbm5lY3Rpb24ge1xuICByZWFkeVN0YXRlOiBSZWFkeVN0YXRlO1xuICByZXF1ZXN0OiBSZXF1ZXN0O1xuICByZXNwb25zZTogYW55OyAgLy8gVE9ETzogZ2VuZXJpYyBvZiA8UmVzcG9uc2U+O1xufVxuXG4vKipcbiAqIEFuIFhTUkZTdHJhdGVneSBjb25maWd1cmVzIFhTUkYgcHJvdGVjdGlvbiAoZS5nLiB2aWEgaGVhZGVycykgb24gYW4gSFRUUCByZXF1ZXN0LlxuICpcbiAqIEBkZXByZWNhdGVkIHVzZSBAYW5ndWxhci9jb21tb24vaHR0cCBpbnN0ZWFkXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBYU1JGU3RyYXRlZ3kgeyBhYnN0cmFjdCBjb25maWd1cmVSZXF1ZXN0KHJlcTogUmVxdWVzdCk6IHZvaWQ7IH1cblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIG9wdGlvbnMgdG8gY29uc3RydWN0IGEgUmVxdWVzdE9wdGlvbnMsIGJhc2VkIG9uXG4gKiBbUmVxdWVzdEluaXRdKGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNyZXF1ZXN0aW5pdCkgZnJvbSB0aGUgRmV0Y2ggc3BlYy5cbiAqXG4gKiBAZGVwcmVjYXRlZCB1c2UgQGFuZ3VsYXIvY29tbW9uL2h0dHAgaW5zdGVhZFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVlc3RPcHRpb25zQXJncyB7XG4gIHVybD86IHN0cmluZ3xudWxsO1xuICBtZXRob2Q/OiBzdHJpbmd8UmVxdWVzdE1ldGhvZHxudWxsO1xuICAvKiogQGRlcHJlY2F0ZWQgZnJvbSA0LjAuMC4gVXNlIHBhcmFtcyBpbnN0ZWFkLiAqL1xuICBzZWFyY2g/OiBzdHJpbmd8VVJMU2VhcmNoUGFyYW1zfHtba2V5OiBzdHJpbmddOiBhbnkgfCBhbnlbXX18bnVsbDtcbiAgcGFyYW1zPzogc3RyaW5nfFVSTFNlYXJjaFBhcmFtc3x7W2tleTogc3RyaW5nXTogYW55IHwgYW55W119fG51bGw7XG4gIGhlYWRlcnM/OiBIZWFkZXJzfG51bGw7XG4gIGJvZHk/OiBhbnk7XG4gIHdpdGhDcmVkZW50aWFscz86IGJvb2xlYW58bnVsbDtcbiAgcmVzcG9uc2VUeXBlPzogUmVzcG9uc2VDb250ZW50VHlwZXxudWxsO1xufVxuXG4vKipcbiAqIFJlcXVpcmVkIHN0cnVjdHVyZSB3aGVuIGNvbnN0cnVjdGluZyBuZXcgUmVxdWVzdCgpO1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVlc3RBcmdzIGV4dGVuZHMgUmVxdWVzdE9wdGlvbnNBcmdzIHsgdXJsOiBzdHJpbmd8bnVsbDsgfVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3Igb3B0aW9ucyB0byBjb25zdHJ1Y3QgYSBSZXNwb25zZSwgYmFzZWQgb25cbiAqIFtSZXNwb25zZUluaXRdKGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNyZXNwb25zZWluaXQpIGZyb20gdGhlIEZldGNoIHNwZWMuXG4gKlxuICogQGRlcHJlY2F0ZWQgdXNlIEBhbmd1bGFyL2NvbW1vbi9odHRwIGluc3RlYWRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXNwb25zZU9wdGlvbnNBcmdzIHtcbiAgYm9keT86IHN0cmluZ3xPYmplY3R8Rm9ybURhdGF8QXJyYXlCdWZmZXJ8QmxvYnxudWxsO1xuICBzdGF0dXM/OiBudW1iZXJ8bnVsbDtcbiAgc3RhdHVzVGV4dD86IHN0cmluZ3xudWxsO1xuICBoZWFkZXJzPzogSGVhZGVyc3xudWxsO1xuICB0eXBlPzogUmVzcG9uc2VUeXBlfG51bGw7XG4gIHVybD86IHN0cmluZ3xudWxsO1xufVxuIl19