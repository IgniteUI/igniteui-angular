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
 * Transforms an `HttpRequest` into a stream of `HttpEvent`s, one of which will likely be a
 * `HttpResponse`.
 *
 * `HttpHandler` is injectable. When injected, the handler instance dispatches requests to the
 * first interceptor in the chain, which dispatches to the second, etc, eventually reaching the
 * `HttpBackend`.
 *
 * In an `HttpInterceptor`, the `HttpHandler` parameter is the next interceptor in the chain.
 *
 *
 * @abstract
 */
export class HttpHandler {
}
function HttpHandler_tsickle_Closure_declarations() {
    /**
     * @abstract
     * @param {?} req
     * @return {?}
     */
    HttpHandler.prototype.handle = function (req) { };
}
/**
 * A final `HttpHandler` which will dispatch the request via browser HTTP APIs to a backend.
 *
 * Interceptors sit between the `HttpClient` interface and the `HttpBackend`.
 *
 * When injected, `HttpBackend` dispatches requests directly to the backend, without going
 * through the interceptor chain.
 *
 *
 * @abstract
 */
export class HttpBackend {
}
function HttpBackend_tsickle_Closure_declarations() {
    /**
     * @abstract
     * @param {?} req
     * @return {?}
     */
    HttpBackend.prototype.handle = function (req) { };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3NyYy9iYWNrZW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdCQSxNQUFNO0NBRUw7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBWUQsTUFBTTtDQUVMIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cEV2ZW50fSBmcm9tICcuL3Jlc3BvbnNlJztcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGFuIGBIdHRwUmVxdWVzdGAgaW50byBhIHN0cmVhbSBvZiBgSHR0cEV2ZW50YHMsIG9uZSBvZiB3aGljaCB3aWxsIGxpa2VseSBiZSBhXG4gKiBgSHR0cFJlc3BvbnNlYC5cbiAqXG4gKiBgSHR0cEhhbmRsZXJgIGlzIGluamVjdGFibGUuIFdoZW4gaW5qZWN0ZWQsIHRoZSBoYW5kbGVyIGluc3RhbmNlIGRpc3BhdGNoZXMgcmVxdWVzdHMgdG8gdGhlXG4gKiBmaXJzdCBpbnRlcmNlcHRvciBpbiB0aGUgY2hhaW4sIHdoaWNoIGRpc3BhdGNoZXMgdG8gdGhlIHNlY29uZCwgZXRjLCBldmVudHVhbGx5IHJlYWNoaW5nIHRoZVxuICogYEh0dHBCYWNrZW5kYC5cbiAqXG4gKiBJbiBhbiBgSHR0cEludGVyY2VwdG9yYCwgdGhlIGBIdHRwSGFuZGxlcmAgcGFyYW1ldGVyIGlzIHRoZSBuZXh0IGludGVyY2VwdG9yIGluIHRoZSBjaGFpbi5cbiAqXG4gKlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSHR0cEhhbmRsZXIge1xuICBhYnN0cmFjdCBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj47XG59XG5cbi8qKlxuICogQSBmaW5hbCBgSHR0cEhhbmRsZXJgIHdoaWNoIHdpbGwgZGlzcGF0Y2ggdGhlIHJlcXVlc3QgdmlhIGJyb3dzZXIgSFRUUCBBUElzIHRvIGEgYmFja2VuZC5cbiAqXG4gKiBJbnRlcmNlcHRvcnMgc2l0IGJldHdlZW4gdGhlIGBIdHRwQ2xpZW50YCBpbnRlcmZhY2UgYW5kIHRoZSBgSHR0cEJhY2tlbmRgLlxuICpcbiAqIFdoZW4gaW5qZWN0ZWQsIGBIdHRwQmFja2VuZGAgZGlzcGF0Y2hlcyByZXF1ZXN0cyBkaXJlY3RseSB0byB0aGUgYmFja2VuZCwgd2l0aG91dCBnb2luZ1xuICogdGhyb3VnaCB0aGUgaW50ZXJjZXB0b3IgY2hhaW4uXG4gKlxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEh0dHBCYWNrZW5kIGltcGxlbWVudHMgSHR0cEhhbmRsZXIge1xuICBhYnN0cmFjdCBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj47XG59XG4iXX0=